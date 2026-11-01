<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/banners/cumpita-banner-oscuro.svg" />
  <img src="branding/banners/cumpita-banner-claro.svg" alt="Cumpita: identidad visual del proyecto" width="100%" />
</picture>

# cumpita.

**Antes de salir, averigua si vale la pena el pique.**

Una web instalable para encontrar comercios cercanos y contrastar sus horarios con lo que otros acaban de observar.

[Probar la web](https://cumpita.lovable.app) · [Explorar la documentación](docs/README.md) · [Entender la arquitectura](docs/tecnica/01-arquitectura.md) · [Licencia](LICENSING.md)

</div>

## Resumen ejecutivo

Cumpita es una web instalable (PWA) que ayuda a encontrar comercios cercanos y decidir si vale la pena salir a comprar. Combina horarios publicados, farmacias de turno y reportes comunitarios de abierto o cerrado, con aportes sin necesidad de crear una cuenta. Su objetivo es reducir viajes innecesarios y facilitar la colaboración local. Está en fase piloto; la información depende de las fuentes disponibles y de la antigüedad de cada reporte.

## De dónde salió

Cumpita nació de algo que me comentó mi padre: a veces uno sale a comprar y recién al llegar descubre que el negocio está cerrado. Quise hacer una herramienta que respondiera una pregunta simple —**¿hay algo abierto cerca, ahora?**— sin fingir que los horarios publicados siempre están correctos.

La aplicación combina datos de lugares, horarios cuando están disponibles, farmacias de turno y reportes comunitarios recientes. Cada señal tiene sus límites: un horario publicado puede estar desactualizado y un reporte representa lo que alguien observó en un momento, no una garantía.

**Cumpita es un proyecto personal e independiente.** Lo desarrollo yo, iterando directamente con **Lovable**: planteo cambios, reviso el resultado y vuelvo a ajustar lo necesario. La conversación con mi padre dio origen al problema; el desarrollo no corresponde a un trabajo universitario ni a un curso.

Quiero que aportar sea tan sencillo como consultar: **se puede reportar un local sin crear una cuenta**, siguiendo la idea de participación rápida de aplicaciones comunitarias como Waze. No confundo esa facilidad con una garantía de veracidad; limitar el abuso sin obligar al registro sigue siendo un desafío técnico que debo atender.

## Qué hay en este repositorio

| Disponible en el código                                       | Límite que conviene conocer                                                                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Sitio React instalable como PWA, con feed, filtros y mapa     | La consulta requiere servicios de servidor; el modo sin conexión depende de datos guardados previamente                          |
| Búsqueda textual, favoritos y fichas compartibles             | La búsqueda con IA tiene módulos de código, pero **no está activada en la interfaz**                                             |
| Reportes anónimos de abierto/cerrado y etiquetas comunitarias | No se exige cuenta para reportar; la proximidad se comprueba en el cliente y el límite SQL de frecuencia no cubre a los anónimos |
| Propuestas y panel de revisión                                | Algunas categorías y etiquetas de la interfaz no coinciden todavía con restricciones SQL                                         |
| Notificaciones y tareas de actualización                      | Requieren permisos, credenciales, ejecución de cron y pruebas en el despliegue real                                              |

**Estado de entrega:** piloto web/PWA. Este repositorio no incluye un proyecto Android ni un flujo de generación de APK en los archivos revisados. Las releases del repositorio publican código fuente y notas, no un instalador Android.

## Tecnologías que realmente utiliza

**React 19 + TypeScript + TanStack Start** para interfaz y funciones de servidor; **Tailwind CSS 4** para los estilos; **Supabase/PostgreSQL** para autenticación, reportes, propuestas y persistencia; **Leaflet/OpenStreetMap** para el mapa; datos de **Overpass**, **MINSAL**, turnos obtenidos desde una fuente externa y, de forma opcional, **Google Places**. Las notificaciones web utilizan **Firebase Cloud Messaging** a través de un conector.

No hace falta conocer toda la infraestructura para usar la aplicación. Para entender la implementación, dejé los detalles y diagramas separados en el área técnica.

## Empezar

Con los servicios y variables configurados según la [guía de desarrollo](docs/desarrollo/01-entorno-y-despliegue.md):

```sh
bun install --frozen-lockfile
bun run dev
```

Los controles locales habituales son `bun run test`, `bun run lint`, `bunx tsc --noEmit` y `bun run build`. **No compartas archivos `.env` con credenciales reales.**

## Leer la documentación

- **[General](docs/general/01-origen-y-alcance.md):** por qué hice Cumpita, qué puede hacer una persona y qué significa su información.
- **[Técnica](docs/tecnica/01-arquitectura.md):** arquitectura, diagramas, datos, reglas, integraciones y límites de seguridad.
- **[Desarrollo](docs/desarrollo/01-entorno-y-despliegue.md):** ponerlo en marcha, operarlo, probarlo y decidir cómo continuar.

El [índice](docs/README.md) ofrece rutas más concretas. La [auditoría documental](docs/AUDITORIA.md) explica qué corregí y qué sigue pendiente en el código.

## Autoría

Desarrollo y decisiones del proyecto: **Pablo Guzmán**. Herramienta principal utilizada para construirlo mediante iteraciones: **Lovable**. No hubo otros integrantes en el desarrollo.

## Identidad y condiciones de uso

Los recursos gráficos están en [`branding/`](branding/README.md); los banners claro y oscuro se adaptan a GitHub sin cargar ambos al mismo tiempo. El código se distribuye con las condiciones descritas en [LICENSE](LICENSE), [LICENSING.md](LICENSING.md) y [NOTICE](NOTICE). Lee esos archivos antes de reutilizarlo o redistribuirlo.
