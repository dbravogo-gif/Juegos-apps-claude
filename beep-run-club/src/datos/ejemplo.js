// Datos de ejemplo del modo demo. Nombres inventados. Las fechas se colocan alrededor de la
// semana que empieza en `lunes`, para que siempre haya algo que ver.

import { sumarDias } from '../nucleo/fechas.js';
import { generarId } from '../nucleo/codigos.js';
import { conSemilla } from '../nucleo/azar.js';

export const CODIGOS_DEMO = { laura: 'DEMO-BEEP22', pablo: 'PABLO-K7M2QX', baja: 'MARTA-AAAA22' };

const ej = (nombre, detalle, extra = {}) => ({ nombre, detalle, nota: '', carrera: false, ...extra });

const PLANTILLAS = {
  rodaje: {
    titulo: 'Rodaje suave',
    nota: 'Día de soltar piernas. Si puedes ir hablando, vas bien.',
    ejercicios: [
      ej('Movilidad articular', '5 min: tobillos, caderas y hombros'),
      ej('Rodaje en zona 2', '40 min a ritmo cómodo', { carrera: true }),
      ej('Estiramientos', '10 min suaves, sin rebotes'),
    ],
  },
  series: {
    titulo: 'Series cortas',
    nota: 'Si te molesta el gemelo, cambia las series por 30 min suaves y me lo cuentas.',
    ejercicios: [
      ej('Calentamiento', '15 min de trote suave', { carrera: true }),
      ej('Técnica de carrera', 'Skipping, talones al glúteo y zancadas: 3 × 20 m de cada'),
      ej('Series de 400 m', '6 × 400 m a ritmo de 5 km, recuperación 90 s trotando', { carrera: true, nota: 'Las dos últimas, igual de rápidas que la primera.' }),
      ej('Vuelta a la calma', '10 min muy suave', { carrera: true }),
    ],
  },
  fuerza: {
    titulo: 'Fuerza y core',
    nota: '',
    ejercicios: [
      ej('Sentadilla búlgara', '3 × 10 por pierna'),
      ej('Puente de glúteo', '3 × 15'),
      ej('Plancha frontal', '3 × 40 s'),
      ej('Plancha lateral', '3 × 30 s por lado'),
    ],
  },
  larga: {
    titulo: 'Tirada larga',
    nota: 'Lleva agua. Los últimos 2 km, algo más vivos si te encuentras bien.',
    ejercicios: [ej('Tirada larga', '14 km a ritmo cómodo', { carrera: true })],
  },
};

const SEMANA_TIPO = [[0, 'rodaje'], [2, 'series'], [4, 'fuerza'], [6, 'larga']];

export function datosDeEjemplo(lunes) {
  const rng = conSemilla(2026);
  const id = () => generarId(rng);
  const db = { codigos: {}, atletas: {}, dispositivos: {}, sesiones: {}, registros: {} };

  const alta = (nombre, codigo, activo) => {
    const a = { id: id(), nombre, codigo, estado: activo ? 'activo' : 'archivado' };
    db.atletas[a.id] = a;
    db.codigos[codigo] = { atleta: a.id, activo };
    db.dispositivos[codigo] = {};
    db.sesiones[a.id] = {};
    db.registros[a.id] = {};
    return a;
  };
  const sesion = (atleta, fecha, plantilla) => {
    const p = PLANTILLAS[plantilla];
    const s = { id: id(), fecha, titulo: p.titulo, nota: p.nota, ejercicios: p.ejercicios.map((e) => ({ ...e, id: id() })) };
    db.sesiones[atleta.id][s.id] = s;
    return s;
  };

  const laura = alta('Laura', CODIGOS_DEMO.laura, true);
  const pablo = alta('Pablo', CODIGOS_DEMO.pablo, true);
  alta('Marta', CODIGOS_DEMO.baja, false);

  for (const semana of [-7, 0, 7]) {
    for (const [dia, plantilla] of SEMANA_TIPO) sesion(laura, sumarDias(lunes, semana + dia), plantilla);
  }
  for (const [dia, plantilla] of [[1, 'rodaje'], [3, 'series'], [5, 'larga']]) sesion(pablo, sumarDias(lunes, dia), plantilla);

  // Valoraciones de Laura de la semana pasada: una normal y una dura.
  const pasadas = Object.values(db.sesiones[laura.id]).filter((s) => s.fecha < lunes).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const [rodaje, series] = pasadas;
  db.registros[laura.id][rodaje.id] = {
    sesion: rodaje.id, fecha: rodaje.fecha, hechos: rodaje.ejercicios.map((e) => e.id), esfuerzo: 4, duros: [],
    carrera: { [rodaje.ejercicios[1].id]: { distancia: 7.2, tiempo: 2400, ritmo: 333 } }, comentario: '',
  };
  db.registros[laura.id][series.id] = {
    sesion: series.id, fecha: series.fecha, hechos: series.ejercicios.slice(0, 3).map((e) => e.id), esfuerzo: 9,
    duros: [series.ejercicios[2].id], carrera: {}, comentario: 'Las dos últimas series no llegué al ritmo.',
  };
  return db;
}
