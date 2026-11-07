# Cómo quiero hacer crecer el proyecto

Quiero consolidar primero el piloto en sus zonas actuales, con datos recientes y estados fáciles de interpretar, antes de ampliar la cobertura.

## Estado y siguientes decisiones

| Etapa                                | Situación actual                                                                         | Próximo paso                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Piloto web/PWA                       | Interfaz, datos externos, reportes, moderación y caché presentes                         | Probar recorridos reales y errores de fuentes                                             |
| Consistencia del dominio             | Desajustes entre UI y SQL en etiquetas/categorías                                        | Resolver migraciones y cubrirlas con pruebas                                              |
| Seguridad de contribuciones anónimas | Participación sin cuenta implementada; controles de frecuencia incompletos para anónimos | Reforzar protección en servidor **sin exigir cuentas**, y revisar funciones privilegiadas |
| Operación continua                   | Endpoints de cron y telemetría presentes                                                 | Verificar scheduler, permisos y logs de despliegue                                        |
| Experiencia Android                  | PWA disponible; empaquetado Android pendiente                                            | Preparar el empaquetado y las pruebas en dispositivos                                     |
| Más zonas y rubros, si corresponde   | Ideas por evaluar, sin despliegue comprometido                                           | Priorizar por disponibilidad de fuentes y calidad de validación                           |

## Otras necesidades posibles

Una posible ampliación es incorporar servicios como vulcanizaciones u otros comercios de barrio. Cada categoría requiere fuentes, horarios y criterios de disponibilidad propios; su incorporación dependerá de poder mantener esos datos.

## Medir antes de concluir

Para evaluar el piloto, me interesa medir la proporción de consultas con datos recientes, el tiempo hasta una respuesta útil, la cobertura por zona, los reportes rechazados y la experiencia de quienes lo usan.

[Motivación](../general/01-origen-y-alcance.md) · [Calidad y seguridad](02-operacion-calidad-y-seguridad.md)
