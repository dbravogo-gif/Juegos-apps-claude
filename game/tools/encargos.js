/**
 * Encargos de imagen: qué pedirle al generador para cada archivo que falta.
 *
 * Cada encargo produce UNA imagen. Las hojas de poses van de una en una porque son lo
 * difícil; los objetos van de varios en varios en la misma imagen —el script de recorte los
 * separa luego por su silueta—, que sale más barato y además deja la misma luz y el mismo
 * trazo en toda la tanda.
 *
 *   node tools/encargos.js           # lista los encargos pendientes con su prompt
 *   node tools/encargos.js --cubre   # comprueba que no falta ningún archivo por encargar
 *
 * `refs` son las imágenes ya hechas que se mandan como referencia de estilo o identidad.
 */
import fs from 'node:fs';
import { ZONAS, ESPACIOS, MUEBLES, EQUIPO, MASCOTAS, ETAPAS_PERSONAJE } from '../src/data/content.js';

const ESTILO =
  'Fantasy RPG game art in EXACTLY the same art style as the reference images: hand-drawn ' +
  'cartoon illustration, clean dark ink outlines, flat cel shading, warm earthy palette of ' +
  'bronze, rust, cream and muted teal, Greek-key meander trim on cloth. Byzantine-inspired ' +
  'fantasy, not historical. Same proportions and level of detail as the references.';

const VERDE =
  'Background: flat solid pure chroma-key green (#00FF00), completely uniform, no gradient, ' +
  'no floor, no shadow, no ground line. Do not use green anywhere on the subject. No text, ' +
  'no labels, no borders, no frames.';

const TERCIOS =
  'ONE single image with THREE poses of the SAME character side by side in a horizontal row, ' +
  'each centered in its own third, all the same size, standing on the same ground line, full ' +
  'body head to feet. Nothing may cross into a neighbouring third: no motion trails, no ' +
  'effects, generous empty margin between the figures.';

const hoja = (destino, refs, sujeto, poses, extra = '') => ({
  destino, refs, tipo: 'hoja', aspecto: '3:2', resolucion: '1K',
  prompt: `${ESTILO}\n\nSubject: ${sujeto}\n\nLayout: ${TERCIOS}\n${poses.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n${extra}\n\n${VERDE}`,
});

const POSES_ENEMIGO = [
  'Left: on guard, standing still, facing the viewer.',
  'Center: its clearest attack gesture, facing the viewer.',
  'Right: taking damage, recoiling backwards, wincing.',
];

const enemigo = (id, sujeto) =>
  hoja(`enemigos/${id}`, ['guardian', 'heroe'], sujeto, POSES_ENEMIGO,
    'All three face the camera (front view, slightly elevated camera).');

// --- Héroe ---
// El aspecto va con el nivel y nunca con el peso levantado. Misma cara, mismo pelo, mismo
// cuerpo en todas las etapas: lo que cambia es el equipo y la seguridad con que se planta.
const ETAPA = {
  etapa2: 'the SAME young hero as the references (same face, same messy brown hair, same build), now a seasoned fighter: a bronze cuirass over the cream tunic, leather pteruges, the same teal cape, a sturdier round bronze-rimmed shield, a better short sword. More confident stance.',
  etapa3: 'the SAME hero as the references (same face and hair, slightly older), now a veteran: bronze scale armour, longer teal cape with gold Greek-key trim, an open-faced crested helmet that keeps the face visible, a large decorated round shield and a fine straight sword.',
  etapa4: 'the SAME hero as the references (same face and hair), now a legendary champion: ornate gilded armour with Byzantine mosaic motifs, a rich crimson-and-teal cape, a thin golden diadem, an ornate shield and a ceremonial sword. Calm, heroic bearing.',
};

const heroe = Object.entries(ETAPA).flatMap(([id, sujeto]) => [
  hoja(`personaje/${id}`, ['heroe'], sujeto, [
    'Left: standing still, relaxed, facing the viewer (portrait pose).',
    'Center: celebrating victory, both fists raised, big smile.',
    'Right: kneeling in defeat, head down, sword on the ground.',
  ], 'All three face the camera (front view).'),
  hoja(`personaje/${id}_combate`, ['heroe', 'heroe_combate'], sujeto, [
    'Left: seen FROM BEHIND in a three-quarter diagonal view, standing in guard, facing into the image towards the upper right.',
    'Center: seen FROM BEHIND in the same diagonal, attacking with the sword towards the upper right.',
    'Right: seen FROM BEHIND in the same diagonal, recoiling from a hit.',
  ], 'Keep exactly the same back-diagonal camera as the combat reference sheet.'),
]);

const guia = hoja('personaje/etapa1_guia', ['heroe'],
  'the SAME young hero as the references, framed from the waist up (half body), acting as a friendly teacher.',
  [
    'Left: waving hello with one raised hand, warm smile.',
    'Center: arm extended pointing clearly DOWNWARDS and slightly to his left.',
    'Right: thumbs up, approving grin.',
  ], 'Half-body framing in all three, facing the camera.');

// --- Enemigos ---
const enemigos = [
  enemigo('bandido_harapiento', 'a ragged street bandit, lean and scruffy, stubble, patched cream-and-rust tunic, tattered hood pulled back, rope belt, worn sandals, a short curved dagger. Shifty, cocky.'),
  enemigo('gargola_agrietada', 'a cracked stone gargoyle, crouched on its hind legs, folded stone wings, weathered grey stone with ochre lichen and deep cracks, small horns, clawed hands.'),
  enemigo('cangrejo_coloso', 'a colossal harbour crab, bronze-tinted shell crusted with barnacles and rope scraps, one huge claw, stalked eyes.'),
  enemigo('marinero_espectral', 'a spectral sailor, pale blue-grey ghostly skin painted fully opaque, tattered sailor clothes, a rusty cutlass and a hanging lantern, hollow glowing eyes.'),
  enemigo('anguila_abisal', 'an abyssal eel rearing upright on its coiled tail, dark violet body with cyan glowing spots, wide fanged mouth, fin crest.'),
  enemigo('bestia_cuerno', 'BOSS: the Beast of the Golden Horn, a huge horned sea serpent-dragon standing tall, a single great golden horn, bronze and teal scales, webbed claws. Clearly bigger and more imposing.'),
  enemigo('ladron_bazar', 'an agile bazaar thief, scarf over the lower face, hooded, loose rust-and-cream clothes, a curved knife and a stolen coin pouch.'),
  enemigo('automata_especias', 'a brass clockwork automaton carrying spice jars, riveted brass body, visible gears, little puffs of steam, glowing amber eyes.'),
  enemigo('serpiente_seda', 'a serpent made of patterned silk ribbons, coiled upright, ornate Byzantine patterns in crimson, cream and gold, a hooded head.'),
  enemigo('el_coleccionista', 'BOSS: the Collector, a tall mysterious robed figure covered in trinkets, keys and small masks, an ornate staff hung with relics, a golden mask for a face. Clearly more imposing.'),
];

// --- Fondos ---
const FONDO_BASE = `${ESTILO}\n\nA game scene background, full image, NO transparency, no characters or creatures, front view with a slightly elevated camera, high horizon in the upper third so the lower half is ground. The lower half must stay CLEAR and empty because characters and furniture are placed on top. Soft depth: the far background slightly faded. No text.`;
const fondo = (destino, refs, escena, extra = '') => ({
  destino, refs, tipo: 'fondo', aspecto: '3:2', resolucion: '1K',
  prompt: `${FONDO_BASE}\n\nScene: ${escena}\n${extra}`,
});
const SUELO = 'The floor must be continuous and flat from the middle of the image down, with no steps and no furniture painted on it, reading as a plane that recedes into depth.';

const fondos = [
  fondo('zonas/puerto', ['murallas'], 'a Byzantine-fantasy harbour: wooden docks, coiled ropes, crates at the edges, moored ships and calm sea in the distance, gulls.'),
  fondo('zonas/bazar', ['murallas'], 'a grand covered bazaar: tall arches, hanging lamps and fabrics, closed stalls along the sides.'),
  fondo('espacios/patio', ['habitacion'], 'the open-air courtyard of a modest house: packed earth and worn stone floor, low whitewashed walls, a doorway at the back, sky above.', SUELO),
  fondo('espacios/huerto', ['habitacion'], 'a small walled garden plot: tilled earth and a stone path, low walls, a few distant trees beyond the wall.', SUELO),
  fondo('espacios/taller', ['habitacion'], 'an empty craftsman\'s workshop interior: plank floor, brick back wall with tools hanging only at the sides, high window.', `${SUELO} Leave the upper third of the back wall free for hanging pictures.`),
  fondo('espacios/terraza', ['habitacion'], 'a rooftop terrace overlooking a domed city at dusk: tiled floor, a low balustrade at the back.', SUELO),
];

// --- Objetos, en tandas ---
const OBJETO = 'Each object standing upright, front view with a slightly elevated camera, its base flat and horizontal.';
const tanda = (carpeta, ids, describir, como = OBJETO) => ({
  destino: `${carpeta}/${ids.join('+')}`, refs: ['guardian'], tipo: 'objetos',
  aspecto: ids.length > 3 ? '21:9' : '16:9', resolucion: '2K',
  prompt: `${ESTILO}\n\nA row of ${ids.length} SEPARATE game item icons side by side, evenly spaced, widely separated, none touching or overlapping, each fully visible:\n${ids.map((id, i) => `${i + 1}. ${describir[id]}`).join('\n')}\n${como}\n\n${VERDE}`,
});

const MUEBLE = Object.fromEntries(MUEBLES.map((m) => [m.id, m.nombre]));
const DESCRIPCION_MUEBLE = {
  ...MUEBLE,
  mub_farol: 'Farol: an iron lantern standing on a short wrought-iron post',
  mub_fuente: 'Fuente de mármol: a small round marble fountain with a basin',
};

const muebles = [
  ['mub_taburete', 'mub_banco', 'mub_mesa_baja', 'mub_arcon'],
  ['mub_vela', 'mub_maceta', 'mub_anfora', 'mub_divan'],
  ['mub_mesa_cobre', 'mub_jergon', 'mub_lecho', 'mub_estante'],
  ['mub_farol', 'mub_trono', 'mub_escritorio', 'mub_vitrina'],
  ['mub_lampara', 'mub_olivo', 'mub_parra', 'mub_naranjo'],
  ['mub_brasero', 'mub_columna', 'mub_fuente'],
].map((ids) => tanda('muebles', ids, DESCRIPCION_MUEBLE));

muebles.push(
  tanda('muebles', ['mub_estera', 'mub_alfombra', 'mub_alfombra_seda'], DESCRIPCION_MUEBLE,
    'Each rug seen from high above, almost flat on the ground, like a sheet lying on the floor.'),
  tanda('muebles', ['mub_tapiz', 'mub_mosaico', 'mub_icono_pared', 'mub_mapa'], DESCRIPCION_MUEBLE,
    'Wall pieces seen straight on and flat, no perspective at all, as if looked at face to face.'),
);

const PIEZA = Object.fromEntries(EQUIPO.map((e) => [e.id, e.nombre]));
const equipo = [
  tanda('equipo', ['arma_baston', 'arma_espada_corta', 'arma_hacha'], PIEZA,
    'Each weapon on a 45-degree diagonal, handle bottom-left and tip top-right, clean side profile, like an inventory icon.'),
  tanda('equipo', ['arma_sable', 'arma_lanza', 'arma_ceremonial'], PIEZA,
    'Each weapon on a 45-degree diagonal, handle bottom-left and tip top-right, clean side profile, like an inventory icon.'),
  tanda('equipo', ['arm_tunica', 'arm_cuero', 'arm_escamas'], PIEZA,
    'Each armour front view, straight and symmetrical, as if hung on an invisible mannequin.'),
  tanda('equipo', ['arm_placas', 'arm_mosaico'], PIEZA,
    'Each armour front view, straight and symmetrical, as if hung on an invisible mannequin.'),
  tanda('equipo', ['acc_amuleto', 'acc_anillo', 'acc_reliquia', 'acc_icono'], PIEZA,
    'Each accessory front view, straight and centred, like a piece of jewellery.'),
];

const MASCOTA = Object.fromEntries(MASCOTAS.map((m) => [m.id, m.nombre]));
const mascotas = [tanda('mascotas', ['gato', 'paloma', 'perro', 'cabra'], MASCOTA,
  'Each animal front view, full body, in a calm relaxed pose.')];

export const ENCARGOS = [...enemigos, guia, ...heroe, ...fondos, ...muebles, ...equipo, ...mascotas];

// --- Comprobación ---
const ASSETS = new URL('../assets/', import.meta.url).pathname;
const archivosDe = (e) => {
  const [carpeta, nombres] = e.destino.split('/');
  return nombres.split('+').map((n) => `${carpeta}/${n}.png`);
};

function necesarios() {
  return [
    ...ETAPAS_PERSONAJE.flatMap((e) => [`personaje/${e.id}.png`, `personaje/${e.id}_combate.png`]),
    'personaje/etapa1_guia.png',
    ...ZONAS.flatMap((z) => [`zonas/${z.id}.png`, ...[...z.enemigos, z.jefe].map((id) => `enemigos/${id}.png`)]),
    ...ESPACIOS.map((e) => `espacios/${e.id}.png`),
    ...MUEBLES.map((m) => `muebles/${m.id}.png`),
    ...EQUIPO.map((e) => `equipo/${e.id}.png`),
    ...MASCOTAS.map((m) => `mascotas/${m.id}.png`),
  ];
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const encargados = new Set(ENCARGOS.flatMap(archivosDe));
  const faltan = necesarios().filter((r) => !fs.existsSync(ASSETS + r));

  if (process.argv.includes('--cubre')) {
    const sinEncargo = faltan.filter((r) => !encargados.has(r));
    console.log(`${faltan.length} archivos pendientes, ${ENCARGOS.length} encargos en total.`);
    if (sinEncargo.length) {
      console.log('SIN ENCARGO:', sinEncargo.join(', '));
      process.exit(1);
    }
    console.log('Todo lo pendiente tiene su encargo.');
  } else {
    ENCARGOS.filter((e) => archivosDe(e).some((r) => faltan.includes(r))).forEach((e) =>
      console.log(`\n=== ${e.destino}  (${e.tipo}, ${e.aspecto}, ${e.resolucion}, refs: ${e.refs.join(', ')})\n${e.prompt}`));
  }
}
