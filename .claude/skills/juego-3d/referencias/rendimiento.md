# Rendimiento de Three.js en el navegador

Presupuesto de partida adaptado de *threejs-game-skills* (licencia MIT). Se mide en la peor
vista de partida activa, y cada exceso deliberado se documenta.

| Métrica | Escritorio | Móvil |
| --- | --- | --- |
| Llamadas de dibujo (`renderer.info.render.calls`) | ≤ 300 | ≤ 150 |
| Triángulos | ≤ 750.000 | ≤ 300.000 |
| Geometrías en memoria | ≤ 300 | ≤ 200 |
| Texturas | ≤ 60 | ≤ 40 |
| Memoria de texturas (estimada) | ≤ 256 MB | ≤ 128 MB |
| Luces con sombra | ≤ 2 | 1 |
| Tamaño del mapa de sombras | ≤ 2048 | ≤ 1024 |
| Densidad de píxeles máxima | 2 | 1,5–2 |
| Pasadas de postproceso extra | ≤ 2 | 0–1 |

## Prácticas

- **Nada de crear objetos en cada fotograma:** se reservan y se reutilizan. `dispose()` de todo
  lo creado.
- **Lo repetido va en `InstancedMesh`.** Se descarta o se dibuja entero, según su esfera
  envolvente. Para campos grandes: trocearlo por zonas o usar `BatchedMesh`.
- **Un efecto que no se usa se quita.** Un *bloom* a intensidad 0 sigue costando llamadas de
  dibujo.
- **En móvil, *bloom* a media resolución.** La profundidad de campo, solo en escritorio.
- **Antialias** solo si la densidad de píxeles es menor que 2.
- **Texturas:**
  - Cuatro de 2048² sin comprimir ocupan unos 85 MB de memoria de vídeo (RGBA8 con mipmaps).
  - Si son muchas, KTX2/Basis: siguen comprimidas en la GPU, aunque convertirlas cuesta CPU al
    cargar.
- **Calidad:** niveles de calidad (el móvil empieza en bajo) y un panel de depuración para medir
  en vivo.
- **Safari:**
  - WebGPU desde la versión 26 (iOS 26).
  - Nada de *render bundles* con dibujado indirecto antes de la 27.2.
  - Siempre con vuelta a WebGL2.

## Medir

- **Aquí:** contadores (`renderer.info`) y capturas. Los FPS no valen, porque no hay GPU.
- **En el móvil del autor:** FPS y temperatura durante una partida de 5 minutos.
