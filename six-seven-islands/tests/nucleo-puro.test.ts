// Barrera de la regla dura 4 de ARCHITECTURE.md: src/core es puro y determinista.
// Lee el código con import.meta.glob de Vite, sin depender de los tipos de Node.
import { describe, expect, it } from 'vitest';

const FUENTES = import.meta.glob('../src/core/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;
const RAIZ = '../src/core/';

/** Resuelve una ruta relativa respecto a la carpeta de un archivo, sin Node. */
function resolver(archivo: string, ruta: string): string {
  const partes = archivo.split('/').slice(0, -1);
  for (const trozo of ruta.split('/')) {
    if (trozo === '..') partes.pop();
    else if (trozo !== '.') partes.push(trozo);
  }
  return partes.join('/');
}

const PROHIBIDO: [RegExp, string][] = [
  [/Math\.random/, 'Math.random (usa el generador con semilla)'],
  [/\bDate\b|performance\.now|setTimeout|setInterval|requestAnimationFrame/, 'el reloj'],
  [/\bwindow\b|\bdocument\b|localStorage|navigator\./, 'el DOM'],
  [/from\s+['"]three/, 'Three.js'],
];

describe('núcleo puro', () => {
  const archivos = Object.keys(FUENTES);

  it('hay archivos que comprobar', () => {
    expect(archivos.length).toBeGreaterThan(0);
  });

  for (const archivo of archivos) {
    it(`${archivo.slice(RAIZ.length)} no usa reloj, azar, DOM ni Three.js, ni importa de fuera`, () => {
      // Se quitan los comentarios: pueden nombrar lo prohibido para explicarlo.
      const codigo = FUENTES[archivo].replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      for (const [patron, que] of PROHIBIDO) expect(codigo, `usa ${que}`).not.toMatch(patron);
      for (const [, ruta] of codigo.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        expect(ruta.startsWith('.'), `importa el paquete «${ruta}»`).toBe(true);
        expect(resolver(archivo, ruta).startsWith(RAIZ), `importa «${ruta}», fuera de src/core`).toBe(true);
      }
    });
  }
});
