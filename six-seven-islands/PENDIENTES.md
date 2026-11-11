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

## Islas y mundo

- **Personajes nuevos de Meshy** (pedido del autor, 2026-11-10), con su andar, y la
  personalización del protagonista: colores, peinados, ojos y sudadera o capa. Primero, una
  prueba (`public/modelos/personas/LEEME.md`).
- **El autor y sus amigos, dentro del juego** (autor, 2026-11-11; para más adelante).
  - 4 o 5 personajes repartidos por el mapa en sitios concretos.
  - Al hablar con ellos, su retrato aparece encima de la pantalla, en 2 o 3 poses según lo
    que dicen.
  - Falta: quiénes son, dónde está cada uno, y sus fotos o dibujos, con su permiso.
  - **Propuesta:** retratos con el estilo del juego hechos a partir de fotos, con tres poses:
    normal, contento y sorprendido. La caja de diálogo ya existe; solo le falta el retrato.
- **Largo de la isla 1** (2026-11-11). El autor dirá, viendo el mapa, si hace falta más.
- **Mapa dentro del juego** (2026-11-11). El dibujo ya existe (`?mapa`). Falta decidir con qué
  tecla se abre y qué enseña.
  - **Propuesta:** tecla M; las zonas sin visitar, en gris y con su nombre oculto.

11. **Tipo de cada gimnasio.**
    - Lanzarote es de Roca. Faltan Fuerteventura, Gran Canaria, Tenerife, La Gomera y La Palma.
    - El emblema del gimnasio de La Palma era un sol, del tipo Luz, que ya no existe.
    - **Frena:** dónde dar las criaturas que les hacen frente (punto 6).
12. **Formato de la Liga** (en El Hierro, la isla que reaparece).
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


- Medir los FPS en los ordenadores del autor y de sus amigos.
- Prueba de Meshy: pagar Pro el primer mes (~10 $), y descargar y subir `planta-2.glb`
  (`prompts-meshy.md`). Puede cambiar según el punto 5.
