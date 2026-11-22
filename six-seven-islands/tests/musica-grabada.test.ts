import { describe, expect, it } from 'vitest';
import { ISLA_1 } from '../src/data/isla1';
import { ISLA_2 } from '../src/data/isla2';
import { ISLA_3 } from '../src/data/isla3';
import { ZONAS_CON_MUSICA, agrupar, elegirPista, esCombateImportante, listaPara, semillaDe } from '../src/sistemas/sonido/musica-grabada';

describe('música grabada', () => {
  it('los líderes, la liga y los jefes tienen la música de los combates importantes', () => {
    expect(esCombateImportante('lider-gimnasio')).toBe(true);
    expect(esCombateImportante('lider-aire')).toBe(true);
    expect(esCombateImportante('jefe-faccion')).toBe(true);
    expect(esCombateImportante('aprendiz-roca-1')).toBe(false);
    expect(esCombateImportante(null)).toBe(false);
    expect(listaPara({ modo: 'combate', entrenador: 'lider-gimnasio' })).toBe('importante');
    expect(listaPara({ modo: 'combate', entrenador: 'pescador-famara' })).toBe('combate');
    expect(listaPara({ modo: 'combate', entrenador: null })).toBe('combate');
  });

  it('con el almendrado no cambia lo que suena', () => {
    expect(listaPara({ modo: 'combate', entrenador: null, soloEvolucion: true, zona: 'capital' })).toBe('igual');
  });

  it('las ciudades y los gimnasios tienen su música; el campo, la hecha con código', () => {
    expect(listaPara({ modo: 'explorar', entrenador: null, zona: 'capital' })).toBe('lugares');
    expect(listaPara({ modo: 'explorar', entrenador: null, zona: 'capital', dentro: 'casa-capital-1' })).toBe('lugares');
    expect(listaPara({ modo: 'explorar', entrenador: null, zona: 'fuego', dentro: 'gimnasio-roca' })).toBe('lugares');
    expect(listaPara({ modo: 'explorar', entrenador: null, zona: 'fuego' })).toBeNull();
  });

  it('las zonas con música existen (si se renombra una, se queda sin su canción)', () => {
    const zonas = new Set([...ISLA_1.zonas, ...ISLA_2.zonas, ...ISLA_3.zonas].map((z) => z.id));
    for (const z of ZONAS_CON_MUSICA) expect(zonas, z).toContain(z);
  });

  it('elige siempre la misma pista para la misma semilla y reparte entre todas', () => {
    const pistas = ['a.mp3', 'b.mp3', 'c.mp3'];
    expect(elegirPista(pistas, 4)).toBe(elegirPista(pistas, 4));
    expect(elegirPista([], 4)).toBeUndefined();
    const vistas = new Set(Array.from({ length: 30 }, (_, i) => elegirPista(pistas, i)));
    expect(vistas.size).toBe(3);
    expect(semillaDe('capital')).toBe(semillaDe('capital'));
  });

  it('reparte los archivos del build por su carpeta y no se inventa listas', () => {
    const listas = agrupar({
      '../../assets/musica/combate/b.mp3': '/b.mp3',
      '../../assets/musica/combate/a.mp3': '/a.mp3',
      '../../assets/musica/lugares/rap.mp3': '/rap.mp3',
      '../../assets/musica/otra/x.mp3': '/x.mp3',
    });
    expect(listas).toEqual({ combate: ['/a.mp3', '/b.mp3'], importante: [], lugares: ['/rap.mp3'] });
  });
});
