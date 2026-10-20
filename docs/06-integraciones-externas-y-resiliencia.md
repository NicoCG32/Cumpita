# 06 · Integraciones externas y resiliencia

## OpenStreetMap (Overpass)
- Etiquetas: `amenity=pharmacy`, `shop=alcohol`, `shop=stationery|books`, `shop=convenience|general|supermarket`.
- Mirrors: overpass-api.de, overpass.kumi.systems, lz4.overpass-api.de, overpass.private.coffee, maps.mail.ru.
- Se consultan **en paralelo** con `AbortController`; gana el primero válido y se cancelan los demás. Tope total **12 s**.

## Farmacias de turno
- **En vivo:** scraping de `mifarmaciadeturno.cl` (JSON-LD con dirección, teléfono, coordenadas y horario) para `calama`, `la-serena` y `coquimbo` (`src/lib/turnos-live.ts`). Caché 2 h.
- **Catálogo MINSAL** embebido (`src/lib/minsal-data.ts`), porque la API directa está bloqueada por Cloudflare.
- **Respaldo:** calendario SEREMI en Calama; en otras ciudades, aviso honesto de que no hay datos en vivo.

## Caché en capas

```text
Petición ─► memoria del worker ─► places_cache (BD) ─► fuentes externas
              (inmediato)          (fresca: 6 h)        (refresco en 2.º plano)
                                   (vieja: se sirve igual si todo falla)
```

Patrón **stale-while-revalidate**: el usuario recibe datos al instante y el refresco ocurre detrás.

## Tareas programadas

| Tarea | Horario | Endpoint | Función |
| --- | --- | --- | --- |
| Refresco de datos | Cada hora, minuto 15 | `/api/public/cron/refresh` | Precarga zonas y turnos; conserva el último resultado válido si una fuente falla |
| Aviso diario de turnos | `0 23 * * *` UTC (≈ 20:00 Chile) | `/api/public/cron/turnos` | Envía push con las farmacias de turno |

Ambos endpoints exigen `Authorization: Bearer <LOVABLE_CRON_SECRET>` (acepta también el secreto anterior durante la rotación) y responden `401` sin él.

## Push (Firebase Cloud Messaging)
Envío a través del gateway de conectores (`src/lib/push.functions.ts`), con service worker propio `public/firebase-messaging-sw.js`. Detalles de uso en el [capítulo 02](02-funcionalidades.md).

## Límites de espera por consulta
Locales comunitarios, turnos, horarios aprobados y locales ocultos tienen cada uno su tiempo máximo: si alguno no responde, el feed sale igual sin ese aporte y queda registrado en `ops_events`.

## Pendientes evaluados
- Radar de delivery (PedidosYa/Rappi) para inferir apertura de botillerías.
- Catálogo 24H verificado en terreno.
