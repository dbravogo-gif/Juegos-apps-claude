// Pruebas de navegador del atleta (npm run flujos). Necesitan Playwright: no van en npm test.
// Flujos que la herramienta de capturas no cubre: cambio de sesión, códigos
// desactivados, enlace malo y modo noche.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { servir } from './servidor.mjs';
const srv = await servir();
const BASE = `${srv.url}/beep-run-club/`;
const OUT = process.argv[2] ?? '/tmp';
const errores = [];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 393, height: 659 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
const p = await ctx.newPage();
p.on('pageerror', (e) => errores.push(`página: ${e.message}`));
p.on('console', (m) => { if (m.type() === 'error') errores.push(`consola: ${m.text()}`); });
const sinBasura = async (donde) => {
  const t = await p.evaluate(() => document.body.innerText);
  const m = /\b(null|undefined|NaN|\[object Object\])\b/.exec(t);
  if (m) errores.push(`«${m[1]}» en pantalla (${donde})`);
};
const foto = async (n) => { await sinBasura(n); if (process.argv[2]) await p.screenshot({ path: `${OUT}/${n}.png` }); };
const estado = () => p.evaluate(() => window.__BEEP__.estado());
const texto = (sel) => p.locator(sel).first().innerText();
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) errores.push(msg); };

// 1. Enlace con código de Laura: entra directamente.
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await p.waitForTimeout(600);
ok((await estado()).pantalla === 'semana', 'el enlace con código entra directo a la semana');
ok(new URL(p.url()).searchParams.get('c') === 'DEMO-BEEP22', 'el código queda en la dirección');
// 2. Recargar: la sesión sigue.
await p.goto(`${BASE}?hoy=2026-11-19`); await p.waitForTimeout(500);
ok((await texto('h1')) === 'Hola, Laura', 'la sesión sobrevive a recargar');
// 3. Abrir el enlace de Pablo: pregunta.
await p.goto(`${BASE}?hoy=2026-11-19&c=PABLO-K7M2QX`); await p.waitForTimeout(600);
ok(await p.locator('dialog[open]').count() === 1, 'otro código abre el diálogo de confirmación');
await foto('10-cambiar-sesion');
await p.locator('dialog .boton:not(.boton-principal)').click(); await p.waitForTimeout(300);
ok((await texto('h1')) === 'Hola, Laura', 'cancelar mantiene la sesión anterior');
ok(new URL(p.url()).searchParams.get('c') === 'DEMO-BEEP22', 'y la dirección vuelve al código de Laura');
await p.goto(`${BASE}?hoy=2026-11-19&c=PABLO-K7M2QX`); await p.waitForTimeout(600);
await p.locator('dialog .boton-principal').click(); await p.waitForTimeout(500);
ok((await texto('h1')) === 'Hola, Pablo', 'aceptar entra con el nuevo código');
// 4. Enlace de un código desactivado con sesión abierta: no cambia y avisa.
await p.goto(`${BASE}?hoy=2026-11-19&c=MARTA-AAAA22`); await p.waitForTimeout(600);
ok((await texto('h1')) === 'Hola, Pablo' && await p.locator('.tostada').count() === 1, 'un enlace desactivado no cierra la sesión y avisa');
// 5. Si desactivan el código de la sesión abierta: se cierra con aviso.
await p.evaluate(() => { const db = JSON.parse(localStorage.beep_demo_db); db.codigos['PABLO-K7M2QX'].activo = false; localStorage.beep_demo_db = JSON.stringify(db); });
await p.goto(`${BASE}?hoy=2026-11-19`); await p.waitForTimeout(700);
ok((await estado()).pantalla === 'entrar' && /desactivado/.test(await texto('#error-codigo')), 'un código desactivado cierra la sesión con aviso');
await foto('11-codigo-desactivado');
// 6. Enlace con un código mal formado.
await p.goto(`${BASE}?hoy=2026-11-19&c=hola`); await p.waitForTimeout(500);
ok(/no es válido/.test(await texto('#error-codigo')), 'un enlace mal formado avisa');
// 7. Teclear un código con minúsculas y sin guion.
await p.fill('#codigo', 'demo beep22'); await p.click('button[type=submit]'); await p.waitForTimeout(600);
ok((await texto('h1')) === 'Hola, Laura', 'se acepta el código en minúsculas y con espacio');
// 8. Modo noche.
await p.click('.cabecera .boton-icono'); await p.waitForTimeout(300);
await p.click('.segmentado button:nth-child(3)'); await p.waitForTimeout(200);
await foto('12-ajustes-noche');
await p.click('.cabecera .boton-icono'); await p.waitForTimeout(500);
await foto('13-semana-noche');
await p.click('.es-hoy .tarjeta-sesion'); await p.waitForTimeout(400);
await foto('14-sesion-noche');
await p.click('.pie-fijo button'); await p.waitForTimeout(400);
await p.click('.esfuerzo button:nth-child(9)');
await foto('15-valorar-noche');
// 9. Teclado: flechas en la escala de esfuerzo.
await p.keyboard.press('ArrowLeft');
ok(await p.locator('.esfuerzo [aria-checked="true"]').innerText() === '8', 'las flechas mueven el esfuerzo');
// 10. Borrador: lo marcado sigue al volver.
await p.goto(`${BASE}?hoy=2026-11-19#/`); await p.waitForTimeout(400);
await p.click('.es-hoy .tarjeta-sesion'); await p.waitForTimeout(300);
await sinBasura('sesión');
await p.click('.ejercicio:nth-child(2) .marca');
await p.reload(); await p.waitForTimeout(500);
ok(await p.locator('.ejercicio:nth-child(2) .marca').getAttribute('aria-pressed') === 'true', 'lo marcado se guarda como borrador al recargar');
// 11. Cerrar sesión.
await p.goto(`${BASE}?hoy=2026-11-19#/ajustes`); await p.waitForTimeout(400);
await p.locator('button', { hasText: 'Cerrar sesión' }).click();
await p.locator('dialog .boton-principal').click(); await p.waitForTimeout(300);
ok((await estado()).pantalla === 'entrar' && !new URL(p.url()).searchParams.get('c'), 'cerrar sesión vuelve a la entrada y quita el código de la dirección');

for (const ruta of ['#/', '#/ajustes']) { await p.goto(`${BASE}?hoy=2026-11-19${ruta}`); await p.waitForTimeout(300); await sinBasura(ruta); }
await b.close();
srv.cerrar();
console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'Sin errores');
process.exit(errores.length ? 1 : 0);
