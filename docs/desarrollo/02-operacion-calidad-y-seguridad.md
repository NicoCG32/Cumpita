# Operación, pruebas y límites de seguridad

Para que Cumpita sea útil no basta con que una tarjeta aparezca bonita. También debo poder explicar por qué apareció, cuándo se actualizó y qué ocurre si una persona envía un reporte incorrecto.

## Qué puede revisar el administrador

La ruta `/revision` contiene acceso, revisión de horarios, sugerencias de locales, reactivación de locales ocultos y datos operativos. La interfaz consulta `has_role` y las políticas RLS restringen las operaciones sensibles. **Una comprobación de rol hecha en el navegador no reemplaza la política de autorización del servidor**.

| Acción                        | Persistencia        | Comportamiento                                                     |
| ----------------------------- | ------------------- | ------------------------------------------------------------------ |
| Aprobar o rechazar horario    | `hours_proposals`   | El agregado usa propuestas aprobadas                               |
| Aprobar o rechazar sugerencia | `place_suggestions` | Los locales aprobados de tipo `missing` pueden entrar al feed      |
| Ocultar o reactivar local     | `hidden_places`     | El servidor excluye identificadores ocultos al componer resultados |
| Revisar salud de fuentes      | `ops_events`        | Se consultan eventos recientes, errores y duraciones               |

**No prometer una prevención antifraude inexistente:** el límite de 300 m para reportes es un control UI; el servidor no verifica con prueba fiable la presencia física del usuario. El trigger de frecuencia cubre reportes identificados, no todos los anónimos. La consulta y modificación de datos con `service_role` evita RLS, por lo que cada server function debe tratar sus entradas como no confiables.

## Seguridad sin exigir registro

**El anonimato es un requisito de Cumpita, no un defecto que deba eliminarse.** Quiero que una persona pueda avisar si un comercio está abierto o cerrado sin abrir una cuenta, como ocurre con la lógica de participación rápida que inspira el producto. La seguridad debe adaptarse a ese objetivo, no reemplazarlo por un inicio de sesión obligatorio.

En las migraciones actuales, la política RLS permite el `INSERT` de un reporte con `user_id = NULL` desde el rol `anon`. El límite de diez minutos del trigger SQL solo se aplica cuando hay `user_id`; por eso una persona o un cliente automatizado puede evitar la restricción del navegador. Antes de escalar el uso, conviene explorar medidas del lado del servidor contra frecuencia excesiva, automatización y reportes contradictorios. Cualquier identificación técnica adicional debería evaluarse por su proporcionalidad y efecto sobre la privacidad; **no se propone convertir una cuenta en requisito**.

## Datos personales y credenciales

La estructura de `ops_events` no contiene ubicación ni identidad del usuario; sus detalles sí deben mantenerse breves y sin secretos. Otras tablas guardan `user_id`, tokens push y secretos por dispositivo. No corresponde asegurar que **toda la aplicación** es anónima o que no almacena identificadores.

Mantener secretos fuera del repositorio, revisar privilegios de `SUPABASE_SERVICE_ROLE_KEY` y rotar claves comprometidas. El ZIP original incluía `.env`; el paquete documental generado no lo contiene. Las credenciales que hayan sido publicadas o compartidas deben tratarse como potencialmente expuestas.

## Observabilidad

`ops.server.ts` registra clases de evento: `source`, `cache`, `slow`, `retry`, `load_error` y `refresh`; los registros escriben en `ops_events`. El panel presenta una síntesis por fuente y por tipo de evento. No se encontró una suite completa de alertas automáticas, por lo que no la describo como existente.

Como práctica, revisar fallos repetidos de fuente, edad de caché, errores de carga y ausencia de ejecuciones esperadas de cron. Confirmar los resultados contra los logs de hosting y la instancia real antes de atribuir una incidencia a un proveedor.

## Estado de las pruebas

El repositorio contiene Vitest y pruebas en `src/test/` para categorías, modo nocturno y rutas; `scripts/release-notes.test.mjs` verifica notas de release. `.github/workflows/calidad.yml` ejecuta lint, TypeScript, tests y compilación en push/PR. Esta revisión es **estática**: no ejecuté el proyecto contra una instancia Supabase ni verifiqué comportamiento en móviles de producción.

### Casos prioritarios por completar

| Prueba                                                                 | Por qué es importante                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Intentar reportar mediante API sin GPS o con identidad nula            | Demuestra la limitación real del geofence en UI y del throttle anónimo |
| Crear las 12 etiquetas expuestas por la UI                             | Detecta diferencias con la lista de 8 aceptadas por SQL                |
| Sugerir locales de todas las categorías                                | Detecta `CHECK` de categorías restringido a dos valores                |
| Validar permisos RLS desde distintos roles                             | Evita confiar en controles visuales                                    |
| Probar «voy en camino» y turnos diarios desde dispositivo real         | Determina disponibilidad real de push, permisos y cron                 |
| Simular fuente caía, caché vieja y pérdida de Internet                 | Comprueba degradación y ausencia de garantías falsas                   |
| Revisar sesgo/actualización del calendario de turnos y límites locales | Evita confundir respaldo codificado con fuente viva                    |
| Evaluar navegación por teclado, contraste y anuncios dinámicos         | Completa la validación de accesibilidad                                |

## Antes de ampliar el piloto

Primero corregiría la consistencia entre interfaz y restricciones SQL. Después reforzaría validaciones de servidor y defensas antiabuso compatibles con los reportes anónimos, además de pruebas de autorización, secretos y observabilidad. Recién entonces ampliaría cobertura o promocionaría la distribución móvil.

[Auditoría concreta](../AUDITORIA.md) · [Reglas](../tecnica/03-reglas-y-flujos.md)
