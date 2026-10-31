# 09 · Instalación y despliegue

## Requisitos

- Bun 1.1+ (o Node.js 20+), Git y acceso al repositorio sincronizado con Lovable.

## Instalación local

```sh
git clone <url-del-repositorio> cumpita
cd cumpita
bun install
```

### Variables de entorno (`.env`, no versionar valores privados)

```env
# Backend — claves públicas
VITE_SUPABASE_URL="https://<ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_PROJECT_ID="<ref>"
SUPABASE_URL="https://<ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Push — config web pública
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY="..."

# Solo servidor (opcional en local; sin ellos push y cron quedan desactivados)
LOVABLE_API_KEY="..."
FIREBASE_MESSAGING_API_KEY="..."
LOVABLE_CRON_SECRET="..."
```

Las `VITE_*` llegan al navegador: nunca pongas allí claves privadas.

### Comandos

```sh
bun run dev        # http://localhost:8080
bun run test       # vitest
bun run lint       # eslint
bun run build      # build de producción
bun run preview    # sirve el build
```

Para probar en el celular: `bun run dev -- --host`. El GPS exige HTTPS fuera de `localhost`; usa la versión publicada o un túnel (`cloudflared tunnel --url http://localhost:8080`).

## Despliegue en producción

1. En Lovable, **Publish**. Los cambios de interfaz requieren **Update**; los de backend (migraciones, server functions, cron) se aplican al instante.
2. URL: https://cumpita.lovable.app. Dominio propio en _Project Settings → Domains_.
3. Autohospedaje opcional: `bun run build` y desplegar `.output/` en Cloudflare Workers con las mismas variables.

> Las vistas previas no registran el service worker: PWA y push se prueban solo en la URL publicada.

## Secretos

| Secreto                                       | Uso                            |
| --------------------------------------------- | ------------------------------ |
| `LOVABLE_API_KEY`                             | Gateway de conectores (push)   |
| `FIREBASE_MESSAGING_API_KEY`                  | Envío FCM                      |
| `LOVABLE_CRON_SECRET` (+ `_PREVIOUS`)         | Autentica `/api/public/cron/*` |
| `VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_*` | Config web pública FCM         |
| `VITE_SUPABASE_*`                             | Cliente del backend (públicas) |

Se gestionan en **Lovable Cloud → Secrets**. Durante una rotación, el cron acepta el secreto actual y el anterior.

## Verificación de la PWA

1. `/manifest.webmanifest` muestra nombre, íconos 192/512 y `display: standalone`.
2. DevTools → _Application → Service Workers_: `/sw.js` activo.
3. Lighthouse sin errores de instalabilidad.
4. _Network → Offline_ + recargar: abre con últimos datos y "Sin conexión".
5. Push: `/firebase-messaging-sw.js` registrado; activar avisos en "Mi cumpita".
6. Cron: `401` sin token; respuesta JSON con token válido.

| Plataforma       | Comprobar                                                                               |
| ---------------- | --------------------------------------------------------------------------------------- |
| Android / Chrome | Banner "Instala cumpita." con **Instalar**; abre a pantalla completa                    |
| iOS / Safari     | Instrucción _Compartir → Agregar a inicio_; push solo instalada (iOS 16.4+)             |
| Ambos            | GPS pide permiso; reporte habilitado a ≤300 m; vista previa de WhatsApp en `/local/:id` |

## Problemas comunes

| Síntoma                        | Solución                                        |
| ------------------------------ | ----------------------------------------------- |
| Sin datos / "Invalid API key"  | Revisar `VITE_SUPABASE_URL` y la clave pública  |
| Primera carga de zona lenta    | Normal sin caché; el refresco horario lo reduce |
| Pantalla en blanco tras deploy | Recargar; si persiste, abrir con `?sw=off`      |
| Cambió `start_url` o `display` | Reinstalar la PWA                               |

## Puesta en marcha y distribución por plataforma

**Disponibilidad:** Piloto web/PWA para consultar comercios cercanos y reportes de apertura. La APK para Android está en planificación; la release actual distribuye el código fuente.

**Destinos:** APK en GitHub Releases + Webpage.

Utiliza el gestor de paquetes y las instrucciones de la guía de instalación de este repositorio.

| Script existente | Definición en package.json                   |
| ---------------- | -------------------------------------------- |
| dev              | `vite dev`                                   |
| build            | `vite build`                                 |
| preview          | `vite preview`                               |
| lint             | `eslint .`                                   |
| test             | `vitest run`                                 |
| test:release     | `node --test scripts/release-notes.test.mjs` |

### Secuencia de puesta en marcha

1. Preparar el runtime/editor y la configuración que indiquen las fuentes enlazadas; usar valores de prueba y restaurar el lockfile apropiado.
2. Ejecutar la modalidad local y sus comprobaciones existentes desde la carpeta indicada por esa guía. No confundir preview web con el runtime nativo o montaje físico.
3. Construir/instalar el artefacto de ese target y comprobar recorrido principal, error relevante y reapertura/actualización antes de declararlo entregado.

Ejecuta los comandos de comprobación antes de distribuir una compilación. Puedes consultar sus resultados remotos en la pestaña Actions del repositorio.

### Datos, servicios y distribución

Migraciones en drizzle/migrations definen las tablas, GRANT y RLS. El esquema TypeScript generado puede estar vacío; no es una prueba de ausencia de base de datos. Favoritos/apodo y preferencias locales se distinguen de reportes y roles remotos. Las políticas presentes en el repo no prueban su aplicación en producción.

La versión web necesita sus servicios de datos y funciones servidor. Para Android se prevé un APK con permisos de ubicación y notificaciones; su distribución se realizará mediante GitHub Releases cuando esté disponible.

GitHub Releases distribuye los archivos de cada versión. Los servicios de servidor se despliegan por separado; consulta la guía de la plataforma para instalar o alojar la aplicación.

### Recuperación

Conservar el artefacto anterior y su procedencia. Retroceder código no revierte automáticamente datos o migraciones. Revisar compatibilidad de guardado/snapshot y restauración antes de instalar una versión antigua. Consulta las notas de la versión para conocer los requisitos y límites de la entrega.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
