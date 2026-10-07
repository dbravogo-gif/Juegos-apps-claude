// Calibración del riesgo (CRITERIOS.md, 33): probabilidad esperada de accidente por vuelo, por
// millón, según el perfil de jugador y año a año. Suma p × escalada de cada amenaza en cada
// despegue (sonda `sondas.despegue` de sim.js), que es mucho más estable que contar accidentes.
//
//   node tools/calibrar.mjs [casos] [años] [perfiles] [año de inicio]
//   node tools/calibrar.mjs "LPA,TFN,f27,2;LPA,MAD,b737,2" 3 perfecto,medio,desastre 1976
//
// Cada caso es base,destino,tipo,vueltas al día. Objetivo: perfecto ≈ 4 por millón en 1976 y
// 2–3 desde los 90 (≈ 0,5 accidentes por partida); todo mal, del orden del 1 %.

import * as S from '../src/core/sim.js';
import { MIN_DIA, anio } from '../src/core/tiempo.js';
import { TIPOS } from '../src/data/aviones.js';
import { MOTORES } from '../src/data/motores.js';
import { ORDEN_TECNOLOGIAS, puedeInstalar } from '../src/data/tecnologias.js';
import { revisionPendiente } from '../src/core/mantenimiento.js';

const PERFILES = {
  perfecto: { consulta: 'nunca', auto: true, mant: true, inspecciona: true, retrofit: true },
  medio: { consulta: 'anormal', auto: true, mant: true, inspecciona: false, retrofit: false },
  desastre: { consulta: 'siempre', auto: false, mant: false, inspecciona: false, retrofit: false },
};

function cuidar(e, perfil) {
  for (const a of e.aviones) {
    if (a.estado === 'taller' || a.tareas.length) continue;
    if (perfil.mant) {
      const p = revisionPendiente(a);
      if (p.C > 0.95) { S.pedirRevision(e, a.id, 'C'); continue; }
      if (p.D > 0.97) { S.pedirRevision(e, a.id, 'D'); continue; }
      const mot = MOTORES[TIPOS[a.tipo].motor];
      for (const m of a.motores) if (m.horasRG > mot.intervalo * 0.95) S.pedirMotor(e, a.id, m.pos, true);
    }
    for (const x of a.averias) {
      if (perfil.inspecciona) {
        if (x.fase === 'indicio') S.pedirInspeccion(e, a.id, x.id);
        else if (x.fase === 'anomalia') S.pedirDiagnostico(e, a.id, x.id);
        else if (x.fase === 'confirmada') S.pedirReparacion(e, a.id, x.id);
        else if (x.fase === 'diferida' && x.diferidaHasta - e.t < 2 * MIN_DIA) S.pedirReparacion(e, a.id, x.id);
      } else if (perfil.mant && x.fase === 'confirmada' && (x.diagnostico?.fueraDeLimites || x.equipo)) {
        S.pedirReparacion(e, a.id, x.id);
      }
    }
    if (perfil.retrofit) {
      for (const tec of ORDEN_TECNOLOGIAS) {
        if (!a.equipo[tec] && !puedeInstalar(tec, a, anio(e.t))) S.pedirRetrofit(e, a.id, tec);
      }
    }
  }
}

let alterna = 0;
function decide(e, perfil, d) {
  const inf = S.informeDespacho(e, d);
  if (perfil.consulta === 'nunca') return inf.traslado ? 'traslado' : inf.ctx.despachoIrregular ? 'cancelar' : 'extra';
  if (perfil.consulta === 'anormal') {
    if (inf.ctx.irregularidades.some((x) => x.codigo === 'minimos')) return (alterna++ % 2) ? 'despegar' : 'retrasar';
    if (inf.traslado) return 'traslado';
    return 'despegar';
  }
  return 'despegar';
}

const casos = (process.argv[2] ?? 'LPA,TFN,f27,2;LPA,MAD,b737,2;LPA,LGW,b727,1').split(';').map((x) => x.split(','));
const anios = +(process.argv[3] ?? 3);
const perfiles = (process.argv[4] ?? 'perfecto,medio,desastre').split(',');
const anioInicio = +(process.argv[5] ?? 1976);
for (const nombre of perfiles) {
  const perfil = PERFILES[nombre];
  console.log(`=== ${nombre.toUpperCase()}`);
  for (const [base, dest, tipo, frec] of casos) {
    const porAnio = Array.from({ length: anios }, () => ({ vuelos: 0, p: 0, acc: 0, inc: 0 }));
    const causas = {};
    let actual = null;
    S.sondas.despegue = (ctx, sim) => {
      const k = Math.min(anios - 1, Math.floor(ctx.anio - anioInicio));
      const fila = porAnio[k];
      fila.vuelos++;
      let q = 1;
      for (const ev of sim.lista) {
        const pa = ev.p * (ev.esc ?? 0);
        if (!pa) continue;
        causas[ev.id] = (causas[ev.id] ?? 0) + pa;
        q *= 1 - pa;
      }
      fila.p += 1 - q;
      if (sim.accidente) fila.acc++;
      fila.inc += sim.eventos.filter((x) => x.origen === 'tecnico').length;
    };
    for (const semilla of [1, 2, 3, 4]) {
      const e = S.nuevaPartida({ nombre: 'T', base, semilla });
      e.caja = 200e6;
      e.t = (anioInicio - 1976) * 365.25 * MIN_DIA;
      const err = S.comprarNuevo(e, tipo); if (err) { console.log(err); break; }
      S.crearRuta(e, dest); S.asignar(e, e.aviones[0].id, e.rutas[0].id);
      S.cambiarFrecuencia(e, e.rutas[0].id, +frec);
      e.ajustes.consulta = perfil.consulta;
      e.ajustes.revisionesAuto = perfil.auto;
      const fin = e.t + anios * 365 * MIN_DIA;
      while (e.t < fin && !e.quiebra) {
        if (!e.aviones.length) {
          // Tras un accidente, otro avión igual para seguir midiendo.
          S.comprarNuevo(e, tipo); S.asignar(e, e.aviones[0].id, e.rutas[0].id);
          if (!e.aviones.length) break;
        }
        e.caja = Math.max(e.caja, 50e6);
        cuidar(e, perfil);
        for (const d of [...e.decisiones]) S.decidir(e, d.id, decide(e, perfil, d));
        S.avanzar(e, MIN_DIA / 4);
      }
    }
    const tot = porAnio.reduce((s, f) => ({ vuelos: s.vuelos + f.vuelos, p: s.p + f.p, acc: s.acc + f.acc }), { vuelos: 0, p: 0, acc: 0 });
    const top = Object.entries(causas).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} ${(v / tot.vuelos * 1e6).toFixed(0)}`).join(', ');
    const anual = porAnio.map((f) => `${(f.p / Math.max(1, f.vuelos) * 1e6).toFixed(0)}`).join(' / ');
    console.log(`${base}-${dest} ${tipo}: ${tot.vuelos} vuelos | por millón y año: ${anual} | total ${(tot.p / tot.vuelos * 1e6).toFixed(0)} | accidentes ${tot.acc} (esperados ${tot.p.toFixed(1)}) | ${top}`);
  }
}
