import { esc } from '../util.js';
import { sprite, figura } from '../sprite.js';
import { ENEMIGOS } from '../../data/content.js';
import { statsPersonaje } from '../../core/progression/character.js';
import {
  zonasAbiertas,
  habilidadesAbiertas,
  etapaPersonaje,
  proximoDesbloqueo,
  zonaDeEnemigo,
} from '../../core/progression/unlocks.js';
import { iniciarCombate, turno, recompensaEnemigo } from '../../core/combat/battle.js';
import { otorgarExtra, sumaExtras } from '../../core/economy/rewards.js';
import { articuloPorId, ranuraDe } from '../../core/economy/shop.js';

/** Un combate a medias no se guarda: si cierras la app, se pierde. */
let combate = null;

// Estado de la animación. Vive aparte del combate porque es solo representación: el
// resultado del turno ya está calculado antes de que se mueva nada.
let escena = { heroe: 0, rival: 0, golpeado: null };
let temporizadores = [];

const POSES = { quieto: 0, atacando: 1, dolor: 2 };

function pararAnimacion() {
  temporizadores.forEach(clearTimeout);
  temporizadores = [];
  escena = { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null };
}

/**
 * Encadena el vaivén del turno: primero pega quien ha actuado, después responde el otro.
 * Los tiempos son de puro ritmo visual, el daño ya está aplicado.
 */
function animarTurno(ctx, antes, despues) {
  pararAnimacion();

  const rivalHerido = despues.enemigo.vida < antes.enemigo.vida;
  const heroeHerido = despues.jugador.vida < antes.jugador.vida;

  escena = { heroe: POSES.atacando, rival: rivalHerido ? POSES.dolor : POSES.quieto, golpeado: rivalHerido ? 'rival' : null };

  const paso = (retraso, siguiente) => {
    temporizadores.push(
      setTimeout(() => {
        escena = siguiente;
        ctx.refrescar();
      }, retraso),
    );
  };

  if (despues.estado === 'en_curso') {
    paso(420, {
      heroe: heroeHerido ? POSES.dolor : POSES.quieto,
      rival: POSES.atacando,
      golpeado: heroeHerido ? 'heroe' : null,
    });
    paso(900, { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null });
  } else {
    paso(500, { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null });
  }
}

const RANURAS = [
  ['arma', 'Arma'],
  ['armadura', 'Armadura'],
  ['accesorio', 'Accesorio'],
];

export function subtitulo(ctx) {
  const siguiente = proximoDesbloqueo(ctx.estado.nivel.nivel);
  return siguiente ? `Nivel ${siguiente.nivel}: ${siguiente.nombre}` : 'Todo desbloqueado';
}

const barra = (actual, maximo, clase = '') =>
  `<div class="vida ${clase}"><i style="width:${Math.max(0, (actual / maximo) * 100)}%"></i></div>`;

function presupuestoDeHoy(ctx) {
  const extras = ctx.registroDe(ctx.hoy).extras ?? [];
  return { presupuesto: ctx.estado.hoy?.extras ?? { desbloqueado: false, xp: 0, monedas: 0 }, gastado: sumaExtras(extras) };
}

function quedaPresupuesto(ctx) {
  const { presupuesto, gastado } = presupuestoDeHoy(ctx);
  return presupuesto.desbloqueado && (gastado.xp < presupuesto.xp || gastado.monedas < presupuesto.monedas);
}

function figuraHeroe(ctx) {
  const etapa = etapaPersonaje(ctx.estado.nivel.nivel).id;
  const golpeado = escena.golpeado === 'heroe' ? 'golpeado' : '';

  // Al acabar el combate el personaje se gira hacia cámara: la cara es lo que cuenta en
  // el momento de ganar o perder.
  if (combate.estado === 'victoria') return figura('personaje', `${etapa}_victoria`, 'Tú', { clase: golpeado });
  if (combate.estado === 'derrota') return figura('personaje', `${etapa}_derrota`, 'Tú', { clase: golpeado });

  return figura('personaje', `${etapa}_combate`, 'Tú', { pose: escena.heroe, poses: 3, clase: golpeado });
}

function pantallaCombate(ctx) {
  const { jugador, enemigo, registro, estado } = combate;
  const habilidades = habilidadesAbiertas(ctx.estado.nivel.nivel);
  const zona = zonaDeEnemigo(combate.enemigoId);

  const acciones =
    estado === 'en_curso'
      ? `
    <div class="acciones">
      <button class="boton" data-accion="golpe" data-tipo="atacar">Atacar</button>
      <button class="boton secundario" data-accion="golpe" data-tipo="defender">Defender</button>
      ${habilidades
        .map(
          (h) => `<button class="boton secundario" data-accion="golpe" data-tipo="habilidad" data-habilidad="${esc(h.id)}"
            ${jugador.energia < h.energia ? 'disabled' : ''}>${esc(h.nombre)} · ${h.energia}⚡</button>`,
        )
        .join('')}
    </div>`
      : `<button class="boton" data-accion="salirCombate">Volver</button>`;

  return `
  <div class="combate">
    <div class="escena" style="${zona ? `background-image:url('assets/zonas/${esc(zona.id)}.png')` : ''}">
      <div class="combatiente rival">
        <div class="placa">
          <b>${esc(enemigo.nombre)}</b>
          ${barra(enemigo.vida, enemigo.vidaMax, 'enemiga')}
        </div>
        ${
          estado === 'victoria'
            ? ''
            : figura('enemigos', combate.enemigoId, enemigo.nombre, {
                pose: escena.rival,
                poses: 3,
                clase: escena.golpeado === 'rival' ? 'golpeado' : '',
              })
        }
      </div>

      <div class="combatiente heroe">
        ${figuraHeroe(ctx)}
        <div class="placa">
          <b>Tú · ${jugador.energia}⚡</b>
          ${barra(jugador.vida, jugador.vidaMax)}
        </div>
      </div>
    </div>

    <div class="diario">${registro.map((l) => `<div>${esc(l)}</div>`).join('')}</div>

    ${estado === 'victoria' ? '<div class="aviso">¡Victoria!</div>' : ''}
    ${estado === 'derrota' ? '<div class="aviso ojo">Esta vez no ha podido ser. Vuelve a intentarlo.</div>' : ''}
    ${acciones}
  </div>`;
}

export function render(ctx) {
  if (combate) return pantallaCombate(ctx);

  const nivel = ctx.estado.nivel.nivel;
  const stats = statsPersonaje(nivel, ctx.db.equipado);
  const habilidades = habilidadesAbiertas(nivel);
  const abierto = quedaPresupuesto(ctx);
  const { presupuesto, gastado } = presupuestoDeHoy(ctx);

  const ranuras = RANURAS.map(([ranura, etiqueta]) => {
    const id = ctx.db.equipado[ranura];
    const pieza = id ? articuloPorId(id) : null;
    return `
    <div class="entre" style="padding:8px 0;border-bottom:1px solid var(--linea)">
      <div>
        <div class="mini">${etiqueta}</div>
        <b>${pieza ? esc(pieza.nombre) : 'Vacío'}</b>
      </div>
      ${pieza ? `<button class="mini" data-accion="desequipar" data-ranura="${ranura}">Quitar</button>` : ''}
    </div>`;
  }).join('');

  const equipables = ctx.db.inventario.filter((id) => ranuraDe(id));

  const zonas = zonasAbiertas(nivel)
    .map((zona) => {
      const enemigos = [...zona.enemigos, zona.jefe]
        .map((id) => {
          const ficha = ENEMIGOS[id];
          const derrotado = ctx.db.jefesDerrotados.includes(id);
          const premio = recompensaEnemigo(id);
          return `
          <div class="articulo">
            ${sprite('enemigos', id, ficha.nombre)}
            <div class="nom">${esc(ficha.nombre)}</div>
            <div class="precio">${premio.xp} XP${derrotado ? ' · vencido' : ''}</div>
            <button data-accion="luchar" data-enemigo="${esc(id)}" ${abierto ? '' : 'disabled'}>Luchar</button>
          </div>`;
        })
        .join('');

      return `
      <div class="titulo-seccion">${esc(zona.nombre)}</div>
      <div class="mini" style="margin-bottom:10px">${esc(zona.descripcion)}</div>
      <div class="catalogo">${enemigos}</div>`;
    })
    .join('');

  return `
  <div class="tarjeta">
    <div class="luchador" style="grid-template-columns:84px 1fr">
      ${sprite('personaje', etapaPersonaje(nivel).id, 'Héroe', 'alto')}
      <div>
        <div class="mini">Nivel ${nivel}</div>
        <div class="entre" style="margin-top:6px"><span class="mini">Vida</span><b>${stats.vidaMax}</b></div>
        <div class="entre"><span class="mini">Ataque</span><b>${stats.ataque}</b></div>
        <div class="entre"><span class="mini">Defensa</span><b>${stats.defensa}</b></div>
        <div class="entre"><span class="mini">Energía</span><b>${stats.energiaMax}</b></div>
      </div>
    </div>
  </div>

  <div class="titulo-seccion">Equipo</div>
  <div class="tarjeta">
    ${ranuras}
    ${
      equipables.length
        ? `<div class="catalogo" style="margin-top:12px">
            ${equipables
              .map((id) => {
                const pieza = articuloPorId(id);
                const puesto = ctx.db.equipado[ranuraDe(id)] === id;
                return `
                <div class="articulo">
                  ${sprite('equipo', id, pieza.nombre)}
                  <div class="nom">${esc(pieza.nombre)}</div>
                  <button class="${puesto ? 'gris' : ''}" data-accion="equipar" data-articulo="${esc(id)}" ${puesto ? 'disabled' : ''}>
                    ${puesto ? 'Puesto' : 'Equipar'}
                  </button>
                </div>`;
              })
              .join('')}
          </div>`
        : '<div class="mini" style="margin-top:10px">Compra equipo en el herrero.</div>'
    }
  </div>

  <div class="titulo-seccion">Habilidades</div>
  <div class="tarjeta">
    ${
      habilidades.length
        ? habilidades
            .map(
              (h) => `<div style="padding:7px 0">
                <b>${esc(h.nombre)}</b> <span class="mini">· ${h.energia}⚡</span>
                <div class="mini">${esc(h.descripcion)}</div>
              </div>`,
            )
            .join('')
        : '<div class="mini">Todavía ninguna. La primera llega al nivel 2.</div>'
    }
  </div>

  ${
    abierto
      ? `<div class="aviso">Puedes seguir combatiendo hoy: quedan ${presupuesto.xp - gastado.xp} XP y ${presupuesto.monedas - gastado.monedas} monedas de recompensa.</div>`
      : `<div class="aviso ojo">${
          presupuesto.desbloqueado
            ? 'Ya has agotado las recompensas de hoy. Vuelve mañana.'
            : 'Registra un buen día de entreno o comida para poder combatir.'
        }</div>`
  }

  ${zonas}`;
}

export const acciones = {
  luchar: (el, ctx) => {
    pararAnimacion();
    combate = iniciarCombate(statsPersonaje(ctx.estado.nivel.nivel, ctx.db.equipado), el.dataset.enemigo);
    ctx.refrescar();
  },

  golpe: (el, ctx) => {
    const { tipo, habilidad } = el.dataset;
    const antes = combate;
    combate = turno(combate, { tipo, habilidad });
    animarTurno(ctx, antes, combate);

    if (combate.estado !== 'victoria') {
      ctx.refrescar();
      return;
    }

    const { presupuesto, gastado } = presupuestoDeHoy(ctx);
    const premio = otorgarExtra(presupuesto, gastado, recompensaEnemigo(combate.enemigoId));
    const enemigoId = combate.enemigoId;

    combate = {
      ...combate,
      registro: [...combate.registro, `Ganas ${premio.xp} XP y ${premio.monedas} monedas.`],
    };

    ctx.actualizar((db) => {
      const dia = db.dias[ctx.hoy] ?? { ejercicios: [], comidas: [], extras: [] };
      dia.extras = [...(dia.extras ?? []), { tipo: 'combate', enemigo: enemigoId, ...premio }];
      db.dias[ctx.hoy] = dia;

      if (ENEMIGOS[enemigoId].jefe && !db.jefesDerrotados.includes(enemigoId)) {
        db.jefesDerrotados.push(enemigoId);
      }
    });
  },

  salirCombate: (_, ctx) => {
    pararAnimacion();
    combate = null;
    ctx.refrescar();
  },

  equipar: (el, ctx) =>
    ctx.actualizar((db) => {
      db.equipado = { ...db.equipado, [ranuraDe(el.dataset.articulo)]: el.dataset.articulo };
    }),

  desequipar: (el, ctx) =>
    ctx.actualizar((db) => {
      const siguiente = { ...db.equipado };
      delete siguiente[el.dataset.ranura];
      db.equipado = siguiente;
    }),
};
