# 01 · Arquitectura general

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR, server functions) sobre Vite 7 |
| Ejecución servidor | Edge (Cloudflare Workers / workerd) |
| Estilos | Tailwind CSS v4, tokens semánticos en `src/styles.css`, componentes shadcn en `src/components/ui` |
| Backend | Lovable Cloud: PostgreSQL con RLS, Auth (email y Google), Realtime |
| Mapas | Leaflet + OpenStreetMap; OSRM para rutas |
| Push | Firebase Cloud Messaging vía gateway de conectores |
| Pruebas | Vitest (`src/test/`), `node --test` para scripts de release |

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
