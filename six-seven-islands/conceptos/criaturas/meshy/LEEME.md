# Criaturas del autor: imágenes 2D y modelos de Meshy

Aquí sube el autor lo que va generando, tal cual sale (autor, 2026-11-17):

- la imagen 2D (`.png` o `.jpg`) y el modelo (`.glb`) de cada criatura;
- con el nombre «PokN. Nombre», por ejemplo `Pok16. Civeta.png` y `Pok16. Civeta.glb`.

N es el número de la Pokédex de `PLAN-CRIATURAS.md` (columna «Pokédex»). No cambia nunca: está
fijado en `../pokedex.json`, que relaciona cada número con el id interno del juego. El nombre
puede cambiar (apodo → nombre de verdad): Claude busca por el número.

Esta carpeta no se publica. Claude copia cada criatura al juego, reducida y con su id interno, en
`public/modelos/criaturas/` (los nombres de archivo del autor no salen en la web).

**Ya están (2026-11-17):** las 1.ª formas de 4 iniciales, copiadas de `public/modelos/iniciales/`
con el nombre del autor: Pok1 (Cronti), Pok4 (inicial de Planta), Pok7 (inicial de Infernal) y
Pok10 (Armalito). El juego sigue usando las de `public/modelos/iniciales/`.
