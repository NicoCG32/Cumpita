# 04 · Modelo de datos y persistencia

Todas las tablas viven en el esquema `public` de Lovable Cloud (PostgreSQL), con **RLS activado** y `GRANT` explícitos. El historial está en `drizzle/migrations/`.

## Tablas

| Tabla | Propósito | Acceso |
| --- | --- | --- |
| `place_reports` | Reportes abierto/cerrado | Lectura pública; inserción autenticada con límites |
| `place_tags` | Micro-tags comunitarios | Lectura pública; inserción autenticada |
| `hours_proposals` | Propuestas de horario | Usuario propone; admin revisa |
| `user_roles` | Roles (`admin`) | Leída vía función `has_role` (security definer) |
| `subscriptions` / `points` | Alertas y reputación | Por usuario; ranking por función pública agregada |
| `en_route` | "Voy en camino" para push | Secreto generado por servidor |
| `places_cache` | Caché de OSM y turnos | Solo servidor |
| `place_suggestions` | Locales sugeridos | Usuario envía; admin aprueba; aprobados públicos |
| `hidden_places` | Locales dados de baja | Admin lee/escribe; público solo ids |
| `turno_subs` | Aviso diario de turnos | Token + secreto |
| `ops_events` | Telemetría de fuentes y cargas | Inserta el servidor; solo admins leen |

## Seguridad
- Los roles **nunca** se guardan en perfiles ni metadatos editables: siempre `user_roles` + `has_role(auth.uid(), 'admin')`.
- Los puntos se calculan en servidor a partir de reportes; el cliente no puede escribirlos.
- El ranking público expone solo apodo, puntos, conteo e `is_me`.
- `ops_events` no guarda ubicación ni datos personales (`kind`, `source`, `ok`, `ms`, `detail` ≤200 caracteres).
- Auth: email y Google; sin registros anónimos.

## Migraciones

| N.º | Contenido |
| --- | --- |
| 0000 | Base |
| 0001 | Propuestas de horario y roles |
| 0002 | Suscripciones y puntos |
| 0003 | `user_id` en reportes |
| 0004 | Tags |
| 0005 | Push "en camino" |
| 0006 | Endurecimiento de seguridad |
| 0007 | Caché de lugares |
| 0008 | Tags nocturnos y sugerencias |
| 0009 | Sugerencias aprobadas públicas |
| 0010–0011 | Locales ocultos y lectura admin |
| 0012 | Suscripción de turnos |
| 0013 | `ops_events` |

Regla: cada migración que crea una tabla incluye `GRANT`, `ENABLE ROW LEVEL SECURITY` y sus políticas en el mismo archivo.
