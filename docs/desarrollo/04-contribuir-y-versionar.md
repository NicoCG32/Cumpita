# Contribuir y preparar versiones

Para que una mejora en Cumpita sea revisable, tiene que explicar qué recorrido cambia, de dónde salen los datos y qué ocurre en los casos límite. Conviene trabajar con contribuciones pequeñas y comprobables.

## Cómo he construido Cumpita

Desarrollo Cumpita mediante iteraciones en **Lovable**: planteo un cambio, reviso el resultado y ajusto lo necesario. Para cada contribución, describe el problema, el comportamiento esperado y cómo lo comprobaste.

## Convenciones de desarrollo

- Mantener `src/lib/categories.ts` como referencia de categorías de la interfaz, **pero sincronizar** toda nueva categoría con restricciones y migraciones SQL de propuestas.
- Cambiar etiquetas en `src/lib/tags.ts` y en `place_tags_tag_check` de manera coordinada.
- Usar `createServerFn` para lógica de servidor y revisar sus permisos cuando empleen `supabaseAdmin`.
- Tratar resultados externos como datos no confiables, con límites, fallbacks y procedencia.
- Mantener tokens visuales en `src/styles.css`; no introducir colores aislados por comodidad.
- No editar manualmente `src/routeTree.gen.ts` ni los archivos marcados como generados. Las migraciones existentes son la referencia del esquema; contrasta con ellas cualquier cambio de modelado.
- Conservar el `.env` con la configuración pública de Lovable. Guardar secretos en el hosting o en `.env.local`, y mantener credenciales privadas y volcados de datos reales fuera del repositorio.

## Comprobación previa a PR

```sh
bun install --frozen-lockfile
bun run lint
bunx tsc --noEmit
bun run test
bun run test:release
bun run build
```

Agrega pruebas de aceptación y rechazo. Para SQL/RLS y funciones privilegiadas, prueba también las llamadas directas al backend con distintos roles.

## Releases del código fuente

Cada versión usa un tag `vMAYOR.MENOR.PARCHE`, la misma versión sin prefijo en `package.json` y una sección en `CHANGELOG.md`. `scripts/release-notes.mjs` extrae las notas y `.github/workflows/release.yml` valida el tag, ejecuta pruebas y compila antes de publicar.

```sh
# Tras actualizar package.json y CHANGELOG.md y subir el commit a main:
bun run release:notes v1.0.1
git tag -a v1.0.1 -m "cumpita. v1.0.1"
git push origin v1.0.1
```

Sustituye `v1.0.1` por la versión que vayas a publicar. El workflow distribuye notas y código fuente; el despliegue web y el empaquetado móvil tienen procesos separados. Conserva los tags publicados y evita forzar pushes en la rama sincronizada con Lovable.

## Documentación como parte del cambio

Si se modifica una regla, actualizar la página que la describe y el diagrama correspondiente. Si algo depende de un proveedor, registrar qué ocurre cuando falla. Evitar repetir el mismo dato en cuatro capítulos: mantener una fuente documental y enlazar desde las demás.

[Instalación](01-entorno-y-despliegue.md) · [Arquitectura](../tecnica/01-arquitectura.md)
