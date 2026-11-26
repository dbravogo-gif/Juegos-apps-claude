# Criaturas del autor: imágenes 2D y modelos de Meshy

Desde el 2026-11-26, el autor solo pone la imagen y Claude hace el `.glb` con la API de Meshy
(`herramientas/criaturas/meshy.py`; el flujo, en `prompts-meshy.md`). `../meshy-tareas.json` guarda las
tareas de Meshy, para no pagar dos veces.

Aquí sube el autor lo que va generando, tal cual sale (autor, 2026-11-17):

- la imagen 2D (`.webp`, `.png` o `.jpg`, la que salga) y el modelo (`.glb`) de cada criatura;
- con el nombre «PokN. Nombre», por ejemplo `Pok16. Civeta.png` y `Pok16. Civeta.glb`.

N es el número de la Pokédex de `PLAN-CRIATURAS.md` (columna «Pokédex»). No cambia nunca: está
fijado en `../pokedex.json`, que relaciona cada número con el id interno del juego. El nombre
puede cambiar (apodo → nombre de verdad): Claude busca por el número.

Esta carpeta no se publica. Claude copia cada criatura al juego, reducida y con su id interno, en
`public/modelos/criaturas/` (los nombres de archivo del autor no salen en la web).

**Ya están (2026-11-17):** las 1.ª formas de 4 iniciales, copiadas de `public/modelos/iniciales/`
con el nombre del autor: Pok1 (Cronti), Pok4 (inicial de Planta), Pok7 (inicial de Infernal) y
Pok10 (Armalito). El juego sigue usando las de `public/modelos/iniciales/`.

**Subidas (2026-11-17):** Pok1, Pok4, Pok7 y Pok10 (iniciales), Pok16 a Pok24 y Pok131-132.
`python3 herramientas/criaturas/plan.py` lee esta carpeta: las que tienen modelo salen en verde en
el Excel y cuentan como hechas.
