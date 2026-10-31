# 06 — Integraciones y asistencia

## Integraciones y límites de asistencia

| Servicio / integración     | Finalidad / ejecución           | Contrato o límite                                          |
| -------------------------- | ------------------------------- | ---------------------------------------------------------- |
| OSM/Overpass y turnos      | Consulta desde servidor y caché | Datos incompletos, latencia y condiciones de fuente        |
| Supabase/Lovable Cloud     | Auth, reportes, roles y caché   | RLS, límites y tareas configuradas                         |
| Firebase Messaging         | Push vía integración            | Prueba específica de permisos/segundo plano                |
| Mapas y navegación externa | Leaflet y enlaces de ruta       | No confundir recomendación de ruta con certeza de apertura |

Configura las credenciales privadas en el servidor o en el entorno de compilación, según la integración. Consulta la configuración, las cuotas y las condiciones del servicio antes de utilizarlo.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
