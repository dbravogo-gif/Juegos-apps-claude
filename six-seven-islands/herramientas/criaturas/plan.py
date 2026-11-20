# Plan de criaturas para Meshy (2026-11-16): las zonas de cada isla y las 203 criaturas, con su
# zona, sus tipos por forma y el Pokémon de referencia de sus estadísticas (CRIATURAS.md). Es una
# PROPUESTA: los segundos tipos y los aspectos los decide el autor.
#
# Comprueba las cuentas (tipos principales iguales a los objetivos, 60 % sin secundario, de 3 a 6
# especies por hierba, gimnasios cubiertos) y escribe PLAN-CRIATURAS.md y
# conceptos/criaturas/plan-criaturas.xlsx, y la guía para Gemini (conceptos/criaturas/guia-gemini.txt).
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
# (id, nombre, niveles). Las de niveles None son de leyenda: ninguna antes de la mitad del viaje.
ISLAS = [
    ('lz', 'Lanzarote', 'Roca', 'en la Capital, líder 11-12', [
        ('lz-golfo', 'El Golfo', (3, 5)),
        ('lz-fuego', 'Montañas del Fuego', (5, 7)),
        ('lz-jable', 'El Jable', (6, 8)),
        ('lz-famara', 'Famara', (6, 8)),
        # Sin leyendas en Lanzarote (autor, 2026-11-20): salen desde la mitad del viaje.
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
        ('tf-teide', 'El Teide, por dentro (leyenda; al abrir el Sello)', None),
        ('tf-cueva-fondo', 'Cueva del Viento, lo más hondo (leyenda)', None),
        ('tf-hielo', 'Cueva del Hielo del Teide (leyenda)', None),
    ]),
    ('lg', 'La Gomera', 'Mental', 'en Chipude, junto a La Fortaleza, líder 44-45', [
        ('lg-hermigua', 'Hermigua y Agulo', (34, 37)),
        ('lg-garajonay', 'Garajonay', (36, 39)),
        ('lg-agando', 'Roque de Agando', (37, 40)),
        ('lg-granrey', 'Valle Gran Rey', (37, 40)),
        ('lg-organos', 'Los Órganos (costa)', (38, 41)),
        ('lg-alto', 'Alto de Garajonay (leyenda)', None),
        ('lg-hesperides', 'Garajonay, el jardín de las Hespérides (leyenda)', None),
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
        ('lp-caldera-fondo', 'El fondo de La Caldera (leyenda)', None),
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
        ('eh-risco', 'El risco de Tibataje (leyenda)', None),
    ]),
]

# ── Especies ──────────────────────────────────────────────────────────────────────────────────
# (nº de la lista o clave de inicial, nombre o None, tipos por forma, zona principal,
#  también en, idea). Un «*» tras la zona: allí es la rara. «A» = tipos del autor; el resto son
# propuesta. La idea es para la imagen: no se parece al Pokémon de referencia (R8).
LAMINA = 'Lámina del autor.'
INICIALES = [
    ('agua', 'Cronti → Chicront → Krantacor', ['Agua', 'Agua', 'Agua'], 'Nombres del autor; la 1.ª forma ya está hecha.'),
    ('planta', None, ['Planta', 'Planta', 'Planta/Mental'], 'El lagarto chamán, que acaba en chamán de Planta/Mental; la 1.ª forma ya está hecha.'),
    ('infernal', None, ['Infernal', 'Infernal', 'Infernal'], 'La 1.ª forma ya está hecha.'),
    ('roca', 'Armalito → Uralito → Reactolito', ['Roca', 'Roca/Veneno', 'Roca/Veneno'], 'Lámina del autor; la 1.ª forma ya está hecha.'),
    ('tierra', None, ['Tierra', 'Tierra/Espectral', 'Tierra/Espectral'],
     'Por diseñar: la inicial del pueblo de los pueblos sepultados por el volcán. Una cría de tierra y ceniza que, al evolucionar, gana un aire espectral. Que no se parezca a las otras cuatro iniciales.'),
]
HECHAS = {('agua', 1), ('planta', 1), ('infernal', 1), ('roca', 1)}  # modelos ya en el juego
# Hechas por el autor antes del plan, con imagen y modelo (2026-11-17): la civeta y el dinosaurio
# de casco de roca.
HECHAS_IDS = {'031-1', '031-2', '062-1', '062-2',
              # Pok18-24, hechas por el autor el 2026-11-17: Ravich y Azurvan, Aculiso y Sierpajable, Dragosil.
              '032-1', '032-2', '037-1', '037-2', '007-1', '007-2', '007-3'}

ESPECIES = [
    # Lanzarote (propuesta 2 de CRIATURAS.md)
    (31, 'Shimari → Shimarō', ['Común', 'Común'], 'lz-golfo', ['lz-fuego'], 'Lámina del autor (civeta.jpg).'),
    (32, 'Ravich → Azurvan', ['Aire', 'Aire'], 'lz-golfo', ['lz-jable', 'tf-anaga'], 'Hecha por el autor.'),
    (37, 'Aculiso → Sierpajable', ['Agua', 'Agua/Tierra'], 'lz-golfo', ['lz-famara'], 'Hecha por el autor.'),
    (7, 'Dragosil → Dragombo → Dragalis', ['Planta', 'Planta', 'Planta'], 'lz-golfo*', ['lp-garafia'], 'Lámina del autor; hecha.'),
    (13, 'Quillflare → Quillfire → Quimfernum', ['Infernal', 'Infernal', 'Infernal/Tierra'], 'lz-fuego', [], 'Hecha por el autor.'),
    (43, 'Kotono → Koloi', ['Lucha', 'Lucha'], 'lz-fuego', ['lz-jable*'], 'Hecha por el autor.'),
    (12, 'Oreps → Mineps → Colossoreps', ['Roca', 'Roca', 'Roca'], 'lz-famara*', ['lz-fuego*'], 'Hecha por el autor.'),
    (34, 'Kine → Kurokin', ['Tierra', 'Tierra'], 'lz-jable', [], 'Hecha por el autor.'),
    (5, 'Melaní → Favenir → Reginis', ['Bicho', 'Bicho/Veneno', 'Bicho/Veneno'], 'lz-jable', [], LAMINA),
    (35, 'Aerund → Marwen', ['Aire', 'Aire/Agua'], 'lz-famara', ['fv-ajuy', 'fv-sotavento', 'lg-organos', 'eh-orchilla'], LAMINA),
    (18, 'Salmito → Salmarín → Salmástil', ['Agua', 'Agua', 'Agua/Hielo'], 'lz-famara', [],
     'Nombre del autor; el aspecto, por diseñar.'),
    # Las cinco leyendas de los pueblos (HISTORIA.md). Propuesta del 2026-11-20, pendiente del autor
    # («los legendarios, mínimo a mitad del juego y con algo que ver con la historia»): tras la
    # traición de Chano, las ancestrales las escondieron por las islas del oeste, y cada una
    # despierta al llegar a su escondite. Los pueblos siguen siendo de Lanzarote.
    (94, None, ['Planta/Tierra'], 'lg-hesperides', [],
     'La leyenda verde, del pueblo del Hoyo: escondida en la laurisilva de Garajonay, el jardín de las Hespérides de los antiguos; guarda frutos de oro y sangra savia de drago.'),
    (95, 'Magecora', ['Infernal/Mental'], 'tf-teide', [],
     'Lámina del autor: la leyenda infernal, del pueblo de la Colada. Encerrada dentro del Teide, como Guayota en el mito: por eso el Teide está cerrado y retumba; se la encuentra al abrir el Sello.'),
    (92, None, ['Roca/Aire'], 'eh-risco', [],
     'La leyenda de roca, del pueblo del Risco: de basalto y viento, escondida en el risco de Tibataje, en la isla que ocultaron las ancestrales.'),
    (91, None, ['Tierra/Espectral'], 'lp-caldera-fondo', [],
     'La leyenda de tierra, del pueblo del Llano: duerme en el fondo de La Caldera de Taburiente.'),
    (93, None, ['Agua/Oscuridad'], 'tf-cueva-fondo', [],
     'La leyenda del agua, del pueblo del Jameo: gran criatura blanca y ciega de los tubos de lava, escondida en lo más hondo de la Cueva del Viento.'),

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
    (62, 'Ishiro → Ishiradon', ['Roca', 'Roca'], 'tf-cueva', [],
     'Lámina del autor (dino-casco-roca.jpg): dinosaurio con casco de roca. Ishiradon es la estrella de la líder de Roca.'),
    (89, None, ['Espectral'], 'tf-cueva*', [], 'Ánima atrapada en una lágrima de lava del tubo volcánico.'),
    (75, None, ['Aire'], 'tf-teno', ['lp-roque'], 'Guincho: águila pescadora de los acantilados.'),
    (59, None, ['Agua', 'Agua'], 'tf-gigantes', ['lg-organos', 'eh-restinga'],
     'Delfín mular: cría juguetona; la 2.ª, delfín acróbata.'),
    (47, None, ['Oscuridad', 'Oscuridad/Agua'], 'tf-gigantes', ['lg-organos', 'eh-orchilla', 'eh-restinga'],
     'Morena de las grietas; la 2.ª, gran morena negra.'),
    (90, None, ['Hielo/Agua'], 'tf-gigantes*', ['eh-restinga*'], 'Calamar gigante de las aguas profundas y frías.'),
    (16, 'Magmín → Lavtún → Teidrón', ['Infernal', 'Infernal', 'Infernal'], 'tf-canadas', ['eh-cumbre'],
     'Lámina del autor. Nace del Teide: vive en Las Cañadas (autor, 2026-11-17).'),
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
    43: 'Musaraña luchadora', 13: 'Erizo de fuego', 12: 'Basalto', 94: 'Leyenda verde', 92: 'Leyenda de roca',
    91: 'Leyenda de tierra', 93: 'Leyenda del agua', 44: 'Remolino de jable', 9: 'Lisa de duna',
    38: 'Conejo de jable', 29: 'Cigarrón', 54: 'Dromedario', 11: 'Perro bardino', 4: 'Guirre',
    51: 'Erizo negro', 17: 'Murciélago de cueva', 61: 'Escarabajo de escoria', 79: 'Escolopendra',
    52: 'Carabela', 82: 'Piedra de Tindaya', 50: 'Cardón', 67: 'Tembladera', 41: 'Chicharro',
    57: 'Chispa de cable', 56: 'Enredo', 80: 'Farito', 81: 'Boya', 3: 'Perdiz', 39: 'Almendrita',
    83: 'Bomba volcánica', 71: 'Tabona', 68: 'Cantero', 25: 'Burro', 73: 'Bailador de isa',
    77: 'Saltador de garrote', 33: 'Piña luchadora', 42: 'Lisa de la charca', 1: 'Mariposa de laurisilva',
    30: 'Gato del monte', 53: 'Hurón', 65: 'Farol', 72: 'Aldaba', 2: 'Tortuga boba', 74: 'Vieja',
    63: 'Tortuga gigante', 62: 'Dino de casco', 89: 'Ánima de lava', 75: 'Guincho', 59: 'Delfín',
    47: 'Morena', 90: 'Calamar gigante', 58: 'Neverita', 15: 'Escarcha', 19: 'Tajinaste',
    101: 'Guardián del Sello', 99: 'Guardián del hielo', 6: 'Silbador', 49: 'Caracol hipnótico',
    14: 'Duende de laurisilva', 46: 'Bruma', 64: 'Coruja', 87: 'Mantis', 8: 'Bucio', 100: 'Gara',
    96: 'Jonay', 45: 'Flor de cumbre', 86: 'Pelotero', 60: 'Bejeque', 88: 'Carámbano',
    85: 'Saltamontes gigante', 70: 'Tunera', 55: 'Cochinilla', 69: 'Diablillo', 48: 'Tea',
    98: 'Guardián de las estrellas', 84: 'Curandera', 76: 'Tostador de gofio',
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


# Altura de cada forma, en metros (propuesta, 2026-11-17; las de lámina, de la lámina). El juego
# escala cada modelo a su altura, comprimida en combate y en el mundo para que un renacuajo y un
# dragón se vean los dos (ARTE.md, «Escala de las criaturas»). Las decide Claude; el autor avisa
# al probar si alguna está mal (2026-11-17).
ALTURA = {
    'agua': [0.4, 0.9, 1.6], 'planta': [0.4, 0.9, 1.7], 'infernal': [0.4, 0.9, 1.7],
    'roca': [0.4, 1.0, 1.8], 'tierra': [0.4, 0.9, 1.7],
    31: [0.4, 0.8], 32: [0.3, 1.2], 37: [0.3, 1.0], 7: [0.5, 1.4, 3.0], 16: [0.4, 1.0, 2.2],
    43: [0.3, 1.1], 12: [0.4, 1.0, 2.0], 34: [0.5, 1.2], 5: [0.3, 0.6, 1.5], 35: [0.4, 1.8],
    18: [0.5, 1.1, 1.8], 94: [4.0], 95: [3.5], 92: [4.0], 91: [4.5], 93: [5.0],
    44: [0.4, 1.2], 9: [0.5, 1.1, 2.0], 38: [0.4, 0.9], 29: [0.3, 0.8], 54: [1.0, 2.2],
    11: [0.4, 0.8, 1.3], 4: [0.3, 0.8, 1.5], 51: [0.3, 0.8], 17: [0.3, 0.8, 1.5], 61: [0.5, 1.4],
    79: [1.8], 52: [0.4, 1.2], 82: [1.0], 50: [0.4, 1.8],
    67: [0.5, 1.6], 41: [0.4, 4.0], 57: [0.1, 0.8], 56: [0.6, 1.9], 80: [0.4], 81: [0.4],
    3: [0.3, 0.6, 1.2], 39: [0.4, 0.5], 83: [1.2], 71: [0.5], 68: [0.4, 1.0], 78: [1.6],
    25: [0.8, 1.4, 2.2], 10: [0.5, 1.1, 2.5], 20: [0.4, 1.5, 4.0], 36: [0.6, 1.5], 73: [1.1],
    77: [1.3], 33: [0.4, 1.2], 42: [0.6, 2.5],
    1: [0.3, 0.6, 1.0], 30: [0.4, 1.0], 53: [0.4, 1.0], 65: [0.5, 1.3], 72: [0.6], 2: [0.3, 0.8, 1.8],
    74: [0.6], 63: [0.5, 1.5], 62: [0.9, 1.6], 89: [1.0], 75: [1.7], 59: [0.8, 2.0], 47: [0.8, 2.5],
    90: [3.5], 58: [0.5, 1.5], 15: [0.3, 0.6, 1.0], 19: [0.3, 0.8, 2.0], 101: [7.0], 99: [2.0],
    6: [0.4, 0.8, 1.6], 49: [0.5, 0.9], 14: [0.4, 0.7, 1.5], 46: [0.6, 1.1], 64: [0.4, 1.2],
    66: [0.5, 1.5], 87: [1.4], 8: [0.5, 1.0, 1.5], 100: [1.5], 96: [2.0],
    40: [0.4, 1.1], 45: [0.5, 1.1], 86: [1.4], 60: [0.8, 1.5], 88: [1.1], 85: [1.5], 70: [0.6, 1.0],
    55: [0.3, 1.4], 69: [0.6, 1.3], 48: [0.7, 1.9], 98: [2.0],
    28: [1.0, 4.0, 9.0], 13: [0.3, 0.7, 1.4], 84: [1.1], 26: [0.6, 1.4, 2.5], 76: [1.0],
    27: [0.7, 1.6, 2.4], 97: [2.5], 102: [6.0],
}

# Tipos que eligió el autor (los demás secundarios son propuesta).
DEL_AUTOR = {31, 32, 7, 16, 34, 5, 35, 95, 78, 10, 20, 36, 66, 40, 28, 26, 62}

# ── Datos derivados ───────────────────────────────────────────────────────────────────────────
REF = {}  # nº → [(nombre, quintil, papel)]
_n = 0
for _t, _especies in bloques:
    for _e in _especies:
        _n += 1
        REF[_n] = [forma(x) for x in _e]
SUBIDAS, ARCHIVOS_RAROS = None, []  # se rellenan en criaturas()
ZONA = {z: (isla, nombre, niv) for isla, *_r, zonas in ISLAS for z, nombre, niv in zonas}
NOMBRE_ISLA = {c: n for c, n, *_r in ISLAS}
ORDINAL = ['1.ª', '2.ª', '3.ª']


def limpia(z):
    return z.rstrip('*')


def criaturas():
    """Una fila por criatura, en el orden de generación: las iniciales y después isla por isla."""
    global SUBIDAS, ARCHIVOS_RAROS
    SUBIDAS, ARCHIVOS_RAROS = archivos_del_autor()
    filas = []
    for clave, nombre, tipos, idea in INICIALES:
        for i, t in enumerate(tipos):
            filas.append(dict(isla='lz', zona='Inicial (museo de Lanzarote)', tambien='', n='—',
                              especie=nombre_forma(nombre, i, len(tipos)) or nombre or f'Inicial de {clave}', forma=ORDINAL[i], tipos=t,
                              ref='Propias (del autor)', quintil='', papel='', idea=idea if i == 0 else '',
                              archivo=f'inicial-{clave}-{i + 1}', hecha=(clave, i + 1) in HECHAS, autor=True,
                              idea_linea=idea, linea_tipos=' → '.join(tipos), linea_refs='', nformas=len(tipos),
                              niveles=None, lamina=idea.startswith('Lámina'), apodo=False, inicial=True,
                              altura=ALTURA[clave][i]))
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
                              archivo=f'{n:03d}' if unica else f'{n:03d}-{i + 1}',
                              hecha=(f'{n:03d}' if unica else f'{n:03d}-{i + 1}') in HECHAS_IDS,
                              autor=n in DEL_AUTOR, idea_linea=idea, linea_tipos=' → '.join(tipos),
                              linea_refs=' → '.join(r[0] for r in refs), nformas=len(tipos),
                              niveles=ZONA[limpia(zona)][2], lamina=idea.startswith('Lámina'),
                              apodo=nombre is None, inicial=False, altura=ALTURA[n][i]))
    orden = [c for c, *_r in ISLAS]
    filas.sort(key=lambda f: orden.index(f['isla']))  # estable: respeta el orden de dentro
    # El número de Pokédex va atado a cada criatura (pokedex.json), no a su sitio en la lista: si
    # una especie cambia de zona o de isla, conserva su número. Las nuevas, al final.
    fijada = leer_pokedex()
    siguiente = max(fijada.values(), default=0) + 1
    for f in filas:
        if f['archivo'] in fijada:
            f['orden'] = fijada[f['archivo']]
        else:
            f['orden'] = siguiente
            siguiente += 1
        # El nombre del archivo del autor manda (2026-11-19): es el que ha elegido para esa forma.
        if SUBIDAS[f['orden']]['nombre']:
            f['especie'] = SUBIDAS[f['orden']]['nombre']
        # Nombre de archivo del autor (2026-11-17): «PokN. Nombre».
        f['pok'] = f"Pok{f['orden']}. {f['especie'].strip('«»')}"
        # Lo que hay de verdad en la carpeta del autor manda: con modelo, la criatura está hecha.
        f['tiene_imagen'] = SUBIDAS[f['orden']]['imagen']
        f['tiene_modelo'] = SUBIDAS[f['orden']]['modelo']
        f['hecha'] = f['hecha'] or f['tiene_modelo']
    filas.sort(key=lambda f: (orden.index(f['isla']), f['orden']))
    return filas


RUTA_POKEDEX = os.path.join(RAIZ, 'conceptos', 'criaturas', 'pokedex.json')
CARPETA_AUTOR = os.path.join(RAIZ, 'conceptos', 'criaturas', 'meshy')


def archivos_del_autor():
    """Lo que ha subido el autor a conceptos/criaturas/meshy, por número de Pokédex: si hay imagen
    y si hay modelo. Devuelve también los archivos que no siguen «PokN. Nombre»."""
    import re
    hay = collections.defaultdict(lambda: {'imagen': False, 'modelo': False, 'nombre': None})
    raros = []
    if not os.path.isdir(CARPETA_AUTOR):
        return hay, raros
    for nombre in sorted(os.listdir(CARPETA_AUTOR)):
        if nombre == 'LEEME.md':
            continue
        m = re.match(r'Pok(\d+)\.\s(.*)\.(glb|webp|png|jpe?g)$', nombre, re.I)
        if not m:
            raros.append(nombre)
            continue
        hay[int(m.group(1))]['modelo' if m.group(3).lower() == 'glb' else 'imagen'] = True
        hay[int(m.group(1))]['nombre'] = m.group(2).strip()
    return hay, raros


def leer_pokedex():
    """Id interno → número de Pokédex, o vacío si aún no se ha fijado (o con --renumerar)."""
    import json
    if '--renumerar' in sys.argv or not os.path.exists(RUTA_POKEDEX):
        return {}
    with open(RUTA_POKEDEX, encoding='utf-8') as fh:
        return {v: int(k) for k, v in json.load(fh).items()}


def fijar_pokedex(filas, renumerar=False):
    """Guarda los números en pokedex.json. Un número ya dado no se reutiliza ni se pierde: si una
    criatura numerada desaparece del plan, se para (renumerar solo si el autor lo decide)."""
    import json
    actual = {f['archivo']: f['orden'] for f in filas}
    if len(set(actual.values())) != len(actual):
        raise SystemExit('Hay dos criaturas con el mismo número de Pokédex.')
    perdidas = [f'{n} ({a})' for a, n in leer_pokedex().items() if a not in actual]
    if perdidas and not renumerar:
        raise SystemExit('Estas criaturas numeradas ya no están en el plan: ' + ', '.join(perdidas) +
                         '. Un número dado no se pierde; renumerar solo si el autor lo decide (--renumerar).')
    with open(RUTA_POKEDEX, 'w', encoding='utf-8') as fh:
        json.dump({str(n): a for a, n in sorted(actual.items(), key=lambda x: x[1])}, fh, ensure_ascii=False, indent=0)
        fh.write('\n')


def nombre_zona(z):
    rara = z.endswith('*')
    nombre = ZONA[limpia(z)][1]
    return nombre + (' (rara)' if rara else '')


def comprobar(filas):
    """Las reglas de CRIATURAS.md. Devuelve las cuentas para el informe."""
    errores = [f'{n}: sin nombre ni apodo' for n, nom, *_r in ESPECIES if not nom and n not in APODO]
    for clave, _nom, tipos, *_r in INICIALES + [(e[0], e[1], e[2]) for e in ESPECIES]:
        h = ALTURA.get(clave)
        if not h or len(h) != len(tipos):
            errores.append(f'{clave}: faltan alturas o no son una por forma')
        elif any(b < a for a, b in zip(h, h[1:])):
            errores.append(f'{clave}: una evolución más baja que la forma anterior')
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
    a('ven antes. Cada criatura sigue `prompts-meshy.md`: imagen 2D, después Image to 3D. La imagen y el')
    a('modelo se llaman «PokN. Nombre» (autor, 2026-11-17): N es su número en esta lista, que no cambia')
    a('nunca, y el nombre es el suyo o su apodo. Se suben a `conceptos/criaturas/meshy/`. Para que Gemini te las vaya')
    a('diciendo de una en una: `conceptos/criaturas/guia-gemini.txt`, que lleva sus instrucciones arriba.\n')
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
    a('Lanzarote incluye las 15 iniciales. Las leyendas, desde la mitad del viaje (autor, 2026-11-20).\n')

    a('## Las islas y sus zonas\n')
    a('En cada zona, las especies que salen, con la nueva de esa zona en **negrita**. Las leyendas de los')
    a('pueblos despiertan al llegar a su escondite; las guardianas, tras la Liga. Niveles: los de `ISLA-3.md` hasta Gran Canaria; después, propuesta. En las islas del')
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
    a('Una fila por criatura, en el orden en que conviene generarlas. «Pokédex»: el nombre de la imagen y')
    a('del modelo que sube el autor. «Id interno»: el del juego (el número de la lista de referencia de')
    a('`CRIATURAS.md` y la forma). «A»: tipos del autor. Entre comillas, «así», un apodo provisional: el')
    a('nombre lo pone el autor. La idea va en la primera forma de cada especie.\n')
    for clave, nombre, *_r in ISLAS:
        a(f'### {nombre}\n')
        a('| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |')
        a('| --- | --- | --- | --- | --- | --- | --- | --- |')
        for f in filas:
            if f['isla'] != clave:
                continue
            arch = f"{f['archivo']} (hecha)" if f['hecha'] else f['archivo']
            pok = f"{f['pok']}" 
            tipos = f"{f['tipos']} A" if f['autor'] else f['tipos']
            ref = f"{f['ref']} ({f['quintil']}, {f['papel']})" if f['quintil'] else f['ref']
            zona = f['zona'] if f['forma'] in ('1.ª', 'única') else ''
            alt = f"{f['altura']:.1f} m".replace('.', ',')
            a(f"| {pok} | {arch} | {f['forma']} | {tipos} | {ref} | {alt} | {zona} | {f['idea']} |")
        a('')
    return '\n'.join(o)


def excel(filas, c, ruta):
    import openpyxl
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.worksheet.datavalidation import DataValidation
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Criaturas'
    VERDE = PatternFill('solid', fgColor='C6EFCE')  # las que ya tenemos: modelo subido
    cab = ['Pokédex', 'Nombre de archivo', 'Isla', 'Zona', 'También en', 'Nº lista', 'Id interno', 'Especie', 'Forma', 'Tipo principal',
           'Tipo secundario', 'Tipos del autor', 'Estadísticas de', 'Quintil', 'Papel', 'Altura (m)', 'Idea para la imagen',
           'Imagen hecha', '3D hecho']
    ws.append(cab)
    for celda in ws[1]:
        celda.font = Font(bold=True, color='FFFFFF')
        celda.fill = PatternFill('solid', fgColor='2F5D62')
    for f in filas:
        t = f['tipos'].split('/')
        ws.append([f['orden'], f['pok'], NOMBRE_ISLA[f['isla']], f['zona'], f['tambien'], f['n'], f['archivo'],
                   f['especie'], f['forma'], t[0], t[1] if len(t) > 1 else '', 'sí' if f['autor'] else '',
                   f['ref'], f['quintil'], f['papel'], f['altura'], f['idea'],
                   'sí' if f['tiene_imagen'] or f['hecha'] else 'no', 'sí' if f['tiene_modelo'] or f['hecha'] else 'no'])
        if f['tiene_modelo']:
            for celda in ws[ws.max_row]:
                celda.fill = VERDE
    dv = DataValidation(type='list', formula1='"sí,no"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f'R2:S{len(filas) + 1}')
    anchos = [8, 30, 13, 30, 40, 8, 16, 32, 7, 13, 13, 8, 14, 8, 7, 10, 70, 12, 10]
    for i, w in enumerate(anchos):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w
    for fila in ws.iter_rows(min_row=2):
        fila[16].alignment = Alignment(wrap_text=True, vertical='top')
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


PAPEL = {'AF': 'atacante físico', 'AE': 'atacante especial', 'TF': 'tanque físico',
         'TE': 'tanque especial', 'EN': 'equilibrada'}
FUERZA = {'Q1': 'de las más flojas', 'Q2': 'floja', 'Q3': 'media', 'Q4': 'fuerte',
          'Q5': 'de las más fuertes, nivel legendario'}

INSTRUCCIONES_GEMINI = """INSTRUCCIONES PARA GEMINI

Vamos a generar las criaturas de mi juego de una en una, con el mismo estilo de imagen que ya
usamos en esta conversación. Abajo tienes la lista completa, numerada. Es mi plan: 203 criaturas,
de las que 4 ya están hechas.

CÓMO VAMOS
- Al empezar, y cada vez que te diga «siguiente», dime cuál toca, con este formato:
  «PokN. Nombre, forma · tipo · fuerza (quintil) y papel · estadísticas como X · zona · idea».
  Después, propón el diseño en 2 o 3 frases.
- Cuando te diga «genera», haz la imagen. Si te digo «otra», repítela con los cambios que te
  diga. «Saltar» pasa a la siguiente sin hacerla. Si te digo un número («vamos por el 57»),
  sigue desde ahí.
- Al terminar cada una, recuérdame cómo guardar la imagen y después el modelo 3D: «PokN. Nombre»,
  por ejemplo «Pok16. Civeta». N es su número de la lista y no cambia nunca. Si va con apodo y
  elegimos un nombre, usa el nombre elegido.
- Si te pido «estado», dime por qué número vamos y cuántas faltan.

REGLAS
1. El Pokémon de «estadísticas como» es solo una referencia interna de lo fuerte que es y de su
   papel. La criatura NO puede parecerse a él ni a ningún otro Pokémon: ni en el animal, ni en
   la silueta, ni en los colores, ni en las piezas. Parte de la idea que te doy, que es canaria.
2. Una imagen por criatura, nunca la línea entera junta: después la paso a 3D.
3. Las evoluciones mantienen el diseño de la forma anterior (colores, cara y piezas) y crecen:
   la 2.ª forma añade piezas, como crestas o cuernos, y la 3.ª es más grande e imponente. Si la
   anterior no está en esta conversación, pídeme su imagen antes de diseñar.
4. Si pone «lámina del autor», el diseño ya existe: pídeme la lámina y dibuja esa criatura sola,
   fiel a ella.
5. El color principal sale de su tipo, y el papel se nota en el cuerpo: los tanques, robustos;
   los atacantes, más ágiles.
6. Si el nombre va entre comillas («Guirre»), es un apodo provisional: propón 3 nombres
   originales para la especie, que no se parezcan a nombres de Pokémon. Si ya tiene nombre, úsalo.
7. Nunca escribas texto ni nombres de Pokémon en la imagen.
8. Las marcadas «YA HECHA» se saltan.

LOS TIPOS DE MI JUEGO
Común (normal), Agua, Tierra, Planta, Aire (volador), Eléctrico, Hielo, Infernal (fuego),
Lucha, Mental (psíquico), Oscuridad (siniestro), Espectral (fantasma), Acero, Roca, Ancestral
(primordial y dragones), Bicho y Veneno. «Agua/Tierra» quiere decir dos tipos: el primero es el
principal.
"""


# El estilo de las imágenes (prompts-meshy.md), para quien no lo tiene ya en su conversación con
# Gemini: la guía de los amigos lo lleva dentro (autor, 2026-11-17).
ESTILO_GEMINI = """CÓMO TIENEN QUE SER LAS IMÁGENES
Cada imagen termina con este bloque de estilo, en inglés y tal cual, detrás de la descripción
de la criatura:

Official-quality 2D character concept art in the clean anime style of modern monster-collecting
RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate
detail, big expressive eyes, appealing silhouette. Cute animal face with big round eyes and a
small muzzle, never a human face. Bold simple shapes: a few large leaves, feathers or scales
instead of many small ones; thick parts with rounded tips, no thin spikes, branches, strands or
floating particles. Single creature, full body, three-quarter front view, centered, plain white
background, no shadow, no text.

Por qué así: la imagen se pasa a 3D con Meshy. Con varias criaturas juntas, sombra, fondo o
texto, el modelo sale roto. Nada de aspecto de «juguete de vinilo». Si sale con demasiado
detalle, cambia «moderate detail» por «low detail»; si sale pobre, por «rich but clean detail».
"""


def guia_gemini(filas, amigos=False):
    """El texto para pasárselo a Gemini: instrucciones y la lista, una criatura por entrada."""
    hechas = sum(f['hecha'] for f in filas)
    instr = INSTRUCCIONES_GEMINI.replace('de las que 4 ya están hechas', f'de las que {hechas} ya están hechas')
    if amigos:
        instr = instr.replace('con el mismo estilo de imagen que ya\nusamos en esta conversación.',
                              'con el estilo de imagen de la sección\n«CÓMO TIENEN QUE SER LAS IMÁGENES», más abajo.')
        instr = instr.replace('LOS TIPOS DE MI JUEGO', ESTILO_GEMINI + '\nLOS TIPOS DE MI JUEGO')
        instr += ('\nREPARTO ENTRE AMIGOS\nSomos varios generando a la vez. Hazme solo las del tramo que te diga\n'
                  '(por ejemplo, «del Pok63 al Pok92») y guarda cada archivo como «PokN. Nombre».\n')
    o = [instr, 'LA LISTA', '']
    isla_actual = None
    for f in filas:
        if f['isla'] != isla_actual:
            isla_actual = f['isla']
            o.append(f"== {NOMBRE_ISLA[isla_actual].upper()} ==")
            o.append('')
        de = f"{f['forma']} forma de {f['nformas']}" if f['forma'] != 'única' else 'sin evolución'
        cab = f"{f['pok']}, {de}"
        if f['hecha']:
            o.append(cab + ' · YA HECHA')
            o.append('')
            continue
        o.append(cab)
        o.append(f"   Tipo: {f['tipos']}" + (f" (la línea: {f['linea_tipos']})" if f['nformas'] > 1 else ''))
        if f['inicial']:
            o.append('   Fuerza: inicial, con estadísticas propias (empieza floja y la final es fuerte).')
        else:
            o.append(f"   Fuerza: quintil {f['quintil'][1]} de 5, {FUERZA[f['quintil']]}. Papel: {PAPEL[f['papel']]}.")
            linea = f" (la línea: {f['linea_refs']})" if f['nformas'] > 1 else ''
            o.append(f"   Estadísticas como: {f['ref']}{linea}. Solo de referencia: que no se parezca.")
        zona = f['zona']
        if f['niveles']:
            zona += f", {NOMBRE_ISLA[f['isla']]} (niveles {f['niveles'][0]}-{f['niveles'][1]})"
        elif not f['inicial']:
            zona += f", {NOMBRE_ISLA[f['isla']]} (sale tras la Liga)"
        o.append(f'   Zona: {zona}')
        idea = f['idea_linea']
        if f['lamina']:
            idea = 'lámina del autor: pídemela y dibújala sola, fiel a ella.'
            if f['nformas'] > 1 and f['forma'] != '1.ª':
                idea = 'lámina del autor: pídemela y dibuja esta forma sola, fiel a ella.'
        elif f['inicial']:
            idea += ' Pídeme la imagen de la 1.ª forma para seguir su diseño.' if f['forma'] != '1.ª' else ''
        o.append(f'   Idea: {idea}')
        o.append('')
    o.append('FIN DE LA LISTA')
    return '\n'.join(o) + '\n'


if __name__ == '__main__':
    filas = criaturas()
    cuentas = comprobar(filas)
    fijar_pokedex(filas, renumerar='--renumerar' in sys.argv)
    with open(os.path.join(RAIZ, 'PLAN-CRIATURAS.md'), 'w', encoding='utf-8') as fh:
        fh.write(markdown(filas, cuentas) + '\n')
    excel(filas, cuentas, os.path.join(RAIZ, 'conceptos', 'criaturas', 'plan-criaturas.xlsx'))
    with open(os.path.join(RAIZ, 'conceptos', 'criaturas', 'guia-gemini.txt'), 'w', encoding='utf-8') as fh:
        fh.write(guia_gemini(filas))
    with open(os.path.join(RAIZ, 'conceptos', 'criaturas', 'guia-gemini-amigos.txt'), 'w', encoding='utf-8') as fh:
        fh.write(guia_gemini(filas, amigos=True))
    # Una subida partida en dos dejó la primera mitad en la raíz del repositorio (2026-11-17).
    perdidos = [n for d in (os.path.join(RAIZ, '..'), RAIZ) for n in os.listdir(d) if n.startswith('Pok')]
    if perdidos:
        print('Aviso: criaturas fuera de su carpeta (van en conceptos/criaturas/meshy): ' + ', '.join(perdidos))
    if ARCHIVOS_RAROS:
        print('Aviso: archivos de la carpeta del autor que no siguen «PokN. Nombre»: ' + ', '.join(ARCHIVOS_RAROS))
    numeros = {f['orden'] for f in filas}
    ajenos = sorted(n for n in SUBIDAS if n not in numeros)
    if ajenos:
        print('Aviso: archivos con un número que no está en el plan: ' + ', '.join(f'Pok{n}' for n in ajenos))
    print(f"Con modelo subido: {sum(f['tiene_modelo'] for f in filas)}. ", end='')
    print(f"{len(filas)} criaturas, {cuentas['pct']:.0f} % sin secundario. Escritos PLAN-CRIATURAS.md, plan-criaturas.xlsx y las guías de Gemini.")
