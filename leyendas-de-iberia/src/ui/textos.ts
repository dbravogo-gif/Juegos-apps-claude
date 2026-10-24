import type { Evento } from '../core/combate';
import type { EstadisticaCombate, Movimiento } from '../core/modelo';
import { DATOS } from '../data';

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

/** «un Ungüento», «una Tésera», «unas Sales»: el artículo según la primera palabra. */
export function conArticulo(nombre: string): string {
  const primera = nombre.split(' ')[0];
  const femenino = /a$/.test(primera);
  const plural = /[^é]s$/.test(primera);
  if (plural) return `${/as$/.test(primera) || primera === 'Sales' ? 'unas' : 'unos'} ${nombre}`;
  return `${femenino ? 'una' : 'un'} ${nombre}`;
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
      if (ev.causa === 'objeto') return [];
      const t: string[] = [];
      if (ev.critico) t.push('¡Golpe crítico!');
      if (ev.eficacia >= 2) t.push('¡Es supereficaz!');
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
      return [`Usas ${conArticulo(ev.objeto)}.`];
    case 'curaEstado':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se ha curado!`];
    case 'reanima':
      return [`¡${ev.nombre} se reanima!`];
    case 'objetoEquipado': {
      const q = quien(ev.nombre, ev.lado, ctx);
      if (ev.efecto === 'aguanta') return [`¡${q} aguanta gracias a su ${ev.objeto}!`];
      if (ev.efecto === 'come') return [`¡${q} se come su ${ev.objeto}!`];
      if (ev.efecto === 'pierde') return [`${q} se resiente por su ${ev.objeto}.`];
      return [`${q} recupera Vida gracias a su ${ev.objeto}.`];
    }
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

const CATEGORIA: Record<Movimiento['categoria'], string> = {
  fisico: 'Física',
  magico: 'Mágica',
  estado: 'De estado',
};

const ESTADISTICA_MINUSCULA: Record<EstadisticaCombate, string> = {
  fuerza: 'la Fuerza',
  escudo: 'el Escudo',
  magia: 'la Magia',
  resMagica: 'la Resistencia mágica',
  celeridad: 'la Celeridad',
};

function fraccionTexto(f: number): string {
  if (f === 0.5) return 'la mitad';
  if (f === 0.25) return 'una cuarta parte';
  if (f === 1) return 'toda';
  return `un ${Math.round(f * 100)} %`;
}

/** Ficha de un movimiento para la ayuda: tipo, categoría, cifras y qué hace. */
export function describirMovimiento(mov: Movimiento, ppActuales?: number): { titulo: string; cifras: string; efecto: string } {
  const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo)?.nombre ?? 'Sin tipo';
  const cifras: string[] = [];
  if (mov.categoria !== 'estado') cifras.push(`Poder ${mov.poder}`);
  cifras.push(mov.precision === null ? 'No falla' : `Precisión ${mov.precision} %`);
  cifras.push(`PP ${ppActuales ?? mov.pp}/${mov.pp}`);

  const frases: string[] = [];
  if ((mov.prioridad ?? 0) > 0) frases.push('Ataca siempre primero.');
  for (const f of mov.efectos ?? []) {
    switch (f.tipo) {
      case 'estado': {
        const verbo = f.estado === 'quemado' ? 'quemar' : 'dormir';
        frases.push(f.prob >= 100 ? `${verbo === 'quemar' ? 'Quema' : 'Duerme'} al rival.` : `${f.prob} % de probabilidad de ${verbo} al rival.`);
        break;
      }
      case 'etapa': {
        const sube = f.cambio > 0;
        const cuanto = Math.abs(f.cambio) >= 2 ? ' mucho' : '';
        const quien = f.objetivo === 'propio' ? 'propia' : 'del rival';
        const est = ESTADISTICA_MINUSCULA[f.estadistica];
        const base = f.objetivo === 'propio' ? `${sube ? 'Sube' : 'Baja'}${cuanto} tu ${est.replace(/^(la|el) /, '')}` : `${sube ? 'Sube' : 'Baja'}${cuanto} ${est} ${quien}`;
        frases.push(f.prob >= 100 ? `${base}.` : `${f.prob} % de probabilidad: ${base.charAt(0).toLowerCase()}${base.slice(1)}.`);
        break;
      }
      case 'drenar':
        frases.push(`Recuperas ${fraccionTexto(f.fraccion)} del daño que causa.`);
        break;
      case 'curar':
        frases.push(`Recuperas ${fraccionTexto(f.fraccion)} de tu Vida máxima.`);
        break;
    }
  }
  if (frases.length === 0) frases.push(mov.categoria === 'estado' ? 'Sin efecto conocido.' : 'Ataque directo, sin efectos añadidos.');
  if (mov.categoria === 'fisico') frases.push('Usa tu Fuerza contra el Escudo del rival.');
  if (mov.categoria === 'magico') frases.push('Usa tu Magia contra la Resistencia mágica del rival.');
  return { titulo: `${mov.nombre} · ${tipo} · ${CATEGORIA[mov.categoria]}`, cifras: cifras.join(' · '), efecto: frases.join(' ') };
}
