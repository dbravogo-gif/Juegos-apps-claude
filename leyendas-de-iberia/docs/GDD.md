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
| Personajes históricos | **Nunca son capturables.** Son entrenadores, líderes de gimnasio, PNJ del mapa y parte de la trama. Tienen prioridad los reyes, los generales y los guerreros; algún artista sí, pero pocos. |
| Mentores | Isabel la Católica en el capítulo 1 y un segundo mentor en el capítulo 4 o 5. Se propone Carlos III (§5). Se eligen por su peso histórico, no por su relación con los animales. |
| Canarias | El capítulo 5 transcurre entero en Canarias: el Teide con Guayota, una zona de buceo y la invasión de Nelson. La torre de combates del final del juego también está allí (§4). |
| Almacén de criaturas | Existe desde el minuto 1: las criaturas que no caben en el equipo se guardan en el Bestiario (§8). |
| Época | De 1492 a hoy. Incluye la Guerra Civil, el franquismo y personajes actuales. |
| Antes de 1492 | No hay capítulos. Atapuerca, Numancia o Mérida son ruinas y zonas opcionales. Los héroes anteriores, como el Cid, aparecen como ánimas que hacen de jefes opcionales (§4). |
| Fósiles | Hay dinosaurios, dientes de sable y fauna prehistórica, como en Pokémon. Te dan el fósil y se descubre en el laboratorio del Dr. Jangel (§7). |
| Guerra Civil | El protagonista combate en el bando sublevado. A los tres jugadores les parece bien. |
| Estructura | El mapa es España. Cada gimnasio es una época y una ciudad, en orden cronológico. |
| Diseño visual | Las criaturas débiles son sencillas; las fuertes y las evoluciones finales, elaboradas y épicas. |
| Tipos | 12 provisionales: Agua, Tierra, Eléctrico, Planta, Hielo, Plasma, Mental, Luz, Oscuridad, Acero, Infernal y Mitológico. Puede haber tipo doble. Las relaciones están por decidir (§8). |
| Estadísticas | Funcionan como en Pokémon, pero con nombres propios: Vida, Fuerza, Escudo, Magia, Resistencia mágica y Celeridad (§8 y `PROTOTIPO.md`). |
| Multijugador | Asíncrono entre los tres y en una fase posterior. Desde el principio se diseña con semilla determinista y equipos serializables (§9). |
| Stack | Vite + TypeScript + Phaser. Build estático publicado en GitHub Pages (§10). |
| Contenido | Va como datos separados del motor, para añadir contenido sin tocar la lógica. |
| Guardado | Local en la primera fase. El backend, por ejemplo Supabase, llega con el multijugador. |
| Plataforma | Móvil primero: controles táctiles, teclado en PC y resolución adaptable. |
| Título | *Leyendas de Iberia* (provisional). Vive en la carpeta `leyendas-de-iberia/`. |

## 3. Decisiones abiertas

Hay que preguntar antes de diseñar sobre ellas.

1. **Tipos.** Faltan las relaciones entre los 12 tipos y decidir si se ajusta la lista: falta
   Fuego, falta Aire y Mitológico es ambiguo. Ideas en §8.
2. **Marco narrativo y segundo mentor** (se propone Carlos III). Propuesta en §5.
3. **Líderes de los capítulos 2 a 8 y miembros de la Liga.** Propuesta en §4.
4. **El Dr. Jangel:** quién es y en qué capítulo abre el laboratorio. Propuesta en §7.
5. **Personajes actuales:** quiénes salen y con qué reglas. Propuesta en §6.
6. **Phaser 3 o Phaser 4.** Ver §10.
7. **Nombres definitivos de las criaturas.** Los del prototipo son provisionales.

## 4. Épocas y gimnasios (propuesta)

Son ocho gimnasios y una Liga final. Entre un capítulo y el siguiente pasan de 50 a 80 años.
Los líderes son sobre todo reyes y generales; los artistas salen como PNJ.

| # | Época | Ciudad | Líder (candidatos) | PNJ y trama |
| --- | --- | --- | --- | --- |
| 1 | Reyes Católicos (1491–1492) | Granada y Santa Fe | Boabdil | **Isabel la Católica (mentora)**, Fernando, el Gran Capitán, Colón |
| 2 | Carlos V (1516–1556) | Toledo y Villalar | Carlos V | Los comuneros Juan de Padilla y María Pacheco; Hernán Cortés |
| 3 | Felipe II (1556–1598) | El Escorial y Sevilla | Don Juan de Austria (Lepanto) | Felipe II, Álvaro de Bazán, el duque de Alba; Cervantes, soldado en Lepanto |
| 4 | Los Austrias menores (1598–1700) | Madrid | Ambrosio Spínola (Breda) | Felipe IV, Olivares; los tercios; Velázquez |
| 5 | Borbones: **Canarias** (1700–1808) | Tenerife, El Hierro y La Gomera, con un prólogo en Madrid y Cádiz | El general Gutiérrez, que rechazó a Nelson en 1797 | **Carlos III (mentor)** y Jorge Juan, en el prólogo; Nelson, como antagonista; las ánimas de los menceyes |
| 6 | Independencia y siglo XIX (1808–1898) | Zaragoza | Agustina de Aragón | Palafox, Castaños (Bailén), el Empecinado, Prim; Goya |
| 7 | Restauración, República y Guerra Civil (1898–1939) | Las Palmas y Madrid | Un general republicano (Miaja o Vicente Rojo) | Alfonso XIII. La guerra puede empezar en Las Palmas, de donde salió Franco el 18 de julio de 1936. El protagonista, en el bando sublevado (§6) |
| 8 | Franquismo (1939–1975) | Por decidir | Por decidir (Franco, Carrero Blanco…) | Hay que decidir el enfoque: posguerra o desarrollismo. Félix Rodríguez de la Fuente, como personaje |
| Liga | Transición y democracia (1975–hoy) | Madrid | Cuatro rivales y un campeón: reyes, presidentes, Gutiérrez Mellado… | §6 |

- **Lo que queda apretado.** El XIX y el XX tienen un gimnasio cada uno. Si se quiere más
  peso ahí, se pueden juntar los capítulos 3 y 4.
- **Saltos de tiempo dentro de un capítulo.** Un capítulo puede abarcar varias décadas de su
  época, con saltos de tiempo, y cada hecho conserva su fecha real. Así caben en la misma
  generación Jorge Juan, que murió en 1773, y el ataque de Nelson, en 1797.
- **El capítulo 5 transcurre en Canarias** (los detalles son propuesta):
  - **Prólogo en Madrid y Cádiz.** Carlos III renueva el encargo. Jorge Juan, el marino, que
    dirigió en Cádiz la academia de guardias marinas, te enseña a navegar y te lleva a las islas.
  - **El Teide y la Cueva del Viento: montaña y cueva.**
    - Guayota, el demonio guanche encerrado en el volcán, es el legendario.
    - Sus perros demoníacos, los tibicenas, salen como criaturas.
    - Las ánimas de los menceyes, como Bencomo, hacen de jefes opcionales.
    - La Cueva del Viento, en Icod de los Vinos, es uno de los tubos volcánicos más largos del
      mundo.
  - **Zona de buceo.** Es una mecánica nueva: se explora el fondo del mar, con criaturas propias
    y pecios. Se propone el Mar de las Calmas, en El Hierro, que es reserva marina. Falta decidir
    cómo se consigue la capacidad de bucear.
  - **La invasión de Nelson (1797).** Es el clímax del capítulo:
    - Una secuencia de combates en la defensa de Santa Cruz y, después, el gimnasio del general
      Antonio Gutiérrez.
    - Nelson perdió allí el brazo derecho.
    - Se conserva el cañón Tigre, al que la tradición atribuye el disparo.
  - **La torre de combates, en La Gomera.** Está en la Torre del Conde, del siglo XV, en la isla
    donde Colón hizo escala en 1492. Se descubre en este capítulo y se abre del todo al final del
    juego. Allí se combate contra los equipos de los amigos y se juega el reto diario (§9).
  - **Más ideas:**
    - La Luz de Mafasca, de Fuerteventura, como ánima.
    - Fósiles canarios para el Dr. Jangel: la tortuga gigante y el lagarto gigante de
      Tenerife.
- **El capítulo 6 ya está pensado.** La zona de Zaragoza en 1808, con Agustina, Goya, Palafox y
  el Dragón de San Jorge, se diseñó en el primer borrador y se reutiliza ahí.
- **Antes de 1492, como zonas opcionales.** Las ruinas existen en cualquier época:
  - Atapuerca.
  - Numancia.
  - El teatro romano de Mérida.
  - Guaridas de legendarios.

  Allí aparecen **ánimas de héroes anteriores a 1492**, que hacen de jefes opcionales. El
  principal es **el Cid**, en Burgos, con Babieca como legendario: la leyenda dice que ganó una
  batalla después de muerto, montado en su caballo. Otros candidatos son Don Pelayo en
  Covadonga y Viriato. Estas zonas dan más contenido sin quitar peso a la historia.
- **Las criaturas no pertenecen a ninguna época**, porque son leyendas. Por eso Babieca puede
  salir aunque el juego empiece en 1492.

## 5. Marco narrativo (propuesta)

**Una saga familiar.** En 1491, en Santa Fe, frente a Granada, **Isabel la Católica** encarga a
un joven un *Bestiario*: registrar las leyendas de sus reinos. Es el registro de criaturas, el
equivalente a la Pokédex, y además la reina le da su primera criatura. Cada capítulo lo
protagoniza una generación posterior de la familia, que hereda el Bestiario y el equipo. Las
criaturas, como son leyendas, no envejecen. Desde el primer momento, las que no caben en el
equipo se guardan en las páginas del Bestiario (§8).

- Explica de forma natural el salto entre épocas sin viajes en el tiempo.
- Explica también el protagonista de 1936: es el miembro de la familia de esa generación, en el
  bando sublevado.
- **Los rivales son los otros dos jugadores.** Cada amigo tiene su propia familia, que reaparece
  en cada época. En la fase multijugador, su equipo rival es el equipo real de ese amigo (§9).
- **El Bestiario crece con la saga.** En el capítulo 6, Goya lo ilustra, enlazando con sus
  *Caprichos* («El sueño de la razón produce monstruos»).

**Carlos III es el segundo mentor**, en el prólogo del capítulo 5 (propuesta). Es el gran rey
reformista de la Ilustración: renueva el encargo de Isabel y guía la segunda mitad del juego. La
alternativa sería que el mentor fuera Jorge Juan, en lugar de salir como personaje.
- **Los gimnasios son pruebas, no enemigos.** El líder puede ser de cualquier bando. Por
  ejemplo, Boabdil acepta un último duelo de leyendas antes de entregar las llaves de Granada.

La alternativa sería un viaje en el tiempo. Se descarta como opción principal porque obliga a
justificar cada salto y hace que el protagonista elija bando como viajero, lo que encaja peor
con la Guerra Civil.

## 6. Personajes reales y tono

- **Papel.** Son entrenadores, líderes, PNJ y trama. Nunca son criaturas.
- **A quién elegir.** Primero reyes, generales y guerreros. Los escritores y pintores salen de
  vez en cuando, mejor si además fueron soldados, como Cervantes.
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

### Fósiles y el laboratorio del Dr. Jangel

- **Mecánica.** Durante la historia te regalan fósiles, y también hay alguno en las zonas
  opcionales. Un fósil no sirve hasta que lo llevas al laboratorio del **Dr. Jangel**, que lo
  «descubre»: lo identifica y lo revive como criatura.
- **El Dr. Jangel** (propuesta). Es el único personaje inventado que se repite en todas las
  épocas, con la ropa de cada una: alquimista en el XVI, naturalista en el XVIII y paleontólogo
  en el XX. Nadie explica por qué no envejece, y es un chiste recurrente.
- **Cuándo** (propuesta). El primer fósil te lo dan en el capítulo 1, porque en la provincia de
  Granada están Orce y Padul. El laboratorio abre en el capítulo 2. Así hay un pequeño misterio
  pendiente desde el principio.
- **Fósiles basados en hallazgos reales de España:**

| Fósil | Criatura | Yacimiento real |
| --- | --- | --- |
| Colmillo de sable | Felino con dientes de sable (*Machairodus*, *Homotherium*) | Cerro de los Batallones (Madrid), Orce (Granada) |
| Hiena gigante | *Pachycrocuta* | Orce (Granada) |
| Defensa de mamut | Mamut | Padul (Granada) |
| Joroba de «Pepito» | *Concavenator*, terópodo con joroba | Las Hoyas (Cuenca) |
| Mandíbula dentada | *Pelecanimimus*, con más de 200 dientes | Las Hoyas (Cuenca) |
| Vértebra gigante | *Turiasaurus*, el mayor dinosaurio de Europa | Riodeva (Teruel) |
| Hueso de Galve | *Aragosaurus*, el primer dinosaurio con nombre español | Galve (Teruel) |
| Ala primitiva | *Iberomesornis*, ave del Cretácico | Las Hoyas (Cuenca) |

- **Su tipo** se decide cuando esté cerrada la tabla de tipos.

## 8. Mecánicas

- **Exploración.** Mapa por casillas. Las zonas de encuentros son la hierba alta: carrizal,
  monte bajo o mieses. Hay PNJ, tiendas y **mesones**, que curan al equipo.
- **Combate.** Uno contra uno y por turnos. Equipo de hasta 6 criaturas, con cambios, objetos y
  huida de los combates salvajes. Cada criatura tiene 4 movimientos, que caben bien como cuatro
  botones en el móvil.
- **Estadísticas.** Funcionan como en Pokémon, con nombres propios:

  | Estadística | En Pokémon |
  | --- | --- |
  | Vida | PS |
  | Fuerza | Ataque |
  | Escudo | Defensa |
  | Magia | Ataque especial |
  | Resistencia mágica | Defensa especial |
  | Celeridad | Velocidad |

  Cada movimiento es físico, mágico o de estado. Las fórmulas están en `PROTOTIPO.md`.
- **Almacén de criaturas, desde el minuto 1.** Las que no caben en el equipo de 6 viven en las
  páginas del Bestiario y se cambian en cualquier mesón. Es el equivalente a las cajas del PC de
  Pokémon.
- **Aleatoriedad.** Como en Pokémon: tirada de daño, golpes críticos, precisión y captura. Todo
  sale del generador con semilla, así que una partida se puede reproducir y el reto diario
  sigue siendo justo.
- **Tipos (12, provisionales):** Agua, Tierra, Eléctrico, Planta, Hielo, Plasma, Mental, Luz,
  Oscuridad, Acero, Infernal y Mitológico.
  - Los multiplicadores son los de Pokémon: ×2, ×0,5 y quizá inmunidad (×0).
  - Una criatura puede tener uno o dos tipos.
  - Las relaciones entre tipos están por decidir.
- **Dudas sobre la lista:**
  - **No hay Fuego.** ¿Lo cubre Plasma? Si es así, propongo llamarlo Fuego: Plasma y Eléctrico
    se confunden (un rayo es plasma), y Plasma suena a ciencia ficción en un juego histórico.
  - **No hay Aire ni Volador.** Las aves, las libélulas o el Nuberu, el genio de las tormentas,
    se quedan sin un tipo claro.
  - **Mitológico choca con que casi todas las criaturas son mitológicas.** Propongo reservarlo a
    los grandes seres de leyenda (dragones, cuélebres, gigantes) o llamarlo de otra forma, por
    ejemplo Ancestral.
  - **La fauna corriente (topillo, lince, toro) no tiene tipo propio.** Iría a Tierra, que
    crecería mucho.
- **Ideas para las relaciones.** Cada línea indica contra qué es eficaz un tipo:
  - **Agua:** contra Tierra y Plasma. También contra Infernal, por el agua bendita.
  - **Tierra:** contra Plasma, porque lo sofoca, y contra Eléctrico, por la toma de tierra.
    Contra Eléctrico podría ser incluso inmunidad.
  - **Eléctrico:** contra Agua, y contra Acero porque el rayo busca el hierro.
  - **Planta:** contra Agua y Tierra.
  - **Hielo:** contra Planta, porque las heladas arruinan la cosecha.
  - **Plasma:** contra Planta, Hielo y Acero, porque lo funde.
  - **Acero:** contra Hielo, y contra Mitológico porque en el folclore el hierro ahuyenta a
    duendes y seres mágicos.
  - **Luz:** contra Oscuridad e Infernal. Luz y Oscuridad podrían ser eficaces la una contra la
    otra.
  - **Oscuridad:** contra Mental, porque el miedo nubla la mente.
  - **Infernal:** contra Mental, por la posesión.
  - **Mental:** contra Mitológico, porque la astucia vence a los gigantes, como en las leyendas
    del Tartalo.
  - **Mitológico:** contra Mitológico, como en los duelos de dragones.
- **Captura con téseras.** Las téseras de hospitalidad eran pactos celtíberos de bronce, muchas
  con forma de animal. Aquí, lanzar una tésera es sellar un pacto con la criatura.
- **Progresión.** Experiencia, niveles y aprender movimientos. En el prototipo se evoluciona por
  nivel; otras condiciones vendrán después.
- **Temperamento.** Equivale a la naturaleza de Pokémon: +10 % en una estadística y −10 % en
  otra, con nombres propios.
- **Valía (de 1 a 14).** Es la versión simplificada de los IV y los EV de Pokémon: un solo
  número que dice lo buena que es la criatura.
  - Se decide al capturarla y no cambia.
  - Lo normal es tener entre 6 y 9; los valores altos son raros.
  - Mejora todas las estadísticas por igual.
  - Se ve en la ficha, por ejemplo «Valía 11/14».
  - Detalle en `PROTOTIPO.md` §3.
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
- **Dónde se juega** (propuesta). En el mundo del juego, los dos modos están en la torre de
  combates de La Gomera (§4).
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
  - Confirmado el periodo 1492 → hoy.
  - Mentores: Isabel la Católica y Felipe II.
  - Prioridad a reyes y generales sobre los artistas.
  - El Cid y otros héroes anteriores a 1492 salen como ánimas en zonas opcionales.
  - Fósiles con el laboratorio del Dr. Jangel.
  - El segundo mentor pasa a un capítulo posterior: se propone Carlos III, en el capítulo 5.
    Felipe II y Félix Rodríguez de la Fuente salen como personajes, no como mentores.
  - El almacén de criaturas existe desde el minuto 1, en el Bestiario.
  - Canarias: gimnasio del capítulo 5 en Tenerife (1797), torre de combates en La Gomera y el
    Teide como zona opcional.
  - Jorge Juan, como personaje del capítulo 5.
  - Menos peso a los animales en la historia.
  - Estadísticas como en Pokémon, con nombres propios: Vida, Fuerza, Escudo, Magia, Resistencia
    mágica y Celeridad. Se descartan los sistemas Guardia, Aliento y Línea de tiempo.
  - El capítulo 5 pasa a transcurrir entero en Canarias: Teide y Guayota, buceo y Nelson. Sin
    San Borondón.
  - Valía de 1 a 14 en lugar de IV y EV.
  - Tipos: Agua, Tierra, Eléctrico, Planta, Hielo, Plasma, Mental, Luz, Oscuridad, Acero,
    Infernal y Mitológico. Se descarta la tabla de 5 tipos del primer borrador. Hay tipo doble.
