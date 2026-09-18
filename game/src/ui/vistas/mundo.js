import { esc, plural } from '../util.js';
import { figura } from '../sprite.js';
import { MUEBLES, EQUIPO, MASCOTAS, superficieDe } from '../../data/content.js';
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
let sitioSeleccionado = null;

const ETIQUETA_SUPERFICIE = {
  pared: 'En la pared',
  suelo: 'En el suelo',
  mueble: 'Sobre el suelo',
};

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
  const sitio = espacio.sitios.find((s) => s.id === sitioSeleccionado) ?? null;

  // Cada objeto se ancla por su base al suelo del sitio y se escala con la profundidad.
  // El orden de dibujo sale de la altura: lo que está más abajo está más cerca y tapa.
  const piezas = espacio.sitios
    .map((s) => {
      const id = colocados[s.id];
      const mueble = id ? articuloPorId(id) : null;
      const activo = sitioSeleccionado === s.id;
      const estilo = `left:${s.x}%;top:${s.y}%;z-index:${Math.round(s.y)};--escala:${s.escala}`;

      if (!mueble) {
        return `<button class="hueco ${s.superficie} ${activo ? 'activo' : ''}" style="${estilo}"
          data-accion="sitio" data-sitio="${esc(s.id)}" aria-label="Sitio libre"></button>`;
      }

      return `<button class="puesto ${activo ? 'activo' : ''}" style="${estilo}"
        data-accion="sitio" data-sitio="${esc(s.id)}">
        ${figura('muebles', id, mueble.nombre, { clase: 'objeto' })}
      </button>`;
    })
    .join('');

  const enInventario = ctx.db.inventario.filter((id) => !ranuraDe(id));
  const yaPuestos = new Set(
    Object.values(ctx.db.colocados ?? {}).flatMap((espacioActual) => Object.values(espacioActual)),
  );
  // Solo se ofrece lo que encaja en esa superficie: un tapiz no va al suelo ni un banco a la pared.
  const disponibles = enInventario
    .filter((id) => !yaPuestos.has(id))
    .filter((id) => !sitio || superficieDe(articuloPorId(id).categoria) === sitio.superficie);

  const puesto = sitio ? colocados[sitio.id] : null;
  const seleccion = !sitio
    ? '<div class="mini" style="text-align:center">Toca un hueco para poner algo ahí.</div>'
    : puesto
      ? `<div class="tarjeta">
           <div class="entre">
             <b>${esc(articuloPorId(puesto).nombre)}</b>
             <button class="mini" data-accion="quitar" data-sitio="${esc(sitio.id)}">Guardar</button>
           </div>
         </div>`
      : `<div class="tarjeta">
           <div class="mini" style="margin-bottom:10px">${ETIQUETA_SUPERFICIE[sitio.superficie]}</div>
           ${
             disponibles.length
               ? `<div class="catalogo">
                   ${disponibles
                     .map((id) => {
                       const mueble = articuloPorId(id);
                       return `<div class="articulo">
                         ${figura('muebles', id, mueble.nombre, { clase: 'objeto' })}
                         <div class="nom">${esc(mueble.nombre)}</div>
                         <button data-accion="colocar" data-articulo="${esc(id)}">Poner</button>
                       </div>`;
                     })
                     .join('')}
                 </div>`
               : '<div class="mini">No te queda nada que encaje aquí. Pásate por la tienda.</div>'
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
  <div class="escenario" data-guia="parcela" style="background-image:url('assets/espacios/${esc(espacio.id)}.png')">
    ${piezas}
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
          ${figura(carpeta, articulo.id, articulo.nombre, { clase: 'objeto' })}
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
        ${figura('mascotas', mascota.id, mascota.nombre, { clase: 'objeto' })}
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
    sitioSeleccionado = null;
    ctx.refrescar();
  },

  espacio: (el, ctx) => {
    espacioActivo = el.dataset.espacio;
    sitioSeleccionado = null;
    ctx.refrescar();
  },

  sitio: (el, ctx) => {
    const id = el.dataset.sitio;
    sitioSeleccionado = sitioSeleccionado === id ? null : id;
    ctx.refrescar();
  },

  colocar: (el, ctx) => {
    const espacio = espacioActual(ctx);
    const sitio = sitioSeleccionado;

    ctx.actualizar((db) => {
      const actual = db.colocados[espacio.id] ?? {};
      db.colocados = { ...db.colocados, [espacio.id]: { ...actual, [sitio]: el.dataset.articulo } };
    });
    sitioSeleccionado = null;
    ctx.refrescar();
  },

  quitar: (el, ctx) => {
    const espacio = espacioActual(ctx);

    ctx.actualizar((db) => {
      const actual = { ...(db.colocados[espacio.id] ?? {}) };
      delete actual[el.dataset.sitio];
      db.colocados = { ...db.colocados, [espacio.id]: actual };
    });
    sitioSeleccionado = null;
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
        Object.entries(db.colocados).map(([espacio, sitios]) => [
          espacio,
          Object.fromEntries(Object.entries(sitios).filter(([, id]) => id !== venta.articulo.id)),
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
