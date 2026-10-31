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

## Identidad y experiencia de uso

Identidad nocturna y cercana, categorías compartidas, temas y paneles inferiores controlados para cuenta/ubicación/filtros. Los estados deben distinguir horario, confirmación y ausencia de información. La accesibilidad de los paneles y errores importa más que añadir efectos decorativos.

### Criterios verificables

- Estados vacíos, carga, confirmación y error distinguibles por texto además de color.
- Orden de foco, teclado y nombres accesibles cuando la plataforma los utilice.
- Legibilidad y controles suficientes para el dispositivo objetivo; considerar área segura y ciclo de vida en móvil.
- Evitar que animación, espera o respuesta tardía apliquen efectos ajenos a la selección vigente.

Comprueba estos criterios en los recorridos principales y en los tamaños de pantalla de la plataforma que vas a utilizar.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).

## Recursos de identidad y distribución

[Catálogo de originales y variantes](../branding/README.md) · [Manifest de identidad](../branding/manifest.json).

La cabecera utiliza el logotipo horizontal claro/oscuro; el onboarding conserva la mascota como marca secundaria. Manifest, favicon, Apple Touch y vista previa social utilizan los derivados preparados.

Los banners de presentación se seleccionan por tema en el README. Las aplicaciones incorporan sólo los recursos necesarios, con dimensiones/proporción estables; las variantes y originales permanecen en branding. La identidad visual no amplía funcionalidades ni cambia las condiciones de uso.
