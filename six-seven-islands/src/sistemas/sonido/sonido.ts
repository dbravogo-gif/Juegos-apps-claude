// Subsistema «sonido» (F24): efectos y música generados por código con Web Audio, sin archivos ni
// licencias. Los efectos son una tabla de parámetros (EFECTOS), para ajustarlos sin leer el resto;
// la música, dos melodías cortas en bucle escritas como notas (explorar y combatir). El contexto de
// audio se crea con la primera tecla, porque el navegador no deja sonar antes. Se silencia desde el
// menú de pausa; también ahí se pueden escuchar todos los efectos, uno a uno (Claude no oye: el
// autor los valora).

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
}

export const EFECTOS = {
  seleccion: { onda: 'square', desde: 880, hasta: 880, duracion: 0.04, volumen: 0.12 },
  confirmar: { onda: 'square', desde: 660, hasta: 990, duracion: 0.07, volumen: 0.14 },
  atras: { onda: 'square', desde: 520, hasta: 330, duracion: 0.07, volumen: 0.12 },
  hablar: { onda: 'triangle', desde: 600, hasta: 600, duracion: 0.035, volumen: 0.1, variacion: 0.08 },
  puerta: { onda: 'sine', desde: 180, hasta: 90, duracion: 0.16, volumen: 0.3 },
  hierba: { onda: 'ruido', desde: 3000, hasta: 1500, duracion: 0.09, volumen: 0.1, variacion: 0.2 },
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

/** Una melodía en bucle: notas en semitonos sobre La 220 Hz (null = silencio) y el bajo. */
interface Melodia {
  pulsos: number;
  ritmo: number;
  melodia: (number | null)[];
  bajo: (number | null)[];
  onda: OscillatorType;
}

const MUSICA: Record<'explorar' | 'combate', Melodia> = {
  // Tranquila y pentatónica, como una tarde en el jable.
  explorar: {
    pulsos: 2,
    ritmo: 88,
    onda: 'triangle',
    melodia: [12, null, 15, 17, 19, null, 17, 15, 12, null, 10, 12, 15, null, null, null, 17, null, 19, 22, 24, null, 22, 19, 17, null, 15, 17, 12, null, null, null],
    bajo: [0, null, null, null, 7, null, null, null, 5, null, null, null, 3, null, null, null, 0, null, null, null, 7, null, null, null, 5, null, null, null, 7, null, null, null],
  },
  // Más deprisa y con más nervio.
  combate: {
    pulsos: 4,
    ritmo: 144,
    onda: 'square',
    melodia: [12, 15, 19, 15, 24, 22, 19, 15, 17, 19, 22, 19, 17, 15, 12, 10, 12, 15, 19, 22, 24, 27, 24, 22, 19, 17, 15, 17, 19, null, 12, null],
    bajo: [0, null, 0, null, 0, null, 3, null, 5, null, 5, null, 5, null, 3, null, 0, null, 0, null, 7, null, 7, null, 5, null, 3, null, 0, null, -2, null],
  },
};

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
  private ruido!: AudioBuffer;
  private activo = sonidoActivo();
  private tema: keyof typeof MUSICA | null = null;
  private siguienteNota = 0;
  private indiceNota = 0;
  private reloj: number | null = null;
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
    this.musica.gain.value = 0.35;
    this.musica.connect(this.general);
    // Un segundo de ruido blanco, para golpes y hierba.
    this.ruido = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const datos = this.ruido.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    this.reloj = window.setInterval(() => this.programarMusica(), 100);
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
    const t0 = a.currentTime;
    const v = 1 + (Math.random() * 2 - 1) * (d.variacion ?? 0);
    const notas = d.notas ?? [0];
    notas.forEach((n, i) => {
      const t = t0 + i * d.duracion;
      const f0 = d.desde * v * 2 ** (n / 12);
      const f1 = d.hasta * v * 2 ** (n / 12);
      const env = a.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(d.volumen, t + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, t + d.duracion);
      env.connect(this.general);
      if (d.onda === 'ruido') {
        const fuente = a.createBufferSource();
        fuente.buffer = this.ruido;
        const filtro = a.createBiquadFilter();
        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(f0, t);
        filtro.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + d.duracion);
        fuente.connect(filtro).connect(env);
        fuente.start(t);
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
    });
  }

  /** Programa las notas de la música que tocan en los próximos 0,3 s (sin cortes aunque haya tirones). */
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
    const paso = 60 / m.ritmo / m.pulsos;
    while (this.siguienteNota < a.currentTime + 0.3) {
      const i = this.indiceNota % m.melodia.length;
      this.nota(m.melodia[i], this.siguienteNota, paso * 0.9, m.onda, 0.09);
      this.nota(m.bajo[i] === null ? null : m.bajo[i]! - 12, this.siguienteNota, paso * 1.8, 'sine', 0.14);
      this.siguienteNota += paso;
      this.indiceNota++;
    }
  }

  private nota(semitonos: number | null, t: number, duracion: number, onda: OscillatorType, volumen: number): void {
    if (semitonos === null || !this.audio) return;
    const a = this.audio;
    const osc = a.createOscillator();
    osc.type = onda;
    osc.frequency.value = hz(semitonos);
    const env = a.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(volumen, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    osc.connect(env).connect(this.musica);
    osc.start(t);
    osc.stop(t + duracion + 0.02);
  }

  dispose(): void {
    for (const q of this.quitar) q();
    if (this.reloj !== null) clearInterval(this.reloj);
    void this.audio?.close();
  }
}
