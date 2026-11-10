// La ficha de aspecto de una criatura: qué piezas del kit lleva, con qué medidas y colores. Solo
// datos y funciones puras, sin Three.js; el generador del subsistema «criaturas» la convierte en
// mallas. Las evoluciones no se escriben enteras: se derivan de la ficha base (ARTE.md).

export type FormaCuerpo = 'esfera' | 'capsula' | 'pera' | 'gota';
export type TipoPatron = 'liso' | 'manchas' | 'rayas' | 'degradado';
/** De qué color va una pieza. «claro» y «oscuro» se derivan del color del tipo. */
export type ColorPieza = 'principal' | 'secundario' | 'claro' | 'oscuro' | 'hueso';
export type FormaCopete = 'hoja' | 'llama' | 'aleta' | 'cristal';
export type FormaCola = 'punta' | 'aleta' | 'hoja';

export interface PiezasAspecto {
  /** Cabeza separada encima del cuerpo; si falta, la cara va en el cuerpo. */
  cabeza?: { tamano: number };
  orejas?: { forma: 'redonda' | 'puntiaguda'; tamano: number; color: ColorPieza };
  cuernos?: { tamano: number; color: ColorPieza };
  /** La pieza característica en lo alto de la cabeza: hoja, llama, aleta o cristal. */
  copete?: { forma: FormaCopete; tamano: number; cantidad: number; color: ColorPieza };
  /** Aletas a los lados del cuerpo. */
  aletas?: { tamano: number; color: ColorPieza };
  cola?: { forma: FormaCola; tamano: number; color: ColorPieza };
  patas?: { tamano: number; color: ColorPieza };
  brazos?: { tamano: number; color: ColorPieza };
  /** Fila de púas u hojas a lo largo del lomo. */
  cresta?: { forma: 'pua' | 'hoja'; tamano: number; cantidad: number; color: ColorPieza };
}

export interface AspectoCriatura {
  id: string;
  /** Id de tipo de src/data/tipos.ts: da el color principal. */
  tipo: string;
  /** Color secundario, en hexadecimal. */
  secundario: number;
  /** Altura aproximada en unidades del mundo. La forma base mide en torno a 1. */
  escala: number;
  /** De 0 (redondo y blando) a 1 (anguloso): puntas de orejas, cuernos y hombros del cuerpo. */
  anguloso: number;
  cuerpo: { forma: FormaCuerpo; ancho: number; alto: number };
  ojos: { tamano: number; separacion: number; altura: number };
  boca: 'sonrisa' | 'colmillos' | 'ninguna';
  mejillas: boolean;
  /** Mancha clara en la tripa. */
  vientre: boolean;
  patron: { tipo: TipoPatron; color: ColorPieza; escala: number };
  piezas: PiezasAspecto;
}

/** Lo que cambia una evolución respecto a la forma anterior. */
export interface CambioEvolucion {
  id: string;
  /** Multiplica la escala de la forma anterior. Una evolución siempre crece. */
  crecer: number;
  /** Se suma al «anguloso» de la forma anterior (hasta 1). */
  masAnguloso: number;
  /** Piezas que se añaden o se cambian. Las demás se heredan. */
  piezas?: Partial<PiezasAspecto>;
  cuerpo?: Partial<AspectoCriatura['cuerpo']>;
  ojos?: Partial<AspectoCriatura['ojos']>;
  boca?: AspectoCriatura['boca'];
}

/** Deriva la ficha de una evolución: misma especie (forma, colores y patrón), más grande y con más piezas. */
export function evolucionar(base: AspectoCriatura, cambio: CambioEvolucion): AspectoCriatura {
  if (cambio.crecer <= 1) throw new Error(`La evolución «${cambio.id}» debe crecer (crecer > 1)`);
  return {
    ...base,
    id: cambio.id,
    escala: base.escala * cambio.crecer,
    anguloso: Math.min(1, base.anguloso + cambio.masAnguloso),
    cuerpo: { ...base.cuerpo, ...cambio.cuerpo },
    ojos: { ...base.ojos, ...cambio.ojos },
    boca: cambio.boca ?? base.boca,
    patron: { ...base.patron },
    piezas: { ...base.piezas, ...cambio.piezas },
  };
}

/** Semilla estable a partir del id (FNV-1a): fase de la animación y colocación del patrón. */
export function semillaDeId(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Cuántas piezas opcionales lleva: sirve para comprobar que la evolución añade. */
export function contarPiezas(a: AspectoCriatura): number {
  return Object.values(a.piezas).filter(Boolean).length;
}
