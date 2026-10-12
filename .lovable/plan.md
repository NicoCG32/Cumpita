# Plan: Anti-trolling GPS + Alertas + Reputación + PWA

Cuatro mejoras que convierten a cumpita. en una app instalable, confiable y con comunidad activa.

## 1. Anti-trolling por GPS (reportes verificados)

- El botón "Último Cumpita" (Está abierto / Está cerrado) solo se habilita si el GPS del usuario confirma que está a menos de **300 metros** del local.
- Si está más lejos, el botón aparece deshabilitado con el aviso "Acércate al local para reportar".
- Se mantiene el reporte pasivo automático (5 min parado cerca = abierto) ya implementado.
- Se conserva el throttling actual de 10 minutos por local por persona.

## 2. Alertas de apertura (notificaciones)

- Botón "Avisarme" en cada tarjeta de local: el usuario se suscribe a ese local.
- Nueva tabla `place_subscriptions` (place_id, user_id o token de dispositivo, created_at) con RLS y GRANTs.
- Cuando un cumpita reporta "abierto" fuera de horario oficial, se notifica a los suscritos de ese local.
- Canal: notificación in-app (toast + campana con historial) como primera versión. Push real (web push / FCM) queda como fase posterior si se desea, ya que requiere service worker de mensajería.

## 3. Reputación de cumpitas

- Nueva tabla `cumpita_points` (user_id, points, reports_count) o vista agregada sobre `place_reports`.
- Cada reporte confirmado suma puntos; se muestran insignias por nivel (ej. "Cumpita Novato", "Cumpita de Oro").
- Ranking semanal por ciudad visible en una sección "Top cumpitas" (apodo o iniciales, sin exponer correos).
- Requiere que el reporte esté asociado a usuario: los reportes anónimos siguen permitidos pero no suman puntos (incentivo a crearse cuenta).

## 4. PWA completa + offline

- Manifest (`public/manifest.webmanifest`) con nombre "cumpita.", íconos, theme-color y `display: standalone` para instalarla en la pantalla de inicio.
- Service worker con `vite-plugin-pwa` (generateSW, NetworkFirst para navegación, CacheFirst solo para assets hasheados), registrado solo en producción vía wrapper con guardas (nunca en preview/dev, kill-switch `?sw=off`).
- Offline: la app abre sin internet mostrando la última lista de locales cargada (caché de la última respuesta de `getNearbyPlaces` en localStorage), con aviso "Sin conexión: mostrando últimos datos".
- Nota: el modo offline solo funciona en la app publicada, no en la vista previa del editor.

## Detalles técnicos

- Migración única con `place_subscriptions` y `cumpita_points`: CREATE TABLE + GRANT (authenticated; service_role ALL) + RLS + policies en el mismo SQL.
- Roles siguen en `user_roles` con `has_role`; ninguna lógica de privilegios en cliente.
- Distancia GPS: reutilizar `distanceM` (Haversine) de `src/lib/places.ts` con umbral de 300 m.
- Server functions con `createServerFn`; suscripciones y puntos usan `requireSupabaseAuth` donde haga falta sesión.
- Service worker: `vite-plugin-pwa` con `devOptions.enabled: false`, `injectRegister: null`, `registerType: "autoUpdate"`, wrapper de registro único con guardas de preview.
- Verificación: `bunx tsgo --noEmit`, build OK y prueba con Playwright (viewport móvil 400x1800) del flujo de reporte cercano/lejano y del panel de puntos.

## Orden de construcción

1. Migración de tablas (suscripciones + puntos).
2. Anti-trolling GPS en la tarjeta.
3. Reputación y ranking.
4. Alertas in-app.
5. PWA (manifest + service worker + offline).
