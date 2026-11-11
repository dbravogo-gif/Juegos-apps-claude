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
zonas['inicial'] = dict(nombre='Zona inicial', origen=(38, 100), z=z, altura=0, casas='lanzarote')

# 2. Zona de combates (15 × 52), El Golfo: costa oeste. Abajo x 11..13 (zona 1); arriba x 1..3.
# De sur a norte (autor, 2026-11-08): playa de arena negra; barrera de piedra con el entrenador;
# subida con dos manchas de malpaís (una obligatoria y otra opcional); y en llano, tierra con la
# hierba obligatoria. El charco verde de El Golfo, en la playa. El 2026-11-10 el autor la quiso
# más larga, no más ancha: más camino y manchas más hondas, y el charco más grande.
z = Z(15, 52, ':')
z.r(0, 0, 15, 1, '#'); z.r(0, 51, 15, 1, '#'); z.r(14, 0, 1, 52, '#'); z.r(0, 0, 1, 33, '#')
z.r(1, 0, 3, 1, ','); z.r(11, 51, 3, 1, '_')
z.r(1, 33, 13, 18, '_')                                          # playa de arena negra
for y in range(33, 51):
    z.r(0, y, 2 if y < 38 else (3 if y < 44 else 4), 1, '~')     # el mar, al oeste
z.r(8, 37, 5, 4, 'w')                                            # el charco verde
z.camino([(12,50),(12,46),(6,46),(6,34)])
z.camino([(6,32),(6,31)]); z.camino([(6,26),(6,13)]); z.camino([(6,8),(2,8),(2,1)])
z.r(1, 33, 13, 1, '='); z.r(6, 33, 2, 1, '_')                    # barrera de piedra con su hueco
z.r(1, 27, 3, 4, '#'); z.r(11, 27, 3, 4, '#'); z.r(4, 27, 7, 4, ';')   # malpaís obligatorio
z.r(8, 22, 5, 4, ';')                                             # malpaís opcional
z.r(1, 9, 2, 4, '#'); z.r(12, 9, 2, 4, '#'); z.r(3, 9, 9, 4, '"')      # hierba obligatoria, en llano
z.r(12, 2, 2, 4, 'U'); z.r(9, 15, 3, 2, 'U')                      # tuneras en el llano
alt = []
for y in range(52):
    h = 4 if y <= 21 else 3 if y <= 25 else 2 if y <= 30 else 1 if y <= 32 else 0
    alt.append(str(h) * 15)
zonas['combates'] = dict(nombre='El Golfo', origen=(29, 48), z=z, alturas=alt, hierba=True)

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
zonas['pueblo'] = dict(nombre='La Geria', origen=(16, 26), z=z, altura=4, casas='lanzarote', suelo="{ '.': '#4E4A4D' }")

# 4. Montañas del Fuego (48 × 26): coladas de lava (no se pisan) con caminos de picón. Abajo x 4..6
# (zona 3); abajo x 34..36, hacia El Jable (zona 5). Como el bosque de La Palma: largo, con un
# malpaís que corta el paso, una bifurcación a una caldera sin salida con otro entrenador y un
# objeto.
z = Z(48, 26, 'L')
z.r(4, 25, 3, 1, '_')
z.camino([(4,24),(4,3)], c='_', ancho=3)                          # sube por el oeste
z.camino([(4,3),(22,3)], c='_', ancho=3)                          # cruza por el norte
z.camino([(20,0),(20,13)], c='_', ancho=3)                        # baja al centro; arriba, salida a Famara (zona 7)
z.camino([(20,11),(36,11)], c='_', ancho=3)                       # cruza el centro hacia el este
z.camino([(34,11),(34,25)], c='_', ancho=3)                       # baja por el este, hacia El Jable
z.camino([(21,14),(21,17)], c='_')                                # bifurcación hacia el sur
z.r(17, 18, 10, 5, ':'); z.r(21, 18, 1, 5, '_'); z.r(22, 22, 4, 1, '_')   # la caldera sin salida, con su senda hasta la poción
z.r(12, 3, 8, 3, ';')                                            # malpaís obligatorio (corta el paso)
z.r(5, 13, 2, 4, ';'); z.r(29, 11, 3, 2, ';'); z.r(23, 19, 3, 3, ';')   # malpaís rodeable
z.r(9, 8, 5, 4, ':'); z.camino([(7,10),(9,10)], c='_')            # mirador del oeste
z.r(26, 5, 6, 4, 'Q')                                            # un cono de escorias
z.r(38, 1, 7, 6, 'Q'); z.r(9, 15, 7, 5, 'Q')                     # más volcanes, al norte de los caminos
z.p(37, 21, '_'); z.p(26, 14, '_')
alt = []
for y in range(26):
    fila = ''
    for x in range(48):
        h = 4 if x < 20 else 3 if x < 30 else 2 if x < 38 else 1
        if 17 <= x <= 26 and 18 <= y <= 22: h = 2                       # la caldera, hundida
        fila += str(h)
    alt.append(fila)
zonas['fuego'] = dict(nombre='Montañas del Fuego', origen=(20, 0), z=z, alturas=alt, hierba=True, flora='volcan')

# 5. El Jable (24 × 22), zona nueva (autor, 2026-11-10: más recorrido, a la derecha de La Geria):
# la llanura de arena del centro de la isla, entre las Montañas del Fuego y la capital. Arriba x
# 10..12 (zona 4); derecha y 10..11 (zona 6). Un camino que da la vuelta entre gavias de piedra,
# hierba seca, tuneras y palmeras, con un entrenador y un objeto escondido.
z = Z(24, 22); z.borde('#')
z.r(10, 0, 3, 1, '_'); z.r(23, 10, 1, 2, ',')
# Muros de gavias que obligan a dar la vuelta: uno largo de norte a sur que deja la salida al otro
# lado, y dos que cruzan con el hueco a uno y otro lado (zigzag).
z.r(17, 1, 1, 17, '='); z.r(1, 6, 13, 1, '='); z.r(4, 12, 13, 1, '=')
z.camino([(11,1),(11,4)], ancho=2); z.camino([(11,4),(15,4)], ancho=2); z.camino([(15,4),(15,11)], ancho=2)
z.camino([(2,11),(15,11)]); z.camino([(2,11),(2,17)], ancho=2); z.camino([(2,18),(19,18)], ancho=2)
z.camino([(19,10),(19,19)], ancho=2); z.camino([(19,10),(22,10)], ancho=2)
z.r(5, 8, 8, 3, '"'); z.r(6, 14, 9, 3, '"')                      # dos campos de hierba seca
z.r(19, 2, 3, 3, '"')                                            # y otro junto al rincón escondido
z.r(1, 1, 2, 2, 'U'); z.r(21, 14, 2, 3, 'U'); z.r(9, 20, 3, 1, 'U')   # tuneras
for (x, y) in [(14, 2), (5, 9 + 6), (13, 20)]: z.p(x, y, 'T')     # palmeras
z.r(21, 20, 2, 1, '#'); z.r(1, 20, 2, 1, '#')                    # rocas
zonas['jable'] = dict(nombre='El Jable', origen=(44, 26), z=z, altura=1)

# 6. Capital (34 × 28), Arrecife: costa este. Izquierda y 18..19 (zona 5). Puerto al este; barco
# cerrado hasta vencer al gimnasio. Un charco de agua de mar entre las casas, con su paseo de palmeras.
z = Z(34, 28); z.borde('#')
z.r(0, 18, 1, 2, ',')
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
zonas['capital'] = dict(nombre='Capital', origen=(68, 18), z=z, altura=1, casas='balcones-blanca')

# 7. Famara (28 × 18), zona opcional (autor, 2026-11-11): la playa del norte, al pie del Risco de
# Famara, con bañistas (uno, un guiri quemado) y dos entrenadores que pescan o cogen pulpos. Se
# llega desde las Montañas del Fuego (abajo x 13..15, junto a su salida norte) y no lleva a ningún
# sitio. Las dunas suben hacia el sur, hasta la altura del Fuego.
z = Z(28, 18, 'a')
z.r(0, 0, 28, 4, '~'); z.r(0, 4, 5, 1, '~'); z.r(0, 5, 2, 1, '~')       # el mar, con la orilla irregular
z.r(22, 0, 6, 18, '#'); z.r(20, 4, 2, 2, '#')                           # el Risco de Famara y sus rocas al pie
z.r(0, 6, 1, 11, '#'); z.r(1, 6, 1, 2, '#'); z.r(0, 17, 28, 1, '#')     # rocas al oeste y abajo
z.r(13, 13, 3, 5, ',')                                                  # la bajada desde el Fuego
z.camino([(14,13),(14,6)]); z.camino([(2,6),(19,6)])                    # hasta la orilla, y a lo largo de ella
z.r(3, 12, 6, 3, '"')                                                    # barrilla de las dunas (encuentros, opcional)
z.p(6, 10, 't'); z.p(7, 10, 'O')                                         # una bañista bajo su sombrilla
z.p(18, 10, 't')                                                         # el guiri, sin sombrilla
z.p(10, 8, 't'); z.p(11, 8, 'O')                                         # una toalla libre
alt = []
for y in range(18):
    h = 0 if y < 12 else 1 if y < 14 else 2 if y < 16 else 3
    alt.append(''.join('4' if (x >= 22 or (20 <= x <= 21 and 4 <= y <= 5)) else str(h) for x in range(28)))
zonas['famara'] = dict(nombre='Famara', origen=(27, -18), z=z, alturas=alt)

# Las zonas bajan para dejar sitio al norte de la isla, que en Lanzarote sigue mucho más allá de
# las Montañas del Fuego (autor, 2026-11-11: que el mapa tenga su forma).
NORTE = 76
for v in zonas.values(): v['origen'] = (v['origen'][0], v['origen'][1] + NORTE)

# La costa de Lanzarote, aproximada y estilizada (más ancha que la real), alrededor de las zonas:
# de la punta suroeste, por la costa oeste (El Golfo, Timanfaya), la bahía de Famara y el Risco,
# hasta la punta norte, y de vuelta por la costa este (la capital) hasta el sur. En casillas, antes
# de bajar las zonas; los .5 caen entre casillas, para que ninguna quede justo en el borde.
SILUETA = [(36.5,117.5),(27.5,108.5),(28.5,99.5),(28.5,80.5),(21.5,70.5),(14.5,56.5),(11.5,41.5),
           (12.5,26.5),(14.5,10.5),(16.5,-3.5),(21.5,-11.5),(25.5,-15.5),(25.5,-18.5),(55.5,-18.5),
           (60.5,-28.5),(65.5,-42.5),(71.5,-56.5),(75.5,-66.5),(81.5,-64.5),(84.5,-50.5),
           (86.5,-34.5),(92.5,-18.5),(98.5,-6.5),(101.5,4.5),(101.5,45.5),(67.5,45.5),(65.5,60.5),
           (62.5,76.5),(62.5,117.5)]

PERSONAJES = {
 'inicial': ["{ id: 'vecino-salida', x: 5, y: 2, mira: 'o', frase: '¡Eh! Sin una criatura que te acompañe no se sale de aquí. La doctora te espera en el museo.' }"],
 'combates': ["{ id: 'entrenador-barrera', x: 4, y: 32, mira: 'e', entrenador: { vision: 4, obligatorio: true }, frase: '¡Nadie sube por la ladera sin pasar antes por mí!' }",
              "{ id: 'entrenador-llano', x: 2, y: 18, mira: 'e', entrenador: { vision: 5, obligatorio: false }, frase: 'En el llano, las criaturas se esconden entre la hierba seca.' }"],
 'pueblo': ["{ id: 'anciano', x: 11, y: 13, mira: 's', frase: 'Esa criatura no te hace caso, ¿verdad? Siéntate, que te cuento su historia.' }",
            "{ id: 'guarda-fuego', x: 7, y: 3, mira: 'e', frase: 'En las Montañas del Fuego, quien no va bien acompañado se pierde entre la lava.' }"],
 'fuego': ["{ id: 'entrenador-salida-fuego', x: 37, y: 21, mira: 'o', entrenador: { vision: 3, obligatorio: true }, frase: 'Si quieres llegar a la capital, antes tendrás que vencerme.' }",
           "{ id: 'excursionista', x: 10, y: 10, mira: 'o', entrenador: { vision: 5, obligatorio: false }, frase: 'Aquí la tierra quema: un palmo bajo el suelo, se podría asar pescado.' }",
           "{ id: 'entrenador-centro', x: 26, y: 14, mira: 'n', entrenador: { vision: 2, obligatorio: false }, frase: 'Entreno entre los volcanes. El calor me hace más fuerte.' }",
           "{ id: 'entrenador-caldera', x: 19, y: 20, mira: 'e', entrenador: { vision: 5, obligatorio: false }, frase: 'Esta caldera es mi escondite. ¿Cómo la has encontrado?' }"],
 'jable': ["{ id: 'entrenador-jable', x: 8, y: 17, mira: 's', entrenador: { vision: 3, obligatorio: false }, frase: 'En el jable, la arena se mueve con el viento: hoy hay un camino y mañana otro.' }",
           "{ id: 'agricultor-jable', x: 13, y: 3, mira: 's', frase: 'Aquí se siembra en la arena: guarda la humedad de la noche. ¡Las batatas salen dulcísimas!' }"],
 'famara': ["{ id: 'pescador-famara', x: 20, y: 6, mira: 'o', entrenador: { vision: 4, obligatorio: false }, frase: 'Aquí pican las viejas. ¿Tú qué buscas, criaturas o pescado?' }",
            "{ id: 'pulpero-famara', x: 2, y: 6, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: 'Los pulpos se esconden entre las rocas. Igual que algunas criaturas, ¿eh?' }",
            "{ id: 'banista-famara', x: 6, y: 10, mira: 's', postura: 'tumbado', frase: 'Aquí se viene a no hacer nada. Y a ver cómo se pone el sol detrás del risco.' }",
            "{ id: 'guiri-famara', x: 18, y: 10, mira: 's', postura: 'tumbado', quemado: true, frase: '¡Hola, amigo! En mi país ahora nieva... Creo que me he quemado un poquito.' }"],
 'capital': ["{ id: 'vecina-rivales', x: 9, y: 11, mira: 's', frase: 'Unos tipos raros preguntaban en el puerto por la isla que desapareció...' }",
             "{ id: 'marinero', x: 25, y: 13, mira: 'n', frase: 'El barco va a la isla siguiente, pero solo con quien ha vencido al gimnasio.' }"],
}
OBJETOS = {'fuego': ["{ id: 'pocion-caldera', x: 25, y: 22, objeto: 'pocion' }"], 'jable': ["{ id: 'pocion-jable', x: 21, y: 6, objeto: 'pocion' }"]}
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
"  // La costa de Lanzarote, aproximada (herramientas/isla1.py): dentro, tierra que no se pisa.\n"
"  silueta: [\n"+''.join(f"    [{x}, {y + NORTE}],\n" for x, y in SILUETA)+"  ],\n"
"  zonas: [\n"+''.join(partes)+"  ],\n};\n\n"
"/** A qué sala lleva cada puerta, por zona y casilla de la puerta (en coordenadas de la zona). */\n"
"export const PUERTAS_ISLA1: Readonly<Record<string, Readonly<Record<string, string>>>> = "+pu(puertas)+";\n")
open(sys.argv[1],'w').write(ts)
for k,v in zonas.items():
    print(k, v['origen'], v['z'].w, 'x', v['z'].h); print('\n'.join(v['z'].filas())); print()
