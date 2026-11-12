# Criaturas: reglas de reparto y lista de referencia

Del autor, 2026-11-10. Es la «lista de reglas» a la que nos referimos al diseñar criaturas.
**Solo es una referencia interna:** los nombres de Pokémon no salen nunca en el juego.

## Cómo se hace cada criatura

- Cada una de las 200 criaturas se enlaza con un Pokémon de la lista de abajo. Del Pokémon solo
  se toman sus **estadísticas base**, copiadas **exactas**. Si alguna se retoca, lo dice el
  autor.
- De él salen también su quintil de fuerza y su papel, así que el reparto de atacantes,
  tanques y nivelados queda bien hecho sin inventarlo.
- **Es obra nuestra** el aspecto, el nombre, el tipo, algunos ataques y las habilidades. La
  criatura no se parece al Pokémon enlazado (R8).
- El motor usa las mismas seis estadísticas: vida, fuerza, escudo, magia, resistencia mágica y
  celeridad (`src/core/estadisticas.ts`), así que las estadísticas se copian sin convertirlas.
- **Que nada sea demasiado fuerte sin sentido** lo vigila el autor; por ejemplo, Slaking, cuyas
  estadísticas se compensan con una pega que aquí aún no existe.
- **Los segundos tipos** los elige el autor, cuidando que no descompensen.
- **Dónde aparece cada una** se decide al final, con todas generadas y conociendo el tipo de
  cada gimnasio. El reparto de la isla 1 de `DISENO.md` se rehará entonces.
- **Las líneas ramificadas,** más adelante: no suelen salir al principio.

## Cuántas hay

- **200 criaturas en 102 especies:**
  - las 4 iniciales, de 3 formas: 12 criaturas, con estadísticas propias que pasa el autor;
  - 24 especies de 3 formas de la lista;
  - 42 de 2 formas;
  - 20 sin evolución;
  - 12 legendarias.
- Las 188 de la lista siguen el reparto por tipos de abajo, con las legendarias incluidas. Las
  líneas 21 a 24 del PDF del autor (Torchic, Turtwig, Piplup y Aron) se quitaron: su sitio lo
  ocupan las iniciales (autor, 2026-11-10).

**Por tipo principal** (las 188 que no son iniciales; criaturas, no especies):

| Tipo | Criaturas | Tipo | Criaturas |
| --- | --- | --- | --- |
| Común | 16 | Mental | 8 |
| Agua | 21 | Oscuridad | 8 |
| Tierra | 13 | Espectral | 7 |
| Planta | 18 | Acero | 6 |
| Aire | 13 | Roca | 11 |
| Eléctrico | 11 | Ancestral | 4 |
| Hielo | 8 | Bicho | 16 |
| Infernal | 16 | Veneno | 12 |
| Lucha | por decidir | | |

Las iniciales suman aparte, por tipo principal: Agua 3, Planta 3, Infernal 3 y Roca 3
(autor, 2026-11-10).

**Enfrentamientos de las iniciales** (mejor ataque de su tipo). El ciclo del autor: el agua
gana a la roca, la roca al fuego, el fuego a la planta y la planta al agua.

| Ataca ↓ a → | Agua | Planta | Infernal | Roca |
| --- | --- | --- | --- | --- |
| Agua | — | ×½ | ×2 | ×2 |
| Planta | ×2 | — | ×½ | ×2 |
| Infernal | ×½ | ×2 | — | ×½ |
| Roca | ×1 | ×1 | ×2 | — |

- En las primeras formas, el ciclo se cumple, pero Agua y Planta ganan también a la pareja de
  enfrente: ganan 2 duelos, e Infernal y Roca, 1.
- En las finales, con Planta/Mental y Roca/Veneno, Infernal no gana a ninguna. Lo equilibra el
  autor con los segundos tipos.

**Por quintil de fuerza** (las 188 de la lista): Q1 42 · Q2 46 · Q3 44 · Q4 40 · Q5 16. Las 16
del Q5 son las 12 legendarias y las 4 formas finales más fuertes (líneas 25 a 28).

**Por papel** (las 188 de la lista):

- AF, atacante físico: 63;
- AE, atacante especial: 44;
- EN, estadísticas niveladas: 35;
- TF, tanque físico: 26;
- TE, tanque especial: 20.

## Cómo se reparten por zonas (autor, 2026-11-12)

- El autor pide listas por zona («dame X para tal zona») y Claude propone: cuántas formas tiene
  cada especie, el tipo de cada forma y qué Pokémon de la lista le da las estadísticas. Si la
  referencia tiene 3 formas, la especie tiene 3.
- **Tipo principal:** se acerca a los objetivos de la tabla del Excel (arriba, «Por tipo
  principal»; Lucha, por decidir).
- **Tipo secundario:** ningún tipo se repite demasiado como secundario, y el 60 % de las
  criaturas no tiene. A menudo la primera forma no tiene y las siguientes sí.
- **Se reutilizan** las especies ya diseñadas (tabla de abajo) donde encajen.
- Lo asignado se apunta aquí, en «Asignadas», con su zona.

## Asignadas y diseñadas

Las láminas del autor dicen «Pokémon» y llevan una Poké Ball: es solo para nosotros. En el juego
se usa otra palabra (R8).

| Especie (formas) | Tipos por forma | Estadísticas de | Estado |
| --- | --- | --- | --- |
| Cronti → Chicront → Krantacor | Agua · Agua · Agua | Propias (inicial) | Nombre |
| Armalito → Uralito → Reactolito | Roca · Roca/Veneno · Roca/Veneno | Propias (inicial) | Lámina |
| Caprún → Roquén → Terracorn | Tierra | Shinx → Luxio → Luxray (Q1) | Lámina |
| Melaní → Favenir → Reginis | Bicho · Bicho/Veneno · Bicho/Veneno | Venipede → Whirlipede → Scolipede (Q1) | Lámina |
| Magmín → Lavtún → Teidrón | Infernal | Litwick → Lampent → Chandelure (Q1) | Lámina |
| Salmito → Salmarín → Salmástil | Por decidir | Spheal → Sealeo → Walrein (Q1) | Nombre |
| Tinzal → Azurvan | Aire · Aire/Mental | Taillow → Swellow (Q1) | Lámina |
| Aerund → Marwen | Aire · Aire/Agua | Wingull → Pelipper (Q1) | Lámina |
| Tibicán | Oscuridad | Absol (Q3) | Lámina |
| Magecora | Infernal/Mental | Reshiram (Q5, legendaria) | Lámina |
| Dragosil → Dragombo → Dragalis | Planta | Propuesta: Lotad → Lombre → Ludicolo (Q1) | Lámina |
| Briso → Alisor → Alisior | Eléctrico | Propuesta: Tynamo → Eelektrik → Eelektross (Q1) | Lámina |
| Guanchín → Menceyor → Achamán | Infernal · Infernal/Ancestral · Infernal/Ancestral | Propuesta: Bagon → Shelgon → Salamence (Q2) | Lámina |
| Sanbor → Borondis → Atlantea | Agua · Agua/Ancestral · Agua/Ancestral | Propuesta: Deino → Zweilous → Hydreigon (Q2) | Lámina |
| Patatín → Paparrón | Tierra | Propuesta: Makuhita → Hariyama (Q1) | Lámina |
| Esporín → Micelord | Planta | Propuesta: Foongus → Amoonguss (Q1) | Lámina |
| Voltéro → Raigón | Eléctrico | Propuesta: Electrike → Manectric (Q1) | Lámina |
| Miralín → Reflexán | Mental | Propuesta: Elgyem → Beheeyem (Q2) | Lámina |
| Tunelín → Taladrex | Tierra | Propuesta: Drilbur → Excadrill (Q2) ⚠ | Lámina |
| Cangrix → Costrarca | Roca | Propuesta: Dwebble → Crustle (Q2) ⚠ | Lámina |
| Basún → Toxárro | Veneno | Propuesta: Trubbish → Garbodor (Q2) ⚠ | Lámina |
| Civeta (sin nombre, 2) | Común | Propuesta: Zigzagoon → Linoone (Q1) | Lámina |
| Dino del casco de roca (sin nombre, 2) | Roca | Propuesta: Cranidos → Rampardos (Q2) ⚠ | Lámina |

En los tipos, «Infernal · Infernal/Ancestral» quiere decir: la primera forma sin secundario y las
siguientes con él. Las láminas ponen el doble tipo a toda la línea; quitárselo a las primeras
formas ayuda al 60 %.

⚠ **Demasiado parecidas a su Pokémon de referencia** en idea y dibujo, y con sus mismas
estadísticas se leerían como una copia (R8):
- el topo con taladro (Excadrill);
- el ermitaño que carga una roca (Crustle);
- la bolsa de basura (Garbodor);
- el dinosaurio de cabeza de piedra (Cranidos).

Conviene cambiarles la idea, o el dibujo, o las estadísticas de referencia. Las abejas de Melaní
recuerdan a Combee y Vespiquen, aunque sus estadísticas sean de Scolipede.

## Lista de referencia

Cada especie con sus formas en orden de evolución, con la numeración del PDF del autor (sin las
líneas 21 a 24). La última columna se rellena al diseñar la especie nuestra que se enlaza con
ella. El seguimiento del diseño lo lleva el autor en su Excel; la plantilla vacía es
`criaturas-plantilla.xlsx` y se rehace con `python3 herramientas/criaturas/excel.py`.

### De 3 formas (24 especies, 72 criaturas)

| Nº | Referencia: forma (quintil, papel) | Especie nuestra |
| --- | --- | --- |
| 1 | Wurmple (Q1, EN) → Cascoon (Q1, TF) → Dustox (Q2, TE) |  |
| 2 | Azurill (Q1, TE) → Marill (Q1, EN) → Azumarill (Q3, EN) |  |
| 3 | Pidove (Q1, AF) → Tranquill (Q2, AF) → Unfezant (Q3, AF) |  |
| 4 | Starly (Q1, AF) → Staravia (Q2, AF) → Staraptor (Q3, AF) |  |
| 5 | Venipede (Q1, TF) → Whirlipede (Q2, TF) → Scolipede (Q3, AF) |  |
| 6 | Ralts (Q1, AE) → Kirlia (Q1, AE) → Gardevoir (Q4, AE) |  |
| 7 | Lotad (Q1, TE) → Lombre (Q2, TE) → Ludicolo (Q4, TE) |  |
| 8 | Whismur (Q1, EN) → Loudred (Q2, EN) → Exploud (Q4, EN) |  |
| 9 | Trapinch (Q1, AF) → Vibrava (Q2, EN) → Flygon (Q4, EN) |  |
| 10 | Shinx (Q1, AF) → Luxio (Q2, AF) → Luxray (Q4, AF) |  |
| 11 | Lillipup (Q1, AF) → Herdier (Q2, AF) → Stoutland (Q4, AF) |  |
| 12 | Roggenrola (Q1, TF) → Boldore (Q2, TF) → Gigalith (Q4, TF) |  |
| 13 | Sandile (Q1, AF) → Krokorok (Q2, AF) → Krookodile (Q4, AF) |  |
| 14 | Gothita (Q1, TE) → Gothorita (Q2, TE) → Gothitelle (Q4, TE) |  |
| 15 | Solosis (Q1, AE) → Duosion (Q2, AE) → Reuniclus (Q4, AE) |  |
| 16 | Litwick (Q1, AE) → Lampent (Q2, AE) → Chandelure (Q4, AE) |  |
| 17 | Zubat (Q1, EN) → Golbat (Q3, EN) → Crobat (Q4, EN) |  |
| 18 | Spheal (Q1, EN) → Sealeo (Q3, EN) → Walrein (Q4, TE) |  |
| 19 | Budew (Q1, AE) → Roselia (Q3, AE) → Roserade (Q4, AE) |  |
| 20 | Tynamo (Q1, EN) → Eelektrik (Q3, EN) → Eelektross (Q4, EN) |  |
| 25 | Slakoth (Q1, AF) → Vigoroth (Q3, AF) → Slaking (Q5, AF) |  |
| 26 | Bagon (Q2, AF) → Shelgon (Q3, TF) → Salamence (Q5, AF) |  |
| 27 | Gible (Q2, AF) → Gabite (Q3, AF) → Garchomp (Q5, AF) |  |
| 28 | Deino (Q2, AF) → Zweilous (Q3, AF) → Hydreigon (Q5, AE) |  |

### De 2 formas (42 especies, 84 criaturas)

| Nº | Referencia: forma (quintil, papel) | Especie nuestra |
| --- | --- | --- |
| 29 | Kricketot (Q1, TF) → Kricketune (Q2, AF) |  |
| 30 | Poochyena (Q1, AF) → Mightyena (Q3, AF) |  |
| 31 | Zigzagoon (Q1, AF) → Linoone (Q3, AF) |  |
| 32 | Taillow (Q1, AF) → Swellow (Q3, AF) |  |
| 33 | Shroomish (Q1, TE) → Breloom (Q3, AF) |  |
| 34 | Makuhita (Q1, AF) → Hariyama (Q3, AF) |  |
| 35 | Wingull (Q1, AE) → Pelipper (Q3, TF) |  |
| 36 | Electrike (Q1, AE) → Manectric (Q3, AE) |  |
| 37 | Barboach (Q1, EN) → Whiscash (Q3, EN) |  |
| 38 | Bidoof (Q1, EN) → Bibarel (Q3, AF) |  |
| 39 | Cherubi (Q1, AE) → Cherrim (Q3, AE) |  |
| 40 | Foongus (Q1, EN) → Amoonguss (Q3, EN) |  |
| 41 | Magikarp (Q1, TF) → Gyarados (Q4, AF) |  |
| 42 | Feebas (Q1, TE) → Milotic (Q4, TE) |  |
| 43 | Riolu (Q1, AF) → Lucario (Q4, AE) |  |
| 44 | Cottonee (Q1, TF) → Whimsicott (Q4, TF) |  |
| 45 | Petilil (Q1, AE) → Lilligant (Q4, AE) |  |
| 46 | Munna (Q1, AE) → Musharna (Q4, AE) |  |
| 47 | Carvanha (Q2, AF) → Sharpedo (Q3, AF) |  |
| 48 | Numel (Q2, AE) → Camerupt (Q3, AE) |  |
| 49 | Spoink (Q2, TE) → Grumpig (Q3, TE) |  |
| 50 | Cacnea (Q2, AE) → Cacturne (Q3, AE) |  |
| 51 | Corphish (Q2, AF) → Crawdaunt (Q3, AF) |  |
| 52 | Shellos (Q2, EN) → Gastrodon (Q3, TE) |  |
| 53 | Stunky (Q2, EN) → Skuntank (Q3, EN) |  |
| 54 | Deerling (Q2, AF) → Sawsbuck (Q3, AF) |  |
| 55 | Dwebble (Q2, TF) → Crustle (Q3, TF) |  |
| 56 | Trubbish (Q2, EN) → Garbodor (Q3, TF) |  |
| 57 | Joltik (Q2, AE) → Galvantula (Q3, AE) |  |
| 58 | Snorunt (Q2, EN) → Glalie (Q4, EN) |  |
| 59 | Buizel (Q2, AF) → Floatzel (Q4, AF) |  |
| 60 | Lileep (Q2, TE) → Cradily (Q4, TE) |  |
| 61 | Anorith (Q2, AF) → Armaldo (Q4, AF) |  |
| 62 | Cranidos (Q2, AF) → Rampardos (Q4, AF) |  |
| 63 | Shieldon (Q2, TF) → Bastiodon (Q4, TF) |  |
| 64 | Zorua (Q2, AE) → Zoroark (Q4, AE) |  |
| 65 | Bronzor (Q2, TF) → Bronzong (Q4, TF) |  |
| 66 | Elgyem (Q2, AE) → Beheeyem (Q4, AE) |  |
| 67 | Psyduck (Q2, AE) → Golduck (Q4, AE) |  |
| 68 | Drilbur (Q2, AF) → Excadrill (Q4, AF) |  |
| 69 | Darumaka (Q2, AF) → Darmanitan (Q4, AF) |  |
| 70 | Ferroseed (Q2, TF) → Ferrothorn (Q4, TF) |  |

### Sin evolución (20 especies, 20 criaturas)

| Nº | Referencia: forma (quintil, papel) | Especie nuestra |
| --- | --- | --- |
| 71 | Sableye (Q2, EN) |  |
| 72 | Mawile (Q2, TF) |  |
| 73 | Spinda (Q2, EN) |  |
| 74 | Luvdisc (Q2, EN) |  |
| 75 | Skarmory (Q3, TF) |  |
| 76 | Torkoal (Q3, TF) |  |
| 77 | Zangoose (Q3, AF) |  |
| 78 | Absol (Q3, AF) |  |
| 79 | Seviper (Q3, AE) |  |
| 80 | Plusle (Q3, AE) |  |
| 81 | Minun (Q3, AE) |  |
| 82 | Lunatone (Q3, AE) |  |
| 83 | Solrock (Q3, AF) |  |
| 84 | Audino (Q3, EN) |  |
| 85 | Heracross (Q4, AF) |  |
| 86 | Pinsir (Q4, AF) |  |
| 87 | Sigilyph (Q4, AE) |  |
| 88 | Cryogonal (Q4, TE) |  |
| 89 | Spiritomb (Q4, EN) |  |
| 90 | Lapras (Q4, EN) |  |

### Legendarias (12 especies, 12 criaturas)

| Nº | Referencia: forma (quintil, papel) | Especie nuestra |
| --- | --- | --- |
| 91 | Groudon (Q5, AF) |  |
| 92 | Zekrom (Q5, AF) |  |
| 93 | Kyogre (Q5, AE) |  |
| 94 | Dialga (Q5, AE) |  |
| 95 | Reshiram (Q5, AE) |  |
| 96 | Latios (Q5, AE) |  |
| 97 | Regirock (Q5, TF) |  |
| 98 | Cobalion (Q5, TF) |  |
| 99 | Regice (Q5, TE) |  |
| 100 | Cresselia (Q5, TE) |  |
| 101 | Rayquaza (Q5, EN) |  |
| 102 | Giratina (Q5, EN) |  |
