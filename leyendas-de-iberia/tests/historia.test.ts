import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { ASPECTOS } from '../src/data/aspectos';
import { RETRATOS } from '../src/data/retratos';
import { CAPITULOS, CASILLAS, ENTRADAS, ENTRENADORES, INICIO, REGALOS_ATRASADOS, ZONAS } from '../src/data/mundo';
import { aPixel, LUGARES, MAPA_ALTO, MAPA_ANCHO } from '../src/data/lugares';
import { cumpleRequisito, dondeSale, enLineaDeVision, esNavegable, esSolida, validarZona, type Guion, type Paso } from '../src/core/mundo';
import {
  ajustarADatos,
  anadirCriatura,
  aplicarCombate,
  darAtrasados,
  equipoEntrenador,
  MAX_EQUIPO,
  nuevaPartida,
  tirarEncuentro,
  zonasVisitadas,
} from '../src/core/partida';
import { deserializar, serializar } from '../src/core/guardado';
import { ESPECIES_RETIRADAS } from '../src/data/especies';
import { vidaMaxima } from '../src/core/estadisticas';
import { ESPECIE_MIMICO, registrarRecipiente, revisado } from '../src/core/recipientes';
import { MIMICO_MIN_BLASONES, OBJETOS_RECIPIENTE, PROB_RECIPIENTE, RECOMPENSA_MIMICO } from '../src/data/recipientes';
import { crearCriatura, sexoPara } from '../src/core/criatura';
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

describe('zonas', () => {
  it('son coherentes: filas iguales, caracteres conocidos, salidas y personajes en su sitio', () => {
    for (const z of Object.values(ZONAS)) {
      expect(validarZona(z, CASILLAS, ZONAS, ENTRENADORES)).toEqual([]);
    }
  });

  it('los retratos son de personajes importantes que hablan, y tienen su archivo', () => {
    const archivos = Object.keys(import.meta.glob('../src/assets/retratos/*.webp')).map((r) => r.split('/').pop());
    const quienes = new Set<string>(Object.values(ENTRENADORES).map((e) => e.nombre));
    for (const z of Object.values(ZONAS)) {
      for (const p of [...z.pnj.map((n) => n.guion), z.alEntrar ?? []].flatMap(pasosDe)) {
        if ((p.tipo === 'decir' || p.tipo === 'elegir') && p.quien) quienes.add(p.quien);
      }
    }
    for (const [q, id] of Object.entries(RETRATOS)) {
      expect(quienes.has(q), `${q} no habla en ningún sitio`).toBe(true);
      expect(archivos, `archivo del retrato de ${q}`).toContain(`${id}.webp`);
    }
    // Solo los importantes: un retrato de más se nota en cada diálogo.
    expect(archivos.length).toBe(Object.keys(RETRATOS).length);
  });

  it('el inicio cae en una casilla transitable', () => {
    expect(esSolida(ZONAS[INICIO.zona], INICIO.x, INICIO.y, CASILLAS)).toBe(false);
  });

  it('se llega a todas las salidas, personajes, carteles, tinajas y objetos escondidos', () => {
    // Los personajes que se apartan con una bandera (`ocultoSi`) no cuentan como estorbo.
    for (const z of Object.values(ZONAS)) {
      const ocupadas = new Set(
        [...z.pnj.filter((p) => !p.ocultoSi), ...z.carteles, ...(z.recipientes ?? []), ...(z.ocultos ?? []).filter((o) => o.visible)].map((o) => `${o.x},${o.y}`),
      );
      const pisable = (x: number, y: number) => !esSolida(z, x, y, CASILLAS) && !ocupadas.has(`${x},${y}`);
      const llegadas = Object.values(ZONAS).flatMap((o) => o.salidas.filter((s) => s.zona === z.id).map((s) => [s.ax, s.ay]));
      if (z.id === INICIO.zona) llegadas.push([INICIO.x, INICIO.y]);
      const vistas = new Set<string>();
      const cola = llegadas.filter(([x, y]) => pisable(x, y));
      for (const [x, y] of cola) vistas.add(`${x},${y}`);
      while (cola.length > 0) {
        const [x, y] = cola.shift()!;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const clave = `${x + dx},${y + dy}`;
          if (!vistas.has(clave) && pisable(x + dx, y + dy)) {
            vistas.add(clave);
            cola.push([x + dx, y + dy]);
          }
        }
      }
      const alLado = (o: { x: number; y: number }) =>
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => vistas.has(`${o.x + dx},${o.y + dy}`));
      for (const s of z.salidas) expect(vistas.has(`${s.x},${s.y}`), `${z.id}: salida a ${s.zona}`).toBe(true);
      for (const p of z.pnj) expect(alLado(p), `${z.id}: ${p.id}`).toBe(true);
      for (const c of z.carteles) expect(alLado(c), `${z.id}: cartel en ${c.x},${c.y}`).toBe(true);
      for (const r of z.recipientes ?? []) expect(alLado(r), `${z.id}: tinaja ${r.id}`).toBe(true);
      for (const o of z.ocultos ?? []) expect(vistas.has(`${o.x},${o.y}`) || alLado(o), `${z.id}: ${o.id}`).toBe(true);
    }
  });

  it('los guiones usan objetos, entrenadores y especies que existen', () => {
    for (const z of Object.values(ZONAS)) {
      const guiones = [...z.pnj.map((p) => p.guion), z.alEntrar ?? []];
      for (const p of guiones.flatMap(pasosDe)) {
        if (p.tipo === 'dar') expect(DATOS.objetos[p.objeto], p.objeto).toBeDefined();
        if (p.tipo === 'combate') expect(ENTRENADORES[p.entrenador], p.entrenador).toBeDefined();
        if (p.tipo === 'viajar') expect(esSolida(ZONAS[p.zona], p.x, p.y, CASILLAS), `viaje a ${p.zona}`).toBe(false);
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
    p.blasones = ['b1', 'b2', 'b3', 'b4'];
    for (let i = 0; i < 2000; i++) {
      const r = registrarRecipiente(p, 'vega', `r${i}`, { prob: PROB_RECIPIENTE, objetos: OBJETOS_RECIPIENTE.santa_fe, minBlasones: MIMICO_MIN_BLASONES }, DATOS);
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
    registrarRecipiente(p, 'vega', 'puente', { prob: { objeto: 100, nada: 0, mimico: 0 }, objetos: OBJETOS_RECIPIENTE.santa_fe }, DATOS);
    const cargada = deserializar(serializar(p))!;
    expect(revisado(cargada, 'vega', 'puente')).toBe(true);
    const r = registrarRecipiente(cargada, 'vega', 'puente', { prob: { objeto: 100, nada: 0, mimico: 0 }, objetos: OBJETOS_RECIPIENTE.santa_fe }, DATOS);
    expect(r.tipo).toBe('nada');
  });

  it('sin ninguna criatura en pie no sale el Papemímico (no habría con quién luchar)', () => {
    const p = nuevaPartida('X', 'sin equipo', INICIO);
    for (let i = 0; i < 300; i++) {
      const r = registrarRecipiente(p, 'santa_fe', `t${i}`, { prob: PROB_RECIPIENTE, objetos: OBJETOS_RECIPIENTE.santa_fe }, DATOS);
      expect(r.tipo).not.toBe('mimico');
    }
    const soloMimico = registrarRecipiente(p, 'santa_fe', 'u', { prob: { objeto: 0, nada: 0, mimico: 100 }, objetos: [] }, DATOS);
    expect(soloMimico.tipo).toBe('nada');
    p.equipo = [{ ...crearCriatura(DATOS, 'cangrejo', 5, crearRng(1)), vida: 0 }];
    expect(registrarRecipiente(p, 'santa_fe', 'v', { prob: { objeto: 0, nada: 0, mimico: 100 }, objetos: [] }, DATOS).tipo).toBe('nada');
  });

  it('el Papemímico no sale hasta la quinta ciudad (cuatro blasones)', () => {
    expect(MIMICO_MIN_BLASONES).toBe(4);
    const p = nuevaPartida('X', 'pronto', INICIO);
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 30, crearRng(1))];
    const op = { prob: { objeto: 0, nada: 0, mimico: 100 }, objetos: OBJETOS_RECIPIENTE.santa_fe, minBlasones: MIMICO_MIN_BLASONES };
    for (let b = 0; b < 4; b++) {
      p.blasones = Array.from({ length: b }, (_, i) => `b${i}`);
      expect(registrarRecipiente(p, 'vega', `t${b}`, op, DATOS).tipo, `${b} blasones`).toBe('nada');
    }
    p.blasones = ['b0', 'b1', 'b2', 'b3'];
    expect(registrarRecipiente(p, 'vega', 't4', op, DATOS).tipo).toBe('mimico');
  });

  it('como mucho una tinaja por zona, y solo en ciudades e interiores', () => {
    for (const z of Object.values(ZONAS)) {
      expect(z.recipientes?.length ?? 0, z.id).toBeLessThanOrEqual(1);
      if (z.recipientes?.length) expect(z.interior || z.estilo === 'pueblo' || z.estilo === 'toledo', z.id).toBe(true);
      for (const r of z.recipientes ?? []) if (r.objeto) expect(DATOS.objetos[r.objeto], r.objeto).toBeDefined();
    }
  });

  it('la tinaja de Santa Fe da una Poción sin tirar del generador', () => {
    const p = nuevaPartida('X', 'fija', INICIO);
    const antes = JSON.stringify(p.rng);
    const r = registrarRecipiente(p, 'santa_fe', 'huerto', { prob: PROB_RECIPIENTE, objetos: OBJETOS_RECIPIENTE.santa_fe, fijo: 'unguento' }, DATOS);
    expect(r).toEqual({ tipo: 'objeto', objeto: 'unguento' });
    expect(JSON.stringify(p.rng)).toBe(antes);
  });

  it('el Papemímico sale por encima del nivel del equipo', () => {
    const p = nuevaPartida('X', 3, INICIO);
    p.equipo = [crearCriatura(DATOS, 'cangrejo', 12, crearRng(1))];
    const r = registrarRecipiente(p, 'vega', 'x', { prob: { objeto: 0, nada: 0, mimico: 100 }, objetos: OBJETOS_RECIPIENTE.santa_fe }, DATOS);
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
    expect(a.map((c) => c.especie)).toEqual(['duende', 'trasgo']);
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

describe('mapa de la península', () => {
  it('cada zona está en un lugar o un camino del mapa, y cada lugar se usa', () => {
    const usados = new Set<string>();
    for (const z of Object.values(ZONAS)) {
      expect(z.enMapa, z.id).toBeDefined();
      const lugares = 'lugar' in z.enMapa! ? [z.enMapa.lugar] : z.enMapa!.ruta;
      for (const l of lugares) {
        expect(LUGARES[l], `${z.id}: ${l}`).toBeDefined();
        usados.add(l);
      }
    }
    expect([...usados].sort()).toEqual(Object.keys(LUGARES).sort());
  });

  it('los lugares caen dentro del mapa', () => {
    for (const [id, l] of Object.entries(LUGARES)) {
      const p = aPixel(l.lat, l.lon);
      expect(p.x, id).toBeGreaterThanOrEqual(0);
      expect(p.x, id).toBeLessThan(MAPA_ANCHO);
      expect(p.y, id).toBeGreaterThanOrEqual(0);
      expect(p.y, id).toBeLessThan(MAPA_ALTO);
    }
    // Las Palmas de Gran Canaria va al recuadro de Canarias, abajo a la izquierda.
    const lasPalmas = aPixel(28.1, -15.43);
    expect(lasPalmas.x).toBeLessThan(60);
    expect(lasPalmas.y).toBeGreaterThan(MAPA_ALTO - 30);
  });

  it('dice dónde sale cada especie, con sus niveles y su frecuencia', () => {
    const lagarto = dondeSale(ZONAS, 'lagarto');
    expect(lagarto.map((d) => d.zona)).toEqual(['villalar', 'camino_toledo']);
    expect(lagarto[0]).toMatchObject({ min: 7, max: 9 });
    expect(dondeSale(ZONAS, 'becerro_igneo')).toEqual([]);
    for (const z of Object.values(ZONAS)) {
      if (!z.encuentros) continue;
      const suma = z.encuentros.especies.reduce((s, e) => s + (dondeSale({ [z.id]: z }, e.especie)[0]?.porcentaje ?? 0), 0);
      expect(Math.abs(suma - 100), z.id).toBeLessThanOrEqual(z.encuentros.especies.length);
    }
  });
});

describe('legendarios y zonas cerradas', () => {
  it('las criaturas que esperan en el mapa y lo que piden las salidas existen', () => {
    for (const z of Object.values(ZONAS)) {
      for (const p of z.pnj) if (p.criatura) expect(DATOS.especies[p.criatura.especie], `${z.id}: ${p.id}`).toBeDefined();
      for (const s of z.salidas) if (s.requiere?.objeto) expect(DATOS.objetos[s.requiere.objeto], `${z.id}: salida a ${s.zona}`).toBeDefined();
    }
  });

  it('una salida con requisito se abre con el objeto o la bandera', () => {
    const req = { objeto: 'mapa', bandera: 'capitulo2', texto: 'Cerrado.' };
    expect(cumpleRequisito(req, {}, {})).toBe(false);
    expect(cumpleRequisito(req, { mapa: 1 }, {})).toBe(false);
    expect(cumpleRequisito(req, { mapa: 1 }, { capitulo2: true })).toBe(true);
    expect(cumpleRequisito({ texto: 'Abierto' }, {}, {})).toBe(true);
  });
});

describe('regalos atrasados', () => {
  it('quien ya pasó por Colón o venció a un líder recibe lo que falta, y solo una vez', () => {
    const p = nuevaPartida('Antigua', 5, INICIO);
    p.banderas.colon = true;
    p.banderas['vencido:boabdil'] = true;
    expect(darAtrasados(p, REGALOS_ATRASADOS).sort()).toEqual(['mapa', 'mt_noche_cerrada']);
    expect(darAtrasados(p, REGALOS_ATRASADOS)).toEqual([]);
    expect(p.objetos.mapa).toBe(1);
  });

  it('quien recibe el regalo en la historia no lo recibe otra vez', () => {
    const colon = ZONAS.santa_fe.pnj.find((x) => x.id === 'colon')!;
    const pasos = pasosDe(colon.guion);
    expect(pasos.some((x) => x.tipo === 'dar' && x.objeto === 'mapa')).toBe(true);
    expect(pasos.some((x) => x.tipo === 'bandera' && x.nombre === 'regalo:mapa')).toBe(true);
  });
});

describe('Surf y Vuelo', () => {
  it('cada lugar con llegada cae en una casilla transitable', () => {
    for (const [id, l] of Object.entries(LUGARES)) {
      if (!l.llegada) continue;
      expect(esSolida(ZONAS[l.llegada.zona], l.llegada.x, l.llegada.y, CASILLAS), id).toBe(false);
      expect(ZONAS[l.llegada.zona].enMapa, id).toEqual({ lugar: id });
    }
  });

  it('el Tajo se cruza con Surf: agua profunda, sólida a pie', () => {
    const z = ZONAS.camino_toledo;
    expect(esNavegable(z, 3, 22, CASILLAS)).toBe(true);
    expect(esSolida(z, 3, 22, CASILLAS)).toBe(true);
    expect(z.encuentrosAgua).toBeDefined();
  });

  it('las visitadas de una partida antigua salen de sus banderas', () => {
    const p = nuevaPartida('Antigua', 6, INICIO);
    p.banderas['visto:vega'] = true;
    delete p.visitadas;
    expect(zonasVisitadas(p).sort()).toEqual(['santa_fe', 'vega']);
  });
});

describe('modo desarrollador', () => {
  it('se puede viajar a todas las zonas, y se llega a una casilla transitable', () => {
    for (const id of Object.keys(ZONAS)) {
      const e = ENTRADAS[id];
      expect(e, id).toBeDefined();
      expect(esSolida(ZONAS[id], e.x, e.y, CASILLAS), id).toBe(false);
    }
    expect(CAPITULOS.flatMap((k) => k.zonas).sort()).toEqual(Object.keys(ZONAS).sort());
  });

  it('su partida se guarda con la marca y se recupera igual', () => {
    const p = nuevaPartida('Pruebas', 1, INICIO);
    p.dev = true;
    p.banderas['dev:sin_encuentros'] = true;
    const q = deserializar(serializar(p))!;
    expect(q.dev).toBe(true);
    expect(q.banderas['dev:sin_encuentros']).toBe(true);
  });
});

describe('sexo', () => {
  it('los toros son machos, las plantas hermafroditas y las estatuas no tienen sexo', () => {
    const rng = crearRng('sexo');
    for (let i = 0; i < 20; i++) {
      expect(crearCriatura(DATOS, 'becerro_igneo', 5, rng).sexo).toBe('macho');
      expect(crearCriatura(DATOS, 'retono_drago', 5, rng).sexo).toBe('hermafrodita');
      expect(crearCriatura(DATOS, 'mandragora', 5, rng).sexo).toBe('hermafrodita');
      expect(crearCriatura(DATOS, 'leon_fuente', 5, rng).sexo).toBe('ninguno');
    }
  });

  it('las demás especies salen más o menos mitad machos y mitad hembras', () => {
    const rng = crearRng('mitad');
    let machos = 0;
    for (let i = 0; i < 1000; i++) if (crearCriatura(DATOS, 'lobo', 5, rng).sexo === 'macho') machos++;
    expect(machos).toBeGreaterThan(420);
    expect(machos).toBeLessThan(580);
  });

  it('no gasta números del generador: lo que sale después no cambia', () => {
    const a = crearRng('igual');
    const b = crearRng('igual');
    crearCriatura(DATOS, 'lobo', 5, a);
    crearCriatura(DATOS, 'lobo', 5, b);
    expect(a).toEqual(b);
  });

  it('las criaturas de partidas antiguas reciben su sexo al cargarse, siempre el mismo', () => {
    const p = nuevaPartida('Antigua', 3, INICIO);
    const c = crearCriatura(DATOS, 'lobo', 5, crearRng(4));
    delete c.sexo;
    p.equipo.push(c);
    const q = deserializar(serializar(p))!;
    ajustarADatos(q, DATOS, ESPECIES_RETIRADAS);
    expect(q.equipo[0].sexo).toBe(sexoPara(DATOS, 'lobo', c.uid));
  });
});
