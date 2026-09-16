### 3\. Activa GitHub Pages

1. Ve a **Settings → Pages** (menú lateral).
2. En *Source* elige **Deploy from a branch**.
3. Branch: `main`, carpeta: `/ (root)`. Pulsa **Save**.
4. Espera 1–2 minutos y recarga: te dará una dirección tipo
`https://TU-USUARIO.github.io/bulkup/`

Esa es la URL de tu app. Guárdala.

### 4\. Instálala en el iPhone

1. Abre esa dirección **en Safari** (tiene que ser Safari, no Chrome).
2. Pulsa el icono de compartir (cuadrado con flecha hacia arriba).
3. **Añadir a pantalla de inicio**.
4. Nombre: Bulk Up. Añadir.

Ya tienes la app, con el gorila como icono. Ábrela desde ahí: se verá a pantalla completa, sin barra del navegador.

En Android es igual pero con Chrome: normalmente sale solo un aviso de "Instalar aplicación".

\---

## Actualizarla en el futuro

Cuando quieras cambios (rutina nueva, funciones nuevas), el proceso es:

1. Te paso el `index.html` nuevo (y `sw.js` si cambia la versión).
2. En GitHub: entra en el archivo `index.html` → icono del lápiz → borra el contenido y pega
el nuevo → **Commit changes**. O usa **Add file → Upload files** y sobrescribe.
3. En el móvil, la próxima vez que abras la app te saldrá abajo un aviso
**"Hay una versión nueva de Bulk Up"** con un botón *Actualizar*.

Para forzar que todos los dispositivos se actualicen, sube el número de versión en la
primera línea de `sw.js`:

```js
const APP\_VERSION = "v1.0.1";   // cambia esto en cada publicación
```

\---

## Tus datos y las copias en iCloud

* Se guardan en el propio dispositivo (almacenamiento del navegador), no en internet.
Nadie más los ve y funcionan sin conexión.
* **Las actualizaciones de la app no borran tus datos.**
* **No se sincronizan solos con iCloud**: Apple no lo permite para apps web. Por eso la app
incluye copias manuales a archivo.

### Guardar una copia en iCloud Drive

1. Pantalla principal → **Copia de seguridad**.
2. **Exportar archivo**.
3. En el menú que sale: *Guardar en Archivos* → **iCloud Drive**.

Te genera un `BulkUp-AAAAMMDD-HHMM.json`. Hazlo de vez en cuando (una vez al mes basta).

### Recuperar la copia (móvil nuevo, datos borrados…)

1. Instala la app en el dispositivo nuevo con los pasos de arriba.
2. **Copia de seguridad** → **Restaurar desde archivo**.
3. Elige el `.json` desde iCloud Drive. Listo: vuelve todo, incluida la planificación.

> Si algún navegador no te deja descargar archivos, dentro del mismo menú tienes
> \*Ver copia como texto\* para copiar y pegar en una nota.

\---

## Alternativa aún más rápida

Si prefieres no crear cuenta de GitHub, entra en https://app.netlify.com/drop y arrastra
la carpeta entera. Te da una URL al instante. El inconveniente es que actualizarla es más
manual y la dirección es menos estable, por eso recomiendo GitHub Pages para el uso a largo plazo.

\---

## Compartirla con un amigo

La dirección es pública: cualquiera puede abrirla e instalarla igual que tú, y **sus datos
serán suyos** (cada móvil guarda los propios, no se mezclan). Puede adaptar rutinas,
ejercicios, actividades y suplementos desde la propia app sin tocar código. Si quisiera
cambios de fondo, en GitHub puede darle a *Fork* y tener su propia copia con su URL.

\---

## Notas honestas sobre los límites

* **No está en la App Store.** Para eso harían falta un Mac, cuenta de desarrollador de Apple
(99 $/año) y pasar revisiones. Para una app personal no compensa; una PWA instalada se
comporta prácticamente igual en el día a día.
* **El icono de la pantalla de inicio no cambia solo.** Duolingo lo hace porque es una app
nativa (iOS tiene una API para eso que no está disponible en apps web). Por eso el estado
de tu progreso —copa, estrella, aviso de descanso— se muestra en un panel grande al abrir
la app, que analiza tus últimas 2 semanas.
* **La vibración del cronómetro no funciona en iPhone.** Apple no permite la API de vibración
en Safari. El sonido sí funciona.
* **Ningún cronómetro web sigue contando con la pantalla bloqueada.** La app lo compensa
calculando el tiempo real transcurrido: al volver verás el tiempo correcto, no uno parado.

