#!/usr/bin/env python3
"""
Mapa de la península para la «zona de captura» del Bestiario, en píxeles grandes, como el mapa
de la región de los juegos de criaturas de GBA. Las costas y fronteras son de Natural Earth
(dominio público); el dibujo es nuestro.

Uso:
    python3 arte/mapa/mapa_iberia.py
        Lee arte/mapa/datos/costas.json y escribe src/assets/mundo/mapa_iberia.png y .json.
    python3 arte/mapa/mapa_iberia.py --costas countries-10m.json
        Antes, saca de un TopoJSON de Natural Earth (paquete npm `world-atlas`) los países que
        se ven en el mapa y los guarda en arte/mapa/datos/costas.json.
    python3 arte/mapa/mapa_iberia.py --muestra D
        Además guarda en D el mapa ampliado.

El JSON de salida trae la proyección (equirectangular con el paralelo 40 como referencia) para
que el juego coloque cada lugar por su latitud y longitud (`src/data/lugares.ts`). Canarias va
en un recuadro abajo a la izquierda, como en los mapas de España.
"""
from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
COSTAS = Path(__file__).resolve().parent / 'datos' / 'costas.json'
SALIDA = RAIZ / 'src' / 'assets' / 'mundo'

# Códigos ISO 3166 numéricos de los países que se ven.
IBERIA = {'724': 'España', '620': 'Portugal', '020': 'Andorra', '292': 'Gibraltar'}
VECINOS = {'250': 'Francia', '504': 'Marruecos', '012': 'Argelia', '732': 'Sáhara Occidental'}

# Vista principal: de Finisterre al cabo de Creus y Menorca, del Cantábrico al estrecho.
ANCHO = 240
ALTO = 196
OESTE = -10.0
ESTE = 4.6
NORTE = 44.2
KX = ANCHO / (ESTE - OESTE)
KY = KX / math.cos(math.radians(40))

# Recuadro de Canarias, a menor escala, en el Atlántico bajo el Algarve: así no tapa Huelva,
# Cádiz ni el estrecho.
CANARIAS = {'oeste': -18.3, 'este': -13.25, 'norte': 29.55, 'sur': 27.55, 'escala': 0.62}

# Paleta: mar con olas, la península en verde y los vecinos en arena.
MAR = (79, 155, 217)
OLA = (117, 182, 234)
ORILLA = (140, 200, 240)
TIERRA = (143, 209, 106)
TIERRA_SOMBRA = (128, 196, 94)
COSTA = (63, 125, 58)
FRONTERA = (78, 138, 60)
VECINO = (216, 207, 156)
VECINO_SOMBRA = (205, 195, 142)
VECINO_COSTA = (154, 140, 85)
MARCO = (38, 50, 79)


def extraer_costas(topo_ruta: str) -> None:
    """Guarda los polígonos (lon, lat) de los países del mapa, con tres decimales."""
    topo = json.loads(Path(topo_ruta).read_text())
    sx, sy = topo['transform']['scale']
    tx, ty = topo['transform']['translate']
    arcos = []
    for arco in topo['arcs']:
        x = y = 0
        puntos = []
        for dx, dy in arco:
            x += dx
            y += dy
            puntos.append((x * sx + tx, y * sy + ty))
        arcos.append(puntos)

    def anillo(indices: list[int]) -> list[list[float]]:
        puntos: list[tuple[float, float]] = []
        for i in indices:
            a = arcos[i] if i >= 0 else arcos[~i][::-1]
            puntos.extend(a if not puntos else a[1:])
        limpio: list[list[float]] = []
        for lon, lat in puntos:
            p = [round(lon, 3), round(lat, 3)]
            if not limpio or limpio[-1] != p:
                limpio.append(p)
        return limpio

    def dentro(anillo_: list[list[float]]) -> bool:
        lons = [p[0] for p in anillo_]
        lats = [p[1] for p in anillo_]
        vista = max(lons) >= OESTE - 2 and min(lons) <= ESTE + 2 and max(lats) >= 33 and min(lats) <= NORTE + 2
        islas = max(lons) >= CANARIAS['oeste'] - 1 and min(lons) <= CANARIAS['este'] + 1 and max(lats) >= CANARIAS['sur'] - 1 and min(lats) <= CANARIAS['norte'] + 1
        return vista or islas

    paises = {}
    for g in topo['objects']['countries']['geometries']:
        if g.get('id') not in IBERIA and g.get('id') not in VECINOS:
            continue
        poligonos = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
        anillos = [anillo(p[0]) for p in poligonos]
        paises[g['id']] = [a for a in anillos if len(a) >= 3 and dentro(a)]
    COSTAS.parent.mkdir(parents=True, exist_ok=True)
    COSTAS.write_text(json.dumps({'fuente': 'Natural Earth 4.1.0, 1:10m (world-atlas 2.0.2). Dominio público.', 'paises': paises}, separators=(',', ':')))
    print(f'Costas: {COSTAS} ({COSTAS.stat().st_size // 1024} KB)')


def proyectar(lon: float, lat: float) -> tuple[float, float]:
    return (lon - OESTE) * KX, (NORTE - lat) * KY


def recuadro_canarias() -> dict:
    kx = KX * CANARIAS['escala']
    ky = kx / math.cos(math.radians(28.5))
    ancho = math.ceil((CANARIAS['este'] - CANARIAS['oeste']) * kx) + 2
    alto = math.ceil((CANARIAS['norte'] - CANARIAS['sur']) * ky) + 2
    return {'nombre': 'Canarias', 'x': 2, 'y': ALTO - alto - 2, 'ancho': ancho, 'alto': alto, 'kx': kx, 'ky': ky, **{k: CANARIAS[k] for k in ('oeste', 'este', 'norte', 'sur')}}


def rasterizar(paises: dict, proyeccion, ancho: int, alto: int, sub: int = 4, umbral: float = 0.4) -> list[list[str | None]]:
    """País de cada píxel, con submuestreo: un píxel es tierra si lo es al menos `umbral`."""
    grande = Image.new('L', (ancho * sub, alto * sub), 0)
    dibujo = ImageDraw.Draw(grande)
    codigos = list(paises)
    for n, codigo in enumerate(codigos, start=1):
        for anillo in paises[codigo]:
            pts = [proyeccion(lon, lat) for lon, lat in anillo]
            dibujo.polygon([(x * sub, y * sub) for x, y in pts], fill=n)
    datos = grande.load()
    celdas: list[list[str | None]] = []
    for y in range(alto):
        fila = []
        for x in range(ancho):
            cuenta: dict[int, int] = {}
            for dy in range(sub):
                for dx in range(sub):
                    v = datos[x * sub + dx, y * sub + dy]
                    if v:
                        cuenta[v] = cuenta.get(v, 0) + 1
            total = sum(cuenta.values())
            fila.append(codigos[max(cuenta, key=cuenta.get) - 1] if total >= umbral * sub * sub else None)
        celdas.append(fila)
    return celdas


def pintar(img: Image.Image, celdas: list[list[str | None]], ox: int, oy: int, semilla: int) -> None:
    alto = len(celdas)
    ancho = len(celdas[0])
    azar = random.Random(semilla)
    px = img.load()

    def en(x: int, y: int) -> str | None:
        return celdas[y][x] if 0 <= x < ancho and 0 <= y < alto else None

    for y in range(alto):
        for x in range(ancho):
            c = celdas[y][x]
            vecinos = [en(x + 1, y), en(x - 1, y), en(x, y + 1), en(x, y - 1)]
            if c is None:
                junto = any(v is not None for v in vecinos)
                ola = y % 6 == 0 and (x + (y // 6) * 3) % 9 in (0, 1, 2)
                color = ORILLA if junto else OLA if ola else MAR
            else:
                propio = c in IBERIA
                if any(v is None for v in vecinos):
                    color = COSTA if propio else VECINO_COSTA
                elif any(v != c for v in vecinos) and (x + y) % 2 == 0:
                    color = FRONTERA if propio else VECINO_COSTA
                else:
                    sombra = azar.random() < 0.08
                    color = (TIERRA_SOMBRA if sombra else TIERRA) if propio else (VECINO_SOMBRA if sombra else VECINO)
            px[ox + x, oy + y] = color + (255,)


def main() -> None:
    args = sys.argv[1:]
    if '--costas' in args:
        extraer_costas(args[args.index('--costas') + 1])
    paises = json.loads(COSTAS.read_text())['paises']
    img = Image.new('RGBA', (ANCHO, ALTO))
    pintar(img, rasterizar(paises, proyectar, ANCHO, ALTO), 0, 0, 1492)

    rc = recuadro_canarias()
    def proyectar_canarias(lon: float, lat: float) -> tuple[float, float]:
        return 1 + (lon - rc['oeste']) * rc['kx'], 1 + (rc['norte'] - lat) * rc['ky']
    islas = {k: v for k, v in paises.items() if k == '724'}
    # Más permisivo con la tierra: si no, El Hierro y La Gomera desaparecen.
    caja = rasterizar(islas, proyectar_canarias, rc['ancho'], rc['alto'], umbral=0.25)
    pintar(img, caja, rc['x'], rc['y'], 1797)
    dibujo = ImageDraw.Draw(img)
    dibujo.rectangle([rc['x'] - 1, rc['y'] - 1, rc['x'] + rc['ancho'], rc['y'] + rc['alto']], outline=MARCO + (255,))

    SALIDA.mkdir(parents=True, exist_ok=True)
    img.save(SALIDA / 'mapa_iberia.png')
    meta = {
        'ancho': ANCHO,
        'alto': ALTO,
        'principal': {'oeste': OESTE, 'norte': NORTE, 'kx': KX, 'ky': KY},
        'canarias': rc,
    }
    (SALIDA / 'mapa_iberia.json').write_text(json.dumps(meta, indent=2) + '\n')
    print(f'Mapa: {SALIDA / "mapa_iberia.png"} ({ANCHO} × {ALTO})')
    if '--muestra' in args:
        destino = Path(args[args.index('--muestra') + 1])
        destino.mkdir(parents=True, exist_ok=True)
        img.resize((ANCHO * 4, ALTO * 4), Image.NEAREST).save(destino / 'mapa_iberia_x4.png')


if __name__ == '__main__':
    main()
