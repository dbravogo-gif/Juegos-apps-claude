import test from 'node:test';
import assert from 'node:assert/strict';

import { puntuarEntreno } from '../src/core/scoring/workout.js';
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
} from '../src/core/scoring/streaks.js';

const ej = (id, importancia, estado) => ({ id, importancia, estado });

// Rutina de referencia: 2 principales, 4 secundarios, 2 opcionales (peso total 14).
const rutina = (estados) => [
  ej('p1', 'principal', estados[0]),
  ej('p2', 'principal', estados[1]),
  ej('s1', 'secundario', estados[2]),
  ej('s2', 'secundario', estados[3]),
  ej('s3', 'secundario', estados[4]),
  ej('s4', 'secundario', estados[5]),
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

test('omitir un secundario penaliza menos que omitir un principal', () => {
  const sinSecundario = puntuarEntreno(
    rutina(['completado', 'completado', 'omitido', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  const sinPrincipal = puntuarEntreno(
    rutina(['omitido', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado']),
  );
  assert.ok(sinSecundario.cumplimiento > sinPrincipal.cumplimiento);
  assert.equal(sinSecundario.cumplimiento, 12 / 14);
  assert.equal(sinPrincipal.cumplimiento, 11 / 14);
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
  assert.equal(cumplimiento, 12.5 / 14);
});

test('el cumplimiento baja de forma continua, sin saltos bruscos', () => {
  const secuencia = [0, 1, 2, 3, 4].map((omitidos) => {
    const estados = todo('completado');
    for (let i = 0; i < omitidos; i += 1) estados[2 + i] = 'omitido';
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

/** Construye un historial a partir de una plantilla: E=entreno ok, f=entreno fallado, D=descanso. */
const historial = (plantilla) =>
  [...plantilla].map((c, i) => ({
    fecha: fechaDia(i),
    planEntreno: c === 'D' ? 'descanso' : 'entreno',
    entreno: c === 'E' ? { cumplimiento: 1 } : c === 'f' ? { cumplimiento: 0.4 } : null,
    comida: { puntuacion: 1, comidasExentas: 0 },
  }));

test('los descansos planificados no rompen la racha de entreno', () => {
  const racha = calcularRacha(historial('EDDEDDE'), clasificarEntreno);
  assert.ok(racha.activa);
  assert.equal(racha.longitud, 7);
});

test('tres descansos seguidos a caballo entre semanas mantienen la racha', () => {
  // Plan de 4 sesiones: descansa de jueves a sábado y el lunes siguiente.
  const racha = calcularRacha(historial('EEEDDDEEED'), clasificarEntreno);
  assert.ok(racha.activa);
});

test('un fallo en la ventana no rompe la racha, dos sí', () => {
  assert.ok(calcularRacha(historial('EEEfEEE'), clasificarEntreno).activa);
  assert.equal(calcularRacha(historial('EEfEfEE'), clasificarEntreno).activa, false);
});

test('al romperse, la racha se reduce a la mitad en lugar de reiniciarse', () => {
  const larga = calcularRacha(historial('EEEEEEEEEEEE'), clasificarEntreno);
  assert.equal(larga.longitud, 12);
  const rota = calcularRacha(historial('EEEEEEEEEEEEff'), clasificarEntreno);
  assert.equal(rota.activa, false);
  assert.ok(rota.longitud > 0 && rota.longitud < larga.longitud);
});

test('explotación: marcar todos los días como descanso no mantiene la racha', () => {
  const racha = calcularRacha(historial('DDDDDDDDDDDDDD'), clasificarEntreno);
  assert.equal(racha.activa, false);
  assert.equal(racha.longitud, 0);
});

test('un día sin registro cuenta como fallado', () => {
  assert.equal(clasificarEntreno({ planEntreno: 'entreno', entreno: null }), 'fallado');
  assert.equal(clasificarComida({ comida: null }), 'fallado');
});

test('una sesión adaptada por molestias no exige ni penaliza', () => {
  assert.equal(
    clasificarEntreno({ planEntreno: 'entreno', entreno: { cumplimiento: null } }),
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
