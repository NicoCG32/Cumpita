# 15 · Escalabilidad y visión de negocio

## Abstracción del modelo

El núcleo de cumpita. relaciona **dato oficial incierto ↔ verificación humana reciente y geolocalizada**, con caducidad y caché de respaldo. Otros servicios con disponibilidad cambiante son candidatos a evaluación; agregar una categoría no demuestra por sí solo compatibilidad de fuentes, permisos, reglas o demanda.

## Expansión geográfica

Antofagasta, Copiapó, Iquique, Arica y Ovalle son hipótesis de expansión, sin cobertura ni demanda acreditadas aquí. Requieren verificar fuentes y necesidad local, además de zonas en `ZONES`, slug de turnos y precarga en el cron.

## Nuevos rubros

1. **Veterinarias de urgencia.**
2. **Vulcanizaciones y servicios en ruta** (necesidad y cobertura por validar).
3. **Cerrajerías 24H.**
4. **Cajeros automáticos operativos** (con o sin efectivo).
5. **Servicios municipales en emergencias** (puntos de agua, albergues).

## Ventajas y desventajas

| Ventajas                                            | Desventajas                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Fuentes abiertas y caché; costo marginal por medir  | Depende de participación y operación por zona                 |
| Combina horario publicado y observaciones recientes | Fuentes de turnos susceptibles a cambios                      |
| PWA accesible desde navegador                       | Permisos y entrega de avisos requieren prueba por dispositivo |
| Explicita procedencia y datos ausentes              | La confianza debe medirse, no presumirse por diseño           |

## Hoja de ruta propuesta: impactos por validar

| Prioridad       | Iniciativa técnica                                     | Impacto comercial                      | Justificación ROI                                     |
| --------------- | ------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------- |
| **Alta**        | Piloto en terreno en Calama y La Serena/Coquimbo       | Valida la propuesta con uso real       | Evita invertir en funciones no usadas                 |
| **Alta**        | Gráficos de métricas en `/revision` sobre `ops_events` | Decisiones basadas en datos            | Costo bajo, la telemetría ya existe                   |
| **Media**       | Catálogo 24H verificado y radar de delivery            | Más fiabilidad sin cumpitas cerca      | Reduce la dependencia comunitaria                     |
| **Media**       | Expansión a 2–3 ciudades del norte                     | Crecimiento de usuarios                | Reutiliza toda la infraestructura                     |
| **Estratégica** | Destacados para comercios verificados                  | Primera línea de ingresos              | Monetización ética sin alterar el orden por distancia |
| **Estratégica** | Alianzas municipales y SEREMI                          | Datos oficiales directos y legitimidad | Reemplaza scraping por convenios                      |

## Justificación y proyección

### Ajuste entre problema y solución

| Necesidad                  | Razón del diseño                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Horarios estáticos         | Reportes con caducidad aportan evidencia reciente sin reemplazar permanentemente la fuente |
| Distancia y oportunidad    | Ubicación o zona manual y orden geográfico facilitan elegir opciones                       |
| Información contradictoria | Procedencia, expiración y moderación permiten entender la incertidumbre                    |

Viajes evitados y proporción de consultas con dato vigente, medidos con consentimiento; latencia y cobertura por zona/categoría.

### Qué se puede abstraer y qué no

Las entidades, reglas y fronteras de [04-base-de-datos.md](04-base-de-datos.md) permiten evaluar reutilización. Cambiar un nombre o una categoría no prueba compatibilidad con otro sector: datos, permisos, reglas, operación y costos deben validarse de nuevo.

### Posibles líneas de evolución

- Veterinarias de urgencia
- Servicios de reparación en ruta
- Cerrajerías con disponibilidad reciente
- Servicios comunitarios con horarios variables

### Límites y trade-offs

- Baja participación o reportes falsos
- Latencia y cambios de fuentes externas
- GPS impreciso y datos personales
- Avisos o TWA/servicios Android no certificados por pruebas web

### Prioridad de inversión

| Prioridad   | Iniciativa                                                    | Impacto a comprobar                                                                                                              | Criterio económico                                                    |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Alta        | Evaluación Android y medición de fiabilidad de datos por zona | Viajes evitados y proporción de consultas con dato vigente, medidos con consentimiento; latencia y cobertura por zona/categoría. | Rango de esfuerzo y costo en capítulo 18; no presupuesto comprometido |
| Media       | Reproducción, soporte y recuperación por plataforma           | Menos fallos de entrega y pérdida de datos                                                                                       | Costo recurrente separado de implementación                           |
| Estratégica | Validar una extensión/forma de sostenimiento                  | Uso y aceptación fuera del contexto inicial                                                                                      | Investigar costos, demanda y condiciones antes de monetizar           |

Las cifras CLP/USD, supuestos, sensibilidad y retorno se presentan en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md); no son una valoración comercial del repositorio.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
