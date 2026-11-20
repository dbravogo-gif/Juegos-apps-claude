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
ven antes. Cada criatura sigue `prompts-meshy.md`: imagen 2D, después Image to 3D. La imagen y el
modelo se llaman «PokN. Nombre» (autor, 2026-11-17): N es su número en esta lista, que no cambia
nunca, y el nombre es el suyo o su apodo. Se suben a `conceptos/criaturas/meshy/`. Para que Gemini te las vaya
diciendo de una en una: `conceptos/criaturas/guia-gemini.txt`, que lleva sus instrucciones arriba.

**Coste.** Faltan 167 criaturas (hay 36 hechas). A 15 créditos cada una
(Smart Topology y textura, precio comprobado el 2026-11-07), son unos 2.505 créditos sin
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
| Mental | 8 | 8 | 6 |
| Oscuridad | 8 | 8 | 3 |
| Espectral | 7 | 7 | 2 |
| Acero | 6 | 6 | 2 |
| Roca | 10 | 10 | 3 |
| Ancestral | 4 | 4 | 5 |
| Bicho | 13 | 13 | 3 |
| Veneno | 12 | 12 | 3 |

- **Sin tipo secundario:** el 69 % de las 188 de la lista (objetivo, 60 %).
- **Especies por hierba:** de 3 a 4 en Lanzarote y de 3 a 6 después, con una rara como mucho.
- **Gimnasios:** cada uno tiene al menos 3 especies de su tipo antes de llegar (Lanzarote, 1: la
  roca nueva, que la líder usa evolucionada).

| Isla | Especies nuevas | Criaturas | Por generar | Créditos |
| --- | --- | --- | --- | --- |
| Lanzarote | 47 | 47 | 13 | 195 |
| Fuerteventura | 14 | 30 | 30 | 450 |
| Gran Canaria | 25 | 37 | 37 | 555 |
| Tenerife | 23 | 38 | 36 | 540 |
| La Gomera | 13 | 22 | 22 | 330 |
| La Palma | 10 | 16 | 16 | 240 |
| El Hierro | 11 | 13 | 13 | 195 |
| **Total** | | **203** | **167** | **2.505** |

Lanzarote incluye las 15 iniciales y las 5 leyendas de los pueblos, que duermen allí.

## Las islas y sus zonas

En cada zona, las especies que salen, con la nueva de esa zona en **negrita**. Las leyendas salen
tras la Liga. Niveles: los de `ISLA-3.md` hasta Gran Canaria; después, propuesta. En las islas del
final, una especie que se conoció antes sale ya evolucionada, según el nivel de la zona.

### Lanzarote

Gimnasio de **Roca**, en la Capital, líder 11-12.

| Zona | Niveles | Especies |
| --- | --- | --- |
| El Golfo | 3-5 | **Shimari → Shimarō** · **Ravich → Azurvan** · **Aculiso → Sierpajable** · **Dragosil → Dragombo → Dragalis** (rara) |
| Montañas del Fuego | 5-7 | Shimari → Shimarō · **Quillflare → Quillfire → Quimfernum** · **Kotono → Koloi** · Oreps → Mineps → Colossoreps (rara) |
| El Jable | 6-8 | Ravich → Azurvan · Kotono → Koloi (rara) · **Kine → Kurokin** · **Melaní → Favenir → Reginis** |
| Famara | 6-8 | Aculiso → Sierpajable · **Oreps → Mineps → Colossoreps** (rara) · **Aerund → Marwen** · **Salmito → Salmarín → Salmástil** |
| La Geria (leyenda) | tras la Liga | **«Leyenda verde»** |
| Montañas del Fuego, el cráter (leyenda) | tras la Liga | **Magecora** |
| Risco de Famara (leyenda) | tras la Liga | **«Leyenda de roca»** |
| Pueblos sepultados (leyenda) | tras la Liga | **«Leyenda de tierra»** |
| Los jameos (leyenda; zona por crear) | tras la Liga | **«Leyenda del agua»** |

Para el gimnasio, de Roca: Oreps → Mineps → Colossoreps.

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

Para el gimnasio, de Aire: «Guirre», «Lisa de duna», «Murciélago de cueva», Ravich → Azurvan, Aerund → Marwen, «Remolino de jable».

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

Para el gimnasio, de Lucha: «Burro», «Piña luchadora», Kotono → Koloi, «Bailador de isa», «Saltador de garrote».

### Tenerife

Gimnasio de **Agua**, en el Puerto de la Cruz, líder 36-38; la Liga, en el Teide, 58-62.

| Zona | Niveles | Especies |
| --- | --- | --- |
| Anaga | 26-29 | Ravich → Azurvan · **«Mariposa de laurisilva»** · **«Gato del monte»** · **«Hurón»** |
| La Laguna | 27-29 | «Conejo de jable» · «Gato del monte» · **«Farol»** · **«Aldaba»** (rara) |
| Valle de La Orotava | 28-31 | «Conejo de jable» · «Perdiz» · «Gato del monte» · «Hurón» |
| Puerto de la Cruz | 29-32 | «Erizo negro» · «Tembladera» · **«Tortuga boba»** · **«Vieja»** |
| Cueva del Viento | 30-33 | «Murciélago de cueva» · **«Tortuga gigante»** · **Ishiro → Ishiradon** · **«Ánima de lava»** (rara) |
| Teno y Masca | 31-34 | «Guirre» · Caprún → Roquén → Terracorn · Voltéro → Raigón · **«Guincho»** |
| Los Gigantes (costa) | 32-35 | «Tortuga boba» · **«Delfín»** · **«Morena»** · **«Calamar gigante»** (rara) |
| Las Cañadas | 33-36 | **Magmín → Lavtún → Teidrón** · **«Neverita»** · **«Escarcha»** · **«Tajinaste»** |
| El Teide, la cima (leyenda) | tras la Liga | **«Guardián del Sello»** |
| Cueva del Hielo del Teide (leyenda) | tras la Liga | **«Guardián del hielo»** |

Para el gimnasio, de Agua: «Tortuga boba», Salmito → Salmarín → Salmástil, Aerund → Marwen, Aculiso → Sierpajable, «Chicharro», «Lisa de la charca», «Morena», «Erizo negro», «Carabela», «Delfín», «Tembladera», «Vieja», «Boya», «Calamar gigante».

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

Para el gimnasio, de Mental: «Silbador», «Escarcha», «Caracol hipnótico», «Coruja», Miralín → Reflexán, «Piedra de Tindaya», «Mantis».

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
| La Dehesa | 48-51 | «Perro bardino» · «Guirre» · «Curandera» |
| La Cumbre (camino de la Bajada) | 50-53 | Caprún → Roquén → Terracorn · Magmín → Lavtún → Teidrón · **Guanchín → Menceyor → Achamán** · **«Tostador de gofio»** |
| El Garoé | 51-53 | «Silbador» · «Duende de laurisilva» · Esporín → Micelord · **«Curandera»** |
| Frontera (opcional) | 50-54 | Guanchín → Menceyor → Achamán · «Tostador de gofio» · **«Lagarto gigante»** (rara) |
| La Restinga (opcional) | 52-55 | «Delfín» · «Morena» · «Calamar gigante» (rara) · Sanbor → Borondis → Atlantea |
| El volcán bajo el mar de La Restinga (leyenda) | tras la Liga | **«Guardián del Tagoro»** |
| El mar de nubes (leyenda) | tras la Liga | **«Guardiana del mar de nubes»** |

Para el gimnasio, de Infernal: Quillflare → Quillfire → Quimfernum, Magmín → Lavtún → Teidrón, Guanchín → Menceyor → Achamán, «Tea», «Diablillo», «Tostador de gofio», «Bomba volcánica».

Para el gimnasio, de Ancestral: Guanchín → Menceyor → Achamán, «Lagarto gigante», Sanbor → Borondis → Atlantea.

## La lista para generar

Una fila por criatura, en el orden en que conviene generarlas. «Pokédex»: el nombre de la imagen y
del modelo que sube el autor. «Id interno»: el del juego (el número de la lista de referencia de
`CRIATURAS.md` y la forma). «A»: tipos del autor. Entre comillas, «así», un apodo provisional: el
nombre lo pone el autor. La idea va en la primera forma de cada especie.

### Lanzarote

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok1. Cronti | inicial-agua-1 (hecha) | 1.ª | Agua A | Propias (del autor) | 0,4 m | Inicial (museo de Lanzarote) | Nombres del autor; la 1.ª forma ya está hecha. |
| Pok2. Chicront | inicial-agua-2 (hecha) | 2.ª | Agua A | Propias (del autor) | 0,9 m |  |  |
| Pok3. Krantacor | inicial-agua-3 (hecha) | 3.ª | Agua A | Propias (del autor) | 1,6 m |  |  |
| Pok4. Lisza | inicial-planta-1 (hecha) | 1.ª | Planta A | Propias (del autor) | 0,4 m | Inicial (museo de Lanzarote) | El lagarto chamán, que acaba en chamán de Planta/Mental; la 1.ª forma ya está hecha. |
| Pok5. Sporecko | inicial-planta-2 (hecha) | 2.ª | Planta A | Propias (del autor) | 0,9 m |  |  |
| Pok6. Transcecko | inicial-planta-3 (hecha) | 3.ª | Planta/Mental A | Propias (del autor) | 1,7 m |  |  |
| Pok7. Nokoribi | inicial-infernal-1 (hecha) | 1.ª | Infernal A | Propias (del autor) | 0,4 m | Inicial (museo de Lanzarote) | La 1.ª forma ya está hecha. |
| Pok8. Hinozö | inicial-infernal-2 (hecha) | 2.ª | Infernal A | Propias (del autor) | 0,9 m |  |  |
| Pok9. Dumbotron | inicial-infernal-3 (hecha) | 3.ª | Infernal A | Propias (del autor) | 1,7 m |  |  |
| Pok10. Armalito | inicial-roca-1 (hecha) | 1.ª | Roca A | Propias (del autor) | 0,4 m | Inicial (museo de Lanzarote) | Lámina del autor; la 1.ª forma ya está hecha. |
| Pok11. Uralito | inicial-roca-2 (hecha) | 2.ª | Roca/Veneno A | Propias (del autor) | 1,0 m |  |  |
| Pok12. Reactolito | inicial-roca-3 (hecha) | 3.ª | Roca/Veneno A | Propias (del autor) | 1,8 m |  |  |
| Pok13. Tsubomi | inicial-tierra-1 (hecha) | 1.ª | Tierra A | Propias (del autor) | 0,4 m | Inicial (museo de Lanzarote) | Por diseñar: la inicial del pueblo de los pueblos sepultados por el volcán. Una cría de tierra y ceniza que, al evolucionar, gana un aire espectral. Que no se parezca a las otras cuatro iniciales. |
| Pok14. Tsuborei | inicial-tierra-2 (hecha) | 2.ª | Tierra/Espectral A | Propias (del autor) | 0,9 m |  |  |
| Pok15. Sunaiki | inicial-tierra-3 (hecha) | 3.ª | Tierra/Espectral A | Propias (del autor) | 1,7 m |  |  |
| Pok16. Shimari | 031-1 (hecha) | 1.ª | Común A | Zigzagoon (Q1, AF) | 0,4 m | El Golfo | Lámina del autor (civeta.jpg). |
| Pok17. Shimarō | 031-2 (hecha) | 2.ª | Común A | Linoone (Q3, AF) | 0,8 m |  |  |
| Pok18. Ravich | 032-1 (hecha) | 1.ª | Aire A | Taillow (Q1, AF) | 0,3 m | El Golfo | Hecha por el autor. |
| Pok19. Azurvan | 032-2 (hecha) | 2.ª | Aire A | Swellow (Q3, AF) | 1,2 m |  |  |
| Pok20. Aculiso | 037-1 (hecha) | 1.ª | Agua | Barboach (Q1, EN) | 0,3 m | El Golfo | Hecha por el autor. |
| Pok21. Sierpajable | 037-2 (hecha) | 2.ª | Agua/Tierra | Whiscash (Q3, EN) | 1,0 m |  |  |
| Pok22. Dragosil | 007-1 (hecha) | 1.ª | Planta A | Lotad (Q1, TE) | 0,5 m | El Golfo (rara) | Lámina del autor; hecha. |
| Pok23. Dragombo | 007-2 (hecha) | 2.ª | Planta A | Lombre (Q2, TE) | 1,4 m |  |  |
| Pok24. Dragalis | 007-3 (hecha) | 3.ª | Planta A | Ludicolo (Q4, TE) | 3,0 m |  |  |
| Pok25. Quillflare | 013-1 (hecha) | 1.ª | Infernal | Sandile (Q1, AF) | 0,3 m | Montañas del Fuego | Hecha por el autor. |
| Pok26. Quillfire | 013-2 (hecha) | 2.ª | Infernal | Krokorok (Q2, AF) | 0,7 m |  |  |
| Pok27. Quimfernum | 013-3 (hecha) | 3.ª | Infernal/Tierra | Krookodile (Q4, AF) | 1,4 m |  |  |
| Pok28. Kotono | 043-1 (hecha) | 1.ª | Lucha | Riolu (Q1, AF) | 0,3 m | Montañas del Fuego | Hecha por el autor. |
| Pok29. Koloi | 043-2 (hecha) | 2.ª | Lucha | Lucario (Q4, AE) | 1,1 m |  |  |
| Pok30. Oreps | 012-1 (hecha) | 1.ª | Roca | Roggenrola (Q1, TF) | 0,4 m | Famara (rara) | Hecha por el autor. |
| Pok31. Mineps | 012-2 (hecha) | 2.ª | Roca | Boldore (Q2, TF) | 1,0 m |  |  |
| Pok32. Colossoreps | 012-3 (hecha) | 3.ª | Roca | Gigalith (Q4, TF) | 2,0 m |  |  |
| Pok33. Kine | 034-1 (hecha) | 1.ª | Tierra A | Makuhita (Q1, AF) | 0,5 m | El Jable | Hecha por el autor. |
| Pok34. Kurokin | 034-2 (hecha) | 2.ª | Tierra A | Hariyama (Q3, AF) | 1,2 m |  |  |
| Pok35. Melaní | 005-1 | 1.ª | Bicho A | Venipede (Q1, TF) | 0,3 m | El Jable | Lámina del autor. |
| Pok36. Favenir | 005-2 | 2.ª | Bicho/Veneno A | Whirlipede (Q2, TF) | 0,6 m |  |  |
| Pok37. Reginis | 005-3 | 3.ª | Bicho/Veneno A | Scolipede (Q3, AF) | 1,5 m |  |  |
| Pok38. Aerund | 035-1 | 1.ª | Aire A | Wingull (Q1, AE) | 0,4 m | Famara | Lámina del autor. |
| Pok39. Marwen | 035-2 | 2.ª | Aire/Agua A | Pelipper (Q3, TF) | 1,8 m |  |  |
| Pok40. Salmito | 018-1 | 1.ª | Agua | Spheal (Q1, EN) | 0,5 m | Famara | Nombre del autor; el aspecto, por diseñar. |
| Pok41. Salmarín | 018-2 | 2.ª | Agua | Sealeo (Q3, EN) | 1,1 m |  |  |
| Pok42. Salmástil | 018-3 | 3.ª | Agua/Hielo | Walrein (Q4, TE) | 1,8 m |  |  |
| Pok43. Leyenda verde | 094 | única | Planta/Tierra | Dialga (Q5, AE) | 4,0 m | La Geria (leyenda) | La leyenda verde, del pueblo del Hoyo: gran criatura de vid y picón que duerme en un hoyo de La Geria. |
| Pok44. Magecora | 095 | única | Infernal/Mental A | Reshiram (Q5, AE) | 3,5 m | Montañas del Fuego, el cráter (leyenda) | Lámina del autor: la leyenda infernal, del pueblo de la Colada. |
| Pok45. Leyenda de roca | 092 | única | Roca/Aire | Zekrom (Q5, AF) | 4,0 m | Risco de Famara (leyenda) | La leyenda de roca, del pueblo del Risco: guardiana del acantilado de Famara, de basalto y viento. |
| Pok46. Leyenda de tierra | 091 | única | Tierra/Espectral | Groudon (Q5, AF) | 4,5 m | Pueblos sepultados (leyenda) | La leyenda de tierra, del pueblo del Llano: duerme bajo los pueblos que sepultó el volcán. |
| Pok47. Leyenda del agua | 093 | única | Agua/Oscuridad | Kyogre (Q5, AE) | 5,0 m | Los jameos (leyenda; zona por crear) | La leyenda del agua, del pueblo del Jameo: gran criatura blanca y ciega de los túneles donde entra el mar. |

### Fuerteventura

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok48. Remolino de jable | 044-1 | 1.ª | Aire | Cottonee (Q1, TF) | 0,4 m | Las Dunas | Remolino de jable: bolita de arena y semillas que rueda con el viento; la 2.ª, torbellino de arena con cara. Sustituye al remolino provisional del gimnasio de Aire. |
| Pok49. Remolino de jable | 044-2 | 2.ª | Aire/Tierra | Whimsicott (Q4, TF) | 1,2 m |  |  |
| Pok50. Lisa de duna | 009-1 | 1.ª | Tierra | Trapinch (Q1, AF) | 0,5 m | Las Dunas | Lisa de duna: lagartija que nada bajo la arena; la 2.ª, con aletas de arena; la 3.ª, con velas que planean sobre las dunas. |
| Pok51. Lisa de duna | 009-2 | 2.ª | Tierra | Vibrava (Q2, EN) | 1,1 m |  |  |
| Pok52. Lisa de duna | 009-3 | 3.ª | Tierra/Aire | Flygon (Q4, EN) | 2,0 m |  |  |
| Pok53. Conejo de jable | 038-1 | 1.ª | Común | Bidoof (Q1, EN) | 0,4 m | Las Dunas | Conejo de jable, bajito y orejudo; la 2.ª, conejo grande que excava madrigueras. |
| Pok54. Conejo de jable | 038-2 | 2.ª | Común | Bibarel (Q3, AF) | 0,9 m |  |  |
| Pok55. Cigarrón | 029-1 | 1.ª | Bicho | Kricketot (Q1, TF) | 0,3 m | Las Dunas (rara) | Cigarrón: langosta que llega con el viento de África; la 2.ª, grande, hace sonar las alas. |
| Pok56. Cigarrón | 029-2 | 2.ª | Bicho | Kricketune (Q2, AF) | 0,8 m |  |  |
| Pok57. Dromedario | 054-1 | 1.ª | Común | Deerling (Q2, AF) | 1,0 m | Betancuria | Dromedario majorero: cría torpe de patas largas; la 2.ª, dromedario adulto con alforjas. |
| Pok58. Dromedario | 054-2 | 2.ª | Común | Sawsbuck (Q3, AF) | 2,2 m |  |  |
| Pok59. Perro bardino | 011-1 | 1.ª | Común | Lillipup (Q1, AF) | 0,4 m | Betancuria | Perro bardino: cachorro atigrado; la 2.ª, perro pastor; la 3.ª, gran perro de ganado de melena gruesa. |
| Pok60. Perro bardino | 011-2 | 2.ª | Común | Herdier (Q2, AF) | 0,8 m |  |  |
| Pok61. Perro bardino | 011-3 | 3.ª | Común | Stoutland (Q4, AF) | 1,3 m |  |  |
| Pok62. Guirre | 004-1 | 1.ª | Aire | Starly (Q1, AF) | 0,3 m | Betancuria | Guirre: polluelo blanco; la 2.ª, joven de plumas pardas; la 3.ª, gran guirre de cara amarilla. Sustituye al guirre provisional del gimnasio de Aire. |
| Pok63. Guirre | 004-2 | 2.ª | Aire | Staravia (Q2, AF) | 0,8 m |  |  |
| Pok64. Guirre | 004-3 | 3.ª | Aire | Staraptor (Q3, AF) | 1,5 m |  |  |
| Pok65. Erizo negro | 051-1 | 1.ª | Agua | Corphish (Q2, AF) | 0,3 m | Ajuy | Erizo negro de los charcos, redondo y de púas cortas; la 2.ª, grande y de púas larguísimas. |
| Pok66. Erizo negro | 051-2 | 2.ª | Agua/Oscuridad | Crawdaunt (Q3, AF) | 0,8 m |  |  |
| Pok67. Murciélago de cueva | 017-1 | 1.ª | Veneno | Zubat (Q1, EN) | 0,3 m | Cueva de Ajuy | Murciélago orejudo de cueva, de ojos grandes; la 2.ª y la 3.ª, más grandes, con alas como capas. |
| Pok68. Murciélago de cueva | 017-2 | 2.ª | Veneno/Aire | Golbat (Q3, EN) | 0,8 m |  |  |
| Pok69. Murciélago de cueva | 017-3 | 3.ª | Veneno/Aire | Crobat (Q4, EN) | 1,5 m |  |  |
| Pok70. Escarabajo de escoria | 061-1 | 1.ª | Roca | Anorith (Q2, AF) | 0,5 m | Cueva de Ajuy | Escarabajo de escoria volcánica que rueda por la cueva; la 2.ª, erguido y con brazos de basalto. |
| Pok71. Escarabajo de escoria | 061-2 | 2.ª | Roca/Bicho | Armaldo (Q4, AF) | 1,4 m |  |  |
| Pok72. Escolopendra | 079 | única | Veneno/Bicho | Seviper (Q3, AE) | 1,8 m | Cofete (opcional) | Escolopendra: ciempiés gigante de las piedras, con colores de aviso. |
| Pok73. Carabela | 052-1 | 1.ª | Veneno | Shellos (Q2, EN) | 0,4 m | Sotavento | Carabela: medusa con una vela azul que flota en la laguna; la 2.ª, colonia grande con vela de colores. |
| Pok74. Carabela | 052-2 | 2.ª | Veneno/Agua | Gastrodon (Q3, TE) | 1,2 m |  |  |
| Pok75. Piedra de Tindaya | 082 | única | Roca/Mental | Lunatone (Q3, AE) | 1,0 m | Tindaya (opcional) (rara) | Piedra de la montaña sagrada: roca clara con grabados que flota y medita. |
| Pok76. Cardón | 050-1 | 1.ª | Planta | Cacnea (Q2, AE) | 0,4 m | Cofete (opcional) | Cardón de Jandía: brote de cardón de brazos cortos; la 2.ª, gran cardón con brazos de candelabro y savia tóxica. |
| Pok77. Cardón | 050-2 | 2.ª | Planta/Veneno | Cacturne (Q3, AE) | 1,8 m |  |  |

### Gran Canaria

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok78. Tembladera | 067-1 | 1.ª | Eléctrico | Psyduck (Q2, AE) | 0,5 m | La Isleta | Tembladera: raya eléctrica de la arena del puerto; la 2.ª, grande, con alas que chispean. |
| Pok79. Tembladera | 067-2 | 2.ª | Eléctrico/Agua | Golduck (Q4, AE) | 1,6 m |  |  |
| Pok80. Chicharro | 041-1 | 1.ª | Agua | Magikarp (Q1, TF) | 0,4 m | La Isleta | Chicharro: pez flaco y torpe del muelle que no sirve para nada; la 2.ª, un marrajo enorme y temible. |
| Pok81. Chicharro | 041-2 | 2.ª | Agua | Gyarados (Q4, AF) | 4,0 m |  |  |
| Pok82. Chispa de cable | 057-1 | 1.ª | Eléctrico | Joltik (Q2, AE) | 0,1 m | La Isleta | Chispa de cable: bichito que vive en los enchufes del puerto; la 2.ª, escarabajo con antenas de cobre que suelta descargas. |
| Pok83. Chispa de cable | 057-2 | 2.ª | Eléctrico/Bicho | Galvantula (Q3, AE) | 0,8 m |  |  |
| Pok84. Enredo | 056-1 | 1.ª | Veneno | Trubbish (Q2, EN) | 0,6 m | La Isleta | Enredo: bola de redes de pesca viejas y plástico; la 2.ª, gran mole de redes. Sustituye a Basún, descartado. |
| Pok85. Enredo | 056-2 | 2.ª | Veneno | Garbodor (Q3, TF) | 1,9 m |  |  |
| Pok86. Farito | 080 | única | Eléctrico | Plusle (Q3, AE) | 0,4 m | La Isleta (rara) | Farito: criatura con forma de faro pequeño que lanza destellos. Hace pareja con la boya en combates dobles. |
| Pok87. Boya | 081 | única | Eléctrico/Agua | Minun (Q3, AE) | 0,4 m | Maspalomas (opcional) (rara) | Boya luminosa con cara que parpadea. Hace pareja con el farito en combates dobles. |
| Pok88. Perdiz | 003-1 | 1.ª | Común | Pidove (Q1, AF) | 0,3 m | Las cumbres | Perdiz moruna: polluelo; la 2.ª, perdiz de collar; la 3.ª, gran perdiz de cresta roja. |
| Pok89. Perdiz | 003-2 | 2.ª | Común/Aire | Tranquill (Q2, AF) | 0,6 m |  |  |
| Pok90. Perdiz | 003-3 | 3.ª | Común/Aire | Unfezant (Q3, AF) | 1,2 m |  |  |
| Pok91. Almendrita | 039-1 | 1.ª | Planta | Cherubi (Q1, AE) | 0,4 m | Las cumbres | Almendrita: capullo de almendro cerrado; la 2.ª, se abre en flor de almendro cuando hay sol. |
| Pok92. Almendrita | 039-2 | 2.ª | Planta | Cherrim (Q3, AE) | 0,5 m |  |  |
| Pok93. Bomba volcánica | 083 | única | Roca/Infernal | Solrock (Q3, AF) | 1,2 m | Bandama (opcional) (rara) | Bomba volcánica: roca redonda y agrietada, con lava dentro, que salió volando del cráter. |
| Pok94. Tabona | 071 | única | Oscuridad/Roca | Sableye (Q2, EN) | 0,5 m | Guayadeque | Tabona: duendecillo tallado en obsidiana negra que vive en las casas cueva. |
| Pok95. Cantero | 068-1 | 1.ª | Tierra | Drilbur (Q2, AF) | 0,4 m | Guayadeque | Cantero: criaturita con cola de maza de piedra que pica la toba de las casas cueva; la 2.ª, gran cantero con brazos de pico de hierro. Sustituye a Tunelín, descartado. |
| Pok96. Cantero | 068-2 | 2.ª | Tierra/Acero | Excadrill (Q4, AF) | 1,0 m |  |  |
| Pok97. Tibicán | 078 | única | Oscuridad A | Absol (Q3, AF) | 1,6 m | Guayadeque (rara) | Lámina del autor (la leyenda del tibicena). |
| Pok98. Burro | 025-1 | 1.ª | Lucha | Slakoth (Q1, AF) | 0,8 m | Las cumbres | Burro: se pasa el día tumbado; la 2.ª, no para quieto y cocea; la 3.ª, enorme burro luchador que solo pelea cuando quiere. La 3.ª es Q5: la vigila el autor. |
| Pok99. Burro | 025-2 | 2.ª | Lucha | Vigoroth (Q3, AF) | 1,4 m |  |  |
| Pok100. Burro | 025-3 | 3.ª | Lucha | Slaking (Q5, AF) | 2,2 m |  |  |
| Pok101. Caprún | 010-1 | 1.ª | Tierra A | Shinx (Q1, AF) | 0,5 m | Roque Nublo | Lámina del autor. |
| Pok102. Roquén | 010-2 | 2.ª | Tierra A | Luxio (Q2, AF) | 1,1 m |  |  |
| Pok103. Terracorn | 010-3 | 3.ª | Tierra A | Luxray (Q4, AF) | 2,5 m |  |  |
| Pok104. Briso | 020-1 | 1.ª | Eléctrico A | Tynamo (Q1, EN) | 0,4 m | Roque Nublo | Lámina del autor. |
| Pok105. Alisor | 020-2 | 2.ª | Eléctrico A | Eelektrik (Q3, EN) | 1,5 m |  |  |
| Pok106. Alisior | 020-3 | 3.ª | Eléctrico A | Eelektross (Q4, EN) | 4,0 m |  |  |
| Pok107. Voltéro | 036-1 | 1.ª | Eléctrico A | Electrike (Q1, AE) | 0,6 m | Tejeda y Artenara | Lámina del autor. |
| Pok108. Raigón | 036-2 | 2.ª | Eléctrico A | Manectric (Q3, AE) | 1,5 m |  |  |
| Pok109. Bailador de isa | 073 | única | Lucha | Spinda (Q2, EN) | 1,1 m | Tejeda y Artenara | Bailador de isa que da vueltas, se marea y marea al rival. Le va al gimnasio de Lucha, el de la confusión. |
| Pok110. Saltador de garrote | 077 | única | Lucha | Zangoose (Q3, AF) | 1,3 m | Tejeda y Artenara | Saltador de garrote: criatura ágil que salta riscos con un palo largo, como en el salto del pastor. |
| Pok111. Piña luchadora | 033-1 | 1.ª | Lucha | Shroomish (Q1, TE) | 0,4 m | Tamadaba | Piña de pino canario que rueda; la 2.ª, luchador de piña que reparte patadas. |
| Pok112. Piña luchadora | 033-2 | 2.ª | Lucha/Planta | Breloom (Q3, AF) | 1,2 m |  |  |
| Pok113. Lisa de la charca | 042-1 | 1.ª | Agua | Feebas (Q1, TE) | 0,6 m | Maspalomas (opcional) | Lisa gris y fea de la charca del oasis; la 2.ª, gran pez precioso con velos de colores. |
| Pok114. Lisa de la charca | 042-2 | 2.ª | Agua | Milotic (Q4, TE) | 2,5 m |  |  |

### Tenerife

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok115. Mariposa de laurisilva | 001-1 | 1.ª | Bicho | Wurmple (Q1, EN) | 0,3 m | Anaga | Oruga de la laurisilva; la 2.ª, capullo colgado; la 3.ª, gran mariposa blanca y verde. |
| Pok116. Mariposa de laurisilva | 001-2 | 2.ª | Bicho | Cascoon (Q1, TF) | 0,6 m |  |  |
| Pok117. Mariposa de laurisilva | 001-3 | 3.ª | Bicho/Aire | Dustox (Q2, TE) | 1,0 m |  |  |
| Pok118. Gato del monte | 030-1 | 1.ª | Oscuridad | Poochyena (Q1, AF) | 0,4 m | Anaga | Gato del monte: gatito negro asilvestrado; la 2.ª, gran gato de ojos amarillos. |
| Pok119. Gato del monte | 030-2 | 2.ª | Oscuridad | Mightyena (Q3, AF) | 1,0 m |  |  |
| Pok120. Hurón | 053-1 | 1.ª | Veneno | Stunky (Q2, EN) | 0,4 m | Anaga | Hurón de la caza del conejo, que suelta mal olor; la 2.ª, grande y de cola esponjada. |
| Pok121. Hurón | 053-2 | 2.ª | Veneno | Skuntank (Q3, EN) | 1,0 m |  |  |
| Pok122. Farol | 065-1 | 1.ª | Acero | Bronzor (Q2, TF) | 0,5 m | La Laguna | Farol de hierro de calle antigua con una llamita dentro; la 2.ª, farol grande que alumbra a las ánimas. |
| Pok123. Farol | 065-2 | 2.ª | Acero/Espectral | Bronzong (Q4, TF) | 1,3 m |  |  |
| Pok124. Aldaba | 072 | única | Acero | Mawile (Q2, TF) | 0,6 m | La Laguna (rara) | Aldaba de bronce con cara, de las puertas antiguas, que muerde. |
| Pok125. Tortuga boba | 002-1 | 1.ª | Agua | Azurill (Q1, TE) | 0,3 m | Puerto de la Cruz | Tortuga boba: cría recién salida del huevo; la 2.ª, tortuga marina joven; la 3.ª, gran tortuga marina. |
| Pok126. Tortuga boba | 002-2 | 2.ª | Agua | Marill (Q1, EN) | 0,8 m |  |  |
| Pok127. Tortuga boba | 002-3 | 3.ª | Agua | Azumarill (Q3, EN) | 1,8 m |  |  |
| Pok128. Vieja | 074 | única | Agua | Luvdisc (Q2, EN) | 0,6 m | Puerto de la Cruz | Vieja: pez loro rojo y redondo de los charcos. |
| Pok129. Tortuga gigante | 063-1 | 1.ª | Acero | Shieldon (Q2, TF) | 0,5 m | Cueva del Viento | Tortuga gigante de las islas, que se creía extinta: cría con caparazón de piedra; la 2.ª, coraza de piedra y hierro. |
| Pok130. Tortuga gigante | 063-2 | 2.ª | Acero/Roca | Bastiodon (Q4, TF) | 1,5 m |  |  |
| Pok131. Ishiro | 062-1 (hecha) | 1.ª | Roca A | Cranidos (Q2, AF) | 0,9 m | Cueva del Viento | Lámina del autor (dino-casco-roca.jpg): dinosaurio con casco de roca. Ishiradon es la estrella de la líder de Roca. |
| Pok132. Ishiradon | 062-2 (hecha) | 2.ª | Roca A | Rampardos (Q4, AF) | 1,6 m |  |  |
| Pok133. Ánima de lava | 089 | única | Espectral | Spiritomb (Q4, EN) | 1,0 m | Cueva del Viento (rara) | Ánima atrapada en una lágrima de lava del tubo volcánico. |
| Pok134. Guincho | 075 | única | Aire | Skarmory (Q3, TF) | 1,7 m | Teno y Masca | Guincho: águila pescadora de los acantilados. |
| Pok135. Delfín | 059-1 | 1.ª | Agua | Buizel (Q2, AF) | 0,8 m | Los Gigantes (costa) | Delfín mular: cría juguetona; la 2.ª, delfín acróbata. |
| Pok136. Delfín | 059-2 | 2.ª | Agua | Floatzel (Q4, AF) | 2,0 m |  |  |
| Pok137. Morena | 047-1 | 1.ª | Oscuridad | Carvanha (Q2, AF) | 0,8 m | Los Gigantes (costa) | Morena de las grietas; la 2.ª, gran morena negra. |
| Pok138. Morena | 047-2 | 2.ª | Oscuridad/Agua | Sharpedo (Q3, AF) | 2,5 m |  |  |
| Pok139. Calamar gigante | 090 | única | Hielo/Agua | Lapras (Q4, EN) | 3,5 m | Los Gigantes (costa) (rara) | Calamar gigante de las aguas profundas y frías. |
| Pok140. Neverita | 058-1 | 1.ª | Hielo | Snorunt (Q2, EN) | 0,5 m | Las Cañadas | Neverita: cría que guarda nieve en su caparazón, como los pozos de nieve del Teide; la 2.ª, grande y helada. |
| Pok141. Neverita | 058-2 | 2.ª | Hielo | Glalie (Q4, EN) | 1,5 m |  |  |
| Pok142. Escarcha | 015-1 | 1.ª | Hielo | Solosis (Q1, AE) | 0,3 m | Las Cañadas | Cristalito de escarcha de las retamas; la 2.ª, ramillete de cristales; la 3.ª, gran flor de hielo. |
| Pok143. Escarcha | 015-2 | 2.ª | Hielo | Duosion (Q2, AE) | 0,6 m |  |  |
| Pok144. Escarcha | 015-3 | 3.ª | Hielo/Mental | Reuniclus (Q4, AE) | 1,0 m |  |  |
| Pok145. Tajinaste | 019-1 | 1.ª | Planta | Budew (Q1, AE) | 0,3 m | Las Cañadas | Tajinaste: brote; la 2.ª, con espigas de flores; la 3.ª, gran torre de flores rojas que suelta polen tóxico. |
| Pok146. Tajinaste | 019-2 | 2.ª | Veneno/Planta | Roselia (Q3, AE) | 0,8 m |  |  |
| Pok147. Tajinaste | 019-3 | 3.ª | Veneno/Planta | Roserade (Q4, AE) | 2,0 m |  |  |
| Pok148. Guardián del Sello | 101 | única | Ancestral/Aire | Rayquaza (Q5, EN) | 7,0 m | El Teide, la cima (leyenda) | Guardián del Sello, que vive en lo alto del Teide. |
| Pok149. Guardián del hielo | 099 | única | Hielo | Regice (Q5, TE) | 2,0 m | Cueva del Hielo del Teide (leyenda) | Guardián de la Cueva del Hielo, junto a la cima del Teide. |
| Pok191. Magmín | 016-1 | 1.ª | Infernal A | Litwick (Q1, AE) | 0,4 m | Las Cañadas | Lámina del autor. Nace del Teide: vive en Las Cañadas (autor, 2026-11-17). |
| Pok192. Lavtún | 016-2 | 2.ª | Infernal A | Lampent (Q2, AE) | 1,0 m |  |  |
| Pok193. Teidrón | 016-3 | 3.ª | Infernal A | Chandelure (Q4, AE) | 2,2 m |  |  |

### La Gomera

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok150. Silbador | 006-1 | 1.ª | Mental | Ralts (Q1, AE) | 0,4 m | Hermigua y Agulo | Silbador: criaturita de orejas enormes que habla silbando, como el silbo gomero; la 2.ª, con orejas como alas; la 3.ª, alta y elegante, habla con la mente. |
| Pok151. Silbador | 006-2 | 2.ª | Mental | Kirlia (Q1, AE) | 0,8 m |  |  |
| Pok152. Silbador | 006-3 | 3.ª | Mental | Gardevoir (Q4, AE) | 1,6 m |  |  |
| Pok153. Caracol hipnótico | 049-1 | 1.ª | Mental | Spoink (Q2, TE) | 0,5 m | Valle Gran Rey | Caracol de concha en espiral que hipnotiza; la 2.ª, gran caracol de concha brillante. |
| Pok154. Caracol hipnótico | 049-2 | 2.ª | Mental | Grumpig (Q3, TE) | 0,9 m |  |  |
| Pok155. Duende de laurisilva | 014-1 | 1.ª | Espectral | Gothita (Q1, TE) | 0,4 m | Garajonay | Duende de musgo y niebla de la laurisilva; la 2.ª, más alto, con barba de líquenes; la 3.ª, guardiana del bosque. |
| Pok156. Duende de laurisilva | 014-2 | 2.ª | Espectral | Gothorita (Q2, TE) | 0,7 m |  |  |
| Pok157. Duende de laurisilva | 014-3 | 3.ª | Espectral/Planta | Gothitelle (Q4, TE) | 1,5 m |  |  |
| Pok158. Bruma | 046-1 | 1.ª | Espectral | Munna (Q1, AE) | 0,6 m | Garajonay | Bruma: nubecilla de niebla con ojos que da sueño; la 2.ª, gran nube de niebla que viaja con el viento. |
| Pok159. Bruma | 046-2 | 2.ª | Espectral/Aire | Musharna (Q4, AE) | 1,1 m |  |  |
| Pok160. Coruja | 064-1 | 1.ª | Oscuridad | Zorua (Q2, AE) | 0,4 m | Garajonay | Coruja (lechuza) que crea ilusiones; la 2.ª, gran lechuza de cara blanca como una máscara. |
| Pok161. Coruja | 064-2 | 2.ª | Oscuridad/Mental | Zoroark (Q4, AE) | 1,2 m |  |  |
| Pok162. Miralín | 066-1 | 1.ª | Mental A | Elgyem (Q2, AE) | 0,5 m | Roque de Agando | Lámina del autor. |
| Pok163. Reflexán | 066-2 | 2.ª | Mental A | Beheeyem (Q4, AE) | 1,5 m |  |  |
| Pok164. Esporín | 040-1 | 1.ª | Planta A | Foongus (Q1, EN) | 0,4 m | Garajonay | Lámina del autor. |
| Pok165. Micelord | 040-2 | 2.ª | Planta A | Amoonguss (Q3, EN) | 1,1 m |  |  |
| Pok166. Mantis | 087 | única | Bicho/Mental | Sigilyph (Q4, AE) | 1,4 m | Valle Gran Rey | Mantis que reza y lee la mente. |
| Pok167. Bucio | 008-1 | 1.ª | Común | Whismur (Q1, EN) | 0,5 m | Los Órganos (costa) | Bucio: caracola que retumba al soplar; la 2.ª, más grande; la 3.ª, enorme caracola que atruena. |
| Pok168. Bucio | 008-2 | 2.ª | Común | Loudred (Q2, EN) | 1,0 m |  |  |
| Pok169. Bucio | 008-3 | 3.ª | Común | Exploud (Q4, EN) | 1,5 m |  |  |
| Pok170. Gara | 100 | única | Mental | Cresselia (Q5, TE) | 1,5 m | Alto de Garajonay (leyenda) | Inspirada en Gara, de la leyenda de Gara y Jonay: criatura de niebla y luna del alto de la isla. |
| Pok171. Jonay | 096 | única | Aire/Agua | Latios (Q5, AE) | 2,0 m | Entre Tenerife y La Gomera (leyenda errante) | Inspirada en Jonay, el que cruzó el mar desde Tenerife: vuela entre las dos islas. |

### La Palma

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok172. Flor de cumbre | 045-1 | 1.ª | Planta | Petilil (Q1, AE) | 0,5 m | La Caldera de Taburiente | Capullo de flor de cumbre; la 2.ª, bailarina de pétalos. |
| Pok173. Flor de cumbre | 045-2 | 2.ª | Planta | Lilligant (Q4, AE) | 1,1 m |  |  |
| Pok174. Pelotero | 086 | única | Bicho/Tierra | Pinsir (Q4, AF) | 1,4 m | La Caldera de Taburiente | Escarabajo pelotero que empuja una bola de tierra más grande que él. |
| Pok175. Bejeque | 060-1 | 1.ª | Planta | Lileep (Q2, TE) | 0,8 m | Garafía | Bejeque: roseta de hojas gordas pegada a la roca; la 2.ª, gran bejeque con hojas en abanico. |
| Pok176. Bejeque | 060-2 | 2.ª | Planta/Roca | Cradily (Q4, TE) | 1,5 m |  |  |
| Pok177. Carámbano | 088 | única | Hielo | Cryogonal (Q4, TE) | 1,1 m | Roque de los Muchachos | Carámbano: estalactita de hielo con ojos que cuelga de las rocas de la cumbre. |
| Pok178. Saltamontes gigante | 085 | única | Bicho/Lucha | Heracross (Q4, AF) | 1,5 m | Roque de los Muchachos | Saltamontes gigante sin alas de las cumbres, que da patadas. |
| Pok179. Tunera | 070-1 | 1.ª | Planta | Ferroseed (Q2, TF) | 0,6 m | Los Llanos y Tazacorte | Tunera: palita de tunera con espinas de metal; la 2.ª, gran tunera que lanza espinas. |
| Pok180. Tunera | 070-2 | 2.ª | Planta/Acero | Ferrothorn (Q4, TF) | 1,0 m |  |  |
| Pok181. Cochinilla | 055-1 | 1.ª | Bicho | Dwebble (Q2, TF) | 0,3 m | Los Llanos y Tazacorte | Cochinilla de la tunera, blanca y algodonosa; la 2.ª, gran bicho de caparazón rojo carmín. Sustituye a Cangrix, descartado. |
| Pok182. Cochinilla | 055-2 | 2.ª | Bicho | Crustle (Q3, TF) | 1,4 m |  |  |
| Pok183. Diablillo | 069-1 | 1.ª | Infernal | Darumaka (Q2, AF) | 0,6 m | Los Llanos y Tazacorte | Diablillo de fuegos artificiales, como el de las fiestas de Tijarafe; la 2.ª, gran diablo que escupe cohetes. |
| Pok184. Diablillo | 069-2 | 2.ª | Infernal/Oscuridad | Darmanitan (Q4, AF) | 1,3 m |  |  |
| Pok185. Tea | 048-1 | 1.ª | Infernal | Numel (Q2, AE) | 0,7 m | Fuencaliente | Tea: tronquito de pino resinoso con una llama; la 2.ª, gran tocón de tea ardiendo. |
| Pok186. Tea | 048-2 | 2.ª | Infernal | Camerupt (Q3, AE) | 1,9 m |  |  |
| Pok187. Guardián de las estrellas | 098 | única | Acero/Mental | Cobalion (Q5, TF) | 2,0 m | El observatorio del Roque (leyenda) | Guardián de las estrellas, en el observatorio del Roque. |

### El Hierro

| Pokédex | Id interno | Forma | Tipos | Estadísticas de | Altura | Zona | Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pok188. Sanbor | 028-1 | 1.ª | Agua A | Deino (Q2, AF) | 1,0 m | Orchilla (llegada) (rara) | Lámina del autor. |
| Pok189. Borondis | 028-2 | 2.ª | Agua/Ancestral A | Zweilous (Q3, AF) | 4,0 m |  |  |
| Pok190. Atlantea | 028-3 | 3.ª | Agua/Ancestral A | Hydreigon (Q5, AE) | 9,0 m |  |  |
| Pok194. Curandera | 084 | única | Común | Audino (Q3, EN) | 1,1 m | El Garoé | Curandera: criatura redonda cubierta de hierbas medicinales que cura a las demás. |
| Pok195. Guanchín | 026-1 | 1.ª | Infernal A | Bagon (Q2, AF) | 0,6 m | La Cumbre (camino de la Bajada) | Lámina del autor. |
| Pok196. Menceyor | 026-2 | 2.ª | Infernal/Ancestral A | Shelgon (Q3, TF) | 1,4 m |  |  |
| Pok197. Achamán | 026-3 | 3.ª | Infernal/Ancestral A | Salamence (Q5, AF) | 2,5 m |  |  |
| Pok198. Tostador de gofio | 076 | única | Infernal/Tierra | Torkoal (Q3, TF) | 1,0 m | La Cumbre (camino de la Bajada) | Tostador de gofio: criatura horno de barro que tuesta el grano en la tripa. |
| Pok199. Lagarto gigante | 027-1 | 1.ª | Ancestral | Gible (Q2, AF) | 0,7 m | Frontera (opcional) (rara) | Lagarto gigante, que se creía extinto: cría de escamas grises; la 2.ª, con cresta; la 3.ª, enorme y antiguo, casi legendario. |
| Pok200. Lagarto gigante | 027-2 | 2.ª | Ancestral/Tierra | Gabite (Q3, AF) | 1,6 m |  |  |
| Pok201. Lagarto gigante | 027-3 | 3.ª | Ancestral/Tierra | Garchomp (Q5, AF) | 2,4 m |  |  |
| Pok202. Guardián del Tagoro | 097 | única | Infernal/Agua | Regirock (Q5, TF) | 2,5 m | El volcán bajo el mar de La Restinga (leyenda) | Guardián del volcán que nació bajo el mar de La Restinga. |
| Pok203. Guardiana del mar de nubes | 102 | única | Espectral/Ancestral | Giratina (Q5, EN) | 6,0 m | El mar de nubes (leyenda) | La que guarda el mar de nubes que escondió El Hierro. |

