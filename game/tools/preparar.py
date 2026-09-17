#!/usr/bin/env python3
"""Deja una hoja de poses lista para el juego.

Los generadores de imagen no respetan los tercios: una capa o la estela de un arma invade
el hueco de al lado, y recortar en tres partes iguales parte las figuras. Esto detecta cada
pose por separado, la recorta por su silueta y la recompone en una hoja de tercios exactos
con todas apoyadas en la misma línea de suelo.

    python3 tools/preparar.py entrada.jpg assets/enemigos/id.png            # hoja de 3 poses
    python3 tools/preparar.py entrada.jpg assets/muebles/id.png --poses 1   # objeto suelto
    python3 tools/preparar.py entrada.jpg assets/zonas/id.png --fondo       # escenario

Cuando la imagen llega con fondo verde en vez de transparente, lo quita y limpia el borde
verdoso que deja la compresión JPEG. Al guardar reduce la paleta: son ilustraciones de color
plano, así que apenas se nota y el archivo pasa de un megabyte a poco más de doscientos
kilobytes, que para una app que se guarda entera en el móvil es la diferencia entre caber y
no caber.
"""

import argparse
import sys

from PIL import Image

# En pantalla la figura no pasa de unos 180 píxeles de alto; incluso en pantallas de alta
# densidad esto va sobrado, y cada píxel de más es peso que la app tiene que guardar.
ALTO_POSE = 768
ANCHO_POSE = 384
MARGEN = 0.06  # aire alrededor de la figura, en proporción al alto de la pose


def quitar_verde(imagen):
    """Chroma key sobre verde, con despill del halo que deja el JPEG."""
    imagen = imagen.convert('RGBA')
    pixeles = imagen.load()
    ancho, alto = imagen.size

    for y in range(alto):
        for x in range(ancho):
            r, g, b, _ = pixeles[x, y]
            # Margen amplio: la compresión JPEG deja un halo verdoso alrededor de la figura
            # que, si se conserva, une unas poses con otras y hace imposible separarlas.
            if g > 60 and g - max(r, b) > 25:
                pixeles[x, y] = (0, 0, 0, 0)
            elif g > max(r, b):
                # Borde contaminado: baja el verde al nivel del canal vecino más alto.
                pixeles[x, y] = (r, max(r, b), b, 255)

    return imagen


def densidad_por_columna(imagen):
    ancho, alto = imagen.size
    alfa = imagen.getchannel('A').load()
    return [sum(1 for y in range(alto) if alfa[x, y] > 40) for x in range(ancho)]


def separar_figuras(imagen, poses):
    """Devuelve los tramos de cada pose.

    Lo normal sería buscar columnas vacías entre figuras, pero las capas y las armas suelen
    solaparse y no dejan ninguna. Así que el corte se hace por el punto de menos dibujo
    cerca de cada frontera teórica: si hay que partir algo, que sea lo mínimo posible.
    """
    densidad = densidad_por_columna(imagen)
    ancho = len(densidad)
    ventana = ancho // 14

    cortes = [0]
    for i in range(1, poses):
        frontera = ancho * i // poses
        desde = max(cortes[-1] + 1, frontera - ventana)
        hasta = min(ancho - 1, frontera + ventana)
        cortes.append(min(range(desde, hasta), key=lambda x: densidad[x]))
    cortes.append(ancho)

    return [(cortes[i], cortes[i + 1]) for i in range(poses)]


def limpiar_restos(trozo):
    """Borra los pedazos de la figura vecina que el corte arrastra consigo.

    Un fragmento pequeño que toca el borde lateral del recorte es casi siempre el arma o la
    capa de la pose de al lado. Uno que no toca ningún borde se respeta: puede ser parte del
    dibujo, como un arma que sale despedida.
    """
    ancho, alto = trozo.size
    alfa = trozo.getchannel('A').load()
    pertenece = [[False] * alto for _ in range(ancho)]
    islas = []

    for x0 in range(ancho):
        for y0 in range(alto):
            if pertenece[x0][y0] or alfa[x0, y0] <= 40:
                continue

            pila, isla, toca_lado = [(x0, y0)], [], False
            pertenece[x0][y0] = True
            while pila:
                x, y = pila.pop()
                isla.append((x, y))
                if x == 0 or x == ancho - 1:
                    toca_lado = True
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    vx, vy = x + dx, y + dy
                    if 0 <= vx < ancho and 0 <= vy < alto and not pertenece[vx][vy] and alfa[vx, vy] > 40:
                        pertenece[vx][vy] = True
                        pila.append((vx, vy))
            islas.append((isla, toca_lado))

    if not islas:
        return trozo

    mayor = max(len(isla) for isla, _ in islas)
    pixeles = trozo.load()
    for isla, toca_lado in islas:
        if toca_lado and len(isla) < mayor * 0.5:
            for x, y in isla:
                pixeles[x, y] = (0, 0, 0, 0)

    return trozo


def recortar(imagen, desde, hasta):
    trozo = limpiar_restos(imagen.crop((desde, 0, hasta, imagen.height)))
    caja = trozo.getbbox()
    return trozo.crop(caja) if caja else trozo


def componer(figuras):
    hoja = Image.new('RGBA', (ANCHO_POSE * len(figuras), ALTO_POSE), (0, 0, 0, 0))
    util = ALTO_POSE * (1 - MARGEN * 2)

    # Un único factor de escala para todas: si cada pose se ajustara por su cuenta, la más
    # pequeña se vería del mismo tamaño que la más grande y el personaje "crecería" al animar.
    escala = min(
        util / max(f.height for f in figuras),
        (ANCHO_POSE * 0.92) / max(f.width for f in figuras),
    )

    for i, figura in enumerate(figuras):
        ancho = max(1, round(figura.width * escala))
        alto = max(1, round(figura.height * escala))
        redimensionada = figura.resize((ancho, alto), Image.LANCZOS)

        x = i * ANCHO_POSE + (ANCHO_POSE - ancho) // 2
        y = round(ALTO_POSE * (1 - MARGEN)) - alto  # apoyadas en la misma línea de suelo
        hoja.paste(redimensionada, (x, y), redimensionada)

    return hoja


ANCHO_FONDO = 1280


def guardar(imagen, destino, colores):
    """Guarda con paleta reducida, conservando la transparencia si la hay."""
    if imagen.mode == 'RGBA':
        opacos = imagen.getchannel('A').point(lambda a: 255 if a > 128 else 0)
        reducida = imagen.convert('RGB').quantize(colors=colores, method=Image.FASTOCTREE)
        reducida = reducida.convert('RGBA')
        reducida.putalpha(opacos)
        reducida.save(destino, optimize=True)
    else:
        imagen.quantize(colors=colores, method=Image.MAXCOVERAGE).save(destino, optimize=True)


def preparar_fondo(entrada, salida):
    imagen = Image.open(entrada).convert('RGB')
    alto = round(imagen.height * ANCHO_FONDO / imagen.width)
    guardar(imagen.resize((ANCHO_FONDO, alto), Image.LANCZOS), salida, 256)
    print(f'{salida}: fondo {ANCHO_FONDO}×{alto}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('entrada')
    parser.add_argument('salida')
    parser.add_argument('--poses', type=int, default=3)
    parser.add_argument('--sin-croma', action='store_true', help='la imagen ya tiene alfa')
    parser.add_argument('--fondo', action='store_true', help='escenario: ni recorte ni alfa')
    args = parser.parse_args()

    if args.fondo:
        preparar_fondo(args.entrada, args.salida)
        return 0

    imagen = Image.open(args.entrada)
    imagen = imagen.convert('RGBA') if args.sin_croma else quitar_verde(imagen)

    grupos = separar_figuras(imagen, args.poses)
    figuras = [recortar(imagen, desde, hasta) for desde, hasta in grupos]
    guardar(componer(figuras), args.salida, 128)

    medidas = ' · '.join(f'{f.width}×{f.height}' for f in figuras)
    print(f'{args.salida}: {len(figuras)} poses ({medidas})')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
