import { rutinasPorDefecto } from './defaults.js';

const CLAVE = 'juego_habitos_db';
export const VERSION_ESQUEMA = 1;

export function estadoInicial() {
  return {
    version: VERSION_ESQUEMA,
    perfil: { nombre: '', creado: new Date().toISOString().slice(0, 10) },
    plan: { diasEntreno: [0, 1, 3, 4], rutinaPorDia: { 0: 'r_torso', 1: 'r_pierna', 3: 'r_torso', 4: 'r_pierna' } },
    rutinas: rutinasPorDefecto(),
    dias: {},
    exenciones: [],
    monedasGastadas: 0,
    inventario: [],
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

/** Lleva un documento guardado al esquema actual. */
export function migrar(db) {
  if (!db || typeof db !== 'object') return estadoInicial();
  return { ...estadoInicial(), ...db, version: VERSION_ESQUEMA };
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
