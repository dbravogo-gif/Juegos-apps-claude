# Cómo trabajamos

Guía corta para sacarle el máximo a Claude en este repositorio con el menor gasto posible. Las
reglas que sigo están en `CLAUDE.md`. Aquí está lo que te toca a ti y lo que puedes esperar de
mí.

## Cómo pedirme algo

Cuanto más concreto, menos vueltas y menos créditos. Plantilla:

    Encargo: qué quieres.
    Para qué: el objetivo o la sensación que buscas.
    Está bien cuando: cómo sabrás que está hecho.
    No quiero: lo que hay que evitar.
    Modo: ahorro, normal o máximo (si no lo dices, el que esté en ESTADO.md).

No hace falta rellenarla siempre. Si falta algo importante, te lo pregunto con opciones.

- **Flojo:** «Mejora el juego».
- **Bueno:** «Encargo: que saltar se sienta mejor. Para qué: ahora parece que flota. Está bien
  cuando: el salto es corto y rápido y el aterrizaje se nota. No quiero: cambiar la altura
  máxima. Modo: normal».

## Qué hago con cada encargo

- **Lo clasifico:**
  - **Pequeño:** lo hago ya.
  - **Mediano:** te digo el plan en unas líneas y sigo.
  - **Grande:** escribimos juntos la especificación y la apruebas antes de construir.
- **Lo compruebo** antes de decir «hecho» y te enseño la prueba.
- **Si no voy a seguir una regla,** te aviso antes con «⚠️ Excepción R<n>».

## Qué recibes al final de cada tarea

1. El resultado y su prueba: el comando con su salida, o capturas.
2. Las excepciones a las reglas, si las hubo.
3. Lo que necesito de ti, en concreto: qué abrir, en qué dispositivo y qué puntuar.
4. El siguiente paso que recomiendo y su coste: bajo, medio o alto.

## Lo que solo tú puedes hacer

Claude no oye, no siente los controles en la mano y no sabe si algo es divertido. Cuando te pida
probar, te daré una lista corta. Contesta así, aunque sea en una línea:

    Control 1-5 · Cámara 1-5 · Se ve bien 1-5 · Ganas de repetir 1-5
    Lo más aburrido o molesto: …
    Lo mejor: …

## Modos de gasto

| Di | Qué cambia | Úsalo para |
| --- | --- | --- |
| «modo ahorro» | El mínimo de lecturas, revisión solo al cerrar fases, respuestas cortas | Retoques, preguntas, textos |
| «modo normal» | Comprobación completa y revisión al cerrar fases y funciones grandes | Lo habitual |
| «modo máximo» | Revisores independientes y repetir hasta cumplir la rúbrica | Hitos: la primera escena, el lanzamiento |

Nunca gasto dinero real (servicios de pago como OpenArt) sin tu sí. Antes de cualquier cosa
cara, te aviso con una estimación.

## Cómo ahorrar créditos tú

- **Un tema por conversación.** Para otro tema, abre una sesión nueva: el estado se guarda en
  `ESTADO.md` y no hace falta volver a explicármelo.
- **Dime cuándo está bien hecho.** Así se evitan vueltas a ciegas.
- **Pásame archivos o capturas** en vez de describirlos.
- **Si algo sale mal dos veces seguidas,** es mejor una sesión nueva con lo aprendido que una
  tercera corrección.

## Palabras y comandos útiles

| Escribe | Qué pasa |
| --- | --- |
| `/nuevo-proyecto` | De la idea a la primera versión: entrevista, documentos y escena de prueba |
| `/pulir` | Una pasada de sensación de juego: respuesta a cada toque, animación y sonido |
| `/cierre` | Cierro la tarea: compruebo, actualizo el estado, apunto lo aprendido y te resumo |
| «revísalo» | El agente `probador` lo prueba como un jugador exigente y lo puntúa |
| «explícame X» | Te explico cómo funciona una parte con palabras y un esquema, sin código |
| «¿qué necesitas?» | Te digo qué datos o decisiones me faltan para seguir |
| «modo ahorro / normal / máximo» | Cambio el nivel de gasto |

## Mapa

- `CLAUDE.md`: las reglas y los modos. Claude los lee en cada sesión.
- `ESTADO.md`: dónde estamos y qué sigue.
- `APRENDIDO.md`: errores ya pagados y la barrera que los evita.
- `investigacion/`: lo estudiado, con fuentes.
- `.claude/`: las skills, el agente `probador` y el hook que ejecuta las pruebas.
- `herramientas/`: capturas en un móvil simulado y el comprobador de pruebas.
