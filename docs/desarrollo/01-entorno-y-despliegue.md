# Ejecutar y desplegar Cumpita

Cumpita necesita un entorno de servidor y los servicios de datos configurados para consultar lugares, guardar aportes y enviar notificaciones.

## Herramientas

Usa **Bun 1.4.3** y **Node 24**, las versiones fijadas en CI. `bun.lock` mantiene las versiones de las dependencias.

```sh
git clone https://github.com/NicoCG32/cumpita.git
cd cumpita
bun install --frozen-lockfile
bun run dev
```

Abre la URL que imprima Vite.

## Variables de entorno

Copia [`.env.example`](../../.env.example) como `.env` y configura los valores de tu instancia. Las variables `VITE_*` se incluyen en el cliente; las demás se usan en el servidor.

```dotenv
# Navegador: valores publicables
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="TU-CLAVE-PUBLICABLE"

# Servidor: endpoint de Supabase y credenciales de ejecución
SUPABASE_URL="https://TU-PROYECTO.supabase.co"
SUPABASE_PUBLISHABLE_KEY="TU-CLAVE-PUBLICABLE"
SUPABASE_SERVICE_ROLE_KEY="TU-CLAVE-DE-SERVICIO-PRIVADA"

# Fuente opcional de lugares
GOOGLE_PLACES_API_KEY=""

# Push: configuración web publicable
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY=""

# Solo servidor: conector de push y autenticación cron
LOVABLE_API_KEY=""
FIREBASE_MESSAGING_API_KEY=""
LOVABLE_CRON_SECRET=""
LOVABLE_CRON_SECRET_PREVIOUS=""
```

Mantén `SUPABASE_SERVICE_ROLE_KEY`, las claves de proveedores y los secretos de cron exclusivamente en el servidor. El acceso del navegador usa la clave publicable y las políticas RLS. Guarda las credenciales fuera de Git.

## Esquema y servicios

Las migraciones `drizzle/migrations/0000` a `0013` definen tablas, políticas y funciones PostgreSQL. Son la referencia del esquema; `drizzle/schema.ts` no contiene su modelado completo. Aplica las migraciones en orden y pruébalas en un entorno aislado antes de producción.

Configura el proyecto Supabase, sus políticas y la autenticación, además de los proveedores de datos. Si habilitas avisos web, configura también FCM y las tareas programadas.

## Verificaciones locales

```sh
bun run lint
bunx tsc --noEmit
bun run test
bun run test:release
bun run build
```

Usa `bun run preview` para revisar la compilación local. Comprueba permisos, push y GPS también en un dispositivo real con HTTPS; fuera de `localhost`, la geolocalización requiere un contexto seguro.

## Publicación y cron

La web puede publicarse desde Lovable. Para un despliegue propio, la compilación genera `.output/` con Nitro y un destino Cloudflare predeterminado. Configura las variables y los secretos en el entorno de hosting elegido.

Las rutas `/api/public/cron/refresh` y `/api/public/cron/turnos` aceptan **POST** y verifican un token Bearer. Debes crear la programación real en el proveedor elegido, pasar el secreto exclusivamente desde el programador y comprobar respuesta autorizada y respuesta `401` sin autorización. Si quieres una ejecución a las 20:00 de Chile durante todo el año, usa una programación consciente de la zona horaria; no basta un cron UTC fijo.

**Distribución:** el flujo `.github/workflows/release.yml` genera una release en GitHub a partir de un tag, con código fuente y notas. No compila APK; la web y su backend se despliegan por separado.

## Comprobación del despliegue

1. Consultar una zona y mostrar la procedencia de los datos.
2. Repetir la consulta con una fuente caída y comprobar el indicador de antigüedad.
3. Aportar un reporte con y sin sesión, y verificar su vigencia.
4. Verificar permisos RLS con usuario, anónimo y administrador.
5. Aprobar/rechazar una propuesta y comprobar su efecto.
6. Probar notificaciones reales en un dispositivo admitido, si están activadas.
7. Confirmar el horario de los jobs programados mediante logs del hosting, si se usan.

[Arquitectura](../tecnica/01-arquitectura.md) · [Seguridad](02-operacion-calidad-y-seguridad.md)
