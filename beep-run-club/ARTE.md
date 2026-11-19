# Beep Run Club: Guía de arte

Sale de la guía de marca del club (noviembre de 2026). No se inventan colores ni fuentes.

- **Concepto visual:** un cartel de club de barrio. Crema de fondo, rojo con mucho peso y
  letras gordas y blanditas.
- **El elemento memorable:** el correcaminos con gafas y café. Aparece en el icono, en la
  pantalla de entrada y al terminar una sesión; no está en todas partes.

## Paleta

| Nombre | Hex | Uso |
| --- | --- | --- |
| Rojo Beep | `#E84639` | Marca, botones principales, cabeceras y lo importante |
| Crema Beep | `#FDF8E3` | Fondo de la app y texto sobre rojo |
| Tinta | `#2B2420` | Texto de cuerpo sobre crema |
| Rojo oscuro | `#B8332A` | Estado pulsado y texto rojo pequeño |

- **Tinta y Rojo oscuro** son derivados funcionales, no colores de marca. Se usan para que el
  texto pequeño se lea bien.
- **Contraste** (calculado con la fórmula WCAG):
  - Rojo Beep y Crema dan 3,67:1 en los dos sentidos. Solo vale para texto grande: ≥ 24 px,
    o ≥ 18,7 px en negrita 700.
  - Por eso las etiquetas de los botones rojos van en Bricolage 700 a 19 px o más.
  - El texto pequeño en rojo usa el Rojo oscuro (5,56:1).
  - La Tinta sobre Crema da 14,3:1.
- **Sin modo oscuro en la v1:** la marca es crema y rojo.

## Tipografía

| Fuente | Pesos | Uso |
| --- | --- | --- |
| Bricolage Grotesque | 700, 800 | Titulares, fechas y destacados («SÁB 28 NOV») |
| DM Sans | 300, 400, 600 | Textos, horarios y etiquetas. 600 para remarcar |

- Las dos tienen licencia OFL-1.1 y van incluidas en la app (paquetes `@fontsource`), para que
  funcione sin conexión.
- El logo «BEEP / RUN CLUB» es un dibujo, no una fuente: va como imagen.

## Formas y componentes

- **Esquinas** muy redondeadas, de 16 a 24 px, como las letras del logo.
- **Botones principales:** fondo rojo y texto crema, de al menos 48 px de alto.
- **Tarjetas de sesión:** borde rojo de 2 px sobre crema. Hoy se rellena de rojo.
- **Escala de esfuerzo:** 10 botones en fila que van de crema a rojo lleno.
- **Iconos** de línea, del mismo grosor que el trazo del correcaminos.
