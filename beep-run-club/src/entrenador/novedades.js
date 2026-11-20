// Novedades: las valoraciones recientes de todos los atletas, con las duras resaltadas.

import { h, icono, montar } from '../comun/ui.js';
import { leerLocal, guardarLocal } from '../comun/entorno.js';
import { fechaLarga } from '../nucleo/fechas.js';
import { esDura } from '../nucleo/registro.js';
import { cabeceraPanel, pestanas, insigniaEsfuerzo } from './comun.js';

const CLAVE_VISTO = 'beep_entrenador_visto';

export async function pantallaNovedades(ctx) {
  const lista = h('ul', { class: 'lista', 'aria-busy': 'true' }, h('li', { class: 'vacio' }, 'Cargando…'));
  montar(cabeceraPanel(ctx), pestanas('novedades'),
    h('h1', { class: 'oculto-visual' }, 'Novedades'),
    h('p', { class: 'suave', style: { margin: '4px 0 12px' } }, 'Lo último que han valorado tus atletas. Las que conviene mirar van con borde rojo.'),
    lista);

  const visto = leerLocal(CLAVE_VISTO, 0);
  const novedades = await ctx.almacen.novedades(40);
  if (novedades.length === 0) {
    lista.replaceChildren(h('li', { class: 'vacio' }, 'Todavía no hay valoraciones.'));
  } else {
    lista.replaceChildren(...novedades.map(({ atleta, sesion, registro }) => {
      const dura = esDura(registro);
      const nombreDe = (id) => sesion.ejercicios.find((e) => e.id === id)?.nombre ?? '?';
      return h('li', {}, h('a', { class: `tarjeta${dura ? ' dura' : ''}`, href: `#/atleta/${atleta.id}/sesion/${sesion.id}` },
        h('div', { class: 'linea1' },
          h('h3', {}, `${atleta.nombre} · ${sesion.titulo}`),
          h('span', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
            (registro.actualizado ?? 0) > visto ? h('span', { class: 'nuevo' }, 'Nueva') : null,
            insigniaEsfuerzo(registro.esfuerzo))),
        h('p', { class: 'suave' }, `${fechaLarga(sesion.fecha)} · ${registro.hechos.length} de ${sesion.ejercicios.length} hechos${registro.strava ? ' · con Strava' : ''}`),
        registro.duros.length ? h('p', { style: { fontWeight: '600', color: 'var(--rojo-texto)', display: 'flex', gap: '6px', alignItems: 'center' } },
          icono('bandera'), `Demasiado duro: ${registro.duros.map(nombreDe).join(', ')}`) : null,
        registro.comentario ? h('p', {}, `«${registro.comentario}»`) : null));
    }));
  }
  lista.removeAttribute('aria-busy');
  const ultima = Math.max(0, ...novedades.map((n) => n.registro.actualizado ?? 0));
  if (ultima > visto) guardarLocal(CLAVE_VISTO, ultima);
}
