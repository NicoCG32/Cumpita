# Contribuir y preparar versiones

Para que una mejora en Cumpita sea revisable, tiene que explicar qué recorrido cambia, de dónde salen los datos y qué ocurre en los casos límite. Conviene trabajar con contribuciones pequeñas y comprobables.

## Cómo he construido Cumpita

Este es un proyecto personal que desarrollo yo, sin otros integrantes. Mi forma de trabajo ha sido **iterar directamente en Lovable**: le planteo lo que quiero cambiar, observo el resultado y ajusto el siguiente paso. Lovable es la herramienta con la que construyo la aplicación; no es un segundo autor humano ni un integrante del proyecto.

La revisión de este repositorio permite describir su arquitectura actual, pero no demuestra por sí sola que haya aplicado una metodología formal, una batería completa de pruebas manuales o una secuencia determinada de prompts. No atribuyo esas actividades a mi proceso si no están documentadas.

## Convenciones de desarrollo

- Mantener `src/lib/categories.ts` como referencia de categorías de la interfaz, **pero sincronizar** toda nueva categoría con restricciones y migraciones SQL de propuestas.
- Cambiar etiquetas en `src/lib/tags.ts` y en `place_tags_tag_check` de manera coordinada.
- Usar `createServerFn` para lógica de servidor y revisar sus permisos cuando empleen `supabaseAdmin`.
- Tratar resultados externos como datos no confiables, con límites, fallbacks y procedencia.
- Mantener tokens visuales en `src/styles.css`; no introducir colores aislados por comodidad.
- No editar manualmente `src/routeTree.gen.ts` ni los archivos marcados como generados. `drizzle/schema.ts` está vacío en el ZIP: cualquier cambio al modelado debe contrastarse con las migraciones existentes, no asumirse como regenerable automáticamente.
- No incluir `.env`, tokens, credenciales ni volcado de datos reales en commits o ZIP de intercambio.

## Comprobación previa a PR

```sh
bun install --frozen-lockfile
bun run lint
bunx tsc --noEmit
bun run test
bun run test:release
bun run build
```

Agregar pruebas que ejerciten casos de aceptación y rechazo, especialmente en SQL/RLS o en funciones privilegiadas. Una prueba de interfaz por sí sola no demuestra que una restricción sea segura frente a llamadas directas.

## Releases del código fuente

La convención existente usa tags `vMAYOR.MENOR.PARCHE` y entradas correspondientes en `CHANGELOG.md`. `scripts/release-notes.mjs` genera las notas y `.github/workflows/release.yml` valida un tag antes de crear la release.

```sh
# Ejemplo para una próxima versión, tras actualizar package.json y CHANGELOG.md
bun run release:notes v1.0.1
git tag -a v1.0.1 -m "cumpita. v1.0.1"
git push origin v1.0.1
```

**Ejemplo, no una instrucción para publicar la versión ahora.** El workflow publica notas y archivos fuente en GitHub; el despliegue web y cualquier empaquetado móvil requieren un proceso separado. Evitar reescribir tags o forzar pushes en la rama sincronizada con Lovable.

## Documentación como parte del cambio

Si se modifica una regla, actualizar la página que la describe y el diagrama correspondiente. Si algo depende de un proveedor, registrar qué ocurre cuando falla. Evitar repetir el mismo dato en cuatro capítulos: mantener una fuente documental y enlazar desde las demás.

[Instalación](01-entorno-y-despliegue.md) · [Arquitectura](../tecnica/01-arquitectura.md)
