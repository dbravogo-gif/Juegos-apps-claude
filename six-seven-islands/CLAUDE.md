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
- `node ../herramientas/capturar.mjs <carpeta o url> --dispositivo escritorio --pasos "..."`

## Reglas propias

Las que surjan de errores observados (regla R6) o de decisiones del autor, cada una con la fecha
y el porqué.

- **2026-11-08 · Solo para ordenador y solo con teclado.** Lo decide el autor: él y sus amigos
  juegan en portátiles, algunos Mac. Dentro de esta carpeta manda sobre la convención «móvil
  primero» de la raíz:
  - pantalla apaisada;
  - nada de diseño táctil ni vertical;
  - **ninguna función necesita el ratón**, y la cámara no gira;
  - capturas con `--dispositivo escritorio` y pasos con `tecla:`.
  - Sigue sin hacer falta un mando.
