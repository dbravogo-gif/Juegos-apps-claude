// Almacén del modo demo: toda la base de datos en un JSON dentro de localStorage.
// Misma interfaz que el almacén de Firebase (ver ARCHITECTURE.md). Los métodos son asíncronos
// para que la interfaz no note la diferencia.

import { datosDeEjemplo } from './ejemplo.js';
import { validarRegistro } from '../nucleo/registro.js';
import { ordenarSesiones, validarSesion, copiarSemana, copiarSesion, nombresUsados } from '../nucleo/plan.js';
import { generarCodigo, generarId } from '../nucleo/codigos.js';
import { lunesDe, diaSemana } from '../nucleo/fechas.js';

export const CLAVE_DEMO = 'beep_demo_db';

/**
 * @param {object} op
 * @param {{getItem, setItem, removeItem}} op.almacenamiento  localStorage o un sustituto
 * @param {string} op.hoy  fecha de hoy, para colocar los datos de ejemplo alrededor
 * @param {() => number} [op.ahora]  reloj en milisegundos (inyectable en las pruebas)
 */
export function crearAlmacenDemo({ almacenamiento, hoy, ahora = () => Date.now() }) {
  const leer = () => {
    try {
      const t = almacenamiento.getItem(CLAVE_DEMO);
      if (t) return JSON.parse(t);
    } catch { /* datos corruptos: se regeneran */ }
    const db = datosDeEjemplo(lunesDe(hoy), diaSemana(hoy));
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
      db.registros[atletaId][sesion.id] = { ...r.registro, actualizado: ahora() };
      escribir(db);
      return { ok: true, registro: copia(db.registros[atletaId][sesion.id]) };
    },

    ...metodosEntrenador({ leer, escribir, copia }),

    /** Solo en demo: vuelve a los datos de ejemplo. */
    async reiniciar() {
      almacenamiento.removeItem(CLAVE_DEMO);
      leer();
    },
  };
}

// Lo que hace el entrenador. En la nube, solo una cuenta de entrenador puede hacerlo.
function metodosEntrenador({ leer, escribir, copia }) {
  const resumen = (db, a) => ({
    id: a.id, nombre: a.nombre, codigo: a.codigo, activo: a.activo, archivado: a.archivado,
    dispositivos: Object.keys(db.dispositivos[a.codigo] ?? {}).length,
  });
  const codigoLibre = (db, nombre, rng) => {
    for (let i = 0; i < 20; i++) {
      const c = generarCodigo(nombre, rng);
      if (!db.codigos[c]) return c;
    }
    throw new Error('No se ha podido generar un código libre.');
  };

  return {
    /** En demo no hay contraseña. */
    async entrarEntrenador() { return { ok: true, nombre: 'Entrenador' }; },
    async salirEntrenador() {},

    async listarAtletas() {
      const db = leer();
      return Object.values(db.atletas).map((a) => resumen(db, a)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    },

    async atleta(id) {
      const db = leer();
      return db.atletas[id] ? resumen(db, db.atletas[id]) : null;
    },

    async crearAtleta(nombre, rng) {
      const limpio = String(nombre ?? '').trim();
      if (!limpio) return { ok: false, errores: ['Escribe el nombre del atleta.'] };
      if (limpio.length > 40) return { ok: false, errores: ['El nombre es demasiado largo.'] };
      const db = leer();
      const a = { id: generarId(rng), nombre: limpio, codigo: codigoLibre(db, limpio, rng), activo: true, archivado: false };
      db.atletas[a.id] = a;
      db.codigos[a.codigo] = { atleta: a.id, activo: true };
      db.dispositivos[a.codigo] = {};
      db.sesiones[a.id] = {};
      db.registros[a.id] = {};
      escribir(db);
      return { ok: true, atleta: resumen(db, a) };
    },

    /** Activar o desactivar el código. Un código desactivado echa al atleta en su siguiente apertura. */
    async cambiarActivo(id, activo) {
      const db = leer();
      const a = db.atletas[id];
      if (!a) return { ok: false };
      a.activo = !!activo;
      if (activo) a.archivado = false;
      db.codigos[a.codigo].activo = !!activo;
      escribir(db);
      return { ok: true, atleta: resumen(db, a) };
    },

    /** Código nuevo: el anterior deja de existir y todos los móviles tienen que volver a entrar. */
    async regenerarCodigo(id, rng) {
      const db = leer();
      const a = db.atletas[id];
      if (!a) return { ok: false };
      delete db.codigos[a.codigo];
      delete db.dispositivos[a.codigo];
      a.codigo = codigoLibre(db, a.nombre, rng);
      db.codigos[a.codigo] = { atleta: a.id, activo: a.activo };
      db.dispositivos[a.codigo] = {};
      escribir(db);
      return { ok: true, atleta: resumen(db, a) };
    },

    async archivarAtleta(id) {
      const db = leer();
      const a = db.atletas[id];
      if (!a) return { ok: false };
      a.activo = false;
      a.archivado = true;
      db.codigos[a.codigo].activo = false;
      escribir(db);
      return { ok: true };
    },

    /** Borra todo lo del atleta: código, móviles, plan y valoraciones. */
    async borrarAtleta(id) {
      const db = leer();
      const a = db.atletas[id];
      if (!a) return { ok: false };
      delete db.codigos[a.codigo];
      delete db.dispositivos[a.codigo];
      delete db.sesiones[id];
      delete db.registros[id];
      delete db.atletas[id];
      escribir(db);
      return { ok: true };
    },

    async todoDelAtleta(id) {
      const db = leer();
      return copia({ atleta: db.atletas[id], sesiones: Object.values(db.sesiones[id] ?? {}), registros: db.registros[id] ?? {} });
    },

    async guardarSesion(atletaId, sesion) {
      const r = validarSesion(sesion);
      if (!r.ok) return r;
      const db = leer();
      if (!db.atletas[atletaId]) return { ok: false, errores: ['Ese atleta ya no existe.'] };
      db.sesiones[atletaId][r.sesion.id] = r.sesion;
      escribir(db);
      return { ok: true, sesion: copia(r.sesion) };
    },

    /** Borra la sesión y su valoración, si la hay. */
    async borrarSesion(atletaId, sid) {
      const db = leer();
      delete db.sesiones[atletaId]?.[sid];
      delete db.registros[atletaId]?.[sid];
      escribir(db);
      return { ok: true };
    },

    async copiarSemana(atletaId, lunesOrigen, lunesDestino, rng) {
      const db = leer();
      const nuevas = copiarSemana(Object.values(db.sesiones[atletaId] ?? {}), lunesOrigen, lunesDestino, () => generarId(rng));
      for (const s of nuevas) db.sesiones[atletaId][s.id] = s;
      escribir(db);
      return { ok: true, copiadas: nuevas.length };
    },

    async copiarSesionA(atletaOrigen, sid, atletaDestino, fecha, rng) {
      const db = leer();
      const s = db.sesiones[atletaOrigen]?.[sid];
      if (!s || !db.atletas[atletaDestino]) return { ok: false, errores: ['No se ha podido copiar.'] };
      const nueva = copiarSesion(s, fecha, () => generarId(rng));
      db.sesiones[atletaDestino][nueva.id] = nueva;
      escribir(db);
      return { ok: true, sesion: copia(nueva) };
    },

    /** Ejercicios ya usados con cualquier atleta, para autocompletar. */
    async biblioteca() {
      const db = leer();
      return nombresUsados(Object.values(db.sesiones).flatMap((m) => Object.values(m)));
    },

    /** Las valoraciones más recientes de todos los atletas, con su sesión. */
    async novedades(limite = 30) {
      const db = leer();
      const lista = [];
      for (const [atletaId, regs] of Object.entries(db.registros)) {
        const a = db.atletas[atletaId];
        if (!a) continue;
        for (const r of Object.values(regs)) {
          const s = db.sesiones[atletaId]?.[r.sesion];
          if (s) lista.push({ atleta: { id: a.id, nombre: a.nombre }, sesion: s, registro: r });
        }
      }
      return copia(lista.sort((x, y) => (y.registro.actualizado ?? 0) - (x.registro.actualizado ?? 0)).slice(0, limite));
    },
  };
}
