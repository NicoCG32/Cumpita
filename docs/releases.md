# Versiones y GitHub Releases

Lovable sincroniza el código con GitHub, pero **no crea releases**: se hacen desde GitHub una vez conectado el repositorio.

## Convención
- Versionado semántico: `vMAYOR.MENOR.PARCHE` (p. ej. `v1.0.0`).
- Cada versión se registra en [`CHANGELOG.md`](../CHANGELOG.md).

## Crear un release (web)
1. En GitHub: *Releases → Draft a new release*.
2. *Choose a tag* → escribe `v1.0.0` → *Create new tag on publish* (rama sincronizada, normalmente `main`).
3. Título `v1.0.0 — Lanzamiento Calama y La Serena` y pega la sección del CHANGELOG.
4. *Publish release*.

## Crear un release (CLI)
```sh
git pull
git tag v1.0.0 && git push origin v1.0.0
gh release create v1.0.0 --title "v1.0.0" --notes-file CHANGELOG.md
```

No hagas force push ni reescribas historial en la rama sincronizada: rompe la sincronización con Lovable.

## Opcional: release automático
Un workflow `.github/workflows/release.yml` puede crear el release al empujar un tag `v*` (con `softprops/action-gh-release`). Se puede agregar cuando el repositorio esté conectado.
