# Deja un GLB de Meshy solo con su textura de color, reducida a 1K: la luz va pintada en ella y
# el juego no usa relieve ni metal. Uso: python3 -I herramientas/aligerar-glb.py entrada.glb salida.glb
import io, json, struct, sys
from PIL import Image

entrada, salida = sys.argv[1], sys.argv[2]
datos = open(entrada, 'rb').read()
j_len, _ = struct.unpack_from('<II', datos, 12)
g = json.loads(datos[20:20 + j_len])
b_len, _ = struct.unpack_from('<II', datos, 20 + j_len)
binario = datos[28 + j_len: 28 + j_len + b_len]

def vista(i):
    bv = g['bufferViews'][i]
    o = bv.get('byteOffset', 0)
    return binario[o:o + bv['byteLength']]

mat = g['materials'][0]
pbr = mat['pbrMetallicRoughness']
tex_color = pbr['baseColorTexture']['index']
img_color = g['textures'][tex_color]['source']
# Material: solo color, sin metal ni relieve.
for k in ('metallicRoughnessTexture',):
    pbr.pop(k, None)
pbr['metallicFactor'] = 0
pbr['roughnessFactor'] = 1
mat.pop('normalTexture', None)
mat.pop('occlusionTexture', None)
mat.pop('emissiveTexture', None)
for m in g['materials'][1:]:
    raise SystemExit('más de un material: revisar a mano')
# Textura de color a 1K en JPEG.
im = Image.open(io.BytesIO(vista(g['images'][img_color]['bufferView']))).convert('RGB')
im = im.resize((1024, 1024), Image.LANCZOS)
buf = io.BytesIO(); im.save(buf, 'JPEG', quality=88, optimize=True)
nueva_img = buf.getvalue()

# Vistas que se quedan: las de los accesores y la de la imagen nueva.
usadas = sorted({a['bufferView'] for a in g['accessors'] if 'bufferView' in a})
trozos = []; nuevas_vistas = []; remap = {}
def anadir(bytes_, base=None):
    while sum(len(t) for t in trozos) % 4: trozos.append(b'\0')
    off = sum(len(t) for t in trozos)
    trozos.append(bytes_)
    v = dict(base or {}); v.pop('byteOffset', None); v['buffer'] = 0; v['byteOffset'] = off; v['byteLength'] = len(bytes_)
    nuevas_vistas.append(v)
    return len(nuevas_vistas) - 1
for i in usadas:
    remap[i] = anadir(vista(i), g['bufferViews'][i])
iv = anadir(nueva_img)
for a in g['accessors']:
    if 'bufferView' in a: a['bufferView'] = remap[a['bufferView']]
g['bufferViews'] = nuevas_vistas
g['images'] = [{'bufferView': iv, 'mimeType': 'image/jpeg'}]
tex = g['textures'][tex_color]; tex['source'] = 0
g['textures'] = [tex]
pbr['baseColorTexture']['index'] = 0
bin_total = b''.join(trozos)
while len(bin_total) % 4: bin_total += b'\0'
g['buffers'] = [{'byteLength': len(bin_total)}]
js = json.dumps(g, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 12 + 8 + len(js) + 8 + len(bin_total)
out = struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_total), 0x004E4942) + bin_total
open(salida, 'wb').write(out)
print(f'{entrada.split("/")[-1]} -> {salida.split("/")[-1]}: {len(datos)/1e6:.1f} MB -> {len(out)/1e6:.2f} MB')
