# 04 · Modelo de datos y persistencia

Todas las tablas viven en el esquema `public` de Lovable Cloud (PostgreSQL), con **RLS activado** y `GRANT` explícitos. El historial está en `drizzle/migrations/`.

## Tablas

| Tabla                      | Propósito                      | Acceso                                             |
| -------------------------- | ------------------------------ | -------------------------------------------------- |
| `place_reports`            | Reportes abierto/cerrado       | Lectura pública; inserción autenticada con límites |
| `place_tags`               | Micro-tags comunitarios        | Lectura pública; inserción autenticada             |
| `hours_proposals`          | Propuestas de horario          | Usuario propone; admin revisa                      |
| `user_roles`               | Roles (`admin`)                | Leída vía función `has_role` (security definer)    |
| `subscriptions` / `points` | Alertas y reputación           | Por usuario; ranking por función pública agregada  |
| `en_route`                 | "Voy en camino" para push      | Secreto generado por servidor                      |
| `places_cache`             | Caché de OSM y turnos          | Solo servidor                                      |
| `place_suggestions`        | Locales sugeridos              | Usuario envía; admin aprueba; aprobados públicos   |
| `hidden_places`            | Locales dados de baja          | Admin lee/escribe; público solo ids                |
| `turno_subs`               | Aviso diario de turnos         | Token + secreto                                    |
| `ops_events`               | Telemetría de fuentes y cargas | Inserta el servidor; solo admins leen              |

## Seguridad

- Los roles **nunca** se guardan en perfiles ni metadatos editables: siempre `user_roles` + `has_role(auth.uid(), 'admin')`.
- Los puntos se calculan en servidor a partir de reportes; el cliente no puede escribirlos.
- El ranking público expone solo apodo, puntos, conteo e `is_me`.
- `ops_events` no guarda ubicación ni datos personales (`kind`, `source`, `ok`, `ms`, `detail` ≤200 caracteres).
- Auth: email y Google; sin registros anónimos.

## Migraciones

| N.º       | Contenido                       |
| --------- | ------------------------------- |
| 0000      | Base                            |
| 0001      | Propuestas de horario y roles   |
| 0002      | Suscripciones y puntos          |
| 0003      | `user_id` en reportes           |
| 0004      | Tags                            |
| 0005      | Push "en camino"                |
| 0006      | Endurecimiento de seguridad     |
| 0007      | Caché de lugares                |
| 0008      | Tags nocturnos y sugerencias    |
| 0009      | Sugerencias aprobadas públicas  |
| 0010–0011 | Locales ocultos y lectura admin |
| 0012      | Suscripción de turnos           |
| 0013      | `ops_events`                    |

Regla: cada migración que crea una tabla incluye `GRANT`, `ENABLE ROW LEVEL SECURITY` y sus políticas en el mismo archivo.

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Dominio y representación de datos

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

### Entidades y conceptos

| Entidad / concepto                  | Identidad y significado                                     | Representación / estado                          |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| Lugar                               | Identidad de fuente, categoría, posición y horario          | Fuentes/caché; no confundir catálogo con reporte |
| place_reports                       | Observación abierto/cerrado y tiempo/autor                  | PostgreSQL                                       |
| place_tags                          | Atributos comunitarios con vigencia                         | PostgreSQL                                       |
| hours_proposals / place_suggestions | Corrección pendiente de revisión                            | PostgreSQL                                       |
| user_roles / points                 | Autorización y reputación                                   | PostgreSQL/funciones                             |
| ops_events                          | Estado técnico de consultas sin duplicar ubicación personal | PostgreSQL; administración                       |

### Relaciones de dominio

```text
[Usuario] -- 1:N --> [Reporte]
[Lugar] -- 1:N --> [Reporte]
[Lugar] -- 1:N --> [Tag]
[Usuario] -- 1:N --> [Suscripción]
[Administrador] -- revisa --> [Propuesta]
```

| Origen        | Cardinalidad / relación | Destino     | Semántica                      |
| ------------- | ----------------------- | ----------- | ------------------------------ |
| Usuario       | 1:N                     | Reporte     | Atribución de observaciones    |
| Lugar         | 1:N                     | Reporte     | Vigencia evaluada al consultar |
| Lugar         | 1:N                     | Tag         | Microinformación temporal      |
| Usuario       | 1:N                     | Suscripción | Avisos consentidos             |
| Administrador | revisa                  | Propuesta   | Aprobación separada del envío  |

### Persistencia y garantías

Migraciones en drizzle/migrations definen las tablas, GRANT y RLS. El esquema TypeScript generado puede estar vacío; no es una prueba de ausencia de base de datos. Favoritos/apodo y preferencias locales se distinguen de reportes y roles remotos. Las políticas presentes en el repo no prueban su aplicación en producción.

La cardinalidad de dominio no prueba que exista una FK física. Revisar adaptadores/migraciones para identificar qué se valida por esquema, por caso de uso o por lectura. No usar «RLS» para almacenamiento que no dispone de esas políticas.

### Consistencia y evolución

- Distancias y geofencing usan ubicación con incertidumbre; denegar GPS permite una zona manual.
- Un reporte abierto/cerrado caduca; no convierte el dato comunitario en estado oficial permanente.
- El código documenta 300 m para reporte y una hora de vigencia; consultar constantes para límites efectivos.
- Las categorías proceden de categories.ts e incluyen ferreterías en la revisión actual.
- Los puntos y privilegios no se aceptan como una afirmación editable del cliente.

Cambios de formato, referencias y restauración se comprueban con datos de prueba. El respaldo/artefacto debe indicar versión; la documentación no autoriza transformar datos reales ni rebajar un esquema para abrirlo con un ejecutable anterior.

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
