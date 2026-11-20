# Beep Run Club: Contrato de arquitectura

Todo agente lo lee antes de escribir código.

## Reglas duras

1. **HTML, CSS y JS en módulos, sin build.** El sitio se publica copiando la carpeta.
2. **El núcleo (`src/nucleo/`) es puro:** sin DOM, sin red, sin `Math.random` y sin reloj.
   - La fecha de hoy y el generador de azar entran como parámetros.
   - Todo lo que decide algo vive aquí y tiene pruebas (`node --test`).
3. **La interfaz no habla con Firebase:** solo con el almacén (`src/datos/`), que tiene dos
   implementaciones con la misma interfaz:
   - `demo`: guarda en `localStorage`. Sirve para probar sin nube, para las capturas y para
     las pruebas.
   - `firebase`: la de verdad.
4. **Ninguna dependencia nueva** sin justificarla aquí.
5. **Mismo dominio que otras apps del autor:**
   - Las claves de `localStorage` empiezan por `beep_`.
   - Las cachés del service worker se llaman `beep-run-club-<versión>`, y el service worker solo
     borra las suyas.
6. **Tras cada cambio:**
   - `npm test`;
   - una captura con `node ../herramientas/capturar.mjs beep-run-club`;
   - subir `VERSION` en `sw.js` si cambia algo publicado.

## Carpetas

| Carpeta | Es dueña de |
| --- | --- |
| `src/nucleo/` | Semanas y fechas, ritmo, validación de sesiones y valoraciones, códigos, exportación |
| `src/datos/` | La interfaz del almacén y sus implementaciones `demo` y `firebase` |
| `src/comun/` | Estilos con los colores de `ARTE.md`, componentes y avisos |
| `src/atleta/` | Pantallas del atleta (`index.html`) |
| `src/entrenador/` | Pantallas del entrenador (`entrenador/index.html`) |
| `pruebas/` | Pruebas del núcleo y de las reglas de seguridad |
| `pruebas-navegador/` | Flujos de punta a punta en Chromium |
| `fuentes/`, `icons/` | Recursos estáticos |

## Modelo en la nube (Firestore, región de la UE)

| Ruta | Campos | Quién la usa |
| --- | --- | --- |
| `entrenadores/{uid}` | `nombre` | Existir aquí da permisos de entrenador (uno por entrenador) |
| `club/politica` | `version`, `publicada`, `responsable{}`, `resumen[]`, `secciones[]` | La política de protección de datos vigente. Sin documento, vale la original del código |
| `codigos/{codigo}` | `atleta`, `activo` | El código que teclea el atleta |
| `codigos/{codigo}/dispositivos/{uid}` | `alta`, `privacidad` (`version`, `fecha`) | Cada móvil que entró con ese código, con su aceptación de la protección de datos |
| `atletas/{id}` | `nombre`, `codigo`, `estado` (`activo`, `archivado`) | Datos del atleta |
| `atletas/{id}/sesiones/{sid}` | `fecha` (AAAA-MM-DD), `titulo`, `nota`, `intensidad` (`suave`, `exigente`), `ejercicios[]` | El plan |
| `atletas/{id}/registros/{sid}` | `hechos[]`, `esfuerzo` (1–10), `duros[]`, `carrera{}`, `comentario`, `strava`, `actualizado` | La valoración de la sesión `sid` |

- Cada ejercicio lleva `id`, `nombre`, `detalle`, `nota` y `carrera` (sí o no).
- **Entrar:**
  1. El móvil inicia sesión anónima en Firebase y obtiene un `uid` propio.
  2. Lee `codigos/{codigo}`.
  3. Si el código está activo, se registra en `dispositivos/{uid}`.
  4. Desde entonces lee el plan y escribe sus valoraciones.
- **Reglas de seguridad:**
  - Un móvil lee y escribe en `atletas/{id}` solo si está registrado en el código actual del
    atleta y ese código está activo.
  - Nadie puede listar códigos ni atletas, salvo el entrenador.
- **Por qué este modelo:**
  - **Desactivar** es poner `activo: false`.
  - **Regenerar el código** echa a todos los móviles anteriores.
  - **Limitar los móviles** más adelante solo añade un contador y una regla, sin migrar datos.
- **Sin cobertura:** la caché persistente de Firestore guarda el plan y pone en cola las
  valoraciones hasta que vuelve la conexión.

## Dependencias

| Dependencia | Licencia | Por qué hace falta |
| --- | --- | --- |
| Firebase JS SDK (CDN de gstatic, versión fijada con más de dos semanas) | Apache-2.0 | Sesión anónima y del entrenador, base de datos con caché sin conexión y cola de escrituras. Hacerlo a mano sería reinventarlo peor |
| `@fontsource/bricolage-grotesque`, `@fontsource/dm-sans` (solo se copian los `.woff2`) | OFL-1.1 | Las fuentes de la marca, que también funcionan sin conexión |
| Tesseract.js (solo en la fase 4; se carga la primera vez que se usa) | Apache-2.0 | Leer en el móvil las capturas de Strava, sin servidor ni coste |
| `@firebase/rules-unit-testing` y el emulador (solo para desarrollo) | Apache-2.0 | Demostrar las reglas de seguridad con pruebas |

## Pruebas

- **`npm test`:** el núcleo, el almacén demo y las barreras de publicación. Por ejemplo, que el
  service worker guarde todos los archivos y que las versiones coincidan.
- **`npm run flujos`:** los flujos del atleta en Chromium. Usan Playwright, así que no corren en
  el flujo de publicación. Fallan si alguna pantalla muestra «null» o «undefined».

## Ganchos de prueba

`window.__BEEP__` (también en `window.__JUEGO__`, que es el que lee
`herramientas/capturar.mjs`) con:

- `estado()`: pantalla actual, si hay sesión y el almacén en uso;
- `hoy(fecha)`: fija la fecha de hoy;
- `demo()`: carga los datos de ejemplo.
