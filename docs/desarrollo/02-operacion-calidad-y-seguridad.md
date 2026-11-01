# Operación, pruebas y límites de seguridad

La operación del piloto incluye moderar propuestas, comprobar el estado de las fuentes y revisar los controles de acceso y reporte.

## Qué puede revisar el administrador

La ruta `/revision` contiene acceso, revisión de horarios, sugerencias de locales, reactivación de locales ocultos y datos operativos. La interfaz consulta `has_role` y las políticas RLS restringen las operaciones sensibles. **Una comprobación de rol hecha en el navegador no reemplaza la política de autorización del servidor**.

| Acción                        | Persistencia        | Comportamiento                                                     |
| ----------------------------- | ------------------- | ------------------------------------------------------------------ |
| Aprobar o rechazar horario    | `hours_proposals`   | El agregado usa propuestas aprobadas                               |
| Aprobar o rechazar sugerencia | `place_suggestions` | Los locales aprobados de tipo `missing` pueden entrar al feed      |
| Ocultar o reactivar local     | `hidden_places`     | El servidor excluye identificadores ocultos al componer resultados |
| Revisar salud de fuentes      | `ops_events`        | Se consultan eventos recientes, errores y duraciones               |

El control de distancia se aplica en el navegador. Sus límites y los de frecuencia están descritos en las [reglas de reporte](../tecnica/03-reglas-y-flujos.md). Las funciones que usan `service_role` eluden RLS y deben validar las entradas y la autorización de cada operación.

## Seguridad sin exigir registro

Los reportes sin cuenta forman parte de la experiencia de Cumpita. Las medidas contra el abuso deben conservar esa posibilidad y respetar la privacidad.

La política RLS permite insertar reportes con `user_id = NULL` desde el rol `anon`. El trigger de diez minutos solo limita a usuarios identificados; sigue pendiente un control de frecuencia en servidor para aportes anónimos. También se deben evaluar controles de volumen, automatización y reportes contradictorios antes de ampliar el uso.

## Datos personales y credenciales

`ops_events` no tiene campos de ubicación ni identidad del usuario; sus detalles deben mantenerse breves y sin secretos. Las tablas de cuentas y suscripciones guardan `user_id`, tokens push y secretos por dispositivo.

Mantén los secretos fuera del repositorio, limita el uso de `SUPABASE_SERVICE_ROLE_KEY` a funciones de servidor y rota cualquier clave comprometida.

## Observabilidad

`ops.server.ts` registra eventos `source`, `cache`, `slow`, `retry`, `load_error` y `refresh` en `ops_events`. El panel presenta una síntesis por fuente y por tipo de evento para su revisión manual.

Como práctica, revisar fallos repetidos de fuente, edad de caché, errores de carga y ausencia de ejecuciones esperadas de cron. Confirmar los resultados contra los logs de hosting y la instancia real antes de atribuir una incidencia a un proveedor.

## Estado de las pruebas

Las pruebas de Vitest en `src/test/` cubren categorías, modo nocturno y rutas. `scripts/release-notes.test.mjs` verifica las notas de versión. El workflow `.github/workflows/calidad.yml` ejecuta lint, TypeScript, pruebas y compilación en cada push o PR a `main`.

### Casos prioritarios por completar

| Prueba                                                                 | Por qué es importante                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Intentar reportar mediante API sin GPS o con identidad nula            | Demuestra la limitación real del geofence en UI y del throttle anónimo |
| Crear las 12 etiquetas expuestas por la UI                             | Detecta diferencias con la lista de 8 aceptadas por SQL                |
| Sugerir locales de todas las categorías                                | Detecta `CHECK` de categorías restringido a dos valores                |
| Validar permisos RLS desde distintos roles                             | Evita confiar en controles visuales                                    |
| Probar «voy en camino» y turnos diarios desde dispositivo real         | Determina disponibilidad real de push, permisos y cron                 |
| Simular una fuente caída, caché antigua y pérdida de Internet          | Comprueba la recuperación y la información de antigüedad mostrada      |
| Revisar sesgo/actualización del calendario de turnos y límites locales | Evita confundir respaldo codificado con fuente viva                    |
| Evaluar navegación por teclado, contraste y anuncios dinámicos         | Completa la validación de accesibilidad                                |

## Antes de ampliar el piloto

Las prioridades son sincronizar categorías y etiquetas entre interfaz y SQL, reforzar los controles de servidor para reportes anónimos y ampliar las pruebas de autorización y operación.

[Entorno y despliegue](01-entorno-y-despliegue.md) · [Reglas](../tecnica/03-reglas-y-flujos.md)
