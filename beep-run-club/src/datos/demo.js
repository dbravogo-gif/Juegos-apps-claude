// Almacén del modo demo: toda la base de datos en un JSON dentro de localStorage.
// Misma interfaz que el almacén de Firebase (ver ARCHITECTURE.md). Los métodos son asíncronos
// para que la interfaz no note la diferencia.

import { datosDeEjemplo } from './ejemplo.js';
import { validarRegistro } from '../nucleo/registro.js';
import { ordenarSesiones } from '../nucleo/plan.js';

export const CLAVE_DEMO = 'beep_demo_db';

/**
 * @param {object} op
 * @param {{getItem, setItem, removeItem}} op.almacenamiento  localStorage o un sustituto
 * @param {string} op.lunes  lunes de la semana actual, para colocar los datos de ejemplo
 */
export function crearAlmacenDemo({ almacenamiento, lunes }) {
  const leer = () => {
    try {
      const t = almacenamiento.getItem(CLAVE_DEMO);
      if (t) return JSON.parse(t);
    } catch { /* datos corruptos: se regeneran */ }
    const db = datosDeEjemplo(lunes);
    almacenamiento.setItem(CLAVE_DEMO, JSON.stringify(db));
    return db;
  };
  const escribir = (db) => almacenamiento.setItem(CLAVE_DEMO, JSON.stringify(db));
  const copia = (x) => (x == null ? x : structuredClone(x));

  return {
    tipo: 'demo',

    /** Entrar con un código desde un móvil. */
    async entrar(codigo, dispositivo) {
      const db = leer();
      const c = db.codigos[codigo];
      if (!c) return { ok: false, motivo: 'no-existe' };
      if (!c.activo) return { ok: false, motivo: 'desactivado' };
      db.dispositivos[codigo] ??= {};
      db.dispositivos[codigo][dispositivo] ??= true;
      escribir(db);
      const a = db.atletas[c.atleta];
      return { ok: true, atleta: { id: a.id, nombre: a.nombre } };
    },

    /** 'activo', 'desactivado' o 'no-existe'. */
    async comprobar(codigo) {
      const c = leer().codigos[codigo];
      if (!c) return 'no-existe';
      return c.activo ? 'activo' : 'desactivado';
    },

    async sesionesEntre(atletaId, desde, hasta) {
      const todas = Object.values(leer().sesiones[atletaId] ?? {});
      return copia(ordenarSesiones(todas.filter((s) => s.fecha >= desde && s.fecha <= hasta)));
    },

    async sesion(atletaId, sid) {
      return copia(leer().sesiones[atletaId]?.[sid] ?? null);
    },

    /** Valoraciones de esas sesiones: { [sid]: registro }. */
    async registros(atletaId, sids) {
      const todos = leer().registros[atletaId] ?? {};
      return copia(Object.fromEntries(sids.filter((s) => todos[s]).map((s) => [s, todos[s]])));
    },

    async guardarRegistro(atletaId, codigo, datos) {
      const db = leer();
      if (!db.codigos[codigo]?.activo || db.codigos[codigo].atleta !== atletaId) {
        return { ok: false, errores: ['Tu código ya no está activo.'] };
      }
      const sesion = db.sesiones[atletaId]?.[datos.sesion];
      if (!sesion) return { ok: false, errores: ['Esa sesión ya no existe.'] };
      const r = validarRegistro(datos, sesion);
      if (!r.ok) return r;
      db.registros[atletaId][sesion.id] = r.registro;
      escribir(db);
      return { ok: true, registro: copia(r.registro) };
    },

    /** Solo en demo: vuelve a los datos de ejemplo. */
    async reiniciar() {
      almacenamiento.removeItem(CLAVE_DEMO);
      leer();
    },
  };
}
