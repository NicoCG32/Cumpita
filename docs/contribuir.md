# Contribuir

## Convenciones
- Lógica de servidor con `createServerFn`; webhooks/cron en `src/routes/api/public/*` verificando al llamador.
- Colores solo con tokens semánticos de `src/styles.css`.
- Categorías nuevas: agregarlas en `src/lib/categories.ts` (`CATEGORIES`, `osmCategory`) para que feed, mapa, sugerencias y ficha queden consistentes.
- Nunca editar archivos autogenerados (`routeTree.gen.ts`, `src/integrations/supabase/*`).
- No reescribir historial publicado de git (sin force push).

## Tests
```sh
bun run test
```
Los tests viven en `src/test/` y cubren reglas de negocio (modo madrugada, navegación, etc.).

## Flujo con Lovable
Los cambios hechos en Lovable se commitean al repositorio; los push a la rama principal vuelven a Lovable.
