---
name: pulir
description: Pase de pulido y sensación de juego (game feel) en un juego o app del repositorio - latencia, curvas de respuesta, impacto, cámara, partículas, vibración y efectos de sonido generados por código. Úsalo cuando el autor pida pulir, dar vida, que se sienta mejor, añadir sonido o música, o cuando una revisión diga que algo se siente plano.
---

El objetivo es que cada acción del jugador tenga una respuesta inmediata y proporcionada a su
importancia. No se tocan las reglas ni el equilibrio: solo cómo se ve, se oye y se siente. La
tabla de valores y las reglas están en `.claude/skills/juego-3d/referencias/sensacion.md`.

## Antes de tocar nada

1. **Haz la lista de acciones del jugador** en lo que se pule (tocar, saltar, acertar, fallar,
   ganar…) y clasifícalas en pequeñas, medianas y grandes.
2. **Captura el estado actual** con `node herramientas/capturar.mjs`, para comparar después.

## En este orden

Cada capa depende de la anterior.

1. **Latencia:** el verbo principal responde en menos de 100 ms. Si no, se arregla esto primero.
2. **Curvas:** aceleración, frenada, *easing* (por ejemplo `easeOutBack`) y rebote.
3. **Contacto, según el tamaño de la acción:**
   - **Pequeña:** cambio visual en menos de 100 ms y un clic suave. `navigator.vibrate(10)` solo
     como extra donde exista: en iPhone no hay vibración web.
   - **Mediana:** animación corta con rebote, el número o el icono salta, y un tono que sube.
   - **Grande:** un momento orquestado de 1 a 2 s, con pausa breve, partículas, sacudida y un
     sonido de varias notas. Solo uno por pantalla.
   - **Fallo:** sacudida corta, destello y un sonido grave que baja.
4. **Cámara:** sacudida con curva trauma² y tope, empujón y cambio de campo de visión. Nunca tapa
   la siguiente decisión.
5. **Sonido** en el mismo fotograma que la imagen, con variación de tono.

Respeta `prefers-reduced-motion` (sin sacudidas ni partículas) y deja siempre un ajuste para
silenciar.

## Sonido sin archivos ni licencias

- **Efectos:** con Web Audio o ZzFX (licencia MIT), en un módulo `sonido` con funciones con
  nombre (`sonido.toque()`, `sonido.acierto()`…) y una tabla de parámetros por efecto, para que
  el autor los ajuste sin leer código.
- **`AudioContext`:** se crea con el primer toque del jugador; los móviles no dejan sonar antes.
- **Música:** solo si el autor la pide. Melodías cortas en bucle, escritas como datos (notas y
  duraciones).

**Tú no oyes.** No afirmes nunca que un sonido «queda bien». Dale al autor una forma rápida de
escuchar cada efecto (por ejemplo, una sección de prueba en el panel de depuración) y pídele que
los valore.

## Al acabar

- Las pruebas del proyecto en verde (`npm test`).
- Capturas nuevas de las mismas pantallas, comparadas con las de antes.
- Para el autor: qué respuesta tiene ahora cada acción, qué tiene que escuchar y la lista 1–5
  de `COMO-TRABAJAMOS.md`.
