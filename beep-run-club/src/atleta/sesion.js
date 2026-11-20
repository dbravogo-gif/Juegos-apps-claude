// Una sesión: ejercicios que se marcan, datos de carrera opcionales, valoración y celebración.
// Antes de valorar, lo marcado se guarda como borrador en el móvil. Después de valorar, cada
// cambio se guarda en la valoración al momento.

import { h, icono, montar, agregar, grupoRadio } from '../comun/ui.js';
import { leerLocal, guardarLocal, borrarLocal } from '../comun/entorno.js';
import { fechaLarga } from '../nucleo/fechas.js';
import { ESFUERZO, MAX_COMENTARIO } from '../nucleo/registro.js';
import { CAMPOS, leer, formatearCampo, editarCarrera, estadoCarrera } from '../nucleo/ritmo.js';
import { cabecera, rutaSemana, esRutaCalendario } from './semana.js';

const claveBorrador = (ctx, sid) => `beep_borrador_${ctx.sesion.atletaId}_${sid}`;

function borradorVacio() {
  return { hechos: [], carrera: {}, esfuerzo: null, duros: [], comentario: '', strava: '', completa: null };
}

function desdeRegistro(r) {
  const b = borradorVacio();
  b.hechos = [...r.hechos];
  b.esfuerzo = r.esfuerzo;
  b.duros = [...r.duros];
  b.comentario = r.comentario ?? '';
  b.strava = r.strava ?? '';
  for (const [id, valores] of Object.entries(r.carrera ?? {})) b.carrera[id] = estadoCarrera(valores);
  return b;
}

/** Lo que se envía al almacén a partir del borrador. */
function datosRegistro(sid, b) {
  const carrera = Object.fromEntries(Object.entries(b.carrera).map(([id, d]) => [id, d.valores]));
  return { sesion: sid, hechos: b.hechos, esfuerzo: b.esfuerzo, duros: b.duros, carrera, comentario: b.comentario, strava: b.strava ?? '' };
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
  montar(cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => ctx.volver('#/') } }),
    h('h1', { class: 'saludo' }, 'Esta sesión ya no está'),
    h('p', {}, 'Puede que tu entrenador la haya cambiado. Vuelve a tu semana para ver el plan actualizado.'),
    h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: () => ctx.ir('#/') }, 'Ver mi semana'));
}

async function cargarOFallar(ctx, sid) {
  try {
    const datos = await cargar(ctx, sid);
    if (!datos.sesion) { noEncontrada(ctx); return null; }
    return datos;
  } catch (e) {
    if (!(await ctx.siCodigoInvalido(e?.estado))) noEncontrada(ctx);
    return null;
  }
}

export async function pantallaSesion(ctx, sid) {
  const datos = await cargarOFallar(ctx, sid);
  if (!datos) return;
  const { sesion, borrador } = datos;
  let { registro } = datos;
  const estadoGuardado = h('span', { class: 'suave', 'aria-live': 'polite' });

  // Antes de valorar: borrador local. Después: se actualiza la valoración (con una pausa corta
  // para no guardar en cada pulsación).
  let temporizador = null;
  const guardarAhora = async () => {
    temporizador = null;
    if (!ctx.sesion) return; // la sesión se cerró mientras tanto
    const r = await ctx.almacen.guardarRegistro(ctx.sesion.atletaId, ctx.sesion.codigo, datosRegistro(sid, borrador))
      .catch(() => ({ ok: false, errores: ['No se ha podido guardar.'] }));
    if (r.ok) { registro = r.registro; borrarLocal(claveBorrador(ctx, sid)); estadoGuardado.textContent = 'Cambios guardados'; }
    else if (r.estado && await ctx.siCodigoInvalido(r.estado)) return;
    else if (ctx.sesion) { guardarLocal(claveBorrador(ctx, sid), borrador); estadoGuardado.textContent = 'No se ha podido guardar. Se intentará al valorar.'; }
  };
  const guardar = () => {
    if (!registro) { guardarLocal(claveBorrador(ctx, sid), borrador); return; }
    estadoGuardado.textContent = 'Guardando…';
    clearTimeout(temporizador);
    temporizador = setTimeout(guardarAhora, 600);
  };
  // Al salir de la pantalla, lo pendiente se guarda ya: el temporizador no sobrevive a la pantalla.
  ctx.alSalir = () => { if (temporizador) { clearTimeout(temporizador); guardarAhora(); } };

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

  const resumen = registro
    ? h('section', { class: 'resumen-valoracion bloque', 'aria-label': 'Tu valoración' },
      h('h3', {}, 'Sesión valorada'),
      h('p', { style: { margin: '4px 0 0' } }, `Esfuerzo ${registro.esfuerzo} · ${ESFUERZO[registro.esfuerzo]}`,
        registro.duros.length ? ` · ${registro.duros.length} ${registro.duros.length === 1 ? 'ejercicio duro' : 'ejercicios duros'}` : ''),
      registro.comentario ? h('p', { style: { margin: '6px 0 0' } }, `«${registro.comentario}»`) : null,
      registro.strava ? h('p', { style: { margin: '6px 0 0' } }, 'Con enlace de Strava') : null,
      h('p', { style: { margin: '6px 0 0', fontSize: '15px' } }, 'Si marcas algo más, se guarda solo.'))
    : null;

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => ctx.volver(rutaSemana(ctx, sesion.fecha), esRutaCalendario) } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, fechaLarga(sesion.fecha)),
    h('h1', {}, sesion.titulo),
    resumen,
    sesion.nota ? h('div', { class: 'nota-entrenador bloque' }, h('b', {}, 'Nota de tu entrenador'), h('p', { style: { margin: '4px 0 0' } }, sesion.nota)) : null,
    h('section', { class: 'bloque', 'aria-labelledby': 'titulo-ejercicios' },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' } },
        h('h2', { id: 'titulo-ejercicios' }, 'Ejercicios'), contador),
      h('ol', { class: 'ejercicios', role: 'list' }, items)),
    h('div', { class: 'pie-fijo' },
      registro ? h('p', { style: { margin: '0 0 8px', textAlign: 'center' } }, estadoGuardado) : null,
      h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: () => ctx.ir(`#/sesion/${sid}/valorar`) },
        registro ? 'Editar valoración' : 'Terminar y valorar')),
  );
}

const ETIQUETAS = { distancia: 'Km', tiempo: 'Tiempo', ritmo: 'Ritmo/km' };
const EJEMPLOS = { distancia: '5,2', tiempo: '28,30', ritmo: '5,29' };
const ERRORES = {
  distancia: 'No entiendo la distancia. Escribe los km, por ejemplo 5,2.',
  tiempo: 'No entiendo el tiempo. Escribe 28,30 (28 min 30 s), 2830 o 1h05.',
  ritmo: 'No entiendo el ritmo. Escribe 5,29 (5 min 29 s por km) o 529.',
};

function bloqueCarrera(ej, borrador, guardar) {
  let estado = borrador.carrera[ej.id] ?? estadoCarrera(null);
  if (!estado.orden) estado = estadoCarrera(estado.valores); // borradores de la versión anterior
  const tiene = CAMPOS.some((c) => estado.valores[c] != null);
  const idCampos = `carrera-${ej.id}`;
  const aviso = h('p', { class: 'error', 'aria-live': 'polite', style: { margin: '6px 0 0', fontSize: '15px' } });
  const entradas = {};
  let calculado = estado.orden.length === 2 ? CAMPOS.find((c) => !estado.orden.includes(c)) : null;

  const pintar = (salvo = null) => {
    for (const c of CAMPOS) {
      const v = estado.valores[c];
      if (c !== salvo) entradas[c].value = v == null ? '' : formatearCampo[c](v);
      entradas[c].classList.toggle('calculado', c === calculado);
    }
  };

  const aplicar = (campo, v, mientrasEscribe) => {
    const r = editarCarrera(estado, campo, v);
    estado = { valores: r.valores, orden: r.orden };
    calculado = r.calculado;
    borrador.carrera[ej.id] = estado;
    pintar(mientrasEscribe ? campo : null);
    aviso.textContent = r.imposible ? 'Con esos datos sale un valor imposible: revisa lo que has escrito.' : '';
    guardar();
  };

  const alEscribir = (campo) => {
    const texto = entradas[campo].value;
    if (texto.trim() === '') { entradas[campo].setAttribute('aria-invalid', 'false'); aplicar(campo, null, true); return; }
    const v = leer[campo](texto);
    if (v != null) { entradas[campo].setAttribute('aria-invalid', 'false'); aviso.textContent = ''; aplicar(campo, v, true); }
  };

  const alSalir = (campo) => {
    const texto = entradas[campo].value;
    const v = leer[campo](texto);
    const malo = texto.trim() !== '' && v == null;
    entradas[campo].setAttribute('aria-invalid', String(malo));
    if (malo) { aviso.textContent = ERRORES[campo]; return; }
    pintar(); // reescribe con formato («2830» → «28:30»)
  };

  const campos = h('div', { class: 'carrera-campos', id: idCampos },
    CAMPOS.map((c) => {
      entradas[c] = h('input', {
        class: 'entrada', inputmode: 'decimal', autocomplete: 'off', placeholder: EJEMPLOS[c],
        'aria-label': `${ETIQUETAS[c]} de «${ej.nombre}»`,
        oninput: () => alEscribir(c), onchange: () => alSalir(c),
      });
      return h('label', {}, h('span', { 'aria-hidden': 'true' }, ETIQUETAS[c]), entradas[c]);
    }));
  pintar();
  const pista = h('p', { class: 'suave', style: { margin: '6px 0 0', fontSize: '14px' } },
    'Con dos datos se calcula el tercero. Para tiempo y ritmo vale la coma: 28,30 es 28:30.');
  const desplegable = h('div', { hidden: !tiene }, campos, pista);

  const abrir = h('button', {
    type: 'button', class: 'boton-texto', 'aria-expanded': String(tiene), 'aria-controls': idCampos,
    'aria-label': `Distancia, tiempo y ritmo de «${ej.nombre}» (opcional)`,
    onclick: () => {
      const visible = desplegable.hidden;
      desplegable.hidden = !visible;
      abrir.setAttribute('aria-expanded', String(visible));
      if (visible) entradas.distancia.focus();
    },
  }, icono('reloj'), ' Distancia, tiempo y ritmo (opcional)');

  return h('div', { class: 'carrera' }, abrir, desplegable, aviso);
}

export async function pantallaValorar(ctx, sid) {
  const datos = await cargarOFallar(ctx, sid);
  if (!datos) return;
  const { sesion, borrador } = datos;
  const todos = sesion.ejercicios.map((e) => e.id);
  const guardarBorrador = () => guardarLocal(claveBorrador(ctx, sid), borrador);
  const rutaSesion = `#/sesion/${sid}`;

  // ¿Toda la sesión o una parte? Así valorar rápido no le dice al entrenador «0 hechos».
  if (borrador.completa == null) {
    borrador.completa = borrador.hechos.length === 0 || borrador.hechos.length === todos.length;
  }
  const chipsHechos = h('div', { class: 'chips', hidden: borrador.completa });
  agregar(chipsHechos, sesion.ejercicios.map((ej) => {
    const chip = h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(borrador.hechos.includes(ej.id)),
      onclick: () => {
        const hecho = !borrador.hechos.includes(ej.id);
        borrador.hechos = hecho ? [...borrador.hechos, ej.id] : borrador.hechos.filter((x) => x !== ej.id);
        chip.setAttribute('aria-pressed', String(hecho));
        guardarBorrador();
      },
    }, ej.nombre);
    return chip;
  }));
  const textoParte = h('p', { class: 'suave', style: { margin: '10px 0 0' }, hidden: borrador.completa }, 'Marca lo que has hecho:');
  const completa = grupoRadio({
    etiqueta: '¿Has hecho toda la sesión?',
    opciones: [[true, 'Sí, toda'], [false, 'Solo una parte']],
    valor: borrador.completa,
    alElegir: (v) => {
      borrador.completa = v;
      chipsHechos.hidden = v;
      textoParte.hidden = v;
      guardarBorrador();
    },
  });

  const texto = h('p', { class: 'esfuerzo-texto', 'aria-live': 'polite' });
  const pintarTexto = () => {
    texto.classList.toggle('pista', !borrador.esfuerzo);
    texto.textContent = borrador.esfuerzo ? `${borrador.esfuerzo} · ${ESFUERZO[borrador.esfuerzo]}` : 'Del 1 (muy, muy fácil) al 10 (al máximo).';
  };
  const botones = [];
  const elegir = (n, foco = false) => {
    borrador.esfuerzo = n;
    botones.forEach((b, i) => {
      b.setAttribute('aria-checked', String(i + 1 === n));
      b.tabIndex = i + 1 === n ? 0 : -1;
    });
    if (foco) botones[n - 1].focus();
    error.textContent = '';
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

  const chipsDuros = sesion.ejercicios.map((ej) => {
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
  const strava = h('input', {
    id: 'strava', class: 'entrada', type: 'url', inputmode: 'url', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    placeholder: 'Pega el enlace de la actividad', value: borrador.strava ?? '',
    oninput: () => { borrador.strava = strava.value; guardarBorrador(); },
  });
  // El error va en el pie fijo, junto al botón: así siempre se ve.
  const error = h('p', { class: 'error', 'aria-live': 'assertive', style: { margin: '0 0 8px', textAlign: 'center' } });
  const boton = h('button', { type: 'button', class: 'boton boton-principal boton-ancho' }, 'Guardar valoración');
  pintarTexto();

  boton.addEventListener('click', async () => {
    if (!borrador.esfuerzo) {
      error.textContent = 'Falta lo principal: cuánto te ha costado, del 1 al 10.';
      grupo.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    const datosR = datosRegistro(sid, { ...borrador, hechos: borrador.completa ? todos : borrador.hechos });
    const r = await ctx.almacen.guardarRegistro(ctx.sesion.atletaId, ctx.sesion.codigo, datosR)
      .catch(() => ({ ok: false, errores: ['No se ha podido guardar. Inténtalo de nuevo.'] }));
    boton.disabled = false;
    boton.textContent = 'Guardar valoración';
    if (!r.ok) {
      if (r.estado && await ctx.siCodigoInvalido(r.estado)) return;
      error.textContent = r.errores.join(' ');
      return;
    }
    borrarLocal(claveBorrador(ctx, sid));
    ctx.ultimoGuardado = { sid, pendiente: !!r.pendiente };
    ctx.ir(`#/sesion/${sid}/hecho`);
  });

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la sesión', accion: () => ctx.volver(rutaSesion) } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, sesion.titulo),
    h('h1', { id: 'titulo-esfuerzo' }, '¿Cuánto te ha costado?'),
    grupo, texto,
    h('section', { class: 'bloque' }, completa, textoParte, chipsHechos),
    h('section', { class: 'bloque' },
      h('h2', {}, '¿Algún ejercicio te ha resultado demasiado duro?'),
      h('p', { class: 'suave', style: { margin: '6px 0 0' } }, 'Márcalos para que tu entrenador lo sepa.'),
      h('div', { class: 'chips chips-duros' }, chipsDuros)),
    h('section', { class: 'bloque' },
      h('label', { class: 'campo', for: 'comentario' }, h('span', {}, 'Comentario (opcional)')),
      comentario),
    h('section', { class: 'bloque' },
      h('label', { class: 'campo', for: 'strava' }, h('span', {}, 'Enlace de Strava (opcional)')),
      strava),
    h('div', { class: 'pie-fijo' }, error, boton),
  );
}

export function pantallaHecho(ctx, sid) {
  // Solo se celebra lo que se acaba de guardar (no una dirección escrita a mano).
  if (ctx.ultimoGuardado?.sid !== sid) { ctx.volver('#/'); return; }
  const pendiente = ctx.ultimoGuardado.pendiente;
  montar(h('main', { class: 'celebracion' },
    h('div', { class: 'mascota', role: 'img', 'aria-label': 'La mascota de Beep corriendo con un café' }),
    h('h1', {}, '¡Sesión guardada!'),
    h('p', {}, pendiente ? 'No hay conexión: se enviará a tu entrenador en cuanto tengas cobertura.' : 'Tu entrenador ya puede ver cómo te ha ido.'),
    h('button', { type: 'button', class: 'boton boton-principal boton-ancho', style: { marginTop: '16px' }, onclick: () => ctx.ir('#/') }, 'Volver a mi semana')));
}
