// Investigación de accidentes: causa probable, 1–3 factores contribuyentes y
// responsabilidad de la compañía. Corta, pero ligada a lo que pasó en la partida.

import { AVERIAS } from '../data/averias.js';
import { TIPOS } from '../data/aviones.js';
import { factoresAgravantes } from './riesgo.js';
import { textoClima } from './clima.js';

const CAUSAS = {
  apagadoDespegue: (c) => `Pérdida de control tras el fallo del motor ${c.motor ?? ''} durante el despegue en ${c.origen.id}`,
  apagadoCrucero: () => 'Pérdida de control tras el fallo de un motor en vuelo',
  apagadoAproximacion: (c) => `Impacto durante la aproximación a ${c.destino.id} con un motor parado`,
  apagadoSinAviso: () => 'Pérdida de control tras un fallo de motor sin aviso previo',
  noContenido: (c) => `Fallo no contenido del motor ${c.motor ?? ''}: los fragmentos dañaron sistemas vitales`,
  incendio: (c) => `Incendio en el motor ${c.motor ?? ''} que la tripulación no pudo controlar`,
  estructura: () => 'Fallo estructural en vuelo por grietas de fatiga',
  hidraulico: (c) => `Salida de pista en ${c.destino.id} tras perder un sistema hidráulico`,
  tren: (c) => `Colapso del tren de aterrizaje en ${c.destino.id} e incendio posterior`,
  presurizacion: () => 'Pérdida de presurización en crucero',
  reventon: (c) => `Reventón de un neumático en el despegue de ${c.origen.id}: los fragmentos perforaron un depósito y provocaron un incendio`,
  ave: () => 'Impacto con aves en el despegue',
  bajoMinimos: (c, e) => (e.variante === 'viento'
    ? `Salida de pista al intentar aterrizar en ${c.destino.id} con el viento cruzado fuera de los límites del avión`
    : `Impacto contra el terreno al continuar la aproximación a ${c.destino.id} por debajo de los mínimos, con ${textoClima(c.clima.destino).toLowerCase()}`),
  cercaMinimos: (c) => `Impacto contra el terreno en la aproximación a ${c.destino.id} con visibilidad muy reducida`,
  cizalladura: (c) => `Cizalladura en la aproximación a ${c.destino.id} bajo una tormenta`,
  cizalladuraDespegue: (c) => `Cizalladura en el despegue de ${c.origen.id} bajo una tormenta`,
  vientoCruzado: (c) => `Salida de pista con viento cruzado fuerte en ${c.destino.id}`,
  salidaPista: (c) => `Salida de pista a alta velocidad al aterrizar en ${c.destino.id}`,
  turbulencia: () => 'Pérdida de control en turbulencia severa dentro de una tormenta',
  hielo: (c) => `Pérdida de sustentación en el despegue de ${c.origen.id} por hielo en las alas`,
  conflicto: () => 'Colisión en vuelo tras una pérdida de separación con otro tráfico',
  errorTripulacion: (c) => `Impacto contra el terreno en la aproximación a ${c.destino.id} por un error de navegación`,
};

export function causaProbable(ctx, evento) {
  const f = CAUSAS[evento.id] ?? (() => 'Causa sin determinar');
  return f({ ...ctx, motor: evento.motor }, evento);
}

// Factor de mantenimiento: si la avería que lo desencadenó se conocía o no se podía conocer.
function factorMantenimiento(ctx, evento) {
  if (!evento.averia) return null;
  const a = ctx.avion.averias.find((x) => x.id === evento.averia) ?? ctx.averiaCopia;
  if (!a) return null;
  const def = AVERIAS[a.codigo];
  if (a.fase === 'oculta') {
    return { texto: `${def.nombre}: no se había detectado y no era visible con las inspecciones realizadas`, imputable: false };
  }
  if (a.fase === 'indicio') return { texto: `${def.nombre}: había síntomas desde hacía tiempo y no se investigaron`, imputable: true };
  if (a.fase === 'anomalia') return { texto: `${def.nombre}: una inspección la había detectado y no se confirmó ni se reparó`, imputable: true };
  return { texto: `${def.nombre}: estaba confirmada y el avión siguió volando`, imputable: true };
}

export function investigar(ctx, evento) {
  const factores = [];
  const mant = factorMantenimiento(ctx, evento);
  if (mant) factores.push(mant);
  for (const f of factoresAgravantes(ctx, evento)) {
    if (!factores.some((x) => x.texto === f.texto)) factores.push(f);
  }
  // Primero lo imputable a la compañía, que es lo que más pesa en el informe.
  factores.sort((a, b) => Number(b.imputable) - Number(a.imputable));
  const contribuyentes = factores.slice(0, 3);
  const negligencia = factores.some((f) => f.imputable);
  const tecnica = ['noContenido', 'estructura', 'reventon'].includes(evento.id) && !negligencia;
  return {
    causa: causaProbable(ctx, evento),
    factores: contribuyentes.map((f) => f.texto),
    negligencia,
    motivos: factores.filter((f) => f.imputable).map((f) => f.texto),
    directiva: tecnica ? directiva(ctx, evento) : null,
  };
}

// Recomendación de la autoridad cuando la causa es un fallo técnico del tipo de avión: una
// inspección obligatoria en toda la flota de ese tipo.
function directiva(ctx, evento) {
  const tipo = TIPOS[ctx.avion.tipo];
  const que = { noContenido: 'los discos de turbina', estructura: 'la estructura en busca de grietas', reventon: 'los neumáticos y el tren' }[evento.id];
  return { tipo: tipo.id, texto: `La autoridad ordena inspeccionar ${que} de todos los ${tipo.corto} en 30 días.`, dias: 30 };
}
