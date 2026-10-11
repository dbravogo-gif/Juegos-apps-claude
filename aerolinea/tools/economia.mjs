// Cuánto gana una compañía razonable: un jugador correcto pero no perfecto (revisiones a su
// tiempo, inspecciona los indicios, retrasa con la previsión bajo mínimos, despega lo demás),
// con aviones de segunda mano de unos diez años y tarifa y servicio normales.
//
//   node tools/economia.mjs [años] [semillas] ["escenario;escenario"]
//   escenario = nombre:destino,tipo,vueltas[,precio]+destino,tipo,vueltas...
//
// Saca, por escenario, el resultado de explotación de cada año (sin contar la compra de los
// aviones) y cuántos años tarda en pagarse lo que costaron.

import * as S from '../src/core/sim.js';
import { MIN_DIA } from '../src/core/tiempo.js';
import { TIPOS } from '../src/data/aviones.js';
import { MOTORES } from '../src/data/motores.js';
import { crearAvion } from '../src/core/flota.js';
import { azarDe } from '../src/core/azar.js';
import { revisionPendiente } from '../src/core/mantenimiento.js';

const anios = +(process.argv[2] ?? 2);
const semillas = +(process.argv[3] ?? 6);
const ESCENARIOS = (process.argv[4] ?? [
  'Dos F27 interinsulares:TFN,f27,2,1100000+ACE,f27,2,1100000',
  'Dos F27 a las islas orientales:ACE,f27,3,1100000+FUE,f27,3,1100000',
  'F27 a Tenerife y 737 a Barcelona:TFN,f27,2,1100000+BCN,b737,2,3600000',
  'Dos 737 a la Península:MAD,b737,1,3600000+BCN,b737,2,3600000',
].join(';')).split(';');

function cuidar(e) {
  for (const a of e.aviones) {
    if (a.estado === 'taller' || a.tareas.length) continue;
    const p = revisionPendiente(a);
    if (p.C > 0.95) { S.pedirRevision(e, a.id, 'C'); continue; }
    if (p.D > 0.97) { S.pedirRevision(e, a.id, 'D'); continue; }
    const mot = MOTORES[TIPOS[a.tipo].motor];
    for (const m of a.motores) if (m.horasRG > mot.intervalo * 0.95) S.pedirMotor(e, a.id, m.pos, true);
    for (const x of a.averias) {
      if (x.fase === 'indicio') S.pedirInspeccion(e, a.id, x.id);
      else if (x.fase === 'anomalia') S.pedirDiagnostico(e, a.id, x.id);
      else if (x.fase === 'confirmada') S.pedirReparacion(e, a.id, x.id);
      else if (x.fase === 'diferida' && x.diferidaHasta - e.t < 2 * MIN_DIA) S.pedirReparacion(e, a.id, x.id);
    }
  }
}

function decide(e, d) {
  const inf = S.informeDespacho(e, d);
  if (inf.traslado) return 'traslado';
  if (inf.ctx.irregularidades.some((x) => x.codigo === 'minimos')) return 'retrasar';
  if (inf.ctx.despachoIrregular) return inf.taller ? 'taller' : 'cancelar';
  return inf.grave.clase === 'bajo' ? 'despegar' : 'extra';
}

const M = (x) => `${(x / 1e6).toFixed(2).replace('.', ',')} M$`;

for (const esc of ESCENARIOS) {
  const [nombre, def] = esc.split(':');
  const rutas = def.split('+').map((x) => { const [d, t, v, p] = x.split(','); return { d, t, v: +v, p: +(p ?? 0) }; });
  const compra = rutas.reduce((s, r) => s + r.p, 0);
  const porAnio = Array.from({ length: anios }, () => []);
  const detalle = [];
  for (let semilla = 1; semilla <= semillas; semilla++) {
    const e = S.nuevaPartida({ nombre: 'T', base: 'LPA', semilla });
    e.ajustes.consulta = 'anormal';
    for (const r of rutas) {
      const a = crearAvion(e, azarDe(e), r.t, { anio: 1976, fabricado: 1966 });
      e.mercado.push({ id: 9000 + e.mercado.length, avion: a, precio: 0 });
      S.comprar(e, 9000 + e.mercado.length - 1);
    }
    S.avanzar(e, MIN_DIA);
    rutas.forEach((r, i) => {
      S.crearRuta(e, r.d);
      const ruta = e.rutas.find((x) => x.destino === r.d);
      S.asignar(e, e.aviones[i].id, ruta.id);
      S.cambiarFrecuencia(e, ruta.id, r.v);
    });
    // Mucha caja para que el banco no entre en juego: se mide la explotación.
    const CAJA = 100e6;
    e.caja = CAJA;
    let inicioAnio = e.caja;
    let accidentes = 0;
    const fin = e.t + anios * 365 * MIN_DIA;
    let k = 0;
    let finAnio = e.t + 365 * MIN_DIA;
    while (e.t < fin) {
      cuidar(e);
      for (const d of [...e.decisiones]) S.decidir(e, d.id, decide(e, d));
      const antes = e.aviones.length;
      S.avanzar(e, MIN_DIA / 4);
      if (e.aviones.length < antes) accidentes++;
      if (e.t >= finAnio) {
        porAnio[k].push(e.caja - inicioAnio);
        inicioAnio = e.caja;
        k++;
        finAnio += 365 * MIN_DIA;
      }
    }
    const st = e.rutas.map((r) => `${r.destino} ${Math.round(100 * r.stats.pax / Math.max(1, r.stats.plazas))} %`).join(', ');
    detalle.push(`s${semilla}: ${porAnio.map((x) => M(x[semilla - 1] ?? 0)).join(' / ')} · ocupación ${st}${accidentes ? ` · ${accidentes} accidente` : ''}`);
  }
  const medias = porAnio.map((x) => x.reduce((s, v) => s + v, 0) / x.length);
  const anual = medias[medias.length - 1];
  console.log(`\n== ${nombre} (aviones: ${M(compra)})`);
  console.log(`   resultado medio por año: ${medias.map(M).join(' / ')} · se paga en ${anual > 0 ? (compra / anual).toFixed(1).replace('.', ',') + ' años' : 'nunca'}`);
  for (const l of detalle) console.log(`   ${l}`);
}
