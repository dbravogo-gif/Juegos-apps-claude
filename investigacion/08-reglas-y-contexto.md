# 08 · Cómo se escriben reglas que se cumplan y cómo se gestiona el contexto

Ronda 5 (2026-11-07). Fuentes primarias de Anthropic, leídas completas.

## Gestión del contexto

[Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

- **El contexto es un recurso finito.** El objetivo es «el conjunto más pequeño de tokens de
  alta señal» que haga probable el resultado. Con más contexto, la memoria del modelo empeora
  (*context rot*).
- **La altura justa:** ni lógica rígida ni vaguedades. Se empieza con lo mínimo y se añade
  instrucción **solo cuando se observa un fallo**.
- **Ejemplos canónicos, pocos y variados,** mejor que una lista larga de reglas para casos
  límite: «son las imágenes que valen más que mil palabras».
- **Contexto justo a tiempo:** referencias ligeras (rutas de archivos) que se cargan cuando
  hacen falta.
- **Notas estructuradas fuera del contexto** (un archivo de progreso) que se releen.
- **Subagentes** con contexto limpio que devuelven un resumen destilado.

## Skills

[Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).

- **Divulgación progresiva:**
  - Siempre se ven el nombre y la descripción.
  - El `SKILL.md` se lee cuando la skill viene al caso.
  - Las referencias, solo si hacen falta.
- **La descripción decide cuándo se activa:** hay que cuidarla.
- **Scripts** para lo que debe ser determinista: corren sin meter su código en el contexto.
- **Se construye a partir de fallos reales:** probar con tareas representativas, ver qué falta
  y pedir a Claude que apunte en la skill lo que funcionó y los errores.
- **Instalar solo skills de fuentes de confianza** y auditar sus scripts.

## Herramientas para agentes

[Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents).
Aplicado a nuestros scripts, como `capturar.mjs`:

- Devolver poco y de alta señal, con una opción para pedir más.
- Errores concretos que digan cómo arreglarlo.
- El `--help` es la descripción: debe servir a un recién llegado.
- Un comando con propósito claro es mejor que varios que se solapan.

## Cómo se cumplen de verdad las reglas

Documentación de [memoria](https://code.claude.com/docs/en/memory),
[hooks](https://code.claude.com/docs/en/hooks-guide) y
[buenas prácticas](https://code.claude.com/docs/en/best-practices).

**Hechos clave:**

- **CLAUDE.md es contexto, no una obligación.** Llega como un mensaje después del prompt del
  sistema. Claude intenta seguirlo, pero no hay garantía, sobre todo si es vago o se contradice.
- **Escribir reglas comprobables:**

  | En vez de | Mejor |
  | --- | --- |
  | «Prueba los cambios» | «Ejecuta `npm test` antes de hacer commit» |
  | «Formatea bien» | «Sangría de 2 espacios» |

- **Menos de 200 líneas por archivo.** Más largo gasta contexto y **reduce el cumplimiento**.
- **Reglas que solo valen para una parte** van en `.claude/rules/*.md` con `paths:`, y se
  cargan solo al tocar esos archivos.
- **Dos instrucciones contradictorias:** Claude elige una al azar. Hay que revisar los archivos y
  quitar lo viejo (`/doctor prompt-audit` lo hace).
- **Archivos que se cargan al tocar una carpeta:** si superan el límite por archivo (150.000
  caracteres en modelos actuales con 1M de contexto), Claude solo recibe el principio.
- **Tras compactar:** el CLAUDE.md de la raíz se vuelve a leer. Los anidados y los de carpeta se
  recargan cuando vuelven a hacer falta. Lo dicho solo en la conversación puede perderse.
- **Lo que tiene que pasar siempre** (antes de cada commit, después de cada edición) va en un
  **hook**, no en CLAUDE.md.
- **Si una línea se incumple aunque se refuerce, va a un hook.** Y al revés: si un hook es solo
  una preferencia, se quita.

**Tipos de hook:**

| Tipo | Cómo decide | Cuándo usarlo |
| --- | --- | --- |
| `command` | Un script; si sale con código 2, bloquea y su stderr vuelve a Claude | Lo determinista: pruebas, prohibiciones, archivos protegidos |
| `prompt` | Un modelo devuelve `{"ok": false, "reason": …}` y Claude sigue trabajando con esa razón | Juicio sobre lo que hay en el mensaje del hook |
| `agent` | Un subagente que puede leer archivos y ejecutar comandos (hasta 50 pasos) | Comprobar el estado real del código. Experimental |

- **`SessionStart` con `matcher: "compact"`:** vuelve a meter contexto crítico después de cada
  compactación. Por ejemplo: `git log -5` y el estado del proyecto.
- **El `Stop` se dispara al final de cada respuesta,** no solo al terminar la tarea. Hay un
  tope de 8 bloqueos seguidos.

## Qué significa para nuestras reglas

Inferencia mía, para cuando escriba el documento de reglas.

1. **Dos capas:**
   - **Pocas reglas escritas,** comprobables y sin contradicciones, en el CLAUDE.md del
     proyecto (menos de 200 líneas).
   - **Las que no admiten excepción, convertidas en algo que se ejecuta:**
     - Pruebas de arquitectura: nada de `Math.random` en el núcleo, como World of ClaudeCraft.
     - Una prueba que exige que cada recurso esté en `CREDITS.md`.
     - Hooks.
2. **«Avisar antes de saltarse una regla»:**
   - Va escrito en CLAUDE.md con un formato fijo y fácil de ver. Por ejemplo:
     «⚠️ Regla N: no la sigo porque…».
   - Opcionalmente, un hook `prompt` en `Stop` que revise si el mensaje final declara algo
     como hecho sin pruebas, o se salta una regla sin avisar. Coste: una llamada a un modelo
     pequeño por respuesta. Hay que comprobar qué datos recibe ese hook antes de confiar en él.
3. **Contexto entre sesiones:** el CLAUDE.md apunta al archivo de progreso. Un hook
   `SessionStart` (compact) vuelve a inyectar ese puntero y el log de git.
4. **Las reglas crecen por fallos observados,** no por anticipación. Cada error repetido:
   regla nueva, o barrera si ya era regla.

## WebGPU en iPhone

Fuentes secundarias coincidentes.

- Safari 26 (iOS 26, septiembre de 2025) activa WebGPU por defecto en iPhone, iPad y Mac. En iOS
  todos los navegadores usan WebKit, así que vale para cualquier navegador del iPhone.
- **Consecuencia:** `WebGPURenderer` de Three.js es viable en iPhones actualizados. Hay que
  mantener la vuelta a WebGL2, que además es lo único que podemos probar en esta sesión.
