// Los mapas de las islas los generan los scripts de herramientas/ (isla1.py, isla2.py e isla3.py):
// lo que se edita a mano en src/data/islaN.ts se pierde al regenerar. Pasó con la poción de Famara
// (2026-11-26): se puso en el archivo generado y desapareció al cambiar los nombres de Lanzarote.
// Esta prueba regenera cada isla y exige que coincida con la del juego.
import { describe, expect, it } from 'vitest';

// Sin los tipos de Node en el proyecto (como en equilibrio.test.ts): lo justo, a mano.
interface Fs {
  mkdtempSync(prefijo: string): string;
  readFileSync(ruta: string | URL, cod: 'utf8'): string;
}
interface Hijos {
  execFileSync(orden: string, args: string[], op: { cwd: string; stdio: 'ignore' }): unknown;
}

describe('mapas generados', () => {
  for (const n of [1, 2, 3]) {
    it(`src/data/isla${n}.ts es lo que genera herramientas/isla${n}.py (no se edita a mano)`, async () => {
      const fs = (await import('node:fs' as string)) as Fs;
      const hijos = (await import('node:child_process' as string)) as Hijos;
      const { tmpdir } = (await import('node:os' as string)) as { tmpdir(): string };
      const raiz = new URL('..', import.meta.url).pathname;
      const salida = `${fs.mkdtempSync(`${tmpdir()}/isla-`)}/isla${n}.ts`;
      hijos.execFileSync('python3', [`${raiz}herramientas/isla${n}.py`, salida], { cwd: raiz, stdio: 'ignore' });
      const igual = fs.readFileSync(salida, 'utf8') === fs.readFileSync(new URL(`../src/data/isla${n}.ts`, import.meta.url), 'utf8');
      expect(igual, `isla${n}.ts difiere de su generador: el cambio va en herramientas/isla${n}.py`).toBe(true);
    });
  }
});
