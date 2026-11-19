# Estado de Beep Run Club

Actualizado: 2026-11-19. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Fases 1 y 2 hechas en modo demo (`F01` a `F11`): la app del atleta y el panel del entrenador
funcionan con datos de ejemplo guardados en el navegador. Falta la nube (fase 3).

## Hecho

- **Atleta:** entra con código o enlace, sesión persistente con confirmación al cambiar, semana,
  sesión con ejercicios, distancia, tiempo y ritmo opcionales, valoración y modo noche.
- **Entrenador** (`/entrenador/`): novedades con las duras resaltadas, altas con código y enlace
  para compartir, activar y desactivar, código nuevo, editor de sesiones con autocompletado,
  copiar semana y sesión, y baja (archivar, o descargar el CSV y borrar).
- **Comprobado:** 47 pruebas (`npm test`) y los flujos de punta a punta (`npm run flujos`).

## Siguiente

1. Revisión del `probador` de la fase 1 (se cortó por el límite de uso y se ha retomado).
2. Fase 3: almacén Firebase y reglas con sus pruebas (`F12`), guía de puesta en marcha (`F13`)
   y publicación (`F14`, toca `.github/`: se consulta al autor antes de fusionar).

## Pendiente del autor

- La cuenta de Firebase del entrenador (ya pedida). Con ella se sigue la guía de la fase 3.
- Para la fase 4: 5 capturas reales de Strava (claras y oscuras).

## Defectos conocidos

- En el iPhone, Safari y la app instalada no comparten datos: puede que pida el código una vez
  más al instalarla. Está por comprobar en su iPhone.
