#!/usr/bin/env python3
"""
Tileset propio de Leyendas de Iberia, con el aspecto de los juegos de criaturas de GBA: tiles de
16 × 16, contornos oscuros de color y la luz desde arriba a la izquierda. Todo se dibuja aquí, sin
recursos de terceros, para poder publicarlo en el repositorio.

Uso:
    python3 arte/mapa/tileset.py              escribe src/assets/mundo/iberia.png y .json
    python3 arte/mapa/tileset.py --muestra D  además guarda en D una lámina ampliada

Piezas:
- Tiles sueltos de 16 × 16 y objetos más grandes (árboles, columnas…), con su nombre en el JSON.
- Materiales que se juntan con sus vecinos (caminos, agua, alfombras): cinco tiles de referencia
  (`lleno`, `esquina`, `horizontal`, `vertical`, `interior`). El juego compone cada casilla con
  cuatro cuartos de 8 × 8 elegidos según sus vecinos, como los autotiles de RPG Maker.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image

PX = 16
RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / 'src' / 'assets' / 'mundo'

Color = tuple


def rgb(r: int, g: int, b: int, a: int = 255) -> Color:
    return (r, g, b, a)


def mezcla(c1: Color, c2: Color, t: float) -> Color:
    return tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)


def azar(x: int, y: int, s: int = 0) -> float:
    """Número fijo entre 0 y 1 por posición: el mismo dibujo cada vez que se genera."""
    h = (x * 374761393 + y * 668265263 + s * 982451653) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFF) / 65536


class Lienzo:
    def __init__(self, w: int = PX, h: int = PX, fondo: Color | None = None):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), fondo or (0, 0, 0, 0))
        self.p = self.im.load()

    def dentro(self, x: int, y: int) -> bool:
        return 0 <= x < self.w and 0 <= y < self.h

    def pon(self, x: int, y: int, c: Color | None) -> None:
        if c is not None and self.dentro(x, y):
            self.p[x, y] = c

    def lee(self, x: int, y: int) -> Color:
        return self.p[x, y] if self.dentro(x, y) else (0, 0, 0, 0)

    def opaco(self, x: int, y: int) -> bool:
        return self.lee(x, y)[3] > 0

    def rect(self, x: int, y: int, w: int, h: int, c: Color) -> None:
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.pon(i, j, c)

    def dibujo(self, x: int, y: int, filas: list[str], paleta: dict[str, Color]) -> None:
        for j, fila in enumerate(filas):
            for i, ch in enumerate(fila):
                if ch in paleta:
                    self.pon(x + i, y + j, paleta[ch])

    def pega(self, otro: 'Lienzo', x: int = 0, y: int = 0) -> None:
        capa = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        capa.paste(otro.im, (x, y))
        self.im.alpha_composite(capa)

    def contorno(self, c: Color, diagonales: bool = False) -> None:
        """Pinta con `c` los píxeles vacíos que tocan algo opaco."""
        vec = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        if diagonales:
            vec += [(1, 1), (-1, 1), (1, -1), (-1, -1)]
        marcar = [
            (x, y)
            for y in range(self.h)
            for x in range(self.w)
            if not self.opaco(x, y) and any(self.opaco(x + dx, y + dy) for dx, dy in vec)
        ]
        for x, y in marcar:
            self.pon(x, y, c)


# ---------------------------------------------------------------- paletas

HIERBA = dict(base=rgb(136, 206, 100), oscura=rgb(96, 170, 82), clara=rgb(176, 228, 128), sombra=rgb(80, 150, 74))
# La meseta en primavera: un verde más amarillo y apagado que el de la Vega.
HIERBA_MESETA = dict(base=rgb(166, 196, 104), oscura=rgb(128, 160, 80), clara=rgb(200, 220, 136), sombra=rgb(112, 140, 72))
TRIGO = dict(fondo=rgb(132, 164, 76), tallo=rgb(96, 132, 60), clara=rgb(176, 196, 96), espiga=rgb(226, 204, 110),
             espiga_osc=rgb(188, 160, 76), contorno=rgb(70, 96, 48))
PIEDRA_GRIS = dict(clara=rgb(176, 172, 168), media=rgb(146, 142, 140), oscura=rgb(112, 108, 108), junta=rgb(82, 78, 80))
ALTA = dict(
    fondo=rgb(70, 150, 72), contorno=rgb(30, 86, 52), oscura=rgb(48, 122, 62), media=rgb(84, 172, 82),
    clara=rgb(122, 204, 100), brillo=rgb(176, 232, 132)
)
ARENA = dict(base=rgb(234, 212, 158), clara=rgb(246, 230, 188), oscura=rgb(214, 184, 128), borde=rgb(190, 156, 104))
PIEDRA = dict(clara=rgb(216, 210, 198), media=rgb(184, 176, 164), oscura=rgb(140, 132, 124), junta=rgb(112, 104, 100))
AGUA = dict(
    honda=rgb(56, 124, 208), media=rgb(84, 156, 236), clara=rgb(144, 200, 248), espuma=rgb(226, 244, 255)
)
ARBOL = dict(
    contorno=rgb(22, 66, 46), oscura=rgb(36, 106, 62), media=rgb(60, 146, 76), clara=rgb(100, 184, 92),
    brillo=rgb(150, 216, 120), tronco=rgb(128, 84, 50), tronco_osc=rgb(84, 54, 36)
)
CIPRES = dict(contorno=rgb(14, 50, 38), oscura=rgb(26, 84, 54), media=rgb(42, 116, 66), clara=rgb(74, 152, 84))
OLIVO = dict(
    contorno=rgb(52, 70, 50), oscura=rgb(92, 118, 80), media=rgb(132, 158, 104), clara=rgb(172, 194, 136),
    plata=rgb(210, 222, 178), tronco=rgb(118, 96, 74), tronco_osc=rgb(74, 60, 48)
)
TEJA = dict(
    contorno=rgb(98, 38, 30), oscura=rgb(160, 68, 46), media=rgb(204, 102, 62), clara=rgb(230, 142, 94),
    brillo=rgb(246, 180, 132), trasera=rgb(140, 62, 44)
)
CAL = dict(
    blanco=rgb(248, 246, 238), mancha=rgb(236, 233, 222), sombra=rgb(212, 208, 198), contorno=rgb(104, 96, 92),
    zocalo=rgb(222, 172, 86), zocalo_osc=rgb(184, 132, 60)
)
MADERA = dict(
    clara=rgb(196, 138, 86), media=rgb(156, 102, 62), oscura=rgb(112, 70, 42), contorno=rgb(66, 40, 28)
)
TAPIAL = dict(
    clara=rgb(238, 208, 154), media=rgb(216, 180, 122), oscura=rgb(178, 138, 88), contorno=rgb(104, 76, 52),
    camino=rgb(226, 196, 142)
)
ROJA = dict(
    clara=rgb(230, 146, 104), media=rgb(200, 110, 78), oscura=rgb(158, 78, 58), contorno=rgb(92, 44, 38),
    camino=rgb(214, 132, 96)
)
LONA = dict(
    roja=rgb(204, 50, 58), roja_osc=rgb(150, 34, 46), crema=rgb(246, 234, 204), crema_osc=rgb(214, 196, 158),
    oro=rgb(242, 192, 66), contorno=rgb(86, 24, 32)
)
BARRO = dict(base=rgb(216, 140, 96), clara=rgb(232, 166, 122), oscura=rgb(196, 120, 80), junta=rgb(170, 98, 68))
MARMOL = dict(blanco=rgb(242, 238, 230), gris=rgb(226, 220, 210), junta=rgb(204, 196, 186), veta=rgb(214, 208, 200))
ALFOMBRA = dict(roja=rgb(184, 42, 58), roja_osc=rgb(142, 30, 46), oro=rgb(236, 188, 76), contorno=rgb(92, 22, 34))
AZULEJO = dict(
    verde=rgb(46, 138, 96), azul=rgb(46, 86, 168), ocre=rgb(220, 170, 64), negro=rgb(42, 40, 50), blanco=rgb(242, 236, 222)
)
OSCURO = rgb(40, 32, 36)


# ---------------------------------------------------------------- suelo

def hierba(variante: int, pal: dict = HIERBA) -> Lienzo:
    l = Lienzo(fondo=pal['base'])
    # Briznas en sitios fijos, como en los juegos de GBA: el patrón se repite y da textura sin ruido.
    sitios = {0: [(3, 3), (11, 11)], 1: [(3, 3), (11, 11), (12, 4)], 2: [(3, 3)], 3: []}[variante]
    for x, y in sitios:
        l.dibujo(x, y, ['c.c', 'o.o', '.o.'], {'o': pal['oscura'], 'c': pal['clara']})
    if variante == 3:
        for x, y in [(4, 5), (5, 5), (10, 12), (11, 12), (12, 12)]:
            l.pon(x, y, pal['clara'])
    return l


TRIGAL = [
    '.e..e..e..e..e..',
    'eEeeEeeEeeEeeEe.',
    '.c..c..c..c..c..',
    '.c.lc..c.lc..c.l',
    '.t..t..t..t..t..',
    '.t..t..t..t..t..',
    'oooooooooooooooo',
    '................',
    '..e..e..e..e..e.',
    '.eEeeEeeEeeEeeEe',
    '..c..c..c..c..c.',
    'l.c..c.lc..c..c.',
    '..t..t..t..t..t.',
    '..t..t..t..t..t.',
    'oooooooooooooooo',
    '................',
]


def trigal() -> Lienzo:
    """Trigo que empieza a dorar: hileras de tallos con la espiga arriba. Es hierba alta."""
    t = TRIGO
    l = Lienzo(fondo=t['fondo'])
    l.dibujo(0, 0, TRIGAL, {'e': t['espiga'], 'E': t['espiga_osc'], 'c': t['clara'], 'l': t['clara'], 't': t['tallo'],
                            'o': t['contorno']})
    return l


def trigal_delante() -> Lienzo:
    base = trigal()
    l = Lienzo()
    for y in range(8, 16):
        for x in range(16):
            if y >= 11 or TRIGAL[y][x] != '.':
                l.pon(x, y, base.lee(x, y))
    return l


HIERBA_ALTA = [
    '..b......b......',
    '.blo....blo.....',
    '.llmo.b.llmo.b..',
    'blmmdolmblmmdolm',
    'lmmdmomdlmmdmomd',
    'mdmmodmmmdmmodmm',
    'dooddoooddooddoo',
    '................',
    '......b.......b.',
    '.....blo.....blo',
    '..b..llmo.b..llm',
    'olmblmmdolmblmmd',
    'momdlmmdmomdlmmd',
    'odmmmdmmodmmmdmm',
    'oooddooddoooddoo',
    '................',
]


def hierba_alta() -> Lienzo:
    """Dos hileras de matas puntiagudas al tresbolillo, cada una con su línea de sombra al pie."""
    a = ALTA
    l = Lienzo(fondo=a['fondo'])
    l.dibujo(0, 0, HIERBA_ALTA, {'o': a['contorno'], 'd': a['oscura'], 'm': a['media'], 'l': a['clara'], 'b': a['brillo']})
    return l


def hierba_alta_delante() -> Lienzo:
    """La hilera de delante de la hierba alta, que tapa las piernas de quien la pisa."""
    base = hierba_alta()
    l = Lienzo()
    for y in range(8, 16):
        for x in range(16):
            if y >= 11 or HIERBA_ALTA[y][x] != '.':
                l.pon(x, y, base.lee(x, y))
    return l


def flores(variante: int) -> Lienzo:
    l = hierba(3 if variante else 2)
    petalo = [rgb(236, 64, 72), rgb(248, 248, 240), rgb(250, 208, 64)][variante]
    centro = rgb(250, 208, 64) if variante != 2 else rgb(220, 120, 40)
    tallo = HIERBA['oscura']
    for x, y in [(3, 9), (10, 3), (11, 11)] if variante != 1 else [(4, 4), (11, 9), (3, 12)]:
        l.dibujo(x - 1, y - 1, ['.p.', 'pcp', '.p.', '.t.'], {'p': petalo, 'c': centro, 't': tallo})
    return l


# ---------------------------------------------------------------- materiales con vecinos

FORMAS = {
    'lleno': {(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)},
    'esquina': {(0, 0)},
    'horizontal': {(-1, 0), (0, 0), (1, 0)},
    'vertical': {(0, -1), (0, 0), (0, 1)},
    'interior': {(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)},
}


def perfil(s: int, base: int, juego: int) -> list[int]:
    """Margen irregular a lo largo de un borde, que se repite cada 16 píxeles."""
    vals = [base + (1 if azar(i, s) < 0.35 else 0) * juego for i in range(16)]
    # Suaviza: no hay saltos de más de un píxel.
    for _ in range(2):
        vals = [max(base, min(vals[i], vals[(i - 1) % 16] + 1, vals[(i + 1) % 16] + 1)) for i in range(16)]
    return vals


def mascara_material(celdas: set, margen: int, juego: int, redondeo: int, semilla: int) -> list[list[int]]:
    """
    Distancia al borde (0 = fuera) de cada píxel de la casilla central de una vecindad 3 × 3,
    sobre un lienzo de 48 × 48 para que los bordes salgan como en el mapa.
    """
    mt, mb = perfil(semilla, margen, juego), perfil(semilla + 1, margen, juego)
    ml, mr = perfil(semilla + 2, margen, juego), perfil(semilla + 3, margen, juego)

    def ocupada(cx: int, cy: int) -> bool:
        return (cx - 1, cy - 1) in celdas

    def material(gx: int, gy: int) -> bool:
        cx, cy = gx // 16, gy // 16
        if not (0 <= cx < 3 and 0 <= cy < 3) or not ocupada(cx, cy):
            return False
        lx, ly = gx % 16, gy % 16
        arriba, abajo = not ocupada(cx, cy - 1), not ocupada(cx, cy + 1)
        izq, der = not ocupada(cx - 1, cy), not ocupada(cx + 1, cy)
        t, b, l, r = mt[gx % 16], mb[gx % 16], ml[gy % 16], mr[gy % 16]
        if arriba and ly < t or abajo and ly > 15 - b or izq and lx < l or der and lx > 15 - r:
            return False
        # Esquinas de fuera, redondeadas.
        for (va, vb, da, db) in [(arriba, izq, ly - t, lx - l), (arriba, der, ly - t, 15 - r - lx),
                                 (abajo, izq, 15 - b - ly, lx - l), (abajo, der, 15 - b - ly, 15 - r - lx)]:
            if va and vb and da + db < redondeo:
                return False
        # Esquinas de dentro: la diagonal vacía mete su borde en la casilla.
        for (sx, sy, da, db) in [(-1, -1, lx < l, ly < t), (1, -1, lx > 15 - r, ly < t),
                                 (-1, 1, lx < l, ly > 15 - b), (1, 1, lx > 15 - r, ly > 15 - b)]:
            if ocupada(cx + sx, cy) and ocupada(cx, cy + sy) and not ocupada(cx + sx, cy + sy) and da and db:
                return False
        return True

    # Distancia (en pasos de 4 vecinos) hasta un píxel fuera, hasta 4.
    dist = [[0] * 48 for _ in range(48)]
    for gy in range(48):
        for gx in range(48):
            dist[gy][gx] = 9 if material(gx, gy) else 0
    for _ in range(4):
        for gy in range(48):
            for gx in range(48):
                if dist[gy][gx] == 0:
                    continue
                vecinos = [dist[gy + dy][gx + dx] if 0 <= gx + dx < 48 and 0 <= gy + dy < 48 else 9
                           for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]]
                dist[gy][gx] = min(dist[gy][gx], min(vecinos) + 1)
    return [[dist[16 + y][16 + x] for x in range(16)] for y in range(16)]


def material(pintar, margen: int, juego: int, redondeo: int, semilla: int) -> dict[str, Lienzo]:
    """Los cinco tiles de referencia de un material. `pintar(x, y, d)` da el color a distancia d del borde."""
    tiles = {}
    for nombre, celdas in FORMAS.items():
        m = mascara_material(celdas, margen, juego, redondeo, semilla)
        l = Lienzo()
        for y in range(16):
            for x in range(16):
                if m[y][x]:
                    l.pon(x, y, pintar(x, y, m[y][x]))
        tiles[nombre] = l
    return tiles


def pinta_camino(x: int, y: int, d: int) -> Color:
    a = ARENA
    if d == 1:
        return a['borde']
    if d == 2:
        return a['oscura']
    r = azar(x, y, 7)
    if r < 0.06:
        return a['oscura']
    if r < 0.12:
        return a['clara']
    return a['base']


def cantos() -> list[list[int]]:
    """Textura de empedrado: piedras redondeadas de unos 5 × 4 píxeles, en hiladas al tresbolillo."""
    t = [[0] * 16 for _ in range(16)]
    for y in range(16):
        fila = y // 4
        for x in range(16):
            xx = (x + (fila % 2) * 3) % 16
            dentro_x = xx % 5 if xx < 15 else 4
            dentro_y = y % 4
            if dentro_y == 3 or dentro_x == 4:
                t[y][x] = 0  # junta
            elif dentro_y == 0 and dentro_x in (0, 3):
                t[y][x] = 0
            elif dentro_y == 0 or dentro_x == 0:
                t[y][x] = 3  # luz
            elif dentro_y == 2 and dentro_x == 3:
                t[y][x] = 1  # sombra
            else:
                t[y][x] = 2
    return t


CANTOS = cantos()


def pinta_empedrado(x: int, y: int, d: int) -> Color:
    p = PIEDRA
    if d == 1:
        return p['junta']
    v = CANTOS[y][x]
    return [p['junta'], p['oscura'], p['media'], p['clara']][v]


def pinta_agua(fotograma: int):
    def pintar(x: int, y: int, d: int) -> Color:
        p, a = PIEDRA, AGUA
        if d == 1:
            return p['junta']
        if d == 2:
            return p['clara'] if y < 8 else p['media']
        if d == 3:
            return a['honda']
        # Ondas que avanzan hacia la derecha: el dibujo se repite cada 16 píxeles, en 4 fotogramas.
        xx = (x - fotograma * 4) % 16
        onda = (xx + (y // 3) * 5) % 16
        if y % 3 == 0 and onda < 4:
            return a['clara'] if onda else a['espuma']
        return a['media'] if (y + xx // 4) % 5 else a['honda']
    return pintar


def pinta_fuente(fotograma: int):
    def pintar(x: int, y: int, d: int) -> Color:
        m, a = MARMOL, AGUA
        if d == 1:
            return PIEDRA['oscura']
        if d in (2, 3):
            return m['blanco'] if d == 2 else m['junta']
        xx = (x + fotograma * 4) % 16
        if (xx + y * 3) % 11 == 0:
            return a['espuma']
        return a['clara'] if (xx + y) % 7 == 0 else a['media']
    return pintar


def pinta_alfombra(x: int, y: int, d: int) -> Color:
    a = ALFOMBRA
    if d == 1:
        return a['contorno']
    if d == 2:
        return a['oro']
    # Rombos dorados pequeños en el centro.
    if (x + y) % 8 == 0 and (x - y) % 8 == 0:
        return a['oro']
    if (x + y) % 8 == 4 and (x - y) % 8 == 4:
        return a['roja_osc']
    return a['roja']


# ---------------------------------------------------------------- árboles y plantas

def copa(l: Lienzo, bolas: list[tuple[float, float, float]], pal: dict) -> None:
    """Copa hecha de bolas de hojas; las de abajo tapan a las de arriba y les hacen sombra."""
    dueño = {}
    for i, (cx, cy, r) in enumerate(bolas):
        for y in range(l.h):
            for x in range(l.w):
                if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r:
                    dueño[(x, y)] = i
    for (x, y), i in dueño.items():
        cx, cy, r = bolas[i]
        dx, dy = (x + 0.5 - cx) / r, (y + 0.5 - cy) / r
        luz = -(dx * 0.55 + dy * 0.85)
        if luz > 0.55:
            c = pal['brillo']
        elif luz > 0.1:
            c = pal['clara']
        elif luz > -0.45:
            c = pal['media']
        else:
            c = pal['oscura']
        # Sombra de la bola de delante sobre la de detrás.
        if dueño.get((x, y + 1), i) > i or dueño.get((x, y + 2), i) > i:
            c = pal['oscura']
        l.pon(x, y, c)


def arbol() -> Lienzo:
    a = ARBOL
    l = Lienzo(24, 32)
    # Tronco
    l.rect(10, 22, 5, 8, a['tronco'])
    l.rect(13, 22, 2, 8, a['tronco_osc'])
    l.rect(9, 29, 7, 1, a['tronco_osc'])
    copa(l, [(12, 7, 6.5), (6.5, 12, 5.5), (17.5, 12, 5.5), (12, 13, 6.5), (7.5, 18.5, 5), (16.5, 18.5, 5),
             (12, 20, 5)], a)
    l.contorno(a['contorno'])
    return l


def arbusto() -> Lienzo:
    a = ARBOL
    l = Lienzo(16, 16)
    copa(l, [(8, 6.5, 5.5), (4.5, 10, 4), (11.5, 10, 4), (8, 11, 4.5)], a)
    l.contorno(a['contorno'])
    return l


def cipres() -> Lienzo:
    a = CIPRES
    l = Lienzo(16, 32)
    for y in range(1, 29):
        t = (y - 1) / 27
        # Silueta de llama: punta arriba, ancho máximo abajo del centro.
        medio = 5.6 * math.sin(min(1, t * 1.25) * math.pi / 2) ** 0.9 if t < 0.92 else 5.6 * (1 - (t - 0.92) * 5)
        for x in range(16):
            dx = x + 0.5 - 8
            if abs(dx) <= medio:
                lado = dx / max(medio, 0.1)
                rayita = azar(x, y, 3) < 0.18
                if lado < -0.35:
                    c = a['clara']
                elif lado < 0.3:
                    c = a['media']
                else:
                    c = a['oscura']
                if rayita:
                    c = a['oscura'] if c != a['oscura'] else a['contorno']
                l.pon(x, y, c)
    l.rect(7, 28, 2, 3, ARBOL['tronco_osc'])
    l.contorno(a['contorno'])
    return l


def olivo() -> Lienzo:
    a = OLIVO
    l = Lienzo(24, 28)
    # Tronco retorcido, abierto en dos.
    for y in range(17, 27):
        k = y - 17
        x0 = 10 + (1 if k < 4 else 0) - (1 if k > 7 else 0)
        l.rect(x0, y, 4, 1, a['tronco'])
        l.pon(x0 + 3, y, a['tronco_osc'])
        if k < 4:
            l.pon(x0 + 1, y, a['tronco_osc'])
    l.rect(8, 26, 8, 1, a['tronco_osc'])
    pal = dict(brillo=a['plata'], clara=a['clara'], media=a['media'], oscura=a['oscura'])
    copa(l, [(8, 8, 6), (16, 7, 5.5), (12, 12, 6.5), (5, 13.5, 4.5), (19, 13, 4.5)], pal)
    # Destellos plateados de las hojas.
    for y in range(l.h):
        for x in range(l.w):
            if l.lee(x, y) == a['media'] and azar(x, y, 11) < 0.12:
                l.pon(x, y, a['plata'])
    l.contorno(a['contorno'])
    return l


def roca() -> Lienzo:
    p = PIEDRA
    l = Lienzo(16, 16)
    copa(l, [(8, 9, 6), (5, 10.5, 4), (11, 10, 4.5)], dict(brillo=p['clara'], clara=p['clara'], media=p['media'],
                                                           oscura=p['oscura']))
    l.contorno(p['junta'])
    return l


def naranjo() -> Lienzo:
    """Árbol con naranjas, de los patios y las huertas de Granada."""
    l = arbol()
    for y in range(l.h):
        for x in range(l.w):
            c = l.lee(x, y)
            if c in (ARBOL['media'], ARBOL['clara']) and azar(x, y, 13) < 0.07 and azar(x + 1, y, 13) >= 0.07:
                l.pon(x, y, rgb(248, 148, 36))
                if l.lee(x + 1, y) in (ARBOL['media'], ARBOL['clara']):
                    l.pon(x + 1, y, rgb(214, 104, 24))
                if l.lee(x, y - 1) in (ARBOL['media'], ARBOL['clara'], ARBOL['brillo']):
                    l.pon(x, y - 1, rgb(255, 204, 112))
    return l


def valla(u: bool, d: bool, l_: bool, r: bool) -> Lienzo:
    """Valla de madera. Se une a las vecinas: en horizontal se ven postes y travesaños; en vertical, desde arriba."""
    m = MADERA
    l = Lienzo()
    sombra = (0, 0, 0, 60)
    horizontal = l_ or r or not (u or d)
    if horizontal:
        x0, x1 = (0 if l_ else 4), (16 if r else 12)
        for y0 in (5, 9):
            l.rect(x0, y0, x1 - x0, 1, m['clara'])
            l.rect(x0, y0 + 1, x1 - x0, 1, m['media'])
            l.rect(x0, y0 + 2, x1 - x0, 1, m['contorno'])
        l.rect(x0, 4, x1 - x0, 1, m['contorno'])
        l.rect(x0, 14, x1 - x0, 1, sombra)
    if u or d:
        y0, y1 = (0 if u else 3), (16 if d else 13)
        l.rect(6, y0, 4, y1 - y0, m['contorno'])
        l.rect(7, y0, 2, y1 - y0, m['clara'])
        l.rect(8, y0, 1, y1 - y0, m['media'])
    # Postes
    for px in ([2, 10] if horizontal and l_ and r else [6]):
        l.rect(px, 2, 4, 12, m['contorno'])
        l.rect(px + 1, 3, 2, 10, m['media'])
        l.rect(px + 1, 3, 1, 10, m['clara'])
        l.rect(px + 1, 2, 2, 1, m['clara'])
        l.rect(px, 14, 4, 1, sombra)
    return l


def seto(u: bool, d: bool, l_: bool, r: bool) -> Lienzo:
    """Seto recortado de arrayán: cara de arriba clara y frente más oscuro."""
    a = ARBOL
    l = Lienzo()
    x0, x1 = (0 if l_ else 1), (15 if r else 14)
    y0, y1 = (0 if u else 2), 15
    frente = 0 if d else 5
    dentro = set()
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            # Esquinas redondeadas donde no sigue el seto.
            if (not u and y == y0 or not d and y == y1) and (not l_ and x == x0 or not r and x == x1):
                continue
            dentro.add((x, y))
    for x, y in dentro:
        en_frente = frente and y > y1 - frente
        if en_frente:
            c = a['oscura'] if (x + y) % 3 else a['media']
            if y == y1 - frente + 1:
                c = a['media']
        else:
            r_ = azar(x, y, 17)
            c = a['clara'] if r_ < 0.55 else a['media'] if r_ < 0.85 else a['brillo']
        l.pon(x, y, c)
    for x, y in dentro:
        vecinos = [(x + 1, y, r), (x - 1, y, l_), (x, y - 1, u), (x, y + 1, d)]
        for nx, ny, sigue in vecinos:
            if (nx, ny) not in dentro and not (sigue and (nx < 0 or nx > 15 or ny < 0 or ny > 15)):
                l.pon(x, y, a['contorno'])
                break
    return l


def pinta_huerto(x: int, y: int, d: int) -> Color:
    tierra, surco, borde = rgb(150, 98, 62), rgb(118, 74, 48), rgb(98, 62, 42)
    if d == 1:
        return borde
    if y % 4 == 3:
        return surco
    # Lechugas y coles en hileras.
    xx, yy = x % 4, y % 4
    if yy in (0, 1) and xx in (1, 2):
        return rgb(140, 210, 96) if (yy == 0 and xx == 1) else rgb(70, 156, 72)
    return tierra


def pozo() -> Lienzo:
    """Pozo de piedra con su travesaño, la polea y el cubo."""
    p, m = PIEDRA, MADERA
    l = Lienzo(16, 24)
    # Brocal: un cilindro de piedra visto desde arriba y de frente.
    for y in range(10, 22):
        for x in range(1, 15):
            dx = (x + 0.5 - 8) / 7
            if abs(dx) > 1:
                continue
            arriba = 13 - 3 * math.sqrt(max(0, 1 - dx * dx))
            if y < arriba:
                continue
            fila = (y - 13) // 3
            c = p['media'] if dx > 0.3 else p['clara']
            if (y - 13) % 3 == 2 or (x + fila * 3) % 6 == 0:
                c = p['oscura']
            l.pon(x, y, c)
    for x in range(2, 14):
        dx = (x + 0.5 - 8) / 6
        alto = 2.2 * math.sqrt(max(0, 1 - dx * dx))
        for y in range(round(13 - alto), round(13 + alto) + 1):
            l.pon(x, y, rgb(30, 44, 70) if y > 12 - alto + 1 else p['oscura'])
    # Postes y travesaño
    for x in (2, 13):
        l.rect(x, 2, 1, 11, m['oscura'])
    l.rect(1, 2, 14, 2, m['media'])
    l.rect(1, 2, 14, 1, m['clara'])
    l.rect(7, 4, 1, 6, rgb(200, 180, 140))
    l.dibujo(5, 8, ['ccccc', 'cbbbc', '.ccc.'], {'c': m['contorno'], 'b': m['clara']})
    l.contorno(p['junta'])
    return l


def encina() -> Lienzo:
    """Encina de la meseta: copa ancha, densa y de un verde oscuro grisáceo; tronco corto y oscuro."""
    pal = dict(contorno=rgb(30, 50, 34), oscura=rgb(52, 84, 54), media=rgb(78, 112, 70), clara=rgb(110, 140, 88),
               brillo=rgb(148, 170, 112))
    l = Lienzo(24, 30)
    l.rect(10, 20, 4, 8, rgb(92, 66, 48))
    l.rect(12, 20, 2, 8, rgb(62, 44, 34))
    l.rect(8, 27, 8, 1, rgb(62, 44, 34))
    copa(l, [(7, 10, 6), (17, 10, 6), (12, 8, 6.5), (5, 15, 5), (19, 15, 5), (12, 16, 6.5)], pal)
    for y in range(l.h):
        for x in range(l.w):
            if l.lee(x, y) == pal['media'] and azar(x, y, 23) < 0.1:
                l.pon(x, y, pal['oscura'])
    l.contorno(pal['contorno'])
    return l


def armadura() -> Lienzo:
    """Armadura completa en su peana, de las que guardaba el Alcázar."""
    m = dict(o=rgb(40, 40, 52), b=rgb(206, 212, 226), s=rgb(150, 158, 182), d=rgb(108, 114, 140), r=rgb(186, 40, 48),
             w=MADERA['oscura'], y=rgb(236, 192, 72))
    l = Lienzo(16, 32)
    l.dibujo(2, 1, [
        '....oooo....',
        '...obbbso...',
        '...obddso...',
        '...obbbso...',
        '....oyyo....',
        '..oobbbsoo..',
        '.obbbbbbsso.',
        '.obsbbbbsso.',
        '.ob.obbso.so',
        '.oo.obbso.oo',
        '....oyyyo...',
        '....obbsso..',
        '....obo.so..',
        '....obo.so..',
        '....obo.so..',
        '...oobo.soo.',
        '...obbo.sso.',
        '..oooo..ooo.',
        '..owwwwwwwo.',
        '..oooooooooo',
    ], m)
    return l


def armero() -> Lienzo:
    """Armero con espadas toledanas y una alabarda."""
    w, o = MADERA, rgb(40, 32, 30)
    l = Lienzo(16, 32)
    l.rect(1, 8, 14, 22, o)
    l.rect(2, 9, 12, 20, w['oscura'])
    l.rect(2, 26, 12, 3, w['media'])
    for x in (4, 7, 10):
        l.rect(x, 4, 1, 22, rgb(214, 220, 232))
        l.pon(x + 1, 6, rgb(150, 158, 182))
        l.rect(x - 1, 22, 3, 1, rgb(236, 192, 72))
        l.rect(x, 23, 1, 3, rgb(90, 60, 40))
    l.rect(13, 1, 1, 26, rgb(110, 76, 48))
    l.dibujo(11, 1, ['.oo.', 'osso', '.os.'], {'o': o, 's': rgb(196, 204, 220)})
    return l


def suelo_losas() -> Lienzo:
    p = PIEDRA_GRIS
    l = Lienzo()
    for y in range(16):
        for x in range(16):
            fila = y // 8
            xx = (x + fila * 4) % 8
            c = p['clara'] if azar((x + fila * 4) // 8, fila, 51) < 0.5 else p['media']
            if y % 8 == 7 or xx == 7:
                c = p['junta']
            elif y % 8 == 0 or xx == 0:
                c = mezcla(c, rgb(255, 255, 255), 0.15)
            l.pon(x, y, c)
    return l


# ---------------------------------------------------------------- casas

def tejado(u: bool, d: bool, l_: bool, r: bool) -> Lienzo:
    """Teja árabe: canales que bajan por el faldón, cumbrera arriba y alero abajo."""
    t = TEJA
    l = Lienzo(fondo=t['media'])
    for y in range(16):
        for x in range(16):
            hilada = y // 4
            xx = (x + (hilada % 2) * 2) % 4
            if xx == 0:
                c = t['oscura']
            elif xx == 1:
                c = t['brillo'] if y % 4 == 0 else t['clara']
            elif xx == 2:
                c = t['media']
            else:
                c = t['media'] if y % 4 != 3 else t['oscura']
            l.pon(x, y, c)
    if not u:
        # Faldón de atrás, más oscuro y en escorzo, y la cumbrera.
        for y in range(0, 5):
            for x in range(16):
                l.pon(x, y, t['trasera'] if (x + y) % 3 else t['oscura'])
        l.rect(0, 0, 16, 1, t['contorno'])
        l.rect(0, 5, 16, 2, t['clara'])
        for x in range(0, 16, 4):
            l.pon(x, 5, t['brillo'])
            l.pon(x + 3, 6, t['oscura'])
        l.rect(0, 7, 16, 1, t['oscura'])
    if not d:
        # Alero: las bocas redondas de las tejas y la línea de sombra.
        for x in range(16):
            xx = x % 4
            l.pon(x, 13, t['oscura'] if xx == 0 else t['clara'])
            l.pon(x, 14, t['contorno'] if xx in (0, 3) else t['oscura'])
            l.pon(x, 15, t['contorno'])
    if not l_:
        for y in range(16):
            l.pon(0, y, t['contorno'])
            l.pon(1, y, t['oscura'])
    if not r:
        for y in range(16):
            l.pon(15, y, t['contorno'])
            l.pon(14, y, t['oscura'])
    return l


def fachada(l_: bool, r: bool, hueco: str) -> Lienzo:
    """Pared encalada bajo el alero. `hueco`: '', 'ventana' o 'puerta'."""
    c = CAL
    l = Lienzo(fondo=c['blanco'])
    for y in range(16):
        for x in range(16):
            if azar(x, y, 21) < 0.08:
                l.pon(x, y, c['mancha'])
    l.rect(0, 0, 16, 2, c['sombra'])
    l.rect(0, 2, 16, 1, c['mancha'])
    # Zócalo pintado de almagra clara.
    l.rect(0, 13, 16, 3, c['zocalo'])
    l.rect(0, 13, 16, 1, c['zocalo_osc'])
    l.rect(0, 15, 16, 1, c['zocalo_osc'])
    m = MADERA
    if hueco == 'ventana':
        l.rect(4, 3, 8, 8, m['contorno'])
        l.rect(5, 4, 6, 6, rgb(52, 62, 96))
        l.pon(5, 4, rgb(120, 144, 196))
        l.pon(6, 4, rgb(88, 106, 156))
        # Reja de hierro.
        for x in (6, 9):
            l.rect(x, 4, 1, 6, rgb(34, 34, 42))
        l.rect(5, 6, 6, 1, rgb(34, 34, 42))
        # Maceta con geranios.
        l.rect(4, 11, 8, 2, rgb(196, 92, 54))
        l.rect(4, 12, 8, 1, rgb(150, 66, 40))
        for x, col in [(5, rgb(232, 44, 60)), (7, rgb(64, 150, 70)), (8, rgb(232, 44, 60)), (10, rgb(232, 44, 60))]:
            l.pon(x, 10, col)
        l.pon(6, 10, rgb(64, 150, 70))
        l.pon(9, 10, rgb(64, 150, 70))
    elif hueco == 'puerta':
        for y in range(2, 16):
            for x in range(3, 13):
                arco = y >= 7 or (x - 7.5) ** 2 + (y - 7) ** 2 <= 25
                if not arco:
                    continue
                borde = x in (3, 12) or ((x - 7.5) ** 2 + (y - 7) ** 2 > 16 and y < 7)
                if borde:
                    l.pon(x, y, m['contorno'])
                elif x == 8:
                    l.pon(x, y, m['oscura'])
                else:
                    l.pon(x, y, m['clara'] if (x % 2 == 0) else m['media'])
        l.pon(10, 10, rgb(232, 196, 92))
        l.rect(2, 15, 12, 1, PIEDRA['media'])
    if not l_:
        l.rect(0, 0, 1, 16, c['contorno'])
        l.rect(1, 0, 1, 13, c['sombra'])
    if not r:
        l.rect(15, 0, 1, 16, c['contorno'])
        l.rect(14, 0, 1, 13, c['mancha'])
    return l


# ---------------------------------------------------------------- murallas

def muro(pal: dict, forma: str, ladrillo: bool) -> Lienzo:
    """
    Muralla de una casilla de grueso. `forma`: 'horizontal' (almenas y paramento), 'vertical' (el
    adarve visto desde arriba), 'puerta' (arco abierto al camino) o 'arco' (arco de herradura a un
    interior).
    """
    l = Lienzo()
    if forma == 'vertical':
        l.rect(1, 0, 14, 16, pal['camino'])
        for y in range(16):
            for x in range(3, 13):
                if (y % 4 == 0) and azar(x, y, 5) < 0.5:
                    l.pon(x, y, pal['media'])
        for y in range(16):
            for x in (1, 2, 13, 14):
                almena = (y % 8) < 5
                l.pon(x, y, pal['clara'] if almena else pal['oscura'])
        l.rect(0, 0, 1, 16, pal['contorno'])
        l.rect(15, 0, 1, 16, pal['contorno'])
        return l
    # Almenas
    for x in range(16):
        almena = (x % 8) < 5
        for y in range(0, 5):
            if almena:
                c = pal['clara'] if y < 2 else pal['media']
                if x % 8 == 4:
                    c = pal['oscura']
                l.pon(x, y, c)
            elif y >= 3:
                l.pon(x, y, pal['camino'])
        if almena:
            l.pon(x, 0, pal['contorno'])
            if x % 8 in (0, 4):
                for y in range(0, 3):
                    l.pon(x, y, pal['contorno'])
    l.rect(0, 5, 16, 1, pal['clara'])
    # Paramento
    for y in range(6, 15):
        for x in range(16):
            c = pal['media']
            if ladrillo:
                fila = (y - 6) // 3
                if (y - 6) % 3 == 2 or (x + fila * 4) % 8 == 0:
                    c = pal['oscura']
            else:
                # Tapial: cajones de tierra con las marcas de las agujas.
                if y in (9, 12):
                    c = pal['oscura']
                elif (x + (y // 3) * 5) % 9 == 0 and azar(x, y, 9) < 0.6:
                    c = pal['clara']
            l.pon(x, y, c)
    l.rect(0, 15, 16, 1, pal['contorno'])
    if forma == 'puerta':
        for y in range(4, 16):
            for x in range(3, 13):
                if y >= 9 or (x - 7.5) ** 2 + (y - 9) ** 2 <= 22:
                    l.pon(x, y, ARENA['oscura'] if y < 10 else ARENA['base'])
        for y in range(4, 16):
            for x in range(2, 14):
                if l.lee(x, y) not in (ARENA['oscura'], ARENA['base']) and (
                    any(l.lee(x + dx, y + dy) in (ARENA['oscura'], ARENA['base']) for dx, dy in [(1, 0), (-1, 0), (0, 1)])
                ):
                    l.pon(x, y, pal['contorno'])
        # Hojas de la puerta abiertas contra el muro.
        m = MADERA
        l.rect(3, 9, 1, 7, m['media'])
        l.rect(12, 9, 1, 7, m['media'])
    elif forma == 'arco':
        # Arco de herradura con alfiz, como las puertas nazaríes.
        l.rect(2, 3, 12, 13, pal['clara'])
        l.rect(2, 3, 12, 1, pal['contorno'])
        l.rect(2, 3, 1, 13, pal['contorno'])
        l.rect(13, 3, 1, 13, pal['contorno'])
        for y in range(4, 16):
            for x in range(3, 13):
                en_arco = (x - 7.5) ** 2 + (y - 8.5) ** 2 <= 16.5 and y >= 4
                en_jamba = 5 <= x <= 10 and y >= 9
                if en_arco or en_jamba:
                    l.pon(x, y, OSCURO if y > 6 else rgb(70, 50, 54))
        for y in range(4, 16):
            for x in range(3, 13):
                if l.lee(x, y) == pal['clara'] and any(
                    l.lee(x + dx, y + dy) in (OSCURO, rgb(70, 50, 54)) for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]
                ):
                    l.pon(x, y, AZULEJO['ocre'])
    return l


# ---------------------------------------------------------------- pabellón (exterior)

def lona_exterior(u: bool, d: bool, l_: bool, r: bool, puerta: bool) -> Lienzo:
    a = LONA
    l = Lienzo()
    for y in range(16):
        for x in range(16):
            franja = (x // 4) % 2 == 0
            if not u and y < 3:
                continue
            c = a['roja'] if franja else a['crema']
            if not d:
                c = a['roja_osc'] if franja else a['crema_osc']
            elif y % 8 == 7 and u:
                c = a['roja_osc'] if franja else a['crema_osc']
            l.pon(x, y, c)
    if not u:
        l.rect(0, 3, 16, 1, a['contorno'])
        for x in range(0, 16, 4):
            l.pon(x + 1, 4, a['oro'])
            l.pon(x + 2, 4, a['oro'])
    if not d:
        # Faldón con flecos dorados y la entrada.
        for x in range(16):
            l.pon(x, 0, a['oro'])
            l.pon(x, 1, a['oro'] if x % 4 in (1, 2) else a['roja_osc'])
            l.pon(x, 2, a['contorno'] if x % 4 in (0, 3) else a['oro'])
        l.rect(0, 15, 16, 1, a['contorno'])
        if puerta:
            for y in range(4, 15):
                ancho = min(5, (y - 3))
                l.rect(8 - ancho, y, ancho * 2, 1, OSCURO)
            l.rect(2, 4, 3, 11, a['roja'])
            l.rect(11, 4, 3, 11, a['roja'])
            l.rect(2, 9, 3, 1, a['oro'])
            l.rect(11, 9, 3, 1, a['oro'])
    if not l_:
        l.rect(0, 3 if not u else 0, 1, 16, a['contorno'])
    if not r:
        l.rect(15, 3 if not u else 0, 1, 16, a['contorno'])
    return l


def banderola() -> Lienzo:
    """Mástil con un pendón rojo y castillo de oro."""
    l = Lienzo(16, 24)
    l.rect(3, 2, 1, 22, MADERA['oscura'])
    l.pon(3, 1, LONA['oro'])
    for y in range(3, 12):
        ancho = 10 - max(0, y - 7)
        l.rect(4, y, ancho, 1, LONA['roja'])
    l.rect(6, 6, 4, 3, LONA['oro'])
    l.pon(6, 5, LONA['oro'])
    l.pon(9, 5, LONA['oro'])
    l.pon(7, 8, LONA['contorno'])
    l.pon(8, 8, LONA['contorno'])
    return l


# ---------------------------------------------------------------- interiores

def suelo_barro() -> Lienzo:
    b = BARRO
    l = Lienzo(fondo=b['base'])
    for y in range(16):
        for x in range(16):
            bloque = (x // 8, y // 8)
            c = b['base'] if azar(*bloque, 31) < 0.6 else b['oscura']
            if x % 8 == 0 or y % 8 == 0:
                c = b['junta']
            elif x % 8 == 1 or y % 8 == 1:
                c = b['clara'] if c == b['base'] else b['base']
            l.pon(x, y, c)
    return l


def suelo_marmol() -> Lienzo:
    m = MARMOL
    l = Lienzo()
    for y in range(16):
        for x in range(16):
            c = m['blanco'] if ((x // 8) + (y // 8)) % 2 == 0 else m['gris']
            if x % 8 == 7 or y % 8 == 7:
                c = m['junta']
            elif azar(x, y, 41) < 0.05:
                c = m['veta']
            l.pon(x, y, c)
    return l


def suelo_tablas() -> Lienzo:
    m = MADERA
    l = Lienzo()
    for y in range(16):
        for x in range(16):
            c = m['clara'] if (y // 4) % 2 == 0 else mezcla(m['clara'], m['media'], 0.4)
            if y % 4 == 3:
                c = m['oscura']
            elif (x + (y // 4) * 6) % 16 == 0:
                c = m['oscura']
            l.pon(x, y, c)
    return l


def pared_interior(estilo: str, pos: str) -> Lienzo:
    """
    Paredes de interior. `pos`: 'cara' (fila de arriba, la pared que se ve de frente), 'borde' (los
    lados y la fila de abajo, vistos desde arriba), 'esquina_i' y 'esquina_d' (los extremos de la cara).
    """
    l = Lienzo()
    if pos == 'borde':
        tope = {'meson': MADERA['contorno'], 'patio': rgb(70, 52, 46), 'pabellon': LONA['roja_osc'],
                'alcazar': PIEDRA_GRIS['junta']}[estilo]
        l.rect(0, 0, 16, 16, tope)
        return l
    if estilo == 'meson':
        m, c = MADERA, CAL
        l.rect(0, 0, 16, 3, m['oscura'])
        l.rect(0, 2, 16, 1, m['contorno'])
        l.rect(0, 3, 16, 6, c['blanco'])
        l.rect(0, 3, 16, 1, c['sombra'])
        for y in range(9, 15):
            for x in range(16):
                l.pon(x, y, m['oscura'] if x % 4 == 0 else (m['media'] if y > 9 else m['clara']))
        l.rect(0, 15, 16, 1, m['contorno'])
    elif estilo == 'patio':
        a = AZULEJO
        l.rect(0, 0, 16, 2, rgb(110, 76, 56))
        l.rect(0, 2, 16, 5, rgb(240, 224, 196))
        # Yesería: rombos en relieve.
        for y in range(2, 7):
            for x in range(16):
                if (x + y) % 4 == 0 or (x - y) % 4 == 0:
                    l.pon(x, y, rgb(214, 194, 160))
        # Alicatado: estrellas de colores sobre blanco.
        for y in range(7, 15):
            for x in range(16):
                xx, yy = x % 8, (y - 7) % 8
                c = a['blanco']
                if xx in (3, 4) or yy in (3, 4):
                    c = a['verde'] if (x // 8) % 2 == 0 else a['azul']
                if xx in (3, 4) and yy in (3, 4):
                    c = a['ocre']
                if xx == 0 or yy == 0:
                    c = a['negro']
                l.pon(x, y, c)
        l.rect(0, 15, 16, 1, a['negro'])
    elif estilo == 'alcazar':
        # Sillería gris.
        p = PIEDRA_GRIS
        for y in range(16):
            for x in range(16):
                fila = y // 4
                c = p['media'] if (x // 8 + fila) % 2 else p['clara']
                if y % 4 == 3 or (x + (fila % 2) * 4) % 8 == 0:
                    c = p['junta']
                l.pon(x, y, c)
        l.rect(0, 0, 16, 2, p['junta'])
        l.rect(0, 15, 16, 1, OSCURO)
    else:  # pabellón
        a = LONA
        for y in range(16):
            for x in range(16):
                franja = (x // 4) % 2 == 0
                l.pon(x, y, a['roja'] if franja else a['crema'])
        for x in range(16):
            l.pon(x, 0, a['contorno'])
            l.pon(x, 1, a['oro'])
            l.pon(x, 2, a['oro'] if x % 4 in (1, 2) else a['roja_osc'])
        l.rect(0, 14, 16, 2, a['roja_osc'])
    if pos == 'esquina_i':
        l.rect(0, 0, 2, 16, OSCURO)
    if pos == 'esquina_d':
        l.rect(14, 0, 2, 16, OSCURO)
    return l


def felpudo(base: Lienzo) -> Lienzo:
    l = Lienzo()
    l.pega(base)
    l.rect(2, 4, 12, 10, rgb(150, 60, 50))
    l.rect(3, 5, 10, 8, rgb(196, 84, 64))
    for x in range(3, 13, 2):
        l.pon(x, 8, rgb(236, 188, 76))
    l.rect(0, 15, 16, 1, OSCURO)
    return l


def mostrador(l_: bool, r: bool, adorno: int) -> Lienzo:
    m = MADERA
    l = Lienzo()
    l.rect(0, 2, 16, 7, m['clara'])
    l.rect(0, 2, 16, 1, m['contorno'])
    l.rect(0, 8, 16, 1, m['oscura'])
    for y in range(9, 15):
        for x in range(16):
            l.pon(x, y, m['oscura'] if x % 5 == 0 else m['media'])
    l.rect(0, 15, 16, 1, m['contorno'])
    if not l_:
        l.rect(0, 2, 1, 14, m['contorno'])
    if not r:
        l.rect(15, 2, 1, 14, m['contorno'])
    if adorno == 1:  # jarra
        l.dibujo(5, 0, ['.cc.', 'cbbc', 'cbbc', 'cbbc', '.cc.'], {'c': MADERA['contorno'], 'b': rgb(214, 120, 76)})
    elif adorno == 2:  # queso
        l.dibujo(8, 3, ['.ccc.', 'cyyyc', 'cyyyc', '.ccc.'], {'c': MADERA['contorno'], 'y': rgb(244, 210, 112)})
    return l


def estanteria() -> Lienzo:
    m = MADERA
    l = Lienzo(16, 32)
    l.rect(0, 0, 16, 32, m['contorno'])
    l.rect(1, 1, 14, 30, m['oscura'])
    for y in (10, 20, 29):
        l.rect(1, y, 14, 2, m['clara'])
    # Tarros, botellas y una ristra de ajos.
    tarro = ['.cc.', 'cbbc', 'cbbc', '.cc.']
    l.dibujo(2, 6, tarro, {'c': m['contorno'], 'b': rgb(214, 120, 76)})
    l.dibujo(8, 6, tarro, {'c': m['contorno'], 'b': rgb(90, 140, 200)})
    l.dibujo(3, 13, ['.c.', '.c.', 'cgc', 'cgc', 'cgc', 'cgc', 'ccc'], {'c': m['contorno'], 'g': rgb(70, 140, 80)})
    l.dibujo(9, 15, ['.cc.', 'cyyc', 'cyyc', '.cc.'], {'c': m['contorno'], 'y': rgb(244, 210, 112)})
    for y in range(22, 28):
        l.pon(5 + (y % 2), y, rgb(240, 232, 214))
        l.pon(10, y, rgb(214, 120, 76))
        l.pon(11, y, rgb(214, 120, 76))
    return l


def barril() -> Lienzo:
    m = MADERA
    l = Lienzo()
    l.rect(3, 3, 10, 12, m['media'])
    for x in range(3, 13, 3):
        l.rect(x, 3, 1, 12, m['oscura'])
    l.rect(3, 5, 10, 1, rgb(70, 70, 80))
    l.rect(3, 12, 10, 1, rgb(70, 70, 80))
    l.rect(3, 2, 10, 3, m['clara'])
    l.rect(4, 3, 8, 1, m['media'])
    l.contorno(m['contorno'])
    return l


def columna() -> Lienzo:
    m = MARMOL
    l = Lienzo(16, 32)
    # Capitel cúbico, fuste fino con anillos y basa.
    l.rect(4, 2, 8, 6, m['blanco'])
    l.rect(4, 6, 8, 2, m['junta'])
    for x in range(5, 11, 2):
        l.pon(x, 4, m['veta'])
    l.rect(6, 8, 4, 20, m['blanco'])
    l.rect(8, 8, 2, 20, m['gris'])
    l.rect(6, 9, 4, 1, m['junta'])
    l.rect(6, 26, 4, 1, m['junta'])
    l.rect(5, 27, 6, 3, m['gris'])
    l.contorno(PIEDRA['oscura'])
    return l


def leon() -> Lienzo:
    """León de mármol de la fuente, sentado y de frente, con su melena."""
    p = dict(o=rgb(118, 100, 80), m=rgb(198, 176, 138), f=rgb(238, 228, 206), e=OSCURO, n=rgb(214, 198, 168))
    l = Lienzo(8, 10)
    l.dibujo(0, 0, [
        '.oooooo.',
        'ommmmmmo',
        'omffffmo',
        'omeffemo',
        'omfnnfmo',
        '.omffmo.',
        '.offffo.',
        '.ofnnfo.',
        '.ofoofo.',
        '.oo..oo.',
    ], p)
    return l


def surtidor() -> Lienzo:
    """Taza central de la fuente con el chorro."""
    m, a = MARMOL, AGUA
    l = Lienzo(16, 20)
    l.dibujo(0, 0, [
        '.......e........',
        '......ece.......',
        '.....e.c.e......',
        '....e..c..e.....',
        '...e...c...e....',
        '.......c........',
        '..oooooooooooo..',
        '.obbbbbbbbbbbbo.',
        'obaaaaaaaaaaaabo',
        '.obbbbbbbbbbbbo.',
        '..oooooooooooo..',
        '.....obbbbo.....',
        '......obbo......',
        '......obbo......',
        '......obbo......',
        '.....obbbbo.....',
        '....obbbbbbo....',
        '....oooooooo....',
    ], {'o': PIEDRA['oscura'], 'b': m['blanco'], 'a': a['clara'], 'e': a['espuma'], 'c': a['clara']})
    return l


# ---------------------------------------------------------------- objetos sueltos

def tinaja(abierta: bool) -> Lienzo:
    t = dict(c=rgb(98, 44, 30), o=rgb(160, 74, 46), m=rgb(204, 108, 64), l=rgb(232, 150, 100), b=rgb(246, 190, 140),
             n=OSCURO, w=MADERA['media'], x=MADERA['clara'])
    l = Lienzo()
    filas = [
        '....cccccc....',
        '...cxxxxxxc...',
        '...cwwwwwwc...',
        '....cmmmmc....',
        '...cmllmmoc...',
        '..cmlbllmmoc..',
        '..cmlllmmmoc..',
        '..cmllmmmooc..',
        '..cmmmmmmooc..',
        '...cmmmmooc...',
        '...cmmmoooc...',
        '....cmmooc....',
        '.....cccc.....',
    ]
    if abierta:
        filas[0] = '..............'
        filas[1] = '....cccccc....'
        filas[2] = '...cnnnnnnc...'
    l.dibujo(1, 3, filas, t)
    return l


def cartel() -> Lienzo:
    m = MADERA
    l = Lienzo()
    l.dibujo(0, 2, [
        '..cccccccccccc..',
        '.cxxxxxxxxxxxxc.',
        '.cxmmmmmmmmmmxc.',
        '.cxmxxxxmxxxmxc.',
        '.cxmmmmmmmmmmxc.',
        '.cxxxxxxxxxxxxc.',
        '..cccccccccccc..',
        '.......cc.......',
        '.......cm.......',
        '.......cm.......',
        '.......cm.......',
        '......cccc......',
    ], {'c': m['contorno'], 'x': m['clara'], 'm': m['media']})
    return l


def puente() -> Lienzo:
    """Tablas de madera de lado a lado, con barandas: el camino cruza la acequia de norte a sur."""
    m = MADERA
    l = Lienzo()
    for y in range(16):
        for x in range(2, 14):
            c = m['clara'] if y % 4 in (0, 1) else m['media']
            if y % 4 == 3:
                c = m['oscura']
            l.pon(x, y, c)
    for x in (1, 14):
        l.rect(x, 0, 1, 16, m['contorno'])
    l.rect(2, 0, 1, 16, m['oscura'])
    l.rect(13, 0, 1, 16, m['oscura'])
    for y in (1, 8):
        l.rect(1, y, 2, 2, m['clara'])
        l.rect(13, y, 2, 2, m['clara'])
    return l


def cascada(fotograma: int) -> Lienzo:
    """Agua que cae entre dos labios de granito. Las vetas de espuma bajan 4 píxeles por fotograma."""
    a, p = AGUA, PIEDRA_GRIS
    l = Lienzo()
    for y in range(PX):
        for x in range(PX):
            if x <= 1 or x >= 14:
                borde = x in (1, 14)
                c = p['junta'] if borde else (p['media'] if azar(x, y, 41) < 0.6 else p['oscura'])
                l.pon(x, y, c)
                continue
            fase = int(azar(x, 0, 43) * 8)
            k = (y - fotograma * 4 + fase) % 8
            if x in (2, 13):
                c = a['honda']
            elif k == 0:
                c = a['espuma']
            elif k < 3:
                c = a['clara']
            else:
                c = a['media']
            l.pon(x, y, c)
    return l


def espuma(fotograma: int) -> Lienzo:
    """Espuma donde la cascada cae en el agua de abajo (se pinta encima del agua)."""
    a = AGUA
    l = Lienzo()
    for y in range(7):
        for x in range(2, 14):
            r = azar(x, y + fotograma * 7, 47)
            umbral = 0.8 - y * 0.11
            if r < umbral:
                l.pon(x, y, a['espuma'] if r < umbral * 0.6 else a['clara'])
    return l


def risco(alto: bool) -> Lienzo:
    """Peña de granito de la sierra: bolos redondeados apiñados. Los bolos salen de puntos repartidos
    al azar que se repiten de un tile a otro, así la peña no tiene costuras. `alto`: con el borde
    de hierba de arriba, cuando no hay más peña encima."""
    p = PIEDRA_GRIS
    semillas = []
    for j in range(3):
        for i in range(3):
            semillas.append((i * 16 / 3 + azar(i, j, 61) * 4, j * 16 / 3 + azar(i, j, 67) * 4))

    def cercanas(x: float, y: float) -> tuple[float, float, tuple[float, float]]:
        ds = []
        for sx, sy in semillas:
            for ox in (-16, 0, 16):
                for oy in (-16, 0, 16):
                    ds.append((math.hypot(x - sx - ox, y - sy - oy), (sx + ox, sy + oy)))
        ds.sort(key=lambda t: t[0])
        return ds[0][0], ds[1][0], ds[0][1]

    l = Lienzo()
    for y in range(PX):
        for x in range(PX):
            d1, d2, (sx, sy) = cercanas(x + 0.5, y + 0.5)
            if d2 - d1 < 1.1:
                c = p['junta']
            else:
                # Luz desde arriba a la izquierda dentro de cada bolo.
                luz = -((x + 0.5 - sx) * 0.6 + (y + 0.5 - sy) * 0.8) / 4
                c = p['clara'] if luz > 0.45 else p['media'] if luz > -0.35 else p['oscura']
            l.pon(x, y, c)
    if alto:
        h = HIERBA
        for x in range(PX):
            fin = 3 + (1 if azar(x, 0, 51) < 0.4 else 0)
            for y in range(fin):
                l.pon(x, y, h['base'] if y < fin - 1 else h['sombra'])
            l.pon(x, fin, rgb(60, 70, 66))
    return l


def pino() -> Lienzo:
    """Pino de la sierra de Guadarrama, en pisos de ramas, más alto y oscuro que los árboles de la Vega."""
    pal = dict(contorno=rgb(16, 52, 44), oscura=rgb(30, 86, 62), media=rgb(46, 118, 76), clara=rgb(80, 152, 92))
    l = Lienzo(20, 34)
    l.rect(9, 26, 3, 7, rgb(116, 76, 52))
    l.rect(11, 26, 1, 7, rgb(80, 52, 38))
    l.rect(7, 32, 7, 1, rgb(80, 52, 38))
    for y0, y1, ancho in [(1, 10, 4.5), (6, 16, 6.5), (11, 22, 8.0), (16, 28, 9.4)]:
        for y in range(y0, y1):
            t = (y - y0) / (y1 - y0 - 1)
            medio = 0.8 + (ancho - 0.8) * t
            for x in range(20):
                dx = x + 0.5 - 10
                if abs(dx) > medio:
                    continue
                lado = dx / medio
                c = pal['clara'] if lado < -0.35 else pal['media'] if lado < 0.35 else pal['oscura']
                if y >= y1 - 2 and abs(dx) > medio - 2.5:
                    c = pal['oscura']
                if azar(x, y, 53) < 0.08:
                    c = pal['oscura']
                l.pon(x, y, c)
    l.contorno(pal['contorno'])
    return l


def atalaya() -> Lienzo:
    """Atalaya nazarí de tapial: torre para vigilar la Vega y avisar con humo de día y fuego de noche."""
    t = TAPIAL
    l = Lienzo(20, 46)
    x0, x1, arriba = 3, 16, 9
    for y in range(arriba, 45):
        for x in range(x0, x1 + 1):
            c = t['clara'] if x < x0 + 4 else t['media'] if x < x1 - 3 else t['oscura']
            if (y - arriba) % 6 == 5:
                c = mezcla(c, t['contorno'], 0.35)
            elif (y - arriba) % 6 == 2 and (x + ((y - arriba) // 6) * 3) % 7 == 0:
                c = mezcla(c, t['contorno'], 0.55)
            l.pon(x, y, c)
    # Almenas.
    for x in range(x0 - 1, x1 + 2):
        hueco = (x - (x0 - 1)) % 5 in (3, 4)
        for y in range(arriba - 4, arriba):
            if not hueco:
                l.pon(x, y, t['clara'] if x < x0 + 4 else t['media'])
    l.rect(x0 - 1, arriba, x1 - x0 + 3, 1, t['oscura'])
    # Saetera y puerta alta, como en las atalayas reales: se subía con una escala.
    l.rect(9, 18, 2, 5, t['contorno'])
    l.rect(8, 30, 4, 6, rgb(70, 50, 40))
    l.rect(9, 29, 2, 1, rgb(70, 50, 40))
    l.contorno(t['contorno'])
    return l


def noria(fotograma: int) -> Lienzo:
    """Noria de madera con sus cangilones de barro, que sube el agua de la acequia. La rueda tiene
    ocho radios: cuatro fotogramas de 11,25° dan una vuelta continua."""
    m = MADERA
    l = Lienzo(28, 30)
    cx, cy, R = 14, 13, 11.5
    giro = fotograma * (math.pi / 4) / 4
    for y in range(l.h):
        for x in range(l.w):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if R - 2 <= d <= R:
                l.pon(x, y, m['clara'] if y < cy - 3 else m['media'] if y < cy + 4 else m['oscura'])
    for k in range(8):
        ang = giro + k * math.pi / 4
        for paso in range(int(R * 10) - 15):
            r = paso / 10
            l.pon(int(cx + r * math.cos(ang)), int(cy + r * math.sin(ang)), m['oscura'])
    for k in range(8):
        ang = giro + k * math.pi / 4 + math.pi / 8
        px, py = int(cx + (R - 1) * math.cos(ang)), int(cy + (R - 1) * math.sin(ang))
        l.rect(px - 1, py - 1, 3, 3, rgb(196, 108, 60))
        l.pon(px - 1, py - 1, rgb(232, 152, 96))
    l.rect(cx - 1, cy - 1, 3, 3, m['contorno'])
    # Los dos pies de piedra donde apoya el eje.
    for x in (2, 23):
        l.rect(x, cy, 3, l.h - cy, PIEDRA['media'])
        l.rect(x + 2, cy, 1, l.h - cy, PIEDRA['oscura'])
    l.rect(2, cy - 1, 24, 2, m['media'])
    l.contorno(m['contorno'])
    return l


def zurron() -> Lienzo:
    """Zurrón de cuero con hebilla: los objetos que se ven en el suelo (MT y otros)."""
    l = Lienzo()
    l.dibujo(0, 0, [
        '................',
        '................',
        '................',
        '......aaaa......',
        '.....a....a.....',
        '....bbbbbbbb....',
        '...bcccccccdb...',
        '...bccccccccb...',
        '...bddddoddddb..',
        '...beeeeoeeeb...',
        '...beeeeeeeeb...',
        '...beeeeeeefb...',
        '...bfeeeeeefb...',
        '....bffffffb....',
        '.....bbbbbb.....',
        '................',
    ], {
        'a': rgb(92, 56, 30),
        'b': rgb(58, 34, 20),
        'c': rgb(206, 148, 84),
        'd': rgb(150, 96, 52),
        'e': rgb(176, 116, 62),
        'f': rgb(128, 80, 42),
        'o': rgb(250, 208, 72),
    })
    return l


def sombra() -> Lienzo:
    l = Lienzo(16, 8)
    for y in range(8):
        for x in range(16):
            if ((x + 0.5 - 8) / 6.5) ** 2 + ((y + 0.5 - 4) / 2.6) ** 2 <= 1:
                l.pon(x, y, (0, 0, 0, 70))
    return l


# ---------------------------------------------------------------- hoja

class Hoja:
    """Coloca piezas de tamaño múltiplo de 16 en una rejilla y apunta dónde queda cada una."""

    def __init__(self, columnas: int = 24):
        self.columnas = columnas
        self.ocupado: set[tuple[int, int]] = set()
        self.piezas: list[tuple[str, Lienzo, int, int]] = []

    def pon(self, nombre: str, l: Lienzo) -> None:
        cw, ch = math.ceil(l.w / PX), math.ceil(l.h / PX)
        fila = 0
        while True:
            for col in range(self.columnas - cw + 1):
                celdas = {(col + i, fila + j) for i in range(cw) for j in range(ch)}
                if not celdas & self.ocupado:
                    self.ocupado |= celdas
                    self.piezas.append((nombre, l, col * PX, fila * PX))
                    return
            fila += 1

    def guardar(self, png: Path, js: Path) -> Image.Image:
        filas = max(f for _, f in self.ocupado) + 1
        im = Image.new('RGBA', (self.columnas * PX, filas * PX), (0, 0, 0, 0))
        datos = {}
        for nombre, l, x, y in self.piezas:
            im.paste(l.im, (x, y))
            datos[nombre] = [x, y, l.w, l.h]
        im.save(png, optimize=True)
        js.write_text(json.dumps({'px': PX, 'piezas': datos}, indent=0, ensure_ascii=False) + '\n')
        return im


def construir() -> Hoja:
    h = Hoja()
    for v in range(4):
        h.pon(f'hierba.{v}', hierba(v))
    for v in range(4):
        h.pon(f'hierba_meseta.{v}', hierba(v, HIERBA_MESETA))
    h.pon('hierba_alta', hierba_alta())
    h.pon('hierba_alta.delante', hierba_alta_delante())
    h.pon('trigal', trigal())
    h.pon('trigal.delante', trigal_delante())
    for v in range(3):
        h.pon(f'flores.{v}', flores(v))

    def pon_material(nombre: str, tiles: dict[str, Lienzo]) -> None:
        for forma, l in tiles.items():
            h.pon(f'{nombre}.{forma}', l)

    pon_material('camino', material(pinta_camino, margen=2, juego=1, redondeo=3, semilla=100))
    pon_material('empedrado', material(pinta_empedrado, margen=1, juego=0, redondeo=2, semilla=200))
    for f in range(4):
        pon_material(f'acequia.{f}', material(pinta_agua(f), margen=1, juego=0, redondeo=2, semilla=300))
        pon_material(f'fuente.{f}', material(pinta_fuente(f), margen=0, juego=0, redondeo=2, semilla=400))
    pon_material('alfombra', material(pinta_alfombra, margen=0, juego=0, redondeo=1, semilla=500))

    for u in (False, True):
        for d in (False, True):
            for l_ in (False, True):
                for r in (False, True):
                    clave = ''.join('1' if b else '0' for b in (u, d, l_, r))
                    h.pon(f'tejado.{clave}', tejado(u, d, l_, r))
                    h.pon(f'lona.{clave}', lona_exterior(u, d, l_, r, False))
    for l_ in (False, True):
        for r in (False, True):
            clave = ''.join('1' if b else '0' for b in (l_, r))
            for hueco in ('', 'ventana', 'puerta'):
                h.pon(f'fachada.{hueco or "lisa"}.{clave}', fachada(l_, r, hueco))
            h.pon(f'lona.puerta.{clave}', lona_exterior(True, False, l_, r, True))

    for nombre, pal, ladrillo in [('tapial', TAPIAL, False), ('roja', ROJA, True)]:
        for forma in ('horizontal', 'vertical', 'puerta', 'arco'):
            h.pon(f'muro.{nombre}.{forma}', muro(pal, forma, ladrillo))

    h.pon('suelo.barro', suelo_barro())
    h.pon('suelo.marmol', suelo_marmol())
    h.pon('suelo.tablas', suelo_tablas())
    h.pon('suelo.losas', suelo_losas())
    for estilo in ('meson', 'patio', 'pabellon', 'alcazar'):
        for pos in ('cara', 'borde', 'esquina_i', 'esquina_d'):
            h.pon(f'pared.{estilo}.{pos}', pared_interior(estilo, pos))
    for nombre, base in [('barro', suelo_barro()), ('marmol', suelo_marmol()), ('tablas', suelo_tablas()),
                         ('losas', suelo_losas())]:
        h.pon(f'felpudo.{nombre}', felpudo(base))
    for l_ in (False, True):
        for r in (False, True):
            for adorno in range(3):
                h.pon(f'mostrador.{int(l_)}{int(r)}.{adorno}', mostrador(l_, r, adorno))
    h.pon('barril', barril())

    for u in (False, True):
        for d in (False, True):
            for l_ in (False, True):
                for r in (False, True):
                    clave = ''.join('1' if b else '0' for b in (u, d, l_, r))
                    h.pon(f'valla.{clave}', valla(u, d, l_, r))
                    h.pon(f'seto.{clave}', seto(u, d, l_, r))
    pon_material('huerto', material(pinta_huerto, margen=1, juego=0, redondeo=2, semilla=600))
    h.pon('arbol', arbol())
    h.pon('encina', encina())
    h.pon('armadura', armadura())
    h.pon('armero', armero())
    h.pon('naranjo', naranjo())
    h.pon('pozo', pozo())
    h.pon('arbusto', arbusto())
    h.pon('cipres', cipres())
    h.pon('olivo', olivo())
    h.pon('roca', roca())
    h.pon('estanteria', estanteria())
    h.pon('columna', columna())
    h.pon('leon', leon())
    h.pon('surtidor', surtidor())
    h.pon('banderola', banderola())
    h.pon('tinaja', tinaja(False))
    h.pon('tinaja.abierta', tinaja(True))
    h.pon('cartel', cartel())
    h.pon('puente', puente())
    # El mismo puente girado, para cruzar de este a oeste un arroyo que baja de norte a sur.
    girado = Lienzo()
    girado.im = puente().im.transpose(Image.Transpose.TRANSPOSE)
    h.pon('puente.horizontal', girado)
    h.pon('sombra', sombra())
    h.pon('zurron', zurron())
    for f in range(4):
        h.pon(f'cascada.{f}', cascada(f))
        h.pon(f'espuma.{f}', espuma(f))
        h.pon(f'noria.{f}', noria(f))
    h.pon('risco.alto', risco(True))
    h.pon('risco.medio', risco(False))
    h.pon('pino', pino())
    h.pon('atalaya', atalaya())
    return h


def main() -> None:
    h = construir()
    im = h.guardar(SALIDA / 'iberia.png', SALIDA / 'iberia.json')
    if '--muestra' in sys.argv:
        destino = Path(sys.argv[sys.argv.index('--muestra') + 1])
        destino.mkdir(parents=True, exist_ok=True)
        fondo = Image.new('RGBA', im.size, (255, 0, 255, 255))
        fondo.alpha_composite(im)
        fondo.resize((im.width * 4, im.height * 4), Image.NEAREST).save(destino / 'lamina.png')
    print(f'{len(h.piezas)} piezas, {im.width} × {im.height} px')


if __name__ == '__main__':
    main()
