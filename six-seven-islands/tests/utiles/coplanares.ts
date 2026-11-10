// Busca caras que se solapan en el mismo plano y mirando al mismo lado: la GPU no sabe cuál
// pintar y salen rayas que titilan al mover la cámara (APRENDIDO.md, 2026-11-10). Solo mira las
// caras alineadas con los ejes, que es donde pasa con las cajas, y solo las que la cámara ve.

import type { BufferGeometry } from 'three/webgpu';

type P = [number, number];

function area(poli: P[]): number {
  let a = 0;
  for (let i = 0; i < poli.length; i++) {
    const [x1, y1] = poli[i];
    const [x2, y2] = poli[(i + 1) % poli.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Recorta el polígono `sujeto` con el triángulo convexo `corte` (Sutherland-Hodgman). */
function recortar(sujeto: P[], corte: P[]): P[] {
  let salida = sujeto;
  const sentido = Math.sign((corte[1][0] - corte[0][0]) * (corte[2][1] - corte[0][1]) - (corte[1][1] - corte[0][1]) * (corte[2][0] - corte[0][0]));
  for (let i = 0; i < corte.length && salida.length; i++) {
    const a = corte[i];
    const b = corte[(i + 1) % corte.length];
    const dentro = (p: P) => sentido * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) >= -1e-9;
    const entrada = salida;
    salida = [];
    for (let j = 0; j < entrada.length; j++) {
      const p = entrada[j];
      const q = entrada[(j + 1) % entrada.length];
      const dp = dentro(p);
      const dq = dentro(q);
      if (dp) salida.push(p);
      if (dp !== dq) {
        const d1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        const d2 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
        const t = d1 / (d1 - d2);
        salida.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
  }
  return salida;
}

/** Pares de triángulos solapados en el mismo plano (área común en m²), hasta `max`. */
export function carasSolapadas(g: BufferGeometry, minimo = 1e-4, max = 20): { plano: string; area: number }[] {
  const pos = g.getAttribute('position');
  const indice = g.getIndex();
  const n = indice ? indice.count : pos.count;
  const grupos = new Map<string, P[][]>();
  const v = (i: number) => {
    const k = indice ? indice.getX(i) : i;
    return [pos.getX(k), pos.getY(k), pos.getZ(k)];
  };
  for (let i = 0; i < n; i += 3) {
    const [a, b, c] = [v(i), v(i + 1), v(i + 2)];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nor = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const largo = Math.hypot(...nor);
    if (largo < 1e-9) continue;
    const eje = nor.findIndex((x) => Math.abs(x / largo) > 0.9999);
    if (eje < 0) continue;
    const signo = Math.sign(nor[eje]);
    // La cámara mira siempre desde arriba y desde el sur, y no gira: las caras que miran abajo
    // (-y) o al norte (-z) no se ven nunca.
    if ((eje === 1 || eje === 2) && signo < 0) continue;
    const clave = `${eje}${signo > 0 ? '+' : '-'}${a[eje].toFixed(4)}`;
    const resto = [0, 1, 2].filter((e) => e !== eje);
    const tri = [a, b, c].map((p) => [p[resto[0]], p[resto[1]]] as P);
    const lista = grupos.get(clave) ?? [];
    lista.push(tri);
    grupos.set(clave, lista);
  }
  const res: { plano: string; area: number }[] = [];
  for (const [plano, tris] of grupos) {
    for (let i = 0; i < tris.length && res.length < max; i++) {
      for (let j = i + 1; j < tris.length; j++) {
        const comun = area(recortar(tris[i], tris[j]));
        if (comun > minimo) {
          res.push({ plano, area: comun });
          break;
        }
      }
    }
  }
  return res;
}
