// Simulación de balance: `node tools/simular.js`
// Recorre 12 semanas con varios perfiles y muestra a qué ritmo progresan.

import { resumenDelDia } from '../src/core/day.js';
import { nivelDesdeXp, xpParaSubirDe } from '../src/core/economy/levels.js';

const SEMANAS = 12;
const DIAS = SEMANAS * 7;
const INICIO = new Date('2026-01-05T00:00:00Z'); // lunes

const fecha = (i) => new Date(INICIO.getTime() + i * 86400000).toISOString().slice(0, 10);

// Ruido determinista para que los perfiles fluctúen como lo haría una persona real.
const ruido = (i, semilla) => {
  const x = Math.sin((i + 1) * semilla) * 10000;
  return (x - Math.floor(x) - 0.5) * 0.2;
};
const acotar = (v) => Math.min(1, Math.max(0, Number(v.toFixed(3))));

const PERFILES = {
  'Constante (4 ses/sem)': {
    diasEntreno: [0, 1, 3, 4],
    cumplimiento: (i) => acotar(0.92 + ruido(i, 12.9)),
    comida: (i) => acotar(0.95 + ruido(i, 4.7)),
  },
  'Principiante (3 ses/sem)': {
    diasEntreno: [0, 2, 4],
    cumplimiento: (i) => acotar(0.8 + ruido(i, 7.3)),
    comida: (i) => acotar(0.8 + ruido(i, 9.1)),
  },
  'Principiante plano (0,8 fijo)': {
    diasEntreno: [0, 2, 4],
    cumplimiento: () => 0.8,
    comida: () => 0.8,
  },
  'Irregular (falla 1 de 3)': {
    diasEntreno: [0, 1, 3, 4],
    cumplimiento: (i) => (i % 3 === 0 ? 0.3 : 0.9),
    comida: (i) => (i % 4 === 0 ? 0.4 : 0.9),
  },
};

function simular(perfil) {
  const historial = [];
  for (let i = 0; i < DIAS; i += 1) {
    const entrena = perfil.diasEntreno.includes(i % 7);
    historial.push({
      fecha: fecha(i),
      planEntreno: entrena ? 'entreno' : 'descanso',
      entreno: entrena ? { cumplimiento: perfil.cumplimiento(i) } : null,
      comida: { puntuacion: perfil.comida(i), comidasExentas: 0 },
    });
  }

  let xp = 0;
  let monedas = 0;
  let diasConExtras = 0;
  let multiplicadorFinal = 1;

  historial.forEach((_, i) => {
    const resumen = resumenDelDia(historial, i);
    xp += resumen.recompensa.total.xp;
    monedas += resumen.recompensa.total.monedas;
    if (resumen.extras.desbloqueado) diasConExtras += 1;
    multiplicadorFinal = resumen.rachas.multiplicador;
  });

  const { nivel, xpEnNivel, xpParaSiguiente } = nivelDesdeXp(xp);
  return {
    XP: xp,
    Nivel: nivel,
    'Progreso nivel': `${xpEnNivel}/${xpParaSiguiente}`,
    Monedas: monedas,
    'Mult. final': multiplicadorFinal,
    'Días con extras': `${diasConExtras}/${DIAS}`,
  };
}

const resultados = Object.fromEntries(Object.entries(PERFILES).map(([n, p]) => [n, simular(p)]));

console.log(`\n=== Balance tras ${SEMANAS} semanas ===`);
console.table(resultados);

const constante = resultados['Constante (4 ses/sem)'].XP;
console.log('XP respecto al perfil constante:');
Object.entries(resultados).forEach(([nombre, r]) => {
  console.log(`  ${nombre.padEnd(30)} ${Math.round((r.XP / constante) * 100)} %`);
});

console.log('\n=== Coste de cada nivel ===');
let acumulada = 0;
const tabla = {};
for (let nivel = 1; nivel <= 20; nivel += 1) {
  acumulada += xpParaSubirDe(nivel);
  if (nivel <= 10 || nivel % 5 === 0) {
    tabla[`Nivel ${nivel} -> ${nivel + 1}`] = {
      'XP del salto': xpParaSubirDe(nivel),
      'XP acumulada': acumulada,
      'Días a ~190 XP/día': Math.round(acumulada / 190),
    };
  }
}
console.table(tabla);
