#!/usr/bin/env python3
"""
Personajes del mapa de Leyendas de Iberia, al estilo de los juegos de criaturas de GBA: cabeza
grande, contorno oscuro y 16 × 24 píxeles por fotograma. Todo se dibuja aquí, sin recursos de
terceros.

Uso:
    python3 arte/mapa/personajes.py              escribe src/assets/personajes/<aspecto>.png
    python3 arte/mapa/personajes.py --muestra D  además guarda en D una lámina ampliada

Cada hoja tiene 4 columnas (abajo, arriba, izquierda, derecha) y 4 filas (quieto, paso, quieto,
paso con el otro pie). Todos comparten el mismo cuerpo; cada personaje cambia los colores y se pone
su tocado, su ropa (vestido, túnica, capa, delantal) y, si la lleva, barba.

Letras de las plantillas: o contorno, k/K piel, e ojo, h/H pelo, c/C ropa de arriba, w cuello,
p/P calzas, z zapatos, v/V vestido o túnica, t/T tocado, y/Y oro, r joya, m/M metal, b barba,
x/X capa, a delantal. «.» deja lo de debajo; «_» borra.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / 'src' / 'assets' / 'personajes'
W, H = 16, 24

# ---------------------------------------------------------------- cuerpo

CUERPO = {
    'abajo': [
        '................',
        '.....oooooo.....',
        '...oohhhhhhoo...',
        '..ohhhhhhhhhho..',
        '..ohhhhhhhhhho..',
        '.ohhhhhhhhhhhho.',
        '.ohHhhhhhhhhHho.',
        '.ohHkkhhhhkkHho.',
        '.ohkkkkkkkkkkho.',
        '.okkkekkkkekkko.',
        '.okkkekkkkekkko.',
        '.oKkkkkkkkkkkKo.',
        '..oKkkkkkkkkKo..',
        '...ooKkkkkKoo...',
        '....ocwccwco....',
        '..oCccccccccCo..',
        '..oCccccccccCo..',
        '..okCccccccCko..',
        '...oPPPPPPPPo...',
    ],
    'arriba': [
        '................',
        '.....oooooo.....',
        '...oohhhhhhoo...',
        '..ohhhhhhhhhho..',
        '..ohhhhhhhhhho..',
        '.ohhhhhhhhhhhho.',
        '.ohhhhhhhhhhhho.',
        '.ohHhhhhhhhhHho.',
        '.ohHhhhhhhhhHho.',
        '.ohHHhhhhhhHHho.',
        '.okHHhhhhhhHHko.',
        '.oKHHHhhhhHHHKo.',
        '..oHHHHHHHHHHo..',
        '...ooKkkkkKoo...',
        '....occccccо....'.replace('о', 'o'),
        '..oCccccccccCo..',
        '..oCccccccccCo..',
        '..okCccccccCko..',
        '...oPPPPPPPPo...',
    ],
    'izquierda': [
        '................',
        '......oooooo....',
        '....oohhhhhhoo..',
        '...ohhhhhhhhhho.',
        '..ohhhhhhhhhhho.',
        '..ohhhhhhhhhhhho',
        '..okkhhhhhhhhHho',
        '.okkkkhhhhhhHHho',
        '.okkkkkkhhhhHHo.',
        '.okekkkkkhhhHho.',
        'okkekkkkkKhhHho.',
        '.okkkkkkkKkHHo..',
        '..oKkkkkkkKHo...',
        '...ooKkkkKoo....',
        '.....occcco.....',
        '....oCccccCo....',
        '....oCcCccCo....',
        '....oCkkccCo....',
        '....oPPPPPPo....',
    ],
}

PIERNAS = {
    'abajo': {
        'quieto': [
            '...opppoopppo...',
            '...opppoopppo...',
            '...oPPPooPPPo...',
            '...ozzzoozzzo...',
            '....ooo..ooo....',
        ],
        'paso': [
            '...opppoopppo...',
            '...opppoozzzo...',
            '...oPPPo.ooo....',
            '...ozzzo........',
            '....ooo.........',
        ],
    },
    'izquierda': {
        'quieto': [
            '.....oppppo.....',
            '.....oppppo.....',
            '.....oPPPPo.....',
            '....ozzzzzo.....',
            '.....ooooo......',
        ],
        'paso': [
            '....oppppppo....',
            '...opppoopppo...',
            '..oPPPo..oPPPo..',
            '.ozzzo...ozzzo..',
            '..ooo.....ooo...',
        ],
        'paso2': [
            '....oppppppo....',
            '...oPPPoopppo...',
            '..oPPPo..opppo..',
            '.ozzzo...ozzzo..',
            '..ooo.....ooo...',
        ],
    },
}
PIERNAS['arriba'] = PIERNAS['abajo']

FALDA = {
    'abajo': [
        '...ovvvvvvvvo...',
        '..ovvvvvvvvvvo..',
        '..ovvVvvvvVvvo..',
        '.ovvVvvvvvvVvvo.',
        '.ovVVvvvvvvVVvo.',
        '..oooozoozoooo..',
    ],
    'izquierda': [
        '....ovvvvvvo....',
        '....ovvvvvvvo...',
        '...ovvvvvvvvo...',
        '...ovVvvvvvVvo..',
        '..ovVvvvvvvVvo..',
        '..oozzoooooooo..',
    ],
}
FALDA['arriba'] = [f.replace('z', 'o') for f in FALDA['abajo']]

# ---------------------------------------------------------------- tocados y ropa
# Cada pieza: dirección → (columna, fila, filas). La izquierda se refleja para la derecha.

TOCADOS = {
    'corona': {
        'abajo': (3, 0, ['.y..yy..y.', '.yyyyyyyy.', 'oYyryyryYo']),
        'arriba': (3, 0, ['.y..yy..y.', '.yyyyyyyy.', 'oYyyyyyyYo']),
        'izquierda': (4, 0, ['.y..yy..y.', '.yyyyyyyy.', 'oYryyyyyYo']),
    },
    'turbante': {
        'abajo': (0, 0, [
            '.....oooooo.....',
            '...ootttttToo...',
            '..otttTttttTTo..',
            '.otttttTtttttTo.',
            '.oTttttyrytttTo.',
            '.otTtttyyytttTo.',
            '.oTTttttttttTTo.',
            '..oTTTTTTTTTTo..',
        ]),
        'arriba': (0, 0, [
            '.....oooooo.....',
            '...ootttttToo...',
            '..otttTttttTTo..',
            '.otttttTtttttTo.',
            '.oTttttTttttTTo.',
            '.otTtttTtttTTTo.',
            '.oTTttttttttTTo.',
            '..oTTTTTTTTTTo..',
        ]),
        'izquierda': (0, 0, [
            '......oooooo....',
            '....ootttttToo..',
            '...otttTttttTTo.',
            '..otttttTttttTo.',
            '.oyrytttTtttTTTo',
            '.oyyyttttTtttTTo',
            '.oTTtttttttttTTo',
            '..oTTTTTTTTTTTo.',
        ]),
    },
    'capacete': {
        'abajo': (0, 0, [
            '.....oooooo.....',
            '...oommmmmMoo...',
            '..ommwmmmmmMMo..',
            '..omwmmmmmmmMo..',
            '.ommmmmmmmmmmMo.',
            '.ommmmmmmmmmMMo.',
            'oMMMMMMMMMMMMMMo',
            '.oooooooooooooo.',
        ]),
        'izquierda': (0, 0, [
            '......oooooo....',
            '....oommmmmMoo..',
            '...ommwmmmmmMMo.',
            '..omwmmmmmmmmMo.',
            '..ommmmmmmmmmmMo',
            '..ommmmmmmmmmMMo',
            'oMMMMMMMMMMMMMMo',
            '.oooooooooooooo.',
        ]),
    },
    'sombrero': {
        'abajo': (0, 0, [
            '................',
            '.....oooooo.....',
            '....otttttTo....',
            '....otttttTo....',
            '....oTTTTTTo....',
            '.oooottttttoooo.',
            'otttttttttttttTo',
            '.oooooooooooooo.',
        ]),
        'izquierda': (0, 0, [
            '................',
            '......oooooo....',
            '.....otttttTo...',
            '.....otttttTo...',
            '.....oTTTTTTo...',
            '.ooooottttttooo.',
            'otttttttttttttTo',
            '.oooooooooooooo.',
        ]),
    },
    'gorro': {
        'abajo': (0, 0, [
            '................',
            '....oooooooo....',
            '...otttttttTo...',
            '..otttttttTTTo..',
            '..oTTTTTTTTTTo..',
            '..oooooooooooo..',
        ]),
        'izquierda': (0, 0, [
            '................',
            '.....oooooooo...',
            '....otttttttTo..',
            '...otttttttTTTo.',
            '..oTTTTTTTTTTTTo',
            '..ooooooooooooo.',
        ]),
    },
    'capucha': {
        'abajo': (0, 0, [
            '.....oooooo.....',
            '...oottttttoo...',
            '..ottttttttttо..'.replace('о', 'o'),
            '.otttttttttttTo.',
            '.otttttttttttTo.',
            '.ottTttttttTtTo.',
            '.otTkkhhhhkkTTo.',
            '.otkkkkkkkkkkTo.',
            '.otkkkkkkkkkkTo.',
        ]),
        'arriba': (0, 0, [
            '.....oooooo.....',
            '...oottttttoo...',
            '..ottttttttttо..'.replace('о', 'o'),
            '.otttttttttttTo.',
            '.otttttttttttTo.',
            '.ottTttttttTtTo.',
            '.otTTttttttTTTo.',
            '.otTTttttttTTTo.',
            '.otTTTttttTTTTo.',
            '.oTTTTTTTTTTTTo.',
            '.oTTTTTTTTTTTTo.',
            '..oTTTTTTTTTTo..',
        ]),
        'izquierda': (0, 0, [
            '......oooooo....',
            '....oottttttoo..',
            '...otttttttttTo.',
            '..ottttttttttTTo',
            '..otttttttttttTo',
            '..okkttttttttTTo',
            '..okkkttttttTTTo',
            '.okkkkkkttttTTTo',
            '.okkkkkkkttTTTo.',
            '.okekkkkkttTTTo.',
            'okkekkkkktTTTTo.',
            '.okkkkkkkkTTTo..',
        ]),
    },
}
for _t in ('capacete', 'sombrero', 'gorro'):
    TOCADOS[_t]['arriba'] = TOCADOS[_t]['abajo']

BARBA = {
    'abajo': (0, 10, [
        '..b..........b..',
        '..bb........bb..',
        '...bbbkkkkbbb...',
        '...obbbbbbbbo...',
        '....obbbbbbo....',
    ]),
    'izquierda': (0, 11, [
        '..kbbbb.........',
        '..obbbbbb.......',
        '...obbbbbo......',
        '.....obbbo......',
    ]),
}

MELENA = {
    'abajo': (0, 11, ['.h............h.', '.ho..........oh.', '.ho..........oh.', '..o..........o..']),
    'arriba': (0, 13, ['...ohhhhhhhho...', '..ohhhhhhhhhho..', '..oHhhhhhhhhHo..', '...oHHHHHHHHo...']),
    'izquierda': (0, 11, ['..........hHHo..', '.........ohHHo..', '.........ohHo...', '..........oo....']),
}

DELANTAL = {
    'abajo': (0, 15, ['.....aaaaaa.....', '.....aaaaaa.....', '.....aaaaaa.....', '....oaaaaaao....',
                      '....aaaaaaaa....', '....aaaaaaaa....', '....aaaaaaaa....', '....oooooooo....']),
    'izquierda': (0, 15, ['....oaa.........', '....oaa.........', '....oaa.........', '....oaa.........',
                          '...oaaa.........', '...oaaa.........', '..oaaaa.........']),
}

# La capa va detrás del cuerpo de frente y de lado, y encima de espaldas.
CAPA = {
    'abajo': (0, 14, ['.xx..........xx.', '.xX..........Xx.', '.xX..........Xx.', '.xX..........Xx.',
                      '.xX..........Xx.', '.xX..........Xx.', '.xX..........Xx.', '..o..........o..']),
    'arriba': (0, 14, ['..oxxxxxxxxxxo..', '..oxxxxxxxxxxo..', '..oxXxxxxxxXxo..', '.oxxXxxxxxxXxxo.',
                       '.oxxXxxxxxxXxxo.', '.oxXXxxxxxxXXxo.', '.oxXXxxxxxxXXxo.', '..oooooooooooo..']),
    'izquierda': (0, 14, ['.........xxo....', '.........xXxo...', '.........xXXxo..', '.........xXXxo..',
                          '.........xXXXxo.', '.........xXXXxo.', '.........xXXXxo.', '..........ooooo.']),
}

# ---------------------------------------------------------------- personajes

PIEL = {
    'clara': ((250, 214, 182), (226, 172, 140)),
    'morena': ((222, 168, 124), (186, 128, 92)),
    'tostada': ((204, 144, 104), (164, 106, 74)),
}


def tono(c: tuple, f: float) -> tuple:
    return tuple(max(0, min(255, round(v * f))) for v in c)


def personaje(piel='clara', pelo=(110, 70, 44), ropa=(70, 110, 190), calzas=(96, 72, 56), zapatos=(70, 50, 40),
              cuello=None, tocado=None, color_tocado=(200, 50, 50), vestido=None, barba=None, melena=False,
              capa=None, delantal=False, ojos=(40, 36, 52)):
    k, kk = PIEL[piel]
    return dict(
        pal={
            'o': (40, 32, 42), 'k': k, 'K': kk, 'e': ojos,
            'h': pelo, 'H': tono(pelo, 0.72),
            'c': ropa, 'C': tono(ropa, 0.74), 'w': cuello or tono(ropa, 1.25),
            'p': calzas, 'P': tono(calzas, 0.75), 'z': zapatos,
            'v': vestido or ropa, 'V': tono(vestido or ropa, 0.74),
            't': color_tocado, 'T': tono(color_tocado, 0.74),
            'y': (246, 200, 64), 'Y': (198, 142, 40), 'r': (220, 40, 60),
            'm': (196, 204, 220), 'M': (128, 138, 164),
            'b': barba or pelo, 'B': tono(barba or pelo, 0.75),
            'x': capa or (0, 0, 0), 'X': tono(capa or (0, 0, 0), 0.72),
            'a': (246, 244, 236),
        },
        tocado=tocado, vestido=vestido is not None, barba=barba is not None, melena=melena,
        capa=capa is not None, delantal=delantal,
    )


PERSONAJES = {
    # El jugador: un muchacho de Granada con gorro rojo y jubón azul.
    'muchacho': personaje(pelo=(104, 66, 40), ropa=(64, 112, 200), tocado='gorro', color_tocado=(214, 52, 56)),
    # Isabel la Católica: blanca, pelo rubio rojizo, corona y vestido carmesí.
    'dama': personaje(pelo=(204, 120, 64), ropa=(176, 32, 52), vestido=(176, 32, 52), cuello=(246, 200, 64),
                      tocado='corona', melena=True),
    # Fernando el Católico: corona, jubón granate y oro.
    'noble': personaje(pelo=(84, 54, 38), ropa=(170, 36, 48), cuello=(246, 200, 64), calzas=(64, 40, 70),
                       tocado='corona', capa=(120, 30, 60)),
    # El Gran Capitán: coraza, capa roja y barba.
    'caballero': personaje(pelo=(66, 46, 36), ropa=(186, 194, 212), cuello=(246, 200, 64), calzas=(120, 36, 40),
                           barba=(66, 46, 36), capa=(200, 40, 48)),
    # Colón: pelo cano, gorro oscuro, jubón granate, calzas y capa de navegante.
    'explorador': personaje(pelo=(224, 222, 220), ropa=(124, 40, 58), calzas=(52, 44, 60), tocado='gorro',
                            color_tocado=(52, 44, 60), capa=(44, 62, 104)),
    # El pastor de Orce: sombrero de ala ancha, zamarra de piel y barba blanca.
    'anciano': personaje(piel='tostada', pelo=(220, 220, 214), ropa=(232, 214, 176), calzas=(124, 92, 62),
                         tocado='sombrero', color_tocado=(132, 94, 56), barba=(236, 236, 230)),
    # La mesonera: toca blanca, vestido pardo y delantal.
    'anciana': personaje(pelo=(240, 238, 232), ropa=(98, 84, 120), vestido=(98, 84, 120), delantal=True),
    # La vecina: pañuelo rojo y vestido verde.
    'mujer': personaje(piel='morena', pelo=(212, 82, 60), ropa=(72, 140, 88), vestido=(72, 140, 88)),
    # Un fraile franciscano: hábito pardo con capucha.
    'monje': personaje(ropa=(126, 92, 64), vestido=(126, 92, 64), tocado='capucha', color_tocado=(126, 92, 64),
                       cuello=(126, 92, 64)),
    # El tendero del mesón: gorro, camisa y delantal.
    'tendero': personaje(piel='morena', pelo=(70, 50, 40), ropa=(196, 156, 96), calzas=(90, 70, 56),
                         tocado='gorro', color_tocado=(150, 100, 60), delantal=True),
    # El ballestero Sancho: capucha y sayo verdes.
    'ballestero': personaje(piel='tostada', pelo=(90, 60, 40), ropa=(76, 118, 66), calzas=(110, 84, 58),
                            tocado='capucha', color_tocado=(66, 104, 58), cuello=(66, 104, 58)),
    # El mercader genovés: bonete rojo y ropa rica azul con cadena de oro.
    'mercader': personaje(pelo=(60, 44, 36), ropa=(70, 70, 168), cuello=(246, 200, 64), calzas=(48, 40, 64),
                          tocado='gorro', color_tocado=(190, 30, 40)),
    # El guardia de la Alhambra: turbante, aljuba roja y zaragüelles claros.
    'guardia_nazari': personaje(piel='morena', pelo=(40, 32, 30), ropa=(186, 44, 44), calzas=(232, 222, 196),
                                tocado='turbante', color_tocado=(244, 240, 228), barba=(40, 32, 30)),
    # Boabdil: turbante con joya, barba y túnica verde y oro.
    'sultan': personaje(piel='morena', pelo=(40, 32, 30), ropa=(40, 122, 84), vestido=(40, 122, 84),
                        cuello=(246, 200, 64), tocado='turbante', color_tocado=(250, 248, 240), barba=(40, 32, 30)),
    # El centinela: capacete y sayo rojo.
    'soldado': personaje(pelo=(70, 50, 40), ropa=(176, 40, 44), cuello=(246, 200, 64), calzas=(70, 60, 60),
                         tocado='capacete'),
    # Gente de la Vega: un labrador con sombrero de paja y una hortelana con pañuelo.
    'labrador': personaje(piel='tostada', pelo=(80, 56, 40), ropa=(226, 210, 172), calzas=(118, 90, 60),
                          tocado='sombrero', color_tocado=(222, 190, 110)),
    'hortelana': personaje(piel='tostada', pelo=(196, 160, 72), ropa=(134, 110, 70), vestido=(134, 110, 70),
                           delantal=True),
    # Gente de la Alhambra: aguador, halconero y jardinero nazaríes.
    'aguador': personaje(piel='morena', pelo=(40, 32, 30), ropa=(70, 120, 180), calzas=(232, 222, 196),
                         tocado='turbante', color_tocado=(236, 230, 214)),
    'halconero': personaje(piel='morena', pelo=(40, 32, 30), ropa=(140, 96, 56), calzas=(90, 70, 50),
                           tocado='turbante', color_tocado=(60, 120, 90), barba=(40, 32, 30)),
    'jardinero': personaje(piel='morena', pelo=(50, 40, 34), ropa=(84, 140, 76), calzas=(232, 222, 196),
                           tocado='sombrero', color_tocado=(210, 176, 96)),
    # Capítulo 2. María Pacheco, de luto y con toca negra; Juan de Padilla, preso tras Villalar,
    # con la coraza abollada y barba; soldados de las Comunidades y del emperador; un espadero.
    'maria_pacheco': personaje(pelo=(60, 40, 34), ropa=(42, 38, 48), vestido=(42, 38, 48), cuello=(240, 236, 226),
                               tocado='gorro', color_tocado=(30, 28, 36)),
    'padilla': personaje(pelo=(56, 40, 32), ropa=(176, 182, 200), cuello=(170, 30, 44), calzas=(150, 30, 42),
                         barba=(56, 40, 32)),
    'comunero': personaje(piel='tostada', pelo=(80, 56, 40), ropa=(160, 36, 48), cuello=(220, 200, 150),
                          calzas=(90, 70, 54), tocado='capacete'),
    'imperial': personaje(pelo=(150, 110, 70), ropa=(232, 226, 210), cuello=(196, 36, 44), calzas=(196, 36, 44),
                          tocado='capacete'),
    'espadero': personaje(piel='morena', pelo=(50, 40, 34), ropa=(150, 116, 86), calzas=(70, 56, 50), tocado='gorro',
                          color_tocado=(70, 56, 46), barba=(50, 40, 34), delantal=True),
    'aldeano': personaje(pelo=(96, 66, 44), ropa=(214, 196, 160), calzas=(110, 80, 56)),
    'aldeano_verde': personaje(piel='tostada', pelo=(60, 44, 34), ropa=(96, 150, 80), calzas=(96, 72, 56)),
    'aldeana': personaje(pelo=(238, 234, 226), ropa=(150, 96, 60), vestido=(150, 96, 60)),
    # Un sabio: pelo y barba grises, túnica negra.
    'maestro': personaje(pelo=(170, 170, 176), ropa=(52, 50, 64), vestido=(52, 50, 64), barba=(186, 186, 192)),
    # Capítulo 3. Felipe II, de negro con gorguera blanca, como en sus retratos; Pedro Menéndez de
    # Avilés, capitán general de la flota, con la capa roja; un marinero, un cantero de las obras
    # de El Escorial y un arriero de Sierra Morena.
    'felipe_ii': personaje(pelo=(196, 160, 100), ropa=(36, 34, 42), cuello=(244, 240, 232), calzas=(30, 28, 36),
                           tocado='gorro', color_tocado=(28, 26, 32), barba=(196, 160, 100), capa=(30, 28, 36)),
    'almirante': personaje(piel='tostada', pelo=(48, 38, 34), ropa=(40, 38, 48), cuello=(240, 236, 226),
                           calzas=(40, 38, 48), barba=(70, 62, 58), capa=(150, 30, 42)),
    'marinero': personaje(piel='tostada', pelo=(80, 56, 40), ropa=(226, 220, 200), calzas=(60, 80, 130),
                          tocado='gorro', color_tocado=(190, 40, 44)),
    'cantero': personaje(piel='tostada', pelo=(90, 64, 44), ropa=(170, 150, 120), calzas=(110, 90, 70),
                         tocado='gorro', color_tocado=(120, 116, 110), barba=(90, 64, 44), delantal=True),
    'arriero': personaje(piel='morena', pelo=(56, 42, 34), ropa=(124, 86, 52), calzas=(70, 56, 46),
                         tocado='sombrero', color_tocado=(70, 50, 40), barba=(56, 42, 34)),
    # Capítulo 4. Felipe IV, rubio y de negro con golilla; el conde-duque de Olivares, moreno y
    # corpulento, con la cruz verde de Alcántara (aquí, el cuello verde); Spínola, canoso, con
    # armadura y la banda roja de general; un soldado de los tercios con morrión; un montero real
    # de verde; un cartujo de El Paular, de blanco, y Velázquez, de negro con golilla.
    'felipe_iv': personaje(pelo=(214, 160, 96), ropa=(34, 32, 40), cuello=(244, 240, 232), calzas=(30, 28, 36),
                           barba=(214, 160, 96)),
    'olivares': personaje(piel='tostada', pelo=(40, 32, 30), ropa=(34, 32, 40), cuello=(244, 240, 232),
                          calzas=(30, 28, 36), barba=(40, 32, 30), capa=(40, 110, 60)),
    'spinola': personaje(pelo=(176, 176, 180), ropa=(70, 74, 86), cuello=(244, 240, 232), calzas=(50, 50, 60),
                         barba=(176, 176, 180), capa=(170, 30, 40)),
    'tercio': personaje(pelo=(70, 50, 40), ropa=(196, 160, 96), cuello=(170, 30, 40), calzas=(110, 80, 56),
                        tocado='capacete', color_tocado=(176, 180, 190), barba=(70, 50, 40)),
    'montero': personaje(piel='tostada', pelo=(80, 56, 40), ropa=(60, 110, 60), calzas=(90, 70, 50),
                         tocado='sombrero', color_tocado=(50, 80, 46), barba=(80, 56, 40)),
    'cartujo': personaje(ropa=(236, 232, 222), vestido=(236, 232, 222), tocado='capucha', color_tocado=(236, 232, 222)),
    'velazquez': personaje(pelo=(40, 32, 30), ropa=(34, 32, 40), cuello=(244, 240, 232), calzas=(30, 28, 36),
                           barba=(40, 32, 30), melena=True),
    # Los rivales: los dos amigos del protagonista, que viajan como él.
    'rival_a': personaje(piel='morena', pelo=(40, 32, 30), ropa=(40, 150, 104), calzas=(70, 60, 50), tocado='sombrero',
                         color_tocado=(120, 84, 52)),
    'rival_b': personaje(pelo=(214, 132, 60), ropa=(150, 84, 196), calzas=(56, 50, 76), melena=True),
}

# ---------------------------------------------------------------- dibujo

DIRS = ['abajo', 'arriba', 'izquierda', 'derecha']


def poner(im: Image.Image, x0: int, y0: int, filas: list[str], pal: dict, espejo: bool = False) -> None:
    for j, fila in enumerate(filas):
        for i, ch in enumerate(fila):
            x = x0 + i
            if espejo:
                x = W - 1 - x
            y = y0 + j
            if not (0 <= x < W and 0 <= y < H) or ch == '.':
                continue
            im.putpixel((x, y), (0, 0, 0, 0) if ch == '_' else (*pal[ch], 255))


def pieza_de(tabla: dict, d: str):
    return tabla.get(d)


def fotograma(p: dict, direccion: str, paso: int) -> Image.Image:
    """`paso`: 0 quieto, 1 un pie, 2 el otro."""
    espejo = direccion == 'derecha'
    d = 'izquierda' if espejo else direccion
    pal = p['pal']
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if p['capa'] and d != 'arriba':
        x, y, filas = CAPA[d]
        poner(im, x, y, filas, pal, espejo)
    poner(im, 0, 0, CUERPO[d], pal, espejo)
    if p['vestido']:
        filas = FALDA[d]
        poner(im, 0, 18, filas, pal, espejo)
        if paso:
            # El bajo del vestido se mece al andar.
            bajo = Image.new('RGBA', (W, 3), (0, 0, 0, 0))
            bajo.paste(im.crop((0, 21, W, 24)), (1 if paso == 1 else -1, 0))
            im.paste(Image.new('RGBA', (W, 3), (0, 0, 0, 0)), (0, 21))
            im.paste(bajo, (0, 21))
    else:
        piernas = PIERNAS[d]
        if paso == 0:
            filas = piernas['quieto']
        elif d == 'izquierda':
            filas = piernas['paso'] if paso == 1 else piernas['paso2']
        else:
            filas = piernas['paso']
        poner(im, 0, 19, filas, pal, espejo != (d != 'izquierda' and paso == 2))
    if p['delantal'] and d != 'arriba':
        x, y, filas = DELANTAL[d]
        poner(im, x, y, filas, pal, espejo)
    if p['melena']:
        x, y, filas = MELENA[d]
        poner(im, x, y, filas, pal, espejo)
    if p['barba'] and d != 'arriba':
        x, y, filas = BARBA[d]
        poner(im, x, y, filas, pal, espejo)
    if p['tocado']:
        x, y, filas = TOCADOS[p['tocado']][d]
        poner(im, x, y, filas, pal, espejo)
    if p['capa'] and d == 'arriba':
        x, y, filas = CAPA[d]
        poner(im, x, y, filas, pal, espejo)
    if paso and not p['vestido']:
        # Al dar el paso, el cuerpo sube un píxel.
        subido = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        subido.paste(im.crop((0, 0, W, 19)), (0, -1))
        subido.paste(im.crop((0, 19, W, H)), (0, 19))
        im = subido
    return im


def hoja(p: dict) -> Image.Image:
    im = Image.new('RGBA', (W * 4, H * 4), (0, 0, 0, 0))
    for col, d in enumerate(DIRS):
        for fila, paso in enumerate([0, 1, 0, 2]):
            im.paste(fotograma(p, d, paso), (col * W, fila * H))
    return im


# ---------------------------------------------------------------- surcando el agua (Pleamar)

# Una criatura de agua genérica, como en los juegos del género: lomo azul, ojos y espuma. Sea
# cual sea la criatura que sabe Pleamar, en el mapa se ve esta.
LOMO = (46, 150, 132)
LOMO_CLARO = (132, 220, 192)
LOMO_OSCURO = (18, 62, 64)
OJO = (20, 24, 40)
ESPUMA = (240, 250, 255)


def montura(d: str, oy: int, paso: int) -> Image.Image:
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dibujo = ImageDraw.Draw(im)
    if d in ('abajo', 'arriba'):
        dibujo.ellipse((2, oy, 13, oy + 7), fill=LOMO, outline=LOMO_OSCURO)
        dibujo.line((4, oy + 2, 8, oy + 2), fill=LOMO_CLARO)
        if d == 'abajo':
            # La cabeza asoma por delante, con sus dos ojos.
            dibujo.ellipse((4, oy + 4, 11, oy + 9), fill=LOMO, outline=LOMO_OSCURO)
            dibujo.point([(6, oy + 6), (9, oy + 6)], fill=OJO)
        else:
            # Por detrás se ve la aleta de la cola.
            dibujo.polygon([(6, oy + 7), (9, oy + 7), (11, oy + 9), (4, oy + 9)], fill=LOMO_OSCURO)
    else:
        dibujo.ellipse((2, oy + 1, 14, oy + 7), fill=LOMO, outline=LOMO_OSCURO)
        dibujo.line((5, oy + 2, 10, oy + 2), fill=LOMO_CLARO)
        # Mira a la izquierda: la cabeza delante y la cola detrás.
        dibujo.ellipse((0, oy + 2, 5, oy + 7), fill=LOMO, outline=LOMO_OSCURO)
        dibujo.point([(1, oy + 4)], fill=OJO)
        dibujo.polygon([(13, oy + 3), (15, oy + 1), (15, oy + 6)], fill=LOMO_OSCURO)
    # Espuma en la línea del agua; cambia con el paso para que parezca que avanza.
    for x in range(1, W - 1, 3):
        y = oy + 8 + ((x // 3 + paso) % 2)
        if 0 <= y < H:
            dibujo.point((x, y), fill=ESPUMA)
    return im


def hoja_navegando(p: dict) -> Image.Image:
    """La hoja del jugador sobre la criatura: medio cuerpo encima, meciéndose."""
    im = Image.new('RGBA', (W * 4, H * 4), (0, 0, 0, 0))
    for col, direccion in enumerate(DIRS):
        espejo = direccion == 'derecha'
        d = 'izquierda' if espejo else direccion
        for fila, paso in enumerate([0, 1, 0, 2]):
            alza = -1 if paso == 1 else 0
            oy = 14 + alza
            marco = montura(d, oy, paso)
            jinete = fotograma(p, direccion, 0).crop((0, 0, W, 15))
            capa = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            capa.paste(jinete, (0, oy - 12 + alza))
            if d == 'arriba':
                # De espaldas, el jinete tapa el lomo.
                marco.alpha_composite(capa)
                cuadro = marco
            else:
                cuadro = capa
                cuadro.alpha_composite(montura(d, oy, paso).crop((0, oy + 3, W, H)), (0, oy + 3))
            if espejo:
                cuadro = cuadro.transpose(Image.FLIP_LEFT_RIGHT)
            im.paste(cuadro, (col * W, fila * H))
    return im


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    hojas = {}
    for nombre, p in PERSONAJES.items():
        h = hoja(p)
        h.save(SALIDA / f'{nombre}.png', optimize=True)
        hojas[nombre] = h
    agua = hoja_navegando(PERSONAJES['muchacho'])
    agua.save(SALIDA / 'muchacho_agua.png', optimize=True)
    hojas['muchacho_agua'] = agua
    if '--muestra' in sys.argv:
        destino = Path(sys.argv[sys.argv.index('--muestra') + 1])
        destino.mkdir(parents=True, exist_ok=True)
        cols = 5
        filas = (len(hojas) + cols - 1) // cols
        lam = Image.new('RGBA', (cols * (W * 4 + 4), filas * (H * 2 + 4)), (120, 200, 100, 255))
        for i, (nombre, h) in enumerate(hojas.items()):
            x, y = (i % cols) * (W * 4 + 4), (i // cols) * (H * 2 + 4)
            lam.alpha_composite(h.crop((0, 0, W * 4, H * 2)), (x, y))
        lam.resize((lam.width * 5, lam.height * 5), Image.NEAREST).save(destino / 'personajes.png')
    print(f'{len(hojas)} personajes')


if __name__ == '__main__':
    main()
