# Fase 1: prototipo «Granada, 1492»

Estado: **en curso.** Los hitos 1 a 3 están hechos y el modo historia se juega entero. Falta ajustar el equilibrio del hito 4. La tabla de tipos (§4) está equilibrada con el autor desde el 2026-10-26. El juego ya va más allá del prototipo: el capítulo 2 (Villalar y Toledo, 1521) está hecho; ver `GDD.md` §12 (11).

## 1. Objetivo

Que una partida corta funcione de principio a fin:

1. Isabel la Católica te encarga el Bestiario y te da una criatura inicial.
2. Recorres la Vega de Granada capturando criaturas.
3. Ganas a dos entrenadores.
4. Ganas a Boabdil en la Alhambra.
5. Guardas y continúas otro día.

Ambientación: invierno de 1491 a 1492. Los Reyes Católicos esperan en Santa Fe, la ciudad
campamento levantada frente a Granada, mientras se negocia la entrega de la ciudad. Colón
también está allí, esperando que los Reyes aprueben su viaje. Boabdil acepta un último duelo de
leyendas antes de entregar las llaves.

## 2. Contenido

### Zona

Es una sola zona con tres partes:

- **Santa Fe.** Un mesón que cura, una tienda, Isabel, Colón y el Gran Capitán.
- **La Vega y el Genil.** La ruta, con carrizales, acequias y olivares, y los dos entrenadores.
- **La Alhambra.** El gimnasio de Boabdil, en el Patio de los Leones.

### Criaturas

Las del capítulo 1 del Bestiario (`BESTIARIO.md`, números 001 a 021), más el Papemímico, que
sale de las tinajas. Entre paréntesis, el `id` interno, que no cambia.

| Nº | Criatura | Tipo | Papel |
| --- | --- | --- | --- |
| 001–003 | Ignibue → Braverno → Ignivárgoth (`becerro_igneo`…) | Infernal; Infernal y Tierra | Inicial. Evoluciona a los niveles 16 y 36 |
| 004–006 | Marzuko → Nakarra → Talascrón (`cangrejo`…) | Agua; la final, Agua y Acero | Inicial. Evoluciona a los niveles 16 y 36 |
| 007–008 | Dralín → Dracendro (`retono_drago`, `drago_milenario`) | Planta; la final, Planta y Ancestral | Inicial. Evoluciona al nivel 26 |
| 009–010 | Zumbrel → Diablisca (`libelula`, `caballuco_diablu`) | Aire; Aire e Infernal | Común en la Vega. Evoluciona al nivel 12 |
| 011–012 | Brezuco → Trasgorn (`duende`, `trasgo`) | Oscuridad | Evoluciona con el Gorro colorado. Trasgorn sale en la Alhambra |
| 013 | Túmbriz (`topillo`) | Común y Tierra | Muy común en la Vega |
| 014 | Barbaflux (`barbo`) | Agua | De entrenadores; en la Vega no hay pesca todavía |
| 015 | Abezar (`abejaruco`) | Aire | Común |
| 016 | Mandragor (`mandragora`) | Planta y Mental | Rara |
| 017 | Carapachón (`galapago`) | Agua | Poco común |
| 018 | Alhambrón (`leon_fuente`) | Agua y Tierra | Criatura estrella de Boabdil |
| 019–021 | Broncero → Escarbraz → Mocarabeo (`escarabajo_pelotero`…) | Tierra; Tierra y Acero; Acero y Luz | Broncero en la Vega, Escarbraz en la Alhambra. Evoluciona a los niveles 18 y 34 |
| 129 | Papemímico (`papemimico`) | Oscuridad y Acero | Dentro de una de cada diez tinajas |

Los tipos usan la tabla del autor (`src/data/tipos.ts`).

- **Iniciales.** Forman el triángulo clásico: el Agua apaga el fuego (Infernal), el fuego quema
  la Planta y la Planta absorbe el Agua.
- **El Osezno sale del prototipo.** Con las nuevas relaciones, el Agua es eficaz contra la
  Tierra, así que tendría desventaja frente a Boabdil, igual que Ignibue. Lo sustituye el
  drago, que además es un guiño a Canarias.
- **El Osezno vuelve más adelante,** en los capítulos del norte, con su línea hasta Basajaun.

Con esto se prueban las dos evoluciones (4→5 y 9→10), el tipo doble y las tres rarezas. Los
iniciales evolucionan en la fase 2, como en Pokémon, donde lo hacen después del primer gimnasio.

### Personajes y objetos

- **Entrenadores** (rebajados a petición del autor el 2026-10-25): cinco entre la Vega y la
  Alhambra, cada uno con una sola criatura y nivel bajo, para que la primera zona sea fácil con
  cualquier inicial.
  - La Vega, niveles 3 a 5: el ballestero Sancho (Abezar), un labrador (Túmbriz) y el mercader
    genovés (Zumbrel).
  - La Alhambra, niveles 5 y 6: un jardinero (Mandragor) y el guardia (Brezuco). El guardia avisa
    de que a los duendes del emir les va mal la Luz y lo Mental.
- **Líder: Boabdil**, con los duendes de la Alhambra: Brezuco (nivel 7) y Trasgorn (nivel 8), de
  Oscuridad, neutros contra las tres iniciales.
  - Antes llevaba a Alhambrón (Agua/Tierra) como criatura fuerte. Se quitó a petición del autor:
    a Ignibue le hace ×4 y no le entra (×¼), así que con el inicial de fuego era imposible.
    Alhambrón queda para más adelante.
- **PNJ:**
  - Isabel la Católica, la mentora. Te encarga el Bestiario y te da la criatura inicial.
  - El Gran Capitán, que negoció la entrega de Granada. Te da las primeras téseras.
  - Colón, que espera el sí de los Reyes.
  - Un pastor de Orce, que te regala un colmillo de sable fósil. No sirve hasta el laboratorio
    del Dr. Jangel, en el capítulo 2: es un anticipo.
- **Objetos:**
  - Tésera, para capturar.
  - Poción, para curar.
- **Moneda:** maravedís.
- **Estados alterados:** Quemado y Dormido.
- **Movimientos:** unos 25.

## 3. Estadísticas (decidido): como en Pokémon, con nombres propios

| Estadística | En Pokémon | Para qué sirve |
| --- | --- | --- |
| Vida | PS | Cuando llega a 0, la criatura queda fuera de combate |
| Fuerza | Ataque | Daño de los movimientos físicos |
| Escudo | Defensa | Reduce el daño físico que recibe |
| Magia | Ataque especial | Daño de los movimientos mágicos |
| Resistencia mágica | Defensa especial | Reduce el daño mágico que recibe |
| Celeridad | Velocidad | Decide quién actúa primero |

- **Movimientos.** Cada uno es físico, mágico o de estado. La categoría depende del movimiento,
  no del tipo.
- **Cálculo de las estadísticas.** Se usa la fórmula de Pokémon a partir de las estadísticas
  base de la especie y del nivel, con un máximo de nivel 100.
  - **Valía (de 1 a 14).** Sustituye a los IV y los EV: un solo número que dice lo buena que
    es la criatura.
    - Se tira al capturarla, con forma de campana: lo normal es entre 6 y 9, y el 14 es raro.
    - No cambia después.
    - Se suma a todas las estadísticas como un IV común: IV = (Valía − 1) × 31 ÷ 13. Una Valía
      de 14 equivale a un IV de 31 en todo, y una de 1, a un 0.
    - Las criaturas de los entrenadores llevan una Valía fija según su dificultad; los líderes,
      alta.
  - El **temperamento** (+10 % en una estadística y −10 % en otra) equivale a la naturaleza.
- **Daño.** Es la fórmula de Pokémon:
  `((2 × Nivel ÷ 5 + 2) × Poder × A ÷ D) ÷ 50 + 2`.
  - A ÷ D es Fuerza ÷ Escudo en los movimientos físicos y Magia ÷ Resistencia mágica en los
    mágicos.
  - Luego se multiplica por la afinidad (×1,5 si el movimiento es del tipo de la criatura), por
    el tipo, por el crítico (×1,5) y por una tirada de entre 0,85 y 1.
- **Igual que en Pokémon:**
  - Orden por Celeridad, con prioridad en algunos movimientos.
  - Precisión, PP y cambios de estadísticas en combate, de −6 a +6.
- **Estados alterados en el prototipo:** Quemado (Infernal) y Dormido.
- **Captura.** Fórmula al estilo de Pokémon: cada especie tiene un ratio de captura, y es más
  fácil cuanta menos Vida tiene la criatura y si sufre un estado alterado.
- **Experiencia.** Fórmula al estilo de Pokémon, con una sola curva de nivel en el prototipo.
- **Toda la aleatoriedad sale del generador con semilla:** tirada, críticos, precisión y
  captura.

## 4. Tipos

- **La lista.** Son los 15 del GDD (§8). Las relaciones están en `GDD.md` §8: los tipos sin
  inmunidades dan tantos ×2 como ×½.
- **Tipo doble.** El motor admite dos tipos por criatura desde el principio. Cuesta poco y
  evita rehacerlo después.
- **La tabla es un dato** (`src/data/tipos.ts`). Se puede cambiar sin tocar el motor, así que no
  bloquea el laboratorio de combate.
- **En el prototipo** se usará solo el subconjunto de tipos que necesiten sus 12 criaturas.

## 5. Hitos

Cada hito termina en algo que se puede abrir en el navegador y jugar.

1. **Laboratorio de combate. Hecho (2026-10-20).**
   - El proyecto Vite + TS + Phaser, con el motor de combate en `src/core` y sus pruebas.
   - Una pantalla para elegir dos criaturas y combatir, que sirve para ajustar las cifras.
   - *Jugable:* combates sueltos contra criaturas salvajes.
2. **La Vega. Hecho (2026-10-23).**
   - Mapa en Tiled y movimiento con el mando táctil o el teclado.
   - Encuentros en el carrizal, captura con téseras y equipo de hasta 6.
   - Las demás criaturas se guardan en el Bestiario, que se gestiona en el mesón.
   - El mesón, que cura.
   - *Jugable:* explorar y capturar.
3. **Progresión y gimnasio. Hecho (2026-10-23).**
   - Experiencia, niveles, movimientos nuevos y evolución.
   - Los dos entrenadores y Boabdil.
   - Isabel con la elección de la inicial, el Gran Capitán, Colón y el fósil de Orce.
   - Guardado automático, más exportar e importar la partida.
   - *Jugable:* la partida completa del §1.
4. **Móvil y publicación. Casi hecho (2026-10-23): pantalla completa, web instalable y despliegue; falta el equilibrio.**
   - Pulir el mando táctil y el escalado.
   - Añadir el juego al workflow de Pages, con `noindex`.
   - *Jugable:* el enlace para los tres.

## 6. Arquitectura del prototipo

```
leyendas-de-iberia/
  index.html  package.json  vite.config.ts (base relativa)  tsconfig.json
  src/
    core/       rng, estadísticas, tipos, combate (estado, acciones, resolución, IA),
                captura, progreso, guardado. Sin Phaser, sin DOM, sin Math.random.
    data/       criaturas, movimientos, tipos, entrenadores, objetos, zonas, sprites
    escenas/    Arranque, Título, Mapa, Combate, Menú, Diálogo
    ui/         mando táctil, cajas de texto
    assets/     criaturas/<id>.png (si falta, se genera uno provisional), mapas/, tiles/
  tests/        Vitest, contra src/core
```

- **Sprites.** Se detectan automáticamente los PNG que existan en `assets/criaturas/`. Para
  sustituir el arte provisional basta con añadir `<id>.png`.
- **Tiles provisionales.** Se generan por código, con colores planos. No se usa ningún paquete
  de terceros.

## 7. Fuera del prototipo

Quedan para fases posteriores:

- Evoluciones de los iniciales. (Más zonas: el capítulo 2 ya está hecho.)
- El laboratorio del Dr. Jangel y los fósiles revividos.
- Las zonas opcionales anteriores a 1492, con el Cid y Babieca.
- Música.
- Reto diario y multijugador.
- Backend.
- Arte definitivo.
