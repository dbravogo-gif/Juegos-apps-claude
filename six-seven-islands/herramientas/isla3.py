# Generador de la isla 3, Gran Canaria (2026-11-22; ISLA-3.md): dibuja cada zona con rectángulos y
# caminos y escribe src/data/isla3.ts con el mapa, los personajes y a qué sala lleva cada puerta.
# Fase 1: Las Palmas (la llegada, con el gimnasio Eléctrico) y La Isleta, al norte.
# Uso, desde six-seven-islands/: python3 herramientas/isla3.py src/data/isla3.ts
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

# 1. Las Palmas (36 × 32): la ciudad grande, la primera de verdad del juego. Arriba, el istmo: la
# playa de Las Canteras al oeste y el puerto al este, con el muelle y el barco de Fuerteventura;
# por él se sube a La Isleta (x 15..17). Abajo, la ciudad se ensancha: la calle de Triana con el
# gimnasio Eléctrico, el refugio y la tienda, y Vegueta con su catedral y la plaza de los perros.
# La carretera del sur (a Guayadeque y las cumbres), cortada hasta la fase 2.
z = Z(36, 32, ':'); z.borde('#')
z.r(15, 0, 3, 1, ','); z.r(15, 31, 3, 1, ',')                   # subida a La Isleta y bajada a Guayadeque (fase 2)
z.r(0, 1, 7, 13, '~'); z.r(7, 1, 3, 13, 'a')                    # Las Canteras: el mar al oeste y la playa
z.r(28, 1, 8, 30, '~')                                          # el mar del puerto, abierto al este
z.r(25, 3, 3, 1, 'P'); z.r(25, 4, 1, 4, 'P'); z.r(28, 2, 2, 2, 'B')   # el muelle y el barco, al final
z.camino([(15,0),(15,30)], ancho=3)                             # la avenida, de norte a sur
z.camino([(10,8),(27,8)])                                       # del paseo de la playa al muelle
z.camino([(18,4),(24,4)])                                       # hacia el muelle por el parque
z.camino([(1,14),(27,14)], ancho=2)                             # la calle de Triana
z.camino([(1,22),(27,22)])                                      # la calle de Vegueta
z.camino([(27,8),(27,28)])                                      # el paseo del mar
z.camino([(1,28),(27,28)])                                      # la calle de abajo
z.r(19, 1, 5, 2, '.'); z.r(19, 5, 6, 2, '.')                    # el parque de Santa Catalina
for x, y in ((19, 1), (23, 1), (20, 6), (12, 3), (12, 11)): z.p(x, y, 'T')   # sin la de (24,6): tapaba al marinero
z.p(21, 1, 'f')                                                 # una escultura en el parque
z.edificio(11, 9, 4, 3, 'R', 12, 'refugio-palmas')
z.edificio(19, 10, 4, 3, 'S', 20, 'tienda-palmas')
z.edificio(2, 16, 7, 5, 'G', 5, 'gimnasio-electrico')
z.edificio(10, 17, 4, 4, 'C', 11, 'casa-palmas-1')
z.edificio(20, 16, 6, 5, 'M', 22, None)                         # la catedral (sin puerta)
z.puertas.pop()
z.p(22, 21, ',')
z.edificio(2, 24, 4, 3, 'C', 3, 'casa-palmas-2')
z.edificio(8, 24, 4, 3, 'C', 9, 'casa-palmas-3')
z.edificio(20, 24, 4, 3, 'C', 21, 'casa-palmas-4')
z.r(19, 23, 1, 4, '.'); z.r(24, 23, 2, 4, '.'); z.p(25, 25, 'f')   # la plaza de Santa Ana, con sus perros
for x, y in ((24, 23), (19, 26), (13, 25)): z.p(x, y, 'T')
z.r(1, 29, 13, 2, '#'); z.r(19, 29, 8, 2, '#')                  # la ladera del sur
zonas['palmas'] = dict(nombre='Las Palmas', origen=(10, -36), z=z, altura=0, casas='balcones', suelo="{ ':': '#CFC5B4', ',': '#B9B1A4' }")

# 2. La Isleta (30 × 22): el barrio de pescadores y los volcanes viejos, al norte del istmo. Se
# entra por abajo (x 11..13, desde Las Palmas). Casas bajas junto al mar, una cala, hierba alta
# entre los conos (no se esquiva para llegar al faro) y el faro en la punta norte.
z = Z(30, 22, ':'); z.borde('#')
z.r(11, 21, 3, 1, ',')                                          # bajada a Las Palmas
z.r(0, 0, 30, 2, '~'); z.r(0, 2, 2, 16, '~'); z.r(27, 2, 3, 13, '~')   # el mar al norte, al oeste y al este
z.r(2, 2, 2, 5, 'a'); z.r(25, 9, 2, 5, 'a')                     # la cala del faro y la del barrio
z.camino([(11,21),(11,15)], ancho=3)                            # la entrada
z.camino([(13,16),(23,16)]); z.camino([(23,11),(23,16)])        # al barrio de pescadores
# Las casas, al norte de la calle y de cara a ella (antes, de espaldas al barrio; probador).
z.edificio(14, 14, 3, 2, 'C', 15, 'casa-isleta-1')
z.edificio(18, 14, 4, 2, 'C', 19, 'casa-isleta-2')
z.r(14, 18, 10, 3, '.'); z.p(14, 20, 'T'); z.p(22, 20, 'T')    # la plazoleta del barrio, con palmeras en las esquinas
z.camino([(11,15),(11,12)])
z.camino([(5,12),(11,12)]); z.camino([(5,4),(5,12)]); z.camino([(5,4),(9,4)])   # la senda del faro, por el oeste
z.r(3, 3, 2, 2, 'F')                                            # el faro
z.r(8, 6, 4, 3, 'Q'); z.r(15, 4, 5, 4, 'Q'); z.r(17, 9, 3, 3, 'Q')    # los volcanes viejos
z.r(6, 9, 5, 2, ';'); z.r(12, 9, 4, 4, ';')                     # malpaís al pie de los conos
z.r(5, 6, 1, 6, '"'); z.r(2, 8, 3, 6, '"'); z.r(6, 13, 4, 3, '"')    # hierba alta: la de la senda no se esquiva
z.r(20, 3, 6, 5, '"'); z.r(21, 8, 2, 3, '"')
z.r(1, 18, 9, 3, '#'); z.r(25, 15, 4, 6, '#')                   # roca en las esquinas
z.p(24, 17, 'T'); z.p(25, 16, ':')
zonas['isleta'] = dict(nombre='La Isleta', origen=(14, -58), z=z, altura=0, hierba=True, casas='lanzarote', flora='volcan')

# 3. Guayadeque (30 × 26, fase 2): el barranco de las casas cueva. Se baja desde Las Palmas (arriba,
# x 13..15) por el fondo del barranco, entre dos paredes de roca altas, y se sale al oeste (y 20..21)
# hacia las cumbres. En las paredes, las casas cueva (`J`), con su puerta al fondo del barranco; un
# refugio en la curva; la hierba cruza el camino (no se esquiva).
z = Z(30, 26, ':'); z.borde('#')
z.r(13, 0, 3, 1, ','); z.r(0, 20, 1, 2, ',')
z.r(1, 1, 8, 15, '#'); z.r(21, 1, 8, 24, '#'); z.r(1, 23, 20, 2, '#')    # las paredes del barranco
# Huecos al pie de las paredes, con la casa cueva encima (la puerta da al hueco).
z.r(4, 9, 5, 2, ':'); z.r(4, 7, 4, 2, 'J'); z.p(5, 9, 'd'); z.puertas.append((5, 9, 'casa-cueva-1'))
z.r(21, 8, 4, 2, ':'); z.r(21, 6, 4, 2, 'J'); z.p(22, 8, 'd'); z.puertas.append((22, 8, 'casa-cueva-2'))
z.r(21, 15, 5, 2, ':'); z.r(21, 13, 5, 2, 'J'); z.p(23, 15, 'd'); z.puertas.append((23, 15, 'restaurante-cueva'))
z.r(26, 15, 4, 2, ',')                                           # el paso a Bandama (fase 4, opcional)
z.camino([(13,0),(13,20)], ancho=3)                              # el fondo del barranco
z.camino([(0,20),(15,20)], ancho=2)                              # la curva hacia el oeste
z.edificio(16, 17, 4, 3, 'R', 17, 'refugio-guayadeque')
z.r(9, 10, 12, 2, '"')                                           # la hierba que cruza el barranco
z.r(9, 3, 3, 5, '"'); z.r(17, 3, 3, 4, '"'); z.r(2, 17, 7, 2, '"')
for x, y in ((10, 13), (19, 9), (10, 17), (19, 14), (3, 21)): z.p(x, y, 'T')
alt = []
for y in range(26):
    fila = ''
    for x in range(30):
        c = z.g[y][x]
        if c in '#J': fila += '2' if 0 < x < 29 and 0 < y < 25 else '1'
        else: fila += '1' if y >= 16 else '0'
    alt.append(fila)
zonas['guayadeque'] = dict(nombre='Guayadeque', origen=(12, -4), z=z, alturas=alt, hierba=True)

# 4. Las cumbres (30 × 22, fase 2): la subida al centro de la isla, de este a oeste, en terrazas con
# muros de piedra (`=`) y almendros en flor. Se entra por el este (y 14..15, desde Guayadeque) y se
# sube al norte (x 6..8) hacia el Roque Nublo. La salida al oeste, a Tejeda, en la fase 3.
z = Z(30, 22, ':'); z.borde('#')
z.r(29, 14, 1, 2, ','); z.r(6, 0, 3, 1, ','); z.r(0, 9, 1, 2, ',')   # y al oeste, a Tejeda (fase 3)
z.camino([(29,14),(20,14)], ancho=2); z.camino([(20,8),(20,15)], ancho=2)
z.camino([(7,8),(21,8)], ancho=2); z.camino([(7,0),(7,9)], ancho=2)
for y in (5, 11, 17): z.r(1, y, 28, 1, '=')                      # los muros de las terrazas
for x, y in ((20, 11), (21, 11), (7, 5), (8, 5)): z.p(x, y, ',')  # los pasos entre terrazas
z.r(7, 6, 2, 1, '"')                                            # la hierba del último paso: no se esquiva
z.r(22, 12, 6, 2, '"'); z.r(11, 9, 5, 2, '"'); z.r(2, 6, 4, 4, '"'); z.r(10, 2, 8, 2, '"'); z.r(19, 9, 1, 2, '"')
for x, y in ((25, 16), (15, 15), (4, 13), (12, 13), (24, 7), (3, 2), (22, 2), (26, 19), (9, 19)): z.p(x, y, 'T')
z.r(1, 18, 28, 3, '#'); z.r(1, 12, 3, 5, '#')
z.r(24, 17, 2, 5, ',')                                           # la bajada a Maspalomas (fase 4, opcional)
alt = []
for y in range(22):
    fila = ''
    for x in range(30):
        h = 1 if y >= 11 and x >= 18 else 2 if y >= 5 else 3
        if z.g[y][x] == '#': h = min(9, h + 1)
        fila += str(h)
    alt.append(fila)
zonas['cumbres'] = dict(nombre='Las cumbres', origen=(-18, 2), z=z, alturas=alt, hierba=True, arboles='almendro', flora='humeda')

# 5. El Roque Nublo (34 × 20, fase 2): la cima, con el monolito (`I`) y el mar de nubes (`x`) por
# debajo, al oeste y al norte. Se entra por abajo (x 12..14). En la senda espera el comandante de
# la rama que te persigue (HISTORIA.md); al vencerlo llega el segundo amigo.
z = Z(34, 20, ':'); z.borde('#')
z.r(12, 19, 3, 1, ',')
z.r(0, 0, 34, 4, 'x'); z.r(0, 0, 6, 20, 'x'); z.r(28, 0, 6, 20, 'x')     # el mar de nubes
z.r(6, 4, 22, 1, '#'); z.r(6, 4, 1, 16, '#'); z.r(27, 4, 1, 16, '#')     # el borde de la cumbre
z.camino([(13,19),(13,13)]); z.camino([(13,13),(20,13)]); z.camino([(20,13),(20,10)]); z.camino([(17,10),(20,10)])
# El muro de la cima, bajo (`=`): con un risco alto delante, el comandante quedaba tapado (probador, 2026-11-23).
z.r(7, 9, 20, 1, '='); z.r(16, 9, 2, 1, ',')                   # la cima, tras un paso estrecho: ahí espera el comandante
z.r(15, 6, 4, 2, '#'); z.p(16, 6, 'I')                          # el monolito, sobre su peña
z.r(9, 14, 3, 4, '"'); z.r(22, 10, 4, 6, '"'); z.r(8, 6, 5, 3, '"'); z.r(13, 15, 1, 2, '"')
z.p(10, 10, 'g'); z.p(24, 6, 'g')                               # los miradores
alt = []
for y in range(20):
    fila = ''
    for x in range(34):
        c = z.g[y][x]
        fila += '1' if c == 'x' else '5' if c in '#I' else '4' if y <= 12 else '3'
    alt.append(fila)
# Flora de volcán: piedras bajas en los riscos (los cardones tapaban al comandante; 2026-11-22).
zonas['nublo'] = dict(nombre='Roque Nublo', origen=(-24, -18), z=z, alturas=alt, hierba=True, flora='volcan')

# 5b. El mar de nubes, al norte del Roque Nublo (34 × 20): solo nubes, no se pisa ni se entra. Detrás
# del monolito se veía el mar abierto, con una barca (probador, 2026-11-23).
z = Z(34, 20, 'x')
zonas['nubes-nublo'] = dict(nombre='Mar de nubes', origen=(-24, -38), z=z, alturas=['1' * 34] * 20)

# 6. Tejeda y Artenara (28 × 22, fase 3): el pueblo de la cumbre. Se entra por el este (y 9..10,
# desde las cumbres) y se sale al norte (x 6..8) hacia el pinar de Tamadaba. Casas cueva en la
# ladera de arriba, casas blancas en la plaza, el refugio y la tienda, y un mirador al Roque Bentayga.
z = Z(28, 22, ':'); z.borde('#')
z.r(27, 9, 1, 2, ','); z.r(6, 0, 3, 1, ',')
z.r(1, 1, 5, 6, '#'); z.r(10, 1, 17, 4, '#')                     # la ladera de arriba
z.r(12, 5, 4, 2, ':'); z.r(12, 3, 4, 2, 'J'); z.p(13, 5, 'd'); z.puertas.append((13, 5, 'casa-cueva-tejeda'))
z.r(20, 5, 4, 2, ':'); z.r(20, 3, 4, 2, 'J'); z.p(21, 5, 'd'); z.puertas.append((21, 5, 'casa-cueva-artenara'))
z.camino([(27,9),(7,9)], ancho=2); z.camino([(7,0),(7,10)], ancho=2)
z.camino([(1,15),(26,15)])                                       # la calle, antes que las casas (si no, tapa sus puertas)
z.edificio(2, 12, 5, 3, 'R', 4, 'refugio-tejeda')
z.edificio(9, 12, 4, 3, 'S', 10, 'tienda-tejeda')
z.edificio(16, 12, 4, 3, 'C', 17, 'casa-tejeda')
z.r(14, 17, 5, 2, '.'); z.p(16, 17, 'Y')                         # la plaza, con su drago
z.r(21, 17, 6, 4, '"'); z.r(1, 17, 6, 4, '"'); z.r(9, 6, 2, 2, '"')
z.p(24, 11, 'g')                                                 # el mirador al Bentayga
for x, y in ((10, 18), (20, 11), (25, 7)): z.p(x, y, 'T')
alt = []
for y in range(22):
    fila = ''
    for x in range(28):
        c = z.g[y][x]
        fila += '4' if c in '#J' and 0 < x < 27 and 0 < y < 21 else '2'
    alt.append(fila)
zonas['tejeda'] = dict(nombre='Tejeda', origen=(-46, 2), z=z, alturas=alt, casas='lanzarote', arboles='almendro')

# 7. Tamadaba (36 × 26, fase 3): el pinar del oeste, con niebla y mucha hierba alta, la zona más
# larga y de salvajes más fuertes. Se entra por abajo (x 20..22, desde Tejeda) y se sale arriba
# (x 16..18) hacia Agaete. El camino zigzaguea entre pinos; la hierba lo corta dos veces.
z = Z(36, 26, ':'); z.borde('#')
z.r(20, 25, 3, 1, ','); z.r(16, 0, 3, 1, ',')
z.camino([(21,25),(21,20)]); z.camino([(6,20),(21,20)]); z.camino([(6,12),(6,20)]); z.camino([(6,12),(28,12)])
z.camino([(28,5),(28,12)]); z.camino([(17,5),(28,5)]); z.camino([(17,0),(17,5)])
z.r(10, 18, 8, 4, '"'); z.r(20, 10, 5, 4, '"'); z.r(2, 2, 8, 7, '"'); z.r(30, 14, 5, 8, '"'); z.r(12, 1, 4, 3, '"')
z.r(9, 6, 3, 3, '"')
import random as _r
_g = _r.Random(7)
for _ in range(70):
    x, y = _g.randrange(1, 35), _g.randrange(1, 25)
    if z.g[y][x] == ':': z.p(x, y, 'T')                          # el pinar
alt = []
for y in range(26):
    fila = ''
    for x in range(36):
        fila += '3' if z.g[y][x] != '#' or not (0 < x < 35 and 0 < y < 25) else '4'
    alt.append(fila)
zonas['tamadaba'] = dict(nombre='Tamadaba', origen=(-60, -24), z=z, alturas=alt, hierba=True, arboles='pino', clima='niebla', flora='humeda')

# 8. Agaete (34 × 24, fase 3): el pueblo blanco del oeste, con el muelle y el barco a Tenerife (aún no
# sale), el refugio, la tienda y el terrero de lucha canaria, que es el gimnasio de Lucha. Se entra
# por abajo (x 16..18, desde Tamadaba). En la costa, el roque con forma de dedo que sale del mar.
z = Z(34, 24, ':'); z.borde('#')
z.r(16, 23, 3, 1, ',')
z.r(0, 0, 34, 5, '~'); z.r(0, 0, 4, 24, '~'); z.r(1, 5, 30, 2, 'a')    # el mar al norte y al oeste, y la playa
z.r(4, 7, 1, 16, 'a')
z.r(14, 0, 2, 5, 'P'); z.r(16, 2, 2, 2, 'B')                    # el muelle y el barco
z.p(2, 9, 'I')                                                  # el roque del dedo, en el agua de la orilla
z.camino([(17,23),(17,7)], ancho=2); z.camino([(5,10),(32,10)]); z.camino([(5,17),(32,17)])
z.camino([(14,7),(15,7)])
z.edificio(6, 7, 5, 3, 'R', 8, 'refugio-agaete')
z.edificio(20, 7, 4, 3, 'S', 21, 'tienda-agaete')
z.edificio(22, 12, 9, 5, 'G', 26, 'gimnasio-lucha')            # el terrero
z.edificio(6, 13, 4, 3, 'C', 7, 'casa-agaete-1')
z.edificio(11, 13, 4, 3, 'C', 12, 'casa-agaete-2')
z.r(20, 19, 6, 3, '"'); z.r(6, 19, 7, 3, '"')
for x, y in ((25, 8), (30, 8), (19, 13), (15, 20)): z.p(x, y, 'T')
zonas['agaete'] = dict(nombre='Agaete', origen=(-60, -48), z=z, altura=0, hierba=False, casas='lanzarote', gimnasio='lucha')

# 9. Bandama (24 × 20, fase 4, opcional): la caldera, un cráter redondo y hondo con una finca en el
# fondo. Se entra por el oeste (y 9..10, desde Guayadeque); la senda sube al borde y baja al fondo.
z = Z(24, 20, ':'); z.borde('#')
z.r(0, 9, 1, 2, ',')
cx, cy = 13, 10
for y in range(1, 19):
    for x in range(1, 23):
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if 5.5 <= d < 8: z.p(x, y, '#')                          # las paredes del cráter
        elif d < 5.5: z.p(x, y, '"' if (x + y) % 5 else ':')     # el fondo, con hierba
z.camino([(0,9),(4,9)], ancho=2); z.camino([(4,9),(4,3)]); z.camino([(4,3),(13,3)]); z.camino([(13,3),(13,6)])   # sube al borde y baja
z.edificio(11, 9, 4, 2, 'C', 12, 'casa-bandama')                 # la finca del fondo
z.camino([(12,7),(12,8)]); z.camino([(13,6),(13,8)])
for x, y in ((15, 13), (10, 13), (2, 15), (20, 3)): z.p(x, y, 'T')
alt = []
for y in range(20):
    fila = ''
    for x in range(24):
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        c = z.g[y][x]
        fila += '3' if c == '#' and 5.5 <= d < 8 else '1' if d < 5.5 else '2' if (x == 4 or y == 3) and c == ',' else '1'
    alt.append(fila)
zonas['bandama'] = dict(nombre='Bandama', origen=(42, 2), z=z, alturas=alt, hierba=True, flora='humeda')

# 10. Maspalomas (30 × 18, fase 4, opcional): el sur. Se baja desde las cumbres (arriba, x 18..19).
# Dunas pequeñas (para no repetir las de Fuerteventura), la charca del oasis con palmeras, el faro
# y la playa con el mar al sur.
z = Z(30, 18, 'D'); z.borde('K')
z.r(18, 0, 2, 1, ':')
z.r(0, 14, 30, 4, '~'); z.r(1, 12, 28, 2, 'a')                   # el mar y la playa
z.r(17, 1, 4, 3, ':'); z.camino([(18,1),(18,11)], ancho=2)       # la bajada hasta la playa
z.r(3, 3, 6, 4, '~'); z.r(2, 2, 8, 1, ':'); z.r(2, 7, 8, 1, ':'); z.r(2, 3, 1, 4, ':'); z.r(9, 3, 1, 4, ':')   # la charca
for x, y in ((2, 2), (9, 2), (2, 7), (9, 7)): z.p(x, y, 'T')
z.r(24, 9, 2, 2, 'F')                                            # el faro
z.r(23, 11, 4, 1, ':')
for x, y, w, h in ((12, 3, 3, 1), (22, 4, 4, 1), (11, 8, 4, 1), (21, 7, 2, 1)): z.r(x, y, w, h, 'K')   # crestas
zonas['maspalomas'] = dict(nombre='Maspalomas', origen=(-12, 24), z=z, altura=0, hierba=True, clima='calima')

# Toda la isla, desplazada para que no haya coordenadas negativas (la silueta entera cabe).
DESPLAZAMIENTO = 60
DESPLAZAMIENTO_Y = 65
for v in zonas.values(): v['origen'] = (v['origen'][0] + DESPLAZAMIENTO, v['origen'][1] + DESPLAZAMIENTO_Y)

# La costa de Gran Canaria, aproximada y redonda: en casillas, sin desplazar. De La Isleta baja por
# el este (Telde) hasta Maspalomas, sube por el oeste (Mogán, Aldea) hasta Agaete y vuelve por el
# norte (Gáldar, Arucas). El mar de Las Palmas y de La Isleta queda fuera: si no, la tierra de detrás
# lo encerraba como un canal (probador, Fuerteventura).
# En la fase 1, solo el trozo construido: el resto de la isla, tierra plana y vacía, se veía como
# una llanura sin nada (probador, 2026-11-22). Crece con cada fase.
SILUETA = [(15.5,-55.5),(40.5,-55.5),(40.5,-43.5),(38.5,-40.5),(37.5,-35.5),(37.5,-4.5),(41.5,-4.5),
           (41.5,1.5),(65.5,1.5),(65.5,21.5),(17.5,21.5),(17.5,41.5),(-12.5,41.5),(-12.5,23.5),(-46.5,23.5),(-46.5,1.5),(-56.5,1.5),(-56.5,-24.5),
           (-56.5,-41.5),(-24.5,-41.5),(-24.5,-18.5),(9.5,-18.5),(9.5,-22.5),(19.5,-34.5),(19.5,-37.5),
           (15.5,-40.5)]
mover = lambda pts: [(x + DESPLAZAMIENTO, y + DESPLAZAMIENTO_Y) for x, y in pts]
SILUETA = mover(SILUETA)

PERSONAJES = {
 'palmas': [
   "{ id: 'marinero-palmas', x: 24, y: 5, mira: 'e', frase: 'Este barco va y viene de Morro Jable.' }",
   # Chano te espera en el muelle con el repartidor de experiencia (autor, 2026-11-26, D3).
   "{ id: 'chano-palmas', x: 26, y: 7, mira: 'n', escena: { vision: 3 }, uniforme: 'tuyo' }",
   "{ id: 'surfista-canteras', x: 8, y: 6, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: '¡Las Canteras tiene la mejor ola de la ciudad! Y yo, el mejor equipo de la playa.' }",
   "{ id: 'estudiante-triana', x: 24, y: 13, mira: 'o', entrenador: { vision: 4, obligatorio: false }, frase: 'Estudio la electricidad de las criaturas. ¿Me dejas hacer un experimento contigo?' }",
   "{ id: 'guia-vegueta', x: 18, y: 21, mira: 'e', frase: 'Esta es la catedral de Santa Ana. Tardaron casi cuatrocientos años en terminarla.' }",
   "{ id: 'vecina-palmas', x: 14, y: 13, mira: 's', frase: 'En el gimnasio de Triana hay chispazos todo el día. Dicen que el líder ni aparece.' }",
   "{ id: 'nino-palmas', x: 21, y: 8, mira: 'n', frase: '¡Mira las barcas! Dicen que el barco grande de Agaete va hasta Tenerife.' }",
 ],
 'isleta': [
   "{ id: 'pescador-isleta', x: 24, y: 13, mira: 'o', entrenador: { vision: 4, obligatorio: false }, frase: 'En esta cala se pesca desde antes de que hubiera ciudad. ¿Echamos un combate?' }",
   "{ id: 'excursionista-isleta', x: 10, y: 13, mira: 'n', entrenador: { vision: 3, obligatorio: false }, frase: 'Estos volcanes están dormidos. ¡Mis criaturas, no!' }",
   "{ id: 'buscador-isleta', x: 7, y: 4, mira: 'o', entrenador: { vision: 2, obligatorio: false }, frase: 'Nadie llega al faro sin pasar por mí. Es tradición. Bueno, es mi tradición.' }",
   "{ id: 'farera-isleta', x: 4, y: 5, mira: 's', frase: 'Desde lo alto del faro se ven Tenerife y el Teide. Y algunas mañanas, algo más allá…' }",
   "{ id: 'vecino-isleta', x: 17, y: 17, mira: 's', frase: 'El barrio entero es de pescadores. Huele a mar y a pescado frito todo el día.' }",
 ],
}
PERSONAJES['guayadeque'] = [
   "{ id: 'cabrero-guayadeque', x: 16, y: 5, mira: 'o', entrenador: { vision: 3, obligatorio: false }, frase: 'Mis cabras suben por estas paredes como si nada. ¿Y tú, subes o luchas?' }",
   "{ id: 'excursionista-guayadeque', x: 12, y: 15, mira: 'e', entrenador: { vision: 3, obligatorio: false }, frase: 'He bajado a comer a la cueva del restaurante. ¡Y ahora toca bajar la comida luchando!' }",
   "{ id: 'vecina-guayadeque', x: 7, y: 10, mira: 's', frase: 'Aquí vivimos dentro de la roca: fresquito en verano y calentito en invierno.' }",
]
PERSONAJES['cumbres'] = [
   "{ id: 'montanera-cumbres', x: 22, y: 9, mira: 'o', entrenador: { vision: 2, obligatorio: false }, frase: 'Desde aquí arriba se ven las nubes por debajo. ¡Y a ti, por encima de mis criaturas no!' }",
   "{ id: 'corredor-cumbres', x: 9, y: 4, mira: 'o', entrenador: { vision: 2, obligatorio: false }, frase: 'Subo corriendo hasta el Roque todos los días. ¿Me echas una carrera? Mejor un combate.' }",
   "{ id: 'vecino-cumbres', x: 18, y: 15, mira: 's', frase: 'En enero, todos estos almendros se ponen blancos y rosas. Parece que ha nevado.' }",
   # La carretera de Tejeda, cortada por los soldados hasta que conoces al segundo amigo en el Roque
   # Nublo: si no, se podía saltar la escena (probador, 2026-11-23).
   "{ id: 'soldado-cumbres-1', x: 1, y: 9, mira: 'e', uniforme: 'perseguidor', sin: 'amigo2-conocido', frase: 'Órdenes del comandante: la carretera de Tejeda está cerrada. Él está arriba, en el Roque.' }",
   "{ id: 'soldado-cumbres-2', x: 1, y: 10, mira: 'e', uniforme: 'perseguidor', sin: 'amigo2-conocido', frase: 'Por aquí no se pasa. Si tienes algo que decir, súbeselo al comandante.' }",
]
PERSONAJES['nublo'] = [
   # El comandante de la rama que te persigue (HISTORIA.md): te para en la senda; al vencerlo se va.
   "{ id: 'comandante-nublo', x: 19, y: 8, mira: 'o', entrenador: { vision: 3, obligatorio: true }, uniforme: 'perseguidor', sin: 'vencido:comandante-nublo' }",
   "{ id: 'soldado-nublo', x: 20, y: 8, mira: 'o', uniforme: 'perseguidor', sin: 'vencido:comandante-nublo', frase: 'Órdenes del comandante: aquí arriba no sube nadie.' }",
   # El segundo amigo llega cuando el comandante se va (HISTORIA.md: lo conoces en el Roque Nublo).
   "{ id: 'amigo2-nublo', x: 14, y: 8, mira: 'e', con: 'vencido:comandante-nublo', uniforme: 'amigo2' }",
]
PERSONAJES['tejeda'] = [
   "{ id: 'paseante-tejeda', x: 22, y: 8, mira: 's', entrenador: { vision: 1, obligatorio: false }, frase: 'Vengo a por dulces de almendra todos los domingos. ¡Y a por un combate!' }",
   "{ id: 'pastor-tejeda', x: 5, y: 8, mira: 'e', entrenador: { vision: 2, obligatorio: false }, frase: 'El camino del pinar sale de aquí, hacia el norte. Antes, a ver qué tal te defiendes.' }",
   "{ id: 'guia-tejeda', x: 23, y: 11, mira: 'e', frase: 'Ese roque de enfrente es el Bentayga. Los antiguos subían ahí a pedir lluvia.' }",
   "{ id: 'vecina-tejeda', x: 15, y: 16, mira: 's', frase: 'Prueba los bienmesabes: almendra, huevo y azúcar. Aquí se hacen como en ningún sitio.' }",
]
PERSONAJES['tamadaba'] = [
   "{ id: 'excursionista-tamadaba', x: 7, y: 15, mira: 'o', entrenador: { vision: 1, obligatorio: false }, frase: 'Con esta niebla no se ve ni el pino de al lado. ¡Pero a ti sí te veo!' }",
   "{ id: 'buscador-tamadaba', x: 25, y: 13, mira: 'n', entrenador: { vision: 1, obligatorio: false }, frase: 'Busco piñas para el fuego. Y criaturas fuertes: aquí salen las más bravas de la isla.' }",
   "{ id: 'guarda-tamadaba', x: 29, y: 8, mira: 'o', entrenador: { vision: 1, obligatorio: false }, frase: 'Soy el guarda del pinar. Nadie baja a Agaete sin demostrar que respeta el monte.' }",
]
PERSONAJES['agaete'] = [
   "{ id: 'marinero-agaete', x: 16, y: 6, mira: 'n', frase: 'El barco a Tenerife saldrá pronto.' }",
   "{ id: 'pescador-agaete', x: 24, y: 5, mira: 's', entrenador: { vision: 2, obligatorio: false }, frase: 'De este muelle salen los barcos grandes. Y yo, a por criaturas. ¡Vamos!' }",
   "{ id: 'vecina-agaete', x: 10, y: 11, mira: 's', frase: 'Ese roque del agua es el Dedo de Dios. Lleva miles de años señalando al cielo.' }",
   # El segundo amigo te espera en la puerta del terrero (fase 3): entrará contigo al final.
   "{ id: 'amigo2-agaete', x: 28, y: 18, mira: 'o', con: 'amigo2-conocido', uniforme: 'amigo2' }",
]
PERSONAJES['bandama'] = [
   "{ id: 'excursionista-bandama', x: 3, y: 6, mira: 'e', entrenador: { vision: 1, obligatorio: false }, frase: 'Desde el borde de la caldera se ve el mar y las cumbres a la vez. ¡Y a ti!' }",
   "{ id: 'agricultor-bandama', x: 14, y: 12, mira: 'n', frase: 'En el fondo de la caldera se cultivan viñas desde hace siglos. Aquí no llega el viento.' }",
]
PERSONAJES['maspalomas'] = [
   "{ id: 'surfista-maspalomas', x: 8, y: 12, mira: 'e', entrenador: { vision: 4, obligatorio: false }, frase: 'Aquí abajo siempre hace sol. ¡Y siempre hay alguien con quien luchar!' }",
   "{ id: 'buscador-maspalomas', x: 20, y: 6, mira: 'o', entrenador: { vision: 1, obligatorio: false }, frase: 'Las dunas de aquí se mueven con el viento. Las criaturas que viven en ellas, también.' }",
   "{ id: 'farero-maspalomas', x: 23, y: 11, mira: 'e', frase: 'Este faro guía a los barcos que van a Tenerife. Algunas noches se ve otra luz, más al oeste, que no es de ningún faro.' }",
]
OBJETOS = {'isleta': ["{ id: 'superpocion-faro', x: 2, y: 3, objeto: 'superpocion' }", "{ id: 'cubo-isleta', x: 25, y: 9, objeto: 'cubo-blanco' }"],
           'palmas': ["{ id: 'pocion-canteras', x: 8, y: 12, objeto: 'pocion' }"],
           'guayadeque': ["{ id: 'pocion-barranco', x: 9, y: 19, objeto: 'pocion' }"],
           'cumbres': ["{ id: 'superpocion-almendros', x: 1, y: 6, objeto: 'superpocion' }"],
           'tejeda': ["{ id: 'pocion-tejeda', x: 25, y: 19, objeto: 'pocion' }"],
           'tamadaba': ["{ id: 'superpocion-pinar', x: 3, y: 3, objeto: 'superpocion' }", "{ id: 'cubo-pinar', x: 33, y: 23, objeto: 'cubo-blanco' }"],
           'agaete': ["{ id: 'pocion-agaete', x: 31, y: 22, objeto: 'pocion' }"],
           'bandama': ["{ id: 'superpocion-caldera', x: 16, y: 8, objeto: 'superpocion' }"],
           'maspalomas': ["{ id: 'superpocion-oasis', x: 6, y: 2, objeto: 'superpocion' }"]}
LETREROS = {'palmas': {'21,1': 'Una escultura de hierro con forma de ancla.\nLa placa dice: «A los que llegaron por mar».',
                       '25,25': 'Ocho perros de bronce, sentados en la plaza.\nDicen que la isla se llama así por unos perros enormes que vieron los primeros navegantes.'},
            'tejeda': {'24,11': 'Mirador del Bentayga. Enfrente, un roque enorme sale del barranco como una torre.\nDicen que los antiguos guardaban allí su grano y sus secretos.'},
            'nublo': {'10,10': 'Un mirador sobre el mar de nubes. Al oeste, por encima de las nubes, asoma el Teide.\nY más allá, muy lejos, una sombra en el horizonte. Al parpadear, ya no está.',
                      '24,6': 'Grabado en la piedra: «Desde aquí miraban los antiguos». Debajo, trece círculos pequeños.\nOcho pequeños y cinco grandes, como en el grabado de la arqueóloga de las dunas.'}}

def bloque(lista, nombre):
    if not lista: return ''
    if len(lista)==1: return f"      {nombre}: [{lista[0]}],\n"
    return f"      {nombre}: [\n" + ''.join(f"        {e},\n" for e in lista) + "      ],\n"

partes=[]; puertas={}
for zid, v in zonas.items():
    z=v['z']; ox,oy=v['origen']
    t=f"    {{\n      id: '{zid}',\n      nombre: '{v['nombre']}',\n      origen: {{ x: {ox}, y: {oy} }},\n      hierbaObligatoria: {'true' if v.get('hierba') else 'false'},\n"
    if v.get('casas'): t+=f"      casas: '{v['casas']}',\n"
    if v.get('flora'): t+=f"      flora: '{v['flora']}',\n"
    if v.get('clima'): t+=f"      clima: '{v['clima']}',\n"
    if v.get('gimnasio'): t+=f"      // El terrero: el gimnasio de Lucha, no el Eléctrico de la isla.\n      gimnasio: '{v['gimnasio']}',\n"
    if v.get('suelo'): t+=f"      // La ciudad, adoquinada: piedra clara y calles algo más oscuras.\n      suelo: {v['suelo']},\n"
    if zid in LETREROS:
        t+="      letreros: {\n"+''.join(f"        '{k}': '{txt.replace(chr(10), chr(92)+'n')}',\n" for k, txt in LETREROS[zid].items())+"      },\n"
    t+=bloque(PERSONAJES.get(zid,[]),'personajes') if PERSONAJES.get(zid) else "      personajes: [],\n"
    t+=bloque(OBJETOS.get(zid,[]),'objetos')
    if v.get('arboles'): t+=f"      arboles: '{v['arboles']}',\n"
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

ts=("// Isla 3, inspirada en Gran Canaria (2026-11-22): el mapa por casillas (ISLA-3.md). Lo genera\n"
"// herramientas/isla3.py; las pruebas lo vigilan. Fase 1: Las Palmas y La Isleta.\n"
"// Una letra por casilla, con la leyenda de src/core/mundo.ts. Las coordenadas de personajes y\n"
"// objetos son de su zona: x hacia el este, y hacia el sur. Los interiores van aparte.\n"
"import type { DefIsla } from '../core/mundo';\n\n"
"export const ISLA_3: DefIsla = {\n  id: 'gran-canaria',\n  inicio: { zona: 'palmas', x: 26, y: 4 },\n"
"  // Dos gimnasios: Eléctrico en Las Palmas y Lucha en Agaete (fase 3). La azotea, con el rayo.\n"
"  gimnasio: 'electrico',\n"
"  // Más verde que las dos primeras: cumbres pardas con matorral y hierba alta de un verde vivo.\n"
"  colores: {\n    cumbre: '#9E9070',\n    ladoCumbre: '#7C6F52',\n    matas: '#5E8240',\n  },\n"
"  // La costa de Gran Canaria, aproximada (herramientas/isla3.py).\n"
"  silueta: [\n"+''.join(f"    [{x}, {y}],\n" for x, y in SILUETA)+"  ],\n"
"  zonas: [\n"+''.join(partes)+"  ],\n};\n\n"
"/** A qué sala lleva cada puerta, por zona y casilla de la puerta (en coordenadas de la zona). */\n"
"export const PUERTAS_ISLA3: Readonly<Record<string, Readonly<Record<string, string>>>> = "+pu(puertas)+";\n")
open(sys.argv[1],'w').write(ts)
for k,v in zonas.items():
    print(k, v['origen'], v['z'].w, 'x', v['z'].h); print('\n'.join(f'{i:2} '+f for i,f in enumerate(v['z'].filas()))); print()
