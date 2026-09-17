import test from 'node:test';
import assert from 'node:assert/strict';

import {
  zonasAbiertas,
  espaciosAbiertos,
  tiendasAbiertas,
  habilidadesAbiertas,
  actividadesAbiertas,
  etapaPersonaje,
  proximoDesbloqueo,
  articulosDisponibles,
  mascotasGanadas,
  calendarioDesbloqueos,
} from '../src/core/progression/unlocks.js';
import { statsPersonaje } from '../src/core/progression/character.js';
import { iniciarCombate, turno, recompensaEnemigo, generador } from '../src/core/combat/battle.js';
import { MUEBLES, EQUIPO } from '../src/data/content.js';

test('el nivel 1 abre lo justo para empezar', () => {
  assert.equal(zonasAbiertas(1).length, 1);
  assert.equal(espaciosAbiertos(1).length, 1);
  assert.equal(tiendasAbiertas(1).length, 1, 'solo el mercader; el herrero llega al 4');
  assert.equal(habilidadesAbiertas(1).length, 0);
  assert.equal(actividadesAbiertas(1).length, 1);
});

test('las zonas y tiendas llegan en su nivel', () => {
  assert.equal(zonasAbiertas(4).length, 1);
  assert.equal(zonasAbiertas(5).length, 2);
  assert.equal(zonasAbiertas(10).length, 3);
  assert.equal(tiendasAbiertas(4).length, 2);
});

test('el personaje cambia de etapa con el nivel', () => {
  assert.equal(etapaPersonaje(1).id, 'etapa1');
  assert.equal(etapaPersonaje(4).id, 'etapa1');
  assert.equal(etapaPersonaje(5).id, 'etapa2');
  assert.equal(etapaPersonaje(12).id, 'etapa3');
  assert.equal(etapaPersonaje(40).id, 'etapa4');
});

test('siempre hay un próximo desbloqueo a la vista hasta el final del contenido', () => {
  for (let nivel = 1; nivel < 12; nivel += 1) {
    const siguiente = proximoDesbloqueo(nivel);
    assert.ok(siguiente, `el nivel ${nivel} se queda sin horizonte`);
    assert.ok(siguiente.nivel > nivel);
  }
  assert.equal(proximoDesbloqueo(99), null);
});

test('del nivel 1 al 10 casi todos los niveles dan algo', () => {
  const niveles = new Set(calendarioDesbloqueos().map((d) => d.nivel));
  const sinNada = [];
  for (let nivel = 1; nivel <= 10; nivel += 1) if (!niveles.has(nivel)) sinNada.push(nivel);

  assert.ok(sinNada.length <= 2, `demasiados niveles vacíos: ${sinNada.join(', ')}`);
});

test('el nivel abre el catálogo y las monedas compran las piezas', () => {
  const nivel1 = articulosDisponibles(MUEBLES, 1);
  const nivel8 = articulosDisponibles(MUEBLES, 8);

  assert.ok(nivel1.length > 0);
  assert.ok(nivel8.length > nivel1.length);
  assert.ok(nivel1.every((m) => m.precio > 0), 'nada es gratis dentro de lo desbloqueado');
});

test('las mascotas se ganan por hito y no aparecen antes', () => {
  assert.equal(mascotasGanadas({}).length, 0);
  assert.equal(mascotasGanadas({ rachaEntreno: 13 }).length, 0);

  const conRacha = mascotasGanadas({ rachaEntreno: 14 });
  assert.equal(conRacha.length, 1);
  assert.equal(conRacha[0].id, 'gato');

  const todas = mascotasGanadas({ rachaEntreno: 30, rachaComida: 14, jefesDerrotados: 1 });
  assert.equal(todas.length, 4);
});

test('ninguna mascota se puede comprar con monedas', () => {
  const comprables = [...MUEBLES, ...EQUIPO].map((a) => a.id);
  mascotasGanadas({ rachaEntreno: 30, rachaComida: 30, jefesDerrotados: 5 }).forEach((m) => {
    assert.ok(!comprables.includes(m.id));
  });
});

test('el personaje empieza con cinco de fuerza y veinte de vida', () => {
  assert.equal(statsPersonaje(1).fuerza, 5);
  assert.equal(statsPersonaje(1).vidaMax, 20);
});

test('cada nivel da uno de fuerza y cinco de vida', () => {
  assert.equal(statsPersonaje(2).fuerza, 6);
  assert.equal(statsPersonaje(2).vidaMax, 25);
  assert.equal(statsPersonaje(11).fuerza, 15);
  assert.equal(statsPersonaje(11).vidaMax, 70);
});

test('el equipo suma a las dos estadísticas según su tipo', () => {
  const desnudo = statsPersonaje(5);
  const armado = statsPersonaje(5, { arma: 'arma_espada_corta', armadura: 'arm_cuero' });

  assert.equal(armado.fuerza, desnudo.fuerza + 8);
  assert.equal(armado.vidaMax, desnudo.vidaMax + 40);
});

test('se puede avanzar sin comprar nada: subir de nivel sigue notándose', () => {
  // Con el mejor equipo de su tramo, el nivel debe seguir aportando una parte real.
  const soloNivel = statsPersonaje(18);
  const conTodo = statsPersonaje(18, { arma: 'arma_ceremonial', armadura: 'arm_mosaico' });
  const aportadoPorNivel = soloNivel.fuerza / conTodo.fuerza;

  assert.ok(aportadoPorNivel > 0.3, `el equipo eclipsa al nivel: ${aportadoPorNivel}`);
});

// --- Combate ---

const jugadorFuerte = statsPersonaje(14, { arma: 'arma_lanza', armadura: 'arm_placas' });
const atacar = { tipo: 'atacar' };

test('un combate termina en victoria contra un enemigo débil', () => {
  const azar = generador(42);
  let combate = iniciarCombate(jugadorFuerte, 'rata_murallas');

  while (combate.estado === 'en_curso' && combate.turno < 50) {
    combate = turno(combate, atacar, azar);
  }

  assert.equal(combate.estado, 'victoria');
  assert.equal(combate.enemigo.vida, 0);
});

test('un personaje de nivel bajo pierde contra un jefe de zona alta', () => {
  const azar = generador(7);
  let combate = iniciarCombate(statsPersonaje(1), 'el_coleccionista');

  while (combate.estado === 'en_curso' && combate.turno < 200) {
    combate = turno(combate, atacar, azar);
  }

  assert.equal(combate.estado, 'derrota');
});

test('el combate es reproducible con la misma semilla', () => {
  const jugar = (semilla) => {
    const azar = generador(semilla);
    let combate = iniciarCombate(jugadorFuerte, 'bandido_harapiento');
    while (combate.estado === 'en_curso' && combate.turno < 50) combate = turno(combate, atacar, azar);
    return combate.turno;
  };

  assert.equal(jugar(99), jugar(99));
});

test('defenderse reduce el daño recibido y recupera energía', () => {
  // Hace falta un enemigo que pegue fuerte: contra golpes flojos ambos casos tocan
  // el suelo de 1 de daño y la comparación no distinguiría nada.
  const inicial = iniciarCombate(statsPersonaje(3), 'bestia_cuerno');
  const gastado = { ...inicial, jugador: { ...inicial.jugador, energia: 0 } };

  const defendido = turno(gastado, { tipo: 'defender' }, generador(5));
  const atacado = turno(gastado, atacar, generador(5));

  assert.ok(defendido.jugador.vida > atacado.jugador.vida, 'defender debería doler menos');
  assert.ok(defendido.jugador.energia > 0, 'defender recupera energía');
});

test('una habilidad sin energía no se ejecuta', () => {
  const inicial = iniciarCombate(statsPersonaje(5), 'rata_murallas');
  const agotado = { ...inicial, jugador: { ...inicial.jugador, energia: 0 } };

  const resultado = turno(agotado, { tipo: 'habilidad', habilidad: 'embestida' }, generador(3));
  assert.ok(resultado.registro.some((l) => l.includes('energía')));
  assert.equal(resultado.enemigo.vida, agotado.enemigo.vida, 'el enemigo no recibe daño');
});

test('la habilidad pega más fuerte que un ataque normal y gasta energía', () => {
  const inicial = iniciarCombate(statsPersonaje(10, { arma: 'arma_sable' }), 'cangrejo_coloso');

  const conHabilidad = turno(inicial, { tipo: 'habilidad', habilidad: 'embestida' }, generador(11));
  const normal = turno(inicial, atacar, generador(11));

  assert.ok(conHabilidad.enemigo.vida < normal.enemigo.vida);
  assert.ok(conHabilidad.jugador.energia < inicial.jugador.energia);
});

test('un combate terminado ya no admite más turnos', () => {
  const terminado = { ...iniciarCombate(statsPersonaje(5), 'rata_murallas'), estado: 'victoria' };
  assert.equal(turno(terminado, atacar, generador(1)), terminado);
});

test('los jefes recompensan más que los enemigos normales de su zona', () => {
  assert.ok(recompensaEnemigo('guardian_puerta').xp > recompensaEnemigo('rata_murallas').xp);
  assert.ok(recompensaEnemigo('el_coleccionista').xp > recompensaEnemigo('guardian_puerta').xp);
});

// --- Balance ---
// El combate se puede desajustar sin que ningún test falle: estos fijan que las zonas sean
// jugables al llegar a ellas y que los jefes sigan costando. Ver tools/simular-combate.js.

import { ZONAS } from '../src/data/content.js';

const mejorPieza = (tipo, nivel) => EQUIPO.filter((e) => e.tipo === tipo && e.nivel <= nivel).pop()?.id;

function tasaDeVictoria(nivel, enemigoId, intentos = 30) {
  const equipado = { arma: mejorPieza('arma', nivel), armadura: mejorPieza('armadura', nivel) };
  let ganadas = 0;

  for (let semilla = 1; semilla <= intentos; semilla += 1) {
    const azar = generador(semilla);
    let combate = iniciarCombate(statsPersonaje(nivel, equipado), enemigoId);
    while (combate.estado === 'en_curso' && combate.turno < 120) {
      const enApuros = combate.jugador.vida < combate.jugador.vidaMax * 0.3;
      combate = turno(combate, { tipo: enApuros ? 'defender' : 'atacar' }, azar);
    }
    if (combate.estado === 'victoria') ganadas += 1;
  }

  return ganadas / intentos;
}

test('los enemigos normales se pueden ganar nada más abrir su zona', () => {
  ZONAS.forEach((zona) => {
    zona.enemigos.forEach((id) => {
      const tasa = tasaDeVictoria(zona.nivel, id);
      assert.ok(tasa > 0.8, `${id} solo se gana el ${Math.round(tasa * 100)} % en ${zona.nombre}`);
    });
  });
});

test('los jefes no caen el mismo día que se abre la zona', () => {
  ZONAS.forEach((zona) => {
    const tasa = tasaDeVictoria(zona.nivel, zona.jefe);
    assert.ok(tasa < 0.5, `${zona.jefe} se gana demasiado pronto: ${Math.round(tasa * 100)} %`);
  });
});

test('pero todos los jefes acaban siendo alcanzables', () => {
  ZONAS.forEach((zona) => {
    const tasa = tasaDeVictoria(zona.nivel + 5, zona.jefe);
    assert.ok(tasa > 0.7, `${zona.jefe} sigue imposible cinco niveles después: ${Math.round(tasa * 100)} %`);
  });
});
