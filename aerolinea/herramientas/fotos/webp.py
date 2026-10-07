# Recorta cada foto a 1,75:1 centrada en el avión y la guarda en WebP para el juego.
#   python3 webp.py carpeta-originales carpeta-destino
import os, sys
from PIL import Image
CENTRO = {  # altura del centro del avión en la foto, en fracción del alto
    'f27': .47, 'viscount': .44, 'caravelle': .38, 'f28': .48, 'bac111': .45, 'dc9': .48, 'hs748': .53, 'c212': .66,
    'b737': .45, 'b727': .51, 'b707': .54, 'dc8': .48, 'a300': .48, 'l1011': .5, 'dc10': .5,
    'b747': .46, 'concorde': .51, 'md80': .44, 'b767': .44, 'b757': .45, 'b733': .42, 'atr42': .49, 'a320': .46, 'f100': .56,
}
PROPORCION = {'c212': 2.2}  # más panorámica cuando el avión queda bajo en la foto
origen, destino = sys.argv[1], sys.argv[2]
solo = sys.argv[3:]
total = 0
for tipo, f in CENTRO.items():
    if solo and tipo not in solo:
        continue
    ruta = os.path.join(origen, f'{tipo}-castellano.jpg')
    if not os.path.exists(ruta):
        ruta = os.path.join(origen, f'{tipo}.jpg')
    img = Image.open(ruta).convert('RGB')
    W, H = img.size
    alto = min(H, round(W / PROPORCION.get(tipo, 1.75)))
    y0 = max(0, min(H - alto, round(f * H - alto / 2)))
    img = img.crop((0, y0, W, y0 + alto)).resize((900, round(900 * alto / W)), Image.LANCZOS)
    salida = os.path.join(destino, f'{tipo}.webp')
    img.save(salida, 'WEBP', quality=74, method=6)
    total += os.path.getsize(salida)
    print(tipo, os.path.basename(ruta), img.size, os.path.getsize(salida) // 1024, 'KB')
print('total', total // 1024, 'KB')
