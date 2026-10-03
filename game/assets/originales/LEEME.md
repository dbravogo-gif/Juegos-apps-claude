# Imágenes sin procesar

Buzón para las imágenes tal como salen del generador. Deja cada una en la carpeta de su
categoría, con el **id de destino como nombre del archivo**, y ejecuta:

```
python3 tools/preparar.py --auto
```

Eso las recorta, les quita el fondo, las alinea y las deja en `assets/<categoria>/`. Los
originales se borran después del commit: el repositorio guarda el resultado, no la materia
prima, que pesa diez veces más.

## Dónde va cada cosa

| Carpeta | Qué espera | Ejemplo de nombre |
| --- | --- | --- |
| `personaje/` | Hoja de 3 poses | `etapa1.png`, `etapa1_combate.png` |
| `enemigos/` | Hoja de 3 poses | `rata_murallas.png` |
| `zonas/` `espacios/` | Fondo apaisado | `murallas.png`, `habitacion.png` |
| `muebles/` `equipo/` `mascotas/` | Objetos sueltos | `mub_arcon.png` |

Los ids son los de `../../ASSETS.md`.

## Varias piezas en una misma imagen

Encadena los ids con `+`, en el orden en que aparecen de izquierda a derecha:

```
muebles/mub_trono+mub_vitrina+mub_arcon.png
```

## El fondo da igual

Detecta solo si viene con fondo verde, con el tablero de cuadros o con transparencia de
verdad, y actúa en consecuencia. No hay que indicar nada.
