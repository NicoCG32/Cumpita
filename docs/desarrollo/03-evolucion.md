# Cómo quiero hacer crecer el proyecto

La ampliación del piloto debería apoyarse primero en una zona que pueda comprobarse. Más categorías no garantizan una mejor experiencia si los datos son antiguos o difíciles de interpretar.

## Estado y siguientes decisiones

| Etapa                                | Situación en el código revisado                                                          | Próximo criterio de avance                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Piloto web/PWA                       | Interfaz, datos externos, reportes, moderación y caché presentes                         | Probar recorridos reales y errores de fuentes                                             |
| Consistencia del dominio             | Desajustes entre UI y SQL en etiquetas/categorías                                        | Resolver migraciones y cubrirlas con pruebas                                              |
| Seguridad de contribuciones anónimas | Participación sin cuenta implementada; controles de frecuencia incompletos para anónimos | Reforzar protección en servidor **sin exigir cuentas**, y revisar funciones privilegiadas |
| Operación continua                   | Endpoints de cron y telemetría presentes                                                 | Verificar scheduler, permisos y logs de despliegue                                        |
| Experiencia Android                  | PWA disponible como base; no se encontró APK                                             | Decidir si basta la instalación PWA o hace falta empaquetado Android y pruebas propias    |
| Nuevos mercados                      | Ideas por evaluar                                                                        | Priorizar por disponibilidad de fuentes y calidad de validación                           |

## Otras necesidades posibles

Una farmacia de urgencia, una vulcanización o un comercio de barrio comparten el problema de buscar atención cercana en un momento concreto. Sin embargo, cada categoría necesita reglas propias para **definir disponibilidad**, mantener fuentes y evitar afirmaciones peligrosas. No las describo como módulos futuros confirmados.

## Medir antes de concluir

Me gustaría observar proporción de consultas con datos recientes, tiempo hasta una respuesta útil, cobertura por zona, reportes rechazados y experiencias de usuarios. No hay métricas reales verificadas en los archivos recibidos; por eso las presento como preguntas de evaluación, no como logros.

## Financiamiento y costos

La documentación anterior incluía rangos CLP/USD para servicios y operación, sin un modelo de costos medido ni evidencia de cotizaciones. **No los trasladé como precios recomendados:** podrían confundirse con tarifas oficiales, costos reales o proyecciones ya validadas. Si se requiere una propuesta comercial, debería ser un documento separado con supuestos explícitos: tráfico, uso de Google Places o Overpass, hosting, esfuerzo de moderación, soporte y horas de desarrollo.

La licencia del proyecto y las condiciones de eventual uso comercial siguen en [LICENSE](../../LICENSE) y [LICENSING.md](../../LICENSING.md).

[Motivación](../general/01-origen-y-alcance.md) · [Calidad y seguridad](02-operacion-calidad-y-seguridad.md)
