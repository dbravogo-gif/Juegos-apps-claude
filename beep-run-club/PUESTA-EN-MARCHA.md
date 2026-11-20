# Beep Run Club: puesta en marcha de Firebase

Lo hace el entrenador (o el autor con él), con **la cuenta de Google del entrenador**: los datos
son suyos. Unos 15 minutos, y no se paga nada: el plan gratuito (Spark) no pide tarjeta.

Los nombres de los menús pueden variar un poco: la consola de Firebase cambia a menudo.

## Parte 1: ahora (no depende de Claude)

1. **Crear el proyecto.** En <https://console.firebase.google.com> → «Crear un proyecto».
   - Nombre: `beep-run-club`, o el que quiera.
   - **Google Analytics: desactivado.** La app no lo necesita y así se guardan menos datos.
2. **Plan: Spark (gratuito).** No pasar a Blaze: pide tarjeta y la app no lo necesita.
3. **Registrar la app web.** En la portada del proyecto, el icono `</>`.
   - Apodo: `Beep web`.
   - **No** marcar «Firebase Hosting»: la app se publica en GitHub Pages.
   - Copiar el bloque `firebaseConfig`, con `apiKey`, `authDomain`, `projectId`,
     `storageBucket`, `messagingSenderId` y `appId`.
   - **No es secreto:** va dentro de la app. La seguridad está en las reglas de la parte 2.
4. **Activar el acceso.** En Authentication → «Comenzar» → «Método de acceso», activar:
   - **Anónimo**, para los atletas: entran con su código, sin cuenta;
   - **Correo electrónico/contraseña**, para el entrenador. Solo eso: sin el «vínculo por correo».
5. **Crear una cuenta por entrenador.** En Authentication → «Usuarios» → «Agregar usuario».
   - Su email y una contraseña larga. **La contraseña no se le pasa a nadie, tampoco a Claude.**
   - Copiar el **UID** de cada uno, que aparece en la lista de usuarios.
6. **Dominio autorizado.** En Authentication → «Configuración» → «Dominios autorizados» →
   «Agregar dominio»: `dbravogo-gif.github.io`.
7. **Crear la base de datos.** En Firestore Database → «Crear base de datos».
   - Si pregunta la edición: **Standard**.
   - **Ubicación: `europe-southwest1` (Madrid).** ⚠️ No se puede cambiar después.
   - Modo: **producción**. Bloquea todo hasta poner las reglas de la parte 2, que es lo seguro.
8. **Dar permiso de entrenador.** En Firestore → «Datos» → «Iniciar colección».
   - ID de la colección: `entrenadores`.
   - Un documento por entrenador, con **el UID del paso 5** como ID y un campo `nombre` (cadena)
     con su nombre.
9. **Opcional:** dar acceso al autor para que pueda ayudar. En ⚙️ Configuración del proyecto →
   «Usuarios y permisos» → «Agregar miembro» → su email, con el rol «Editor».

**Qué hay que pasarle a Claude:**


- el bloque `firebaseConfig` del paso 3;
- la confirmación de que la ubicación es `europe-southwest1`.

Nada más: ni contraseñas ni el UID.

**Antes de usarla con atletas reales:**

- en el panel, pestaña **Club**, escribir el responsable de los datos y el email de contacto, y
  revisar el texto de protección de datos. Lo redactó Claude a partir de lo que guarda la app,
  pero sin asesoría jurídica;
- guardarlo con «Pedir que la acepten de nuevo».

## Parte 2: cuando Claude termine la fase 3

Claude dará en este mismo archivo:

1. **Las reglas de seguridad**, para pegarlas en Firestore → «Reglas» → «Publicar».
2. **El índice de Novedades:** la primera vez que el entrenador abra Novedades, la consola dará
   un enlace para crearlo con un clic.
3. **Recomendado: App Check.** Evita que alguien abuse de la base de datos probando códigos al
   azar.

Después, en la app, ya no saldrá «Modo demo». El entrenador entra en `/entrenador/` con su email
y su contraseña y da de alta a sus atletas.
