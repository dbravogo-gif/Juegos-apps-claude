// Almacén de Firebase: la misma interfaz que el demo (src/datos/demo.js), con Firestore y Auth.
// Atletas: sesión anónima (un uid por móvil) registrada en su código. Entrenador: email y
// contraseña, en una instancia aparte para no pisar la sesión anónima en el mismo navegador.
// La seguridad la ponen las reglas (firestore.rules); aquí se valida para dar buenos mensajes.

import { initializeApp } from '../../vendor/firebase/firebase-app.js';
import {
  getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, connectAuthEmulator,
} from '../../vendor/firebase/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
  doc, getDoc, getDocs, setDoc, collection, query, where, orderBy, limit,
  writeBatch, serverTimestamp, getCountFromServer,
} from '../../vendor/firebase/firebase-firestore.js';
import { validarRegistro } from '../nucleo/registro.js';
import { ordenarSesiones, validarSesion, copiarSemana, copiarSesion, nombresUsados } from '../nucleo/plan.js';
import { generarCodigo, generarId } from '../nucleo/codigos.js';
import { sumarDias } from '../nucleo/fechas.js';
import { validarPolitica, publicarPolitica } from '../nucleo/privacidad.js';
import { politicaPorDefecto } from './textos-privacidad.js';

const ESPERA_ESCRITURA = 4000; // ms: si el servidor no confirma, la escritura queda en cola (sin conexión)

/** En local (127.0.0.1 o localhost) con ?emulador, se usan los emuladores de Firebase. */
function usarEmulador() {
  return ['127.0.0.1', 'localhost'].includes(location.hostname) && new URLSearchParams(location.search).has('emulador');
}

const conTiempo = (promesa, ms) => Promise.race([promesa.then(() => 'ok'), new Promise((r) => setTimeout(() => r('pendiente'), ms))]);
const aMilis = (t) => (t?.toMillis ? t.toMillis() : (typeof t === 'number' ? t : null));
const sinPermiso = (e) => e?.code === 'permission-denied';
const errorEstado = (estado) => Object.assign(new Error(estado), { estado });

export function crearAlmacenFirebase(config, { rol = 'atleta' } = {}) {
  // Una instancia por rol: la del entrenador guarda su sesión aparte de la anónima del atleta.
  const app = initializeApp(config, rol === 'entrenador' ? 'entrenador' : '[DEFAULT]');
  const auth = getAuth(app);
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  if (usarEmulador()) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }

  const ref = (...ruta) => doc(db, ...ruta);
  const col = (...ruta) => collection(db, ...ruta);
  async function uidAnonimo() {
    await auth.authStateReady();
    if (!auth.currentUser) await signInAnonymously(auth);
    return auth.currentUser.uid;
  }
  async function leerSesiones(atletaId, desde, hasta) {
    try {
      const r = await getDocs(query(col('atletas', atletaId, 'sesiones'), where('fecha', '>=', desde), where('fecha', '<=', hasta)));
      return ordenarSesiones(r.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (e) { throw sinPermiso(e) ? errorEstado('desactivado') : e; }
  }
  const registroDe = (snap) => (snap.exists() ? { ...snap.data(), actualizado: aMilis(snap.data().actualizado) } : null);

  const almacen = {
    tipo: 'firebase',

    // ---------- Atleta ----------

    async comprobar(codigo) {
      const s = await getDoc(ref('codigos', codigo)); // sin conexión, la última copia guardada
      if (!s.exists()) return 'no-existe';
      return s.data().activo ? 'activo' : 'desactivado';
    },

    async entrar(codigo, _dispositivo, aceptacion = null) {
      let c;
      try { c = await getDoc(ref('codigos', codigo)); } catch { return { ok: false, motivo: 'sin-conexion' }; }
      if (!c.exists()) return { ok: false, motivo: 'no-existe' };
      if (!c.data().activo) return { ok: false, motivo: 'desactivado' };
      const uid = await uidAnonimo();
      const registro = setDoc(ref('codigos', codigo, 'dispositivos', uid), { alta: serverTimestamp(), privacidad: aceptacion ?? null });
      if (await conTiempo(registro.catch(() => {}), 10000) === 'pendiente') return { ok: false, motivo: 'sin-conexion' };
      try { await registro; } catch (e) { return { ok: false, motivo: sinPermiso(e) ? 'desactivado' : 'sin-conexion' }; }
      const a = await getDoc(ref('atletas', c.data().atleta));
      return { ok: true, atleta: { id: a.id, nombre: a.data().nombre } };
    },

    sesionesEntre: leerSesiones,

    async sesion(atletaId, sid) {
      try {
        const s = await getDoc(ref('atletas', atletaId, 'sesiones', sid));
        return s.exists() ? { ...s.data(), id: s.id } : null;
      } catch (e) { throw sinPermiso(e) ? errorEstado('desactivado') : e; }
    },

    async registros(atletaId, sids) {
      try {
        const snaps = await Promise.all(sids.map((sid) => getDoc(ref('atletas', atletaId, 'registros', sid))));
        return Object.fromEntries(snaps.filter((s) => s.exists()).map((s) => [s.id, registroDe(s)]));
      } catch (e) { throw sinPermiso(e) ? errorEstado('desactivado') : e; }
    },

    async guardarRegistro(atletaId, _codigo, datos) {
      let sesion;
      try { sesion = await almacen.sesion(atletaId, datos.sesion); } catch (e) {
        if (e.estado) return { ok: false, estado: e.estado, errores: ['Tu código ya no está activo.'] };
        throw e;
      }
      if (!sesion) return { ok: false, errores: ['Esa sesión ya no existe.'] };
      const r = validarRegistro(datos, sesion);
      if (!r.ok) return r;
      await uidAnonimo();
      const escritura = setDoc(ref('atletas', atletaId, 'registros', sesion.id), { ...r.registro, actualizado: serverTimestamp() });
      let fallo = null;
      escritura.catch((e) => { fallo = e; });
      const resultado = await conTiempo(escritura.catch(() => {}), ESPERA_ESCRITURA);
      if (fallo) return sinPermiso(fallo) ? { ok: false, estado: 'desactivado', errores: ['Tu código ya no está activo.'] } : { ok: false, errores: ['No se ha podido guardar.'] };
      return { ok: true, pendiente: resultado === 'pendiente', registro: { ...r.registro, actualizado: Date.now() } };
    },

    async politica() {
      try {
        const s = await getDoc(ref('club', 'politica'));
        return s.exists() ? s.data() : politicaPorDefecto();
      } catch { return politicaPorDefecto(); }
    },

    async registrarAceptacion(codigo, _dispositivo, aceptacion) {
      const uid = await uidAnonimo();
      try {
        await setDoc(ref('codigos', codigo, 'dispositivos', uid), { alta: serverTimestamp(), privacidad: aceptacion });
        return { ok: true };
      } catch (e) { return sinPermiso(e) ? { ok: false, estado: 'desactivado' } : { ok: true }; }
    },

    // ---------- Entrenador ----------

    async entrarEntrenador(email, clave) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, clave);
        const ficha = await getDoc(ref('entrenadores', cred.user.uid));
        if (!ficha.exists()) { await signOut(auth); return { ok: false, error: 'Esta cuenta no es de entrenador.' }; }
        return { ok: true, nombre: ficha.data().nombre ?? 'Entrenador' };
      } catch (e) {
        const c = e?.code ?? '';
        if (c === 'permission-denied') return { ok: false, error: 'Faltan las reglas de seguridad en Firebase: pégalas siguiendo PUESTA-EN-MARCHA.md.' };
        if (c.includes('too-many-requests')) return { ok: false, error: 'Demasiados intentos. Espera unos minutos.' };
        if (c.includes('network')) return { ok: false, error: 'No hay conexión.' };
        if (c.includes('operation-not-allowed')) return { ok: false, error: 'El acceso con email no está activado en Firebase (Authentication → Método de acceso).' };
        return { ok: false, error: 'Email o contraseña incorrectos.' };
      }
    },

    async salirEntrenador() { await signOut(auth); },

    async entrenadorConectado() {
      await auth.authStateReady();
      const u = auth.currentUser;
      if (!u || u.isAnonymous) return false;
      try { return (await getDoc(ref('entrenadores', u.uid))).exists(); } catch { return false; }
    },

    async listarAtletas() {
      const r = await getDocs(col('atletas'));
      const lista = await Promise.all(r.docs.map((d) => resumen(d)));
      return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    },

    async atleta(id) {
      const d = await getDoc(ref('atletas', id));
      return d.exists() ? resumen(d) : null;
    },

    async crearAtleta(nombre, rng) {
      const limpio = String(nombre ?? '').trim();
      if (!limpio) return { ok: false, errores: ['Escribe el nombre del atleta.'] };
      if (limpio.length > 40) return { ok: false, errores: ['El nombre es demasiado largo.'] };
      const id = generarId(rng);
      const codigo = await codigoLibre(limpio, rng);
      const b = writeBatch(db);
      b.set(ref('atletas', id), { nombre: limpio, codigo, activo: true, archivado: false, creado: serverTimestamp() });
      b.set(ref('codigos', codigo), { atleta: id, activo: true });
      await b.commit();
      return { ok: true, atleta: { id, nombre: limpio, codigo, activo: true, archivado: false, dispositivos: 0 } };
    },

    async cambiarActivo(id, activo) {
      const a = await getDoc(ref('atletas', id));
      if (!a.exists()) return { ok: false };
      const b = writeBatch(db);
      b.update(ref('atletas', id), activo ? { activo: true, archivado: false } : { activo: false });
      b.update(ref('codigos', a.data().codigo), { activo: !!activo });
      await b.commit();
      return { ok: true, atleta: await almacen.atleta(id) };
    },

    async regenerarCodigo(id, rng) {
      const a = await getDoc(ref('atletas', id));
      if (!a.exists()) return { ok: false };
      const anterior = a.data().codigo;
      const nuevo = await codigoLibre(a.data().nombre, rng);
      const moviles = await getDocs(col('codigos', anterior, 'dispositivos'));
      const b = writeBatch(db);
      moviles.docs.forEach((m) => b.delete(m.ref));
      b.delete(ref('codigos', anterior));
      b.set(ref('codigos', nuevo), { atleta: id, activo: !!a.data().activo });
      b.update(ref('atletas', id), { codigo: nuevo });
      await b.commit();
      return { ok: true, atleta: await almacen.atleta(id) };
    },

    async archivarAtleta(id) {
      const a = await getDoc(ref('atletas', id));
      if (!a.exists()) return { ok: false };
      const b = writeBatch(db);
      b.update(ref('atletas', id), { activo: false, archivado: true });
      b.update(ref('codigos', a.data().codigo), { activo: false });
      await b.commit();
      return { ok: true };
    },

    async borrarAtleta(id) {
      const a = await getDoc(ref('atletas', id));
      if (!a.exists()) return { ok: false };
      const codigo = a.data().codigo;
      const [ses, regs, moviles] = await Promise.all([
        getDocs(col('atletas', id, 'sesiones')), getDocs(col('atletas', id, 'registros')), getDocs(col('codigos', codigo, 'dispositivos')),
      ]);
      const refs = [...ses.docs, ...regs.docs, ...moviles.docs].map((d) => d.ref);
      for (let i = 0; i < refs.length; i += 400) {
        const b = writeBatch(db);
        refs.slice(i, i + 400).forEach((r) => b.delete(r));
        await b.commit();
      }
      const b = writeBatch(db);
      b.delete(ref('codigos', codigo));
      b.delete(ref('atletas', id));
      await b.commit();
      return { ok: true };
    },

    async todoDelAtleta(id) {
      const a = await getDoc(ref('atletas', id));
      const [ses, regs] = await Promise.all([getDocs(col('atletas', id, 'sesiones')), getDocs(col('atletas', id, 'registros'))]);
      return {
        atleta: { ...a.data(), id },
        sesiones: ses.docs.map((d) => ({ ...d.data(), id: d.id })),
        registros: Object.fromEntries(regs.docs.map((d) => [d.id, registroDe(d)])),
      };
    },

    async guardarSesion(atletaId, sesion) {
      const r = validarSesion(sesion);
      if (!r.ok) return r;
      const { id, ...datos } = r.sesion;
      await setDoc(ref('atletas', atletaId, 'sesiones', id), datos);
      await actualizarBiblioteca(r.sesion);
      return { ok: true, sesion: r.sesion };
    },

    async borrarSesion(atletaId, sid) {
      const b = writeBatch(db);
      b.delete(ref('atletas', atletaId, 'sesiones', sid));
      b.delete(ref('atletas', atletaId, 'registros', sid));
      await b.commit();
      return { ok: true };
    },

    async copiarSemana(atletaId, lunesOrigen, lunesDestino, rng) {
      const origen = await leerSesiones(atletaId, lunesOrigen, sumarDias(lunesOrigen, 6));
      const nuevas = copiarSemana(origen, lunesOrigen, lunesDestino, () => generarId(rng));
      const b = writeBatch(db);
      nuevas.forEach(({ id, ...datos }) => b.set(ref('atletas', atletaId, 'sesiones', id), datos));
      await b.commit();
      return { ok: true, copiadas: nuevas.length };
    },

    async copiarSesionA(atletaOrigen, sid, atletaDestino, fecha, rng) {
      const s = await almacen.sesion(atletaOrigen, sid);
      if (!s) return { ok: false, errores: ['No se ha podido copiar.'] };
      const { id, ...datos } = copiarSesion(s, fecha, () => generarId(rng));
      await setDoc(ref('atletas', atletaDestino, 'sesiones', id), datos);
      return { ok: true, sesion: { ...datos, id } };
    },

    async biblioteca() {
      const s = await getDoc(ref('club', 'biblioteca'));
      return s.exists() ? (s.data().ejercicios ?? []) : [];
    },

    /** Las últimas valoraciones de cada atleta, juntas. Sin índices de grupo: nada que crear a mano. */
    async novedades(limite = 30) {
      const atletas = await getDocs(col('atletas'));
      const porAtleta = await Promise.all(atletas.docs.map(async (a) => {
        const regs = await getDocs(query(col('atletas', a.id, 'registros'), orderBy('actualizado', 'desc'), limit(10)));
        return Promise.all(regs.docs.map(async (r) => {
          const s = await getDoc(ref('atletas', a.id, 'sesiones', r.id));
          return s.exists() ? { atleta: { id: a.id, nombre: a.data().nombre }, sesion: { ...s.data(), id: s.id }, registro: registroDe(r) } : null;
        }));
      }));
      return porAtleta.flat().filter(Boolean)
        .sort((x, y) => (y.registro.actualizado ?? 0) - (x.registro.actualizado ?? 0))
        .slice(0, limite);
    },

    async guardarPolitica(datos, { pedirDeNuevo }) {
      const v = validarPolitica(datos);
      if (!v.ok) return v;
      const anterior = await almacen.politica();
      const nueva = publicarPolitica(anterior, v.politica, { pedirDeNuevo, fecha: new Date().toISOString() });
      await setDoc(ref('club', 'politica'), nueva);
      return { ok: true, politica: nueva };
    },

    async resumenAceptaciones() {
      const { version } = await almacen.politica();
      const atletas = (await getDocs(col('atletas'))).docs.filter((d) => d.data().activo && !d.data().archivado);
      const con = await Promise.all(atletas.map(async (a) => {
        const moviles = await getDocs(col('codigos', a.data().codigo, 'dispositivos'));
        return moviles.docs.some((m) => m.data().privacidad?.version === version);
      }));
      return { aceptada: con.filter(Boolean).length, total: atletas.length, version };
    },
  };

  async function resumen(d) {
    const a = d.data();
    let dispositivos = 0;
    try { dispositivos = (await getCountFromServer(col('codigos', a.codigo, 'dispositivos'))).data().count; } catch { /* sin conexión */ }
    return { id: d.id, nombre: a.nombre, codigo: a.codigo, activo: !!a.activo, archivado: !!a.archivado, dispositivos };
  }

  async function codigoLibre(nombre, rng) {
    for (let i = 0; i < 20; i++) {
      const c = generarCodigo(nombre, rng);
      if (!(await getDoc(ref('codigos', c))).exists()) return c;
    }
    throw new Error('No se ha podido generar un código libre.');
  }

  async function actualizarBiblioteca(sesion) {
    const actual = await almacen.biblioteca();
    const juntas = nombresUsados([{ ejercicios: actual }, sesion]);
    if (juntas.length !== actual.length) await setDoc(ref('club', 'biblioteca'), { ejercicios: juntas.slice(0, 500) });
  }

  return almacen;
}
