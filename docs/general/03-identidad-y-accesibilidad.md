# Identidad y experiencia visual

El nombre, el búho y los tonos cálidos buscan una identidad cercana. Los estados, fechas y permisos se explican con mensajes breves y directos.

La **idea inicial y la primera generación visual del búho** surgieron con Lovable. A partir de esa propuesta fui orientando su estilo y realizando modificaciones para adaptarlo a Cumpita. Los demás logotipos, banners, iconos e ilustraciones fueron creados con **IA siguiendo mis especificaciones detalladas y mi dirección creativa**. Los créditos distinguen este proceso de una realización completamente manual y no presentan a las herramientas como integrantes humanos del proyecto.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../branding/logos/cumpita-logo-horizontal-dark.svg" />
  <img src="../../branding/logos/cumpita-logo-horizontal.svg" alt="Logotipo horizontal de Cumpita" width="400" />
</picture>

## Recursos existentes

El [catálogo de identidad](../../branding/README.md) reúne logos claros y oscuros, isotipo, mascota, banners, portadas para redes e iconos PWA. Conserva las proporciones y elige la variante que corresponda al fondo y tamaño de uso.

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

El proyecto usa componentes Radix y estilos semánticos. La validación de accesibilidad debe cubrir navegación por teclado, foco visible, contraste en temas claro y oscuro, etiquetas de controles, tamaño táctil y anuncios accesibles de los cambios de estado.

[Archivo de recursos](../../branding/README.md) · [Operación y pruebas](../desarrollo/02-operacion-calidad-y-seguridad.md)
