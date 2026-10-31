# 01 · Arquitectura general

## Stack

| Capa               | Tecnología                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Framework          | TanStack Start v1 (React 19, SSR, server functions) sobre Vite 7                                  |
| Ejecución servidor | Edge (Cloudflare Workers / workerd)                                                               |
| Estilos            | Tailwind CSS v4, tokens semánticos en `src/styles.css`, componentes shadcn en `src/components/ui` |
| Backend            | Lovable Cloud: PostgreSQL con RLS, Auth (email y Google), Realtime                                |
| Mapas              | Leaflet + OpenStreetMap; OSRM para rutas                                                          |
| Push               | Firebase Cloud Messaging vía gateway de conectores                                                |
| Pruebas            | Vitest (`src/test/`), `node --test` para scripts de release                                       |

## Diagrama lógico

```text
┌──────────────────────────── Cliente (PWA) ────────────────────────────┐
│ src/routes/index.tsx  feed · filtros · mapa · ranking · favoritos     │
│ src/routes/local.$.tsx  ficha compartible   src/routes/revision.tsx   │
│ Service worker (pwa-register.ts) · firebase-messaging-sw.js           │
│ localStorage: favoritos, apodo, límites de reporte                    │
└───────────────┬───────────────────────────────┬───────────────────────┘
                │ server functions (RPC)        │ Realtime (reportes, tags)
┌───────────────▼──────────── Edge (workerd) ───▼───────────────────────┐
│ places.functions.ts  getNearbyPlaces · getPlaceById                   │
│ turnos-live.ts · minsal-data.ts · botillerias.ts                      │
│ push.functions.ts · ops.server.ts (telemetría)                        │
│ api/public/cron/refresh.ts  ·  api/public/cron/turnos.ts              │
└──────┬──────────────────────┬──────────────────────────┬──────────────┘
       │                      │                          │
┌──────▼───────┐   ┌──────────▼───────────┐   ┌──────────▼─────────────┐
│ Lovable Cloud│   │ Fuentes externas     │   │ Firebase Cloud         │
│ PostgreSQL   │   │ Overpass (5 mirrors) │   │ Messaging (push)       │
│ RLS · Auth   │   │ mifarmaciadeturno.cl │   └────────────────────────┘
│ Realtime     │   │ MINSAL / SEREMI      │
└──────────────┘   └──────────────────────┘
```

## Fronteras de ejecución

- **Cliente:** interfaz, GPS, geofencing previo, caché local, suscripciones Realtime. Nunca contiene claves privadas; solo variables `VITE_*`.
- **Edge:** agregación de fuentes, scraping, validación, envío de push y telemetría. Lee `process.env.*` solo dentro de handlers.
- **Base de datos:** fuente de verdad de reportes, tags, roles, sugerencias, caché y eventos. Toda tabla tiene RLS.
- **Rutas públicas** (`src/routes/api/public/*`): solo cron, y cada handler verifica el secreto del llamador.

## Flujo de datos end-to-end

1. El usuario elige zona (wizard o GPS) → `getNearbyPlaces(lat, lng)`.
2. El servidor responde de inmediato con caché (memoria o `places_cache`) y, si está vieja, refresca en segundo plano (**stale-while-revalidate**).
3. En un refresco se combinan OSM + MINSAL + turnos en vivo + locales comunitarios aprobados; se excluyen los ocultos y se ordena por distancia.
4. El cliente se suscribe por Realtime a `place_reports` y `place_tags` para estados en vivo.
5. Cada hora (minuto 15) `/api/public/cron/refresh` precarga zonas y turnos para que el primer usuario no espere.

## Garantías de rendimiento

- Overpass en paralelo con tope total de **12 s**; gana el primer mirror que responde.
- Consultas secundarias (comunitarios, turnos, horarios, ocultos) con tiempo máximo propio: nunca bloquean el feed.
- Si la carga supera **8 s**, la interfaz ofrece **"Actualizar"** (`refetch()`).
- Detalle de resiliencia: [capítulo 06](06-integraciones-externas-y-resiliencia.md).

## Estructura del código

```text
src/
  routes/          __root.tsx, index.tsx, local.$.tsx, revision.tsx, api/public/cron/*
  lib/             places*, categories.ts, turnos*, minsal-data.ts, botillerias.ts,
                   tags.ts, favorites.ts, push*, pwa-register.ts, ops.server.ts
  components/      MapView, Onboarding, InstallBanner, SuggestPlace, ProposeHours, ui/
  test/            reglas de negocio
drizzle/migrations/  historial SQL del esquema (0000–0013)
```

> El módulo `ai-search.*` existe en el código pero **no se usa** en la interfaz: la búsqueda es directa y local por decisión de producto.

## Arquitectura del sistema por niveles

### Nivel 1 — Contexto y fronteras de ejecución

```text
[Persona / GPS o zona manual] -> [PWA: feed y mapa]
                                     |
                     +---------------+----------------+
                     v                                v
             [Server functions]              [Supabase: reportes / roles]
                     |                                |
             [Fuentes OSM / turnos]          [RLS y operaciones controladas]
                     |
                 [Caches] -> [Estado con procedencia y vigencia]
                     +----> [Push / tareas programadas]
```

Feed y mapa reúnen fuentes de lugares/turnos con reportes comunitarios geolocalizados y temporales. Los estados muestran su procedencia y vigencia, y las sugerencias pasan por moderación cuando corresponda.

### Nivel 2 — Componentes y responsabilidades

| Componente          | Responsabilidad                       | Fuente                                                        |
| ------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Categorías          | Una fuente para feed/mapa/sugerencias | [src/lib/categories.ts](../src/lib/categories.ts)             |
| Consulta de lugares | Orquestación, caché y fuentes         | [src/lib/places.functions.ts](../src/lib/places.functions.ts) |
| Telemetría          | Resultados acotados de fuentes/cargas | [src/lib/ops.server.ts](../src/lib/ops.server.ts)             |
| Turnos              | Adaptación de datos disponibles       | [src/lib/turnos-live.ts](../src/lib/turnos-live.ts)           |
| Esquema             | Migraciones SQL y controles           | [drizzle/migrations](../drizzle/migrations)                   |

Las flechas muestran el flujo de información entre componentes. Las transacciones y dependencias de código se detallan en los contratos de cada módulo.

### Nivel 3 — Dominio, contratos y adaptadores

Migraciones en drizzle/migrations definen las tablas, GRANT y RLS. El esquema TypeScript generado puede estar vacío; no es una prueba de ausencia de base de datos. Favoritos/apodo y preferencias locales se distinguen de reportes y roles remotos. Las políticas presentes en el repo no prueban su aplicación en producción.

- Distancias y geofencing usan ubicación con incertidumbre; denegar GPS permite una zona manual.
- Un reporte abierto/cerrado caduca; no convierte el dato comunitario en estado oficial permanente.
- El código documenta 300 m para reporte y una hora de vigencia; consultar constantes para límites efectivos.

Consultar [04-base-de-datos.md](04-base-de-datos.md) para entidades, cardinalidades y representación; [05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) para invariantes. Las piezas marcadas como propuestas pertenecen al diseño del prototipo.

### Nivel 4 — Despliegue y distribución

**Destino:** APK en GitHub Releases + Webpage.

```text
[Revisión de fuente] -> [Verificación de su plataforma] -> [Build / artefacto]
                                                                  |
                                                          [Instalación / hosting]
                                                                  |
                                                          [Usuario y sus datos]
```

La versión web necesita sus servicios de datos y funciones servidor. Para Android se prevé un APK con permisos de ubicación y notificaciones; su distribución se realizará mediante GitHub Releases cuando esté disponible. El capítulo [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md) concreta la puesta en marcha.

### Calidad y límites arquitectónicos

- Baja participación o reportes falsos
- Latencia y cambios de fuentes externas
- GPS impreciso y datos personales
- Avisos o TWA/servicios Android no certificados por pruebas web

El rendimiento y la capacidad dependen del entorno de ejecución. Consulta las guías de instalación y las limitaciones de cada plataforma antes de desplegar.

## Código y documentación relacionada

[README.md](../README.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
