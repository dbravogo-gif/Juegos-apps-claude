// Resumen de seguridad de un avión para la interfaz. No es una mecánica: se deriva de los
// sistemas concretos que lleva y de su diseño.

import { TIPOS } from '../data/aviones.js';

export function resumenSeguridad(avion) {
  const tipo = TIPOS[avion.tipo];
  const e = avion.equipo;
  const filas = [
    {
      eje: 'Terreno (CFIT)',
      valor: e.egpws ? 'EGPWS' : e.gpws ? (avion.inop.gpws ? 'GPWS averiado' : 'GPWS') : 'Sin aviso de terreno',
      nivel: e.egpws ? 'alto' : e.gpws && !avion.inop.gpws ? 'medio' : 'bajo',
    },
    {
      eje: 'Meteorología',
      valor: e.radar ? (avion.inop.radar ? 'Radar averiado' : 'Radar meteorológico') : 'Sin radar',
      nivel: e.radar && !avion.inop.radar ? (e.cizalladura ? 'alto' : 'medio') : 'bajo',
    },
    {
      eje: 'Aproximación',
      valor: `ILS hasta CAT ${tipo.catMax}`,
      nivel: tipo.catMax >= 3 ? 'alto' : tipo.catMax === 2 ? 'medio' : 'bajo',
    },
    {
      eje: 'Colisión en vuelo',
      valor: e.tcas ? 'TCAS II' : 'Sin sistema anticolisión',
      nivel: e.tcas ? 'alto' : 'bajo',
    },
    {
      eje: 'Sistemas',
      valor: tipo.hidraulicos >= 3 ? `Alta redundancia (${tipo.hidraulicos} sistemas hidráulicos)` : 'Redundancia básica',
      nivel: tipo.hidraulicos >= 3 ? 'alto' : 'medio',
    },
    {
      eje: 'Motores',
      valor: tipo.nMotores >= 3 ? `${tipo.nMotores} motores: margen con uno parado` : 'Bimotor',
      nivel: tipo.nMotores >= 3 ? 'alto' : 'medio',
    },
  ];
  const puntos = filas.reduce((s, f) => s + { bajo: 0, medio: 1, alto: 2 }[f.nivel], 0);
  const general = puntos >= 9 ? 'Alta' : puntos >= 6 ? 'Media' : 'Básica';
  return { general, filas };
}
