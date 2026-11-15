# Decisiones a medias

Lo que está abierto, aparcado o esperando al autor. Cada punto lleva desde cuándo, qué falta, la
propuesta de Claude y qué frena mientras siga abierto.

**Cómo se mantiene:** al abrirse una decisión se apunta aquí con su fecha. Al cerrarse, pasa a
«Decisiones cerradas» de `DISENO.md` (o al documento de su tema) y se borra de aquí.

## Criaturas

1. **Equilibrio de las 4 iniciales** (2026-11-10).
   - El autor cerró el ciclo: Agua, Planta (Planta/Mental), Infernal y Roca (Roca/Veneno desde
     la segunda forma). El agua gana a la roca, la roca al fuego, el fuego a la planta y la
     planta al agua.
   - Queda por equilibrar, con los segundos tipos:
     - en las primeras formas, Agua y Planta ganan también a la pareja de enfrente;
     - en las finales, Infernal no gana a ninguna.
   - Lo hace el autor (`CRIATURAS.md`).
2. **Estadísticas de las 4 iniciales** (autor, 2026-11-10). Las pasa el autor; ahora el
   combate de prueba usa unas provisionales (`src/data/combate-prueba.ts`).
3. **Historias de las iniciales** (2026-11-10).
   - La de la leyenda de roca, en el museo y en boca del anciano, es provisional.
   - También queda por escribir con el autor la cuarta variante del equipo enemigo.
4. **Esculturas para los pedestales** (autor, 2026-11-10). Las pasará el autor. Hasta
   entonces, las estatuas son el modelo de cada inicial en piedra; si gustan, se quedan.
5. **El ciervo-león de la prueba de Meshy** (2026-11-10).
   - El 2026-11-08 se decidió que fuera la línea de la inicial de Planta: formas 2 y 3 de
     Meshy, con sus prompts en `prompts-meshy.md`.
   - Desde el 2026-11-10, la inicial de Planta es el lagarto con setas que acaba en chamán.
   - **Propuesta:** el ciervo-león pasa a ser una especie normal de tipo Planta de la lista,
     para no perder lo que ya está hecho.
6. **Dónde aparece cada criatura** (autor, 2026-11-10).
   - Se decide al final, con todas generadas y el tipo de cada gimnasio decidido.
   - El reparto de la isla 1 de `DISENO.md` se rehará entonces.
7. **Líneas ramificadas** (autor, 2026-11-10). Más adelante: no suelen salir al principio.
8. **Habilidades o pasivas.**
   - Serán obra nuestra (autor, 2026-11-10). Falta decidir cuándo entran.
   - **Propuesta:** después de la isla 1.
9. **Retoques de estadísticas.** Se copian exactas; el autor avisa si alguna se retoca, por
   ejemplo Slaking, cuya pega aún no existe aquí.
10. **Ojos de las criaturas de Meshy** (2026-11-08).
    - Retocarlos con «Texture Edit» o poner encima los ojos del propio juego.
    - **Propuesta:** los del juego. Parpadean, se cierran al debilitarse y son iguales en
      todas (`prompts-meshy.md`).

11b. **Equilibrio de la tabla** (2026-11-13). Hecho lo que pidió el autor: Acero ya no resiste
    Planta, Aire ni Mental (de 9 resistencias a 6); Bicho ya no es ×2 contra Planta, e Infernal
    ya no resiste a Acero. Lucha lleva 9 criaturas.
    - **Veneno** hace ×2 también a Común, y a ningún tipo más (autor, 2026-11-13).
    - **Hecho el 2026-11-15** («como quede más compensado», autor): la Tierra hace ×2 a la Roca, que
      cierra el círculo de los cinco pueblos, y Espectral y Acero ya no resisten a Bicho, el tipo
      más flojo (su saldo pasa de −4 a −2). Las pruebas vigilan el círculo.

## Islas y mundo

- **Personas de los amigos** (autor, 2026-11-11). Cada amigo pasa una foto de cómo quiere su
  personaje y el autor lo hace con Meshy: no hace falta personalizar. Ya están Dani (el autor),
  el pescador y el informático (`public/modelos/personas/LEEME.md`).
  - Dani no trae animación de parado. Hoy se usa un fotograma de su andar; si el autor lo
    exporta con `Idle`, se cambia en un minuto.
- **Personas jugables:** la portada ya deja elegir persona y nombre (2026-11-12). Cada amigo sale
  en cuanto llega su GLB con foto: se añade en `arte/personas.ts` con `jugable`.
- **Evolución** (F20): el núcleo ya evoluciona, pero faltan las segundas formas y sus niveles
  (del autor). Con los niveles de la isla 1 (hasta el 12), nadie evolucionaría todavía.
- **Mochila y equipo** (2026-11-12): faltan los objetos que se llevan equipados (Equipar y
  Quitar en Equipo → Objeto) y las técnicas que enseñan movimientos (su bolsillo ya está). Una
  mochila de Meshy es opcional: la de ahora se dibuja por código.
- **Del probador (2026-11-12), sin arreglar:**
  - Los modelos de las salvajes se repiten (relleno con el de la inicial de su tipo): se va con
    las criaturas del autor.
  - «Probar sonidos» está en el menú de todos: se quita cuando el autor valore los efectos.
  - La compañera encima del jugador tras un salto de sitio: no se ha podido reproducir.
- **Llamadas de dibujo** (2026-11-11): unas 210 mirando a Famara, frente a las 160 del reparto.
  - Lo que más gasta son los personajes de KayKit: cada uno son 5 o 6 mallas, más su sombra.
    Los de Meshy son una sola malla, así que al cambiarlos baja solo.
  - Falta medirlo en los portátiles del autor y sus amigos.
- **El autor y sus amigos, dentro del juego** (autor, 2026-11-11; para más adelante).
  - 4 o 5 personajes repartidos por el mapa en sitios concretos.
  - Al hablar con ellos, su retrato aparece encima de la pantalla, en 2 o 3 poses según lo
    que dicen.
  - Falta: quiénes son, dónde está cada uno, y sus fotos o dibujos, con su permiso.
  - **Propuesta:** retratos con el estilo del juego hechos a partir de fotos, con tres poses:
    normal, contento y sorprendido. La caja de diálogo ya existe; solo le falta el retrato.
- **La historia** (autor, 2026-11-15): la escribe Claude. Primer borrador en `HISTORIA.md`, con
  cuatro decisiones del autor al final; no entra en el juego hasta que las tome.
- **El norte de Lanzarote** queda libre para más adelante (Haría, los Jameos). Para la isla 1
  basta con Famara (autor, 2026-11-11).
- **Mapa dentro del juego**: está en el menú de pausa (Esc → Mapa), con tu posición. Falta decidir
  si las zonas sin visitar se ocultan (**propuesta:** en gris y sin nombre) y si lleva tecla
  propia (M).

11. **Tipo de cada gimnasio.**
    - Lanzarote es de Roca y Fuerteventura, de Aire. Gran Canaria, Eléctrico y Lucha (autor,
      2026-11-15). Faltan Tenerife (uno solo), La Gomera, La Palma y El Hierro.
    - Siete medallas (autor, 2026-11-15): la de Gran Canaria es una pintadera partida en dos
      mitades, una por gimnasio. El medallero ya muestra las siete; las mitades se pintan al hacer
      Gran Canaria.
    - El emblema del gimnasio de La Palma era un sol, del tipo Luz, que ya no existe.
    - **Frena:** dónde dar las criaturas que les hacen frente (punto 6).
12. **Formato de la Liga** (en Tenerife, dentro del Teide; autor, 2026-11-15).
13. **Nombres:** de los cubos de captura (ahora, por su color), del equipo enemigo (uno por
    variante), de las islas y sus lugares, de los personajes y de las criaturas. Claude los
    propone antes de la tanda 3.
14. **Kit por código.** El autor puntúa de 1 a 5 las piezas en `?catalogo` y en la isla; lo que
    no llegue a 4 lo rehace con Meshy. Están por llegar del autor las estatuas, las iniciales,
    el drago y las rocas del malpaís.
15. **Colores de Común, Acero y Oscuridad:** son casi grises y se distinguen poco. Se cambian
    solo si al autor le molesta; por ejemplo, Común hacia un beige cálido (`ARTE.md`).

## Online

16. **Servicio de tiempo real** para jugar con amigos. El autor creará una cuenta gratuita en el
    que se elija, en la fase online.

## Tareas del autor que no son decisiones

Lista viva (2026-11-13). Lo de arriba son decisiones; esto es trabajo suyo:

- **Gran Canaria (`ISLA-3.md`):** aprobar el recorrido y los niveles, y elegir su dinámica
  especial: la pintadera partida con un combate 2 contra 2 en el Roque Nublo (recomendada), un
  solo líder con dos sedes, y si se suma la agarrada de lucha canaria.
- **Quinta inicial (Tierra):** sus estadísticas, su lámina y su GLB, y su nombre.
- **Criaturas de Lanzarote:** subirlas a `conceptos/criaturas/lanzarote/`.
- **Criaturas:** decir si vale la lista 2 de Lanzarote (`CRIATURAS.md`); pasar las láminas de
  Lucha y las demás, y los nombres de la civeta y de Dragosil.
- **Entrenadores y zonas de captura de Lanzarote** que hay que mejorar: decir cuáles.
- **La historia (`HISTORIA.md`, borrador 3):** elegir en las tres decisiones del final:
  - la dinámica de Gran Canaria;
  - cuándo se descubre Chano;
  - si el señor que te vigila fue el elegido de hace cincuenta años.

  Y, cuando pueda, los nombres de los pueblos, de las ramas y del aparato, y los tipos de los
  gimnasios de Tenerife, La Gomera, La Palma y El Hierro.
- **Amigos:** sus fotos y GLB de Meshy para las personas jugables, y sus 2 o 3 poses para los
  retratos de diálogo.
- **Dani con `Idle`** en el GLB (opcional).
- **Puntuar de 1 a 5** lo último publicado: menús, equipo, mochila, medallero, el gimnasio de
  Roca y Fuerteventura entera (sobre todo el gimnasio de Aire).
- **Decir si vale «Técnicas»** como nombre del bolsillo de las máquinas.

- Medir los FPS en los ordenadores del autor y de sus amigos.
- Prueba de Meshy: pagar Pro el primer mes (~10 $), y descargar y subir `planta-2.glb`
  (`prompts-meshy.md`). Puede cambiar según el punto 5.
