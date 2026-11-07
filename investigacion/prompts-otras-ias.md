# Prompts para que otras IAs investiguen

A quién mandarlo, según la experiencia del 2026-11-07 (ver `09-informe-externo.md`):

- Perplexity y Grok para datos. Grok lee X.
- Gemini solo para vídeos de YouTube: aporta datos sin fuente.
- DeepSeek, no.
- La consolidación, con ChatGPT. Pásale también a Claude los informes originales si puedes.

Hay dos prompts:

1. **Investigación:** el mismo texto para cada IA.
2. **Consolidación:** junta las respuestas en un solo informe.

Pega cada uno tal cual. Si una respuesta se corta, escribe «sigue».

---

## Prompt 1: Investigación

```text
Actúa como investigador. Necesito información verificable y reciente (2025-2026) para crear
un videojuego 3D original para navegador (Three.js, móvil primero) usando Claude Code como
programador principal. Otra IA ya ha investigado mucho; tú cubres lo que ella NO puede leer:
publicaciones de X/Twitter, YouTube, Reddit, Medium, dev.to, Substack y blogs personales.

REGLAS
- Cada dato con su URL real y su fecha. Si no puedes abrir una fuente, dilo; no inventes
  enlaces ni cifras. Un dato sin fuente va en "No verificado".
- Marca cada punto como HECHO (lo dice la fuente), INFERENCIA (lo deduces tú) u OPINIÓN
  (lo opina el autor).
- Los prompts y las citas, copiados literalmente en su idioma original, completos.
- Prefiere fuentes primarias (el autor original) a resúmenes de terceros.
- Si algo ya está muy repetido en internet pero no tiene fuente primaria, dilo.
- No repitas lo que ya sé (lista al final) salvo para corregirlo.

QUÉ BUSCAR, por orden de prioridad

1. PROMPTS LITERALES de juegos y escenas 3D hechos con Claude Opus 5.5 (septiembre-noviembre
   2026). Sobre todo:
   - el juego tipo Fallout en navegador de @chrisfirst
   - el juego de aventuras con pincel de @DannyLimanseta
   - el clon de Minecraft de @noahwachnik
   - el juego estilo Fortnite de @ericmaskfr (hecho con Sonnet 5.5)
   - la exploración 3D de El Principito de @Saccc_c
   - el mundo de juego en navegador de @xikhar (tercera iteración)
   - el nivel tipo Prince of Persia de @iannuttall
   - el barco japonés de @MengTo
   Muchos están recopilados en jasonzhu.ai/en/prompts/claude-opus-5-5. Para cada uno: el
   prompt completo, cuántos mensajes de seguimiento hubo, el nivel de esfuerzo, el tiempo,
   el coste y las herramientas.

2. AUTOPSIAS Y DEVLOGS de juegos 3D ORIGINALES para navegador (Three.js, Babylon.js o
   PlayCanvas) hechos con IA o por desarrolladores pequeños: qué funcionó, qué falló,
   cuánto tardaron, cómo consiguieron buenos gráficos sin artistas y cómo midieron si era
   divertido.

3. FLUJOS DE TRABAJO DE EXPERTOS, en sus palabras (citas literales con enlace):
   - Boris Cherny (creador de Claude Code): su hilo de enero de 2026 y lo posterior.
   - Mitchell Hashimoto: "My AI Adoption Journey".
   - Simon Willison: "Agentic Engineering Patterns".
   - Peter Steinberger: la entrevista en The Pragmatic Engineer.
   - Armin Ronacher: lo que haya escrito sobre agentes en 2026.

4. CHARLAS Y VÍDEOS DE DISEÑO DE JUEGOS, con los minutos donde se dice cada idea:
   - John Nesky, "50 Game Camera Mistakes" (GDC): las reglas de cámara aplicables a un
     juego 3D en tercera persona.
   - "Juice it or lose it" y "The Art of Screenshake": la lista completa de técnicas.
   - Game Maker's Toolkit sobre game feel, coyote time e input buffering.
   - Cualquier charla sobre cómo hacer divertido un prototipo en sus primeros 5 minutos.

5. ESTADO REAL EN NOVIEMBRE DE 2026 (fuentes oficiales):
   - ¿Safari en iPhone soporta WebGPU? ¿Desde qué versión? ¿Con qué limitaciones?
   - ¿Rendimiento real de Three.js en móviles de gama media (cifras medidas)?
   - Licencias oficiales de KayKit, Quaternius, Kenney y 100 Avatars (texto de la licencia).

6. REGLAS PARA AGENTES QUE SE CUMPLEN DE VERDAD: ejemplos reales de CLAUDE.md o AGENTS.md
   de proyectos de éxito, y experiencias sobre qué reglas ignora el agente y cómo se forzaron
   (hooks, pruebas, CI).

LO QUE YA SÉ (no lo repitas)
- Los artículos de ingeniería de Anthropic: harness design, long-running agents, el
  compilador de C, agent memory, evals.
- La guía oficial de buenas prácticas de Claude Code: /goal, agent teams, hooks, skills.
- Superpowers (obra), Compound Engineering (Every), threejs-game-skills (majidmanzarpour),
  World of ClaudeCraft (levy-street) y el portfolio 2025 de Bruno Simon.
- Los repositorios awesome-opus-5.5-video y awesome-opus-5-5-video-prompts.

FORMATO DE RESPUESTA (obligatorio)
Para cada hallazgo:
### [Título corto]
- Tipo: HECHO / INFERENCIA / OPINIÓN
- Fuente: URL — autor — fecha
- Fiabilidad: alta (fuente primaria) / media (secundaria seria) / baja (agregador, rumor)
- Resumen: 2-4 líneas
- Cita o prompt literal: (si existe, completo)
- Por qué importa para hacer un buen juego 3D con Claude: 1 línea

Al final, tres secciones:
## No encontrado (lo que buscaste sin éxito)
## Contradicciones entre fuentes
## No verificado (datos sin fuente fiable)
```

---

## Prompt 2: Consolidación

Pégalo en ChatGPT junto con todas las respuestas.

```text
Te paso los informes de varias IAs sobre el mismo encargo (más abajo). Tu trabajo es
consolidarlos en un único informe para otra IA, Claude, que los usará para construir un
juego 3D. No investigues nada nuevo y no añadas información propia.

REGLAS
1. Conserva TODAS las URLs, fechas y citas literales. Los prompts literales se copian
   completos, sin resumir ni traducir.
2. Une los hallazgos repetidos en uno solo, indicando qué IAs lo encontraron.
3. Si dos informes se contradicen, no elijas: pon las dos versiones con su fuente en
   "Contradicciones".
4. Ordena por fiabilidad: primero las fuentes primarias (el autor original), después las
   secundarias serias y al final los agregadores.
5. Descarta lo que no tenga URL; muévelo a "No verificado" con la IA que lo dijo.
6. Señala con [SOSPECHOSO] los enlaces que parezcan inventados (dominio raro, ruta
   imposible, fecha futura) o los datos que solo dé una IA sin fuente primaria.
7. No suavices ni embellezcas: si algo es flojo, dilo.

ESTRUCTURA
# Informe consolidado (fecha)
## 1. Prompts literales de juegos y escenas 3D
## 2. Autopsias y devlogs de juegos 3D originales
## 3. Flujos de trabajo de expertos (citas)
## 4. Diseño de juegos: cámara, game feel, primeros minutos
## 5. Estado técnico: WebGPU en iPhone, rendimiento móvil, licencias
## 6. Reglas para agentes que se cumplen
## Contradicciones
## No verificado
## Lo que nadie encontró

Cada hallazgo con: Tipo (HECHO/INFERENCIA/OPINIÓN), Fuente (URL, autor, fecha),
Fiabilidad, Encontrado por (qué IAs), Resumen, Cita o prompt literal y Por qué importa.

Entrega el resultado en Markdown, en un único bloque, listo para copiar.

INFORMES:
[pega aquí cada informe, empezando por "=== Informe de <nombre de la IA> ==="]
```
