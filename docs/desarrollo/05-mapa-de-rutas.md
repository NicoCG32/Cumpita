# Mapa de rutas de aplicación

Las rutas se definen en `src/routes/`. El [índice de archivos](../../src/routes/README.md) relaciona cada ruta con su implementación.

| Ruta                            | Finalidad                                       |
| ------------------------------- | ----------------------------------------------- |
| `/`                             | Consulta y aportes comunitarios                 |
| `/local/$`                      | Ficha compartida de un local por identificador  |
| `/revision`                     | Revisión administrativa                         |
| `POST /api/public/cron/refresh` | Refresco solicitado por programador autenticado |
| `POST /api/public/cron/turnos`  | Intento de envío programado de turnos           |

La autorización de las operaciones sensibles no debe depender solo del nombre de la ruta ni de que el panel esté oculto a usuarios comunes.

[Arquitectura](../tecnica/01-arquitectura.md) · [Entorno y despliegue](01-entorno-y-despliegue.md)
