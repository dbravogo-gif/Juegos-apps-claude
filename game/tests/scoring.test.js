import test from 'node:test';
import assert from 'node:assert/strict';

import { puntuarEntreno, estadoPorSeries } from '../src/core/scoring/workout.js';
import {
  puntuarDiaComida,
  exencionesComidaDisponibles,
  inicioSemana,
} from '../src/core/scoring/nutrition.js';
import {
  calcularRacha,
  calcularMultiplicador,
  clasificarEntreno,
  clasificarComida,
  minimoCumplidosEntreno,
} from '../src/core/scoring/streaks.js';

const ej = (id, importancia, estado) => ({ id, importancia, estado });

// Rutina de referencia: 6 principales y 2 opcionales (peso total 6).
const rutina = (estados) => [
  ej('p1', 'principal', estados[0]),
  ej('p2', 'principal', estados[1]),
  ej('p3', 'principal', estados[2]),
  ej('p4', 'principal', estados[3]),
  ej('p5', 'principal', estados[4]),
  ej('p6', 'principal', estados[5]),
  ej('o1', 'opcional', estados[6]),
  ej('o2', 'opcional', estados[7]),
];

const todo = (estado) => Array(8).fill(estado);

test('sesión completa da cumplimiento pleno', () => {
  const { cumplimiento } = puntuarEntreno(rutina(todo('completado')));
  assert.equal(cumplimiento, 1);
});

test('los ejercicios opcionales no suman ni restan', () => {
  const conOpcionales = puntuarEntreno(rutina(todo('completado')));
  const sinOpcionales = puntuarEntreno(
    rutina(['completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'omitido', 'omitido']),
  );
  assert.equal(conOpcionales.cumplimiento, sinOpcionales.cumplimiento);
});

test('todos los ejercicios que cuentan pesan lo mismo', () => {
  const faltaUno = puntuarEntreno(
    rutina(['omitido', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  const faltaOtro = puntuarEntreno(
    rutina(['completado', 'completado', 'omitido', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  assert.equal(faltaUno.cumplimiento, 5 / 6);
  assert.equal(faltaOtro.cumplimiento, faltaUno.cumplimiento);
});

test('explotación: marcar todo como opcional no firma la sesión', () => {
  // Opcional no suma ni resta, así que una rutina entera de opcionales no puntúa nada:
  // no hay cumplimiento que cobrar, ni forma de aprobar sin hacer nada.
  const todoOpcional = puntuarEntreno(Array.from({ length: 6 }, (_, i) => ej(`o${i}`, 'opcional', 'completado')));
  assert.equal(todoOpcional.cumplimiento, null);
});

test('una sustitución razonable puntúa igual que completar', () => {
  const sustituido = puntuarEntreno(
    rutina(['sustituido', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  assert.equal(sustituido.cumplimiento, 1);
});

test('una sesión parcial puntúa la mitad de ese ejercicio', () => {
  const { cumplimiento } = puntuarEntreno(
    rutina(['parcial', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  assert.equal(cumplimiento, 5.5 / 6);
});

test('el cumplimiento baja de forma continua, sin saltos bruscos', () => {
  const secuencia = [0, 1, 2, 3, 4].map((omitidos) => {
    const estados = todo('completado');
    for (let i = 0; i < omitidos; i += 1) estados[i] = 'omitido';
    return puntuarEntreno(rutina(estados)).cumplimiento;
  });
  secuencia.forEach((valor, i) => {
    if (i === 0) return;
    const caida = secuencia[i - 1] - valor;
    assert.ok(caida > 0 && caida <= 0.2, `caída inesperada de ${caida}`);
  });
});

test('explotación: justificar la sesión entera no da cumplimiento pleno', () => {
  const { cumplimiento, justificadosExcedidos } = puntuarEntreno(rutina(todo('justificado')));
  assert.ok(cumplimiento < 0.5, `cumplimiento inflado: ${cumplimiento}`);
  assert.ok(justificadosExcedidos.length > 0);
});

test('una molestia puntual sí se absorbe sin penalizar', () => {
  const { cumplimiento, justificadosExcedidos } = puntuarEntreno(
    rutina(['justificado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  assert.equal(cumplimiento, 1);
  assert.equal(justificadosExcedidos.length, 0);
});

test('la puntuación de comida es la media de las comidas computables', () => {
  const { puntuacion } = puntuarDiaComida([
    { id: 'c1', estado: 'completo' },
    { id: 'c2', estado: 'completo' },
    { id: 'c3', estado: 'incumplido' },
  ]);
  assert.equal(puntuacion, 2 / 3);
});

test('una excepción menor no hunde el día', () => {
  const { puntuacion } = puntuarDiaComida([
    { id: 'c1', estado: 'completo' },
    { id: 'c2', estado: 'excepcion_menor' },
    { id: 'c3', estado: 'completo' },
  ]);
  assert.ok(puntuacion > 0.95);
});

test('una comida exenta se excluye en lugar de puntuar cero', () => {
  const conExenta = puntuarDiaComida([
    { id: 'c1', estado: 'completo' },
    { id: 'c2', estado: 'incumplido', exenta: true },
  ]);
  assert.equal(conExenta.puntuacion, 1);
  assert.equal(conExenta.comidasExentas, 1);
});

test('el cupo semanal de exenciones de comida es de dos', () => {
  const dias = [
    { fecha: '2026-09-14', comidas: [{ id: 'a', estado: 'incumplido', exenta: true }] },
    { fecha: '2026-09-16', comidas: [{ id: 'b', estado: 'incumplido', exenta: true }] },
  ];
  assert.equal(exencionesComidaDisponibles(dias, '2026-09-18'), 0);
  // La semana siguiente vuelve a empezar con el cupo completo.
  assert.equal(exencionesComidaDisponibles(dias, '2026-09-22'), 2);
});

test('la semana natural empieza en lunes', () => {
  assert.equal(inicioSemana('2026-09-16'), '2026-09-14');
  assert.equal(inicioSemana('2026-09-14'), '2026-09-14');
  assert.equal(inicioSemana('2026-09-20'), '2026-09-14');
});

// --- Rachas ---

const FECHA_BASE = new Date('2026-09-01T00:00:00Z');
const fechaDia = (i) => new Date(FECHA_BASE.getTime() + i * 86400000).toISOString().slice(0, 10);

/**
 * Historial a partir de una plantilla: E=sesión cumplida, f=sesión fallada, D=descanso,
 * O=actividad de fuera del gimnasio, .=día sin decidir.
 */
const SESION = { D: 'descanso', O: 'otra', '.': 'sin_decidir' };
const historial = (plantilla) =>
  [...plantilla].map((c, i) => ({
    fecha: fechaDia(i),
    sesion: SESION[c] ?? 'entreno',
    entreno: c === 'E' ? { cumplimiento: 1 } : c === 'f' ? { cumplimiento: 0.4 } : null,
    comida: { puntuacion: 1, comidasExentas: 0 },
  }));

const rachaEntreno = (plantilla, diasPorSemana = 4) =>
  calcularRacha(historial(plantilla), clasificarEntreno, {
    minimoCumplidos: (largo) => minimoCumplidosEntreno(diasPorSemana, largo),
  });

test('los descansos no rompen la racha de entreno', () => {
  // Tres sesiones y cuatro descansos, con un compromiso de tres días por semana.
  const racha = rachaEntreno('EDDEDDE', 3);
  assert.ok(racha.activa);
  assert.equal(racha.longitud, 7);
});

test('el compromiso semanal es lo que decide: las mismas sesiones bastan o no', () => {
  assert.ok(rachaEntreno('EDDEDDE', 3).activa, 'tres sesiones cumplen un plan de tres');
  assert.equal(rachaEntreno('EDDEDDE', 5).activa, false, 'tres no cumplen un plan de cinco');
});

test('explotación: marcar «otra actividad» no sostiene la racha por sí solo', () => {
  // Si contara como sesión, sería un botón para mantener el bonus sin pisar el gimnasio.
  assert.equal(rachaEntreno('OOOOOOOOOOOO').activa, false);
  assert.equal(rachaEntreno('..........').activa, false, 'ni dejar los días en blanco');
});

test('tres descansos seguidos a caballo entre semanas mantienen la racha', () => {
  // Plan de 4 sesiones: descansa de jueves a sábado y el lunes siguiente.
  const racha = rachaEntreno('EEEDDDEEED');
  assert.ok(racha.activa);
});

test('un fallo en la ventana no rompe la racha, dos sí', () => {
  assert.ok(rachaEntreno('EEEfEEE').activa);
  assert.equal(rachaEntreno('EEfEfEE').activa, false);
});

test('al romperse, la racha se reduce a la mitad en lugar de reiniciarse', () => {
  const larga = rachaEntreno('EEEEEEEEEEEE');
  assert.equal(larga.longitud, 12);
  const rota = rachaEntreno('EEEEEEEEEEEEff');
  assert.equal(rota.activa, false);
  assert.ok(rota.longitud > 0 && rota.longitud < larga.longitud);
});

test('explotación: marcar todos los días como descanso no mantiene la racha', () => {
  const racha = rachaEntreno('DDDDDDDDDDDDDD');
  assert.equal(racha.activa, false);
  assert.equal(racha.longitud, 0);
});

test('un día sin registro cuenta como fallado', () => {
  assert.equal(clasificarEntreno({ sesion: 'entreno', entreno: null }), 'fallado');
  assert.equal(clasificarComida({ comida: null }), 'fallado');
});

test('una sesión adaptada por molestias no exige ni penaliza', () => {
  assert.equal(
    clasificarEntreno({ sesion: 'entreno', entreno: { cumplimiento: null } }),
    'no_exigido',
  );
});

test('el multiplicador es aditivo y tiene tope', () => {
  const dias = historial('E'.repeat(60));
  const { multiplicador, bonusEntreno, bonusComida, bonusCombinado } = calcularMultiplicador(dias);
  assert.equal(bonusEntreno, 0.25);
  assert.equal(bonusComida, 0.2);
  assert.equal(bonusCombinado, 0.15);
  assert.equal(multiplicador, 1.6);
});

test('sin rachas activas el multiplicador es neutro', () => {
  const dias = historial('ff');
  assert.equal(calcularMultiplicador(dias).multiplicador, 1);
});

test('el bonus combinado exige que ambas rachas lleguen a la semana', () => {
  const dias = historial('EEEEEEEEEE').map((d, i) => ({
    ...d,
    // La alimentación falla en mitad del tramo, así que su racha no acumula semana.
    comida: { puntuacion: i > 6 ? 0.2 : 1, comidasExentas: 0 },
  }));
  const { bonusCombinado, comida } = calcularMultiplicador(dias);
  assert.equal(comida.activa, false);
  assert.equal(bonusCombinado, 0);
});

// --- Registro serie a serie ---

test('el estado del ejercicio sale de las series completadas', () => {
  assert.equal(estadoPorSeries(3, []), null, 'sin tocar no es lo mismo que omitido');
  assert.equal(estadoPorSeries(3, [{ hecha: true }]), 'parcial');
  assert.equal(estadoPorSeries(3, [{ hecha: true }, { hecha: true }, { hecha: true }]), 'completado');
  assert.equal(estadoPorSeries(3, [{ peso: '80', reps: '8' }]), null, 'anotar sin marcar no cuenta');
});

test('hacer series de más no deja el ejercicio a medias', () => {
  const cinco = Array.from({ length: 5 }, () => ({ hecha: true }));
  assert.equal(estadoPorSeries(3, cinco), 'completado');
});
