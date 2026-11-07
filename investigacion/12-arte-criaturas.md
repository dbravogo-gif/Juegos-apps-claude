# Cómo hacer 200 criaturas con buen acabado sin artistas

2026-11-07. Motivo: el autor vio la prueba de arte F04 de Six-seven islands y pide criaturas
«mucho más curradas», al nivel de Pokémon. Decisión que depende de esto: qué método de arte se
usa para las 200 criaturas. Búsqueda breve: solo costes y licencias.

## Datos

| Opción | Dato | Marca | Fuente |
| --- | --- | --- | --- |
| Generador por piezas (F04) | Coste 0 €. 4–6 mallas y 6–11 llamadas por criatura. Estilo «juguete de vinilo» con cuerpos de revolución | Hecho (medido) | `six-seven-islands/ARCHITECTURE.md` |
| Quaternius | Packs CC0 de monstruos animados: 20 *low poly* (2020) y 21 «cute» texturizados; uno de 50 (2022) con licencia no comprobada | Hecho / sin comprobar el de 50 | [itch.io](https://quaternius.itch.io/lowpoly-animated-monsters), [OpenGameArt](https://opengameart.org/content/textured-cute-monster-pack) |
| Meshy | Plan gratis: 100 créditos al mes. Licencia CC BY 4.0, uso comercial con atribución. Coste por criatura: abajo | Hecho (documentación abierta después; ver abajo) | [docs.meshy.ai/pricing](https://docs.meshy.ai/pricing), [tutorial de créditos](https://www.meshy.ai/tutorials/meshy-credits-guide) |
| Tripo | Plan gratis de 200 a 300 créditos al mes; las fuentes se contradicen sobre el uso comercial gratis. De pago, unos 10–20 $ al mes | Sin confirmar (fuentes de terceros contradictorias) | [blog de Tripo](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models), [costbench](https://costbench.com/software/ai-3d-generation/tripo-ai/) |
| TRELLIS.2 (Microsoft) | Imagen a 3D con materiales PBR. Licencia MIT. Necesita una GPU NVIDIA de 24 GB o más | Hecho (LICENSE y README del repositorio) | [github.com/microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2) |

## Comprobado después en la documentación de Meshy (2026-11-07)

Se abrió `docs.meshy.ai` en la red de la sesión. Fuentes:
[precios](https://docs.meshy.ai/en/webapp/pricing),
[Image to 3D](https://docs.meshy.ai/en/webapp/image-to-3d),
[AI Texturing](https://docs.meshy.ai/en/webapp/guides/3d-model/ai-texturing) y
[recursos para juegos](https://docs.meshy.ai/en/webapp/guides/use-cases/game-assets).

- **Hecho:** plan gratis de 100 créditos al mes, sin tarjeta. Licencia CC BY 4.0: uso comercial
  con atribución, y el resultado es del usuario. Los planes de pago dan licencia privada.
- **Hecho, coste por acción:**
  - Image to 3D: 10 créditos con Meshy 6 Lite y 20 con Meshy 6 o 7.1.
  - Smart Topology: 5 con Meshy T2 (de 100 a 15.000 polígonos, separa la malla en partes) y 20
    con T1.
  - Textura al generar o AI Texturing: 10.
  - Remesh, Rigging y Animate: 0.
  - Las generaciones fallidas no cobran.
- **Hecho:** la pose fija (A, T o a medida) es solo para humanoides.
- **Hecho:** Meshy recomienda unos 5.000 polígonos para móvil y 20.000 para PC.
- **Inferencia:** una criatura con Smart Topology T2 y textura cuesta 15 créditos, así que el
  plan gratis da para unas 6 al mes.

## Inferencias

- **Las 200 criaturas con el plan gratis de Meshy** son unas 6 al mes: casi 3 años. Con un
  plan de pago, menos (precio sin confirmar aquí).
- **TRELLIS.2 es gratis, pero no aquí ni en un iPhone:** hace falta alquilar una GPU (con coste)
  o un espacio gratuito con cuota (sin comprobar).
- **Los modelos generados por IA vienen sin esqueleto pensado para criaturas.** En un combate
  por turnos basta una animación de cuerpo entero (respirar, embestir, encogerse), que el
  juego ya tiene. Confianza media.
- **Riesgo R8 de la IA:** no se le pide «estilo Pokémon» ni se le dan imágenes ajenas. Los
  diseños parten de descripciones propias.
- **Techo del generador por piezas:** con un modelado esculpido (uniones suaves de formas,
  hocicos, cuellos, patas) y varios tipos de cuerpo (cuadrúpedo, bípedo, ave, serpiente) mejora
  mucho; el nivel de un estudio profesional no. Es una opinión.

## Contradicciones

- Meshy: una página dice que el plan gratis no admite comprar créditos y otra dice que sí.
- Tripo: el uso comercial del plan gratis (su blog dice que sí con atribución; terceros dicen
  que no).
