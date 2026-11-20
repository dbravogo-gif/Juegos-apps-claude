// Club: responsable de los datos y política de protección de datos. Al guardar se elige si los
// atletas tienen que aceptarla de nuevo (cambios de fondo) o si es solo una corrección.

import { h, icono, montar, dialogo, confirmar, tostada } from '../comun/ui.js';
import { validarPolitica, MAX_POLITICA } from '../nucleo/privacidad.js';
import { politicaPorDefecto } from '../datos/textos-privacidad.js';
import { cabeceraPanel, pestanas } from './comun.js';

const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export async function pantallaClub(ctx) {
  const [politica, resumen] = await Promise.all([ctx.almacen.politica(), ctx.almacen.resumenAceptaciones()]);
  const borrador = structuredClone(politica);
  const errores = h('div', { class: 'error', role: 'alert', 'aria-live': 'polite' });
  const limpiarErrores = () => errores.replaceChildren();

  const nombre = h('input', { id: 'resp-nombre', class: 'entrada', maxlength: String(MAX_POLITICA.nombre), value: borrador.responsable?.nombre ?? '',
    placeholder: 'Nombre y apellidos, o el del club', oninput: () => { borrador.responsable.nombre = nombre.value; limpiarErrores(); } });
  const email = h('input', { id: 'resp-email', class: 'entrada', type: 'email', inputmode: 'email', autocomplete: 'email', value: borrador.responsable?.email ?? '',
    placeholder: 'email@ejemplo.com', oninput: () => { borrador.responsable.email = email.value; limpiarErrores(); } });
  const lineas = h('textarea', { id: 'resumen', class: 'entrada', rows: '6',
    oninput: () => { borrador.resumen = lineas.value.split('\n'); } });
  lineas.value = borrador.resumen.join('\n');

  const contenedor = h('div');
  const pintarSecciones = () => contenedor.replaceChildren(...borrador.secciones.map((sec, i) => {
    const titulo = h('input', { id: `sec-${i}-t`, class: 'entrada', maxlength: String(MAX_POLITICA.titulo), value: sec.titulo, oninput: () => { sec.titulo = titulo.value; } });
    const texto = h('textarea', { id: `sec-${i}-x`, class: 'entrada', rows: '5', maxlength: String(MAX_POLITICA.texto), oninput: () => { sec.texto = texto.value; } });
    texto.value = sec.texto;
    return h('fieldset', { class: 'ejercicio-editor' }, h('legend', {}, `Apartado ${i + 1}`),
      h('div', { class: 'pila' },
        h('div', {}, h('label', { class: 'campo', for: `sec-${i}-t` }, h('span', {}, 'Título')), titulo),
        h('div', {}, h('label', { class: 'campo', for: `sec-${i}-x` }, h('span', {}, 'Texto')), texto,
          h('p', { class: 'suave', style: { margin: '4px 0 0', fontSize: '14px' } }, 'Deja una línea en blanco para separar párrafos.'))),
      h('div', { class: 'herramientas' },
        h('button', { type: 'button', class: 'boton-icono', 'aria-label': `Quitar el apartado ${i + 1}`, onclick: () => { borrador.secciones.splice(i, 1); pintarSecciones(); } }, icono('cerrar'))));
  }));
  pintarSecciones();

  const guardar = h('button', { type: 'button', class: 'boton boton-principal boton-ancho' }, 'Guardar la política');
  guardar.addEventListener('click', async () => {
    const v = validarPolitica(borrador);
    if (!v.ok) { errores.replaceChildren(...v.errores.map((e) => h('p', { style: { margin: '4px 0' } }, e))); return; }
    errores.replaceChildren();
    const modo = await dialogo({
      titulo: '¿Cómo publicas los cambios?',
      texto: 'Si cambias qué datos se guardan, para qué se usan, con quién se comparten o quién es el responsable, los atletas tienen que aceptarla de nuevo. Para erratas o cambios de forma basta con corregir.',
      botones: [
        { texto: 'Pedir que la acepten de nuevo', valor: 'nueva', principal: true },
        { texto: 'Solo corregir', valor: 'corregir' },
        { texto: 'Cancelar', valor: null, foco: true },
      ],
    });
    if (!modo) return;
    const r = await ctx.almacen.guardarPolitica(v.politica, { pedirDeNuevo: modo === 'nueva' });
    if (!r.ok) { errores.textContent = r.errores.join(' '); return; }
    tostada(modo === 'nueva' ? 'Publicada: cada atleta la aceptará al abrir la app' : 'Política corregida');
    pantallaClub(ctx);
  });

  montar(
    cabeceraPanel(ctx), pestanas('club'),
    h('h1', { style: { fontSize: '24px', margin: '20px 0 4px' } }, 'Protección de datos'),
    h('p', { class: 'suave', style: { margin: 0 } },
      !politica.publicada ? 'Es el texto original que trae la app.'
        : `Versión que deben aceptar: la del ${fechaCorta(politica.version)}.${politica.publicada !== politica.version ? ` Última corrección: ${fechaCorta(politica.publicada)}.` : ''}`),
    h('p', { style: { margin: '4px 0 0', fontWeight: '600' } }, `La han aceptado ${resumen.aceptada} de ${resumen.total} atletas activos.`),
    h('section', { class: 'bloque pila' },
      h('h2', {}, 'Responsable de los datos'),
      h('div', {}, h('label', { class: 'campo', for: 'resp-nombre' }, h('span', {}, 'Nombre')), nombre),
      h('div', {}, h('label', { class: 'campo', for: 'resp-email' }, h('span', {}, 'Email de contacto')), email)),
    h('section', { class: 'bloque' },
      h('h2', {}, 'Resumen'),
      h('p', { class: 'suave', style: { margin: '4px 0 8px' } }, 'Lo primero que lee el atleta. Una idea por línea.'),
      lineas),
    h('section', { class: 'bloque' },
      h('h2', {}, 'Información completa'),
      contenedor,
      h('div', { class: 'acciones' },
        h('button', { type: 'button', class: 'boton', onclick: () => { borrador.secciones.push({ titulo: '', texto: '' }); pintarSecciones(); } }, icono('mas'), 'Añadir apartado'),
        h('button', {
          type: 'button', class: 'boton',
          onclick: async () => {
            if (!(await confirmar({ titulo: '¿Volver al texto original?', texto: 'Se sustituyen el resumen y los apartados por los que trae la app. El responsable se mantiene. No se publica hasta que guardes.', aceptar: 'Volver al original' }))) return;
            const original = politicaPorDefecto();
            borrador.resumen = original.resumen;
            borrador.secciones = original.secciones;
            lineas.value = borrador.resumen.join('\n');
            pintarSecciones();
          },
        }, 'Volver al texto original'))),
    h('p', { class: 'suave bloque', style: { fontSize: '15px' } }, 'El texto original lo redactó Claude a partir de lo que guarda la app, sin asesoría jurídica: revisadlo antes de usarlo con atletas reales.'),
    h('div', { class: 'pie-fijo' }, errores, guardar),
  );
}
