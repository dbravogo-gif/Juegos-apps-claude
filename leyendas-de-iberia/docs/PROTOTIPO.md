# Fase 1: prototipo «Granada, 1492»

Estado: **propuesta pendiente de visto bueno.** No se programa nada hasta que se elijan el
sistema de estadísticas y la tabla de tipos, y se apruebe el plan.

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
- **Estados alterados:** solo Quemado, que se suma a los estados propios del sistema elegido.
- **Movimientos:** unos 25.

## 3. Sistemas de estadísticas: elige uno

Los tres cumplen el principio del GDD: cuatro estadísticas y una sola idea nueva que se ve en
pantalla. Los tres son deterministas, sin tirada de daño, y sirven para el reto diario. Las
cifras son provisionales.

### A) Guardia (recomendado)

**Estadísticas:** Vida, Fuerza, Rapidez y **Guardia**. La Guardia es de 1 a 5 escudos, que se
ven como iconos. Es fija para cada especie, y la evolución puede sumar un escudo.

- Actúa primero la criatura con más Rapidez.
- **Daño** = Poder × Fuerza × tipo. No hay Defensa: la resistencia se expresa con la Vida y la
  Guardia.
- **Escudos que quita cada golpe:** 1 si el golpe es neutro, 2 si es eficaz y 0 si es poco
  eficaz.
- **Quebrado.** Cuando una criatura se queda sin escudos:
  - pierde su siguiente acción;
  - recibe ×1,5 de daño hasta que vuelva a actuar;
  - después recupera todos los escudos.
- **Movimientos.** Cada uno tiene Poder, número de Golpes (de 1 a 3) y Tipo. Los movimientos de
  varios golpes pegan flojo, pero quiebran rápido.
- **Captura.** La tésera casi solo funciona con la criatura Quebrada: un 10 % sin quebrar y
  entre un 50 % y un 90 % quebrada, según su rareza y su Vida.

*Ejemplo.* Un Osezno (Tierra, 3 escudos) se enfrenta a un Abejaruco (Fuego, 2 escudos). El
Osezno usa Zarpazo, de tipo Tierra y un golpe. Tierra es eficaz contra Fuego, así que quita 2
escudos y el Abejaruco queda Quebrado: pierde su turno. Ahora eliges: si lo rematas, haces
×1,5 de daño; si quieres capturarlo, lanzas la tésera. El Abejaruco, en cambio, no puede quebrar
al Osezno con ataques de Fuego.

**Decisiones que genera:**

- Quebrar con golpes flojos para capturar o rematar.
- Cambiar de criatura para tener un tipo que quiebre.
- Proteger tus escudos.

| A favor | En contra |
| --- | --- |
| Es lo más distinto de Pokémon. | Puede volverse repetitivo (quebrar y castigar), así que harán falta movimientos que recuperen o ignoren escudos. |
| Se lee de un vistazo. | En un uno contra uno, perder el turno se siente duro, así que habrá que ajustarlo. |
| Une tipos, captura y movimientos. | |
| La IA es sencilla. | |

### B) Aliento

**Estadísticas:** Vida, Fuerza, Aguante y **Aliento**. El Aliento máximo va de 4 a 8 puntos y
sustituye a los PP.

- Al empezar cada turno, las dos criaturas ganan 2 de Aliento.
- Los movimientos cuestan de 0 a 4 de Aliento, y siempre hay uno de coste 0.
- **Iniciativa.** Actúa primero quien tiene más Aliento. Se ve antes de elegir. En caso de
  empate, actúa primero quien actuó segundo el turno anterior.
- **Daño** = Poder × Fuerza ÷ Aguante × tipo.
- **Tipos.** Un golpe eficaz hace ×1,5 y además quita 1 de Aliento al rival. Uno poco eficaz
  hace ×0,75.
- **Tomar aire.** No atacas, ganas 2 de Aliento extra y recibes la mitad de daño ese turno.
- **Agotado.** Con 0 de Aliento solo se pueden usar movimientos de coste 0.
- **Captura.** Clásica: es más fácil cuanta menos Vida le queda a la criatura, y mucho más si
  está Agotada.

*Ejemplo.* Un Desmán con 6 de Aliento (su máximo) usa Torrente, que cuesta 4, y se queda en 2.
El turno siguiente tiene 4 y el rival 6, así que actúa primero el rival. ¿Gastas ahora o
guardas para actuar antes?

| A favor | En contra |
| --- | --- |
| Cada turno es una decisión de recursos. | Hay más números en pantalla en cada turno. |
| Sin PP. | Con criaturas parecidas, el juego óptimo puede acabar siendo siempre el mismo. |
| El ritmo cambia de dueño. | |
| Fácil de programar. | |

### C) Línea de tiempo

**Estadísticas:** Vida, Fuerza, Aguante y Rapidez.

- No hay rondas. Una barra muestra las próximas 6 acciones.
- Cada movimiento tiene un **Peso**: ligero, normal o pesado. Después de usarlo, la criatura
  espera Peso × 100 ÷ Rapidez antes de volver a actuar.
- **Tipos.** Un golpe eficaz hace ×1,5 y además retrasa al rival. Uno poco eficaz hace ×0,75.
- **Captura.** Clásica por Vida, con ventaja si el rival está retrasado.

*Ejemplo.* Una Libélula, que es muy rápida, encaja tres picotazos ligeros mientras el Osezno
prepara un zarpazo pesado. Si el zarpazo es eficaz, retrasa a la Libélula y le roba un turno.

| A favor | En contra |
| --- | --- |
| La velocidad cuenta de forma gradual, no a todo o nada. | Necesita más interfaz. |
| Es muy táctico. | La Rapidez tiende a dominar. |
| | Cambiar de criatura complica la barra. |
| | Es el que más trabajo lleva. |

### Comparación

| | A) Guardia | B) Aliento | C) Línea de tiempo |
| --- | --- | --- | --- |
| Diferencia con Pokémon | Alta | Media | Alta |
| Lectura en móvil | Muy buena | Buena | Regular |
| Relación con la captura | Fuerte (quebrar) | Media (agotar) | Débil |
| Coste de programarlo | Bajo | Bajo | Medio-alto |
| Riesgo principal | Que se repita | Que se resuelva | Que domine la Rapidez |

**Recomendación: A.** Con una sola idea nueva, los escudos, que además se ven, conecta tipos,
captura y movimientos. Si dudáis entre dos, el hito 1 puede incluir los dos en el laboratorio
de combate y se elige jugando. Costaría algo más de trabajo.

## 4. Tabla de tipos provisional (5)

Los cuatro elementos clásicos forman un ciclo: el Agua vence al Fuego, el Fuego al Aire, el
Aire a la Tierra y la Tierra al Agua. A eso se suman dos relaciones extra y un quinto tipo,
Ánima, para los espíritus.

| Ataca ↓ / Defiende → | Fuego | Agua | Aire | Tierra | Ánima |
| --- | --- | --- | --- | --- | --- |
| **Fuego** | — | ×0,75 | **×1,5** | ×0,75 | **×1,5** |
| **Agua** | **×1,5** | — | — | ×0,75 | — |
| **Aire** | ×0,75 | — | — | **×1,5** | — |
| **Tierra** | **×1,5** | **×1,5** | ×0,75 | — | ×0,75 |
| **Ánima** | ×0,75 | — | — | **×1,5** | — |

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
- Usar un movimiento del propio tipo no da bonificación en el prototipo.
- Fuego y Tierra tienen cuatro relaciones; el resto, dos. El balance neto es 0 para todos.

En el sistema A, la tabla decide además cuántos escudos quita cada golpe: 2 si es eficaz y 0 si
es poco eficaz.

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
