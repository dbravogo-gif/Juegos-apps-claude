// Partida de prueba: un programa juega el modo historia (sin modo desarrollador) de principio
// a fin, como un jugador, y apunta los problemas que encuentra: derrotas, sitios donde se
// atasca, textos rotos y errores de la página.
//
// Uso, con el juego servido (`npm run build && npm run preview`):
//   npx tsx herramientas/partida-de-prueba.mts
// Variables:
//   URL        dirección del juego (http://localhost:4173/).
//   SALIDA     carpeta del registro, las capturas y la partida (dev/partida-de-prueba).
//   INICIAL    nombre de la compañera inicial (Ignibue).
//   HASTA      cuántos objetivos del plan cumplir (todos).
//   REANUDAR=1 sigue la última partida guardada; DESDE=n salta los objetivos anteriores al n.
// Necesita Playwright con Chromium. Cada capítulo nuevo añade sus objetivos a PLAN_COMPLETO.
import { createRequire } from 'module';
import * as fs from 'fs';
const require = createRequire(import.meta.url);
const cargarPlaywright = () => {
  try {
    return require('playwright');
  } catch {
    return require('/opt/node22/lib/node_modules/playwright');
  }
};
const { chromium } = cargarPlaywright();
const R = new URL('../src', import.meta.url).pathname;
const { ZONAS, CASILLAS, ENTRENADORES } = await import(`${R}/data/mundo.ts`);
const { DATOS } = await import(`${R}/data/index.ts`);
const { esSolida, deslizamiento, DELTA, banderaPalanca } = await import(`${R}/core/mundo.ts`);
const { eficacia } = await import(`${R}/core/tipos.ts`);
const { calcularEstadisticas } = await import(`${R}/core/estadisticas.ts`);

const SALIDA = process.env.SALIDA ?? new URL('../dev/partida-de-prueba', import.meta.url).pathname;
const URL_JUEGO = process.env.URL ?? 'http://localhost:4173/';
const CAP = `${SALIDA}/capturas`;
fs.mkdirSync(CAP, { recursive: true });
const LOG = `${SALIDA}/registro.txt`;
// REANUDAR=1 sigue la partida guardada en partida.json (la deja el bot tras cada objetivo).
const REANUDAR = process.env.REANUDAR === '1';
const PARTIDA = `${SALIDA}/partida.json`;
if (!REANUDAR) fs.writeFileSync(LOG, '');
const t0 = Date.now();
function log(...a: unknown[]): void {
  const linea = `[${((Date.now() - t0) / 1000).toFixed(0)}s] ${a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}`;
  console.log(linea);
  fs.appendFileSync(LOG, linea + '\n');
}
const problemas: string[] = [];
function problema(texto: string): void {
  if (problemas.includes(texto)) return;
  problemas.push(texto);
  log('PROBLEMA:', texto);
}

const INICIAL = process.env.INICIAL ?? 'Ignibue';
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await page.addInitScript('window.__name = (f) => f;');
page.on('pageerror', (e: Error) => problema(`Error de la página: ${String(e).slice(0, 200)}`));
page.on('console', (m: { type: () => string; text: () => string }) => {
  if (m.type() === 'error' && !m.text().includes('net::')) problema(`Error en consola: ${m.text().slice(0, 200)}`);
});
const espera = (ms: number) => page.waitForTimeout(ms);
let nFoto = 0;
const foto = (n: string) => page.screenshot({ path: `${CAP}/${String(++nFoto).padStart(3, '0')}_${n}.png` });

// ---------------------------------------------------------------- estado de la página

interface Estado {
  escena: 'titulo' | 'nombre' | 'mundo' | 'combate' | 'otra';
  zona?: string;
  pos?: { x: number; y: number; dir: string };
  banderas: Record<string, boolean>;
  vencidos: string[];
  quieto: boolean;
  dialogo: boolean;
  texto: string;
  quien: string;
  eleccion: string[] | null;
  menu: string | null;
  personas: { id: string; x: number; y: number }[];
  zurrones: string[];
  equipo: any[];
  objetos: Record<string, number>;
  dinero: number;
}

async function estado(): Promise<Estado> {
  return page.evaluate(() => {
    const w = window as any;
    const j = w.juego;
    for (const k of ['Mundo', 'Interfaz', 'Combate', 'Titulo']) {
      const s = j.scene.getScene(k);
      if (s?.time) s.time.timeScale = 10;
      if (s?.tweens) s.tweens.timeScale = 10;
    }
    const m = j.scene.getScene('Mundo');
    const ui = j.scene.getScene('Interfaz');
    let P: any;
    try {
      P = m?.p;
    } catch {
      P = undefined;
    }
    const textos = (c: any): string[] => {
      const out: string[] = [];
      const rec = (l: any[]) => l.forEach((o) => { if (o.type === 'Text' && o.visible) out.push(o.text); if (o.list) rec(o.list); });
      if (c) rec(c.list);
      return out;
    };
    const escena = document.getElementById('nombre-jugador') ? 'nombre' : j.scene.isActive('Combate') ? 'combate' : j.scene.isActive('Mundo') && P ? 'mundo' : j.scene.isActive('Titulo') ? 'titulo' : 'otra';
    return {
      escena,
      zona: m?.zona?.id,
      pos: P?.posicion,
      banderas: P?.banderas ?? {},
      vencidos: P?.vencidos ?? [],
      visitadas: P?.visitadas ?? [],
      quieto: Boolean(m && m.listo && !m.moviendo && !m.resbalando && !m.ocupado),
      dialogo: Boolean(ui?.alAvanzar),
      texto: ui?.textoDialogo?.visible !== false && ui?.capaDialogo?.visible ? ui.textoDialogo.text : '',
      quien: ui?.nombreDialogo?.text ?? '',
      eleccion: ui?.capaEleccion ? textos(ui.capaEleccion) : null,
      menu: ui?.capaMenu ? textos(ui.capaMenu).slice(0, 3).join(' | ') : null,
      personas: (m?.personas ?? []).map((pe: any) => ({ id: pe.pnj.id, x: pe.x, y: pe.y })),
      zurrones: m ? [...m.zurrones.keys()] : [],
      equipo: P?.equipo ?? [],
      objetos: P?.objetos ?? {},
      dinero: P?.dinero ?? 0,
    } as any;
  });
}

const maxVida = (c: any) => calcularEstadisticas(c, DATOS).vida;
const nombreEsp = (id: string) => DATOS.especies[id]?.nombre ?? id;
const resumenEquipo = (eq: any[]) => eq.map((c) => `${nombreEsp(c.especie)} ${c.nivel} (${c.vida}/${maxVida(c)})`).join(', ');

// ---------------------------------------------------------------- textos raros

const vistos = new Set<string>();
function revisarTexto(t: string, donde: string): void {
  if (!t || vistos.has(t)) return;
  vistos.add(t);
  if (/undefined|NaN|\{[a-zA-Z]+\}|\[object/.test(t)) problema(`Texto roto en ${donde}: «${t.slice(0, 120)}»`);
}

// ---------------------------------------------------------------- respuestas

const RESPUESTAS: [RegExp, string][] = [
  [/Alhambra.*árabe/i, 'La roja'],
  [/río corre/i, 'El Darro'],
  [/leones/i, 'Doce'],
];
let quiereCurar = false;

async function responder(e: Estado): Promise<void> {
  const ops = e.eleccion!;
  const pregunta = e.texto;
  revisarTexto(pregunta, 'una elección');
  let i = 0;
  const conocida = RESPUESTAS.find(([re]) => re.test(pregunta));
  if (conocida) i = Math.max(0, ops.indexOf(conocida[1]));
  else if (ops.includes('Sí, por favor')) i = quiereCurar ? ops.indexOf('Sí, por favor') : ops.length - 1;
  else if (ops.includes('Sí, en marcha')) i = ops.indexOf('Sí, en marcha');
  else if (ops.includes('Sí')) i = ops.indexOf('Sí');
  else if (ops.includes('Nada')) i = ops.indexOf('Nada');
  log('elige', `«${pregunta.slice(0, 70)}»`, '→', ops[i]);
  for (let k = 0; k < i; k++) {
    await page.keyboard.press('ArrowDown');
    await espera(40);
  }
  await page.keyboard.press('Enter');
  await espera(120);
}

// ---------------------------------------------------------------- combate

let combates = 0;
let derrotas = 0;
let ultimoRival = '';

async function turnoCombate(): Promise<void> {
  const info = await page.evaluate(() => {
    const c = (window as any).juego.scene.getScene('Combate');
    const botones: { texto: string; activo: boolean }[] = [];
    const rec = (l: any[]) =>
      l.forEach((o) => {
        if (o.etiqueta && o.fondo && typeof o.alPulsar === 'function') botones.push({ texto: o.etiqueta.text, activo: o.activo });
        if (o.list) rec(o.list);
      });
    if (c.menu) rec(c.menu.list);
    return { estado: c.estado, botones, texto: c.texto?.text ?? '', ocupado: c.ocupado, saltar: Boolean(c.saltar) };
  });
  revisarTexto(info.texto, 'el combate');
  const pulsar = async (texto: string) =>
    page.evaluate((t: string) => {
      const c = (window as any).juego.scene.getScene('Combate');
      let hecho = false;
      const rec = (l: any[]) =>
        l.forEach((o) => {
          if (!hecho && o.etiqueta && o.fondo && o.etiqueta.text === t && o.activo) {
            hecho = true;
            o.alPulsar();
          }
          if (o.list) rec(o.list);
        });
      if (c.menu) rec(c.menu.list);
      return hecho;
    }, texto);
  const b = info.botones;
  if (b.length === 0) {
    // Texto en curso: se adelanta.
    await page.evaluate(() => (window as any).juego.scene.getScene('Combate').saltar?.());
    await espera(60);
    return;
  }
  const est = info.estado;
  if (b.some((x) => x.texto === 'Continuar')) {
    const fin = est.fin;
    log('fin de combate:', fin, '·', resumenEquipo(est.jugador.equipo));
    if (fin === 'derrota') {
      derrotas++;
      problema(`Derrota contra ${ultimoRival} con ${resumenEquipo(est.jugador.equipo)}`);
    }
    combates++;
    await pulsar('Continuar');
    await espera(300);
    return;
  }
  if (info.texto.includes('quiere aprender')) {
    const m = info.texto.match(/aprender (.+)\. ¿Qué/);
    const nuevo = Object.values(DATOS.movimientos).find((x: any) => x.nombre === m?.[1]) as any;
    const yo = est.jugador.equipo.find((c: any) => info.texto.startsWith(nombreEsp(c.especie))) ?? est.jugador.equipo[est.jugador.activo];
    const poderes = yo.movimientos.map((x: any) => (DATOS.movimientos[x.id].categoria === 'estado' ? 0 : DATOS.movimientos[x.id].poder));
    const peor = poderes.indexOf(Math.min(...poderes));
    const nuevoPoder = nuevo?.categoria === 'estado' ? 0 : (nuevo?.poder ?? 0);
    if (nuevoPoder > poderes[peor]) {
      const nombre = DATOS.movimientos[yo.movimientos[peor].id].nombre;
      log('olvida', nombre, 'por', nuevo?.nombre);
      await pulsar(nombre);
    } else await pulsar('No aprenderlo');
    await espera(200);
    return;
  }
  if (info.texto.startsWith('¿Quién sale')) {
    const eq = est.jugador.equipo;
    const mejor = eq.map((c: any, i: number) => ({ c, i })).filter(({ c }: any) => c.vida > 0).sort((a: any, z: any) => z.c.nivel - a.c.nivel)[0];
    const etiqueta = b.find((x) => x.activo && x.texto.startsWith(nombreEsp(mejor.c.especie)))?.texto;
    if (etiqueta) await pulsar(etiqueta);
    await espera(200);
    return;
  }
  if (info.texto.startsWith('¿Qué hará')) {
    const yo = est.jugador.equipo[est.jugador.activo];
    const rival = est.rival.equipo[est.rival.activo];
    const tiposRival = DATOS.especies[rival.especie].tipos;
    const tiposYo = DATOS.especies[yo.especie].tipos;
    // ¿Capturar? En salvajes, si el equipo es pequeño y no tenemos esa especie.
    const tesera = b.find((x) => x.texto === 'Tésera');
    const tengo = est.jugador.equipo.some((c: any) => c.especie === rival.especie);
    const vidaRival = rival.vida / maxVida(rival);
    if (est.salvaje && tesera?.activo && !tengo && est.jugador.equipo.length < 6 && vidaRival < 0.6) {
      log('lanza tésera a', nombreEsp(rival.especie), rival.nivel);
      await pulsar('Tésera');
      await espera(200);
      return;
    }
    // Entrenar a una floja: sale primera y cede el sitio a la más fuerte (las dos ganan experiencia).
    const fuerte = est.jugador.equipo
      .map((c: any, i: number) => ({ c, i }))
      .filter(({ c }: any) => c.vida > maxVida(c) * 0.5)
      .sort((a: any, z: any) => z.c.nivel - a.c.nivel)[0];
    if (fuerte && fuerte.i !== est.jugador.activo && fuerte.c.nivel >= yo.nivel + 5 && b.some((x) => x.texto === 'Equipo' && x.activo)) {
      await pulsar('Equipo');
      await espera(150);
      if (!(await pulsar(`${nombreEsp(fuerte.c.especie)} · Nv ${fuerte.c.nivel}`))) await pulsar('Volver');
      await espera(150);
      return;
    }
    let mejor = -1;
    let valor = -1;
    yo.movimientos.forEach((m: any, i: number) => {
      const mov = DATOS.movimientos[m.id];
      if (m.pp <= 0) return;
      let v = mov.categoria === 'estado' ? 1 : mov.poder * eficacia(DATOS.tipos, mov.tipo, tiposRival) * (tiposYo.includes(mov.tipo) ? 1.5 : 1);
      if (mov.precision) v *= mov.precision / 100;
      // En salvajes que queremos capturar, sin rematar.
      if (est.salvaje && !tengo && est.jugador.equipo.length < 6 && tesera?.activo && vidaRival < 0.75 && mov.categoria !== 'estado') v = Math.min(v, 30);
      if (v > valor) {
        valor = v;
        mejor = i;
      }
    });
    if (mejor < 0) {
      if (est.salvaje) await pulsar('Huir');
      else await pulsar(DATOS.movimientos[yo.movimientos[0].id].nombre);
      return;
    }
    const nombre = DATOS.movimientos[yo.movimientos[mejor].id].nombre;
    if (!(await pulsar(nombre))) {
      const otro = b.find((x) => x.activo && yo.movimientos.some((m: any) => DATOS.movimientos[m.id].nombre === x.texto));
      if (otro) await pulsar(otro.texto);
      else await pulsar('Huir');
    }
    await espera(150);
    return;
  }
  // Otro menú (mochila, equipo): vuelve.
  if (b.some((x) => x.texto === 'Volver')) await pulsar('Volver');
  await espera(150);
}

// ---------------------------------------------------------------- mapa: caminos

type Paso = { tipo: 'mover'; dir: string } | { tipo: 'palanca'; dir: string };

function libreEn(z: any, e: Estado, x: number, y: number, banderas: Record<string, boolean>): boolean {
  if (esSolida(z, x, y, CASILLAS, banderas)) return false;
  if (e.personas.some((p) => p.x === x && p.y === y)) return false;
  if (z.carteles.some((c: any) => c.x === x && c.y === y)) return false;
  if ((z.recipientes ?? []).some((c: any) => c.x === x && c.y === y)) return false;
  if ((z.palancas ?? []).some((c: any) => c.x === x && c.y === y)) return false;
  if ((z.ocultos ?? []).some((o: any) => o.visible && o.x === x && o.y === y && e.zurrones.includes(o.id))) return false;
  return true;
}

/** Camino (con resbalones y palancas) hasta alguna de las casillas meta. */
function camino(e: Estado, metas: [number, number][], evitarSalidas = true): Paso[] | null {
  const z = ZONAS[e.zona!];
  const palancas = z.palancas ?? [];
  const meta = new Set(metas.map(([x, y]) => `${x},${y}`));
  const salidas = new Set(z.salidas.map((s: any) => `${s.x},${s.y}`));
  const b0 = { ...e.banderas };
  const clave = (x: number, y: number, b: Record<string, boolean>) => `${x},${y}|${palancas.map((p: any) => (b[banderaPalanca(z.id, p.id)] ? 1 : 0)).join('')}`;
  const inicio = { x: e.pos!.x, y: e.pos!.y, b: b0, pasos: [] as Paso[] };
  if (meta.has(`${inicio.x},${inicio.y}`)) return [];
  const vistos = new Set([clave(inicio.x, inicio.y, b0)]);
  const cola = [inicio];
  while (cola.length) {
    const s = cola.shift()!;
    for (const [dir, [dx, dy]] of Object.entries(DELTA) as [string, [number, number]][]) {
      const nx = s.x + dx;
      const ny = s.y + dy;
      const palanca = palancas.find((p: any) => p.x === nx && p.y === ny);
      if (palanca) {
        const k = banderaPalanca(z.id, palanca.id);
        const b = { ...s.b, [k]: !s.b[k] };
        if (!esSolida(z, s.x, s.y, CASILLAS, b) && !vistos.has(clave(s.x, s.y, b))) {
          vistos.add(clave(s.x, s.y, b));
          cola.push({ x: s.x, y: s.y, b, pasos: [...s.pasos, { tipo: 'palanca', dir }] });
        }
        continue;
      }
      const puede = (x: number, y: number) => libreEn(z, e, x, y, s.b);
      if (!puede(nx, ny)) continue;
      const fin = deslizamiento(z, { x: nx, y: ny }, dir, CASILLAS, puede).at(-1)!;
      const k = `${fin.x},${fin.y}`;
      if (evitarSalidas && salidas.has(k) && !meta.has(k)) continue;
      const kk = clave(fin.x, fin.y, s.b);
      if (vistos.has(kk)) continue;
      vistos.add(kk);
      const n = { x: fin.x, y: fin.y, b: s.b, pasos: [...s.pasos, { tipo: 'mover', dir } as Paso] };
      if (meta.has(k)) return n.pasos;
      cola.push(n);
    }
  }
  return null;
}

/** Zonas por las que pasar para llegar a `destino`. */
function rutaZonas(desde: string, destino: string): string[] | null {
  const prev = new Map<string, string>([[desde, '']]);
  const cola = [desde];
  while (cola.length) {
    const z = cola.shift()!;
    if (z === destino) break;
    for (const s of ZONAS[z].salidas) {
      if (!prev.has(s.zona)) {
        prev.set(s.zona, z);
        cola.push(s.zona);
      }
    }
  }
  if (!prev.has(destino)) return null;
  const out = [destino];
  while (out[0] !== desde) out.unshift(prev.get(out[0])!);
  return out;
}

const OPUESTA: Record<string, string> = { arriba: 'abajo', abajo: 'arriba', izquierda: 'derecha', derecha: 'izquierda' };

/** Un paso: mueve (o gira) y espera a que acabe, con lo que pase entre medias (combates, diálogos). */
async function darPaso(p: Paso): Promise<void> {
  if (p.tipo === 'palanca') {
    await page.evaluate((d: string) => (window as any).juego.scene.getScene('Mundo').intentarMover(d), p.dir);
    await esperarQuieto();
    await page.keyboard.press('Enter');
    await espera(120);
    await esperarQuieto();
    return;
  }
  await page.evaluate((d: string) => (window as any).juego.scene.getScene('Mundo').intentarMover(d), p.dir);
  await esperarQuieto();
}

/** Espera a que el mapa quede libre, atendiendo diálogos, elecciones y combates. */
async function esperarQuieto(max = 60000): Promise<Estado> {
  const inicio = Date.now();
  for (;;) {
    const e = await estado();
    if (e.escena === 'combate') {
      await turnoCombate();
      continue;
    }
    if (e.escena === 'nombre') {
      await page.fill('#nombre-jugador', '');
      await page.press('#nombre-jugador', 'Enter');
      await espera(300);
      continue;
    }
    if (e.eleccion) {
      await responder(e);
      continue;
    }
    if (e.dialogo) {
      revisarTexto(e.texto, `${e.zona} (${e.quien || 'narración'})`);
      await page.keyboard.press('Enter');
      await espera(40);
      continue;
    }
    if (e.menu) {
      if (e.menu.includes('Elige compañera')) {
        await elegirCompanera();
        continue;
      }
      log('cierra menú', e.menu);
      await page.keyboard.press('Escape');
      await espera(200);
      continue;
    }
    if (e.escena === 'mundo' && e.quieto) return e;
    if (Date.now() - inicio > max) {
      problema(`Atascado esperando en ${e.zona} ${JSON.stringify(e.pos)} (escena ${e.escena}, texto «${e.texto.slice(0, 60)}»)`);
      await foto('atascado');
      return e;
    }
    await espera(40);
  }
}

async function elegirCompanera(): Promise<void> {
  log('elige compañera:', INICIAL);
  await page.evaluate((nombre: string) => {
    const ui = (window as any).juego.scene.getScene('Interfaz');
    const todos: any[] = [];
    const rec = (l: any[]) => l.forEach((o) => { todos.push(o); if (o.list) rec(o.list); });
    rec(ui.capaMenu.list);
    const t = todos.find((o) => o.type === 'Text' && o.text === nombre);
    const zona = todos.find((o) => o.input && o.type === 'Rectangle' && Math.abs(o.x - t.x) < 5);
    zona.emit('pointerup');
  }, INICIAL);
  await espera(300);
}

/** Va a una casilla de la zona actual (o a una de las vecinas de un personaje) y devuelve si llegó. */
async function irA(metas: [number, number][]): Promise<boolean> {
  for (let intento = 0; intento < 12; intento++) {
    const e = await esperarQuieto();
    if (metas.some(([x, y]) => x === e.pos!.x && y === e.pos!.y)) return true;
    const pasos = camino(e, metas) ?? camino(e, metas, false);
    if (!pasos) {
      log('sin camino en', e.zona, 'desde', e.pos, 'a', metas.slice(0, 4));
      return false;
    }
    let desviado = false;
    for (const p of pasos) {
      const antes = await estado();
      const c0 = combates;
      await darPaso(p);
      const despues = await estado();
      if (despues.zona !== antes.zona) return false;
      if (p.tipo === 'mover' && despues.pos!.x === antes.pos!.x && despues.pos!.y === antes.pos!.y) {
        desviado = true;
        break;
      }
      // Un combate o un guion por el camino: se recalcula.
      if (combates !== c0) {
        desviado = true;
        break;
      }
    }
    if (!desviado) {
      const e2 = await estado();
      if (metas.some(([x, y]) => x === e2.pos!.x && y === e2.pos!.y)) return true;
    }
  }
  return false;
}

async function irAZona(destino: string): Promise<boolean> {
  for (let intento = 0; intento < 30; intento++) {
    const e = await esperarQuieto();
    if (e.zona === destino) return true;
    const ruta = rutaZonas(e.zona!, destino);
    if (!ruta) {
      problema(`No hay camino de ${e.zona} a ${destino}`);
      return false;
    }
    const siguiente = ruta[1];
    const salidas = ZONAS[e.zona!].salidas.filter((s: any) => s.zona === siguiente).map((s: any) => [s.x, s.y] as [number, number]);
    await irA(salidas);
    const e2 = await esperarQuieto();
    if (e2.zona === e.zona) {
      // Quizá un guardia: hablar con lo que haya delante y reintentar.
      log('no pasa de', e.zona, 'a', siguiente, 'en', e2.pos);
      await page.keyboard.press('Enter');
      await esperarQuieto();
      if (intento > 4) {
        problema(`No consigo pasar de ${e.zona} a ${siguiente}`);
        await foto(`no_pasa_${e.zona}`);
        return false;
      }
    }
  }
  return false;
}

async function hablarCon(zona: string, pnj: string): Promise<boolean> {
  if (!(await irAZona(zona))) return false;
  for (let intento = 0; intento < 4; intento++) {
    const e = await esperarQuieto();
    const p = e.personas.find((x) => x.id === pnj);
    if (!p) {
      log('no está', pnj, 'en', zona);
      return false;
    }
    const vecinas: [number, number][] = Object.values(DELTA).map(([dx, dy]: any) => [p.x + dx, p.y + dy]);
    if (!(await irA(vecinas))) continue;
    const e2 = await estado();
    const dx = p.x - e2.pos!.x;
    const dy = p.y - e2.pos!.y;
    const dir = dx === 1 ? 'derecha' : dx === -1 ? 'izquierda' : dy === 1 ? 'abajo' : 'arriba';
    await page.evaluate((d: string) => (window as any).juego.scene.getScene('Mundo').intentarMover(d), dir);
    await espera(80);
    await page.keyboard.press('Enter');
    await espera(150);
    await esperarQuieto();
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- curar y entrenar

const CURANDEROS: [string, string][] = [
  ['meson_santa_fe', 'mesonera'],
  ['alhambra', 'aguador'],
  ['villalar', 'fraile'],
  ['meson_toledo', 'mesonera_toledo'],
  ['el_escorial', 'jeronimo'],
  ['meson_sevilla', 'mesonera_sevilla'],
  ['sanlucar', 'fraile'],
  ['rascafria', 'cartujo'],
  ['meson_madrid', 'mesonera_madrid'],
];

async function curar(): Promise<void> {
  const e = await esperarQuieto();
  // Solo si se llega a la primera salida del camino: un entrenador sin vencer puede cortar el paso.
  const primerPaso = (ruta: string[]) =>
    ruta.length < 2 || camino(e, ZONAS[e.zona!].salidas.filter((s: any) => s.zona === ruta[1]).map((s: any) => [s.x, s.y]), false) !== null;
  const opciones = CURANDEROS.map(([z, p]) => ({ z, p, ruta: rutaZonas(e.zona!, z) }))
    .filter((o) => o.ruta && primerPaso(o.ruta))
    .sort((a, b) => a.ruta!.length - b.ruta!.length);
  if (!opciones.length) {
    problema(`Sin dónde curar desde ${e.zona}`);
    return;
  }
  const { z, p } = opciones[0];
  log('va a curar a', z, p);
  quiereCurar = true;
  await hablarCon(z, p);
  quiereCurar = false;
}

function equipoTocado(e: Estado): boolean {
  if (!e.equipo.length) return false;
  const vida = e.equipo.reduce((s, c) => s + c.vida, 0);
  const max = e.equipo.reduce((s, c) => s + maxVida(c), 0);
  const fuerte = [...e.equipo].sort((a, z) => z.nivel - a.nivel)[0];
  return e.equipo[0]?.vida < maxVida(e.equipo[0]) * 0.5 || fuerte.vida < maxVida(fuerte) * 0.5 || vida < max * 0.6;
}

/** Lo que hacen los tipos de una especie, de media, al equipo de un entrenador. */
function ventaja(especie: string, contra?: string): number {
  const equipo = contra ? (ENTRENADORES[contra]?.equipo ?? []) : [];
  if (!equipo.length) return 0;
  const tipos = DATOS.especies[especie].tipos;
  return equipo.reduce((s: number, c: any) => s + Math.max(...tipos.map((t: string) => eficacia(DATOS.tipos, t, DATOS.especies[c.especie].tipos))), 0) / equipo.length;
}

/** La más fuerte sube hasta `nivel` y otras dos (primero las de ventaja contra `contra`) hasta tres menos. */
function aprendices(e: Estado, nivel: number, contra?: string): { c: any; i: number; objetivo: number }[] {
  const eq = e.equipo.map((c, i) => ({ c, i }));
  const fuerte = [...eq].sort((a, z) => z.c.nivel - a.c.nivel)[0];
  const resto = eq
    .filter((x) => x !== fuerte)
    .sort((a, z) => ventaja(z.c.especie, contra) - ventaja(a.c.especie, contra) || z.c.nivel - a.c.nivel)
    .slice(0, 2);
  return [{ ...fuerte, objetivo: nivel }, ...resto.map((x) => ({ ...x, objetivo: nivel - 3 }))];
}

/** Lo mismo que cambiar el orden desde el menú del equipo. */
async function ponerPrimera(i: number): Promise<void> {
  await page.evaluate((i: number) => {
    const p = (window as any).juego.scene.getScene('Mundo').p;
    const [c] = p.equipo.splice(i, 1);
    p.equipo.unshift(c);
  }, i);
}

/** Entrena peleando en la hierba más cercana (ver `aprendices`). */
async function entrenar(nivel: number, contra?: string): Promise<void> {
  let anunciado = '';
  for (let vuelta = 0; vuelta < 600; vuelta++) {
    const e = await esperarQuieto();
    const pendientes = aprendices(e, nivel, contra).filter((a) => a.c.nivel < a.objetivo);
    if (!pendientes.length) return;
    const a = pendientes.sort((x, y) => x.c.nivel - y.c.nivel)[0];
    if (a.i !== 0) await ponerPrimera(a.i);
    if (anunciado !== a.c.especie) {
      anunciado = a.c.especie;
      log('entrena a', nombreEsp(a.c.especie), a.c.nivel, '→', a.objetivo, contra ? `(contra ${contra})` : '');
    }
    if (equipoTocado(e)) {
      await curar();
      continue;
    }
    // La zona con encuentros más cercana.
    const candidatas = Object.values(ZONAS)
      .filter((z: any) => z.encuentros && z.mapa.some((f: string) => /[hwy]/.test(f)))
      .map((z: any) => ({ z, ruta: rutaZonas(e.zona!, z.id) }))
      .filter((o: any) => o.ruta)
      .sort((a: any, b: any) => a.ruta.length - b.ruta.length);
    if (!candidatas.length) {
      problema(`No hay dónde entrenar desde ${e.zona}`);
      return;
    }
    const z = candidatas[0].z;
    if (e.zona !== z.id) {
      await irAZona(z.id);
      continue;
    }
    const hierba: [number, number][] = [];
    z.mapa.forEach((f: string, y: number) => [...f].forEach((c, x) => /[hwy]/.test(c) && hierba.push([x, y])));
    const llego = await irA(hierba);
    if (!llego) continue;
    // Ir y venir por la hierba hasta que salga algo.
    const antes = combates;
    for (let i = 0; i < 60 && combates === antes; i++) {
      const e2 = await estado();
      const dirs = Object.entries(DELTA).filter(([, [dx, dy]]: any) => /[hwy]/.test(z.mapa[e2.pos!.y + dy]?.[e2.pos!.x + dx] ?? '') && libreEn(z, e2, e2.pos!.x + dx, e2.pos!.y + dy, e2.banderas));
      if (!dirs.length) break;
      await darPaso({ tipo: 'mover', dir: dirs[i % dirs.length][0] });
    }
  }
  problema(`No consigo subir a nivel ${nivel}`);
}

// ---------------------------------------------------------------- objetivos

type Objetivo =
  | { hablar: string; en: string; hasta?: string }
  | { vencer: string; pnj: string; en: string }
  | { nivel: number }
  | { curar: true };

const PLAN_COMPLETO: Objetivo[] = [
  // Capítulo 1
  { hablar: 'isabel', en: 'pabellon_real', hasta: 'inicial' },
  { hablar: 'gran_capitan', en: 'santa_fe', hasta: 'teseras' },
  { hablar: 'colon', en: 'santa_fe', hasta: 'colon' },
  { hablar: 'pastor_orce', en: 'santa_fe', hasta: 'fosil' },
  { vencer: 'rival_a_santa_fe', pnj: 'rival_a', en: 'santa_fe' },
  { curar: true },
  { vencer: 'mercader_genoves', pnj: 'mercader', en: 'vega' },
  { vencer: 'labrador', pnj: 'labrador', en: 'vega' },
  { vencer: 'ballestero_sancho', pnj: 'ballestero', en: 'vega' },
  { vencer: 'rival_b_vega', pnj: 'rival_b', en: 'vega' },
  { vencer: 'jardinero', pnj: 'jardinero', en: 'alhambra' },
  { nivel: 12 },
  { curar: true },
  { vencer: 'guardia_alhambra', pnj: 'guardia', en: 'patio_leones' },
  { vencer: 'poeta_corte', pnj: 'poeta', en: 'patio_leones' },
  { vencer: 'alarife', pnj: 'alarife', en: 'patio_leones' },
  { curar: true },
  { hablar: 'boabdil', en: 'patio_leones', hasta: 'capitulo2' },
  // Capítulo 2
  { hablar: 'padilla', en: 'villalar', hasta: 'carta_padilla' },
  { vencer: 'soldado_imperial', pnj: 'soldado_imperial', en: 'villalar' },
  { vencer: 'comunero', pnj: 'comunero', en: 'villalar' },
  { curar: true },
  { vencer: 'halconero', pnj: 'halconero', en: 'sierra_guadarrama' },
  { vencer: 'pastor_mesta', pnj: 'pastor_mesta', en: 'sierra_guadarrama' },
  { vencer: 'herbolaria', pnj: 'herbolaria', en: 'camino_toledo' },
  { vencer: 'rival_a_camino', pnj: 'rival_a', en: 'camino_toledo' },
  { curar: true },
  { vencer: 'rival_b_toledo', pnj: 'rival_b', en: 'toledo' },
  { hablar: 'maestro_toledo', en: 'toledo', hasta: 'regalo:repartir_exp' },
  { nivel: 17 },
  { curar: true },
  { vencer: 'escudero', pnj: 'escudero', en: 'alcazar_toledo' },
  { vencer: 'espadero_alcazar', pnj: 'espadero', en: 'alcazar_toledo' },
  { vencer: 'artillero', pnj: 'artillero', en: 'alcazar_toledo' },
  { curar: true },
  { hablar: 'maria_pacheco', en: 'alcazar_toledo', hasta: 'capitulo3' },
  // Capítulo 3
  { hablar: 'felipe_ii', en: 'el_escorial', hasta: 'despacho_rey' },
  { vencer: 'cantero', pnj: 'cantero', en: 'bosque_herreria' },
  { vencer: 'guarda_herreria', pnj: 'guarda', en: 'bosque_herreria' },
  { vencer: 'rival_b_herreria', pnj: 'rival_b', en: 'bosque_herreria' },
  { curar: true },
  { vencer: 'salteador', pnj: 'salteador', en: 'sierra_morena' },
  { vencer: 'arriero', pnj: 'arriero', en: 'sierra_morena' },
  { curar: true },
  { vencer: 'rival_a_sevilla', pnj: 'rival_a', en: 'sevilla' },
  { nivel: 23 },
  { curar: true },
  { vencer: 'grumete', pnj: 'grumete', en: 'galeon' },
  { vencer: 'marinero', pnj: 'marinero', en: 'galeon' },
  { vencer: 'contramaestre', pnj: 'contramaestre', en: 'galeon' },
  { curar: true },
  { hablar: 'menendez', en: 'galeon', hasta: 'blason_sevilla' },
  { vencer: 'guarda_coto', pnj: 'guarda_coto', en: 'marismas' },
  { vencer: 'pescador_marisma', pnj: 'pescador', en: 'marismas' },
  { hablar: 'menendez', en: 'sanlucar', hasta: 'capitulo4' },
  // Capítulo 4
  { vencer: 'nevero', pnj: 'nevero', en: 'penalara' },
  { vencer: 'lenadora', pnj: 'lenador_penalara', en: 'penalara' },
  { vencer: 'rival_a_penalara', pnj: 'rival_a', en: 'penalara' },
  { curar: true },
  { hablar: 'felipe_iv', en: 'monte_pardo', hasta: 'encargo_rey' },
  { vencer: 'montero', pnj: 'montero', en: 'monte_pardo' },
  { vencer: 'dama_corte', pnj: 'dama', en: 'monte_pardo' },
  { hablar: 'olivares', en: 'alcazar_madrid', hasta: 'licencia_olivares' },
  { curar: true },
  { vencer: 'rival_b_madrid', pnj: 'rival_b', en: 'madrid' },
  { nivel: 31 },
  { curar: true },
  { vencer: 'piquero', pnj: 'piquero', en: 'breda' },
  { vencer: 'arcabucero', pnj: 'arcabucero', en: 'breda' },
  { vencer: 'alferez', pnj: 'alferez', en: 'breda' },
  { curar: true },
  { hablar: 'spinola', en: 'breda', hasta: 'blason_madrid' },
  { hablar: 'olivares', en: 'alcazar_madrid', hasta: 'fin_capitulo4' },
];

const HASTA = Number(process.env.HASTA ?? 999);
const PLAN = PLAN_COMPLETO.slice(0, HASTA);

// ---------------------------------------------------------------- partida

async function nuevaPartida(): Promise<void> {
  await page.goto(URL_JUEGO);
  await page.evaluate(() => localStorage.clear());
  if (REANUDAR) {
    const guardada = fs.readFileSync(PARTIDA, 'utf8');
    await page.evaluate((g: string) => localStorage.setItem('leyendas-de-iberia:partida', g), guardada);
  }
  await page.reload();
  await espera(3500);
  const boton = REANUDAR ? ['Continuar'] : ['Nueva partida', 'Empezar'];
  const ok = await page.evaluate((boton: string[]) => {
    const t = (window as any).juego.scene.getScene('Titulo');
    const todos: any[] = [];
    const rec = (l: any[]) => l.forEach((o) => { todos.push(o); if (o.list) rec(o.list); });
    rec(t.children.list);
    const b = todos.find((o) => o.etiqueta && boton.includes(o.etiqueta.text));
    if (!b) return todos.filter((o) => o.type === 'Text').map((o) => o.text);
    b.alPulsar();
    return true;
  }, boton);
  log('título:', ok);
  await espera(1500);
}

let paso = 0;
async function cumplir(o: Objetivo): Promise<void> {
  const e = await esperarQuieto();
  if (equipoTocado(e) && !('curar' in o) && e.banderas.inicial) await curar();
  if ('curar' in o) return curar();
  if ('nivel' in o) {
    const lider = PLAN.slice(paso).find((x) => 'hablar' in x && ENTRENADORES[x.hablar]) as any;
    log('entrenar hasta nivel', o.nivel, '· equipo:', resumenEquipo(e.equipo));
    return entrenar(o.nivel, lider?.hablar);
  }
  if ('hablar' in o) {
    for (let i = 0; i < 4; i++) {
      const e1 = await esperarQuieto();
      if (o.hasta && e1.banderas[o.hasta]) return;
      if (!o.hasta && i > 0) return;
      ultimoRival = o.hablar;
      await hablarCon(o.en, o.hablar);
      const e2 = await esperarQuieto();
      if (o.hasta && !e2.banderas[o.hasta] && e2.equipo.length && equipoTocado(e2)) await curar();
      if (o.hasta && !e2.banderas[o.hasta] && ENTRENADORES[o.hablar] && !e2.vencidos.includes(o.hablar)) {
        const tope = Math.max(...e2.equipo.map((c) => c.nivel));
        log('no venció a', o.hablar, '· entrena hasta', tope + 2);
        await entrenar(tope + 2, o.hablar);
      }
    }
    const e3 = await estado();
    if (o.hasta && !e3.banderas[o.hasta]) problema(`No se consigue «${o.hasta}» hablando con ${o.hablar} en ${o.en}`);
    return;
  }
  for (let i = 0; i < 6; i++) {
    const e1 = await esperarQuieto();
    if (e1.vencidos.includes(o.vencer)) return;
    if (equipoTocado(e1)) await curar();
    ultimoRival = o.vencer;
    await hablarCon(o.en, o.pnj);
    const e2 = await esperarQuieto();
    if (e2.vencidos.includes(o.vencer)) return;
    // Perdió: a entrenar un poco antes de volver.
    const objetivo = Math.max(...ENTRENADORES[o.vencer].equipo.map((c: any) => c.nivel), ENTRENADORES[o.vencer].rival?.nivel ?? 0) + 2;
    log('no venció a', o.vencer, '· entrena hasta', objetivo);
    await entrenar(Math.min(objetivo, Math.max(...e2.equipo.map((c) => c.nivel)) + 3), o.vencer);
  }
  problema(`No consigo vencer a ${o.vencer}`);
}


await nuevaPartida();
const hitos: string[] = [];
// DESDE=n salta los objetivos anteriores al n (para reanudar sin repetirlos).
const DESDE = Number(process.env.DESDE ?? 1);
for (const o of PLAN) {
  paso++;
  if (paso < DESDE) continue;
  const antes = await estado();
  const desc = JSON.stringify(o);
  log(`#${paso}`, desc, '· en', antes.zona, '· equipo:', resumenEquipo(antes.equipo));
  try {
    await cumplir(o);
  } catch (err) {
    problema(`Excepción del bot en ${desc}: ${String(err).slice(0, 200)}`);
    await foto('excepcion');
  }
  const guardada = await page.evaluate(() => localStorage.getItem('leyendas-de-iberia:partida'));
  if (guardada) fs.writeFileSync(PARTIDA, guardada);
  if ('hablar' in o && ['boabdil', 'maria_pacheco', 'menendez', 'spinola', 'olivares'].includes(o.hablar)) {
    const e = await estado();
    hitos.push(`${o.hablar} (${o.en}): ${resumenEquipo(e.equipo)} · ${(Date.now() - t0) / 60000 | 0} min · ${e.dinero} monedas`);
    await foto(`hito_${o.hablar}`);
  }
}
const fin = await estado();
log('FIN. Zona', fin.zona, 'banderas de fin:', ['fin_capitulo3', 'fin_capitulo4', 'blason_madrid'].map((b) => `${b}=${fin.banderas[b]}`));
log('Hitos:', hitos);
log('Derrotas:', derrotas);
log('Problemas:', problemas.length);
for (const p of problemas) log(' -', p);
fs.writeFileSync(`${SALIDA}/problemas.json`, JSON.stringify({ problemas, hitos, derrotas, equipo: resumenEquipo(fin.equipo) }, null, 2));
await browser.close();
