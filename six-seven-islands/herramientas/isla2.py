# Generador de la isla 2, Fuerteventura (2026-11-13; ISLA-2.md): dibuja cada zona con rectángulos
# y caminos y escribe src/data/isla2.ts con el mapa, los personajes y a qué sala lleva cada puerta.
# Fase 1: Corralejo, donde llega el barco de Lanzarote, y Las Dunas, el desierto. El camino del sur
# queda cerrado por una duna hasta la fase 2.
# Uso, desde six-seven-islands/: python3 herramientas/isla2.py src/data/isla2.ts
import sys

class Z:
    def __init__(s, w, h, relleno='.'):
        s.w, s.h = w, h; s.g = [[relleno]*w for _ in range(h)]; s.puertas = []
    def r(s, x, y, w, h, c):
        for j in range(y, y+h):
            for i in range(x, x+w): s.g[j][i] = c
    def p(s, x, y, c): s.g[y][x] = c
    def borde(s, c='#'):
        s.r(0,0,s.w,1,c); s.r(0,s.h-1,s.w,1,c); s.r(0,0,1,s.h,c); s.r(s.w-1,0,1,s.h,c)
    def camino(s, pts, c=',', ancho=1):
        for (x0,y0),(x1,y1) in zip(pts, pts[1:]):
            if x0==x1:
                for y in range(min(y0,y1), max(y0,y1)+1):
                    for k in range(ancho): s.g[y][x0+k] = c
            else:
                for x in range(min(x0,x1), max(x0,x1)+1):
                    for k in range(ancho): s.g[y0+k][x] = c
    def edificio(s, x, y, w, h, letra, puerta_x, sala):
        s.r(x, y, w, h, letra); s.p(puerta_x, y+h, 'd'); s.puertas.append((puerta_x, y+h, sala))
    def filas(s): return [''.join(f) for f in s.g]

zonas = {}

# 1. Corralejo (26 × 20): pueblo marinero blanco. El mar al norte, con el muelle y el barco de
# Lanzarote; la calle mayor con el refugio y la tienda, otra calle con dos casas y, al sur, la
# salida a Las Dunas (x 11..13).
z = Z(26, 20, ':'); z.borde('#')
z.r(0, 0, 26, 4, '~')                                           # el mar
z.r(1, 4, 24, 1, 'a'); z.r(1, 5, 8, 1, 'a')                     # la playa del pueblo
z.r(11, 0, 2, 4, 'P')                                           # el muelle
z.r(13, 1, 2, 2, 'B')                                           # el barco de Lanzarote
z.camino([(11,4),(11,8)], ancho=3)                              # del muelle a la calle mayor
z.camino([(1,8),(24,8)])                                        # calle mayor
z.camino([(2,13),(23,13)])                                      # calle de abajo
z.camino([(11,8),(11,19)], ancho=3)                             # hacia Las Dunas
z.edificio(3, 5, 5, 3, 'R', 5, 'refugio-corralejo')
z.edificio(16, 5, 4, 3, 'S', 17, 'tienda-corralejo')
z.edificio(3, 10, 4, 3, 'C', 4, 'casa-corralejo-1')
z.edificio(17, 10, 4, 3, 'C', 18, 'casa-corralejo-2')
for x, y in ((9, 10), (15, 10), (21, 6), (9, 15), (15, 16)): z.p(x, y, 'T')   # palmeras
z.p(2, 4, 'O'); z.p(3, 4, 't'); z.p(7, 4, 'O'); z.p(8, 4, 't')              # sombrillas en la playa
z.r(1, 15, 6, 4, 'U'); z.r(19, 15, 6, 4, 'U')                   # tuneras a los lados de la salida
zonas['corralejo'] = dict(nombre='Corralejo', origen=(40, 0), z=z, altura=0, casas='lanzarote')

# 2. Las Dunas (40 × 36): el desierto. Toda la arena (D) tiene criaturas; las crestas (K) no se
# pisan y obligan a zigzaguear. Entre medias, tierra dura (:) para descansar: el horno de cal en
# ruinas y el campamento de la arqueóloga. Entrada arriba (x 18..20); el camino del sur, cerrado.
z = Z(40, 36, 'D'); z.borde('K')
z.r(18, 0, 3, 1, ':')                                           # entrada desde Corralejo
z.r(18, 35, 3, 1, ':')                                          # salida hacia Puerto del Rosario (fase 2)
z.r(1, 7, 29, 1, 'K'); z.r(10, 14, 29, 1, 'K'); z.r(1, 21, 29, 1, 'K'); z.r(10, 28, 29, 1, 'K')   # crestas en zigzag
for x, y, w, h in ((24, 3, 3, 2), (5, 11, 2, 2), (16, 17, 4, 2), (30, 24, 2, 3), (4, 31, 3, 2)): z.r(x, y, w, h, 'K')   # dunas sueltas
# Tierra dura: la bajada de la entrada, el horno de cal, el campamento y descansos por el camino.
z.r(17, 1, 5, 4, ':')
z.r(31, 9, 6, 4, ':')                                           # el horno de cal en ruinas
z.r(31, 9, 6, 1, '#'); z.r(31, 9, 1, 4, '#'); z.r(36, 9, 1, 4, '#'); z.p(33, 9, ':'); z.p(34, 9, ':')
z.r(3, 16, 8, 4, ':')                                           # el campamento de la arqueóloga
z.p(6, 17, 'E')                                                 # la estatua medio enterrada
z.r(22, 23, 6, 3, ':'); z.r(12, 30, 6, 3, ':'); z.r(17, 33, 5, 2, ':')
zonas['dunas'] = dict(nombre='Las Dunas', origen=(33, 20), z=z, altura=0, hierba=True, clima='calima')

# 3. Puerto del Rosario (32 × 26): la capital, en la costa este. Entrada arriba (x 13..15, desde
# Las Dunas); salida al oeste (y 12..13, hacia Betancuria). El mar al este, con el muelle.
z = Z(32, 26, ':'); z.borde('#')
z.r(13, 0, 3, 1, ':'); z.r(0, 12, 1, 2, ':')
z.r(26, 1, 5, 24, '~')                                          # el mar
z.r(22, 12, 4, 2, 'P')                                          # el muelle
z.camino([(13,0),(13,21)], ancho=3)                             # calle principal, de norte a sur
z.camino([(1,8),(25,8)]); z.camino([(0,12),(25,12)], ancho=2); z.camino([(1,21),(20,21)])
z.edificio(2, 4, 5, 3, 'R', 4, 'refugio-puerto')
z.edificio(18, 4, 4, 3, 'S', 19, 'tienda-puerto')
z.edificio(2, 9, 4, 2, 'C', 3, 'casa-puerto-1')
z.edificio(18, 9, 4, 2, 'C', 19, 'casa-puerto-2')
z.edificio(2, 17, 4, 3, 'C', 3, 'casa-puerto-3')
for y in (3, 6, 16, 19, 23): z.p(24, y, 'T')                    # palmeras del paseo, junto al mar
z.r(18, 16, 5, 4, '.'); z.p(20, 17, 'Y')                        # la plaza con su árbol
zonas['puerto'] = dict(nombre='Puerto del Rosario', origen=(38, 56), z=z, altura=0, casas='lanzarote')

# 4. Betancuria (34 × 30): la antigua capital, en un valle entre montañas peladas. Entrada al
# este (y 4..5, desde Puerto del Rosario); salida al oeste (y 22..23, hacia Ajuy). El pueblito con
# su iglesia (sin puerta) y su refugio; la presa con palmeras en el barranco; laderas con hierba
# seca, una obligatoria, y el guarda del paso a Ajuy.
z = Z(34, 30, ':'); z.borde('#')
z.r(33, 4, 1, 2, ','); z.r(0, 22, 1, 2, ',')
z.r(1, 1, 6, 6, '#'); z.r(26, 9, 7, 5, '#'); z.r(1, 25, 10, 4, '#'); z.r(24, 24, 9, 5, '#')   # montañas peladas
z.camino([(33,4),(20,4)], ancho=2); z.camino([(20,4),(20,23)], ancho=2); z.camino([(20,22),(0,22)], ancho=2)
z.r(10, 9, 6, 4, 'M')                                           # la iglesia, sin puerta
z.camino([(22,17),(23,17)]); z.camino([(11,18),(20,18)])         # los caminos, sin pisar las puertas
z.edificio(22, 14, 5, 3, 'R', 24, 'refugio-betancuria')
z.edificio(9, 15, 4, 3, 'C', 10, 'casa-betancuria')
z.r(3, 12, 5, 3, '~')                                           # la presa
for x, y in ((2, 11), (8, 11), (2, 15), (8, 15), (5, 16)): z.p(x, y, 'T')
z.r(22, 1, 10, 3, '"'); z.r(14, 19, 5, 6, '"'); z.r(2, 19, 8, 3, '"')    # hierba seca de las laderas
z.r(19, 6, 4, 3, '"')                                           # la mancha que no se esquiva, en el camino
zonas['betancuria'] = dict(nombre='Betancuria', origen=(34-30, 64), z=z, altura=0, hierba=True, casas='rural')

# 5. Ajuy (24 × 30): la costa de las cuevas. Entrada al este (y 22..23, desde Betancuria). Playa de
# arena negra, acantilados y la boca de la cueva (J), por la que se entra a la cueva de las pozas.
# El camino del sur, cerrado hasta la fase 3.
z = Z(24, 30, ':'); z.borde('#')
z.r(23, 22, 1, 2, ','); z.r(11, 29, 3, 1, 'X')
z.r(0, 1, 6, 28, '~'); z.r(6, 8, 4, 18, 'a')                   # el mar y la playa negra
z.r(6, 1, 17, 2, '#'); z.r(6, 3, 2, 5, '#'); z.r(14, 3, 9, 6, '#')        # acantilados del norte
z.r(8, 3, 6, 2, 'J'); z.p(10, 5, 'd'); z.puertas.append((10, 5, 'cueva-ajuy'))   # la boca de la cueva
z.camino([(10,6),(10,9)]); z.camino([(10,9),(18,9)])
z.camino([(18,9),(18,23)]); z.camino([(18,22),(23,22)], ancho=2); z.camino([(11,23),(18,23)]); z.camino([(12,23),(12,28)])
z.r(14, 12, 4, 6, '"'); z.r(19, 24, 4, 4, '"')                  # hierba en lo alto del acantilado
z.edificio(14, 25, 3, 2, 'C', 15, 'casa-ajuy')
z.r(6, 26, 4, 3, '#'); z.r(17, 13, 1, 1, '#')
zonas['ajuy'] = dict(nombre='Ajuy', origen=(10-30, 64), z=z, altura=0, hierba=True, suelo="{ a: '#3E3638' }")

# Toda la isla, 30 casillas al este: así cabe la costa oeste (Ajuy), sin coordenadas negativas.
DESPLAZAMIENTO = 30
for v in zonas.values(): v['origen'] = (v['origen'][0] + DESPLAZAMIENTO, v['origen'][1])

# La costa de Fuerteventura, aproximada: de la punta de Corralejo por la costa este hasta Puerto
# del Rosario, y por la oeste, Ajuy; el sur llega con las fases siguientes. En casillas, ya con el
# desplazamiento; los .5 caen entre casillas.
SILUETA = [(68.5,3.5),(75.5,0.5),(96.5,0.5),(104.5,5.5),(107.5,20.5),(106.5,45.5),(100.5,56.5),
           (96.5,82.5),(88.5,98.5),(68.5,102.5),(48.5,106.5),(28.5,110.5),(14.5,106.5),(9.5,96.5),
           (9.5,70.5),(16.5,61.5),(34.5,59.5),(56.5,57.5),(60.5,45.5),(61.5,20.5),(64.5,8.5)]

PERSONAJES = {
 'corralejo': ["{ id: 'marinero-corralejo', x: 11, y: 4, mira: 's', frase: 'Este barco va y viene de Lanzarote todo el día.' }",
               "{ id: 'vecina-corralejo', x: 20, y: 9, mira: 'n', frase: '¿Ves aquel islote? Es Lobos. Dicen que solo se llega con buen viento.' }",
               "{ id: 'surfista-corralejo', x: 8, y: 13, mira: 'e', frase: 'Aquí el viento sopla tan fuerte que las olas vienen peinadas.' }"],
 'dunas': ["{ id: 'perdido-dunas-1', x: 3, y: 10, mira: 'e', entrenador: { vision: 5, obligatorio: false }, frase: '¡Por fin alguien! Llevo horas dando vueltas. ¿Luchamos mientras me oriento?' }",
           "{ id: 'perdido-dunas-2', x: 36, y: 18, mira: 'o', entrenador: { vision: 5, obligatorio: false }, frase: 'Todas las dunas son iguales… ¿Tú también te has perdido? ¡Pues a luchar!' }",
           "{ id: 'buscador-dunas', x: 14, y: 26, mira: 'e', entrenador: { vision: 5, obligatorio: false }, frase: 'La arena esconde tesoros. Y criaturas. ¡Y entrenadores como yo!' }",
           "{ id: 'arqueologa', x: 7, y: 17, mira: 'o', frase: '¡Cuidado con las cuerdas!' }"],
 'puerto': ["{ id: 'escultor-puerto', x: 17, y: 13, mira: 's', frase: 'Esta ciudad está llena de esculturas por la calle. Algún día pondrán una mía.' }",
            "{ id: 'vecina-puerto', x: 9, y: 21, mira: 'n', frase: 'De aquí salían los barcos de la cal. Hoy salen los de turistas.' }",
            "{ id: 'paseante-puerto', x: 21, y: 22, mira: 'o', entrenador: { vision: 4, obligatorio: false }, frase: 'Paseo cada tarde junto al mar. Y cada tarde reto a alguien. ¡Hoy te toca!' }"],
 'betancuria': ["{ id: 'guarda-betancuria', x: 1, y: 21, mira: 's', entrenador: { vision: 2, obligatorio: true }, frase: 'El camino de Ajuy es estrecho y peligroso. Antes, demuéstrame que sabes luchar.' }",
                "{ id: 'cabrero-betancuria', x: 27, y: 5, mira: 'n', entrenador: { vision: 2, obligatorio: false }, frase: 'Mis cabras pastan en estas laderas. ¡Y mis criaturas las vigilan!' }",
                "{ id: 'anciana-betancuria', x: 14, y: 13, mira: 's', frase: 'Betancuria fue la capital de la isla hace siglos. Por eso la escondieron entre montañas.' }"],
 'ajuy': ["{ id: 'pescador-ajuy', x: 8, y: 18, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: 'Estas rocas son las más viejas de Canarias. ¡Y yo, el pescador más viejo de Ajuy!' }",
          "{ id: 'nino-ajuy', x: 12, y: 7, mira: 's', frase: 'Dentro de la cueva hay pozas con agua del mar. ¡Y algo que brilla al fondo!' }"],
}
OBJETOS = {'dunas': ["{ id: 'pocion-horno', x: 33, y: 11, objeto: 'pocion' }", "{ id: 'cubo-dunas', x: 37, y: 31, objeto: 'cubo-blanco' }"],
           'betancuria': ["{ id: 'pocion-presa', x: 4, y: 16, objeto: 'pocion' }"]}
CIERRES = {
 'ajuy': "cierre: { condicion: 'palanca:camino-sur', aviso: 'Un desprendimiento tapa el camino del sur. Dicen que lo despejarán pronto.' },",
}

def bloque(lista, nombre):
    if not lista: return ''
    if len(lista)==1: return f"      {nombre}: [{lista[0]}],\n"
    return f"      {nombre}: [\n" + ''.join(f"        {e},\n" for e in lista) + "      ],\n"

partes=[]; puertas={}
for zid, v in zonas.items():
    z=v['z']; ox,oy=v['origen']
    t=f"    {{\n      id: '{zid}',\n      nombre: '{v['nombre']}',\n      origen: {{ x: {ox}, y: {oy} }},\n      hierbaObligatoria: {'true' if v.get('hierba') else 'false'},\n"
    if zid in CIERRES: t+=f"      {CIERRES[zid]}\n"
    if v.get('casas'): t+=f"      casas: '{v['casas']}',\n"
    if v.get('suelo'): t+=f"      // Arena negra, como la playa de Ajuy.\n      suelo: {v['suelo']},\n"
    if v.get('clima'): t+=f"      clima: '{v['clima']}',\n"
    t+=bloque(PERSONAJES.get(zid,[]),'personajes') if PERSONAJES.get(zid) else "      personajes: [],\n"
    t+=bloque(OBJETOS.get(zid,[]),'objetos')
    t+=f"      altura: {v['altura']},\n"
    t+="      mapa: [\n"+''.join(f"        '{f}',\n" for f in z.filas())+"      ],\n    },\n"
    partes.append(t)
    if z.puertas: puertas[zid]={f"{x},{y}": sala for (x,y,sala) in z.puertas}

def pu(d):
    s="{\n"
    for zid, m in d.items():
        s+=f"  {zid}: {{ "+", ".join(f"'{k}': '{v}'" for k,v in m.items())+" },\n"
    return s+"}"

ts=("// Isla 2, inspirada en Fuerteventura (2026-11-13): el mapa por casillas (ISLA-2.md). Lo genera\n"
"// herramientas/isla2.py; las pruebas lo vigilan. Fase 1: Corralejo y Las Dunas.\n"
"// Una letra por casilla, con la leyenda de src/core/mundo.ts. Las coordenadas de personajes y\n"
"// objetos son de su zona: x hacia el este, y hacia el sur. Los interiores van aparte.\n"
"import type { DefIsla } from '../core/mundo';\n\n"
"export const ISLA_2: DefIsla = {\n  id: 'fuerteventura',\n  inicio: { zona: 'corralejo', x: 12, y: 5 },\n"
"  // Fuerteventura es más seca todavía: suelo de tierra clara y cumbres peladas, ocres.\n"
"  // El gimnasio es de Aire: la isla del viento.\n"
"  gimnasio: 'aire',\n"
"  colores: {\n    suelo: { ':': '#D8BE8E', '.': '#D9C59A' },\n    cumbre: '#B0835A',\n    ladoCumbre: '#8E6644',\n    matas: '#8C8A4A',\n  },\n"
"  // La costa del norte de Fuerteventura, aproximada (herramientas/isla2.py).\n"
"  silueta: [\n"+''.join(f"    [{x}, {y}],\n" for x, y in SILUETA)+"  ],\n"
"  zonas: [\n"+''.join(partes)+"  ],\n};\n\n"
"/** A qué sala lleva cada puerta, por zona y casilla de la puerta (en coordenadas de la zona). */\n"
"export const PUERTAS_ISLA2: Readonly<Record<string, Readonly<Record<string, string>>>> = "+pu(puertas)+";\n")
open(sys.argv[1],'w').write(ts)
for k,v in zonas.items():
    print(k, v['origen'], v['z'].w, 'x', v['z'].h); print('\n'.join(v['z'].filas())); print()
