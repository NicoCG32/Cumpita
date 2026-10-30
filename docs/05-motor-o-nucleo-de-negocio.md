# 05 · Lógica de negocio y algoritmos

## Distancia (Haversine)

Toda distancia (orden del feed, geofencing, duplicados) usa la fórmula de Haversine con radio terrestre \(R = 6\,371\,000\) m:

\[
d = 2R \cdot \arcsin\sqrt{\sin^2\!\frac{\Delta\varphi}{2} + \cos\varphi_1\cos\varphi_2\sin^2\!\frac{\Delta\lambda}{2}}
\]

## Constantes de negocio

| Regla                                  | Valor                                       |
| -------------------------------------- | ------------------------------------------- |
| Radio para reportar (geofence)         | ≤ 300 m                                     |
| Vigencia de un reporte abierto/cerrado | 1 h                                         |
| Frecuencia máxima de reporte           | 1 cada 10 min por local y persona           |
| Vigencia de un micro-tag               | 3 h                                         |
| Frecuencia máxima de tag               | 1 cada 30 min por tag y local               |
| Detección pasiva                       | 5 min a ≤ 40 m, precisión GPS ≤ 60 m        |
| Duplicados al sugerir                  | Nombre similar ≤ 400 m, o mismo tipo ≤ 40 m |
| "Voy en camino"                        | 45 min                                      |
| Frescura de caché OSM                  | 6 h · turnos 2 h                            |
| Aviso de carga lenta                   | 8 s                                         |
| Modo madrugada                         | 20:00 – 07:00                               |

## Prioridad del estado mostrado

1. Reporte comunitario vigente (el más reciente gana; se muestra cuántos confirmaron).
2. Turno oficial del día.
3. Horario publicado por la fuente (`opening_hours`).
4. Desconocido.

## Heurísticas honestas

- `is24h`: verdadero **solo** si la fuente declara `opening_hours = "24/7"`.
- `isServicentro`: reconoce por nombre Pronto, Copec, Upa!, Spacio 1, Aramco, Petrobras, Shell y Oxxo; no inventa horario.
- El buscador normaliza texto (`norm` en `src/lib/places.ts`): sin tildes ni mayúsculas.

## Determinismo y separación

- Las reglas viven en módulos puros (`src/lib/places.ts`, `tags.ts`, `categories.ts`) y son verificables con tests en `src/test/` (`night.test.ts`, `categories.test.ts`, `app-routing.test.tsx`).
- La validación decisiva (límites, roles, puntos) ocurre en servidor y en RLS; el cliente solo anticipa para dar feedback inmediato.

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Núcleo e invariantes

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

- Distancias y geofencing usan ubicación con incertidumbre; denegar GPS permite una zona manual.
- Un reporte abierto/cerrado caduca; no convierte el dato comunitario en estado oficial permanente.
- El código documenta 300 m para reporte y una hora de vigencia; consultar constantes para límites efectivos.
- Las categorías proceden de categories.ts e incluyen ferreterías en la revisión actual.
- Los puntos y privilegios no se aceptan como una afirmación editable del cliente.

### Entradas, decisión y efectos

El recorrido de [03-flujo-de-usuario.md](03-flujo-de-usuario.md) proporciona entradas al núcleo. Las reglas anteriores determinan lo aceptado y sus efectos; UI y proveedores externos no deben sustituir silenciosamente esas decisiones. El modelo de [04-base-de-datos.md](04-base-de-datos.md) identifica los estados/referencias afectados.

Las fórmulas y parámetros detallados permanecen en las fuentes especializadas enlazadas. Distinguir parámetros provisionales, azar, reloj y resultados persistidos; cambiar presentación o reexportar no debe presentarse como una nueva evaluación equivalente sin identificarlo.

### Pruebas con propósito

Proteger al menos una transición válida, un rechazo importante y la repetición/reapertura que pueda duplicar efectos. No inventar una suite ni un porcentaje de cobertura: consultar los comandos existentes y la evidencia de su ejecución en [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
