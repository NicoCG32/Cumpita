# Documentación de cumpita.

<!-- DOCUMENTACION:indice-niveles-2026-10-29:BEGIN -->

## Documentación por cuatro niveles — 2026-10-29

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

| Nivel                      | Pregunta principal                                                    | Lectura                                                                                    |
| -------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1. General                 | Qué problema, para quién, qué solución y por qué lo eligió el creador | 00, 02, 03 y 16                                                                            |
| 2. Técnica                 | Cómo funciona, entidades, persistencia y ejecución                    | 01, 04, 05, 06, 07, 08 y 09                                                                |
| 3. Desarrollo del proyecto | Cómo se llegó, por qué corresponde y qué cuesta continuar             | 17, 15 y 18                                                                                |
| 4. Académica/formativa     | Qué se entregó en un curso y a qué etapa pertenece                    | No se ha declarado origen académico: este nivel no se inventa ni se exige a este proyecto. |

### Rutas por lector

- **Dirección/cliente/responsable:** 00 → 16 → 01 → 15 → 18.
- **Desarrollo/técnica:** 01 → 04 → 05 → 06 → 09; complementar con las guías especializadas conservadas.
- **Producto/operaciones:** 00 → 02 → 03 → 07 → 08 → 17.
- **Académica/formativa:** contexto de 16 y catálogo del nivel 4 cuando corresponda; contrastar luego con la arquitectura vigente.

| Capítulo | Documento                                                                          | Nivel                   |
| -------- | ---------------------------------------------------------------------------------- | ----------------------- |
| 00       | [Problemática, cliente y solución](00-problematica-cliente-y-valor.md)             | general                 |
| 01       | [Arquitectura por niveles](01-arquitectura-general.md)                             | técnica                 |
| 02       | [Catálogo funcional](02-funcionalidades.md)                                        | general / técnica       |
| 03       | [Recorrido y estados](03-flujo-de-usuario.md)                                      | general / técnica       |
| 04       | [Dominio, entidades y persistencia](04-base-de-datos.md)                           | técnica                 |
| 05       | [Reglas y núcleo](05-motor-o-nucleo-de-negocio.md)                                 | técnica                 |
| 06       | [Integraciones y asistencia](06-capa-de-ia-o-analisis.md)                          | técnica                 |
| 07       | [Diseño y accesibilidad](07-diseno-e-identidad.md)                                 | técnica / producto      |
| 08       | [Salidas y entregables](08-exportacion-e-informes.md)                              | técnica                 |
| 09       | [Puesta en marcha y distribución](09-instalacion-y-despliegue.md)                  | técnica                 |
| 15       | [Justificación, proyección y escalabilidad](15-escalabilidad-y-nuevos-mercados.md) | desarrollo del proyecto |
| 16       | [Motivación personal y contexto](16-motivacion-y-contexto.md)                      | general                 |
| 17       | [Etapas y metodología](17-desarrollo-y-metodologia.md)                             | desarrollo del proyecto |
| 18       | [Escenarios económicos CLP / USD](18-analisis-economico-clp-usd.md)                | desarrollo del proyecto |

Los nuevos capítulos complementan las fuentes especializadas existentes; no reemplazan contratos detallados por resúmenes. Los originales académicos se conservan intactos. La documentación del desarrollo describe etapas/metodología del producto y no contiene instrucciones o conversaciones internas.
<!-- DOCUMENTACION:indice-niveles-2026-10-29:END -->

> Sistema de documentación institucional. Cada capítulo es autocontenido y cita los archivos reales del repositorio.

## Tabla de contenidos

| N.º | Capítulo                                                                           | Contenido                                             |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 00  | [Problemática, clientes y valor](00-problematica-cliente-y-valor.md)               | Dolor, arquetipos, solución y viabilidad              |
| 01  | [Arquitectura general](01-arquitectura-general.md)                                 | Stack, fronteras de ejecución, flujo de datos         |
| 02  | [Funcionalidades](02-funcionalidades.md)                                           | Catálogo funcional y casos borde                      |
| 03  | [Flujo de usuario](03-flujo-de-usuario.md)                                         | Journey y máquinas de estado                          |
| 04  | [Base de datos](04-base-de-datos.md)                                               | Tablas, RLS, roles y migraciones                      |
| 05  | [Núcleo de negocio](05-motor-o-nucleo-de-negocio.md)                               | Algoritmos, reglas y constantes                       |
| 06  | [Integraciones externas y resiliencia](06-integraciones-externas-y-resiliencia.md) | OSM, turnos, push, caché y cron                       |
| 07  | [Diseño e identidad](07-diseno-e-identidad.md)                                     | Sistema visual, accesibilidad, PWA                    |
| 08  | [Moderación y telemetría](08-moderacion-y-telemetria-operativa.md)                 | Panel `/revision` y `ops_events`                      |
| 09  | [Instalación y despliegue](09-instalacion-y-despliegue.md)                         | Entorno local, secretos, producción, verificación PWA |
| 15  | [Escalabilidad y nuevos mercados](15-escalabilidad-y-nuevos-mercados.md)           | Expansión, trade-offs y hoja de ruta                  |

Anexos: [Contribuir](contribuir.md) · [Releases](releases.md) · [CHANGELOG](../CHANGELOG.md)

## Rutas de lectura

| Perfil                               | Capítulos              | Objetivo                                                  |
| ------------------------------------ | ---------------------- | --------------------------------------------------------- |
| **C-Level / Inversionista / Fondos** | 00 → 01 → 15           | Entender el problema, la solidez técnica y el potencial   |
| **Desarrollador / Técnico**          | 01 → 04 → 05 → 06 → 09 | Poder modificar, operar y desplegar el sistema            |
| **Producto / Operaciones**           | 00 → 02 → 03 → 07 → 08 | Conocer el comportamiento, la experiencia y la moderación |

<!-- INDICE:uso-y-licencia -->

## Uso, distribución y condiciones

- [Entrada y descargas](../README.md).
- [Licencia, créditos y reutilización](../LICENSING.md).
