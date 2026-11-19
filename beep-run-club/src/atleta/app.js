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

const CLAVE_SESION = 'beep_sesion';

const ctx = {
  almacen: null,
  sesion: leerLocal(CLAVE_SESION),
  pantalla: '',
  hoy,
  lunesHoy: () => lunesDe(hoy()),
  ir(ruta) {
    if (location.hash === ruta) rutear(); else location.hash = ruta;
  },

  /** Comprueba el código y entra. Pregunta antes si ya había otra sesión. Devuelve un error o null. */
  async entrarCon(codigo) {
    const anterior = ctx.sesion;
    if (anterior && anterior.codigo !== codigo) {
      const estado = await ctx.almacen.comprobar(codigo).catch(() => 'sin-conexion');
      if (estado !== 'activo') return MENSAJES[estado];
      const si = await confirmar({
        titulo: '¿Cambiar de sesión?',
        texto: `Ahora tienes abierta la sesión de ${anterior.nombre}. ¿Seguro que quieres cerrar la sesión anterior para entrar en esta nueva sesión?`,
        aceptar: 'Cerrar y entrar',
        cancelar: 'Seguir como estoy',
      });
      if (!si) return 'cancelado';
    }
    const r = await ctx.almacen.entrar(codigo, idDispositivo()).catch(() => ({ ok: false, motivo: 'sin-conexion' }));
    if (!r.ok) return MENSAJES[r.motivo] ?? MENSAJES['sin-conexion'];
    if (anterior) borrarBorradores(anterior.atletaId);
    ctx.sesion = { codigo, atletaId: r.atleta.id, nombre: r.atleta.nombre };
    guardarLocal(CLAVE_SESION, ctx.sesion);
    ponerCodigoEnUrl(codigo);
    ctx.ir('#/');
    return null;
  },

  cerrarSesion(aviso = null) {
    if (ctx.sesion) borrarBorradores(ctx.sesion.atletaId);
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
  } else {
    ctx.pantalla = 'semana';
    pantallaSemana(ctx, esFecha(id) ? lunesDe(id) : ctx.lunesHoy());
  }
}

async function arrancar() {
  aplicarTema();
  ctx.almacen = await crearAlmacen();
  const crudo = new URLSearchParams(location.search).get('c');
  const codigoEnlace = crudo ? normalizarCodigo(crudo) : null;
  const accion = decidirEntrada(ctx.sesion, codigoEnlace);

  if (crudo && !codigoEnlace && !ctx.sesion) {
    ponerCodigoEnUrl(null);
    pantallaEntrar(ctx, { aviso: 'El código del enlace no es válido. Escríbelo a mano.' });
    ctx.pantalla = 'entrar';
  } else if (accion === 'entrar') {
    const error = await ctx.entrarCon(codigoEnlace);
    if (error) { ponerCodigoEnUrl(null); pantallaEntrar(ctx, { aviso: error, codigo: codigoEnlace }); ctx.pantalla = 'entrar'; }
  } else if (accion === 'confirmar-cambio') {
    rutear();
    const error = await ctx.entrarCon(codigoEnlace);
    if (error && error !== 'cancelado') tostada(`El enlace que has abierto no sirve. ${error}`);
    if (error) ponerCodigoEnUrl(ctx.sesion.codigo);
  } else {
    if (ctx.sesion) ponerCodigoEnUrl(ctx.sesion.codigo);
    rutear();
    if (ctx.sesion) {
      const estado = await ctx.almacen.comprobar(ctx.sesion.codigo).catch(() => 'sin-conexion');
      await ctx.siCodigoInvalido(estado);
    }
  }
  window.addEventListener('hashchange', rutear);
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
