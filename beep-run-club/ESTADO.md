# Estado de Beep Run Club

Actualizado: 2026-11-20. Solo el presente (historial en git). Máximo 40 líneas.

## Fase actual

Fases 1 y 2 hechas en modo demo (`F01` a `F11`): la app del atleta y el panel del entrenador
funcionan con datos de ejemplo guardados en el navegador. Falta la nube (fase 3).

## Hecho

- **Atleta:** entra con código o enlace, sesión persistente con confirmación al cambiar, semana,
  sesión con ejercicios, distancia, tiempo y ritmo opcionales, valoración y modo noche.
- **Entrenador** (`/entrenador/`): novedades con las duras resaltadas, altas con código y enlace
  para compartir, activar y desactivar, código nuevo, editor de sesiones con autocompletado,
  copiar semana y sesión, y baja (archivar, o descargar el CSV y borrar).
- **Revisión del `probador` (fase 1):** 3/5 en funciona, se entiende y se siente bien, y 4/5 en
  visual. Los 16 problemas que encontró están corregidos y los graves tienen su prueba en `npm run flujos`.
- **Añadido (2026-11-20):** protección de datos al entrar, tutorial de instalación, vista de mes
  con dos colores e intensidad que marca el entrenador, y enlace de Strava.
- **Comprobado:** 63 pruebas (`npm test`) y 87 comprobaciones de punta a punta (`npm run flujos`).

## Siguiente

1. Revisión del `probador` del panel y de `F16` a `F20` (sin marcar hechas hasta entonces).
2. Fase 3: almacén Firebase y reglas con sus pruebas (`F12`), guía de puesta en marcha (`F13`)
   y publicación (`F14`, toca `.github/`: se consulta al autor antes de fusionar).

## Pendiente del autor

- Probar la demo publicada (PR #124, 2026-11-20) en su iPhone y puntuarla de 1 a 5.
- Con la app conectada: escribir el responsable y el email en el panel (pestaña Club) y revisar
  el texto de protección de datos. No van en el código porque el repositorio es público.
- Firebase ya está preparado (2026-11-20): falta pasar el bloque `firebaseConfig`.
- Para la fase 4: 5 capturas reales de Strava (claras y oscuras).

## Defectos conocidos

- En el iPhone, Safari y la app instalada no comparten datos: puede pedir el código otra vez.
