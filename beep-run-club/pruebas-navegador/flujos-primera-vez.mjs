// Pruebas de navegador de la primera vez y de lo añadido el 2026-11-20: protección de datos,
// tutorial de instalación (iPhone y Android), vista de mes, enlace de Strava e intensidad.
// Necesitan Playwright: no van en npm test.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { servir } from './servidor.mjs';
import { VERSION_PRIVACIDAD } from '../src/nucleo/privacidad.js';

const srv = await servir();
const BASE = `${srv.url}/beep-run-club/`;
const OUT = process.argv[2] ?? null;
const errores = [];
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
const b = await chromium.launch();
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) errores.push(msg); };

async function nuevoMovil(userAgent) {
  const ctx = await b.newContext({ viewport: { width: 393, height: 659 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', userAgent });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(`página: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(`consola: ${m.text()}`); });
  return { ctx, p };
}
const sinBasura = async (p, donde) => {
  const t = await p.evaluate(() => document.body.innerText);
  const m = /\b(null|undefined|NaN|\[object Object\])\b/.exec(t);
  if (m) errores.push(`«${m[1]}» en pantalla (${donde})`);
};
const foto = async (p, n) => { await sinBasura(p, n); if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };
const estado = (p) => p.evaluate(() => window.__BEEP__.estado());
const espera = (p, ms = 350) => p.waitForTimeout(ms);

// --- iPhone: protección de datos y tutorial ---
let { ctx, p } = await nuevoMovil(IPHONE);
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await espera(p, 600);
ok((await p.locator('h1').innerText()) === 'Antes de empezar', 'al abrir el enlace sale primero la protección de datos');
ok(await p.locator('button', { hasText: 'Aceptar y continuar' }).isDisabled(), 'no se puede aceptar sin marcar la casilla');
await p.locator('summary').click();
ok(/Agencia Española de Protección de Datos/.test(await p.locator('.detalle-legal').innerText()), 'la información completa se puede leer');
await foto(p, '40-privacidad');
await p.check('#acepto');
await p.locator('button', { hasText: 'Aceptar y continuar' }).click(); await espera(p);
ok((await estado(p)).pantalla === 'instalar' && /como una app/.test(await p.locator('h1').innerText()), 'después se ofrece el tutorial de instalación');
await foto(p, '41-ofrecer-tutorial');
const disp = await p.evaluate(() => Object.values(JSON.parse(localStorage.beep_demo_db).dispositivos['DEMO-BEEP22'])[0]);
ok(disp?.privacidad?.version === VERSION_PRIVACIDAD && !!disp.privacidad.fecha, 'la aceptación queda registrada con el móvil (versión y fecha)');
await p.locator('button', { hasText: 'Sí, enséñame' }).click(); await espera(p, 200);
ok((await p.locator('h1').innerText()) === '¿Qué móvil usas?', 'el tutorial pregunta primero si es iPhone o Android');
await foto(p, '42-elegir-movil');
await p.locator('.opcion-movil', { hasText: 'Android' }).click(); await espera(p, 200);
ok(/⋮/.test(await p.locator('h1').innerText()), 'si elige Android, salen los pasos de Android');
await p.locator('.pasos-botones button', { hasText: 'Anterior' }).click(); await espera(p, 200);
ok((await p.locator('h1').innerText()) === '¿Qué móvil usas?', '«Anterior» en el paso 1 vuelve a elegir el móvil');
await p.locator('.opcion-movil', { hasText: 'iPhone' }).click(); await espera(p, 200);
ok(/paso 1 de 3/i.test(await p.locator('.antetitulo').innerText()) && /Compartir/.test(await p.locator('h1').innerText()), 'iPhone: el paso 1 es el botón Compartir');
await foto(p, '42b-paso1-iphone');
await p.locator('button', { hasText: 'Siguiente' }).click(); await espera(p, 200);
await p.locator('button', { hasText: 'Cambiar de móvil' }).click(); await espera(p, 200);
ok((await p.locator('h1').innerText()) === '¿Qué móvil usas?', 'desde cualquier paso se puede cambiar de móvil');
await p.locator('.opcion-movil', { hasText: 'iPhone' }).click(); await espera(p, 200);
await p.locator('button', { hasText: 'Siguiente' }).click();
await p.locator('button', { hasText: 'Siguiente' }).click(); await espera(p, 200);
ok(/DEMO-BEEP22/.test(await p.locator('.recordatorio-codigo').innerText()), 'el último paso recuerda el código por si lo pide');
await foto(p, '43-paso3-iphone');
await p.locator('button', { hasText: 'Hecho' }).click(); await espera(p);
ok((await estado(p)).pantalla === 'semana', 'al terminar, a su semana');
await p.reload(); await espera(p, 500);
ok((await estado(p)).pantalla === 'semana', 'al volver a abrir, ni protección de datos ni tutorial otra vez');
await p.goto(`${BASE}?hoy=2026-11-19#/privacidad`); await espera(p);
ok(/La aceptaste el/.test(await p.locator('body').innerText()), 'en Ajustes se puede releer y dice cuándo se aceptó');

// --- Vista de mes ---
await p.goto(`${BASE}?hoy=2026-11-19#/`); await espera(p);
await p.locator('.selector-vista button', { hasText: 'Mes' }).click(); await espera(p, 500);
ok((await estado(p)).pantalla === 'mes' && /Noviembre 2026/.test(await p.locator('.rango').innerText()), 'el selector abre la vista de mes');
const suaves = await p.locator('.mes-rejilla .dia-mes.suave').count();
const exigentes = await p.locator('.mes-rejilla .dia-mes.exigente').count();
ok(suaves > 0 && exigentes > 0, `dos colores: ${suaves} días suaves y ${exigentes} exigentes`);
ok(await p.locator('.mes-rejilla .dia-mes.hoy').count() === 1, 'hoy está marcado');
ok(await p.locator('.mes-rejilla .marca-hecha').count() >= 2, 'los días valorados llevan su marca');
await foto(p, '44-mes');
await p.locator('.mes-rejilla .dia-mes.hoy').click(); await espera(p);
ok((await estado(p)).pantalla === 'sesion', 'tocar un día con sesión la abre');
await p.click('.cabecera .boton-icono'); await espera(p);
ok((await estado(p)).pantalla === 'mes', 'volver desde la sesión lleva al mes');
const caja = await p.locator('.mes-rejilla').boundingBox();
await p.mouse.move(caja.x + caja.width * 0.8, caja.y + 60); await p.mouse.down();
await p.mouse.move(caja.x + caja.width * 0.2, caja.y + 64, { steps: 5 }); await p.mouse.up(); await espera(p, 500);
ok(/Diciembre 2026/.test(await p.locator('.rango').innerText()), 'deslizar a la izquierda pasa al mes siguiente');
await p.goto(`${BASE}?hoy=2026-11-19#/`); await espera(p, 400);
ok((await estado(p)).pantalla === 'mes', 'la app recuerda la vista elegida');

// --- Enlace de Strava ---
await p.locator('.mes-rejilla .dia-mes.hoy').click(); await espera(p);
await p.click('.pie-fijo .boton-principal'); await espera(p);
await p.click('.esfuerzo button:nth-child(8)');
await p.fill('#strava', 'https://otra-web.com/actividad/1');
await p.click('.pie-fijo .boton-principal'); await espera(p);
ok(/Strava/.test(await p.locator('.pie-fijo .error').innerText()), 'un enlace que no es de Strava avisa');
await p.fill('#strava', 'strava.app.link/Beep123');
await foto(p, '45-valorar-strava');
await p.click('.pie-fijo .boton-principal'); await espera(p);
ok((await estado(p)).pantalla === 'hecho', 'con el enlace de Strava bien, se guarda');

// --- El entrenador: ve el enlace y marca una sesión como exigente ---
await p.goto(`${BASE}entrenador/?hoy=2026-11-19`); await espera(p, 500);
await p.click('button[type=submit]'); await espera(p);
ok(/con Strava/.test(await p.locator('.tarjeta').first().innerText()), 'en novedades se ve que trae Strava');
await p.locator('.tarjeta').first().click(); await espera(p);
ok((await p.locator('a.enlace-strava').getAttribute('href')) === 'https://strava.app.link/Beep123', 'el entrenador tiene el enlace a la actividad');
await foto(p, '46-entrenador-strava');
const ficha = (await p.url()).replace(/\/sesion\/.*$/, '');
await p.goto(ficha); await espera(p);
await p.locator('.dia-panel', { hasText: 'MAR 17' }).locator('a.tarjeta').click(); await espera(p);
await p.locator('.intensidad button', { hasText: 'Exigente' }).click();
await foto(p, '47-editor-intensidad');
await p.locator('.pie-fijo .boton-principal').click(); await espera(p);
await p.goto(`${BASE}?hoy=2026-11-19#/mes/2026-11`); await espera(p, 500);
const dia17 = p.locator('.mes-rejilla .dia-mes[aria-label*="17 de noviembre"]');
ok((await dia17.getAttribute('class')).includes('exigente'), 'el día que el entrenador marca como exigente cambia de color');
await ctx.close();

// --- Rechazar la protección de datos ---
({ ctx, p } = await nuevoMovil(IPHONE));
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await espera(p, 600);
await p.locator('button', { hasText: 'No acepto' }).click(); await espera(p);
ok((await estado(p)).pantalla === 'entrar' && /protección de datos/.test(await p.locator('#error-codigo').innerText()), 'si no acepta, no entra y se le explica');
ok((await p.inputValue('#codigo')) === 'DEMO-BEEP22', 'el código queda escrito para cuando quiera aceptar');
const sinRegistro = await p.evaluate(() => Object.keys(JSON.parse(localStorage.beep_demo_db).dispositivos['DEMO-BEEP22']).length);
ok(sinRegistro === 0, 'y este móvil no queda registrado');
await ctx.close();

// --- Android: el tutorial con los pasos de Chrome ---
({ ctx, p } = await nuevoMovil(ANDROID));
await p.goto(`${BASE}?hoy=2026-11-19&c=DEMO-BEEP22`); await espera(p, 600);
await p.check('#acepto'); await p.locator('button', { hasText: 'Aceptar y continuar' }).click(); await espera(p);
await p.locator('button', { hasText: 'Sí, enséñame' }).click(); await espera(p, 200);
await p.locator('.opcion-movil', { hasText: 'Android' }).click(); await espera(p, 200);
ok(/⋮/.test(await p.locator('h1').innerText()), 'Android: el paso 1 es el menú ⋮ de Chrome');
await foto(p, '48-paso1-android');
await ctx.close();

await b.close();
srv.cerrar();
console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'Sin errores');
process.exit(errores.length ? 1 : 0);
