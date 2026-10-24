import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { ASPECTOS } from '../src/data/aspectos';
import { CASILLAS, ENTRENADORES, INICIO, ZONAS } from '../src/data/mundo';
import { enLineaDeVision, esSolida, validarZona, type Guion, type Paso } from '../src/core/mundo';
import {
  ajustarADatos,
  anadirCriatura,
  aplicarCombate,
  equipoEntrenador,
  MAX_EQUIPO,
  nuevaPartida,
  tirarEncuentro,
} from '../src/core/partida';
import { deserializar, serializar } from '../src/core/guardado';
import { ESPECIES_RETIRADAS } from '../src/data/especies';
import { vidaMaxima } from '../src/core/estadisticas';
import { ESPECIE_MIMICO, registrarRecipiente, revisado } from '../src/core/recipientes';
import { OBJETOS_RECIPIENTE, PROB_RECIPIENTE, RECOMPENSA_MIMICO } from '../src/data/recipientes';
import { crearCriatura } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';

function pasosDe(guion: Guion): Paso[] {
  const todos: Paso[] = [];
  const recorrer = (g: Paso[]) => {
    for (const p of g) {
      todos.push(p);
      if (p.tipo === 'si') {
        recorrer(p.entonces);
        recorrer(p.sino ?? []);
      }
      if (p.tipo === 'elegir') for (const o of p.opciones) recorrer(o.pasos);
    }
  };
  recorrer(guion);
  return todos;
}

describe('zonas del capítulo 1', () => {
  it('son coherentes: filas iguales, caracteres conocidos, salidas y personajes en su sitio', () => {
    for (const z of Object.values(ZONAS)) {
      expect(validarZona(z, CASILLAS, ZONAS, ENTRENADORES)).toEqual([]);
    }
  });

  it('el inicio cae en una casilla transitable', () => {
    expect(esSolida(ZONAS[INICIO.zona], INICIO.x, INICIO.y, CASILLAS)).toBe(false);
  });

  it('los guiones usan objetos, entrenadores y especies que existen', () => {
    for (const z of Object.values(ZONAS)) {
      const guiones = [...z.pnj.map((p) => p.guion), z.alEntrar ?? []];
      for (const p of guiones.flatMap(pasosDe)) {
        if (p.tipo === 'dar') expect(DATOS.objetos[p.objeto], p.objeto).toBeDefined();
        if (p.tipo === 'combate') expect(ENTRENADORES[p.entrenador], p.entrenador).toBeDefined();
        if (p.tipo === 'tienda') {
          for (const id of p.productos) expect(DATOS.objetos[id]?.precio, `${id} sin precio`).toBeGreaterThan(0);
        }
      }
      for (const e of z.encuentros?.especies ?? []) expect(DATOS.especies[e.especie], e.especie).toBeDefined();
      for (const pnj of z.pnj) expect(ASPECTOS, `${z.id}/${pnj.id}`).toContain(pnj.aspecto);
      for (const o of z.ocultos ?? []) expect(DATOS.objetos[o.objeto], o.objeto).toBeDefined();
    }
    for (const e of Object.values(ENTRENADORES)) {
      for (const c of e.equipo) expect(DATOS.especies[c.especie], c.especie).toBeDefined();
      for (const id of Object.keys(e.objetos ?? {})) expect(DATOS.objetos[id], id).toBeDefined();
    }
  });

  it('cada salida tiene vuelta', () => {
    for (const z of Object.values(ZONAS)) {
      for (const s of z.salidas) {
        expect(ZONAS[s.zona].salidas.some((v) => v.zona === z.id), `${z.id} → ${s.zona}`).toBe(true);
      }
    }
  });
});

describe('recipientes', () => {
  it('las probabilidades suman 100 y los objetos existen', () => {
    expect(PROB_RECIPIENTE.objeto + PROB_RECIPIENTE.nada + PROB_RECIPIENTE.mimico).toBe(100);
    for (const lista of Object.values(OBJETOS_RECIPIENTE)) for (const o of lista) expect(DATOS.objetos[o.objeto], o.objeto).toBeDefined();
    expect(DATOS.objetos[RECOMPENSA_MIMICO.objeto]).toBeDefined();
    expect(DATOS.especies[ESPECIE_MIMICO]).toBeDefined();
  });

  it('cada zona con recipientes tiene su tabla de objetos', () => {
    for (const z of Object.values(ZONAS)) if (z.recipientes?.length) expect(OBJETOS_RECIPIENTE[z.id], z.id).toBeDefined();
  });

  it('salen los tres resultados con más o menos sus probabilidades', () => {
    const cuenta = { objeto: 0, nada: 0, mimico: 0 };
    const p = nuevaPartida('X', 'recipientes', INICIO);
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 10, crearRng(1))];
    for (let i = 0; i < 2000; i++) {
      const r = registrarRecipiente(p, 'vega', `r${i}`, { prob: PROB_RECIPIENTE, objetos: OBJETOS_RECIPIENTE.vega }, DATOS);
      cuenta[r.tipo] += 1;
    }
    expect(cuenta.objeto / 2000).toBeGreaterThan(0.55);
    expect(cuenta.objeto / 2000).toBeLessThan(0.65);
    expect(cuenta.mimico / 2000).toBeGreaterThan(0.07);
    expect(cuenta.mimico / 2000).toBeLessThan(0.13);
  });

  it('un recipiente registrado no vuelve a dar nada, ni tras guardar y cargar', () => {
    const p = nuevaPartida('X', 7, INICIO);
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 10, crearRng(1))];
    registrarRecipiente(p, 'vega', 'puente', { prob: { objeto: 100, nada: 0, mimico: 0 }, objetos: OBJETOS_RECIPIENTE.vega }, DATOS);
    const cargada = deserializar(serializar(p))!;
    expect(revisado(cargada, 'vega', 'puente')).toBe(true);
    const r = registrarRecipiente(cargada, 'vega', 'puente', { prob: { objeto: 100, nada: 0, mimico: 0 }, objetos: OBJETOS_RECIPIENTE.vega }, DATOS);
    expect(r.tipo).toBe('nada');
  });

  it('el Papemímico sale por encima del nivel del equipo', () => {
    const p = nuevaPartida('X', 3, INICIO);
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 12, crearRng(1))];
    const r = registrarRecipiente(p, 'vega', 'x', { prob: { objeto: 0, nada: 0, mimico: 100 }, objetos: OBJETOS_RECIPIENTE.vega }, DATOS);
    expect(r.tipo).toBe('mimico');
    if (r.tipo === 'mimico') {
      expect(r.criatura.especie).toBe(ESPECIE_MIMICO);
      expect(r.criatura.nivel).toBe(14);
    }
  });
});

describe('línea de visión', () => {
  const vega = ZONAS.vega;
  it('el ballestero ve el camino que tiene delante', () => {
    expect(enLineaDeVision(vega, CASILLAS, { x: 9, y: 20, dir: 'izquierda' }, 3, { x: 7, y: 20 })).toBe(true);
    expect(enLineaDeVision(vega, CASILLAS, { x: 9, y: 20, dir: 'izquierda' }, 3, { x: 7, y: 21 })).toBe(false);
    expect(enLineaDeVision(vega, CASILLAS, { x: 9, y: 20, dir: 'izquierda' }, 1, { x: 7, y: 20 })).toBe(false);
  });

  it('un muro corta la vista', () => {
    // Desde la orilla de la acequia mirando hacia arriba, el agua no tapa pero un árbol sí.
    expect(enLineaDeVision(vega, CASILLAS, { x: 1, y: 3, dir: 'arriba' }, 5, { x: 1, y: 0 })).toBe(false);
  });
});

describe('partida', () => {
  it('el equipo se llena hasta seis y el resto va al Bestiario', () => {
    const p = nuevaPartida('Prueba', 1, INICIO);
    const rng = crearRng(2);
    for (let i = 0; i < MAX_EQUIPO + 2; i++) anadirCriatura(p, crearCriatura(DATOS, 'topillo', 3, rng));
    expect(p.equipo).toHaveLength(MAX_EQUIPO);
    expect(p.almacen).toHaveLength(2);
    expect(p.capturados).toEqual(['topillo']);
  });

  it('los encuentros son deterministas con la misma semilla', () => {
    const tabla = ZONAS.vega.encuentros!;
    const serie = (semilla: number) => {
      const p = nuevaPartida('X', semilla, INICIO);
      return Array.from({ length: 60 }, () => tirarEncuentro(p, tabla, DATOS)?.especie ?? null);
    };
    expect(serie(5)).toEqual(serie(5));
    const salen = serie(5).filter(Boolean).length;
    expect(salen).toBeGreaterThan(0);
    expect(salen).toBeLessThan(30);
  });

  it('un entrenador lleva siempre el mismo equipo', () => {
    const a = equipoEntrenador(ENTRENADORES.boabdil, DATOS);
    const b = equipoEntrenador(ENTRENADORES.boabdil, DATOS);
    expect(a).toEqual(b);
    expect(a.map((c) => c.especie)).toEqual(['barbo', 'galapago', 'leon_fuente']);
    expect(a.every((c) => c.valia === ENTRENADORES.boabdil.valia)).toBe(true);
  });

  it('vencer a un entrenador da su premio y lo marca; perder te devuelve al mesón y cuesta un 10 %', () => {
    const p = nuevaPartida('X', 1, INICIO);
    p.regreso = { zona: 'meson_santa_fe', x: 4, y: 3, dir: 'arriba' };
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 5, crearRng(1))];
    const { premio } = aplicarCombate(
      p,
      { resultado: 'victoria', equipo: p.equipo, objetos: {}, capturada: null, rivales: ['topillo'], entrenador: ENTRENADORES.ballestero_sancho },
      DATOS,
    );
    expect(premio).toBe(120);
    expect(p.dinero).toBe(420);
    expect(p.vencidos).toContain('ballestero_sancho');
    expect(p.vistos).toContain('topillo');

    const herido = { ...p.equipo[0], vida: 0 };
    const { perdido } = aplicarCombate(p, { resultado: 'derrota', equipo: [herido], objetos: {}, capturada: null, rivales: [] }, DATOS);
    expect(perdido).toBe(42);
    expect(p.dinero).toBe(378);
    expect(p.posicion.zona).toBe('meson_santa_fe');
    expect(p.equipo[0].vida).toBeGreaterThan(0);
  });
});

describe('guardado', () => {
  it('se guarda y se recupera igual', () => {
    const p = nuevaPartida('Guardada', 9, INICIO);
    p.equipo = [crearCriatura(DATOS, 'retono_drago', 5, crearRng(3))];
    p.banderas.inicial = true;
    expect(deserializar(serializar(p))).toEqual(p);
  });

  it('una partida antigua con la forma retirada del drago se pone al día', () => {
    const p = nuevaPartida('Antigua', 9, INICIO);
    const joven = crearCriatura(DATOS, 'retono_drago', 20, crearRng(3));
    const mayor = crearCriatura(DATOS, 'retono_drago', 30, crearRng(4));
    p.equipo = [{ ...joven, especie: 'drago', vida: 999 }];
    p.almacen = [{ ...mayor, especie: 'drago' }];
    p.vistos = ['retono_drago', 'drago'];
    p.capturados = ['drago'];
    ajustarADatos(p, DATOS, ESPECIES_RETIRADAS);
    expect(p.equipo[0].especie).toBe('retono_drago');
    expect(p.equipo[0].vida).toBe(vidaMaxima(p.equipo[0], DATOS));
    expect(p.almacen[0].especie).toBe('drago_milenario');
    expect(p.vistos).not.toContain('drago');
    expect(p.capturados.sort()).toEqual(['drago_milenario', 'retono_drago']);
  });

  it('rechaza textos que no son una partida', () => {
    expect(deserializar('no es json')).toBeNull();
    expect(deserializar('{"version":1}')).toBeNull();
    expect(deserializar('{"version":99,"nombre":"x"}')).toBeNull();
  });
});
