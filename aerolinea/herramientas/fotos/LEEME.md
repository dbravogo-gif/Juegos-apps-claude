# Fotos de los aviones: cómo se hacen

Herramientas para buscar las fotos en Wikimedia Commons, cambiar el rótulo de la aerolínea por
su nombre en el juego y dejarlas en `img/aviones/`. Créditos de cada foto en `img/LEEME.md`.

Hace falta Python 3 con Pillow, numpy y `opencv-python-headless`, ImageMagick (`montage`, para
las láminas) y las fuentes Inter y Liberation en sus rutas de Debian/Ubuntu. Commons limita
mucho las descargas seguidas (error 429): los scripts esperan y reintentan solos.

## Cambiar el nombre de una aerolínea en una foto

Si se aprueba otro nombre para una compañía, su foto se rehace sin gastar créditos:

1. `python3 elegir.py --de-nuevo b737` vuelve a bajar el original (960 px) a `originales/`.
2. Cambia el texto en `rotulos/b737.json`; si el nombre nuevo es más largo, ajusta `ancho`.
3. `python3 renombrar.py originales/b737.jpg originales/b737-castellano.jpg rotulos/b737.json`
4. `python3 webp.py originales ../../img/aviones b737` recorta a 1,75:1 centrado en el avión y
   guarda el WebP de 900 px.

Para medir posiciones sobre la foto: `python3 rejilla.py foto.jpg zona.png x0 y0 x1 y1 4 10`
amplía la zona ×4 con una rejilla cada 10 px en coordenadas de la foto.

## El archivo de rótulos

- `borrar`: cajas `[x, y, ancho, alto, modo, opciones]`. El modo `tinta` borra solo las letras
  (los píxeles que se apartan del fondo o, con `color`, los que se parecen a la tinta) y las
  rellena con el algoritmo de Telea más el grano de la foto. Opciones: `umbral`, `dilatar`,
  `radio`, `pendiente` (caja inclinada para rótulos en perspectiva) y `proteger` (franjas
  pegadas a las letras que no deben usarse de relleno). Los modos `horizontal`, `arriba`,
  `abajo`, `mezcla` y `suave` rellenan la caja entera interpolando sus bordes.
- `textos`: `texto`, `x` e `y` (izquierda de la línea base), `alto` (altura de las mayúsculas),
  `color`, `fuente` (nombre corto o ruta), y opcionales `ancho` (encoge; con `estirar`, también
  ensancha), `espaciado`, `grosor`, `inclinacion` (cursiva), `giro` (grados), `desenfoque` y
  `sin_pintar` (zonas que quedan delante del rótulo).
- `girados`: para rótulos en diagonal (la cola del 737-300). Cada bloque endereza un recorte
  (`centro`, `radio`, `angulo`) y lleva sus propios `borrar` y `textos` con coordenadas del
  recorte enderezado; `python3 renombrar.py --enderezar foto.jpg recorte.png spec.json 0` lo
  guarda para medir.

## Elegir otra foto

`buscar.py` guarda candidatas por tipo en `candidatas.json` (consultas en `CONSULTAS`, filtros
de título en `FILTROS`), `laminas.py` monta una lámina por tipo en `laminas/` para elegir a la
vista y `elegir.py tipo:índice` baja la elegida y apunta autor y licencia en `elegidas.json`.
