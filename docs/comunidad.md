# Comunidad: reportes, tags y reputación

## Reportes "Último Cumpita"
- Estados: Abierto / Cerrado. Caducan a la **1 hora**.
- Límite: 1 reporte cada **10 min** por local y persona (cliente: `cumpita-last-${id}`; servidor: RLS/validación).
- Geofencing: solo si el GPS está a **≤300 m** del local.
- Se muestra "hace X min" y cantidad de cumpitas que confirmaron.

## Detección pasiva
Con GPS activo y precisión ≤60 m, permanecer **5 min a ≤40 m** de un local sin estado conocido genera un reporte "abierto". Se notifica al usuario con opción de corregir. Solo con la app abierta.

## Micro-tags
Definidos en `src/lib/tags.ts`, TTL **3 h**, límite 30 min por tag/local (`cumpita-tag-${id}-${tag}`):
`card_ok`, `cash_only`, `reja`, `fila`, `sin_fila`, `hielo`, `cigarros`, `promo`, cartulinas, fotocopias, pan, carbón.

## Puntos y ranking
Los puntos se derivan de reportes en el servidor. El ranking público expone solo apodo, puntos, conteo e `is_me`.

## Compartir
Mensajes de WhatsApp dinámicos según estado (abierto, cerrado, turno) con tags y enlace a `/local/:id`.
