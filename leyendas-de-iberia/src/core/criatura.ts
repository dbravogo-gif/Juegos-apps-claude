import type { Criatura, DatosJuego } from './modelo';
import { elegir, entero, type EstadoRng } from './rng';
import { tirarValia, vidaMaxima } from './estadisticas';
import { expParaNivel, movimientosIniciales } from './progreso';

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

/** Vida, PP y estado como nuevos: lo que hace un mesón. */
export function curarDelTodo(c: Criatura, datos: DatosJuego): Criatura {
  return {
    ...structuredClone(c),
    vida: vidaMaxima(c, datos),
    estado: null,
    movimientos: c.movimientos.map((m) => ({ id: m.id, pp: datos.movimientos[m.id].pp })),
  };
}
