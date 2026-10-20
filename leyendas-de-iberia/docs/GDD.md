# Leyendas de Iberia: documento de diseño (GDD)

Última actualización: 2026-10-20. Estado: fase 0 (diseño). Todavía no hay código.

Este documento recoge **qué** es el juego y **por qué**. El plan de la fase en curso está en
`PROTOTIPO.md`.

## 1. Resumen

Juego de criaturas por turnos al estilo Pokémon: explorar, capturar, entrenadores, gimnasios,
evoluciones y legendarios. Está ambientado en la historia de España desde 1492 hasta hoy. Las
criaturas salen de la mitología y la fauna ibérica. Los personajes históricos son entrenadores,
líderes de gimnasio, gente que te cruzas por el mapa y protagonistas de la trama. Es para el
autor y dos amigos, y se juega en el navegador del móvil y del PC.

## 2. Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Inspiración | De Pokémon y PokéRogue solo se toman las mecánicas. Nombres, diseños, sprites, música y textos son originales. |
| Criaturas | Salen de la mitología y la fauna ibérica: Trasgu, Cuélebre, Basajaun, Tarasca, lince, toro… |
| Legendarios | Unos pocos. Son seres mitológicos o animales célebres, como Babieca, el caballo del Cid. |
| Personajes históricos | **Nunca son capturables.** Son entrenadores, líderes de gimnasio, PNJ del mapa y parte de la trama. |
| Época | De 1492 a hoy. Incluye la Guerra Civil, el franquismo y personajes actuales. |
| La Antigüedad | Atapuerca, Numancia o Mérida aparecen como ruinas y zonas opcionales, no como capítulos (§4). |
| Guerra Civil | El protagonista combate en el bando sublevado. A los tres jugadores les parece bien. |
| Estructura | El mapa es España. Cada gimnasio es una época y una ciudad, en orden cronológico. |
| Diseño visual | Las criaturas débiles son sencillas; las fuertes y las evoluciones finales, elaboradas y épicas. |
| Estadísticas | Sistema propio y distinto del de Pokémon: pocas estadísticas, fáciles de leer, y la gracia en cómo interactúan. Cuál, está abierto (§3). |
| Multijugador | Asíncrono entre los tres y en una fase posterior. Desde el principio se diseña con semilla determinista y equipos serializables (§9). |
| Stack | Vite + TypeScript + Phaser. Build estático publicado en GitHub Pages (§10). |
| Contenido | Va como datos separados del motor, para añadir contenido sin tocar la lógica. |
| Guardado | Local en la primera fase. El backend, por ejemplo Supabase, llega con el multijugador. |
| Plataforma | Móvil primero: controles táctiles, teclado en PC y resolución adaptable. |
| Título | *Leyendas de Iberia* (provisional). Vive en la carpeta `leyendas-de-iberia/`. |

## 3. Decisiones abiertas

Hay que preguntar antes de diseñar sobre ellas.

1. **Sistema de estadísticas.** Hay tres propuestas en `PROTOTIPO.md`: A) Guardia, B) Aliento y
   C) Línea de tiempo. Se recomienda la A.
2. **Tipos.** Hay una tabla provisional de 5 tipos en `PROTOTIPO.md`. Los definitivos se
   deciden más adelante.
3. **Marco narrativo.** Propuesta en §5.
4. **Líderes de los capítulos 2 a 8 y miembros de la Liga.** Propuesta en §4.
5. **Personajes actuales:** quiénes salen y con qué reglas. Propuesta en §6.
6. **Phaser 3 o Phaser 4.** Ver §10.
7. **Nombres definitivos de las criaturas.** Los del prototipo son provisionales.

## 4. Épocas y gimnasios (propuesta)

Son ocho gimnasios y una Liga final. Entre un capítulo y el siguiente pasan de 50 a 80 años.

| # | Época | Ciudad | Líder (candidatos) | PNJ y trama |
| --- | --- | --- | --- | --- |
| 1 | Reyes Católicos (1491–1492) | Granada y Santa Fe | Boabdil | Isabel y Fernando, Colón, el Gran Capitán, Hernando de Talavera |
| 2 | Carlos V (1516–1556) | Toledo y Villalar | María Pacheco o Juan de Padilla (comuneros) | Carlos V |
| 3 | Felipe II (1556–1598) | Sevilla, puerto de Indias | Álvaro de Bazán | Cervantes (Lepanto), Teresa de Jesús, Felipe II; la Armada |
| 4 | Siglo de Oro barroco (1598–1700) | Madrid | Velázquez, Quevedo o Lope de Vega | Olivares, Calderón |
| 5 | Borbones e Ilustración (1700–1808) | Barcelona, Cádiz o Madrid | Blas de Lezo, Carlos III | Jorge Juan; Barcelona, 1714 |
| 6 | Independencia y siglo XIX (1808–1898) | Zaragoza | Agustina de Aragón | Goya, Palafox; los carlistas; el 98 |
| 7 | Edad de Plata, República y Guerra Civil (1898–1939) | Madrid | Un líder republicano, por decidir | Ramón y Cajal, Lorca, Clara Campoamor; el protagonista, en el bando sublevado (§6) |
| 8 | Franquismo (1939–1975) | Por decidir | Por decidir | Hay que decidir el enfoque: posguerra o desarrollismo (turismo, fútbol, copla) |
| Liga | Transición y democracia (1975–hoy) | Madrid | Cuatro rivales y un campeón, con personajes actuales | §6 |

- **Lo que queda apretado.** El XIX y el XX tienen un gimnasio cada uno. Si se quiere más
  peso ahí, se pueden juntar los capítulos 3 y 4.
- **El capítulo 6 ya está pensado.** La zona de Zaragoza en 1808, con Agustina, Goya, Palafox y
  el Dragón de San Jorge, se diseñó en el primer borrador y se reutiliza ahí.
- **La Antigüedad, como zonas opcionales.** Las ruinas existen en cualquier época:
  - Atapuerca: fósiles que se reviven como uro, mamut u oso de las cavernas.
  - Numancia: ánimas.
  - El teatro romano de Mérida.
  - Guaridas de legendarios.

  Dan más criaturas sin quitar peso a la historia.
- **Las criaturas no pertenecen a ninguna época**, porque son leyendas. Por eso Babieca puede
  salir aunque el juego empiece en 1492.

## 5. Marco narrativo (propuesta)

**Una saga familiar.** En 1491, en Santa Fe, frente a Granada, Hernando de Talavera, confesor
de la reina, pone en manos de un joven un *Bestiario*: el registro de criaturas, el equivalente
a la Pokédex. Cada capítulo lo protagoniza una generación posterior de la familia, que hereda el
Bestiario y el equipo. Las criaturas, como son leyendas, no envejecen.

- Explica de forma natural el salto entre épocas sin viajes en el tiempo.
- Explica también el protagonista de 1936: es el miembro de la familia de esa generación, en el
  bando sublevado.
- **Los rivales son los otros dos jugadores.** Cada amigo tiene su propia familia, que reaparece
  en cada época. En la fase multijugador, su equipo rival es el equipo real de ese amigo (§9).
- **El Bestiario crece con la saga.** En el capítulo 6, Goya lo ilustra, enlazando con sus
  *Caprichos* («El sueño de la razón produce monstruos»).
- **Los gimnasios son pruebas, no enemigos.** El líder puede ser de cualquier bando. Por
  ejemplo, Boabdil acepta un último duelo de leyendas antes de entregar las llaves de Granada.

La alternativa sería un viaje en el tiempo. Se descarta como opción principal porque obliga a
justificar cada salto y hace que el protagonista elija bando como viajero, lo que encaja peor
con la Guerra Civil.

## 6. Personajes reales y tono

- **Papel.** Son entrenadores, líderes, PNJ y trama. Nunca son criaturas.
- **Tono.** Desenfadado, con guiños históricos reales. Los hechos y las fechas son correctos;
  lo fantástico son las criaturas. Cada líder lleva una ficha con un dato real que el juego
  puede contar.
- **Guerra Civil.** El protagonista combate en el bando sublevado, y el líder y los rivales del
  capítulo son republicanos. Se cuenta como la campaña de un bando, igual que en un juego de
  estrategia. La represión de cualquiera de los dos bandos no se convierte en mecánica ni en
  chiste.
- **Personas vivas** (propuesta de reglas):
  - Solo figuras públicas y en su papel público.
  - Retratos dibujados, nunca fotos.
  - Caricatura amable, sin atribuirles delitos ni hechos inventados.
- **Ojo: el sitio es público.** GitHub Pages lo puede abrir cualquiera que tenga el enlace. Con
  personajes vivos y la Guerra Civil, conviene que la página lleve `noindex`, para que no salga
  en buscadores, y no difundir el enlace fuera del grupo. Si algún día se quiere publicar de
  verdad, habría que revisar los derechos de imagen.

## 7. Criaturas

- **Origen.** Seres de la mitología ibérica (gallega, asturiana, cántabra, vasca, aragonesa,
  catalana, andaluza, canaria…) y fauna ibérica, la actual y la desaparecida.
- **Evoluciones: de la fauna al mito** (propuesta). Muchas líneas empiezan como un animal
  corriente y terminan en el ser mitológico asociado: osezno → oso pardo → Basajaun, o
  culebra → … → Cuélebre. Encaja con el principio de que lo débil es sencillo y lo final, épico.
- **Diseño visual por niveles.** El primer estadio tiene silueta simple y pocos colores; el
  intermedio añade rasgos; el final es grande y detallado, con efectos.
- **Legendarios** (ideas):
  - Seres mitológicos: Mari, Cuélebre, Guayota.
  - Animales célebres: Babieca, Rocinante, Platero, Islero o Copito de Nieve.
  - Toros de Guisando (de piedra).
  - **Evitar el toro de Osborne**, porque es una marca registrada.
- **Ficha de cada criatura:** tipo, estadísticas base, movimientos por nivel, evolución, rareza
  y un texto del Bestiario con un dato real de folclore o de biología.

## 8. Mecánicas

- **Exploración.** Mapa por casillas. Las zonas de encuentros son la hierba alta: carrizal,
  monte bajo o mieses. Hay PNJ, tiendas y **mesones**, que curan al equipo.
- **Combate.** Uno contra uno y por turnos. Equipo de hasta 6 criaturas, con cambios, objetos y
  huida de los combates salvajes. Cada criatura tiene 4 movimientos, que caben bien como cuatro
  botones en el móvil. El sistema de estadísticas está pendiente (§3).
- **Aleatoriedad mínima y visible** (propuesta). Sin tirada de daño: el mismo golpe hace siempre
  lo mismo. El azar queda para la captura, algunos efectos y los desempates. Así el combate se
  lee mejor, la IA es más sencilla y el reto diario es más justo.
- **Tipos.** Tabla provisional en `PROTOTIPO.md`.
- **Captura con téseras.** Las téseras de hospitalidad eran pactos celtíberos de bronce, muchas
  con forma de animal. Aquí, lanzar una tésera es sellar un pacto con la criatura.
- **Progresión.** Experiencia, niveles y aprender movimientos. En el prototipo se evoluciona por
  nivel; otras condiciones vendrán después.
- **Temperamento** (propuesta). Cada ejemplar tiene uno, que da +10 % en una estadística. Da
  variedad entre ejemplares sin IV ni EV.
- **Moneda.** Cambia de nombre con la época (maravedí, ducado, real, peseta, euro), pero por
  dentro es la misma. Es solo un detalle de ambientación.
- **Insignias de gimnasio: blasones.**

## 9. Multijugador asíncrono (fase posterior)

- **Reto diario.** Es un modo aparte del modo historia, de tipo *roguelite* como PokéRogue. Usa
  como semilla la fecha, así que los tres juegan la misma secuencia de combates y capturas, y
  hay puntuación y ranking. Reutiliza el motor y el contenido, pero no la partida principal.
- **Ranking verificable.** No se envía la puntuación, sino la semilla y la lista de acciones.
  Cualquiera puede volver a simularlas y comprobar el resultado.
- **Combate contra el equipo de un amigo**, que controla la IA.
- **Plan escalonado:**
  1. Códigos de equipo para copiar y pegar, por ejemplo por WhatsApp. No hace falta backend.
  2. Supabase, para los rankings y los equipos publicados.
- **Requisitos que se cumplen ya desde el prototipo:**
  - El generador aleatorio tiene semilla y su estado viaja dentro del estado del juego.
  - El combate es una función pura: (estado, acción) → estado.
  - Equipos, partidas y combates se serializan a JSON.
  - Cada código lleva la versión de los datos.

## 10. Técnica

- **Stack.** Vite + TypeScript + Phaser, con Vitest para las pruebas.
- **Phaser 3 o 4.** La última versión de Phaser 3 es la 3.90, de mayo de 2025. Phaser 4 es
  estable desde abril de 2026 y va por la 4.2.1 (julio de 2026). Se recomienda Phaser 4, porque
  Phaser 3 ya no recibe versiones. *Inferencia por confirmar:* la API de escenas y objetos es en
  lo esencial la de Phaser 3.
- **Capas.**
  - `src/core`: motor puro, sin Phaser ni DOM. Es determinista y tiene pruebas.
  - `src/data`: el contenido, en TypeScript tipado. Se prefiere a JSON porque comprueba los
    errores al compilar.
  - `src/escenas` y `src/ui`: Phaser.
  - Los mapas se hacen con Tiled y se guardan en JSON.
- **Guardado.** En `localStorage`, con número de versión y migraciones. Además se puede exportar
  e importar la partida como texto, que sirve de copia de seguridad.
- **Móvil.**
  - Resolución lógica fija con píxeles nítidos, escalada a la pantalla.
  - En vertical, la pantalla va arriba y el mando abajo, como en una Game Boy.
  - En PC, teclado y sin mando en pantalla.
- **Arte provisional.** Cada sprite se busca por el id de la criatura. Si no hay imagen, se
  genera una provisional con el color del tipo. Para sustituirlo basta con añadir el PNG con
  ese nombre.
- **Publicación.** Se añade al workflow de Pages del repositorio, en
  `…/Juegos-apps-claude/leyendas-de-iberia/`.

## 11. Fases

| Fase | Contenido | Termina en |
| --- | --- | --- |
| 0 | Diseño: este documento y `PROTOTIPO.md` | Visto bueno del plan |
| 1 | Prototipo: Granada, 1492 | Una zona jugable de principio a fin, con gimnasio |
| 2 | El capítulo 1 completo: evoluciones de los iniciales, más criaturas, arte definitivo de las primeras | Primer gimnasio pulido |
| 3 | Multijugador sin backend: códigos de equipo y reto diario local | Combates contra los equipos de los amigos |
| 4 | Backend: rankings y equipos compartidos | Reto diario con ranking |
| 5+ | Un capítulo por fase | Un gimnasio más por fase |

## 12. Registro de cambios

- **2026-10-20.** Primera versión.
  - Pregunta 1 cerrada: las criaturas salen de la mitología y la fauna, y los legendarios son
    seres míticos o animales célebres.
  - Época: de 1492 a hoy.
    - Prehistoria → hoy era demasiado amplio.
    - 1808 → hoy obligaba a rellenar con épocas poco conocidas y visualmente parecidas.
    - La Antigüedad queda como zonas opcionales.
  - Guerra Civil desde el bando sublevado; se incluyen personajes actuales.
  - Título provisional: *Leyendas de Iberia*.
