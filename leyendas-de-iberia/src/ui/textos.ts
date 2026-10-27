import type { Evento } from '../core/combate';
import type { EstadisticaCombate, EstadoAlterado, Movimiento } from '../core/modelo';
import { DATOS } from '../data';

const ESTADISTICA: Record<EstadisticaCombate, string> = {
  fuerza: 'La Fuerza',
  escudo: 'El Escudo',
  magia: 'La Magia',
  resMagica: 'La Resistencia mágica',
  celeridad: 'La Celeridad',
};

/** Nombre corto de cada estado alterado (en femenino: «la criatura») y su color en las fichas. */
export const ESTADO_VISTA: Record<EstadoAlterado, { etiqueta: string; color: number }> = {
  quemado: { etiqueta: 'Quemada', color: 0xff7a2f },
  dormido: { etiqueta: 'Dormida', color: 0x6f7fd8 },
  paralizado: { etiqueta: 'Paralizada', color: 0xd6a600 },
  envenenado: { etiqueta: 'Envenenada', color: 0x9b4dca },
  intoxicado: { etiqueta: 'Intoxicada', color: 0x6a2a8f },
  colera: { etiqueta: 'Colérica', color: 0xc2185b },
};

export const SE_HA: Record<EstadoAlterado, string> = {
  quemado: 'se ha quemado',
  dormido: 'se ha dormido',
  paralizado: 'se ha paralizado',
  envenenado: 'se ha envenenado',
  intoxicado: 'se ha intoxicado gravemente',
  colera: 'ha montado en cólera',
};

export interface ContextoTextos {
  salvaje: boolean;
  nombreRival: string;
}

function quien(nombre: string, lado: 'jugador' | 'rival', ctx: ContextoTextos): string {
  if (lado === 'jugador') return nombre;
  return ctx.salvaje ? `${nombre} salvaje` : `${nombre} rival`;
}

const porNombre = (nombre: string) => Object.values(DATOS.objetos).find((o) => o.nombre === nombre);

/** «una Poción», «un Repelente», «unos Restos»: el artículo que dicen los datos del objeto. */
export function conArticulo(nombre: string): string {
  return `${porNombre(nombre)?.articulo ?? 'un'} ${nombre}`;
}

/** «su Vidasfera», «sus Restos». */
function suyo(nombre: string): string {
  const articulo = porNombre(nombre)?.articulo;
  return `${articulo === 'unos' || articulo === 'unas' ? 'sus' : 'su'} ${nombre}`;
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
      if (ev.causa === 'veneno') return [`${quien(ev.nombre, ev.lado, ctx)} sufre por el veneno.`];
      if (ev.causa === 'retroceso') return [`${quien(ev.nombre, ev.lado, ctx)} se resiente del golpe.`];
      if (ev.causa === 'drenadoras') return [`El muérdago le roba Vida a ${quien(ev.nombre, ev.lado, ctx)}.`];
      if (ev.causa === 'objeto' || ev.causa === 'pasiva') return [];
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
      return [`¡${quien(ev.nombre, ev.lado, ctx)} ${SE_HA[ev.estado]}!`];
    case 'sigueDormido':
      return [`${quien(ev.nombre, ev.lado, ctx)} sigue dormido.`];
    case 'despierta':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se despierta!`];
    case 'noSeMueve':
      return [`${quien(ev.nombre, ev.lado, ctx)} está paralizado: ¡no se puede mover!`];
    case 'ciega':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} ha quedado cegado!`];
    case 'recuperaVista':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} vuelve a ver!`];
    case 'fallaCiego':
      return [`${quien(ev.nombre, ev.lado, ctx)} no ve bien… ¡y falla!`];
    case 'arrebatado':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} está fuera de sí y hace otra cosa!`];
    case 'retrocede':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} ha retrocedido y no puede atacar!`];
    case 'siembra':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} ha quedado sembrado de muérdago!`];
    case 'protege':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se cubre con la rodela!`];
    case 'protegido':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} se ha protegido del ataque!`];
    case 'pasiva':
      return [`¡${ev.pasiva} de ${quien(ev.nombre, ev.lado, ctx)}!`];
    case 'aguanta':
      return [`¡${quien(ev.nombre, ev.lado, ctx)} aguanta el golpe!`];
    case 'aviva':
      return [`¡Los ataques de tipo Infernal de ${quien(ev.nombre, ev.lado, ctx)} se avivan!`];
    case 'etapaProtegida':
      return [`Las estadísticas de ${quien(ev.nombre, ev.lado, ctx)} no bajan.`];
    case 'recuperaPP':
      return [`Los PP de ${quien(ev.nombre, ev.lado, ctx)} se han recuperado.`];
    case 'rebusca':
      return [`¡${ev.nombre} ha encontrado ${conArticulo(ev.objeto)} rebuscando!`];
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
      return ev.repartida ? [] : [`${ev.nombre} gana ${ev.cantidad} puntos de experiencia.`];
    case 'experienciaRepartida':
      return ['El resto del equipo también gana experiencia gracias al Repartir experiencia.'];
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
      if (ev.efecto === 'aguanta') return [`¡${q} aguanta gracias a ${suyo(ev.objeto)}!`];
      if (ev.efecto === 'come') return [`¡${q} se come ${suyo(ev.objeto)}!`];
      if (ev.efecto === 'pierde') return [`${q} se resiente por ${suyo(ev.objeto)}.`];
      return [`${q} recupera Vida gracias a ${suyo(ev.objeto)}.`];
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

const VERBO_ESTADO: Record<EstadoAlterado, [string, string]> = {
  quemado: ['quemar', 'Quema'],
  dormido: ['dormir', 'Duerme'],
  paralizado: ['paralizar', 'Paraliza'],
  envenenado: ['envenenar', 'Envenena'],
  intoxicado: ['intoxicar', 'Intoxica gravemente'],
  colera: ['hacer montar en cólera', 'Hace montar en cólera'],
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
  if ((mov.prioridad ?? 0) > 0 && !(mov.efectos ?? []).some((f) => f.tipo === 'proteger')) frases.push('Ataca siempre primero.');
  for (const f of mov.efectos ?? []) {
    switch (f.tipo) {
      case 'estado': {
        const [verbo, hace] = VERBO_ESTADO[f.estado];
        frases.push(f.prob >= 100 ? `${hace} al rival.` : `${f.prob} % de probabilidad de ${verbo} al rival.`);
        break;
      }
      case 'cegar':
        frases.push(
          f.prob >= 100
            ? 'Deja cegado al rival de 1 a 4 turnos: falla un 30 % más.'
            : `${f.prob} % de probabilidad de dejar cegado al rival (falla un 30 % más de 1 a 4 turnos).`,
        );
        break;
      case 'retroceso':
        frases.push(`${f.prob} % de probabilidad de que el rival retroceda, si aún no ha atacado.`);
        break;
      case 'drenadoras':
        frases.push('Siembra al rival: cada turno pierde 1/8 de su Vida y te la llevas tú. No afecta a las de tipo Planta.');
        break;
      case 'proteger':
        frases.push('Te protege de todos los ataques este turno. Si lo usas seguido, puede fallar.');
        break;
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
