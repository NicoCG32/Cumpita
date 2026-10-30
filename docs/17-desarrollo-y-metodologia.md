# 17 — Etapas y metodología

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** desarrollo del proyecto.

## Desarrollo del proyecto: etapas y método

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

Piloto incremental con contraste de fuentes y feedback comunitario. Los cambios se rastrean en Git y documentación; la existencia de un commit no prueba una validación en campo. El siguiente ciclo debe medir utilidad y cobertura, además de estabilidad técnica.

### Etapas reconstruidas de fuentes

| Etapa      | Evidencia / alcance                                                                   |
| ---------- | ------------------------------------------------------------------------------------- |
| Origen     | Necesidad cotidiana planteada por el padre del responsable                            |
| Piloto web | Zonas, fuentes, reportes, moderación y caché implementados                            |
| Fiabilidad | Telemetría y reglas de vigencia; validación de fuentes pendiente de medición continua |
| Android    | Elegir empaquetado y probar permisos/push antes de distribuir APK                     |

El cuadro distingue hechos documentados y pendientes. Un archivo de planificación describe intención; un commit confirma contenido de código/documentación; una prueba/artefacto con procedencia aporta evidencia de comportamiento. No son intercambiables.

### Ciclo de trabajo y decisión

1. Caracterizar una necesidad y un escenario observable.
2. Revisar contratos, datos y límites del alcance.
3. Implementar o prototipar el incremento apropiado a la etapa.
4. Verificar el recorrido y sus errores relevantes; conservar resultados negativos.
5. Decidir continuar, corregir, limitar o posponer y actualizar documentación vigente.

Este ciclo es una propuesta de continuidad compatible con el método descrito arriba; no se afirma que todas las etapas históricas se ejecutaran con idéntica ceremonia o duración.

### Cierre y continuidad

La entrega identifica fuente, plataforma, límites, guía de uso e integridad de datos/artefactos. Los informes académicos conservan su etapa, cuando aplican, y no se actualizan como si fueran manuales del runtime. La proyección no obliga a desarrollar extensiones antes de validar el núcleo.

Justificación y prioridades: [15-escalabilidad-y-nuevos-mercados.md](15-escalabilidad-y-nuevos-mercados.md). Esfuerzo futuro y operación: [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md).

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
