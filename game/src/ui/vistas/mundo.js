import { esc, plural } from '../util.js';
import { sprite } from '../sprite.js';
import { MUEBLES, EQUIPO, MASCOTAS } from '../../data/content.js';
import {
  espaciosAbiertos,
  tiendasAbiertas,
  actividadesAbiertas,
  articulosDisponibles,
  mascotasGanadas,
} from '../../core/progression/unlocks.js';
import { puedeComprar, puedeVender, MOTIVO_COMPRA, articuloPorId, ranuraDe } from '../../core/economy/shop.js';
import { otorgarExtra, sumaExtras } from '../../core/economy/rewards.js';

let pestana = 'parcela';
let espacioActivo = null;
let casillaSeleccionada = null;

const PESTANAS = [
  ['parcela', 'Parcela'],
  ['tienda', 'Tienda'],
  ['mascotas', 'Mascotas'],
];

export function subtitulo(ctx) {
  const colocados = Object.values(ctx.db.colocados ?? {}).reduce(
    (total, espacio) => total + Object.keys(espacio).length,
    0,
  );
  return `${plural(ctx.db.inventario.length, 'objeto', 'objetos')} · ${plural(colocados, 'colocado', 'colocados')}`;
}

function presupuestoDeHoy(ctx) {
  const extras = ctx.registroDe(ctx.hoy).extras ?? [];
  return {
    presupuesto: ctx.estado.hoy?.extras ?? { desbloqueado: false, xp: 0, monedas: 0 },
    gastado: sumaExtras(extras),
  };
}

function vistaParcela(ctx) {
  const nivel = ctx.estado.nivel.nivel;
  const espacios = espaciosAbiertos(nivel);
  const espacio = espacios.find((e) => e.id === espacioActivo) ?? espacios[0];
  const colocados = ctx.db.colocados?.[espacio.id] ?? {};

  const casillas = Array.from({ length: espacio.casillas }, (_, i) => {
    const id = colocados[i];
    const mueble = id ? articuloPorId(id) : null;
    const activa = casillaSeleccionada === i;

    return `
    <div class="casilla ${mueble ? 'ocupada' : ''}" style="${activa ? 'border-color:var(--acento)' : ''}"
      data-accion="casilla" data-indice="${i}">
      ${mueble ? sprite('muebles', id, mueble.nombre) : '<span class="mini">+</span>'}
    </div>`;
  }).join('');

  const enInventario = ctx.db.inventario.filter((id) => !ranuraDe(id));
  const yaPuestos = new Set(
    Object.values(ctx.db.colocados ?? {}).flatMap((espacioActual) => Object.values(espacioActual)),
  );
  const disponibles = enInventario.filter((id) => !yaPuestos.has(id));

  const seleccion =
    casillaSeleccionada === null
      ? ''
      : colocados[casillaSeleccionada]
        ? `<div class="tarjeta">
             <div class="entre">
               <b>${esc(articuloPorId(colocados[casillaSeleccionada]).nombre)}</b>
               <button class="mini" data-accion="quitar" data-indice="${casillaSeleccionada}">Guardar</button>
             </div>
           </div>`
        : `<div class="tarjeta">
             <div class="mini" style="margin-bottom:10px">Elige qué poner aquí</div>
             ${
               disponibles.length
                 ? `<div class="catalogo">
                     ${disponibles
                       .map((id) => {
                         const mueble = articuloPorId(id);
                         return `<div class="articulo">
                           ${sprite('muebles', id, mueble.nombre)}
                           <div class="nom">${esc(mueble.nombre)}</div>
                           <button data-accion="colocar" data-articulo="${esc(id)}">Poner</button>
                         </div>`;
                       })
                       .join('')}
                   </div>`
                 : '<div class="mini">No te queda nada por colocar. Pásate por la tienda.</div>'
             }
           </div>`;

  return `
  ${
    espacios.length > 1
      ? `<div class="pestanas">
          ${espacios
            .map(
              (e) =>
                `<button aria-pressed="${e.id === espacio.id}" data-accion="espacio" data-espacio="${esc(e.id)}">${esc(e.nombre)}</button>`,
            )
            .join('')}
        </div>`
      : ''
  }
  <div class="tarjeta">
    <div class="rejilla-casillas">${casillas}</div>
  </div>
  ${seleccion}`;
}

function vistaTienda(ctx) {
  const nivel = ctx.estado.nivel.nivel;
  const monedas = ctx.estado.monedas.disponibles;
  const tiendas = tiendasAbiertas(nivel);

  const seccion = (titulo, catalogo, carpeta) => {
    const articulos = articulosDisponibles(catalogo, nivel)
      .map((articulo) => {
        const tengo = ctx.db.inventario.includes(articulo.id);
        const comprobacion = puedeComprar({
          articuloId: articulo.id,
          nivel,
          monedas,
          inventario: ctx.db.inventario,
        });

        return `
        <div class="articulo" aria-disabled="${!comprobacion.ok && !tengo}">
          ${sprite(carpeta, articulo.id, articulo.nombre)}
          <div class="nom">${esc(articulo.nombre)}</div>
          <div class="precio">${articulo.precio} 🪙</div>
          ${
            tengo
              ? `<button class="gris" data-accion="vender" data-articulo="${esc(articulo.id)}">Vender</button>`
              : `<button data-accion="comprar" data-articulo="${esc(articulo.id)}" ${comprobacion.ok ? '' : 'disabled'}>Comprar</button>`
          }
        </div>`;
      })
      .join('');

    return `<div class="titulo-seccion">${titulo}</div><div class="catalogo">${articulos}</div>`;
  };

  return `
  <div class="mini" style="margin-bottom:12px">Vender devuelve el 25 % de lo que costó.</div>
  ${tiendas.some((t) => t.vende === 'muebles') ? seccion('Mercader', MUEBLES, 'muebles') : ''}
  ${
    tiendas.some((t) => t.vende === 'equipo')
      ? seccion('Herrero', EQUIPO, 'equipo')
      : '<div class="aviso ojo">El herrero abre en el nivel 4.</div>'
  }`;
}

function vistaMascotas(ctx) {
  const ganadas = mascotasGanadas({
    rachaEntreno: ctx.estado.rachas?.entreno.longitud ?? 0,
    rachaComida: ctx.estado.rachas?.comida.longitud ?? 0,
    jefesDerrotados: ctx.db.jefesDerrotados.length,
  }).map((m) => m.id);

  return `
  <div class="mini" style="margin-bottom:12px">Las mascotas no se compran: se ganan.</div>
  <div class="catalogo">
    ${MASCOTAS.map((mascota) => {
      const tengo = ganadas.includes(mascota.id);
      return `
      <div class="articulo" aria-disabled="${!tengo}">
        ${sprite('mascotas', mascota.id, mascota.nombre)}
        <div class="nom">${tengo ? esc(mascota.nombre) : '???'}</div>
        <div class="precio">${esc(mascota.pista)}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function vistaActividades(ctx) {
  const { presupuesto, gastado } = presupuestoDeHoy(ctx);
  const abierto = presupuesto.desbloqueado && gastado.monedas < presupuesto.monedas;
  const actividades = actividadesAbiertas(ctx.estado.nivel.nivel);

  return `
  <div class="titulo-seccion">Trabajos del día</div>
  <div class="tarjeta">
    ${actividades
      .map(
        (actividad) => `
      <div class="entre" style="padding:9px 0;border-bottom:1px solid var(--linea)">
        <div>
          <b>${esc(actividad.nombre)}</b>
          <div class="mini">${actividad.xp} XP · ${actividad.monedas} 🪙</div>
        </div>
        <button class="boton fino" style="width:auto;padding:8px 16px" data-accion="trabajar"
          data-actividad="${esc(actividad.id)}" ${abierto ? '' : 'disabled'}>Hacer</button>
      </div>`,
      )
      .join('')}
    <div class="mini" style="margin-top:10px">
      ${
        abierto
          ? `Quedan ${presupuesto.monedas - gastado.monedas} monedas de recompensa hoy.`
          : 'Sin recompensas disponibles hoy.'
      }
    </div>
  </div>`;
}

export function render(ctx) {
  const cuerpo = {
    parcela: vistaParcela,
    tienda: vistaTienda,
    mascotas: vistaMascotas,
  }[pestana](ctx);

  return `
  <div class="pestanas">
    ${PESTANAS.map(
      ([id, nombre]) =>
        `<button aria-pressed="${pestana === id}" data-accion="pestana" data-pestana="${id}">${nombre}</button>`,
    ).join('')}
  </div>
  ${cuerpo}
  ${pestana === 'parcela' ? vistaActividades(ctx) : ''}`;
}

function espacioActual(ctx) {
  const espacios = espaciosAbiertos(ctx.estado.nivel.nivel);
  return espacios.find((e) => e.id === espacioActivo) ?? espacios[0];
}

export const acciones = {
  pestana: (el, ctx) => {
    pestana = el.dataset.pestana;
    casillaSeleccionada = null;
    ctx.refrescar();
  },

  espacio: (el, ctx) => {
    espacioActivo = el.dataset.espacio;
    casillaSeleccionada = null;
    ctx.refrescar();
  },

  casilla: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    casillaSeleccionada = casillaSeleccionada === indice ? null : indice;
    ctx.refrescar();
  },

  colocar: (el, ctx) => {
    const espacio = espacioActual(ctx);
    const indice = casillaSeleccionada;

    ctx.actualizar((db) => {
      const actual = db.colocados[espacio.id] ?? {};
      db.colocados = { ...db.colocados, [espacio.id]: { ...actual, [indice]: el.dataset.articulo } };
    });
    casillaSeleccionada = null;
    ctx.refrescar();
  },

  quitar: (el, ctx) => {
    const espacio = espacioActual(ctx);

    ctx.actualizar((db) => {
      const actual = { ...(db.colocados[espacio.id] ?? {}) };
      delete actual[el.dataset.indice];
      db.colocados = { ...db.colocados, [espacio.id]: actual };
    });
    casillaSeleccionada = null;
    ctx.refrescar();
  },

  comprar: (el, ctx) => {
    const comprobacion = puedeComprar({
      articuloId: el.dataset.articulo,
      nivel: ctx.estado.nivel.nivel,
      monedas: ctx.estado.monedas.disponibles,
      inventario: ctx.db.inventario,
    });

    if (!comprobacion.ok) {
      alert(MOTIVO_COMPRA[comprobacion.motivo]);
      return;
    }

    ctx.actualizar((db) => {
      db.inventario = [...db.inventario, comprobacion.articulo.id];
      db.monedasGastadas += comprobacion.articulo.precio;
    });
  },

  vender: (el, ctx) => {
    const venta = puedeVender({ articuloId: el.dataset.articulo, inventario: ctx.db.inventario });
    if (!venta.ok) return;

    ctx.actualizar((db) => {
      db.inventario = db.inventario.filter((id) => id !== venta.articulo.id);
      db.monedasGastadas -= venta.reembolso;

      // Lo vendido no puede seguir equipado ni colocado en la parcela.
      const ranura = ranuraDe(venta.articulo.id);
      if (ranura && db.equipado[ranura] === venta.articulo.id) {
        const siguiente = { ...db.equipado };
        delete siguiente[ranura];
        db.equipado = siguiente;
      }

      db.colocados = Object.fromEntries(
        Object.entries(db.colocados).map(([espacio, casillas]) => [
          espacio,
          Object.fromEntries(Object.entries(casillas).filter(([, id]) => id !== venta.articulo.id)),
        ]),
      );
    });
  },

  trabajar: (el, ctx) => {
    const actividad = actividadesAbiertas(ctx.estado.nivel.nivel).find((a) => a.id === el.dataset.actividad);
    const { presupuesto, gastado } = presupuestoDeHoy(ctx);
    const premio = otorgarExtra(presupuesto, gastado, actividad);

    ctx.actualizar((db) => {
      const dia = db.dias[ctx.hoy] ?? { ejercicios: [], comidas: [], extras: [] };
      dia.extras = [...(dia.extras ?? []), { tipo: actividad.id, ...premio }];
      db.dias[ctx.hoy] = dia;
    });
  },
};
