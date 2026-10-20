# 08 · Moderación y telemetría operativa

## Panel `/revision`
Accesible solo para usuarios con rol `admin` (verificado con `has_role` en servidor y RLS).

| Sección | Acción |
| --- | --- |
| Propuestas de horario | Aprobar o rechazar horarios sugeridos |
| Locales sugeridos | Al aprobar se agregan al feed con la etiqueta "Cumpitas" |
| Locales ocultos | Listado de bajas con botón **Reactivar** |
| Monitoreo | Eventos recientes de fuentes y cargas |

Una baja se marca desde el menú "···" de una tarjeta → **Marcar como cerrado definitivamente**.

Asignar un admin: insertar una fila en `user_roles` con el id del usuario y el rol `admin`.

## Moderación comunitaria
- Geofencing y límites de frecuencia frenan reportes falsos o masivos.
- La caducidad automática (1 h reportes, 3 h tags) limpia la información sin intervención.
- Las sugerencias y horarios nunca se publican sin revisión.

## Telemetría (`ops_events`)
Registro liviano escrito por `src/lib/ops.server.ts`. **No guarda ubicación ni datos personales.**

| `kind` | Significado |
| --- | --- |
| `source` | Resultado y duración de una fuente externa (Overpass, turnos…) |
| `cache` | Respuesta servida desde caché |
| `slow` | Carga que superó el umbral de lentitud |
| `retry` | El usuario pulsó **Actualizar** |
| `load_error` | Falla de carga en el cliente |
| `refresh` | Ejecución del refresco programado |

Campos: `source` (≤60), `ok`, `ms`, `detail` (≤200), `created_at`. Lectura solo para admins.

## Uso operativo
- Muchas `retry` o `slow` en una zona → revisar fuente y frescura de caché.
- `source` con `ok = false` repetido → mirror o sitio caído; la caché cubre mientras tanto.
- Ausencia de `refresh` en la última hora → revisar la tarea programada.
