# 18 — Escenarios económicos CLP / USD

## Escenarios económicos de cumpita.

**Finalidad:** presupuestar decisiones futuras, no tasar el repositorio ni declarar costos/ventas históricos. Alcance modelado: **Evaluación Android y medición de fiabilidad de datos por zona**. No hay clientes pagadores ni tarifa acordada. Patrocinios o servicios a comercios son hipótesis y no deben sesgar la información comunitaria.

### Moneda y supuestos

Conversión: **USD 1 = CLP 994,29**, valor del **27-10-2026** en la [tabla oficial SII](https://www.sii.cl/valores_y_fechas/dolar/dolar2026.htm), utilizado como referencia para los escenarios de este capítulo. CLP = USD × R; USD = CLP / R, con R = 994,29.

Para valorizar esfuerzo se supone **CLP 15.000/h** (USD 15,09/h). Es una tasa elegida para comparar escenarios, no una tarifa profesional ni un presupuesto de implementación. Rangos de horas, mantenimiento y reservas también son supuestos; no se deducen de SCT, commits o líneas de código.

### Inversión del siguiente alcance

| Concepto                        | Base del escenario                       | CLP                     | USD                   |
| ------------------------------- | ---------------------------------------- | ----------------------- | --------------------- |
| Tiempo del siguiente alcance    | 32–64 h a CLP 15.000/h                   | CLP 480.000–CLP 960.000 | USD 482,76–USD 965,51 |
| Reserva de materiales           | Supuesto; equipo existente no valorizado | CLP 0                   | USD 0,00              |
| Total de inversión de escenario | No es inversión histórica ni cotización  | CLP 480.000–CLP 960.000 | USD 482,76–USD 965,51 |

### Operación mensual

Alternativa de presupuesto: USD 20/mes de hosting Pro + USD 25/mes de base Pro = USD 45/mes. No significa que se necesiten ambos contratos ni que el servicio actual facture eso; se utiliza como escenario de operación con infraestructura contratada.

| Concepto                        | Base                               | CLP/mes     | USD/mes    |
| ------------------------------- | ---------------------------------- | ----------- | ---------- |
| Mantenimiento de escenario      | 4 h/mes                            | CLP 60.000  | USD 60,34  |
| Servicios externos de escenario | Ver composición; no factura actual | CLP 44.743  | USD 45,00  |
| Costo mensual modelado          | Tiempo + servicios                 | CLP 104.743 | USD 105,34 |

No se suman aquí impuestos, comisiones, dominio, sobreconsumo, reposición extraordinaria o equipo no valorizado. Costos de nube por proyecto/organización y cuotas gratuitas deben revisarse para la cuenta concreta. Una cuota de nube no sustituye la arquitectura ni la validación necesarias para escalar.

### Justificación y retorno

Ejemplo **hipotético**, no resultado medido: evitar 3 h/mes a la misma tasa representa CLP 45.000 / USD 45,26 de tiempo valorizado, no ingresos. Frente al costo modelado, el saldo de ese ejemplo es CLP -59.743 / USD -60,09 al mes. El punto de equilibrio por ahorro temporal sería 6.98 h/mes; debe comprobarse con uso real, pérdidas evitadas o un beneficio distinto.

Viajes evitados y proporción de consultas con dato vigente, medidos con consentimiento; latencia y cobertura por zona/categoría.

ROI sólo se calcula cuando beneficios y costos comparables estén medidos: (beneficio − costo) / costo, indicando período y si el tiempo valorizado realmente se convierte en ahorro. Un costo de caja bajo no acredita rentabilidad ni valor comercial de la idea.

### Sensibilidad y decisión

- Con R ±10 %, cambia en ±10 % el costo CLP de servicios fijados en USD; el gasto local CLP no cambia por ese supuesto.
- Separar creación puntual de mantenimiento recurrente y reserva física de consumo.
- Registrar facturas/uso, horas observadas y aceptación antes de reemplazar estos escenarios por un presupuesto comprometido.
- Las monedas ficticias de un videojuego, saldos de clientes e inventario de una empresa no son ingresos del software.

### Referencias de servicios

[Supabase](https://supabase.com/pricing): Free y Pro desde USD 25/mes; [Vercel](https://vercel.com/pricing): Hobby y Pro desde USD 20/mes. Son referencias consultadas, no planes asignados al proyecto. [Gemini](https://ai.google.dev/gemini-api/docs/pricing) y [Firebase](https://firebase.google.com/pricing) requieren revisar producto/modelo, cuotas y condiciones antes de cuantificar consumo. El plan actual de Lovable u otro proveedor no se deduce de estas tarifas.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
