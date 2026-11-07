import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Scene } from 'three';
import {
  Motor,
  PASO_FIJO,
  PASOS_MAX_POR_FOTOGRAMA,
  ordenarPorDependencias,
  type ClaseSubsistema,
  type Ctx,
  type Subsistema,
} from '../src/motor/motor';
import { Eventos } from '../src/motor/eventos';

/** Crea una clase de subsistema que apunta en `registro` lo que le pasa. */
function clase(id: string, deps: string[], registro: string[]): ClaseSubsistema {
  return class implements Subsistema {
    static readonly id = id;
    static readonly deps = deps;
    init() {
      registro.push(`init:${id}`);
    }
    pasoFijo() {
      registro.push(`paso:${id}`);
    }
    actualizar() {
      registro.push(`act:${id}`);
    }
    dibujar() {
      registro.push(`dib:${id}`);
    }
    dispose() {
      registro.push(`fin:${id}`);
    }
  };
}

const nuevoMotor = () => new Motor(new Scene(), new PerspectiveCamera(), 'bajo', 67);

describe('orden de dependencias', () => {
  it('pone cada subsistema detrás de sus dependencias', () => {
    const r: string[] = [];
    const orden = ordenarPorDependencias([clase('c', ['b'], r), clase('a', [], r), clase('b', ['a'], r)]);
    expect(orden.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('rechaza dependencias circulares, ausentes o ids repetidos', () => {
    const r: string[] = [];
    expect(() => ordenarPorDependencias([clase('a', ['b'], r), clase('b', ['a'], r)])).toThrow(/circular/);
    expect(() => ordenarPorDependencias([clase('a', ['z'], r)])).toThrow(/no está registrado/);
    expect(() => ordenarPorDependencias([clase('a', [], r), clase('a', [], r)])).toThrow(/repetido/);
  });
});

describe('motor', () => {
  it('inicia en orden, da acceso por id y libera en orden inverso', async () => {
    const r: string[] = [];
    const motor = nuevoMotor();
    await motor.iniciar([clase('b', ['a'], r), clase('a', [], r)]);
    expect(r).toEqual(['init:a', 'init:b']);
    expect(motor.ctx.tiene('a')).toBe(true);
    expect(() => motor.ctx.get('z')).toThrow();
    r.length = 0;
    motor.dispose();
    expect(r).toEqual(['fin:b', 'fin:a']);
  });

  it('ejecuta los pasos fijos que tocan, después actualizar y al final dibujar', async () => {
    const r: string[] = [];
    const motor = nuevoMotor();
    await motor.iniciar([clase('a', [], r), clase('b', [], r)]);
    r.length = 0;
    motor.fotograma(PASO_FIJO * 2);
    expect(r).toEqual(['paso:a', 'paso:b', 'paso:a', 'paso:b', 'act:a', 'act:b', 'dib:a', 'dib:b']);
    expect(motor.ctx.tiempo.pasos).toBe(2);
    expect(motor.ctx.tiempo.fotograma).toBe(1);
  });

  it('el número de pasos no depende de cómo se troceen los fotogramas', async () => {
    const pasos = async (fotogramas: number[]) => {
      const motor = nuevoMotor();
      await motor.iniciar([]);
      for (const dt of fotogramas) motor.fotograma(dt);
      return motor.ctx.tiempo.pasos;
    };
    // Un segundo a 60, a 120 y a 30 FPS: siempre 60 pasos.
    expect(await pasos(Array(60).fill(1 / 60))).toBe(60);
    expect(await pasos(Array(120).fill(1 / 120))).toBe(60);
    expect(await pasos(Array(30).fill(1 / 30))).toBe(60);
  });

  it('tras una pausa larga no ejecuta más de PASOS_MAX_POR_FOTOGRAMA pasos', async () => {
    const motor = nuevoMotor();
    await motor.iniciar([]);
    motor.fotograma(10);
    expect(motor.ctx.tiempo.pasos).toBe(PASOS_MAX_POR_FOTOGRAMA);
  });

  it('el ctx lleva la calidad y un generador con semilla', () => {
    const ctx: Ctx = nuevoMotor().ctx;
    expect(ctx.config.calidad.nivel).toBe('bajo');
    expect(ctx.config.calidad.densidadMax).toBeLessThanOrEqual(2);
    expect(ctx.rng.s).toHaveLength(4);
  });
});

describe('eventos', () => {
  it('entrega los datos y deja de entregar tras anular la suscripción', () => {
    const eventos = new Eventos();
    const recibidos: string[] = [];
    const quitar = eventos.on('zona:entrar', (d) => recibidos.push(d.zonaId));
    eventos.emit('zona:entrar', { zonaId: 'ruta-1' });
    quitar();
    eventos.emit('zona:entrar', { zonaId: 'bosque' });
    expect(recibidos).toEqual(['ruta-1']);
  });
});
