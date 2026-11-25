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
