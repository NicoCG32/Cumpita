# 00 · Problemática, clientes y justificación

## El problema

De noche, en ciudades intermedias de Chile como **Calama**, **La Serena** y **Coquimbo**, la información sobre qué está abierto es fragmentada y poco confiable:

- Los horarios publicados en mapas genéricos suelen estar desactualizados o no existen.
- La farmacia de turno cambia cada día y se publica en fuentes dispersas (SEREMI, MINSAL, sitios de terceros).
- Botillerías y minimarkets cierran antes o abren más tarde de lo declarado, sin aviso.
- Las ferreterías de barrio, clave para reparaciones urgentes en domingos y feriados, casi no publican horarios en línea.

El resultado son **desplazamientos infructuosos de noche**, con costo de tiempo, transporte y, sobre todo, **riesgo de seguridad personal** en la calle.

## Arquetipos de usuario

| Arquetipo                                              | Situación                                                 | Fricción principal                                         |
| ------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------- |
| **Cuidador/a en urgencia**                             | Hijo con fiebre a las 02:00, necesita un antipirético     | No sabe qué farmacia está de turno ni si realmente atiende |
| **Vecino/a de abastecimiento nocturno**                | Le falta hielo, carbón, pan o bebida para una reunión     | Recorre locales cerrados pese a figurar abiertos           |
| **Trabajador/a de turno** (minería, salud, transporte) | Sale tarde y necesita comprar en el trayecto              | Ventanas de tiempo cortas, sin margen para errores         |
| **Estudiante**                                         | Necesita fotocopias, cartulinas o útiles de último minuto | Las librerías/bazares no publican horarios                 |
| **Comerciante local**                                  | Atiende hasta tarde pero nadie lo sabe                    | Visibilidad nula frente a cadenas grandes                  |

## Magnitud del dolor

- **Tiempo:** cada intento fallido suma 15–30 min de desplazamiento nocturno.
- **Costo:** traslados en taxi o aplicación para llegar a un local cerrado.
- **Seguridad:** exposición evitable en horario de mayor riesgo.
- **Salud:** demora en acceder a medicamentos en una urgencia leve.

## Solución propuesta

| Idea abstracta                            | Implementación en cumpita.                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| "Saber qué está abierto cerca, de verdad" | Feed ordenado por distancia (`src/routes/index.tsx`) que combina datos oficiales y comunitarios                    |
| Datos oficiales                           | Turnos MINSAL / SEREMI y scraping de mifarmaciadeturno.cl (`src/lib/turnos-live.ts`, `src/lib/minsal-data.ts`)     |
| Verificación humana                       | Reporte **"Último Cumpita"** abierto/cerrado con caducidad y geofencing (`src/lib/tags.ts`, tabla `place_reports`) |
| Continuidad ante fallas                   | Caché persistente y refresco programado (`places_cache`, `/api/public/cron/refresh`)                               |

**Principio rector — datos honestos:** nunca se inventan horarios, calificaciones ni distintivos 24H. Lo desconocido se muestra como desconocido.

## Viabilidad

- **Costo marginal casi nulo:** fuentes abiertas (OpenStreetMap), datos públicos de turnos y contribución comunitaria; sin licencias de datos pagadas ni IA generativa en el flujo principal.
- **Infraestructura edge serverless:** escala con el uso, sin servidores dedicados.
- **PWA instalable:** sin pasar por tiendas de aplicaciones; una sola base de código para Android, iOS y escritorio.
- **Diferenciación frente a mapas generalistas:** foco hiperlocal y nocturno, con confirmación reciente de personas que estuvieron ahí.

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general.

## Síntesis general — cumpita.

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

### Problemática

Los horarios publicados pueden estar desactualizados o ausentes. Una persona necesita decidir adónde ir, pero el estado oficial, la observación reciente y las farmacias de turno proceden de fuentes diferentes. Un viaje fallido consume tiempo y transporte; su frecuencia y costo reales todavía deben medirse.

### Cliente, usuario y beneficiario

| Perfil       | Contexto                                            | Necesidad                                                  |
| ------------ | --------------------------------------------------- | ---------------------------------------------------------- |
| Usuario      | Residente o visitante que busca un comercio cercano | Información reciente y distancia                           |
| Participante | Persona que confirma el estado de un local          | Aportar sin convertir un reporte en verdad permanente      |
| Beneficiario | Comercio local visible con información correcta     | Corregir disponibilidad sin control unilateral del ranking |

### Solución y límites

Feed y mapa reúnen fuentes de lugares/turnos con reportes comunitarios geolocalizados y temporales. Los estados muestran su procedencia y vigencia, y las sugerencias pasan por moderación cuando corresponda.

### Por qué corresponde al problema

| Fricción / necesidad       | Mecanismo de la solución                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Horarios estáticos         | Reportes con caducidad aportan evidencia reciente sin reemplazar permanentemente la fuente |
| Distancia y oportunidad    | Ubicación o zona manual y orden geográfico facilitan elegir opciones                       |
| Información contradictoria | Procedencia, expiración y moderación permiten entender la incertidumbre                    |

### Validación pendiente o continua

Viajes evitados y proporción de consultas con dato vigente, medidos con consentimiento; latencia y cobertura por zona/categoría.

La motivación del creador se presenta en [16-motivacion-y-contexto.md](16-motivacion-y-contexto.md); el análisis de costos y proyección se separa en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md). Afinidad personal, un prototipo o cercanía con una organización no equivalen a demanda/venta demostrada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
