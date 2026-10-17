# Fuentes de datos

Principio: **datos honestos**. Nunca se inventan horarios, calificaciones ni badges 24H; lo desconocido se muestra como "Horario no informado".

## OpenStreetMap (Overpass)
- Etiquetas: `amenity=pharmacy`, `shop=alcohol`, `shop=stationery|books`, `shop=convenience|general|supermarket`.
- Mirrors en cascada: overpass-api.de, overpass.kumi.systems, lz4.overpass-api.de, overpass.private.coffee, maps.mail.ru.
- Caché en memoria + tabla `places_cache` (frescura 6 h, fallback a datos antiguos si todas las fuentes fallan).

## MINSAL y farmacias de turno
- Catálogo MINSAL embebido (`minsal-data.ts`); la API directa está bloqueada por Cloudflare.
- Turnos en vivo: scraping de `mifarmaciadeturno.cl` (JSON-LD con dirección, teléfono, coordenadas, horario) para `calama`, `la-serena` y `coquimbo`. Caché 2 h.
- Respaldo: calendario SEREMI para Calama; en La Serena se avisa que no hay datos en vivo.

## Comunidad
- Locales sugeridos y aprobados (`place_suggestions`, id `c/…`) se agregan al feed con etiqueta "Cumpitas".

## Heurísticas
- `is24h`: solo si `opening_hours = "24/7"`.
- `isServicentro`: regex sobre el nombre (Pronto, Copec, Upa!, Spacio 1, Aramco, Petrobras, Shell, Oxxo).

## Pendientes
- Radar Delivery (PedidosYa/Rappi) para validar apertura de botillerías.
- Precarga de turnos por cron en `places_cache`.
