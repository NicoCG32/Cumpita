# cumpita.

![Estado](https://img.shields.io/badge/estado-piloto-amber) ![PWA](https://img.shields.io/badge/PWA-instalable-green) ![Zonas](https://img.shields.io/badge/zonas-Calama%20%C2%B7%20La%20Serena%20%C2%B7%20Coquimbo-blue)

> **Saber qué está abierto cerca, de verdad, a cualquier hora de la noche.**

Publicada en https://cumpita.lovable.app

## Resumen ejecutivo
De noche, en ciudades intermedias de Chile, los horarios publicados no reflejan la realidad y la farmacia de turno cambia cada día. Las personas se desplazan a locales cerrados, con pérdida de tiempo y riesgo de seguridad. **cumpita.** es una PWA comunitaria que combina datos oficiales con confirmaciones recientes de vecinos ("cumpitas") para mostrar farmacias, botillerías, librerías/bazares y almacenes/minimarkets realmente abiertos, ordenados por distancia.

Dirigida a vecinos, trabajadores de turno, cuidadores en urgencias leves y comercios locales; con potencial para municipios y servicios de salud.

## Diferenciadores

| | Mapas generalistas | **cumpita.** |
| --- | --- | --- |
| Horarios | Estimados o desactualizados | Oficiales o "no informado": nunca inventados |
| Farmacia de turno | No siempre | Turno diario MINSAL / SEREMI en vivo |
| Verificación | Reseñas antiguas | Confirmación a ≤300 m con caducidad de 1 h |
| Uso nocturno | Genérico | Diseño, filtros y avisos pensados para la noche |
| Fallas de fuente | Sin respaldo | Caché persistente y refresco automático |

## Arquitectura en resumen
TanStack Start v1 (React 19, SSR) en edge · Tailwind CSS v4 · Lovable Cloud (PostgreSQL con RLS, Auth, Realtime) · OpenStreetMap/Overpass · Firebase Cloud Messaging.

```text
PWA ─► Server functions (edge) ─► Caché (memoria / BD) ─► OSM · Turnos · MINSAL
  ▲                                        │
  └──────── Realtime: reportes y tags ◄────┘     Cron horario: precarga y respaldo
```

## Flujo de la plataforma
1. Elegir ciudad o activar GPS (una sola vez).
2. Ver el feed de locales cercanos con su estado.
3. Filtrar o buscar por nombre, calle o producto.
4. Ir, compartir por WhatsApp o activar "voy en camino".
5. En el local, confirmar abierto/cerrado y sumar etiquetas.

## Qué obtiene el usuario
Un local abierto confirmado, la ruta para llegar, avisos si cierra mientras va y el turno de farmacias del día cada noche.

## Puesta en marcha rápida
```sh
bun install
bun run dev    # http://localhost:8080
bun run test
```

## Documentación
**→ [Índice y rutas de lectura en `docs/`](docs/README.md)**: perfiles para inversión, desarrollo y operación.

## Visión estratégica
El modelo "dato oficial incierto ↔ verificación humana reciente" se replica a nuevas ciudades del norte de Chile y a rubros como veterinarias de urgencia, vulcanizaciones y cerrajerías 24H. Ver [Escalabilidad y nuevos mercados](docs/15-escalabilidad-y-nuevos-mercados.md).

## Licencia
Privado. © cumpita.
