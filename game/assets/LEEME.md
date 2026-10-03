# Imágenes del juego

Cada archivo va en la carpeta de su categoría con el nombre exacto que indica `../ASSETS.md`:

```
assets/personaje/etapa1.png          de frente, para la ficha
assets/personaje/etapa1_combate.png  de espaldas, hoja de 3 poses
assets/personaje/etapa1_victoria.png celebrando, de frente
assets/personaje/etapa1_derrota.png  arrodillado, de frente
assets/enemigos/<id>.png             hoja de 3 poses, de frente
assets/zonas/<id>.png                fondo de combate, apaisado
assets/espacios/<id>.png             fondo de la parcela, apaisado
assets/muebles/<id>.png              icono suelto
assets/equipo/<id>.png               icono suelto
assets/mascotas/<id>.png             icono suelto
```

No hace falta tocar código: mientras el archivo no existe se ve un marcador de color, y en
cuanto aparece con el nombre correcto la app lo usa.

Las hojas de poses se recortan solas por código, así que deben llevar las poses en fila
horizontal, del mismo tamaño y repartidas en tercios exactos.
