# GymLog · Fase 1

Cuaderno de entrenamiento (PWA) basado en Bulk Up, adaptado al programa de acondicionamiento inicial A/B de 8 semanas.

## Qué cambia respecto a Bulk Up
- Rutinas: Entrenamiento A y Entrenamiento B (full body), con ficha técnica completa de cada ejercicio.
- Semana del programa: arranca al guardar el primer entrenamiento. Series y RIR de los ejercicios de fuerza se ajustan solos según la etapa (1-2 Aprendizaje · 3-4 Consolidación · 5-6 Desarrollo · 7-8 Progresión).
- Registro al terminar cada sesión: esfuerzo, molestias, dificultades técnicas y notas (editable después en el historial).
- Eliminado: modo pubalgia, registro de molestias inguinales y suplementación (la sección sigue en el código pero sin botón ni datos).
- Planificación con actividades propias (A, B, cardio suave, descanso).

## Despliegue
Repositorio propio → Settings → Pages → Deploy from branch → main → / (root). Sube el contenido de esta carpeta, no la carpeta.

## Convivencia con Bulk Up en el mismo dominio
Ambas apps viven en `dbravogo-gif.github.io`, que es el mismo origen. Por eso:
- Clave de datos distinta: `fase1_gym_db` (Bulk Up usa `gymlog_db`).
- El service worker solo borra sus propias cachés (`gymlog-fase1-*`).
- Sube `APP_VERSION` en `sw.js` en cada publicación.

## Gatos (botón de pánico y felicitaciones)
- Botón "😿 Me da pereza" en el entrenamiento y en cada ejercicio: sale uno de sus gatos en 3D con una frase.
- Al completar todas las series de un ejercicio: felicitación en ucraniano (con traducción). Al terminar la sesión: imagen de los dos gatos.
- Las imágenes se cargan de OpenArt y el service worker las guarda para usarlas sin conexión. Para no depender de OpenArt, descárgalas y guárdalas como `images/zorro-entrenador.jpg`, `images/sanji-coach.jpg`, `images/sanji-sentadilla.jpg`, `images/zorro-sanji-animadores.jpg` y `images/zorro-sanji-juntos.jpg`: la app usa primero el archivo local.
- Zorro (siamés) y Sanji (lynx point). Imágenes y quién habla: `GATOS` en `index.html`. Frases: `PANICO_FRASES` (comunes, de cada gato y del dúo) y `UA_FRASES`.
