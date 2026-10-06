// Mantenimiento: desgaste, averías por fases, revisiones, inspecciones y legalidad.
//
// Fases de una avería (lo que sabe el jugador):
//   oculta     nadie sabe nada
//   indicio    la tripulación nota algo (puede ser un sensor estropeado)
//   anomalia   una inspección encuentra algo, sin precisar su gravedad
//   confirmada diagnóstico hecho: dentro o fuera de límites
//   diferida   confirmada y aplazada según la MEL, con fecha tope
//
// Las inspecciones son fiables por umbrales: si el daño ya es detectable con ese método, se
// encuentra; si todavía no lo es, no. No hay dados en las inspecciones.

import { TIPOS, programa } from '../data/aviones.js';
import { MOTORES } from '../data/motores.js';
import { AVERIAS, EQUIPOS_INOP, FALSAS_ALARMAS, METODOS, DIAGNOSTICO, DIAS_MEL } from '../data/averias.js';
import { POR_ID } from '../data/aeropuertos.js';
import { ponderado, elegir, entero } from './azar.js';
import { indice } from './economia.js';
import { costeReparacion, nuevaAveria, averiasPosibles, edad } from './flota.js';
import { esCostero } from './geo.js';
import { MIN_DIA, anio as anioDe } from './tiempo.js';

export const TOLERANCIA = 1.1; // se permite pasarse un 10 % del intervalo antes de ser ilegal

const textoMotor = (texto, averia) => (texto ?? '').replace('{n}', averia.motor ?? '');

export function describir(averia) {
  if (averia.falsa) return averia.sintoma;
  const def = AVERIAS[averia.codigo] ?? EQUIPOS_INOP[averia.codigo];
  if (averia.equipo) return def.nombre;
  switch (averia.fase) {
    case 'indicio': return textoMotor(def.sintoma, averia);
    case 'anomalia': return textoMotor(def.hallazgo, averia);
    default: return textoMotor(def.hallazgo ?? def.nombre, averia);
  }
}

// --- Desgaste y aparición de averías

function existe(avion, codigo, motor) {
  return avion.averias.some((a) => a.codigo === codigo && a.motor === motor);
}

function desgasteMotor(m, motor) {
  const r = m.horasRG / motor.intervalo;
  return 0.5 + 1.5 * r * r;
}

// Avanza el uso del avión. `uso` = { horas, ciclos } tras un vuelo o { dias } al cerrar el día.
export function progresar(estado, avion, uso, r) {
  const eventos = [];
  const tipo = TIPOS[avion.tipo];
  const horas = uso.horas ?? 0;
  const ciclos = uso.ciclos ?? 0;
  const dias = uso.dias ?? 0;

  if (horas) {
    avion.horas += horas;
    avion.horasHoy += horas;
    for (const m of avion.motores) m.horasRG += horas;
    avion.revisiones.A += horas;
    avion.revisiones.C += horas;
    avion.revisiones.D += horas;
  }
  if (ciclos) avion.ciclos += ciclos;

  // Progreso de las averías
  for (const a of avion.averias) {
    if (a.falsa || a.equipo) continue;
    const def = AVERIAS[a.codigo];
    const unidades = def.por === 'horas' ? horas : def.por === 'ciclos' ? ciclos : dias;
    a.progreso += unidades / a.vida;
  }

  // Averías nuevas
  if (horas) {
    const motor = MOTORES[tipo.motor];
    const delMotor = averiasPosibles(tipo).filter((c) => AVERIAS[c].comp === 'motor');
    for (const m of avion.motores) {
      if (r() < horas * 0.00022 * motor.tasaAverias * desgasteMotor(m, motor) * (tipo.repuestos > 1 ? 1.2 : 1)) {
        const codigo = ponderado(r, delMotor.map((c) => [c, AVERIAS[c].peso ?? 0.1]));
        if (!existe(avion, codigo, m.pos)) avion.averias.push(nuevaAveria(estado, r, codigo, { motor: m.pos }));
      }
    }
    for (const [codigo, tasa] of [['bomba', 0.00012], ['presurizacion', 0.0001]]) {
      if (r() < horas * tasa && !existe(avion, codigo, null)) avion.averias.push(nuevaAveria(estado, r, codigo));
    }
    for (const [equipo, def] of Object.entries(EQUIPOS_INOP)) {
      if (avion.equipo[equipo] && !avion.inop[equipo] && r() < horas * def.tasa) {
        avion.inop[equipo] = true;
        avion.averias.push({ id: estado.siguienteId++, codigo: equipo, equipo: true, motor: null, fase: 'confirmada', desde: estado.t, diferidaHasta: null });
        eventos.push({ tipo: 'aviso', texto: `${avion.matricula}: ${def.nombre.toLowerCase()}` });
      }
    }
    if (r() < horas * 0.00006) {
      const falsa = elegir(r, FALSAS_ALARMAS.filter((f) => f.metodo !== 'boroscopia' || tipo.nMotores > 0));
      const n = entero(r, 1, tipo.nMotores);
      avion.averias.push({
        id: estado.siguienteId++, codigo: 'falsa', falsa: true, motor: n, fase: 'indicio', desde: estado.t,
        sintoma: falsa.sintoma.replace('{n}', n), metodo: falsa.metodo, solucion: falsa.solucion,
      });
      eventos.push({ tipo: 'indicio', avion: avion.id, texto: `${avion.matricula}: ${falsa.sintoma.replace('{n}', n).toLowerCase()}` });
    }
  }
  if (ciclos) {
    const edadCiclos = avion.ciclos / 15000;
    const tasas = [['frenos', 0.0016], ['amortiguador', 0.0002], ['fatiga', 0.000004 * edadCiclos * edadCiclos]];
    if (averiasPosibles(tipo).includes('neumatico')) tasas.push(['neumatico', 0.004]);
    for (const [codigo, tasa] of tasas) {
      if (r() < ciclos * tasa && !existe(avion, codigo, null)) avion.averias.push(nuevaAveria(estado, r, codigo));
    }
  }
  if (dias) {
    const base = POR_ID[estado.base];
    const salitre = base && esCostero(base) ? 1.6 : 1;
    const tasa = 0.0003 * (1 + edad(avion, anioDe(estado.t)) / 8) * salitre;
    if (r() < dias * tasa && !existe(avion, 'corrosion', null)) avion.averias.push(nuevaAveria(estado, r, 'corrosion'));
  }

  // Síntomas
  for (const a of avion.averias) {
    if (a.falsa || a.equipo || a.fase !== 'oculta') continue;
    const def = AVERIAS[a.codigo];
    if (def.sintoma && a.progreso >= def.umbrales.sintoma) {
      a.fase = 'indicio';
      a.desde = estado.t;
      eventos.push({ tipo: 'indicio', avion: avion.id, texto: `${avion.matricula}: ${textoMotor(def.sintoma, a).toLowerCase()}` });
    }
    // La corrosión que llega al final aparece en tierra y deja el avión inmovilizado.
    if (def.fallo === 'estructuraSuelo' && a.progreso >= 1) {
      a.fase = 'confirmada';
      a.diagnostico = { fueraDeLimites: true };
      eventos.push({ tipo: 'aviso', grave: true, texto: `${avion.matricula}: corrosión grave descubierta en tierra. No puede volar.` });
    }
  }
  return eventos;
}

// --- Inspecciones

export function costeMetodo(metodo, anio) {
  return METODOS[metodo].coste * indice(anio);
}

// Inspección dirigida a un indicio: usa el método propio de esa avería.
export function inspeccionar(avion, averia, anio) {
  if (averia.falsa) {
    return { resultado: 'falsa', texto: `Sin hallazgos: ${averia.solucion}.`, eliminar: true };
  }
  const def = AVERIAS[averia.codigo];
  if (averia.progreso >= def.umbrales.inspeccion) {
    averia.fase = def.importante ? 'anomalia' : 'confirmada';
    if (!def.importante) averia.diagnostico = { fueraDeLimites: averia.progreso >= def.umbrales.limite };
    return { resultado: averia.fase, texto: textoMotor(def.hallazgo, averia) + '.' };
  }
  averia.revisadaEn = anio;
  return { resultado: 'nada', texto: `${METODOS[def.metodo].nombre}: sin hallazgos concluyentes. Conviene vigilarlo.` };
}

export function metodoDe(averia) {
  if (averia.falsa) return averia.metodo;
  return AVERIAS[averia.codigo]?.metodo;
}

export function tipoDiagnostico(averia) {
  const comp = AVERIAS[averia.codigo].comp;
  return comp === 'motor' ? 'motor' : comp === 'celula' ? 'celula' : 'sistema';
}

// Segunda comprobación de una anomalía: fija si está dentro o fuera de límites.
export function diagnosticar(avion, averia) {
  const def = AVERIAS[averia.codigo];
  averia.fase = 'confirmada';
  const fuera = averia.progreso >= def.umbrales.limite;
  averia.diagnostico = { fueraDeLimites: fuera };
  const tipo = TIPOS[avion.tipo];
  const quedan = Math.max(0, Math.round((def.umbrales.limite - averia.progreso) * averia.vida));
  const unidad = def.por === 'horas' ? 'h de vuelo' : def.por === 'ciclos' ? 'ciclos' : 'días';
  return {
    texto: fuera
      ? `${textoMotor(def.nombre, averia)}: fuera de los límites del fabricante. El avión no puede volar hasta repararlo.`
      : `${textoMotor(def.nombre, averia)}: dentro de límites. Reinspeccionar en unas ${Math.max(10, Math.round(quedan * 0.5))} ${unidad}.`,
    fuera,
    tipo: tipo.corto,
  };
}

// --- Revisiones programadas

export function revisionPendiente(avion) {
  const prog = programa(TIPOS[avion.tipo]);
  return {
    A: avion.revisiones.A / prog.A.horas,
    C: avion.revisiones.C / prog.C.horas,
    D: avion.revisiones.D / prog.D.horas,
  };
}

// Aplica una revisión: encuentra todo lo que ese nivel de revisión puede ver y repara lo que
// cabe dentro de ella. Devuelve el coste de las reparaciones y lo encontrado.
export function aplicarRevision(avion, nivel, anio) {
  const tipo = TIPOS[avion.tipo];
  const hallazgos = [];
  let reparaciones = 0;
  const umbral = (def) => (nivel === 'A' ? (def.metodo === 'visual' ? def.umbrales.inspeccion : 9) : def.umbrales[nivel]);
  for (const a of [...avion.averias]) {
    if (a.falsa) {
      if (nivel !== 'A') avion.averias = avion.averias.filter((x) => x !== a);
      continue;
    }
    if (a.equipo) {
      if (nivel !== 'A') {
        reparaciones += Math.round(precioDe(tipo, anio) * EQUIPOS_INOP[a.codigo].reparacion.coste);
        avion.inop[a.codigo] = false;
        avion.averias = avion.averias.filter((x) => x !== a);
        hallazgos.push(`${EQUIPOS_INOP[a.codigo].nombre}: reparado`);
      }
      continue;
    }
    const def = AVERIAS[a.codigo];
    // Las del motor que piden revisión general no se arreglan en una revisión de célula.
    const detectable = a.progreso >= umbral(def);
    if (!detectable) continue;
    if (def.reparacion === 'rg') {
      a.fase = 'confirmada';
      a.diagnostico = { fueraDeLimites: a.progreso >= def.umbrales.limite };
      hallazgos.push(`${textoMotor(def.nombre, a)}: necesita revisión general del motor ${a.motor}`);
      continue;
    }
    const cabe = nivel !== 'A' || def.reparacion.horas <= 12;
    if (cabe) {
      reparaciones += costeReparacion(avion, a, anio);
      avion.averias = avion.averias.filter((x) => x !== a);
      hallazgos.push(`${textoMotor(def.nombre, a)}: reparado`);
    } else {
      a.fase = def.importante ? 'anomalia' : 'confirmada';
      if (!def.importante) a.diagnostico = { fueraDeLimites: a.progreso >= def.umbrales.limite };
      hallazgos.push(`${textoMotor(def.hallazgo, a)}: pendiente`);
    }
  }
  avion.revisiones.A = 0;
  if (nivel === 'C' || nivel === 'D') avion.revisiones.C = 0;
  if (nivel === 'D') avion.revisiones.D = 0;
  return { reparaciones, hallazgos };
}

function precioDe(tipo, anio) {
  return tipo.precio * indice(anio) / indice(Math.max(1976, tipo.entrada));
}

export function costeRevision(avion, nivel, anio) {
  return programa(TIPOS[avion.tipo])[nivel].coste * indice(anio);
}

export function diasRevision(avion, nivel) {
  const p = programa(TIPOS[avion.tipo])[nivel];
  return nivel === 'A' ? 0 : p.dias * TIPOS[avion.tipo].repuestos;
}

// --- Motores

export const DIAS_TALLER_MOTOR = 40;

export function costeRG(avion, anio) {
  return MOTORES[TIPOS[avion.tipo].motor].costeRG * indice(anio);
}

export function alquilerMotor(avion, anio) {
  return MOTORES[TIPOS[avion.tipo].motor].alquilerDia * indice(anio) * DIAS_TALLER_MOTOR * TIPOS[avion.tipo].repuestos;
}

export function diasTallerMotor(avion) {
  return Math.round(DIAS_TALLER_MOTOR * TIPOS[avion.tipo].repuestos);
}

// Revisión general de un motor: queda como nuevo y se arreglan todas sus averías, también las
// que solo se ven con el motor desmontado.
export function revisarMotor(avion, pos) {
  const m = avion.motores.find((x) => x.pos === pos);
  const encontradas = avion.averias.filter((a) => !a.equipo && a.motor === pos);
  m.horasRG = 0;
  m.historial.push({ revision: true });
  avion.averias = avion.averias.filter((a) => a.motor !== pos);
  return encontradas.filter((a) => !a.falsa).map((a) => textoMotor(AVERIAS[a.codigo].nombre, a));
}

// --- MEL

export function puedeDiferir(averia) {
  if (averia.equipo) return EQUIPOS_INOP[averia.codigo].mel;
  const def = AVERIAS[averia.codigo];
  return averia.fase === 'confirmada' && def.mel ? def.mel : null;
}

export function diferir(averia, t) {
  const cat = puedeDiferir(averia);
  if (!cat) return 'Esta avería no se puede diferir';
  averia.fase = 'diferida';
  averia.diferidaHasta = t + DIAS_MEL[cat] * MIN_DIA;
  return null;
}

// --- Legalidad del despacho

export function irregularidades(avion, t) {
  const tipo = TIPOS[avion.tipo];
  const prog = programa(tipo);
  const motor = MOTORES[tipo.motor];
  const lista = [];
  if (avion.revisiones.A > prog.A.horas * TOLERANCIA) lista.push({ codigo: 'revisionA', texto: `Revisión A vencida (${Math.round(avion.revisiones.A)} h; toca cada ${prog.A.horas})` });
  if (avion.revisiones.C > prog.C.horas * TOLERANCIA) lista.push({ codigo: 'revisionC', texto: `Revisión C vencida (${Math.round(avion.revisiones.C)} h; toca cada ${prog.C.horas})` });
  if (avion.revisiones.D > prog.D.horas * TOLERANCIA) lista.push({ codigo: 'revisionD', texto: 'Revisión estructural vencida' });
  for (const m of avion.motores) {
    if (m.horasRG > motor.intervalo * TOLERANCIA) lista.push({ codigo: 'motorRG', texto: `Motor ${m.pos} con la revisión general vencida (${Math.round(m.horasRG)} h)` });
  }
  for (const a of avion.averias) {
    if (a.fase === 'diferida' && t > a.diferidaHasta) lista.push({ codigo: 'mel', texto: `${describir(a)}: aplazamiento MEL caducado` });
    if (a.fase === 'confirmada' && a.equipo) lista.push({ codigo: 'equipo', texto: `${describir(a)} sin reparar ni diferir` });
    if (a.fase === 'confirmada' && a.diagnostico?.fueraDeLimites) lista.push({ codigo: 'noApto', texto: `${describir(a)}: fuera de límites` });
  }
  return lista;
}

// Lo que el jugador sabe del avión, para la interfaz.
export function averiasConocidas(avion) {
  return avion.averias.filter((a) => a.fase !== 'oculta');
}

export { DIAGNOSTICO, METODOS };
