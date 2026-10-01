/* Chispa — contenido
   Formato de texto (campo body/model/exp):
     línea en blanco = párrafo nuevo
     "- "  viñeta          "1. " lista numerada
     "> "  frase para decir (cita)
     "T: " / "C: "  diálogo (Tú / Cliente)
     **negrita**  *cursiva*
   Tipos de tarjeta: read, quiz, open, scenario, order, num, flash.
   Dentro de cada área, las tarjetas salen en el orden de este archivo. */

window.CHISPA = {
areas: [
  {id:"ventas",   title:"Ventas"},
  {id:"ciencia",  title:"Ciencia"},
  {id:"mente",    title:"Psicología"},
  {id:"economia", title:"Economía"},
  {id:"historia", title:"Historia"}
],
modules: [
  {id:"v1",  area:"ventas", n:1,  title:"Vender valor",              desc:"Qué vende de verdad Bitmakers y por qué el precio no es lo importante."},
  {id:"v2",  area:"ventas", n:2,  title:"Preguntar con método",      desc:"SPIN: situación, problema, implicación y necesidad."},
  {id:"v3",  area:"ventas", n:3,  title:"Escuchar sin suponer",      desc:"Que hable el cliente. Cada suposición es una pregunta que no hiciste."},
  {id:"v4",  area:"ventas", n:4,  title:"Descuentos y concesiones",  desc:"Nada gratis, nunca el máximo y siempre a cambio de algo."},
  {id:"v5",  area:"ventas", n:5,  title:"Competencia y diferencial", desc:"Qué mira, qué le gusta, qué le falta y a qué precio."},
  {id:"v6",  area:"ventas", n:6,  title:"Coste total y retorno",     desc:"El cálculo que convierte un equipo caro en el más barato."},
  {id:"v7",  area:"ventas", n:7,  title:"Objeciones",                desc:"Escuchar, reconocer, explorar y solo entonces responder."},
  {id:"v8",  area:"ventas", n:8,  title:"Cierre y seguimiento",      desc:"Cada visita termina con un avance. Seguimiento siempre."},
  {id:"v9",  area:"ventas", n:9,  title:"Role-play y entrevista",    desc:"El patinete, bien hecho, y cómo contar lo que has aprendido."},
  {id:"v10", area:"ventas", n:10, title:"Producto y planta",         desc:"Qué problema resuelve cada familia de equipos y el vocabulario de fábrica."},
  {id:"cien",  area:"ciencia",  title:"Cómo sabemos lo que sabemos", desc:"Método científico y la física de lo cotidiano."},
  {id:"mente", area:"mente",    title:"Cómo pensamos y decidimos",   desc:"Sesgos, memoria y atención."},
  {id:"eco",   area:"economia", title:"Las ideas clave de la economía", desc:"Coste de oportunidad, comercio, precios e incentivos."},
  {id:"hist",  area:"historia", title:"Momentos que cambiaron cosas", desc:"Inventos, epidemias y personas que se adelantaron."}
],

cards: [

/* ========== V1 · VENDER VALOR ========== */
{id:"v1-01", m:"v1", t:"read", title:"Qué vende de verdad Bitmakers",
 body:`Bitmakers (Barcelona, 1984) es el distribuidor oficial y exclusivo de **Keyence** en España: sensores, medición láser, visión artificial, marcadores láser, microscopios digitales…

Pero el cliente no compra un sensor. Compra:
- Que la línea **no se pare**.
- Que no lleguen **piezas defectuosas** a su cliente.
- **Medir más rápido** y con menos personal.
- **Tranquilidad**: que el equipo no falle.

El producto es el medio. Lo que vendes es el resultado.`,
 key:"No vendes un equipo: vendes fiabilidad, tiempo y menos problemas."},

{id:"v1-02", m:"v1", t:"read", title:"El modelo Keyence en 5 ideas",
 body:`Keyence (Japón, 1974) es famosa por tener unos márgenes altísimos para una empresa industrial. Lo que te contaron de Bitmakers encaja con su forma de vender:

1. **Venta consultiva.** El comercial es un asesor que resuelve problemas, no un catálogo andante.
2. **La necesidad detrás de la necesidad.** El cliente pide un sensor; el comercial descubre que el problema real es el rechazo de piezas.
3. **Demostración.** Probar el equipo con la pieza real del cliente.
4. **Precio por valor.** El precio se justifica por lo que el cliente ahorra o gana.
5. **Disciplina.** Cada visita se prepara con un objetivo y tiene seguimiento.`,
 key:"Diagnóstico primero, solución después y precio justificado por valor."},

{id:"v1-03", m:"v1", t:"read", title:"El médico y el vendedor de feria",
 body:`Imagina un médico que te receta un antibiótico nada más entrar, sin preguntarte qué te pasa. Aunque acierte, no te fías de él.

El **vendedor de feria** grita las virtudes del producto a todo el que pasa.
El **médico** pregunta, explora, encuentra la causa, propone un tratamiento y hace seguimiento.

Bitmakers quiere médicos. Presentar el producto antes de entender el problema es recetar sin diagnosticar.`,
 key:"Recetar sin diagnosticar es una negligencia, también en ventas."},

{id:"v1-04", m:"v1", t:"quiz",
 q:"Un cliente llama porque quiere «un sensor láser para medir la altura de una pieza». En venta consultiva, ¿qué haces primero?",
 opts:["Le recomiendas el modelo más preciso del catálogo.",
       "Le preguntas qué pasa hoy con esa medición y por qué la necesita ahora.",
       "Le mandas el catálogo de sensores láser con precios.",
       "Le ofreces una demo inmediatamente."],
 a:1,
 exp:`Antes de proponer necesitas el porqué: ¿hay piezas defectuosas?, ¿se mide a mano?, ¿un cliente se ha quejado? Ahí está la necesidad real, y quizá otras oportunidades. La demo llega después, cuando sabes qué demostrar.`},

{id:"v1-05", m:"v1", t:"read", title:"Precio frente a coste",
 body:`**Precio** es lo que pagas el día de la compra.
**Coste** es lo que el equipo te cuesta durante toda su vida: paradas, averías, recambios, piezas mal fabricadas, horas de técnico.

Un equipo más caro puede salir más barato. Es la idea central del discurso de Bitmakers: calidad, fiabilidad, menos paradas, más duración.

Pero esa conclusión **la tiene que ver el cliente con sus propios números**. Por eso se pregunta tanto.`,
 key:"El precio se paga una vez; el coste se paga cada día."},

{id:"v1-06", m:"v1", t:"quiz",
 q:"Verdadero o falso: en venta de valor, el objetivo es convencer al cliente de que tu equipo es el mejor del mercado.",
 opts:["Verdadero","Falso"], a:1,
 exp:`El objetivo es demostrar que es **el que mejor resuelve su problema** y con mejor coste total. Un equipo «mejor» en algo que al cliente no le importa no vale nada para él.`},

{id:"v1-07", m:"v1", t:"read", title:"Por qué preguntan tanto",
 body:`Bitmakers pregunta mucho por dos motivos:

1. **Confianza.** Un cliente que se siente escuchado confía. Y en equipos de miles de euros se compra a quien se confía.
2. **Oportunidades.** Te llaman por una cosa, pero en la planta hay diez procesos más. Si solo hablas del motivo de la llamada, te pierdes el resto: otra línea que mide a mano, un laboratorio que necesita un microscopio, una máquina que marca con tinta…`,
 key:"Pregunta por lo que te llaman y también por todo lo demás."},

{id:"v1-08", m:"v1", t:"open",
 q:"Como si te lo preguntaran en la entrevista: ¿por qué un cliente debería pagar más por un equipo de Bitmakers? Responde en 2 o 3 frases.",
 model:`«Porque lo que importa no es el precio de compra, sino lo que el equipo le cuesta durante su vida. Un equipo fiable evita paradas de producción, piezas defectuosas y sustituciones frecuentes. Si una hora de línea parada le cuesta, por ejemplo, 2.000 €, con evitar un par de paradas al año la diferencia ya está pagada. Y eso lo calculamos juntos, con sus datos.»`,
 check:["Distingues precio de coste","Nombras al menos un ahorro concreto (paradas, rechazo, duración)","Lo conectas con los números del cliente","No dices «es el mejor» sin explicar para qué"]},

/* ========== V2 · PREGUNTAR CON MÉTODO ========== */
{id:"v2-01", m:"v2", t:"read", title:"SPIN: el método con más estudio detrás",
 body:`Neil Rackham y su equipo analizaron más de **35.000 visitas comerciales** durante 12 años. Conclusión: en ventas grandes y técnicas, los mejores comerciales no son los que mejor presentan, sino los que **mejor preguntan**.

Y siguen una secuencia de cuatro tipos de pregunta:
- **S**ituación
- **P**roblema
- **I**mplicación
- **N**ecesidad de solución

Lo publicó en *SPIN Selling* (1988). Encaja como un guante con la forma de trabajar de Bitmakers.`,
 key:"Los mejores comerciales destacan por cómo preguntan, no por cómo presentan."},

{id:"v2-02", m:"v2", t:"read", title:"S · Preguntas de situación",
 body:`Hechos y contexto: cómo trabajan hoy.

> ¿Cómo controláis hoy la altura de esa pieza?
> ¿Cuántas piezas por hora salen de esa línea?
> ¿Quién hace la medición y cada cuánto?

Son necesarias, pero **aburren** si abusas. Rackham vio que los novatos hacen demasiadas. Trae los deberes hechos (web, sector, noticias) y pregunta solo lo que no puedes saber antes.`,
 key:"Pocas y bien elegidas. Lo que puedas averiguar antes, averígualo."},

{id:"v2-03", m:"v2", t:"read", title:"P · Preguntas de problema",
 body:`Buscan dificultades, insatisfacciones y fallos.

> ¿Qué es lo que más os complica de ese control?
> ¿Se os ha escapado alguna pieza defectuosa?
> ¿Qué tal funciona el equipo que tenéis ahora?

Aquí aparecen las **necesidades implícitas**: el cliente reconoce un problema, pero todavía no lo ve urgente.`,
 key:"Una necesidad implícita es un problema que el cliente admite pero que aún no le duele lo bastante."},

{id:"v2-04", m:"v2", t:"read", title:"I · Preguntas de implicación",
 body:`La pregunta que separa a los buenos. Explora **las consecuencias** del problema y hace que algo pequeño se vea grande (y real).

> Cuando se escapa una pieza defectuosa, ¿qué pasa con vuestro cliente?
> ¿Cuánto tiempo está la línea parada cuando falla el sensor?
> ¿Cuánto os cuesta cada hora de parada?
> ¿Eso afecta a los plazos de entrega?

Sin implicaciones, tu precio parece caro. Con ellas, lo que parece caro es el problema.`,
 key:"Las implicaciones convierten un problema pequeño en uno que merece la pena resolver."},

{id:"v2-05", m:"v2", t:"read", title:"N · Preguntas de necesidad",
 body:`Hacen que **el cliente diga en voz alta** el valor de resolverlo.

> Si pudierais medir el 100% de las piezas en línea, ¿qué os supondría?
> ¿Qué ganaríais si el cambio de formato llevara 5 minutos en vez de 30?
> ¿Cómo os ayudaría eso en la auditoría de vuestro cliente?

La clave: el beneficio no lo argumentas tú. **Lo argumenta él.** Y nadie discute sus propias conclusiones.`,
 key:"Que el beneficio lo diga el cliente, no tú."},

{id:"v2-06", m:"v2", t:"order",
 q:"Ordena estas preguntas como en una buena conversación SPIN.",
 items:["¿Cómo medís ahora el grosor de la lámina?",
        "¿Qué problemas os da ese método?",
        "Cuando una lámina sale fuera de tolerancia, ¿qué os cuesta?",
        "Si lo detectarais al instante, ¿qué cambiaría para vosotros?"],
 exp:`Situación → Problema → Implicación → Necesidad. En la práctica no es rígido y puedes volver atrás, pero no saltes a presentar el producto sin pasar por la I y la N.`},

{id:"v2-07", m:"v2", t:"quiz",
 q:"«Cuando falla el sensor, ¿cuántas horas está la línea parada?» ¿Qué tipo de pregunta es?",
 opts:["Situación","Problema","Implicación","Necesidad"], a:2,
 exp:`Explora la **consecuencia** de un problema ya identificado (el sensor falla). Eso la convierte en implicación.`},

{id:"v2-08", m:"v2", t:"quiz",
 q:"«Si el control fuera automático, ¿a qué podría dedicarse la persona que hoy mide a mano?» ¿Qué tipo de pregunta es?",
 opts:["Situación","Problema","Implicación","Necesidad"], a:3,
 exp:`Invita al cliente a imaginar y decir el **beneficio** de la solución: liberar a una persona para tareas de más valor.`},

{id:"v2-09", m:"v2", t:"read", title:"Abiertas, cerradas y el embudo",
 body:`**Cerrada**: se responde con sí, no o un dato. «¿Tenéis problemas con el sensor?» → «No».
**Abierta**: obliga a explicar. «¿Cómo os está funcionando el sensor?» → te cuenta cosas.

El **embudo**: empieza abierto (qué, cómo, cuéntame), concreta (cuántas, cada cuánto) y **confirma** con una cerrada: «Entonces lo que más os preocupa es el rechazo, ¿verdad?».

Ojo con el «¿por qué?»: puede sonar a reproche. Mejor: «¿Qué os llevó a…?», «¿Qué hace que…?».`,
 key:"Abre con qué y cómo, concreta con cuánto y termina confirmando."},

{id:"v2-10", m:"v2", t:"quiz",
 q:"¿Cuál es la mejor pregunta para abrir la conversación?",
 opts:["¿Tenéis algún problema con la medición?",
       "¿Os interesaría un sistema de medición más rápido?",
       "Cuéntame cómo es hoy el proceso, desde que sale la pieza hasta que se valida.",
       "¿Cuánto os gastáis en medición al año?"], a:2,
 exp:`Es abierta y te da el mapa completo. La A se responde con un «no» y la conversación muere. La B suena a anuncio. La D es demasiado directa para empezar y quizá el cliente no lo sabe.`},

{id:"v2-11", m:"v2", t:"open",
 q:"Convierte en abiertas estas preguntas cerradas: 1) «¿Estáis contentos con vuestro proveedor?» 2) «¿Tenéis paradas?» 3) «¿Os interesa ahorrar tiempo?»",
 model:`1) «¿Qué es lo que más valoráis de vuestro proveedor actual? ¿Y qué mejoraríais?»
2) «¿Cómo os afectan las paradas no planificadas? ¿Cada cuánto pasan?»
3) «¿En qué parte del proceso se os va más tiempo hoy?»`,
 check:["Empiezan por qué, cómo, cuál, en qué o cuéntame","No se pueden responder con sí o no","La tercera no suena a anuncio (nadie dice que no a ahorrar)"]},

{id:"v2-12", m:"v2", t:"flash",
 front:"La necesidad detrás de la necesidad: ¿qué es y cómo se busca?",
 back:`Lo que el cliente pide (un sensor) suele ser la solución que él se imagina. La necesidad real está detrás: rechazo de piezas, una reclamación, una auditoría.

Se busca preguntando por el motivo y las consecuencias:
> ¿Qué os ha hecho buscar esto ahora?
> ¿Qué pasa si no se resuelve?`},

/* ========== V3 · ESCUCHAR SIN SUPONER ========== */
{id:"v3-01", m:"v3", t:"read", title:"Tu error del patinete",
 body:`En la prueba diste por hecho que la carretera tenía baches. Parece un detalle, pero es el error más caro en ventas: **suponer**.

Si supones:
- Vendes la característica equivocada (suspensión, cuando quizá quería poco peso para subirlo al tren).
- El cliente siente que no le escuchas.
- Te pierdes la necesidad real.

La alternativa siempre es una pregunta:
> ¿Por dónde lo vas a usar? ¿Cómo es el trayecto?`,
 key:"Cada suposición es una pregunta que no hiciste."},

{id:"v3-02", m:"v3", t:"read", title:"Que hable el cliente",
 body:`Regla práctica: el cliente debería hablar más que tú. Bastante más. Mientras hablas tú, no aprendes nada nuevo.

Señales de que estás hablando demasiado:
- Llevas un buen rato sin hacer ninguna pregunta.
- Contestas cosas que no te ha preguntado.
- Encadenas características: «y además… y también…».

Cuando notes que te enrollas: para y pregunta.`,
 key:"Si hablas tú, no aprendes nada."},

{id:"v3-03", m:"v3", t:"read", title:"Escucha activa: 4 herramientas",
 body:`1. **Parafrasear**: «Si te entiendo bien, el problema no es medir, sino que se tarda demasiado».
2. **Profundizar**: «¿Qué quieres decir con "da problemas"?».
3. **«¿Y qué más?»**: lo primero que dice el cliente casi nunca es lo más importante. Pregúntalo dos o tres veces.
4. **Silencio**: después de preguntar, calla. Cuenta hasta tres. El silencio incomoda y el cliente sigue hablando… y ahí sale lo bueno.`,
 key:"Parafrasea, profundiza, pregunta «¿y qué más?» y aguanta el silencio."},

{id:"v3-04", m:"v3", t:"read", title:"Palabras vagas = alarma",
 body:`Cuando el cliente dice «es caro», «da problemas», «es lento» o «no nos convence», todavía no sabes nada. Cada persona entiende una cosa distinta.

- «Es caro» → «¿Caro comparado con qué?»
- «Da problemas» → «¿Qué tipo de problemas? ¿Me pones un ejemplo reciente?»
- «Es lento» → «¿Cuánto tarda ahora? ¿Cuánto debería tardar?»

Pide **ejemplos y números**. Lo concreto se puede resolver; lo vago, no.`,
 key:"Convierte cada palabra vaga en un ejemplo o en un número."},

{id:"v3-05", m:"v3", t:"quiz",
 q:"El cliente dice: «El sistema que tenemos falla bastante». ¿Qué respondes?",
 opts:["«Normal. Con nuestros equipos eso no pasa.»",
       "«¿Cuándo fue la última vez que falló? ¿Qué pasó?»",
       "«Entonces os conviene cambiarlo cuanto antes.»",
       "«Ya me imagino, esos equipos son de gama baja.»"], a:1,
 exp:`Pides un ejemplo concreto: te dará frecuencia, consecuencias y coste. La A y la C saltan a vender sin saber nada. La D critica a la competencia y, de rebote, la decisión del cliente que la compró.`},

{id:"v3-06", m:"v3", t:"scenario", title:"Suposición en directo",
 ctx:"Trabajas en una tienda de bicicletas eléctricas. Entra una clienta.",
 steps:[
  {c:"Hola, estoy mirando bicis eléctricas.",
   o:[{t:"¡Genial! Esta es la más vendida: motor de 250 W, batería de 500 Wh y 100 km de autonomía.",p:0,f:"Ristra de características sin saber nada de ella. ¿Y si solo hace 4 km al día?"},
      {t:"Perfecto. ¿Para qué la usarías principalmente?",p:2,f:"Abierta y centrada en su uso. Bien."},
      {t:"¿Buscas algo barato o de calidad?",p:1,f:"Falsa elección: nadie dice «barata y mala». Además, metes el precio demasiado pronto."}]},
  {c:"Para ir al trabajo. Son unos 12 km.",
   o:[{t:"Entonces necesitas mucha autonomía y buena suspensión por los baches.",p:0,f:"¡El patinete otra vez! Has supuesto los baches. Pregunta cómo es el trayecto."},
      {t:"¿Cómo es el trayecto? ¿Hay cuestas, es ciudad, carril bici…?",p:2,f:"Exacto: preguntas en vez de suponer."},
      {t:"Perfecto, cualquiera de estas te vale.",p:0,f:"Pierdes la ocasión de entender qué valora."}]},
  {c:"Hay una cuesta fuerte al final, y la tengo que subir a un tercer piso sin ascensor.",
   o:[{t:"Entonces te interesa una con buen motor para la cuesta y que pese poco. ¿Qué peso te parecería manejable para subirla?",p:2,f:"Conectas con las dos necesidades que ha dicho (cuesta y escaleras) y sigues preguntando."},
      {t:"Esta tiene la batería más grande del mercado.",p:0,f:"Una batería grande pesa más. Le vendes justo lo contrario de lo que necesita."},
      {t:"¿Y qué presupuesto tienes?",p:1,f:"Es legítimo, pero te acaba de dar dos necesidades clave: explóralas primero."}]}
 ],
 sum:`Con dos preguntas has descubierto que el peso importa más que la autonomía. Si hubieras supuesto «12 km = batería grande», le habrías vendido una bici pesada que odiaría cada día al subir las escaleras.`},

{id:"v3-07", m:"v3", t:"open",
 q:"El cliente dice: «Necesito algo que no dé problemas». Escribe 3 preguntas para entender qué quiere decir.",
 model:`> ¿Qué problemas os ha dado lo que tenéis ahora?
> ¿Me cuentas la última vez que algo falló? ¿Qué pasó después?
> Para vosotros, ¿qué sería «no dar problemas»? ¿Menos paradas, menos mantenimiento, que lo pueda usar cualquiera?`,
 check:["Al menos una pide un ejemplo concreto","Al menos una explora consecuencias","Ninguna menciona ya tu producto","Son abiertas"]},

{id:"v3-08", m:"v3", t:"read", title:"Resumir antes de proponer",
 body:`Antes de presentar nada, **resume** lo que has entendido y pide confirmación:

> Para asegurarme de que lo he entendido: medís a mano el 5% de las piezas, tardáis unos 3 minutos por pieza y el mes pasado tuvisteis una reclamación. Lo que buscáis es controlar el 100% sin añadir personal. ¿Es así? ¿Me dejo algo?

Tres efectos: el cliente se siente escuchado, corrige lo que entendiste mal y, al decir «sí», se compromete con su propio problema.`,
 key:"Resume, confirma y pregunta «¿me dejo algo?» antes de proponer."},

{id:"v3-09", m:"v3", t:"flash",
 front:"El cliente dice algo vago, como «es lento». ¿Qué haces?",
 back:`Lo conviertes en concreto. Pides ejemplos y números:
> ¿Cuánto tarda ahora?
> ¿Cuánto debería tardar?
> ¿Qué pasa cuando se retrasa?`},

/* ========== V4 · DESCUENTOS Y CONCESIONES ========== */
{id:"v4-01", m:"v4", t:"read", title:"Por qué el 5% de entrada fue un error",
 body:`En la prueba ofreciste un 5% antes de que el cliente dijera nada. Tres problemas:

1. **Señalas que tu precio estaba inflado.** Si lo bajas sin que te lo pidan, el cliente piensa: «¿cuánto más habrá?».
2. **Gastas tu moneda de cambio.** Ese 5% servía para conseguir algo. Lo regalaste.
3. **Llevas la conversación al precio.** Tu argumento es la calidad y el coste total; al hablar de descuento, compites por precio.`,
 key:"Un descuento que nadie ha pedido no cierra ventas: abre negociaciones."},

{id:"v4-02", m:"v4", t:"read", title:"La regla de oro: nada gratis",
 body:`Cada concesión se **intercambia**, nunca se regala. La fórmula:

> **Si** tú…, **entonces** yo…

- «Si os lleváis tres unidades en vez de una, puedo dejarlo en un 2%.»
- «Si cerramos el pedido este mes, puedo incluir la formación.»
- «Si lo extendéis a toda la empresa, podemos hablar de un 5%.»

Primero la condición y después la concesión. Si empiezas por «te hago un 2%», el cliente deja de escuchar lo que viene detrás.`,
 key:"«Si tú…, entonces yo…». Siempre en ese orden."},

{id:"v4-03", m:"v4", t:"read", title:"La escalera de descuento",
 body:`Lo que te corrigieron, convertido en método:

- **Nunca empieces por el máximo.** Si lo das todo de golpe, no te queda nada que intercambiar.
- **Escalones proporcionales**: el tamaño del descuento va ligado al tamaño de lo que recibes.
  1 unidad → precio de tarifa. 3 unidades → 2%. Toda la empresa → 5%.
- **Cerca del límite, pasos pequeños.** Si das 2%, luego 3% y luego 4%, enseñas que siempre hay más. Pasos que se encogen (2%… 0,5%) dicen «ya no hay más».`,
 key:"Empieza bajo, sube despacio y solo a cambio de algo más grande."},

{id:"v4-04", m:"v4", t:"read", title:"Las cuentas que asustan",
 body:`Vendes con un **margen del 30%** y haces un **5% de descuento**. ¿Cuánto más tienes que vender para ganar lo mismo?

> Aumento necesario = descuento ÷ (margen − descuento)
> 5 ÷ (30 − 5) = **20% más de unidades**

Con precio 100 y coste 70 ganas 30 por unidad. Con el descuento ganas 25. Para seguir ganando lo mismo, necesitas vender un 20% más.

Un «pequeño» 5% te obliga a vender una unidad extra de cada cinco solo para quedarte igual. Por eso se defiende el precio y se vende valor.`,
 key:"Un 5% de descuento con un 30% de margen exige vender un 20% más para ganar lo mismo."},

{id:"v4-05", m:"v4", t:"num",
 q:"Margen del 40%. Haces un 10% de descuento. ¿Cuánto volumen más necesitas vender para ganar lo mismo? (en %)",
 a:33.3, tol:1, unit:"%",
 exp:`10 ÷ (40 − 10) = 0,333 → **un 33% más**.
Comprobación: con precio 100 y coste 60 ganas 40 por unidad. Con descuento ganas 30. Para sacar 40 × N necesitas 1,33 × N unidades.`},

{id:"v4-06", m:"v4", t:"read", title:"Nada de «voy a preguntar si te puedo dar más»",
 body:`Te lo marcaron como error, y tiene sentido:
- **Creas una expectativa**: el cliente ya da por hecho que habrá más.
- **Si vuelves sin nada**, pierdes credibilidad.
- **Si vuelves con algo**, le enseñas que presionar funciona. La próxima vez presionará más.
- **Pierdes autoridad**: pasas a ser un mensajero.

Alternativa firme y amable:
> Este es el precio para esta configuración. Lo que sí puedo hacer es ver contigo cómo hacerlo más rentable: por volumen, por plazo o por servicios incluidos.`,
 key:"No prometas lo que no tienes. Ofrece alternativas a cambio de algo."},

{id:"v4-07", m:"v4", t:"read", title:"Firme no es frío",
 body:`Mantener el precio no significa ser borde. La idea clave de *Obtenga el sí* (Fisher y Ury, Harvard, 1981): **duro con el problema, suave con la persona**.

Frases que sostienen el precio sin tensión:
> Entiendo que el presupuesto importa. Precisamente por eso quiero que veamos lo que te cuesta cada año la opción barata.
> Es una inversión importante. ¿Qué tendría que pasar para que te sintieras seguro de que vale lo que cuesta?

Y después de decir el precio: **silencio**. No lo justifiques ni lo rebajes tú solo.`,
 key:"Duro con el problema, suave con la persona. Y después del precio, silencio."},

{id:"v4-08", m:"v4", t:"read", title:"Qué intercambiar además del precio",
 body:`Antes de tocar el precio, piensa en cosas que **a ti te cuestan poco y al cliente le valen mucho**:
- Formación para su equipo.
- Instalación o puesta en marcha.
- Ampliación de garantía.
- Plazos de pago.
- Una prueba más larga del equipo.
- Prioridad en soporte técnico.

Y lo que **tú** puedes pedir a cambio: más unidades, pedido antes de una fecha, compromiso anual, un caso de éxito, que te presenten a otra planta del grupo.`,
 key:"Intercambia lo que es barato para ti y valioso para él."},

{id:"v4-09", m:"v4", t:"scenario", title:"El cliente aprieta",
 ctx:"Has presentado un sistema de visión por 18.000 €. Al cliente le interesa.",
 steps:[
  {c:"Me gusta, pero es caro. ¿Qué descuento me puedes hacer?",
   o:[{t:"Te puedo hacer un 10% ahora mismo.",p:0,f:"Das mucho, de golpe y sin pedir nada. Y sin saber con qué lo compara."},
      {t:"¿Caro comparado con qué? ¿Estás mirando otras opciones?",p:2,f:"Antes de negociar, entiendes su referencia: ¿otra marca?, ¿su presupuesto?, ¿seguir midiendo a mano?"},
      {t:"Voy a hablar con mi jefe a ver qué puedo hacer.",p:0,f:"Creas expectativas y pierdes autoridad."}]},
  {c:"Otra marca me lo deja en 14.000 €.",
   o:[{t:"Ese equipo es peor, no te lo recomiendo.",p:0,f:"Criticar a la competencia te resta credibilidad y pone en duda el criterio del cliente."},
      {t:"Entiendo. Para comparar bien: ¿qué incluye esa oferta? ¿Qué velocidad de inspección y qué soporte?",p:2,f:"Comparas en igualdad y buscas lo que le falta a esa opción para lo que él necesita."},
      {t:"Te lo igualo a 14.000.",p:0,f:"Regalas 4.000 € sin saber si comparas lo mismo."}]},
  {c:"Es más lento y el soporte es por correo. Pero 4.000 € son 4.000 €.",
   o:[{t:"Me dijiste que cada hora de parada os cuesta 1.500 €. Con soporte presencial y una inspección más rápida, ¿cuántas horas de parada tendríais que evitar para recuperar esa diferencia?",p:2,f:"Usas SUS números: con 3 horas de parada evitadas, la diferencia está pagada. Y la cuenta la hace él."},
      {t:"Si me confirmas hoy, te hago un 5%.",p:1,f:"Al menos pides algo a cambio, pero aún no has defendido el valor. Primero el valor; después, si hace falta, la negociación."},
      {t:"Bueno, piénsatelo y me dices.",p:0,f:"Abandonas en el peor momento y sin siguiente paso."}]}
 ],
 sum:`Secuencia ganadora: entender su referencia → comparar en igualdad → traducir la diferencia a sus números → solo entonces, si hace falta, negociar con «si tú…, entonces yo…».`},

{id:"v4-10", m:"v4", t:"quiz",
 q:"El cliente todavía no ha hablado de precio. ¿Cuándo tiene sentido ofrecer un descuento?",
 opts:["Al principio, para crear buen ambiente.",
       "Cuando notes dudas en su cara.",
       "Solo cuando lo pida, y a cambio de algo.",
       "Nunca, bajo ningún concepto."], a:2,
 exp:`La D es demasiado rígida: los descuentos existen y a veces cierran ventas. Pero solo cuando el cliente lo pide (o hay una negociación real) y siempre a cambio de algo: volumen, plazo, compromiso. La A y la B regalan margen.`},

{id:"v4-11", m:"v4", t:"open",
 q:"El cliente quiere 1 unidad y dice: «Si me haces un buen precio, igual me animo». Escribe tu respuesta.",
 model:`«Gracias. El precio de una unidad es el que te he dado y, por lo que me contabas de las paradas, creo que se justifica solo. Ahora, si os interesa más de una, cuéntame: ¿en qué otras líneas tenéis el mismo problema? Si lo extendemos a tres unidades, ahí sí puedo mejorar el precio.»`,
 check:["No das descuento a cambio de nada","Mantienes el precio con un argumento de valor","Usas «si tú…, entonces yo…»","Aprovechas para explorar más necesidades (otras líneas)"]},

{id:"v4-12", m:"v4", t:"flash",
 front:"Las 5 reglas de las concesiones",
 back:`1. Nunca ofrecer descuento sin que lo pidan.
2. Nada gratis: «si tú…, entonces yo…».
3. Nunca dar el máximo de entrada.
4. Escalones ligados a lo que recibes, y cada vez más pequeños cerca del límite.
5. No prometer «voy a preguntar si te puedo dar más».`},

/* ========== V5 · COMPETENCIA Y DIFERENCIAL ========== */
{id:"v5-01", m:"v5", t:"read", title:"Lo que no preguntaste",
 body:`En la prueba no averiguaste qué otros modelos miraba el comprador ni a qué precio. Sin eso:
- No sabes contra qué compites.
- No sabes qué precio tiene en la cabeza (su ancla).
- No puedes explicar tu diferencia, porque no sabes respecto a qué.

Preguntarlo no es de mala educación; es lo normal en cualquier compra técnica:
> ¿Estás valorando otras opciones? ¿Cuáles?
> ¿Qué te gusta de ellas? ¿Y qué echas en falta?
> ¿En qué rango de precio te estás moviendo?`,
 key:"Pregunta siempre qué más mira, qué le gusta, qué le falta y a qué precio."},

{id:"v5-02", m:"v5", t:"read", title:"Los tres círculos",
 body:`Imagina tres círculos:
1. Lo que **el cliente necesita**.
2. Lo que **tú ofreces**.
3. Lo que **ofrece la competencia**.

Tu argumento ganador está en un solo sitio: lo que el cliente necesita, tú tienes y **la competencia no**. Ese es tu diferencial.

- Lo que todos ofrecen no diferencia: no pierdas tiempo ahí.
- Lo que ofreces tú y al cliente no le importa es ruido (la «ristra de cualidades»).
- Lo que el cliente necesita y la competencia tiene y tú no: prepárate, porque saldrá.`,
 key:"Tu diferencial es lo que él necesita, tú tienes y los demás no."},

{id:"v5-03", m:"v5", t:"quiz",
 q:"Vendes un microscopio digital. Al cliente le importa sobre todo hacer informes rápido. Tu equipo y el de la competencia tienen la misma resolución, pero el tuyo genera el informe automáticamente. ¿Qué destacas?",
 opts:["La resolución, que es excelente.",
       "El informe automático y el tiempo que le ahorra.",
       "Todo: resolución, informes, diseño, garantía, software…",
       "El precio."], a:1,
 exp:`Está en la intersección: él lo necesita, tú lo tienes y la competencia no. La resolución es igual en los dos, así que no diferencia. Soltarlo todo (C) diluye el mensaje.`},

{id:"v5-04", m:"v5", t:"read", title:"Adiós a la ristra de cualidades",
 body:`Soltar diez características seguidas es como dar diez respuestas sin conocer la pregunta. El cliente olvida casi todas y se queda con la impresión de que no le escuchaste.

Mejor: **pocas cualidades, cada una conectada con algo que te dijo**. Estructura **característica → ventaja → beneficio**, empezando por sus palabras:

> Me comentabas que el cambio de referencia os lleva media hora. Este sistema guarda el programa de cada pieza, así que cambiar es seleccionar la referencia: pasáis de 30 minutos a menos de uno, en cada cambio de turno.`,
 key:"Cada característica que menciones debe responder a algo que el cliente te dijo."},

{id:"v5-05", m:"v5", t:"read", title:"Nunca hables mal de la competencia",
 body:`Aunque sea peor. Porque:
- **Pareces inseguro**: quien confía en su producto no necesita atacar.
- **Criticas al cliente**: quizá él la compró o la recomendó.
- **El cliente la defiende** por reflejo.

Lo que funciona es reconocer y diferenciar:
> Es una buena marca y para muchos usos funciona bien. Donde vemos diferencia, por lo que me cuentas, es en…

Y hacer preguntas que descubran las carencias **sin que las digas tú**:
> ¿Te han contado cómo es el soporte si hay una avería en plena producción?`,
 key:"Reconoce a la competencia y deja que el cliente descubra sus carencias con tus preguntas."},

{id:"v5-06", m:"v5", t:"quiz",
 q:"El cliente dice: «La marca X es más barata». ¿Mejor respuesta?",
 opts:["«X tiene muchos problemas de fiabilidad.»",
       "«Es posible. ¿Qué incluye su oferta y qué te ha convencido de ella?»",
       "«Te lo igualo.»",
       "«Nosotros somos líderes del mercado.»"], a:1,
 exp:`Reconoces sin atacar y averiguas qué incluye (para comparar en igualdad) y qué valora él (para encontrar tu diferencial).`},

{id:"v5-07", m:"v5", t:"open",
 q:"Vendes patinetes. El cliente mira uno de otra marca 100 € más barato. Escribe 3 preguntas para encontrar tu diferencial.",
 model:`> ¿Qué es lo que más te ha gustado de ese modelo?
> ¿Hay algo que eches en falta o que te haga dudar?
> Para el uso que me has contado, ¿qué es lo más importante para ti?

Con eso comparas. Si para él es clave subirlo al tren y el tuyo pesa 3 kg menos y se pliega en un gesto, ese es tu argumento, no la potencia.`,
 check:["Preguntas qué le gusta de la otra opción","Preguntas qué le falta o le hace dudar","Conectas con su uso concreto","No atacas a la otra marca"]},

{id:"v5-08", m:"v5", t:"flash",
 front:"Las 4 preguntas sobre la competencia",
 back:`1. ¿Qué otras opciones estás valorando?
2. ¿Qué te gusta de ellas?
3. ¿Qué echas en falta?
4. ¿Qué precio te han dado o en qué rango te mueves?`},

/* ========== V6 · COSTE TOTAL Y RETORNO ========== */
{id:"v6-01", m:"v6", t:"read", title:"El iceberg del coste",
 body:`El precio de compra es la punta del iceberg. Debajo del agua está el **coste total de propiedad** (TCO, por sus siglas en inglés):
- Instalación y puesta en marcha.
- Formación.
- Mantenimiento y recambios.
- **Paradas de producción** cuando falla.
- **Piezas defectuosas** que no se detectan, y reclamaciones.
- Sustituciones: un equipo que dura la mitad se compra dos veces.
- Horas de personal: medición manual, ajustes.

Tu trabajo es sacar el iceberg a la luz **con los datos del cliente**.`,
 key:"El precio es la punta del iceberg; el coste total es todo lo que hay debajo."},

{id:"v6-02", m:"v6", t:"read", title:"¿Cuánto cuesta una hora parada?",
 body:`En la industria, la parada no planificada suele ser el coste más grande y más escondido. La línea deja de producir, el personal cobra igual y las entregas se retrasan.

Pregúntalo directamente:
> Cuando la línea se para, ¿cuánto os cuesta cada hora, más o menos?

Muchos clientes lo saben. Si no, constrúyelo con él: piezas por hora × margen por pieza + personal parado + posibles penalizaciones. Ese número será la base de tu argumento.`,
 key:"El coste de una hora de parada es el número más potente de la conversación."},

{id:"v6-03", m:"v6", t:"read", title:"Caro que sale barato: cálculo tipo",
 body:`**Equipo A (barato)**: 3.000 €. Dura unos 2 años. Para la línea 4 horas al año.
**Equipo B (calidad)**: 6.000 €. Dura unos 6 años. Paradas casi nulas.
Hora de parada: 1.000 €.

En 6 años:
- A: tres equipos (9.000 €) + 24 h de parada (24.000 €) = **33.000 €**
- B: un equipo = **6.000 €**

B cuesta el doble… y sale más de cinco veces más barato. El cálculo que convence es el que se hace **con sus números** y él ve paso a paso.`,
 key:"Compara siempre en el mismo periodo de tiempo y con todos los costes."},

{id:"v6-04", m:"v6", t:"num",
 q:"Equipo barato: 4.000 €, dura 3 años. Equipo de calidad: 9.000 €, dura 9 años. Sin contar paradas, ¿cuánto ahorra el cliente en 9 años con el de calidad? (en €)",
 a:3000, tol:1, unit:"€",
 exp:`Barato: 3 equipos × 4.000 = 12.000 €. Calidad: 9.000 €. Ahorro: **3.000 €**, y eso sin contar paradas, instalaciones repetidas ni el tiempo de cada cambio.`},

{id:"v6-05", m:"v6", t:"read", title:"Plazo de recuperación y ROI",
 body:`Dos formas de presentar el valor:

**Plazo de recuperación**: cuánto tarda en pagarse.
> Plazo = inversión ÷ ahorro mensual
Un equipo de 12.000 € que ahorra 1.500 € al mes se paga en **8 meses**.

**ROI** (retorno de la inversión): cuánto gana sobre lo que invierte.
> ROI = (ahorro − inversión) ÷ inversión
Si en 3 años ahorra 54.000 € con 12.000 € de inversión: (54.000 − 12.000) ÷ 12.000 = **350%**.

En planta suele convencer más el plazo: «se paga solo en 8 meses» se entiende al instante.`,
 key:"«Se paga solo en X meses» es la frase que mejor entiende un jefe de planta."},

{id:"v6-06", m:"v6", t:"num",
 q:"Un sistema de visión cuesta 15.000 €. Evita piezas defectuosas por valor de 2.500 € al mes. ¿En cuántos meses se paga?",
 a:6, tol:0.1, unit:"meses",
 exp:`15.000 ÷ 2.500 = **6 meses**. A partir del séptimo mes, todo es ahorro.`},

{id:"v6-07", m:"v6", t:"read", title:"OEE: el idioma de la fábrica",
 body:`Muchas plantas miden su eficiencia con el **OEE** (eficiencia global del equipo):

> OEE = disponibilidad × rendimiento × calidad

- **Disponibilidad**: tiempo funcionando frente al planificado. Las paradas la hunden.
- **Rendimiento**: velocidad real frente a la ideal.
- **Calidad**: piezas buenas frente a fabricadas.

Ejemplo: 90% × 95% × 98% ≈ **84%**.

Si tu equipo reduce paradas o defectos, sube el OEE. Habla en su idioma:
> ¿Qué OEE tenéis en esa línea? ¿Qué es lo que más lo baja?`,
 key:"Menos paradas o menos defectos = más OEE. Habla en su idioma."},

{id:"v6-08", m:"v6", t:"num",
 q:"Una línea tiene un 80% de disponibilidad, un 90% de rendimiento y un 95% de calidad. ¿Cuál es su OEE? (en %)",
 a:68.4, tol:0.6, unit:"%",
 exp:`0,80 × 0,90 × 0,95 = 0,684 → **68,4%**.
Si un sensor fiable sube la disponibilidad al 88%, el OEE pasa a 75,2%: casi 7 puntos más con el mismo equipo humano.`},

{id:"v6-09", m:"v6", t:"read", title:"Que los números los ponga el cliente",
 body:`Un cálculo con **tus** números suena a folleto. Uno con **los suyos** es una conclusión propia.

1. Pregunta los datos: coste de parada, frecuencia de fallos, piezas rechazadas, horas de medición manual.
2. Haz la cuenta **delante de él**, en papel o en su pizarra.
3. Deja que diga él el resultado: «Entonces… ¿cuánto os está costando al año?».
4. Si un dato es dudoso, sé **prudente**. Un cálculo conservador que sigue saliendo a favor es mucho más creíble.`,
 key:"Sus datos, la cuenta a la vista y una estimación prudente."},

{id:"v6-10", m:"v6", t:"open",
 q:"Un jefe de calidad te cuenta que miden a mano 200 piezas al día, 2 minutos por pieza, y que la hora de técnico les cuesta 30 €. Calcula cuánto les cuesta al año (220 días laborables) y escribe cómo se lo dirías.",
 model:`200 × 2 min = 400 min/día ≈ 6,7 h/día.
6,7 h × 30 € ≈ 200 €/día × 220 días ≈ **44.000 € al año**.

> Según lo que me cuentas, solo en horas de medición se os van unos 44.000 € al año, y eso midiendo una muestra. Si un sistema de medición por imagen midiera cada pieza en segundos, ¿a qué dedicaríais a ese técnico?`,
 check:["Llegas a unos 44.000 € al año","Usas sus datos, no los tuyos","Terminas con una pregunta, no con un discurso","Mencionas el beneficio para él (liberar al técnico)"]},

/* ========== V7 · OBJECIONES ========== */
{id:"v7-01", m:"v7", t:"read", title:"Una objeción es una pregunta disfrazada",
 body:`Cuando el cliente pone pegas no te está diciendo «no». Te está diciendo «todavía no lo veo claro». Cada objeción es información.

Método en 4 pasos:
1. **Escucha** sin interrumpir.
2. **Reconoce**: «Entiendo, es una inversión importante».
3. **Explora** qué hay detrás: «¿Qué es lo que más te preocupa?».
4. **Responde** con valor y comprueba: «¿Esto resuelve tu duda?».

El error típico es saltar del 1 al 4: defenderse antes de saber qué hay detrás.`,
 key:"Escucha, reconoce, explora y solo entonces responde."},

{id:"v7-02", m:"v7", t:"read", title:"«Es caro»",
 body:`La objeción más común. Antes de responder, explora:
> ¿Caro comparado con qué?

Puede ser:
- **Otra oferta** → compara qué incluye cada una.
- **Su presupuesto** → «¿Qué presupuesto tenéis previsto? ¿Lo decide alguien más?».
- **Que no ve el valor** → vuelve al coste de su problema.
- **Una táctica** → aguanta: silencio y valor.

Nunca respondas a «es caro» con un descuento directo.`,
 key:"«¿Caro comparado con qué?» antes de nada."},

{id:"v7-03", m:"v7", t:"read", title:"«Mándame información»",
 body:`Suena a interés, pero muchas veces es una forma educada de terminar. Si contestas «perfecto, te la mando», el folleto acaba en una carpeta.

Mejor:
> Claro. Para mandarte lo que de verdad te sirva: ¿qué te interesa más ver? ¿Precios, especificaciones, casos de clientes parecidos?
> Te lo envío hoy. ¿Lo comentamos el jueves 10 minutos para resolver dudas?

Concreta qué mandas y **cierra un siguiente paso con fecha**.`,
 key:"Nunca aceptes «mándame información» sin concretar qué ni fecha para comentarlo."},

{id:"v7-04", m:"v7", t:"read", title:"«Lo tengo que pensar» y «lo tengo que consultar»",
 body:`**«Lo tengo que pensar»**: casi siempre hay una duda concreta que no ha dicho.
> Claro, es lógico. Para ayudarte a pensarlo: ¿qué es lo que te hace dudar más?

**«Lo tengo que consultar»**: hay otra persona que decide. Necesitas saber quién es y qué le importa.
> Perfecto. ¿Quién más participa en la decisión? ¿Qué crees que le va a importar más? Si te ayuda, te preparo el cálculo de ahorro para que se lo enseñes, o se lo explico yo.`,
 key:"Detrás de «pensar» hay una duda concreta; detrás de «consultar», otra persona."},

{id:"v7-05", m:"v7", t:"read", title:"«Ya tenemos proveedor»",
 body:`No intentes que lo cambie hoy. Busca una grieta:
> Tiene sentido. ¿Qué tal os funciona? Si pudieras mejorar una sola cosa, ¿cuál sería?
> ¿Hay alguna aplicación en la que no os estén dando solución?

Muchas veces tienen proveedor para una cosa (sensores) pero no para otra (visión, medición en laboratorio). Por eso hay que preguntar por **todo**, no solo por el motivo de la visita.`,
 key:"No ataques a su proveedor: busca lo que no le está resolviendo."},

{id:"v7-06", m:"v7", t:"quiz",
 q:"El cliente dice: «No sé… lo tengo que pensar». ¿Mejor respuesta?",
 opts:["«Perfecto, piénsalo con calma y ya me dices algo.»",
       "«Si lo cierras hoy, te hago un 5%.»",
       "«Claro. ¿Qué es lo que te hace dudar más?»",
       "«No lo pienses mucho, que la oferta se acaba pronto.»"], a:2,
 exp:`Saca a la luz la duda real. La A deja la venta sin siguiente paso. La B regala margen por miedo. La D presiona y daña la confianza.`},

{id:"v7-07", m:"v7", t:"scenario", title:"Objeción en planta",
 ctx:"Visitas a la jefa de mantenimiento de una fábrica de envases. Le has propuesto sensores para detectar tapones mal colocados.",
 steps:[
  {c:"Esto ya lo probamos hace años con otra marca y no funcionó.",
   o:[{t:"Nuestra tecnología es mucho mejor; seguro que ahora sí funciona.",p:0,f:"Respuesta defensiva, sin saber qué falló. No la convences."},
      {t:"Vaya. ¿Qué pasó? ¿Qué es lo que no funcionó?",p:2,f:"Exploras. Lo que falló es justo lo que tendrás que demostrar que no pasa."},
      {t:"Bueno, eso fue hace años.",p:0,f:"Le quitas importancia a algo que para ella fue un problema real."}]},
  {c:"Los reflejos del envase brillante daban falsos rechazos. Parábamos la línea por nada.",
   o:[{t:"Entiendo: parar por falsos rechazos es peor que no tener sensor. ¿Hacemos una prueba con vuestros envases reales, a ver cómo se comporta con ese brillo?",p:2,f:"Reconoces, conectas con su dolor real y propones una demo con su pieza. Muy al estilo Bitmakers."},
      {t:"Nuestros sensores no tienen ese problema.",p:1,f:"Quizá sea cierto, pero es solo una afirmación. Una prueba con su envase convence mucho más."},
      {t:"¿Y qué presupuesto tenéis?",p:0,f:"Ignoras la objeción. Seguirá ahí."}]},
  {c:"Vale, pero no puedo parar la línea para hacer pruebas.",
   o:[{t:"¿Cuándo tenéis paradas programadas? ¿Podemos aprovechar una, o probar antes con muestras fuera de línea?",p:2,f:"Te adaptas a sus restricciones y cierras un siguiente paso."},
      {t:"Entonces no podemos hacer nada.",p:0,f:"Te rindes ante el primer obstáculo."},
      {t:"Solo son cinco minutos, no pasa nada.",p:0,f:"Minimizas su preocupación. Para ella sí pasa."}]}
 ],
 sum:`Objeción → pregunta → dolor real (falsos rechazos) → demo con su pieza → siguiente paso adaptado a sus restricciones.`},

{id:"v7-08", m:"v7", t:"open",
 q:"El cliente dice: «Mándame un presupuesto y ya lo vemos». Escribe tu respuesta.",
 model:`«Claro, te lo preparo. Para que sea exacto y encaje: ¿con qué otras opciones lo vas a comparar y qué es lo más importante para ti al decidir? Y te propongo una cosa: te lo envío el martes y el miércoles lo repasamos juntos 15 minutos, así te explico los números de ahorro. ¿Te va bien a primera hora?»`,
 check:["Aceptas sin resistencia","Preguntas con qué lo compara o qué criterio usará","Propones un siguiente paso con fecha","Terminas con una pregunta fácil de aceptar"]},

/* ========== V8 · CIERRE Y SEGUIMIENTO ========== */
{id:"v8-01", m:"v8", t:"read", title:"Avance o continuación",
 body:`Rackham distingue cuatro resultados de una visita:
- **Pedido.**
- **Avance**: un paso concreto que acerca la venta (demo con fecha, reunión con quien decide, prueba en planta).
- **Continuación**: «Muy interesante, ya hablaremos». Suena bien, pero **no avanza nada**.
- **Sin venta.**

Las ventas técnicas casi nunca se cierran en la primera visita. El objetivo realista de cada visita es un **avance**. Confundir una continuación con un éxito es el autoengaño típico del novato.`,
 key:"Cada visita debe terminar con un avance concreto, no con un «ya hablaremos»."},

{id:"v8-02", m:"v8", t:"quiz",
 q:"¿Cuál de estos resultados es un AVANCE?",
 opts:["«Me ha encantado, llámame en unas semanas.»",
       "«Mándame un catálogo.»",
       "«Hacemos una prueba con nuestras piezas el martes 14 a las 10, con el jefe de calidad.»",
       "«Lo comentaré internamente.»"], a:2,
 exp:`Tiene fecha, una actividad concreta e implica a quien decide. Las otras son continuaciones: no comprometen a nada.`},

{id:"v8-03", m:"v8", t:"read", title:"Cómo pedir el siguiente paso",
 body:`No esperes a que lo proponga el cliente. Propón tú algo concreto:

> Por lo que hemos hablado, creo que lo más útil sería probarlo con vuestras piezas. ¿Lo hacemos la semana que viene? ¿Te va mejor el martes o el jueves?

Claves:
- **Justifica** el paso con lo que te ha dicho.
- **Concreta**: qué, quién y cuándo.
- Da **dos opciones** de fecha: es más fácil elegir que inventar.
- Si decide otra persona: «¿Tiene sentido que venga también…?».`,
 key:"Propón tú el siguiente paso: qué, quién y cuándo, con dos opciones."},

{id:"v8-04", m:"v8", t:"read", title:"Seguimiento, siempre",
 body:`Como te dijeron: **seguimiento siempre**, sea un sí o un no.

- **Después de la visita** (el mismo día): correo con sus necesidades (en sus palabras), lo acordado y la fecha del siguiente paso.
- **Antes de que decida**: «Antes de que lo cerréis, ¿ha cambiado algo desde que hablamos? ¿Hay alguna duda nueva?». Las prioridades, el presupuesto y las personas cambian.
- **Después de un sí**: comprobar que el equipo funciona y que lo usan bien, y buscar nuevas necesidades.
- **Después de un no**: preguntar por qué (es oro para aprender) y cuándo tiene sentido volver a hablar.`,
 key:"Seguimiento tras la visita, antes de que decida, tras un sí y tras un no."},

{id:"v8-05", m:"v8", t:"read", title:"El correo de seguimiento",
 body:`Cuatro bloques cortos:
1. **Gracias** y contexto: «Gracias por el rato de hoy en la planta».
2. **Lo que entendiste**, en sus palabras: «Medís a mano el 5% de las piezas y queréis llegar al 100% sin añadir personal».
3. **Lo acordado**: «Haremos la prueba con 20 piezas en la línea 2».
4. **Siguiente paso con fecha**: «Nos vemos el martes 14 a las 10».

Sin adjuntar el catálogo entero y sin párrafos de producto.`,
 key:"Gracias, lo que entendiste, lo acordado y el siguiente paso con fecha."},

{id:"v8-06", m:"v8", t:"order",
 q:"Ordena los pasos de seguimiento de una venta.",
 items:["Correo resumen el mismo día de la visita",
        "Demo o prueba con su pieza",
        "Contacto antes de su decisión: «¿ha cambiado algo?»",
        "Tras la compra: comprobar que funciona y buscar nuevas necesidades"],
 exp:`El seguimiento no termina con la venta: después de la instalación aparece la siguiente oportunidad.`},

{id:"v8-07", m:"v8", t:"open",
 q:"El cliente ha elegido a la competencia. Escribe lo que le dirías por teléfono.",
 model:`«Gracias por decírmelo directamente. Me ayudaría mucho saber qué ha pesado más en la decisión, para aprender.
[escuchas]
Entendido. Me alegro de que ya tengáis la solución en marcha. ¿Te parece si te llamo dentro de unos meses para ver qué tal os va? Y si mientras tanto surge cualquier otra aplicación (medición, visión, laboratorio), aquí me tienes.»`,
 check:["Agradeces sin reproches","Preguntas el motivo para aprender","Dejas la puerta abierta con una fecha aproximada","Recuerdas que puedes ayudar con otras necesidades"]},

{id:"v8-08", m:"v8", t:"flash",
 front:"Los 4 momentos del seguimiento",
 back:`1. Tras la visita: correo resumen.
2. Antes de que decida: «¿ha cambiado algo?».
3. Tras un sí: que funcione y nuevas necesidades.
4. Tras un no: por qué y cuándo volver a hablar.`},

/* ========== V9 · ROLE-PLAY Y ENTREVISTA ========== */
{id:"v9-01", m:"v9", t:"read", title:"La conversación de venta, de principio a fin",
 body:`1. **Apertura**: saludo, motivo y permiso para preguntar.
2. **Descubrir**: SPIN, escuchar y preguntar por la competencia y por **todo lo demás**.
3. **Resumir y confirmar.**
4. **Proponer**: pocas cualidades, cada una ligada a una necesidad.
5. **Objeciones**: escuchar, reconocer, explorar y responder.
6. **Negociar** (si toca): «si tú…, entonces yo…».
7. **Cerrar un avance** con fecha.
8. **Seguimiento.**

Las fases 2 y 3 deberían ocupar la mayor parte del tiempo.`,
 key:"Casi todo el tiempo, descubrir. La propuesta llega tarde y es corta."},

{id:"v9-02", m:"v9", t:"read", title:"La apertura que te da permiso para preguntar",
 body:`Mucha gente no pregunta porque siente que «molesta». Resuélvelo al principio:

> Para no hacerte perder el tiempo, ¿te parece si primero te hago unas preguntas para entender bien qué necesitas, y luego te cuento lo que creo que te puede encajar? Y si no encaja nada, también te lo digo.

Es un **acuerdo previo**: pactas cómo será la conversación. El cliente sabe que vas a preguntar y que no le vas a soltar un discurso.`,
 key:"Pide permiso para preguntar al principio y tendrás vía libre todo el rato."},

{id:"v9-03", m:"v9", t:"read", title:"El patinete, bien hecho (1/2)",
 body:`T: ¡Hola! ¿Qué te trae por aquí?
C: Estoy mirando patinetes eléctricos.
T: Genial. Para no liarte con modelos, ¿te hago un par de preguntas y te digo cuál creo que encaja? ¿Para qué lo usarías?
C: Para ir al trabajo.
T: ¿Cómo es el trayecto? Distancia, tipo de suelo, cuestas…
C: Unos 8 km por ciudad. Y lo tengo que subir al tren.
T: Entonces te importarán el peso y el plegado. ¿Lo usarías todos los días?
C: Sí, ida y vuelta.
T: ¿Estás mirando algún otro modelo?
C: Sí, el X, que está a 450 €.
T: ¿Qué te gusta de él? ¿Y qué te hace dudar?
C: Me gusta el precio. Pero pesa 16 kg.`,
 key:"Ninguna suposición: uso, trayecto, frecuencia, competencia y precio salen de preguntas."},

{id:"v9-04", m:"v9", t:"read", title:"El patinete, bien hecho (2/2)",
 body:`T: 16 kg, subiéndolo y bajándolo del tren dos veces al día… ¿cómo lo ves?
C: Pues la verdad es que me echa para atrás.
T: Este pesa 12 kg y se pliega en un gesto. Cuesta 549 €: son 100 € más, pero te ahorras cargar 4 kg dos veces al día durante años.
C: Ya… ¿no me puedes hacer algo de descuento?
T: El precio es el que es, y en tu caso creo que se justifica. Ahora, me comentabas que tu pareja también va en tren. Si os lleváis dos, ahí sí puedo hacer un 2%.
C: Déjame pensarlo.
T: Claro. ¿Qué es lo que te hace dudar más?
C: Si de verdad lo voy a usar todos los días.
T: Lógico. Te propongo algo: pruébalo aquí diez minutos, pliégalo y súbelo por esa escalera. ¿Te parece?`,
 key:"Diferencial ligado a su necesidad, ningún descuento regalado, la objeción explorada y un siguiente paso concreto."},

{id:"v9-05", m:"v9", t:"scenario", title:"Role-play: el patinete, versión entrevista",
 ctx:"El entrevistador hace de cliente y quiere un patinete. Tú eres el comercial.",
 steps:[
  {c:"Hola, quería ver patinetes eléctricos.",
   o:[{t:"Claro. Este es nuestro modelo estrella: 25 km/h, 30 km de autonomía, suspensión delantera y app.",p:0,f:"Ristra de cualidades sin una sola pregunta. Es justo lo que te corrigieron."},
      {t:"Perfecto. Antes de enseñarte nada: ¿para qué lo usarías y por dónde vas a ir?",p:2,f:"Preguntas por el uso y el entorno. Cero suposiciones."},
      {t:"Te puedo hacer un 5% en cualquiera de estos.",p:0,f:"Descuento que nadie ha pedido: el error que te marcaron."}]},
  {c:"Para moverme por la ciudad. También estoy mirando el de la marca Z.",
   o:[{t:"¿Qué te gusta del Z? ¿Y a qué precio lo has visto?",p:2,f:"Averiguas qué valora y su referencia de precio. Justo lo que faltó en la prueba."},
      {t:"El Z es peor, créeme.",p:0,f:"Atacar a la competencia te resta credibilidad."},
      {t:"En ciudad hay muchos baches, así que te conviene doble suspensión.",p:0,f:"Suposición. ¿Y si va por carril bici liso?"}]},
  {c:"Me gusta que es ligero. Lo he visto a 399 €. El vuestro está a 479 €.",
   o:[{t:"Además del peso, ¿qué más es importante para ti? Autonomía, dónde lo vas a guardar, si lo llevas en transporte…",p:2,f:"Sigues descubriendo antes de proponer. Quizá aparezca algo que el Z no tiene."},
      {t:"Te lo dejo en 399 €.",p:0,f:"Regalas 80 € sin defender el valor."},
      {t:"Voy a preguntar a mi encargado si puedo bajarlo.",p:0,f:"Falsas esperanzas y pierdes autoridad."}]},
  {c:"Lo voy a cargar en la oficina, pero no tengo un enchufe cerca de donde lo dejo. Necesito poder sacar la batería.",
   o:[{t:"El nuestro tiene batería extraíble y el Z no. Puedes cargarla en tu mesa. Para ti eso es clave, ¿verdad?",p:2,f:"Diferencial perfecto: él lo necesita, tú lo tienes y el Z no. Y lo confirmas."},
      {t:"El nuestro tiene app, luces LED, frenos de disco y 30 km de autonomía.",p:0,f:"Ristra de cualidades que no responde a lo que acaba de decirte."},
      {t:"Bueno, siempre puedes buscar un enchufe.",p:0,f:"Desprecias una necesidad que te acaba de regalar."}]},
  {c:"Sí… pero son 80 € más. ¿Qué me puedes hacer?",
   o:[{t:"El precio está ajustado, y la batería extraíble resuelve justo tu problema de carga. Si te lo llevas hoy, te incluyo el candado.",p:2,f:"Firme en el precio, el valor primero y una concesión barata para ti y útil para él, a cambio de algo: comprar hoy."},
      {t:"Vale, te hago un 10%.",p:0,f:"Mucho, de golpe y a cambio de nada."},
      {t:"Lo siento, no se puede hacer nada.",p:1,f:"Firme, pero rígido. Se puede ser firme y aun así proponer un intercambio."}]}
 ],
 sum:`Lo que el entrevistador quiere ver: preguntas antes de proponer, ninguna suposición, competencia y precio averiguados, un diferencial ligado a su necesidad, firmeza con el precio y concesiones solo a cambio de algo.`},

{id:"v9-06", m:"v9", t:"read", title:"Si te preguntan qué aprendiste de la prueba",
 body:`Es muy probable que te lo pregunten, y es una oportunidad de oro: demuestra que **aprendes rápido y aceptas las críticas**, lo más valorado en un perfil sin experiencia.

1. **Reconoce sin excusas**: «Pregunté poco, supuse cosas y ofrecí un descuento que nadie me había pedido».
2. **Lo que entendiste**: «El valor lo descubre el cliente a través de preguntas, y cada concesión se intercambia por algo».
3. **Lo que has hecho**: «Esta semana he estudiado venta consultiva, cálculo de coste total y negociación, y he practicado con role-plays».
4. **Demuéstralo** en el role-play.`,
 key:"Reconoce, explica lo que aprendiste, cuenta qué hiciste y demuéstralo."},

{id:"v9-07", m:"v9", t:"open",
 q:"Practica EN VOZ ALTA: «¿Qué aprendiste de la primera prueba?». Responde en menos de un minuto.",
 model:`«Me sirvió mucho. Me di cuenta de que fui directamente a vender: pregunté poco, di cosas por hecho, como que la carretera tenía baches, y ofrecí un 5% sin que me lo pidieran. Entendí que en vuestra forma de trabajar el valor se descubre preguntando; que tengo que saber qué más mira el cliente y a qué precio, para diferenciarme; y que un descuento solo se da a cambio de algo y poco a poco. Esta semana he estudiado venta consultiva, cálculo de coste total y negociación, y lo he practicado. Me gustaría demostrarlo hoy.»`,
 check:["Reconoces los errores sin excusas","Nombras lo aprendido: preguntar, competencia, concesiones","Cuentas qué has hecho para mejorar","Dura menos de un minuto","Suena seguro, no a disculpa"]},

{id:"v9-08", m:"v9", t:"read", title:"Qué buscan en un comercial sin experiencia",
 body:`Sin experiencia no te evalúan por tu cartera de clientes, sino por señales de que puedes aprender el oficio:
- **Curiosidad**: preguntas porque de verdad te interesa el problema.
- **Escucha**: recuerdas y usas lo que el otro dijo.
- **Capacidad de aprender**: aplicas lo que te corrigieron. Es lo que más podrás demostrar.
- **Resiliencia**: un «no» no te hunde.
- **Interés técnico**: te atrae entender cómo funcionan las fábricas y los equipos.
- **Orden**: preparas, apuntas y haces seguimiento.`,
 key:"Sin experiencia, demuestra curiosidad, escucha y que aplicas lo que te corrigen."},

{id:"v9-09", m:"v9", t:"read", title:"Preguntas para hacerles tú",
 body:`Hacer buenas preguntas al final demuestra justo lo que valoran: curiosidad.

> ¿Cómo es el día a día de un comercial aquí? ¿Cuántas visitas, cuánta preparación?
> ¿Cómo es la formación de producto al principio?
> ¿Qué tienen en común los comerciales a los que mejor les va aquí?
> ¿Qué tipo de clientes y sectores llevaría?
> ¿Cómo se mide el éxito en los primeros seis meses?`,
 key:"Lleva 2 o 3 preguntas preparadas: demuestran la curiosidad que buscan."},

{id:"v9-10", m:"v9", t:"flash",
 front:"Checklist del role-play (8 puntos)",
 back:`1. Apertura pidiendo permiso para preguntar.
2. Uso y contexto, sin suponer.
3. Competencia: cuál, qué le gusta, qué le falta, a qué precio.
4. Implicaciones: qué le cuesta el problema.
5. Resumir y confirmar.
6. Pocas cualidades, ligadas a lo que dijo.
7. Precio firme; concesiones solo con «si tú…, entonces yo…».
8. Cerrar un siguiente paso concreto.`},

/* ========== V10 · PRODUCTO Y PLANTA ========== */
{id:"v10-01", m:"v10", t:"read", title:"El catálogo, por problemas",
 body:`Familias de producto de la gama que distribuye Bitmakers, según **el problema que resuelven** (repásalas en bitmakers.com antes de la entrevista):
- **Sensores** (fotoeléctricos, láser): ¿está la pieza? ¿está en su sitio?
- **Medición láser y de desplazamiento**: alturas, espesores y distancias sin tocar la pieza.
- **Perfilómetros láser 2D/3D**: forma de una pieza, cordones de soldadura, juntas.
- **Visión artificial**: inspección automática de defectos, presencia, textos.
- **Lectores de códigos**: trazabilidad con códigos de barras y DataMatrix.
- **Marcadores láser**: grabar códigos y textos permanentes.
- **Medición por imagen**: medir piezas en segundos en vez de con calibre.
- **Microscopios digitales**: laboratorio, análisis de fallos, I+D.`,
 key:"Apréndete el catálogo como una lista de problemas que resuelve, no de productos."},

{id:"v10-02", m:"v10", t:"quiz",
 q:"Una fábrica mide con calibre 50 cotas de una pieza y tarda 10 minutos por pieza. ¿Qué familia encaja mejor?",
 opts:["Sensor fotoeléctrico","Sistema de medición por imagen","Marcador láser","Lector de códigos"], a:1,
 exp:`La medición por imagen mide muchas cotas de una vez, en segundos y sin depender de quién mida. Ahorra tiempo y elimina la variación entre operarios.`},

{id:"v10-03", m:"v10", t:"quiz",
 q:"Un fabricante de automoción necesita que cada pieza lleve un código de lote, sin tinta ni etiquetas.",
 opts:["Microscopio digital","Marcador láser","Perfilómetro","Sensor de presión"], a:1,
 exp:`El marcado láser es permanente y no usa consumibles: ni tinta ni etiquetas que comprar o que se despeguen. Y después hace falta un lector para leer el código: venta cruzada.`},

{id:"v10-04", m:"v10", t:"quiz",
 q:"El laboratorio de calidad necesita analizar por qué se agrietan unas piezas y documentarlo con imágenes.",
 opts:["Sensor láser de distancia","Microscopio digital","Lector de códigos","Autómata programable"], a:1,
 exp:`Un microscopio digital permite observar, medir y documentar defectos en detalle. Es la herramienta típica para análisis de fallos e I+D.`},

{id:"v10-05", m:"v10", t:"read", title:"Vocabulario de planta (1/2)",
 body:`- **Tolerancia**: margen permitido respecto a la medida nominal. Ejemplo: 10 ± 0,05 mm.
- **Repetibilidad**: si mides lo mismo varias veces, ¿cuánto varía el resultado? Clave para fiarse de una medición.
- **Resolución**: el cambio más pequeño que el equipo es capaz de detectar.
- **Exactitud**: cuánto se acerca la medida al valor real. En el día a día muchos lo llaman «precisión»; en metrología, la precisión es más bien lo parecidas que salen las mediciones repetidas.
- **Sin contacto**: medir sin tocar la pieza. No se raya ni se deforma, y es más rápido.`,
 key:"Tolerancia, repetibilidad y resolución: las tres palabras que más vas a oír."},

{id:"v10-06", m:"v10", t:"read", title:"Vocabulario de planta (2/2)",
 body:`- **Tiempo de ciclo**: lo que tarda en fabricarse una pieza. Si tu equipo es más lento que el ciclo, no sirve para controlar en línea.
- **En línea / fuera de línea**: medir en la propia línea (el 100% de las piezas) o en el laboratorio (muestras).
- **Rechazo**: piezas defectuosas que se tiran o se reprocesan.
- **Trazabilidad**: poder saber de dónde viene cada pieza (lote, fecha, máquina).
- **Parada no planificada**: la que nadie quería. La enemiga número uno.
- **OEE**: eficiencia global (disponibilidad × rendimiento × calidad).`,
 key:"Si tu equipo es más lento que el ciclo, no vale para controlar en línea."},

{id:"v10-07", m:"v10", t:"quiz",
 q:"Una línea fabrica una pieza cada 2 segundos. El equipo de inspección tarda 3 segundos por pieza. ¿Qué pasa?",
 opts:["Perfecto: inspecciona el 100%.",
       "No puede inspeccionar el 100% en línea: es más lento que el ciclo.",
       "Da igual, la velocidad no importa.",
       "Inspecciona el 150% de las piezas."], a:1,
 exp:`Para controlar el 100% en línea, el equipo debe ser más rápido que el tiempo de ciclo. Por eso hay que preguntar el ciclo antes de proponer nada.`},

{id:"v10-08", m:"v10", t:"read", title:"Por qué la demo vende tanto",
 body:`En equipos técnicos, la demo con **la pieza real del cliente** elimina la gran duda: «¿funcionará en mi caso?».

Una buena demo:
- Se prepara con lo que sabes de su problema; no enseñas todas las funciones.
- Usa **sus piezas**, incluidas las difíciles: brillantes, transparentes, oscuras.
- Deja que **el cliente toque** el equipo.
- Mide lo que importa: tiempo, repetibilidad, detección del defecto que le preocupa.
- Termina con una pregunta: «¿Esto resolvería lo que me contabas?».`,
 key:"Demo con su pieza, centrada en su problema y terminando con una pregunta."},

{id:"v10-09", m:"v10", t:"open",
 q:"En la entrevista: «¿Qué sabes de Bitmakers?». Responde en 3 o 4 frases.",
 model:`«Sé que sois los distribuidores oficiales y exclusivos de Keyence en España, desde Barcelona, con soluciones de detección, medición láser, visión artificial, marcado y microscopía. Lo que más me atrae es el enfoque: no vendéis un producto, resolvéis un problema de producción o de laboratorio, y lo justificáis con números: menos paradas, menos rechazo, más fiabilidad. Me encaja porque me gusta entender cómo funcionan las cosas y me motiva la parte de preguntar y calcular.»`,
 check:["Mencionas la relación con Keyence","Nombras 2 o 3 familias de producto","Hablas del enfoque: valor, fiabilidad, cálculo","Lo conectas contigo"]},

/* ========== CIENCIA ========== */

{id:"s-01", m:"cien", t:"read", title:"Correlación no es causalidad",
 body:`En los meses en que se venden más helados también hay más ahogamientos. ¿Los helados ahogan? No: los dos suben por una **tercera causa**, el calor, que lleva a la gente a comer helado y a bañarse.

Que dos cosas vayan juntas (**correlación**) no significa que una cause la otra (**causalidad**). Puede haber una causa común, puede ser al revés, o puede ser casualidad.

Por eso la ciencia usa **experimentos controlados**: cambiar solo una cosa y comparar con un grupo donde no cambia.`,
 key:"Que dos cosas vayan juntas no prueba que una cause la otra."},

{id:"s-02", m:"cien", t:"read", title:"Placebo y doble ciego",
 body:`Si das una pastilla de azúcar a alguien convencido de que es un medicamento, a menudo **se siente mejor**. Es el **efecto placebo**, y es real: las expectativas influyen en el dolor, el cansancio o el ánimo.

Por eso, para saber si un medicamento funciona, se compara con un placebo en un ensayo de **doble ciego**: ni el paciente ni el médico saben quién toma qué. Así ni las expectativas del paciente ni las del médico (sin querer, se trata distinto a quien crees que mejorará) contaminan el resultado.`,
 key:"Doble ciego: ni paciente ni médico saben quién toma el placebo."},

{id:"s-03", m:"cien", t:"quiz",
 q:"Según el filósofo Karl Popper, ¿cuál de estas afirmaciones es científica?",
 opts:["Todo ocurre por una razón","Todos los cisnes son blancos","El universo tiene un propósito","Las cosas buenas les pasan a las buenas personas"], a:1,
 exp:`Para Popper, una afirmación es científica si se puede **refutar**: si es posible imaginar una observación que la desmienta. «Todos los cisnes son blancos» lo es, y de hecho cayó: en 1697 unos exploradores neerlandeses vieron cisnes negros en Australia. Las demás no se pueden desmentir con ningún dato, así que quedan fuera de la ciencia.`},

{id:"c-08", m:"cien", t:"read", title:"Por qué el cielo es azul",
 body:`La luz del Sol lleva todos los colores. Al cruzar la atmósfera, las moléculas del aire dispersan mucho más la luz de onda corta (azul) que la de onda larga (roja): varias veces más. Ese azul rebota por todo el cielo y nos llega desde todas las direcciones.

Al atardecer la luz atraviesa mucha más atmósfera: el azul se dispersa por el camino y nos llegan sobre todo el rojo y el naranja.

¿Por qué no es violeta? La luz solar trae menos violeta, parte se absorbe arriba y nuestros ojos lo captan peor.`,
 key:"El aire dispersa más el azul; al atardecer, el azul se pierde por el camino."},

{id:"c-01", m:"cien", t:"quiz",
 q:"¿Qué significa «láser»?",
 opts:["Amplificación de luz por emisión estimulada de radiación",
       "Lente avanzada de sincronización de energía radiante",
       "Línea activa de señal electromagnética reflejada",
       "Nada: es un nombre comercial"], a:0,
 exp:`Es un acrónimo inglés: *Light Amplification by Stimulated Emission of Radiation*. Einstein describió la emisión estimulada en 1917, pero el primer láser no llegó hasta 1960: Theodore Maiman lo construyó con un cristal de rubí. Al principio lo llamaban en broma «una solución en busca de un problema». Hoy mide, corta, opera ojos y lee códigos.`},

{id:"c-15", m:"cien", t:"quiz",
 q:"¿Cuánto tarda la luz del Sol en llegar a la Tierra?",
 opts:["8 segundos","8 minutos","8 horas","Es instantánea"], a:1,
 exp:`Unos **8 minutos y 20 segundos**: el Sol está a unos 150 millones de km y la luz viaja a casi 300.000 km/s. Si el Sol desapareciera, seguiríamos viéndolo y girando a su alrededor durante esos 8 minutos.`},

{id:"c-06", m:"cien", t:"read", title:"El GPS necesita a Einstein",
 body:`Los satélites GPS llevan relojes atómicos, y por la relatividad no marchan al mismo ritmo que los de la superficie:
- Se mueven muy rápido, así que su tiempo va **más lento**: unos 7 microsegundos al día.
- Están más lejos de la gravedad terrestre, así que su tiempo va **más rápido**: unos 45 microsegundos al día.

En total se adelantan **unos 38 microsegundos al día**. Parece nada, pero sin corregirlo el GPS acumularía errores de **unos 10 km cada día**. Por eso los relojes se ajustan antes del lanzamiento.`,
 key:"Sin corregir la relatividad, el GPS se desviaría unos 10 km cada día."},

{id:"c-18", m:"cien", t:"read", title:"El agua que flota",
 body:`Casi todas las sustancias son más densas en sólido que en líquido. El agua no: al congelarse se expande alrededor de un 9%, porque sus moléculas se ordenan en una red con huecos.

Por eso el hielo flota. Y por eso los lagos se congelan de arriba abajo: la capa de hielo aísla el agua de debajo y la vida sobrevive al invierno. Si el hielo se hundiera, muchos lagos se congelarían enteros.

También es la razón de que revienten tuberías y botellas en el congelador.`,
 key:"El hielo flota porque el agua se expande al congelarse."},

{id:"c-24", m:"cien", t:"quiz",
 q:"Verdadero o falso: los aviones vuelan porque el aire de encima del ala tiene que llegar al final a la vez que el de abajo, y por eso va más rápido.",
 opts:["Verdadero","Falso"], a:1,
 exp:`Es un mito muy extendido. No hay ningún motivo para que lleguen a la vez; de hecho, el aire de arriba llega **antes**. El ala sustenta porque desvía aire hacia abajo y crea una diferencia de presión: menos arriba y más abajo. Hablar de presiones o de aire desviado son dos formas de describir lo mismo.`},

{id:"c-30", m:"cien", t:"read", title:"Plátanos radiactivos",
 body:`Los plátanos tienen potasio, y una pequeñísima parte del potasio natural es **potasio-40**, que es radiactivo. Así que sí: un plátano es ligeramente radiactivo.

Tanto que se usa en broma como unidad: la «dosis equivalente a un plátano». Una radiografía de tórax o un vuelo largo equivalen a cientos de plátanos. Y tú también eres radiactivo: tu cuerpo lleva potasio-40 y carbono-14.

No hay ningún peligro: la dosis es minúscula.`,
 key:"Todo lo vivo es un poco radiactivo, y no pasa nada."},

/* ========== PSICOLOGÍA ========== */

{id:"c-25", m:"mente", t:"read", title:"Pensar rápido, pensar despacio",
 body:`Daniel Kahneman (Nobel de Economía en 2002) popularizó la idea de dos «sistemas»:
- **Sistema 1**: rápido, automático e intuitivo. Reconoce caras y completa «pan con…».
- **Sistema 2**: lento, costoso y lógico. Calcula 17 × 24.

Prueba: un bate y una pelota cuestan 1,10 € en total. El bate cuesta 1 € más que la pelota. ¿Cuánto cuesta la pelota?

El Sistema 1 grita «10 céntimos». La respuesta es **5 céntimos** (bate 1,05 + pelota 0,05).`,
 key:"La intuición es rápida; comprobar cuesta, pero a veces hace falta."},

{id:"m-01", m:"mente", t:"read", title:"Perder duele más que ganar",
 body:`Daniel Kahneman y Amos Tversky (teoría de las perspectivas, 1979) mostraron que **perder algo duele aproximadamente el doble** de lo que alegra ganar lo mismo.

Por eso la mayoría rechaza esta apuesta: cara ganas 150 €, cruz pierdes 100 €. Matemáticamente es favorable, pero el miedo a perder 100 pesa más.

Se llama **aversión a la pérdida**. Explica por qué nos cuesta vender una acción que ha bajado, por qué «evita perder 50 €» motiva más que «ahorra 50 €», o por qué nos aferramos a lo que ya tenemos.`,
 key:"Una pérdida pesa más o menos el doble que una ganancia del mismo tamaño."},

{id:"m-02", m:"mente", t:"read", title:"El poder del primer número",
 body:`En un experimento clásico (Tversky y Kahneman, 1974), hacían girar una ruleta trucada que caía en 10 o en 65. Después preguntaban qué porcentaje de países africanos había en la ONU.

Quienes habían visto el 10 respondían de media un 25%. Quienes habían visto el 65, un 45%. Un número **sin ninguna relación** con la pregunta movía la respuesta.

Es el **efecto anclaje**: el primer número que aparece condiciona todos los demás. Por eso importa tanto quién dice el primer precio en una negociación.`,
 key:"El primer número que oyes arrastra tus estimaciones, aunque no tenga nada que ver."},

{id:"m-03", m:"mente", t:"quiz",
 q:"Te dicen que la serie 2-4-6 cumple una regla secreta y puedes probar otras series para descubrirla. ¿Cuál te da más información?",
 opts:["8-10-12","20-22-24","3-2-1","100-200-300"], a:2,
 exp:`La regla del experimento de Peter Wason (1960) era simplemente «números en orden creciente». Casi todo el mundo prueba series que **confirman** su idea («de dos en dos») y se convence de ella. 3-2-1 es la única que podría **desmentirla**. Buscar solo lo que confirma lo que ya crees es el **sesgo de confirmación**.`},

{id:"c-03", m:"mente", t:"read", title:"La curva del olvido",
 body:`En 1885, Hermann Ebbinghaus memorizó listas de sílabas sin sentido y midió cuánto olvidaba. El olvido es brutal al principio: en un día puedes perder buena parte de lo aprendido si no lo repasas.

Pero cada repaso **aplana la curva**: olvidas más despacio. Por eso funciona la **repetición espaciada**: repasar justo cuando empiezas a olvidar (al día siguiente, a los pocos días, a la semana…).

Esta app lo hace: lo que fallas vuelve pronto; lo que aciertas, cada vez más tarde.`,
 key:"Repasar cuando empiezas a olvidar fija el recuerdo mucho más que repasar seguido."},

{id:"c-19", m:"mente", t:"read", title:"Dormir para recordar",
 body:`Mientras duermes, el cerebro **reactiva y consolida** lo que aprendiste durante el día: pasa los recuerdos de un almacén temporal (el hipocampo) a otro más estable (la corteza).

En los experimentos, la gente recuerda mejor lo aprendido si duerme después que si pasa las mismas horas despierta.

Consecuencia práctica: estudiar hasta tarde la víspera y dormir poco es la peor combinación posible. Repasa y duerme bien.`,
 key:"Lo que aprendes hoy se fija esta noche."},

{id:"c-31", m:"mente", t:"read", title:"El coste de cambiar de tarea",
 body:`Creemos que hacemos varias cosas a la vez, pero el cerebro **alterna** entre ellas, y cada cambio cuesta: hay que volver a cargar el contexto de la tarea. Los estudios muestran que alternar hace las tareas más lentas y con más errores que hacerlas una detrás de otra.

Por eso una notificación cada pocos minutos destroza la concentración, aunque cada interrupción sea corta.

Truco: bloques de tiempo con el móvil fuera de la vista.`,
 key:"La multitarea es alternar, y cada cambio cuesta."},

{id:"c-14", m:"mente", t:"read", title:"El efecto IKEA",
 body:`En un estudio publicado en 2012, Michael Norton, Daniel Mochon y Dan Ariely vieron que la gente valoraba más los muebles de IKEA que montaba ella misma que esos mismos muebles ya montados. Estaban dispuestos a pagar más por lo que habían construido, aunque hubiera quedado peor.

Valoramos más lo que hemos ayudado a crear. Pasa con muebles, con recetas y con ideas: una conclusión a la que llegas tú pesa más que una que te dan hecha.`,
 key:"Lo que construimos nosotros nos parece más valioso."},

{id:"c-05", m:"mente", t:"quiz",
 q:"¿Cuántas personas tiene que haber en una sala para que la probabilidad de que dos cumplan años el mismo día supere el 50%?",
 opts:["23","57","183","366"], a:0,
 exp:`Solo **23**. Con 57, la probabilidad supera el 99%. Nos parece imposible porque pensamos «¿alguien cumple el mismo día que yo?», pero la pregunta es sobre **cualquier pareja**, y con 23 personas hay 253 parejas posibles. Es la paradoja del cumpleaños.`},

{id:"c-10", m:"mente", t:"quiz",
 q:"Hay 3 puertas y detrás de una hay un coche. Eliges la 1. El presentador, que sabe dónde está, abre la 3: hay una cabra. ¿Te conviene cambiar a la 2?",
 opts:["Sí: cambiando ganas 2 de cada 3 veces","Da igual: es 50/50","No: mejor quedarte con la tuya"], a:0,
 exp:`Al elegir, tu puerta tenía 1/3 de probabilidad, y las otras dos juntas, 2/3. El presentador no abre al azar: siempre te enseña una cabra. Esa información concentra los 2/3 en la puerta que queda. Es el problema de Monty Hall, y hasta matemáticos famosos se equivocaron con él.`},

/* ========== ECONOMÍA ========== */

{id:"e-01", m:"eco", t:"read", title:"El coste de oportunidad",
 body:`Todo lo que eliges tiene un coste escondido: **lo mejor que dejas de hacer**.

Estudiar un máster de dos años no cuesta solo la matrícula. Cuesta también los dos años de sueldo que no cobras. Una tarde de sofá cuesta lo que habrías hecho con esa tarde.

Los economistas lo llaman **coste de oportunidad**, y es quizá la idea más útil de toda la economía: el precio real de algo no es lo que pagas, sino aquello a lo que renuncias.`,
 key:"El coste real de algo es lo mejor a lo que renuncias por elegirlo."},

{id:"e-02", m:"eco", t:"quiz",
 q:"Te ofrecen 2 horas extra a 15 €/h, pero prefieres ir al cine (entrada de 10 €). ¿Cuál es el coste real de ir al cine?",
 opts:["10 €","30 €","40 €","25 €"], a:2,
 exp:`10 € de la entrada **más** los 30 € que dejas de ganar: **40 €**. No significa que ir al cine sea mala idea; significa que, si lo eliges, lo eliges sabiendo lo que cuesta de verdad.`},

{id:"c-07", m:"eco", t:"read", title:"La falacia del coste hundido",
 body:`Has pagado la entrada del cine, la película es mala y te quedas «para no tirar el dinero». Pero el dinero ya está gastado: quedarte solo añade una hora perdida.

Es la **falacia del coste hundido**: seguir con algo por lo que ya invertiste, no por lo que te queda por ganar. También se llama «falacia del Concorde»: Francia y Reino Unido siguieron financiando el avión supersónico durante años, aunque ya se veía que no sería rentable.

Pregunta útil: «Si empezara hoy desde cero, ¿lo elegiría?».`,
 key:"Decide por lo que viene, no por lo que ya gastaste."},

{id:"e-03", m:"eco", t:"read", title:"La ventaja comparativa",
 body:`En 1817, David Ricardo explicó algo que sigue sorprendiendo: **dos países ganan comerciando aunque uno sea mejor en todo**.

La clave no es quién hace algo mejor (ventaja absoluta), sino a quién le cuesta **menos renunciar** a otras cosas para hacerlo (ventaja comparativa).

Ejemplo cotidiano: una abogada escribe a máquina más rápido que su asistente. Aun así le conviene delegar, porque cada hora que escribe es una hora que no cobra como abogada. Cada uno se especializa en lo que tiene menor coste de oportunidad, y producen más entre los dos.`,
 key:"Conviene especializarse en lo que te cuesta menos dejar de hacer, no en lo que haces mejor."},

{id:"e-04", m:"eco", t:"quiz",
 q:"En una hora, Ana hace 10 panes o 5 camisas. Luis hace 2 panes o 4 camisas. Ana es mejor en las dos cosas. ¿Quién debería hacer las camisas?",
 opts:["Ana, porque las hace más rápido","Luis","Los dos, a medias","Da igual"], a:1,
 exp:`Cada camisa le cuesta a Ana 2 panes (10 ÷ 5) y a Luis solo medio pan (2 ÷ 4). Luis tiene la **ventaja comparativa** en camisas y Ana en pan. Si cada uno se especializa e intercambian, entre los dos tienen más pan y más camisas que si cada uno lo hace todo.`},

{id:"e-05", m:"eco", t:"read", title:"Qué es la inflación",
 body:`La **inflación** es la subida general y continuada de los precios. En España la mide el INE con el **IPC**: el precio de una «cesta» de cosas que compra un hogar típico (comida, energía, alquiler, transporte…).

Con un 3% de inflación, lo que hoy cuesta 100 € costará 103 € dentro de un año. Tu dinero parado compra cada vez menos.

El Banco Central Europeo intenta que ronde el **2% anual**: algo de inflación estable se considera sano; mucha, o muy imprevisible, destroza ahorros y planes. Sube cuando la gente quiere comprar más de lo que se produce, o cuando se encarece algo que lo encarece todo, como la energía.`,
 key:"Inflación = tu dinero compra un poco menos cada año."},

{id:"c-13", m:"eco", t:"read", title:"La regla del 72",
 body:`¿Cuánto tarda en duplicarse una inversión? Divide **72 entre el interés anual**:
- Al 6% → 72 ÷ 6 = **12 años**.
- Al 8% → **9 años**.

También funciona con la inflación: con un 3% anual, los precios se duplican en unos **24 años**, así que el dinero parado vale la mitad.

Es una aproximación del interés compuesto que funciona muy bien entre el 4% y el 12%, más o menos.`,
 key:"72 ÷ interés = años que tarda en duplicarse."},

{id:"e-06", m:"eco", t:"quiz",
 q:"Si el precio del café se dispara, ¿qué suele pasar con la demanda de té?",
 opts:["Baja","Sube","No cambia"], a:1,
 exp:`Café y té son **bienes sustitutivos**: cuando uno se encarece, parte de la gente se pasa al otro. Lo contrario pasa con los **complementarios**: si suben las impresoras, se venden menos cartuchos.`},

{id:"e-07", m:"eco", t:"read", title:"La tragedia de los comunes",
 body:`En 1968, el ecólogo Garrett Hardin describió un pasto común donde cada pastor gana metiendo una oveja más, pero el daño de sobreexplotar el pasto se reparte entre todos. Resultado: cada uno actúa con lógica… y el pasto se arruina.

Pasa con los caladeros de pesca, los acuíferos o la limpieza de un piso compartido.

Elinor Ostrom ganó el Nobel de Economía en 2009 por demostrar que no es inevitable: muchas comunidades gestionan bien sus recursos comunes con normas claras, vigilancia y sanciones decididas por ellas mismas.`,
 key:"Lo que es de todos tiende a sobreexplotarse, salvo que haya buenas reglas compartidas."},

{id:"c-22", m:"eco", t:"read", title:"La ley de Goodhart",
 body:`«Cuando una medida se convierte en objetivo, deja de ser una buena medida.»

Un ejemplo clásico, quizá inventado: a una fábrica soviética de clavos le fijaron el objetivo en toneladas, y fabricó unos pocos clavos gigantes. Cuando el objetivo pasó a ser el número de clavos, fabricó millones de clavos minúsculos e inútiles.

Pasa en empresas, colegios y apps: si solo cuentas llamadas, tendrás muchas llamadas cortas e inútiles.`,
 key:"Si persigues el número, el número deja de significar algo."},

{id:"c-27", m:"eco", t:"quiz",
 q:"Cuando las máquinas de vapor se hicieron más eficientes y gastaban menos carbón para el mismo trabajo, ¿qué pasó con el consumo total de carbón en Inglaterra?",
 opts:["Bajó mucho","Se mantuvo","Subió"], a:2,
 exp:`**Subió.** Al salir más barato usar carbón, se usó para muchas más cosas. William Stanley Jevons lo describió en 1865: es la paradoja de Jevons. Pasa también con la energía, la memoria de los ordenadores o los datos móviles: la eficiencia abarata y dispara el uso.`},

/* ========== HISTORIA ========== */

{id:"c-02", m:"hist", t:"quiz",
 q:"¿Quién vivió más cerca en el tiempo de la llegada a la Luna (1969) que de la construcción de la Gran Pirámide de Guiza?",
 opts:["Cleopatra","Tutankamón","Ramsés II","Ninguno de ellos"], a:0,
 exp:`La Gran Pirámide se terminó hacia el 2560 a. C. Cleopatra murió en el 30 a. C.: unos 2.500 años después de la pirámide y unos 2.000 años antes del Apolo 11. El antiguo Egipto duró tanto que, para Cleopatra, las pirámides ya eran antigüedades.`},

{id:"h-01", m:"hist", t:"read", title:"La imprenta de Gutenberg",
 body:`Hacia 1450, en Maguncia (Alemania), Johannes Gutenberg combinó tipos móviles de metal, una prensa adaptada de las de vino y una tinta de base oleosa. Su Biblia, de hacia 1455, fue el primer gran libro impreso en Europa.

Antes, un libro se copiaba a mano durante meses. En apenas 50 años se imprimieron millones de ejemplares por toda Europa.

Las consecuencias fueron enormes: las ideas viajaban más rápido que la censura. La Reforma de Lutero (1517) se extendió en gran parte gracias a panfletos impresos.`,
 key:"Abaratar copiar ideas cambió la religión, la ciencia y la política."},

{id:"c-16", m:"hist", t:"read", title:"Semmelweis y el lavado de manos",
 body:`En 1847, en Viena, el médico Ignaz Semmelweis vio que en la sala atendida por médicos morían muchas más madres por fiebre puerperal que en la atendida por comadronas. Los médicos venían de hacer autopsias.

Impuso lavarse las manos con una solución de cloro y la mortalidad se desplomó. Pero sus colegas lo rechazaron: la idea de que los médicos causaban muertes les ofendía y aún no se conocían los gérmenes. Murió en 1865 en un manicomio. Años después, Pasteur y Lister le dieron la razón.`,
 key:"Tener razón no basta: también hay que conseguir que te escuchen."},

{id:"c-09", m:"hist", t:"read", title:"El reloj que resolvió el mar",
 body:`En el siglo XVIII los barcos sabían su latitud por el Sol, pero no su **longitud**: a cuánto estaban al este o al oeste. Hubo naufragios terribles por eso.

La clave era el tiempo: si sabes la hora exacta de tu puerto de salida y la comparas con el mediodía donde estás, cada hora de diferencia son 15° de longitud. Pero los relojes de péndulo no funcionaban en un barco que se balancea.

John Harrison, un carpintero sin estudios académicos, pasó décadas construyendo relojes marinos. Su H4, probado en 1761, funcionó con una precisión asombrosa para la época.`,
 key:"Medir el tiempo con precisión fue la forma de medir el espacio."},

{id:"h-02", m:"hist", t:"read", title:"La peste negra subió los sueldos",
 body:`Entre 1347 y 1351, la peste negra mató a entre un tercio y la mitad de la población europea.

Una consecuencia inesperada: faltaban brazos para trabajar el campo, y los supervivientes pudieron **exigir sueldos más altos**. En Inglaterra, el rey intentó congelarlos por ley en 1351, sin mucho éxito. En Europa occidental la servidumbre se fue debilitando.

Es oferta y demanda en estado puro: cuando algo escasea (en este caso, trabajadores), su precio sube.`,
 key:"La escasez de trabajadores tras la peste dio poder a los que sobrevivieron."},

{id:"c-29", m:"hist", t:"quiz",
 q:"¿Quién descubrió la penicilina, y además por casualidad?",
 opts:["Louis Pasteur","Alexander Fleming","Marie Curie","Robert Koch"], a:1,
 exp:`**Alexander Fleming**, en 1928: al volver de vacaciones vio que un moho había contaminado una placa y había matado las bacterias a su alrededor. Pero no logró producirla en cantidad. Howard Florey y Ernst Chain la convirtieron en medicamento en los años 40, y los tres compartieron el Nobel en 1945.`},

{id:"c-26", m:"hist", t:"read", title:"El mecanismo de Anticitera",
 body:`En 1901, unos buceadores sacaron de un naufragio griego, cerca de la isla de Anticitera, un bloque de bronce corroído. Décadas de estudio, incluidos escáneres de rayos X, revelaron un mecanismo con decenas de engranajes construido hace más de 2.000 años.

Servía para predecir la posición del Sol y la Luna, las fases lunares y los eclipses. Es el «ordenador analógico» más antiguo que se conoce. No se conoce nada de complejidad parecida hasta los relojes astronómicos medievales, más de mil años después.`,
 key:"Una calculadora astronómica de engranajes, hace más de 2.000 años."},

{id:"c-17", m:"hist", t:"quiz",
 q:"En el mapa de Mercator (el de siempre), Groenlandia parece casi tan grande como África. ¿Cuántas veces más grande es África en realidad?",
 opts:["Son iguales","2 veces","5 veces","14 veces"], a:3,
 exp:`África tiene unos 30 millones de km² y Groenlandia, unos 2,2 millones: unas **14 veces** menos. El mapa de Mercator conserva los ángulos (genial para navegar), pero agranda las zonas cercanas a los polos.`},

{id:"c-21", m:"hist", t:"quiz",
 q:"¿Qué palabra española viene del árabe y significaba originalmente «si Dios quiere»?",
 opts:["Ojalá","Albóndiga","Azúcar","Alcalde"], a:0,
 exp:`**Ojalá** viene del árabe hispánico *law šá lláh*, «si Dios quiere». El español tiene miles de arabismos: almohada, aceite, azúcar, albóndiga, alcalde, ajedrez, hasta… Muchos empiezan por *al-*, el artículo árabe.`}
]
};
