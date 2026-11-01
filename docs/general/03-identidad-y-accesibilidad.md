# Identidad y experiencia visual

Cumpita habla con cercanía, pero no necesita exagerar ni disfrazar una duda técnica. Quise que el nombre, el búho y los tonos cálidos se sintieran familiares, mientras los estados, fechas y permisos se explican de manera directa.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../branding/logos/cumpita-logo-horizontal-dark.svg" />
  <img src="../../branding/logos/cumpita-logo-horizontal.svg" alt="Logotipo horizontal de Cumpita" width="400" />
</picture>

## Recursos existentes

La identidad original está documentada en [`branding/README.md`](../../branding/README.md). En el repositorio ya existen logos claro/oscuro, isotipo, mascota, banners, portadas para redes e iconos PWA. No hace falta insertar todas las variantes en cada capítulo: usar la correcta para el contexto reduce ruido visual.

| Uso                     | Recurso                                                        |
| ----------------------- | -------------------------------------------------------------- |
| Portada del repositorio | `branding/banners/cumpita-banner-claro.svg` y variante oscura  |
| Cabeceras pequeñas      | `branding/logos/cumpita-logo-horizontal.svg` y variante oscura |
| App y navegador         | `public/icons/` y `public/favicon.png`                         |
| Compartir en redes      | `branding/portadas/` y `public/og.jpg`                         |
| Ilustración editorial   | `branding/banners/cumpita-banner-ilustrado-3D.webp`            |

## Decisiones de interfaz

- **Móvil primero:** navegación, feed y acciones próximas al dedo; mapa cargado bajo demanda.
- **Color con significado:** un estado abierto/cerrado no debe comunicarse solo con color; acompañarlo de texto y antigüedad.
- **Claridad de origen:** distinguir reporte comunitario, horario y turno.
- **Permisos explicados:** GPS y notificaciones se piden cuando sirven a una acción concreta; una negativa debe ofrecer una salida útil.
- **Carga y errores:** estados de espera, recarga y copia offline deben distinguirse.

## Accesibilidad: criterio y comprobación

El proyecto usa componentes Radix y estilos semánticos, pero eso **no demuestra cumplimiento WCAG** por sí solo. Para dar por cerrada esta área faltan comprobaciones de teclado, foco visible, contraste en temas claro/oscuro, etiquetas de controles, tamaño táctil y anuncios accesibles de estados dinámicos. La estructura del documento es una pauta de evaluación, no una certificación.

[Archivo de recursos](../../branding/README.md) · [Operación y pruebas](../desarrollo/02-operacion-calidad-y-seguridad.md)
