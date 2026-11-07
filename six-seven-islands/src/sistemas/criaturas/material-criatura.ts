// Material de una criatura: el material base compartido (src/arte/material.ts) con su patrón
// pintado por fragmento (nítido a cualquier distancia, sin texturas), el brillo especular suave,
// el contraluz cálido y la emisión de llamas y brillos de los ojos (ARTE.md, «Materiales»).

import {
  abs,
  attribute,
  float,
  fract,
  fwidth,
  length,
  mix,
  mx_worley_noise_float,
  sin,
  smoothstep,
  uniform,
  vec2,
  vec3,
} from 'three/tsl';
import type { AspectoCriatura } from '../../core/aspecto';
import { MaterialDiorama, type Nodo } from '../../arte/material';
import type { PlanoCriatura } from './piezas';

export function crearMaterialCriatura(a: AspectoCriatura, plano: PlanoCriatura, semilla: number): MaterialDiorama {
  const col = plano.colores;
  const vi = plano.vientre;
  const pos: Nodo = attribute('posPatron', 'vec3');
  const mascara: Nodo = attribute('patron', 'float');
  const base: Nodo = attribute('color', 'vec3');
  const emision: Nodo = attribute('emision', 'float');
  const colorPatron: Nodo = uniform(col[a.patron.color].clone());
  const colorVientre: Nodo = uniform(col.vientre.clone());
  const escala = a.patron.escala;
  // Desplazamiento estable del patrón para que dos especies con el mismo no se vean iguales.
  const desfase = vec3((semilla % 97) * 0.37, ((semilla >> 7) % 89) * 0.41, ((semilla >> 14) % 83) * 0.29);

  let color: Nodo = base;
  let vientre: Nodo = float(0);
  if (a.vientre) {
    // Óvalo claro en la tripa, de borde nítido (antialias con fwidth).
    const d = length(vec2(pos.x.div(vi.rx), pos.y.sub(vi.y).div(vi.ry)));
    const aa = fwidth(d);
    vientre = smoothstep(float(1).add(aa), float(1).sub(aa), d).mul(smoothstep(0.05, 0.35, pos.z)).mul(mascara);
    color = mix(color, colorVientre, vientre);
  }
  const fuera = float(1).sub(vientre);
  if (a.patron.tipo === 'manchas') {
    const f = mx_worley_noise_float(pos.mul(escala).add(desfase));
    const aa = fwidth(f);
    const mancha = smoothstep(float(0.31).add(aa), float(0.31).sub(aa), f);
    // Por el lomo, los lados y lo alto; la tripa y la cara quedan limpias.
    const lomo = smoothstep(0.85, 0.35, pos.z).max(smoothstep(0.35, 0.75, pos.y));
    color = mix(color, colorPatron, mancha.mul(lomo).mul(fuera).mul(mascara));
  } else if (a.patron.tipo === 'rayas') {
    const s = pos.y.mul(escala).add(sin(pos.x.mul(2.4).add(semilla % 7)).mul(0.22));
    const banda = abs(fract(s).sub(0.5)).mul(2);
    const aa = fwidth(s).mul(2);
    const raya = smoothstep(float(0.6).sub(aa), float(0.6).add(aa), banda);
    const lomo = smoothstep(0.3, -0.1, pos.z);
    color = mix(color, colorPatron, raya.mul(lomo).mul(fuera).mul(mascara));
  } else if (a.patron.tipo === 'degradado') {
    const g = smoothstep(-0.3, 1.1, pos.y);
    color = mix(color, colorPatron, g.mul(0.8).mul(fuera).mul(mascara));
  }

  return new MaterialDiorama(
    { bordes: [-0.3, 0.55], especular: 0.14, dureza: 14, contraluz: 0.25, rebote: 0.35 },
    color,
    base.mul(emision),
  );
}
