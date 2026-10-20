# 00 · Problemática, clientes y justificación

## El problema
De noche, en ciudades intermedias de Chile como **Calama**, **La Serena** y **Coquimbo**, la información sobre qué está abierto es fragmentada y poco confiable:

- Los horarios publicados en mapas genéricos suelen estar desactualizados o no existen.
- La farmacia de turno cambia cada día y se publica en fuentes dispersas (SEREMI, MINSAL, sitios de terceros).
- Botillerías y minimarkets cierran antes o abren más tarde de lo declarado, sin aviso.

El resultado son **desplazamientos infructuosos de noche**, con costo de tiempo, transporte y, sobre todo, **riesgo de seguridad personal** en la calle.

## Arquetipos de usuario

| Arquetipo | Situación | Fricción principal |
| --- | --- | --- |
| **Cuidador/a en urgencia** | Hijo con fiebre a las 02:00, necesita un antipirético | No sabe qué farmacia está de turno ni si realmente atiende |
| **Vecino/a de abastecimiento nocturno** | Le falta hielo, carbón, pan o bebida para una reunión | Recorre locales cerrados pese a figurar abiertos |
| **Trabajador/a de turno** (minería, salud, transporte) | Sale tarde y necesita comprar en el trayecto | Ventanas de tiempo cortas, sin margen para errores |
| **Estudiante** | Necesita fotocopias, cartulinas o útiles de último minuto | Las librerías/bazares no publican horarios |
| **Comerciante local** | Atiende hasta tarde pero nadie lo sabe | Visibilidad nula frente a cadenas grandes |

## Magnitud del dolor
- **Tiempo:** cada intento fallido suma 15–30 min de desplazamiento nocturno.
- **Costo:** traslados en taxi o aplicación para llegar a un local cerrado.
- **Seguridad:** exposición evitable en horario de mayor riesgo.
- **Salud:** demora en acceder a medicamentos en una urgencia leve.

## Solución propuesta

| Idea abstracta | Implementación en cumpita. |
| --- | --- |
| "Saber qué está abierto cerca, de verdad" | Feed ordenado por distancia (`src/routes/index.tsx`) que combina datos oficiales y comunitarios |
| Datos oficiales | Turnos MINSAL / SEREMI y scraping de mifarmaciadeturno.cl (`src/lib/turnos-live.ts`, `src/lib/minsal-data.ts`) |
| Verificación humana | Reporte **"Último Cumpita"** abierto/cerrado con caducidad y geofencing (`src/lib/tags.ts`, tabla `place_reports`) |
| Continuidad ante fallas | Caché persistente y refresco programado (`places_cache`, `/api/public/cron/refresh`) |

**Principio rector — datos honestos:** nunca se inventan horarios, calificaciones ni distintivos 24H. Lo desconocido se muestra como desconocido.

## Viabilidad
- **Costo marginal casi nulo:** fuentes abiertas (OpenStreetMap), datos públicos de turnos y contribución comunitaria; sin licencias de datos pagadas ni IA generativa en el flujo principal.
- **Infraestructura edge serverless:** escala con el uso, sin servidores dedicados.
- **PWA instalable:** sin pasar por tiendas de aplicaciones; una sola base de código para Android, iOS y escritorio.
- **Diferenciación frente a mapas generalistas:** foco hiperlocal y nocturno, con confirmación reciente de personas que estuvieron ahí.
