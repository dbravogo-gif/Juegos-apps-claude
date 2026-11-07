# 11 · Conceptos a partir de los gustos del autor

Escrito el 2026-11-07 (paso 0 de `/nuevo-proyecto`).

## Los gustos del autor

En sus palabras, resumidas:

- **Le encantan:** Pokémon y los juegos *hack and slash*. Los de gestión también le gustan,
  pero cree que exigen saber mucho de qué hacer en cada momento.
- **Lo quiere para jugar con amigos.**
- **Su deseo concreto:** «un Pokémon en el que pudiera jugar con amigos», en 3D o mucho más
  bonito y más parecido a Pokémon que Leyendas de Iberia.
- **Descarta los *shooters*,** por la dificultad.
- **Controles** (decidido antes): el tacto en móvil, y ratón y teclado en PC; nunca un mando.

## Matices críticos (R12)

- **Lo difícil de un *shooter* no es el plan Pro.** Es apuntar con el dedo y sincronizar en
  tiempo real a varios jugadores. Un *hack and slash* cooperativo comparte ese segundo problema.
  **Los combates por turnos son, con diferencia, lo más fácil de llevar online:** solo viajan
  decisiones, no posiciones a 60 veces por segundo. Y son lo mejor para jugar en el móvil.
- **«Parecido a Pokémon» se entiende como mecánicas, no como obra (R8).** Nada de nombres,
  diseños, sonidos ni criaturas que recuerden a una concreta.
  - Nintendo y The Pokémon Company demandaron en septiembre de 2024 a los creadores de Palworld
    por patentes japonesas de captura. En 2026 el caso se ha reducido a versiones antiguas del
    juego y sigue pendiente.
  - Para un juego gratuito entre amigos, el riesgo es bajo. Si algún día fuera público y de
    pago, habría que revisarlo.
  - Fuentes: [OpenCritic](https://opencritic.com/news/32803/nintendo-s-palworld-lawsuit-is-falling-apart)
    y [Nintendo Soup](https://nintendosoup.com/nintendo-lawsuit-against-palworld-now-only-targeting-older-versions-of-the-game/).
- **El mayor riesgo técnico son las criaturas en 3D sin artistas.** Las formas simples y
  monas (cuerpos redondos, orejas, colas) se pueden generar por código con buen aspecto. Las
  evoluciones épicas cuestan mucho más.
  - Mitigación: una **prueba temprana** con 3 criaturas hechas por código en una escena 3D
    estilizada, antes de comprometer el diseño.
  - Plan B: paquetes gratuitos de monstruos animados, con la licencia comprobada.
  - Plan C: criaturas ilustradas en 2D dentro de un mundo 3D, al estilo «HD-2D».

## Concepto A · Criaturas 3D con amigos, por fases (recomendado)

- **Pitch:** explora un mundo 3D en miniatura, captura criaturas y combate por turnos. Desde el
  primer día puedes intercambiarlas con tus amigos y retar a sus equipos; después, combates en
  directo.
- **Verbos:** explorar, capturar, formar equipo y combatir por turnos.
- **Con amigos, por fases:**
  1. **Asíncrono, sin servidor:** intercambios y combates contra el equipo de un amigo mediante
     un código o un enlace. Su equipo lo maneja la máquina y la simulación es determinista.
  2. **Combates en directo por turnos,** a través de un servicio gratuito de tiempo real.
  3. **Quizá, explorar juntos.** Es lo más difícil.
- **Orden de construcción (R5):**
  1. Combate y equipo en una arena 3D bonita.
  2. Retar al equipo de un amigo.
  3. La primera zona explorable con capturas.
  4. Más zonas.
- **Por qué:** es lo que pides, se maneja bien con el dedo, es lo más fácil de llevar online y
  su núcleo determinista se puede probar con bots.
- **Riesgos:** el arte de las criaturas (por eso la prueba temprana) y el volumen de contenido.
  Se empieza con unas 12 a 20 criaturas.

## Concepto B · *Hack and slash* cooperativo con criaturas

- **Pitch:** con 2 a 4 amigos entras en mazmorras cortas y combates en tiempo real junto a tus
  criaturas. Capturas a las que debilitas para sumarlas al equipo.
- **Por qué:** es acción y cooperación de verdad.
- **Riesgos:**
  - La red en tiempo real hace falta desde el principio.
  - La sensación de combate con el dedo exige muchas pruebas tuyas (tienes unas 7 horas a la
    semana).
  - Equilibrar el combate.

## Concepto C · Arena de entrenadores

- **Pitch:** forma tu equipo de criaturas y reta a tus amigos en combates por turnos en una
  arena 3D. Cada día, una expedición nueva para capturar más.
- **Por qué:** es el alcance más pequeño y el más rápido de dejar pulido. Una sola escena
  representativa, que es donde mejor brilla nuestro método.
- **Riesgos:** sin un mundo que explorar se pierde parte de la magia. En la práctica, es la
  fase 1 del concepto A.

## Recomendación

**Concepto A**, empezando por su fase 1, que es el concepto C, y con la prueba de las criaturas
como primera tarea.

## Decisión del autor (2026-11-07)

- **Concepto A.**
- **Lo que quiere con sus amigos**, en sus palabras: «retar a mis amigos y verlos en el mundo por
  donde vayan. Que si paso por la misma zona que ellos los vea y nos podamos juntar en ciertos
  combates difíciles 2v2».

## Consecuencias para el diseño

Es inferencia mía; se cerrará en la entrevista.

1. **Tres modos con amigos:**
   - Presencia por zona: ves a los amigos que están en tu misma zona.
   - Retos 1 contra 1.
   - Combates cooperativos 2 contra 2 contra rivales difíciles.
2. **El motor de combate admite 2 contra 2 desde el principio,** aunque la primera versión sea
   para un solo jugador. Añadirlo después obligaría a rehacerlo (R6).
3. **Combate determinista con semilla compartida:** los dos jugadores resuelven el mismo
   combate y solo viajan las decisiones de cada turno. La presencia se manda pocas veces por
   segundo y se interpola: no hace falta física compartida.
4. **Hace falta un servicio de tiempo real gratuito**, con una sala por zona. Candidatos que hay
   que verificar en su momento: Cloudflare (Durable Objects en el plan gratuito) o Supabase
   Realtime (tiene «presencia» incluida). Los dos piden crear una cuenta gratuita. Se decide en
   la fase online, investigando sus límites gratuitos.
5. **Fases:**
   1. Prueba de arte con 3 criaturas.
   2. Una zona 3D con captura y combate por turnos (con 2 contra 2 en el motor), para un
      jugador.
   3. Presencia y retos online.
   4. Combates cooperativos 2 contra 2.
   5. Más zonas.
