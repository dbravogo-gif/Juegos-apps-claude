# App viación — criterios de realismo y diseño

Reglas del autor que guían todas las versiones del juego a partir de la 2. Si una propuesta
choca con ellas, gana este documento.

## 1. Qué significa «realista» en App viación

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

**Matiz del autor sobre los datos antiguos**: no hace falta revisar al detalle cada dato
antiguo. Cuanto más antiguo, menos fiable es la información disponible, sobre todo antes de
1990. Para esa época se aceptan aproximaciones razonables y coherentes, marcadas como tales;
la verificación con dos fuentes se reserva para lo que más pesa en el juego (fechas de
tecnologías y de entrada en servicio, motores, características muy conocidas de un avión o
aeropuerto).

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

---

*Las secciones 20 a 25 llegaron en un segundo bloque del autor (allí numeradas del 18 al 23).*

## 20. Evolución tecnológica y seguridad

**Principio**: no usar una única estadística abstracta de «seguridad» como mecánica
principal. La seguridad de un avión se deriva de sus tecnologías, sistemas, diseño,
mantenimiento y operación. Puede haber una valoración global visible como resumen, pero
tiene que ser **consecuencia** de los sistemas concretos que equipa el avión.

Cada tecnología importante tiene:

- fecha aproximada de aparición o disponibilidad;
- tipos de avión en los que aparece;
- si era estándar, opcional o instalable después (retrofit);
- coste de adquisición o de retrofit cuando corresponda;
- coste adicional de mantenimiento o formación si es relevante;
- categorías de riesgo que modifica;
- efectos operativos, además del efecto sobre la seguridad.

**No inventar tecnologías ni fechas.** Las importantes se verifican con al menos dos fuentes
independientes y fiables. La lista no tiene que ser enorme: pocas tecnologías relevantes y
bien modeladas.

Ejemplos:

- **Radar meteorológico**: mejora la detección y gestión de ciertos fenómenos, permite mejores
  decisiones de desvío y de ruta, reduce riesgos de tormentas y precipitación, no elimina el
  riesgo meteorológico.
- **GPWS**: reduce sobre todo el riesgo de CFIT; aparece en su periodo histórico; puede tener
  versiones posteriores.
- **TAWS/EGPWS**: evolución posterior del GPWS, con conciencia del terreno más avanzada; no
  existe antes de que sea históricamente plausible.
- **TCAS/ACAS**: reduce el riesgo de colisión en vuelo; aparece cuando corresponde; sus
  versiones tienen capacidades distintas.
- **Detección y alerta de cizalladura (windshear)**: afecta a fases de vuelo y condiciones
  concretas; no es un bonus genérico contra cualquier accidente.
- **Navegación y aproximación**: ILS y sus categorías; navegación más avanzada; después
  FMS/GPS. Mejoran ciertos tipos de operación o permiten operar en condiciones antes más
  restrictivas.
- **Mejoras de motores**: más fiabilidad, menos consumo, otras necesidades de mantenimiento,
  otras características de fallo.
- **Mejoras estructurales y de sistemas**: redundancia, protección frente a ciertos fallos,
  materiales y diseño, resistencia estructural.

Solo se representan las tecnologías que crean decisiones interesantes o son importantes para
la credibilidad.

**Seguridad como sistema de riesgos específicos.** Una tecnología no da «+10 de seguridad»;
modifica una situación concreta. Un avión con GPWS no es «un 10 % más seguro»: tiene menos
probabilidad de que una situación determinada termine en CFIT. La simulación trabaja con
categorías de riesgo (meteorología, CFIT, pérdida de separación o colisión, aproximación y
aterrizaje, fallo de motor, fallo de sistemas, fuego, problemas estructurales…). No hace falta
mostrarlas al jugador como números.

**Tecnología como capacidad operativa.** Algunas tecnologías cambian lo que la aerolínea puede
hacer: mejor navegación o aproximación para operar en ciertas condiciones o aeropuertos,
radar meteorológico para decidir distinto ante tormentas, menos restricciones operativas. La
tecnología es una herramienta de gestión, no una estadística de combate.

**Coste de la tecnología.** Puede implicar mayor precio del avión, más mantenimiento,
formación, disponibilidad limitada, infraestructura compatible, posibilidad de retrofit y
menor madurez inicial. Después puede abaratarse y hacerse habitual. Debe generar decisiones
(¿avión antiguo y barato o moderno y caro?). **La tecnología moderna no es siempre
económicamente superior**: hay un intercambio real entre coste, capacidad, riesgo y
rentabilidad.

**Retrofits.** Algunas tecnologías se pueden instalar después en aviones antiguos cuando sea
históricamente plausible; otras van integradas en el diseño y no se añaden fácilmente. No
asumir que cualquier avión puede recibir cualquier tecnología.

**Información para el jugador.** La interfaz puede mostrar algo sencillo (General: alta; CFIT:
muy protegida; meteorología: buena; colisión en vuelo: sin sistema avanzado; sistemas: alta
redundancia), pero derivado de las características reales del avión.

## 21. Costes de aeropuerto

Los aeropuertos tienen costes distintos: aterrizaje, estacionamiento, handling, uso de
terminal, pasajeros, carga, slots, servicios aeroportuarios y otros relevantes. No todos
tienen la misma estructura.

Un aeropuerto grande y prestigioso puede ser muy caro pero dar más demanda, mejores
conexiones, mejores instalaciones, más capacidad y mejores servicios. Uno secundario puede
ser barato pero con menos demanda, peores instalaciones y conexiones y limitaciones
operativas. La decisión real: ¿pago mucho por un aeropuerto importante o uso uno
secundario más barato? Los costes pueden evolucionar con el tiempo.

## 22. Compatibilidad entre avión, ruta y aeropuerto

No basta con que la autonomía matemática alcance. Poder operar una ruta depende de una
combinación de alcance, carga útil, longitud de pista, peso de despegue, características e
infraestructura del aeropuerto, navegación y aproximación, meteorología, restricciones
operativas, tamaño del avión, restricciones acústicas cuando sean relevantes y otros factores
importantes.

Tiene que haber diferencia entre **«no puede operar»** y **«puede operar, pero con
penalizaciones o restricciones»**: un avión con autonomía suficiente puede no poder despegar
de un aeropuerto con su peso máximo; otro puede operar reduciendo carga útil; otro puede
operar técnicamente pero con restricciones de ruido u horario. Decisiones interesantes sin
convertir cada vuelo en una hoja de cálculo.

## 23. Catering y servicios a bordo

Un sistema sencillo de comidas y bebidas, no un simulador de cada producto. Un coste de
servicio por pasajero y/o por vuelo que dependa del nivel de servicio, la duración, la clase,
el número de pasajeros, el aeropuerto donde se abastece, el proveedor, la situación económica
local y los contratos de suministro.

Abastecerse en un país de costes altos puede salir más caro, pero sin reglas absurdas del
tipo «país rico = catering siempre caro»: contratos, proveedores y economías de escala
modifican el resultado.

Función comercial: servicio básico, menor coste; servicio superior, más coste pero más
satisfacción y prestigio; ciertos vuelos o rutas justifican un servicio mejor. Una capa
económica sencilla.

## 24. Concorde y aviación supersónica

El Concorde entra como aeronave especial de alto prestigio: una oportunidad extraordinaria y
una apuesta empresarial. No es «avión normal + mucha velocidad».

- **Ventajas**: velocidad extraordinaria, tiempos de vuelo muy inferiores en ciertas rutas,
  enorme prestigio, atractivo para cierto pasaje, precios premium, imagen tecnológica,
  notoriedad.
- **Datos de partida del autor**: empezó a operar comercialmente en 1976, iba a
  aproximadamente Mach 2, con unas 100 plazas y una autonomía relativamente limitada para su
  categoría.
- **Desventajas**: adquisición carísima, costes operativos y consumo muy altos, capacidad
  limitada, rutas muy específicas, aeropuertos adecuados, posibles restricciones operativas y
  acústicas, mantenimiento y operación especializados, mercado reducido y dependencia total de
  la demanda premium.
- **Riesgo económico considerable**: lleno puede ser extraordinariamente rentable; con baja
  ocupación, desastroso.

**Seguridad del Concorde**: no se le asigna artificialmente más probabilidad de accidente por
ser supersónico. Hay que respetar la diferencia entre riesgo técnico real y riesgo económico u
operativo. Sus problemas técnicos específicos se representan con sus propios sistemas:
neumáticos y tren, temperaturas y régimen supersónico, mantenimiento especializado, sistemas
complejos, características del despegue, repuestos, historial de mantenimiento.

El accidente del vuelo 4590 de Air France (2000) puede existir como **evento histórico** si el
juego llega a ese periodo, pero no se usa retrospectivamente para afirmar que el avión tenía
una tasa genérica de accidentes mayor. La investigación del BEA estableció una cadena causal
específica iniciada por el daño de un neumático y sus consecuencias.

El Concorde es: muy rápido, muy prestigioso, muy caro, muy especializado, potencialmente muy
rentable y económicamente arriesgado. No «rápido y simplemente más inseguro».

## 25. Principio general

No añadir sistemas porque sean históricamente interesantes si no generan decisiones.
Añadirlos cuando el jugador pueda preguntarse «¿qué opción me conviene?»:

- ¿Avión antiguo barato o moderno más caro?
- ¿Instalo un sistema de seguridad nuevo? ¿Pago el retrofit?
- ¿Aeropuerto caro con mucha demanda o secundario?
- ¿Acepto un avión que cubre la ruta pero con limitaciones?
- ¿Catering premium?
- ¿Compro un Concorde y apuesto por el mercado premium, con su enorme coste, a cambio de
  prestigio y velocidad?

El objetivo no es simular toda la aviación real, sino que las decisiones importantes de una
aerolínea se sientan plausibles y que las simplificaciones sean coherentes con cómo funciona
la aviación.

---

*Las secciones 26 a 32 llegaron en un tercer bloque del autor (allí numeradas del 24 al 30).*

## 26. Competencia y mercado

Competencia entre aerolíneas con profundidad estratégica pero complejidad moderada: ni
simulador económico AAA ni IA empresarial gigante. El jugador analiza el mercado y decide con
información comprensible.

**Compañías competidoras**: unas **22** importantes a lo largo de toda la historia, con unas
**13–15 activas** como máximo a la vez. Pueden aparecer, crecer, reducir operaciones, entrar en
mercados, abandonar rutas, fusionarse o cambiar de estructura si es interesante, quebrar y ser
sustituidas. El jugador tiene que reconocer a las principales y notar que el mercado cambia.

**Personalidad**: pocas características estratégicas (tamaño, tipo de compañía, estrategia de
precios, nivel de servicio, tendencia a expandirse, tolerancia al riesgo, zonas fuertes,
reputación). Se comportan distinto sin necesitar una IA enorme.

Nombres aprobados (humorísticos, reconociblemente inspirados en compañías reales y parte del
universo ficticio del juego; no todos tienen que ser parodia):

| Ficticia | Inspirada en | Perfil |
| --- | --- | --- |
| Castilla | Iberia | Tradicional, gran red, buena reputación, servicio alto, protege sus mercados |
| Flyando | Vueling | Low cost, precios competitivos, busca demanda con costes razonables |
| Depie Air | Ryanair | Costes muy bajos, precios agresivos, aeropuertos y rutas baratos |
| Naftansa | Lufthansa | Grande y eficiente, buena reputación, gran presencia internacional |
| Croissair | Air France | Orientada al servicio y al segmento premium, precios superiores |
| Bread Am | Pan Am | Internacional y de largo radio, gran prestigio en sus mejores épocas |
| Burkirates | Emirates | Largo radio y premium, fuerte apuesta por crecer y conectar |
| SOS | SAS | Fuerte en el norte de Europa |

La lista definitiva de 22 se desarrollará más adelante.

**Información de una ruta**, sencilla y en cantidades aproximadas de personas y plazas (no
estrellas):

> Madrid → París · demanda ~2.400 pasajeros/día · oferta ~2.100 plazas/día · tendencia ↗
> creciendo · operan Castilla, Croissair y Flyando

**Investigar a los competidores**: precio, servicio, reputación y presencia de cada uno (alto,
medio, bajo…). Así el jugador descubre oportunidades que no salen directamente: si casi toda
la oferta es premium, quizá haya sitio para una alternativa barata. **No mostrar nunca
«oportunidad low cost: 87 %»**: la gracia está en interpretar los datos.

## 27. Entrada y salida de competidores

Los competidores reaccionan a las oportunidades pero **no son omniscientes ni perfectamente
racionales**: pueden no detectar una oportunidad, detectarla tarde, entrar en una ruta
saturada, sobreestimar la demanda, subestimar los costes, abandonar demasiado pronto,
mantener una ruta mala demasiado tiempo, copiar al jugador o reaccionar ante amenazas que no
lo eran. **Tienen que equivocarse.**

**Retraso**: si el jugador descubre una ruta muy rentable, nadie aparece al día siguiente. Hay
una cadena simplificada con variabilidad: la ruta muestra una oportunidad → la información se
hace visible → alguien puede detectarla → la estudia → decide entrar → empieza a operar. El
jugador tiene una ventana de ventaja, y el mercado parece vivo, no calculado.

## 28. Saturación y oportunidades

La oferta y la demanda son la base, pero **no con una regla binaria** (oferta < demanda =
rentable). Una ruta puede seguir siendo rentable con exceso de oferta si una compañía tiene
mejores precios, reputación, horarios, aeropuerto, costes, servicio o un avión más adecuado.

Tipos de mercado que el jugador debe poder encontrar antes de que sean obvios: **saturado**
(Madrid–Londres: demanda y oferta enormes, márgenes pequeños), **con oportunidad**
(Bilbao–Lisboa: demanda moderada, poca competencia, crecimiento alto), **de nicho**
(Pamplona–París: poca demanda, poca competencia, funciona con avión pequeño) y **emergente**
(Barcelona–Praga: demanda moderada, crecimiento fuerte, poca competencia).

## 29. Reputación y posicionamiento

Pocas características: **precio, puntualidad, seguridad, servicio y prestigio**. Influyen en
atraer pasajeros y competir. Una compañía pequeña puede ganar a una grande con precios bajos,
puntualidad, buena reputación y un servicio sencillo y fiable; otra puede ser cara y atraer
por prestigio. La compañía construye una identidad propia, no solo «más aviones que el
rival».

## 30. Acontecimientos del mundo y noticias

Noticias y acontecimientos externos que cambian de vez en cuando las condiciones del mercado.
No es un simulador político, económico o histórico: las noticias son **señales** que hacen
pensar «esto puede ser una oportunidad» o «esto va a destruir parte de este mercado».

Tipos: nuevas sedes internacionales, grandes empresas, organizaciones que se trasladan, zonas
industriales, recursos descubiertos, crecimiento económico excepcional, aumento de población,
destinos de moda, aeropuertos nuevos o ampliados, líneas ferroviarias, grandes eventos
deportivos, exposiciones, política, crisis, guerras, pandemias, catástrofes, cambios
regulatorios, seguridad, huelgas, restricciones fronterizas.

**Las noticias no son certezas**: «se planea construir» no significa que se construya. El
jugador puede adelantarse si interpreta bien la señal, o equivocarse.

**Efecto gradual**, no instantáneo: año 1 se anuncia, año 2 empieza la obra, año 3 sube algo la
actividad, año 4 abre, después la demanda crece poco a poco.

**Positivas y negativas**: guerras, pandemias, crisis, seguridad, desastres, regulación,
nuevas alternativas de transporte, cierres de empresas o pérdida de atractivo turístico
destruyen mercados. El mapa y las rutas están en evolución constante.

## 31. Escala de los acontecimientos

**Locales** (una ciudad o aeropuerto), **regionales** (varios países) y **globales**. Muchos
pequeños y pocos extraordinarios. No cientos de noticias: las suficientes para que el mundo
parezca vivo sin que el jugador deje de prestarles atención. Las importantes tienen que
destacar.

## 32. Principio de simplificación del mercado

Una simulación compacta pero suficientemente profunda. El jugador debería poder:

1. mirar una ruta;
2. conocer aproximadamente la oferta y la demanda;
3. saber quién opera;
4. investigar brevemente a esos competidores;
5. detectar huecos;
6. decidir;
7. comprobar con el tiempo si su hipótesis era correcta.

**Pocas variables, pero que interactúen entre sí y produzcan decisiones interesantes.** La
sensación buscada: «aquí hay una oportunidad», «esta ruta parece buenísima, pero se va a
llenar», «todo el mundo ignora esta ciudad; quizá yo llegue primero», «esta compañía se
equivoca entrando aquí; dejaré que se queme».

## 33. Calibración del riesgo: por partida, no por estadística real

El juego no es la vida real: el jugador hace pocos vuelos al día, así que las tasas reales de
accidentes (uno cada millones de vuelos) harían que nunca pasara nada. Se calibra por partida:

- **Quien lo hace todo bien** tiene una probabilidad de **0,3–0,7 accidentes en toda la
  partida**. Nunca llega a cero: por bien que se haga todo, el riesgo sigue ahí.
- **Quien lo hace todo mal** llega a **en torno a un 1 % de vuelos con accidente**. Con un
  0,01 % se podría hacer todo mal y no estrellarse nunca, y eso no puede pasar: hay que
  notar que, si lo haces mal, se te puede liar.
- **Entre medio, una escala**: cada mala decisión o descuido sube el riesgo, y varios a la vez
  lo disparan.
