// Balance del combate: `node tools/simular-combate.js`
// Para cada enemigo busca a qué nivel empieza a ganarse, que es como se piensa el ritmo:
// los normales de una zona deben caer poco después de abrirla y el jefe unos niveles más.

import { ZONAS, ENEMIGOS, EQUIPO } from '../src/data/content.js';
import { statsPersonaje } from '../src/core/progression/character.js';
import { iniciarCombate, turno, generador } from '../src/core/combat/battle.js';

const INTENTOS = 40;
const NIVEL_MAXIMO = 25;
const HOLGADO = 0.85;

/** Lo mejor que se podría llevar puesto a ese nivel, sin haber ahorrado de más. */
function equipoDe(nivel) {
  const mejor = (tipo) => EQUIPO.filter((e) => e.tipo === tipo && e.nivel <= nivel).pop()?.id;
  return { arma: mejor('arma'), armadura: mejor('armadura') };
}

function tasaDeVictoria(nivel, enemigoId, conEquipo = true) {
  const stats = statsPersonaje(nivel, conEquipo ? equipoDe(nivel) : {});
  let ganadas = 0;

  for (let semilla = 1; semilla <= INTENTOS; semilla += 1) {
    const azar = generador(semilla);
    let combate = iniciarCombate(stats, enemigoId);

    while (combate.estado === 'en_curso' && combate.turno < 120) {
      // Ataca, y se cubre cuando la cosa se pone fea: es lo que haría cualquiera.
      const enApuros = combate.jugador.vida < combate.jugador.vidaMax * 0.3;
      combate = turno(combate, { tipo: enApuros ? 'defender' : 'atacar' }, azar);
    }
    if (combate.estado === 'victoria') ganadas += 1;
  }

  return ganadas / INTENTOS;
}

/** Primer nivel en el que el combate se gana con holgura. */
function nivelDeCaida(enemigoId, conEquipo = true) {
  for (let nivel = 1; nivel <= NIVEL_MAXIMO; nivel += 1) {
    if (tasaDeVictoria(nivel, enemigoId, conEquipo) >= HOLGADO) return nivel;
  }
  return null;
}

for (const zona of ZONAS) {
  const tabla = {};

  for (const id of [...zona.enemigos, zona.jefe]) {
    const conEquipo = nivelDeCaida(id);
    tabla[`${ENEMIGOS[id].nombre}${ENEMIGOS[id].jefe ? ' (jefe)' : ''}`] = {
      'Cae en nivel': conEquipo ?? `> ${NIVEL_MAXIMO}`,
      'Sin comprar nada': nivelDeCaida(id, false) ?? `> ${NIVEL_MAXIMO}`,
      'Al abrir la zona': `${Math.round(tasaDeVictoria(zona.nivel, id) * 100)} %`,
    };
  }

  console.log(`\n=== ${zona.nombre} (se abre en el nivel ${zona.nivel}) ===`);
  console.table(tabla);
}
