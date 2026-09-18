import { rutinasPorDefecto, comidasPorDefecto } from './defaults.js';

const CLAVE = 'juego_habitos_db';
export const VERSION_ESQUEMA = 1;

export function estadoInicial() {
  return {
    version: VERSION_ESQUEMA,
    perfil: { nombre: '', creado: new Date().toISOString().slice(0, 10) },
    plan: {
      // Cuántos días a la semana te comprometes a entrenar. Qué día y con qué rutina se
      // decide al abrir el día, no en un calendario fijo.
      diasPorSemana: 4,
      // Qué se supone que comes cada día de la semana, con el lunes como 0.
      comidasPorDia: comidasPorDefecto(),
    },
    rutinas: rutinasPorDefecto(),
    dias: {},
    exenciones: [],
    monedasGastadas: 0,
    inventario: [],
    equipado: {},
    colocados: {},
    jefesDerrotados: [],
    tutorialVisto: false,
  };
}

/**
 * En navegación privada algunos navegadores lanzan al tocar localStorage. La app debe
 * seguir funcionando durante la sesión aunque no pueda persistir, así que se cae a memoria.
 */
function almacenDisponible() {
  try {
    const prueba = '__prueba__';
    window.localStorage.setItem(prueba, '1');
    window.localStorage.removeItem(prueba);
    return true;
  } catch {
    return false;
  }
}

const memoria = new Map();

const almacen = {
  leer(clave) {
    if (almacenDisponible()) return window.localStorage.getItem(clave);
    return memoria.get(clave) ?? null;
  },
  escribir(clave, valor) {
    if (almacenDisponible()) window.localStorage.setItem(clave, valor);
    else memoria.set(clave, valor);
  },
};

/** Qué sesión fue un día guardado con el esquema viejo, deducida de lo que anotó. */
function sesionDe(dia, rutinas) {
  if (dia.sesion) return dia.sesion;
  if (dia.planEntreno === 'descanso') return 'descanso';

  const ids = new Set((dia.ejercicios ?? []).map((e) => e.id));
  if (ids.size === 0) return undefined;

  const rutina = rutinas.find((r) => r.ejercicios.some((e) => ids.has(e.id)));
  return rutina?.id;
}

/**
 * Lleva un documento guardado al esquema actual.
 * El plan se fusiona campo a campo: si se mezclara entero, un guardado anterior sin
 * `comidasPorDia` dejaría a medias el planificador de dieta.
 */
export function migrar(db) {
  if (!db || typeof db !== 'object') return estadoInicial();
  const base = estadoInicial();

  const plan = { ...base.plan, ...(db.plan ?? {}) };
  if (!plan.comidasPorDia || Object.keys(plan.comidasPorDia).length === 0) {
    plan.comidasPorDia = base.plan.comidasPorDia;
  }
  // Los días fijos del calendario se resumen en cuántos eran; el resto sobra.
  if (Array.isArray(db.plan?.diasEntreno) && db.plan.diasEntreno.length) {
    plan.diasPorSemana = db.plan.diasEntreno.length;
  }
  delete plan.diasEntreno;
  delete plan.rutinaPorDia;

  // Lo colocado se guardaba por número de casilla y ahora va por id de sitio. Los números
  // sueltos ya no apuntan a nada, así que se devuelven al inventario en vez de desaparecer.
  const colocados = Object.fromEntries(
    Object.entries(db.colocados ?? {}).map(([espacio, puestos]) => [
      espacio,
      Object.fromEntries(Object.entries(puestos).filter(([sitio]) => Number.isNaN(Number(sitio)))),
    ]),
  );

  const rutinas = (db.rutinas ?? base.rutinas).map((rutina) => ({
    ...rutina,
    ejercicios: (rutina.ejercicios ?? []).map((e) => ({
      series: 3,
      repMin: 8,
      repMax: 12,
      ...e,
      // Ya no hay importancia intermedia. Los secundarios contaban, así que pasan a
      // principales: dejarlos caer a opcional borraría de golpe parte del cumplimiento.
      importancia: e.importancia === 'opcional' ? 'opcional' : 'principal',
    })),
  }));

  // Los días guardaban si tocaba entrenar según el calendario; ahora guardan qué se hizo.
  // Se deduce de los ejercicios anotados cuál era la rutina, para no perder el historial.
  const dias = Object.fromEntries(
    Object.entries(db.dias ?? {}).map(([fecha, dia]) => [fecha, { ...dia, sesion: sesionDe(dia, rutinas) }]),
  );

  return { ...base, ...db, plan, rutinas, colocados, dias, version: VERSION_ESQUEMA };
}

export function cargar() {
  const crudo = almacen.leer(CLAVE);
  if (!crudo) return estadoInicial();
  try {
    return migrar(JSON.parse(crudo));
  } catch {
    return estadoInicial();
  }
}

export function guardar(db) {
  almacen.escribir(CLAVE, JSON.stringify(db));
  return db;
}

export function exportar(db) {
  return JSON.stringify(db, null, 2);
}

/** @returns {{ ok: true, db: object } | { ok: false, motivo: string }} */
export function importar(texto) {
  try {
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== 'object' || typeof datos.dias !== 'object') {
      return { ok: false, motivo: 'formato' };
    }
    return { ok: true, db: migrar(datos) };
  } catch {
    return { ok: false, motivo: 'json' };
  }
}
