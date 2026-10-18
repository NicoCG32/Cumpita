# Versiones y GitHub Releases

El workflow [Release](../.github/workflows/release.yml) publica un GitHub Release al subir un tag `v*`. Lovable sigue gestionando la publicación de la aplicación; crear un release en GitHub no despliega la web.

## Convención

- Versionado semántico: `vMAYOR.MENOR.PARCHE` (p. ej. `v1.0.0`).
- Cada versión se registra en [`CHANGELOG.md`](../CHANGELOG.md).
- `package.json` debe declarar la misma versión, sin el prefijo `v`.
- El flujo admite versiones estables; no admite tags de prerelease.

## Preparar una versión

1. Actualiza `version` en `package.json` y agrega una sección `## [MAYOR.MENOR.PARCHE] — fecha` con los cambios en `CHANGELOG.md`.
2. Instala las dependencias con Bun 1.4.3: `bun install --frozen-lockfile`.
3. Ejecuta `bun run test:release`, `bun run test` y `bun run build`.
4. Revisa las notas con `bun run release:notes v1.0.0` (sustituye el tag en próximas versiones).
5. Guarda los cambios en un commit y súbelos a la rama sincronizada `main`.

## Publicar el release

Con el workflow y la versión ya presentes en `main`:

```sh
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "cumpita. v1.0.0"
git push origin v1.0.0
```

En GitHub → **Actions → Release**, el workflow valida el tag y las notas, instala desde `bun.lock`, ejecuta los tests y compila. Solo después crea el release con las notas de esa versión y lo marca como el último lanzamiento. GitHub incluye los archivos de código fuente; no se adjunta un build con configuración del entorno.

Usa el `GITHUB_TOKEN` automático, con permiso de lectura durante las validaciones y `contents: write` únicamente en el job de publicación. No requiere un token personal ni secretos del backend. GitHub Actions debe estar habilitado en el repositorio.

## Si falla

- Revisa el primer paso fallido en **Actions → Release**.
- Para un error transitorio, usa **Re-run failed jobs**.
- Si hay que corregir código, registra una nueva versión y sube un tag nuevo. No muevas un tag publicado.
- Si el release ya existe, la creación falla para evitar reemplazar sus notas.

No hagas force push ni reescribas historial en la rama sincronizada: rompe la sincronización con Lovable. Para publicar la web, sigue [Despliegue en producción](despliegue.md).
