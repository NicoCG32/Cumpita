# Base de datos (Lovable Cloud)

Todas las tablas viven en `public`, con RLS activado. El historial está en `drizzle/migrations/`.

| Tabla | Uso | Acceso |
| --- | --- | --- |
| `place_reports` | Reportes abierto/cerrado | Lectura pública, inserción autenticada con límites |
| `place_tags` | Micro-tags comunitarios | Lectura pública, inserción autenticada |
| `hours_proposals` | Propuestas de horario | Usuario propone, admin revisa |
| `user_roles` | Roles (`admin`) | Consultado vía función `has_role` (security definer) |
| `subscriptions` / `points` | Alertas y reputación | Por usuario; ranking por función pública |
| `en_route` | Registros "voy en camino" para push | Secreto generado por servidor |
| `places_cache` | Caché de OSM/turnos | Servidor |
| `place_suggestions` | Locales sugeridos | Usuario envía, admin aprueba; aprobados públicos |
| `hidden_places` | Locales dados de baja | Admin lee/escribe; público solo ids |
| `turno_subs` | Suscripción al aviso diario de turnos | Token + secreto |

## Reglas
- Los roles nunca se guardan en el perfil ni en metadata editable; siempre `user_roles` + `has_role`.
- Cada migración incluye GRANT y políticas RLS.
- Auth: email y Google; sin registros anónimos.

## Migraciones
`0000` base · `0001` horarios y roles · `0002` suscripciones y puntos · `0003` user_id en reportes · `0004` tags · `0005` push en camino · `0006` hardening de seguridad · `0007` caché · `0008` tags nocturnos y sugerencias · `0009` sugerencias aprobadas públicas · `0010–0011` locales ocultos · `0012` suscripción de turnos.
