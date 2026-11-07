# Licencias y atribuciones · cumpita.

[← Desarrollo](../README.md) · [LICENSING.md](../../LICENSING.md) · [LICENSE](../../LICENSE) · [NOTICE](../../NOTICE)

## Qué autoriza el proyecto

La licencia del código propio que figura en el repositorio es **PolyForm Noncommercial 1.0.0**. Permite los fines descritos en su texto, pero no otorga autorización comercial general. Otros usos requieren un acuerdo separado con las personas que puedan concederlos. No se debe llamar a este régimen «código abierto sin restricciones».

El archivo `NOTICE` conserva actualmente los avisos `Required Notice:` del proyecto. **No es prueba de que todos los terceros estén inventariados.** Este capítulo registra fuentes y obligaciones identificadas, no cambia la licencia del código ni agrega licencias ficticias.

## Fuentes comprobadas en código

| Fuente o recurso                                | Para qué se usa                                           | Estado de atribución                                                                                                                                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OpenStreetMap**                               | Datos de lugares mediante Overpass y cartografía del mapa | OSM indica que sus datos están bajo **ODbL** y exige atribución; la URL oficial de derechos aparece ahora enlazada en la atribución del mapa                                                                                                                                          |
| **Leaflet**                                     | Motor del mapa en `src/components/MapView.tsx`            | El proyecto Leaflet publica su código bajo **BSD-2-Clause**; conservar los avisos requeridos si corresponden a la distribución                                                                                                                                                        |
| **Teselas OSM**                                 | `tile.openstreetmap.org` como proveedor de tiles          | Además de la licencia de datos, aplican políticas de uso del servidor de teselas; no asumir capacidad ilimitada                                                                                                                                                                       |
| **Servicio de rutas**                           | `routing.openstreetmap.de` para indicaciones              | Revisar condiciones de ese servicio antes de aumentar uso o prometer disponibilidad                                                                                                                                                                                                   |
| **Datos MINSAL embebidos**                      | `src/lib/minsal-data.ts`                                  | Procedencia identificable, pero **no se ha verificado aquí una autorización general de redistribución de la copia**                                                                                                                                                                   |
| **Turnos externos**                             | Lectura de JSON-LD desde `mifarmaciadeturno.cl`           | Revisar procedencia, actualización y condiciones del sitio; la consulta no es una API oficial garantizada                                                                                                                                                                             |
| **Google Places opcional**                      | Lugares alternativos si existe clave de proveedor         | Uso condicionado a configuración y términos del servicio; **no** se presume activo en todas las instalaciones                                                                                                                                                                         |
| **Firebase/conector Lovable**                   | Notificaciones optativas                                  | Requiere permisos y secretos de servidor; verificar avisos de paquetes y condiciones del conector                                                                                                                                                                                     |
| **Mascota del búho**                            | Identidad visual de Cumpita                               | **Origen confirmado por el responsable:** Lovable propuso la idea inicial y generó la primera versión; posteriormente el responsable dirigió la evolución del diseño y realizó modificaciones. Esta procedencia no determina por sí sola los derechos de explotación de cada versión. |
| **Otros recursos de `branding/` y la interfaz** | Logos, iconos, banners y otras ilustraciones              | **Proceso creativo confirmado por el responsable:** generados con herramientas de IA siguiendo su dirección e instrucciones detalladas. No se ha identificado una herramienta concreta para cada archivo ni verificado la totalidad de sus condiciones de reutilización               |

Referencias primarias: [OpenStreetMap, copyright y ODbL](https://www.openstreetmap.org/copyright) · [OSMF, pautas de atribución](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) · [Leaflet, licencia BSD-2-Clause](https://github.com/Leaflet/Leaflet/blob/main/LICENSE) · [PolyForm Noncommercial](https://polyformproject.org/licenses/noncommercial/1.0.0).

## Qué se corrigió y qué no

- El mapa pasa de un crédito de texto plano a **«© OpenStreetMap contributors» enlazado** con la información oficial de la licencia. Es un ajuste de presentación, no de lógica geográfica.
- No se alteran `LICENSE`, los avisos `Required Notice:` existentes, ni el régimen de uso del proyecto.
- La existencia de `package.json` o `bun.lock` permite conocer dependencias, pero **no sustituye** un inventario de avisos y licencias del conjunto efectivamente distribuido.
- No se ha verificado automáticamente el contenido de `.env`. Solo debe contener valores publicables; los secretos permanecen en el entorno servidor.

## Antes de declarar completo NOTICE

1. **Mascota:** registrar la generación inicial con Lovable y los cambios posteriores dirigidos y realizados por el responsable; revisar los términos aplicables de Lovable y cualquier recurso externo incorporado. **Otros gráficos:** ya se confirmó su generación con IA a partir de instrucciones y especificaciones detalladas del responsable; revisar, cuando sea necesario, el proveedor usado para cada recurso, sus términos y eventuales materiales de terceros.
2. Revisar dependencias efectivamente incluidas en el bundle y sus licencias/avisos; no copiar nombres ni licencias de una plantilla.
3. Comprobar atribución OSM en los distintos tamaños de pantalla y cuando el mapa se use con tecnologías de asistencia.
4. Confirmar términos de los proveedores de turnos, rutas y datos MINSAL, especialmente para publicación y almacenamiento en caché.
5. Registrar nuevas atribuciones solo cuando exista fuente verificable y obligación concreta.

## Criterio de esta etapa

Mantener el proyecto bajo **PolyForm Noncommercial 1.0.0** y completar gradualmente sus avisos externos con evidencia. No hay autorización para anunciar usos comerciales libres ni para reclamar como propios los datos aportados por proveedores o terceros.
