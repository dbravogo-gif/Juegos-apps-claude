# Beep Run Club

App web instalable para el club de running Beep: el entrenador escribe el plan de cada atleta
y el atleta lo hace y lo valora. Stack: HTML y JS en módulos sin build, y Firebase.

## Antes de tocar nada

- Lee `ESTADO.md`, `DISENO.md` (las decisiones cerradas y las abiertas) y `ARCHITECTURE.md`.
- Para lo visual, lee `ARTE.md`: solo los colores y las fuentes de la marca.
- Es la app de un cliente del autor: nada de datos personales reales en el repositorio.

## Comprobar

- `npm test`
- `npm run flujos`: los flujos del atleta en el navegador.
- En `pruebas-reglas/`: `npm test` (reglas con el emulador) y `npm run e2e` (la app contra los
  emuladores). Necesitan `npm install` en esa carpeta, Java y firebase-tools.
- `node ../herramientas/capturar.mjs beep-run-club --consulta "?hoy=2026-11-19"`. `?hoy=` fija la
  fecha para que las capturas se puedan comparar.

## Reglas propias

- (2026-11-19) **Los hijos de un elemento se añaden con `h()` o `agregar()`, nunca con
  `append()` directo.** El `append` nativo escribe «null» en pantalla, y pasó dos veces.
  Barrera: `npm run flujos` falla si una pantalla muestra «null» o «undefined».
