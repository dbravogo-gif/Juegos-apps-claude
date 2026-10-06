# Pista libre — criterios de realismo y diseño

Reglas del autor que guían todas las versiones del juego a partir de la 2. Si una propuesta
choca con ellas, gana este documento.

## 1. Qué significa «realista» en Pista libre

El objetivo **no** es un simulador aeronáutico académico ni reproducir con exactitud cada
dato histórico de 50 años de aviación.

El objetivo es que alguien que sepa de aviación (aficionado serio, piloto, mecánico) **no
sienta que el juego se ha inventado las cosas sin criterio**.

La prioridad de realismo está en:

- aeronaves;
- motores;
- mantenimiento;
- averías;
- operación de los vuelos;
- características de los aeropuertos con impacto directo en la operación;
- evolución tecnológica de los aviones;
- decisiones de compra y mantenimiento.

No hace falta reconstruir cada aeropuerto del mundo año a año si ese dato no aporta a la
jugabilidad. Es preferible tener 100 datos importantes bien construidos que 5.000 datos
históricos irrelevantes. Se puede simplificar para que el juego sea divertido, pero la
simplificación tiene que ser coherente con la realidad y no contradecirla de forma
evidente.

## 2. Regla de oro con los datos

**No inventar datos técnicos importantes de aeronaves.**

Para los datos relevantes de aviones, motores, mantenimiento, prestaciones, entrada en
servicio, variantes, características operacionales e historial de fiabilidad o problemas
conocidos, hay que intentar tener **al menos dos fuentes fiables e independientes**.

Orden de prioridad de las fuentes:

1. fabricantes;
2. autoridades aeronáuticas;
3. documentación de certificación;
4. organismos oficiales;
5. publicaciones técnicas e históricas reconocidas.

Wikipedia, blogs o páginas genéricas sirven para localizar información, pero no pueden ser
la única base de un dato importante. Dos páginas que copian la misma información no son
dos fuentes independientes.

Si un dato no puede verificarse razonablemente, se usa «desconocido» o una aproximación
**marcada explícitamente como tal**. Nunca se inventa una cifra precisa para rellenar un
hueco.

## 3. La cantidad de datos debe ser razonable

El juego tiene que funcionar con una base de datos manejable y un código razonablemente
sencillo. Prioridad de los datos:

- **Muy alta**: lo que cambia directamente una decisión del jugador. Capacidad, alcance,
  velocidad, requisitos de pista, costes operativos, edad, mantenimiento, motores,
  características de seguridad, disponibilidad histórica y compatibilidad con
  determinados aeropuertos.
- **Media**: lo que mejora la autenticidad. Evolución de variantes, diferencias entre
  generaciones, características técnicas interesantes, historial de mantenimiento y
  problemas conocidos de determinados modelos.
- **Baja**: datos históricos que apenas cambian el juego. Se pueden simplificar u omitir.

## 4. Los aviones son lo que más debe resistir una revisión de expertos

Los aviones tienen que ser reconocibles y coherentes con su época. No basta con poner
«Boeing 737» y darle unas estadísticas arbitrarias. Cada familia necesita características
diferenciadas y razonables:

- número de motores;
- capacidad, alcance y velocidad;
- consumo y coste operativo;
- requisitos de pista;
- año de entrada y periodo de producción;
- evolución entre variantes;
- características de mantenimiento;
- diferencias tecnológicas;
- historial conocido.

No hace falta que cada cifra sea una réplica exacta de una ficha técnica, pero **las
relaciones entre ellas tienen que tener sentido**. Un avión más pesado, con más pasajeros y
más motores no puede acabar teniendo mágicamente mejores características de operación que
un avión posterior diseñado precisamente para superar esos problemas.

## 5. El mantenimiento no se representa con «barras de vida»

El juego puede usar valores simplificados por dentro (estado del motor, del tren, de la
estructura) porque ayudan a programarlo, pero son una **abstracción del juego**. No deben
presentarse como si un avión real funcionara con una barra de 0 a 100.

Por dentro, cuando sea relevante, conviene distinguir entre horas, ciclos, edad,
mantenimiento realizado, tiempo desde la última revisión, defectos conocidos, defectos
sospechados, historial del componente, estado estimado y estado real.

El jugador no necesita ver toda esa información siempre. **La complejidad va debajo de la
interfaz, no necesariamente delante del jugador.**

## 6. Los motores tienen entidad propia

En un bimotor tiene que existir, como mínimo, motor izquierdo y motor derecho. Cada motor
puede tener horas, ciclos, historial, mantenimiento, desgaste, defectos y estado.

Así aparecen situaciones como estas:

- «Avión barato, pero uno de los motores está cerca de una revisión cara.»
- «Este 737 tiene un motor mucho mejor mantenido que el otro.»
- «Parecía una ganga hasta que descubres el historial de uno de los motores.»

No hace falta llegar al nivel de un simulador de mantenimiento real; las decisiones tienen
que resultar creíbles.

## 7. Las revisiones y averías siguen una cadena lógica

Nada de mensajes absurdamente definitivos como «MOTOR: 43/100. Probabilidad de explosión:
2,7 %». Debe haber incertidumbre. Un problema puede pasar por varias fases:

1. **Indicio**: vibración anormal detectada.
2. **Inspección**: se sospecha desgaste en un componente del motor.
3. **Confirmación**: se confirma que el componente hay que sustituirlo.

La cadena se puede simplificar para no generar demasiada complejidad, pero tiene que
distinguir entre algo que simplemente parece raro, algo detectado y algo confirmado.

Las revisiones importantes tienen que ser **fiables**. No queremos un sistema en el que una
inspección descubre cualquier cosa al azar porque el juego ha tirado un dado.

## 8. Doble comprobación para los problemas importantes

Los problemas importantes de aviones y motores necesitan, como mínimo, una doble
comprobación antes de convertirse en información confirmada:

> inspección inicial → anomalía detectada → inspección o diagnóstico → defecto confirmado

Es especialmente importante cuando una decisión posterior depende de esa información. La
primera inspección puede equivocarse o dejar una sospecha, pero no debe descubrir por arte
de magia el diagnóstico exacto. El jugador tiene que gestionar la incertidumbre, el coste de
inspeccionar, el tiempo y la decisión de reparar o seguir operando.

## 9. Un término medio en el riesgo

No convertir cada problema en una probabilidad de accidente enorme, pero tampoco hacer que
todos los vuelos sean idénticos y seguros.

- **Normalmente**, la gran mayoría de vuelos terminan bien.
- **Cuando aparecen problemas**, lo más habitual es un retraso, una avería, mantenimiento no
  programado, un aterrizaje de emergencia, un desvío, una cancelación, perder parte de los
  ingresos, un daño menor o el avión inmovilizado.
- **Los accidentes graves** son raros pero posibles y, precisamente por raros, tienen
  consecuencias importantes.

## 10. El riesgo puede seguir usando fórmulas simplificadas

No hace falta un modelo académico de seguridad aérea. Se puede mantener una estructura
parecida a la del prototipo (meteorología, aeropuerto, estado del avión, mantenimiento,
tripulación, características del avión, fatiga, combustible…), pero **sin que los factores
sumen porcentajes arbitrariamente hasta dar riesgos absurdos**.

La fórmula preferida es intermedia:

- factores con distinto peso;
- algunos factores multiplican a otros;
- algunos problemas aumentan sobre todo la probabilidad de **incidentes**;
- solo una **combinación suficientemente mala** aumenta de forma apreciable la
  probabilidad de accidente.

Una mala decisión aumenta el riesgo, pero no convierte automáticamente el siguiente vuelo
en una ruleta rusa.

## 11. El jugador sigue teniendo un dilema real

No hay que eliminar el riesgo, porque es una de las mejores ideas del juego. Debe ser
posible pensar:

- «Sé que probablemente debería retrasar este vuelo, pero perderé muchísimo dinero.»
- «Este avión no está perfecto, pero necesito que vuele.»
- «Puedo cancelar y perder ingresos, reparar y perder dos días, o asumir un riesgo
  pequeño.»

Lo que no debe pasar es que el jugador pueda calcular siempre «riesgo = 0,43 %, por tanto
siempre hago X». Tiene que haber algo de incertidumbre.

## 12. La información del jugador puede ser imperfecta

El jugador no conoce perfectamente la situación real del avión. Puede tener información
confirmada, estimada o incompleta, y defectos sin descubrir. Eso da misterio a una compra
de segunda mano:

> **Boeing 737-200**, 21 años, buen estado según el vendedor.
>
> Después de una inspección: estructura aceptable; motor 1 en buen estado; motor 2 con
> desgaste elevado; defecto hidráulico confirmado.

## 13. La investigación de accidentes: importante, pero contenida

La investigación importa, pero no ocupa una parte enorme del juego. Usa un número limitado
de variables y genera un informe suficientemente convincente:

- **Accidente**: por ejemplo, aproximación con baja visibilidad.
- **Investigación**: causa probable, 1–3 factores contribuyentes, posible problema de
  mantenimiento, posible error operacional, decisión de la compañía.
- **Resultado**: multa si procede, indemnizaciones, parte cubierta por el seguro,
  reputación, posible cambio de determinadas reglas, avión inmovilizado si quedó
  siniestrado.

Profundidad suficiente para que el accidente tenga consecuencias y el jugador quiera leer
el resultado; ligereza suficiente para que el juego siga siendo sobre todo de gestión. Nada
de informes de 30 páginas ni árboles de investigación gigantes.

## 14. Los accidentes generan historias, no solo castigos

Un accidente tiene que hacer pensar «esto pasó porque tomé esta decisión», no «tiré un dado
y perdí un avión». Cuando sea posible, se relaciona con elementos presentes en la partida:
avión antiguo, mantenimiento aplazado, mala meteorología, decisión de despacho, tripulación,
aeropuerto complicado, defecto no detectado, combustible… No tiene por qué haber una única
causa: puede haber una causa principal y factores contribuyentes.

## 15. Aeropuertos: suficiente realismo, sin obsesión histórica

Los aeropuertos reales tienen que ser reconocibles y funcionalmente coherentes. Atención
especial a lo que afecta al juego: pista y longitud, ayudas a la aproximación, terreno,
meteorología, tamaño, capacidad aproximada, fecha de apertura cuando importe y
sustituciones históricas importantes.

No hace falta reconstruir cada aeropuerto año por año si no afecta a la experiencia. Pero si
un aeropuerto tiene una característica claramente importante para un aficionado, esa sí se
investiga. La prioridad es evitar errores evidentes que hagan pensar «los desarrolladores no
saben de aviación».

## 16. El arte evoluciona con la época

Estilo visual serio y realista: nada de pixel art tosco ni aviones infantiles. Los aviones
tienen que ser reconocibles para quien los conozca: silueta, proporciones, número y posición
de los motores, tren, alas, cola, cabina, fuselaje y elementos característicos de cada
modelo.

Y tienen que respetar la época: un avión de 1976 no lleva winglets que aún no tenía, ni una
configuración posterior, ni interiores o tecnología de otra generación. Lo mismo con los
aeropuertos: terminales, vehículos, señalización, pistas, iluminación, equipamiento,
pasarelas. El mundo visual evoluciona de 1976 a 2026.

## 17. Aeronaves ficticias

Están permitidas y pueden ser muy útiles, pero tienen que parecer posibles. Nada de «avión
soviético mágico que consume la mitad y es un 90 % más fiable». Sí modelos plausibles que
podrían haber existido: fabricantes pequeños, del bloque soviético, conversiones, modelos
poco vendidos, prototipos, regionales extraños, gangas del mercado de segunda mano. Sus
características siguen una lógica aeronáutica.

## 18. No sobrecargar el juego

Cada mecánica nueva tiene que justificar su complejidad. La pregunta es siempre: **¿genera
una decisión interesante?** Si no, se simplifica. Prioridades del juego:

1. comprar y vender aeronaves;
2. gestionar el mantenimiento;
3. crear rutas;
4. decidir si los vuelos salen;
5. gestionar el riesgo;
6. hacer crecer la compañía;
7. afrontar acontecimientos;
8. tomar decisiones difíciles.

Todo lo demás está subordinado a esto.

## 19. Regla final

- Entre un sistema técnicamente más preciso que nadie entiende y uno simplificado pero
  coherente y divertido: **el simplificado**.
- Entre uno simplificado que un aficionado detectaría al instante como absurdo y uno algo
  más complejo pero claramente más creíble: **el más creíble**.

Lo que buscamos es que el jugador piense: *«No es un simulador profesional, pero estos
desarrolladores saben de aviones.»*
