// La historia en Lanzarote, parte 1 (HISTORIA.md, decidida por el autor el 2026-11-15): los pueblos
// y su círculo, el bar con tu amigo (al que pones nombre) y su mensaje al salir del museo.
import { describe, expect, it } from 'vitest';
import { PUEBLOS, inicialDelRival, puebloQueTePersigue, type TipoInicial } from '../src/data/pueblos';
import { eficacia } from '../src/core/tipos';
import { TABLA_TIPOS } from '../src/data/tipos';
import { construirInterior, transitable, clave } from '../src/core/mundo';
import { LANZAROTE } from '../src/data/islas';
import { elegirDialogo } from '../src/core/guion';
import { AMIGOS } from '../src/data/textos-isla1';

const INICIALES = Object.keys(PUEBLOS) as TipoInicial[];

describe('historia: los pueblos', () => {
  it('tu rival lleva una inicial que te gana; la rama que te persigue es débil contra la tuya', () => {
    for (const x of INICIALES) {
      const rival = inicialDelRival(x);
      expect(rival).not.toBe(x);
      expect(eficacia(TABLA_TIPOS, rival, [x]), `${rival} contra ${x}`).toBe(2);
      expect(eficacia(TABLA_TIPOS, x, [puebloQueTePersigue(x)]), `${x} contra su perseguidor`).toBe(2);
    }
    // Cada pueblo es atacado por uno solo, y entre todos cierran un círculo.
    expect(new Set(INICIALES.map((x) => PUEBLOS[x].ataca)).size).toBe(5);
    expect(PUEBLOS.tierra.comandante).toBe('Kevin');
  });
});

describe('historia: el bar y tu amigo', () => {
  const bar = LANZAROTE.interiores.find((d) => d.id === 'bar')!;

  it('el bar existe, con el camarero y tu amigo, y a tu amigo se llega andando', () => {
    expect(bar).toBeDefined();
    expect(bar.personajes.map((p) => p.id).sort()).toEqual(['amigo', 'camarero']);
    const s = construirInterior(bar, { x: 0, y: 0 });
    const amigo = bar.personajes.find((p) => p.id === 'amigo')!;
    const vecinas = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [amigo.x + dx, amigo.y + dy]);
    expect(vecinas.some(([x, y]) => transitable(s, x, y))).toBe(true);
    expect(s.casillas.get(clave(amigo.x, amigo.y))?.c).toBe('m');
  });

  it('a tu amigo se le pone nombre, y antes y después de elegir dice cosas distintas', () => {
    expect(AMIGOS.has('amigo')).toBe(true);
    const antes = elegirDialogo(LANZAROTE.guion, 'amigo', [], null)!;
    const despues = elegirDialogo(LANZAROTE.guion, 'amigo', ['inicial-elegida'], 'agua')!;
    expect(antes.lineas[0].texto).toContain('{nombre}');
    expect(despues.lineas[0].texto).toContain('{inicialRival}');
    expect(antes.lineas.every((l) => l.quien === '{amigo}')).toBe(true);
  });

  it('al salir del museo te llega su mensaje, con su nombre y su inicial', () => {
    const m = elegirDialogo(LANZAROTE.guion, 'mensaje-rival', ['inicial-elegida'], 'roca')!;
    expect(m.lineas[0].quien).toContain('{amigo}');
    expect(m.lineas[0].texto).toContain('{inicialRival}');
    for (const l of m.lineas) expect(l.texto.length).toBeLessThanOrEqual(130);
  });
});

describe('historia: los soldados y la silueta de las Montañas del Fuego (parte 2)', () => {
  it('aparecen al elegir inicial, cortan el camino hasta verte y, tras su escena, se van', async () => {
    const { construirMundo, alcanzables, presente, enIsla, entrenadorQueVe, vision, deClave } = await import('../src/core/mundo');
    const { ISLA_1 } = await import('../src/data/isla1');
    const m = construirMundo(ISLA_1);
    const fuego = m.zonas.get('fuego')!;
    const ids = ['soldado-fuego-1', 'soldado-fuego-2', 'silueta-fuego'];
    const ps = fuego.personajes.filter((p) => ids.includes(p.id));
    expect(ps).toHaveLength(3);
    expect(ps.filter((p) => p.uniforme === 'perseguidor')).toHaveLength(2);
    expect(ps.find((p) => p.silueta)?.id).toBe('silueta-fuego');
    for (const p of ps) {
      expect(presente(p, [])).toBe(false);
      expect(presente(p, ['inicial-elegida'])).toBe(true);
      expect(presente(p, ['inicial-elegida', 'soldados-fuego'])).toBe(false);
    }
    // Mientras están, cortan el camino de verdad: al este de ellos no se llega sin pasar por su vista.
    const conInicial = new Set(['inicial-elegida'] as const);
    const ve = new Set(ps.flatMap((p) => vision(m, 'fuego', p, conInicial)));
    const desde = enIsla(m, 'fuego', 22, 12);
    const meta = enIsla(m, 'fuego', 35, 15);
    const sinVer = alcanzables(m, [desde], { condiciones: conInicial, prohibidas: ve, sinTemporales: false });
    expect(sinVer.has(meta)).toBe(false);
    // Y su vista salta la escena (sin combate: no son entrenadores).
    const [vx, vy] = deClave(enIsla(m, 'fuego', 27, 11));
    expect(ps.every((p) => !p.entrenador)).toBe(true);
    expect(entrenadorQueVe(m, vx, vy, [], ['inicial-elegida'])?.personaje).toBe('soldado-fuego-1');
    expect(entrenadorQueVe(m, vx, vy, [], ['inicial-elegida', 'soldados-fuego'])).toBeNull();
    // La escena cumple la condición que los quita.
    const d = elegirDialogo(LANZAROTE.guion, 'soldado-fuego-1', ['inicial-elegida'], 'agua')!;
    expect(d.efecto?.condicion).toBe('soldados-fuego');
    expect(d.lineas.some((l) => l.quien === 'Silueta')).toBe(true);
  });
});

describe('historia: el resto de Lanzarote (parte 3)', () => {
  it('los recados: quien los da existe, lo que piden existe y el premio también', async () => {
    const { RECADOS_ISLA1 } = await import('../src/data/recados-isla1');
    const { ISLA_1 } = await import('../src/data/isla1');
    const { ENTRENADORES_ISLA1 } = await import('../src/data/entrenadores-isla1');
    const { DATOS_COMBATE_PRUEBA: DATOS } = await import('../src/data/combate-prueba');
    const personajes = new Set(ISLA_1.zonas.flatMap((z) => z.personajes.map((p) => p.id)));
    expect(Object.keys(RECADOS_ISLA1).length).toBeGreaterThanOrEqual(2);
    for (const [quien, r] of Object.entries(RECADOS_ISLA1)) {
      expect(personajes.has(quien), quien).toBe(true);
      if (r.pide.especie) expect(DATOS.especies[r.pide.especie], r.id).toBeDefined();
      for (const id of r.pide.vencidos ?? []) expect(ENTRENADORES_ISLA1[id], id).toBeDefined();
      expect(DATOS.objetos[r.da.objeto], r.id).toBeDefined();
      // Premios modestos (autor, 2026-11-11: pocos objetos y flojos al principio).
      expect(r.da.cantidad).toBeLessThanOrEqual(3);
    }
  });

  it('un recado pasa de cerrado a pendiente, a cumplible y a hecho', async () => {
    const { puntoRecado } = await import('../src/core/recados');
    const { RECADOS_ISLA1 } = await import('../src/data/recados-isla1');
    const vid = RECADOS_ISLA1.anciano;
    expect(puntoRecado(vid, [], [], [])).toBe('cerrado');
    expect(puntoRecado(vid, ['anciano'], ['inicial-agua'], [])).toBe('pendiente');
    expect(puntoRecado(vid, ['anciano'], ['inicial-agua', 'c007-1'], [])).toBe('cumplible');
    expect(puntoRecado(vid, ['anciano', 'recado:vid-anciano'], [], [])).toBe('hecho');
    const red = RECADOS_ISLA1['redera-famara'];
    expect(puntoRecado(red, [], [], ['pescador-famara'])).toBe('pendiente');
    expect(puntoRecado(red, [], [], ['pescador-famara', 'pulpero-famara'])).toBe('cumplible');
  });

  it('tu amigo te espera en el muelle al vencer al gimnasio, con la inicial que gana a la tuya', async () => {
    const { ISLA_1 } = await import('../src/data/isla1');
    const { ENTRENADORES_ISLA1, quienEs } = await import('../src/data/entrenadores-isla1');
    const { ESPECIE_INICIAL, DATOS_COMBATE_PRUEBA: DATOS } = await import('../src/data/combate-prueba');
    const amigo = ISLA_1.zonas.find((z) => z.id === 'capital')!.personajes.find((p) => p.id === 'amigo-muelle')!;
    expect(amigo.con).toBe('gimnasio-vencido');
    expect(ENTRENADORES_ISLA1['amigo-muelle'].rival?.nivel).toBeGreaterThan(10);
    expect(quienEs('amigo-muelle')).toBe('{amigo}');
    for (const x of INICIALES) expect(DATOS.especies[ESPECIE_INICIAL[inicialDelRival(x)]], x).toBeDefined();
    expect(AMIGOS.get('amigo-muelle')).toBe(AMIGOS.get('amigo'));
  });
});

describe('historia: Fuerteventura (Chano, la estatua y el viejo)', () => {
  it('Chano te saluda al pasar por Corralejo, con ropa de tu color, y se va tras la estatua', async () => {
    const { construirMundo, vision, enIsla, presente } = await import('../src/core/mundo');
    const { ISLA_2 } = await import('../src/data/isla2');
    const m = construirMundo(ISLA_2);
    const z = m.zonas.get('corralejo')!;
    const chano = z.personajes.find((p) => p.id === 'chano-corralejo')!;
    expect(chano.uniforme).toBe('tuyo');
    expect(chano.escena).toBeDefined();
    // Su vista corta el camino a Las Dunas, de lado a lado (x 11 a 13).
    const ve = new Set(vision(m, 'corralejo', chano, ['inicial-elegida']));
    for (const x of [11, 12, 13]) expect(ve.has(enIsla(m, 'corralejo', x, chano.y)), `x ${x}`).toBe(true);
    expect(presente(chano, ['estatua-defendida'])).toBe(false);
    const dunas = m.zonas.get('dunas')!.personajes;
    expect(presente(dunas.find((p) => p.id === 'chano-dunas')!, ['estatua-defendida'])).toBe(true);
  });

  it('los soldados de la estatua: uno lucha con criaturas de su pueblo y, al vencerlo, se van todos', async () => {
    const { ISLA_2 } = await import('../src/data/isla2');
    const { FUERTEVENTURA } = await import('../src/data/islas');
    const { ESPECIE_RAMA } = await import('../src/data/pueblos');
    const { DATOS_COMBATE_PRUEBA: DATOS } = await import('../src/data/combate-prueba');
    const dunas = ISLA_2.zonas.find((z) => z.id === 'dunas')!.personajes;
    const soldados = dunas.filter((p) => p.id.startsWith('soldado-dunas'));
    expect(soldados).toHaveLength(2);
    for (const s of soldados) {
      expect(s.uniforme).toBe('perseguidor');
      expect(s.sin).toBe('estatua-defendida');
    }
    const def = FUERTEVENTURA.entrenadores['soldado-dunas-1'];
    expect(def.condicion).toBe('estatua-defendida');
    expect(def.rama?.niveles.length).toBeGreaterThan(0);
    for (const x of INICIALES) expect(DATOS.especies[ESPECIE_RAMA[x]], x).toBeDefined();
    // La arqueóloga, tras defender la estatua, cuenta lo del Sello.
    const d = elegirDialogo(FUERTEVENTURA.guion, 'arqueologa', ['estatua-defendida'], 'agua')!;
    expect(d.lineas.map((l) => l.texto).join(' ')).toContain('trece círculos');
  });
});

describe('historia: arreglos de la revisión del probador (2026-11-16)', () => {
  it('cada una de las cinco iniciales tiene su historia con el anciano (a la de Tierra le faltaba)', async () => {
    const { GUION_ISLA1 } = await import('../src/data/guion-isla1');
    for (const x of INICIALES) {
      const d = elegirDialogo(GUION_ISLA1, 'anciano', [], x)!;
      expect(d.lineas.map((l) => l.texto).join(' '), x).not.toContain('Las cinco leyendas eran orgullosas');
    }
  });

  it('la silueta ve la fila del medio: por ahí ya no se llega encajonado y sin escena', async () => {
    const { construirMundo, vision, enIsla } = await import('../src/core/mundo');
    const { ISLA_1 } = await import('../src/data/isla1');
    const m = construirMundo(ISLA_1);
    const silueta = m.zonas.get('fuego')!.personajes.find((p) => p.id === 'silueta-fuego')!;
    expect(silueta.escena).toBeDefined();
    expect(vision(m, 'fuego', silueta, ['inicial-elegida'])).toContain(enIsla(m, 'fuego', 29, 12));
  });

  it('tu amigo deja el bar al elegir inicial: no está a la vez en el bar y en el muelle', () => {
    const bar = LANZAROTE.interiores.find((d) => d.id === 'bar')!;
    expect(bar.personajes.find((p) => p.id === 'amigo')?.sin).toBe('inicial-elegida');
  });
});
