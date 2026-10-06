# Pista libre (carpeta aerolinea/)

Simulador de aerolínea para móvil desde 1976. Web sin paso de build: módulos ES, Canvas con
d3-geo y `node --test`.

## Antes de tocar nada

- Lee `CRITERIOS.md`. Son las reglas del autor y mandan sobre cualquier otra idea de diseño.
- Lee `DISENO.md` para el estado actual y las decisiones cerradas.

## Reglas que más se olvidan

- **Datos de aviones y motores**: no inventar cifras precisas. Cada dato importante lleva
  fuente o la marca `aprox` en `src/data/`. Las fuentes se anotan en `FUENTES.md`.
- **Nada de barras 0–100 ni porcentajes de riesgo exactos delante del jugador.** Por dentro
  se puede calcular lo que haga falta; en pantalla, estados cualitativos, horas, ciclos y
  fechas.
- **Las averías siguen fases**: indicio → anomalía → confirmado. Las inspecciones son fiables
  por umbrales, no por dados.
- **Los accidentes son raros** y nacen de una combinación de factores que la investigación
  pueda contar.
- Cada mecánica nueva tiene que generar una decisión interesante; si no, se simplifica.

## Estructura

- `src/core/`: motor puro y determinista con semilla, sin DOM. Todo lo que tenga lógica va
  aquí y lleva pruebas en `tests/`.
- `src/data/`: aeropuertos, aviones, motores y catálogo de averías.
- `src/ui/`: globo, paneles, hoja de despacho, escenas y noticiario.

## Comprobar

- `npm test` dentro de `aerolinea/`.
- Para ver la interfaz, sirve la carpeta con `python3 -m http.server` y ábrela con un
  viewport de móvil.
