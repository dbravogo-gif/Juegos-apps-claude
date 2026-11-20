# Estado de Beep Run Club

Actualizado: 2026-11-20. Solo el presente (historial en git). Máximo 40 líneas.

## Fase actual

**Conectada a Firebase y publicada** para que el club la pruebe el fin de semana y diga qué
cambiar. Fases 1 a 3 construidas. Las funciones están sin marcar como hechas hasta que pase el
`probador` (`F01` a `F11` sí lo están).

## Hecho

- **Atleta:**
  - entrada con código o enlace, protección de datos y tutorial de instalación (iPhone o Android);
  - semana y mes (dos colores), sesión con ejercicios, distancia, tiempo y ritmo;
  - valoración con enlace de Strava; modo noche; sin conexión.
- **Entrenador** (`/entrenador/`, email y contraseña de la cuenta del club):
  - novedades, atletas con código y enlace, editor con intensidad, copiar semana y sesión, baja con CSV;
  - pestaña Club: responsable y política, con «pedir de nuevo» o «solo corregir».
- **Firebase:** almacén, reglas y SDK en `vendor/` (proyecto `beep-run-club`).
- **Comprobado:** 63 pruebas, 87 comprobaciones en demo, 8 de reglas (fallan con reglas abiertas)
  y 22 contra Firebase emulado, con red lenta y sin conexión incluidas.
- **Arreglado (0.5.1):** en el iPhone se «comían» toques por esperas sin señal (ver `APRENDIDO.md`).

## Siguiente

1. Lo que pida el club tras probarla el fin de semana.
2. Revisión del `probador` del panel, de `F12` a `F20` y de Firebase. Después, App Check.

## Pendiente del autor

- **Pegar las reglas** en Firebase (parte 2 de `PUESTA-EN-MARCHA.md`): sin ellas no funciona.
- En el panel, pestaña Club: responsable y email (no van en el código: el repositorio es público).
- Confirmar que Firestore está en `europe-southwest1` (Madrid).
- Probarla y puntuar de 1 a 5: la primera vez, el mes, valorar y el panel.

## Defectos conocidos

- En el iPhone, Safari y la app instalada no comparten datos: puede pedir el código otra vez.
- Los pasos del tutorial están sin comprobar en un iPhone y un Android reales.
