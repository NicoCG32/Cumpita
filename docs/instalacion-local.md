# Instalación local

## Requisitos
- Node.js 20+ (recomendado con [nvm](https://github.com/nvm-sh/nvm)) o [Bun](https://bun.sh) 1.1+.
- Git y acceso al repositorio sincronizado con Lovable.

## 1. Clonar e instalar
```sh
git clone <url-del-repositorio> cumpita
cd cumpita
bun install        # o: npm install
```

## 2. Variables de entorno
Crea un archivo `.env` en la raíz (no lo subas con valores privados):

```env
# Backend (Lovable Cloud) — claves públicas, seguras en el cliente
VITE_SUPABASE_URL="https://<ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_PROJECT_ID="<ref>"
SUPABASE_URL="https://<ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Push (Firebase Cloud Messaging) — config web pública
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY="..."
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY="..."

# Solo servidor (opcional en local; sin ellos el push y el cron quedan desactivados)
LOVABLE_API_KEY="..."
FIREBASE_MESSAGING_API_KEY="..."
LOVABLE_CRON_SECRET="..."
```

Notas:
- Las variables `VITE_*` se exponen al navegador; nunca pongas allí claves privadas.
- `process.env.*` solo se lee dentro de server functions/handlers.
- Sin las claves de push, la app funciona igual: solo no envía notificaciones.

## 3. Ejecutar
```sh
bun run dev        # http://localhost:8080
bun run test       # tests (vitest)
bun run lint       # eslint
bun run build      # build de producción
bun run preview    # sirve el build localmente
```

## 4. Probar en el celular (misma red Wi-Fi)
`bun run dev -- --host` y abre `http://<ip-de-tu-pc>:8080`. El GPS del navegador requiere HTTPS fuera de `localhost`; para probar geolocalización real usa la versión publicada o un túnel HTTPS (p. ej. `cloudflared tunnel --url http://localhost:8080`).

## Problemas comunes
| Síntoma | Solución |
| --- | --- |
| "Invalid API key" / sin datos | Revisa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` |
| La primera carga de una zona tarda ~15 s | Normal: Overpass sin caché; luego queda en `places_cache` |
| El service worker no se registra | Correcto en dev: solo se activa en producción |
| Cambios de esquema | Las migraciones en `drizzle/migrations/` se aplican desde Lovable, no automáticamente |
