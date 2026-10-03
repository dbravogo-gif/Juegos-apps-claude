import { ENEMIGOS, HABILIDADES } from '../../data/content.js';
import { potencia, CARGA_VACIA } from './habilidades.js';

/** Generador con semilla: el combate necesita azar, pero los tests necesitan repetirlo. */
export function generador(semilla) {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

const VARIACION = 0.15;

// Cubrirse deja pasar solo esta parte del golpe. Antes doblaba la defensa, que es un número
// pequeño y restado: contra un enemigo flojo no cambiaba nada y contra un jefe tampoco.
// Como porcentaje, cubrirse siempre significa algo y el jugador tiene una decisión real.
const PASA_DEFENDIENDO = 0.4;

// La defensa quita un porcentaje del golpe, no una cantidad fija. Restándola, el combate
// era un interruptor: por debajo del umbral no hacías nada y por encima ganabas siempre,
// sin combates reñidos por el medio. Con esta forma el daño baja de forma continua y un
// nivel de más se nota sin volver trivial la pelea.
const ESCALA_DEFENSA = 20;

function dano(ataque, defensa, { multiplicador = 1, defendiendo = false, pasa = null, azar }) {
  const bruto = ataque * multiplicador * (ESCALA_DEFENSA / (ESCALA_DEFENSA + defensa));
  const ruido = 1 + (azar() * 2 - 1) * VARIACION;
  const golpe = bruto * ruido * (pasa ?? (defendiendo ? PASA_DEFENDIENDO : 1));
  return Math.max(1, Math.round(golpe));
}

/**
 * @param {{ vidaMax:number, fuerza:number, defensa:number, energiaMax:number }} stats
 * @param {string} enemigoId
 * @param {import('./habilidades.js').Carga} carga hábitos que alimentan las habilidades;
 *   se fija al empezar para que el combate no cambie a mitad si se registra algo.
 */
export function iniciarCombate(stats, enemigoId, carga = CARGA_VACIA) {
  const ficha = ENEMIGOS[enemigoId];

  return {
    enemigoId,
    enemigo: { ...ficha, vida: ficha.vida, vidaMax: ficha.vida },
    // Dentro del combate todos pegan con `ataque`; del lado del personaje eso es su fuerza.
    jugador: { ...stats, ataque: stats.fuerza, vida: stats.vidaMax, energia: stats.energiaMax },
    turno: 1,
    defendiendo: { jugador: false, enemigo: false },
    // El jefe telegrafía su golpe fuerte un turno antes. Sin ese aviso, cubrirse sería
    // adivinar; con él, el combate se puede leer y defenderse deja de ser un botón muerto.
    avisa: avisaGolpeFuerte(ficha, 1),
    carga,
    // Habilidades de una vez por combate ya gastadas.
    usadas: [],
    // Lo que acaba de pasar con una habilidad, para que la escena lo pinte.
    efecto: null,
    registro: [`Te enfrentas a ${ficha.nombre}.`],
    estado: 'en_curso',
  };
}

/** Si el enemigo va a soltar su golpe fuerte en el turno indicado. */
function avisaGolpeFuerte(ficha, turnoSiguiente) {
  return ficha.patron === 'jefe' && turnoSiguiente % 3 === 0;
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
  let pasaJugador = null;
  let esquiva = 0;
  let usadas = combate.usadas ?? [];
  let efecto = null;

  if (accion.tipo === 'defender') {
    defendiendoJugador = true;
    jugador.energia = Math.min(jugador.energiaMax, jugador.energia + 2);
    registro.push('Te cubres y recuperas aliento.');
  } else if (accion.tipo === 'habilidad') {
    const ficha = HABILIDADES[accion.habilidad];
    const p = potencia(accion.habilidad, combate.carga ?? CARGA_VACIA);

    if (jugador.energia < ficha.energia) {
      registro.push('No te queda energía para eso.');
    } else if (ficha.efecto === 'cura' && usadas.includes(accion.habilidad)) {
      registro.push(`${ficha.nombre} ya lo has usado en este combate.`);
    } else {
      jugador.energia -= ficha.energia;

      if (ficha.efecto === 'cura') {
        const antes = jugador.vida;
        jugador.vida = Math.min(jugador.vidaMax, jugador.vida + Math.round(jugador.vidaMax * p.cura));
        usadas = [...usadas, accion.habilidad];
        efecto = { habilidad: accion.habilidad, tipo: 'cura', valor: jugador.vida - antes };
        registro.push(`${ficha.nombre}: recuperas ${jugador.vida - antes} de vida.`);
      } else if (ficha.efecto === 'guardia') {
        pasaJugador = p.pasa;
        efecto = { habilidad: accion.habilidad, tipo: 'guardia' };
        registro.push(`${ficha.nombre}: te plantas para el golpe.`);
      } else if (ficha.efecto === 'esquiva') {
        esquiva = p.esquiva;
        efecto = { habilidad: accion.habilidad, tipo: 'esquiva' };
        registro.push(`${ficha.nombre}: te mueves ligero.`);
      } else {
        let total = 0;
        for (let i = 0; i < p.golpes; i += 1) {
          const puntos = dano(jugador.ataque, enemigo.defensa, {
            multiplicador: p.multiplicador,
            defendiendo: combate.defendiendo.enemigo,
            azar,
          });
          enemigo.vida -= puntos;
          total += puntos;
          registro.push(`${ficha.nombre}: ${puntos} de daño.`);
        }
        efecto = { habilidad: accion.habilidad, tipo: 'golpe', valor: total, golpes: p.golpes };
      }
    }
  } else {
    const puntos = dano(jugador.ataque, enemigo.defensa, {
      defendiendo: combate.defendiendo.enemigo,
      azar,
    });
    enemigo.vida -= puntos;
    registro.push(`Atacas: ${puntos} de daño.`);
  }

  if (enemigo.vida <= 0) {
    enemigo.vida = 0;
    registro.push(`${enemigo.nombre} cae derrotado.`);
    return { ...combate, jugador, enemigo, registro, usadas, efecto, estado: 'victoria', turno: combate.turno + 1 };
  }

  const respuesta = accionEnemigo({ ...combate, enemigo }, azar);
  let defendiendoEnemigo = false;

  if (respuesta === 'defender') {
    defendiendoEnemigo = true;
    registro.push(`${enemigo.nombre} se protege.`);
  } else if (esquiva && azar() < esquiva) {
    efecto = { ...efecto, esquivado: true };
    registro.push(`${enemigo.nombre} golpea al aire: lo esquivas.`);
  } else {
    const puntos = dano(enemigo.ataque, jugador.defensa, {
      multiplicador: respuesta === 'fuerte' ? 1.6 : 1,
      defendiendo: defendiendoJugador,
      pasa: pasaJugador,
      azar,
    });
    jugador.vida -= puntos;
    registro.push(
      respuesta === 'fuerte'
        ? `${enemigo.nombre} golpea con todo: ${puntos} de daño.`
        : `${enemigo.nombre} ataca: ${puntos} de daño.`,
    );
  }

  if (jugador.vida <= 0) {
    jugador.vida = 0;
    registro.push('Te retiras malherido.');
    return { ...combate, jugador, enemigo, registro, usadas, efecto, estado: 'derrota', turno: combate.turno + 1 };
  }

  return {
    ...combate,
    jugador,
    enemigo,
    registro,
    usadas,
    efecto,
    defendiendo: { jugador: defendiendoJugador || pasaJugador !== null, enemigo: defendiendoEnemigo },
    avisa: avisaGolpeFuerte(enemigo, combate.turno + 1),
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
