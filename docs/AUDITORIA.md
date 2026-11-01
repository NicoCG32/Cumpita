# Auditoría documental · 1 de noviembre de 2026

## Qué revisé

Contrasté los Markdown originales con `package.json`, las rutas y módulos de `src/`, el catálogo de `branding/`, los archivos de configuración, los workflows de GitHub y las migraciones SQL `0000`–`0013`. Esta auditoría corresponde al **contenido del ZIP recibido**: no sustituye una prueba contra la base y la aplicación pública.

## Qué cambié en la documentación

- Organicé los capítulos en **general, técnica y desarrollo** y descarté una sección académica independiente sin contenido propio.
- Integré los capítulos repetidos de origen, motivación, funcionalidad y UX. Eliminé el capítulo genérico de exportación, porque la app no tiene un subsistema de informes o exportación que justifique uno propio.
- Retiré los precios de referencia CLP/USD del cuerpo principal; los rangos anteriores no estaban acompañados de una metodología verificable y pueden hacer que una hipótesis parezca una tarifa confirmada.
- Sustituí esquemas ASCII redundantes por Mermaid con diagramas de **contexto, contenedores, componentes, despliegue, dominio, entidades físicas, flujo de usuario, secuencias, precedencia de señales, degradación y estados**.
- Diferencié **implementado**, **condicionado por configuración** y **pendiente de verificación**.
- Mantuve la motivación en primera persona y reduje declaraciones grandilocuentes como «los horarios de internet mienten» cuando podrían confundirse con garantías técnicas.
- Incorporé las aclaraciones explícitas del autor sobre **desarrollo individual con Lovable**, carácter personal y **participación anónima intencional**; eliminé las preguntas que ya quedaron resueltas.

## Hallazgos con respaldo en el repositorio

| Prioridad | Hallazgo                                                                                                                | Evidencia                                                                                        | Recomendación                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alta**  | La regla de 300 m se aplica desde el navegador, no como una prueba de ubicación en el servidor.                         | `src/routes/index.tsx` (`canReport`, `report`); `drizzle/migrations/0006_security_hardening.sql` | Evitar lenguaje de garantía antifraude; diseñar defensa de abuso independiente del GPS declarado.                                                   |
| **Alta**  | El trigger limita reportes repetidos solo si `user_id` no es nulo; los anónimos escapan a ese caso.                     | Migración `0006`, función `throttle_place_report`                                                | **Mantener los reportes sin cuenta por decisión del autor**; añadir medidas de límite y detección de abuso en backend compatibles con el anonimato. |
| **Alta**  | La UI expone 12 microetiquetas, pero `place_tags_tag_check` admite 8.                                                   | `src/lib/tags.ts`; migración `0008`                                                              | Crear nueva migración para soportar las etiquetas deseadas o retirar las opciones no disponibles.                                                   |
| **Alta**  | La UI permite sugerir cinco categorías; `place_suggestions.category` admite solo `farmacia` y `botilleria`.             | `src/components/SuggestPlace.tsx`; migración `0008`                                              | Sincronizar `CHECK` con `src/lib/categories.ts` y probar altas.                                                                                     |
| **Alta**  | El ZIP original contiene `.env`; el `.gitignore` entregado no excluye ese nombre.                                       | Entrada `.env` en ZIP; `.gitignore`                                                              | No redistribuirlo; revisar si hay secretos reales, exposición e historial, y rotar claves si procede.                                               |
| **Media** | La documentación anterior indicaba Vite 7, pero `package.json` declara Vite 8.1.5.                                      | `package.json`; antiguo `docs/01-arquitectura-general.md`                                        | Corregido: usar «Vite» en la descripción general y versión real al instalar.                                                                        |
| **Media** | La IA de búsqueda está presente en módulos, pero su función no se invoca en el flujo visible.                           | `src/lib/ai-search.*`; `src/routes/index.tsx` (`void runAi`, `askAi`)                            | Documentarla como código inactivo, no como producto activo.                                                                                         |
| **Media** | Los endpoints de cron existen, pero no se prueba una programación activa ni que «23:00 UTC = 20:00 Chile» todo el año.  | `src/routes/api/public/cron/*`; ausencia de scheduler en configuración fuente revisada           | Verificar programación en la plataforma y considerar horario de verano.                                                                             |
| **Media** | Google Places puede ser la fuente primaria si se configura su API key, aunque no se mencionaba en varias descripciones. | `src/lib/places.functions.ts` (`fetchFresh`, `fromGoogle`)                                       | Integración opcional documentada y separada de OpenStreetMap.                                                                                       |
| **Media** | El backend usa clave `SUPABASE_SERVICE_ROLE_KEY`, pero faltaba en la tabla de instalación.                              | `src/integrations/supabase/client.server.ts`; antiguo `docs/09-instalacion-y-despliegue.md`      | Añadida como **exclusivamente servidor**; mantener fuera de Git.                                                                                    |
| **Media** | Algunas promesas de PWA offline o push eran demasiado categóricas.                                                      | `src/lib/push-client.ts`, `src/routes/index.tsx`, `vite.config.ts`                               | Describir condiciones de permisos, datos previos y testing real.                                                                                    |
| **Media** | El panel `/revision` comprueba rol en cliente y depende de RLS para autorización efectiva.                              | `src/routes/revision.tsx`; migraciones de `user_roles` y propuestas                              | No presentarlo como un control de acceso servidor independiente.                                                                                    |
| **Media** | La prioridad de apertura y los turnos se representan mediante señales diferentes.                                       | `src/routes/index.tsx` (`cumpa`, `official`, `turno`, `effectiveOpen`)                           | Documentar señales y antigüedad sin simplificarlas como un estado oficial único.                                                                    |
| **Baja**  | Varios documentos repetían los mismos párrafos y tenían numeración duplicada (`06`, `08`).                              | Antiguo directorio `docs/`                                                                       | Reorganización temática y enlaces internos únicos.                                                                                                  |
| **Baja**  | Un calendario de turnos y una heurística horaria están codificados; requieren mantenimiento de fuente.                  | `src/lib/turnos.ts`, `src/lib/botillerias.ts`                                                    | Presentar como respaldo/heurística, no certificación legal o dato vivo.                                                                             |

## Qué no afirmo haber comprobado

- La disponibilidad real de `https://cumpita.lovable.app`, la configuración del hosting o los cron programados.
- La aplicación de todas las migraciones y políticas en la instancia Supabase de producción.
- Que una notificación push llegue efectivamente a Android, iOS o segundo plano.
- Que la cobertura de farmacias y locales esté completa o validada presencialmente.
- Que todas las rutas y el conjunto de tests pasen en el entorno real: la revisión es estática.

## Limpieza de documentación incidental

El antiguo `src/routes/README.md` enumeraba rutas de ejemplo (`/about`, `/users`, `/posts`) que **no existen** en Cumpita. Se reemplazó por un listado de las rutas reales, incluyendo las dos operaciones de cron. También se corrigió una mención de un archivo ICO inexistente en el catálogo de recursos visuales.

En `src/routes/__root.tsx`, los metadatos `author` y `twitter:site` todavía apuntan a Lovable. **La autoría humana ya está confirmada: Pablo Guzmán es el único desarrollador.** Esta entrega solo ajusta documentación; convendría revisar por separado esos metadatos en el código, respetando que Lovable fue la herramienta de construcción y no el autor humano.

## Alcance de la segunda revisión

Se comprobaron las rutas y dependencias, el código de `Onboarding`, `SuggestPlace`, `index.tsx`, las tareas de cron y los SQL que definen las restricciones de reportes y etiquetas. También se verificó por SHA-256 que los **32 recursos gráficos** del ZIP adicional tienen una copia idéntica en `branding/`, de modo que no se añadieron duplicados.

Se retiraron expresiones que atribuían preferencias o razones técnicas al autor sin una declaración explícita. La documentación de arquitectura describe **para qué se usa** una tecnología en este código, no **por qué se decidió seleccionarla** si el motivo no consta en las fuentes.

No se ejecutaron pruebas de integración, renderizado en GitHub o validación de las credenciales/servicios reales. Los diagramas son representaciones de los archivos revisados, no resultados de pruebas de despliegue.

## Antecedentes confirmados por el autor

- **Origen y carácter del proyecto:** Cumpita es una iniciativa personal e independiente, motivada inicialmente por una conversación sobre el problema con su padre; no pertenece a una universidad o curso.
- **Autoría y equipo:** Pablo Guzmán es el único desarrollador; no hubo otros integrantes.
- **Herramienta y proceso:** su trabajo ha consistido principalmente en iterar directamente con Lovable. No se atribuyen a terceros decisiones, roles o metodologías que no hayan sido indicadas.
- **Reportes sin cuenta:** es una decisión deliberada y permanente de la experiencia buscada, inspirada en la agilidad comunitaria de Waze. **No se propone eliminarla para resolver los problemas de seguridad.**

## Cuestiones todavía abiertas

1. **Categorías y etiquetas:** ¿deben habilitarse las cinco categorías y las doce etiquetas que aparecen en la interfaz? Las restricciones SQL todavía no acompañan por completo ese alcance.
2. **Estimaciones económicas:** los valores anteriores no estaban acompañados por un modelo o cotizaciones verificables y siguen fuera del README público.

Estas dudas no impiden documentar el código tal como existe; solo condicionan decisiones futuras de producto e implementación.

Las observaciones de seguridad son **hallazgos de revisión estática**, no un informe de explotación o prueba de penetración. Los cambios incluidos en este paquete afectan documentación y presentación: no reescriben las reglas SQL ni las funciones de la aplicación.

[Índice](README.md) · [Seguridad y pruebas](desarrollo/02-operacion-calidad-y-seguridad.md)
