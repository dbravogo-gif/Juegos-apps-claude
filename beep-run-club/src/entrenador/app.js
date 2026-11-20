// Panel del entrenador: arranque, acceso y rutas.

import { crearAlmacen } from '../datos/almacen.js';
import { aplicarTema } from '../comun/tema.js';
import { hoy, fijarHoy, leerLocal, guardarLocal, borrarLocal } from '../comun/entorno.js';
import { h, montar } from '../comun/ui.js';
import { lunesDe, esFecha } from '../nucleo/fechas.js';
import { pantallaNovedades } from './novedades.js';
import { pantallaAtletas, pantallaAtleta } from './atletas.js';
import { pantallaEditor } from './editor.js';
import { pantallaClub } from './club.js';
import { registrarServiceWorker } from '../comun/registrar-sw.js';

const CLAVE_DEMO = 'beep_entrenador_demo';

const ctx = {
  almacen: null,
  dentro: false,
  turno: 0, // sube en cada cambio de pantalla: lo que llega tarde de la anterior no se pinta
  pantalla: '',
  hoy,
  lunesHoy: () => lunesDe(hoy()),
  ir(ruta) { if (location.hash === ruta) rutear(); else location.hash = ruta; },
  async salir() {
    await ctx.almacen.salirEntrenador();
    borrarLocal(CLAVE_DEMO);
    ctx.dentro = false;
    rutear();
  },
};

function pantallaAcceso(error = '') {
  ctx.pantalla = 'acceso';
  const demo = ctx.almacen.tipo === 'demo';
  const email = h('input', { id: 'email', class: 'entrada', type: 'email', autocomplete: 'username', required: true });
  const clave = h('input', { id: 'clave', class: 'entrada', type: 'password', autocomplete: 'current-password', required: true });
  const aviso = h('p', { class: 'error', 'aria-live': 'polite' }, error);
  const boton = h('button', { type: 'submit', class: 'boton boton-principal boton-ancho' }, demo ? 'Entrar (modo demo)' : 'Entrar');
  montar(h('main', { class: 'entrada-pantalla' },
    h('div', { class: 'logo-completo', role: 'img', 'aria-label': 'Beep Run Club' }),
    h('h1', {}, 'Panel del entrenador'),
    h('p', { class: 'intro suave' }, demo ? 'Modo demo: sin contraseña y con los mismos datos de ejemplo que la app del atleta en este navegador.' : 'Entra con tu email y tu contraseña.'),
    h('form', {
      class: 'pila', novalidate: true,
      onsubmit: async (e) => {
        e.preventDefault();
        boton.disabled = true;
        const r = await ctx.almacen.entrarEntrenador(email.value.trim(), clave.value).catch(() => ({ ok: false, error: 'No hay conexión.' }));
        boton.disabled = false;
        if (!r.ok) { aviso.textContent = r.error ?? 'Email o contraseña incorrectos.'; return; }
        if (demo) guardarLocal(CLAVE_DEMO, true);
        ctx.dentro = true;
        ctx.ir('#/novedades');
      },
    },
    demo ? null : [h('label', { class: 'campo', for: 'email' }, h('span', {}, 'Email')), email,
      h('label', { class: 'campo', for: 'clave' }, h('span', {}, 'Contraseña')), clave],
    aviso, boton)));
}

function rutear() {
  ctx.turno += 1;
  if (!ctx.dentro) return pantallaAcceso();
  const [seccion, id, sub, extra] = location.hash.replace(/^#\/?/, '').split('/');
  if (seccion === 'atletas') { ctx.pantalla = 'atletas'; return pantallaAtletas(ctx); }
  if (seccion === 'club') { ctx.pantalla = 'club'; return pantallaClub(ctx); }
  if (seccion === 'atleta' && id) {
    if (sub === 'sesion' && extra) { ctx.pantalla = 'editor'; return pantallaEditor(ctx, id, { sid: extra }); }
    if (sub === 'nueva') { ctx.pantalla = 'editor'; return pantallaEditor(ctx, id, { fecha: esFecha(extra) ? extra : hoy() }); }
    ctx.pantalla = 'atleta';
    return pantallaAtleta(ctx, id, esFecha(sub) ? lunesDe(sub) : ctx.lunesHoy());
  }
  ctx.pantalla = 'novedades';
  return pantallaNovedades(ctx);
}

async function arrancar() {
  aplicarTema();
  ctx.almacen = await crearAlmacen({ rol: 'entrenador' });
  ctx.dentro = ctx.almacen.tipo === 'demo' ? !!leerLocal(CLAVE_DEMO) : await ctx.almacen.entrenadorConectado();
  window.addEventListener('hashchange', rutear);
  rutear();
  registrarServiceWorker('../sw.js');
}

window.__BEEP__ = {
  estado: () => ({ pantalla: ctx.pantalla, dentro: ctx.dentro, almacen: ctx.almacen?.tipo ?? null, hoy: hoy() }),
  hoy: (fecha) => { fijarHoy(fecha); rutear(); },
};
window.__JUEGO__ = window.__BEEP__;

arrancar();
