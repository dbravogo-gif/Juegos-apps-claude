// Balance del combate: `node tools/simular-combate.js`
// Enfrenta a cada enemigo con el personaje del nivel al que se lo va a encontrar y cuenta
// cuántas veces gana y con cuánta vida le queda.

import { ZONAS, ENEMIGOS, EQUIPO } from '../src/data/content.js';
import { statsPersonaje } from '../src/core/progression/character.js';
import { iniciarCombate, turno, generador } from '../src/core/combat/battle.js';

const INTENTOS = 60;

/** Lo mejor que el jugador podría llevar puesto a ese nivel sin haber ahorrado de más. */
function equipoDe(nivel) {
  const mejor = (tipo) =>
    EQUIPO.filter((e) => e.tipo === tipo && e.nivel <= nivel).pop()?.id;
  return { arma: mejor('arma'), armadura: mejor('armadura') };
}

function pelear(nivel, enemigoId, semilla, conEquipo) {
  const stats = statsPersonaje(nivel, conEquipo ? equipoDe(nivel) : {});
  const azar = generador(semilla);
  let combate = iniciarCombate(stats, enemigoId);

  while (combate.estado === 'en_curso' && combate.turno < 100) {
    // Ataca, y se cubre cuando la cosa se pone fea: es lo que haría cualquiera.
    const enApuros = combate.jugador.vida < combate.jugador.vidaMax * 0.3;
    combate = turno(combate, { tipo: enApuros ? 'defender' : 'atacar' }, azar);
  }

  return {
    gana: combate.estado === 'victoria',
    vidaRestante: combate.jugador.vida / combate.jugador.vidaMax,
    turnos: combate.turno,
  };
}

function medir(nivel, enemigoId, conEquipo) {
  const partidas = Array.from({ length: INTENTOS }, (_, i) => pelear(nivel, enemigoId, i + 1, conEquipo));
  const ganadas = partidas.filter((p) => p.gana);

  return {
    'Victorias': `${Math.round((ganadas.length / INTENTOS) * 100)} %`,
    'Vida al ganar': ganadas.length
      ? `${Math.round((ganadas.reduce((t, p) => t + p.vidaRestante, 0) / ganadas.length) * 100)} %`
      : '—',
    'Turnos': Math.round(partidas.reduce((t, p) => t + p.turnos, 0) / INTENTOS),
  };
}

for (const zona of ZONAS) {
  console.log(`\n=== ${zona.nombre} (nivel ${zona.nivel}) ===`);

  const tabla = {};
  for (const id of [...zona.enemigos, zona.jefe]) {
    tabla[`${ENEMIGOS[id].nombre}${ENEMIGOS[id].jefe ? ' (jefe)' : ''}`] = {
      'Pelado': medir(zona.nivel, id, false).Victorias,
      // Tres niveles por encima y sin comprar nada: comprobación de que se puede avanzar
      // a base de constancia aunque no se gaste una moneda.
      'Pelado +3': medir(zona.nivel + 3, id, false).Victorias,
      'Con equipo +3': medir(zona.nivel + 3, id, true).Victorias,
      ...medir(zona.nivel, id, true),
    };
  }
  console.table(tabla);
}
