# 07 · Diseño, UI y accesibilidad

## Identidad
- **Mascota:** búho nocturno de ojos verde neón (`src/assets/cumpita-owl.png`, favicon).
- **Tono:** compañero de barrio, cercano y chileno.
- **Nombre:** `cumpita.` en minúscula con punto final.

## Sistema de diseño
- Colores, sombras y degradados solo como **tokens semánticos** en `src/styles.css`; nada de colores fijos en componentes.
- Tema oscuro azul noche, primario ámbar, verde lima para "Abierto". Se activa de 20:00 a 07:00 o según el sistema, y puede cambiarse en "Mi cumpita".
- Componentes base shadcn en `src/components/ui` (Sheet y Button compartidos para todos los bottom sheets).

## Pantalla principal
- Despejada: no repite elecciones del onboarding.
- Header compacto (logo, avisos, "Mi cumpita"), "Cambiar ubicación", pestañas de categoría, lupa y filtros.
- Cintillo **"Pulso cumpita"** con las últimas confirmaciones.
- Tarjetas con franja lateral de color por estado.

## Carga y feedback
- **Skeletons** con la misma forma que la tarjeta final, para que la página no salte.
- Aviso de carga lenta con botón **Actualizar** a los 8 s.
- Vibración al llegar a un local en "voy en camino".

## Accesibilidad
- Bottom sheets con cierre accesible (teclado, gesto y botón).
- Objetivos táctiles amplios y diseño **mobile-first**, usable con el pulgar.
- Estados comunicados por texto además del color ("Abierto hace 4 min").

## PWA
- `public/manifest.webmanifest` con íconos 192/512 y `display: standalone`.
- Service worker con modo offline básico; `?sw=off` lo desregistra.
- Banner de instalación (`InstallBanner.tsx`): botón en Android, instrucciones en iOS; se oculta 7 días al cerrarlo.
