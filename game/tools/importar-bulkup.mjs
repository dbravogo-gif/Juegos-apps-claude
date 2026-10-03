// Trae las fichas de ejercicio de Bulk Up (técnica, errores, consejos...) a src/data/fichas.js.
//
//   node tools/importar-bulkup.mjs [ruta/a/Bulk-up/index.html]
//
// Bulk Up guarda su biblioteca dentro del propio index.html, como código. En vez de copiar
// a mano, se ejecuta solo el tramo que define los datos —sin DOM ni almacenamiento— y se
// vuelca el resultado. Si Bulk Up cambia sus fichas, basta con volver a lanzarlo.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origen = process.argv[2] ?? path.join(aqui, '../../Bulk-up-main/index.html');
const destino = path.join(aqui, '../src/data/fichas.js');

const html = fs.readFileSync(origen, 'utf8');
const INICIO = '/* ---------- Datos base (rutina) ---------- */';
const FIN = '/* ---------- Cronómetro inteligente de descanso';
const desde = html.indexOf(INICIO);
const hasta = html.indexOf(FIN);
if (desde < 0 || hasta < desde) {
  console.error('No encuentro el bloque de datos de Bulk Up: ¿ha cambiado su index.html?');
  process.exit(1);
}

const caja = {};
vm.runInNewContext(
  `${html.slice(desde, hasta)}
  ;salida = { ejercicios: Object.values(DEFAULT_EXERCISES).map(normalizeExercise), tipos: MOVEMENT_TYPES };`,
  caja,
);
const { ejercicios, tipos } = caja.salida;

const lista = (x) => (Array.isArray(x) ? x.map((s) => String(s).trim()).filter(Boolean) : []);
const conPunto = (s) => (/[.!?…:]$/.test(s) ? s : `${s}.`);

// Solo lo que sirve para el dorso de la tarjeta. Las series y repeticiones van aparte: son
// una sugerencia de Bulk Up, la rutina del jugador manda.
function ficha(e) {
  const codigos = lista(e.tipoMovimiento ?? (e.category ? [e.category] : []));
  return {
    id: e.id,
    nombre: e.nombre.trim(),
    grupo: lista(e.grupo),
    tipos: codigos.filter((c) => tipos[c]),
    objetivo: String(e.objetivo || e.descripcion || '').trim(),
    ejecucion: lista(e.ejecucion).map(conPunto),
    errores: lista(e.errores).map(conPunto),
    consejos: lista(e.consejos).map(conPunto),
    progresion: lista(e.progresion).map(conPunto),
    observaciones: lista(e.observaciones).map(conPunto),
    sugerencia: {
      series: e.series ?? null,
      repMin: e.repMin ?? null,
      repMax: e.repMax ?? null,
      unidad: e.unidad || 'reps',
      rirMin: e.rirMin ?? null,
      rirMax: e.rirMax ?? null,
      descansoSeg: e.descansoSeg ?? null,
    },
  };
}

const contenido = (f) => f.ejecucion.length + f.errores.length + f.consejos.length + f.progresion.length;
const clave = (nombre) => nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Bulk Up arrastra dos generaciones de rutina y algunos ejercicios están dos veces. Se queda
// la ficha más completa de cada nombre.
const porNombre = new Map();
for (const f of ejercicios.filter((e) => e.ficha !== false).map(ficha)) {
  if (!contenido(f)) continue;
  const previa = porNombre.get(clave(f.nombre));
  if (!previa || contenido(f) > contenido(previa)) porNombre.set(clave(f.nombre), f);
}

const fichas = [...porNombre.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const tiposUsados = Object.fromEntries(
  Object.entries(tipos)
    .filter(([codigo]) => fichas.some((f) => f.tipos.includes(codigo)))
    .map(([codigo, t]) => [codigo, { nombre: t.label, color: t.color, como: t.desc }]),
);

fs.writeFileSync(
  destino,
  `// Generado por tools/importar-bulkup.mjs a partir de Bulk Up. No editar a mano: se pisa.

/** Cómo se ejecuta cada tipo de movimiento. */
export const TIPOS_MOVIMIENTO = ${JSON.stringify(tiposUsados, null, 2)};

export const FICHAS = ${JSON.stringify(fichas, null, 2)};
`,
);
console.log(`${fichas.length} fichas (de ${ejercicios.length} ejercicios de Bulk Up) → ${path.relative(process.cwd(), destino)}`);
