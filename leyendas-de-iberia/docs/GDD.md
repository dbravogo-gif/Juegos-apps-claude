# Leyendas de Iberia: documento de diseño (GDD)

Última actualización: 2026-10-24. Estado: fase 1 (prototipo jugable del capítulo 1).

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
| Inspiración | De Pokémon y PokéRogue solo se toman las mecánicas. Nombres, diseños, sprites, música y textos son originales. **Excepción:** la mayoría de los objetos se llaman como en el género (Poción, Revivir, Repelente…), por decisión del autor (2026-10-24). |
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
| Tipos | 15: Común, Agua, Tierra, Planta, Aire, Eléctrico, Hielo, Infernal (es el fuego), Plasma, Mental, Luz, Oscuridad, Espectral, Acero y Ancestral. Puede haber tipo doble. Las relaciones están en §8. |
| Estadísticas | Funcionan como en Pokémon, pero con nombres propios: Vida, Fuerza, Escudo, Magia, Resistencia mágica y Celeridad (§8 y `PROTOTIPO.md`). |
| Multijugador | Asíncrono entre los tres y en una fase posterior. Desde el principio se diseña con semilla determinista y equipos serializables (§9). |
| Stack | Vite + TypeScript + Phaser. Build estático publicado en GitHub Pages (§10). |
| Contenido | Va como datos separados del motor, para añadir contenido sin tocar la lógica. |
| Guardado | Local en la primera fase. El backend, por ejemplo Supabase, llega con el multijugador. |
| Plataforma | Móvil primero: controles táctiles, teclado en PC y resolución adaptable. |
| Título | *Leyendas de Iberia* (provisional). Vive en la carpeta `leyendas-de-iberia/`. |
| MT y MO | Las MT las dan los líderes o están en el suelo. Solo hay dos MO, Pleamar (el Surf del género) y Vuelo, y las dan personajes importantes en capítulos distintos: Pleamar, Olivares en el capítulo 4; Vuelo, en el 5. Pleamar solo lo aprenden criaturas acuáticas (decisiones del autor, 2026-10-26). |
| Vuelo | Lleva a cualquier lugar visitado, de cualquier época, aunque allí sigan los personajes de entonces (decisión del autor, 2026-10-26). |

## 3. Decisiones abiertas

Hay que preguntar antes de diseñar sobre ellas.

1. **Segundo mentor** (se propone Carlos III). Propuesta en §5. El protagonista ya está
   decidido: es siempre el mismo.
2. **Líderes de los capítulos 2 a 8 y miembros de la Liga.** Propuesta en §4.
3. **El Dr. Jangel:** quién es y en qué capítulo abre el laboratorio. Propuesta en §7.
4. **Personajes actuales:** quiénes salen y con qué reglas. Propuesta en §6.
5. **Phaser 3 o Phaser 4.** Ver §10.
6. **Bestiario.** La propuesta de 150 especies está en `BESTIARIO.md` (v2, con la revisión de
   variedad que pidió el autor). Falta su visto bueno a las decisiones del final del archivo.
7. **Quién da Vuelo y dónde va cada legendario.** Propuesta en §8 («MT, MO y legendarios»).

## 4. Épocas y gimnasios (propuesta)

Son ocho gimnasios y una Liga final. Entre un capítulo y el siguiente pasan de 50 a 80 años.
Los líderes son sobre todo reyes y generales; los artistas salen como PNJ.

| # | Época | Ciudad | Líder (candidatos) | PNJ y trama |
| --- | --- | --- | --- | --- |
| 1 | Reyes Católicos (1491–1492) | Granada y Santa Fe | Boabdil | **Isabel la Católica (mentora)**, Fernando, el Gran Capitán, Colón |
| 2 | Carlos V (1516–1556) | Villalar y Toledo, 1521 | **María Pacheco** (hecho) | Juan de Padilla; Carlos V, ausente, como el poder contra el que se alzan |
| 3 | Felipe II (1556–1598) | El Escorial y Sevilla | Don Juan de Austria (Lepanto) | Felipe II, Álvaro de Bazán, el duque de Alba; Cervantes, soldado en Lepanto |
| 4 | Los Austrias menores (1598–1700) | Madrid | Ambrosio Spínola (Breda) | Felipe IV, Olivares; los tercios; Velázquez |
| 5 | Borbones: **Canarias** (1700–1808) | Tenerife, El Hierro y La Gomera, con un prólogo en Madrid y Cádiz | El general Gutiérrez, que rechazó a Nelson en 1797 | **Carlos III (mentor)** y Jorge Juan, en el prólogo; Nelson, como antagonista; las ánimas de los menceyes |
| 6 | Independencia y siglo XIX (1808–1898) | Zaragoza | Agustina de Aragón | Palafox, Castaños (Bailén), el Empecinado, Prim; Goya |
| 7 | Restauración, República y Guerra Civil (1898–1939) | Las Palmas y Madrid | Un general republicano (Miaja o Vicente Rojo) | Alfonso XIII. La guerra puede empezar en Las Palmas, de donde salió Franco el 18 de julio de 1936. El protagonista, en el bando sublevado (§6) |
| 8 | Franquismo (1939–1975) | Asturias (propuesta del Bestiario) | Por decidir (Franco, Carrero Blanco…) | Hay que decidir el enfoque: posguerra o desarrollismo. Félix Rodríguez de la Fuente, como personaje |
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

**El protagonista es siempre el mismo** (decisión del autor, 2026-10-25; se descarta la saga
familiar). En 1491, en Santa Fe, frente a Granada, **Isabel la Católica** le encarga un
*Bestiario*: registrar las leyendas de sus reinos. Es el registro de criaturas, el equivalente a la
Pokédex, y además la reina le da su primera criatura. Entre un capítulo y el siguiente pasan
décadas, pero ni las criaturas ni quien escribe el Bestiario envejecen: el juego lo dice de pasada
y no lo explica, como en el género. Desde el primer momento, las criaturas que no caben en el
equipo se guardan en las páginas del Bestiario (§8).

- **Los rivales son los otros dos jugadores**, que reaparecen en cada época. En la fase
  multijugador, su equipo rival es el equipo real de ese amigo (§9). Hecho en un jugador
  (2026-10-26): son dos amigos del protagonista, que entran con él en el pabellón de Isabel; el
  jugador les pone nombre y se quedan con las otras dos iniciales (el primero, con la que gana a
  la tuya). Los textos no les dan género. Antes de ponerles nombre, el juego cuenta quiénes son:
  los tres se criaron en el campamento real, siguiendo al ejército de asedio en asedio; uno es
  de familia de arrieros y nunca te ha dejado ganar sin pelear, y el otro, hijo de la herbolaria
  del campamento, lo apunta todo en un cuaderno. Combates: Santa Fe y la Vega (capítulo 1), el
  camino de Toledo y Toledo (capítulo 2).
- **El Bestiario crece con la historia.** En el capítulo 6, Goya lo ilustra, enlazando con sus
  *Caprichos* («El sueño de la razón produce monstruos»).
- En el capítulo 7, el protagonista combate en el bando sublevado (§6).

**Carlos III es el segundo mentor**, en el prólogo del capítulo 5 (propuesta). Es el gran rey
reformista de la Ilustración: renueva el encargo de Isabel y guía la segunda mitad del juego. La
alternativa sería que el mentor fuera Jorge Juan, en lugar de salir como personaje.
- **Los gimnasios son pruebas, no enemigos.** El líder puede ser de cualquier bando. Por
  ejemplo, Boabdil acepta un último duelo de leyendas antes de entregar las llaves de Granada.

Se descarta el viaje en el tiempo: obliga a justificar cada salto.

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
- **Legendarios** (propuesta en `BESTIARIO.md`):
  - Seres mitológicos, con 580–600 de total: Mari, Cuélebre, Guayota, Nuberu, Tarasca y Alcorax
    (el Dragón de San Jorge).
  - Animales célebres, con 540–570: Babieca, Rocinante, Platero, Copito de Nieve y el Ratón
    Pérez. Islero queda fuera.
  - Los Toros de Guisando pasan a ser una criatura rara, Guisandor.
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
| Colmillo de cimitarra | Orcegar: *Homotherium latidens* | Venta Micena, Orce (Granada) |
| Colmillo de sable | Machairón: *Machairodus aphanistus* | Cerro de los Batallones (Madrid) |
| Hiena gigante | Hienarca: *Pachycrocuta brevirostris* | Venta Micena, Orce (Granada) |
| Defensa de mamut | Padulonte: mamut | Padul (Granada) |
| Joroba de «Pepito» | Concavex: *Concavenator*, terópodo con joroba | Las Hoyas (Cuenca) |
| Mandíbula dentada | Pelicanox: *Pelecanimimus*, con más de 200 dientes | Las Hoyas (Cuenca) |
| Ala primitiva | Iberomés: *Iberomesornis*, ave del Cretácico | Las Hoyas (Cuenca) |
| Vértebra gigante | Turiasar: *Turiasaurus*, el mayor dinosaurio de Europa | Riodeva (Teruel) |
| Caparazón gigante | Testudrago: *Centrochelys burchardi*, tortuga gigante | Tenerife |

- **Su tipo.** Todos son Ancestral, más un segundo tipo según su biología (`BESTIARIO.md`).
- **Fuera de la lista:**
  - *Aragosaurus*, porque repetía saurópodo.
  - El lagarto gigante fósil, porque el de El Hierro sigue vivo y sale en el capítulo 5.

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
  Pokémon: 10 páginas de 30 huecos (6 × 5), donde se mueven, se cambian de sitio, se ve su
  ficha o se liberan.
- **Pesca.** Con la Caña, delante del agua se pesca. Cada zona con agua puede tener su tabla de
  pesca (`encuentrosPesca`). La Caña llega con el tercer gimnasio (decisión del autor), así que
  hasta que exista el capítulo 3 no se consigue; el pescador de la Vega solo la anuncia.
- **Rutas entre ciudades.** Largas, con caminos que serpentean, mucha hierba y algún detalle de
  la época que se lee en un cartel: la noria y la atalaya nazarí de la Vega; la venta, el
  puerto, la cascada y la cañada real de la Mesta en la sierra de Guadarrama; el palomar y el
  puente de Alcántara en el camino de Toledo.
- **Estados alterados.** Quemadura, sueño, parálisis, veneno, veneno grave (intoxicación) y
  **cólera**; no hay congelación, por decisión del autor. La cólera dura hasta curarla (Tila,
  Baya Caquic, Cura total o el mesón), como la parálisis, y una de cada cinco veces la criatura
  usa otro de sus movimientos en lugar del elegido. Además hay estados que se pierden al
  retirarse: la **ceguera** (de 1 a 4 turnos, contados como la confusión del género: falla un
  30 % más, multiplicado por lo demás que cambie la precisión, también con los ataques que no
  fallan nunca, pero no con lo que se hace a sí misma), el retroceso y Muérdago (las
  drenadoras). Solo ciegan los ataques y las pasivas de criaturas de Luz u Oscuridad (decisión
  del autor). La confusión se quitó el 2026-10-26. Rodela es la protección del género. El fuego
  no se quema, el Eléctrico no se paraliza y el Acero no se envenena.
- **Pasivas.** Cada especie tiene una, y varias especies comparten la misma: 50 en total
  (`src/data/pasivas.ts`), con los efectos de las habilidades del género y nombres propios.
  Las que aún no lleva nadie quedan para los capítulos siguientes.
- **Aleatoriedad.** Como en Pokémon: tirada de daño, golpes críticos, precisión y captura. Todo
  sale del generador con semilla, así que una partida se puede reproducir y el reto diario
  sigue siendo justo.
- **Tipos (15).** Los multiplicadores son los de Pokémon: ×2, ×0,5 y, en algún caso,
  inmunidad (×0). Una criatura puede tener uno o dos tipos.

  | Tipo | Qué abarca |
  | --- | --- |
  | Común | La fauna corriente: topillo, lince, toro |
  | Agua | Ríos, mar y fuentes |
  | Tierra | Suelo, roca y montaña |
  | Planta | Bosques, árboles y cultivos: el drago, la mandrágora |
  | Aire | Aves, insectos voladores y viento |
  | Eléctrico | Tormentas y rayos: el Nuberu |
  | Hielo | La nieve y el frío de las cumbres |
  | Infernal | Es el tipo **fuego**, y además los demonios: los toros de fuego, Guayota |
  | Plasma | Gas ionizado que se ve: el fuego de San Telmo (el *corposanto* de los marineros), las centellas o rayos en bola y las coronas. No es magia, ni luz, ni fuego corriente (propuesta en `BESTIARIO.md`) |
  | Mental | Hechizos, adivinación y astucia |
  | Luz | Lo sagrado y el sol |
  | Oscuridad | La noche, la sombra y el engaño: duendes, trasgos, el Coco |
  | Espectral | Almas en pena: la Santa Compaña, la Güestia |
  | Acero | Armas, armaduras y cañones |
  | Ancestral | Los grandes seres de leyenda: dragones, cuélebres, gigantes |

- **Relaciones entre tipos: cerradas.** Están en `src/data/tipos.ts`. Con dos tipos, los
  multiplicadores se multiplican (×4, ×¼…). Tercera versión (2026-10-25), equilibrada a petición
  del autor siguiendo cómo lo hace Pokémon:
  - Cada tipo sin inmunidad es muy eficaz contra tantos tipos como los que le resisten (dos y
    dos, o tres y tres). Los que anulan a alguno (Común, Tierra, Eléctrico y Espectral) tienen
    menos.
  - Nadie es débil a más de tres tipos ni resiste a más de tres. Hay 72 relaciones que no son ×1.
  - Cambios del autor: Planta es poco eficaz contra Aire y ya no contra Acero; Aire ya no es
    eficaz contra Tierra y gana Común y Plasma.
  - Infernal ya no es poco eficaz contra Tierra: el fuego sufría demasiado.
  - Mental, Luz, Oscuridad y Espectral ya no son un círculo cerrado: Planta vence a Oscuridad
    (la ruda contra el mal de ojo), Luz a Ancestral (San Jorge y el dragón) y Acero no hiere a
    las ánimas.
  - Se quedan las cuatro inmunidades: Común y Espectral entre sí, Tierra contra Aire y
    Eléctrico contra Tierra. Ancestral contra Ancestral es ×2, como los duelos de dragones.
  - Se consulta desde el menú («Tipos»), desde la ficha de cada especie del Bestiario, que
    muestra sus debilidades y resistencias, y en combate, con el botón «Tipos». Los botones de
    movimiento marcan ×2, ×½ o ×0 contra el rival.
- **Captura con téseras.** Las téseras de hospitalidad eran pactos celtíberos de bronce, muchas
  con forma de animal. Aquí, lanzar una tésera es sellar un pacto con la criatura.
- **Progresión.** Experiencia, niveles y aprender movimientos. Se evoluciona por nivel o con
  un objeto: Brezuco evoluciona al darle el Gorro colorado.
- **Objetos.** Once categorías: Captura, Curación, Estados, Reanimación, Exploración,
  Progresión, Evolución, Combate, Para equipar, Bayas e Importantes (`src/data/objetos.ts`).
  - Casi todos se llaman como en el género, para que se reconozcan: Poción, Superpoción,
    Antiquemar, Revivir, Repelente, Cuerda huida, Restos, Vidasfera, Baya Zidra… Tienen nombre
    propio las téseras (para capturar), el Turrón (sube un nivel), el Gorro colorado y los
    objetos importantes.
  - Solo existe lo que tiene efecto. Los objetos únicos (Tésera real, Poción máxima,
    Revivir máximo, Turrón, Gorro colorado y los equipables) no se venden: se encuentran, se ganan a
    entrenadores o están escondidos en el mapa.
  - Una criatura puede llevar un objeto equipado (Restos, Vidasfera, bayas…), que actúa
    solo durante el combate.
- **Tinajas.** Se pueden registrar una vez cada una, y queda guardado. El resultado
  sale del generador con semilla, así que recargar no cambia nada:
  - 60 %: un objeto propio de la zona.
  - 30 %: nada.
  - 10 %: un Papemímico, que embosca al jugador. Es más duro que la zona pero justo, elige sus
    movimientos como un entrenador y da exactamente 3 Turrones una sola vez.
  - Las probabilidades se cambian en `src/data/recipientes.ts`. Son tinajas en todo el juego.
  - Solo hay tinajas en ciudades e interiores: en el campo no pintan nada. Una tinaja puede
    llevar un objeto fijo; la de Santa Fe siempre da una Poción.
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
- **MT, MO y legendarios** (sistemas hechos el 2026-10-26; lo de los capítulos 3 a 8 es
  propuesta):
  - **Mapa.** Es un objeto importante. Lo da Colón en Santa Fe: antes de pedir naves, dibujaba
    cartas en Lisboa con su hermano Bartolomé (el Diccionario Biográfico de la RAH sitúa allí a
    los dos hermanos como cartógrafos hacia 1479–1480). Se abre desde el menú: muestra dónde
    estás y los lugares visitados, y con Vuelo sirve para viajar.
  - **MT.** Enseñan un movimiento y no se gastan. Las dan los líderes (Boabdil, la MT01; María
    Pacheco, la MT02) o están en el suelo, en un zurrón que se ve. Cada MT dice quién puede
    aprenderla: por tipos, por especies o todas.
  - **MO.** Solo dos, Pleamar y Vuelo, y las dan personajes importantes en capítulos distintos.
    Sus movimientos sirven también fuera de combate:
    - **Pleamar** (el Surf del género; nombre elegido por el autor): cruzar ríos y mares por el
      agua profunda (casilla `O`), con sus propios encuentros. Solo lo aprenden las criaturas
      acuáticas (`acuatica` en la especie). **Decidido:** la da el conde-duque de Olivares en
      el **capítulo 4**, en Madrid, en el Estanque Grande del Buen Retiro, que se hizo
      navegable en 1634–1635 y donde la corte de Felipe IV celebraba naumaquias con barcos de
      guerra en miniatura. Olivares había regalado el Buen Retiro al rey. Jorge Juan, en el
      capítulo 5, no da ninguna MO: te lleva a las islas en su barco.
    - **Vuelo:** viajar a un lugar ya visitado desde el mapa. Propuesta: **Diego Marín
      Aguilera**, el «hombre pájaro» de Coruña del Conde (Burgos), que la noche del 15 de mayo
      de 1793 se lanzó desde el castillo con una máquina de madera y plumas y voló unas 431
      varas (unos 360 m) antes de que se le rompiera una pieza. Encaja con el quinto gimnasio.
      Se descartó Leonardo: sus códices de Madrid son de mecánica, no de vuelo.
  - **Legendarios.** Llegan tarde, como en el género. Esperan de pie en su guarida (un
    personaje con `criatura`): al hablarles empieza el combate; si los vences o los capturas,
    desaparecen; si huyes, siguen ahí. Las guaridas pueden estar en zonas de los primeros
    capítulos, cerradas hasta tener un objeto o una bandera de más adelante (salida con
    `requiere`). Cada uno necesita su imagen de pie en `src/assets/legendarios/`, en píxeles como
    los personajes; sin ella se usa su ilustración.

    | Legendario | Guarida (Bestiario) | Se abre con (propuesta) |
    | --- | --- | --- |
    | Tarasca | Granada, en el Corpus | Tras la Liga: la ciudad del capítulo 1, cerrada hasta el final |
    | Guayota | Teide | Tras el gimnasio del capítulo 5; hace falta Vuelo o Pleamar para llegar |
    | Magec | Cumbre del Teide, al amanecer | Tras vencer o capturar a Guayota |
    | Cuélebre | Covadonga | Un candil para entrar en la cueva |
    | Mari | Anboto | Una cuerda con garfio para subir a su cueva |
    | Babieca | San Pedro de Cardeña (Burgos), con el ánima del Cid | Una llave del monasterio |
    | Nuberu, Alcorax, Platero, Rocinante, Copito de Nieve, Ratón Pérez | Su capítulo | Según su capítulo |

    Los iconos del candil, la cuerda con garfio y la llave ya están hechos, en reserva
    (`arte/objetos-futuros/`).

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
  - Los mapas se dibujan como texto en `src/data/zonas/`, un carácter por casilla, y cada zona
    dice su estilo (pueblo, campo, Alhambra, mesón…).
- **Guardado.** En `localStorage`, con número de versión y migraciones. Además se puede exportar
  e importar la partida como texto, que sirve de copia de seguridad.
- **Móvil.**
  - Resolución lógica fija con píxeles nítidos, escalada a la pantalla.
  - En vertical, la pantalla va arriba y el mando abajo, como en una Game Boy.
  - En PC, teclado y sin mando en pantalla.
- **Arte del mapa.** Tileset propio al estilo de los juegos de criaturas de GBA, a 16 × 16
  escalado ×5. Lo dibuja un script (`arte/mapa/tileset.py`), sin recursos de terceros, para poder
  publicarlo en el repositorio. Ambientado en la época: encalado, teja árabe, tapial, olivos,
  acequias, arrayanes y azulejos.
- **Arte de los personajes del mapa.** Propio, al mismo estilo: 16 × 24 por fotograma, un cuerpo
  común y, para cada personaje, sus colores, su tocado y su ropa de la época
  (`arte/mapa/personajes.py`).
- **Arte de las criaturas, provisional.** Cada sprite se busca por el id de la criatura. Si no
  hay imagen, se genera una provisional con el color del tipo. Para sustituirlo basta con añadir
  el PNG con ese nombre.
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
  - Iniciales con tres formas cada uno: Becerro de fuego, Cangrejo (hasta el Centollo) y Retoño
    de drago. El Cangrejo sustituye al Desmán.
  - Tipos: Común, Agua, Tierra, Planta, Aire, Eléctrico, Hielo, Infernal (es el fuego),
    Plasma, Mental, Luz, Oscuridad, Espectral, Acero y Ancestral, que sustituye a Mitológico. Se
    descarta la tabla de 5 tipos del primer borrador. Hay tipo doble.
- **2026-10-23.** Modo historia del capítulo 1 jugable de principio a fin.
  - El laboratorio de combate queda como herramienta de pruebas.
  - En combate, mantener pulsado un movimiento muestra qué hace; al subir de nivel con cuatro
    movimientos, se elige cuál olvidar.
  - Prompt para diseñar el Bestiario con otra IA: `PROMPT-CRIATURAS.md`.
- **2026-10-23 (2).**
  - Nombres propios y épicos para las criaturas, sobre todo los iniciales:
    - Ascuerno → Embolado → Pirotauro.
    - Caparín → Tenazor → Centurión.
    - Draguillo → Dracena → Ladón.
  - Perder un combate cuesta un 10 % del dinero, no la mitad.
- **2026-10-23 (3).** Bestiario: auditoría y tabla de 150 especies (`BESTIARIO.md`), a partir
  del prompt hecho con ChatGPT.
  - Iniciales: Ignibue → Braverno → Ignivárgoth, Marzuko → Nakarra → Talascrón y
    Dralín → Dracauro → Dracendro.
  - Fuera los constructos sin raíz en fauna ni folclore.
  - Entran los perros de Guayota y el Dragón de San Jorge (Alcorax).
  - Plasma, con definición y 6 especies.
  - Capítulo 8 en Asturias, como propuesta.
  - Legendarios: Islero fuera y el Ratón Pérez dentro. Los animales célebres bajan a 540–570.
  - Fichas completas del capítulo 1 y de Gofrón.
- **2026-10-24.** Cambios y ampliaciones pedidos por el autor.
  - Tabla de tipos del autor, consultable desde el menú, el Bestiario y el combate.
  - Sistema de objetos por categorías, con objetos equipables y de evolución.
  - Tinajas registrables (60/30/10) y el Papemímico.
  - Mapa y personajes con el paquete *Ninja Adventure* (CC0).
  - Bestiario v2: revisión de variedad. El drago pasa a dos formas (Dralín → Dracendro), la vieja
    canaria es Agua/Planta, el lagarto de El Hierro se llama *Gallotia simonyi*, Talasonda queda
    eliminada y entran once especies nuevas.
  - El capítulo 1 del juego ya usa los nombres, estadísticas y movimientos del Bestiario.
- **2026-10-24 (2).** Respuestas del autor a la revisión.
  - Arte de las 22 criaturas del capítulo 1.
  - Tabla de tipos reducida: de 82 relaciones que no son ×1 a 54.
  - La mayoría de los objetos se llaman como en el género (Poción, Revivir, Repelente…).
  - Tinajas en todo el juego.
  - Se aceptan: Dralín con dos formas, la dificultad de Ignibue contra Boabdil, los nombres
    nuevos y el Papemímico capturable.
- **2026-10-25.** Arte de las criaturas, versión definitiva de estilo.
  - El autor elige, tras dos rondas de pruebas, ilustración limpia de criatura de juego (sin
    texturas realistas).
  - Cada criatura tiene dos vistas en combate: el rival en diagonal de frente y la tuya en
    diagonal por detrás.
  - Guía de diseño visual en `BESTIARIO.md`: niveles de épica según la línea, la rareza y la
    zona.
  - Guayota pasa a ser un gigante humano hecho de volcán, con el sol que robó en la mano.
- **2026-10-25 (2).** Menús al estilo del género y descripciones corregidas.
  - Brezuco y Mandragor, redibujados con la orientación correcta.
  - `DESCRIPCIONES.md`: la descripción visual de las 150 especies, corregida con todo lo
    decidido. Sustituye al inventario del prompt de ChatGPT.
  - Menú de pausa encima del mapa: tarjeta del jugador con los blasones, lista con iconos y
    cursor, y una ayuda de cada opción.
  - Equipo en seis huecos, con submenú (ficha, mover, quitar objeto). Ficha en tres pestañas
    (datos, estadísticas, movimientos). Mochila por bolsillos.
  - Los menús se manejan también con la cruceta y A, y el combate usa los mismos marcos.
- **2026-10-25 (3).** Menús de juego actual y combate como en el género, a petición del autor.
  - Tipografía Nunito, paneles blancos, botones con relieve y fondos de color en movimiento.
  - Iconos ilustrados para los menús y para los 33 objetos.
  - Pausa con el equipo a la izquierda y las opciones con iconos a la derecha.
  - Combate: movimientos a la izquierda (70 %) y, en un 2 × 2 a la derecha, la última tésera
    usada, la mochila, el equipo y huir.
  - Quitado el fondo blanco atrapado en el drago, el Papemímico, el Trasgorn y el pelotero.
- **2026-10-25 (4).** Correcciones del autor.
  - Una tinaja por zona como mucho, y fuera los barriles de adorno del exterior de Santa Fe, que
    se confundían con ellas.
  - El Papemímico no sale si no tienes ninguna criatura en pie (antes rompía el juego), y los
    entrenadores no te retan en ese caso.
  - Isabel la Católica, recoloreada: piel blanca y pelo rubio rojizo, como la describen las
    crónicas de su tiempo (Hernando del Pulgar).
- **2026-10-25 (5).** El Papemímico solo sale desde la quinta ciudad (cuatro blasones), por ser
  una criatura fuerte. Antes, las tinajas solo dan objetos o nada.
- **2026-10-25 (6).** Mapas con aspecto de los juegos de criaturas de GBA, a petición del autor.
  - Se descarta pasar el juego a Pokémon Essentials: no funciona en el navegador ni en iPhone.
    Los tilesets de la comunidad tampoco sirven tal cual: casi todos prohíben redistribuirlos y
    el repositorio es público.
  - Tileset propio, generado por script: hierba alta que tapa las piernas, caminos con bordes,
    casas encaladas con teja árabe, rejas y geranios, murallas de tapial y roja, el pabellón real
    a rayas con pendones, acequias y fuentes con el agua en movimiento, olivos, naranjos,
    cipreses, setos de arrayán, huertos, pozo y los leones del patio.
  - Mapas más ricos: plaza empedrada con fuente en Santa Fe, vallado del pabellón, huertos en
    Santa Fe y en la Vega, setos en la Alhambra. Una prueba comprueba que se llega a todas las
    salidas, personajes, carteles, tinajas y objetos.
- **2026-10-25 (7).** Personajes del mapa propios, al estilo de los del tileset: Isabel con corona y
  vestido carmesí, Fernando con corona y capa, el Gran Capitán con coraza y capa roja, Colón con
  el pelo cano, Boabdil y su guardia con turbante, el centinela con capacete, el pastor con
  sombrero… El tendero tiene aspecto propio. Ya no se usa nada de *Ninja Adventure*.
- **2026-10-25 (8).** Correcciones del autor tras jugar.
  - Retratos de todos los que hablan, en el estilo de las criaturas, junto al cuadro de diálogo:
    Isabel, Fernando, el Gran Capitán, Colón, Boabdil y el resto de PNJ y entrenadores.
  - Tinajas solo en ciudades e interiores; la de Santa Fe da una Poción (antes podía dar una
    Superpoción por azar).
  - Primera zona más fácil: cuatro entrenadores de una sola criatura en la Vega y otros cuatro
    en la Alhambra, salvajes de nivel más bajo y Boabdil con dos criaturas (7 y 8).
  - Colón, rehecho como hombre (jubón, calzas y capa). Da cinco téseras en vez de tres pociones,
    con una frase sobre las tierras al otro lado del océano. No habla de «América»: en 1491 no
    sabía que existía y buscaba las Indias.
  - Arreglado: al volver de un combate, el jugador seguía andando solo si había empezado con el
    dedo en la cruceta.
  - Arreglado: la barra de vida no bajaba, solo cambiaba de color. Ahora baja poco a poco, junto
    con los números, y tarda más cuanto más daño.
- **2026-10-25 (9).** Más correcciones del autor.
  - Retratos solo de los personajes importantes (Isabel, Fernando, el Gran Capitán, Colón y
    Boabdil). Los demás quedan en reserva en `arte/retratos-reserva/`.
  - Fuera la Tésera real que daba el mensajero tras Boabdil: era demasiado pronto para la
    equivalente a la Master Ball. Ahora da tres téseras de plata.
  - Cinco entrenadores en total entre la Vega y la Alhambra, no cuatro por zona.
  - Boabdil lleva Brezuco y Trasgorn, de Oscuridad, en vez de Alhambrón (Agua/Tierra), que hacía
    imposible el combate con el inicial de fuego.
- **2026-10-25 (10).** Tabla de tipos equilibrada (ver §8) y decisiones del autor para el
  capítulo 2: el protagonista es siempre el mismo (se descarta la saga familiar) y los
  personajes del capítulo los elige el diseño, cuadrados con la historia.
- **2026-10-26 (11).** Capítulo 2, «Castilla, 1521», hecho y jugable.
  - Empieza al vencer a Boabdil: un texto explica el salto (mueren Isabel en 1504 y Fernando en
    1516; Carlos es emperador y estalla la guerra de las Comunidades) y el jugador aparece en
    Villalar el 23 de abril de 1521, con el mismo protagonista y su equipo.
  - Recorrido: Villalar → camino de Toledo (con el Tajo) → Toledo (mesón) → Alcázar. Desde el
    registro 20, entre Villalar y el camino está la sierra de Guadarrama.
  - La líder es María Pacheco, no Carlos V: él no estaba en España en 1521, y ella es quien
    resiste en Toledo hasta febrero de 1522. Juan de Padilla, antes de ser ejecutado, te da una
    carta para ella. Equipo de Tierra/Acero (Escarbraz 12 y Bastilag 14): el reparto de tipos
    de la zona lo anuncia, como pide A.9.
  - Dificultad comprobada con simulaciones (sin objetos): con el inicial a nivel 14 y un
    Lizarco de nivel 12, que se captura en Villalar y hace ×2 a los dos, se gana un 34 % con
    el de fuego, un 59 % con el de agua y un 81 % con el de planta; con pociones, bastante más.
    El de fuego es el que más sufre, porque Bastilag le pega ×2 con Tierra.
  - Cinco entrenadores de una criatura, uno por cada tipo nuevo de la zona.
  - Termina con la tregua de octubre de 1521, la huida de María a Portugal en 1522 (murió en
    Oporto en 1531) y la vuelta de Carlos en julio de 1522.
- **2026-10-26 (12).** Pedidos del autor tras jugar en el iPhone.
  - Franja negra arriba para la barra de estado y la isla (al menos un 5 % del alto) y el mando
    pegado abajo, colocado como en los skins de los emuladores de GBA y DS.
  - Modo desarrollador, con su propia partida, para probar capítulos avanzados sin jugarlo
    todo.
  - Sexo de cada criatura: macho, hembra, hermafrodita o sin sexo. Se añade «sin sexo», que el
    autor no pidió, para las estatuas y la tinaja: llamarlas hermafroditas sería falso.
  - Zona de captura en un mapa de la península, como el área del Pokédex.
- **2026-10-26 (13).** Mapa, MT y MO, y base para los legendarios, a petición del autor.
  - Colón da el Mapa en Santa Fe; quien ya había pasado lo recibe al cargar la partida.
  - Cinco MT: dos de los líderes (Boabdil y María Pacheco) y tres en zurrones en el suelo (la
    Vega, el bosque de la Alhambra y el camino de Toledo).
  - Las MO Surf y Vuelo funcionan: Surf cruza el Tajo, con sus propios encuentros, y Vuelo lleva
    desde el mapa a los lugares visitados del capítulo. Quién las da, propuesta en §8.
  - Base para los legendarios: criaturas que esperan de pie y zonas que piden un objeto para
    entrar. El plan de cada guarida, en §8.
- **2026-10-26 (14).** Decisiones del autor sobre las MO.
  - Se puede volar a cualquier lugar visitado, de cualquier época.
  - Surf se llama **Pleamar**, solo lo aprenden las criaturas acuáticas y lo da Olivares en el
    capítulo 4, en el estanque del Buen Retiro. Así no coincide con Vuelo, que queda en el 5.
- **2026-10-26 (15).** Pedidos del autor tras comparar con Cristal, Esmeralda y Negro 2.
  - El mando llega hasta el borde de abajo, y el mapa gana alto.
  - Correr con B: el rey Fernando da unas alpargatas al empezar (a las partidas empezadas les
    llegan al cargar).
  - Mochila por bolsillos: objetos, botiquín, téseras, combate, bayas, MT y MO, importantes.
  - Algunos vecinos pasean por su zona.
  - Combate: parálisis, veneno e intoxicación (sin congelación), confusión, retroceso,
    Muérdago y Rodela, con sus movimientos; 50 pasivas, una por especie; la captura es más
    fácil con cualquier estado. Antídoto y Antiparalizador en las tiendas, y la MT06 Rodela en
    un zurrón de Villalar.
- **2026-10-26 (16).** Más objetos, piedras y Repartir experiencia.
  - Objetos nuevos, como los del género: Tésera rápida y Tésera de red; Elixir y Elixir máximo;
    Garra rápida, Periscopio, Lupa y Bola humo; doce potenciadores de tipo (Carbón, Agua
    mística…); bayas Aranja, Zreza, Meloc, Perasi y Ziuela.
  - Piedras: la lunar (Lobregón → Lobánima) y la solar (Aquilín → Imperión), que adelantan la
    evolución por nivel. Las de fuego, agua, trueno y hoja quedan para líneas de capítulos
    futuros (propuesta en `BESTIARIO.md`, decisión abierta 7).
  - Repartir experiencia: lo da un maestro de Toledo. Las que han salido contra la criatura
    derrotada ganan la experiencia entera, y con él encendido, las demás la mitad. Se apaga
    desde la mochila.
- **2026-10-26 (17).** Pesca y almacén de verdad.
  - Caña: la da un pescador de la Vega (a quien ya venció a Boabdil le llega al cargar). Delante
    de una acequia o del Tajo, A ofrece pescar; si el agua es profunda, también Pleamar. En la
    Vega pican barbos gitanos y galápagos; en el Tajo, galápagos.
  - El almacén pasa de una lista a 10 páginas de 30 huecos, como las cajas del género: mover
    tocando la criatura y su destino (si está ocupado, se cambian), ver su ficha y liberarla. El
    equipo nunca se queda vacío ni sin nadie en pie. Las partidas guardadas se migran (v3).
- **2026-10-26 (18).** Rivales recurrentes.
  - Dos amigos del protagonista, con sus propios personajes en el mapa (sombrero y melena). Se
    les pone nombre al conocerlos: en la escena de Isabel o, en las partidas ya empezadas, en el
    primer combate.
  - Se quedan con las otras dos iniciales; el primero, con la que gana a la del jugador, como
    en el género. Su inicial evoluciona con el nivel. La partida guarda la inicial elegida; en
    las antiguas se deduce del equipo.
  - Cuatro combates: Santa Fe al salir del pabellón (inicial a nivel 4), la Vega antes de la
    Alhambra, el camino de Toledo y Toledo antes del Alcázar.
- **2026-10-26 (19).** Fuera la confusión; entran la ceguera y la cólera, a petición del autor.
  - Ceguera: Destello (Luz) y Tiniebla (Oscuridad) la provocan siempre; Resplandor y Noche
    cerrada, un 20 %. Pasivas Deslumbrante (Mocarabeo) y Tinieblas (Lobánima); Ojos de lince la
    impide; la Baya Perasi la cura.
  - Cólera: Desvarío (antes confundía) la provoca siempre y Ofuscación, un 10 %. Cabeza fría la
    impide. Se cura con la Tila (tiendas), la Baya Caquic (escondida en Villalar), la Ziuela,
    la Cura total o el mesón.
- **2026-10-26 (20).** Rutas más largas, rivales con historia y la Caña más tarde, a petición
  del autor.
  - El nombre de los rivales se puede escribir entero: el juego se quedaba con algunas teclas
    (W, A, S, D, Mayúsculas, M, Z, X) aunque se estuviera escribiendo.
  - Los rivales ya no se presentan como «el del sombrero» y «la de la melena»: antes de ponerles
    nombre se cuenta su historia (§5). Isabel explica algo más: la guerra, Santa Fe, las
    criaturas que solo conocen los pastores y por qué elige al protagonista.
  - La Caña pasa al tercer gimnasio; el pescador de la Vega ya no la da.
  - La Vega crece a 32 × 46, con acequias, una noria, una atalaya nazarí, huertas y olivares.
  - Nueva zona entre Villalar y el camino de Toledo: la sierra de Guadarrama (30 × 44), con
    pinos, peñas de granito, una cascada, una venta, la cañada real y un halconero. El pastor
    de la Mesta se muda allí. El camino de Toledo crece a 28 × 40, con un palomar y el puente de
    Alcántara sobre el Tajo.
  - Casillas nuevas: cascada (V), peña (k), atalaya (I) y noria (N, se pesca delante); estilo
    `sierra`.
