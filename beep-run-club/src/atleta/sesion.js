// Una sesión: ejercicios que se marcan, datos de carrera opcionales, valoración y celebración.
// Lo que el atleta va marcando se guarda como borrador en el móvil hasta que valora.

import { h, icono, montar, agregar } from '../comun/ui.js';
import { leerLocal, guardarLocal, borrarLocal } from '../comun/entorno.js';
import { fechaLarga } from '../nucleo/fechas.js';
import { ESFUERZO, MAX_COMENTARIO } from '../nucleo/registro.js';
import { CAMPOS, leer, formatearCampo, completar } from '../nucleo/ritmo.js';
import { cabecera } from './semana.js';

const claveBorrador = (ctx, sid) => `beep_borrador_${ctx.sesion.atletaId}_${sid}`;

function borradorVacio() {
  return { hechos: [], carrera: {}, esfuerzo: null, duros: [], comentario: '', cambiado: false };
}

function desdeRegistro(r) {
  const b = borradorVacio();
  b.hechos = [...r.hechos];
  b.esfuerzo = r.esfuerzo;
  b.duros = [...r.duros];
  b.comentario = r.comentario ?? '';
  for (const [id, valores] of Object.entries(r.carrera ?? {})) b.carrera[id] = { valores: { ...valores }, calculado: null };
  return b;
}

async function cargar(ctx, sid) {
  const { atletaId } = ctx.sesion;
  const sesion = await ctx.almacen.sesion(atletaId, sid);
  if (!sesion) return { sesion: null };
  const registro = (await ctx.almacen.registros(atletaId, [sid]))[sid] ?? null;
  const guardado = leerLocal(claveBorrador(ctx, sid));
  const borrador = guardado ?? (registro ? desdeRegistro(registro) : borradorVacio());
  return { sesion, registro, borrador };
}

function noEncontrada(ctx) {
  montar(cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => ctx.ir('#/') } }),
    h('h1', { class: 'saludo' }, 'Esta sesión ya no está'),
    h('p', {}, 'Puede que tu entrenador la haya cambiado. Vuelve a tu semana para ver el plan actualizado.'),
    h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: () => ctx.ir('#/') }, 'Ver mi semana'));
}

export async function pantallaSesion(ctx, sid) {
  let datos;
  try { datos = await cargar(ctx, sid); } catch (e) {
    if (await ctx.siCodigoInvalido(e?.estado)) return;
    return noEncontrada(ctx);
  }
  const { sesion, registro, borrador } = datos;
  if (!sesion) return noEncontrada(ctx);
  const guardar = () => { borrador.cambiado = true; guardarLocal(claveBorrador(ctx, sid), borrador); };

  const contador = h('span', { class: 'suave', 'aria-live': 'polite' });
  const actualizarContador = () => { contador.textContent = `${borrador.hechos.length} de ${sesion.ejercicios.length} hechos`; };
  actualizarContador();

  const items = sesion.ejercicios.map((ej, i) => {
    const li = h('li', { class: `ejercicio${borrador.hechos.includes(ej.id) ? ' hecho' : ''}` });
    const marca = h('button', {
      type: 'button', class: 'marca', 'aria-pressed': String(borrador.hechos.includes(ej.id)),
      'aria-label': `Marcar «${ej.nombre}» como hecho`,
      onclick: () => {
        const hecho = !borrador.hechos.includes(ej.id);
        borrador.hechos = hecho ? [...borrador.hechos, ej.id] : borrador.hechos.filter((x) => x !== ej.id);
        marca.setAttribute('aria-pressed', String(hecho));
        li.classList.toggle('hecho', hecho);
        actualizarContador();
        guardar();
      },
    }, icono('check'));
    agregar(li, [
      h('div', { class: 'ejercicio-fila' },
        h('div', {},
          h('h3', {}, `${i + 1}. ${ej.nombre}`),
          ej.detalle ? h('p', { class: 'detalle' }, ej.detalle) : null,
          ej.nota ? h('p', { class: 'nota' }, ej.nota) : null),
        marca),
      ej.carrera ? bloqueCarrera(ej, borrador, guardar) : null]);
    return li;
  });

  const resumen = registro && !borrador.cambiado
    ? h('section', { class: 'resumen-valoracion bloque', 'aria-label': 'Tu valoración' },
      h('h3', {}, 'Sesión valorada'),
      h('p', { style: { margin: '4px 0 0' } }, `Esfuerzo ${registro.esfuerzo} · ${ESFUERZO[registro.esfuerzo]}`,
        registro.duros.length ? ` · ${registro.duros.length} ${registro.duros.length === 1 ? 'ejercicio duro' : 'ejercicios duros'}` : ''),
      registro.comentario ? h('p', { style: { margin: '6px 0 0' } }, `«${registro.comentario}»`) : null)
    : null;

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => history.length > 1 ? history.back() : ctx.ir('#/') } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, fechaLarga(sesion.fecha)),
    h('h1', {}, sesion.titulo),
    resumen,
    sesion.nota ? h('div', { class: 'nota-entrenador bloque' }, h('b', {}, 'Nota de tu entrenador'), h('p', { style: { margin: '4px 0 0' } }, sesion.nota)) : null,
    h('section', { class: 'bloque', 'aria-labelledby': 'titulo-ejercicios' },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } },
        h('h2', { id: 'titulo-ejercicios' }, 'Ejercicios'), contador),
      h('ol', { class: 'ejercicios', role: 'list' }, items)),
    h('div', { class: 'pie-fijo' },
      h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: () => ctx.ir(`#/sesion/${sid}/valorar`) },
        registro ? 'Editar valoración' : 'Terminar y valorar')),
  );
}

const ETIQUETAS = { distancia: 'Distancia (km)', tiempo: 'Tiempo', ritmo: 'Ritmo (/km)' };
const EJEMPLOS = { distancia: '5,2', tiempo: '28:30', ritmo: '5:29' };
const ERRORES = { distancia: 'la distancia', tiempo: 'el tiempo', ritmo: 'el ritmo' };

function bloqueCarrera(ej, borrador, guardar) {
  const datos = borrador.carrera[ej.id] ?? { valores: { distancia: null, tiempo: null, ritmo: null }, calculado: null };
  const tiene = CAMPOS.some((c) => datos.valores[c] != null);
  const idCampos = `carrera-${ej.id}`;
  const error = h('p', { class: 'error', 'aria-live': 'polite', style: { margin: '6px 0 0', fontSize: '15px' } });
  const entradas = {};

  const pintar = () => {
    for (const c of CAMPOS) {
      const v = datos.valores[c];
      if (document.activeElement !== entradas[c] || c === datos.calculado) entradas[c].value = v == null ? '' : formatearCampo[c](v);
      entradas[c].classList.toggle('calculado', c === datos.calculado);
    }
  };

  const alCambiar = (campo) => {
    const texto = entradas[campo].value;
    const v = leer[campo](texto);
    const malo = texto.trim() !== '' && v == null;
    entradas[campo].setAttribute('aria-invalid', String(malo));
    error.textContent = malo ? `No entiendo ${ERRORES[campo]}. Ejemplo: ${EJEMPLOS[campo]}.` : '';
    if (malo) return;
    const calculado = datos.calculado === campo ? null : datos.calculado;
    const r = completar({ ...datos.valores, [campo]: v }, calculado);
    datos.valores = r.valores;
    datos.calculado = r.calculado;
    borrador.carrera[ej.id] = datos;
    pintar();
    guardar();
  };

  const campos = h('div', { class: 'carrera-campos', id: idCampos, hidden: !tiene },
    CAMPOS.map((c) => {
      entradas[c] = h('input', {
        class: 'entrada', inputmode: 'decimal', autocomplete: 'off', placeholder: EJEMPLOS[c],
        onchange: () => alCambiar(c),
      });
      return h('label', {}, h('span', {}, ETIQUETAS[c]), entradas[c]);
    }));
  pintar();

  const abrir = h('button', {
    type: 'button', class: 'boton-texto', 'aria-expanded': String(tiene), 'aria-controls': idCampos,
    onclick: () => {
      const visible = campos.hidden;
      campos.hidden = !visible;
      abrir.setAttribute('aria-expanded', String(visible));
      if (visible) entradas.distancia.focus();
    },
  }, icono('reloj'), ' Distancia, tiempo y ritmo (opcional)');

  return h('div', { class: 'carrera' }, abrir, campos,
    h('p', { class: 'suave', style: { margin: '6px 0 0', fontSize: '14px' }, hidden: !tiene }, 'Con dos datos se calcula el tercero.'),
    error);
}

export async function pantallaValorar(ctx, sid) {
  let datos;
  try { datos = await cargar(ctx, sid); } catch (e) {
    if (await ctx.siCodigoInvalido(e?.estado)) return;
    return noEncontrada(ctx);
  }
  const { sesion, borrador } = datos;
  if (!sesion) return noEncontrada(ctx);
  const guardarBorrador = () => { borrador.cambiado = true; guardarLocal(claveBorrador(ctx, sid), borrador); };

  const texto = h('p', { class: 'esfuerzo-texto', 'aria-live': 'polite' });
  const pintarTexto = () => {
    texto.textContent = borrador.esfuerzo ? `${borrador.esfuerzo} · ${ESFUERZO[borrador.esfuerzo]}` : 'Toca un número: 1 es muy fácil y 10, al máximo.';
  };
  const botones = [];
  const elegir = (n, foco = false) => {
    borrador.esfuerzo = n;
    botones.forEach((b, i) => {
      b.setAttribute('aria-checked', String(i + 1 === n));
      b.tabIndex = i + 1 === n ? 0 : -1;
    });
    if (foco) botones[n - 1].focus();
    pintarTexto();
    guardarBorrador();
  };
  for (let n = 1; n <= 10; n++) {
    botones.push(h('button', {
      type: 'button', role: 'radio', 'aria-checked': String(borrador.esfuerzo === n),
      'aria-label': `${n}: ${ESFUERZO[n]}`, tabindex: (borrador.esfuerzo ?? 1) === n ? '0' : '-1',
      style: { '--n': n }, onclick: () => elegir(n),
    }, String(n)));
  }
  const grupo = h('div', {
    class: 'esfuerzo', role: 'radiogroup', 'aria-labelledby': 'titulo-esfuerzo',
    onkeydown: (e) => {
      const paso = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!paso) return;
      e.preventDefault();
      elegir(Math.min(10, Math.max(1, (borrador.esfuerzo ?? 0) + paso)), true);
    },
  }, botones);
  pintarTexto();

  const chips = sesion.ejercicios.map((ej) => {
    const chip = h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(borrador.duros.includes(ej.id)),
      onclick: () => {
        const duro = !borrador.duros.includes(ej.id);
        borrador.duros = duro ? [...borrador.duros, ej.id] : borrador.duros.filter((x) => x !== ej.id);
        chip.setAttribute('aria-pressed', String(duro));
        guardarBorrador();
      },
    }, ej.nombre);
    return chip;
  });

  const comentario = h('textarea', {
    id: 'comentario', class: 'entrada', maxlength: String(MAX_COMENTARIO),
    placeholder: 'Cómo te has sentido, molestias, lo que quieras contarle.',
    oninput: () => { borrador.comentario = comentario.value; guardarBorrador(); },
  });
  comentario.value = borrador.comentario;
  const error = h('p', { class: 'error', 'aria-live': 'polite' });
  const boton = h('button', { type: 'button', class: 'boton boton-principal boton-ancho' }, 'Guardar valoración');

  boton.addEventListener('click', async () => {
    if (!borrador.esfuerzo) {
      error.textContent = 'Indica cuánto te ha costado, del 1 al 10.';
      botones[0].focus();
      return;
    }
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    const carrera = Object.fromEntries(Object.entries(borrador.carrera).map(([id, d]) => [id, d.valores]));
    const r = await ctx.almacen.guardarRegistro(ctx.sesion.atletaId, ctx.sesion.codigo, {
      sesion: sid, hechos: borrador.hechos, esfuerzo: borrador.esfuerzo, duros: borrador.duros, carrera, comentario: borrador.comentario,
    }).catch(() => ({ ok: false, errores: ['No se ha podido guardar. Inténtalo de nuevo.'] }));
    boton.disabled = false;
    boton.textContent = 'Guardar valoración';
    if (!r.ok) {
      if (r.estado && await ctx.siCodigoInvalido(r.estado)) return;
      error.textContent = r.errores.join(' ');
      return;
    }
    borrarLocal(claveBorrador(ctx, sid));
    ctx.ultimoGuardado = { pendiente: !!r.pendiente };
    ctx.ir(`#/sesion/${sid}/hecho`);
  });

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la sesión', accion: () => ctx.ir(`#/sesion/${sid}`) } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, sesion.titulo),
    h('h1', { id: 'titulo-esfuerzo' }, '¿Cuánto te ha costado?'),
    grupo, texto,
    h('section', { class: 'bloque' },
      h('h2', {}, '¿Algún ejercicio te ha resultado demasiado duro?'),
      h('p', { class: 'suave', style: { margin: '6px 0 0' } }, 'Márcalos para que tu entrenador lo sepa.'),
      h('div', { class: 'chips' }, chips)),
    h('section', { class: 'bloque' },
      h('label', { class: 'campo', for: 'comentario' }, h('span', {}, 'Comentario (opcional)')),
      comentario),
    error,
    h('div', { class: 'pie-fijo' }, boton),
  );
}

export function pantallaHecho(ctx) {
  const pendiente = ctx.ultimoGuardado?.pendiente;
  montar(h('main', { class: 'celebracion' },
    h('div', { class: 'mascota', role: 'img', 'aria-label': 'La mascota de Beep corriendo con un café' }),
    h('h1', {}, '¡Sesión guardada!'),
    h('p', {}, pendiente ? 'No hay conexión: se enviará a tu entrenador en cuanto tengas cobertura.' : 'Tu entrenador ya puede ver cómo te ha ido.'),
    h('button', { type: 'button', class: 'boton boton-principal boton-ancho', style: { marginTop: '16px' }, onclick: () => ctx.ir('#/') }, 'Volver a mi semana')));
}
