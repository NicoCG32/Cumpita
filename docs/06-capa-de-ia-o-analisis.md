# 06 — Integraciones y asistencia

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Integraciones y límites de asistencia

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

| Servicio / integración     | Finalidad / ejecución           | Contrato o límite                                          |
| -------------------------- | ------------------------------- | ---------------------------------------------------------- |
| OSM/Overpass y turnos      | Consulta desde servidor y caché | Datos incompletos, latencia y condiciones de fuente        |
| Supabase/Lovable Cloud     | Auth, reportes, roles y caché   | RLS, límites y tareas configuradas                         |
| Firebase Messaging         | Push vía integración            | Prueba específica de permisos/segundo plano                |
| Mapas y navegación externa | Leaflet y enlaces de ruta       | No confundir recomendación de ruta con certeza de apertura |

Si no hay IA generativa implementada, este capítulo no la introduce. Una IA rival de videojuego no es un proveedor LLM. Cuando existe asistencia, documentar entradas enviadas, revisión, esquema, timeout/cancelación y efecto permitido. Los reintentos/fallback deben corresponder al código y al consentimiento; no se agregan a un contrato de intento único para seguir una plantilla.

Las claves de servidor y firma no se incluyen en cliente, informes o archivos de distribución. La disponibilidad, costo y condiciones de los proveedores se verifican para el entorno real. Sin esa comprobación, distinguir integración configurada, declarada y probada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
