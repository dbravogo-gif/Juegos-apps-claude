// Qué hace cada ataque, en palabras (autor, 2026-11-19: «deberemos poner una forma de ver lo que
// hacen»). Puro: sale de los datos del movimiento, así que un ataque nuevo se explica solo.

import type { Efecto, EstadisticaCombate, Movimiento } from './modelo';

const ESTADISTICA: Record<EstadisticaCombate, string> = {
  fuerza: 'la Fuerza',
  escudo: 'el Escudo',
  magia: 'la Magia',
  resMagica: 'la Resistencia mágica',
  celeridad: 'la Celeridad',
};
const PROVOCA: Record<string, string> = {
  quemado: 'quemar',
  dormido: 'dormir',
  paralizado: 'paralizar',
  envenenado: 'envenenar',
  intoxicado: 'intoxicar',
};

const conProbabilidad = (texto: string, prob: number) => (prob >= 100 ? `${texto}.` : `${texto} (${prob} %).`);
const fraccion = (f: number) => (f === 0.5 ? 'la mitad' : f === 0.25 ? 'un cuarto' : `el ${Math.round(f * 100)} %`);

function efecto(e: Efecto): string {
  switch (e.tipo) {
    case 'estado':
      return conProbabilidad(`Puede ${PROVOCA[e.estado] ?? e.estado} al rival`, e.prob);
    case 'retroceso':
      return conProbabilidad('Puede hacer que el rival pierda el turno', e.prob);
    case 'etapa': {
      const mucho = Math.abs(e.cambio) > 1 ? ' mucho' : '';
      const verbo = e.cambio > 0 ? 'Sube' : 'Baja';
      const quien = e.a === 'propio' ? `tu ${ESTADISTICA[e.estadistica].replace(/^(la|el) /, '')}` : `${ESTADISTICA[e.estadistica]} del rival`;
      return conProbabilidad(`${verbo}${mucho} ${quien}`, e.prob);
    }
    case 'drenar':
      return `Recupera ${fraccion(e.fraccion)} del daño que hace.`;
    case 'curar':
      return `Recupera ${fraccion(e.fraccion)} de tu Vida.`;
    case 'proteger':
      return 'Te protege de todo este turno; usado seguido, falla cada vez más.';
  }
}

/**
 * Las cifras (potencia, y la precisión solo si puede fallar más de lo normal) y lo que hace aparte
 * de pegar. La categoría la dice el icono de la pantalla. Que los físicos peguen con la Fuerza
 * contra el Escudo y los mágicos con la Magia contra la Resistencia mágica es lo normal y no se
 * dice (autor, 2026-11-19): solo lo que se salga de eso.
 */
export function describirMovimiento(m: Movimiento, op: { variosRivales?: boolean } = {}): { cifras: string; efecto: string } {
  const cifras = [m.categoria === 'estado' ? null : `Potencia ${m.poder}`, m.precision !== null && m.precision < 100 ? `Precisión ${m.precision}` : null]
    .filter(Boolean)
    .join(' · ');
  const partes: string[] = [];
  if (m.descripcion) partes.push(m.descripcion);
  for (const e of m.efectos ?? []) partes.push(efecto(e));
  // En un 1 contra 1 no tiene sentido decirlo (probador, 2026-11-19).
  if (m.objetivo === 'rivales' && op.variosRivales) partes.push('Alcanza a todos los rivales.');
  if ((m.prioridad ?? 0) > 0) partes.push('Va antes que los demás.');
  else if ((m.prioridad ?? 0) < 0) partes.push('Va después que los demás.');
  return { cifras, efecto: partes.join(' ') };
}
