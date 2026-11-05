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

Lovable mantiene la configuración pública del proyecto en el archivo `.env` versionado. Consérvalo para las vistas previas y la publicación. Las variables `VITE_*` se incluyen en el cliente; las credenciales privadas se gestionan en **Secrets** del proyecto. Para desarrollo local, usa `.env.local`, ignorado por Git.

```dotenv
# Configuración pública (.env)
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="TU-CLAVE-PUBLICABLE"

# Servidor: endpoint y clave publicable
SUPABASE_URL="https://TU-PROYECTO.supabase.co"
SUPABASE_PUBLISHABLE_KEY="TU-CLAVE-PUBLICABLE"

# Push: configuración web publicable
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY=""
VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY=""
```

Lovable administra las credenciales de su backend y los valores reservados `SUPABASE_*` y `LOVABLE_*`. Gestiona las claves de proveedores desde **Secrets** o desde el conector correspondiente. Para un entorno local con `bun run dev`, configura las credenciales necesarias en `.env.local`:

```dotenv
SUPABASE_SERVICE_ROLE_KEY="TU-CLAVE-DE-SERVICIO-PRIVADA"
GOOGLE_PLACES_API_KEY=""
LOVABLE_API_KEY=""
FIREBASE_MESSAGING_API_KEY=""
LOVABLE_CRON_SECRET=""
LOVABLE_CRON_SECRET_PREVIOUS=""
```

Mantén `SUPABASE_SERVICE_ROLE_KEY`, las claves de proveedores y los secretos de cron exclusivamente en el servidor. El acceso del navegador usa la clave publicable y las políticas RLS. Guarda las credenciales fuera de Git.

## Esquema y servicios

Las migraciones `drizzle/migrations/0000` a `0013` definen tablas, políticas y funciones PostgreSQL. Son la referencia del esquema; `drizzle/schema.ts` no contiene su modelado completo. Aplica las migraciones en orden y pruébalas en un entorno aislado antes de producción.

En Lovable, usa el backend vinculado al proyecto para gestionar datos y autenticación. Si preparas un entorno independiente, configura su instancia y aplica las migraciones. Los avisos web requieren además FCM y las tareas programadas.

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

El push a la rama activa sincroniza el código con el editor de Lovable. Para actualizar la web pública, abre **Publish** y publica los cambios desde ese diálogo. La sincronización del repositorio y una GitHub Release son operaciones distintas de la publicación.

Para un despliegue propio, la compilación genera `.output/` con Nitro y un destino Cloudflare predeterminado. Configura las variables y los secretos en el entorno de hosting elegido.

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

Referencias: [Secretos y variables públicas en Lovable](https://docs.lovable.dev/features/secrets) · [Publicación](https://docs.lovable.dev/features/publish).
