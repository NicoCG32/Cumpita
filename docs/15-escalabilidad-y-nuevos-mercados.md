# 15 · Escalabilidad y visión de negocio

## Abstracción del modelo
El núcleo de cumpita. es genérico: **dato oficial incierto ↔ verificación humana reciente y geolocalizada**, con caducidad y caché de respaldo. Cualquier servicio cuya disponibilidad real difiere de la declarada encaja en el modelo agregando una categoría en `src/lib/categories.ts`.

## Expansión geográfica
Antofagasta, Copiapó, Iquique, Arica y Ovalle: ciudades intermedias con el mismo patrón de baja cobertura de datos nocturnos. Requiere zonas en `ZONES`, slug de turnos y precarga en el cron.

## Nuevos rubros
1. **Veterinarias de urgencia.**
2. **Vulcanizaciones y servicios en ruta** (alta demanda en zonas mineras).
3. **Cerrajerías 24H.**
4. **Cajeros automáticos operativos** (con o sin efectivo).
5. **Servicios municipales en emergencias** (puntos de agua, albergues).

## Ventajas y desventajas

| Ventajas | Desventajas |
| --- | --- |
| Costo marginal casi nulo, fuentes abiertas | Depende de masa crítica de cumpitas por zona |
| Verificación reciente que los mapas generalistas no ofrecen | Fuentes de turnos sin API oficial (scraping frágil) |
| PWA sin tiendas, despliegue inmediato | Push en iOS solo con la app instalada |
| Datos honestos: genera confianza | Menos "llenado" visual que competidores que estiman horarios |

## Hoja de ruta

| Prioridad | Iniciativa técnica | Impacto comercial | Justificación ROI |
| --- | --- | --- | --- |
| **Alta** | Piloto en terreno en Calama y La Serena/Coquimbo | Valida la propuesta con uso real | Evita invertir en funciones no usadas |
| **Alta** | Gráficos de métricas en `/revision` sobre `ops_events` | Decisiones basadas en datos | Costo bajo, la telemetría ya existe |
| **Media** | Catálogo 24H verificado y radar de delivery | Más fiabilidad sin cumpitas cerca | Reduce la dependencia comunitaria |
| **Media** | Expansión a 2–3 ciudades del norte | Crecimiento de usuarios | Reutiliza toda la infraestructura |
| **Estratégica** | Destacados para comercios verificados | Primera línea de ingresos | Monetización ética sin alterar el orden por distancia |
| **Estratégica** | Alianzas municipales y SEREMI | Datos oficiales directos y legitimidad | Reemplaza scraping por convenios |
