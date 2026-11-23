# Isla 4: Tenerife (propuesta, por aprobar)

2026-11-23. **No se construye nada hasta que el autor la apruebe.** Ya estaba decidido:
- el gimnasio, de Agua, en el Puerto de la Cruz, con el líder a nivel 36-38
  (`herramientas/criaturas/plan.py`);
- la Liga, al final del juego, dentro del Teide;
- la historia de la isla (`HISTORIA.md`): la puerta del Sello cerrada en Las Cañadas, la silueta
  junto a ella y el tercer amigo.

La geografía es de memoria (confianza media-alta) y está simplificada: paisajes y nombres de
lugares reales, nada de obras.

## La idea

Tenerife es la isla del Teide. Se ve desde todas partes y es a donde quiere llegar todo el mundo.
El recorrido va del norte verde (laurisilva, valles, el puerto) al sur seco, rodeando el volcán, y
termina subiendo a Las Cañadas, al pie del Teide.

## El recorrido

El barco de Agaete llega a **Santa Cruz**, al noreste, como el de verdad. Son 9 zonas en el camino y
2 opcionales.

1. **Santa Cruz** (llegada): ciudad con puerto, refugio y tienda. Tiene la segunda ciudad grande,
   así que conviene que no repita Las Palmas: rambla con árboles y edificios modernos bajos.
2. **Anaga** (opcional): montes de laurisilva con niebla y caminos estrechos. Tiene las salvajes
   más raras del norte.
3. **La Laguna:** la ciudad antigua de calles rectas y casas de colores, con universidad. Aquí
   conoces al **tercer amigo**, que estudia allí y lleva la última inicial que queda.
4. **El valle de La Orotava:** bajada entre plataneras y casas con balcones de madera. El Teide,
   al fondo.
5. **Puerto de la Cruz:** el pueblo de costa, con las piscinas naturales de agua de mar y el
   **gimnasio de Agua**.
6. **La Cueva del Viento:** tubos de lava larguísimos, oscuros y húmedos, con interior de cueva.
   Lo más hondo (una leyenda) queda para más adelante.
7. **Teno y Masca:** el barranco más profundo de la isla. Se baja a pie hasta el mar.
8. **Los Gigantes** (opcional): acantilados enormes sobre el mar, con una playa a sus pies.
9. **Las Cañadas:** la subida al pie del Teide, un desierto de lava y piedras de colores. Aquí está
   la **puerta del Sello**, sellada. El líder te explica que nadie entra desde hace años porque
   falta la pieza de El Hierro, y la silueta vuelve a aparecer junto a la puerta.
10. **Los Cristianos:** el puerto del sur, con el barco a La Gomera.

## El gimnasio de Agua: la mecánica (la elige el autor)

Tiene que ser distinta de las tres que hay:
- palanca y compuertas (Roca);
- corrientes que empujan (Aire);
- laberinto a oscuras (Eléctrico).

Las opciones:
- **A, recomendada: las mareas.** El gimnasio son piscinas naturales. La marea sube y baja cada
  pocos pasos: unas casillas se inundan y otras quedan secas. Hay que planear el camino con la
  marea, esperando en las rocas altas. Es muy de Puerto de la Cruz y no se parece a ninguna.
- **B: bajo el agua, con aire.** Se bucea entre algas. Hay pocos pasos de aire y hay que ir de una
  bolsa de aire a otra; si se acaba, vuelves a la última bolsa.
- **C: la regata.** Los aprendices te retan a cruzar la piscina en barca antes que ellos, y si
  ganas no hace falta luchar. Al final, el líder lucha.

## Niveles (propuesta)

| | Gran Canaria | Tenerife |
| --- | --- | --- |
| Salvajes | 18 a 27 | 26 a 35 |
| Entrenadores | 20 a 29 | 30 a 37 |
| Líder | 28 a 30 | 36 a 38 |

## Lo nuevo que hace falta

1. **El Teide:** un volcán enorme que se vea desde todas las zonas, como fondo de la isla.
2. **Plataneras y casas con balcones de madera:** ya hay piezas (`b` y las casas de balcones).
3. **Piscinas naturales** para el gimnasio, si es la opción A.
4. **Las Cañadas:** lava con piedras de colores y la puerta del Sello.
5. **Fondos de combate:** cuatro nuevos.
   - laurisilva (Anaga);
   - valle (La Orotava y La Laguna);
   - costa (Puerto de la Cruz, Los Gigantes y Los Cristianos);
   - Las Cañadas.

   La Cueva del Viento usa `fv-cueva`. El del gimnasio, según la mecánica.

## Por fases, publicando cada una

| Fase | Qué | Coste |
| --- | --- | --- |
| 1 | Santa Cruz y La Laguna, con el barco desde Agaete y el tercer amigo | alto |
| 2 | La Orotava y Puerto de la Cruz, con el gimnasio de Agua | alto |
| 3 | La Cueva del Viento, Teno y Masca, Las Cañadas (la puerta del Sello) y Los Cristianos | alto |
| 4 | Anaga y Los Gigantes, pulido y revisión del probador | medio |

## Lo que tiene que decidir el autor

1. Si vale el recorrido.
2. La mecánica del gimnasio de Agua: A, B, C u otra.
3. Si el tercer amigo aparece en La Laguna.
