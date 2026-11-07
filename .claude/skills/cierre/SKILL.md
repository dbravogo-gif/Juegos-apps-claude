---
name: cierre
description: Cierra una tarea o una sesión de trabajo - comprueba, actualiza el estado, apunta lo aprendido, revisa el cumplimiento de las reglas, hace commit y push y deja el mensaje final con lo que necesita el autor. Úsala al terminar cualquier tarea mediana o grande, o cuando el autor escriba /cierre.
---

1. **Comprueba** lo que cambió (regla R2): pruebas, build y capturas de lo tocado. Si algo no se
   pudo comprobar, apúntalo.
2. **Revisión independiente** con el agente `probador`, si se cerró una fase o algo visual
   importante, o una función grande en modo normal (regla R3).
3. **Estado** (regla R7): actualiza el `ESTADO.md` de la raíz y el del proyecto, con el
   presente, el siguiente paso y lo pendiente del autor. Borra lo que ya no sea verdad; no
   acumules historial.
4. **Aprendido** (regla R6): si un error costó tiempo o se repitió, añade su entrada a
   `APRENDIDO.md` con la barrera. Si ya estaba, sube la barrera de nivel: de nota a regla, y de
   regla a prueba o hook.
5. **Reglas:** repasa de la R1 a la R12 contra lo hecho en la tarea. Todo incumplimiento que no
   se avisó se declara ahora como excepción.
6. **Commit y push** a la rama asignada, con un mensaje que diga qué cambió y por qué.
7. **Mensaje final** (regla R11), corto:
   - el resultado y su prueba,
   - las excepciones,
   - qué necesitas del autor, en concreto (con la lista 1–5 si tiene que jugar),
   - y el siguiente paso recomendado con su coste: bajo, medio o alto.

   Si el siguiente paso es de otro tema, recomienda abrir una sesión nueva.
