// La app de verdad contra los emuladores de Firebase (Auth y Firestore, con las reglas reales):
// el entrenador da de alta a un atleta y le crea una sesión, el atleta acepta la política, valora
// (también sin conexión) y el entrenador lo ve. Se lanza desde pruebas-reglas con `npm run e2e`.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
import { servir } from './servidor.mjs';

const PROYECTO = 'beep-run-club';
const FS = 'http://127.0.0.1:8080';
const AUTH = 'http://127.0.0.1:9099';
const OUT = process.argv[2] ?? null;
const errores = [];
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) errores.push(msg); };

// Reglas reales y cuenta de entrenador de prueba.
const reglas = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
let r = await fetch(`${FS}/emulator/v1/projects/${PROYECTO}:securityRules`, { method: 'PUT', body: JSON.stringify({ rules: { files: [{ name: 'firestore.rules', content: reglas }] } }) });
ok(r.ok, 'reglas cargadas en el emulador');
await fetch(`${FS}/emulator/v1/projects/${PROYECTO}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROYECTO}/accounts`, { method: 'DELETE' });
r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=prueba`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'entrenador@prueba.es', password: 'clave-de-prueba-123', returnSecureToken: true }) });
const { localId } = await r.json();
r = await fetch(`${FS}/v1/projects/${PROYECTO}/databases/(default)/documents/entrenadores/${localId}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: { nombre: { stringValue: 'Club de prueba' } } }) });
ok(r.ok && !!localId, 'cuenta de entrenador de prueba creada');

const srv = await servir();
const BASE = `${srv.url}/beep-run-club/`;
const b = await chromium.launch();
async function nuevo(userAgent) {
  const ctx = await b.newContext({ viewport: { width: 393, height: 740 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', ...(userAgent ? { userAgent } : {}) });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(`página: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errores.push(`consola: ${m.text()}`); });
  return { ctx, p };
}
const espera = (p, ms = 700) => p.waitForTimeout(ms);
const foto = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const HOY = '2026-11-19';

// --- Entrenador ---
const E = await nuevo();
await E.p.goto(`${BASE}entrenador/?emulador&hoy=${HOY}`); await espera(E.p, 1200);
ok(await E.p.locator('#email').count() === 1, 'el panel pide email y contraseña');
await E.p.fill('#email', 'entrenador@prueba.es'); await E.p.fill('#clave', 'mal');
await E.p.click('button[type=submit]'); await espera(E.p, 1200);
ok(/incorrectos/.test(await E.p.locator('.error').innerText()), 'contraseña mala: avisa');
await E.p.fill('#clave', 'clave-de-prueba-123');
await E.p.click('button[type=submit]'); await espera(E.p, 1500);
ok(await E.p.evaluate(() => window.__BEEP__.estado().dentro) === true, 'con la contraseña buena entra en el panel');
ok(/Todavía no hay valoraciones/.test(await E.p.locator('body').innerText()), 'novedades vacías al principio');
await E.p.click('a[href="#/atletas"]'); await espera(E.p);
await E.p.locator('button', { hasText: 'Nuevo atleta' }).click();
await E.p.fill('#nombre-atleta', 'Prueba Uno');
await E.p.locator('dialog .boton-principal').click(); await espera(E.p, 1500);
const codigo = (await E.p.locator('dialog .codigo-grande').innerText()).trim();
ok(/^PRUEBA-[A-Z2-9]{6}$/.test(codigo), `atleta creado en Firestore con código ${codigo}`);
await E.p.locator('dialog .boton-principal').click(); await espera(E.p, 1200);
await E.p.locator('.dia-panel.es-hoy a.boton-mini').click(); await espera(E.p, 1000);
await E.p.fill('#titulo', 'Rodaje de prueba');
await E.p.locator('input[name="nombre"]').first().fill('Rodaje');
await E.p.locator('fieldset input[type=checkbox]').first().check();
await E.p.locator('.intensidad button', { hasText: 'Exigente' }).click();
await E.p.locator('.pie-fijo .boton-principal').click(); await espera(E.p, 1500);
ok(await E.p.locator('.dia-panel.es-hoy .tarjeta').count() === 1, 'la sesión se guarda en Firestore y aparece en su semana');
await E.p.goto(`${BASE}entrenador/?emulador&hoy=${HOY}#/club`); await espera(E.p, 1500);
await E.p.fill('#resp-nombre', 'Club de Prueba'); await E.p.fill('#resp-email', 'club@prueba.es');
await E.p.locator('.pie-fijo .boton-principal').click(); await espera(E.p, 300);
await E.p.locator('dialog button', { hasText: 'Pedir que la acepten de nuevo' }).click(); await espera(E.p, 1500);
ok(/La han aceptado 0 de 1/.test(await E.p.locator('body').innerText()), 'política publicada en Firestore');

// --- Atleta (iPhone) ---
const A = await nuevo(IPHONE);
await A.p.goto(`${BASE}?emulador&hoy=${HOY}&c=${codigo}`); await espera(A.p, 1500);
ok((await A.p.locator('h1').innerText()) === 'Antes de empezar', 'el atleta abre el enlace: protección de datos');
ok(/Club de Prueba/.test(await A.p.locator('.detalle-legal').textContent()), 'con la política que guardó el entrenador');
await A.p.check('#acepto'); await A.p.locator('button', { hasText: 'Aceptar y continuar' }).click(); await espera(A.p, 2000);
await A.p.locator('button', { hasText: 'Ahora no' }).click(); await espera(A.p, 1500);
ok((await A.p.locator('h1').innerText()) === 'Hola, Prueba', 'entra con su móvil registrado en Firestore');
ok(/Rodaje de prueba/.test(await A.p.locator('.es-hoy').innerText()), 've la sesión que le creó el entrenador');
await A.p.click('.es-hoy .tarjeta-sesion'); await espera(A.p);
await A.p.click('.pie-fijo .boton-principal'); await espera(A.p);
await A.p.click('.esfuerzo button:nth-child(9)');
await A.p.fill('#strava', 'https://www.strava.com/activities/123');
await A.p.click('.pie-fijo .boton-principal'); await espera(A.p, 1500);
ok(/ya puede ver/.test(await A.p.locator('main').innerText()), 'la valoración llega al servidor');
await foto(A.p, '60-atleta-firebase');

// Sin conexión: se guarda en el móvil y se envía al volver.
await A.p.goto(`${BASE}?emulador&hoy=${HOY}`); await espera(A.p, 1500);
await A.ctx.setOffline(true);
await A.p.click('.es-hoy .tarjeta-sesion'); await espera(A.p);
await A.p.click('.pie-fijo .boton-principal'); await espera(A.p);
await A.p.click('.esfuerzo button:nth-child(5)');
await A.p.fill('#comentario', 'Escrito sin cobertura');
await A.p.click('.pie-fijo .boton-principal'); await espera(A.p, 5500);
ok(/se enviará/.test(await A.p.locator('main').innerText()), 'sin conexión: «se enviará en cuanto tengas cobertura»');
await A.ctx.setOffline(false); await espera(A.p, 3000);

// --- El entrenador lo ve ---
await E.p.goto(`${BASE}entrenador/?emulador&hoy=${HOY}#/novedades`); await espera(E.p, 2000);
const primera = await E.p.locator('.tarjeta').first().innerText();
ok(/Prueba Uno · Rodaje de prueba/.test(primera) && /Escrito sin cobertura/.test(primera), 'la valoración hecha sin conexión llegó al entrenador al volver la cobertura');
await foto(E.p, '61-entrenador-firebase');
await E.p.goto(`${BASE}entrenador/?emulador&hoy=${HOY}#/club`); await espera(E.p, 1500);
ok(/La han aceptado 1 de 1/.test(await E.p.locator('body').innerText()), 'cuenta la aceptación del atleta');

// --- Desactivar el código echa al atleta ---
await E.p.click('a[href="#/atletas"]'); await espera(E.p, 1200);
await E.p.locator('.tarjeta', { hasText: 'Prueba Uno' }).click(); await espera(E.p, 1200);
await E.p.locator('button', { hasText: 'Desactivar código' }).click();
await E.p.locator('dialog .boton-principal').click(); await espera(E.p, 1500);
await A.p.goto(`${BASE}?emulador&hoy=${HOY}`); await espera(A.p, 2000);
ok(await A.p.evaluate(() => window.__BEEP__.estado().pantalla) === 'entrar' && /desactivado/.test(await A.p.locator('#error-codigo').innerText()), 'con el código desactivado, el atleta queda fuera');

await b.close();
srv.cerrar();
console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'Sin errores');
process.exit(errores.length ? 1 : 0);
