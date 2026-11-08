// Prepara los modelos de KayKit (CC0, Kay Lousberg, www.kaylousberg.com) para el juego:
//   - junta en un solo GLB los modelos elegidos del paquete medieval, cada uno como un nodo con
//     su nombre (comparten una textura de 16 KB);
//   - deja a cada personaje solo las animaciones que usa el juego (de 76 a 7).
// No es una dependencia del juego: se ejecuta a mano con @gltf-transform instalado aparte.
//
// Uso:
//   git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 <medieval>
//   git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 <personajes>
//   (en una carpeta aparte) npm i @gltf-transform/core@4 @gltf-transform/functions@4
//   node recursos-kaykit.mjs <medieval> <personajes> <six-seven-islands/public/modelos/kaykit>
import { NodeIO } from '@gltf-transform/core';
import { dedup, mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [medieval, personajes, salida] = process.argv.slice(2);
if (!salida) throw new Error('Uso: node recursos-kaykit.mjs <medieval> <personajes> <salida>');
mkdirSync(salida, { recursive: true });

/** Los modelos del paquete medieval que usa la isla 1. */
export const MODELOS = [
  'building_home_A_red', 'building_home_A_yellow', 'building_home_A_blue', 'building_home_A_green',
  'building_home_B_red', 'building_home_B_yellow', 'building_home_B_blue',
  'building_tavern_red', 'building_market_blue', 'building_castle_yellow', 'building_barracks_blue',
  'building_tower_A_yellow', 'building_well_blue',
  'tree_single_A', 'tree_single_B', 'trees_A_small', 'trees_A_medium', 'trees_B_small', 'trees_B_medium',
  'rock_single_A', 'rock_single_C', 'rock_single_E',
  'mountain_A_grass_trees', 'mountain_B_grass', 'mountain_C_grass_trees', 'hills_A_trees',
  'fence_stone_straight', 'fence_wood_straight', 'cloud_big', 'cloud_small', 'barrel', 'crate_A_small', 'sack',
];
const PERSONAJES = ['Rogue', 'Rogue_Hooded', 'Mage', 'Knight', 'Barbarian'];
const ANIMACIONES = new Set(['Idle', 'Walking_A', 'Running_A', 'Cheer', 'Interact', 'Hit_A', 'Death_A']);

function buscar(dir, nombre) {
  for (const e of readdirSync(dir)) {
    const ruta = join(dir, e);
    if (statSync(ruta).isDirectory()) {
      const r = buscar(ruta, nombre);
      if (r) return r;
    } else if (e === nombre) return ruta;
  }
  return null;
}

const io = new NodeIO();

// Paquete medieval: un documento con una escena y un nodo por modelo.
const raiz = join(medieval, 'addons/kaykit_medieval_hexagon_pack/Assets/gltf');
const doc = (await io.read(buscar(raiz, `${MODELOS[0]}.gltf`)));
const escena = doc.getRoot().listScenes()[0];
const renombrar = (d, nombre) => {
  const s = d.getRoot().listScenes().at(-1);
  const hijos = s.listChildren();
  if (hijos.length !== 1) throw new Error(`${nombre}: se esperaba un nodo raíz y hay ${hijos.length}`);
  hijos[0].setName(nombre);
  return hijos[0];
};
renombrar(doc, MODELOS[0]);
for (const nombre of MODELOS.slice(1)) {
  const ruta = buscar(raiz, `${nombre}.gltf`);
  if (!ruta) throw new Error(`No encuentro ${nombre}`);
  const otro = await io.read(ruta);
  const mapa = mergeDocuments(doc, otro);
  const s = mapa.get(otro.getRoot().listScenes()[0]);
  for (const n of s.listChildren()) {
    n.setName(nombre);
    escena.addChild(n);
  }
  s.dispose();
}
await doc.transform(unpartition(), dedup(), prune());
await io.write(join(salida, 'medieval.glb'), doc);
console.log('medieval.glb:', MODELOS.length, 'modelos');

// Personajes: solo las animaciones que se usan.
const dirPersonajes = join(personajes, 'addons/kaykit_character_pack_adventures/Characters/gltf');
for (const p of PERSONAJES) {
  const d = await io.read(join(dirPersonajes, `${p}.glb`));
  for (const a of d.getRoot().listAnimations()) {
    if (ANIMACIONES.has(a.getName())) continue;
    // Borrar también sus canales y muestreadores; los datos que queden sin uso los quita prune().
    // No borrar los datos a mano: las animaciones comparten los tiempos.
    for (const s of a.listSamplers()) s.dispose();
    for (const c of a.listChannels()) c.dispose();
    a.dispose();
  }
  await d.transform(unpartition(), dedup(), prune());
  await io.write(join(salida, `${p}.glb`), d);
  console.log(`${p}.glb:`, d.getRoot().listAnimations().map((a) => a.getName()).join(', '));
}
