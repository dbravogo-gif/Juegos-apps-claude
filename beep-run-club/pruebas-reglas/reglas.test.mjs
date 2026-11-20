// Pruebas de las reglas de seguridad (firestore.rules) con el emulador de Firestore.
// Se lanzan con `npm test` dentro de esta carpeta (necesita Java y firebase-tools).
import { test, before, after } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, getDocs, collection, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';

let env;
const ACEPTA = { version: '2026-11-20', fecha: '2026-11-20T10:00:00.000Z' };
const registro = (extra = {}) => ({
  sesion: 's1', fecha: '2026-11-20', hechos: ['e1'], esfuerzo: 7, duros: [], carrera: {}, comentario: '', strava: '',
  actualizado: serverTimestamp(), ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-beep',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(async () => { await env?.cleanup(); });

async function sembrar() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, 'entrenadores/entrenador1'), { nombre: 'Club' });
    await setDoc(doc(db, 'atletas/A'), { nombre: 'Ana', codigo: 'ANA-AAAAAA', activo: true, archivado: false });
    await setDoc(doc(db, 'codigos/ANA-AAAAAA'), { atleta: 'A', activo: true });
    await setDoc(doc(db, 'atletas/A/sesiones/s1'), { fecha: '2026-11-20', titulo: 'Rodaje', nota: '', intensidad: 'suave', ejercicios: [{ id: 'e1', nombre: 'Rodaje' }] });
    await setDoc(doc(db, 'atletas/B'), { nombre: 'Bea', codigo: 'BEA-BBBBBB', activo: true, archivado: false });
    await setDoc(doc(db, 'codigos/BEA-BBBBBB'), { atleta: 'B', activo: true });
    await setDoc(doc(db, 'atletas/B/sesiones/s9'), { fecha: '2026-11-20', titulo: 'Series', nota: '', intensidad: 'exigente', ejercicios: [] });
    await setDoc(doc(db, 'club/politica'), { version: 'v1', resumen: ['x'], secciones: [], responsable: { nombre: 'C', email: 'c@c.es' } });
  });
}
const anonimo = (uid) => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const entrenador = () => env.authenticatedContext('entrenador1').firestore();
const nadie = () => env.unauthenticatedContext().firestore();
const registrar = (db, codigo, uid) => setDoc(doc(db, `codigos/${codigo}/dispositivos/${uid}`), { alta: serverTimestamp(), privacidad: ACEPTA });

test('sin cuenta: se lee un código concreto y la política, pero no se listan códigos ni se ve un atleta', async () => {
  await sembrar();
  await assertSucceeds(getDoc(doc(nadie(), 'codigos/ANA-AAAAAA')));
  await assertSucceeds(getDoc(doc(nadie(), 'club/politica')));
  await assertFails(getDocs(collection(nadie(), 'codigos')));
  await assertFails(getDoc(doc(nadie(), 'atletas/A')));
  await assertFails(getDoc(doc(nadie(), 'club/biblioteca')));
});

test('un móvil sin registrar no ve nada del atleta', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await assertFails(getDoc(doc(db, 'atletas/A')));
  await assertFails(getDocs(collection(db, 'atletas/A/sesiones')));
});

test('registrado con su código: ve su plan y escribe su valoración, pero no la de otro atleta', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await assertSucceeds(registrar(db, 'ANA-AAAAAA', 'movil1'));
  await assertSucceeds(getDoc(doc(db, 'atletas/A')));
  await assertSucceeds(getDocs(query(collection(db, 'atletas/A/sesiones'), where('fecha', '>=', '2026-11-16'), where('fecha', '<=', '2026-11-22'))));
  await assertSucceeds(setDoc(doc(db, 'atletas/A/registros/s1'), registro()));
  await assertSucceeds(getDoc(doc(db, 'atletas/A/registros/s1')));
  await assertFails(getDoc(doc(db, 'atletas/B')));
  await assertFails(getDocs(collection(db, 'atletas/B/sesiones')));
  await assertFails(setDoc(doc(db, 'atletas/B/registros/s9'), registro({ sesion: 's9' })));
});

test('el móvil solo se registra a sí mismo, con un código activo y con los campos justos', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await assertFails(registrar(db, 'ANA-AAAAAA', 'otro-movil'));
  await assertFails(setDoc(doc(db, 'codigos/ANA-AAAAAA/dispositivos/movil1'), { alta: serverTimestamp(), privacidad: ACEPTA, admin: true }));
  await assertFails(setDoc(doc(db, 'codigos/ANA-AAAAAA/dispositivos/movil1'), { alta: serverTimestamp(), privacidad: { version: 1 } }));
  await assertFails(registrar(db, 'NADIE-ZZZZZZ', 'movil1'));
  await assertSucceeds(registrar(db, 'ANA-AAAAAA', 'movil1'));
  await assertSucceeds(registrar(db, 'ANA-AAAAAA', 'movil1')); // volver a aceptar (política nueva)
  await assertFails(getDocs(collection(db, 'codigos/ANA-AAAAAA/dispositivos')));
});

test('valoraciones inválidas se rechazan', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await registrar(db, 'ANA-AAAAAA', 'movil1');
  const ruta = doc(db, 'atletas/A/registros/s1');
  await assertFails(setDoc(ruta, registro({ esfuerzo: 11 })));
  await assertFails(setDoc(ruta, registro({ esfuerzo: 7.5 })));
  await assertFails(setDoc(ruta, registro({ strava: 'https://strava.com.malo.es/x' })));
  await assertFails(setDoc(ruta, registro({ strava: 'javascript:alert(1)' })));
  await assertFails(setDoc(ruta, registro({ comentario: 'x'.repeat(1001) })));
  await assertFails(setDoc(ruta, registro({ extra: 1 })));
  await assertFails(setDoc(ruta, registro({ actualizado: 123 })));
  await assertFails(setDoc(doc(db, 'atletas/A/registros/noexiste'), registro({ sesion: 'noexiste' })));
  await assertSucceeds(setDoc(ruta, registro({ strava: 'https://www.strava.com/activities/1' })));
  await assertSucceeds(setDoc(ruta, registro({ strava: 'https://strava.app.link/abc' })));
  await assertFails(deleteDoc(ruta));
});

test('código desactivado o regenerado: el móvil pierde el acceso', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await registrar(db, 'ANA-AAAAAA', 'movil1');
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'codigos/ANA-AAAAAA'), { atleta: 'A', activo: false }));
  await assertFails(getDoc(doc(db, 'atletas/A')));
  await assertFails(setDoc(doc(db, 'atletas/A/registros/s1'), registro()));
  await assertFails(registrar(db, 'ANA-AAAAAA', 'movil1'));
  // Código nuevo: el móvil registrado en el anterior ya no entra.
  await env.withSecurityRulesDisabled(async (c) => {
    const x = c.firestore();
    await setDoc(doc(x, 'codigos/ANA-NUEVO2'), { atleta: 'A', activo: true });
    await setDoc(doc(x, 'atletas/A'), { nombre: 'Ana', codigo: 'ANA-NUEVO2', activo: true, archivado: false });
  });
  await assertFails(getDoc(doc(db, 'atletas/A')));
});

test('un móvil no puede tocar el plan, los códigos ni la política', async () => {
  await sembrar();
  const db = anonimo('movil1');
  await registrar(db, 'ANA-AAAAAA', 'movil1');
  await assertFails(setDoc(doc(db, 'atletas/A/sesiones/s1'), { fecha: '2026-11-20', titulo: 'Hackeada', ejercicios: [] }));
  await assertFails(setDoc(doc(db, 'atletas/A'), { nombre: 'Ana', codigo: 'ANA-AAAAAA', activo: true }));
  await assertFails(setDoc(doc(db, 'codigos/ANA-AAAAAA'), { atleta: 'A', activo: true }));
  await assertFails(setDoc(doc(db, 'club/politica'), { version: 'falsa' }));
  await assertFails(setDoc(doc(db, 'entrenadores/movil1'), { nombre: 'Yo' }));
  await assertFails(getDocs(collection(db, 'atletas')));
});

test('el entrenador lo puede todo; una cuenta con email que no está en entrenadores, nada', async () => {
  await sembrar();
  const db = entrenador();
  await assertSucceeds(getDocs(collection(db, 'atletas')));
  await assertSucceeds(getDocs(collection(db, 'codigos')));
  await assertSucceeds(setDoc(doc(db, 'atletas/A/sesiones/s2'), { fecha: '2026-11-21', titulo: 'Nueva', ejercicios: [] }));
  await assertSucceeds(setDoc(doc(db, 'club/politica'), { version: 'v2' }));
  await assertSucceeds(getDocs(collection(db, 'codigos/ANA-AAAAAA/dispositivos')));
  await assertSucceeds(getDoc(doc(db, 'entrenadores/entrenador1')));
  const intruso = env.authenticatedContext('intruso').firestore();
  await assertFails(getDocs(collection(intruso, 'atletas')));
  await assertFails(setDoc(doc(intruso, 'club/politica'), { version: 'x' }));
  await assertFails(getDoc(doc(intruso, 'entrenadores/entrenador1')));
});
