import { ENEMIGOS, HABILIDADES } from '../../data/content.js';

/** Generador con semilla: el combate necesita azar, pero los tests necesitan repetirlo. */
export function generador(semilla) {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

const VARIACION = 0.15;
const FACTOR_DEFENSA = 2;

function dano(ataque, defensa, { multiplicador = 1, defendiendo = false, azar }) {
  const defensaEfectiva = defendiendo ? defensa * FACTOR_DEFENSA : defensa;
  const bruto = ataque * multiplicador - defensaEfectiva;
  const ruido = 1 + (azar() * 2 - 1) * VARIACION;
  return Math.max(1, Math.round(bruto * ruido));
}

/**
 * @param {{ vidaMax:number, fuerza:number, defensa:number, energiaMax:number }} stats
 * @param {string} enemigoId
 */
export function iniciarCombate(stats, enemigoId) {
  const ficha = ENEMIGOS[enemigoId];

  return {
    enemigoId,
    enemigo: { ...ficha, vida: ficha.vida, vidaMax: ficha.vida },
    // Dentro del combate todos pegan con `ataque`; del lado del personaje eso es su fuerza.
    jugador: { ...stats, ataque: stats.fuerza, vida: stats.vidaMax, energia: stats.energiaMax },
    turno: 1,
    defendiendo: { jugador: false, enemigo: false },
    registro: [`Te enfrentas a ${ficha.nombre}.`],
    estado: 'en_curso',
  };
}

function accionEnemigo(combate, azar) {
  const { enemigo, turno } = combate;
  const vidaBaja = enemigo.vida / enemigo.vidaMax < 0.3;

  switch (enemigo.patron) {
    case 'defensivo':
      return turno % 3 === 0 ? 'defender' : 'atacar';
    case 'cauto':
      return vidaBaja && azar() < 0.5 ? 'defender' : 'atacar';
    case 'jefe':
      return turno % 3 === 0 ? 'fuerte' : 'atacar';
    default:
      return 'atacar';
  }
}

/**
 * Resuelve un turno completo: primero actúa el jugador, después el enemigo si sigue vivo.
 * Devuelve un estado nuevo; no muta el que recibe.
 *
 * @param {object} combate
 * @param {{ tipo: 'atacar'|'defender'|'habilidad', habilidad?: string }} accion
 * @param {() => number} azar
 */
export function turno(combate, accion, azar = Math.random) {
  if (combate.estado !== 'en_curso') return combate;

  const jugador = { ...combate.jugador };
  const enemigo = { ...combate.enemigo };
  const registro = [];
  let defendiendoJugador = false;

  if (accion.tipo === 'defender') {
    defendiendoJugador = true;
    jugador.energia = Math.min(jugador.energiaMax, jugador.energia + 2);
    registro.push('Te cubres y recuperas aliento.');
  } else if (accion.tipo === 'habilidad') {
    const habilidad = HABILIDADES[accion.habilidad];
    if (jugador.energia < habilidad.energia) {
      registro.push('No te queda energía para eso.');
    } else {
      jugador.energia -= habilidad.energia;

      if (habilidad.defensaExtra) {
        defendiendoJugador = true;
        jugador.defensaExtra = habilidad.defensaExtra;
        registro.push(`${habilidad.nombre}: te preparas para el golpe.`);
      } else {
        const golpes = habilidad.golpes ?? 1;
        for (let i = 0; i < golpes; i += 1) {
          const puntos = dano(jugador.ataque, enemigo.defensa, {
            multiplicador: habilidad.multiplicador,
            defendiendo: combate.defendiendo.enemigo,
            azar,
          });
          enemigo.vida -= puntos;
          registro.push(`${habilidad.nombre}: ${puntos} de daño.`);
        }
      }
    }
  } else {
    const puntos = dano(jugador.ataque, enemigo.defensa, {
      defendiendo: combate.defendiendo.enemigo,
      azar,
    });
    enemigo.vida -= puntos;
    jugador.energia = Math.min(jugador.energiaMax, jugador.energia + 1);
    registro.push(`Atacas: ${puntos} de daño.`);
  }

  if (enemigo.vida <= 0) {
    enemigo.vida = 0;
    registro.push(`${enemigo.nombre} cae derrotado.`);
    return { ...combate, jugador, enemigo, registro, estado: 'victoria', turno: combate.turno + 1 };
  }

  const respuesta = accionEnemigo({ ...combate, enemigo }, azar);
  let defendiendoEnemigo = false;

  if (respuesta === 'defender') {
    defendiendoEnemigo = true;
    registro.push(`${enemigo.nombre} se protege.`);
  } else {
    const defensaJugador = jugador.defensa + (jugador.defensaExtra ?? 0);
    const puntos = dano(enemigo.ataque, defensaJugador, {
      multiplicador: respuesta === 'fuerte' ? 1.6 : 1,
      defendiendo: defendiendoJugador,
      azar,
    });
    jugador.vida -= puntos;
    registro.push(
      respuesta === 'fuerte'
        ? `${enemigo.nombre} golpea con todo: ${puntos} de daño.`
        : `${enemigo.nombre} ataca: ${puntos} de daño.`,
    );
  }

  delete jugador.defensaExtra;

  if (jugador.vida <= 0) {
    jugador.vida = 0;
    registro.push('Te retiras malherido.');
    return { ...combate, jugador, enemigo, registro, estado: 'derrota', turno: combate.turno + 1 };
  }

  return {
    ...combate,
    jugador,
    enemigo,
    registro,
    defendiendo: { jugador: defendiendoJugador, enemigo: defendiendoEnemigo },
    turno: combate.turno + 1,
  };
}

/** Recompensa nominal de un enemigo, antes de recortarla al presupuesto diario de extras. */
export function recompensaEnemigo(enemigoId) {
  const ficha = ENEMIGOS[enemigoId];
  const fuerza = ficha.vida + ficha.ataque * 3 + ficha.defensa * 2;
  const escala = ficha.jefe ? 0.5 : 0.22;

  return {
    xp: Math.round(fuerza * escala),
    monedas: Math.round(fuerza * escala * 0.6),
  };
}
