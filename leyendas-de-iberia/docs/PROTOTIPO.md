# Fase 1: prototipo «Granada, 1492»

Estado: **pendiente de visto bueno.** Las estadísticas ya están decididas (§3). Falta confirmar
la tabla de tipos provisional (§4) y dar el visto bueno para empezar a programar.

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

### Criaturas (12, nombres provisionales)

| # | Criatura | Tipo | Inspiración | Papel |
| --- | --- | --- | --- | --- |
| 1 | Becerro de fuego | Fuego | Los toros de fuego de las fiestas populares | Inicial |
| 2 | Desmán | Agua | El desmán ibérico de los ríos del norte | Inicial |
| 3 | Osezno | Tierra | El oso pardo. En la fase 2 evoluciona a oso y luego a Basajaun | Inicial |
| 4 | Libélula | Aire | Fauna | Común |
| 5 | Caballuco del diablu | Aire | Mitología cántabra: las libélulas que montan los diablos la noche de San Juan | Evolución de 4 |
| 6 | Topillo | Tierra | Fauna | Común |
| 7 | Cangrejo de río | Agua | El cangrejo autóctono de las acequias | Común |
| 8 | Abejaruco | Fuego | Ave de plumaje de colores vivos | Común |
| 9 | Duende | Ánima | El duende del folclore de toda España | Poco común |
| 10 | Trasgo | Ánima | El trasgu del folclore del norte | Evolución de 9 |
| 11 | Galápago | Agua | El galápago leproso de balsas y acequias | Rara |
| 12 | León de la fuente | Agua | Los leones de piedra del Patio de los Leones | Criatura estrella de Boabdil. No se puede capturar en el prototipo |

Con esto se prueban las dos evoluciones (4→5 y 9→10), los 5 tipos y las tres rarezas. Los
iniciales evolucionan en la fase 2, como en Pokémon, donde lo hacen después del primer gimnasio.

### Personajes y objetos

- **Entrenadores:**
  - Un ballestero del real de Santa Fe: Topillo y Abejaruco.
  - Un mercader genovés: Libélula, Cangrejo y Duende.
- **Líder: Boabdil**, de tipo Agua por las acequias, albercas y fuentes de la Alhambra. Lleva
  Cangrejo, Galápago y León de la fuente, entre los niveles 11 y 14.
  - Frente a él, el Osezno (Tierra) tiene ventaja, el Becerro (Fuego) desventaja y el Desmán va
    neutral. Es lo habitual en un primer gimnasio.
- **PNJ:**
  - Isabel la Católica, la mentora. Te encarga el Bestiario y te da la criatura inicial.
  - El Gran Capitán, que negoció la entrega de Granada. Te da las primeras téseras.
  - Colón, que espera el sí de los Reyes.
  - Un pastor de Orce, que te regala un colmillo de sable fósil. No sirve hasta el laboratorio
    del Dr. Jangel, en el capítulo 2: es un anticipo.
- **Objetos:**
  - Tésera, para capturar.
  - Ungüento, para curar.
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
- **Estados alterados en el prototipo:** Quemado (Fuego) y Dormido.
- **Captura.** Fórmula al estilo de Pokémon: cada especie tiene un ratio de captura, y es más
  fácil cuanta menos Vida tiene la criatura y si sufre un estado alterado.
- **Experiencia.** Fórmula al estilo de Pokémon, con una sola curva de nivel en el prototipo.
- **Toda la aleatoriedad sale del generador con semilla:** tirada, críticos, precisión y
  captura.

## 4. Tabla de tipos provisional (5)

Los cuatro elementos clásicos forman un ciclo: el Agua vence al Fuego, el Fuego al Aire, el
Aire a la Tierra y la Tierra al Agua. A eso se suman dos relaciones extra y un quinto tipo,
Ánima, para los espíritus.

| Ataca ↓ / Defiende → | Fuego | Agua | Aire | Tierra | Ánima |
| --- | --- | --- | --- | --- | --- |
| **Fuego** | — | ×0,5 | **×2** | ×0,5 | **×2** |
| **Agua** | **×2** | — | — | ×0,5 | — |
| **Aire** | ×0,5 | — | — | **×2** | — |
| **Tierra** | **×2** | **×2** | ×0,5 | — | ×0,5 |
| **Ánima** | ×0,5 | — | — | **×2** | — |

Por qué cada relación, en una frase:

- El Agua apaga el Fuego.
- El Fuego consume el Aire.
- El Aire erosiona la Tierra.
- La Tierra encauza el Agua.
- La Tierra sofoca el Fuego.
- Las hogueras de San Juan y la queimada espantan a las ánimas.
- Lo terrenal teme a lo de ultratumba.

La tabla es simétrica: si X es eficaz contra Y, Y es poco eficaz contra X. Además:

- Ningún tipo es inmune a otro.
- Los multiplicadores son los de Pokémon: ×2 y ×0,5. La afinidad se explica en el §3.
- Fuego y Tierra tienen cuatro relaciones; el resto, dos. El balance neto es 0 para todos.

## 5. Hitos

Cada hito termina en algo que se puede abrir en el navegador y jugar.

1. **Laboratorio de combate.**
   - El proyecto Vite + TS + Phaser, con el motor de combate en `src/core` y sus pruebas.
   - Una pantalla para elegir dos criaturas y combatir, que sirve para ajustar las cifras.
   - *Jugable:* combates sueltos contra criaturas salvajes.
2. **La Vega.**
   - Mapa en Tiled y movimiento con el mando táctil o el teclado.
   - Encuentros en el carrizal, captura con téseras y equipo de hasta 6.
   - Las demás criaturas se guardan en el Bestiario, que se gestiona en el mesón.
   - El mesón, que cura.
   - *Jugable:* explorar y capturar.
3. **Progresión y gimnasio.**
   - Experiencia, niveles, movimientos nuevos y evolución.
   - Los dos entrenadores y Boabdil.
   - Isabel con la elección de la inicial, el Gran Capitán, Colón y el fósil de Orce.
   - Guardado automático, más exportar e importar la partida.
   - *Jugable:* la partida completa del §1.
4. **Móvil y publicación.**
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

- Evoluciones de los iniciales y más zonas.
- El laboratorio del Dr. Jangel y los fósiles revividos.
- Las zonas opcionales anteriores a 1492, con el Cid y Babieca.
- Tipos dobles.
- Música.
- Reto diario y multijugador.
- Backend.
- Arte definitivo.
