import { esc } from '../util.js';
import { figura } from '../sprite.js';
import { ENEMIGOS, HABILIDADES, HABILIDADES_EN_COMBATE } from '../../data/content.js';
import { statsPersonaje } from '../../core/progression/character.js';
import {
  zonasAbiertas,
  habilidadesAbiertas,
  etapaPersonaje,
  proximoDesbloqueo,
  zonaDeEnemigo,
} from '../../core/progression/unlocks.js';
import { iniciarCombate, turno, recompensaEnemigo } from '../../core/combat/battle.js';
import { cargaDeHabilidades, describirPotencia, habilidadesLlevadas } from '../../core/combat/habilidades.js';
import { vigorMaximo, vigorGastado, puedeCombatir, costeCombate } from '../../core/combat/vigor.js';
import { otorgarExtra, sumaExtras } from '../../core/economy/rewards.js';
import { articuloPorId, ranuraDe } from '../../core/economy/shop.js';

/** Un combate a medias no se guarda: si cierras la app, se pierde. */
let combate = null;

// Estado de la animación. Vive aparte del combate porque es solo representación: el
// resultado del turno ya está calculado antes de que se mueva nada.
let escena = { heroe: 0, rival: 0, golpeado: null, efecto: null, cifras: [] };
let temporizadores = [];

// Dos hojas de tres poses por etapa. Las de frente y las de espaldas se generan cada una
// de una sola vez, que es lo único que garantiza que sea el mismo personaje.
const POSES = { quieto: 0, atacando: 1, dolor: 2 };
const FRENTE = { ficha: 0, victoria: 1, derrota: 2 };

function pararAnimacion() {
  temporizadores.forEach(clearTimeout);
  temporizadores = [];
  escena = { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null, efecto: null, cifras: [] };
}

/** Hábitos de hoy que cargan las habilidades. */
const cargaDe = (ctx) => cargaDeHabilidades(ctx.estado.dias, ctx.estado.rachas);

const llevadasDe = (ctx) => habilidadesLlevadas(habilidadesAbiertas(ctx.estado.nivel.nivel), ctx.db.habilidadesEquipadas);

const icono = (id, clase = '') =>
  `<img class="icono-habilidad ${clase}" src="assets/habilidades/${esc(id)}.png" alt="" onerror="this.style.visibility='hidden'">`;

/**
 * Encadena el vaivén del turno: primero pega quien ha actuado, después responde el otro.
 * Los tiempos son de puro ritmo visual, el daño ya está aplicado.
 */
function animarTurno(ctx, antes, despues) {
  pararAnimacion();

  const danoRival = antes.enemigo.vida - despues.enemigo.vida;
  const danoHeroe = antes.jugador.vida - despues.jugador.vida;
  const efecto = despues.efecto ? { ...despues.efecto, rama: HABILIDADES[despues.efecto.habilidad]?.rama } : null;

  // Las cifras flotan sobre quien recibe: el número dice más que la barra cuando el golpe
  // es pequeño. Una cura sale en positivo sobre el héroe.
  const cifrasHeroe = efecto?.tipo === 'cura' ? [{ donde: 'heroe', texto: `+${efecto.valor}`, clase: 'cura' }] : [];
  escena = {
    heroe: efecto && efecto.tipo !== 'golpe' ? POSES.quieto : POSES.atacando,
    rival: danoRival > 0 ? POSES.dolor : POSES.quieto,
    golpeado: danoRival > 0 ? 'rival' : null,
    efecto,
    cifras: [...cifrasHeroe, ...(danoRival > 0 ? [{ donde: 'rival', texto: `−${danoRival}` }] : [])],
  };

  const paso = (retraso, siguiente) => {
    temporizadores.push(
      setTimeout(() => {
        escena = siguiente;
        ctx.refrescar();
      }, retraso),
    );
  };

  if (despues.estado === 'en_curso') {
    // Lo que pegó el enemigo: con una cura en el mismo turno, la vida neta lo esconde.
    const recibido = danoHeroe + (efecto?.tipo === 'cura' ? efecto.valor : 0);
    paso(480, {
      heroe: recibido > 0 ? POSES.dolor : POSES.quieto,
      rival: POSES.atacando,
      golpeado: recibido > 0 ? 'heroe' : null,
      // El escudo o la esquiva siguen a la vista mientras responde el enemigo.
      efecto: efecto && efecto.tipo !== 'golpe' && efecto.tipo !== 'cura' ? efecto : null,
      cifras: efecto?.esquivado
        ? [{ donde: 'heroe', texto: 'Esquivado', clase: 'esquivado' }]
        : recibido > 0
          ? [{ donde: 'heroe', texto: `−${recibido}` }]
          : [],
    });
    paso(1050, { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null, efecto: null, cifras: [] });
  } else {
    paso(600, { heroe: POSES.quieto, rival: POSES.quieto, golpeado: null, efecto: null, cifras: [] });
  }
}

/** Capa de efectos de la escena: estela del golpe, brillo de la cura, escudo, esquiva. */
function efectosHTML() {
  const { efecto, cifras } = escena;
  const capa = efecto
    ? `<div class="efecto efecto-${efecto.tipo} rama-${efecto.rama ?? 'entreno'} ${efecto.esquivado ? 'esquivado' : ''}">
        ${efecto.tipo === 'golpe' ? Array.from({ length: efecto.golpes ?? 1 }, (_, i) => `<i style="--i:${i}"></i>`).join('') : '<i></i>'}
      </div>`
    : '';
  return capa + cifras.map((c) => `<div class="cifra cifra-${c.donde} ${c.clase ?? ''}">${esc(c.texto)}</div>`).join('');
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

/** Vigor que le queda hoy: cuántos combates más caben. */
function vigorDeHoy(ctx) {
  const cumplido = ctx.estado.hoy?.extras?.desbloqueado ?? false;
  const combates = ctx.registroDe(ctx.hoy).combates ?? [];
  return { maximo: vigorMaximo(cumplido), gastado: vigorGastado(combates), combates, cumplido };
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
  // Se espera a que acabe el último golpe: si no, el golpe final cae en el vacío.
  const remate = { victoria: FRENTE.victoria, derrota: FRENTE.derrota }[combate.estado];
  if (remate !== undefined && !escena.golpeado) {
    return figura('personaje', etapa, 'Tú', { pose: remate, poses: 3, clase: golpeado });
  }

  return figura('personaje', `${etapa}_combate`, 'Tú', { pose: escena.heroe, poses: 3, clase: golpeado });
}

function pantallaCombate(ctx) {
  const { jugador, enemigo, registro, estado } = combate;
  const habilidades = llevadasDe(ctx);
  const zona = zonaDeEnemigo(combate.enemigoId);

  const acciones =
    estado === 'en_curso'
      ? `
    <div class="acciones">
      <button class="boton" data-accion="golpe" data-tipo="atacar">Atacar</button>
      <button class="boton secundario" data-accion="golpe" data-tipo="defender">Defender</button>
      ${habilidades
        .map(
          (h) => `<button class="boton secundario con-icono" data-accion="golpe" data-tipo="habilidad" data-habilidad="${esc(h.id)}"
            ${jugador.energia < h.energia || (h.efecto === 'cura' && combate.usadas.includes(h.id)) ? 'disabled' : ''}>
            ${icono(h.id)}<span>${esc(h.nombre)} · ${h.energia}⚡</span></button>`,
        )
        .join('')}
    </div>`
      : `<button class="boton" data-accion="salirCombate">Volver</button>`;

  return `
  <div class="combate">
    <div class="escena" style="${zona ? `background-image:url('assets/zonas/${esc(zona.id)}.png')` : ''}">
      <div class="placa placa-rival">
        <b>${esc(enemigo.nombre)}</b>
        ${barra(enemigo.vida, enemigo.vidaMax, 'enemiga')}
      </div>
      <div class="placa placa-heroe">
        <b>Tú · ${jugador.energia}⚡</b>
        ${barra(jugador.vida, jugador.vidaMax)}
      </div>

      <div class="combatiente rival">
        ${
          estado === 'victoria' && escena.golpeado !== 'rival'
            ? ''
            : figura('enemigos', combate.enemigoId, enemigo.nombre, {
                pose: escena.rival,
                poses: 3,
                clase: escena.golpeado === 'rival' ? 'golpeado' : '',
              })
        }
      </div>

      <div class="combatiente heroe ${escena.efecto?.esquivado ? 'esquiva' : ''}">${figuraHeroe(ctx)}</div>
      ${efectosHTML()}
    </div>

    <div class="diario">${registro.map((l) => `<div>${esc(l)}</div>`).join('')}</div>

    ${combate.avisa && estado === 'en_curso' ? `<div class="aviso ojo">${esc(enemigo.nombre)} se prepara para un golpe fuerte. Cúbrete.</div>` : ''}
    ${estado === 'victoria' ? '<div class="aviso">¡Victoria!</div>' : ''}
    ${estado === 'derrota' ? '<div class="aviso ojo">Esta vez no ha podido ser. Vuelve a intentarlo.</div>' : ''}
    ${acciones}
  </div>`;
}

/** Todas las habilidades: las abiertas con lo que valen hoy, las cerradas con su nivel. */
function habilidadesHTML(ctx) {
  const nivel = ctx.estado.nivel.nivel;
  const carga = cargaDe(ctx);
  const llevadas = new Set(llevadasDe(ctx).map((h) => h.id));
  const lleno = llevadas.size >= HABILIDADES_EN_COMBATE;

  return Object.entries(HABILIDADES)
    .map(([id, h]) => {
      if (h.nivel > nivel) {
        return `
        <div class="tarjeta habilidad cerrada">
          ${icono(id)}
          <div><b>${esc(h.nombre)}</b> <span class="mini">· nivel ${h.nivel}</span>
            <div class="mini">${esc(h.fuente)}</div></div>
        </div>`;
      }
      const lleva = llevadas.has(id);
      return `
      <div class="tarjeta habilidad ${lleva ? 'llevada' : ''}">
        ${icono(id)}
        <div>
          <div class="entre"><b>${esc(h.nombre)}</b><span class="mini">${h.energia}⚡</span></div>
          <div class="mini">${esc(h.descripcion)}</div>
          <div class="potencia rama-${h.rama}">${esc(describirPotencia(id, carga))}</div>
          <div class="mini">${esc(h.fuente)}</div>
          <button class="mini" data-accion="llevarHabilidad" data-habilidad="${esc(id)}"
            ${!lleva && lleno ? 'disabled' : ''}>${lleva ? 'Dejar en casa' : lleno ? `Ya llevas ${HABILIDADES_EN_COMBATE}` : 'Llevar al combate'}</button>
        </div>
      </div>`;
    })
    .join('');
}

export function render(ctx) {
  if (combate) return pantallaCombate(ctx);

  const nivel = ctx.estado.nivel.nivel;
  const stats = statsPersonaje(nivel, ctx.db.equipado);
  const abierto = quedaPresupuesto(ctx);
  const { presupuesto, gastado } = presupuestoDeHoy(ctx);
  const vigor = vigorDeHoy(ctx);
  const restante = vigor.maximo - vigor.gastado;

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
            ${figura('enemigos', id, ficha.nombre, { pose: 0, poses: 3, clase: 'retrato' })}
            <div class="nom">${esc(ficha.nombre)}</div>
            <div class="precio">${premio.xp} XP${derrotado ? ' · vencido' : ''}</div>
            <button data-accion="luchar" data-enemigo="${esc(id)}"
              ${abierto && restante >= costeCombate(ficha.jefe) ? '' : 'disabled'}>Luchar</button>
          </div>`;
        })
        .join('');

      return `
      <div class="titulo-seccion">${esc(zona.nombre)}</div>
      <div class="mini" style="margin-bottom:10px">${esc(zona.descripcion)}</div>
      <div class="catalogo">${enemigos}</div>`;
    })
    .join('');

  const avisoVigor =
    restante > 0
      ? `<div class="mini">Te quedan ${restante} de ${vigor.maximo} combates hoy. Los jefes cuestan dos.</div>`
      : `<div class="aviso ojo">Hoy ya no te queda vigor para pelear.${vigor.cumplido ? '' : ' Cumple el día para tener dos combates más.'}</div>`;

  return `
  <div class="tarjeta">
    <div class="luchador" style="grid-template-columns:84px 1fr">
      ${figura('personaje', etapaPersonaje(nivel).id, 'Héroe', { pose: FRENTE.ficha, poses: 3, clase: 'ficha' })}
      <div>
        <div class="mini">Nivel ${nivel}</div>
        <div class="entre" style="margin-top:8px"><span class="mini">Fuerza</span><b>${stats.fuerza}</b></div>
        <div class="entre"><span class="mini">Vida</span><b>${stats.vidaMax}</b></div>
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
                  ${figura('equipo', id, pieza.nombre, { clase: 'objeto' })}
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
  <div class="mini" style="margin:-4px 0 10px">
    Se cargan con tus hábitos: cuanto mejor llevas la semana, más pegan. Llevas ${HABILIDADES_EN_COMBATE} al combate.
  </div>
  ${habilidadesHTML(ctx)}

  ${
    abierto
      ? `<div class="aviso">Puedes seguir combatiendo hoy: quedan ${presupuesto.xp - gastado.xp} XP y ${presupuesto.monedas - gastado.monedas} monedas de recompensa.</div>`
      : `<div class="aviso ojo">${
          presupuesto.desbloqueado
            ? 'Ya has agotado las recompensas de hoy. Vuelve mañana.'
            : 'Registra un buen día de entreno o comida para poder combatir.'
        }</div>`
  }

  ${avisoVigor}
  ${zonas}`;
}

export const acciones = {
  luchar: (el, ctx) => {
    const enemigoId = el.dataset.enemigo;
    const jefe = Boolean(ENEMIGOS[enemigoId].jefe);
    const vigor = vigorDeHoy(ctx);
    if (!puedeCombatir(vigor.combates, vigor.cumplido, jefe).ok) {
      alert('Hoy ya no te queda vigor para pelear. Vuelve mañana.');
      return;
    }

    pararAnimacion();
    combate = iniciarCombate(statsPersonaje(ctx.estado.nivel.nivel, ctx.db.equipado), enemigoId, cargaDe(ctx));

    // El vigor se gasta al entrar, no al ganar: si solo costara perder tiempo, reintentar
    // hasta que la tirada saliera bien sería gratis.
    ctx.actualizar((db) => {
      const dia = db.dias[ctx.hoy] ?? { ejercicios: [], comidas: [], extras: [] };
      dia.combates = [...(dia.combates ?? []), { enemigo: enemigoId, jefe }];
      db.dias[ctx.hoy] = dia;
    });
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

  llevarHabilidad: (el, ctx) => {
    const id = el.dataset.habilidad;
    const actuales = llevadasDe(ctx).map((h) => h.id);
    const siguiente = actuales.includes(id)
      ? actuales.filter((x) => x !== id)
      : [...actuales, id].slice(0, HABILIDADES_EN_COMBATE);
    ctx.actualizar((db) => {
      db.habilidadesEquipadas = siguiente;
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
