# Plan de criaturas para Meshy (2026-11-16): las zonas de cada isla y las 203 criaturas, con su
# zona, sus tipos por forma y el Pokémon de referencia de sus estadísticas (CRIATURAS.md). Es una
# PROPUESTA: los segundos tipos y los aspectos los decide el autor.
#
# Comprueba las cuentas (tipos principales iguales a los objetivos, 60 % sin secundario, de 3 a 6
# especies por hierba, gimnasios cubiertos) y escribe PLAN-CRIATURAS.md y
# conceptos/criaturas/plan-criaturas.xlsx.
#
# Uso: python3 herramientas/criaturas/plan.py
import collections
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lista import bloques, forma  # noqa: E402

RAIZ = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Objetivos por tipo principal de las 188 de la lista (CRIATURAS.md, «Por tipo principal»).
OBJETIVO = {
    'Común': 16, 'Agua': 21, 'Tierra': 11, 'Planta': 17, 'Aire': 11, 'Eléctrico': 11, 'Hielo': 8,
    'Infernal': 16, 'Lucha': 9, 'Mental': 8, 'Oscuridad': 8, 'Espectral': 7, 'Acero': 6, 'Roca': 10,
    'Ancestral': 4, 'Bicho': 13, 'Veneno': 12,
}

# Coste en Meshy por criatura (prompts-meshy.md, comprobado el 2026-11-07): Image to 3D con Smart
# Topology y Meshy T2 (5 créditos) más la textura (10).
CREDITOS_POR_CRIATURA = 15

# ── Islas y zonas ─────────────────────────────────────────────────────────────────────────────
# (id, nombre, niveles). Las de niveles None son de leyenda: salen tras la Liga.
ISLAS = [
    ('lz', 'Lanzarote', 'Roca', 'en la Capital, líder 11-12', [
        ('lz-golfo', 'El Golfo', (3, 5)),
        ('lz-fuego', 'Montañas del Fuego', (5, 7)),
        ('lz-jable', 'El Jable', (6, 8)),
        ('lz-famara', 'Famara', (6, 8)),
        ('lz-geria', 'La Geria (leyenda)', None),
        ('lz-crater', 'Montañas del Fuego, el cráter (leyenda)', None),
        ('lz-risco', 'Risco de Famara (leyenda)', None),
        ('lz-sepultados', 'Pueblos sepultados (leyenda)', None),
        ('lz-jameos', 'Los jameos (leyenda; zona por crear)', None),
    ]),
    ('fv', 'Fuerteventura', 'Aire', 'en Morro Jable, líder 20-21', [
        ('fv-dunas', 'Las Dunas', (10, 13)),
        ('fv-betancuria', 'Betancuria', (12, 14)),
        ('fv-ajuy', 'Ajuy', (13, 15)),
        ('fv-cueva', 'Cueva de Ajuy', (13, 15)),
        ('fv-tindaya', 'Tindaya (opcional)', (14, 16)),
        ('fv-sotavento', 'Sotavento', (15, 17)),
        ('fv-cofete', 'Cofete (opcional)', (17, 19)),
    ]),
    ('gc', 'Gran Canaria', 'Eléctrico y Lucha', 'Eléctrico en Las Palmas y Lucha en Agaete; los dos líderes, 28-30, en 2 contra 2', [
        ('gc-isleta', 'La Isleta', (18, 20)),
        ('gc-bandama', 'Bandama (opcional)', (19, 21)),
        ('gc-guayadeque', 'Guayadeque', (20, 22)),
        ('gc-cumbres', 'Las cumbres', (21, 23)),
        ('gc-nublo', 'Roque Nublo', (22, 24)),
        ('gc-tejeda', 'Tejeda y Artenara', (22, 25)),
        ('gc-maspalomas', 'Maspalomas (opcional)', (22, 26)),
        ('gc-tamadaba', 'Tamadaba', (24, 27)),
        ('gc-agaete', 'Agaete', (25, 27)),
    ]),
    ('tf', 'Tenerife', 'Agua', 'en el Puerto de la Cruz, líder 36-38; la Liga, en el Teide, 58-62', [
        ('tf-anaga', 'Anaga', (26, 29)),
        ('tf-laguna', 'La Laguna', (27, 29)),
        ('tf-orotava', 'Valle de La Orotava', (28, 31)),
        ('tf-puerto', 'Puerto de la Cruz', (29, 32)),
        ('tf-cueva', 'Cueva del Viento', (30, 33)),
        ('tf-teno', 'Teno y Masca', (31, 34)),
        ('tf-gigantes', 'Los Gigantes (costa)', (32, 35)),
        ('tf-canadas', 'Las Cañadas', (33, 36)),
        ('tf-cima', 'El Teide, la cima (leyenda)', None),
        ('tf-hielo', 'Cueva del Hielo del Teide (leyenda)', None),
    ]),
    ('lg', 'La Gomera', 'Mental', 'en Chipude, junto a La Fortaleza, líder 44-45', [
        ('lg-hermigua', 'Hermigua y Agulo', (34, 37)),
        ('lg-garajonay', 'Garajonay', (36, 39)),
        ('lg-agando', 'Roque de Agando', (37, 40)),
        ('lg-granrey', 'Valle Gran Rey', (37, 40)),
        ('lg-organos', 'Los Órganos (costa)', (38, 41)),
        ('lg-alto', 'Alto de Garajonay (leyenda)', None),
        ('lg-errante', 'Entre Tenerife y La Gomera (leyenda errante)', None),
    ]),
    ('lp', 'La Palma', 'Planta', 'en La Caldera de Taburiente, líder 50-51', [
        ('lp-tilos', 'Los Tilos', (40, 43)),
        ('lp-caldera', 'La Caldera de Taburiente', (42, 45)),
        ('lp-llanos', 'Los Llanos y Tazacorte', (42, 45)),
        ('lp-garafia', 'Garafía', (43, 46)),
        ('lp-roque', 'Roque de los Muchachos', (44, 47)),
        ('lp-fuencaliente', 'Fuencaliente', (45, 48)),
        ('lp-observatorio', 'El observatorio del Roque (leyenda)', None),
    ]),
    ('eh', 'El Hierro', 'Infernal/Ancestral', 'en Valverde, al final de la Bajada, líder 54-56', [
        ('eh-orchilla', 'Orchilla (llegada)', (47, 50)),
        ('eh-dehesa', 'La Dehesa', (48, 51)),
        ('eh-cumbre', 'La Cumbre (camino de la Bajada)', (50, 53)),
        ('eh-garoe', 'El Garoé', (51, 53)),
        ('eh-frontera', 'Frontera (opcional)', (50, 54)),
        ('eh-restinga', 'La Restinga (opcional)', (52, 55)),
        ('eh-tagoro', 'El volcán bajo el mar de La Restinga (leyenda)', None),
        ('eh-nubes', 'El mar de nubes (leyenda)', None),
    ]),
]

# ── Especies ──────────────────────────────────────────────────────────────────────────────────
# (nº de la lista o clave de inicial, nombre o None, tipos por forma, zona principal,
#  también en, idea). Un «*» tras la zona: allí es la rara. «A» = tipos del autor; el resto son
# propuesta. La idea es para la imagen: no se parece al Pokémon de referencia (R8).
LAMINA = 'Lámina del autor.'
INICIALES = [
    ('agua', 'Cronti → Chicront → Krantacor', ['Agua', 'Agua', 'Agua'], 'Lámina y modelo de la 1.ª.'),
    ('planta', None, ['Planta', 'Planta', 'Planta/Mental'], 'El lagarto chamán; modelo de la 1.ª.'),
    ('infernal', None, ['Infernal', 'Infernal', 'Infernal'], 'Modelo de la 1.ª; el secundario de la final, por decidir.'),
    ('roca', 'Armalito → Uralito → Reactolito', ['Roca', 'Roca/Veneno', 'Roca/Veneno'], 'Lámina y modelo de la 1.ª.'),
    ('tierra', None, ['Tierra', 'Tierra/Espectral', 'Tierra/Espectral'], 'La de otro amigo; por diseñar.'),
]
HECHAS = {('agua', 1), ('planta', 1), ('infernal', 1), ('roca', 1)}  # modelos ya en el juego

ESPECIES = [
    # Lanzarote (propuesta 2 de CRIATURAS.md)
    (31, 'Civeta', ['Común', 'Común'], 'lz-golfo', ['lz-fuego'], 'Lámina del autor (civeta.jpg).'),
    (32, 'Tinzal → Azurvan', ['Aire', 'Aire/Mental'], 'lz-golfo', ['lz-jable', 'tf-anaga'], LAMINA),
    (37, None, ['Agua', 'Agua/Tierra'], 'lz-golfo', ['lz-famara'],
     'Cabozo: pececillo de charco con aletas como patitas; la 2.ª, grande y con cabeza de roca, se entierra en la arena.'),
    (7, 'Dragosil → Dragombo → Dragalis', ['Planta', 'Planta', 'Planta'], 'lz-golfo*', ['lp-garafia'], LAMINA),
    (16, 'Magmín → Lavtún → Teidrón', ['Infernal', 'Infernal', 'Infernal'], 'lz-fuego', ['tf-canadas', 'eh-cumbre'], LAMINA),
    (43, None, ['Lucha', 'Lucha'], 'lz-fuego', ['lz-jable*'],
     'Erizo moruno que se hace bola y embiste; la 2.ª, erguido, lucha con agarres de lucha canaria (faja y calzón de bregar).'),
    (12, None, ['Roca', 'Roca', 'Roca'], 'lz-famara*', ['lz-fuego*'],
     'Bola de basalto con ojos verdes de olivina; la 2.ª, con cristales de olivina en el lomo; la 3.ª, coloso de columnas de basalto. La usa la líder de Roca.'),
    (34, 'Patatín → Paparrón', ['Tierra', 'Tierra'], 'lz-jable', [], LAMINA),
    (5, 'Melaní → Favenir → Reginis', ['Bicho', 'Bicho/Veneno', 'Bicho/Veneno'], 'lz-jable', [], LAMINA),
    (35, 'Aerund → Marwen', ['Aire', 'Aire/Agua'], 'lz-famara', ['fv-ajuy', 'fv-sotavento', 'lg-organos', 'eh-orchilla'], LAMINA),
    (18, 'Salmito → Salmarín → Salmástil', ['Agua', 'Agua', 'Agua/Hielo'], 'lz-famara', [],
     'Nombre del autor; el aspecto, por diseñar.'),
    # Las cinco leyendas de los pueblos (HISTORIA.md): duermen en Lanzarote y salen tras la Liga.
    (94, None, ['Planta/Tierra'], 'lz-geria', [],
     'La leyenda verde, del pueblo del Hoyo: gran criatura de vid y picón que duerme en un hoyo de La Geria.'),
    (95, 'Magecora', ['Infernal/Mental'], 'lz-crater', [], 'Lámina del autor: la leyenda infernal, del pueblo de la Colada.'),
    (92, None, ['Roca/Aire'], 'lz-risco', [],
     'La leyenda de roca, del pueblo del Risco: guardiana del acantilado de Famara, de basalto y viento.'),
    (91, None, ['Tierra/Espectral'], 'lz-sepultados', [],
     'La leyenda de tierra, del pueblo del Llano: duerme bajo los pueblos que sepultó el volcán.'),
    (93, None, ['Agua/Oscuridad'], 'lz-jameos', [],
     'La leyenda del agua, del pueblo del Jameo: gran criatura blanca y ciega de los túneles donde entra el mar.'),

    # Fuerteventura
    (44, None, ['Aire', 'Aire/Tierra'], 'fv-dunas', ['fv-sotavento'],
     'Remolino de jable: bolita de arena y semillas que rueda con el viento; la 2.ª, torbellino de arena con cara. Sustituye al remolino provisional del gimnasio de Aire.'),
    (9, None, ['Tierra', 'Tierra', 'Tierra/Aire'], 'fv-dunas', ['fv-sotavento', 'fv-cofete', 'gc-maspalomas'],
     'Lisa de duna: lagartija que nada bajo la arena; la 2.ª, con aletas de arena; la 3.ª, con velas que planean sobre las dunas.'),
    (38, None, ['Común', 'Común'], 'fv-dunas', ['fv-betancuria', 'gc-bandama', 'tf-laguna', 'tf-orotava'],
     'Conejo de jable, bajito y orejudo; la 2.ª, conejo grande que excava madrigueras.'),
    (29, None, ['Bicho', 'Bicho'], 'fv-dunas*', ['fv-betancuria', 'fv-ajuy'],
     'Cigarrón: langosta que llega con el viento de África; la 2.ª, grande, hace sonar las alas.'),
    (54, None, ['Común', 'Común'], 'fv-betancuria', ['fv-tindaya'],
     'Dromedario majorero: cría torpe de patas largas; la 2.ª, dromedario adulto con alforjas.'),
    (11, None, ['Común', 'Común', 'Común'], 'fv-betancuria', ['fv-ajuy', 'fv-tindaya', 'eh-dehesa'],
     'Perro bardino: cachorro atigrado; la 2.ª, perro pastor; la 3.ª, gran perro de ganado de melena gruesa.'),
    (4, None, ['Aire', 'Aire', 'Aire'], 'fv-betancuria', ['fv-tindaya', 'tf-teno', 'eh-dehesa'],
     'Guirre: polluelo blanco; la 2.ª, joven de plumas pardas; la 3.ª, gran guirre de cara amarilla. Sustituye al guirre provisional del gimnasio de Aire.'),
    (51, None, ['Agua', 'Agua/Oscuridad'], 'fv-ajuy', ['fv-sotavento', 'fv-cofete', 'gc-agaete', 'tf-puerto', 'eh-orchilla'],
     'Erizo negro de los charcos, redondo y de púas cortas; la 2.ª, grande y de púas larguísimas.'),
    (17, None, ['Veneno', 'Veneno/Aire', 'Veneno/Aire'], 'fv-cueva', ['gc-guayadeque', 'tf-cueva'],
     'Murciélago orejudo de cueva, de ojos grandes; la 2.ª y la 3.ª, más grandes, con alas como capas.'),
    (61, None, ['Roca', 'Roca/Bicho'], 'fv-cueva', [],
     'Escarabajo de escoria volcánica que rueda por la cueva; la 2.ª, erguido y con brazos de basalto.'),
    (79, None, ['Veneno/Bicho'], 'fv-cofete', ['fv-cueva*'],
     'Escolopendra: ciempiés gigante de las piedras, con colores de aviso.'),
    (52, None, ['Veneno', 'Veneno/Agua'], 'fv-sotavento', ['gc-maspalomas'],
     'Carabela: medusa con una vela azul que flota en la laguna; la 2.ª, colonia grande con vela de colores.'),
    (82, None, ['Roca/Mental'], 'fv-tindaya*', [],
     'Piedra de la montaña sagrada: roca clara con grabados que flota y medita.'),
    (50, None, ['Planta', 'Planta/Veneno'], 'fv-cofete', [],
     'Cardón de Jandía: brote de cardón de brazos cortos; la 2.ª, gran cardón con brazos de candelabro y savia tóxica.'),

    # Gran Canaria
    (67, None, ['Eléctrico', 'Eléctrico/Agua'], 'gc-isleta', ['gc-agaete', 'tf-puerto'],
     'Tembladera: raya eléctrica de la arena del puerto; la 2.ª, grande, con alas que chispean.'),
    (41, None, ['Agua', 'Agua'], 'gc-isleta', ['gc-agaete'],
     'Chicharro: pez flaco y torpe del muelle que no sirve para nada; la 2.ª, un marrajo enorme y temible.'),
    (57, None, ['Eléctrico', 'Eléctrico/Bicho'], 'gc-isleta', [],
     'Chispa de cable: bichito que vive en los enchufes del puerto; la 2.ª, escarabajo con antenas de cobre que suelta descargas.'),
    (56, None, ['Veneno', 'Veneno'], 'gc-isleta', [],
     'Enredo: bola de redes de pesca viejas y plástico; la 2.ª, gran mole de redes. Sustituye a Basún, descartado.'),
    (80, None, ['Eléctrico'], 'gc-isleta*', [],
     'Farito: criatura con forma de faro pequeño que lanza destellos. Hace pareja con la boya en combates dobles.'),
    (81, None, ['Eléctrico/Agua'], 'gc-maspalomas*', [],
     'Boya luminosa con cara que parpadea. Hace pareja con el farito en combates dobles.'),
    (3, None, ['Común', 'Común/Aire', 'Común/Aire'], 'gc-cumbres', ['gc-bandama', 'gc-nublo', 'tf-orotava', 'lp-garafia'],
     'Perdiz moruna: polluelo; la 2.ª, perdiz de collar; la 3.ª, gran perdiz de cresta roja.'),
    (39, None, ['Planta', 'Planta'], 'gc-cumbres', ['gc-bandama', 'gc-tejeda'],
     'Almendrita: capullo de almendro cerrado; la 2.ª, se abre en flor de almendro cuando hay sol.'),
    (83, None, ['Roca/Infernal'], 'gc-bandama*', ['lp-fuencaliente'],
     'Bomba volcánica: roca redonda y agrietada, con lava dentro, que salió volando del cráter.'),
    (71, None, ['Oscuridad/Roca'], 'gc-guayadeque', [],
     'Tabona: duendecillo tallado en obsidiana negra que vive en las casas cueva.'),
    (68, None, ['Tierra', 'Tierra/Acero'], 'gc-guayadeque', ['gc-cumbres'],
     'Cantero: criaturita con cola de maza de piedra que pica la toba de las casas cueva; la 2.ª, gran cantero con brazos de pico de hierro. Sustituye a Tunelín, descartado.'),
    (78, 'Tibicán', ['Oscuridad'], 'gc-guayadeque*', ['gc-tamadaba*'], 'Lámina del autor (la leyenda del tibicena).'),
    (25, None, ['Lucha', 'Lucha', 'Lucha'], 'gc-cumbres', ['gc-tejeda', 'gc-tamadaba'],
     'Burro: se pasa el día tumbado; la 2.ª, no para quieto y cocea; la 3.ª, enorme burro luchador que solo pelea cuando quiere. La 3.ª es Q5: la vigila el autor.'),
    (10, 'Caprún → Roquén → Terracorn', ['Tierra', 'Tierra', 'Tierra'], 'gc-nublo',
     ['gc-tamadaba', 'tf-teno', 'lg-agando', 'lp-caldera', 'eh-cumbre'], LAMINA),
    (20, 'Briso → Alisor → Alisior', ['Eléctrico', 'Eléctrico', 'Eléctrico'], 'gc-nublo', ['gc-cumbres'], LAMINA),
    (36, 'Voltéro → Raigón', ['Eléctrico', 'Eléctrico'], 'gc-tejeda', ['gc-nublo', 'tf-teno'], LAMINA),
    (73, None, ['Lucha'], 'gc-tejeda', ['gc-agaete'],
     'Bailador de isa que da vueltas, se marea y marea al rival. Le va al gimnasio de Lucha, el de la confusión.'),
    (77, None, ['Lucha'], 'gc-tejeda', ['gc-agaete'],
     'Saltador de garrote: criatura ágil que salta riscos con un palo largo, como en el salto del pastor.'),
    (33, None, ['Lucha', 'Lucha/Planta'], 'gc-tamadaba', [],
     'Piña de pino canario que rueda; la 2.ª, luchador de piña que reparte patadas.'),
    (42, None, ['Agua', 'Agua'], 'gc-maspalomas', [],
     'Lisa gris y fea de la charca del oasis; la 2.ª, gran pez precioso con velos de colores.'),

    # Tenerife
    (1, None, ['Bicho', 'Bicho', 'Bicho/Aire'], 'tf-anaga', ['lg-hermigua', 'lg-garajonay', 'lp-tilos'],
     'Oruga de la laurisilva; la 2.ª, capullo colgado; la 3.ª, gran mariposa blanca y verde.'),
    (30, None, ['Oscuridad', 'Oscuridad'], 'tf-anaga', ['tf-laguna', 'tf-orotava'],
     'Gato del monte: gatito negro asilvestrado; la 2.ª, gran gato de ojos amarillos.'),
    (53, None, ['Veneno', 'Veneno'], 'tf-anaga', ['tf-orotava', 'lg-hermigua', 'lp-llanos'],
     'Hurón de la caza del conejo, que suelta mal olor; la 2.ª, grande y de cola esponjada.'),
    (65, None, ['Acero', 'Acero/Espectral'], 'tf-laguna', [],
     'Farol de hierro de calle antigua con una llamita dentro; la 2.ª, farol grande que alumbra a las ánimas.'),
    (72, None, ['Acero'], 'tf-laguna*', [], 'Aldaba de bronce con cara, de las puertas antiguas, que muerde.'),
    (2, None, ['Agua', 'Agua', 'Agua'], 'tf-puerto', ['tf-gigantes'],
     'Tortuga boba: cría recién salida del huevo; la 2.ª, tortuga marina joven; la 3.ª, gran tortuga marina.'),
    (74, None, ['Agua'], 'tf-puerto', [], 'Vieja: pez loro rojo y redondo de los charcos.'),
    (63, None, ['Acero', 'Acero/Roca'], 'tf-cueva', [],
     'Tortuga gigante de las islas, que se creía extinta: cría con caparazón de piedra; la 2.ª, coraza de piedra y hierro.'),
    (62, None, ['Roca', 'Roca'], 'tf-cueva', [],
     'Rata gigante de las islas, que se creía extinta, con el cráneo de piedra; la 2.ª, embiste rompiendo rocas. Sustituye al dinosaurio descartado.'),
    (89, None, ['Espectral'], 'tf-cueva*', [], 'Ánima atrapada en una lágrima de lava del tubo volcánico.'),
    (75, None, ['Aire'], 'tf-teno', ['lp-roque'], 'Guincho: águila pescadora de los acantilados.'),
    (59, None, ['Agua', 'Agua'], 'tf-gigantes', ['lg-organos', 'eh-restinga'],
     'Delfín mular: cría juguetona; la 2.ª, delfín acróbata.'),
    (47, None, ['Oscuridad', 'Oscuridad/Agua'], 'tf-gigantes', ['lg-organos', 'eh-orchilla', 'eh-restinga'],
     'Morena de las grietas; la 2.ª, gran morena negra.'),
    (90, None, ['Hielo/Agua'], 'tf-gigantes*', ['eh-restinga*'], 'Calamar gigante de las aguas profundas y frías.'),
    (58, None, ['Hielo', 'Hielo'], 'tf-canadas', [],
     'Neverita: cría que guarda nieve en su caparazón, como los pozos de nieve del Teide; la 2.ª, grande y helada.'),
    (15, None, ['Hielo', 'Hielo', 'Hielo/Mental'], 'tf-canadas', ['lp-roque'],
     'Cristalito de escarcha de las retamas; la 2.ª, ramillete de cristales; la 3.ª, gran flor de hielo.'),
    (19, None, ['Planta', 'Veneno/Planta', 'Veneno/Planta'], 'tf-canadas', [],
     'Tajinaste: brote; la 2.ª, con espigas de flores; la 3.ª, gran torre de flores rojas que suelta polen tóxico.'),
    (101, None, ['Ancestral/Aire'], 'tf-cima', [], 'Guardián del Sello, que vive en lo alto del Teide.'),
    (99, None, ['Hielo'], 'tf-hielo', [], 'Guardián de la Cueva del Hielo, junto a la cima del Teide.'),

    # La Gomera
    (6, None, ['Mental', 'Mental', 'Mental'], 'lg-hermigua', ['lg-agando', 'lg-granrey', 'eh-garoe'],
     'Silbador: criaturita de orejas enormes que habla silbando, como el silbo gomero; la 2.ª, con orejas como alas; la 3.ª, alta y elegante, habla con la mente.'),
    (49, None, ['Mental', 'Mental'], 'lg-granrey', ['lg-hermigua'],
     'Caracol de concha en espiral que hipnotiza; la 2.ª, gran caracol de concha brillante.'),
    (14, None, ['Espectral', 'Espectral', 'Espectral/Planta'], 'lg-garajonay', ['lp-tilos', 'eh-garoe'],
     'Duende de musgo y niebla de la laurisilva; la 2.ª, más alto, con barba de líquenes; la 3.ª, guardiana del bosque.'),
    (46, None, ['Espectral', 'Espectral/Aire'], 'lg-garajonay', [],
     'Bruma: nubecilla de niebla con ojos que da sueño; la 2.ª, gran nube de niebla que viaja con el viento.'),
    (64, None, ['Oscuridad', 'Oscuridad/Mental'], 'lg-garajonay', [],
     'Coruja (lechuza) que crea ilusiones; la 2.ª, gran lechuza de cara blanca como una máscara.'),
    (66, 'Miralín → Reflexán', ['Mental', 'Mental'], 'lg-agando', [], LAMINA),
    (40, 'Esporín → Micelord', ['Planta', 'Planta'], 'lg-garajonay', ['lp-tilos', 'eh-garoe'], LAMINA),
    (87, None, ['Bicho/Mental'], 'lg-granrey', ['lg-agando'], 'Mantis que reza y lee la mente.'),
    (8, None, ['Común', 'Común', 'Común'], 'lg-organos', ['lg-granrey'],
     'Bucio: caracola que retumba al soplar; la 2.ª, más grande; la 3.ª, enorme caracola que atruena.'),
    (100, None, ['Mental'], 'lg-alto', [],
     'Inspirada en Gara, de la leyenda de Gara y Jonay: criatura de niebla y luna del alto de la isla.'),
    (96, None, ['Aire/Agua'], 'lg-errante', [],
     'Inspirada en Jonay, el que cruzó el mar desde Tenerife: vuela entre las dos islas.'),

    # La Palma
    (45, None, ['Planta', 'Planta'], 'lp-caldera', ['lp-tilos'],
     'Capullo de flor de cumbre; la 2.ª, bailarina de pétalos.'),
    (86, None, ['Bicho/Tierra'], 'lp-caldera', [],
     'Escarabajo pelotero que empuja una bola de tierra más grande que él.'),
    (60, None, ['Planta', 'Planta/Roca'], 'lp-garafia', ['lp-caldera'],
     'Bejeque: roseta de hojas gordas pegada a la roca; la 2.ª, gran bejeque con hojas en abanico.'),
    (88, None, ['Hielo'], 'lp-roque', [], 'Carámbano: estalactita de hielo con ojos que cuelga de las rocas de la cumbre.'),
    (85, None, ['Bicho/Lucha'], 'lp-roque', ['lp-garafia'], 'Saltamontes gigante sin alas de las cumbres, que da patadas.'),
    (70, None, ['Planta', 'Planta/Acero'], 'lp-llanos', ['lp-fuencaliente'],
     'Tunera: palita de tunera con espinas de metal; la 2.ª, gran tunera que lanza espinas.'),
    (55, None, ['Bicho', 'Bicho'], 'lp-llanos', ['lp-fuencaliente'],
     'Cochinilla de la tunera, blanca y algodonosa; la 2.ª, gran bicho de caparazón rojo carmín. Sustituye a Cangrix, descartado.'),
    (69, None, ['Infernal', 'Infernal/Oscuridad'], 'lp-llanos', ['lp-garafia'],
     'Diablillo de fuegos artificiales, como el de las fiestas de Tijarafe; la 2.ª, gran diablo que escupe cohetes.'),
    (48, None, ['Infernal', 'Infernal'], 'lp-fuencaliente', [],
     'Tea: tronquito de pino resinoso con una llama; la 2.ª, gran tocón de tea ardiendo.'),
    (98, None, ['Acero/Mental'], 'lp-observatorio', [], 'Guardián de las estrellas, en el observatorio del Roque.'),

    # El Hierro
    (28, 'Sanbor → Borondis → Atlantea', ['Agua', 'Agua/Ancestral', 'Agua/Ancestral'], 'eh-orchilla*', ['eh-restinga'], LAMINA),
    (13, None, ['Infernal', 'Infernal', 'Infernal/Tierra'], 'eh-dehesa', ['eh-cumbre', 'eh-frontera'],
     'Cochino negro: lechón; la 2.ª, cerdo negro con el lomo de escoria; la 3.ª, gran jabalí volcánico.'),
    (84, None, ['Común'], 'eh-garoe', ['eh-dehesa'],
     'Curandera: criatura redonda cubierta de hierbas medicinales que cura a las demás.'),
    (26, 'Guanchín → Menceyor → Achamán', ['Infernal', 'Infernal/Ancestral', 'Infernal/Ancestral'], 'eh-cumbre', ['eh-frontera'], LAMINA),
    (76, None, ['Infernal/Tierra'], 'eh-cumbre', ['eh-frontera'],
     'Tostador de gofio: criatura horno de barro que tuesta el grano en la tripa.'),
    (27, None, ['Ancestral', 'Ancestral/Tierra', 'Ancestral/Tierra'], 'eh-frontera*', [],
     'Lagarto gigante, que se creía extinto: cría de escamas grises; la 2.ª, con cresta; la 3.ª, enorme y antiguo, casi legendario.'),
    (97, None, ['Infernal/Agua'], 'eh-tagoro', [], 'Guardián del volcán que nació bajo el mar de La Restinga.'),
    (102, None, ['Espectral/Ancestral'], 'eh-nubes', [], 'La que guarda el mar de nubes que escondió El Hierro.'),
]

# Apodos provisionales de las especies sin nombre, para entenderse: los nombres los pone el autor.
APODO = {
    37: 'Cabozo', 43: 'Erizo luchador', 12: 'Basalto', 94: 'Leyenda verde', 92: 'Leyenda de roca',
    91: 'Leyenda de tierra', 93: 'Leyenda del agua', 44: 'Remolino de jable', 9: 'Lisa de duna',
    38: 'Conejo de jable', 29: 'Cigarrón', 54: 'Dromedario', 11: 'Perro bardino', 4: 'Guirre',
    51: 'Erizo negro', 17: 'Murciélago de cueva', 61: 'Escarabajo de escoria', 79: 'Escolopendra',
    52: 'Carabela', 82: 'Piedra de Tindaya', 50: 'Cardón', 67: 'Tembladera', 41: 'Chicharro',
    57: 'Chispa de cable', 56: 'Enredo', 80: 'Farito', 81: 'Boya', 3: 'Perdiz', 39: 'Almendrita',
    83: 'Bomba volcánica', 71: 'Tabona', 68: 'Cantero', 25: 'Burro', 73: 'Bailador de isa',
    77: 'Saltador de garrote', 33: 'Piña luchadora', 42: 'Lisa de la charca', 1: 'Mariposa de laurisilva',
    30: 'Gato del monte', 53: 'Hurón', 65: 'Farol', 72: 'Aldaba', 2: 'Tortuga boba', 74: 'Vieja',
    63: 'Tortuga gigante', 62: 'Rata gigante', 89: 'Ánima de lava', 75: 'Guincho', 59: 'Delfín',
    47: 'Morena', 90: 'Calamar gigante', 58: 'Neverita', 15: 'Escarcha', 19: 'Tajinaste',
    101: 'Guardián del Sello', 99: 'Guardián del hielo', 6: 'Silbador', 49: 'Caracol hipnótico',
    14: 'Duende de laurisilva', 46: 'Bruma', 64: 'Coruja', 87: 'Mantis', 8: 'Bucio', 100: 'Gara',
    96: 'Jonay', 45: 'Flor de cumbre', 86: 'Pelotero', 60: 'Bejeque', 88: 'Carámbano',
    85: 'Saltamontes gigante', 70: 'Tunera', 55: 'Cochinilla', 69: 'Diablillo', 48: 'Tea',
    98: 'Guardián de las estrellas', 13: 'Cochino negro', 84: 'Curandera', 76: 'Tostador de gofio',
    27: 'Lagarto gigante', 97: 'Guardián del Tagoro', 102: 'Guardiana del mar de nubes',
}


def nombre_especie(n, nombre):
    return nombre or f'«{APODO[n]}»'


def nombre_forma(nombre, i, total):
    """El nombre de la forma i si la línea los tiene todos («Cronti → Chicront → Krantacor»)."""
    partes = (nombre or '').split(' → ')
    return partes[i] if len(partes) == total else None


def miles(x):
    return f'{x:,}'.replace(',', '.')


# Tipos que eligió el autor (los demás secundarios son propuesta).
DEL_AUTOR = {31, 32, 7, 16, 34, 5, 35, 95, 78, 10, 20, 36, 66, 40, 28, 26}

# ── Datos derivados ───────────────────────────────────────────────────────────────────────────
REF = {}  # nº → [(nombre, quintil, papel)]
_n = 0
for _t, _especies in bloques:
    for _e in _especies:
        _n += 1
        REF[_n] = [forma(x) for x in _e]
ZONA = {z: (isla, nombre, niv) for isla, *_r, zonas in ISLAS for z, nombre, niv in zonas}
NOMBRE_ISLA = {c: n for c, n, *_r in ISLAS}
ORDINAL = ['1.ª', '2.ª', '3.ª']


def limpia(z):
    return z.rstrip('*')


def criaturas():
    """Una fila por criatura, en el orden de generación: las iniciales y después isla por isla."""
    filas = []
    for clave, nombre, tipos, idea in INICIALES:
        for i, t in enumerate(tipos):
            filas.append(dict(isla='lz', zona='Inicial (museo de Lanzarote)', tambien='', n='—',
                              especie=nombre_forma(nombre, i, len(tipos)) or nombre or f'Inicial de {clave}', forma=ORDINAL[i], tipos=t,
                              ref='Propias (del autor)', quintil='', papel='', idea=idea if i == 0 else '',
                              archivo=f'inicial-{clave}-{i + 1}', hecha=(clave, i + 1) in HECHAS, autor=True))
    for n, nombre, tipos, zona, tambien, idea in ESPECIES:
        refs = REF[n]
        assert len(refs) == len(tipos), (n, refs, tipos)
        for i, (t, (rn, q, p)) in enumerate(zip(tipos, refs)):
            unica = len(tipos) == 1
            filas.append(dict(isla=ZONA[limpia(zona)][0], zona=nombre_zona(zona),
                              tambien=', '.join(nombre_zona(z) for z in tambien), n=n,
                              especie=nombre_forma(nombre, i, len(tipos)) or nombre_especie(n, nombre),
                              forma='única' if unica else ORDINAL[i],
                              tipos=t, ref=rn, quintil=f'Q{q}', papel=p, idea=idea if i == 0 else '',
                              archivo=f'{n:03d}' if unica else f'{n:03d}-{i + 1}', hecha=False,
                              autor=n in DEL_AUTOR))
    orden = [c for c, *_r in ISLAS]
    filas.sort(key=lambda f: orden.index(f['isla']))  # estable: respeta el orden de dentro
    for i, f in enumerate(filas, 1):
        f['orden'] = i
    return filas


def nombre_zona(z):
    rara = z.endswith('*')
    nombre = ZONA[limpia(z)][1]
    return nombre + (' (rara)' if rara else '')


def comprobar(filas):
    """Las reglas de CRIATURAS.md. Devuelve las cuentas para el informe."""
    errores = [f'{n}: sin nombre ni apodo' for n, nom, *_r in ESPECIES if not nom and n not in APODO]
    lista = [f for f in filas if f['n'] != '—']
    nums = sorted(n for n, *_r in ESPECIES)
    esperado = sorted(k for k in REF if k not in (21, 22, 23, 24))
    if nums != esperado:
        errores.append(f'faltan o sobran especies: {set(esperado) ^ set(nums)}')
    principal = collections.Counter(f['tipos'].split('/')[0] for f in lista)
    for t, obj in OBJETIVO.items():
        if principal[t] != obj:
            errores.append(f'{t}: {principal[t]} como principal, objetivo {obj}')
    for t in principal:
        if t not in OBJETIVO:
            errores.append(f'tipo desconocido: {t}')
    sin_sec = sum('/' not in f['tipos'] for f in lista)
    secundario = collections.Counter(f['tipos'].split('/')[1] for f in lista if '/' in f['tipos'])
    pct = 100 * sin_sec / len(lista)
    if pct < 58:
        errores.append(f'solo el {pct:.0f} % sin secundario (objetivo, 60 %)')
    # Especies por zona: de 3 a 4 en Lanzarote, de 3 a 6 después; una rara como mucho.
    por_zona = collections.defaultdict(list)
    for n, nombre, tipos, zona, tambien, idea in ESPECIES:
        for z in [zona] + tambien:
            por_zona[limpia(z)].append((n, nombre, z.endswith('*')))
    for z, (isla, nombre, niv) in ZONA.items():
        if niv is None:
            continue
        cuantas = len(por_zona[z])
        maximo = 4 if isla == 'lz' else 6
        if not 3 <= cuantas <= maximo:
            errores.append(f'{nombre}: {cuantas} especies')
        if sum(r for *_x, r in por_zona[z]) > 1:
            errores.append(f'{nombre}: más de una rara')
    # Una zona de «también» no puede ser anterior a la principal: la especie sale primero allí.
    orden_zona = list(ZONA)
    for n, nombre, tipos, zona, tambien, idea in ESPECIES:
        for z in tambien:
            if orden_zona.index(limpia(z)) < orden_zona.index(limpia(zona)) and ZONA[limpia(z)][0] != ZONA[limpia(zona)][0]:
                errores.append(f'{n}: sale en {z} antes que en su zona principal {zona}')
    # Cada gimnasio tiene al menos 3 especies de su tipo disponibles en su isla o antes.
    gim = {'lz': ['Roca'], 'fv': ['Aire'], 'gc': ['Eléctrico', 'Lucha'], 'tf': ['Agua'], 'lg': ['Mental'],
           'lp': ['Planta'], 'eh': ['Infernal', 'Ancestral']}
    orden_isla = [c for c, *_r in ISLAS]
    cobertura = {}
    for isla, tipos_gim in gim.items():
        hasta = orden_isla[:orden_isla.index(isla) + 1]
        for t in tipos_gim:
            esp = sorted({(n, nombre) for n, nombre, tipos, zona, tambien, idea in ESPECIES
                          if ZONA[limpia(zona)][0] in hasta and ZONA[limpia(zona)][2] is not None
                          and any(t in x.split('/') for x in tipos)}, key=lambda e: e[0])
            cobertura[(isla, t)] = esp
            minimo = 1 if isla == 'lz' else 3
            if len(esp) < minimo:
                errores.append(f'gimnasio de {t} ({isla}): solo {len(esp)} especies')
    if errores:
        raise SystemExit('Errores en el plan:\n- ' + '\n- '.join(errores))
    return dict(principal=principal, secundario=secundario, pct=pct, por_zona=por_zona, cobertura=cobertura)


# ── Salida ────────────────────────────────────────────────────────────────────────────────────
def markdown(filas, c):
    o = []
    a = o.append
    total = len(filas)
    hechas = sum(f['hecha'] for f in filas)
    a('# Plan de criaturas para Meshy (propuesta)\n')
    a('2026-11-16. Lo genera `python3 herramientas/criaturas/plan.py`: **no se edita a mano**, se cambian los')
    a('datos del script y se vuelve a generar. El seguimiento, en `conceptos/criaturas/plan-criaturas.xlsx`.\n')
    a('**Qué es.** Las zonas de cada isla y las 203 criaturas, con su zona, sus tipos por forma y el Pokémon')
    a('del que copia las estadísticas (solo referencia interna: no sale en el juego, R8). Las de Lanzarote')
    a('son la propuesta 2 de `CRIATURAS.md`; las zonas de Tenerife, La Gomera, La Palma y El Hierro son')
    a('nuevas y pueden cambiar al diseñar cada isla.\n')
    a('**Lo que es del autor y lo que es propuesta.**\n')
    a('- Son del autor los tipos de las especies con lámina y de las iniciales, marcados con «A».')
    a('- Los demás segundos tipos son propuesta: CRIATURAS.md dice que los elige el autor.')
    a('- Las ideas de aspecto también son propuesta. Cada una parte de algo canario y evita el animal y la')
    a('  forma del Pokémon de referencia. Si una imagen recuerda a una criatura conocida, se descarta.\n')
    a('**Cómo generarlas.** En el orden de la lista: primero las iniciales y Lanzarote, que son las que se')
    a('ven antes. Cada criatura sigue `prompts-meshy.md`: imagen 2D, después Image to 3D, y el archivo con')
    a('el nombre de la columna «Archivo» (`.glb` y su imagen `.webp` o `.png`).\n')
    falta = total - hechas
    a(f'**Coste.** Faltan {falta} criaturas (hay {hechas} hechas). A {CREDITOS_POR_CRIATURA} créditos cada una')
    a(f'(Smart Topology y textura, precio comprobado el 2026-11-07), son unos {miles(falta * CREDITOS_POR_CRIATURA)} créditos sin')
    a('contar repeticiones. Por isla, en la tabla de abajo.\n')

    a('## Las cuentas\n')
    a('Todas cuadran: si no, el script no genera nada.\n')
    a('| Tipo principal | Objetivo | En el plan | Como secundario |')
    a('| --- | --- | --- | --- |')
    for t, obj in OBJETIVO.items():
        a(f"| {t} | {obj} | {c['principal'][t]} | {c['secundario'].get(t, 0)} |")
    a('')
    a(f"- **Sin tipo secundario:** el {c['pct']:.0f} % de las 188 de la lista (objetivo, 60 %).")
    a('- **Especies por hierba:** de 3 a 4 en Lanzarote y de 3 a 6 después, con una rara como mucho.')
    a('- **Gimnasios:** cada uno tiene al menos 3 especies de su tipo antes de llegar (Lanzarote, 1: la')
    a('  roca nueva, que la líder usa evolucionada).\n')
    a('| Isla | Especies nuevas | Criaturas | Por generar | Créditos |')
    a('| --- | --- | --- | --- | --- |')
    for clave, nombre, *_r in ISLAS:
        fs = [f for f in filas if f['isla'] == clave]
        esp = len({(f['n'], f['especie']) for f in fs})
        gen = sum(not f['hecha'] for f in fs)
        a(f'| {nombre} | {esp} | {len(fs)} | {gen} | {miles(gen * CREDITOS_POR_CRIATURA)} |')
    a(f'| **Total** | | **{total}** | **{falta}** | **{miles(falta * CREDITOS_POR_CRIATURA)}** |\n')
    a('Lanzarote incluye las 15 iniciales y las 5 leyendas de los pueblos, que duermen allí.\n')

    a('## Las islas y sus zonas\n')
    a('En cada zona, las especies que salen, con la nueva de esa zona en **negrita**. Las leyendas salen')
    a('tras la Liga. Niveles: los de `ISLA-3.md` hasta Gran Canaria; después, propuesta. En las islas del')
    a('final, una especie que se conoció antes sale ya evolucionada, según el nivel de la zona.\n')
    nombres = {n: nombre_especie(n, nom) for n, nom, *_r in ESPECIES}
    principal_de = {n: limpia(z) for n, _x, _t, z, *_r in ESPECIES}
    for clave, nombre, tipo_gim, donde, zonas in ISLAS:
        a(f'### {nombre}\n')
        a(f'Gimnasio de **{tipo_gim}**, {donde}.\n')
        a('| Zona | Niveles | Especies |')
        a('| --- | --- | --- |')
        for z, zn, niv in zonas:
            esp = []
            for n, _nom, rara in c['por_zona'][z]:
                txt = nombres[n]
                if principal_de[n] == z:
                    txt = f'**{txt}**'
                if rara:
                    txt += ' (rara)'
                esp.append(txt)
            nv = f'{niv[0]}-{niv[1]}' if niv else 'tras la Liga'
            a(f"| {zn} | {nv} | {' · '.join(esp)} |")
        tipos_gim = tipo_gim.replace(' y ', '/').split('/')
        for t in tipos_gim:
            cov = c['cobertura'].get((clave, t))
            if cov:
                a(f"\nPara el gimnasio, de {t}: {', '.join(nombres[n] for n, _x in cov)}.")
        a('')

    a('## La lista para generar\n')
    a('Una fila por criatura, en el orden en que conviene generarlas. «Archivo»: el nombre del modelo')
    a('(`.glb`) y de su imagen; el número es el de la lista de referencia de `CRIATURAS.md`. «A»: tipos del')
    a('autor. Entre comillas, «así», un apodo provisional: el nombre lo pone el autor. La idea va en la')
    a('primera forma de cada especie.\n')
    for clave, nombre, *_r in ISLAS:
        a(f'### {nombre}\n')
        a('| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |')
        a('| --- | --- | --- | --- | --- | --- | --- | --- |')
        for f in filas:
            if f['isla'] != clave:
                continue
            arch = f"{f['archivo']} (hecha)" if f['hecha'] else f['archivo']
            tipos = f"{f['tipos']} A" if f['autor'] else f['tipos']
            ref = f"{f['ref']} ({f['quintil']}, {f['papel']})" if f['quintil'] else f['ref']
            zona = f['zona'] if f['forma'] in ('1.ª', 'única') else ''
            a(f"| {f['orden']} | {arch} | {f['especie']} | {f['forma']} | {tipos} | {ref} | {zona} | {f['idea']} |")
        a('')
    return '\n'.join(o)


def excel(filas, c, ruta):
    import openpyxl
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.worksheet.datavalidation import DataValidation
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Criaturas'
    cab = ['#', 'Isla', 'Zona', 'También en', 'Nº lista', 'Archivo', 'Especie', 'Forma', 'Tipo principal',
           'Tipo secundario', 'Tipos del autor', 'Estadísticas de', 'Quintil', 'Papel', 'Idea para la imagen',
           'Imagen hecha', '3D hecho']
    ws.append(cab)
    for celda in ws[1]:
        celda.font = Font(bold=True, color='FFFFFF')
        celda.fill = PatternFill('solid', fgColor='2F5D62')
    for f in filas:
        t = f['tipos'].split('/')
        ws.append([f['orden'], NOMBRE_ISLA[f['isla']], f['zona'], f['tambien'], f['n'], f['archivo'],
                   f['especie'], f['forma'], t[0], t[1] if len(t) > 1 else '', 'sí' if f['autor'] else '',
                   f['ref'], f['quintil'], f['papel'], f['idea'], 'sí' if f['hecha'] else 'no',
                   'sí' if f['hecha'] else 'no'])
    dv = DataValidation(type='list', formula1='"sí,no"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f'P2:Q{len(filas) + 1}')
    anchos = [5, 13, 30, 40, 8, 16, 32, 7, 13, 13, 8, 14, 8, 7, 70, 12, 10]
    for i, w in enumerate(anchos):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w
    for fila in ws.iter_rows(min_row=2):
        fila[14].alignment = Alignment(wrap_text=True, vertical='top')
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = ws.dimensions

    wz = wb.create_sheet('Zonas')
    wz.append(['Isla', 'Gimnasio', 'Zona', 'Niveles', 'Especies'])
    nombres = {n: nombre_especie(n, nom) for n, nom, *_r in ESPECIES}
    for clave, nombre, tipo_gim, donde, zonas in ISLAS:
        for z, zn, niv in zonas:
            esp = ' · '.join(nombres[n] + (' (rara)' if r else '') for n, _x, r in c['por_zona'][z])
            wz.append([nombre, tipo_gim, zn, f'{niv[0]}-{niv[1]}' if niv else 'tras la Liga', esp])
    for i, w in enumerate([14, 18, 44, 12, 90]):
        wz.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w

    wt = wb.create_sheet('Tipos')
    wt.append(['Tipo principal', 'Objetivo', 'En el plan', 'Como secundario'])
    for t, obj in OBJETIVO.items():
        wt.append([t, obj, c['principal'][t], c['secundario'].get(t, 0)])
    wb.save(ruta)


if __name__ == '__main__':
    filas = criaturas()
    cuentas = comprobar(filas)
    with open(os.path.join(RAIZ, 'PLAN-CRIATURAS.md'), 'w', encoding='utf-8') as fh:
        fh.write(markdown(filas, cuentas) + '\n')
    excel(filas, cuentas, os.path.join(RAIZ, 'conceptos', 'criaturas', 'plan-criaturas.xlsx'))
    print(f"{len(filas)} criaturas, {cuentas['pct']:.0f} % sin secundario. Escritos PLAN-CRIATURAS.md y plan-criaturas.xlsx.")
