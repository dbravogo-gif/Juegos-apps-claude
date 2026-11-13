# Generador de la isla 2, Fuerteventura (2026-11-13; ISLA-2.md): dibuja cada zona con rectángulos
# y caminos y escribe src/data/isla2.ts con el mapa, los personajes y a qué sala lleva cada puerta.
# Siete zonas en el camino, de Corralejo a Morro Jable, y dos opcionales: Tindaya y Cofete.
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
z.r(0, 17, 3, 2, ':')                                           # salida al oeste, hacia Tindaya (opcional)
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
z.r(23, 22, 1, 2, ','); z.r(11, 29, 3, 1, ',')                  # salida hacia Sotavento (fase 3)
z.r(0, 1, 6, 28, '~'); z.r(6, 8, 4, 18, 'a')                   # el mar y la playa negra
z.r(6, 1, 17, 2, '#'); z.r(6, 3, 2, 5, '#'); z.r(14, 3, 9, 6, '#')        # acantilados del norte
z.r(8, 3, 6, 2, 'J'); z.p(10, 5, 'd'); z.puertas.append((10, 5, 'cueva-ajuy'))   # la boca de la cueva
z.camino([(10,6),(10,9)]); z.camino([(10,9),(18,9)])
z.camino([(18,9),(18,23)]); z.camino([(18,22),(23,22)], ancho=2); z.camino([(11,23),(18,23)]); z.camino([(12,23),(12,28)])
z.r(14, 12, 4, 6, '"'); z.r(19, 24, 4, 4, '"')                  # hierba en lo alto del acantilado
z.edificio(14, 25, 3, 2, 'C', 15, 'casa-ajuy')
z.r(6, 26, 4, 3, '#'); z.r(17, 13, 1, 1, '#')
zonas['ajuy'] = dict(nombre='Ajuy', origen=(10-30, 64), z=z, altura=0, hierba=True, suelo="{ a: '#3E3638' }")

# 6. Sotavento (36 × 26): la playa del viento, en el istmo. Entrada arriba (x 11..13, desde Ajuy);
# salida abajo (x 11..13, a Morro Jable). Jable con tuneras, hierba seca (una mancha en el camino),
# la playa larga y el mar al este; kitesurfistas que anuncian el gimnasio de Aire.
z = Z(36, 26, '.'); z.borde('#')
z.r(11, 0, 3, 1, ','); z.r(11, 25, 3, 1, ',')
z.r(30, 1, 5, 24, '~'); z.r(26, 1, 4, 24, 'a')                  # el mar y la playa
z.camino([(12,0),(12,8)]); z.camino([(12,8),(20,8)]); z.camino([(20,8),(20,16)]); z.camino([(12,16),(20,16)]); z.camino([(12,16),(12,25)])
z.r(2, 4, 7, 6, '"'); z.r(16, 10, 3, 4, '"'); z.r(10, 18, 5, 3, '"')     # hierba seca; la de abajo, en el camino
for x, y, w, h in ((3, 13, 3, 2), (22, 3, 2, 2), (5, 20, 3, 2), (22, 19, 2, 3)): z.r(x, y, w, h, 'U')
z.p(27, 10, 'O'); z.p(28, 10, 't'); z.p(27, 20, 'O'); z.p(28, 20, 't')
zonas['sotavento'] = dict(nombre='Sotavento', origen=(10-30, 94), z=z, altura=0, hierba=True, clima='viento')

# 7. Morro Jable (34 × 26): el puerto del sur. Entrada arriba (x 15..17, desde Sotavento). La calle
# del refugio, la tienda y el gimnasio de Aire; otra calle con dos casas; la playa, el faro, el
# muelle y el barco a Gran Canaria, que aún no sale.
z = Z(34, 26, ':'); z.borde('#')
z.r(15, 0, 3, 1, ',')
z.r(1, 20, 32, 5, '~'); z.r(1, 18, 32, 2, 'a')                  # el mar y la playa
z.camino([(15,0),(15,17)], ancho=3)
z.camino([(0,8),(32,8)]); z.camino([(1,14),(32,14)]); z.camino([(1,17),(32,17)])   # la calle de arriba sale al oeste, a Cofete
z.edificio(2, 5, 5, 3, 'R', 4, 'refugio-morro')
z.edificio(9, 5, 4, 3, 'S', 10, 'tienda-morro')
z.edificio(22, 3, 7, 5, 'G', 25, 'gimnasio-aire')
z.edificio(2, 11, 4, 3, 'C', 3, 'casa-morro-1')
z.edificio(22, 11, 4, 3, 'C', 23, 'casa-morro-2')
z.r(29, 18, 2, 2, 'F')                                          # el faro
z.r(18, 20, 2, 3, 'P'); z.r(20, 21, 2, 2, 'B')                  # el muelle y el barco
for x, y in ((8, 11), (13, 11), (19, 11), (30, 10)): z.p(x, y, 'T')
zonas['morro'] = dict(nombre='Morro Jable', origen=(6-30, 120), z=z, altura=0, casas='lanzarote')


# 8. Tindaya (26 × 20, opcional): la montaña sagrada, al oeste de Las Dunas (entrada al este, y
# 9..10, junto al campamento de la arqueóloga). Un llano seco con hierba y, en medio, la montaña:
# una senda sube dando la vuelta hasta la cima, con rocas de pies grabados y una guardiana que
# cuenta la leyenda de la isla que aparece y desaparece (la pista de la isla secreta, DISENO.md).
z = Z(26, 20, ':'); z.borde('#')
z.r(25, 9, 1, 2, ',')                                           # entrada desde Las Dunas
z.r(2, 2, 14, 16, '#')                                          # la montaña
z.camino([(16,10),(24,10)])                                     # del llano al pie de la montaña
z.camino([(13,10),(15,10)]); z.camino([(13,10),(13,15)]); z.camino([(4,15),(13,15)])   # la senda, por el sur
z.camino([(4,4),(4,15)]); z.camino([(4,4),(11,4)]); z.camino([(11,4),(11,6)])         # por el oeste y el norte
z.r(4, 8, 1, 5, '"')                                            # hierba seca en la subida: no se esquiva
z.r(6, 7, 6, 6, ':')                                            # la cima
z.p(7, 9, 'g'); z.p(10, 9, 'g')                                 # rocas con pies grabados
z.r(18, 2, 6, 4, '"'); z.r(17, 13, 6, 4, '"')                   # hierba seca del llano
z.r(20, 7, 2, 2, 'U')
# Alturas: la senda sube por escalones (2 abajo, 3 arriba) hasta la cima (4). Cada roca queda justo
# por debajo de lo más alto que pisa a su lado (la roca se dibuja 0,9 más alta, casi dos escalones):
# así la montaña sube en terrazas y la cima queda arriba, no hundida entre rocas (probador).
def h_pisable(x, y):
    if 6 <= x <= 11 and 7 <= y <= 12: return 4                   # la cima
    if (x == 4 and 4 <= y <= 11) or (y == 4 and 4 <= x <= 11) or (x == 11 and 5 <= y <= 6): return 3
    if 2 <= x <= 15 and 2 <= y <= 17: return 1 if (x, y) == (15, 10) else 2   # la senda de abajo
    return 0                                                     # el llano
alt = []
for y in range(20):
    fila = ''
    for x in range(26):
        if z.g[y][x] == '#' and 2 <= x <= 15 and 2 <= y <= 17:
            vecinas = [h_pisable(x + i, y + j) for i in (-1, 0, 1) for j in (-1, 0, 1)
                       if 0 <= x + i < 26 and 0 <= y + j < 20 and z.g[y + j][x + i] != '#']
            h = max(0, max(vecinas, default=0) - 2)
        elif z.g[y][x] == '#': h = 0
        else: h = h_pisable(x, y)
        fila += str(h)
    alt.append(fila)
zonas['tindaya'] = dict(nombre='Tindaya', origen=(7, 28), z=z, alturas=alt, hierba=True)

# 9. Cofete (30 × 18, opcional): la playa salvaje del oeste, detrás de las montañas de Jandía. Se
# llega desde Morro Jable (entrada al este, y 10) por un paso que sube en zigzag entre las
# montañas. Playa larga y sin nadie, una casa solitaria en la ladera y criaturas fuertes.
z = Z(30, 18, ':'); z.borde('#')
z.p(29, 10, ',')                                                # entrada desde Morro Jable
z.r(1, 1, 4, 16, '~'); z.r(5, 1, 5, 16, 'a')                    # el mar y la playa larga
z.r(19, 1, 10, 16, '#')                                         # las montañas de Jandía
z.camino([(26,10),(28,10)]); z.camino([(26,4),(26,10)]); z.camino([(21,4),(26,4)])    # el paso: sube
z.camino([(21,4),(21,13)]); z.camino([(18,13),(21,13)])                               # y baja
z.r(22, 7, 1, 3, ':')                                           # un rellano en la bajada (el pastor)
z.r(10, 6, 7, 4, '"'); z.r(11, 12, 6, 4, '"')                   # hierba alta, de criaturas fuertes
z.edificio(13, 1, 4, 3, 'C', 14, 'casa-cofete')                 # la casa solitaria
z.p(17, 11, 'U'); z.p(18, 6, 'U')
alt = []
for y in range(18):
    fila = ''
    for x in range(30):
        c = z.g[y][x]
        if x < 19: h = 0
        elif c == '#': h = 3 if 22 <= x <= 25 else 2
        elif (x == 26 and y <= 6) or (y == 4) or (x == 21 and y <= 8) or (x == 22 and 7 <= y <= 9): h = 2
        else: h = 1
        fila += str(h)
    alt.append(fila)
zonas['cofete'] = dict(nombre='Cofete', origen=(-54, 118), z=z, alturas=alt, hierba=True)

# Toda la isla, 60 casillas al este y 10 al sur: así caben la costa oeste (Ajuy y Cofete) y Lobos,
# al norte de Corralejo, sin coordenadas negativas. Las coordenadas de arriba y las de la silueta
# están sin desplazar. Mover zonas ya no rompe las partidas guardadas (`origenes` del guardado).
DESPLAZAMIENTO = 60
DESPLAZAMIENTO_Y = 10
for v in zonas.values(): v['origen'] = (v['origen'][0] + DESPLAZAMIENTO, v['origen'][1] + DESPLAZAMIENTO_Y)

# La costa de Fuerteventura, aproximada: de la punta de Corralejo por la costa este hasta Puerto
# del Rosario, y por la oeste, Morro Jable, Cofete, Sotavento, Ajuy y Tindaya. En casillas, sin
# desplazar; los .5 caen entre casillas. Entre Cofete y Sotavento, las montañas de Jandía.
SILUETA = [(38.5,3.5),(45.5,0.5),(66.5,0.5),(74.5,5.5),(77.5,20.5),(76.5,45.5),(70.5,56.5),
           (66.5,82.5),(58.5,96.5),(36.5,100.5),(20.5,102.5),(15.5,110.5),(14.5,124.5),(10.5,140.5),
           (0.5,143.5),(-17.5,143.5),(-29.5,138.5),(-54.5,136.5),(-55.5,122.5),(-51.5,114.5),
           (-33.5,110.5),(-21.5,106.5),(-20.5,96.5),(-20.5,70.5),(-13.5,61.5),(4.5,59.5),(5.5,50.5),
           (5.5,26.5),(30.5,18.5),(34.5,8.5)]
# Lobos, el islote al noroeste de Corralejo: se ve desde el pueblo, pero no se pisa.
LOBOS = [(41.5,-6.5),(44.5,-8.5),(48.5,-7.5),(49.5,-4.5),(45.5,-3.5),(42.5,-4.5)]
mover = lambda pts: [(x + DESPLAZAMIENTO, y + DESPLAZAMIENTO_Y) for x, y in pts]
SILUETA = mover(SILUETA); LOBOS = mover(LOBOS)

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
 'sotavento': ["{ id: 'kite-sotavento-1', x: 27, y: 8, mira: 'o', entrenador: { vision: 7, obligatorio: false }, frase: '¡Hoy sopla de lujo! Si vas al gimnasio de Aire, prepárate para volar.' }",
               "{ id: 'kite-sotavento-2', x: 28, y: 15, mira: 'o', entrenador: { vision: 8, obligatorio: false }, frase: 'Con este viento, mi cometa y mis criaturas no paran quietas. ¡A luchar!' }",
               "{ id: 'corredor-sotavento', x: 5, y: 16, mira: 'e', entrenador: { vision: 7, obligatorio: false }, frase: 'Corro contra el viento todos los días. ¿Te atreves a luchar contra él?' }"],
 'tindaya': ["{ id: 'montanera-tindaya', x: 17, y: 7, mira: 's', entrenador: { vision: 3, obligatorio: false }, frase: 'Subo a Tindaya cada semana. Y cada semana entreno aquí abajo. ¡Vamos!' }",
             "{ id: 'peregrino-tindaya', x: 11, y: 8, mira: 'n', entrenador: { vision: 1, obligatorio: true }, frase: 'Has subido hasta la cima. Antes de mirar los grabados, demuéstrame que lo mereces.' }",
             "{ id: 'guardiana-tindaya', x: 9, y: 11, mira: 'n', frase: 'Los antiguos subían aquí a mirar al oeste. Decían que algunas mañanas aparecía una isla en el horizonte… y que, al acercarse, desaparecía.' }"],
 'cofete': ["{ id: 'pastor-jandia', x: 22, y: 8, mira: 'o', entrenador: { vision: 1, obligatorio: true }, frase: 'Por este paso no cruza nadie sin luchar. Ni las cabras.' }",
            "{ id: 'surfista-cofete', x: 8, y: 12, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: 'Aquí no viene nadie: el mar es demasiado bravo. ¡Justo lo que me gusta!' }"],
 'morro': ["{ id: 'marinero-morro', x: 17, y: 19, mira: 's', frase: 'El barco a Gran Canaria saldrá pronto. Dicen que primero hay que vencer al gimnasio de Aire.' }",
           "{ id: 'vecina-morro', x: 11, y: 15, mira: 'n', frase: 'En el gimnasio de Aire, el viento te lleva de un lado a otro. ¡Fíjate en las aspas!' }"],
}
OBJETOS = {'dunas': ["{ id: 'pocion-horno', x: 33, y: 11, objeto: 'pocion' }", "{ id: 'cubo-dunas', x: 37, y: 31, objeto: 'cubo-blanco' }"],
           'betancuria': ["{ id: 'pocion-presa', x: 4, y: 16, objeto: 'pocion' }"],
           # Los premios de las zonas opcionales: una Superpoción en cada una, escondida.
           'tindaya': ["{ id: 'superpocion-tindaya', x: 1, y: 17, objeto: 'superpocion' }"],
           'cofete': ["{ id: 'superpocion-cofete', x: 5, y: 16, objeto: 'superpocion' }"]}
LETREROS = {'tindaya': {'7,9': 'Unos pies tallados en la roca, de hace muchísimo tiempo.\nTodos miran hacia el oeste, hacia el mar.',
                        '10,9': 'Más pies grabados. Junto a ellos, el dibujo de una isla con una nube encima.\nAlguien quiso dejar dicho algo que vio.'}}
CIERRES = {}

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
    if zid in LETREROS:
        t+="      letreros: {\n"+''.join(f"        '{k}': '{txt.replace(chr(10), chr(92)+'n')}',\n" for k, txt in LETREROS[zid].items())+"      },\n"
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

ts=("// Isla 2, inspirada en Fuerteventura (2026-11-13): el mapa por casillas (ISLA-2.md). Lo genera\n"
"// herramientas/isla2.py; las pruebas lo vigilan. De Corralejo a Morro Jable, con Tindaya y Cofete.\n"
"// Una letra por casilla, con la leyenda de src/core/mundo.ts. Las coordenadas de personajes y\n"
"// objetos son de su zona: x hacia el este, y hacia el sur. Los interiores van aparte.\n"
"import type { DefIsla } from '../core/mundo';\n\n"
"export const ISLA_2: DefIsla = {\n  id: 'fuerteventura',\n  inicio: { zona: 'corralejo', x: 12, y: 5 },\n"
"  // Fuerteventura es más seca todavía: suelo de tierra clara y cumbres peladas, ocres.\n"
"  // El gimnasio es de Aire: la isla del viento.\n"
"  gimnasio: 'aire',\n"
"  colores: {\n    suelo: { ':': '#D8BE8E', '.': '#D9C59A' },\n    cumbre: '#B0835A',\n    ladoCumbre: '#8E6644',\n    matas: '#8C8A4A',\n  },\n"
"  // La costa de Fuerteventura, aproximada (herramientas/isla2.py).\n"
"  silueta: [\n"+''.join(f"    [{x}, {y}],\n" for x, y in SILUETA)+"  ],\n"
"  // Lobos, al noroeste de Corralejo: se ve, pero no se pisa.\n"
"  islotes: [\n    [\n"+''.join(f"      [{x}, {y}],\n" for x, y in LOBOS)+"    ],\n  ],\n"
"  zonas: [\n"+''.join(partes)+"  ],\n};\n\n"
"/** A qué sala lleva cada puerta, por zona y casilla de la puerta (en coordenadas de la zona). */\n"
"export const PUERTAS_ISLA2: Readonly<Record<string, Readonly<Record<string, string>>>> = "+pu(puertas)+";\n")
open(sys.argv[1],'w').write(ts)
for k,v in zonas.items():
    print(k, v['origen'], v['z'].w, 'x', v['z'].h); print('\n'.join(v['z'].filas())); print()
