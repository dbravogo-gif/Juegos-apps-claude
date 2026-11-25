# Revisión del juego con las herramientas nuevas (2026-11-25)

Encargo del autor: rehacer la revisión de todo el juego con las skills instaladas el 2026-11-25
(`rpg`, `level-design`, `threejs-*`) y el simulador de partida. Se hace por etapas y cada una deja
aquí sus hallazgos. Lo pequeño se arregla y se publica; lo que cambia cómo se juega va a las
decisiones del autor (`RESUMEN-ISLAS.md`, D1 a D6).

## 1. Dificultad y progresión (skill `rpg` y simulador)

Datos: `EQUILIBRIO.md` (`npm run equilibrio`). Es pesimista: el jugador simulado nunca cambia de
criatura ni usa ataques de estado.

### Lo que dicen los números

- **Los jefes te tumban en 2 o 3 golpes, en todas las islas y con todas las iniciales.** A los
  niveles con que se llega, su criatura estrella tumba a tu inicial en 2 o 3 golpes y necesita de
  3 a 5 de los tuyos. La skill propone como orientación que aguantes de 5 a 8 golpes de un rival
  normal y algo menos de un jefe.
- **Por qué:** las estrellas de los jefes son especies mucho más fuertes que las tuyas y además
  van por encima de tu nivel.
  - **Fuerza de especie:** suma de estadísticas base de 450 a 525, frente a 314 de tu inicial y
    405 de su segunda forma.
  - **Ishiradon (495) al nivel 12** en la líder de Roca. Es la excepción que puso el autor, pero
    con la inicial de Fuego la tumba en 1 o 2 golpes y aguanta 8.
- **Llegas con 2 a 4 niveles menos de lo pensado.** La experiencia se reparte entre tres
  criaturas:
  - con la líder de Roca, tu inicial va al 10 y sus compañeras al 8 (rival: 11, 11 y 12);
  - con la de Aire, al 16 y al 13 (rival: 20, 21 y 22).
  - Si toda la experiencia fuera a una sola criatura, iría al 12 y al 20.
- **Resultado (simulado, a la primera):**
  - la líder de Roca, la de Aire y el tercer aprendiz Eléctrico ganan casi siempre;
  - los dos líderes de Agaete, también;
  - el comandante depende de la inicial: con Agua gana él el 95 %, porque su rama evoluciona al
    24; con las demás es un paseo.
- **Los ataques no crecen** (D2). Del nivel 13 al 34 nadie aprende nada y el ataque más fuerte
  pega 55. Como la vida sube con el nivel, cada combate pide más golpes. Ejemplo: Seaglide, en
  el tercer aprendiz Eléctrico, necesita 14 golpes de la inicial de Agua.
- **Hay salvajes que no se pueden vencer al principio.** Un Oreps al nivel 6 en las Montañas del
  Fuego necesita 23 golpes de Cronti, que solo tiene ataques comunes hasta el nivel 7.
- **En Gran Canaria las salvajes superan a tus criaturas.** Tailsan (480), Azurvan (455) y
  Seaglide (440) salen en Tamadaba, contra la segunda forma de tu inicial (405).
- **La curva de experiencia está bien.** Es la clásica: el nivel al cubo, con la experiencia de
  cada criatura según su especie y su nivel. El problema es cuánta hay que repartir, no la curva.

### Causas raíz

1. **Los jefes:** especies de estrella con niveles por encima de los del jugador.
2. **Repartir la experiencia** entre tres deja a cada criatura muy por detrás.
3. **Sin ataques nuevos** a partir del 13, el daño se estanca.

### Lo que hay que decidir

Lo apunto en las decisiones D1 a D3 de `RESUMEN-ISLAS.md`, con un objetivo para medir.

**El objetivo que propongo (lo decide el autor, R10):**
- con el jugador «normal», la criatura de un jefe cae en 2 a 4 golpes y tú aguantas al menos 3
  de los suyos (2 de la estrella);
- el jugador simulado gana a la primera entre el 40 y el 70 % de las veces;
- y ninguna salvaje del camino pide más de 6 golpes.

## 2. Las islas (skill `level-design`)

Datos: el recorrido del simulador (`herramientas/simular/ruta.ts`) cruzado con los refugios, las
casillas de encuentros del camino más corto, los entrenadores, los objetos y los objetivos de cada
isla. Las comprobaciones son las de la skill: recorrido y cierres, ritmo en dientes de sierra con
descanso antes de cada pico, enseñar antes de examinar, recompensa en las ramas y orientación.

### Lo que pasa la revisión

- **Cierres y atascos:** ya los vigilan las pruebas. El mapa de cada isla se recorre en orden
  (`tests/mundo.test.ts`, `tests/isla2.test.ts`, `tests/isla3.test.ts`), las escenas no se saltan
  (`tests/escenas.test.ts`) y el gimnasio de Aire no tiene sitio del que no se vuelva.
- **Descanso antes de cada jefe:** hay refugio en la misma zona o en la anterior antes de los
  cuatro gimnasios y del comandante (Guayadeque, a una zona corta). El terrero de Agaete es el
  mejor ejemplo: cada luchador te pregunta si quieres curarte antes.
- **Enseñar antes de examinar:** ninguna mecánica de gimnasio castiga la primera vez.
  - Roca: el tercer aprendiz dice dónde está la palanca.
  - Aire: el primer aprendiz explica las aspas antes de que hagan falta, y las corrientes solo
    empujan.
  - Eléctrico: a oscuras desde la entrada, pero cada relámpago enseña el plano entero.
- **Ritmo de Lanzarote y Gran Canaria:** alterna pueblos con refugio y zonas de combate de longitud
  media. Lanzarote empieza enseñando (casa, bar, museo y un combate obligatorio flojo).

### Problemas

| # | Problema | Regla de la skill | Qué hago |
| --- | --- | --- | --- |
| 1 | **Las Dunas:** 88 casillas de encuentros sin refugio en medio, unos 9 combates salvajes seguidos más los entrenadores | Nunca muchos picos seguidos | Ya está en D3 (el manantial del horno de cal) |
| 2 | **Famara** (rama opcional) no daba nada: las demás ramas dan una superpoción o un cubo | Las ramas recompensan | **Arreglado:** una poción en la punta de la playa (la isla 1 admite 4 en el suelo; hay 3) |
| 3 | **Fuerteventura tenía 2 objetivos para 9 zonas:** «Cruza la isla hasta Morro Jable» durante toda la isla | Orientar con hitos, no con muros | **Arreglado:** un objetivo intermedio (Puerto del Rosario y Betancuria, hasta vencer al guarda) y el siguiente nombra Ajuy y Sotavento |
| 4 | **La hierba obligatoria de Gran Canaria casi no lo es:** el camino más corto pisa 2 casillas en Guayadeque y 1 en las cumbres | Lo marcado como obligatorio, obligatorio | Ya está en D3 |
| 5 | **El puzle de Aire se resuelve en un minuto:** se presenta y se examina a la vez, sin giro | Presentar, desarrollar, girar, examinar | Ya está en D5 |
| 6 | **Hitos en las Dunas con calima:** la orientación depende de lo que se ve | Guiar con puntos de referencia | Por comprobar con capturas en la etapa 3 |

### Para Tenerife

- **Los refugios:** la propuesta (`ISLA-4.md`) solo pone uno, en Santa Cruz. Faltan en Puerto de
  la Cruz, antes del gimnasio, y cerca de Las Cañadas, la zona alta y larga.
- **Los objetivos,** de 4 a 5 para la isla, uno por cada tramo con nombre, como en Gran Canaria.
- **El gimnasio de Agua,** sea cual sea, con su mecánica presentada primero sin aprendices (la
  primera marea o la primera bolsa de aire) y después con ellos.
