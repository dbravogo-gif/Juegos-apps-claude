// Animación procedural de cada pieza, sin esqueleto (ARTE.md): reposo (respirar con squash and
// stretch, parpadear, mecer copete, cola y apéndices), ataque, golpe y debilitarse. Es solo
// presentación: usa el tiempo real, nunca el estado del juego, y no crea objetos por fotograma.

import type { Mesh, Object3D } from 'three/webgpu';
import type { AspectoCriatura } from '../../core/aspecto';
import type { MaterialDiorama } from '../../arte/material';
import type { Hueso } from './piezas';

export type Accion = 'reposo' | 'ataque' | 'golpe' | 'debilitarse';

/** Duración de cada acción, en segundos. «debilitarse» se queda en el suelo al acabar. */
export const DURACION: Record<Accion, number> = { reposo: 0, ataque: 0.85, golpe: 0.6, debilitarse: 1.1 };

export interface Pose {
  x: number;
  y: number;
  z: number;
}

export interface EstadoAnimacion {
  accion: Accion;
  /** Segundos desde que empezó la acción. */
  t: number;
  /** Segundos desde que nació la criatura. */
  reloj: number;
  /** Desfase propio, para que dos criaturas no respiren a la vez. */
  fase: number;
  /** Periodo de la respiración. */
  periodo: number;
  proximoParpadeo: number;
  /** Generador visual propio (no es el del juego): intervalo entre parpadeos. */
  azar: number;
}

export interface Animable {
  aspecto: AspectoCriatura;
  huesos: Partial<Record<Hueso, Mesh>>;
  /** Posición de reposo de cada hueso en el espacio de su padre. */
  reposo: Partial<Record<Hueso, Pose>>;
  material: MaterialDiorama;
  radio: number;
  anim: EstadoAnimacion;
}

const suave = (x: number) => x * x * (3 - 2 * x);
const salida = (x: number) => 1 - (1 - x) * (1 - x);
const entre = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

function siguienteAzar(e: EstadoAnimacion): number {
  // LCG de 32 bits: basta para variar los parpadeos y es reproducible.
  e.azar = (Math.imul(e.azar, 1664525) + 1013904223) >>> 0;
  return e.azar / 4294967296;
}

export function iniciarAnimacion(semilla: number): EstadoAnimacion {
  const e: EstadoAnimacion = {
    accion: 'reposo',
    t: 0,
    reloj: 0,
    fase: (semilla % 1000) / 1000 * Math.PI * 2,
    periodo: 1.7 + ((semilla >> 10) % 100) / 100 * 0.6,
    proximoParpadeo: 0,
    azar: semilla >>> 0,
  };
  e.proximoParpadeo = 1 + siguienteAzar(e) * 2.5;
  return e;
}

function restaurar(h: Object3D | undefined, p: Pose | undefined): void {
  if (!h || !p) return;
  h.position.set(p.x, p.y, p.z);
  h.rotation.set(0, 0, 0);
  h.scale.set(1, 1, 1);
}

/** Avanza la animación `dt` segundos y coloca los huesos. */
export function animar(c: Animable, dt: number): void {
  const e = c.anim;
  e.t += dt;
  e.reloj += dt;
  const h = c.huesos;
  for (const k of Object.keys(h) as Hueso[]) restaurar(h[k], c.reposo[k]);
  const cuerpo = h.cuerpo!;
  const R = c.radio;
  const conCabeza = Boolean(c.aspecto.piezas.cabeza);

  if (e.accion !== 'reposo' && e.accion !== 'debilitarse' && e.t >= DURACION[e.accion]) {
    e.accion = 'reposo';
    e.t = 0;
  }
  const debil = e.accion === 'debilitarse';

  // Reposo: respiración con volumen casi constante, la cabeza con retraso y piezas secundarias.
  const w = (Math.PI * 2) / e.periodo;
  const resp = debil ? 0 : Math.sin(e.reloj * w + e.fase);
  cuerpo.scale.set(1 - 0.02 * resp, 1 + 0.04 * resp, 1 - 0.02 * resp);
  if (h.cabeza) {
    const a = conCabeza ? 1 : 0.35;
    h.cabeza.rotation.x = 0.05 * a * Math.sin(e.reloj * w + e.fase - 0.7);
    h.cabeza.rotation.z = 0.04 * a * Math.sin(e.reloj * w * 0.5 + e.fase);
  }
  if (h.copete) {
    h.copete.rotation.z = 0.09 * Math.sin(e.reloj * w + e.fase - 1.2);
    if (c.aspecto.piezas.copete?.forma === 'llama') {
      const p = 1 + 0.07 * Math.sin(e.reloj * 13.1) + 0.05 * Math.sin(e.reloj * 7.7 + 1.3);
      h.copete.scale.set(1 / Math.sqrt(p), p, 1 / Math.sqrt(p));
    }
  }
  if (h.cola) h.cola.rotation.y = 0.28 * Math.sin(e.reloj * 2.3 + e.fase);
  const aleteo = 0.18 * Math.sin(e.reloj * (c.aspecto.piezas.aletas ? 3.2 : 1.6) + e.fase);
  if (h.apendiceI) h.apendiceI.rotation.z = -aleteo;
  if (h.apendiceD) h.apendiceD.rotation.z = aleteo;

  // Parpadeo: 0,12 s con los ojos cerrados, cada 2 a 5 s.
  let ojos = 1;
  if (e.reloj >= e.proximoParpadeo) {
    const t = e.reloj - e.proximoParpadeo;
    if (t < 0.13) ojos = 0.12;
    else e.proximoParpadeo = e.reloj + 2 + siguienteAzar(e) * 3;
  }

  let destello = 0;
  const t = e.t;
  if (e.accion === 'ataque') {
    // Anticipación (agacharse y echarse atrás), embestida con salto y vuelta.
    const prep = suave(entre(t, 0, 0.24));
    const ida = entre(t, 0.24, 0.38);
    const vuelta = salida(entre(t, 0.45, DURACION.ataque));
    const avance = (ida > 0 ? -0.15 + 0.85 * salida(ida) : -0.15 * prep) * (1 - vuelta);
    cuerpo.position.z += avance * R * 2;
    cuerpo.position.y += Math.sin(Math.PI * ida) * R * 0.35 * (1 - vuelta);
    const aplastar = prep * (1 - ida) * 0.16 - Math.sin(Math.PI * ida) * 0.14;
    cuerpo.scale.y *= 1 - aplastar;
    cuerpo.scale.x *= 1 + aplastar * 0.5;
    cuerpo.scale.z *= 1 + aplastar * 0.5;
    cuerpo.rotation.x = (-0.18 * prep + 0.32 * Math.sin(Math.PI * ida)) * (1 - vuelta);
  } else if (e.accion === 'golpe') {
    const caida = Math.max(0, 1 - t / DURACION.golpe);
    destello = Math.max(0, 1 - t / 0.22) * 0.85;
    cuerpo.position.z -= R * 0.9 * salida(entre(t, 0, 0.1)) * caida;
    cuerpo.rotation.z = 0.18 * Math.sin(t * 38) * caida;
    cuerpo.rotation.x = -0.28 * caida;
    cuerpo.scale.y *= 1 - 0.18 * caida;
    cuerpo.scale.x *= 1 + 0.08 * caida;
    cuerpo.scale.z *= 1 + 0.08 * caida;
    if (t < 0.35) ojos = 0.3;
  } else if (debil) {
    // Se tambalea y cae de lado, rodando sobre el borde de la base; los ojos se cierran.
    const k = suave(entre(t, 0.25, 0.95));
    const tambaleo = Math.sin(t * 18) * 0.08 * (1 - entre(t, 0, 0.3)) * (t < 0.3 ? 1 : 0);
    cuerpo.rotation.z = tambaleo + k * 1.3;
    cuerpo.position.x = -R * 0.75 * k;
    cuerpo.position.y = R * 0.12 * k;
    cuerpo.scale.y *= 1 - 0.06 * k;
    ojos = t < 0.2 ? 1 : 0.1;
  }
  if (h.ojos) h.ojos.scale.y = ojos;
  c.material.ajustes.destello.value = destello;
}

/** Empieza una acción. Desde «debilitarse» solo se sale con «reposo». */
export function empezar(c: Animable, accion: Accion): void {
  if (c.anim.accion === 'debilitarse' && accion !== 'reposo' && accion !== 'debilitarse') return;
  c.anim.accion = accion;
  c.anim.t = 0;
}
