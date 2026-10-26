// Uso de objetos fuera del combate y objetos equipados. Las funciones que reciben la partida o
// una criatura las modifican, como el resto de src/core/partida.ts.

import type { Criatura, DatosJuego, Objeto } from './modelo';
import { vidaMaxima } from './estadisticas';
import { destinoConObjeto, NIVEL_MAX } from './progreso';
import { darObjeto, type Partida } from './partida';

export interface UsoObjeto {
  /** Se puede usar desde la mochila durante un combate. */
  combate: boolean;
  /** Se puede usar desde la mochila fuera de combate. */
  fuera: boolean;
  /** Se lleva equipado en una criatura. */
  equipable: boolean;
}

export function usoDe(obj: Objeto): UsoObjeto {
  switch (obj.tipo) {
    case 'captura':
    case 'potenciador':
      return { combate: true, fuera: false, equipable: false };
    case 'curar':
    case 'remedio':
    case 'revivir':
    case 'pp':
      return { combate: true, fuera: true, equipable: false };
    case 'repelente':
    case 'huida':
    case 'nivel':
    case 'evolucion':
      return { combate: false, fuera: true, equipable: false };
    case 'equipo':
      return { combate: false, fuera: false, equipable: true };
    case 'maquina':
      return { combate: false, fuera: true, equipable: false };
    case 'clave':
      return { combate: false, fuera: Boolean(obj.interruptor), equipable: false };
  }
}

/** Los objetos que se aplican a una criatura concreta del equipo. */
export function seAplicaACriatura(obj: Objeto): boolean {
  return ['curar', 'remedio', 'revivir', 'pp', 'nivel', 'evolucion', 'maquina'].includes(obj.tipo);
}

/** Si una especie puede aprender el movimiento de una MT o MO. */
export function puedeAprender(obj: Objeto, especie: string, datos: DatosJuego): boolean {
  if (obj.tipo !== 'maquina') return false;
  const { todos, tipos, especies, acuaticas, aladas } = obj.aprenden;
  const e = datos.especies[especie];
  return (
    Boolean(todos) ||
    (especies ?? []).includes(especie) ||
    e.tipos.some((t) => (tipos ?? []).includes(t)) ||
    Boolean(acuaticas && e.acuatica) ||
    Boolean(aladas && e.alada)
  );
}

/** Por qué no se puede usar el objeto en esa criatura, o `null` si se puede. */
export function motivoNoUsable(obj: Objeto, c: Criatura, datos: DatosJuego): string | null {
  const max = vidaMaxima(c, datos);
  switch (obj.tipo) {
    case 'curar':
      if (c.vida <= 0) return 'Está debilitada';
      return c.vida >= max ? 'Ya tiene la Vida al máximo' : null;
    case 'remedio':
      if (c.vida <= 0) return 'Está debilitada';
      return c.estado && obj.estados.includes(c.estado.tipo) ? null : 'No le hace falta';
    case 'revivir':
      return c.vida > 0 ? 'No está debilitada' : null;
    case 'pp':
      if (c.vida <= 0) return 'Está debilitada';
      return c.movimientos.some((m) => m.pp < datos.movimientos[m.id].pp) ? null : 'Tiene todos los PP';
    case 'nivel':
      return c.nivel >= NIVEL_MAX ? 'Ya está en el nivel máximo' : null;
    case 'evolucion':
      return destinoConObjeto(c, obj.id, datos) ? null : 'No le hace nada';
    case 'maquina':
      if (!puedeAprender(obj, c.especie, datos)) return 'No puede aprenderlo';
      return c.movimientos.some((m) => m.id === obj.movimiento) ? 'Ya lo sabe' : null;
    default:
      return 'Este objeto no se usa así';
  }
}

/**
 * Aplica un objeto de curación, remedio o reanimación a la criatura. Devuelve la Vida
 * recuperada. No comprueba si se puede: para eso está `motivoNoUsable`.
 */
export function aplicarCuracion(obj: Objeto, c: Criatura, datos: DatosJuego): number {
  const max = vidaMaxima(c, datos);
  const antes = c.vida;
  if (obj.tipo === 'curar') c.vida = obj.cantidad === 'toda' ? max : Math.min(max, c.vida + obj.cantidad);
  else if (obj.tipo === 'remedio') c.estado = null;
  else if (obj.tipo === 'pp') {
    for (const m of c.movimientos) {
      const tope = datos.movimientos[m.id].pp;
      m.pp = obj.cantidad === 'toda' ? tope : Math.min(tope, m.pp + obj.cantidad);
    }
  }
  else if (obj.tipo === 'revivir') {
    c.vida = Math.max(1, Math.floor(max * obj.fraccion));
    c.estado = null;
  }
  return c.vida - antes;
}

/** Si un objeto con interruptor (Repartir experiencia) está en la mochila y encendido. */
export function encendido(p: Partida, id: string, datos: DatosJuego): boolean {
  const obj = datos.objetos[id];
  return obj?.tipo === 'clave' && !!obj.interruptor && (p.objetos[id] ?? 0) > 0 && !p.banderas[obj.interruptor.apagado];
}

/** Equipa un objeto de la mochila. Si ya llevaba otro, vuelve a la mochila. */
export function equipar(p: Partida, c: Criatura, objeto: string, datos: DatosJuego): void {
  const obj = datos.objetos[objeto];
  if (!obj || !usoDe(obj).equipable) throw new Error('Ese objeto no se puede equipar');
  if ((p.objetos[objeto] ?? 0) <= 0) throw new Error('No te quedan de ese objeto');
  if (c.objeto) darObjeto(p, c.objeto, 1);
  darObjeto(p, objeto, -1);
  c.objeto = objeto;
}

/** Devuelve a la mochila el objeto que lleva la criatura. */
export function quitarObjeto(p: Partida, c: Criatura): void {
  if (!c.objeto) return;
  darObjeto(p, c.objeto, 1);
  delete c.objeto;
}
