# Origen del núcleo

Por indicación del autor (2026-11-07), de Leyendas de Iberia solo se toman **reglas de juego**,
nunca contenido: ni historia, ni mapas, ni criaturas, ni movimientos, ni objetos con nombre. El
código del núcleo es nuevo, salvo el generador con semilla.

| Archivo | De Leyendas | Qué es propio |
| --- | --- | --- |
| `rng.ts` | Copiado (commit `ff0fff2`) | `bifurcar()` |
| `modelo.ts` | Las 6 estadísticas y la forma de los datos | Objetivos de movimiento (`uno`, `rivales`, `propio`), evoluciones ramificadas, sin pasivas, sexo ni cólera |
| `estadisticas.ts` | Valía de 1 a 14, campana, temperamento y fórmulas | `tirarValiaCasiPerfecta()` |
| `danio.ts` | Fórmula de daño, crítico, afinidad y quemadura | Un solo punto de enganche (`extra`) en lugar de pasivas cosidas |
| `captura.ts` | Fórmula de captura | La calidad del lanzamiento con el dedo (×0,75 a ×1,25) |
| `progreso.ts` | Curva de experiencia y aprendizaje por nivel | Evoluciones ramificadas y `evolucionar()` |
| `criatura.ts` | Crear y curar | Objetos fuera de combate |
| `tipos.ts` | Las dos funciones de eficacia | — |

Los datos: la tabla de tipos (`src/data/tipos.ts`) es la de Leyendas por decisión del autor, y
una prueba la compara. Los temperamentos (`src/data/temperamentos.ts`) tienen nombres nuevos.
