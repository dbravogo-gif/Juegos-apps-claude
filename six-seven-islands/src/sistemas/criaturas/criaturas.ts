// Subsistema «criaturas»: el generador de criaturas por piezas y su animación procedural.
// Quien necesite una criatura la pide con ctx.get<Criaturas>('criaturas').crear(aspecto), coloca
// su `raiz` en la escena y la anima con accion(). El dueño de la criatura es este subsistema: la
// libera con quitar() o en su dispose().

import { Group, Mesh } from 'three/webgpu';
import { semillaDeId, type AspectoCriatura } from '../../core/aspecto';
import { COLOR_CRIATURA, type TipoId } from '../../data/tipos';
import type { MaterialDiorama } from '../../arte/material';
import type { Ctx, Subsistema } from '../../motor/motor';
import { animar, empezar, iniciarAnimacion, type Accion, type Animable, type Pose } from './animacion';
import { crearMaterialCriatura } from './material-criatura';
import { HUESOS, PADRE, construir, type Hueso } from './piezas';

export interface Criatura extends Animable {
  /** Se coloca y se orienta en la escena; mira hacia su +Z. */
  readonly raiz: Group;
  /** Altura total en unidades del mundo, con la escala de la ficha. */
  readonly alto: number;
}

/** Crea la criatura sin registrarla en ningún subsistema: sirve también para las pruebas. */
export function crearCriatura(aspecto: AspectoCriatura): Criatura {
  const color = COLOR_CRIATURA[aspecto.tipo as TipoId];
  if (color === undefined) throw new Error(`Tipo desconocido en «${aspecto.id}»: «${aspecto.tipo}»`);
  const semilla = semillaDeId(aspecto.id);
  const plano = construir(aspecto, color);
  const material = crearMaterialCriatura(aspecto, plano, semilla);
  const raiz = new Group();
  raiz.name = aspecto.id;
  raiz.scale.setScalar(aspecto.escala);
  const huesos: Partial<Record<Hueso, Mesh>> = {};
  const reposo: Partial<Record<Hueso, Pose>> = {};
  for (const h of HUESOS) {
    const g = plano.geometrias[h];
    if (!g) continue;
    const malla = new Mesh(g, material);
    malla.name = h;
    // Solo proyecta sombra lo que cambia la silueta de la sombra: los ojos y la cara pintada de
    // una criatura sin cabeza no, y así cada criatura ahorra llamadas en el pase de sombras.
    const pz = aspecto.piezas;
    malla.castShadow = h !== 'ojos' && (h !== 'cabeza' || Boolean(pz.cabeza || pz.orejas || pz.cuernos));
    malla.receiveShadow = true;
    huesos[h] = malla;
  }
  // Jerarquía: cada hueso cuelga del más cercano de sus antepasados que exista.
  for (const h of HUESOS) {
    const malla = huesos[h];
    if (!malla) continue;
    let padre = PADRE[h];
    while (padre && !huesos[padre]) padre = PADRE[padre];
    const pivote = plano.pivotes[h];
    const origen = padre ? plano.pivotes[padre] : null;
    const p = origen ? pivote.clone().sub(origen) : pivote.clone();
    reposo[h] = { x: p.x, y: p.y, z: p.z };
    malla.position.copy(p);
    (padre ? huesos[padre]! : raiz).add(malla);
  }
  return {
    aspecto,
    raiz,
    huesos,
    reposo,
    material,
    radio: plano.radio,
    alto: plano.altoTotal * aspecto.escala,
    anim: iniciarAnimacion(semilla),
  };
}

export function liberarCriatura(c: Criatura): void {
  c.raiz.removeFromParent();
  for (const m of Object.values(c.huesos)) m?.geometry.dispose();
  (c.material as MaterialDiorama).dispose();
}

export class Criaturas implements Subsistema {
  static readonly id = 'criaturas';
  static readonly deps: readonly string[] = ['render'];

  private readonly vivas = new Set<Criatura>();
  /** Multiplica el tiempo de las animaciones: menos de 1 es cámara lenta (para revisarlas). */
  velocidad = 1;

  init(_ctx: Ctx): void {}

  crear(aspecto: AspectoCriatura): Criatura {
    const c = crearCriatura(aspecto);
    this.vivas.add(c);
    return c;
  }

  accion(c: Criatura, accion: Accion): void {
    empezar(c, accion);
  }

  quitar(c: Criatura): void {
    if (!this.vivas.delete(c)) return;
    liberarCriatura(c);
  }

  actualizar(dt: number): void {
    const paso = dt * this.velocidad;
    for (const c of this.vivas) animar(c, paso);
  }

  dispose(): void {
    for (const c of this.vivas) liberarCriatura(c);
    this.vivas.clear();
  }
}
