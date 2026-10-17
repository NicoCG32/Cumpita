# Arquitectura

## Stack
- **TanStack Start v1** (React 19, SSR, server functions) sobre Vite 7, desplegado en edge (Cloudflare Workers).
- **Tailwind CSS v4** con tokens semánticos en `src/styles.css`; componentes shadcn en `src/components/ui`.
- **Lovable Cloud** (Postgres + Auth + Realtime) para reportes, tags, roles, caché y suscripciones.
- **Leaflet + OpenStreetMap** para el mapa, **OSRM** para rutas.
- **Firebase Cloud Messaging** (vía gateway de conectores) para push.

## Estructura

```text
src/
  routes/
    __root.tsx            Layout raíz, head, Toaster
    index.tsx             Feed principal, filtros, mapa, ranking, favoritos
    local.$.tsx           Ficha individual compartible /local/:id
    revision.tsx          Panel admin
    api/public/cron/turnos.ts  Cron diario de aviso de turnos
  lib/
    places.ts             Tipos Place/Category, ZONES, is24h, isServicentro, norm
    categories.ts         CATEGORIES y mapeo osmCategory (fuente única)
    places.functions.ts   getNearbyPlaces, getPlaceById, communityPlaces, allPlaces
    turnos.ts / turnos-live.ts / minsal-data.ts   Farmacias oficiales y turnos
    botillerias.ts        Curaduría de botillerías
    tags.ts               Micro-tags comunitarios y TTL
    favorites.ts          Favoritos en localStorage
    push.functions.ts / push-client.ts   Suscripciones push
    pwa-register.ts       Service worker
  components/
    MapView.tsx, Onboarding.tsx, InstallBanner.tsx, SuggestPlace.tsx, ProposeHours.tsx
drizzle/migrations/       Historial SQL del esquema
```

## Flujo de datos
1. El usuario elige zona (wizard o GPS) → `getNearbyPlaces(lat,lng)`.
2. El servidor combina OSM (Overpass con mirrors) + MINSAL + turnos en vivo + locales comunitarios aprobados, quita los ocultos y ordena por distancia.
3. El cliente suscribe Realtime a `place_reports` y `place_tags` para estados en vivo.
4. Los reportes pasan validación de distancia (≤300 m) y límites de frecuencia.

## Buscador
Filtro instantáneo local por nombre, calle, ciudad y etiqueta (sin IA, sin costo). El módulo `ai-search.*` permanece en el código pero no se usa en la interfaz.
