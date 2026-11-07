// Crear, nombrar, curar y usar objetos fuera del combate.

import { tirarValia, vidaMaxima } from './estadisticas';
import type { Criatura, DatosJuego } from './modelo';
import { expParaNivel, movimientosIniciales } from './progreso';
import { elegir, entero, type EstadoRng } from './rng';

export interface OpcionesCriatura {
  valia?: number;
  temperamento?: string;
  mote?: string;
  uid?: string;
}

/** Crea un ejemplar con la Vida llena. Lo que no se indique sale del generador. */
export function crearCriatura(
  datos: DatosJuego,
  especie: string,
  nivel: number,
  rng: EstadoRng,
  opciones: OpcionesCriatura = {},
): Criatura {
  if (!datos.especies[especie]) throw new Error(`Especie desconocida: ${especie}`);
  const c: Criatura = {
    uid: opciones.uid ?? `c${entero(rng, 0, 0x7fffffff).toString(36)}`,
    especie,
    nivel,
    exp: expParaNivel(nivel),
    valia: opciones.valia ?? tirarValia(rng),
    temperamento: opciones.temperamento ?? elegir(rng, datos.temperamentos).id,
    vida: 0,
    movimientos: movimientosIniciales(datos, especie, nivel).map((id) => ({ id, pp: datos.movimientos[id].pp })),
    estado: null,
  };
  if (opciones.mote) c.mote = opciones.mote;
  c.vida = vidaMaxima(c, datos);
  return c;
}

export function nombreDe(c: Criatura, datos: DatosJuego): string {
  return c.mote ?? datos.especies[c.especie].nombre;
}

/** Vida, PP y estado como nuevos: lo que hace un refugio. Devuelve una copia. */
export function curarDelTodo(c: Criatura, datos: DatosJuego): Criatura {
  return {
    ...structuredClone(c),
    vida: vidaMaxima(c, datos),
    estado: null,
    movimientos: c.movimientos.map((m) => ({ id: m.id, pp: datos.movimientos[m.id].pp })),
  };
}

/** Si un objeto sirve ahora mismo sobre esa criatura (para no gastarlo en balde). */
export function objetoUtil(c: Criatura, objetoId: string, datos: DatosJuego): boolean {
  const o = datos.objetos[objetoId];
  if (!o) return false;
  const max = vidaMaxima(c, datos);
  switch (o.tipo) {
    case 'curar':
      return c.vida > 0 && c.vida < max;
    case 'remedio':
      return c.vida > 0 && c.estado !== null && o.estados.includes(c.estado.tipo);
    case 'revivir':
      return c.vida === 0;
    default:
      return false;
  }
}

/** Aplica un objeto de curación, remedio o revivir. Devuelve una copia; falla si no sirve. */
export function usarObjeto(c: Criatura, objetoId: string, datos: DatosJuego): Criatura {
  if (!objetoUtil(c, objetoId, datos)) throw new Error(`${objetoId} no sirve ahora sobre ${c.uid}`);
  const o = datos.objetos[objetoId];
  const r = structuredClone(c);
  const max = vidaMaxima(c, datos);
  if (o.tipo === 'curar') r.vida = o.cantidad === 'toda' ? max : Math.min(max, r.vida + o.cantidad);
  else if (o.tipo === 'remedio') r.estado = null;
  else if (o.tipo === 'revivir') r.vida = Math.max(1, Math.floor(max * o.fraccion));
  return r;
}
