# 02 · Catálogo funcional

## Categorías
Definidas en una sola fuente, `src/lib/categories.ts` (`CATEGORIES`, `osmCategory`): **Farmacias**, **Botillerías/Licorerías**, **Librerías & Bazares**, **Almacenes & Minimarkets**. Feed, mapa, sugerencias y ficha las leen desde ahí.

## Módulos

| Módulo | Descripción | Reglas y casos borde |
| --- | --- | --- |
| **Ubicación** | GPS o selector de zonas de Calama, La Serena y Coquimbo (`ZONES` en `src/lib/places.ts`) | GPS denegado → selector manual; el cambio vive en un bottom sheet |
| **Feed por proximidad** | Tarjetas con nombre, categoría, distancia, dirección, horario y estado | Sin horario → "Horario no informado"; nunca se inventan datos |
| **Último Cumpita** | Reporte abierto/cerrado con "hace X min" y número de confirmaciones | ≤300 m del local, 1 reporte cada 10 min por local, caduca a la hora |
| **Detección pasiva** | 5 min a ≤40 m de un local sin estado (precisión ≤60 m) genera "abierto" | Se avisa y se puede corregir; solo con la app abierta |
| **Micro-tags** | Tarjeta OK, solo efectivo, reja, fila, hielo, pan, carbón, fotocopias… (`src/lib/tags.ts`) | TTL 3 h; 1 tag cada 30 min por local |
| **Filtros** | Todas · Abiertas ahora · Confirmadas por cumpitas · categoría · 24H | 24H solo si la fuente declara `24/7` |
| **Buscador directo** | Filtro instantáneo por nombre, calle, ciudad o etiqueta | Sin IA ni costo; Enter solo cierra el teclado |
| **Farmacias de turno** | Turno oficial del día destacado | Fuente caída → respaldo SEREMI (Calama) o aviso honesto |
| **Mapa** | Leaflet con marcadores por estado y ruta OSRM (`MapView.tsx`) | Se carga solo en el navegador |
| **Ficha compartible** | `/local/:id` con OpenGraph y mensaje de WhatsApp según estado | Local oculto o inexistente → página de no encontrado |
| **Favoritos** | Guardados en el dispositivo (`src/lib/favorites.ts`) | No requieren cuenta |
| **Ranking** | Puntos derivados de reportes en servidor | Expone solo apodo, puntos y conteo |
| **Sugerir local** | Formulario con detección de duplicados (`SuggestPlace.tsx`) | Nombre similar ≤400 m o mismo tipo ≤40 m → advertencia |
| **Proponer horario** | Propuesta revisada por admin (`ProposeHours.tsx`) | No se publica sin aprobación |
| **Voy en camino** | Push si alguien reporta "cerrado" mientras vas | Vigencia 45 min; al llegar a ≤40 m pide confirmar |
| **Aviso diario de turnos** | Push diario con las farmacias de turno de tu ciudad | Solo en la app publicada con permisos |
| **Modo madrugada** | Tema y prioridades nocturnas de 20:00 a 07:00 | Cubierto por `src/test/night.test.ts` |

## Comportamiento ante fallas
- **Sin conexión:** la PWA abre con los últimos datos y muestra "Sin conexión".
- **Fuentes externas caídas:** se sirve la última copia válida de `places_cache`.
- **Carga lenta:** a los 8 s aparece "La conexión está tardando más de lo habitual" con **Actualizar**.
