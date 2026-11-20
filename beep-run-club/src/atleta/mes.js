// Vista de mes: cuadrícula de lunes a domingo con los días de entrenamiento coloreados por
// intensidad (solo dos colores: suave y exigente) y sin color los días sin sesión.

import { h, icono, montar } from '../comun/ui.js';
import { guardarLocal } from '../comun/entorno.js';
import { semanasDelMes, sumarMeses, mesDe, claveMes, tituloMes, colorDia } from '../nucleo/calendario.js';
import { fechaLarga, lunesDe } from '../nucleo/fechas.js';
import { cabecera, selectorVista } from './semana.js';

const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export async function pantallaMes(ctx, mes) {
  guardarLocal('beep_vista', 'mes');
  const { atletaId, nombre } = ctx.sesion;
  const hoy = ctx.hoy();
  const esEste = claveMes(mes) === claveMes(mesDe(hoy));
  const semanas = semanasDelMes(mes);
  const desde = semanas[0][0].fecha;
  const hasta = semanas[semanas.length - 1][6].fecha;
  const ir = (n) => ctx.ir(`#/mes/${claveMes(sumarMeses(mes, n))}`);

  const rejilla = h('div', { class: 'mes-rejilla', 'aria-busy': 'true' });
  // Deslizar a izquierda o derecha cambia de mes.
  let inicio = null;
  rejilla.addEventListener('pointerdown', (e) => { inicio = { x: e.clientX, y: e.clientY }; });
  rejilla.addEventListener('pointerup', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) ir(dx < 0 ? 1 : -1);
  });

  montar(
    cabecera(ctx),
    h('h1', { class: 'saludo' }, `Hola, ${nombre.trim().split(/\s+/)[0]}`),
    ctx.almacen.tipo === 'demo' ? h('p', { class: 'aviso-demo' }, 'Modo demo: datos de ejemplo guardados en este móvil.') : null,
    selectorVista(ctx, 'mes'),
    h('nav', { class: 'selector-semana', 'aria-label': 'Meses' },
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Mes anterior', onclick: () => ir(-1) }, icono('atras')),
      h('div', { class: 'rango', 'aria-live': 'polite' }, tituloMes(mes), h('small', {}, esEste ? 'Este mes' : ' ')),
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Mes siguiente', onclick: () => ir(1) }, icono('adelante'))),
    !esEste ? h('p', { style: { textAlign: 'center', margin: '0 0 8px' } },
      h('button', { type: 'button', class: 'boton-texto', onclick: () => ctx.ir(`#/mes/${claveMes(mesDe(hoy))}`) }, 'Volver a este mes')) : null,
    h('div', { class: 'mes-letras', 'aria-hidden': 'true' }, LETRAS.map((l) => h('span', {}, l))),
    rejilla,
    h('ul', { class: 'leyenda', 'aria-label': 'Leyenda' },
      h('li', {}, h('span', { class: 'muestra suave' }), 'Suave'),
      h('li', {}, h('span', { class: 'muestra exigente' }), 'Exigente'),
      h('li', {}, h('span', { class: 'muestra hecha' }, icono('check')), 'Valorada')),
  );

  let sesiones, registros;
  try {
    sesiones = await ctx.almacen.sesionesEntre(atletaId, desde, hasta);
    registros = await ctx.almacen.registros(atletaId, sesiones.map((s) => s.id));
  } catch (e) {
    if (await ctx.siCodigoInvalido(e?.estado)) return;
    rejilla.replaceChildren(h('p', { class: 'descanso' }, 'No se ha podido cargar el mes. Revisa tu conexión.'));
    return;
  }
  const porDia = new Map();
  for (const s of sesiones) porDia.set(s.fecha, [...(porDia.get(s.fecha) ?? []), s]);

  rejilla.replaceChildren(...semanas.flat().map(({ fecha, delMes }) => {
    const delDia = porDia.get(fecha) ?? [];
    const color = colorDia(delDia);
    const valorada = delDia.length > 0 && delDia.every((s) => registros[s.id]);
    const clases = ['dia-mes', color, delMes ? null : 'fuera', fecha === hoy ? 'hoy' : null].filter(Boolean).join(' ');
    const num = Number(fecha.slice(8));
    if (!delDia.length) return h('span', { class: clases, 'aria-hidden': delMes ? null : 'true' }, h('span', { class: 'oculto-visual' }, `${fechaLarga(fecha)}: descanso`), h('span', { 'aria-hidden': 'true' }, num));
    const etiqueta = `${fecha === hoy ? 'Hoy, ' : ''}${fechaLarga(fecha)}: ${delDia.map((s) => s.titulo).join(' y ')}, ${color}${valorada ? ', valorada' : ''}`;
    return h('button', {
      type: 'button', class: clases, 'aria-label': etiqueta,
      onclick: () => ctx.ir(delDia.length === 1 ? `#/sesion/${delDia[0].id}` : `#/semana/${lunesDe(fecha)}`),
    }, h('span', { 'aria-hidden': 'true' }, num), valorada ? h('span', { class: 'marca-hecha' }, icono('check')) : null);
  }));
  rejilla.removeAttribute('aria-busy');
}
