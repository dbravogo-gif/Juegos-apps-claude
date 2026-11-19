// Pruebas de navegador del panel del entrenador, de punta a punta con la app del atleta
// (npm run flujos). Necesitan Playwright: no van en npm test.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
import { servir } from './servidor.mjs';

const srv = await servir();
const BASE = `${srv.url}/beep-run-club/`;
const OUT = process.argv[2] ?? null;
const errores = [];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 393, height: 740 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', acceptDownloads: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => errores.push(`página: ${e.message}`));
p.on('console', (m) => { if (m.type() === 'error') errores.push(`consola: ${m.text()}`); });
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) errores.push(msg); };
const sinBasura = async (donde) => {
  const t = await p.evaluate(() => document.body.innerText);
  const m = /\b(null|undefined|NaN|\[object Object\])\b/.exec(t);
  if (m) errores.push(`«${m[1]}» en pantalla (${donde})`);
};
const foto = async (n) => { await sinBasura(n); if (OUT) await p.screenshot({ path: `${OUT}/${n}.png`, fullPage: true }); };
const espera = (ms = 350) => p.waitForTimeout(ms);
const PANEL = `${BASE}entrenador/?hoy=2026-11-19`;

// 1. Acceso en demo y novedades de ejemplo.
await p.goto(PANEL); await espera(600);
await foto('20-acceso');
await p.click('button[type=submit]'); await espera();
ok(await p.locator('.tarjeta').count() === 2, 'novedades muestra las 2 valoraciones de ejemplo');
ok(await p.locator('.tarjeta.dura').count() === 1, 'la valoración dura se resalta');
await foto('21-novedades');

// 2. Alta de una atleta.
await p.click('a[href="#/atletas"]'); await espera();
await p.locator('button', { hasText: 'Nuevo atleta' }).click();
await p.locator('dialog .boton-principal').click(); await espera(200);
ok(/nombre/i.test(await p.locator('dialog .error').innerText()), 'crear sin nombre avisa y no cierra el diálogo');
await p.fill('#nombre-atleta', 'Ana Torres');
await p.locator('dialog .boton-principal').click(); await espera();
const codigo = (await p.locator('dialog .codigo-grande').innerText()).trim();
ok(/^ANA-[A-Z2-9]{6}$/.test(codigo), `código generado: ${codigo}`);
await foto('22-atleta-creado');
await p.locator('dialog .boton-principal').click(); await espera();
ok((await p.locator('h1').innerText()) === 'Ana Torres', 'tras el alta se abre su ficha');

// 3. Sesión nueva hoy, con autocompletado de la casilla de carrera.
await p.locator('.dia-panel.es-hoy a.boton-mini').click(); await espera();
await p.fill('#titulo', 'Series largas');
const nombre1 = p.locator('input[name="nombre"]').first();
await nombre1.fill('Series de 400 m'); await nombre1.blur(); await espera(100);
ok(await p.locator('fieldset input[type=checkbox]').first().isChecked(), 'un ejercicio conocido de carrera marca la casilla solo');
await p.locator('fieldset textarea').first().fill('5 × 1000 m a ritmo de 10 km');
await p.locator('button', { hasText: 'Añadir ejercicio' }).click();
await p.locator('input[name="nombre"]').nth(1).fill('Plancha');
await foto('23-editor');
await p.locator('.pie-fijo .boton-principal').click(); await espera();
ok(await p.locator('.dia-panel.es-hoy .tarjeta').count() === 1, 'la sesión aparece en su semana');
await foto('24-ficha');

// 4. Copiar la semana a la siguiente.
await p.locator('button', { hasText: 'Copiar esta semana' }).click();
await p.locator('dialog .boton-principal').click(); await espera();
ok(await p.locator('.dia-panel .tarjeta').count() === 1 && /semana que viene/.test(await p.locator('.rango small').innerText()), 'copiar lleva a la semana siguiente con la sesión copiada');
const fichaUrl = p.url().replace(/\/\d{4}-\d{2}-\d{2}$/, '');

// 5. La atleta entra con su enlace, ve la sesión y la valora.
await p.goto(`${BASE}?hoy=2026-11-19&c=${codigo}`); await espera(600);
await p.locator('dialog .boton-principal').click().catch(() => {}); await espera(400); // por si hubiera otra sesión
ok((await p.locator('h1').innerText()) === 'Hola, Ana', 'la atleta entra con el enlace');
await p.click('.es-hoy .tarjeta-sesion'); await espera();
ok(await p.locator('.ejercicio').count() === 2 && await p.locator('.carrera').count() === 1, 've sus 2 ejercicios y solo uno de carrera');
await p.click('.pie-fijo button'); await espera();
await p.click('.esfuerzo button:nth-child(10)');
await p.click('.chips-duros .chip:nth-child(1)');
await p.click('.pie-fijo button'); await espera();

// 6. Al entrenador le llega en novedades, la primera y nueva.
await p.goto(`${PANEL}#/novedades`); await espera(500);
ok(/Ana Torres · Series largas/.test(await p.locator('.tarjeta').first().innerText()), 'la valoración llega la primera a novedades');
ok(await p.locator('.tarjeta').first().locator('.nuevo').count() === 1 && await p.locator('.tarjeta.dura').first().isVisible(), 'marcada como nueva y como dura');
await p.locator('.tarjeta').first().click(); await espera();
ok(await p.locator('.valoracion').count() === 1, 'al abrirla se ve la valoración completa en el editor');
await foto('25-valoracion');

// 7. Desactivar el código echa a la atleta.
await p.goto(fichaUrl); await espera();
await p.locator('button', { hasText: 'Desactivar código' }).click();
await p.locator('dialog .boton-principal').click(); await espera();
await p.goto(`${BASE}?hoy=2026-11-19`); await espera(600);
ok(await p.evaluate(() => window.__BEEP__.estado().pantalla) === 'entrar', 'con el código desactivado, la atleta queda fuera');

// 8. Baja: descargar el historial y borrar.
await p.goto(fichaUrl); await espera();
await p.locator('button', { hasText: 'Dar de baja' }).click();
const descarga = p.waitForEvent('download');
await p.locator('dialog button', { hasText: 'Descargar' }).click();
const d = await descarga;
const csv = readFileSync(await d.path(), 'utf8');
ok(d.suggestedFilename() === 'historial-ana-torres-2026-11-19.csv' && /Series largas/.test(csv) && /10 \(Al máximo\)/.test(csv), 'el historial descargado tiene sus sesiones y su valoración');
await espera(200);
await p.locator('dialog .boton-principal').click(); await espera();
const db = await p.evaluate(() => localStorage.beep_demo_db);
ok(!db.includes(codigo) && !db.includes('Ana Torres'), 'tras borrar no queda nada de la atleta');
ok(!(await p.locator('.lista').first().innerText()).includes('Ana Torres'), 'y desaparece de la lista');

await b.close();
srv.cerrar();
console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'Sin errores');
process.exit(errores.length ? 1 : 0);
