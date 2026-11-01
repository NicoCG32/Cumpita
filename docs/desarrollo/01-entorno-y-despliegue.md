# Ejecutar y desplegar Cumpita

Quien clone Cumpita necesita dos cosas: el código y los servicios de los que depende. La interfaz puede iniciar localmente, pero las consultas de lugares, el backend y las notificaciones no funcionan de manera completa sin la configuración correcta.

## Herramientas

El repositorio utiliza **Bun** y contiene `bun.lock`. Los workflows de CI fijan Bun `1.4.3` y Node `24`; usar ese entorno es el camino más reproducible para contrastar resultados. El paquete ejecuta Vite, TanStack Start y Vitest.

```sh
git clone https://github.com/NicoCG32/cumpita.git
cd cumpita
bun install --frozen-lockfile
bun run dev
```

Abre la URL que imprima Vite. No asumas un puerto predeterminado si el entorno lo cambia.

## Variables de entorno

Las variables siguientes aparecen referenciadas en el código y sirven como guía, **sin valores reales**. Configúralas con los nombres y permisos correspondientes a tu instancia.

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

`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `FIREBASE_MESSAGING_API_KEY`, `GOOGLE_PLACES_API_KEY` y los secretos de cron **no** deben convertirse en variables `VITE_*`. El cliente de Supabase acepta claves públicas y debe apoyarse en RLS. No es conveniente copiar un `.env` de otro equipo como sustituto de la configuración.

**Aviso de seguridad:** el ZIP recibido incluye `.env` y el `.gitignore` original no tiene una regla expresa para excluirlo. No lo incluí en la documentación entregada. Antes de compartir archivos de trabajo, verifica si alguna credencial fue expuesta y rótala si corresponde.

## Esquema y servicios

Las migraciones `drizzle/migrations/0000` a `0013` definen tablas, políticas y funciones PostgreSQL. El archivo `drizzle/schema.ts` aparece vacío en esta entrega. Antes de regenerar migraciones hay que revisar el historial SQL; no corresponde inferir desde ese archivo un esquema completo. Las migraciones deben aplicarse en orden y comprobarse en un entorno aislado antes de tocar producción.

Para un entorno real también se requiere configurar el proyecto Supabase, las políticas, la autenticación, los servicios externos, el envío FCM si se desea y el programador de cron. La existencia de código de integración no suple esas tareas.

## Verificaciones locales

```sh
bun run lint
bunx tsc --noEmit
bun run test
bun run test:release
bun run build
```

La publicación puede probarse con `bun run preview`, pero **una vista previa local no prueba** el comportamiento de permisos, push o GPS en un móvil público. Fuera de `localhost`, la geolocalización del navegador requiere un contexto seguro (HTTPS, con excepciones específicas del navegador).

## Publicación y cron

Lovable puede publicar la aplicación web conectada al proyecto; el repositorio prepara una compilación de servidor orientada por defecto a Cloudflare/Nitro. No afirmo cuál de esos caminos se encuentra configurado en el despliegue público actual sin revisar sus ajustes.

Las rutas `/api/public/cron/refresh` y `/api/public/cron/turnos` aceptan **POST** y verifican un token Bearer. Debes crear la programación real en el proveedor elegido, pasar el secreto exclusivamente desde el programador y comprobar respuesta autorizada y respuesta `401` sin autorización. Si quieres una ejecución a las 20:00 de Chile durante todo el año, usa una programación consciente de la zona horaria; no basta un cron UTC fijo.

**Distribución:** el flujo `.github/workflows/release.yml` genera una release en GitHub a partir de un tag, con código fuente y notas. No compila APK; la web y su backend se despliegan por separado.

## Lista mínima antes de afirmar que está funcionando

1. Consultar una zona y mostrar la procedencia de los datos.
2. Repetir la consulta con una fuente caída y comprobar el indicador de antigüedad.
3. Iniciar sesión, aportar un reporte y verificar su vigencia.
4. Verificar permisos RLS con usuario, anónimo y administrador.
5. Aprobar/rechazar una propuesta y comprobar su efecto.
6. Probar notificaciones reales en un dispositivo admitido, si están activadas.
7. Confirmar el horario de los jobs programados mediante logs del hosting, si se usan.

[Arquitectura](../tecnica/01-arquitectura.md) · [Seguridad](02-operacion-calidad-y-seguridad.md)
