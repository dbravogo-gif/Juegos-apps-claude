# 04 · Herramientas: lo que da Claude hoy y lo gratis que lo acompaña

## Mecanismos de Claude Code para trabajo grande

Documentación oficial, leída el 2026-11-07.

| Mecanismo | Qué hace | Cuándo | Trampa |
| --- | --- | --- | --- |
| `/goal <condición>` | Después de cada turno, un modelo pequeño comprueba si se cumple la condición; si no, Claude sigue | Trabajo largo con un final comprobable: «todas las funciones del JSON pasan y `npm test` sale con 0» | El evaluador **solo lee la conversación**, no ejecuta nada. La condición debe decir cómo se demuestra (qué comando y qué salida) y puede llevar «o para tras 20 turnos» |
| Subagentes (`.claude/agents/`) | Un trabajador con su propio contexto que devuelve un resultado | Revisión independiente, búsquedas largas, tareas en paralelo | Delegar no da respuestas más listas; da ojos frescos o paralelismo. Cuesta tokens |
| Equipos de agentes (experimental) | Un jefe y compañeros con una lista de tareas compartida y mensajes entre ellos | Investigar, revisar o depurar con hipótesis que compiten («intentad refutaros») | De 3 a 5 compañeros, de 5 a 6 tareas cada uno, **cada uno con archivos distintos**. No se recuperan con `/resume` |
| Worktrees (`claude -w`) | Una copia de trabajo por sesión | Varias sesiones en paralelo sin pisarse | No traen dependencias instaladas ni archivos ignorados por git |
| `Stop` hook | Un script que, si falla, impide que Claude termine | Lo que no admite excepción: pruebas, prohibiciones | Para preferencias, mejor CLAUDE.md |
| `/loop` y rutinas en la nube | Repite un prompt cada cierto tiempo, o lo lanza programado aunque el portátil esté cerrado | Partida de prueba nocturna, vigilar el CI | Proteger `main` con una regla de rama |
| `/code-review`, `/verify` | Revisión por un subagente que no vio escribir el código; arrancar la app y mirarla | Antes de dar algo por hecho | Un revisor siempre encuentra algo: añade «ignora el estilo» |
| Esfuerzo y modelo | `/effort high` para fallos difíciles, `ultrathink` para un solo mensaje y `/model fable` para Fable 5.1 | Ver abajo | Fable gasta el doble de uso |

**Fable frente a Opus.** Opiniones de terceros, contradictorias, nada verificado:

- Fable destaca en interfaces, en la parte visual de los juegos y en escribir con voz humana.
- En otras pruebas, Opus 5 ganó construcciones completas, y Fable dejó roto el bucle de un
  juego de estrategia.
- Hipótesis razonable: Opus para construir; Fable para textos, diálogos y dirección visual,
  cuando compense el doble de gasto.

## Claude dentro de lo que construyes, sin servidor

- **Páginas publicadas en claude.ai** que pueden:
  - preguntar a Claude (`sample`, con imágenes),
  - tener multijugador en tiempo real (`room`),
  - guardar datos compartidos con permisos (`db`),
  - saber quién la mira (`user`),
  - y descargar archivos.

  Anthropic lo presenta para personajes que recuerdan tus decisiones, tutores y herramientas.
- **Límite:** solo funciona dentro de claude.ai, para quien tenga acceso. Cada persona entra con
  su cuenta, según la documentación de 2025. Sirve para prototipos y para jugar entre amigos;
  no para una web pública.
- **Claude Design** (Anthropic Labs, abril de 2026, vista previa): prototipos, presentaciones y
  maquetas a partir de una conversación, exportables a HTML. Sirve para explorar la dirección
  visual antes de programar. Solo lo conozco por resúmenes.

## Lo gratis que acompaña

Lo marcado con «(conocimiento previo)» no lo he comprobado hoy.

- **Publicar:** GitHub Pages o similares.
- **Multijugador:**
  - Durable Objects de Cloudflare (la «sala» de PartyKit) entra en el plan gratuito desde
    2025. Los límites que dan las fuentes se contradicen, y desde enero de 2026 el
    almacenamiento se cobra aparte.
  - Entre pares con WebRTC, sin servidor de juego: *Rose & Blade* llega a 16 jugadores así.
    Todavía hace falta algo para que los jugadores se encuentren (conocimiento previo).
- **Recursos CC0** (uso libre, sin atribución):
  - Kenney, con decenas de miles de recursos 2D, 3D, interfaz y sonido.
  - Quaternius.
  - Poly Haven.
- **Recursos generados por código**, como en World of ClaudeCraft: terreno, efectos, iconos y
  música por procedimiento. Para sonido, librerías diminutas de síntesis tipo ZzFX o jsfxr
  (conocimiento previo).
- **Móvil:**
  - PWA: gratis e instalable.
  - Expo y React Native con EAS: hay casos de desarrolladores solos que publican en las tiendas.
    Expo tiene un nivel gratuito, pero publicar en la App Store exige la cuenta de desarrollador
    de Apple, que es de pago anual; Google Play cobra una cuota única (conocimiento previo).
    Con «sin inversión», la PWA va primero.
- **Herramientas, no MCP** (Ronacher): un script en `herramientas/` que Claude ejecuta gasta
  menos contexto que un servidor MCP. El MCP que merece la pena para juegos web es Playwright.
