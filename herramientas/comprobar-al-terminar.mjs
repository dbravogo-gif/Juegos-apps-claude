#!/usr/bin/env node
// Hook «Stop» de Claude Code (regla R2: hecho = comprobado).
//
// Cuando Claude va a terminar su turno, ejecuta `npm test` en cada proyecto que haya cambiado
// (sin confirmar, sin seguimiento o confirmado en la rama desde main) y que no se haya probado
// ya en verde con ese mismo contenido. Si alguna prueba falla, bloquea UNA vez (código 2) y le
// devuelve a Claude el final de la salida: debe arreglarlo o declarar «⚠️ Excepción R2».
// Si Claude ya está continuando por este aviso (stop_hook_active), deja terminar.
//
// Ante cualquier problema propio (git ausente, JSON roto…) no bloquea nunca: sale con 0.
// Silencioso cuando todo va bien. Se configura en .claude/settings.json.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let entrada = {};
try {
  entrada = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  entrada = {};
}
if (entrada.stop_hook_active) process.exit(0);

const git = (...args) =>
  execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });

// Rutas separadas por NUL (-z): sin comillas ni escapes, aunque lleven tildes o espacios.
const rutasZ = (salida) => salida.split('\0').filter(Boolean);

function proyectosConPruebas() {
  return readdirSync(raiz, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map((d) => d.name)
    .filter((nombre) => {
      try {
        return Boolean(JSON.parse(readFileSync(join(raiz, nombre, 'package.json'), 'utf8')).scripts?.test);
      } catch {
        return false;
      }
    });
}

function archivosCambiados() {
  const cambiados = new Set();
  // Sin confirmar y sin seguimiento. Formato -z: «XY ruta», y en renombrados la ruta antigua
  // va en la entrada siguiente; nos basta con quedarnos con cualquier ruta.
  for (const entrada of rutasZ(git('status', '--porcelain', '-z', '--untracked-files=all'))) {
    cambiados.add(entrada.length > 3 && entrada[2] === ' ' ? entrada.slice(3) : entrada);
  }
  // Confirmados en esta rama desde que se separó de main.
  try {
    const base = git('merge-base', 'HEAD', 'origin/main').trim();
    for (const ruta of rutasZ(git('diff', '--name-only', '-z', base, 'HEAD'))) cambiados.add(ruta);
  } catch {
    // Sin origin/main (clon parcial, otro remoto…): solo cuenta lo no confirmado.
  }
  return [...cambiados];
}

// Huella del contenido actual de un proyecto (archivos con seguimiento y sin seguimiento, sin
// los ignorados por git): si no cambia, no hace falta volver a probar.
function huella(proyecto) {
  const h = createHash('sha1');
  const archivos = rutasZ(git('ls-files', '-z', '-co', '--exclude-standard', '--', proyecto)).sort();
  for (const archivo of archivos) {
    h.update(archivo);
    try {
      h.update(readFileSync(join(raiz, archivo)));
    } catch {
      h.update('(borrado)');
    }
  }
  return h.digest('hex');
}

try {
  const proyectos = proyectosConPruebas();
  if (proyectos.length === 0) process.exit(0);

  const cambiados = archivosCambiados();
  const tocados = proyectos.filter((p) => cambiados.some((ruta) => ruta.startsWith(p + '/')));
  if (tocados.length === 0) process.exit(0);

  const rutaCache = join(raiz, '.claude', 'cache', 'pruebas-verdes.json');
  let verdes = {};
  try {
    verdes = JSON.parse(readFileSync(rutaCache, 'utf8'));
  } catch {
    verdes = {};
  }

  const fallos = [];
  for (const proyecto of tocados) {
    const carpeta = join(raiz, proyecto);
    const pkg = JSON.parse(readFileSync(join(carpeta, 'package.json'), 'utf8'));
    const tieneDependencias = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length > 0;
    // Sin dependencias instaladas no se puede probar aquí: no se bloquea por eso.
    if (tieneDependencias && !existsSync(join(carpeta, 'node_modules'))) continue;

    const actual = huella(proyecto);
    if (verdes[proyecto] === actual) continue;

    const r = spawnSync('npm', ['test', '--silent'], { cwd: carpeta, encoding: 'utf8', timeout: 300_000 });
    if (r.status === 0) {
      verdes[proyecto] = actual;
    } else {
      const salida = `${r.stdout || ''}\n${r.stderr || ''}`.trim().split('\n').slice(-25).join('\n');
      fallos.push({ proyecto, salida: salida || `(npm test terminó con código ${r.status ?? 'desconocido'})` });
    }
  }

  mkdirSync(join(raiz, '.claude', 'cache'), { recursive: true });
  writeFileSync(rutaCache, JSON.stringify(verdes, null, 2));

  if (fallos.length > 0) {
    const detalle = fallos.map((f) => `── ${f.proyecto}: npm test en rojo ──\n${f.salida}`).join('\n\n');
    process.stderr.write(
      `${detalle}\n\nRegla R2: arréglalo antes de terminar o, si no puedes ahora, declara ` +
        `«⚠️ Excepción R2» en tu mensaje explicando por qué. Este aviso solo bloquea una vez.\n`,
    );
    process.exit(2);
  }
} catch {
  process.exit(0);
}
