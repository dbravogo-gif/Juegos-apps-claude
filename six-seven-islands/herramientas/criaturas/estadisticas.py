# Estadísticas base del Pokémon de referencia de cada criatura (CRIATURAS.md: se copian exactas).
# Orden: vida, fuerza, escudo, magia, resistencia mágica, celeridad (PS, Ataque, Defensa, At. Esp.,
# Def. Esp., Velocidad). Solo referencia interna: los nombres no salen en el juego (R8).
#
# Se añaden según llegan los modelos. Copiadas de memoria el 2026-11-17 (PokeAPI no se alcanza desde
# la sesión): confianza alta, pero por comprobar con una fuente. Se usan los valores actuales (de la
# 7.ª generación en adelante; p. ej., Swellow con At. Esp. 75).
BASE = {
    'Zigzagoon': (38, 30, 41, 30, 41, 60),
    'Linoone': (78, 70, 61, 50, 61, 100),
    'Taillow': (40, 55, 30, 30, 30, 85),
    'Swellow': (60, 85, 60, 75, 50, 125),
    'Barboach': (50, 48, 43, 46, 41, 60),
    'Whiscash': (110, 78, 73, 76, 71, 60),
    'Lotad': (40, 30, 30, 40, 50, 30),
    'Lombre': (60, 50, 50, 60, 70, 50),
    'Ludicolo': (80, 70, 70, 90, 100, 70),
    'Cranidos': (67, 125, 40, 30, 30, 58),
    'Rampardos': (97, 165, 60, 65, 50, 58),
    # 2026-11-19, también de memoria.
    'Sandile': (50, 72, 35, 35, 35, 65),
    'Krokorok': (60, 82, 45, 45, 45, 74),
    'Krookodile': (95, 117, 80, 65, 70, 92),
    'Riolu': (40, 70, 40, 35, 40, 60),
    'Lucario': (70, 110, 70, 115, 70, 90),
    'Roggenrola': (55, 75, 85, 25, 25, 15),
    'Boldore': (70, 105, 105, 50, 40, 20),
    'Gigalith': (85, 135, 130, 60, 80, 25),
    'Makuhita': (72, 60, 30, 20, 30, 25),
    'Hariyama': (144, 120, 60, 40, 60, 50),
    # 2026-11-20, también de memoria (Pelipper, con el At. Esp. de la 7.ª generación).
    'Venipede': (30, 45, 59, 30, 39, 57),
    'Whirlipede': (40, 55, 99, 40, 79, 47),
    'Scolipede': (60, 100, 89, 55, 69, 112),
    'Wingull': (40, 30, 30, 55, 30, 85),
    'Pelipper': (60, 50, 100, 95, 70, 65),
    'Spheal': (70, 40, 50, 55, 50, 25),
    'Sealeo': (90, 60, 70, 75, 70, 45),
    'Walrein': (110, 80, 90, 95, 90, 65),
    'Cottonee': (40, 27, 60, 37, 50, 66),
    'Whimsicott': (60, 67, 85, 77, 75, 116),
    # 2026-11-26 (de memoria, confianza alta): la lisa de duna y el conejo de jable.
    'Trapinch': (45, 100, 45, 45, 45, 10),
    'Vibrava': (50, 70, 50, 50, 50, 70),
    'Flygon': (80, 100, 80, 80, 80, 100),
    'Bidoof': (59, 45, 40, 35, 40, 31),
    'Bibarel': (79, 85, 60, 55, 60, 71),
    # 2026-11-26 (de memoria, confianza alta): el cigarrón, el dromedario y el presa canario.
    'Kricketot': (37, 25, 41, 25, 41, 25),
    'Kricketune': (77, 85, 51, 55, 51, 65),
    'Deerling': (60, 60, 50, 40, 50, 75),
    'Sawsbuck': (80, 100, 70, 60, 70, 95),
    'Lillipup': (45, 60, 45, 25, 45, 55),
    'Herdier': (65, 80, 65, 35, 65, 60),
    'Stoutland': (85, 110, 90, 45, 90, 80),
}
