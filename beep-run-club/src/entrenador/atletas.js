// Atletas: la lista, las altas y la ficha de cada uno con su plan semanal.

import { h, icono, montar, dialogo, confirmar, tostada } from '../comun/ui.js';
import { rngSeguro } from '../comun/entorno.js';
import { agruparPorDia } from '../nucleo/plan.js';
import { ESFUERZO, esDura } from '../nucleo/registro.js';
import { etiquetaDia, rangoSemana, sumarDias, diferenciaDias } from '../nucleo/fechas.js';
import { historialCsv, nombreArchivo } from '../nucleo/exportar.js';
import { cabeceraPanel, pestanas, botonesEnlace, insigniaEsfuerzo } from './comun.js';

const textoEstado = (a) => (a.archivado ? 'Archivado' : a.activo ? 'Activo' : 'Código desactivado');

export async function pantallaAtletas(ctx) {
  const lista = h('ul', { class: 'lista', 'aria-busy': 'true' }, h('li', { class: 'vacio' }, 'Cargando…'));
  const archivados = h('div');
  montar(cabeceraPanel(ctx), pestanas('atletas'),
    h('div', { class: 'fila-titulo' },
      h('h1', { style: { fontSize: '24px' } }, 'Atletas'),
      h('button', { type: 'button', class: 'boton boton-principal', onclick: () => nuevoAtleta(ctx) }, icono('mas'), 'Nuevo atleta')),
    lista, archivados);

  const todos = await ctx.almacen.listarAtletas();
  const tarjeta = (a) => h('li', {}, h('a', { class: 'tarjeta', href: `#/atleta/${a.id}` },
    h('div', { class: 'linea1' }, h('h3', {}, a.nombre),
      h('span', { class: `estado-atleta${a.activo ? '' : ' inactivo'}` }, textoEstado(a))),
    h('p', { class: 'suave' }, `${a.codigo} · ${a.dispositivos} ${a.dispositivos === 1 ? 'móvil' : 'móviles'}`)));
  const vivos = todos.filter((a) => !a.archivado);
  lista.replaceChildren(...(vivos.length ? vivos.map(tarjeta) : [h('li', { class: 'vacio' }, 'Aún no hay atletas. Da de alta el primero.')]));
  lista.removeAttribute('aria-busy');
  const arch = todos.filter((a) => a.archivado);
  if (arch.length) {
    archivados.replaceChildren(h('details', { class: 'bloque' },
      h('summary', { style: { minHeight: '44px', fontWeight: '600', cursor: 'pointer' } }, `Archivados (${arch.length})`),
      h('ul', { class: 'lista', style: { marginTop: '8px' } }, arch.map(tarjeta))));
  }
}

async function nuevoAtleta(ctx) {
  const entrada = h('input', { id: 'nombre-atleta', class: 'entrada', maxlength: '40', autocomplete: 'off', placeholder: 'Por ejemplo, Laura' });
  const error = h('p', { class: 'error', 'aria-live': 'polite' });
  let creado = null;
  const r = await dialogo({
    titulo: 'Nuevo atleta',
    cuerpo: [h('label', { class: 'campo', for: 'nombre-atleta' }, h('span', {}, 'Nombre')), entrada, error,
      h('p', { class: 'suave', style: { fontSize: '15px' } }, 'Solo el nombre: no hace falta email ni teléfono. El código se genera solo.')],
    botones: [{ texto: 'Crear', valor: 'crear', principal: true }, { texto: 'Cancelar', valor: null }],
    alAceptar: async () => {
      const res = await ctx.almacen.crearAtleta(entrada.value, rngSeguro);
      if (!res.ok) { error.textContent = res.errores.join(' '); entrada.focus(); return false; }
      creado = res.atleta;
      return true;
    },
  });
  if (r !== 'crear' || !creado) return;
  await mostrarCodigo(creado, 'Atleta creado');
  ctx.ir(`#/atleta/${creado.id}`);
}

function mostrarCodigo(atleta, titulo) {
  return dialogo({
    titulo,
    cuerpo: [
      h('p', {}, `Pásale a ${atleta.nombre} este enlace o su código:`),
      h('p', { class: 'codigo-grande' }, atleta.codigo),
      h('div', { class: 'acciones' }, botonesEnlace(atleta)),
    ],
    botones: [{ texto: 'Hecho', valor: true, principal: true, foco: true }],
  });
}

function descargar(nombre, texto) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
  const a = h('a', { href: url, download: nombre });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function darDeBaja(ctx, atleta) {
  const opcion = await dialogo({
    titulo: `Dar de baja a ${atleta.nombre}`,
    texto: 'Su código se desactiva al momento. ¿Qué hacemos con sus datos?',
    botones: [
      { texto: 'Archivar (se guardan)', valor: 'archivar', principal: true },
      { texto: 'Descargar su historial y borrarlo', valor: 'borrar' },
      { texto: 'Cancelar', valor: null, foco: true },
    ],
  });
  if (opcion === 'archivar') {
    await ctx.almacen.archivarAtleta(atleta.id);
    tostada(`${atleta.nombre} archivado`);
    ctx.ir('#/atletas');
  } else if (opcion === 'borrar') {
    const todo = await ctx.almacen.todoDelAtleta(atleta.id);
    descargar(nombreArchivo(atleta, ctx.hoy()), historialCsv(todo.atleta, todo.sesiones, todo.registros));
    const si = await confirmar({
      titulo: '¿Borrar todo?',
      texto: `Se ha descargado el historial de ${atleta.nombre}. Comprueba que lo tienes antes de seguir: después de borrar no se puede recuperar.`,
      aceptar: 'Borrar para siempre',
      cancelar: 'No borrar',
    });
    if (!si) { await ctx.almacen.cambiarActivo(atleta.id, false); tostada('No se ha borrado nada. El código queda desactivado.'); ctx.ir(`#/atleta/${atleta.id}`); return; }
    await ctx.almacen.borrarAtleta(atleta.id);
    tostada(`Datos de ${atleta.nombre} borrados`);
    ctx.ir('#/atletas');
  }
}

export async function pantallaAtleta(ctx, id, lunes) {
  const atleta = await ctx.almacen.atleta(id);
  if (!atleta) {
    montar(cabeceraPanel(ctx, { atras: { etiqueta: 'Volver a atletas', accion: () => ctx.ir('#/atletas') } }),
      h('h1', { class: 'saludo' }, 'Este atleta ya no existe'));
    return;
  }
  const hoy = ctx.hoy();
  const dif = Math.round(diferenciaDias(ctx.lunesHoy(), lunes) / 7);
  const dias = h('div', { 'aria-busy': 'true' }, h('p', { class: 'vacio' }, 'Cargando…'));

  const acciones = [
    ...botonesEnlace(atleta),
    h('button', {
      type: 'button', class: 'boton',
      onclick: async () => {
        const activo = !atleta.activo;
        if (!activo && !(await confirmar({ titulo: '¿Desactivar el código?', texto: `${atleta.nombre} dejará de poder ver su plan y valorar hasta que lo reactives.`, aceptar: 'Desactivar' }))) return;
        await ctx.almacen.cambiarActivo(atleta.id, activo);
        tostada(activo ? 'Código activado' : 'Código desactivado');
        pantallaAtleta(ctx, id, lunes);
      },
    }, atleta.activo ? 'Desactivar código' : 'Activar código'),
    h('button', {
      type: 'button', class: 'boton',
      onclick: async () => {
        if (!(await confirmar({ titulo: '¿Código nuevo?', texto: 'El código actual dejará de funcionar y tendrá que entrar con el nuevo en todos sus móviles. Útil si lo ha compartido con otros.', aceptar: 'Generar código nuevo' }))) return;
        const r = await ctx.almacen.regenerarCodigo(atleta.id, rngSeguro);
        await mostrarCodigo(r.atleta, 'Código nuevo');
        pantallaAtleta(ctx, id, lunes);
      },
    }, 'Código nuevo'),
    h('button', { type: 'button', class: 'boton', onclick: () => darDeBaja(ctx, atleta) }, 'Dar de baja'),
  ];

  montar(
    cabeceraPanel(ctx, { atras: { etiqueta: 'Volver a atletas', accion: () => ctx.ir('#/atletas') } }),
    h('p', { class: 'antetitulo', style: { marginTop: '20px' } }, textoEstado(atleta)),
    h('h1', {}, atleta.nombre),
    h('p', { style: { margin: '6px 0 0' } }, h('span', { class: 'codigo-grande', style: { fontSize: '20px' } }, atleta.codigo),
      h('span', { class: 'suave' }, ` · ${atleta.dispositivos} ${atleta.dispositivos === 1 ? 'móvil' : 'móviles'}`)),
    h('div', { class: 'acciones' }, acciones),
    h('nav', { class: 'selector-semana bloque', 'aria-label': 'Semanas' },
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Semana anterior', onclick: () => ctx.ir(`#/atleta/${id}/${sumarDias(lunes, -7)}`) }, icono('atras')),
      h('div', { class: 'rango', 'aria-live': 'polite' }, rangoSemana(lunes),
        h('small', {}, dif === 0 ? 'Esta semana' : dif === 1 ? 'La semana que viene' : dif === -1 ? 'La semana pasada' : dif > 0 ? `Dentro de ${dif} semanas` : `Hace ${-dif} semanas`)),
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Semana siguiente', onclick: () => ctx.ir(`#/atleta/${id}/${sumarDias(lunes, 7)}`) }, icono('adelante'))),
    dias,
    h('div', { class: 'acciones', style: { justifyContent: 'center' } },
      h('button', {
        type: 'button', class: 'boton',
        onclick: async () => {
          const destino = sumarDias(lunes, 7);
          const yaHay = await ctx.almacen.sesionesEntre(id, destino, sumarDias(destino, 6));
          const texto = yaHay.length
            ? `La semana del ${rangoSemana(destino)} ya tiene ${yaHay.length} ${yaHay.length === 1 ? 'sesión' : 'sesiones'}. Las copiadas se añadirán a esas.`
            : `Se copiarán las sesiones a la semana del ${rangoSemana(destino)}. Después puedes ajustarlas.`;
          if (!(await confirmar({ titulo: '¿Copiar a la semana siguiente?', texto, aceptar: 'Copiar' }))) return;
          const r = await ctx.almacen.copiarSemana(id, lunes, destino, rngSeguro);
          tostada(`${r.copiadas} ${r.copiadas === 1 ? 'sesión copiada' : 'sesiones copiadas'}`);
          ctx.ir(`#/atleta/${id}/${destino}`);
        },
      }, 'Copiar esta semana a la siguiente')),
  );

  const sesiones = await ctx.almacen.sesionesEntre(id, lunes, sumarDias(lunes, 6));
  const registros = await ctx.almacen.registros(id, sesiones.map((s) => s.id));
  dias.replaceChildren(...agruparPorDia(sesiones, lunes).map(({ fecha, sesiones: delDia }) => {
    const e = etiquetaDia(fecha);
    return h('section', { class: `dia-panel${fecha === hoy ? ' es-hoy' : ''}`, 'aria-label': `${e.corto} ${e.num}` },
      h('div', { class: 'cab-dia' },
        h('b', {}, `${e.corto} ${e.num}${fecha === hoy ? ' · HOY' : ''}`),
        h('a', { class: 'boton-mini', href: `#/atleta/${id}/nueva/${fecha}`, 'aria-label': `Añadir sesión el ${e.corto} ${e.num}` }, icono('mas'), 'Añadir')),
      delDia.length === 0 ? h('p', { class: 'suave', style: { margin: '4px 0 0' } }, 'Descanso') : delDia.map((s) => {
        const r = registros[s.id];
        return h('a', { class: `tarjeta${esDura(r) ? ' dura' : ''}`, href: `#/atleta/${id}/sesion/${s.id}` },
          h('div', { class: 'linea1' }, h('h3', {}, s.titulo), r ? insigniaEsfuerzo(r.esfuerzo) : null),
          h('p', { class: 'suave' }, `${s.ejercicios.length} ${s.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'} · `,
            r ? `valorada: ${ESFUERZO[r.esfuerzo].toLowerCase()}${r.duros.length ? `, ${r.duros.length} duro${r.duros.length === 1 ? '' : 's'}` : ''}` : 'sin valorar'));
      }));
  }));
  dias.removeAttribute('aria-busy');
}
