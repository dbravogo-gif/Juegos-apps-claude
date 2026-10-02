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
import { ZONAS, ESPACIOS, MUEBLES, EQUIPO, MASCOTAS, ETAPAS_PERSONAJE, HABILIDADES } from '../src/data/content.js';

const ESTILO =
  'Fantasy RPG game art in EXACTLY the same art style as the reference images: hand-drawn ' +
  'cartoon illustration, clean dark ink outlines, flat cel shading, warm earthy palette of ' +
  'bronze, rust, cream and muted teal, Greek-key meander trim on cloth. Byzantine-inspired ' +
  'fantasy, not historical. Same proportions and level of detail as the references.';

const VERDE =
  'Background: flat solid pure chroma-key green (#00FF00), completely uniform, no gradient, ' +
  'no floor, no shadow, no ground line. Do not use green anywhere on the subject. No text, ' +
  'no labels, no border or frame around the whole image.';

// Las plantas van sobre magenta: quitar el verde también desatura cualquier tono verdoso
// del dibujo, y un árbol se quedaría con las hojas grises.
const MAGENTA =
  'Background: flat solid pure chroma-key magenta (#FF00FF), completely uniform, no gradient, ' +
  'no floor, no shadow, no ground line. Do not use magenta or pink anywhere on the subject. ' +
  'No text, no labels, no border or frame around the whole image.';

const TERCIOS =
  'ONE single image with THREE poses of the SAME character side by side in a horizontal row, ' +
  'each centered in its own third, all the same size, at the same height. Nothing may cross ' +
  'into a neighbouring third: no motion trails, no effects, generous empty margin between ' +
  'the figures.';

const CUERPO_ENTERO = 'Full body, head to feet, all three standing on the same ground line.';

const hoja = (destino, refs, sujeto, poses, extra = '', encuadre = CUERPO_ENTERO) => ({
  destino, refs, tipo: 'hoja', aspecto: '3:2', resolucion: '1K',
  prompt: `${ESTILO}\n\nSubject: ${sujeto}\n\nLayout: ${TERCIOS} ${encuadre}\n${poses.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n${extra}\n\n${VERDE}`,
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
  // Sin casco: la primera vez el casco le tapaba la cara, y la cara es lo que hace que se
  // le reconozca de una etapa a otra.
  etapa3: 'the SAME hero as the references (same face, same messy brown hair, slightly older), now a veteran: bronze scale armour, longer teal cape with gold Greek-key trim, a large decorated round shield and a fine straight sword. NO helmet: bare head, the face and hair fully visible in all three poses.',
  etapa4: 'the SAME hero as the references (same face and hair), now a legendary champion: ornate gilded armour with Byzantine mosaic motifs, a rich crimson-and-teal cape, a thin golden diadem, an ornate shield and a ceremonial sword. Calm, heroic bearing.',
};

// La hoja de frente de cada etapa se hace primero y sirve de referencia a la de espaldas:
// así la armadura sale igual por delante y por detrás. Las etapas altas miran además a la
// etapa 2 para que la progresión se lea como el mismo personaje creciendo.
const heroe = Object.entries(ETAPA).flatMap(([id, sujeto]) => [
  hoja(`personaje/${id}`, id === 'etapa2' ? ['heroe'] : ['heroe', 'etapa2'], sujeto, [
    'Left: standing still, relaxed, facing the viewer (portrait pose).',
    'Center: celebrating victory, both fists raised, big smile.',
    'Right: kneeling in defeat, head down, sword on the ground.',
  ], 'All three face the camera (front view).'),
  // De espaldas el generador se inventa el emblema del escudo en cada pose (salió un águila
  // en una y una estrella en otra: parpadea al animar) y en el golpe gira la cara a cámara.
  hoja(`personaje/${id}_combate`, [id, 'heroe_combate'], `${sujeto} The shield is decorated only with rings and a geometric rosette, no animals or emblems, and the shield and outfit are IDENTICAL in all three poses.`, [
    'Left: seen FROM BEHIND in a three-quarter diagonal view, standing in guard, facing into the image towards the upper right.',
    'Center: seen FROM BEHIND in the same diagonal, attacking with the sword towards the upper right.',
    'Right: seen FROM BEHIND in the same diagonal, recoiling from a hit, the head still turned away from the viewer: the back of the head, never the full face.',
  ], 'In ALL three poses the camera is behind the hero, exactly like the combat reference sheet.'),
]);

// La primera vez salió de cuerpo entero aunque se pedía medio cuerpo: el generador tira
// hacia la referencia. Por eso el encuadre se repite y se dice qué NO debe verse.
const guia = hoja('personaje/etapa1_guia', ['heroe'],
  'the SAME young hero as the reference (same face, messy brown hair, cream tunic, teal cape, bronze bracers), shown as a friendly teacher in a close PORTRAIT CROP.',
  [
    'Left: waving hello, one open hand raised beside his face, warm smile.',
    'Center: his arm fully extended DOWNWARDS, index finger pointing straight down at the ground in front of him, looking down where he points.',
    'Right: a big thumbs up held at chest height, approving grin.',
  ], 'All three facing the camera.',
  'CLOSE PORTRAIT CROP: each figure shows ONLY the head, shoulders, chest and arms, cut off just below the belt. The legs and feet must NOT appear at all. The head is large in the frame.');

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
  // Sin minaretes: una gran cúpula rodeada de minaretes es la Constantinopla de después de
  // la conquista, y el mundo del juego evita a propósito ese ángulo bélico.
  // Con la habitación de referencia salió una copia de la habitación: la misma columnata y
  // el mismo techo. El patio, que es un exterior, la lleva a cielo abierto.
  fondo('espacios/terraza', ['patio'], 'an OPEN-AIR rooftop terrace under the open dusk sky, with NO roof, NO ceiling and NO columns: a tiled floor and a low stone balustrade at the back, beyond which a fantasy city of domes, arches and terracotta roofs stretches away. The skyline has domes and bell towers only, absolutely NO minarets and no slender pointed towers.', SUELO),
];

// --- Objetos, en tandas ---
const OBJETO = 'Each object standing upright, front view with a slightly elevated camera, its base flat and horizontal.';
const tanda = (carpeta, ids, describir, como = OBJETO, refs = ['habitacion', 'guardian'], fondo = VERDE) => ({
  destino: `${carpeta}/${ids.join('+')}`, refs, tipo: 'objetos',
  // 1K basta: en pantalla un mueble no pasa de unos cien píxeles de ancho.
  aspecto: ids.length > 3 ? '21:9' : '16:9', resolucion: '1K',
  prompt: `${ESTILO}\n\nA row of ${ids.length} SEPARATE game item icons side by side, evenly spaced, widely separated, none touching or overlapping, each fully visible and as large as possible within its own ${{ 2: 'half', 3: 'third', 4: 'quarter' }[ids.length]} of the image:\n${ids.map((id, i) => `${i + 1}. ${describir[id]}`).join('\n')}\n${como}\n\n${fondo}`,
});

// Descripciones concretas: con el nombre a secas el generador improvisa, y «Mesa baja»
// puede ser cualquier cosa.
const DESCRIPCION_MUEBLE = {
  mub_taburete: 'a simple three-legged wooden stool',
  mub_banco: 'a carved wooden bench with Greek-key trim along the seat',
  mub_divan: 'a low velvet divan in teal with bronze feet and cushions',
  mub_trono: 'a high-backed carved wooden chair of office with gilded details',
  mub_mesa_baja: 'a low round wooden table',
  mub_mesa_cobre: 'a round table with a hammered copper top on carved legs',
  mub_escritorio: 'a scribe\'s writing desk with scrolls, an inkwell and a quill',
  mub_jergon: 'a simple straw mattress on a low wooden frame with a wool blanket',
  mub_lecho: 'a wooden bed with a canopy and draped teal curtains',
  mub_arcon: 'a wooden travel chest with bronze bands and a lock',
  mub_estante: 'a tall wooden shelf unit with jars and books',
  mub_vitrina: 'a tall glass-fronted cabinet of curiosities with small relics inside',
  mub_vela: 'a tall bronze floor candelabrum with three lit candles',
  mub_farol: 'an iron lantern standing on a short wrought-iron post',
  mub_lampara: 'a golden oil lamp on a tall slender stand, lit',
  mub_estera: 'a woven reed mat',
  mub_alfombra: 'a rectangular wool rug with a rust and cream Greek-key border',
  mub_alfombra_seda: 'an ornate silk rug with a Byzantine medallion pattern in crimson, teal and gold',
  mub_maceta: 'a terracotta flower pot with a small leafy plant',
  mub_olivo: 'a young olive tree in a large terracotta planter',
  mub_parra: 'a grapevine climbing a wooden trellis frame, with grape bunches',
  mub_naranjo: 'an orange tree in blossom with oranges, in a large planter',
  mub_tapiz: 'an embroidered wall tapestry with a woven pattern, hanging from a rod',
  mub_mosaico: 'a square golden Byzantine mosaic panel framed in stone',
  mub_icono_pared: 'a small framed painted icon in a gilded frame',
  mub_mapa: 'an old parchment map of a strait, framed in wood',
  mub_anfora: 'a painted clay amphora with a black-and-terracotta pattern',
  mub_brasero: 'a bronze brazier on three legs with glowing coals',
  mub_columna: 'a broken marble column with an ornate capital',
  mub_fuente: 'a small round marble fountain with a basin and a trickle of water',
};

const muebles = [
  ['mub_taburete', 'mub_banco', 'mub_mesa_baja', 'mub_arcon'],
  ['mub_vela', 'mub_lampara', 'mub_anfora', 'mub_divan'],
  ['mub_mesa_cobre', 'mub_jergon', 'mub_lecho', 'mub_estante'],
  ['mub_farol', 'mub_trono', 'mub_escritorio', 'mub_vitrina'],
  ['mub_brasero', 'mub_columna', 'mub_fuente'],
].map((ids) => tanda('muebles', ids, DESCRIPCION_MUEBLE));

muebles.push(tanda('muebles', ['mub_maceta', 'mub_olivo', 'mub_parra', 'mub_naranjo'], DESCRIPCION_MUEBLE,
  OBJETO, undefined, MAGENTA));

muebles.push(
  tanda('muebles', ['mub_estera', 'mub_alfombra', 'mub_alfombra_seda'], DESCRIPCION_MUEBLE,
    'Each rug seen from high above, almost flat on the ground, like a sheet lying on the floor.'),
  tanda('muebles', ['mub_tapiz', 'mub_mosaico', 'mub_icono_pared', 'mub_mapa'], DESCRIPCION_MUEBLE,
    'Wall pieces seen straight on and flat, no perspective at all, as if looked at face to face.'),
);

const PIEZA = {
  arma_baston: 'a pilgrim\'s wooden walking staff with a bronze tip',
  arma_espada_corta: 'a short straight bronze sword with a leather-wrapped grip',
  arma_hacha: 'a docker\'s single-bladed iron axe with a wooden haft',
  arma_sable: 'a curved steel sabre with a brass guard',
  arma_lanza: 'a guard\'s spear with a long leaf-shaped steel head',
  arma_ceremonial: 'an ornate ceremonial sword with a gilded hilt and engraved blade',
  arm_tunica: 'a coarse cream linen tunic with a rope belt',
  arm_cuero: 'a brown leather cuirass with shoulder straps',
  arm_escamas: 'a bronze scale-mail shirt',
  arm_placas: 'a heavy iron plate breastplate with pauldrons',
  arm_mosaico: 'an ornate gilded breastplate decorated with Byzantine mosaic motifs',
  acc_amuleto: 'a copper amulet on a leather cord',
  acc_anillo: 'a gold merchant\'s signet ring with a red stone',
  acc_reliquia: 'a small golden reliquary box with a cross-shaped lid',
  acc_icono: 'a tiny blessed icon pendant in a golden frame',
};

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

const MASCOTA = {
  gato: 'a sleek tabby bazaar cat sitting',
  paloma: 'a white messenger pigeon standing, a tiny scroll tied to its leg',
  perro: 'a sturdy guard dog sitting alert, with a bronze-studded collar',
  cabra: 'a stubborn little goat standing with small horns',
};
const mascotas = [tanda('mascotas', ['gato', 'paloma', 'perro', 'cabra'], MASCOTA,
  'Each animal front view, full body, in a calm relaxed pose.')];

// Las habilidades van en medallón: un marco común hace que se lean como una familia y no
// como objetos sueltos de la tienda. El motivo apunta al hábito que las carga.
const EMBLEMA = {
  embestida: 'a bold bronze fist thrusting forward with short speed lines, for a charging strike',
  segundo_aliento: 'a pomegranate and an olive sprig with a soft warm golden glow, for recovery',
  paso_peregrino: 'a winged leather sandal with swirling wind lines, for a nimble dodge',
  guardia_ferrea: 'a round bronze shield with an iron rim and a bright gleam, braced for impact',
  tajo_doble: 'a short straight sword with two crossed arcs of light, for a double slash',
  golpe_constante: 'an upright sword inside a golden laurel wreath, radiating light, for unbroken perseverance',
};
const habilidades = [
  ['embestida', 'segundo_aliento', 'paso_peregrino'],
  ['guardia_ferrea', 'tajo_doble', 'golpe_constante'],
].map((ids) => tanda('habilidades', ids, EMBLEMA,
  'Each one is a skill emblem: the motif centred inside its own round bronze medallion frame with Greek-key trim and a deep teal enamel background, all medallions the same size, front view, flat.'));

export const ENCARGOS = [...enemigos, guia, ...heroe, ...fondos, ...muebles, ...equipo, ...mascotas, ...habilidades];

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
    ...Object.keys(HABILIDADES).map((id) => `habilidades/${id}.png`),
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
