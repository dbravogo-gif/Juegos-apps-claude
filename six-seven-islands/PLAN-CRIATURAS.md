# Plan de criaturas para Meshy (propuesta)

2026-11-16. Lo genera `python3 herramientas/criaturas/plan.py`: **no se edita a mano**, se cambian los
datos del script y se vuelve a generar. El seguimiento, en `conceptos/criaturas/plan-criaturas.xlsx`.

**Qué es.** Las zonas de cada isla y las 203 criaturas, con su zona, sus tipos por forma y el Pokémon
del que copia las estadísticas (solo referencia interna: no sale en el juego, R8). Las de Lanzarote
son la propuesta 2 de `CRIATURAS.md`; las zonas de Tenerife, La Gomera, La Palma y El Hierro son
nuevas y pueden cambiar al diseñar cada isla.

**Lo que es del autor y lo que es propuesta.**

- Son del autor los tipos de las especies con lámina y de las iniciales, marcados con «A».
- Los demás segundos tipos son propuesta: CRIATURAS.md dice que los elige el autor.
- Las ideas de aspecto también son propuesta. Cada una parte de algo canario y evita el animal y la
  forma del Pokémon de referencia. Si una imagen recuerda a una criatura conocida, se descarta.

**Cómo generarlas.** En el orden de la lista: primero las iniciales y Lanzarote, que son las que se
ven antes. Cada criatura sigue `prompts-meshy.md`: imagen 2D, después Image to 3D, y el archivo con
el nombre de la columna «Archivo» (`.glb` y su imagen `.webp` o `.png`).

**Coste.** Faltan 199 criaturas (hay 4 hechas). A 15 créditos cada una
(Smart Topology y textura, precio comprobado el 2026-11-07), son unos 2.985 créditos sin
contar repeticiones. Por isla, en la tabla de abajo.

## Las cuentas

Todas cuadran: si no, el script no genera nada.

| Tipo principal | Objetivo | En el plan | Como secundario |
| --- | --- | --- | --- |
| Común | 16 | 16 | 0 |
| Agua | 21 | 21 | 8 |
| Tierra | 11 | 11 | 8 |
| Planta | 17 | 17 | 4 |
| Aire | 11 | 11 | 9 |
| Eléctrico | 11 | 11 | 0 |
| Hielo | 8 | 8 | 1 |
| Infernal | 16 | 16 | 1 |
| Lucha | 9 | 9 | 1 |
| Mental | 8 | 8 | 7 |
| Oscuridad | 8 | 8 | 3 |
| Espectral | 7 | 7 | 2 |
| Acero | 6 | 6 | 2 |
| Roca | 10 | 10 | 3 |
| Ancestral | 4 | 4 | 5 |
| Bicho | 13 | 13 | 3 |
| Veneno | 12 | 12 | 3 |

- **Sin tipo secundario:** el 68 % de las 188 de la lista (objetivo, 60 %).
- **Especies por hierba:** de 3 a 4 en Lanzarote y de 3 a 6 después, con una rara como mucho.
- **Gimnasios:** cada uno tiene al menos 3 especies de su tipo antes de llegar (Lanzarote, 1: la
  roca nueva, que la líder usa evolucionada).

| Isla | Especies nuevas | Criaturas | Por generar | Créditos |
| --- | --- | --- | --- | --- |
| Lanzarote | 36 | 47 | 43 | 645 |
| Fuerteventura | 14 | 30 | 30 | 450 |
| Gran Canaria | 25 | 37 | 37 | 555 |
| Tenerife | 19 | 35 | 35 | 525 |
| La Gomera | 13 | 22 | 22 | 330 |
| La Palma | 10 | 16 | 16 | 240 |
| El Hierro | 12 | 16 | 16 | 240 |
| **Total** | | **203** | **199** | **2.985** |

Lanzarote incluye las 15 iniciales y las 5 leyendas de los pueblos, que duermen allí.

## Las islas y sus zonas

En cada zona, las especies que salen, con la nueva de esa zona en **negrita**. Las leyendas salen
tras la Liga. Niveles: los de `ISLA-3.md` hasta Gran Canaria; después, propuesta. En las islas del
final, una especie que se conoció antes sale ya evolucionada, según el nivel de la zona.

### Lanzarote

Gimnasio de **Roca**, en la Capital, líder 11-12.

| Zona | Niveles | Especies |
| --- | --- | --- |
| El Golfo | 3-5 | **Civeta** · **Tinzal → Azurvan** · **«Cabozo»** · **Dragosil → Dragombo → Dragalis** (rara) |
| Montañas del Fuego | 5-7 | Civeta · **Magmín → Lavtún → Teidrón** · **«Erizo luchador»** · «Basalto» (rara) |
| El Jable | 6-8 | Tinzal → Azurvan · «Erizo luchador» (rara) · **Patatín → Paparrón** · **Melaní → Favenir → Reginis** |
| Famara | 6-8 | «Cabozo» · **«Basalto»** (rara) · **Aerund → Marwen** · **Salmito → Salmarín → Salmástil** |
| La Geria (leyenda) | tras la Liga | **«Leyenda verde»** |
| Montañas del Fuego, el cráter (leyenda) | tras la Liga | **Magecora** |
| Risco de Famara (leyenda) | tras la Liga | **«Leyenda de roca»** |
| Pueblos sepultados (leyenda) | tras la Liga | **«Leyenda de tierra»** |
| Los jameos (leyenda; zona por crear) | tras la Liga | **«Leyenda del agua»** |

Para el gimnasio, de Roca: «Basalto».

### Fuerteventura

Gimnasio de **Aire**, en Morro Jable, líder 20-21.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Las Dunas | 10-13 | **«Remolino de jable»** · **«Lisa de duna»** · **«Conejo de jable»** · **«Cigarrón»** (rara) |
| Betancuria | 12-14 | «Conejo de jable» · «Cigarrón» · **«Dromedario»** · **«Perro bardino»** · **«Guirre»** |
| Ajuy | 13-15 | Aerund → Marwen · «Cigarrón» · «Perro bardino» · **«Erizo negro»** |
| Cueva de Ajuy | 13-15 | **«Murciélago de cueva»** · **«Escarabajo de escoria»** · «Escolopendra» (rara) |
| Tindaya (opcional) | 14-16 | «Dromedario» · «Perro bardino» · «Guirre» · **«Piedra de Tindaya»** (rara) |
| Sotavento | 15-17 | Aerund → Marwen · «Remolino de jable» · «Lisa de duna» · «Erizo negro» · **«Carabela»** |
| Cofete (opcional) | 17-19 | «Lisa de duna» · «Erizo negro» · **«Escolopendra»** · **«Cardón»** |

Para el gimnasio, de Aire: «Guirre», «Lisa de duna», «Murciélago de cueva», Tinzal → Azurvan, Aerund → Marwen, «Remolino de jable».

### Gran Canaria

Gimnasio de **Eléctrico y Lucha**, Eléctrico en Las Palmas y Lucha en Agaete; los dos líderes, 28-30, en 2 contra 2.

| Zona | Niveles | Especies |
| --- | --- | --- |
| La Isleta | 18-20 | **«Tembladera»** · **«Chicharro»** · **«Chispa de cable»** · **«Enredo»** · **«Farito»** (rara) |
| Bandama (opcional) | 19-21 | «Conejo de jable» · «Perdiz» · «Almendrita» · **«Bomba volcánica»** (rara) |
| Guayadeque | 20-22 | «Murciélago de cueva» · **«Tabona»** · **«Cantero»** · **Tibicán** (rara) |
| Las cumbres | 21-23 | **«Perdiz»** · **«Almendrita»** · «Cantero» · **«Burro»** · Briso → Alisor → Alisior |
| Roque Nublo | 22-24 | «Perdiz» · **Caprún → Roquén → Terracorn** · **Briso → Alisor → Alisior** · Voltéro → Raigón |
| Tejeda y Artenara | 22-25 | «Almendrita» · «Burro» · **Voltéro → Raigón** · **«Bailador de isa»** · **«Saltador de garrote»** |
| Maspalomas (opcional) | 22-26 | «Lisa de duna» · «Carabela» · **«Boya»** (rara) · **«Lisa de la charca»** |
| Tamadaba | 24-27 | Tibicán (rara) · «Burro» · Caprún → Roquén → Terracorn · **«Piña luchadora»** |
| Agaete | 25-27 | «Erizo negro» · «Tembladera» · «Chicharro» · «Bailador de isa» · «Saltador de garrote» |

Para el gimnasio, de Eléctrico: Briso → Alisor → Alisior, Voltéro → Raigón, «Chispa de cable», «Tembladera», «Farito», «Boya».

Para el gimnasio, de Lucha: «Burro», «Piña luchadora», «Erizo luchador», «Bailador de isa», «Saltador de garrote».

### Tenerife

Gimnasio de **Agua**, en el Puerto de la Cruz, líder 36-38; la Liga, en el Teide, 58-62.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Anaga | 26-29 | Tinzal → Azurvan · **«Mariposa de laurisilva»** · **«Gato del monte»** · **«Hurón»** |
| La Laguna | 27-29 | «Conejo de jable» · «Gato del monte» · **«Farol»** · **«Aldaba»** (rara) |
| Valle de La Orotava | 28-31 | «Conejo de jable» · «Perdiz» · «Gato del monte» · «Hurón» |
| Puerto de la Cruz | 29-32 | «Erizo negro» · «Tembladera» · **«Tortuga boba»** · **«Vieja»** |
| Cueva del Viento | 30-33 | «Murciélago de cueva» · **«Tortuga gigante»** · **«Rata gigante»** · **«Ánima de lava»** (rara) |
| Teno y Masca | 31-34 | «Guirre» · Caprún → Roquén → Terracorn · Voltéro → Raigón · **«Guincho»** |
| Los Gigantes (costa) | 32-35 | «Tortuga boba» · **«Delfín»** · **«Morena»** · **«Calamar gigante»** (rara) |
| Las Cañadas | 33-36 | Magmín → Lavtún → Teidrón · **«Neverita»** · **«Escarcha»** · **«Tajinaste»** |
| El Teide, la cima (leyenda) | tras la Liga | **«Guardián del Sello»** |
| Cueva del Hielo del Teide (leyenda) | tras la Liga | **«Guardián del hielo»** |

Para el gimnasio, de Agua: «Tortuga boba», Salmito → Salmarín → Salmástil, Aerund → Marwen, «Cabozo», «Chicharro», «Lisa de la charca», «Morena», «Erizo negro», «Carabela», «Delfín», «Tembladera», «Vieja», «Boya», «Calamar gigante».

### La Gomera

Gimnasio de **Mental**, en Chipude, junto a La Fortaleza, líder 44-45.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Hermigua y Agulo | 34-37 | «Mariposa de laurisilva» · «Hurón» · **«Silbador»** · «Caracol hipnótico» |
| Garajonay | 36-39 | «Mariposa de laurisilva» · **«Duende de laurisilva»** · **«Bruma»** · **«Coruja»** · **Esporín → Micelord** |
| Roque de Agando | 37-40 | Caprún → Roquén → Terracorn · «Silbador» · **Miralín → Reflexán** · «Mantis» |
| Valle Gran Rey | 37-40 | «Silbador» · **«Caracol hipnótico»** · **«Mantis»** · «Bucio» |
| Los Órganos (costa) | 38-41 | Aerund → Marwen · «Delfín» · «Morena» · **«Bucio»** |
| Alto de Garajonay (leyenda) | tras la Liga | **«Gara»** |
| Entre Tenerife y La Gomera (leyenda errante) | tras la Liga | **«Jonay»** |

Para el gimnasio, de Mental: «Silbador», «Escarcha», Tinzal → Azurvan, «Caracol hipnótico», «Coruja», Miralín → Reflexán, «Piedra de Tindaya», «Mantis».

### La Palma

Gimnasio de **Planta**, en La Caldera de Taburiente, líder 50-51.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Los Tilos | 40-43 | «Mariposa de laurisilva» · «Duende de laurisilva» · Esporín → Micelord · «Flor de cumbre» |
| La Caldera de Taburiente | 42-45 | Caprún → Roquén → Terracorn · **«Flor de cumbre»** · **«Pelotero»** · «Bejeque» |
| Los Llanos y Tazacorte | 42-45 | «Hurón» · **«Tunera»** · **«Cochinilla»** · **«Diablillo»** |
| Garafía | 43-46 | Dragosil → Dragombo → Dragalis · «Perdiz» · **«Bejeque»** · «Saltamontes gigante» · «Diablillo» |
| Roque de los Muchachos | 44-47 | «Guincho» · «Escarcha» · **«Carámbano»** · **«Saltamontes gigante»** |
| Fuencaliente | 45-48 | «Bomba volcánica» · «Tunera» · «Cochinilla» · **«Tea»** |
| El observatorio del Roque (leyenda) | tras la Liga | **«Guardián de las estrellas»** |

Para el gimnasio, de Planta: Dragosil → Dragombo → Dragalis, «Duende de laurisilva», «Tajinaste», «Piña luchadora», «Almendrita», Esporín → Micelord, «Flor de cumbre», «Cardón», «Bejeque», «Tunera».

### El Hierro

Gimnasio de **Infernal/Ancestral**, en Valverde, al final de la Bajada, líder 54-56.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Orchilla (llegada) | 47-50 | Aerund → Marwen · «Erizo negro» · «Morena» · **Sanbor → Borondis → Atlantea** (rara) |
| La Dehesa | 48-51 | «Perro bardino» · «Guirre» · **«Cochino negro»** · «Curandera» |
| La Cumbre (camino de la Bajada) | 50-53 | Magmín → Lavtún → Teidrón · Caprún → Roquén → Terracorn · «Cochino negro» · **Guanchín → Menceyor → Achamán** · **«Tostador de gofio»** |
| El Garoé | 51-53 | «Silbador» · «Duende de laurisilva» · Esporín → Micelord · **«Curandera»** |
| Frontera (opcional) | 50-54 | «Cochino negro» · Guanchín → Menceyor → Achamán · «Tostador de gofio» · **«Lagarto gigante»** (rara) |
| La Restinga (opcional) | 52-55 | «Delfín» · «Morena» · «Calamar gigante» (rara) · Sanbor → Borondis → Atlantea |
| El volcán bajo el mar de La Restinga (leyenda) | tras la Liga | **«Guardián del Tagoro»** |
| El mar de nubes (leyenda) | tras la Liga | **«Guardiana del mar de nubes»** |

Para el gimnasio, de Infernal: «Cochino negro», Magmín → Lavtún → Teidrón, Guanchín → Menceyor → Achamán, «Tea», «Diablillo», «Tostador de gofio», «Bomba volcánica».

Para el gimnasio, de Ancestral: Guanchín → Menceyor → Achamán, «Lagarto gigante», Sanbor → Borondis → Atlantea.

## La lista para generar

Una fila por criatura, en el orden en que conviene generarlas. «Archivo»: el nombre del modelo
(`.glb`) y de su imagen; el número es el de la lista de referencia de `CRIATURAS.md`. «A»: tipos del
autor. Entre comillas, «así», un apodo provisional: el nombre lo pone el autor. La idea va en la
primera forma de cada especie.

### Lanzarote

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | inicial-agua-1 (hecha) | Cronti | 1.ª | Agua A | Propias (del autor) | Inicial (museo de Lanzarote) | Lámina y modelo de la 1.ª. |
| 2 | inicial-agua-2 | Chicront | 2.ª | Agua A | Propias (del autor) |  |  |
| 3 | inicial-agua-3 | Krantacor | 3.ª | Agua A | Propias (del autor) |  |  |
| 4 | inicial-planta-1 (hecha) | Inicial de planta | 1.ª | Planta A | Propias (del autor) | Inicial (museo de Lanzarote) | El lagarto chamán; modelo de la 1.ª. |
| 5 | inicial-planta-2 | Inicial de planta | 2.ª | Planta A | Propias (del autor) |  |  |
| 6 | inicial-planta-3 | Inicial de planta | 3.ª | Planta/Mental A | Propias (del autor) |  |  |
| 7 | inicial-infernal-1 (hecha) | Inicial de infernal | 1.ª | Infernal A | Propias (del autor) | Inicial (museo de Lanzarote) | Modelo de la 1.ª; el secundario de la final, por decidir. |
| 8 | inicial-infernal-2 | Inicial de infernal | 2.ª | Infernal A | Propias (del autor) |  |  |
| 9 | inicial-infernal-3 | Inicial de infernal | 3.ª | Infernal A | Propias (del autor) |  |  |
| 10 | inicial-roca-1 (hecha) | Armalito | 1.ª | Roca A | Propias (del autor) | Inicial (museo de Lanzarote) | Lámina y modelo de la 1.ª. |
| 11 | inicial-roca-2 | Uralito | 2.ª | Roca/Veneno A | Propias (del autor) |  |  |
| 12 | inicial-roca-3 | Reactolito | 3.ª | Roca/Veneno A | Propias (del autor) |  |  |
| 13 | inicial-tierra-1 | Inicial de tierra | 1.ª | Tierra A | Propias (del autor) | Inicial (museo de Lanzarote) | La de otro amigo; por diseñar. |
| 14 | inicial-tierra-2 | Inicial de tierra | 2.ª | Tierra/Espectral A | Propias (del autor) |  |  |
| 15 | inicial-tierra-3 | Inicial de tierra | 3.ª | Tierra/Espectral A | Propias (del autor) |  |  |
| 16 | 031-1 | Civeta | 1.ª | Común A | Zigzagoon (Q1, AF) | El Golfo | Lámina del autor (civeta.jpg). |
| 17 | 031-2 | Civeta | 2.ª | Común A | Linoone (Q3, AF) |  |  |
| 18 | 032-1 | Tinzal | 1.ª | Aire A | Taillow (Q1, AF) | El Golfo | Lámina del autor. |
| 19 | 032-2 | Azurvan | 2.ª | Aire/Mental A | Swellow (Q3, AF) |  |  |
| 20 | 037-1 | «Cabozo» | 1.ª | Agua | Barboach (Q1, EN) | El Golfo | Cabozo: pececillo de charco con aletas como patitas; la 2.ª, grande y con cabeza de roca, se entierra en la arena. |
| 21 | 037-2 | «Cabozo» | 2.ª | Agua/Tierra | Whiscash (Q3, EN) |  |  |
| 22 | 007-1 | Dragosil | 1.ª | Planta A | Lotad (Q1, TE) | El Golfo (rara) | Lámina del autor. |
| 23 | 007-2 | Dragombo | 2.ª | Planta A | Lombre (Q2, TE) |  |  |
| 24 | 007-3 | Dragalis | 3.ª | Planta A | Ludicolo (Q4, TE) |  |  |
| 25 | 016-1 | Magmín | 1.ª | Infernal A | Litwick (Q1, AE) | Montañas del Fuego | Lámina del autor. |
| 26 | 016-2 | Lavtún | 2.ª | Infernal A | Lampent (Q2, AE) |  |  |
| 27 | 016-3 | Teidrón | 3.ª | Infernal A | Chandelure (Q4, AE) |  |  |
| 28 | 043-1 | «Erizo luchador» | 1.ª | Lucha | Riolu (Q1, AF) | Montañas del Fuego | Erizo moruno que se hace bola y embiste; la 2.ª, erguido, lucha con agarres de lucha canaria (faja y calzón de bregar). |
| 29 | 043-2 | «Erizo luchador» | 2.ª | Lucha | Lucario (Q4, AE) |  |  |
| 30 | 012-1 | «Basalto» | 1.ª | Roca | Roggenrola (Q1, TF) | Famara (rara) | Bola de basalto con ojos verdes de olivina; la 2.ª, con cristales de olivina en el lomo; la 3.ª, coloso de columnas de basalto. La usa la líder de Roca. |
| 31 | 012-2 | «Basalto» | 2.ª | Roca | Boldore (Q2, TF) |  |  |
| 32 | 012-3 | «Basalto» | 3.ª | Roca | Gigalith (Q4, TF) |  |  |
| 33 | 034-1 | Patatín | 1.ª | Tierra A | Makuhita (Q1, AF) | El Jable | Lámina del autor. |
| 34 | 034-2 | Paparrón | 2.ª | Tierra A | Hariyama (Q3, AF) |  |  |
| 35 | 005-1 | Melaní | 1.ª | Bicho A | Venipede (Q1, TF) | El Jable | Lámina del autor. |
| 36 | 005-2 | Favenir | 2.ª | Bicho/Veneno A | Whirlipede (Q2, TF) |  |  |
| 37 | 005-3 | Reginis | 3.ª | Bicho/Veneno A | Scolipede (Q3, AF) |  |  |
| 38 | 035-1 | Aerund | 1.ª | Aire A | Wingull (Q1, AE) | Famara | Lámina del autor. |
| 39 | 035-2 | Marwen | 2.ª | Aire/Agua A | Pelipper (Q3, TF) |  |  |
| 40 | 018-1 | Salmito | 1.ª | Agua | Spheal (Q1, EN) | Famara | Nombre del autor; el aspecto, por diseñar. |
| 41 | 018-2 | Salmarín | 2.ª | Agua | Sealeo (Q3, EN) |  |  |
| 42 | 018-3 | Salmástil | 3.ª | Agua/Hielo | Walrein (Q4, TE) |  |  |
| 43 | 094 | «Leyenda verde» | única | Planta/Tierra | Dialga (Q5, AE) | La Geria (leyenda) | La leyenda verde, del pueblo del Hoyo: gran criatura de vid y picón que duerme en un hoyo de La Geria. |
| 44 | 095 | Magecora | única | Infernal/Mental A | Reshiram (Q5, AE) | Montañas del Fuego, el cráter (leyenda) | Lámina del autor: la leyenda infernal, del pueblo de la Colada. |
| 45 | 092 | «Leyenda de roca» | única | Roca/Aire | Zekrom (Q5, AF) | Risco de Famara (leyenda) | La leyenda de roca, del pueblo del Risco: guardiana del acantilado de Famara, de basalto y viento. |
| 46 | 091 | «Leyenda de tierra» | única | Tierra/Espectral | Groudon (Q5, AF) | Pueblos sepultados (leyenda) | La leyenda de tierra, del pueblo del Llano: duerme bajo los pueblos que sepultó el volcán. |
| 47 | 093 | «Leyenda del agua» | única | Agua/Oscuridad | Kyogre (Q5, AE) | Los jameos (leyenda; zona por crear) | La leyenda del agua, del pueblo del Jameo: gran criatura blanca y ciega de los túneles donde entra el mar. |

### Fuerteventura

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | 044-1 | «Remolino de jable» | 1.ª | Aire | Cottonee (Q1, TF) | Las Dunas | Remolino de jable: bolita de arena y semillas que rueda con el viento; la 2.ª, torbellino de arena con cara. Sustituye al remolino provisional del gimnasio de Aire. |
| 49 | 044-2 | «Remolino de jable» | 2.ª | Aire/Tierra | Whimsicott (Q4, TF) |  |  |
| 50 | 009-1 | «Lisa de duna» | 1.ª | Tierra | Trapinch (Q1, AF) | Las Dunas | Lisa de duna: lagartija que nada bajo la arena; la 2.ª, con aletas de arena; la 3.ª, con velas que planean sobre las dunas. |
| 51 | 009-2 | «Lisa de duna» | 2.ª | Tierra | Vibrava (Q2, EN) |  |  |
| 52 | 009-3 | «Lisa de duna» | 3.ª | Tierra/Aire | Flygon (Q4, EN) |  |  |
| 53 | 038-1 | «Conejo de jable» | 1.ª | Común | Bidoof (Q1, EN) | Las Dunas | Conejo de jable, bajito y orejudo; la 2.ª, conejo grande que excava madrigueras. |
| 54 | 038-2 | «Conejo de jable» | 2.ª | Común | Bibarel (Q3, AF) |  |  |
| 55 | 029-1 | «Cigarrón» | 1.ª | Bicho | Kricketot (Q1, TF) | Las Dunas (rara) | Cigarrón: langosta que llega con el viento de África; la 2.ª, grande, hace sonar las alas. |
| 56 | 029-2 | «Cigarrón» | 2.ª | Bicho | Kricketune (Q2, AF) |  |  |
| 57 | 054-1 | «Dromedario» | 1.ª | Común | Deerling (Q2, AF) | Betancuria | Dromedario majorero: cría torpe de patas largas; la 2.ª, dromedario adulto con alforjas. |
| 58 | 054-2 | «Dromedario» | 2.ª | Común | Sawsbuck (Q3, AF) |  |  |
| 59 | 011-1 | «Perro bardino» | 1.ª | Común | Lillipup (Q1, AF) | Betancuria | Perro bardino: cachorro atigrado; la 2.ª, perro pastor; la 3.ª, gran perro de ganado de melena gruesa. |
| 60 | 011-2 | «Perro bardino» | 2.ª | Común | Herdier (Q2, AF) |  |  |
| 61 | 011-3 | «Perro bardino» | 3.ª | Común | Stoutland (Q4, AF) |  |  |
| 62 | 004-1 | «Guirre» | 1.ª | Aire | Starly (Q1, AF) | Betancuria | Guirre: polluelo blanco; la 2.ª, joven de plumas pardas; la 3.ª, gran guirre de cara amarilla. Sustituye al guirre provisional del gimnasio de Aire. |
| 63 | 004-2 | «Guirre» | 2.ª | Aire | Staravia (Q2, AF) |  |  |
| 64 | 004-3 | «Guirre» | 3.ª | Aire | Staraptor (Q3, AF) |  |  |
| 65 | 051-1 | «Erizo negro» | 1.ª | Agua | Corphish (Q2, AF) | Ajuy | Erizo negro de los charcos, redondo y de púas cortas; la 2.ª, grande y de púas larguísimas. |
| 66 | 051-2 | «Erizo negro» | 2.ª | Agua/Oscuridad | Crawdaunt (Q3, AF) |  |  |
| 67 | 017-1 | «Murciélago de cueva» | 1.ª | Veneno | Zubat (Q1, EN) | Cueva de Ajuy | Murciélago orejudo de cueva, de ojos grandes; la 2.ª y la 3.ª, más grandes, con alas como capas. |
| 68 | 017-2 | «Murciélago de cueva» | 2.ª | Veneno/Aire | Golbat (Q3, EN) |  |  |
| 69 | 017-3 | «Murciélago de cueva» | 3.ª | Veneno/Aire | Crobat (Q4, EN) |  |  |
| 70 | 061-1 | «Escarabajo de escoria» | 1.ª | Roca | Anorith (Q2, AF) | Cueva de Ajuy | Escarabajo de escoria volcánica que rueda por la cueva; la 2.ª, erguido y con brazos de basalto. |
| 71 | 061-2 | «Escarabajo de escoria» | 2.ª | Roca/Bicho | Armaldo (Q4, AF) |  |  |
| 72 | 079 | «Escolopendra» | única | Veneno/Bicho | Seviper (Q3, AE) | Cofete (opcional) | Escolopendra: ciempiés gigante de las piedras, con colores de aviso. |
| 73 | 052-1 | «Carabela» | 1.ª | Veneno | Shellos (Q2, EN) | Sotavento | Carabela: medusa con una vela azul que flota en la laguna; la 2.ª, colonia grande con vela de colores. |
| 74 | 052-2 | «Carabela» | 2.ª | Veneno/Agua | Gastrodon (Q3, TE) |  |  |
| 75 | 082 | «Piedra de Tindaya» | única | Roca/Mental | Lunatone (Q3, AE) | Tindaya (opcional) (rara) | Piedra de la montaña sagrada: roca clara con grabados que flota y medita. |
| 76 | 050-1 | «Cardón» | 1.ª | Planta | Cacnea (Q2, AE) | Cofete (opcional) | Cardón de Jandía: brote de cardón de brazos cortos; la 2.ª, gran cardón con brazos de candelabro y savia tóxica. |
| 77 | 050-2 | «Cardón» | 2.ª | Planta/Veneno | Cacturne (Q3, AE) |  |  |

### Gran Canaria

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 78 | 067-1 | «Tembladera» | 1.ª | Eléctrico | Psyduck (Q2, AE) | La Isleta | Tembladera: raya eléctrica de la arena del puerto; la 2.ª, grande, con alas que chispean. |
| 79 | 067-2 | «Tembladera» | 2.ª | Eléctrico/Agua | Golduck (Q4, AE) |  |  |
| 80 | 041-1 | «Chicharro» | 1.ª | Agua | Magikarp (Q1, TF) | La Isleta | Chicharro: pez flaco y torpe del muelle que no sirve para nada; la 2.ª, un marrajo enorme y temible. |
| 81 | 041-2 | «Chicharro» | 2.ª | Agua | Gyarados (Q4, AF) |  |  |
| 82 | 057-1 | «Chispa de cable» | 1.ª | Eléctrico | Joltik (Q2, AE) | La Isleta | Chispa de cable: bichito que vive en los enchufes del puerto; la 2.ª, escarabajo con antenas de cobre que suelta descargas. |
| 83 | 057-2 | «Chispa de cable» | 2.ª | Eléctrico/Bicho | Galvantula (Q3, AE) |  |  |
| 84 | 056-1 | «Enredo» | 1.ª | Veneno | Trubbish (Q2, EN) | La Isleta | Enredo: bola de redes de pesca viejas y plástico; la 2.ª, gran mole de redes. Sustituye a Basún, descartado. |
| 85 | 056-2 | «Enredo» | 2.ª | Veneno | Garbodor (Q3, TF) |  |  |
| 86 | 080 | «Farito» | única | Eléctrico | Plusle (Q3, AE) | La Isleta (rara) | Farito: criatura con forma de faro pequeño que lanza destellos. Hace pareja con la boya en combates dobles. |
| 87 | 081 | «Boya» | única | Eléctrico/Agua | Minun (Q3, AE) | Maspalomas (opcional) (rara) | Boya luminosa con cara que parpadea. Hace pareja con el farito en combates dobles. |
| 88 | 003-1 | «Perdiz» | 1.ª | Común | Pidove (Q1, AF) | Las cumbres | Perdiz moruna: polluelo; la 2.ª, perdiz de collar; la 3.ª, gran perdiz de cresta roja. |
| 89 | 003-2 | «Perdiz» | 2.ª | Común/Aire | Tranquill (Q2, AF) |  |  |
| 90 | 003-3 | «Perdiz» | 3.ª | Común/Aire | Unfezant (Q3, AF) |  |  |
| 91 | 039-1 | «Almendrita» | 1.ª | Planta | Cherubi (Q1, AE) | Las cumbres | Almendrita: capullo de almendro cerrado; la 2.ª, se abre en flor de almendro cuando hay sol. |
| 92 | 039-2 | «Almendrita» | 2.ª | Planta | Cherrim (Q3, AE) |  |  |
| 93 | 083 | «Bomba volcánica» | única | Roca/Infernal | Solrock (Q3, AF) | Bandama (opcional) (rara) | Bomba volcánica: roca redonda y agrietada, con lava dentro, que salió volando del cráter. |
| 94 | 071 | «Tabona» | única | Oscuridad/Roca | Sableye (Q2, EN) | Guayadeque | Tabona: duendecillo tallado en obsidiana negra que vive en las casas cueva. |
| 95 | 068-1 | «Cantero» | 1.ª | Tierra | Drilbur (Q2, AF) | Guayadeque | Cantero: criaturita con cola de maza de piedra que pica la toba de las casas cueva; la 2.ª, gran cantero con brazos de pico de hierro. Sustituye a Tunelín, descartado. |
| 96 | 068-2 | «Cantero» | 2.ª | Tierra/Acero | Excadrill (Q4, AF) |  |  |
| 97 | 078 | Tibicán | única | Oscuridad A | Absol (Q3, AF) | Guayadeque (rara) | Lámina del autor (la leyenda del tibicena). |
| 98 | 025-1 | «Burro» | 1.ª | Lucha | Slakoth (Q1, AF) | Las cumbres | Burro: se pasa el día tumbado; la 2.ª, no para quieto y cocea; la 3.ª, enorme burro luchador que solo pelea cuando quiere. La 3.ª es Q5: la vigila el autor. |
| 99 | 025-2 | «Burro» | 2.ª | Lucha | Vigoroth (Q3, AF) |  |  |
| 100 | 025-3 | «Burro» | 3.ª | Lucha | Slaking (Q5, AF) |  |  |
| 101 | 010-1 | Caprún | 1.ª | Tierra A | Shinx (Q1, AF) | Roque Nublo | Lámina del autor. |
| 102 | 010-2 | Roquén | 2.ª | Tierra A | Luxio (Q2, AF) |  |  |
| 103 | 010-3 | Terracorn | 3.ª | Tierra A | Luxray (Q4, AF) |  |  |
| 104 | 020-1 | Briso | 1.ª | Eléctrico A | Tynamo (Q1, EN) | Roque Nublo | Lámina del autor. |
| 105 | 020-2 | Alisor | 2.ª | Eléctrico A | Eelektrik (Q3, EN) |  |  |
| 106 | 020-3 | Alisior | 3.ª | Eléctrico A | Eelektross (Q4, EN) |  |  |
| 107 | 036-1 | Voltéro | 1.ª | Eléctrico A | Electrike (Q1, AE) | Tejeda y Artenara | Lámina del autor. |
| 108 | 036-2 | Raigón | 2.ª | Eléctrico A | Manectric (Q3, AE) |  |  |
| 109 | 073 | «Bailador de isa» | única | Lucha | Spinda (Q2, EN) | Tejeda y Artenara | Bailador de isa que da vueltas, se marea y marea al rival. Le va al gimnasio de Lucha, el de la confusión. |
| 110 | 077 | «Saltador de garrote» | única | Lucha | Zangoose (Q3, AF) | Tejeda y Artenara | Saltador de garrote: criatura ágil que salta riscos con un palo largo, como en el salto del pastor. |
| 111 | 033-1 | «Piña luchadora» | 1.ª | Lucha | Shroomish (Q1, TE) | Tamadaba | Piña de pino canario que rueda; la 2.ª, luchador de piña que reparte patadas. |
| 112 | 033-2 | «Piña luchadora» | 2.ª | Lucha/Planta | Breloom (Q3, AF) |  |  |
| 113 | 042-1 | «Lisa de la charca» | 1.ª | Agua | Feebas (Q1, TE) | Maspalomas (opcional) | Lisa gris y fea de la charca del oasis; la 2.ª, gran pez precioso con velos de colores. |
| 114 | 042-2 | «Lisa de la charca» | 2.ª | Agua | Milotic (Q4, TE) |  |  |

### Tenerife

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 115 | 001-1 | «Mariposa de laurisilva» | 1.ª | Bicho | Wurmple (Q1, EN) | Anaga | Oruga de la laurisilva; la 2.ª, capullo colgado; la 3.ª, gran mariposa blanca y verde. |
| 116 | 001-2 | «Mariposa de laurisilva» | 2.ª | Bicho | Cascoon (Q1, TF) |  |  |
| 117 | 001-3 | «Mariposa de laurisilva» | 3.ª | Bicho/Aire | Dustox (Q2, TE) |  |  |
| 118 | 030-1 | «Gato del monte» | 1.ª | Oscuridad | Poochyena (Q1, AF) | Anaga | Gato del monte: gatito negro asilvestrado; la 2.ª, gran gato de ojos amarillos. |
| 119 | 030-2 | «Gato del monte» | 2.ª | Oscuridad | Mightyena (Q3, AF) |  |  |
| 120 | 053-1 | «Hurón» | 1.ª | Veneno | Stunky (Q2, EN) | Anaga | Hurón de la caza del conejo, que suelta mal olor; la 2.ª, grande y de cola esponjada. |
| 121 | 053-2 | «Hurón» | 2.ª | Veneno | Skuntank (Q3, EN) |  |  |
| 122 | 065-1 | «Farol» | 1.ª | Acero | Bronzor (Q2, TF) | La Laguna | Farol de hierro de calle antigua con una llamita dentro; la 2.ª, farol grande que alumbra a las ánimas. |
| 123 | 065-2 | «Farol» | 2.ª | Acero/Espectral | Bronzong (Q4, TF) |  |  |
| 124 | 072 | «Aldaba» | única | Acero | Mawile (Q2, TF) | La Laguna (rara) | Aldaba de bronce con cara, de las puertas antiguas, que muerde. |
| 125 | 002-1 | «Tortuga boba» | 1.ª | Agua | Azurill (Q1, TE) | Puerto de la Cruz | Tortuga boba: cría recién salida del huevo; la 2.ª, tortuga marina joven; la 3.ª, gran tortuga marina. |
| 126 | 002-2 | «Tortuga boba» | 2.ª | Agua | Marill (Q1, EN) |  |  |
| 127 | 002-3 | «Tortuga boba» | 3.ª | Agua | Azumarill (Q3, EN) |  |  |
| 128 | 074 | «Vieja» | única | Agua | Luvdisc (Q2, EN) | Puerto de la Cruz | Vieja: pez loro rojo y redondo de los charcos. |
| 129 | 063-1 | «Tortuga gigante» | 1.ª | Acero | Shieldon (Q2, TF) | Cueva del Viento | Tortuga gigante de las islas, que se creía extinta: cría con caparazón de piedra; la 2.ª, coraza de piedra y hierro. |
| 130 | 063-2 | «Tortuga gigante» | 2.ª | Acero/Roca | Bastiodon (Q4, TF) |  |  |
| 131 | 062-1 | «Rata gigante» | 1.ª | Roca | Cranidos (Q2, AF) | Cueva del Viento | Rata gigante de las islas, que se creía extinta, con el cráneo de piedra; la 2.ª, embiste rompiendo rocas. Sustituye al dinosaurio descartado. |
| 132 | 062-2 | «Rata gigante» | 2.ª | Roca | Rampardos (Q4, AF) |  |  |
| 133 | 089 | «Ánima de lava» | única | Espectral | Spiritomb (Q4, EN) | Cueva del Viento (rara) | Ánima atrapada en una lágrima de lava del tubo volcánico. |
| 134 | 075 | «Guincho» | única | Aire | Skarmory (Q3, TF) | Teno y Masca | Guincho: águila pescadora de los acantilados. |
| 135 | 059-1 | «Delfín» | 1.ª | Agua | Buizel (Q2, AF) | Los Gigantes (costa) | Delfín mular: cría juguetona; la 2.ª, delfín acróbata. |
| 136 | 059-2 | «Delfín» | 2.ª | Agua | Floatzel (Q4, AF) |  |  |
| 137 | 047-1 | «Morena» | 1.ª | Oscuridad | Carvanha (Q2, AF) | Los Gigantes (costa) | Morena de las grietas; la 2.ª, gran morena negra. |
| 138 | 047-2 | «Morena» | 2.ª | Oscuridad/Agua | Sharpedo (Q3, AF) |  |  |
| 139 | 090 | «Calamar gigante» | única | Hielo/Agua | Lapras (Q4, EN) | Los Gigantes (costa) (rara) | Calamar gigante de las aguas profundas y frías. |
| 140 | 058-1 | «Neverita» | 1.ª | Hielo | Snorunt (Q2, EN) | Las Cañadas | Neverita: cría que guarda nieve en su caparazón, como los pozos de nieve del Teide; la 2.ª, grande y helada. |
| 141 | 058-2 | «Neverita» | 2.ª | Hielo | Glalie (Q4, EN) |  |  |
| 142 | 015-1 | «Escarcha» | 1.ª | Hielo | Solosis (Q1, AE) | Las Cañadas | Cristalito de escarcha de las retamas; la 2.ª, ramillete de cristales; la 3.ª, gran flor de hielo. |
| 143 | 015-2 | «Escarcha» | 2.ª | Hielo | Duosion (Q2, AE) |  |  |
| 144 | 015-3 | «Escarcha» | 3.ª | Hielo/Mental | Reuniclus (Q4, AE) |  |  |
| 145 | 019-1 | «Tajinaste» | 1.ª | Planta | Budew (Q1, AE) | Las Cañadas | Tajinaste: brote; la 2.ª, con espigas de flores; la 3.ª, gran torre de flores rojas que suelta polen tóxico. |
| 146 | 019-2 | «Tajinaste» | 2.ª | Veneno/Planta | Roselia (Q3, AE) |  |  |
| 147 | 019-3 | «Tajinaste» | 3.ª | Veneno/Planta | Roserade (Q4, AE) |  |  |
| 148 | 101 | «Guardián del Sello» | única | Ancestral/Aire | Rayquaza (Q5, EN) | El Teide, la cima (leyenda) | Guardián del Sello, que vive en lo alto del Teide. |
| 149 | 099 | «Guardián del hielo» | única | Hielo | Regice (Q5, TE) | Cueva del Hielo del Teide (leyenda) | Guardián de la Cueva del Hielo, junto a la cima del Teide. |

### La Gomera

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 150 | 006-1 | «Silbador» | 1.ª | Mental | Ralts (Q1, AE) | Hermigua y Agulo | Silbador: criaturita de orejas enormes que habla silbando, como el silbo gomero; la 2.ª, con orejas como alas; la 3.ª, alta y elegante, habla con la mente. |
| 151 | 006-2 | «Silbador» | 2.ª | Mental | Kirlia (Q1, AE) |  |  |
| 152 | 006-3 | «Silbador» | 3.ª | Mental | Gardevoir (Q4, AE) |  |  |
| 153 | 049-1 | «Caracol hipnótico» | 1.ª | Mental | Spoink (Q2, TE) | Valle Gran Rey | Caracol de concha en espiral que hipnotiza; la 2.ª, gran caracol de concha brillante. |
| 154 | 049-2 | «Caracol hipnótico» | 2.ª | Mental | Grumpig (Q3, TE) |  |  |
| 155 | 014-1 | «Duende de laurisilva» | 1.ª | Espectral | Gothita (Q1, TE) | Garajonay | Duende de musgo y niebla de la laurisilva; la 2.ª, más alto, con barba de líquenes; la 3.ª, guardiana del bosque. |
| 156 | 014-2 | «Duende de laurisilva» | 2.ª | Espectral | Gothorita (Q2, TE) |  |  |
| 157 | 014-3 | «Duende de laurisilva» | 3.ª | Espectral/Planta | Gothitelle (Q4, TE) |  |  |
| 158 | 046-1 | «Bruma» | 1.ª | Espectral | Munna (Q1, AE) | Garajonay | Bruma: nubecilla de niebla con ojos que da sueño; la 2.ª, gran nube de niebla que viaja con el viento. |
| 159 | 046-2 | «Bruma» | 2.ª | Espectral/Aire | Musharna (Q4, AE) |  |  |
| 160 | 064-1 | «Coruja» | 1.ª | Oscuridad | Zorua (Q2, AE) | Garajonay | Coruja (lechuza) que crea ilusiones; la 2.ª, gran lechuza de cara blanca como una máscara. |
| 161 | 064-2 | «Coruja» | 2.ª | Oscuridad/Mental | Zoroark (Q4, AE) |  |  |
| 162 | 066-1 | Miralín | 1.ª | Mental A | Elgyem (Q2, AE) | Roque de Agando | Lámina del autor. |
| 163 | 066-2 | Reflexán | 2.ª | Mental A | Beheeyem (Q4, AE) |  |  |
| 164 | 040-1 | Esporín | 1.ª | Planta A | Foongus (Q1, EN) | Garajonay | Lámina del autor. |
| 165 | 040-2 | Micelord | 2.ª | Planta A | Amoonguss (Q3, EN) |  |  |
| 166 | 087 | «Mantis» | única | Bicho/Mental | Sigilyph (Q4, AE) | Valle Gran Rey | Mantis que reza y lee la mente. |
| 167 | 008-1 | «Bucio» | 1.ª | Común | Whismur (Q1, EN) | Los Órganos (costa) | Bucio: caracola que retumba al soplar; la 2.ª, más grande; la 3.ª, enorme caracola que atruena. |
| 168 | 008-2 | «Bucio» | 2.ª | Común | Loudred (Q2, EN) |  |  |
| 169 | 008-3 | «Bucio» | 3.ª | Común | Exploud (Q4, EN) |  |  |
| 170 | 100 | «Gara» | única | Mental | Cresselia (Q5, TE) | Alto de Garajonay (leyenda) | Inspirada en Gara, de la leyenda de Gara y Jonay: criatura de niebla y luna del alto de la isla. |
| 171 | 096 | «Jonay» | única | Aire/Agua | Latios (Q5, AE) | Entre Tenerife y La Gomera (leyenda errante) | Inspirada en Jonay, el que cruzó el mar desde Tenerife: vuela entre las dos islas. |

### La Palma

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 172 | 045-1 | «Flor de cumbre» | 1.ª | Planta | Petilil (Q1, AE) | La Caldera de Taburiente | Capullo de flor de cumbre; la 2.ª, bailarina de pétalos. |
| 173 | 045-2 | «Flor de cumbre» | 2.ª | Planta | Lilligant (Q4, AE) |  |  |
| 174 | 086 | «Pelotero» | única | Bicho/Tierra | Pinsir (Q4, AF) | La Caldera de Taburiente | Escarabajo pelotero que empuja una bola de tierra más grande que él. |
| 175 | 060-1 | «Bejeque» | 1.ª | Planta | Lileep (Q2, TE) | Garafía | Bejeque: roseta de hojas gordas pegada a la roca; la 2.ª, gran bejeque con hojas en abanico. |
| 176 | 060-2 | «Bejeque» | 2.ª | Planta/Roca | Cradily (Q4, TE) |  |  |
| 177 | 088 | «Carámbano» | única | Hielo | Cryogonal (Q4, TE) | Roque de los Muchachos | Carámbano: estalactita de hielo con ojos que cuelga de las rocas de la cumbre. |
| 178 | 085 | «Saltamontes gigante» | única | Bicho/Lucha | Heracross (Q4, AF) | Roque de los Muchachos | Saltamontes gigante sin alas de las cumbres, que da patadas. |
| 179 | 070-1 | «Tunera» | 1.ª | Planta | Ferroseed (Q2, TF) | Los Llanos y Tazacorte | Tunera: palita de tunera con espinas de metal; la 2.ª, gran tunera que lanza espinas. |
| 180 | 070-2 | «Tunera» | 2.ª | Planta/Acero | Ferrothorn (Q4, TF) |  |  |
| 181 | 055-1 | «Cochinilla» | 1.ª | Bicho | Dwebble (Q2, TF) | Los Llanos y Tazacorte | Cochinilla de la tunera, blanca y algodonosa; la 2.ª, gran bicho de caparazón rojo carmín. Sustituye a Cangrix, descartado. |
| 182 | 055-2 | «Cochinilla» | 2.ª | Bicho | Crustle (Q3, TF) |  |  |
| 183 | 069-1 | «Diablillo» | 1.ª | Infernal | Darumaka (Q2, AF) | Los Llanos y Tazacorte | Diablillo de fuegos artificiales, como el de las fiestas de Tijarafe; la 2.ª, gran diablo que escupe cohetes. |
| 184 | 069-2 | «Diablillo» | 2.ª | Infernal/Oscuridad | Darmanitan (Q4, AF) |  |  |
| 185 | 048-1 | «Tea» | 1.ª | Infernal | Numel (Q2, AE) | Fuencaliente | Tea: tronquito de pino resinoso con una llama; la 2.ª, gran tocón de tea ardiendo. |
| 186 | 048-2 | «Tea» | 2.ª | Infernal | Camerupt (Q3, AE) |  |  |
| 187 | 098 | «Guardián de las estrellas» | única | Acero/Mental | Cobalion (Q5, TF) | El observatorio del Roque (leyenda) | Guardián de las estrellas, en el observatorio del Roque. |

### El Hierro

| # | Archivo | Especie | Forma | Tipos | Estadísticas de | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 188 | 028-1 | Sanbor | 1.ª | Agua A | Deino (Q2, AF) | Orchilla (llegada) (rara) | Lámina del autor. |
| 189 | 028-2 | Borondis | 2.ª | Agua/Ancestral A | Zweilous (Q3, AF) |  |  |
| 190 | 028-3 | Atlantea | 3.ª | Agua/Ancestral A | Hydreigon (Q5, AE) |  |  |
| 191 | 013-1 | «Cochino negro» | 1.ª | Infernal | Sandile (Q1, AF) | La Dehesa | Cochino negro: lechón; la 2.ª, cerdo negro con el lomo de escoria; la 3.ª, gran jabalí volcánico. |
| 192 | 013-2 | «Cochino negro» | 2.ª | Infernal | Krokorok (Q2, AF) |  |  |
| 193 | 013-3 | «Cochino negro» | 3.ª | Infernal/Tierra | Krookodile (Q4, AF) |  |  |
| 194 | 084 | «Curandera» | única | Común | Audino (Q3, EN) | El Garoé | Curandera: criatura redonda cubierta de hierbas medicinales que cura a las demás. |
| 195 | 026-1 | Guanchín | 1.ª | Infernal A | Bagon (Q2, AF) | La Cumbre (camino de la Bajada) | Lámina del autor. |
| 196 | 026-2 | Menceyor | 2.ª | Infernal/Ancestral A | Shelgon (Q3, TF) |  |  |
| 197 | 026-3 | Achamán | 3.ª | Infernal/Ancestral A | Salamence (Q5, AF) |  |  |
| 198 | 076 | «Tostador de gofio» | única | Infernal/Tierra | Torkoal (Q3, TF) | La Cumbre (camino de la Bajada) | Tostador de gofio: criatura horno de barro que tuesta el grano en la tripa. |
| 199 | 027-1 | «Lagarto gigante» | 1.ª | Ancestral | Gible (Q2, AF) | Frontera (opcional) (rara) | Lagarto gigante, que se creía extinto: cría de escamas grises; la 2.ª, con cresta; la 3.ª, enorme y antiguo, casi legendario. |
| 200 | 027-2 | «Lagarto gigante» | 2.ª | Ancestral/Tierra | Gabite (Q3, AF) |  |  |
| 201 | 027-3 | «Lagarto gigante» | 3.ª | Ancestral/Tierra | Garchomp (Q5, AF) |  |  |
| 202 | 097 | «Guardián del Tagoro» | única | Infernal/Agua | Regirock (Q5, TF) | El volcán bajo el mar de La Restinga (leyenda) | Guardián del volcán que nació bajo el mar de La Restinga. |
| 203 | 102 | «Guardiana del mar de nubes» | única | Espectral/Ancestral | Giratina (Q5, EN) | El mar de nubes (leyenda) | La que guarda el mar de nubes que escondió El Hierro. |

