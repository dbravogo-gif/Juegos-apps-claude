# Generador de la isla 1, Lanzarote (2026-11-10): dibuja cada zona con rectángulos y caminos y
# escribe src/data/isla1.ts con el mapa, los personajes y a qué sala lleva cada puerta.
# Misma idea que La Palma (las cinco zonas del autor), con Lanzarote: pueblo blanco junto a la
# playa, El Golfo y su arena negra, La Geria y sus viñas en hoyos, las Montañas del Fuego y la
# capital con su puerto.
# Uso, desde six-seven-islands/: python3 herramientas/isla1.py src/data/isla1.ts
# El mapa generado manda: si se toca a mano, este borrador deja de servir.
import json, collections, sys
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

# 1. Zona inicial (24 × 18): pueblo blanco del sur, junto a una playa dorada. Salida arriba, x 2..4.
z = Z(24, 18); z.borde('#')
z.r(0, 16, 24, 2, '~'); z.r(1, 14, 22, 2, 'a')                  # playa dorada y mar
z.r(2, 0, 3, 1, ','); z.r(2, 2, 4, 1, ',')
z.r(2, 1, 3, 1, 'X')                                            # paso cerrado hasta elegir
z.camino([(3,2),(3,7)]); z.camino([(3,7),(21,7)]); z.camino([(9,7),(9,13)]); z.camino([(3,13),(18,13)])
z.edificio(13, 2, 8, 4, 'M', 16, 'museo')                       # museo, arriba a la derecha
z.edificio(4, 9, 4, 3, 'C', 5, 'casa-jugador')                  # casa del jugador
z.edificio(11, 9, 4, 3, 'C', 12, 'casa-vecina')                 # casa vecina, igual
z.p(19, 10, 'T')                                                # la palmera
z.r(18, 12, 3, 1, 'U')                                          # tuneras
z.r(1, 4, 1, 2, 'U'); z.r(7, 3, 4, 2, 'V')                      # unas viñas en hoyos
zonas['inicial'] = dict(nombre='Zona inicial', origen=(38, 114), z=z, altura=0, casas='lanzarote')

# 2. Zona de combates (24 × 60), El Golfo: costa oeste. Abajo x 11..13 (zona 1); arriba x 1..3.
# De sur a norte (autor, 2026-11-08): playa de arena negra; barrera de piedra con el entrenador;
# subida con dos manchas de malpaís (una obligatoria y otra opcional); y en llano, tierra con la
# hierba obligatoria. El charco verde de El Golfo, en la playa. Ampliada el 2026-11-10 (autor:
# zonas de encuentros más grandes, los mismos entrenadores): unas tres veces más hierba y malpaís,
# con las mismas tres manchas.
z = Z(24, 60, ':')
z.r(0, 0, 24, 1, '#'); z.r(0, 59, 24, 1, '#'); z.r(23, 0, 1, 60, '#'); z.r(0, 0, 1, 39, '#')
z.r(1, 0, 3, 1, ','); z.r(11, 59, 3, 1, '_')
z.r(1, 39, 22, 20, '_')                                          # playa de arena negra
for y in range(39, 59):
    z.r(0, y, 2 if y < 44 else (3 if y < 51 else 5), 1, '~')     # el mar, al oeste
z.r(13, 45, 4, 3, 'w')                                           # el charco verde
z.camino([(12,58),(12,52),(9,52),(9,40)])
z.camino([(9,37),(9,35)]); z.camino([(9,29),(9,15)]); z.camino([(9,7),(2,7),(2,1)])
z.r(1, 38, 22, 1, '='); z.r(9, 38, 2, 1, '_')                    # barrera de piedra con su hueco
z.r(1, 30, 3, 4, '#'); z.r(20, 30, 3, 4, '#'); z.r(4, 30, 16, 4, ';')  # malpaís obligatorio
z.r(13, 22, 7, 5, ';')                                           # malpaís opcional
z.r(1, 8, 3, 6, '#'); z.r(20, 8, 3, 6, '#'); z.r(4, 8, 16, 6, '"')     # hierba obligatoria, en llano
z.r(19, 2, 3, 4, 'U'); z.r(3, 16, 3, 2, 'U')                     # tuneras en el llano
alt = []
for y in range(60):
    h = 4 if y <= 20 else 3 if y <= 26 else 2 if y <= 33 else 1 if y <= 37 else 0
    alt.append(str(h) * 24)
zonas['combates'] = dict(nombre='El Golfo', origen=(29, 54), z=z, alturas=alt, hierba=True)

# 3. Pueblo (28 × 22), La Geria: casas blancas entre viñas en hoyos de picón. Abajo x 14..16;
# arriba x 8..10 hacia las Montañas del Fuego (cerrado hasta hablar con el anciano).
z = Z(28, 22); z.borde('#')
z.r(8, 0, 3, 1, ','); z.r(14, 21, 3, 1, ',')
z.camino([(9,2),(9,9)], ancho=3); z.camino([(3,9),(25,9)])
z.camino([(14,10),(14,20)], ancho=3)
z.r(8, 1, 3, 1, 'X')                                            # paso a las Montañas del Fuego
z.r(1, 1, 6, 2, 'V'); z.r(12, 1, 15, 2, 'V')                    # viñas al norte
z.r(1, 15, 9, 6, 'V'); z.r(19, 17, 8, 4, 'V')                   # viñas al sur
z.edificio(2, 5, 4, 3, 'C', 3, 'casa-geria-1')                  # casa 1
z.edificio(15, 4, 5, 4, 'R', 17, 'refugio-geria')               # refugio
z.edificio(22, 5, 4, 3, 'S', 23, 'tienda-geria')                # tienda
z.edificio(20, 12, 4, 3, 'C', 21, 'casa-geria-2')                # casa 2
z.camino([(17,16),(21,16)])
z.r(10, 11, 3, 4, '.'); z.r(17, 11, 2, 4, '.')                  # la plaza
for (x,y) in [(10,11),(12,11),(17,11),(18,11)]: z.p(x, y, 'T')  # palmeras al norte de la plaza
z.r(24, 12, 2, 2, 'U'); z.r(1, 11, 2, 2, 'U')
zonas['pueblo'] = dict(nombre='La Geria', origen=(16, 32), z=z, altura=4, casas='lanzarote', suelo="{ '.': '#4E4A4D' }")

# 4. Montañas del Fuego (56 × 32): coladas de lava (no se pisan) con caminos de picón. Abajo x 4..6
# (zona 3); derecha y 19..21 (zona 5). Como el bosque de La Palma: largo, con un malpaís que corta
# el paso, una bifurcación a una caldera sin salida con otro entrenador y un objeto. Ampliada el
# 2026-11-10: zona más grande y unas dos veces y media más malpaís.
z = Z(56, 32, 'L')
z.r(4, 31, 3, 1, '_')
z.camino([(4,30),(4,3)], c='_', ancho=3)                          # sube por el oeste
z.camino([(4,3),(26,3)], c='_', ancho=3)                          # cruza por el norte
z.camino([(24,3),(24,15)], c='_', ancho=3)                        # baja al centro
z.camino([(24,13),(42,13)], c='_', ancho=3)                       # cruza el centro hacia el este
z.camino([(40,13),(40,19)], c='_', ancho=3)                       # baja por el este
z.camino([(40,19),(55,19)], c='_', ancho=3)                       # sale al este
z.camino([(25,16),(25,21)], c='_')                                # bifurcación hacia el sur
z.r(19, 22, 13, 7, ':'); z.r(25, 22, 1, 2, '_')                   # la caldera sin salida
z.r(10, 2, 12, 5, ';')                                           # malpaís obligatorio (corta el paso)
z.r(5, 13, 5, 7, ';'); z.r(33, 10, 5, 5, ';'); z.r(27, 23, 4, 4, ';')   # malpaís rodeable
z.r(9, 9, 6, 5, ':'); z.camino([(7,11),(9,11)], c='_')            # mirador del oeste
z.r(30, 5, 7, 5, 'Q')                                            # un cono de escorias
z.r(44, 1, 8, 7, 'Q'); z.r(10, 20, 8, 6, 'Q')                    # más volcanes, al norte de los caminos
z.p(48, 18, '_'); z.p(30, 16, '_')
alt = []
for y in range(32):
    fila = ''
    for x in range(56):
        h = 4 if x < 24 else 3 if x < 34 else 2 if x < 44 else 1
        if 19 <= x <= 31 and 22 <= y <= 28: h = 2                       # la caldera, hundida
        fila += str(h)
    alt.append(fila)
zonas['fuego'] = dict(nombre='Montañas del Fuego', origen=(20, 0), z=z, alturas=alt, hierba=True, flora='volcan')

# 5. Capital (34 × 28), Arrecife: costa este. Izquierda y 1..3 (zona 4). Puerto al este; barco
# cerrado hasta vencer al gimnasio. Un charco de agua de mar entre las casas, con su paseo de palmeras.
z = Z(34, 28); z.borde('#')
z.r(0, 1, 1, 3, ',')
z.r(26, 1, 7, 26, '~'); z.r(1, 24, 25, 3, '~'); z.r(1, 22, 25, 2, 'a')   # mar y playa dorada
z.r(1, 1, 2, 3, ','); z.camino([(1,3),(1,11)], ancho=2); z.camino([(5,9),(5,11)]); z.camino([(1,11),(24,11)], ancho=2)
z.camino([(14,10),(14,11)]); z.camino([(15,10),(15,11)]); z.camino([(21,7),(21,11)])
z.camino([(4,16),(4,18)]); z.camino([(10,16),(10,18)]); z.camino([(16,16),(16,18)]); z.camino([(1,18),(24,18)], ancho=2)
z.camino([(23,11),(23,19)], ancho=2)
z.edificio(3, 5, 5, 4, 'R', 5, 'refugio-capital')               # refugio
z.r(11, 4, 8, 6, 'G'); z.p(14, 10, 'd'); z.p(15, 10, 'd')       # gimnasio, el más grande
z.puertas += [(14, 10, 'gimnasio'), (15, 10, 'gimnasio')]
z.edificio(3, 13, 4, 3, 'C', 4, 'casa-capital-1')
z.edificio(9, 13, 4, 3, 'C', 10, 'casa-capital-2')
z.edificio(15, 13, 4, 3, 'C', 16, 'casa-capital-3')
z.edificio(20, 4, 3, 3, 'C', 21, 'casa-capital-4')
z.r(25, 11, 6, 2, 'P'); z.r(31, 9, 2, 2, 'F'); z.r(29, 13, 2, 2, 'B')    # muelle, faro y barco
z.r(25, 11, 1, 2, 'X')                                                  # paso al muelle, cerrado
z.r(1, 20, 6, 1, '~')                                                    # el charco, junto a la playa
for x in (8, 12, 16, 20): z.p(x, 20, 'T')                                # paseo de palmeras
zonas['capital'] = dict(nombre='Capital', origen=(76, 18), z=z, altura=1, casas='balcones-blanca')

PERSONAJES = {
 'inicial': ["{ id: 'vecino-salida', x: 5, y: 2, mira: 'o', frase: '¡Eh! Sin una criatura que te acompañe no se sale de aquí. La doctora te espera en el museo.' }"],
 'combates': ["{ id: 'entrenador-barrera', x: 6, y: 37, mira: 'e', entrenador: { vision: 5, obligatorio: true }, frase: '¡Nadie sube por la ladera sin pasar antes por mí!' }",
              "{ id: 'entrenador-llano', x: 2, y: 15, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: 'En el llano, las criaturas se esconden entre la hierba seca.' }"],
 'pueblo': ["{ id: 'anciano', x: 11, y: 13, mira: 's', frase: 'Esa criatura no te hace caso, ¿verdad? Siéntate, que te cuento su historia.' }",
            "{ id: 'guarda-fuego', x: 7, y: 3, mira: 'e', frase: 'En las Montañas del Fuego, quien no va bien acompañado se pierde entre la lava.' }"],
 'fuego': ["{ id: 'entrenador-salida-fuego', x: 48, y: 18, mira: 's', entrenador: { vision: 3, obligatorio: true }, frase: 'Si quieres llegar a la capital, antes tendrás que vencerme.' }",
           "{ id: 'excursionista', x: 12, y: 11, mira: 'o', entrenador: { vision: 2, obligatorio: false }, frase: 'Aquí la tierra quema: un palmo bajo el suelo, se podría asar pescado.' }",
           "{ id: 'entrenador-centro', x: 30, y: 16, mira: 'n', entrenador: { vision: 2, obligatorio: false }, frase: 'Entreno entre los volcanes. El calor me hace más fuerte.' }",
           "{ id: 'entrenador-caldera', x: 21, y: 25, mira: 'e', entrenador: { vision: 3, obligatorio: false }, frase: 'Esta caldera es mi escondite. ¿Cómo la has encontrado?' }"],
 'capital': ["{ id: 'vecina-rivales', x: 9, y: 11, mira: 's', frase: 'Unos tipos raros preguntaban en el puerto por la isla que desapareció...' }",
             "{ id: 'marinero', x: 25, y: 13, mira: 'n', frase: 'El barco va a la isla siguiente, pero solo con quien ha vencido al gimnasio.' }"],
}
OBJETOS = {'fuego': ["{ id: 'pocion-caldera', x: 29, y: 27, objeto: 'pocion' }"]}
CIERRES = {
 'inicial': "cierre: { condicion: 'inicial-elegida', aviso: 'Antes de salir, pasa por el museo y elige a tu compañera.' },",
 'pueblo': "cierre: {\n        condicion: 'anciano',\n        aviso: 'Tu criatura aún no te escucha. En las Montañas del Fuego os perderíais: habla antes con el anciano de la plaza.',\n      },",
 'capital': "cierre: { condicion: 'gimnasio-vencido', aviso: 'El barco solo lleva a quien ha vencido al gimnasio.' },",
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
    if v.get('flora'): t+=f"      flora: '{v['flora']}',\n"
    if v.get('suelo'): t+=f"      // Suelo de picón negro, como las viñas de La Geria.\n      suelo: {v['suelo']},\n"
    t+=bloque(PERSONAJES.get(zid,[]),'personajes') if PERSONAJES.get(zid) else "      personajes: [],\n"
    t+=bloque(OBJETOS.get(zid,[]),'objetos')
    if v.get('alturas'): t+="      alturas: [\n"+''.join(f"        '{f}',\n" for f in v['alturas'])+"      ],\n"
    else: t+=f"      altura: {v['altura']},\n"
    t+="      mapa: [\n"+''.join(f"        '{f}',\n" for f in z.filas())+"      ],\n    },\n"
    partes.append(t)
    if z.puertas: puertas[zid]={f"{x},{y}": sala for (x,y,sala) in z.puertas}

def pu(d):
    s="{\n"
    for zid, m in d.items():
        s+=f"  {zid}: {{ "+", ".join(f"'{k}': '{v}'" for k,v in m.items())+" },\n"
    return s+"}"

ts=("// Isla 1, inspirada en Lanzarote (2026-11-10): el mapa por casillas (ISLA-1.md). Lo genera\n"
"// herramientas/isla1.py a partir de rectángulos y caminos; las pruebas lo vigilan.\n"
"// Una letra por casilla, con la leyenda de src/core/mundo.ts. Las alturas van en escalones (0 =\n"
"// nivel del mar). Las coordenadas de personajes y objetos son de su zona: x hacia el este, y\n"
"// hacia el sur. Los interiores van aparte. Los nombres de los lugares son provisionales.\n"
"import type { DefIsla } from '../core/mundo';\n\n"
"export const ISLA_1: DefIsla = {\n  id: 'lanzarote',\n  inicio: { zona: 'inicial', x: 5, y: 13 },\n"
"  // Lanzarote es seca: el suelo corto es jable, arena clara, la\n"
"  // hierba alta es verde seco y las cumbres son volcanes.\n"
"  // El gimnasio es de Roca: la isla de los volcanes.\n"
"  gimnasio: 'roca',\n"
"  colores: {\n    suelo: { '.': '#D9C59A', '\"': '#9AA05A' },\n    cumbre: '#9A6B55',\n    ladoCumbre: '#7C5444',\n    matas: '#6F8436',\n  },\n"
"  zonas: [\n"+''.join(partes)+"  ],\n};\n\n"
"/** A qué sala lleva cada puerta, por zona y casilla de la puerta (en coordenadas de la zona). */\n"
"export const PUERTAS_ISLA1: Readonly<Record<string, Readonly<Record<string, string>>>> = "+pu(puertas)+";\n")
open(sys.argv[1],'w').write(ts)
for k,v in zonas.items():
    print(k, v['origen'], v['z'].w, 'x', v['z'].h); print('\n'.join(v['z'].filas())); print()
