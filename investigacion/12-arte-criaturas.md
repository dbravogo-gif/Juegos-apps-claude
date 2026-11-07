# Cómo hacer 200 criaturas con buen acabado sin artistas

2026-11-07. Motivo: el autor vio la prueba de arte F04 de Six-seven islands y pide criaturas
«mucho más curradas», al nivel de Pokémon. Decisión que depende de esto: qué método de arte se
usa para las 200 criaturas. Búsqueda breve: solo costes y licencias.

## Datos

| Opción | Dato | Marca | Fuente |
| --- | --- | --- | --- |
| Generador por piezas (F04) | Coste 0 €. 4–6 mallas y 6–11 llamadas por criatura. Estilo «juguete de vinilo» con cuerpos de revolución | Hecho (medido) | `six-seven-islands/ARCHITECTURE.md` |
| Quaternius | Packs CC0 de monstruos animados: 20 *low poly* (2020) y 21 «cute» texturizados; uno de 50 (2022) con licencia no comprobada | Hecho / sin comprobar el de 50 | [itch.io](https://quaternius.itch.io/lowpoly-animated-monsters), [OpenGameArt](https://opengameart.org/content/textured-cute-monster-pack) |
| Meshy | Plan gratis: 100 créditos al mes, sin acumular. Un modelo con textura cuesta unos 30 (≈ 3 al mes). Licencia del plan gratis: CC BY 4.0, uso comercial con atribución | Hecho, según su documentación citada por la búsqueda; no se pudo abrir (dominio bloqueado aquí) | [docs.meshy.ai/pricing](https://docs.meshy.ai/pricing), [tutorial de créditos](https://www.meshy.ai/tutorials/meshy-credits-guide) |
| Tripo | Plan gratis de 200 a 300 créditos al mes; las fuentes se contradicen sobre el uso comercial gratis. De pago, unos 10–20 $ al mes | Sin confirmar (fuentes de terceros contradictorias) | [blog de Tripo](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models), [costbench](https://costbench.com/software/ai-3d-generation/tripo-ai/) |
| TRELLIS.2 (Microsoft) | Imagen a 3D con materiales PBR. Licencia MIT. Necesita una GPU NVIDIA de 24 GB o más | Hecho (LICENSE y README del repositorio) | [github.com/microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2) |

## Inferencias

- **Las 200 criaturas con el plan gratis de Meshy** son unos 3 modelos al mes: inviable sin
  pagar. Con un plan de pago serían meses de suscripción (precio sin confirmar aquí).
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
