// Prepara los personajes de KayKit (CC0, Kay Lousberg, www.kaylousberg.com) para el juego: deja a
// cada uno solo las animaciones que usa el juego (de 76 a 7). El paisaje ya no usa KayKit: casas,
// plantas, rocas, volcanes y nubes se hacen por código (2026-11-10).
// No es una dependencia del juego: se ejecuta a mano con @gltf-transform instalado aparte.
//
// Uso:
//   git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 <personajes>
//   (en una carpeta aparte) npm i @gltf-transform/core@4 @gltf-transform/functions@4
//   node recursos-kaykit.mjs <personajes> <six-seven-islands/public/modelos/kaykit>
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, unpartition } from '@gltf-transform/functions';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [personajes, salida] = process.argv.slice(2);
if (!salida) throw new Error('Uso: node recursos-kaykit.mjs <personajes> <salida>');
mkdirSync(salida, { recursive: true });

const PERSONAJES = ['Rogue', 'Rogue_Hooded', 'Mage', 'Knight', 'Barbarian'];
const ANIMACIONES = new Set(['Idle', 'Walking_A', 'Running_A', 'Cheer', 'Interact', 'Hit_A', 'Death_A']);

const io = new NodeIO();

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
