// App del atleta: arranque, sesión guardada en el móvil y rutas.

import { crearAlmacen } from '../datos/almacen.js';
import { normalizarCodigo } from '../nucleo/codigos.js';
import { decidirEntrada, trasComprobar } from '../nucleo/entrada.js';
import { lunesDe, esFecha } from '../nucleo/fechas.js';
import { aplicarTema } from '../comun/tema.js';
import { hoy, fijarHoy, leerLocal, guardarLocal, borrarLocal, idDispositivo } from '../comun/entorno.js';
import { confirmar, tostada } from '../comun/ui.js';
import { registrarServiceWorker } from '../comun/registrar-sw.js';
import { pantallaEntrar } from './entrar.js';
import { pantallaSemana } from './semana.js';
import { pantallaSesion, pantallaValorar, pantallaHecho } from './sesion.js';
import { pantallaAjustes } from './ajustes.js';
import { pantallaMes } from './mes.js';
import { pedirPrivacidad, faltaAceptar, aceptacionGuardada, pantallaPrivacidad } from './privacidad.js';
import { politicaPorDefecto } from '../datos/textos-privacidad.js';
import { capturarInstalacion, debeOfrecerInstalar, pantallaInstalar } from './instalar.js';
import { leerMes, mesDe } from '../nucleo/calendario.js';

const CLAVE_SESION = 'beep_sesion';
const CLAVE_CERRADA = 'beep_cerrada'; // código del que se cerró sesión: su enlace ya no entra solo

// Historial propio de rutas, para que «volver» no entre en bucle (ver ctx.volver).
const normalizar = (ruta) => (!ruta || ruta === '#' ? '#/' : ruta);
const pila = [normalizar(location.hash)];
let reemplazando = false;

const ctx = {
  almacen: null,
  sesion: leerLocal(CLAVE_SESION),
  pantalla: '',
  hoy,
  lunesHoy: () => lunesDe(hoy()),
  ir(ruta) {
    if (normalizar(location.hash) === ruta) rutear(); else location.hash = ruta;
  },

  /**
   * Volver a la pantalla padre. Si se llegó desde ella, es «atrás» de verdad; si no, se sustituye
   * la entrada actual por el padre. Así nunca se forma un bucle entre dos pantallas.
   */
  volver(padre, esPadre = (r) => r === padre) {
    const anterior = pila[pila.length - 2];
    if (anterior && esPadre(anterior)) { history.back(); return; }
    if (normalizar(location.hash) === padre) { rutear(); return; }
    reemplazando = true;
    location.replace(`${location.pathname}${location.search}${padre}`);
  },

  /** Comprueba el código y entra. Pregunta antes si ya había otra sesión. Devuelve un error o null. */
  async entrarCon(codigo) {
    const anterior = ctx.sesion;
    // Primero se comprueba el código: no tiene sentido pedir nada con un enlace que no sirve.
    const estado = await ctx.almacen.comprobar(codigo).catch(() => 'sin-conexion');
    if (estado !== 'activo') return MENSAJES[estado];
    if (anterior && anterior.codigo !== codigo) {
      const si = await confirmar({
        titulo: '¿Cambiar de sesión?',
        texto: `Ahora tienes abierta la sesión de ${anterior.nombre}. ¿Seguro que quieres cerrar la sesión anterior para entrar en esta nueva sesión?`,
        aceptar: 'Cerrar y entrar',
        cancelar: 'Seguir como estoy',
      });
      if (!si) return 'cancelado';
    }
    // Protección de datos: antes de registrar este móvil y de guardar nada.
    let aceptacion = aceptacionGuardada();
    if (faltaAceptar(ctx.politica)) {
      ctx.pantalla = 'privacidad';
      aceptacion = await pedirPrivacidad(ctx.politica, { actualizada: !!aceptacion });
      if (!aceptacion) return MENSAJES['sin-privacidad'];
    }
    const r = await ctx.almacen.entrar(codigo, idDispositivo(), aceptacion).catch(() => ({ ok: false, motivo: 'sin-conexion' }));
    if (!r.ok) return MENSAJES[r.motivo] ?? MENSAJES['sin-conexion'];
    if (anterior) borrarBorradores(anterior.atletaId);
    borrarLocal(CLAVE_CERRADA);
    ctx.sesion = { codigo, atletaId: r.atleta.id, nombre: r.atleta.nombre };
    guardarLocal(CLAVE_SESION, ctx.sesion);
    ponerCodigoEnUrl(codigo);
    ctx.ir(debeOfrecerInstalar() ? '#/instalar' : '#/');
    return null;
  },

  cerrarSesion(aviso = null) {
    ctx.alSalir = null; // lo pendiente de la pantalla anterior ya no se puede guardar
    if (ctx.sesion) { borrarBorradores(ctx.sesion.atletaId); guardarLocal(CLAVE_CERRADA, ctx.sesion.codigo); }
    ctx.sesion = null;
    borrarLocal(CLAVE_SESION);
    ponerCodigoEnUrl(null);
    history.replaceState(null, '', location.pathname + location.search);
    pantallaEntrar(ctx, { aviso });
    ctx.pantalla = 'entrar';
  },

  /** Si el almacén dice que el código ya no vale, se cierra la sesión con un aviso. */
  async siCodigoInvalido(estado) {
    if (trasComprobar(estado) === 'cerrar-con-aviso') {
      ctx.cerrarSesion(MENSAJES[estado]);
      return true;
    }
    return false;
  },
};

export const MENSAJES = {
  'no-existe': 'No encontramos ese código. Revisa que esté bien escrito.',
  desactivado: 'Ese código está desactivado. Habla con tu entrenador.',
  'sin-conexion': 'No hay conexión. Inténtalo cuando tengas cobertura.',
  'sin-privacidad': 'Sin aceptar la protección de datos no podemos guardar tus entrenamientos. Puedes leerla otra vez al pulsar «Entrar».',
  activo: null,
};

function borrarBorradores(atletaId) {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(`beep_borrador_${atletaId}_`)).forEach((k) => localStorage.removeItem(k));
  } catch { /* nada */ }
}

function ponerCodigoEnUrl(codigo) {
  const q = new URLSearchParams(location.search);
  if (codigo) q.set('c', codigo); else q.delete('c');
  const texto = q.toString();
  history.replaceState(null, '', `${location.pathname}${texto ? `?${texto}` : ''}${location.hash}`);
}

function rutear() {
  const salida = ctx.alSalir;
  ctx.alSalir = null;
  salida?.();
  if (!ctx.sesion) { ctx.pantalla = 'entrar'; pantallaEntrar(ctx); return; }
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  const [seccion, id, accion] = partes;
  if (seccion === 'sesion' && id) {
    ctx.pantalla = accion === 'valorar' ? 'valorar' : accion === 'hecho' ? 'hecho' : 'sesion';
    if (accion === 'valorar') pantallaValorar(ctx, id);
    else if (accion === 'hecho') pantallaHecho(ctx, id);
    else pantallaSesion(ctx, id);
  } else if (seccion === 'ajustes') {
    ctx.pantalla = 'ajustes';
    pantallaAjustes(ctx);
  } else if (seccion === 'entrar') {
    ctx.pantalla = 'entrar';
    pantallaEntrar(ctx, { cambiando: true });
  } else if (seccion === 'instalar') {
    ctx.pantalla = 'instalar';
    pantallaInstalar(ctx, { directo: id === 'pasos' });
  } else if (seccion === 'privacidad') {
    ctx.pantalla = 'privacidad';
    pantallaPrivacidad(ctx);
  } else if (seccion === 'mes' || (!seccion && leerLocal('beep_vista') === 'mes')) {
    ctx.pantalla = 'mes';
    pantallaMes(ctx, leerMes(id) ?? mesDe(ctx.hoy()));
  } else {
    ctx.pantalla = 'semana';
    pantallaSemana(ctx, esFecha(id) ? lunesDe(id) : ctx.lunesHoy());
  }
}

async function arrancar() {
  aplicarTema();
  capturarInstalacion();
  ctx.almacen = await crearAlmacen();
  ctx.politica = await ctx.almacen.politica().catch(() => politicaPorDefecto());
  const crudo = new URLSearchParams(location.search).get('c');
  const codigoEnlace = crudo ? normalizarCodigo(crudo) : null;
  const accion = decidirEntrada(ctx.sesion, codigoEnlace);

  if (crudo && !codigoEnlace && !ctx.sesion) {
    ponerCodigoEnUrl(null);
    pantallaEntrar(ctx, { aviso: 'El código del enlace no es válido. Escríbelo a mano.' });
    ctx.pantalla = 'entrar';
  } else if (accion === 'entrar' && codigoEnlace === leerLocal(CLAVE_CERRADA)) {
    // Cerró sesión con este código: su enlace (o «atrás» y recargar) no vuelve a entrar solo.
    ponerCodigoEnUrl(null);
    pantallaEntrar(ctx, { codigo: codigoEnlace });
    ctx.pantalla = 'entrar';
  } else if (accion === 'entrar') {
    const error = await ctx.entrarCon(codigoEnlace);
    if (error) { ponerCodigoEnUrl(null); pantallaEntrar(ctx, { aviso: error, codigo: codigoEnlace }); ctx.pantalla = 'entrar'; }
  } else if (accion === 'confirmar-cambio') {
    rutear();
    const error = await ctx.entrarCon(codigoEnlace);
    if (error && error !== 'cancelado') tostada(`El enlace que has abierto no sirve. ${error}`);
    if (error) { ponerCodigoEnUrl(ctx.sesion.codigo); rutear(); }
  } else if (ctx.sesion && faltaAceptar(ctx.politica)) {
    // El entrenador ha publicado una versión nueva pidiendo aceptarla otra vez (o es una sesión de
    // antes de que hubiera protección de datos): se pide ahora, antes de seguir.
    ctx.pantalla = 'privacidad';
    const aceptacion = await pedirPrivacidad(ctx.politica, { actualizada: !!aceptacionGuardada() });
    if (!aceptacion) ctx.cerrarSesion(MENSAJES['sin-privacidad']);
    else {
      const r = await ctx.almacen.registrarAceptacion(ctx.sesion.codigo, idDispositivo(), aceptacion).catch(() => ({ ok: true }));
      // Sin salir de arrancar(): más abajo se registran las rutas y el service worker.
      if (!(r.estado && await ctx.siCodigoInvalido(r.estado))) {
        ponerCodigoEnUrl(ctx.sesion.codigo);
        rutear();
      }
    }
  } else {
    if (ctx.sesion) ponerCodigoEnUrl(ctx.sesion.codigo);
    rutear();
    if (ctx.sesion) {
      const estado = await ctx.almacen.comprobar(ctx.sesion.codigo).catch(() => 'sin-conexion');
      await ctx.siCodigoInvalido(estado);
    }
  }
  window.addEventListener('hashchange', () => {
    const actual = normalizar(location.hash);
    if (reemplazando) { pila[pila.length - 1] = actual; reemplazando = false; }
    else if (pila.length > 1 && pila[pila.length - 2] === actual) pila.pop();
    else pila.push(actual);
    rutear();
  });
  registrarServiceWorker('./sw.js');
}

// Ganchos de prueba (ver ARCHITECTURE.md).
window.__BEEP__ = {
  estado: () => ({ pantalla: ctx.pantalla, conSesion: !!ctx.sesion, almacen: ctx.almacen?.tipo ?? null, hoy: hoy() }),
  hoy: (fecha) => { fijarHoy(fecha); rutear(); },
  demo: async () => { await ctx.almacen?.reiniciar?.(); rutear(); },
};

// La herramienta de capturas del repositorio lee window.__JUEGO__.
window.__JUEGO__ = window.__BEEP__;

arrancar();
