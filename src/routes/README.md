# Rutas de Cumpita

TanStack Start define las rutas a partir de los archivos de este directorio.
`__root.tsx` contiene el layout compartido y renderiza las páginas mediante `<Outlet />`.

| Archivo                      | Ruta                            | Finalidad                                                            |
| ---------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `index.tsx`                  | `/`                             | Consulta de locales y aportes comunitarios                           |
| `local.$.tsx`                | `/local/$`                      | Ficha compartida; el identificador se obtiene del parámetro `_splat` |
| `revision.tsx`               | `/revision`                     | Panel de revisión administrativa                                     |
| `api/public/cron/refresh.ts` | `POST /api/public/cron/refresh` | Refresco de datos mediante una tarea autenticada                     |
| `api/public/cron/turnos.ts`  | `POST /api/public/cron/turnos`  | Envío programado de avisos de turnos mediante una tarea autenticada  |

El árbol `src/routeTree.gen.ts` se genera automáticamente; no se edita a mano.
La autorización de las operaciones sensibles depende de las comprobaciones de servidor
y las políticas de datos, además de los controles visibles en la interfaz.

[Mapa de rutas](../../docs/desarrollo/05-mapa-de-rutas.md) · [Arquitectura](../../docs/tecnica/01-arquitectura.md)
