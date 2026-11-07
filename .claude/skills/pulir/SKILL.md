---
name: pulir
description: Pase de pulido y sensación de juego (game feel) en un juego o app del repositorio - respuesta a cada toque, transiciones, partículas, vibración y efectos de sonido generados por código. Úsalo cuando el autor pida pulir, dar vida, que se sienta mejor, añadir sonido o música, o cuando una revisión diga que algo se siente plano.
---
El objetivo es que cada acción del jugador tenga respuesta inmediata y proporcionada a su
importancia. No cambies reglas ni equilibrio: solo cómo se ve, se oye y se siente.

## Antes de tocar nada

1. Haz una lista de las acciones del jugador en la pantalla o función que se pule (tocar un
   botón, abrir un menú, acertar, fallar, ganar, perder, subir de nivel…) y clasifícalas en
   pequeñas, medianas y grandes.
2. Captura el estado actual con `node herramientas/capturar.mjs` para poder comparar.

## Qué añadir, según el tamaño de la acción

- **Pequeña (tocar, navegar):** cambio visual en menos de 100 ms (escala 0,95, brillo), un clic
  suave de sonido, `navigator.vibrate(10)` donde exista.
- **Mediana (acertar, recoger, comprar):** animación corta con rebote (easing tipo
  `easeOutBack`), número o icono que salta, sonido con tono que sube.
- **Grande (ganar, subir de nivel, capturar):** un momento orquestado de uno o dos segundos:
  pausa breve antes del golpe, partículas, sacudida ligera de pantalla, sonido de varias notas.
  Uno solo por pantalla: si todo es grande, nada lo es.
- **Fallo o daño:** sacudida corta, destello rojo o parpadeo, sonido grave y descendente.

Respeta `prefers-reduced-motion` (sin sacudidas ni partículas) y deja un ajuste para silenciar.

## Sonido sin archivos ni licencias

Genera los efectos con Web Audio (osciladores, envolvente de volumen y barrido de frecuencia),
en un módulo `sonido` con funciones con nombre (`sonido.toque()`, `sonido.acierto()`…) y una
tabla de parámetros por efecto, para que el autor pueda ajustarlos sin leer código. El
`AudioContext` se crea en el primer toque del jugador (los móviles no dejan sonar antes).

Para música, solo si el autor la pide: melodías cortas en bucle con el mismo sintetizador,
escritas como datos (notas y duraciones).

**Tú no oyes.** No afirmes que un sonido «queda bien». Termina siempre dándole al autor una
forma rápida de escuchar cada efecto (por ejemplo, una sección de prueba en el modo
desarrollador) y pídele que valore cuáles cambiar.

## Al acabar

- Pruebas del proyecto en verde (`npm test`).
- Capturas nuevas de las mismas pantallas y comparación con las de antes.
- Lista para el autor: qué acción tiene ahora qué respuesta, y qué tiene que escuchar.
