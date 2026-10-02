#!/usr/bin/env python3
"""Deja una hoja de poses lista para el juego.

Los generadores de imagen no respetan los tercios: una capa o la estela de un arma invade
el hueco de al lado, y recortar en tres partes iguales parte las figuras. Esto detecta cada
pose por separado, la recorta por su silueta y la recompone en una hoja de tercios exactos
con todas apoyadas en la misma línea de suelo.

    python3 tools/preparar.py --auto                                        # todo lo pendiente
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
from pathlib import Path

from PIL import Image, ImageDraw

# En pantalla la figura no pasa de unos 180 píxeles de alto; incluso en pantallas de alta
# densidad esto va sobrado, y cada píxel de más es peso que la app tiene que guardar.
ALTO_POSE = 768
ANCHO_POSE = 512  # 2:3; con 1:2 la espada de un ataque obligaba a encoger toda la hoja
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


def quitar_magenta(imagen):
    """Chroma key sobre magenta, para lo que no puede ir sobre verde: las plantas.

    El verde no vale para ellas porque su quitado también desatura cualquier tono verdoso
    del dibujo, y un árbol se quedaría con las hojas grises. El magenta casi no aparece en
    lo que se dibuja aquí, así que el borde rosado que deja el suavizado se puede borrar sin
    miedo a comerse nada.
    """
    imagen = imagen.convert('RGBA')
    pixeles = imagen.load()
    ancho, alto = imagen.size

    for y in range(alto):
        for x in range(ancho):
            r, g, b, _ = pixeles[x, y]
            if r - g > 40 and b - g > 40:
                pixeles[x, y] = (0, 0, 0, 0)

    return imagen


def quitar_croma(imagen, fondo):
    return quitar_magenta(imagen) if fondo == 'magenta' else quitar_verde(imagen)


def quitar_damero(imagen):
    """Borra el tablero de cuadros gris claro que algunos visores pintan como si fuera
    transparencia. Se rellena desde los bordes, no por color: así los blancos del interior
    de la figura (una túnica, un escudo claro) se conservan aunque sean casi del mismo tono.
    """
    imagen = imagen.convert('RGB')
    marca = (255, 0, 255)
    ancho, alto = imagen.size

    for punto in [(0, 0), (ancho - 1, 0), (0, alto - 1), (ancho - 1, alto - 1)]:
        ImageDraw.floodfill(imagen, punto, marca, thresh=60)

    imagen = imagen.convert('RGBA')
    pixeles = imagen.load()
    for y in range(alto):
        for x in range(ancho):
            r, g, b, _ = pixeles[x, y]
            gris_neutro = max(r, g, b) - min(r, g, b) <= 5 and min(r, g, b) >= 228
            # Además del relleno, caen las líneas de separación de los cuadros: gris neutro
            # y muy claro. Los blancos de la figura tiran a crema y no son neutros.
            if (r, g, b) == marca or gris_neutro:
                pixeles[x, y] = (0, 0, 0, 0)

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


def separar_objetos(imagen, cuantos):
    """Como separar_figuras, pero para objetos sueltos, que sí dejan aire entre ellos.

    Los objetos de una tanda no miden lo mismo (un diván es el triple de ancho que un
    ánfora), así que la frontera teórica puede caer dentro de uno. Se corta por el centro
    de los huecos vacíos más anchos; si no hay suficientes, se vuelve al método de poses.
    """
    densidad = densidad_por_columna(imagen)
    huecos, inicio = [], None
    for x, d in enumerate(densidad + [1]):
        if d == 0 and inicio is None:
            inicio = x
        elif d and inicio is not None:
            if inicio > 0 and x < len(densidad):  # los márgenes exteriores no separan nada
                huecos.append((x - inicio, (inicio + x) // 2))
            inicio = None

    if len(huecos) < cuantos - 1:
        return separar_figuras(imagen, cuantos)

    cortes = sorted(centro for _, centro in sorted(huecos, reverse=True)[:cuantos - 1])
    cortes = [0] + cortes + [len(densidad)]
    return [(cortes[i], cortes[i + 1]) for i in range(cuantos)]


def limpiar_restos(trozo):
    """Borra los pedazos de la figura vecina que el corte arrastra consigo.

    Un fragmento pequeño que toca el borde lateral del recorte es casi siempre el arma o la
    capa de la pose de al lado. Uno que no toca ningún borde se respeta: puede ser parte del
    dibujo, como un arma que sale despedida.

    Tocar el borde no basta para condenarlo, porque un objeto propio puede rozarlo con la
    punta: el bastón del Coleccionista no llega a tocarle la mano, así que es una pieza
    suelta, y su contera roza el corte. Lo que arrastra el corte desde la pose vecina se
    reconoce porque se pega al corte en buena parte de su altura, o porque es una tira
    estrecha que apenas entra en el recorte.
    """
    ancho, alto = trozo.size
    alfa = trozo.getchannel('A').load()
    pertenece = [[False] * alto for _ in range(ancho)]
    islas = []

    for x0 in range(ancho):
        for y0 in range(alto):
            if pertenece[x0][y0] or alfa[x0, y0] <= 40:
                continue

            pila, isla, contacto = [(x0, y0)], [], 0
            pertenece[x0][y0] = True
            while pila:
                x, y = pila.pop()
                isla.append((x, y))
                if x == 0 or x == ancho - 1:
                    contacto += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    vx, vy = x + dx, y + dy
                    if 0 <= vx < ancho and 0 <= vy < alto and not pertenece[vx][vy] and alfa[vx, vy] > 40:
                        pertenece[vx][vy] = True
                        pila.append((vx, vy))
            islas.append((isla, contacto))

    if not islas:
        return trozo

    mayor = max(len(isla) for isla, _ in islas)
    pixeles = trozo.load()
    for isla, contacto in islas:
        xs = [x for x, _ in isla]
        ys = [y for _, y in isla]
        alto_isla = max(ys) - min(ys) + 1
        pegado_al_corte = contacto >= alto_isla * 0.15
        tira_estrecha = (max(xs) - min(xs) + 1) < ancho * 0.12

        # Se va lo que el corte arrastra de la pose vecina, y también las motas sueltas que
        # deja el recorte del fondo: si no, inflan el recuadro y descuadran la alineación.
        resto_del_vecino = contacto and len(isla) < mayor * 0.5 and (pegado_al_corte or tira_estrecha)
        mota = len(isla) < mayor * 0.004
        if resto_del_vecino or mota:
            for x, y in isla:
                pixeles[x, y] = (0, 0, 0, 0)

    return trozo


def figuras_por_islas(imagen, poses):
    """Separa las poses por piezas conectadas en vez de por columnas.

    Un corte vertical amputa lo que asoma al tercio vecino: la espada de un ataque suele
    entrar en el hueco de la pose de al lado, y el corte se la llevaba. Cada pieza va
    entera a la pose donde cae su centro de masa, así que una espada unida a la mano se
    queda con su dueño. Si dos figuras se tocan forman una sola pieza enorme y esto no
    sirve: entonces devuelve None y se corta por columnas como antes.
    """
    ancho, alto = imagen.size
    alfa = imagen.getchannel('A').tobytes()
    etiqueta = [0] * (ancho * alto)
    islas = []  # (píxeles, suma de x, x mínima, x máxima)

    for inicio in range(ancho * alto):
        if etiqueta[inicio] or alfa[inicio] <= 40:
            continue
        num = len(islas) + 1
        etiqueta[inicio] = num
        pila, cuenta, suma_x, x_min, x_max = [inicio], 0, 0, ancho, 0
        while pila:
            i = pila.pop()
            x = i % ancho
            cuenta += 1
            suma_x += x
            x_min, x_max = min(x_min, x), max(x_max, x)
            for v in (i - 1 if x else -1, i + 1 if x < ancho - 1 else -1, i - ancho, i + ancho):
                if 0 <= v < ancho * alto and not etiqueta[v] and alfa[v] > 40:
                    etiqueta[v] = num
                    pila.append(v)
        islas.append((cuenta, suma_x, x_min, x_max))

    if not islas:
        return None
    mayor = max(cuenta for cuenta, *_ in islas)
    if any(x_max - x_min > ancho * 0.6 for cuenta, _, x_min, x_max in islas if cuenta == mayor):
        return None

    duena = [None]  # la etiqueta 0 es el fondo
    tiene_cuerpo = [False] * poses
    for cuenta, suma_x, _, _ in islas:
        pose = min(poses - 1, int(suma_x / cuenta * poses / ancho))
        if cuenta < mayor * 0.004:
            duena.append(None)  # mota suelta del recorte del fondo
            continue
        duena.append(pose)
        tiene_cuerpo[pose] |= cuenta > mayor * 0.3
    if not all(tiene_cuerpo):
        return None

    origen = imagen.load()
    lienzos = [Image.new('RGBA', imagen.size, (0, 0, 0, 0)) for _ in range(poses)]
    destinos = [lienzo.load() for lienzo in lienzos]
    for i, num in enumerate(etiqueta):
        if num and duena[num] is not None:
            x, y = i % ancho, i // ancho
            destinos[duena[num]][x, y] = origen[x, y]
    return [lienzo.crop(lienzo.getbbox()) for lienzo in lienzos]


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


LADO_OBJETO = 512

# Las alfombras salen pintadas en vertical, pero en la escena se tumban sobre el suelo: de
# pie se verían como una franja estrecha. Se guardan apaisadas.
APAISADOS = ('mub_estera', 'mub_alfombra', 'mub_alfombra_seda')


def preparar_objetos(entrada, salidas, fondo):
    """Varios objetos sueltos en una misma imagen, cada uno a su propio archivo cuadrado."""
    imagen = Image.open(entrada)
    imagen = quitar_croma(imagen, fondo) if fondo in ('verde', 'magenta') else imagen.convert('RGBA')
    grupos = separar_objetos(imagen, len(salidas))

    for (desde, hasta), salida in zip(grupos, salidas):
        figura = recortar(imagen, desde, hasta)
        if Path(salida).stem in APAISADOS and figura.height > figura.width:
            figura = figura.rotate(90, expand=True)
        escala = min(LADO_OBJETO * 0.88 / figura.width, LADO_OBJETO * 0.88 / figura.height)
        ancho, alto = round(figura.width * escala), round(figura.height * escala)

        lienzo = Image.new('RGBA', (LADO_OBJETO, LADO_OBJETO), (0, 0, 0, 0))
        redimensionada = figura.resize((ancho, alto), Image.LANCZOS)
        # Apoyados abajo, no centrados: un mueble tiene que descansar sobre el suelo.
        lienzo.paste(redimensionada, ((LADO_OBJETO - ancho) // 2, round(LADO_OBJETO * 0.94) - alto), redimensionada)
        guardar(lienzo, salida, 128)
        print(f'{salida}: objeto {ancho}×{alto}')


def preparar_fondo(entrada, salida):
    imagen = Image.open(entrada).convert('RGB')
    alto = round(imagen.height * ANCHO_FONDO / imagen.width)
    guardar(imagen.resize((ANCHO_FONDO, alto), Image.LANCZOS), salida, 256)
    print(f'{salida}: fondo {ANCHO_FONDO}×{alto}')


# Qué hacer con cada carpeta de `assets/originales/`. El nombre del archivo es el id de
# destino; varios ids separados por `+` cuando la imagen trae varias piezas juntas.
MODO_POR_CARPETA = {
    'personaje': 'hoja',
    'enemigos': 'hoja',
    'zonas': 'fondo',
    'espacios': 'fondo',
    'muebles': 'objetos',
    'equipo': 'objetos',
    'mascotas': 'objetos',
    'habilidades': 'objetos',
}

ORIGINALES = Path('assets/originales')


def detectar_fondo(entrada):
    """Verde o magenta de croma, tablero de cuadros o transparencia de verdad."""
    imagen = Image.open(entrada)
    if imagen.mode in ('RGBA', 'LA') and imagen.convert('RGBA').getchannel('A').getextrema()[0] < 250:
        return 'alfa'

    muestra = imagen.convert('RGB')
    r, g, b = muestra.getpixel((2, 2))
    if g > 90 and g - max(r, b) > 25:
        return 'verde'
    if r - g > 60 and b - g > 60:
        return 'magenta'
    return 'damero'


def procesar_pendientes():
    """Convierte todo lo que haya en `assets/originales/` y lo deja en su sitio."""
    if not ORIGINALES.is_dir():
        print(f'No existe {ORIGINALES}. Crea la carpeta y mete ahí las imágenes sin procesar.')
        return 1

    hechos = 0
    for entrada in sorted(ORIGINALES.rglob('*')):
        if entrada.is_dir() or entrada.suffix.lower() not in ('.png', '.jpg', '.jpeg'):
            continue

        carpeta = entrada.parent.name
        modo = MODO_POR_CARPETA.get(carpeta)
        if not modo:
            print(f'{entrada}: no sé qué hacer con la carpeta "{carpeta}"')
            continue

        ids = entrada.stem.split('+')
        destinos = [f'assets/{carpeta}/{id_}.png' for id_ in ids]
        Path(f'assets/{carpeta}').mkdir(parents=True, exist_ok=True)
        fondo = detectar_fondo(entrada)

        if modo == 'fondo':
            preparar_fondo(entrada, destinos[0])
        elif modo == 'objetos':
            preparar_objetos(entrada, destinos, fondo)
        else:
            imagen = Image.open(entrada)
            if fondo in ('verde', 'magenta'):
                imagen = quitar_croma(imagen, fondo)
            elif fondo == 'damero':
                imagen = quitar_damero(imagen)
            else:
                imagen = imagen.convert('RGBA')

            figuras = figuras_por_islas(imagen, 3) or [
                recortar(imagen, a, b) for a, b in separar_figuras(imagen, 3)]
            guardar(componer(figuras), destinos[0], 128)
            print(f'{destinos[0]}: 3 poses (fondo {fondo})')

        hechos += 1

    print(f'\n{hechos} imágenes procesadas.' if hechos else '\nNada pendiente.')
    return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('entrada', nargs='?')
    parser.add_argument('salida', nargs='*', help='una ruta, o varias con --objetos')
    parser.add_argument('--poses', type=int, default=3)
    parser.add_argument('--sin-croma', action='store_true', help='la imagen ya tiene alfa')
    parser.add_argument('--damero', action='store_true', help='el fondo es el tablero de cuadros')
    parser.add_argument('--fondo', action='store_true', help='escenario: ni recorte ni alfa')
    parser.add_argument('--objetos', action='store_true', help='varios objetos sueltos en una imagen')
    parser.add_argument('--auto', action='store_true', help='procesa assets/originales/ entera')
    args = parser.parse_args()

    if args.auto:
        return procesar_pendientes()

    if args.fondo:
        preparar_fondo(args.entrada, args.salida[0])
        return 0

    if args.objetos:
        fondo = 'alfa' if args.sin_croma else 'damero' if args.damero else detectar_fondo(args.entrada)
        preparar_objetos(args.entrada, args.salida, fondo)
        return 0

    imagen = Image.open(args.entrada)
    if args.damero:
        imagen = quitar_damero(imagen)
    elif args.sin_croma:
        imagen = imagen.convert('RGBA')
    else:
        imagen = quitar_verde(imagen)

    figuras = figuras_por_islas(imagen, args.poses) or [
        recortar(imagen, desde, hasta) for desde, hasta in separar_figuras(imagen, args.poses)]
    guardar(componer(figuras), args.salida[0], 128)

    medidas = ' · '.join(f'{f.width}×{f.height}' for f in figuras)
    print(f'{args.salida[0]}: {len(figuras)} poses ({medidas})')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
