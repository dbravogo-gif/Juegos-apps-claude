# Isla 4: Tenerife (propuesta, por aprobar)

2026-11-23. **No se construye nada hasta que el autor la apruebe.** Ya estaba decidido:
- el gimnasio, de Agua, en el Puerto de la Cruz, con el líder a nivel 36-38
  (`herramientas/criaturas/plan.py`);
- la Liga, al final del juego, dentro del Teide;
- la historia de la isla (`HISTORIA.md`): la puerta del Sello cerrada en Las Cañadas y la silueta
  junto a ella. Sin tercer amigo: como mucho 2 en todo el juego (autor, 2026-11-26).

La geografía es de memoria (confianza media-alta) y está simplificada: paisajes y nombres de
lugares reales, nada de obras.

## La idea

Tenerife es la isla del Teide. Se ve desde todas partes y es a donde quiere llegar todo el mundo.
El recorrido empieza por el norte de Santa Cruz (La Laguna y la laurisilva), baja al sur en la
guagua 111 y rodea el volcán por el oeste y el norte hasta subir a Las Cañadas.

## El recorrido (rehecho con el autor, 2026-11-26)

El barco de Agaete llega a **Santa Cruz**, al noreste, como el de verdad.

**Norte, ida y vuelta desde Santa Cruz:**
1. **Santa Cruz** (llegada): ciudad con puerto, refugio y tienda. Rambla con árboles y edificios
   modernos bajos, para no repetir Las Palmas.
2. **La Laguna:** la ciudad antigua de calles rectas y casas de colores, con universidad. Refugio
   y tienda.
3. **Anaga:** montes de laurisilva con niebla y caminos estrechos, con las salvajes más raras del
   norte. Ya no es opcional: está en el camino. Desde aquí se vuelve a Santa Cruz.

**Sur, en la guagua 111.** Se coge en Santa Cruz y baja por la autopista parando en cada zona. Al
terminar una, la siguiente guagua te deja en la próxima parada:

4. **Radazul:** el puerto deportivo, con **zona de buceo**: unas casillas de agua donde se bucea y
   salen salvajes de Agua que no hay en otro sitio.
5. **Abades:** el sanatorio abandonado y su iglesia, entre cardones, junto a la playa.
   - Se construyó para enfermos de lepra y nunca llegó a usarse (de memoria, confianza
     media-alta). Alrededor hay leyendas, así que es la zona de misterio de la isla: criaturas
     Espectrales y entrenadores con capirote.
   - Se trata con respeto: leyenda y misterio, nada que se burle de la enfermedad ni de quien la
     sufrió.
6. **Buzanada:** el pueblo del interior de Arona, pequeño y de paso. Refugio.

**El resto, rodeando el Teide:**

7. **Los Cristianos:** el puerto del sur, con refugio y tienda. El barco a La Gomera está, pero
   no sale hasta terminar la isla.
8. **Los Gigantes** (opcional): acantilados enormes sobre el mar, con una playa a sus pies.
9. **Teno y Masca:** el barranco más profundo de la isla, a pie hasta el mar.
10. **La Cueva del Viento:** tubos de lava larguísimos, oscuros y húmedos. Lo más hondo, una
    leyenda, queda para más adelante.
11. **Puerto de la Cruz:** el pueblo de costa, con las piscinas naturales y el **gimnasio de
    Agua**. Refugio y tienda antes del gimnasio.
12. **El valle de La Orotava:** plataneras y casas con balcones de madera, con el Teide al fondo.
13. **Las Cañadas:** la subida al pie del Teide, un desierto de lava y piedras de colores, con
    refugio cerca.
    - Allí está la **puerta del Sello**, sellada. El líder te explica que nadie entra desde hace
      años porque falta la pieza de El Hierro.
    - La silueta vuelve a aparecer junto a la puerta.
    - Al terminar, se baja a Los Cristianos y sale el barco a La Gomera.

**Refugios:** en todas las ciudades (autor), y además antes del gimnasio y de las zonas largas,
como pide la revisión.

## El gimnasio de Agua: la regata (autor, 2026-11-26)

Es distinto de los tres que hay: palanca y compuertas (Roca), corrientes que empujan (Aire) y
laberinto a oscuras (Eléctrico).

- El gimnasio son piscinas naturales. Cada tramo se cruza en una regata de barquillos contra un
  aprendiz.
- **No ahorra combates** (autor): si ganas la regata, llegas a su roca y lucháis; si la pierdes,
  vuelves al principio del tramo.
- Al final, el líder.
- El manejo de la regata (viento, ritmo o rumbo) se propone al construir la fase del gimnasio.

## Niveles (propuesta)

| | Gran Canaria | Tenerife |
| --- | --- | --- |
| Salvajes | 18 a 27 | 26 a 35 |
| Entrenadores | 20 a 29 | 30 a 37 |
| Líder | 28 a 30 | 36 a 38 |

## Lo nuevo que hace falta

1. **El Teide:** un volcán enorme que se vea desde todas las zonas, como fondo de la isla.
2. **Plataneras y casas con balcones de madera:** ya hay piezas (`b` y las casas de balcones).
3. **Piscinas naturales** para el gimnasio y la regata.
4. **La guagua 111:** la parada, la guagua y el viaje de una parada a la siguiente.
5. **Buceo en Radazul:** casillas de agua donde se bucea, con sus salvajes.
6. **Abades:** el sanatorio y su iglesia, y entrenadores con capirote.
7. **Las Cañadas:** lava con piedras de colores y la puerta del Sello.
8. **Fondos de combate:** cuatro nuevos, más quizá uno de Abades.
   - laurisilva (Anaga);
   - valle (La Orotava y La Laguna);
   - costa (Puerto de la Cruz, Los Gigantes y Los Cristianos);
   - Las Cañadas.

   La Cueva del Viento usa `fv-cueva`. El del gimnasio, según la mecánica.

## Por fases, publicando cada una

| Fase | Qué | Coste |
| --- | --- | --- |
| 1 | Santa Cruz, La Laguna y Anaga, con el barco desde Agaete | alto |
| 2 | La guagua 111: Radazul (con buceo), Abades y Buzanada | alto |
| 3 | Los Cristianos, Los Gigantes, Teno y Masca, y la Cueva del Viento | alto |
| 4 | Puerto de la Cruz con el gimnasio de Agua, La Orotava y Las Cañadas | alto |
| 5 | Pulido y revisión del probador | medio |

## Lo que tiene que decidir el autor

1. Si vale este recorrido. Hasta entonces no se construye nada.
