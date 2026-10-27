import { describe, expect, it } from 'vitest';
import { CAPITULOS, ENTRENADORES, REGALOS_ATRASADOS, ZONAS } from '../src/data/mundo';
import { CAPITULO_MINIMO, OBJETOS } from '../src/data/objetos';
import { OBJETOS_RECIPIENTE } from '../src/data/recipientes';

/** Lo que se puede conseguir en una zona: escondido, en tinajas, regalado, vendido o ganado. */
function objetosDeZona(zona: string): string[] {
  const hallados: string[] = (OBJETOS_RECIPIENTE[zona] ?? []).map((o) => o.objeto);
  const recorrer = (v: unknown): void => {
    if (Array.isArray(v)) return v.forEach(recorrer);
    if (!v || typeof v !== 'object') return;
    for (const [clave, valor] of Object.entries(v)) {
      // Lo que pide una salida para entrar no se consigue allí.
      if (clave === 'requiere') continue;
      if (clave === 'objeto' && typeof valor === 'string') hallados.push(valor);
      else if (clave === 'productos' && Array.isArray(valor)) hallados.push(...valor);
      else if (clave === 'entrenador' && typeof valor === 'string') hallados.push(...Object.keys(ENTRENADORES[valor]?.objetos ?? {}));
      else recorrer(valor);
    }
  };
  recorrer(ZONAS[zona]);
  return hallados;
}

const capituloDeZona = (zona: string) => CAPITULOS.findIndex((c) => c.zonas.includes(zona)) + 1;

describe('Progresión de los objetos', () => {
  it('la tabla solo nombra objetos que existen', () => {
    for (const id of Object.keys(CAPITULO_MINIMO)) expect(OBJETOS[id], id).toBeDefined();
  });

  it('ningún objeto fuerte se consigue antes de su capítulo', () => {
    const errores: string[] = [];
    for (const zona of Object.keys(ZONAS)) {
      const capitulo = capituloDeZona(zona);
      for (const id of objetosDeZona(zona)) {
        if ((CAPITULO_MINIMO[id] ?? 1) > capitulo) errores.push(`${id} en ${zona} (capítulo ${capitulo}, mínimo ${CAPITULO_MINIMO[id]})`);
      }
    }
    // Los regalos atrasados llegan con una bandera: si es de un entrenador, cuenta su capítulo.
    for (const r of REGALOS_ATRASADOS) {
      const entrenador = r.si.startsWith('vencido:') ? r.si.slice('vencido:'.length) : null;
      const zona = entrenador ? Object.keys(ZONAS).find((z) => JSON.stringify(ZONAS[z]).includes(`"entrenador":"${entrenador}"`)) : undefined;
      const capitulo = zona ? capituloDeZona(zona) : 1;
      if ((CAPITULO_MINIMO[r.objeto] ?? 1) > capitulo) errores.push(`${r.objeto} como regalo atrasado (capítulo ${capitulo})`);
    }
    expect(errores).toEqual([]);
  });

  it('la prueba encuentra lo que hay en los mapas', () => {
    // Si el recorrido dejara de ver los objetos, la prueba anterior pasaría sin mirar nada.
    expect(objetosDeZona('vega')).toContain('mt_pisoton');
    expect(objetosDeZona('meson_santa_fe')).toContain('tesera');
    expect(objetosDeZona('patio_leones')).toContain('mt_noche_cerrada');
  });
});
