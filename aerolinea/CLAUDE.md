# App viación (carpeta aerolinea/)

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
- `src/data/`: aeropuertos, países, aviones, motores, catálogo de averías, aerolíneas rivales
  y acontecimientos históricos.
- `src/ui/`: globo, paneles, hoja de despacho, escenas, noticiario y pestaña Mundo.
- `img/`: imágenes en WebP. Qué sale y cuándo, en `src/data/imagenes.js`; de dónde salen
  (fotos de Wikimedia o generadas con IA), en `img/LEEME.md`.
- `herramientas/fotos/`: buscar fotos en Commons y cambiar el rótulo de la aerolínea por su
  nombre en el juego. Si se aprueba otro nombre, su foto se rehace con el `LEEME.md` de ahí.
- `src/ui/marcas.js`: las colas de las aerolíneas, con los colores de la real en la que se
  inspira cada una y un logo parecido.
- Mercado y competencia (v3): `mercado.js` reparte el pasaje, `competencia.js` mueve a las
  rivales una vez al mes, `mundo.js` publica las noticias y `reputacion.js` lleva la
  reputación. Las rivales con `propuesta: true` tienen el nombre pendiente de aprobar.

## Comprobar

- `npm test` dentro de `aerolinea/`.
- `npm run calibrar` después de tocar el riesgo, el mantenimiento o las averías.
- Para ver la interfaz, sirve la carpeta con `python3 -m http.server` y ábrela con un
  viewport de móvil.
