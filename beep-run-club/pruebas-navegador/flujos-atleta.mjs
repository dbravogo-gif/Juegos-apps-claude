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

// --- Regresiones de la revisión del probador (2026-11-19) ---
const db = () => p.evaluate(() => JSON.parse(localStorage.beep_demo_db));
await p.evaluate(() => localStorage.clear());
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await p.waitForTimeout(600);
// R1: volver no entra en bucle entre sesión y valoración.
await p.click('.es-hoy .tarjeta-sesion'); await p.waitForTimeout(300);
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(300);
await p.click('.cabecera .boton-icono'); await p.waitForTimeout(300);
ok((await estado()).pantalla === 'sesion', 'volver desde valorar lleva a la sesión');
await p.click('.cabecera .boton-icono'); await p.waitForTimeout(300);
ok((await estado()).pantalla === 'semana', 'volver desde la sesión lleva a la semana (sin bucle)');
// R5: guardar sin esfuerzo muestra el error junto al botón.
await p.click('.es-hoy .tarjeta-sesion'); await p.waitForTimeout(300);
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(300);
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(300);
ok(/Falta lo principal/.test(await p.locator('.pie-fijo .error').innerText()), 'sin esfuerzo, el error se ve en el pie fijo');
// R2: valorar rápido sin marcar cuenta la sesión entera, no «0 hechos».
await p.click('.esfuerzo button:nth-child(6)');
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(400);
let d = await db();
let laura = Object.values(d.atletas).find((a) => a.nombre === 'Laura');
let [sidHoy, reg] = Object.entries(d.registros[laura.id]).find(([, r]) => r.fecha === '2026-11-19');
ok(reg.hechos.length === d.sesiones[laura.id][sidHoy].ejercicios.length, 'valorar sin marcar guarda la sesión completa');
// R14: la celebración solo sale tras guardar.
await p.goto(`${BASE}?hoy=2026-11-19#/sesion/noexiste/hecho`); await p.waitForTimeout(400);
ok((await estado()).pantalla === 'semana', 'una dirección de «hecho» falsa vuelve a la semana');
// R3: lo que se cambia después de valorar se guarda solo.
await p.click('.es-hoy .tarjeta-sesion'); await p.waitForTimeout(300);
await p.click('.ejercicio:nth-child(1) .marca'); await p.waitForTimeout(1000);
d = await db();
ok(d.registros[laura.id][sidHoy].hechos.length === reg.hechos.length - 1, 'desmarcar tras valorar actualiza la valoración');
ok(/guardados/.test(await p.locator('.pie-fijo').innerText()), 'y lo dice («Cambios guardados»)');
// R4 y R8: tiempo «4530», el ritmo se calcula al escribir y los tres cuadran.
const carrera = p.locator('.ejercicio:has(.carrera)').first();
await carrera.locator('.carrera .boton-texto').click();
const campos = carrera.locator('.carrera-campos input');
await campos.nth(0).fill('10'); await campos.nth(1).fill('4530');
ok(await campos.nth(2).inputValue() === '4:33', 'el ritmo se calcula mientras se escribe (10 km en 45:30 → 4:33)');
await campos.nth(2).fill('4,30'); await campos.nth(2).blur(); await p.waitForTimeout(100);
ok(await campos.nth(1).inputValue() === '45:00', 'al corregir el ritmo se recalcula el tiempo y la distancia se mantiene');
// R5: si desactivan el código mientras valora, se cierra la sesión con aviso.
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(300);
await p.evaluate(() => { const x = JSON.parse(localStorage.beep_demo_db); x.codigos['DEMO-BEEP22'].activo = false; localStorage.beep_demo_db = JSON.stringify(x); });
await p.click('.pie-fijo .boton-principal'); await p.waitForTimeout(400);
ok((await estado()).pantalla === 'entrar' && /desactivado/.test(await p.locator('#error-codigo').innerText()), 'código desactivado al guardar: sesión cerrada con aviso');
await p.evaluate(() => { const x = JSON.parse(localStorage.beep_demo_db); x.codigos['DEMO-BEEP22'].activo = true; localStorage.beep_demo_db = JSON.stringify(x); });
// R6: cerrar sesión no se deshace con atrás y recargar.
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await p.waitForTimeout(500);
ok((await estado()).pantalla === 'entrar' && (await p.inputValue('#codigo')) === 'DEMO-BEEP22', 'tras un cierre, el enlace deja el código escrito en vez de entrar solo');
await p.click('button[type=submit]'); await p.waitForTimeout(500);
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22#/ajustes`); await p.waitForTimeout(400);
await p.locator('button', { hasText: 'Cerrar sesión' }).click();
await p.locator('dialog .boton-principal').click(); await p.waitForTimeout(300);
await p.goBack(); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(500);
ok((await estado()).pantalla === 'entrar' && (await p.inputValue('#codigo')) === 'DEMO-BEEP22', 'tras cerrar sesión, atrás y recargar no vuelve a entrar (el código queda escrito)');
// R9: el domingo, la sesión de hoy se ve sin bajar.
await p.click('button[type=submit]'); await p.waitForTimeout(500);
await p.goto(`${BASE}?hoy=2026-11-22`); await p.waitForTimeout(500);
const caja = await p.locator('.es-hoy .tarjeta-sesion').boundingBox();
ok(caja && caja.y >= 0 && caja.y + caja.height <= 659, 'el domingo la tarjeta de hoy queda dentro de la pantalla');
ok((await p.locator('.es-hoy .dia-etiqueta b').innerText()) === 'HOY', 'y su día pone «HOY»');
// R15: el tema se cambia con flechas.
await p.goto(`${BASE}?hoy=2026-11-19#/ajustes`); await p.waitForTimeout(400);
await p.locator('.segmentado [aria-checked="true"]').focus();
await p.keyboard.press('ArrowRight');
ok(await p.locator('.segmentado [aria-checked="true"]').innerText() === 'Claro', 'las flechas cambian el tema');
await p.keyboard.press('ArrowLeft');

for (const ruta of ['#/', '#/ajustes']) { await p.goto(`${BASE}?hoy=2026-11-19${ruta}`); await p.waitForTimeout(300); await sinBasura(ruta); }
await b.close();
srv.cerrar();
console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'Sin errores');
process.exit(errores.length ? 1 : 0);
