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

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica / producto.

## Identidad y experiencia de uso

Revisión documental: 2026-10-29. Base `5c8c4528312e` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Piloto web/PWA con referencias remotas actualizadas; distribución APK es un objetivo confirmado y no se acredita por la release actual de fuentes/notas.

Identidad nocturna y cercana, categorías compartidas, temas y paneles inferiores controlados para cuenta/ubicación/filtros. Los estados deben distinguir horario, confirmación y ausencia de información. La accesibilidad de los paneles y errores importa más que añadir efectos decorativos.

### Criterios verificables

- Estados vacíos, carga, confirmación y error distinguibles por texto además de color.
- Orden de foco, teclado y nombres accesibles cuando la plataforma los utilice.
- Legibilidad y controles suficientes para el dispositivo objetivo; considerar área segura y ciclo de vida en móvil.
- Evitar que animación, espera o respuesta tardía apliquen efectos ajenos a la selección vigente.

Son criterios de revisión, no certificaciones de accesibilidad ya obtenidas. La aceptación se registra por resolución/plataforma y recorrido; no se extrapola desde una captura aislada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
