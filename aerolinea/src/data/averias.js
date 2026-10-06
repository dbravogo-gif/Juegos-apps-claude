// Catálogo de averías.
//
// Cada avería avanza de 0 a 1 con el uso (horas, ciclos o días). Por encima de `limite` está
// fuera de los límites del fabricante y puede fallar; al llegar a 1 falla seguro. El jugador no
// ve el progreso: solo síntomas, hallazgos de inspección y diagnósticos.
//
//   comp        motor | celula | tren | hidraulica | presurizacion | avionica
//   sintoma     lo que la tripulación nota a partir de `umbrales.sintoma` ({n} = número de motor)
//   metodo      inspección dirigida que la detecta a partir de `umbrales.inspeccion`
//   umbrales    sintoma, inspeccion, C (revisión C), D (revisión estructural), limite
//   importante  necesita doble comprobación: anomalía y después diagnóstico
//   vida        [mín, máx] de uso hasta el fallo, en la unidad de `por`
//   por         horas | ciclos | dias
//   fallo       evento que provoca en vuelo (ver riesgo.js)
//   mel         categoría MEL si se puede diferir una vez confirmada (B = 3 días, C = 10 días)
//   reparacion  rg (revisión general del motor) | { horas, coste } (coste en fracción del precio del avión)
//   solo        limitar a turbohélices, reactores o un tipo concreto
//
// Los textos y la lógica (síntoma → inspección → diagnóstico) siguen la práctica de
// mantenimiento real; las cifras son aproximaciones de juego.

export const METODOS = {
  visual: { nombre: 'Inspección visual detallada', horas: 2, coste: 800 },
  boroscopia: { nombre: 'Boroscopia del motor', horas: 4, coste: 3000 },
  aceite: { nombre: 'Análisis espectrométrico del aceite', horas: 1, coste: 600 },
  funcional: { nombre: 'Prueba funcional en tierra', horas: 3, coste: 1500 },
  ndt: { nombre: 'Inspección estructural no destructiva', horas: 16, coste: 25000 },
  taller: { nombre: 'Taller de motores', horas: 0, coste: 0 },
};

// Diagnóstico (segunda comprobación) para los problemas importantes.
export const DIAGNOSTICO = {
  motor: { nombre: 'Diagnóstico del motor con el fabricante', horas: 10, coste: 12000 },
  celula: { nombre: 'Evaluación estructural detallada', horas: 24, coste: 30000 },
  sistema: { nombre: 'Prueba del componente en banco', horas: 8, coste: 4000 },
};

export const AVERIAS = {
  egt: {
    comp: 'motor', nombre: 'Daño en los álabes de la turbina',
    sintoma: 'Temperatura de gases de escape (EGT) alta en el motor {n}',
    metodo: 'boroscopia', hallazgo: 'La boroscopia muestra daños en los álabes de la turbina de alta presión del motor {n}',
    umbrales: { sintoma: 0.45, inspeccion: 0.25, C: 0.25, D: 0.25, limite: 0.6 },
    importante: true, vida: [1500, 4000], por: 'horas', fallo: 'apagado', reparacion: 'rg', peso: 0.3,
  },
  rodamiento: {
    comp: 'motor', nombre: 'Desgaste de un rodamiento principal',
    sintoma: 'Partículas metálicas en el detector de virutas del motor {n}',
    metodo: 'aceite', hallazgo: 'El análisis del aceite del motor {n} indica desgaste de un rodamiento',
    umbrales: { sintoma: 0.55, inspeccion: 0.35, C: 0.35, D: 0.35, limite: 0.6 },
    importante: true, vida: [400, 1500], por: 'horas', fallo: 'apagado', reparacion: 'rg', peso: 0.12,
  },
  sellos: {
    comp: 'motor', nombre: 'Sellos de aceite gastados',
    sintoma: 'Consumo de aceite alto en el motor {n}',
    metodo: 'visual', hallazgo: 'Fuga de aceite por los sellos del motor {n}',
    umbrales: { sintoma: 0.35, inspeccion: 0.35, C: 0.2, D: 0.2, limite: 0.7 },
    importante: false, vida: [800, 2500], por: 'horas', fallo: 'apagado', reparacion: { horas: 12, coste: 0.004 }, peso: 0.3,
  },
  combustible: {
    comp: 'motor', nombre: 'Fuga en el circuito de combustible del motor',
    sintoma: 'Restos de combustible en la góndola del motor {n}',
    metodo: 'visual', hallazgo: 'Fuga en una conducción de combustible del motor {n}',
    umbrales: { sintoma: 0.4, inspeccion: 0.4, C: 0.2, D: 0.2, limite: 0.5 },
    importante: false, vida: [300, 1500], por: 'horas', fallo: 'incendio', reparacion: { horas: 8, coste: 0.002 }, peso: 0.15,
  },
  disco: {
    comp: 'motor', nombre: 'Grieta en un disco de la turbina',
    sintoma: null,
    metodo: 'taller', hallazgo: 'Grieta en un disco de la turbina del motor {n}',
    umbrales: { sintoma: 2, inspeccion: 0.3, C: 2, D: 2, limite: 0.3 },
    importante: true, vida: [4000, 12000], por: 'ciclos', fallo: 'noContenido', reparacion: 'rg', peso: 0.01,
  },
  reductora: {
    comp: 'motor', solo: 'helice', nombre: 'Desgaste en la caja reductora de la hélice',
    sintoma: 'Vibración en el motor {n}',
    metodo: 'aceite', hallazgo: 'El aceite de la reductora del motor {n} trae partículas de desgaste',
    umbrales: { sintoma: 0.45, inspeccion: 0.35, C: 0.35, D: 0.35, limite: 0.6 },
    importante: true, vida: [800, 2500], por: 'horas', fallo: 'apagado', reparacion: 'rg', peso: 0.25,
  },
  corrosion: {
    comp: 'celula', nombre: 'Corrosión en la estructura',
    sintoma: null,
    metodo: 'visual', hallazgo: 'Corrosión visible en la unión del ala con el fuselaje',
    umbrales: { sintoma: 2, inspeccion: 0.5, C: 0.25, D: 0.1, limite: 0.6 },
    importante: true, vida: [1500, 4000], por: 'dias', fallo: 'estructuraSuelo', reparacion: { horas: 160, coste: 0.03 },
  },
  fatiga: {
    comp: 'celula', nombre: 'Grietas por fatiga en la estructura',
    sintoma: null,
    metodo: 'ndt', hallazgo: 'Indicaciones de grietas por fatiga junto a una puerta',
    umbrales: { sintoma: 2, inspeccion: 0.3, C: 0.5, D: 0.25, limite: 0.4 },
    importante: true, vida: [8000, 25000], por: 'ciclos', fallo: 'estructuraVuelo', reparacion: { horas: 240, coste: 0.04 },
  },
  frenos: {
    comp: 'tren', nombre: 'Frenos desgastados',
    sintoma: 'Frenada irregular al aterrizar',
    metodo: 'visual', hallazgo: 'Discos de freno por debajo del espesor mínimo',
    umbrales: { sintoma: 0.7, inspeccion: 0.5, C: 0.3, D: 0.3, limite: 0.8 },
    importante: false, vida: [600, 1500], por: 'ciclos', fallo: 'frenada', reparacion: { horas: 4, coste: 0.0004 },
  },
  amortiguador: {
    comp: 'tren', nombre: 'Fuga en un amortiguador del tren principal',
    sintoma: 'Restos de fluido hidráulico en el pozo del tren',
    metodo: 'visual', hallazgo: 'Fuga en el amortiguador del tren principal izquierdo',
    umbrales: { sintoma: 0.4, inspeccion: 0.4, C: 0.25, D: 0.25, limite: 0.6 },
    importante: false, vida: [500, 2000], por: 'ciclos', fallo: 'tren', reparacion: { horas: 12, coste: 0.002 },
  },
  bomba: {
    comp: 'hidraulica', nombre: 'Bomba hidráulica degradada',
    sintoma: 'Presión hidráulica fluctuante',
    metodo: 'funcional', hallazgo: 'La bomba del sistema hidráulico principal no da la presión nominal',
    umbrales: { sintoma: 0.4, inspeccion: 0.3, C: 0.3, D: 0.3, limite: 0.7 },
    importante: true, vida: [500, 2000], por: 'horas', fallo: 'hidraulico', mel: 'C', reparacion: { horas: 8, coste: 0.003 },
  },
  presurizacion: {
    comp: 'presurizacion', nombre: 'Válvula de presurización defectuosa',
    sintoma: 'Altitud de cabina inestable en crucero',
    metodo: 'funcional', hallazgo: 'La válvula de salida de presurización responde con retraso',
    umbrales: { sintoma: 0.4, inspeccion: 0.3, C: 0.3, D: 0.3, limite: 0.7 },
    importante: false, vida: [500, 2000], por: 'horas', fallo: 'presurizacion', mel: 'B', reparacion: { horas: 6, coste: 0.001 },
  },
  neumatico: {
    comp: 'tren', solo: 'concorde', nombre: 'Daño en un neumático del tren principal',
    sintoma: null,
    metodo: 'visual', hallazgo: 'Corte profundo en un neumático del tren principal',
    umbrales: { sintoma: 2, inspeccion: 0.5, C: 0.3, D: 0.3, limite: 0.6 },
    importante: false, vida: [200, 600], por: 'ciclos', fallo: 'reventon', reparacion: { horas: 3, coste: 0.0002 },
  },
};

// Equipos que se averían de golpe: la tripulación lo anota y se decide reparar o diferir.
export const EQUIPOS_INOP = {
  radar: { nombre: 'Radar meteorológico averiado', mel: 'C', reparacion: { horas: 6, coste: 0.001 }, tasa: 0.00012 },
  gpws: { nombre: 'GPWS inoperativo', mel: 'B', reparacion: { horas: 4, coste: 0.0008 }, tasa: 0.0001 },
};

// Indicios que acaban siendo un sensor estropeado.
export const FALSAS_ALARMAS = [
  { sintoma: 'Vibración en el motor {n}', metodo: 'boroscopia', solucion: 'el captador de vibración estaba averiado y se sustituye' },
  { sintoma: 'Temperatura de gases de escape (EGT) alta en el motor {n}', metodo: 'boroscopia', solucion: 'un termopar daba lecturas falsas y se cambia' },
  { sintoma: 'Presión hidráulica fluctuante', metodo: 'funcional', solucion: 'el transmisor de presión estaba averiado' },
];

export const DIAS_MEL = { B: 3, C: 10 };
