# Imperio — documento de diseño (borrador)

Nombre provisional. Juego de gestión de negocios para móvil inspirado en *Big Ambitions*:
empiezas con poco dinero en una ciudad y acabas al frente de una cadena de negocios.
Menos realista, más corto y pensado para jugarlo a ratos.

Estado: **propuesta**. Las decisiones marcadas como *pendiente* hay que cerrarlas antes de
programar.

## Qué tomamos de Big Ambitions y qué dejamos

| Tomamos | Dejamos (o simplificamos) |
| --- | --- |
| La ubicación importa: tráfico, alquiler y tipo de cliente | Mundo 3D, caminar y conducir |
| Cadena compra → stock → venta | Necesidades personales (hambre, energía, piso) |
| Precios, personal con sueldo y horario de apertura | Decoración mueble a mueble → un único «nivel de acabado» |
| Crecer de un local a una cadena | Importación, aduanas y flota de vehículos |
| Delegar en encargados para no ahogarse en microgestión | Oficinas y contratos B2B (quizá más adelante) |
| Préstamos y competencia en el barrio | |

Lo que hace bueno a Big Ambitions es **subir desde la nada** y **elegir bien dónde y qué
abrir**. Todo lo demás está al servicio de eso.

## Pantallas (móvil en vertical)

1. **Mapa**: la ciudad, dividida en barrios, con los locales en alquiler. Al tocar un local
   se ve su ficha: tráfico por franja horaria, alquiler, perfil de cliente y competidores
   cercanos.
2. **Negocio**: tipo, productos y precios, stock, personal, horario, acabado y resultados.
3. **Cierre del día**: ingresos, gastos, clientes perdidos y por qué, eventos.
4. **Finanzas**: caja, préstamos y patrimonio neto.

## Bucle principal

```
Día:  abrir → simulación hora a hora (8:00–22:00) → cierre con informe → decisiones → día siguiente
```

- La simulación se ve en el mapa a cámara rápida: puntos que entran en los locales y colas
  que crecen. Tiene pausa y velocidades x1, x2 y x4. A x1, un día dura unos 30 s.
- Las decisiones se toman con el juego en pausa o entre días. Nada exige reflejos.

## Modelo de demanda (el núcleo)

Para cada barrio y cada hora:

```
clientes potenciales = tráfico(barrio, hora) × encaje(tipo de negocio, perfil del barrio)
```

Esos clientes se reparten entre los negocios del mismo tipo de la zona según su
**atractivo**:

```
atractivo = f(precio relativo, variedad de stock, acabado, reputación, marketing)
```

Después, cada cliente que entra:

- **compra** si hay stock y el precio le encaja:
  `p(compra) = clamp(1 − elasticidad × (precio / precio_ref − 1), 0, 1)`;
- **espera** en la cola si el personal está ocupado, y **se va** si se le acaba la paciencia,
  lo que baja la reputación.

```
ventas = min(demanda, stock, capacidad de atención)
```

Así cada palanca tiene un efecto que se puede leer en el informe del día: «perdiste 40
clientes por falta de stock y 25 por esperar demasiado».

## Economía

- **Gastos**: alquiler diario, sueldos por hora, mercancía, marketing e intereses.
- **Ingresos**: ventas.
- **Patrimonio neto** = caja + valor del stock + valor de los negocios (un múltiplo del
  beneficio medio reciente) − deuda.
- **Préstamos**: un límite según el patrimonio y un interés diario. Sirven para dar el salto
  al segundo local.

## Negocios del MVP

| Tipo | Perfil |
| --- | --- |
| Cafetería | Barata de montar, margen bajo y mucho volumen. Vive del tráfico |
| Tienda de ropa | Stock caro y margen alto. Funciona en barrios con poder adquisitivo |

Más adelante: floristería, tienda de electrónica, supermercado y, como mecánica distinta,
una agencia que no depende del tráfico sino de contratos y de empleados cualificados.

## Suministro

- **MVP**: compras al mayorista y la mercancía llega al día siguiente. Cada local tiene una
  capacidad de almacén limitada.
- **Después**: un almacén propio con reposición automática a los locales.

## Personal

Contratas dependientes, cada uno con sueldo, capacidad de atención por hora y habilidad.
Turnos simplificados: fijas el horario del local y cuántos empleados hay a la vez, y el
juego avisa si faltan horas por cubrir.

## Delegar (la parte incremental)

El juego avanza de hacerlo todo a mano a dirigir:

1. **Tú solo**: repones, fijas precios y contratas a mano.
2. **Encargado de compras**: repone solo cuando el stock baja de un umbral. Cobra sueldo.
3. **Gerente de local**: ajusta el personal y el horario a la demanda.
4. **Director de zona**: aplica la misma política a todos los locales de un barrio.

Cada nivel cuesta dinero y quita microgestión. Lo que crece no son números abstractos, sino
el tamaño del negocio que puedes llevar a la vez.

## Competencia y eventos

- **Competidores** controlados por el juego, con precios propios. Si un barrio es muy
  rentable, acaba abriendo alguno nuevo.
- **Eventos ligeros**: subida del alquiler, obras en la calle (menos tráfico), temporada alta
  (verano, Navidad) e inspección.

## Estructura de partida — *pendiente*

| Opción | Pros | Contras |
| --- | --- | --- |
| **Temporadas cerradas** (p. ej. 60 días, gana el mayor patrimonio) | Se puede comparar con los colegas y cada partida tiene un final | Menos sensación de imperio infinito |
| **Sandbox sin fin** (como Big Ambitions) | Más fiel al referente | No hay un final ni una forma de compararse |

**Recomendación**: temporadas de 60 días (una hora larga en total, repartida en varias
sesiones con guardado) y un **reto semanal** con la misma semilla para todos. El modo libre
puede venir después, porque usa el mismo motor.

Ojo: si hay desbloqueos entre partidas, el reto semanal tiene que usar un reglamento fijo
igual para todos. Si no, gana quien más ha jugado.

## Técnica

- Web instalable (PWA) sin paso de build, igual que `game/`.
- `src/core` puro y testeable con `node --test`.
- **Simulación determinista con generador aleatorio con semilla**, imprescindible para el
  reto compartido.
- Mapa en Canvas (animación de clientes) y fichas y menús en HTML.
- Guardado en `localStorage` con exportación a fichero, el mismo patrón que `game/`.
- Publicación: el flujo actual sube solo `game/` a GitHub Pages. Para publicar los dos juegos
  hay que cambiarlo a un sitio con `/game/` y `/imperio/` (*pendiente*).

## Prototipo 1 — qué tiene que demostrar

Pregunta que responde: **¿es divertido elegir sitio y ajustar precio, stock y personal?**

- Una ciudad con 3 barrios y unos 12 locales.
- Los 2 tipos de negocio del MVP.
- Compras manuales al mayorista, precios, personal y horario.
- Informe diario con las causas de los clientes perdidos.
- Competidores estáticos y un préstamo.
- Sin arte: formas y emojis.

Fuera del prototipo: delegación, eventos, almacén, reto semanal y desbloqueos.
