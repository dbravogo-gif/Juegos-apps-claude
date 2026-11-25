# La versión detallada de cada criatura, para la vitrina de la ficha (autor, 2026-11-25): la misma
# geometría que la del juego, pero con la textura a 2K en vez de 1K. Solo se hace cuando el original
# de Meshy tiene más de 1K; las iniciales y las que ya están al máximo usan su modelo de siempre.
#
# Escribe public/modelos/criaturas/detalle/<id>.glb y src/data/modelos-detalle.ts.
# Uso: python3 herramientas/criaturas/detalle.py [--forzar]
import io
import json
import os
import struct
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
import plan  # noqa: E402

RAIZ = plan.RAIZ
SALIDA = os.path.join(RAIZ, 'public', 'modelos', 'criaturas', 'detalle')
DATOS = os.path.join(RAIZ, 'src', 'data', 'modelos-detalle.ts')
ALIGERAR = os.path.join(RAIZ, 'herramientas', 'aligerar-glb.py')
LADO = 2048


def lado_textura(ruta):
    """El lado en píxeles de la textura de color del GLB (0 si no tiene)."""
    from PIL import Image
    datos = open(ruta, 'rb').read()
    j_len, _ = struct.unpack_from('<II', datos, 12)
    g = json.loads(datos[20:20 + j_len])
    binario = datos[28 + j_len:]
    pbr = g['materials'][0].get('pbrMetallicRoughness', {})
    if 'baseColorTexture' not in pbr:
        return 0
    img = g['images'][g['textures'][pbr['baseColorTexture']['index']]['source']]
    bv = g['bufferViews'][img['bufferView']]
    o = bv.get('byteOffset', 0)
    return max(Image.open(io.BytesIO(binario[o:o + bv['byteLength']])).size)


def main():
    filas = [f for f in plan.criaturas() if f['tiene_modelo'] and not f['inicial']]
    origenes = {}
    for nombre in os.listdir(plan.CARPETA_AUTOR):
        if nombre.lower().endswith('.glb') and nombre.startswith('Pok'):
            origenes[int(nombre[3:].split('.')[0])] = os.path.join(plan.CARPETA_AUTOR, nombre)
    os.makedirs(SALIDA, exist_ok=True)
    hechas = []
    for f in sorted(filas, key=lambda x: x['orden']):
        origen = origenes.get(f['orden'])
        if not origen or lado_textura(origen) <= 1024:
            continue
        destino = os.path.join(SALIDA, f"{f['archivo']}.glb")
        if '--forzar' in sys.argv or not os.path.exists(destino):
            subprocess.run([sys.executable, '-I', ALIGERAR, origen, destino, str(LADO)], check=True)
        hechas.append(f['archivo'])
    lineas = ''.join(f"  'c{a}': 'criaturas/detalle/{a}.glb',\n" for a in hechas)
    ts = ("// GENERADO por herramientas/criaturas/detalle.py: no se edita a mano.\n"
          "// La versión detallada (textura a 2K) de las criaturas cuyo original de Meshy la tiene, para\n"
          "// la vitrina de la ficha. Las que no están aquí usan su modelo del juego.\n\n"
          "export const MODELO_DETALLE: Readonly<Record<string, string>> = {\n" + lineas + "};\n")
    open(DATOS, 'w').write(ts)
    total = sum(os.path.getsize(os.path.join(SALIDA, f'{a}.glb')) for a in hechas)
    print(f'{len(hechas)} modelos detallados, {total / 1048576:.1f} MB')


if __name__ == '__main__':
    main()
