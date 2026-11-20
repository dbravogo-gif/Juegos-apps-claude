// Subsistema «sonido» (F24): efectos, música y ambiente generados por código con Web Audio, sin
// archivos ni licencias (todo propio, R8). Los efectos son una tabla de parámetros (EFECTOS), para
// ajustarlos sin leer el resto; la música, temas escritos como datos (acordes, melodía, bajo y
// percusión) con varias voces y eco de sala; el ambiente, capas por zona (mar, viento, volcán y
// pájaros). El contexto de audio se crea con la primera tecla, porque el navegador no deja sonar
// antes. Se silencia desde el menú de pausa; también ahí se pueden escuchar todos los efectos, uno a
// uno (Claude no oye: el autor los valora). Rehecho el 2026-11-19 (autor: pisar hierba que suene a
// hierba, mejor el malpaís, música más profunda y musical, y ambiente).

import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';

/** Un efecto: un tono que va de una frecuencia a otra, o un soplo de ruido, o varias notas. */
export interface DefEfecto {
  onda: OscillatorType | 'ruido';
  /** Hz al empezar y al acabar (el tono se desliza). En las notas, la primera. */
  desde: number;
  hasta: number;
  /** Segundos. */
  duracion: number;
  volumen: number;
  /** Notas seguidas, en semitonos sobre `desde`, con `duracion` cada una. */
  notas?: number[];
  /** Variación del tono al azar, en tanto por uno, para que no suene siempre igual. */
  variacion?: number;
  /** Solo el ruido: el filtro (paso banda si no se dice) y su Q (lo estrecho que es). */
  filtro?: BiquadFilterType;
  q?: number;
  /** Solo el ruido: varios golpecitos seguidos (roce de hojas, crujido de grava). */
  granos?: number;
  /** Segundos entre grano y grano (con algo de azar). */
  separacion?: number;
  /** Segundos de subida: 0,008 si no se dice (un golpe); más, un soplo. */
  ataque?: number;
  /** Otro efecto que suena a la vez (una pisada debajo del crujido). */
  con?: string;
}

export const EFECTOS = {
  seleccion: { onda: 'square', desde: 880, hasta: 880, duracion: 0.04, volumen: 0.12 },
  confirmar: { onda: 'square', desde: 660, hasta: 990, duracion: 0.07, volumen: 0.14 },
  atras: { onda: 'square', desde: 520, hasta: 330, duracion: 0.07, volumen: 0.12 },
  hablar: { onda: 'triangle', desde: 600, hasta: 600, duracion: 0.035, volumen: 0.1, variacion: 0.08 },
  puerta: { onda: 'sine', desde: 180, hasta: 90, duracion: 0.16, volumen: 0.3 },
  // Pasos sobre el terreno de encuentros. Hierba: dos o tres roces agudos y suaves, como hojas que
  // se apartan. Malpaís: muchos chasquidos cortos de grava, con una pisada sorda debajo. Arena: un
  // siseo blando.
  hierba: { onda: 'ruido', desde: 5200, hasta: 2800, duracion: 0.12, volumen: 0.06, variacion: 0.18, filtro: 'bandpass', q: 0.9, granos: 3, separacion: 0.045, ataque: 0.025 },
  malpais: { onda: 'ruido', desde: 2600, hasta: 1700, duracion: 0.028, volumen: 0.08, variacion: 0.25, filtro: 'bandpass', q: 4, granos: 7, separacion: 0.016, con: 'pisada' },
  pisada: { onda: 'ruido', desde: 260, hasta: 120, duracion: 0.1, volumen: 0.16, filtro: 'lowpass', q: 0.7 },
  arena: { onda: 'ruido', desde: 1400, hasta: 700, duracion: 0.16, volumen: 0.05, variacion: 0.15, filtro: 'lowpass', q: 0.5, granos: 2, separacion: 0.05, ataque: 0.04 },
  objeto: { onda: 'triangle', desde: 784, hasta: 784, duracion: 0.08, volumen: 0.2, notas: [0, 4, 7, 12] },
  encuentro: { onda: 'sawtooth', desde: 220, hasta: 880, duracion: 0.45, volumen: 0.16 },
  exclamacion: { onda: 'square', desde: 988, hasta: 988, duracion: 0.08, volumen: 0.16, notas: [0, 5] },
  salida: { onda: 'sine', desde: 400, hasta: 1200, duracion: 0.25, volumen: 0.2 },
  ataque: { onda: 'ruido', desde: 1200, hasta: 400, duracion: 0.18, volumen: 0.14, variacion: 0.15 },
  golpe: { onda: 'ruido', desde: 600, hasta: 120, duracion: 0.2, volumen: 0.3, variacion: 0.1 },
  eficaz: { onda: 'square', desde: 660, hasta: 660, duracion: 0.07, volumen: 0.14, notas: [0, 7, 12] },
  pocoEficaz: { onda: 'triangle', desde: 260, hasta: 200, duracion: 0.2, volumen: 0.16 },
  debilitado: { onda: 'triangle', desde: 520, hasta: 90, duracion: 0.6, volumen: 0.22 },
  lanzar: { onda: 'ruido', desde: 2000, hasta: 600, duracion: 0.25, volumen: 0.14 },
  sacudida: { onda: 'square', desde: 300, hasta: 260, duracion: 0.05, volumen: 0.16 },
  captura: { onda: 'square', desde: 523, hasta: 523, duracion: 0.11, volumen: 0.16, notas: [0, 4, 7, 12, 7, 12] },
  escapa: { onda: 'triangle', desde: 440, hasta: 440, duracion: 0.12, volumen: 0.16, notas: [0, -5] },
  nivel: { onda: 'square', desde: 523, hasta: 523, duracion: 0.09, volumen: 0.15, notas: [0, 4, 7, 12, 16] },
  curar: { onda: 'sine', desde: 523, hasta: 523, duracion: 0.12, volumen: 0.2, notas: [0, 4, 7, 12] },
  comprar: { onda: 'square', desde: 1318, hasta: 1318, duracion: 0.06, volumen: 0.12, notas: [0, 5] },
  huir: { onda: 'triangle', desde: 300, hasta: 900, duracion: 0.3, volumen: 0.16 },
} as const satisfies Record<string, DefEfecto>;

export type NombreEfecto = keyof typeof EFECTOS;

/**
 * Un tema en bucle, en semitonos sobre La 220 Hz (null = nada en ese paso). Un compás tiene
 * `compas` pulsos de `subdivision` pasos cada uno.
 */
interface Tema {
  compas: number;
  subdivision: number;
  ritmo: number;
  /** El acorde de cada compás (sus notas, de grave a agudo): lo tocan el fondo y el punteo. */
  acordes: number[][];
  /** La nota grave de cada compás. */
  bajos: number[];
  melodia: (number | null)[];
  /** Cómo va el bajo dentro del compás: en qué pasos suena (y si sube una octava, con 'o'). */
  patronBajo: string;
  /** En qué pasos rasguea el punteo el acorde. */
  patronPunteo: string;
  /** Percusión por paso, compás a compás: k bombo, s caja, h platillo, '.' nada. */
  bateria?: string;
  timbre: 'suave' | 'brillante';
}

// Acordes, de grave a agudo (La 220 = 0).
const D = [5, 9, 12];
const A = [4, 7, 12];
const Bm = [2, 5, 9];
const G = [2, 5, 10];
const Em = [7, 10, 14];
const C = [3, 7, 10];
const Am = [0, 3, 7];
const B = [2, 6, 9];
const _ = null;

export const MUSICA: Record<'explorar' | 'combate', Tema> = {
  // Explorar: un vals en 3/4, en Re, con el punteo de un timple en los pulsos dos y tres, acordes de
  // fondo y una melodía que respira (composición propia).
  explorar: {
    compas: 3,
    subdivision: 2,
    ritmo: 100,
    timbre: 'suave',
    acordes: [D, A, Bm, G, D, G, A, D, G, D, Em, A, D, Bm, A, D],
    bajos: [-19, -24, -22, -14, -19, -14, -24, -19, -14, -19, -17, -24, -19, -22, -24, -19],
    patronBajo: 'x.....',
    patronPunteo: '..x.x.',
    melodia: [
      9, _, _, 7, 9, 12, /**/ 7, _, _, _, 4, 7, /**/ 5, _, _, 9, 7, 5, /**/ 2, _, _, _, _, _,
      12, _, _, 14, 12, 9, /**/ 10, _, _, 9, 7, 5, /**/ 7, _, _, 9, 7, 4, /**/ 5, _, _, _, _, _,
      14, _, _, 12, 10, 14, /**/ 12, _, _, 9, _, 12, /**/ 10, _, _, 9, 7, 10, /**/ 9, _, _, 7, _, _,
      17, _, _, 16, 14, 12, /**/ 14, _, _, 12, 9, 5, /**/ 7, _, 9, 10, _, 7, /**/ 5, _, _, _, _, _,
    ],
  },
  // Combate: en Mi menor, a 4/4, con el bajo en corcheas, acordes, percusión y una melodía con
  // empuje (composición propia).
  combate: {
    compas: 4,
    subdivision: 2,
    ritmo: 132,
    timbre: 'brillante',
    acordes: [Em, C, D, B, Em, C, Am, B],
    bajos: [-17, -21, -19, -22, -17, -21, -24, -22],
    patronBajo: 'xoxoxoxo',
    patronPunteo: '..x...x.',
    bateria: 'k.h.s.h.' + 'k.hks.hh',
    melodia: [
      14, _, 19, _, 17, 14, _, 10, /**/ 12, _, 10, 7, _, 10, 12, _, /**/ 9, _, 12, _, 17, _, 15, 14, /**/ 18, _, _, _, 9, _, 14, _,
      19, _, 22, _, 21, 19, _, 14, /**/ 15, _, 14, 12, _, 10, _, 7, /**/ 12, _, 15, _, 19, _, 17, 15, /**/ 14, _, _, 18, _, 21, _, _,
    ],
  },
};

/**
 * El ambiente de cada zona: cuánto mar, viento, volcán y pájaros (de 0 a 1). Las que no salen,
 * un poco de viento. Dentro de los edificios, casi nada; en combate, bajo la música.
 */
export const AMBIENTE: Record<string, { mar?: number; viento?: number; volcan?: number; pajaros?: number }> = {
  inicial: { mar: 0.45, pajaros: 0.6, viento: 0.2 },
  combates: { mar: 0.8, viento: 0.3 },
  pueblo: { viento: 0.35, pajaros: 0.5 },
  fuego: { volcan: 0.85, viento: 0.25 },
  jable: { viento: 0.85 },
  capital: { mar: 0.6, pajaros: 0.3, viento: 0.2 },
  famara: { mar: 1, viento: 0.5 },
  corralejo: { mar: 0.7, viento: 0.4 },
  dunas: { viento: 1 },
  puerto: { mar: 0.7, pajaros: 0.2 },
  betancuria: { pajaros: 0.7, viento: 0.2 },
  ajuy: { mar: 0.9, viento: 0.3 },
  sotavento: { viento: 0.9, mar: 0.5 },
  morro: { mar: 0.6, viento: 0.5 },
  tindaya: { viento: 0.6, pajaros: 0.2 },
  cofete: { mar: 0.9, viento: 0.6 },
};
const CAPAS = ['mar', 'viento', 'volcan', 'pajaros'] as const;
type Capa = (typeof CAPAS)[number];
/** Volumen de cada capa a tope. */
const VOLUMEN_CAPA: Record<Capa, number> = { mar: 0.22, viento: 0.16, volcan: 0.3, pajaros: 0.05 };

const CLAVE_SILENCIO = 'six-seven-islands:sin-sonido';

/** Si el sonido está activado (se guarda en el navegador). */
export function sonidoActivo(): boolean {
  try {
    return localStorage.getItem(CLAVE_SILENCIO) !== '1';
  } catch {
    return true;
  }
}

const hz = (semitonos: number) => 220 * 2 ** (semitonos / 12);

export class Sonido implements Subsistema {
  static readonly id = 'sonido';
  static readonly deps: readonly string[] = ['partida'];

  private partida!: Partida;
  private audio: AudioContext | null = null;
  private general!: GainNode;
  private musica!: GainNode;
  /** El eco de sala de la música: le da profundidad. */
  private eco!: GainNode;
  private ruido!: AudioBuffer;
  private activo = sonidoActivo();
  private tema: keyof typeof MUSICA | null = null;
  private siguienteNota = 0;
  private indiceNota = 0;
  private reloj: number | null = null;
  private capas = new Map<Capa, GainNode>();
  private quitar: (() => void)[] = [];

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    const arrancar = () => this.arrancar();
    window.addEventListener('keydown', arrancar, { once: true });
    this.quitar.push(() => window.removeEventListener('keydown', arrancar));
    const ev = ctx.eventos;
    this.quitar.push(
      ev.on('sonido:tocar', ({ nombre }) => this.tocar(nombre as NombreEfecto)),
      ev.on('sonido:alternar', () => this.alternar()),
      ev.on('encuentro:inicio', () => this.tocar('encuentro')),
      ev.on('entrenador:visto', () => this.tocar('exclamacion')),
      ev.on('objeto:recogido', () => this.tocar('objeto')),
    );
  }

  private arrancar(): void {
    if (this.audio) return;
    const audio = new AudioContext();
    this.audio = audio;
    this.general = audio.createGain();
    this.general.gain.value = this.activo ? 0.6 : 0;
    this.general.connect(audio.destination);
    this.musica = audio.createGain();
    this.musica.gain.value = 0.32;
    this.musica.connect(this.general);
    // Eco de sala: una respuesta de ruido que se apaga en 2,4 s, por la que pasa parte de la música.
    const largo = Math.floor(audio.sampleRate * 2.4);
    const respuesta = audio.createBuffer(2, largo, audio.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = respuesta.getChannelData(c);
      for (let k = 0; k < largo; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / largo) ** 3;
    }
    const sala = audio.createConvolver();
    sala.buffer = respuesta;
    this.eco = audio.createGain();
    this.eco.gain.value = 0.32;
    this.eco.connect(sala).connect(this.musica);
    // Dos segundos de ruido blanco, para golpes, pasos y ambiente.
    this.ruido = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const datos = this.ruido.getChannelData(0);
    for (let k = 0; k < datos.length; k++) datos[k] = Math.random() * 2 - 1;
    this.montarAmbiente();
    this.reloj = window.setInterval(() => {
      this.programarMusica();
      this.ajustarAmbiente();
    }, 100);
  }

  /** Activa o silencia todo, y lo recuerda. */
  private alternar(): void {
    this.activo = !this.activo;
    try {
      localStorage.setItem(CLAVE_SILENCIO, this.activo ? '0' : '1');
    } catch {
      // Sin almacenamiento: solo dura esta sesión.
    }
    if (this.audio) this.general.gain.setTargetAtTime(this.activo ? 0.6 : 0, this.audio.currentTime, 0.05);
  }

  tocar(nombre: NombreEfecto): void {
    const a = this.audio;
    const d: DefEfecto | undefined = EFECTOS[nombre];
    if (!a || !d || !this.activo) return;
    if (d.con && d.con in EFECTOS) this.tocar(d.con as NombreEfecto);
    const t0 = a.currentTime;
    const v = 1 + (Math.random() * 2 - 1) * (d.variacion ?? 0);
    const ataque = d.ataque ?? 0.008;
    // Un golpe por nota; si es ruido con granos, varios golpecitos seguidos y algo desiguales.
    const golpes: [number, number, number][] =
      d.onda === 'ruido' && d.granos
        ? Array.from({ length: d.granos }, (_, k) => [t0 + k * (d.separacion ?? 0.03) * (0.7 + Math.random() * 0.6), 1 + (Math.random() - 0.5) * 0.3, 0.6 + Math.random() * 0.4])
        : (d.notas ?? [0]).map((n, k) => [t0 + k * d.duracion, 2 ** (n / 12), 1]);
    for (const [t, factor, fuerza] of golpes) {
      const f0 = d.desde * v * factor;
      const f1 = d.hasta * v * factor;
      const env = a.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(d.volumen * fuerza, t + ataque);
      env.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(d.duracion, ataque + 0.01));
      env.connect(this.general);
      if (d.onda === 'ruido') {
        const fuente = a.createBufferSource();
        fuente.buffer = this.ruido;
        const filtro = a.createBiquadFilter();
        filtro.type = d.filtro ?? 'bandpass';
        filtro.Q.value = d.q ?? 1;
        filtro.frequency.setValueAtTime(f0, t);
        filtro.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + d.duracion);
        fuente.connect(filtro).connect(env);
        // Cada golpe, de un trozo distinto del ruido: si no, todos sonarían igual.
        fuente.start(t, Math.random() * 1.5);
        fuente.stop(t + d.duracion + 0.02);
      } else {
        const osc = a.createOscillator();
        osc.type = d.onda;
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d.duracion);
        osc.connect(env);
        osc.start(t);
        osc.stop(t + d.duracion + 0.02);
      }
    }
  }

  // ——— Música ———

  /** Programa los pasos de la música que tocan en los próximos 0,3 s (sin cortes aunque haya tirones). */
  private programarMusica(): void {
    const a = this.audio;
    if (!a) return;
    const quiere: keyof typeof MUSICA = this.partida.modo === 'combate' ? 'combate' : 'explorar';
    if (quiere !== this.tema) {
      this.tema = quiere;
      this.indiceNota = 0;
      this.siguienteNota = a.currentTime + 0.05;
    }
    const m = MUSICA[this.tema];
    const paso = 60 / m.ritmo / m.subdivision;
    const pasosCompas = m.compas * m.subdivision;
    const total = m.acordes.length * pasosCompas;
    while (this.siguienteNota < a.currentTime + 0.3) {
      const i = this.indiceNota % total;
      const compas = Math.floor(i / pasosCompas);
      const p = i % pasosCompas;
      const t = this.siguienteNota;
      const acorde = m.acordes[compas];
      // El fondo: el acorde entero, sostenido todo el compás, con ataque lento.
      if (p === 0) for (const n of acorde) this.voz(n, t, paso * pasosCompas, 'fondo', m.timbre);
      // El bajo, según su patrón; 'o', una octava más arriba.
      const b = m.patronBajo[p % m.patronBajo.length];
      if (b === 'x' || b === 'o') this.voz(m.bajos[compas] + (b === 'o' ? 12 : 0), t, paso * (b === 'x' && m.compas === 3 ? 4 : 0.9), 'bajo', m.timbre);
      // El punteo rasguea el acorde, una octava arriba, nota a nota muy seguidas.
      if (m.patronPunteo[p % m.patronPunteo.length] === 'x') acorde.forEach((n, k) => this.voz(n + 12, t + k * 0.018, paso * 1.6, 'punteo', m.timbre));
      const n = m.melodia[i % m.melodia.length];
      if (n !== null && n !== undefined) {
        // La nota dura hasta la siguiente (los silencios la alargan), como una frase cantada.
        let largo = 1;
        while (largo < 6 && m.melodia[(i + largo) % m.melodia.length] === null) largo++;
        this.voz(n, t, paso * largo * 0.95, 'melodia', m.timbre);
      }
      const golpe = m.bateria?.[i % m.bateria.length];
      if (golpe && golpe !== '.') this.percusion(golpe, t);
      this.siguienteNota += paso;
      this.indiceNota++;
    }
  }

  /** Una nota de una de las voces de la música. */
  private voz(semitonos: number, t: number, duracion: number, voz: 'fondo' | 'bajo' | 'punteo' | 'melodia', timbre: Tema['timbre']): void {
    const a = this.audio!;
    const env = a.createGain();
    const salida = a.createGain();
    salida.connect(this.musica);
    salida.connect(this.eco);
    env.connect(salida);
    const f = hz(semitonos);
    const oscs: OscillatorNode[] = [];
    const nuevo = (tipo: OscillatorType, frec: number, desafina = 0) => {
      const o = a.createOscillator();
      o.type = tipo;
      o.frequency.value = frec;
      o.detune.value = desafina;
      oscs.push(o);
      return o;
    };
    let fin = t + duracion;
    if (voz === 'fondo') {
      // Dos osciladores algo desafinados y un filtro suave: un colchón cálido.
      const filtro = a.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = timbre === 'suave' ? 1100 : 1600;
      filtro.connect(env);
      nuevo('triangle', f, -7).connect(filtro);
      nuevo('sawtooth', f, 6).connect(filtro);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(timbre === 'suave' ? 0.022 : 0.016, t + Math.min(0.6, duracion * 0.4));
      env.gain.setTargetAtTime(0.0001, t + duracion * 0.8, duracion * 0.15);
      fin = t + duracion * 1.4;
    } else if (voz === 'bajo') {
      // Un seno con algo de triángulo una octava arriba: se oye también en altavoces pequeños.
      nuevo('sine', f).connect(env);
      const arm = a.createGain();
      arm.gain.value = 0.35;
      nuevo('triangle', f * 2).connect(arm).connect(env);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(timbre === 'suave' ? 0.13 : 0.11, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    } else if (voz === 'punteo') {
      // Una cuerda pulsada (un timple): ataque seco y un filtro que se cierra deprisa.
      const filtro = a.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.setValueAtTime(3800, t);
      filtro.frequency.exponentialRampToValueAtTime(700, t + 0.25);
      filtro.connect(env);
      nuevo('square', f).connect(filtro);
      nuevo('triangle', f, 4).connect(filtro);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(timbre === 'suave' ? 0.03 : 0.022, t + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    } else {
      // La melodía: triángulo con un vibrato que entra poco a poco; en combate, más brillante.
      const o = nuevo(timbre === 'suave' ? 'triangle' : 'square', f);
      const vib = a.createOscillator();
      vib.frequency.value = 5.2;
      const prof = a.createGain();
      prof.gain.setValueAtTime(0, t);
      prof.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.4, duracion));
      vib.connect(prof).connect(o.frequency);
      oscs.push(vib);
      if (timbre === 'suave') o.connect(env);
      else {
        const filtro = a.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 2400;
        o.connect(filtro).connect(env);
      }
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(timbre === 'suave' ? 0.085 : 0.05, t + 0.03);
      env.gain.setTargetAtTime(timbre === 'suave' ? 0.06 : 0.035, t + 0.08, 0.1);
      env.gain.setTargetAtTime(0.0001, t + duracion * 0.85, 0.06);
      fin = t + duracion + 0.3;
    }
    for (const o of oscs) {
      o.start(t);
      o.stop(fin + 0.05);
    }
  }

  /** La percusión del combate: bombo, caja y platillo, hechos de seno y ruido. */
  private percusion(golpe: string, t: number): void {
    const a = this.audio!;
    const env = a.createGain();
    env.connect(this.musica);
    if (golpe === 'k') {
      const o = a.createOscillator();
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.32, t + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(env);
      o.start(t);
      o.stop(t + 0.2);
      return;
    }
    const fuente = a.createBufferSource();
    fuente.buffer = this.ruido;
    const filtro = a.createBiquadFilter();
    filtro.type = golpe === 's' ? 'bandpass' : 'highpass';
    filtro.frequency.value = golpe === 's' ? 1900 : 7000;
    const dura = golpe === 's' ? 0.13 : 0.035;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(golpe === 's' ? 0.16 : 0.05, t + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dura);
    fuente.connect(filtro).connect(env);
    fuente.start(t, Math.random() * 1.5);
    fuente.stop(t + dura + 0.02);
  }

  // ——— Ambiente ———

  /** Las capas de ambiente, siempre sonando y a volumen 0 hasta que la zona las pide. */
  private montarAmbiente(): void {
    const a = this.audio!;
    const ambiente = a.createGain();
    ambiente.gain.value = 1;
    ambiente.connect(this.general);
    const ruido = (filtroTipo: BiquadFilterType, frec: number, q: number) => {
      const fuente = a.createBufferSource();
      fuente.buffer = this.ruido;
      fuente.loop = true;
      const filtro = a.createBiquadFilter();
      filtro.type = filtroTipo;
      filtro.frequency.value = frec;
      filtro.Q.value = q;
      fuente.connect(filtro);
      fuente.start();
      return filtro;
    };
    /** Un vaivén lento del volumen (olas, rachas): una ganancia que sube y baja. */
    const vaiven = (entrada: AudioNode, hzVaiven: number, hondo: number) => {
      const g = a.createGain();
      g.gain.value = 1 - hondo;
      const lfo = a.createOscillator();
      lfo.frequency.value = hzVaiven;
      const prof = a.createGain();
      prof.gain.value = hondo;
      lfo.connect(prof).connect(g.gain);
      lfo.start();
      entrada.connect(g);
      return g;
    };
    const capa = (nombre: Capa, nodo: AudioNode) => {
      const g = a.createGain();
      g.gain.value = 0;
      nodo.connect(g).connect(ambiente);
      this.capas.set(nombre, g);
    };
    // El mar: ruido grave que sube y baja como las olas (cada 9 s).
    capa('mar', vaiven(ruido('lowpass', 520, 0.6), 0.11, 0.6));
    // El viento: ruido de banda que silba más o menos con las rachas.
    const viento = ruido('bandpass', 480, 0.8);
    const racha = a.createOscillator();
    racha.frequency.value = 0.07;
    const anchoRacha = a.createGain();
    anchoRacha.gain.value = 220;
    racha.connect(anchoRacha).connect((viento as BiquadFilterNode).frequency);
    racha.start();
    capa('viento', vaiven(viento, 0.05, 0.5));
    // El volcán: un retumbo muy grave y lento.
    capa('volcan', vaiven(ruido('lowpass', 110, 0.9), 0.04, 0.4));
    // Los pájaros: trinos sueltos (los programa ajustarAmbiente); la capa es su volumen.
    capa('pajaros', a.createGain());
  }

  /** Lleva cada capa al volumen de la zona en que se está, despacio. Y algún trino. */
  private ajustarAmbiente(): void {
    const a = this.audio;
    if (!a) return;
    const e = this.partida.estado;
    const dentro = !!e?.dentro;
    const combate = this.partida.modo === 'combate';
    const zona = AMBIENTE[e?.zona ?? ''] ?? { viento: 0.25 };
    const atenua = dentro ? 0.12 : combate ? 0.3 : 1;
    for (const c of CAPAS) {
      const g = this.capas.get(c);
      if (g) g.gain.setTargetAtTime((zona[c] ?? 0) * VOLUMEN_CAPA[c] * atenua, a.currentTime, 1.2);
    }
    const pajaros = (zona.pajaros ?? 0) * atenua;
    if (pajaros > 0.05 && Math.random() < 0.04 * pajaros) this.trino(this.capas.get('pajaros')!);
  }

  /** Un trino: de dos a cuatro silbidos cortos que suben, cada uno distinto. */
  private trino(destino: GainNode): void {
    const a = this.audio!;
    const t0 = a.currentTime + 0.02;
    const base = 2600 + Math.random() * 1400;
    const veces = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < veces; k++) {
      const t = t0 + k * (0.09 + Math.random() * 0.05);
      const o = a.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), t);
      o.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.06);
      const env = a.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(1, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(env).connect(destino);
      o.start(t);
      o.stop(t + 0.09);
    }
  }

  dispose(): void {
    for (const q of this.quitar) q();
    if (this.reloj !== null) clearInterval(this.reloj);
    void this.audio?.close();
  }
}
