# Documentación · cumpita.

> Una pregunta cotidiana merece una respuesta comprensible, incluso cuando la información no es perfecta.

Esta documentación se lee en **tres áreas**: la idea y la experiencia, su funcionamiento técnico y el trabajo necesario para mantenerla. No incluyo un área educativa independiente porque su autor confirmó que **Cumpita es un proyecto personal**, ajeno a cursos o encargos universitarios.

| Área           | Qué responde                                       | Documentos                                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**    | ¿Para qué existe, qué resuelve y cómo se usa?      | [Origen y alcance](general/01-origen-y-alcance.md) · [Experiencia de uso](general/02-experiencia-de-uso.md) · [Identidad](general/03-identidad-y-accesibilidad.md)                                                                                                                                         |
| **Técnica**    | ¿Cómo funciona y de dónde sale cada dato?          | [Arquitectura](tecnica/01-arquitectura.md) · [Dominio y base de datos](tecnica/02-dominio-y-datos.md) · [Reglas y estados](tecnica/03-reglas-y-flujos.md) · [Integraciones](tecnica/04-integraciones-y-resiliencia.md)                                                                                     |
| **Desarrollo** | ¿Cómo lo ejecuto, mantengo, verifico y evoluciono? | [Entorno y despliegue](desarrollo/01-entorno-y-despliegue.md) · [Operación y seguridad](desarrollo/02-operacion-calidad-y-seguridad.md) · [Evolución](desarrollo/03-evolucion.md) · [Contribuciones y releases](desarrollo/04-contribuir-y-versionar.md) · [Mapa de rutas](desarrollo/05-mapa-de-rutas.md) |

## Rutas recomendadas

**Para conocer la idea:** [origen](general/01-origen-y-alcance.md) → [uso real](general/02-experiencia-de-uso.md) → [evolución](desarrollo/03-evolucion.md).

**Para revisar la ingeniería:** [arquitectura](tecnica/01-arquitectura.md) → [dominio](tecnica/02-dominio-y-datos.md) → [reglas](tecnica/03-reglas-y-flujos.md) → [integraciones](tecnica/04-integraciones-y-resiliencia.md).

**Para conocer el método de desarrollo:** [origen y autoría](general/01-origen-y-alcance.md) → [cómo itero con Lovable](desarrollo/04-contribuir-y-versionar.md).

**Para empezar a colaborar:** [instalación](desarrollo/01-entorno-y-despliegue.md) → [calidad y seguridad](desarrollo/02-operacion-calidad-y-seguridad.md) → [convenciones](desarrollo/04-contribuir-y-versionar.md).

## Cómo leer los diagramas

Los diagramas están escritos en **Mermaid** para que GitHub pueda representarlos y sea posible editarlos desde Markdown. Los agrupé junto a las decisiones que explican, en vez de repetir el mismo dibujo en cada documento: contexto, contenedores, componentes, despliegue, secuencias, entidades y estados.

- **Implementado:** comportamiento visible en el código que recibí.
- **Condicionado:** depende de configuración, servicios, permisos o entorno.
- **Pendiente:** todavía no existe o tiene inconsistencias sin resolver.

Estos términos no equivalen a una certificación de funcionamiento en producción. El alcance y las observaciones concretas están en la [auditoría](AUDITORIA.md).

[Volver al README principal](../README.md)
