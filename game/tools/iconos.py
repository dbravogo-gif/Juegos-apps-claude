"""Rasteriza icon.svg a PNG.

iOS ignora los iconos SVG del manifest: sin un apple-touch-icon.png, «Añadir a pantalla de
inicio» pone una captura de la página en vez del icono. El SVG es de tres formas, así que
se redibujan aquí en vez de arrastrar un rasterizador entero como dependencia.
"""

from PIL import Image, ImageDraw

VERDE = (47, 125, 93)
CREMA = (246, 241, 231)
SUPER = 4  # se dibuja a lo grande y se reduce: así los bordes salen suaves


def bezier(p0, p1, p2, p3, pasos=60):
    for i in range(pasos + 1):
        t = i / pasos
        u = 1 - t
        yield (
            u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1],
        )


# La gota del SVG, segmento a segmento.
GOTA = [
    ((256, 132), (204, 132), (162, 172), (162, 222)),
    ((162, 222), (162, 284), (224, 334), (256, 380)),
    ((256, 380), (288, 334), (350, 284), (350, 222)),
    ((350, 222), (350, 172), (308, 132), (256, 132)),
]


def dibujar(lado):
    lienzo = Image.new("RGBA", (512 * SUPER, 512 * SUPER), (0, 0, 0, 0))
    pincel = ImageDraw.Draw(lienzo)
    e = SUPER

    pincel.rounded_rectangle([0, 0, 512 * e - 1, 512 * e - 1], radius=112 * e, fill=VERDE)
    contorno = [(x * e, y * e) for seg in GOTA for x, y in bezier(*seg)]
    pincel.polygon(contorno, fill=CREMA)
    pincel.ellipse([(256 - 34) * e, (220 - 34) * e, (256 + 34) * e, (220 + 34) * e], fill=VERDE)

    return lienzo.resize((lado, lado), Image.LANCZOS)


if __name__ == "__main__":
    for nombre, lado in [("apple-touch-icon", 180), ("icon-192", 192), ("icon-512", 512)]:
        dibujar(lado).save(f"icons/{nombre}.png")
        print(f"icons/{nombre}.png  {lado}×{lado}")
