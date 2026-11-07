---
name: juego-3d
description: Conocimiento de producción para juegos 3D en el navegador con Three.js - orden de trabajo, estilo visual sin artistas, rúbrica visual, sensación de juego, presupuesto de rendimiento y verificación. Úsala al crear, ampliar, pulir o revisar cualquier juego o escena 3D del repositorio.
---

Es el resumen de lo investigado; las fuentes están en `investigacion/06-juego-3d.md`, `07` y
`09`. Lee cada referencia solo cuando toque su fase.

| Referencia | Cuándo leerla |
| --- | --- |
| `referencias/estilo.md` | Al decidir el aspecto, modelar, iluminar o crear materiales |
| `referencias/rubrica-visual.md` | Al puntuar capturas o afirmar que algo «se ve premium» |
| `referencias/sensacion.md` | Al ajustar controles, cámara, impactos o sonido |
| `referencias/rendimiento.md` | Al añadir geometría, efectos o texturas, o al medir |

## Orden de trabajo

1. **Diseño antes que escena** (`DISENO.md`). «Explorar una escena bonita» no es un diseño:
   hacen falta decisiones, presión, respuesta y consecuencias.
2. **Bucle jugable con formas simples** y entrada real.
3. **Una escena representativa completa** con el arte definitivo, a la escala de cámara real.
4. **Gráficos en orden: forma → material → luz → efectos.** El brillo, la niebla y las
   partículas nunca tapan geometría que falta.
5. **Sensación en orden: latencia → curvas → contacto → cámara → sonido.**
6. **Solo después, más contenido.**

## Técnica por defecto

- **Motor:** Three.js actual (r187 en noviembre de 2026), con `WebGPURenderer`, vuelta a WebGL2
  y TSL para los shaders.
  - Debe verse bien con WebGL2: es lo único que se puede capturar aquí, y lo que usan los
    móviles sin WebGPU.
  - Nada de *render bundles* con dibujado indirecto: en Safari anterior a la 27.2 provocan
    caídas de FPS.
- **Estilo:** ver `referencias/estilo.md`. Paleta compartida, sombras de color, rebote falso,
  niebla y brillo solo en lo emisivo.
- **Física:** solo si el juego la necesita, con Rapier.
- **Sonido:** Web Audio o ZzFX (licencia MIT, menos de 1 KB). Claude no oye: lo valida el autor.
- **Recursos:**
  - Primero, generados por código.
  - Los CC0, solo con la licencia comprobada y apuntada en `CREDITS.md`.
  - Los generadores de pago quedan fuera (regla R9).

## Verificación

- **Pruebas y build:** las del núcleo (`npm test`) y `npm run build`.
- **Capturas en partida activa,** nunca solo en el título, en 390 × 844 y en escritorio:
  `node herramientas/capturar.mjs`.
- **Bots que juegan con estado, no con píxeles,** a través de `window.__JUEGO__`.
  - Miden si se avanza, si hay bloqueos (entrada sin movimiento ni progreso) y si el fallo y el
    reintento funcionan.
  - Dos bots, uno rápido y otro con 300 ms de retraso. Si sobreviven igual, la presión es
    decorativa.
- **Rúbrica visual** (`referencias/rubrica-visual.md`): la puntúa el `probador`, no quien
  construyó.
- **Rendimiento:** contadores (`renderer.info`) frente a `referencias/rendimiento.md`. Aquí no
  hay GPU: los FPS solo valen en el móvil del autor.

## Trabajo en paralelo

- **Solo con `ARCHITECTURE.md`:** dueño por carpeta, sin imports cruzados y con tabla de
  eventos. Una rama o un worktree por agente.
- **En modo máximo:** un flujo de trabajo pequeño, con un crítico separado que compara contra la
  rúbrica.
- **El listón es alcanzable y del estilo elegido,** nunca «igualar un AAA». Con 11 críticos y
  ese listón, *Claude of Duty* se quedó en 5 sobre 10.
