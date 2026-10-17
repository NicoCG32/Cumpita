# UX / UI

## Identidad
- Mascota: búho nocturno de ojos verde neón (`src/assets/cumpita-owl.png`, favicon).
- Tema oscuro: azul noche profundo; primario ámbar; verde lima para "Abierto". Automático de 20:00 a 07:00 o según el sistema; se puede cambiar en "Mi cumpita".
- Tono: compañero de barrio, cercano y chileno.

## Pantalla principal
- Debe estar despejada: no repetir acceso, GPS ni elecciones del onboarding.
- Header compacto (logo, avisos, "Mi cumpita"), "Cambiar ubicación", tabs de categoría, lupa y botón de filtros.
- Cuenta, ubicación y filtros avanzados en bottom sheets.
- Hero de intención rápida: 💊 Farmacia de turno · 🍻 Botillería abierta.
- Cintillo "Pulso cumpita" con las últimas confirmaciones.
- Tarjetas con franja lateral de color por estado y acciones secundarias en "···".
- Barra inferior: Locales · Mapa · Favoritos · Ranking.

## Onboarding
3 pasos: ciudad/GPS, pacto cumpita (≤300 m), apodo aleatorio editable.

## PWA
Manifest + service worker para uso offline básico; banner de instalación (Android `beforeinstallprompt`, instrucciones iOS), se oculta 7 días al cerrarlo.
