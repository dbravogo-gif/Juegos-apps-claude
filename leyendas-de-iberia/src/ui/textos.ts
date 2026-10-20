import type { Evento } from '../core/combate';
import type { EstadisticaCombate } from '../core/modelo';

const ESTADISTICA: Record<EstadisticaCombate, string> = {
  fuerza: 'La Fuerza',
  escudo: 'El Escudo',
  magia: 'La Magia',
  resMagica: 'La Resistencia mágica',
  celeridad: 'La Celeridad',
};

export interface ContextoTextos {
  salvaje: boolean;
  nombreRival: string;
}

function quien(nombre: string, lado: 'jugador' | 'rival', ctx: ContextoTextos): string {
  if (lado === 'jugador') return nombre;
  return ctx.salvaje ? `${nombre} salvaje` : `${nombre} rival`;
}

/** Frases que acompañan a cada evento. Una lista vacía: el evento no se narra. */
export function textosEvento(ev: Evento, ctx: ContextoTextos): string[] {
  switch (ev.tipo) {
    case 'entrada':
      if (ev.lado === 'jugador') return [`¡Adelante, ${ev.ficha.nombre}!`];
      if (ctx.salvaje) return [`¡Aparece ${ev.ficha.nombre} salvaje!`];
      return [`${ctx.nombreRival} saca a ${ev.ficha.nombre}.`];
    case 'retirada':
      return ev.lado === 'jugador' ? [`¡${ev.nombre}, vuelve!`] : [`${ctx.nombreRival} retira a ${ev.nombre}.`];
    case 'usa':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} usa ${ev.movimiento}!`];
    case 'sinPP':
      return [`A ${quien(ev.nombre, ev.lado, ctx)} no le quedan PP.`];
    case 'falla':
      return ['¡Pero falla!'];
    case 'danio': {
      if (ev.causa === 'quemadura') return [`${quien(ev.nombre, ev.lado, ctx)} sufre por la quemadura.`];
      if (ev.causa === 'retroceso') return [`${quien(ev.nombre, ev.lado, ctx)} se resiente del golpe.`];
      const t: string[] = [];
      if (ev.critico) t.push('¡Golpe crítico!');
      if (ev.eficacia >= 2) t.push('¡Es muy eficaz!');
      else if (ev.eficacia > 0 && ev.eficacia < 1) t.push('No es muy eficaz…');
      return t;
    }
    case 'sinEfecto':
      return [`No afecta a ${quien(ev.nombre, ev.lado, ctx)}…`];
    case 'curacion':
      return ev.cantidad > 0
        ? [`${quien(ev.nombre, ev.lado, ctx)} recupera ${ev.cantidad} de Vida.`]
        : [`La Vida de ${quien(ev.nombre, ev.lado, ctx)} ya está al máximo.`];
    case 'estado':
      return ev.estado === 'quemado'
        ? [`¡${quien(ev.nombre, ev.lado, ctx)} se ha quemado!`]
        : [`¡${quien(ev.nombre, ev.lado, ctx)} se ha dormido!`];
    case 'sigueDormido':
      return [`${quien(ev.nombre, ev.lado, ctx)} sigue dormido.`];
    case 'despierta':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se despierta!`];
    case 'etapa': {
      const est = ESTADISTICA[ev.estadistica];
      const de = `de ${quien(ev.nombre, ev.lado, ctx)}`;
      if (ev.cambio === 0) return [`${est} ${de} no puede ${ev.intento > 0 ? 'subir' : 'bajar'} más.`];
      if (ev.cambio >= 2) return [`¡${est} ${de} sube mucho!`];
      if (ev.cambio > 0) return [`¡${est} ${de} sube!`];
      if (ev.cambio <= -2) return [`¡${est} ${de} baja mucho!`];
      return [`¡${est} ${de} baja!`];
    }
    case 'debilitado':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se ha debilitado!`];
    case 'experiencia':
      return [`${ev.nombre} gana ${ev.cantidad} puntos de experiencia.`];
    case 'nivel':
      return [`¡${ev.nombre} sube al nivel ${ev.nivel}!`];
    case 'aprende':
      return [`¡${ev.nombre} ha aprendido ${ev.movimiento}!`];
    case 'noAprende':
      return [`${ev.nombre} quiere aprender ${ev.movimiento}, pero ya sabe cuatro movimientos.`];
    case 'objeto':
      return [`Usas ${ev.objeto === 'Ungüento' ? 'un' : 'una'} ${ev.objeto}.`];
    case 'captura': {
      if (ev.exito) return [`¡Pacto sellado! ${ev.nombre} se une a ti.`];
      const frases = ['¡Oh, no! Ha roto el pacto.', '¡Vaya! Casi…', '¡Por poco!', '¡Uf! ¡Faltó muy poco!'];
      return [frases[ev.sacudidas] ?? frases[0]];
    }
    case 'huida':
      return ev.exito ? ['Escapas sin problemas.'] : ['¡No puedes escapar!'];
    case 'fin':
      if (ev.resultado === 'victoria') return ctx.salvaje ? [] : [`¡Has vencido a ${ctx.nombreRival}!`];
      if (ev.resultado === 'derrota') return ['No te quedan criaturas en pie…'];
      return [];
  }
}
