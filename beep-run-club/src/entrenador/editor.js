// Editor de una sesión: fecha, título, nota y ejercicios (con la casilla «de carrera»).
// Arriba, la valoración del atleta si ya la hay.

import { h, icono, montar, dialogo, confirmar, tostada, grupoRadio } from '../comun/ui.js';
import { rngSeguro } from '../comun/entorno.js';
import { generarId } from '../nucleo/codigos.js';
import { validarSesion, MAX, INTENSIDADES } from '../nucleo/plan.js';
import { fechaLarga, lunesDe } from '../nucleo/fechas.js';
import { cabeceraPanel, bloqueValoracion } from './comun.js';

const nuevoId = () => generarId(rngSeguro);
const ejercicioVacio = () => ({ id: nuevoId(), nombre: '', detalle: '', nota: '', carrera: false });

export async function pantallaEditor(ctx, atletaId, { sid = null, fecha = null }) {
  const atleta = await ctx.almacen.atleta(atletaId);
  const original = sid ? await ctx.almacen.sesion(atletaId, sid) : null;
  if (!atleta || (sid && !original)) {
    montar(cabeceraPanel(ctx, { atras: { etiqueta: 'Volver', accion: () => ctx.ir(`#/atleta/${atletaId}`) } }),
      h('h1', { class: 'saludo' }, 'Esta sesión ya no existe'));
    return;
  }
  const registro = sid ? (await ctx.almacen.registros(atletaId, [sid]))[sid] : null;
  const biblioteca = await ctx.almacen.biblioteca();
  const porNombre = new Map(biblioteca.map((b) => [b.nombre.toLowerCase(), b]));

  const sesion = original
    ? structuredClone(original)
    : { id: nuevoId(), fecha, titulo: '', nota: '', intensidad: 'suave', ejercicios: [ejercicioVacio()] };
  let sucio = false;
  const marcarSucio = () => { sucio = true; };
  const volver = async () => {
    if (sucio && !(await confirmar({ titulo: '¿Salir sin guardar?', texto: 'Perderás los cambios de esta sesión.', aceptar: 'Salir sin guardar', cancelar: 'Seguir editando' }))) return;
    ctx.ir(`#/atleta/${atletaId}/${lunesDe(sesion.fecha)}`);
  };

  const campoFecha = h('input', { id: 'fecha', class: 'entrada', type: 'date', value: sesion.fecha, required: true,
    onchange: () => { sesion.fecha = campoFecha.value; marcarSucio(); } });
  const campoTitulo = h('input', { id: 'titulo', class: 'entrada', maxlength: String(MAX.titulo), value: sesion.titulo, placeholder: 'Por ejemplo, Series cortas',
    oninput: () => { sesion.titulo = campoTitulo.value; marcarSucio(); } });
  const campoNota = h('textarea', { id: 'nota', class: 'entrada', maxlength: String(MAX.nota), placeholder: 'Indicaciones para el atleta (opcional)',
    oninput: () => { sesion.nota = campoNota.value; marcarSucio(); } });
  campoNota.value = sesion.nota;

  const contenedor = h('div');
  const pintarEjercicios = (foco = null) => {
    contenedor.replaceChildren(...sesion.ejercicios.map((ej, i) => editorEjercicio(ej, i)));
    if (foco != null) contenedor.querySelectorAll('input[name="nombre"]')[foco]?.focus();
  };
  const mover = (i, paso) => {
    const j = i + paso;
    if (j < 0 || j >= sesion.ejercicios.length) return;
    [sesion.ejercicios[i], sesion.ejercicios[j]] = [sesion.ejercicios[j], sesion.ejercicios[i]];
    marcarSucio();
    pintarEjercicios(j);
  };

  function editorEjercicio(ej, i) {
    const n = i + 1;
    const pre = `ej-${ej.id}`;
    const casilla = h('input', { type: 'checkbox', id: `${pre}-carrera`, checked: ej.carrera,
      onchange: () => { ej.carrera = casilla.checked; marcarSucio(); } });
    const nombre = h('input', { id: `${pre}-nombre`, name: 'nombre', class: 'entrada', list: 'biblioteca', maxlength: String(MAX.nombre), value: ej.nombre, autocomplete: 'off',
      oninput: () => { ej.nombre = nombre.value; marcarSucio(); },
      onchange: () => {
        const conocido = porNombre.get(nombre.value.trim().toLowerCase());
        if (conocido?.carrera && !ej.carrera) { ej.carrera = true; casilla.checked = true; }
      } });
    const detalle = h('textarea', { id: `${pre}-detalle`, class: 'entrada', rows: '2', maxlength: String(MAX.detalle), placeholder: 'Series, tiempos, ritmos…',
      style: { minHeight: '64px' }, oninput: () => { ej.detalle = detalle.value; marcarSucio(); } });
    detalle.value = ej.detalle;
    const nota = h('input', { id: `${pre}-nota`, class: 'entrada', maxlength: String(MAX.nota), value: ej.nota, placeholder: 'Opcional',
      oninput: () => { ej.nota = nota.value; marcarSucio(); } });
    return h('fieldset', { class: 'ejercicio-editor' },
      h('legend', {}, `Ejercicio ${n}`),
      h('div', { class: 'pila' },
        h('div', { class: 'dos' },
          h('div', {}, h('label', { class: 'campo', for: `${pre}-nombre` }, h('span', {}, 'Nombre')), nombre),
          h('div', {}, h('label', { class: 'campo', for: `${pre}-nota` }, h('span', {}, 'Nota')), nota)),
        h('div', {}, h('label', { class: 'campo', for: `${pre}-detalle` }, h('span', {}, 'Detalle')), detalle),
        h('label', { class: 'casilla', for: `${pre}-carrera` }, casilla,
          h('span', {}, 'De carrera ', h('small', {}, '(el atleta podrá apuntar distancia, tiempo y ritmo)')))),
      h('div', { class: 'herramientas' },
        h('button', { type: 'button', class: 'boton-icono', 'aria-label': `Subir el ejercicio ${n}`, disabled: i === 0, onclick: () => mover(i, -1) }, icono('arriba')),
        h('button', { type: 'button', class: 'boton-icono', 'aria-label': `Bajar el ejercicio ${n}`, disabled: i === sesion.ejercicios.length - 1, onclick: () => mover(i, 1) }, icono('abajo')),
        h('button', { type: 'button', class: 'boton-icono', 'aria-label': `Quitar el ejercicio ${n}`,
          onclick: () => { sesion.ejercicios.splice(i, 1); marcarSucio(); pintarEjercicios(); } }, icono('cerrar'))));
  }
  pintarEjercicios();

  const errores = h('div', { class: 'error', 'aria-live': 'polite', role: 'alert' });
  const guardar = h('button', {
    type: 'button', class: 'boton boton-principal boton-ancho',
    onclick: async () => {
      const limpia = { ...sesion, ejercicios: sesion.ejercicios.filter((e) => e.nombre.trim() || e.detalle.trim()) };
      const v = validarSesion(limpia);
      if (!v.ok) { errores.replaceChildren(...v.errores.map((e) => h('p', { style: { margin: '4px 0' } }, e))); return; }
      guardar.disabled = true;
      const r = await ctx.almacen.guardarSesion(atletaId, v.sesion);
      guardar.disabled = false;
      if (!r.ok) { errores.textContent = r.errores.join(' '); return; }
      sucio = false;
      tostada('Sesión guardada');
      ctx.ir(`#/atleta/${atletaId}/${lunesDe(v.sesion.fecha)}`);
    },
  }, 'Guardar sesión');

  const extras = original ? h('div', { class: 'acciones', style: { justifyContent: 'center' } },
    h('button', { type: 'button', class: 'boton', onclick: () => copiarAOtro(ctx, atletaId, original) }, 'Copiar a otro atleta'),
    h('button', {
      type: 'button', class: 'boton',
      onclick: async () => {
        const texto = registro ? `${atleta.nombre} ya la ha valorado: también se borrará su valoración.` : 'No se puede deshacer.';
        if (!(await confirmar({ titulo: '¿Borrar esta sesión?', texto, aceptar: 'Borrar sesión' }))) return;
        await ctx.almacen.borrarSesion(atletaId, original.id);
        sucio = false;
        tostada('Sesión borrada');
        ctx.ir(`#/atleta/${atletaId}/${lunesDe(original.fecha)}`);
      },
    }, 'Borrar sesión')) : null;

  montar(
    cabeceraPanel(ctx, { atras: { etiqueta: `Volver al plan de ${atleta.nombre}`, accion: volver } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, `${atleta.nombre} · ${original ? fechaLarga(original.fecha) : 'sesión nueva'}`),
    h('h1', {}, original ? 'Editar sesión' : 'Nueva sesión'),
    registro ? h('div', { class: 'bloque' }, bloqueValoracion(atleta.nombre, original, registro)) : null,
    h('datalist', { id: 'biblioteca' }, biblioteca.map((b) => h('option', { value: b.nombre }))),
    h('div', { class: 'pila bloque' },
      h('div', {}, h('label', { class: 'campo', for: 'fecha' }, h('span', {}, 'Fecha')), campoFecha),
      h('div', {}, h('label', { class: 'campo', for: 'titulo' }, h('span', {}, 'Título')), campoTitulo),
      h('div', { class: 'intensidad' }, grupoRadio({
        etiqueta: 'Intensidad', opciones: INTENSIDADES, valor: sesion.intensidad ?? 'suave',
        alElegir: (v) => { sesion.intensidad = v; marcarSucio(); },
      }), h('p', { class: 'suave', style: { margin: '6px 0 0', fontSize: '14px' } }, 'Es el color del día en el calendario del atleta.')),
      h('div', {}, h('label', { class: 'campo', for: 'nota' }, h('span', {}, 'Nota para el atleta')), campoNota)),
    h('h2', { class: 'bloque' }, 'Ejercicios'),
    contenedor,
    h('button', {
      type: 'button', class: 'boton boton-ancho', style: { marginTop: '12px' },
      onclick: () => { sesion.ejercicios.push(ejercicioVacio()); marcarSucio(); pintarEjercicios(sesion.ejercicios.length - 1); },
    }, icono('mas'), 'Añadir ejercicio'),
    extras,
    h('div', { class: 'pie-fijo' }, errores, guardar),
  );
}

async function copiarAOtro(ctx, atletaId, sesion) {
  const otros = (await ctx.almacen.listarAtletas()).filter((a) => a.id !== atletaId && !a.archivado);
  if (!otros.length) { tostada('No hay otros atletas'); return; }
  const select = h('select', { id: 'destino', class: 'entrada' }, otros.map((a) => h('option', { value: a.id }, a.nombre)));
  const fecha = h('input', { id: 'fecha-destino', class: 'entrada', type: 'date', value: sesion.fecha });
  let copiada = null;
  const r = await dialogo({
    titulo: 'Copiar a otro atleta',
    cuerpo: [h('label', { class: 'campo', for: 'destino' }, h('span', {}, 'Atleta')), select,
      h('label', { class: 'campo', for: 'fecha-destino', style: { marginTop: '12px' } }, h('span', {}, 'Fecha')), fecha],
    botones: [{ texto: 'Copiar', valor: 'copiar', principal: true }, { texto: 'Cancelar', valor: null }],
    alAceptar: async () => {
      const res = await ctx.almacen.copiarSesionA(atletaId, sesion.id, select.value, fecha.value || sesion.fecha, rngSeguro);
      copiada = res.ok ? select.value : null;
      return res.ok;
    },
  });
  if (r === 'copiar' && copiada) tostada(`Copiada a ${otros.find((a) => a.id === copiada).nombre}`);
}
