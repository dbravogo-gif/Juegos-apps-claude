# Six-seven islands

Juego de criaturas en 3D: explorar un archipiélago, capturar y combatir por turnos, y más
adelante jugar con amigos. Stack: Vite + TypeScript + Three.js (WebGPU con vuelta a WebGL2) +
Vitest.

## Antes de tocar nada

- Lee `ESTADO.md`, `DISENO.md` (las decisiones cerradas y las abiertas) y `ARCHITECTURE.md`.
- Para lo visual, lee `ARTE.md` y la skill `juego-3d`.
- **Vocabulario:** una especie es una línea evolutiva entera; una criatura es cada forma.
- El núcleo viene copiado de `leyendas-de-iberia/src/core/`. Leyendas de Iberia no se toca
  desde aquí.

## Comprobar

- `npm test`
- `npm run build`
- `node ../herramientas/capturar.mjs <carpeta o url> --pasos "..."`

## Reglas propias

Las que surjan de errores observados (regla R6), cada una con la fecha y el porqué.
