# Cumpita

Quiero desarrollar una aplicación web móvil (diseño enfocado en PWA móvil) para orientar al usuario sobre sus localizaciones más cercanas con una interfaz tipo feed/tarjetas más cómoda y directa que un mapa tradicional.

Categorías iniciales:
1. Farmacias
2. Botillerías / Licorerías

Funcionalidades clave:
- Detección de ubicación del usuario (con opción de simulación/búsqueda manual de zona).
- Listado ordenado por distancia mostrando: nombre, categoría, distancia calculada, calle/dirección, horario oficial, calificación.
- Diferencial 'Último Cumpita': sistema comunitario donde los usuarios que se acerquen al local puedan presionar un botón simple para reportar/confirmar si el local está realmente abierto o cerrado fuera de su horario oficial, mostrando hace cuánto tiempo se confirmó (ej. 'Confirmado abierto hace 15 min por 2 cumpitas') y caducidad del estado.
- Filtros rápidos en la parte superior: 'Todas', 'Abiertas ahora', 'Confirmadas por cumpitas', y selector de categoría (Botillerías / Farmacias).
- Diseño limpio, intuitivo y optimizado para uso rápido desde el celular.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cumpita.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35900500-b605-40f4-80c7-d9c7b8e6dee3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
