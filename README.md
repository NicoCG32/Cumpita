# cumpita. 🦉

PWA móvil comunitaria para encontrar **farmacias, botillerías, librerías y almacenes/minimarkets abiertos ahora** en **Calama** y **La Serena–Coquimbo** (Chile), ordenados por distancia y validados por la comunidad ("cumpitas").

- Publicada: https://cumpita.lovable.app
- Construida con [Lovable](https://lovable.dev) (TanStack Start + React 19 + Tailwind v4 + Lovable Cloud).

## Funcionalidades principales

- Feed de locales cercanos por distancia, con horario oficial y estado en vivo.
- **"Último Cumpita"**: reportes Abierto/Cerrado con caducidad de 1 h, solo a ≤300 m del local (anti-trolling).
- Detección pasiva: 5 min a ≤40 m de un local sin estado ⇒ se reporta abierto.
- Farmacias de turno oficiales (MINSAL + scraping de mifarmaciadeturno.cl, incluida Coquimbo).
- Micro-tags comunitarios (hielo, tarjeta, cartulinas, pan, carbón…), TTL 3 h.
- Mapa (Leaflet/OSM) con rutas y enlaces a Waze/Google/Apple Maps.
- Push: aviso si un local cierra mientras vas en camino y turno diario a las 20:00.
- Favoritos, ranking de puntos, fichas compartibles `/local/:id`, sugerir locales, panel admin `/revision`.
- Instalable como PWA, con modo oscuro nocturno y wizard de bienvenida.

## Desarrollo local

```sh
git clone <url-del-repositorio>
cd <repositorio>
bun install   # o npm i
bun run dev   # http://localhost:8080
bun run test  # vitest
```

Variables de entorno (`.env`, generado por Lovable Cloud): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Los secretos del servidor se gestionan en Lovable Cloud.

## Documentación

| Documento | Contenido |
| --- | --- |
| [docs/instalacion-local.md](docs/instalacion-local.md) | Instalar, configurar `.env` y ejecutar en local |
| [docs/despliegue.md](docs/despliegue.md) | Producción, secretos, cron y verificación de la PWA |
| [docs/releases.md](docs/releases.md) | Versionado y GitHub Releases ([CHANGELOG](CHANGELOG.md)) |
| [docs/arquitectura.md](docs/arquitectura.md) | Stack, estructura de carpetas, rutas y flujo de datos |
| [docs/fuentes-de-datos.md](docs/fuentes-de-datos.md) | OSM/Overpass, MINSAL, turnos, caché y respaldo |
| [docs/comunidad.md](docs/comunidad.md) | Reportes, tags, geofencing, puntos y ranking |
| [docs/base-de-datos.md](docs/base-de-datos.md) | Tablas, RLS, roles y migraciones |
| [docs/notificaciones.md](docs/notificaciones.md) | Push en camino, turno diario y cron |
| [docs/ux-ui.md](docs/ux-ui.md) | Identidad visual, pantalla principal, onboarding y PWA |
| [docs/admin.md](docs/admin.md) | Panel de revisión, sugerencias y locales ocultos |
| [docs/contribuir.md](docs/contribuir.md) | Convenciones, tests y cómo agregar categorías |

## Licencia

Privado. © cumpita.
