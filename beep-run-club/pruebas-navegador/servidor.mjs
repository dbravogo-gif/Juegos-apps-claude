// Servidor estático mínimo para las pruebas de navegador: sirve la raíz del repositorio para que
// la app quede en /beep-run-club/, como en GitHub Pages.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

export function servir() {
  return new Promise((resolver) => {
    const srv = createServer(async (req, res) => {
      let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (ruta.endsWith('/')) ruta += 'index.html';
      const archivo = normalize(join(RAIZ, ruta));
      if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
      try {
        const datos = await readFile(archivo);
        res.writeHead(200, { 'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream' }).end(datos);
      } catch { res.writeHead(404).end('no existe'); }
    });
    srv.listen(0, '127.0.0.1', () => resolver({ url: `http://127.0.0.1:${srv.address().port}`, cerrar: () => srv.close() }));
  });
}
