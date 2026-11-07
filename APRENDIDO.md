# Aprendido

Errores ya pagados y la barrera que evita repetirlos (regla R6). Formato: fecha · qué pasó ·
causa · barrera. Lo más reciente va arriba. Si un error vuelve a pasar, su barrera sube de
nivel: de nota a regla, y de regla a prueba o hook.

- **2026-11-07 · WebFetch falla en dominios nuevos** (Medium, dev.to, Slate, InfoQ, blogs
  personales).
  - Causa: la red de la sesión solo deja pasar algunos hosts.
  - Barrera: no reintentar. Usar WebSearch, GitHub (`git clone --depth 1`,
    raw.githubusercontent.com), anthropic.com y code.claude.com. Está en la skill `investigar`.
- **2026-11-07 · Páginas de documentación de 50 a 65 KB llenaron el contexto.**
  - Causa: WebFetch sin un prompt acotado.
  - Barrera: prompt enfocado. Si la respuesta se guarda en un archivo, se lee con `grep` o
    `sed`, nunca entera.
- **2026-11-07 · Los FPS medidos aquí no significan nada.**
  - Causa: la máquina no tiene GPU (WebGL2 por SwiftShader, sin WebGPU).
  - Barrera: el rendimiento se mide con los contadores del renderizador y en el móvil del autor.
- **2026-11-07 · Listas de terceros atribuían obras a autores equivocados.**
  - Causa: copiar sin contrastar.
  - Barrera: contrastar con la fuente primaria o con `cases.json` antes de citar.
- **2026-11-07 · Los informes de otras IAs traían datos sin fuente,** sobre todo los de Gemini.
  - Causa: no se exigía URL.
  - Barrera: el prompt de `investigacion/prompts-otras-ias.md` exige URL y marca hecho o
    inferencia. Perplexity y Grok para datos; Gemini solo para vídeos.
