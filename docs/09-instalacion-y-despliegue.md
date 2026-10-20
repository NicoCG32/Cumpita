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
2. URL: https://cumpita.lovable.app. Dominio propio en *Project Settings → Domains*.
3. Autohospedaje opcional: `bun run build` y desplegar `.output/` en Cloudflare Workers con las mismas variables.

> Las vistas previas no registran el service worker: PWA y push se prueban solo en la URL publicada.

## Secretos

| Secreto | Uso |
| --- | --- |
| `LOVABLE_API_KEY` | Gateway de conectores (push) |
| `FIREBASE_MESSAGING_API_KEY` | Envío FCM |
| `LOVABLE_CRON_SECRET` (+ `_PREVIOUS`) | Autentica `/api/public/cron/*` |
| `VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_*` | Config web pública FCM |
| `VITE_SUPABASE_*` | Cliente del backend (públicas) |

Se gestionan en **Lovable Cloud → Secrets**. Durante una rotación, el cron acepta el secreto actual y el anterior.

## Verificación de la PWA
1. `/manifest.webmanifest` muestra nombre, íconos 192/512 y `display: standalone`.
2. DevTools → *Application → Service Workers*: `/sw.js` activo.
3. Lighthouse sin errores de instalabilidad.
4. *Network → Offline* + recargar: abre con últimos datos y "Sin conexión".
5. Push: `/firebase-messaging-sw.js` registrado; activar avisos en "Mi cumpita".
6. Cron: `401` sin token; respuesta JSON con token válido.

| Plataforma | Comprobar |
| --- | --- |
| Android / Chrome | Banner "Instala cumpita." con **Instalar**; abre a pantalla completa |
| iOS / Safari | Instrucción *Compartir → Agregar a inicio*; push solo instalada (iOS 16.4+) |
| Ambos | GPS pide permiso; reporte habilitado a ≤300 m; vista previa de WhatsApp en `/local/:id` |

## Problemas comunes
| Síntoma | Solución |
| --- | --- |
| Sin datos / "Invalid API key" | Revisar `VITE_SUPABASE_URL` y la clave pública |
| Primera carga de zona lenta | Normal sin caché; el refresco horario lo reduce |
| Pantalla en blanco tras deploy | Recargar; si persiste, abrir con `?sw=off` |
| Cambió `start_url` o `display` | Reinstalar la PWA |
