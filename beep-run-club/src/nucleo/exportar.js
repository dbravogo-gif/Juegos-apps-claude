// Historial de un atleta en CSV, para descargarlo antes de borrarlo (baja). Separador «;» y BOM
// para que Excel en español lo abra bien a la primera.

import { ESFUERZO } from './registro.js';
import { formatearDistancia, formatearTiempo, formatearRitmo } from './ritmo.js';
import { ordenarSesiones } from './plan.js';

const COLUMNAS = ['Fecha', 'Sesión', 'Ejercicios', 'Hechos', 'Esfuerzo', 'Demasiado duros', 'Carrera', 'Comentario'];

function celda(v) {
  const t = String(v ?? '');
  return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function textoCarrera(sesion, registro) {
  return sesion.ejercicios
    .filter((e) => registro?.carrera?.[e.id])
    .map((e) => {
      const c = registro.carrera[e.id];
      const partes = [
        c.distancia != null ? `${formatearDistancia(c.distancia)} km` : null,
        c.tiempo != null ? formatearTiempo(c.tiempo) : null,
        c.ritmo != null ? `${formatearRitmo(c.ritmo)}/km` : null,
      ].filter(Boolean);
      return `${e.nombre}: ${partes.join(', ')}`;
    })
    .join(' | ');
}

/** CSV con una fila por sesión. `registros` es { [sid]: registro }. */
export function historialCsv(atleta, sesiones, registros) {
  const nombre = (s, id) => s.ejercicios.find((e) => e.id === id)?.nombre ?? '';
  const filas = ordenarSesiones(sesiones).map((s) => {
    const r = registros[s.id];
    return [
      s.fecha,
      s.titulo,
      s.ejercicios.map((e) => e.nombre).join(' | '),
      r ? `${r.hechos.length} de ${s.ejercicios.length}` : 'Sin valorar',
      r ? `${r.esfuerzo} (${ESFUERZO[r.esfuerzo]})` : '',
      r ? r.duros.map((id) => nombre(s, id)).join(' | ') : '',
      textoCarrera(s, r),
      r?.comentario ?? '',
    ];
  });
  const cabecera = [`Atleta: ${atleta.nombre}`];
  return '﻿' + [cabecera, COLUMNAS, ...filas].map((f) => f.map(celda).join(';')).join('\r\n') + '\r\n';
}

/** Nombre de archivo sin caracteres raros: «historial-laura-2026-11-19.csv». */
export function nombreArchivo(atleta, fecha) {
  const base = atleta.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `historial-${base || 'atleta'}-${fecha}.csv`;
}
