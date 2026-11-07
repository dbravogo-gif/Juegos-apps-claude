# Estado

Actualizado: 2026-11-07. Solo el presente; el historial está en git. Máximo 40 líneas.

**Modo de gasto vigente: normal.**

## Foco

Crear desde cero un juego 3D original para navegador, con buenos gráficos y que sea
interesante. Móvil primero y sin invertir dinero. Los proyectos antiguos del repositorio no
sirven de referencia.

## Hecho

- **Investigación:** los mejores usos de Claude, juegos 3D, arte sin artistas, reglas y coste.
  Está en `investigacion/00-sintesis.md` y los archivos 01 a 09.
- **Método de trabajo:**
  - Reglas y modos en `CLAUDE.md`.
  - La guía del autor en `COMO-TRABAJAMOS.md`.
  - Skills, el agente `probador` y el hook de pruebas.

## Siguiente paso

1. Proponer 3 conceptos de juego que cumplan los 8 criterios de
   `investigacion/07-arte-y-concepto.md`. El autor elige uno.
2. `/nuevo-proyecto` con el concepto elegido: entrevista, documentos y escena representativa.

## Pendiente del autor

- **Fusionar esta rama en `main`.** Sin eso, las sesiones nuevas no ven este método.
- **Datos que necesito:**
  - El modelo de móvil y la versión de iOS (o Android), para saber si hay WebGPU.
  - El plan de Claude (Pro o Max), que cambia cuánto se puede paralelizar.
  - Cuánto tiempo a la semana puede jugar y probar.
