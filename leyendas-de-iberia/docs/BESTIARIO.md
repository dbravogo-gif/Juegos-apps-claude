# Bestiario de Leyendas de Iberia

Diseño de las 150 especies. Parte del prompt maestro que el autor preparó con ChatGPT
(2026-10-23) y lo ajusta a las decisiones cerradas del `GDD.md`.

**Estado:**
- Hecho: fase A (auditoría), fase B (tabla maestra) y fase C del capítulo 1, más Gofrón, la
  vieja, *Gallotia simonyi* y el Papemímico por adelantado.
- **v2 (2026-10-23):** segunda revisión de variedad pedida por el autor (A.8). La numeración
  cambia respecto a la v1.
- El juego ya usa el capítulo 1 de esta tabla (nombres, estadísticas y movimientos). Los `id`
  internos de `src/data/especies.ts` no cambian, para no romper partidas guardadas.
- Siguiente: fichas del capítulo 2, cuando el autor dé el visto bueno.

## Convenciones

- **Estadísticas.** Vida / Fuerza / Escudo / Magia / Resistencia mágica / Celeridad. La suma
  va al final.
- **Totales orientativos:**

  | Forma | Total |
  | --- | --- |
  | Inicial o débil | 250–320 |
  | Intermedia | 380–420 |
  | Final de dos formas temprana | 420–460 |
  | Final corriente | 480–540 |
  | Animal célebre (legendario) | 540–570 |
  | Ser mítico (legendario) | 580–600 |
- **Niveles de evolución.** Son propuestas.
  - Iniciales: 16 y 36, como ya está en el juego.
  - Líneas de tres formas: 14–22 y 30–40.
  - Líneas de dos formas: 12–30, según lo pronto que salgan.
- **Multiplicador de EXP.** Respecto a una criatura estándar del mismo nivel. En el código se
  traducirá a `expBase`; la fórmula global no se toca.
- **Movimientos.** Se reutilizan los que ya existen en `src/data/movimientos.ts`. Los nuevos se
  marcan con *(nuevo)*, y solo usan efectos que el motor ya sabe hacer: daño, subir o bajar
  etapas, quemar, dormir, drenar, curar y prioridad.
- **Debilidades de tipo.** Salen de la tabla de tipos (`src/data/tipos.ts`): la del autor,
  reducida el 2026-10-24. Con dos tipos, los multiplicadores se multiplican.
- **Marcas de verdad:**
  - *Hecho*: biología, paleontología o historia documentada.
  - *Tradición*: folclore recogido en fuentes.
  - *Licencia*: invención del juego.
  - **[VERIFICAR]**: dato dudoso, pendiente de comprobar.

## Guía de diseño visual

Cómo se dibuja cada criatura según su línea, su fuerza y dónde sale. Sigue las costumbres del
género: las criaturas son de dibujo animado, nunca animales realistas, aunque partan de una
especie real.

**Estilo (elegido por el autor el 2026-10-25, el «D» de las pruebas).** Ilustración limpia de
criatura de juego: formas sencillas y redondeadas, colores planos con una sola sombra suave,
contorno fino y ojos expresivos. Sin texturas realistas de pelo, plumas o roca, aunque la
criatura sea fuerte: lo que la hace épica es el tamaño, la silueta y los efectos, no el detalle.

**Vistas en combate.**
- El rival se ve en diagonal de frente, mostrando el frente y su lado izquierdo.
- La tuya se ve en diagonal por detrás, mostrando la espalda y su lado derecho.

**Niveles de épica.** Cada especie tiene uno. Marca el tamaño, el detalle y los efectos.

| Nivel | Cuándo | Cómo se dibuja |
| --- | --- | --- |
| 0. Corriente | Primeras rutas; formas débiles comunes | Pequeña y redonda, 2–3 colores, rasgos del animal fáciles de reconocer, cara amable o graciosa. Sin efectos. |
| 1. Media | Primera forma de una línea de dos; únicas comunes | Cuerpo completo, un rasgo exagerado (aletas, cuernos, garras), 3–4 colores. |
| 2. Fuerte | Formas intermedias; finales que salen pronto; únicas raras | Más grande, pose con carácter, alguna armadura u ornamento, 4–5 colores. Efectos leves. |
| 3. Final | Finales de tres formas, finales de inicial y finales que salen tarde | Grande y con peso, silueta inconfundible, el motivo de su tipo completo y exagerado. A veces cambia de postura o gana armadura, ropa o un detalle cultural. Efectos moderados. |
| 4. Épica | Muy raras de historia, legendarias | Presencia de monumento, ornamento o simetría, motivo cultural fuerte, aura o partículas, colores de prestigio (oro, blanco, azul profundo). Llama la atención en cuanto aparece. |

**Líneas de tres formas** (iniciales y algunas de ruta):
- **Primera, la cría:** cabeza grande (un tercio del cuerpo), cuerpo redondo, patas cortas y
  ojos grandes. El motivo del tipo apenas asoma: una llamita, una hoja.
- **Segunda, la adolescente:** más alta y desgarbada, con expresión desafiante. El motivo crece
  y aparece la mitad de lo que tendrá la final.
- **Tercera, la adulta:** grande y con peso, con el motivo completo. A menudo cambia de postura
  o gana armadura o ropa. Conserva los colores de la línea.
- Las líneas de tres que salen en las primeras rutas, como la del escarabajo, acaban fuertes,
  pero menos espectaculares que las iniciales.

**Líneas de dos formas.** La base no es tan cría: ya es una criatura joven completa. La final
es de nivel 2 si sale pronto (Zumbrel → Diablisca) y de nivel 3 si sale tarde.

**Únicas, que no evolucionan.** Son adultas y su diseño está cerrado, con un rasgo que las
distingue. Las comunes son de nivel 1; las raras, de nivel 2 o 3; las muy raras y de historia,
de nivel 4 (Alhambrón, Guisandor).

**Legendarias.** Siempre de nivel 4, pero de dos maneras:
- Los animales célebres (Babieca, Platero) son sobrios y majestuosos, sin efectos exagerados.
- Los seres míticos (Guayota, Cuélebre, Mari) son grandes, con aura y elementos de su mito.

**Fósiles.** Nivel 2 o 3. Rocosos, de paleta terrosa, algo amenazantes; se nota que han vuelto
de otra época.

**Según la zona de la historia.**
- Capítulo 1 y primeras rutas: animales familiares, colores cálidos y diseños sencillos.
- Capítulos centrales: más elementales y exóticos.
- Final del juego y zonas opcionales: más intimidantes o místicos.
- Cada región pone sus motivos: lo nazarí en Granada, lo mudéjar en Toledo, lo guanche en
  Canarias, el románico en el norte.

**Capítulo 1, nivel de cada especie:**
- 0: Túmbriz, Zumbrel, Abezar, Broncero.
- 1: Ignibue, Marzuko, Dralín, Brezuco, Barbaflux, Carapachón.
- 2: Braverno, Nakarra, Diablisca, Trasgorn, Mandragor, Escarbraz, Papemímico.
- 3: Ignivárgoth, Talascrón, Dracendro, Mocarabeo.
- 4: Alhambrón.

---

## Fase A. Auditoría

### A.1 Lo que chocaba con lo ya decidido

| Problema en el prompt | Cambio |
| --- | --- |
| **Constructos sin raíz en fauna ni folclore**: grúa portuaria (Grúvex), máquina de asedio (Balistrón), farol y faro (Fanariel, Fanaluz), vasija y guerrero de terracota (Ceramur, Argilion), muralla y fortaleza (Numantor, Murallante), teatro (Teatralión), arcos flotantes (Arcomante) y la lluvia industrial (Pluviacero). El GDD dice que las criaturas salen de la mitología y la fauna. | Se rehacen como fauna o folclore, conservando la idea que funcionaba. Grúvex pasa a ser una grulla (la palabra *grúa* viene de *grulla*). Bombardrak pasa a ser el escarabajo bombardero, que dispara un chorro hirviendo. El farol pasa a ser una luciérnaga. Se quedan las esculturas de animales con raíz: el león de la Alhambra, ya aprobado, y los toros de Guisando y la gárgola, que son nuevos. |
| **Faltaban los perros de Guayota** (la Cueva del Viento, capítulo 5). | Nueva línea Guacán → Tibicán. *Tradición*: en Gran Canaria se llaman tibicenas; en Tenerife, según algunas fuentes, guacanchas, y se dicen hijos de Guayota **[VERIFICAR]**. Así se cumple el aviso del prompt: las dos tradiciones no se mezclan sin decirlo. |
| **Faltaba el Dragón de San Jorge** del capítulo 6 (GDD §4). | Nuevo legendario: Alcorax. El nombre viene de la batalla de Alcoraz (1096), en la que, según la tradición, San Jorge ayudó a los aragoneses. |
| **Ursalín → Ursabral → Basajaur estaba en Granada.** Basajaun es del Pirineo vasco y navarro, y en Granada no hay osos. | Pasa al capítulo 6 (Pirineo). |
| **El capítulo 1 tenía 22 especies salvajes**, casi el doble que el resto, para un capítulo que es el prólogo. | Se queda en 13: las 10 que ya están en el juego más la línea del escarabajo. Las otras se reparten o se quitan. |
| **Los iniciales cambiaban de nombre.** | Se aceptan los del prompt: Ignibue, Marzuko y Dralín sustituyen a Ascuerno, Caparín y Draguillo, con sus líneas. |
| **Canarias no lucía**: sin tibicenas, sin fauna de buceo propia y sin el lagarto gigante de El Hierro. | Pasa de 12 a 19 especies, más Guayota, la tortuga fósil y la Luz de Mafasca (zona opcional). |
| **Plasma no tenía ninguna criatura.** El prompt solo decía cuándo *no* usarlo. | Se acepta su definición (gas ionizado: fuego de San Telmo, centellas, coronas). Se le dan 6 especies con soporte visual claro (A.5). |
| **Legendarios**: todos los animales célebres a 580–600 hace que Rocinante, un rocín flaco, sea tan fuerte como Guayota. | Los animales célebres bajan a 540–570; los seres míticos se quedan en 580–600. |
| **Islero** era el quinto toro del juego (tres iniciales y Guisandor), y su fama es haber matado a Manolete. | Sale. Entra el Ratón Pérez, creado en Madrid en 1894 para el niño Alfonso XIII, que sale en el capítulo 7. |

### A.2 Duplicidades

| Duplicidad | Solución |
| --- | --- |
| **Tres líneas de cangrejo** que acaban en tanque Agua/Acero: Marzuko, Rivak y Marek. | Solo queda la inicial. Rivak sale. Marek se convierte en el angelote (Arenín → Escualión), el tiburón plano que se entierra en la arena y que tiene en Canarias su último refugio. |
| **Dos anguilas eléctricas** (Anguélix, Ebralia). En los ríos de España no hay peces eléctricos. | La eléctrica pasa a ser la tremielga o torpedo (Tremolín → Tremielgón), que es real y marina. Anguélix queda como Agua/Espectral: la angula es transparente y nadie ha visto aún a la anguila desovar en el mar de los Sargazos **[VERIFICAR]**. Ebralia sale. |
| **Dos líneas de carbón** (Carbonil, Carboria). | Queda Carboria, en Asturias. |
| **Diez especies Tierra/Acero**, todas tanques. | Quedaron tres, cada una con su papel: Escarbraz (defensor), Bastilag (el tanque) y Ferrumbrak (atacante). En la v2 sale Ferrumbrak (A.8). |
| **Tres aves que acababan en Aire/Luz** (Granalar, Lumitorre, Celestauro). | Queda una: Imperión, el águila imperial, por el águila de San Juan del escudo de los Reyes Católicos. Celestauro pasa a ser Plasma (A.5). |
| **Dos córvidos Aire/Oscuridad** y dos golondrinas, con nombres casi iguales (Gorvín y Golvín). | Salen los córvidos y una golondrina. Golvín queda como vencejo. |
| **Tres líneas de anfibio** y Niebrelago, un Agua/Hielo calcado de Nivamandra. | Queda la de la salamandra del Pirineo. |
| **Doce especies Tierra/Ancestral**: todos los fósiles y las bestias de montaña. | Ancestral queda para los seres primordiales y los fósiles; el segundo tipo de cada fósil cambia según su biología. Tierra/Ancestral baja a 3. |
| **Infernal/Ancestral** repetido (Vulcaris y Guayota), más tres Tierra/Infernal (Magmalión, Carboflama y Calderath). | Vulcaris y Calderath salen, y Magmalión en la v2 (A.8). Guayota pasa a Infernal/Oscuridad: secuestró al sol, Magec, y dejó el mundo a oscuras (*tradición*). |
| **Tres felinos de dientes de sable.** | Quedan dos con siluetas distintas: Machairodus, de Batallones, robusto, y Homotherium, de Orce, de patas largas. |
| **Dos saurópodos** (Turiasaurus y Aragosaurus). | Queda Turiasaurus, el mayor dinosaurio de Europa. |
| **Lagarto gigante canario**, como fósil y como especie viva a la vez. | Se queda el vivo de El Hierro, en el capítulo 5. En la v2 se llama por su nombre científico, *Gallotia simonyi*. |
| **Nombres que se confundían:** Ferrumbra y Ferrumbrak; cinco nombres «Carbo-», cuatro «Noct-» y cuatro «Mare-»; Bastilag y Bastionix; Alabastrón y Alhambrón en el mismo capítulo; Pinariel y Fanariel; Fulgora y Fulgurón; Machairón y Majorón. | Se resuelven con los cambios de arriba y estos renombres: Alabastrón → Mocarabeo, Fanariel → Farolera, Majorón → Riscabra. |

### A.3 Líneas incoherentes

| Línea | Problema | Solución |
| --- | --- | --- |
| Grávico → Corvazul → Corvaster | Empieza en ave esteparia y acaba en cuervo. | Grávico → Gravitardo, la avutarda: el ave voladora más pesada. |
| Ardélix → Pinariel → Pinarquía | Pasa de ardilla a árbol. | Dos formas: Ardélix y Pinariel, la ardilla que siembra pinares con las piñas que olvida. |
| Marmel → Pirenox → Montaraz | Pasa de marmota a bestia con cuernos. | La marmota va sola. |
| Fulgora → Fanariel → Fanaluz | Pasa de insecto a farol y de farol a faro. | Fulgora → Farolera: dos formas de luciérnaga. |
| Velaria → Tapizombra → Ilusaria | Oruga, capullo y mariposa es la estructura de una línea concreta de Pokémon. | Velaria → Ilusaria: de la oruga a la mariposa isabelina, dedicada a Isabel II en 1849. |
| Grajombra → Nocturiel → Nocturnarca | Pasa de grajilla a ave fantasma. | Sale. Lo espectral de Asturias lo cubre Cirialma (la Güestia). |
| Peláris → Abisarda → Talasonda | Talasonda no tenía ficha: el inventario solo tenía 149 conceptos. | Dos formas. Talasonda queda eliminada del todo (A.8). |

### A.4 Tipos y nombres revisados (los principales)

- **Alhambrón:** Agua/Tierra en vez de Agua/Acero. Los leones son de mármol de Macael, y el
  agua sale por sus bocas.
- **Trasgorn:** solo Oscuridad. El trasgu es travieso, no un alma en pena: lo Espectral no
  tenía base.
- **Brezaluz y Tortuluz** llevaban «luz» en el nombre sin ser de tipo Luz, lo que confunde al
  jugador. Se llaman Brezuco y Carapachón; Carapachón ya era el nombre en el juego.
- **Celestauro** sugería un toro en un ave. Pasa a llamarse Coronazul.
- **Azuverna:** Plasma sin justificar. La línea sale.
- **Gofrón:** se mantiene Planta/Tierra, ahora justificado. Planta por el cereal tostado.
  Tierra por la muela de basalto del molino de mano aborigen, que lleva en el lomo como
  caparazón.
- **Mari:** Mental/Plasma, si se confirma la tradición de que viaja por el cielo como una bola
  o una hoz de fuego **[VERIFICAR en Barandiarán]**. Si no se confirma, queda Mental/Eléctrico,
  porque desata tormentas y granizo.
- **Fósiles:** todos llevan Ancestral, que identifica a lo que revive el Dr. Jangel. El segundo
  tipo varía: Hielo para el mamut, Agua para *Pelecanimimus*, Aire para *Iberomesornis*,
  etcétera.

### A.5 Plasma: las 6 especies

Plasma solo se usa cuando se ve gas ionizado: filamentos, coronas o halos azul violeta.

| Especie | Por qué es Plasma |
| --- | --- |
| Telmario → Corposanto | El fuego de San Telmo, que los marineros llamaban *corposanto*: penachos azulados en la punta de los mástiles durante las tormentas. San Telmo es el patrón de los navegantes (*tradición*). La línea es la carabela portuguesa, cuya cresta de gas hace de mástil. |
| Coronazul | Cresta como la corona solar, que es plasma (*hecho*). El Teide alberga observatorios solares. |
| Centellón | La centella o rayo en bola de las tormentas de montaña. |
| Mafasco | La Luz de Mafasca, en Fuerteventura: una luz azulada que acompaña a los caminantes de noche (*tradición*). |
| Mari | **[VERIFICAR]**, ver A.4. |

### A.6 Tanques por capítulo

| Capítulo | Físico | Mágico | Mixto o de apoyo |
| --- | --- | --- | --- |
| Iniciales | Talascrón | — | Dracendro |
| 1 | Carapachón | — | Mocarabeo |
| 2 | Bastilag, Guisandor | — | — |
| 3 | — | Noctilex | — |
| 4 | — | Madroñal | — |
| 5 | Gofrón | Viejarrón | — |
| 6 | Basajaur | Nivamandra | — |
| 7 | Silurón | — | Tamborón |
| 8 | — | Arquiteuto | Tronador |
| Rutas | — | — | Encinarca |
| Legendarios y fósiles | Cuélebre, Tarasca, Copito de Nieve, Padulonte, Testudrago | Mari | Turiasar |

Ningún capítulo se queda sin tanque. Los Tierra y Acero ya no son tanques por defecto:
Escarbraz y Bombardrak atacan o defienden, pero no son tanques.

### A.7 Reparto por tipos

Recuento de especies que tienen cada tipo, ya sea como primero o como segundo (v2):

| Tipo | Especies | Tipo | Especies | Tipo | Especies |
| --- | --- | --- | --- | --- | --- |
| Tierra | 31 | Oscuridad | 23 | Acero | 9 |
| Agua | 31 | Ancestral | 16 | Luz | 7 |
| Común | 27 | Planta | 15 | Espectral | 7 |
| Aire | 24 | Mental | 13 | Eléctrico | 6 |
| | | Infernal | 11 | Plasma | 6 |
| | | | | Hielo | 6 |

- **Ningún par de tipos aparece en más de tres líneas distintas.** Llegan a tres:
  Común/Tierra, Agua/Tierra, Mental/Oscuridad y Ancestral/Tierra.
- **Los tipos menos evidentes** (Hielo, Luz, Eléctrico, Plasma y Espectral) tienen entre 6 y 7
  especies cada uno, repartidas en al menos cuatro capítulos o zonas.
- **Aire baja de 32 a 24** con la revisión de las aves. **Agua sube a 31** por la fauna de
  buceo de Canarias y la carabela portuguesa.
- Con la tabla de tipos, **Común no tiene debilidades** y solo Espectral le resiste del todo;
  es el tipo más seguro para defender, y por eso abunda en las formas débiles.

### A.8 Segunda revisión: variedad del catálogo (v2)

El autor pidió revisar las 150 entradas comparando inspiración, silueta, hábitat, tipos, rol,
región y concepto visual, y recortar los motivos repetidos. Resultado:

| Motivo repetido | En la v1 | Cambio |
| --- | --- | --- |
| **Línea del drago** | Tres formas (Dralín → Dracauro → Dracendro). Dracauro solo era un drago a medio camino, sin idea propia. | Dos formas: Dralín → Dracendro, al nivel 26. Dracauro sale y sus rasgos pasan a las otras dos fichas. |
| **Aves** | 32 especies con Aire. Había cuatro aves marinas (Peláris, Paíñel, Gavirol y Aeralmar) y dos que ocupaban un hueco ya cubierto: Nidaltar, la cigüeña de campanario, y Cielazul, la forma intermedia del pinzón azul. | Salen Gavirol y Aeralmar (gaviotas), Nidaltar y Cielazul. Timplario, el canario convertido en timple, también sale: Canarín va solo. Aire baja a 24. |
| **Voladores con forma de torre** | Altatorre (vencejo «de torre») y Nidaltar (campanario). | Nidaltar sale. Altatorre pasa a llamarse **Falcivento**: el mismo vencejo, con nombre por sus alas en hoz y no por la torre. |
| **Rapaces** | Águila (Aquilín → Imperión), quebrantahuesos (Quebravén → Osifrago) y búho en tres formas (Noctiván → Archivex → Noctilex). | El búho queda en dos formas: sale Archivex, que no añadía nada entre las otras dos. Quedan tres rapaces con siluetas distintas: águila, buitre y búho. |
| **Córvidos** | Ya se habían quitado en la v1. | Se comprueba que no queda ninguno. |
| **Monstruos acorazados y fortalezas** | Muralliz (el lagarto muralla de Toledo) y Ferrumbrak (el topo de hierro), además de Bastilag, Talascrón, Mocarabeo y Guisandor. | Salen Muralliz y Ferrumbrak. Lizarco evoluciona directamente a Bastilag (nivel 30), y Toprón va solo. Tierra/Acero queda en dos especies. |
| **Serpientes marinas** | Ninguna repetida: el Cuélebre es alado y de río, Anguélix es una anguila y Arquiteuto un calamar. | Sin cambios. |
| **Crustáceos** | Solo la línea inicial y el percebe (la v1 ya había quitado otros dos cangrejos). | Sin cambios. |
| **Volcánicos y de carbón** | Magmalión (el geco que se volvía león de lava), Carboria → Grisón, Teazón, Guayota. | Sale Magmalión: Periván, el perenquén, va solo. Queda un volcánico, Guayota, y la línea del carbón en Asturias. |
| **Árboles que caminan** | Cuatro: Dracendro, Teazón, Encinarca y Palmerón. | Sale Palmerón. Quedan tres, con siluetas distintas: drago en paraguas, pino alto y recto, y encina ancha. |
| **Línea de San Telmo** | Paíñel → Telmario → Corposanto era otra ave marina más. | El fuego de San Telmo pasa a la **carabela portuguesa**, también llamada fragata portuguesa (Fragatín → Telmario → Corposanto), cuya vela de gas recuerda el mástil donde aparecía el fuego. Es Agua desde la primera forma y Plasma en las dos siguientes. |

**Lo que se queda aunque se parezca, y por qué:**
- **Dos cabras.** Baifín → Riscabra es la cabra doméstica de las majadas canarias; Carámbex →
  Nevárion es la cabra montés de Guadarrama, de tipo Hielo. Distinto hábitat, tipo y papel.
- **Dos escarabajos.** Broncero → Mocarabeo es un escarabajo pelotero de bronce y joya;
  Bombarín → Bombardrak es el escarabajo bombardero, que dispara un chorro hirviendo.
- **Tres lagartos.** Lizarco → Bastilag (lagarto ocelado de Castilla), Periván (un geco
  plano, de dedos adhesivos) y *Gallotia simonyi* (el gigante de El Hierro).

**Entradas nuevas.** Cubren huecos de fauna y folclore que no tenían representante:

| Especie | Qué es | Hueco que cubre |
| --- | --- | --- |
| Tarantón | La tarántula ibérica (*Lycosa tarantula*). *Tradición*: el tarantismo, el baile para curar su picadura **[VERIFICAR en La Mancha]**. | No había ningún arácnido. |
| Pinchorro | El erizo europeo. | Mamífero pequeño de huerta para el capítulo 2. |
| Meloncillo | *Herpestes ichneumon*, la única mangosta de Europa, de Doñana y Sierra Morena. | Fauna ibérica singular. |
| Basiliscón | *Tradición*: el basilisco que, según la leyenda, vivía en un pozo de la calle del Basilisco de Madrid **[VERIFICAR]**. | Folclore de Madrid para el capítulo 4. |
| Almadrabón | El atún rojo de la almadraba de Cádiz. | Pez grande y rápido; Cádiz era el puerto de las Indias en el siglo XVIII. |
| Oronjín → Matamoscón | La falsa oronja o matamoscas (*Amanita muscaria*): sale cerrada, como un huevo, y se abre en un sombrero rojo con motas blancas. Es tóxica y psicoactiva (*hecho*), de ahí Mental. | No había setas. |
| Tamborón | El tamboril, el pez globo de las costas canarias. | Tanque del capítulo 7. |
| Malpaisín | La musaraña canaria (*Crocidura canariensis*), endémica de Fuerteventura y Lanzarote, que vive en los malpaíses. | Fauna canaria endémica para la zona de Mafasca. |
| Magec | *Tradición guanche*: el sol, al que Guayota secuestró en el Teide. | Pareja de Guayota; sin él, la leyenda quedaba a medias. |
| Papemímico | Un recipiente que muerde. *Licencia*. | La sorpresa de las tinajas (ver su ficha). |

**Cambios en especies que se quedan:**
- **Lagartitán → *Gallotia simonyi*.** El autor pidió el lagarto gigante de El Hierro con su
  nombre científico. Es la única especie del juego con nombre real; en pantalla va sin
  cursiva.
- **Viejarrón:** de Agua a Agua/Planta. Es la vieja canaria (*Sparisoma cretense*), un pez loro
  que raspa algas de las rocas.
- **Brezuco → Trasgorn:** ya no evoluciona por nivel, sino con el **Gorro colorado**, el gorro
  rojo del trasgu, que está escondido en la Alhambra.
- **Talasonda:** eliminada del todo. No tenía concepto propio y las aves marinas sobraban;
  Peláris → Abisarda se queda en dos formas.
- **Tamborón** hace de tanque mixto del capítulo 7, el hueco que dejaba Palmerón.

**Longitud de las líneas.** De las 103 líneas, 63 son de una sola especie, 33 de dos formas y
7 de tres: las dos iniciales que no son el drago, Viperel, Lobaz, Fragatín, Ursalín y Broncero.

---

## Fase B. Tabla maestra

Los niveles de evolución son propuestas. «Final» significa que es la última forma de su línea.

### Iniciales (los da Isabel en Santa Fe, capítulo 1)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | Ignibue | Infernal | → Braverno (16) | Santa Fe | Inicial | Atacante físico | Cuadrúpedo: becerro | Península |
| 002 | Braverno | Infernal/Tierra | → Ignivárgoth (36) | — | Inicial | Atacante físico resistente | Cuadrúpedo: toro joven | Península |
| 003 | Ignivárgoth | Infernal/Tierra | Final | — | Inicial | Atacante físico pesado | Cuadrúpedo: toro colosal | Península |
| 004 | Marzuko | Agua | → Nakarra (16) | Santa Fe | Inicial | Explorador físico | Crustáceo pequeño | Costa atlántica |
| 005 | Nakarra | Agua | → Talascrón (36) | — | Inicial | Defensor físico | Crustáceo nadador | Costa atlántica |
| 006 | Talascrón | Agua/Acero | Final | — | Inicial | Tanque físico | Crustáceo ancho y bajo | Costa atlántica |
| 007 | Dralín | Planta | → Dracendro (26) | Santa Fe | Inicial | Apoyo resistente | Árbol joven | Canarias |
| 008 | Dracendro | Planta/Ancestral | Final | — | Inicial | Tanque mixto y apoyo | Árbol colosal que camina | Canarias |

### Capítulo 1. Granada, Santa Fe, la Vega y la Alhambra (1491–1492)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 009 | Zumbrel | Aire | → Diablisca (12) | Vega, acequias | Común | Velocista físico | Insecto volador | Andalucía |
| 010 | Diablisca | Aire/Infernal | Final | — | Poco común | Atacante rápido mixto | Insecto con cabeza de caballo | Cantabria (folclore) |
| 011 | Brezuco | Oscuridad | → Trasgorn (con el Gorro colorado) | Santa Fe y la Vega, de noche | Común | Apoyo evasivo | Duende encapuchado | Folclore peninsular |
| 012 | Trasgorn | Oscuridad | Final | Alhambra | Poco común | Control y engaño | Trasgo cojo de gorro rojo | Asturias y Cantabria (folclore) |
| 013 | Túmbriz | Común/Tierra | No evoluciona | Vega, mieses | Muy común | Explorador débil | Roedor excavador | Andalucía |
| 014 | Barbaflux | Agua | No evoluciona | Río Genil | Común | Atacante físico | Pez de río | Andalucía |
| 015 | Abezar | Aire | No evoluciona | Vega, taludes | Común | Velocista | Ave pequeña | Península |
| 016 | Mandragor | Planta/Mental | No evoluciona | Vega, lindes y olivares | Rara | Control de estado | Raíz que camina | Mediterráneo |
| 017 | Carapachón | Agua | No evoluciona | Acequias | Poco común | Tanque físico | Galápago | Sur peninsular |
| 018 | Alhambrón | Agua/Tierra | No evoluciona | Alhambra: el de Boabdil; salvaje en el Generalife tras vencerle | Muy rara | Atacante resistente | Escultura viva: león | Granada |
| 019 | Broncero | Tierra | → Escarbraz (18) | Vega, caminos de tierra | Común | Atacante físico | Escarabajo | Sur peninsular |
| 020 | Escarbraz | Tierra/Acero | → Mocarabeo (34) | Alhambra, adarves | Poco común | Defensor físico | Escarabajo de bronce | Sur peninsular |
| 021 | Mocarabeo | Acero/Luz | Final | — | Rara | Tanque de apoyo | Escarabajo joya | Granada |

### Capítulo 2. Toledo y Castilla (1516–1556)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 022 | Lizarco | Tierra | → Bastilag (30) | Campos de Castilla | Común | Explorador | Lagarto | Península |
| 023 | Bastilag | Tierra/Acero | Final | — | Rara | Tanque físico | Lagarto con cresta almenada | Castilla |
| 024 | Viperel | Oscuridad | → Viperion (20) | Cerros de Toledo | Común | Atacante de emboscada | Serpiente pequeña | Península |
| 025 | Viperion | Oscuridad | → Sierpeira (36) | — | Poco común | Atacante físico | Serpiente | Península |
| 026 | Sierpeira | Oscuridad/Tierra | Final | — | Rara | Atacante de control | Sierpe con cuernos | Leyendas de sierpes |
| 027 | Grávico | Común | → Gravitardo (24) | Llanos de Villalar | Común | Atacante físico | Ave esteparia | Castilla |
| 028 | Gravitardo | Común/Aire | Final | — | Poco común | Atacante resistente | Ave grande y pesada | Castilla |
| 029 | Aquilín | Aire | → Imperión (30) | Montes de Toledo | Rara | Velocista | Rapaz joven | Península (endémica) |
| 030 | Imperión | Aire/Luz | Final | — | Muy rara | Atacante rápido y apoyo | Águila heráldica | Península (endémica) |
| 031 | Lobaz | Común | → Lobregón (22) | Castilla, de noche | Común | Atacante físico | Cánido | Península |
| 032 | Lobregón | Común/Oscuridad | → Lobánima (nivel 38 en el Monte de las Ánimas) | — | Poco común | Atacante físico | Lobo | Península |
| 033 | Lobánima | Espectral/Oscuridad | Final | Soria (zona opcional) | Muy rara | Atacante mágico | Lobo espectral | Soria (Bécquer) |
| 034 | Guisandor | Tierra | No evoluciona | Toros de Guisando (Ávila) | Muy rara | Tanque físico | Escultura viva: toro de granito | Ávila |
| 035 | Tarantón | Oscuridad/Mental | No evoluciona | La Mancha, en los rastrojos | Poco común | Control | Araña lobo | Península |
| 036 | Pinchorro | Común | No evoluciona | Huertas de Castilla, de noche | Común | Defensor | Erizo | Península |

### Capítulo 3. El Escorial, Sevilla y el Guadalquivir (1556–1598)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 037 | Anguélix | Agua/Espectral | → Sargazón (26) | Guadalquivir | Común | Velocista mágico | Angula transparente | Atlántico y ríos |
| 038 | Sargazón | Agua/Espectral | Final | — | Poco común | Atacante mágico | Anguila | Atlántico y ríos |
| 039 | Tremolín | Agua/Eléctrico | → Tremielgón (28) | Desembocadura, en Sanlúcar | Poco común | Atacante mágico | Raya pequeña | Atlántico y Mediterráneo |
| 040 | Tremielgón | Agua/Eléctrico | Final | — | Rara | Control | Raya eléctrica | Atlántico y Mediterráneo |
| 041 | Golvín | Aire | → Falcivento (20) | Torres de Sevilla y El Escorial | Común | Velocista | Ave de alas en hoz | Península |
| 042 | Falcivento | Aire | Final | — | Poco común | Atacante rápido | Vencejo grande | Península |
| 043 | Lincel | Común | → Pardalión (30) | Doñana | Rara | Velocista físico | Felino joven | Península (endémico) |
| 044 | Pardalión | Común/Mental | Final | — | Muy rara | Atacante físico veloz | Lince | Península (endémico) |
| 045 | Noctiván | Oscuridad | → Noctilex (30) | Bosque de La Herrería, en El Escorial | Poco común | Atacante mágico | Búho | Península |
| 046 | Noctilex | Mental/Oscuridad | Final | Real Biblioteca de El Escorial | Rara | Tanque mágico | Búho guardián de páginas | El Escorial |
| 047 | Fragatín | Agua | → Telmario (22) | Sanlúcar, con temporal | Poco común | Explorador | Flotador pequeño con tentáculos | Atlántico y Canarias |
| 048 | Telmario | Agua/Plasma | → Corposanto (38) | — | Rara | Atacante mágico | Flotador con cresta como una vela | Atlántico y Canarias |
| 049 | Corposanto | Plasma/Agua | Final | — | Muy rara | Atacante mágico veloz | Flotador con cresta de plasma | Atlántico y Canarias |
| 050 | Meloncillo | Común | No evoluciona | Doñana y Sierra Morena | Poco común | Velocista | Mangosta | Sur peninsular |

### Capítulo 4. Madrid y su sierra (1598–1700)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 051 | Ardélix | Común | → Pinariel (20) | Casa de Campo y pinares | Común | Velocista físico | Ardilla | Península |
| 052 | Pinariel | Común/Planta | Final | — | Poco común | Apoyo | Ardilla con agujas de pino | Península |
| 053 | Umbrel | Oscuridad | → Sonumbra (22) | Cuevas de la sierra, en Patones | Común | Velocista | Murciélago | Península |
| 054 | Sonumbra | Oscuridad/Aire | Final | — | Poco común | Atacante mágico veloz | Murciélago grande | Península |
| 055 | Carámbex | Hielo | → Nevárion (30) | Peñalara | Poco común | Atacante veloz | Cabra joven | Sierra de Guadarrama |
| 056 | Nevárion | Hielo/Tierra | Final | — | Rara | Atacante físico resistente | Cabra montés | Sierra de Guadarrama |
| 057 | Fulgora | Luz | → Farolera (24) | Sierra, en noches de verano | Poco común | Apoyo | Gusano de luz | Península |
| 058 | Farolera | Luz/Aire | Final | — | Rara | Apoyo y control | Luciérnaga farol | Península |
| 059 | Velaria | Planta | → Ilusaria (22) | Pinares de Guadarrama | Poco común | Apoyo | Oruga | Centro peninsular |
| 060 | Ilusaria | Aire/Mental | Final | — | Rara | Control de estado | Mariposa nocturna | Centro peninsular |
| 061 | Madroñal | Planta | No evoluciona | Monte de El Pardo | Común | Tanque mágico y apoyo | Arbusto con frutos | Madrid |
| 062 | Orantis | Común | → Mantisanta (26) | Matorral de la sierra | Poco común | Atacante físico | Insecto orante pequeño | Península |
| 063 | Mantisanta | Mental | Final | — | Rara | Atacante físico y control | Mantis | Península |
| 064 | Basiliscón | Tierra/Mental | No evoluciona | Madrid, en un pozo de la calle del Basilisco | Muy rara | Control | Gallo serpiente | Madrid (leyenda) |

### Capítulo 5. Canarias (1700–1808)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 065 | Baifín | Común | → Riscabra (20) | Majadas de Tenerife | Muy común | Atacante físico | Cabrito | Canarias |
| 066 | Riscabra | Común | Final | — | Común | Atacante resistente | Cabra | Canarias |
| 067 | Periván | Tierra | No evoluciona | Santa Cruz: muros y malpaíses | Común | Explorador | Geco | Canarias |
| 068 | Peláris | Aire | → Abisarda (24) | Costas de La Gomera y El Hierro | Común | Explorador | Ave marina | Canarias |
| 069 | Abisarda | Agua/Aire | Final | — | Poco común | Atacante mágico | Ave buceadora | Canarias |
| 070 | Azulina | Aire | → Coronazul (32) | Pinar de Las Cañadas | Poco común | Velocista | Pinzón | Tenerife (endémico) |
| 071 | Coronazul | Aire/Plasma | Final | Teide | Muy rara | Atacante mágico y apoyo | Ave de corona solar | Tenerife |
| 072 | Canarín | Aire | No evoluciona | Tenerife y La Gomera | Común | Apoyo | Pájaro cantor | Canarias |
| 073 | Guacán | Oscuridad | → Tibicán (30) | Cueva del Viento, de noche | Poco común | Atacante físico | Perro lanudo | Canarias (folclore) |
| 074 | Tibicán | Oscuridad/Infernal | Final | — | Rara | Atacante físico | Perro demoníaco | Canarias (folclore) |
| 075 | Gofrón | Planta/Tierra | No evoluciona | Medianías del norte de Tenerife | Poco común | Tanque físico | Cuadrúpedo con muela de molino | Canarias |
| 076 | Teazón | Planta/Infernal | No evoluciona | Pinar canario | Poco común | Atacante resistente | Pino que camina | Canarias |
| 077 | Gallotia simonyi | Tierra | No evoluciona | El Hierro, en la Fuga de Gorreta | Muy rara | Atacante resistente | Lagarto gigante | El Hierro (endémico) |
| 078 | Arenín | Agua | → Escualión (30) | Buceo en el Mar de las Calmas | Poco común | Atacante de emboscada | Tiburón plano joven | Canarias |
| 079 | Escualión | Agua/Tierra | Final | — | Rara | Atacante físico | Angelote | Canarias |
| 080 | Viejarrón | Agua/Planta | No evoluciona | Buceo en el Mar de las Calmas | Común | Tanque mágico | Pez loro | Canarias |
| 081 | Almadrabón | Agua | No evoluciona | Prólogo en Cádiz: la almadraba | Rara | Velocista físico | Atún | Estrecho de Gibraltar |

### Capítulo 6. Zaragoza, Aragón y el Pirineo (1808–1898)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 082 | Ursalín | Común | → Ursabral (22) | Pirineo: valles de Ansó y Hecho | Poco común | Atacante físico | Osezno | Pirineo |
| 083 | Ursabral | Común/Tierra | → Basajaur (40) | — | Rara | Atacante resistente | Oso pardo | Pirineo |
| 084 | Basajaur | Ancestral/Tierra | Final | — | Muy rara | Tanque físico | Gigante del bosque | País Vasco y Navarra (folclore) |
| 085 | Quebravén | Aire | → Osifrago (30) | Ordesa | Poco común | Atacante físico | Buitre joven | Pirineo |
| 086 | Osifrago | Aire/Tierra | Final | — | Rara | Atacante que rompe defensas | Quebrantahuesos | Pirineo |
| 087 | Brumandra | Agua | → Nivamandra (28) | Ibones del Pirineo | Común | Apoyo | Salamandra | Pirineo |
| 088 | Nivamandra | Agua/Hielo | Final | — | Poco común | Tanque mágico | Salamandra de escarcha | Pirineo |
| 089 | Armiñel | Hielo | No evoluciona | Pirineo, en invierno | Rara | Velocista | Armiño | Pirineo |
| 090 | Marmel | Común | No evoluciona | Pirineo, en Benasque | Común | Defensor pequeño | Marmota | Pirineo |
| 091 | Bombarín | Infernal | → Bombardrak (26) | Riberas de Zaragoza | Común | Atacante mágico | Escarabajo pequeño | Península |
| 092 | Bombardrak | Acero/Infernal | Final | — | Poco común | Atacante resistente | Escarabajo cañón | Península |
| 093 | Cocorán | Oscuridad/Espectral | No evoluciona | Fuendetodos, de noche | Rara | Control | Sombra con forma (el Coco) | Folclore peninsular |
| 094 | Centellón | Plasma/Eléctrico | No evoluciona | Puertos del Pirineo, con tormenta | Muy rara | Atacante mágico veloz | Esfera de plasma | Pirineo |
| 095 | Oronjín | Planta | → Matamoscón (24) | Bosques del Pirineo, en otoño | Común | Apoyo | Seta cerrada, como un huevo | Pirineo y Cataluña |
| 096 | Matamoscón | Planta/Mental | Final | — | Poco común | Control de estado | Seta de sombrero rojo | Pirineo y Cataluña |

### Capítulo 7. Las Palmas, Madrid y el Ebro (1898–1939)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 097 | Pulpensa | Agua/Mental | No evoluciona | Playa de Las Canteras | Poco común | Control | Pulpo | Canarias |
| 098 | Tamborón | Agua | No evoluciona | Playa de Las Canteras | Común | Tanque mixto | Pez globo | Canarias |
| 099 | Nutrín | Agua | → Lutrón (26) | Ebro | Poco común | Velocista físico | Nutria joven | Península |
| 100 | Lutrón | Agua | Final | — | Rara | Atacante físico veloz | Nutria | Península |
| 101 | Grulín | Aire | → Grúvex (30) | Ebro, en invierno | Común | Explorador | Grulla joven | Península |
| 102 | Grúvex | Aire/Acero | Final | — | Poco común | Defensor | Grulla de cuello de grúa | Península |
| 103 | Silurón | Agua | No evoluciona | Embalses del Ebro, en Mequinenza | Rara | Tanque físico | Siluro | Ebro (introducido) |
| 104 | Jabatón | Común | → Jabalión (24) | Riberas del Ebro y la Casa de Campo | Muy común | Atacante físico | Jabato | Península |
| 105 | Jabalión | Común/Tierra | Final | — | Común | Atacante físico | Jabalí | Península |

### Capítulo 8. Asturias (1939–1975, propuesta)

El GDD tenía el capítulo 8 por decidir. El prompt propone Asturias; aquí se da por buena,
pendiente del autor.

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106 | Toprón | Tierra | No evoluciona | Cuencas mineras | Común | Explorador subterráneo | Topo | Península (endémico) |
| 107 | Carboria | Tierra | → Grisón (30) | Minas | Común | Atacante de desgaste | Criatura de carbón | Asturias |
| 108 | Grisón | Tierra/Infernal | Final | — | Poco común | Atacante pesado | Criatura de grisú | Asturias |
| 109 | Rayolito | Tierra/Eléctrico | → Tronador (32) | Prados tras la tormenta | Poco común | Defensor | Piedra viva | Asturias y Galicia (folclore) |
| 110 | Tronador | Eléctrico/Tierra | Final | — | Rara | Tanque mixto | Gólem de piedra del rayo | Asturias y Galicia (folclore) |
| 111 | Ambladín | Común | No evoluciona | Sierra del Sueve | Poco común | Velocista | Poni | Asturias |
| 112 | Urogallón | Aire/Planta | No evoluciona | Bosque de Muniellos | Rara | Atacante resistente | Gallo del bosque | Cordillera Cantábrica |
| 113 | Cirialma | Espectral/Luz | No evoluciona | Caminos, de noche | Rara | Apoyo y control | Procesión de luces | Asturias y Galicia (folclore) |
| 114 | Arquiteuto | Agua/Oscuridad | No evoluciona | Costa de Luarca, de noche | Muy rara | Tanque mágico | Calamar gigante | Cantábrico |
| 115 | Musguín | Planta/Oscuridad | No evoluciona | Picos de Europa | Poco común | Control | Duende de musgo | Cantabria (folclore) |

### Rutas entre capítulos (mitología de otras regiones)

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 116 | Percebín | Agua/Tierra | → Barnaclán (28) | Ruta de Galicia: Costa da Morte | Común | Defensor | Percebe | Galicia |
| 117 | Barnaclán | Agua/Aire | Final | — | Poco común | Explorador rápido | Ganso | Leyenda medieval |
| 118 | Pesantón | Mental/Oscuridad | No evoluciona | Ruta de Cataluña | Rara | Control (sueño) | Gato de pesadilla | Cataluña (folclore) |
| 119 | Yunquín | Agua/Acero | No evoluciona | Ruta de Mallorca: Serra de Tramuntana | Muy rara | Apoyo | Sapo pequeño | Mallorca (endémico) |
| 120 | Fameliet | Mental | No evoluciona | Ruta de Mallorca | Rara | Apoyo | Espíritu diminuto | Mallorca (folclore) |
| 121 | Bellotín | Planta | → Encinarca (28) | Ruta de Extremadura: la dehesa | Común | Apoyo | Bellota | Extremadura |
| 122 | Encinarca | Planta/Tierra | Final | — | Poco común | Tanque mixto | Encina que camina | Extremadura |
| 123 | Ojancón | Ancestral/Oscuridad | No evoluciona | Ruta de Cantabria | Muy rara | Atacante físico pesado | Gigante de un ojo | Cantabria (folclore) |

### Zonas opcionales

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 124 | Huesombra | Tierra/Espectral | No evoluciona | Atapuerca | Rara | Control defensivo | Animal de cueva | Invención del juego |
| 125 | Eulalba | Luz/Hielo | No evoluciona | Mérida | Rara | Apoyo | Paloma | Mérida (tradición) |
| 126 | Gárgoxel | Tierra/Oscuridad | No evoluciona | Burgos | Rara | Defensor de emboscada | Gárgola | Burgos |
| 127 | Mafasco | Plasma/Espectral | No evoluciona | Llanos de Mafasca, en Fuerteventura (zona nueva, propuesta) | Muy rara | Atacante mágico y control | Luz errante | Fuerteventura (folclore) |
| 128 | Malpaisín | Común | No evoluciona | Llanos de Mafasca: el malpaís | Rara | Velocista | Musaraña | Fuerteventura y Lanzarote (endémica) |

### Especial

| Nº | Nombre | Tipos | Línea | Dónde aparece | Rareza | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 129 | Papemímico | Oscuridad/Acero | No evoluciona | Dentro de las tinajas de cualquier capítulo (10 % al registrarlas) | Especial | Atacante resistente | Recipiente con mandíbula | Invención del juego |

### Legendarios (uno por partida)

| Nº | Nombre | Tipos | Dónde aparece | Rol | Silueta | Origen |
| --- | --- | --- | --- | --- | --- | --- |
| 130 | Mari | Mental/Plasma **[VERIFICAR]** | Anboto (guarida de legendario) | Tanque mágico y control | Diosa de agua y niebla | País Vasco (mitología) |
| 131 | Cuélebre | Ancestral/Agua | Covadonga | Tanque físico | Serpiente alada | Asturias y Cantabria (mitología) |
| 132 | Guayota | Infernal/Oscuridad | Teide, tras el capítulo 5 | Atacante pesado mixto | Gigante humano hecho de volcán, con el sol robado en la mano | Tenerife (mitología guanche) |
| 133 | Magec | Luz/Ancestral | Cumbre del Teide, al amanecer, tras vencer a Guayota | Atacante mágico | Disco solar con forma | Tenerife (mitología guanche) |
| 134 | Nuberu | Eléctrico/Aire | Puertos de Asturias, con tormenta | Atacante mágico y control | Nube de tormenta | Asturias (mitología) |
| 135 | Tarasca | Ancestral/Oscuridad | Granada, en el Corpus, tras la Liga | Tanque físico y control | Dragón de procesión | Corpus Christi |
| 136 | Alcorax | Ancestral/Infernal | Zaragoza, tras el gimnasio | Atacante mágico pesado | Dragón alado | Aragón (tradición de San Jorge) |
| 137 | Babieca | Común/Acero | Burgos (San Pedro de Cardeña), con el ánima del Cid | Velocista físico | Caballo de guerra | Castilla |
| 138 | Rocinante | Común | La Mancha, ruta del capítulo 4 | Apoyo evasivo | Caballo flaco | El Quijote |
| 139 | Platero | Común | Moguer, desde el capítulo 3 | Apoyo defensivo | Burro | Platero y yo |
| 140 | Copito de Nieve | Común | Barcelona, tras la Liga | Tanque físico | Gorila albino | Zoo de Barcelona |
| 141 | Ratón Pérez | Común/Mental | Madrid, en la calle del Arenal (capítulo 7) | Apoyo veloz | Ratón | Madrid (Luis Coloma) |

### Fósiles (los revive el Dr. Jangel)

| Nº | Nombre | Tipos | Taxón, yacimiento y dónde se consigue | Rol | Silueta |
| --- | --- | --- | --- | --- | --- |
| 142 | Orcegar | Ancestral | *Homotherium latidens*, Venta Micena (Orce). Regalo del pastor de Orce, capítulo 1 | Velocista físico | Felino de dientes de cimitarra |
| 143 | Machairón | Ancestral/Común | *Machairodus aphanistus*, Cerro de los Batallones (Madrid). Capítulo 4 | Atacante físico pesado | Felino de dientes de sable |
| 144 | Hienarca | Ancestral | *Pachycrocuta brevirostris*, Venta Micena. Orce, al volver con el laboratorio abierto | Atacante resistente | Hiena gigante |
| 145 | Padulonte | Ancestral/Hielo | Mamut lanudo de Padul (Granada) [VERIFICAR especie]. Padul, al volver | Tanque físico | Mamut |
| 146 | Concavex | Ancestral | *Concavenator corcovatus*, Las Hoyas (Cuenca). Ruta del capítulo 2 | Atacante físico | Terópodo con joroba |
| 147 | Pelicanox | Ancestral/Agua | *Pelecanimimus polyodon*, Las Hoyas. Ruta del capítulo 2 | Velocista | Dinosaurio de hocico largo |
| 148 | Iberomés | Ancestral/Aire | *Iberomesornis romerali*, Las Hoyas. Ruta del capítulo 2 | Velocista | Ave primitiva |
| 149 | Turiasar | Ancestral/Tierra | *Turiasaurus riodevensis*, Riodeva (Teruel). Capítulo 6 | Tanque mixto | Saurópodo |
| 150 | Testudrago | Ancestral/Tierra | *Centrochelys burchardi*, Tenerife. Capítulo 5 | Tanque físico | Tortuga gigante |

---

## Fase C. Fichas

### Iniciales

#### 001 Ignibue

1. **Nombre:** Ignibue.
2. **Tipos:** Infernal. El calor le sale de dentro: grietas encendidas y pezuñas que humean.
3. **Línea:** Ignibue → Braverno (nivel 16) → Ignivárgoth (nivel 36).
4. **Inspiración:**
   - *Hecho*: el becerro, la cría del toro.
   - *Tradición*: los «toros de fuego» de las fiestas.
   - *Licencia*: que tenga fuego propio.
5. **Ubicación y rareza:** inicial. Isabel lo ofrece en Santa Fe y no sale salvaje.
6. **Rol:** atacante físico.
7. **Estadísticas:** 44 / 62 / 44 / 46 / 44 / 66 = **306**.
8. **EXP:** ×1,00.
9. **Movimientos:**
   - **Topetazo** (Común, físico, 40): golpe básico.
   - **Bramido** (Común, estado): baja un nivel la Fuerza del rival.
   - **Rescoldo** (Infernal, mágico, 40): 10 % de quemar.
   - **Cornada ardiente** (Infernal, físico, 70): 10 % de quemar.
10. **Bestiario:** «En las fiestas de muchos pueblos sale de noche un toro de fuego: un armazón
    con forma de toro, cargado de cohetes, que alguien lleva a hombros. Ignibue embiste igual,
    pero el fuego es suyo».
11. **Imagen:**
    - **Silueta:** becerro compacto de cuatro patas, cabeza grande respecto al cuerpo y patas
      cortas y firmes.
    - **Paleta:** pelaje rojo oscuro, casi granate; hocico y vientre más claros; brillos
      naranjas.
    - **Detalles:**
      - Astas pequeñas, negras y romas, con grietas por las que asoma un resplandor naranja.
      - Cresta de pelo corto y erizado entre los cuernos, como carbón encendido en las puntas.
      - Pezuñas negras de las que sube un humo fino.
    - **Cara:** ojos grandes, ámbar y desafiantes; hocico ancho con dos volutas de vapor.
    - **Postura:** patas delanteras abiertas y cabeza baja, a punto de embestir.
    - **Lo que no debe ser:** un toro corriente con llamas pegadas. El fuego sale de las grietas
      del cuerpo.
12. **Fuentes:** [Toro de fuego (Wikipedia)](https://en.wikipedia.org/wiki/Toro_de_fuego).

#### 002 Braverno

1. **Nombre:** Braverno.
2. **Tipos:**
   - Infernal, por el fuego de su interior.
   - Tierra, por las placas de basalto que le crecen al endurecerse la lava de su piel.
3. **Línea:** viene de Ignibue (nivel 16) y evoluciona a Ignivárgoth (nivel 36).
4. **Inspiración:**
   - *Hecho*: el novillo y el basalto.
   - *Licencia*: la lava que forma su coraza.
5. **Ubicación y rareza:** evolución de inicial.
6. **Rol:** atacante físico resistente.
7. **Estadísticas:** 62 / 85 / 62 / 60 / 56 / 80 = **405**.
8. **EXP:** ×1,10.
9. **Movimientos:**
   - **Cornada ardiente** (Infernal, físico, 70): 10 % de quemar.
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Acometida** (Común, físico, 40): ataca siempre primero.
   - **Bramido** (Común, estado): −1 a la Fuerza del rival.
10. **Bestiario:** «El basalto es lava que se enfrió deprisa. Es la roca de la que están hechas
    buena parte de las islas volcánicas, Canarias incluida».
11. **Imagen:**
    - **Silueta:** toro joven de hombros anchos, más alto que Ignibue y con el cuello ya grueso.
    - **Paleta:** rojo oscuro con placas gris negras y grietas de un naranja intenso.
    - **Detalles:**
      - Placas de basalto con forma de columnas hexagonales cortas en la frente, el pecho y las
        patas delanteras.
      - Cuernos más largos, como roca volcánica pulida, ligeramente curvados hacia delante.
      - Las grietas incandescentes recorren el pelaje entre las placas.
    - **Cara:** ojos naranjas entrecerrados y morro con vaho caliente.
    - **Postura:** embestida, con una pezuña delantera rascando el suelo.
    - **Diferencia con Ignibue:** ya tiene coraza mineral y el fuego asoma entre las placas. Sus
      proporciones son de adolescente: patas largas y cuerpo todavía estrecho.
12. **Fuentes:** dato geológico general. Basta citar el IGME o cualquier manual de geología.

#### 003 Ignivárgoth

1. **Nombre:** Ignivárgoth.
2. **Tipos:**
   - Infernal: es un toro con el corazón como un volcán.
   - Tierra: cuello acorazado de obsidiana y pezuñas de roca fundida.
3. **Línea:** forma final. Viene de Braverno (nivel 36).
4. **Inspiración:**
   - *Hecho*: el toro bravo y la obsidiana.
   - *Historia*: los bueyes en llamas de Helike.
   - *Licencia*: lo demás.
5. **Ubicación y rareza:** evolución final de inicial.
6. **Rol:** atacante físico pesado. Pega muy fuerte y es rápido para su tamaño. Sus defensas
   mágicas son discretas.
7. **Estadísticas:** 85 / 120 / 85 / 75 / 70 / 95 = **530**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Cornada ardiente** (Infernal, físico, 70): 10 % de quemar.
   - **Colada** *(nuevo)* (Infernal, físico, 100, 85 %): 10 % de quemar.
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Hoguera** (Infernal, mágico, 90, 85 %): 10 % de quemar.
   - **Bramido** (Común, estado): −1 a la Fuerza del rival.
10. **Bestiario:** «Diodoro de Sicilia cuenta que en el 228 a. C., en Helike, los oretanos
    lanzaron contra el ejército de Amílcar Barca carros de bueyes cargados de leña ardiendo.
    Dónde estaba Helike sigue en discusión».
11. **Imagen:**
    - **Silueta:** toro colosal, más ancho que alto, con una giba de músculo y roca sobre los
      hombros.
    - **Paleta:** negro obsidiana, rojo brasa y naranja de lava, con algún reflejo vítreo.
    - **Detalles:**
      - Cuello cubierto de placas de obsidiana superpuestas como escamas grandes.
      - Cuernos asimétricos que parecen coladas de lava solidificada, uno más largo y retorcido.
      - Melena corta de brasas sobre la nuca.
      - Pezuñas de roca fundida que dejan huellas brillantes.
    - **Cara:** ojos amarillo blanco, como metal al rojo; ollares que sueltan chispas.
    - **Postura:** cabeza baja y cuernos al frente. La tierra se agrieta bajo su peso.
    - **Diferencia con Braverno:** el tamaño, la obsidiana vítrea en lugar del basalto mate, y
      unos cuernos que son ya coladas volcánicas.
12. **Fuentes:**
    - [Batalla de Helike (Wikipedia)](https://en.wikipedia.org/wiki/Battle_of_Helike).
    - [Batalla de Helike (Hispanopedia)](https://es.hispanopedia.com/wiki/Batalla_de_Helike).
    - Es fuente antigua única, Diodoro **[VERIFICAR la cita exacta]**.

#### 004 Marzuko

1. **Nombre:** Marzuko.
2. **Tipos:** Agua. Es un crustáceo de charco de marea.
3. **Línea:** Marzuko → Nakarra (nivel 16) → Talascrón (nivel 36).
4. **Inspiración:**
   - *Hecho*: los cangrejos de costa y la muda.
   - *Licencia*: el diseño.
5. **Ubicación y rareza:** inicial.
6. **Rol:** explorador físico equilibrado.
7. **Estadísticas:** 46 / 58 / 64 / 42 / 50 / 50 = **310**.
8. **EXP:** ×1,00.
9. **Movimientos:**
   - **Tenaza** (Común, físico, 55).
   - **Rociada** (Agua, mágico, 40).
   - **Caparazón** (Agua, estado): +1 al Escudo propio.
   - **Bramido** (Común, estado): −1 a la Fuerza del rival.
10. **Bestiario:** «Para crecer, los cangrejos mudan el caparazón: se desprenden del viejo y
    pasan unos días blandos y escondidos hasta que endurece el nuevo».
11. **Imagen:**
    - **Silueta:** crustáceo pequeño, redondeado y ancho, con las patas cortas abiertas a los
      lados.
    - **Paleta:** azul verdoso con manchas blancas como espuma y el vientre crema.
    - **Detalles:**
      - Pinzas desiguales: la derecha grande y redonda, la izquierda fina y rápida.
      - Caparazón liso y orgánico. Nada metálico todavía.
    - **Cara:** ojos negros brillantes sobre pedúnculos cortos; boca pequeña que hace burbujas.
    - **Postura:** de lado y con la pinza grande levantada, entre curioso y bravucón.
12. **Fuentes:** biología general de los crustáceos.

#### 005 Nakarra

1. **Nombre:** Nakarra.
2. **Tipos:** Agua. Es un cangrejo nadador.
3. **Línea:** viene de Marzuko (nivel 16) y evoluciona a Talascrón (nivel 36).
4. **Inspiración:** *Hecho*: la nécora (*Necora puber*), con sus ojos rojos, su caparazón
   aterciopelado y sus patas traseras como remos.
5. **Ubicación y rareza:** evolución de inicial.
6. **Rol:** defensor físico, más ágil de lo que aparenta.
7. **Estadísticas:** 64 / 74 / 90 / 50 / 66 / 61 = **405**.
8. **EXP:** ×1,10.
9. **Movimientos:**
   - **Tenaza** (Común, físico, 55).
   - **Brazada** *(nuevo)* (Agua, físico, 40): ataca siempre primero. Nada con las patas remo.
   - **Marejada** (Agua, mágico, 65).
   - **Caparazón** (Agua, estado): +1 al Escudo propio.
10. **Bestiario:** «La nécora tiene los ojos rojos y el último par de patas aplanado como
    remos, con el que nada. Tiene fama de agresiva y peleona».
11. **Imagen:**
    - **Silueta:** cangrejo ancho, más plano que Marzuko, con el borde del caparazón dentado.
    - **Paleta:** pardo petróleo con reflejos azulados en las articulaciones y marcas de marea en
      tono arena mojada.
    - **Detalles:**
      - Superficie aterciopelada de pelillos cortos.
      - Pinza derecha grande y maciza; la izquierda fina y cortante.
      - Las dos patas traseras planas y anchas como remos, con el borde azul.
    - **Cara:** ojos rojo intenso, muy visibles.
    - **Postura:** en guardia, con las pinzas cruzadas delante del cuerpo.
    - **Diferencia con Marzuko:** el caparazón dentado y las patas remo. Los ojos rojos son lo
      más reconocible.
12. **Fuentes:**
    - [Ficha de *Necora puber* (MarLIN)](https://marlin.ac.uk/species/detail/1181).
    - [Revista *Distribución y Consumo*, MAPA, 2007](https://www.mapa.gob.es/ministerio/pags/Biblioteca/Revistas/pdf_DYC/DYC_2007_93_108_112.pdf).

#### 006 Talascrón

1. **Nombre:** Talascrón.
2. **Tipos:**
   - Agua, porque es un centollo.
   - Acero: su caparazón se mineraliza en placas que parecen metal marino erosionado. Es
     licencia, pero se ve.
3. **Línea:** forma final. Viene de Nakarra (nivel 36).
4. **Inspiración:**
   - *Hecho*: el centollo y el camuflaje de los cangrejos araña, que se cubren de algas.
   - *Licencia*: el metal.
5. **Ubicación y rareza:** evolución final de inicial.
6. **Rol:** tanque físico.
   - Puntos débiles: es lento (Celeridad 60) y tiene poca Magia.
   - Con la tabla de tipos, es muy débil a Plasma (×4) y débil a Tierra y Eléctrico.
7. **Estadísticas:** 100 / 95 / 130 / 55 / 90 / 60 = **530**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Golpe de mar** (Agua, físico, 80, 90 %).
   - **Tajo** (Acero, físico, 70, 95 %).
   - **Coraza** (Acero, estado): +2 al Escudo propio.
   - **Camuflaje de algas** *(nuevo)* (Agua, estado): +1 al Escudo y +1 a la Resistencia
     mágica propios.
   - **Remanso** (Agua, estado): recupera la mitad de la Vida.
10. **Bestiario:** «Los cangrejos araña, la familia del centollo, se enganchan algas y otros
    organismos al caparazón para pasar desapercibidos [VERIFICAR en el centollo adulto]».
11. **Imagen:**
    - **Silueta:** muy ancho y bajo, más ancho que alto. Cuerpo triangular redondeado, como un
      centollo, sobre ocho patas gruesas y cortas plantadas en abanico.
    - **Paleta:** rojo teja oscuro y gris acero envejecido, con verdes de alga y algún blanco
      de sal.
    - **Detalles:**
      - Caparazón cubierto de espinas cortas y romas, con placas que parecen metal marino
        erosionado y remachado por la naturaleza.
      - Algas y pequeñas conchas prendidas al lomo como un manto.
      - Pinzas pesadas y asimétricas: una ancha como un mazo y otra larga como una tenaza.
    - **Cara:** ojos pequeños y hundidos entre dos cuernos rostrales, mirada tranquila de
      fortaleza.
    - **Postura:** agachado, con el centro de gravedad casi en el suelo. Imposible de volcar.
    - **Diferencia con Nakarra:** pierde la agilidad del nadador y gana masa, espinas, placas
      y el manto de algas.
12. **Fuentes:**
    - [Decoración en *Maja crispata*, Acta Adriatica](https://hrcak.srce.hr/en/5035).
    - [Camuflaje en cangrejos decoradores, Cambridge](https://www.cambridge.org/core/books/animal-camouflage/camouflage-in-decorator-crabs/61579D5EB65EA0B1F52C693E8396EE45).

#### 007 Dralín

1. **Nombre:** Dralín.
2. **Tipos:** Planta. Es un retoño de drago.
3. **Línea:** Dralín → Dracendro (nivel 26). Es la única inicial de dos formas: evoluciona
   más tarde que las otras a su segunda forma, pero esa ya es la final.
4. **Inspiración:** *Hecho*: el drago canario (*Dracaena draco*) y su savia roja.
5. **Ubicación y rareza:** inicial.
6. **Rol:** apoyo resistente. Aguanta y desgasta más que pega.
7. **Estadísticas:** 54 / 44 / 56 / 62 / 66 / 48 = **330**. Algo más que las otras iniciales,
   porque pasa diez niveles más en su primera forma.
8. **EXP:** ×1,00.
9. **Movimientos:**
   - **Varazo** (Planta, físico, 45).
   - **Hojarasca** (Planta, mágico, 55).
   - **Sopor** (Planta, estado, 75 %): duerme al rival.
   - **Desplante** (Común, estado): −1 al Escudo del rival.
   - **Savia de dragón** (Planta, mágico, 60): recupera la mitad del daño que hace. La aprende
     al nivel 20.
10. **Bestiario:** «El drago crece en Canarias, Madeira, Cabo Verde y Marruecos. No forma
    anillos en el tronco: su edad solo se estima contando las veces que se ha ramificado. Su
    savia se vuelve roja al secarse, y se vendía como “sangre de drago”».
11. **Imagen:**
    - **Silueta:** retoño pequeño y rechoncho: tronco corto y gordo sobre raíces que hacen de
      pies.
    - **Paleta:** tronco gris plata con la base rojiza; hojas verde azulado.
    - **Detalles:**
      - Penacho de hojas largas y rígidas como espadas, abierto en abanico.
      - Ya tiene una pequeña bifurcación en la copa: la primera de muchas.
      - Una gota de savia roja en una herida de la corteza.
    - **Cara:** dos ojos oscuros y redondos en el tronco, bajo las hojas; sin boca visible.
    - **Postura:** erguido y con los «pies» de raíz bien plantados, como un niño que aguanta el
      viento.
12. **Fuentes:**
    - [El Drago Milenario (Wikipedia)](https://en.wikipedia.org/wiki/El_Drago_Milenario).
    - [Estudio sobre el drago, ULPGC](https://mdc.ulpgc.es/files/original/b3874bba159d4212f63383b14ff7522cf5d38bcb.pdf).

#### 008 Dracendro

1. **Nombre:** Dracendro.
2. **Tipos:**
   - Planta.
   - Ancestral: un drago de siglos, unido al mito del dragón Ladón.
3. **Línea:** forma final. Viene de Dralín (nivel 26).
4. **Inspiración:**
   - *Hecho*: el Drago Milenario de Icod de los Vinos.
   - *Tradición*: la leyenda que hace nacer los dragos de la sangre del dragón Ladón, que
     guardaba el jardín de las Hespérides **[VERIFICAR la fuente antigua]**.
5. **Ubicación y rareza:** evolución final de inicial.
6. **Rol:** tanque mixto y apoyo. Aguanta golpes de los dos tipos y se cura.
   - Puntos débiles: es lento y tiene poca Fuerza.
   - Con la tabla de tipos, es muy débil a Hielo (×4) y débil a Aire, Infernal y Ancestral.
7. **Estadísticas:** 100 / 70 / 100 / 100 / 105 / 55 = **530**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Savia de dragón** (Planta, mágico, 60): drena.
   - **Ira ancestral** (Ancestral, mágico, 85).
   - **Resina roja** *(nuevo)* (Planta, estado): recupera la mitad de la Vida. La sangre de drago
     se usó como remedio.
   - **Sopor** (Planta, estado, 75 %).
   - **Hojarasca** (Planta, mágico, 55).
10. **Bestiario:** «Al Drago Milenario de Icod de los Vinos se le llama milenario, pero un
    estudio de 1975 le calculó unos 250 años. Mide unos 21 metros».
11. **Imagen:**
    - **Silueta:** árbol colosal que camina sobre raíces como columnas. Tronco escultórico y
      retorcido, y una copa enorme de brazos que se bifurcan una y otra vez, en forma de
      paraguas.
    - **Paleta:** gris plata, rojo sangre de la resina y verde azulado de las hojas.
    - **Detalles:**
      - Corteza con pliegues profundos, como piedra tallada.
      - Penachos de hojas en espada en las puntas de cada brazo.
      - Resina roja brillante que corre por canales del tronco.
      - Raíces aéreas que bajan del tronco como barbas.
    - **Cara:** dos ojos ámbar en una hendidura del tronco, sabios y tranquilos.
    - **Postura:** majestuosa e inmóvil, como un monumento.
    - **Lo que no debe tener:** alas, cabeza de reptil ni anatomía de dragón. Lo «dragón» es
      solo el nombre y la sangre roja.
    - **Diferencia con Dralín:** la escala; el tronco engrosa y se retuerce, la copa se
      ramifica en muchos brazos y las raíces se vuelven columnas.
12. **Fuentes:**
    - [El Drago Milenario (Wikipedia)](https://en.wikipedia.org/wiki/El_Drago_Milenario).
    - [Drago Milenario (Atlas Obscura)](https://www.atlasobscura.com/places/drago-milenario-millennial-dragon-tree).

### Capítulo 1

#### 009 Zumbrel

1. **Nombre:** Zumbrel.
2. **Tipos:** Aire. Es un insecto volador.
3. **Línea:** Zumbrel → Diablisca (nivel 12).
4. **Inspiración:** *Hecho*: la libélula. En muchas regiones las llaman «caballitos del
   diablo».
5. **Ubicación y rareza:** acequias de la Vega. Común.
6. **Rol:** velocista físico.
7. **Estadísticas:** 38 / 48 / 34 / 38 / 36 / 76 = **270**.
8. **EXP:** ×0,75.
9. **Movimientos:**
   - **Aletazo** (Aire, físico, 40).
   - **Acometida** (Común, físico, 40): ataca siempre primero.
   - **Revoloteo** (Aire, estado): +1 a la Celeridad propia.
   - **Picada** (Aire, físico, 65, 95 %).
10. **Bestiario:** «Las libélulas mueven cada una de sus cuatro alas por separado. Así pueden
    quedarse quietas en el aire, girar en seco o volar hacia atrás».
11. **Imagen:**
    - **Silueta:** libélula pequeña y estilizada: abdomen largo y fino, y cuatro alas
      transparentes extendidas en cruz.
    - **Paleta:** abdomen turquesa segmentado con anillos negros; alas transparentes con venas
      finas en verde dorado.
    - **Detalles:** las venas de las alas forman un dibujo geométrico, como de celosía.
    - **Cara:** ojos facetados enormes y verdes que ocupan casi toda la cabeza.
    - **Postura:** suspendida en el aire, ligeramente inclinada hacia delante.
12. **Fuentes:**
    - [Natural History Museum, 2018](https://www.nhm.ac.uk/discover/news/2018/june/dragonfly-wings-could-inspire-new-aeroplane-flight-control).
    - [Estudio sobre el vuelo de las libélulas (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC2607445).

#### 010 Diablisca

1. **Nombre:** Diablisca.
2. **Tipos:**
   - Aire.
   - Infernal: los caballucos del diablu son demonios de fuego.
3. **Línea:** viene de Zumbrel (nivel 12). Forma final.
4. **Inspiración:**
   - *Tradición cántabra*: los caballucos del diablu, caballos con alas de libélula que en la
     noche de San Juan pisotean los tréboles de cuatro hojas y la flor del agua.
   - *Licencia*: que sea la evolución de una libélula de Granada.
5. **Ubicación y rareza:** por evolución. Poco común.
6. **Rol:** atacante rápido mixto.
7. **Estadísticas:** 60 / 72 / 55 / 82 / 58 / 103 = **430**.
8. **EXP:** ×1,05.
9. **Movimientos:**
   - **Picada** (Aire, físico, 65, 95 %).
   - **Rescoldo** (Infernal, mágico, 40): 10 % de quemar.
   - **Ventolera** (Aire, mágico, 55).
   - **Tizne** (Infernal, estado, 85 %): quema al rival.
   - **Hoguera** (Infernal, mágico, 90, 85 %).
10. **Bestiario:** «En Cantabria se cuenta que la noche de San Juan salen los caballucos del
    diablu, caballos con alas de libélula, a destrozar los tréboles de cuatro hojas que los
    mozos buscan al amanecer».
11. **Imagen:**
    - **Silueta:** insecto alado del tamaño de un perro. Cuerpo de libélula con cabeza alargada
      de caballo y una crin corta y erizada.
    - **Paleta:** abdomen negro carbón con anillos rojo brasa; alas ahumadas con el borde
      incandescente.
    - **Detalles:**
      - Cuatro alas grandes, oscuras como cristal tiznado.
      - Patas finas y curvas como garfios.
      - Chispas que se desprenden de la crin.
    - **Cara:** ojos facetados rojos y boca con espuma oscura (*tradición*: «bocas espumosas»).
    - **Postura:** en picado, con las alas en V.
    - **Diferencia con Zumbrel:** la cabeza equina, el fuego en los bordes y el color de noche.
12. **Fuentes:**
    - [Caballucos del Diablu (Wikipedia)](https://en.wikipedia.org/wiki/Caballucos_del_Diablu).
    - [Caballucos del Diablo (es-academic)](https://es-academic.com/dic.nsf/eswiki/200500).
    - **[VERIFICAR]** con bibliografía etnográfica cántabra, por ejemplo Manuel Llano.

#### 011 Brezuco

1. **Nombre:** Brezuco.
2. **Tipos:** Oscuridad. Es travieso, nocturno y escurridizo.
3. **Línea:** Brezuco → Trasgorn, con el **Gorro colorado** (objeto de evolución escondido en
   la Alhambra).
4. **Inspiración:**
   - *Tradición*: el duende doméstico.
   - *Licencia*: la capucha de brezo.
5. **Ubicación y rareza:** Santa Fe y la Vega, de noche. Común.
6. **Rol:** apoyo evasivo.
7. **Estadísticas:** 40 / 45 / 42 / 55 / 50 / 70 = **302**.
8. **EXP:** ×0,85.
9. **Movimientos:**
   - **Trastada** (Oscuridad, físico, 40).
   - **Desplante** (Común, estado): −1 al Escudo del rival.
   - **Mal de ojo** (Oscuridad, mágico, 65): 20 % de bajar la Resistencia mágica del rival.
   - **Acometida** (Común, físico, 40): ataca siempre primero.
10. **Bestiario:** «La palabra *duende* viene de *duen de casa*: el dueño de la casa. Por eso
    vive en las casas y se cree con derecho a todo lo que hay en ellas».
11. **Imagen:**
    - **Silueta:** ser diminuto y encorvado, casi todo capucha.
    - **Paleta:** marrones y morados apagados del brezo seco, con dos puntos de luz amarilla en
      los ojos.
    - **Detalles:**
      - Capucha de ramitas y flores secas de brezo entretejidas.
      - Manos largas y finas, con dedos de más.
      - Hojas secas pegadas al manto.
    - **Cara:** solo se ven los ojos brillando en la sombra de la capucha.
    - **Postura:** agazapado, con algo robado entre las manos (una llave o una cuchara).
12. **Fuentes:** [*Duende*, Diccionario de la lengua española](https://dle.rae.es/duende).

#### 012 Trasgorn

1. **Nombre:** Trasgorn.
2. **Tipos:** Oscuridad. Se quita el Espectral del prompt: el trasgu es un trasgo, no un
   alma.
3. **Línea:** viene de Brezuco cuando se le da el Gorro colorado. Forma final.
4. **Inspiración:** *Tradición asturiana, cántabra y gallega*: el trasgu.
   - Cojo, con un gorro rojo picudo y un agujero en la mano izquierda.
   - Revuelve la casa por la noche.
   - Para echarlo se le encargan tareas imposibles.
5. **Ubicación y rareza:** palacios de la Alhambra, de noche. Poco común.
6. **Rol:** control y engaño.
7. **Estadísticas:** 62 / 70 / 60 / 85 / 70 / 98 = **445**.
8. **EXP:** ×1,10.
9. **Movimientos:**
   - **Emboscada** (Oscuridad, físico, 70).
   - **Mal de ojo** (Oscuridad, mágico, 65): 20 % de bajar la Resistencia mágica del rival.
   - **Tarea imposible** *(nuevo)* (Oscuridad, estado, 90 %): −1 a la Fuerza y −1 a la
     Celeridad del rival, que se queda entretenido.
   - **Trastada** (Oscuridad, físico, 40).
   - **Desplante** (Común, estado): −1 al Escudo del rival.
10. **Bestiario:** «El trasgu lleva gorro rojo y tiene un agujero en la mano izquierda. Para
    librarse de él se le manda recoger un celemín de linaza derramada: como se le cuela por el
    agujero, nunca termina y acaba por marcharse».
11. **Imagen:**
    - **Silueta:** criatura menuda y nerviosa, de extremidades largas, que cojea de la pierna
      derecha.
    - **Paleta:** piel morena terrosa y gorro y ropa rojo vivo.
    - **Detalles:**
      - Gorro picudo y rojo, demasiado grande, que le tapa media frente.
      - En la palma izquierda, un agujero redondo por el que se ve el otro lado.
      - Una cola fina, que es licencia.
    - **Cara:** sonrisa traviesa enorme y ojos amarillos rasgados.
    - **Postura:** saltando sobre un pie, con unos granos que se le escapan de la mano agujereada.
    - **Lo que no debe ser:** un demonio genérico ni un humano disfrazado. Es una criatura del
      hogar.
    - **Diferencia con Brezuco:** cambia la capucha de brezo por el gorro rojo. Crece en altura
      y en descaro.
12. **Fuentes:**
    - [Trasgu (Wikipedia)](https://en.wikipedia.org/wiki/Trasgu).
    - [Trasgo (EcuRed)](https://www.ecured.cu/Trasgo).
    - **[VERIFICAR]** la tarea de la linaza en una recopilación académica, por ejemplo la de
      Aurelio de Llano.

#### 013 Túmbriz

1. **Nombre:** Túmbriz.
2. **Tipos:**
   - Común: fauna corriente.
   - Tierra: vive excavando galerías.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: el topillo mediterráneo (*Microtus duodecimcostatus*).
5. **Ubicación y rareza:** mieses de la Vega. Muy común.
6. **Rol:** explorador débil. Es la criatura del primer encuentro.
7. **Estadísticas:** 35 / 50 / 38 / 25 / 35 / 67 = **250**.
8. **EXP:** ×0,65.
9. **Movimientos:**
   - **Topetazo** (Común, físico, 40).
   - **Bramido** (Común, estado): −1 a la Fuerza del rival.
   - **Acometida** (Común, físico, 40): ataca siempre primero.
   - **Dentellada** (Común, físico, 60).
   - **Terronazo** (Tierra, físico, 55, 95 %).
10. **Bestiario:** «El topillo mediterráneo excava galerías y come raíces. Cuando sus
    poblaciones se disparan, arruina frutales y alfalfares. Vive desde las marismas hasta los
    3000 metros de Sierra Nevada».
11. **Imagen:**
    - **Silueta:** roedor redondo como una bola, con las patas apenas visibles.
    - **Paleta:** pelaje pardo grisáceo, con polvo claro en el lomo.
    - **Detalles:** patas delanteras anchas de excavador, orejas pequeñas escondidas en el
      pelo y cola muy corta.
    - **Cara:** ojillos negros, hocico corto y rosado, y bigotes temblones.
    - **Postura:** asomando medio cuerpo por un agujero del suelo.
12. **Fuentes:**
    - [Topillo (EcuRed)](https://www.ecured.cu/Topillo).
    - [Revista *Vida Rural*, MAPA, 2011](https://mapa.gob.es/ministerio/pags/Biblioteca/Revistas/pdf%5FVrural%2FVrural%5F2011%5F330E%5F14%5F18%2Epdf).

#### 014 Barbaflux

1. **Nombre:** Barbaflux.
2. **Tipos:** Agua. Es un pez de río.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: el barbo gitano (*Luciobarbus sclateri*), endémico del sur de la
   península.
5. **Ubicación y rareza:** río Genil. Común.
6. **Rol:** atacante físico.
7. **Estadísticas:** 55 / 72 / 50 / 40 / 48 / 65 = **330**.
8. **EXP:** ×0,85.
9. **Movimientos:**
   - **Golpe de mar** (Agua, físico, 80, 90 %).
   - **Dentellada** (Común, físico, 60).
   - **Topetazo** (Común, físico, 40).
   - **Rociada** (Agua, mágico, 40).
10. **Bestiario:** «El barbo gitano solo vive en el sur de la península ibérica, en las cuencas
    del Guadalquivir y del Guadiana. Le amenazan las presas, las sequías y los peces exóticos
    introducidos».
11. **Imagen:**
    - **Silueta:** pez robusto y alargado, de lomo alto y cola fuerte.
    - **Paleta:** escamas verde oliva y bronce, y aletas rojizas.
    - **Detalles:**
      - Cuatro barbillas largas junto a la boca, que se mueven como dedos.
      - Marcas onduladas claras en los flancos, como la corriente.
    - **Cara:** boca hacia abajo, de buscar en el fondo, y ojo dorado.
    - **Postura:** remontando la corriente, con el cuerpo curvado.
12. **Fuentes:**
    - [Barbo gitano (Wikipedia)](https://en.wikipedia.org/wiki/Andalusian_barbel).
    - [Ficha de *Barbus sclateri* (UICN)](https://www.uicnmed.org/web2007/cd_fwfish/materials/summery/b/Barbus_sclateri.pdf).

#### 015 Abezar

1. **Nombre:** Abezar.
2. **Tipos:** Aire.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: el abejaruco (*Merops apiaster*).
5. **Ubicación y rareza:** taludes de la Vega. Común.
6. **Rol:** velocista y explorador.
7. **Estadísticas:** 42 / 58 / 40 / 45 / 40 / 80 = **305**.
8. **EXP:** ×0,80.
9. **Movimientos:**
   - **Aletazo** (Aire, físico, 40).
   - **Acometida** (Común, físico, 40): ataca siempre primero.
   - **Revoloteo** (Aire, estado): +1 a la Celeridad propia.
   - **Picada** (Aire, físico, 65, 95 %).
   - **Ventolera** (Aire, mágico, 55).
10. **Bestiario:** «El abejaruco anida en túneles que excava en taludes de arena o arcilla, a
    menudo en colonias. Caza al vuelo abejas, avispas y otros insectos».
11. **Imagen:**
    - **Silueta:** pájaro esbelto de alas puntiagudas y cola larga, con dos plumas centrales
      que sobresalen.
    - **Paleta:** dorso castaño y amarillo, garganta amarillo limón, y pecho y vientre
      turquesa.
    - **Detalles:** pico largo, fino y curvado.
    - **Cara:** antifaz negro marcado sobre el ojo rojo.
    - **Postura:** posado en una rama con una abeja en el pico, o en pleno quiebro al vuelo.
    - **Ojo:** muy reconocible y realista. No hay que añadirle adornos fantásticos.
12. **Fuentes:**
    - [El abejaruco europeo, MITECO](https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/publicaciones/especies/abejaruco_europeo_tcm30-100073.pdf).
    - [Gordo et al., 2021](https://www.do-g.de/fileadmin/Ablage/Veroeffentlichen/Vogelwarte/2021_Band_59/Gordo_et_al_The_European_Bee-eater_Merops_apiaster_in_Spain_Spanish_version.pdf).

#### 016 Mandragor

1. **Nombre:** Mandragor.
2. **Tipos:**
   - Planta: es una raíz con hojas.
   - Mental: su raíz es narcótica, y la leyenda le atribuye un grito que enloquece o mata.
3. **Línea:** no evoluciona.
4. **Inspiración:**
   - *Hecho*: la mandrágora mediterránea, que vive en el suroeste peninsular.
   - *Tradición*: el grito al arrancarla, que viene de la Antigüedad.
5. **Ubicación y rareza:** lindes y olivares de la Vega. Rara.
6. **Rol:** control de estado.
7. **Estadísticas:** 65 / 45 / 60 / 85 / 80 / 45 = **380**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Sopor** (Planta, estado, 75 %): duerme al rival.
   - **Alarido** (Mental, mágico, 60): 10 % de bajar la Fuerza del rival.
   - **Hojarasca** (Planta, mágico, 55).
   - **Savia de dragón** (Planta, mágico, 60): drena.
10. **Bestiario:** «La mandrágora florece en otoño. Sus raíces son narcóticas, con efectos
    parecidos a los de la belladona. Desde la Antigüedad se cuenta que grita cuando la
    arrancan».
11. **Imagen:**
    - **Silueta:** raíz nudosa y bifurcada que camina sobre sus dos «piernas» de raíz.
    - **Paleta:** raíz pardo carne, hojas verde oscuro y flores lila azulado.
    - **Detalles:**
      - Raicillas finas que hacen de dedos.
      - Corona de hojas anchas y arrugadas en roseta, con flores lila en el centro.
      - Algún fruto naranja brillante.
    - **Cara:** insinuada en la corteza: dos hendiduras de ojos y una boca abierta en un grito
      mudo.
    - **Postura:** inquietante pero no humana. No es un zombi ni un muñeco.
12. **Fuentes:**
    - [*Mandragora autumnalis* (Wikipedia)](https://en.wikipedia.org/wiki/Mandragora_autumnalis).
    - [Herbario de la Universidad de Granada](https://herbarium.ugr.es/pages/taxones/flora-singular-de-andalucia-imagenes/pliegos_mandragora_autumnalis?theme=pdf).
    - [Gran Enciclopèdia Catalana](https://www.enciclopedia.cat/gran-enciclopedia-catalana/mandragora).

#### 017 Carapachón

1. **Nombre:** Carapachón. Sustituye a «Tortuluz».
2. **Tipos:** Agua. Se quita Tierra: el galápago leproso es acuático, y así no repite el tipo
   de Alhambrón en el mismo capítulo.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: el galápago leproso (*Mauremys leprosa*).
5. **Ubicación y rareza:** acequias y balsas. Poco común.
6. **Rol:** tanque físico inicial.
   - Puntos débiles: casi no tiene Celeridad (25) y apenas tiene Magia.
   - Depende de Caparazón y Remanso para resistir.
7. **Estadísticas:** 65 / 50 / 95 / 40 / 65 / 25 = **340**.
8. **EXP:** ×1,00.
9. **Movimientos:**
   - **Topetazo** (Común, físico, 40).
   - **Caparazón** (Agua, estado): +1 al Escudo propio.
   - **Rociada** (Agua, mágico, 40).
   - **Remanso** (Agua, estado): recupera la mitad de la Vida.
   - **Golpe de mar** (Agua, físico, 80, 90 %).
10. **Bestiario:** «El galápago leproso es el galápago autóctono del sur de la península y del
    norte de África. Está en declive: le perjudican la pérdida de hábitat y los galápagos
    exóticos que la gente suelta».
11. **Imagen:**
    - **Silueta:** galápago de caparazón ovalado y bajo, con una quilla suave en el centro.
    - **Paleta:** caparazón verde oliva con manchas pálidas y limo verde; peto amarillo con
      manchas negras.
    - **Detalles:**
      - Cuello largo con rayas amarillentas.
      - Patas fuertes y palmeadas, con uñas.
      - Restos de limo y alguna lenteja de agua en el caparazón.
    - **Cara:** ojos pequeños y tranquilos, y boca en pico.
    - **Postura:** asomando del agua de una acequia, con el cuello estirado.
12. **Fuentes:**
    - [Ficha de *Mauremys leprosa*, Aranzadi](https://monteriza.aranzadi.eus/wp-content/uploads/reptiles/075.mauremys-leprosa.pdf).
    - [Inventario nacional de reptiles, MITECO](https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/inventarios-nacionales/reptil_2_tcm30-98907.pdf).

#### 018 Alhambrón

1. **Nombre:** Alhambrón.
2. **Tipos:**
   - Agua: el agua le sale por la boca, como a los leones de la fuente.
   - Tierra: tiene cuerpo de mármol.
   - Se quita el Acero del prompt.
3. **Línea:** no evoluciona.
4. **Inspiración:**
   - *Hecho*: los doce leones de la Fuente de los Leones, de mármol de Macael.
   - *Licencia*: que esté vivo.
5. **Ubicación y rareza:** muy rara.
   - Es la criatura estrella de Boabdil.
   - Tras vencerle, aparece salvaje un ejemplar en el Generalife.
6. **Rol:** atacante resistente: pega y aguanta.
   - Punto débil: es lento.
   - Con la tabla de tipos, es muy débil a Planta (×4), débil a Aire e inmune a Eléctrico.
7. **Estadísticas:** 85 / 90 / 95 / 70 / 85 / 55 = **480**. Es el mismo total que ya tiene en
   el juego, que está probado.
8. **EXP:** ×1,40.
9. **Movimientos:**
   - **Dentellada** (Común, físico, 60).
   - **Golpe de mar** (Agua, físico, 80, 90 %).
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Remanso** (Agua, estado): recupera la mitad de la Vida.
   - **Bramido** (Común, estado): −1 a la Fuerza del rival.
10. **Bestiario:** «Los doce leones de la fuente son de mármol de Macael, en Almería. En el
    borde de la taza se tallaron versos de Ibn Zamrak, el poeta de la corte nazarí, que
    describen la fuente. Su origen es dudoso: hay quien los cree de un palacio del siglo XI».
11. **Imagen:**
    - **Silueta:** felino compacto y cuadrado, de patas cortas y gruesas como pedestales.
    - **Paleta:** mármol blanco crema con vetas grises suaves; ojos azul lapislázuli; agua clara.
    - **Detalles:**
      - Melena estilizada en mechones geométricos, como talla en piedra, con un leve desgaste.
      - Juntas talladas en el cuerpo por las que brotan hilos de agua.
      - Un chorro le sale de la boca.
    - **Cara:** rostro ancho y algo esquemático, de escultura, con la boca abierta en arco.
    - **Postura:** sentado y vigilante, como sosteniendo algo sobre el lomo.
    - **Lo que no debe ser:** una copia literal de uno de los leones. Es una criatura inspirada
      en ellos.
12. **Fuentes:**
    - [El Patio y la Fuente de los Leones (Granada Direct)](https://www.granadadirect.com/alhambra/patio-leones/).
    - [Fernández Puertas, Universidad de Granada](https://digibug.ugr.es/bitstream/handle/10481/2763/Fernndez-Puertas.09.pdf?sequence=1).
    - **[VERIFICAR]** la hipótesis del siglo XI (Bermúdez Pareja, 1967).

#### 019 Broncero

1. **Nombre:** Broncero.
2. **Tipos:** Tierra. Vive en la arena y entierra lo que encuentra.
3. **Línea:** Broncero → Escarbraz (nivel 18) → Mocarabeo (nivel 34).
4. **Inspiración:**
   - *Hecho*: el escarabajo pelotero sagrado (*Scarabaeus sacer*).
   - **[VERIFICAR]** si vive en la Vega de Granada. Está documentado en Doñana y en Cádiz.
5. **Ubicación y rareza:** caminos de tierra de la Vega, al atardecer. Común.
6. **Rol:** atacante físico básico.
7. **Estadísticas:** 45 / 60 / 55 / 25 / 35 / 40 = **260**.
8. **EXP:** ×0,80.
9. **Movimientos:**
   - **Topetazo** (Común, físico, 40).
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Polvareda** (Tierra, mágico, 45).
   - **Desplante** (Común, estado): −1 al Escudo del rival.
10. **Bestiario:** «El escarabajo pelotero sagrado vive en dunas y arenales del sur de España,
    como los de Doñana. Sale al atardecer».
11. **Imagen:**
    - **Silueta:** escarabajo pequeño y redondo, de patas robustas.
    - **Paleta:** caparazón marrón cobrizo con brillo mate.
    - **Detalles:**
      - Antenas cortas en abanico.
      - Patas delanteras dentadas como rastrillos.
      - Una bolita de tierra entre las patas traseras.
    - **Cara:** ojos pequeños y redondos bajo el borde del caparazón.
    - **Postura:** empujando su bola cuesta arriba, cabeza abajo.
12. **Fuentes:**
    - [*Scarabaeus sacer* (Wikipedia)](https://en.wikipedia.org/wiki/Scarabaeus_sacer).
    - [Seguimiento de peloteros en Doñana (DEIMS)](https://deims.org/dataset/30788977-eda8-4f31-87be-4fb055d14536).
    - [*Anales de Biología*, Universidad de Murcia](https://revistas.um.es/analesbio/article/download/34601/33131/155041).

#### 020 Escarbraz

1. **Nombre:** Escarbraz.
2. **Tipos:**
   - Tierra.
   - Acero: los élitros se le vuelven de bronce. Es licencia, pero se ve.
3. **Línea:** viene de Broncero (nivel 18) y evoluciona a Mocarabeo (nivel 34).
4. **Inspiración:** *Hecho*: el pelotero que rueda su bola y la entierra para poner en ella
   sus huevos.
5. **Ubicación y rareza:** adarves de la Alhambra. Poco común.
6. **Rol:** defensor físico.
7. **Estadísticas:** 65 / 78 / 98 / 35 / 62 / 45 = **383**.
8. **EXP:** ×1,00.
9. **Movimientos:**
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Tajo** (Acero, físico, 70, 95 %).
   - **Coraza** (Acero, estado): +2 al Escudo propio.
   - **Topetazo** (Común, físico, 40).
10. **Bestiario:** «Los peloteros hacen bolas de estiércol, las ruedan lejos y las entierran.
    Dentro ponen sus huevos, y las larvas crecen comiéndose la bola».
11. **Imagen:**
    - **Silueta:** escarabajo más grande y ancho que Broncero, claramente un insecto.
    - **Paleta:** bronce mate con pátina verdosa en los bordes y patas marrón oscuro.
    - **Detalles:**
      - Élitros de bronce con líneas finas, como metal trabajado a mano.
      - Patas delanteras anchas y dentadas, de excavar.
      - Un cuerno corto en la frente.
    - **Cara:** ojos ocres pequeños y mandíbulas como tenazas cortas.
    - **Postura:** clavado al suelo, con la cabeza baja, como un escudo vivo.
    - **Diferencia con Broncero:** el bronce, el tamaño y el cuerno.
12. **Fuentes:** [*Scarabaeus sacer* (Wikipedia)](https://en.wikipedia.org/wiki/Scarabaeus_sacer).

#### 021 Mocarabeo

1. **Nombre:** Mocarabeo. Sustituye a «Alabastrón», que se confundía con Alhambrón.
2. **Tipos:**
   - Acero: su caparazón es de metal pulido.
   - Luz: el escarabajo que rueda su bola fue en Egipto la imagen del sol (*hecho*), y su
     caparazón refleja la luz como los mocárabes de la Alhambra.
3. **Línea:** forma final. Viene de Escarbraz (nivel 34).
4. **Inspiración:**
   - *Hecho*: el escarabajo sagrado de Egipto (el dios Jepri) y los mocárabes nazaríes.
   - *Licencia*: la mezcla de los dos.
5. **Ubicación y rareza:** por evolución. Rara.
6. **Rol:** tanque de apoyo. Aguanta mucho y cura.
   - Puntos débiles: muy lento (Celeridad 40) y con poca ofensiva.
   - Con la tabla de tipos, es débil a Tierra, Infernal, Plasma, Oscuridad y Acero.
7. **Estadísticas:** 95 / 75 / 120 / 70 / 110 / 40 = **510**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Tajo** (Acero, físico, 70, 95 %).
   - **Coraza** (Acero, estado): +2 al Escudo propio.
   - **Mocárabe** *(nuevo)* (Luz, mágico, 80): rayo de luz que se quiebra en mil celdas.
   - **Amanecer** *(nuevo)* (Luz, estado): recupera la mitad de la Vida.
   - **Terronazo** (Tierra, físico, 55, 95 %).
10. **Bestiario:** «Los egipcios veían en el escarabajo que rueda su bola al dios Jepri, que
    empujaba el sol por el cielo. La cúpula de la Sala de las Dos Hermanas, en la Alhambra,
    tiene más de cinco mil celdas de yeso: es una cúpula de mocárabes».
11. **Imagen:**
    - **Silueta:** gran escarabajo de cuerpo ancho y alto. Se lee como fortaleza y como joya.
    - **Paleta:** marfil metálico, oro viejo y reflejos de luz cálida.
    - **Detalles:**
      - Élitros con relieves de celdas y prismas en cascada, como una cúpula de mocárabes vista
        desde dentro.
      - Bordes de los élitros con lazos geométricos de estrella de ocho puntas.
      - Un gran cuerno central tallado en facetas que capta la luz.
      - Sobre el lomo, un disco solar de luz suave, no de fuego.
    - **Cara:** ojos dorados serenos y mandíbulas cortas.
    - **Postura:** quieto y solemne, con las patas delanteras abiertas como protegiendo a alguien.
    - **Lo que no debe tener:** arcos de plasma. Su luz es serena.
    - **Diferencia con Escarbraz:** el bronce se vuelve marfil y oro, aparecen los relieves
      nazaríes y llega la luz.
12. **Fuentes:**
    - [*Scarabaeus sacer* y Jepri (Wikipedia)](https://en.wikipedia.org/wiki/Scarabaeus_sacer).
    - [Sala de las Dos Hermanas](https://alhambradegranada.org/en/info/nasridpalaces/hallofthetwosisters.asp).
    - [*Cuadernos de la Alhambra*, n.º 50](https://cuadernosdelaalhambra.alhambra-patronato.es/index.php/cdalhambra/article/download/54/101?inline=1).

### Adelanto del capítulo 5: Gofrón, *Gallotia simonyi* y Viejarrón

#### 075 Gofrón

1. **Nombre:** Gofrón.
2. **Tipos:**
   - Planta: su cuerpo es grano tostado compactado.
   - Tierra: lleva a la espalda, como caparazón, una muela de basalto de molino de mano.
   - Sin Acero: el gofio no es metal.
3. **Línea:** no evoluciona. Es una especie única.
4. **Inspiración:**
   - *Hecho*: el gofio, harina de cereal tostado y base de la dieta aborigen, que se molía en
     molinos de mano de basalto.
   - *Tradición viva*: amasarlo en un zurrón de piel de cabra.
5. **Ubicación y rareza:** medianías del norte de Tenerife, cerca de eras y molinos. Poco
   común.
6. **Rol:** tanque físico de verdad. Absorbe golpes físicos, se refuerza y se cura.
   - Puntos débiles:
     - Celeridad 20: casi siempre actúa el último.
     - Magia 30: su ofensiva es solo física y moderada.
     - Resistencia mágica 75, regular: los atacantes mágicos le hacen daño de verdad.
     - Con la tabla de tipos, es muy débil a Aire (×4), débil a Hielo e inmune a Eléctrico.
7. **Estadísticas:** 130 / 90 / 135 / 30 / 75 / 20 = **480**.
8. **EXP:** ×1,15.
9. **Movimientos:**
   - **Molienda** *(nuevo)* (Tierra, físico, 75, 100 %): 30 % de bajar un nivel el Escudo del
     rival. Lo tritura como la muela.
   - **Compactar** *(nuevo)* (Tierra, estado): +2 al Escudo propio. Se aprieta como una pella.
   - **Pella** *(nuevo)* (Planta, estado): recupera la mitad de la Vida. Se vuelve a amasar.
   - **Nube de gofio** *(nuevo)* (Planta, estado): −1 a la Fuerza del rival. Polvo a la cara.
   - **Terronazo** (Tierra, físico, 55, 95 %).
10. **Bestiario:** «El gofio era la base de la comida de los antiguos canarios, que tostaban la
    cebada y la molían en molinos de mano de basalto. Todavía hoy se amasa en un zurrón de
    piel de cabra».
11. **Imagen:**
    - **Silueta:** cuadrúpedo muy ancho y bajo, con el centro de gravedad casi en el suelo.
      Recuerda a una tortuga o un armadillo robusto, pero no es ninguno de los dos.
    - **Paleta:** dorado, ocre y marrón tostado en el cuerpo; gris oscuro del basalto en la
      muela.
    - **Detalles:**
      - **El cuerpo:** capas de grano tostado compactado, con una costra granulada y
        reconocible de cereal. No debe parecer barro ni arena.
      - **La muela:** a la espalda lleva una muela redonda de basalto poroso, con el agujero
        central, a modo de caparazón.
      - **El vientre:** lo envuelve un pellejo curtido, como el zurrón donde se amasa.
      - **Patas:** cortas y gruesas como sacos llenos, de pisada firme.
      - **Cresta:** pequeña, de espigas secas de cebada.
      - **Hombros:** redondeados, con placas compactas.
    - **Cara:** ancha y tranquila, con hocico chato y ojillos oscuros como granos tostados.
    - **Postura:** plantado y con la cabeza un poco metida bajo la muela, listo para aguantar.
    - **Lo que no debe ser:** un saco con cara ni una broma. Tiene que transmitir peso y
      aplomo.
12. **Fuentes:**
    - [Pieza del mes, El Museo Canario](https://www.elmuseocanario.com/images/documentospdf/piezadelmes/2024/piezanoviembre2024.pdf).
    - [Estudio sobre los molinos aborígenes, ULPGC](https://mdc.ulpgc.es/files/original/8e4d35b7952d2c8ded8bf1a8ee344ab28e0085fd.pdf).
    - [Diccionario histórico del español de Canarias, RAE](https://www.rae.es/tdhle/goffio).

#### 077 Gallotia simonyi

1. **Nombre:** *Gallotia simonyi*, su nombre científico, a petición del autor. Es la única
   especie del juego con nombre real; en pantalla va sin cursiva.
2. **Tipos:** Tierra. Vive en riscos y laderas de roca.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: el lagarto gigante de El Hierro.
   - Lo describió Steindachner en 1889 con el apellido del naturalista Oscar Simony.
   - Se dio por extinguido en el siglo XX y se redescubrió en los años setenta en el Risco de
     Tibataje, en la Fuga de Gorreta **[VERIFICAR el año exacto: 1974 o 1975]**.
   - Está en peligro crítico y se cría en un centro de recuperación de El Hierro.
5. **Ubicación y rareza:** El Hierro, en la Fuga de Gorreta. Muy rara.
6. **Rol:** atacante resistente. Pega fuerte, aguanta golpes físicos y se calienta al sol para
   ir a más.
   - Puntos débiles: Magia baja; con la tabla de tipos, es débil a Agua, Planta y Aire, e
     inmune a Eléctrico.
7. **Estadísticas:** 95 / 105 / 100 / 45 / 80 / 75 = **500**.
8. **EXP:** ×1,20.
9. **Movimientos:**
   - **Dentellada** (Común, físico, 60).
   - **Terronazo** (Tierra, físico, 55, 95 %).
   - **Risco** *(nuevo)* (Tierra, físico, 85, 90 %). Por el Risco de Tibataje.
   - **Solana** *(nuevo)* (Común, estado): +1 a la Fuerza y +1 a la Celeridad propias. Como
     todo reptil, se calienta al sol para moverse.
10. **Bestiario:** «Lo dieron por extinguido durante buena parte del siglo XX, hasta que
    apareció en un risco de El Hierro casi inaccesible. Hoy se cría para devolverlo a la
    isla».
11. **Imagen:**
    - **Silueta:** lagarto grande y macizo, de cabeza ancha y alta, cuello grueso y cola larga.
      Pegado al suelo.
    - **Paleta:** pardo oscuro y gris, con manchas laterales más claras **[VERIFICAR el
      patrón]**.
    - **Detalles:**
      - Escamas pequeñas y granulosas en el lomo; placas más grandes en la cabeza.
      - Mejillas abultadas, como las de los machos adultos.
      - Garras cortas y fuertes, de trepar por roca volcánica.
    - **Cara:** ojo pequeño y vivo, boca larga.
    - **Postura:** al sol, sobre una roca, con la cabeza alta.
    - **Lo que no debe ser:** un dragón ni un dinosaurio. Es un lagarto real, solo que muy
      grande.
12. **Fuentes:**
    - [Lagarto gigante de El Hierro (Wikipedia)](https://en.wikipedia.org/wiki/Simony%27s_giant_lizard).
    - [Camino natural de El Hierro, MAPA](https://www.mapa.gob.es/en/desarrollo-rural/temas/caminos-naturales/caminos-naturales/sector-canario/hierro/etapa14-circular/default.aspx).

#### 080 Viejarrón

1. **Nombre:** Viejarrón, de *vieja*, el nombre canario del pez.
2. **Tipos:**
   - Agua: es un pez de arrecife.
   - Planta: es herbívoro y pasa el día raspando algas de las rocas. *Licencia*: lleva un
     césped de algas en el lomo.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Hecho*: la vieja (*Sparisoma cretense*), un pez loro del Atlántico
   oriental y el Mediterráneo, muy común en Canarias y de los pescados más apreciados allí.
   Sus dientes están soldados en un pico, como el de un loro.
5. **Ubicación y rareza:** buceando en el Mar de las Calmas (El Hierro). Común.
6. **Rol:** tanque mágico. Aguanta la magia y se cura; pega poco.
   - Puntos débiles: Fuerza y Celeridad bajas.
   - Con la tabla de tipos, es débil a Aire, Eléctrico, Hielo y Plasma, y resiste Agua, Tierra y Acero.
7. **Estadísticas:** 95 / 55 / 70 / 70 / 110 / 60 = **460**.
8. **EXP:** ×1,05.
9. **Movimientos:**
   - **Pico de loro** *(nuevo)* (Agua, físico, 70, 100 %): 20 % de bajar un nivel el Escudo
     del rival. Raspa como raspa la roca.
   - **Marejada** (Agua, mágico, 65).
   - **Hojarasca** (Planta, mágico, 55).
   - **Remanso** (Agua, estado): recupera la mitad de la Vida.
   - **Camuflaje de algas** (Agua, estado): +1 al Escudo y +1 a la Resistencia mágica propios.
10. **Bestiario:** «La vieja tiene los dientes soldados en un pico, como el de un loro, y con
    él raspa las algas de las rocas. En Canarias es de los pescados más apreciados».
11. **Imagen:**
    - **Silueta:** pez de cuerpo ovalado, alto y comprimido de lado, con aletas de pez de
      verdad: dorsal larga, caudal recta y pectorales que abanica para nadar.
    - **Paleta:** la de la hembra, que es la más vistosa: rojo en el cuerpo, una mancha amarilla
      y zonas grises **[VERIFICAR el dibujo exacto de las manchas]**.
    - **Detalles:**
      - Escamas grandes y bien marcadas, como tejas.
      - El pico: los dientes soldados en dos placas blancas que asoman de la boca.
      - Un césped corto de algas verdes en el lomo, que es licencia.
    - **Cara:** ojo grande y redondo, de expresión tranquila, casi de abuela; de ahí el nombre
      en el juego.
    - **Postura:** nadando de lado, con el pico pegado a una roca.
    - **Lo que no debe ser:** un loro con aletas ni un pez con hojas pegadas. Es un pez real y
      reconocible.
12. **Fuentes:** [*Sparisoma cretense* (Wikipedia)](https://en.wikipedia.org/wiki/Sparisoma_cretense).

### Especial: el Papemímico

#### 129 Papemímico

1. **Nombre:** Papemímico, de *papelera* y *mímico*, como lo llamó el autor. En el juego se
   esconde siempre en tinajas, en todas las épocas.
2. **Tipos:**
   - Oscuridad: vive del engaño y ataca a traición.
   - Acero: su cuerpo es el recipiente, duro como un caldero.
3. **Línea:** no evoluciona.
4. **Inspiración:** *Licencia*. Un recipiente vivo que se hace pasar por uno corriente.
5. **Ubicación y rareza:** dentro de las tinajas de cualquier capítulo. Al registrar
   una, hay un 10 % de que sea él (`src/data/recipientes.ts`). Especial.
6. **Rol:** atacante resistente. Es más duro que lo normal en su zona, pero justo:
   - Sale al nivel de la zona, o dos por encima de tu criatura más fuerte si es más alto.
   - Elige sus movimientos como un entrenador, no al azar.
   - Puntos débiles: Celeridad muy baja; con la tabla de tipos, es débil a Tierra, Infernal,
     Plasma, Mental y Luz.
7. **Estadísticas:** 120 / 105 / 115 / 65 / 95 / 45 = **545**.
8. **EXP:** ×1,40.
9. **Movimientos:**
   - **Tapazo** (Acero, físico, 85, 90 %): cierra la tapa como una mandíbula.
   - **Emboscada** (Oscuridad, físico, 70).
   - **Mal de ojo** (Oscuridad, mágico, 65): 20 % de bajar la Resistencia mágica del rival.
   - **Escondite** (Oscuridad, estado): se mete dentro de sí mismo; +1 al Escudo y +1 a la
     Resistencia mágica propios.
10. **Bestiario:** «Nadie sabe qué come cuando no hay nadie cerca. Lo que sí se sabe es que
    guarda dulces: quien lo vence encuentra dentro tres turrones».
11. **Recompensa:** al vencerlo o capturarlo, da exactamente **3 Turrones** (el objeto que sube
    un nivel). Solo una vez por recipiente: la bandera `mimico:<zona>:<id>` lo impide.
12. **Emboscada en el mapa:** el recipiente tiembla, se abre de golpe, salta un «!», la pantalla
    destella en rojo y tiembla, y aparece el texto «¡La tinaja tenía dientes!».
13. **Imagen:**
    - **Silueta:** una tinaja de barro con la boca convertida en mandíbula.
    - **Paleta:** barro rojizo, con el interior negro y la lengua granate.
    - **Detalles:**
      - Dientes de tiesto roto alrededor de la boca, irregulares.
      - Una lengua larga, como un trapo enrollado, que asoma.
      - Dos ojillos amarillos en la oscuridad del fondo.
      - Patas cortas y torcidas que salen de la base solo cuando ataca.
    - **Postura:** inclinado hacia delante, con la boca abierta de par en par.
    - **Lo que no debe ser:** un cofre del tesoro con dientes. Es siempre un recipiente de uso
      diario de la época.

### Movimientos nuevos de las fichas

Usan solo efectos que ya existen en el motor. Los del capítulo 1 ya están en el juego.

| Movimiento | Tipo | Categoría | Poder | Precisión | Efecto |
| --- | --- | --- | --- | --- | --- |
| Colada | Infernal | Físico | 100 | 85 % | 10 % de quemar |
| Brazada | Agua | Físico | 40 | 100 % | Prioridad +1 |
| Camuflaje de algas | Agua | Estado | — | — | +1 al Escudo y +1 a la Resistencia mágica propios |
| Resina roja | Planta | Estado | — | — | Cura la mitad de la Vida |
| Tarea imposible | Oscuridad | Estado | — | 90 % | −1 a la Fuerza y −1 a la Celeridad del rival |
| Mocárabe | Luz | Mágico | 80 | 100 % | — |
| Amanecer | Luz | Estado | — | — | Cura la mitad de la Vida |
| Molienda | Tierra | Físico | 75 | 100 % | 30 % de −1 al Escudo del rival (Gofrón) |
| Compactar | Tierra | Estado | — | — | +2 al Escudo propio (Gofrón) |
| Pella | Planta | Estado | — | — | Cura la mitad de la Vida (Gofrón) |
| Nube de gofio | Planta | Estado | — | 100 % | −1 a la Fuerza del rival (Gofrón) |
| Pico de loro | Agua | Físico | 70 | 100 % | 20 % de −1 al Escudo del rival (Viejarrón) |
| Risco | Tierra | Físico | 85 | 90 % | — (*Gallotia simonyi*) |
| Solana | Común | Estado | — | — | +1 a la Fuerza y +1 a la Celeridad propias (*Gallotia simonyi*) |

---

## Pendiente

### Decisiones del autor

Aceptado el 2026-10-24: las entradas nuevas de la v2 y sus nombres, Dralín con dos formas y el
Papemímico capturable (con sus 3 Turrones también al capturarlo).

1. Dar el visto bueno a la auditoría (A.1 a A.8) y a los nombres nuevos: Brezuco, Carapachón,
   Mocarabeo, Farolera, Riscabra, Coronazul y todos los que no venían en el prompt.
2. **Capítulo 8 en Asturias.** El prompt lo propone y aquí se da por bueno.
3. **Fuerteventura.** ¿Una zona opcional nocturna en los llanos de Mafasca, para la Luz de
   Mafasca?
4. **Islero fuera, Ratón Pérez dentro.** ¿Te parece bien?
5. **Rutas entre capítulos.** ¿Se diseñan como zonas pequeñas de paso (Galicia, Cataluña,
   Mallorca, Extremadura, Cantabria) o se reparten esas criaturas por los capítulos?
6. **Evoluciones por lugar.** Lobánima (Monte de las Ánimas) y Noctilex (Real Biblioteca) están
   pensadas para evolucionar en un lugar concreto. Es una mecánica nueva. Si no se quiere, se
   deja por nivel.

### [VERIFICAR]

- **Tibicenas:** el nombre en Tenerife (¿guacanchas?) y si la tradición los hace hijos de
  Guayota. Las fuentes que hay son Wikipedia, que cita a Abreu Galindo (1632).
- **Mari:** si viaja por el cielo como una bola o una hoz de fuego (Barandiarán).
- **Ladón:** la fuente de la leyenda que hace nacer los dragos de su sangre.
- **Centollo:** si el adulto también se cubre de algas.
- **Broncero:** si *Scarabaeus sacer* vive en la Vega de Granada.
- **Caballucos del diablu:** la versión de los siete colores y el diablo que monta el rojo.
- **Trasgu:** la tarea de la linaza en una recopilación académica.
- **Helike:** la cita exacta de Diodoro sobre los carros de bueyes en llamas.
- **Padul:** la especie del mamut.
- **Anguila:** si sigue sin observarse el desove en libertad.
- **Vieja:** el dibujo exacto de las manchas de la hembra de *Sparisoma cretense*.
- ***Gallotia simonyi*:** el año del redescubrimiento (1974 o 1975) y el patrón de color.
- **Basilisco de Madrid:** la leyenda de la calle del Basilisco, en una fuente sobre Madrid.
- **Tarantismo:** si se documenta en La Mancha o solo en otras zonas.

### Fuentes de la auditoría

- **Guayota y el Teide:** [MITECO](https://www.miteco.gob.es/es/red-parques-nacionales/nuestros-parques/teide/historia/default.aspx),
  [Tibicena (Wikipedia)](https://en.wikipedia.org/wiki/Tibicena).
- **Venta Micena:** [Scientific Reports, 2021](https://link.springer.com/10.1038/s41598-021-93261-1),
  [Junta de Andalucía](https://juntadeandalucia.es/cultura/tabula/bitstream/20.500.11947/3020/1/AAA_2005_120_martineznavarro_ventamicena.pdf).
- **San Telmo:** [Vargas Díaz-Toledo](https://www.ahlm.es/userfiles/files/3_%20VARGAS%20DIAZ-TOLEDO.pdf).
- **Luz de Mafasca:** [RAE, Diccionario histórico del español de Canarias](https://www.rae.es/tdhle/luz),
  [RTVC](https://rtvc.es/enigmas-cronicas-curiosidades-rtvc/).
- **Mariposa isabelina:** [Museo Nacional de Ciencias Naturales](https://www.mncn.csic.es/sites/default/files/2026-01/07_PiezaMes_nm48.pdf).
- **Ratón Pérez:** [Wikipedia](https://en.wikipedia.org/wiki/Ratoncito_P%C3%A9rez).
- **Lagarto gigante de El Hierro:** [MAPA](https://www.mapa.gob.es/en/desarrollo-rural/temas/caminos-naturales/caminos-naturales/sector-canario/hierro/etapa14-circular/default.aspx),
  [Wikipedia](https://en.wikipedia.org/wiki/Simony%27s_giant_lizard).
- **Tortuga gigante de Tenerife:** [Wikipedia](https://en.wikipedia.org/wiki/Centrochelys_burchardi).
- **Vieja:** [*Sparisoma cretense* (Wikipedia)](https://en.wikipedia.org/wiki/Sparisoma_cretense).
- **Musaraña canaria:** [*Crocidura canariensis* (Wikipedia)](https://en.wikipedia.org/wiki/Canary_shrew).
- **Meloncillo:** [*Herpestes ichneumon* (Wikipedia)](https://en.wikipedia.org/wiki/Egyptian_mongoose).
- **Falsa oronja:** [*Amanita muscaria* (Wikipedia)](https://en.wikipedia.org/wiki/Amanita_muscaria).
- **Carabela portuguesa:** [*Physalia physalis* (Wikipedia)](https://en.wikipedia.org/wiki/Portuguese_man_o%27_war).
