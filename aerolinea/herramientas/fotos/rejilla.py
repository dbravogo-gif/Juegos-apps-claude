# Recorta una zona, la amplía y le pinta una rejilla con coordenadas de la foto original.
#   python3 rejilla.py foto.jpg salida.png x0 y0 x1 y1 [escala] [paso]
import sys
from PIL import Image, ImageDraw, ImageFont
f, sal, x0, y0, x1, y1 = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7])
k = int(sys.argv[7]) if len(sys.argv) > 7 else 4
paso = int(sys.argv[8]) if len(sys.argv) > 8 else 10
img = Image.open(f).convert('RGB').crop((x0, y0, x1, y1))
img = img.resize((img.width * k, img.height * k), Image.NEAREST)
lienzo = Image.new('RGB', (img.width + 40, img.height + 24), (255, 255, 255))
lienzo.paste(img, (40, 24))
d = ImageDraw.Draw(lienzo)
fuente = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 11)
for x in range((x0 // paso + 1) * paso, x1, paso):
    X = 40 + (x - x0) * k
    d.line([(X, 24), (X, lienzo.height)], fill=(255, 0, 255) if x % 50 == 0 else (0, 200, 255), width=1)
    d.text((X - 8, 4), str(x), fill=(0, 0, 0), font=fuente)
for y in range((y0 // paso + 1) * paso, y1, paso):
    Y = 24 + (y - y0) * k
    d.line([(40, Y), (lienzo.width, Y)], fill=(255, 0, 255) if y % 50 == 0 else (0, 200, 255), width=1)
    d.text((2, Y - 6), str(y), fill=(0, 0, 0), font=fuente)
lienzo.save(sal)
