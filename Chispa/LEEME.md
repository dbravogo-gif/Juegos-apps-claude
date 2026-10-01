# Chispa

App "antiscroll": sesiones cortas con la dosis de estímulo de un feed, pero aprendiendo.
Cinco áreas: **ventas**, **ciencia**, **psicología**, **economía** e **historia**.

- **Modo entrevista** (por defecto): 75% ventas (preparación de la entrevista en Bitmakers) y el 25%
  restante repartido entre las otras cuatro áreas.
- **Modo equilibrado**: todas las áreas por igual. Se cambia en Ajustes → Reparto, sin perder el progreso.

El reparto es exacto a la larga: la app lleva la cuenta de cuántas tarjetas de cada área has visto
y compensa en las siguientes sesiones.

## Cómo funciona

- **Sesión de hoy**: 8 tarjetas (configurable a 12 o 16), unos 10 minutos. Al terminar, la app te dice
  que pares. Puedes hacer como mucho dos rondas extra de 4 tarjetas.
- **Tipos de tarjeta**: lectura, pregunta, práctica libre con respuesta modelo y autoevaluación,
  simulación de conversación, ordenar, cálculo y memoria.
- **Repetición espaciada**: lo que fallas vuelve al final de la sesión y al día siguiente; lo que
  aciertas vuelve cada vez más tarde (1, 2, 4, 7, 15 y 30 días).
- **Recompensas**: XP, rachas de aciertos (XP ×1,5 y ×2), tarjetas doradas al azar (XP ×2),
  niveles y días seguidos.
- **Chuleta**: el método entero en una pantalla, para la víspera de la entrevista.
- **Temario**: lee o practica cualquier módulo por separado.
- **Añadir un área nueva**: en `content.js`, un elemento en `areas`, un módulo en `modules` y sus
  tarjetas. El color se define en `index.html` (`--a-<área>` y `--a-<área>-soft`).

## Instalarla en el iPhone

Igual que Bulk Up: con GitHub Pages activado en la rama `main`, la dirección será
`https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/Chispa/`. Ábrela en Safari → Compartir →
**Añadir a pantalla de inicio**.

## Tus datos

Se guardan solo en el móvil. En **Ajustes → Copia de seguridad** puedes copiar un código
con todo tu progreso y pegarlo en una nota.

## Actualizar el contenido

- Las tarjetas están en `content.js` (formato explicado al principio del archivo).
- Cada vez que publiques cambios, sube `APP_VERSION` en `sw.js` para que el móvil avise
  de que hay versión nueva.
