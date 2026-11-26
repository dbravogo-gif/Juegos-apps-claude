# Pasa a 3D con la API de Meshy las imágenes de criaturas del autor (autor, 2026-11-26: él hace las
# imágenes 2D y Claude el 3D). Busca en conceptos/criaturas/meshy las imágenes «PokN. Nombre» que aún
# no tienen su .glb, crea una tarea Image to 3D por cada una, espera y descarga el modelo con el
# mismo nombre. Después, herramientas/criaturas/juego.py las mete en el juego, como siempre.
#
# La clave no está en ningún archivo: el proxy de la sesión la añade a las peticiones a
# api.meshy.ai (secreto de red del entorno). Gasta créditos del plan de Meshy del autor: mira el
# saldo antes y apunta cada tarea en tareas.json, para no pagar dos veces si algo se corta.
#
# Uso:
#   python3 herramientas/criaturas/meshy.py --saldo
#   python3 herramientas/criaturas/meshy.py --solo 50,51,53 --dificiles 52,54 [--vistas DIR]
# --solo limita a esos números (si no, todas las que falten). --dificiles usa Meshy 7.1 (30
# créditos) en vez de Smart Topology con la textura de la imagen (15): para pelo, membranas o
# formas con mucho detalle (prompts-meshy.md, «Meshy 7 para las difíciles»).
import argparse
import base64
import json
import os
import re
import ssl
import sys
import time
import urllib.request

RAIZ = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
CARPETA = os.path.join(RAIZ, 'conceptos', 'criaturas', 'meshy')
TAREAS = os.path.join(CARPETA, 'tareas.json')
API = 'https://api.meshy.ai/openapi/v1'
# El proxy cambia esta cabecera por la clave de verdad.
CABECERAS = {'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'}
CTX = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or '/root/.ccr/ca-bundle.crt')
TIPOS = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}

NORMAL = {'model_type': 'smart-topology', 'ai_model': 'meshy-t2.5', 'should_texture': True, 'texture_model': 'meshy-n1', 'target_formats': ['glb']}
DIFICIL = {'ai_model': 'meshy-7.1', 'should_remesh': True, 'target_polycount': 30000, 'should_texture': True, 'target_formats': ['glb']}
COSTE = {'normal': 15, 'dificil': 30}


def pedir(metodo, ruta, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    r = urllib.request.Request(API + ruta, data=datos, headers=CABECERAS, method=metodo)
    with urllib.request.urlopen(r, context=CTX, timeout=60) as resp:
        return json.load(resp)


def bajar(url, destino):
    with urllib.request.urlopen(urllib.request.Request(url), context=CTX, timeout=300) as resp, open(destino, 'wb') as f:
        f.write(resp.read())


def pendientes(solo):
    """Las imágenes «PokN. Nombre» sin su .glb, por número."""
    res = {}
    for nombre in sorted(os.listdir(CARPETA)):
        m = re.match(r'^Pok(\d+)\. (.+)\.(png|jpe?g|webp)$', nombre, re.I)
        if not m:
            continue
        n = int(m.group(1))
        base = f'Pok{n}. {m.group(2)}'
        if solo and n not in solo:
            continue
        if not os.path.exists(os.path.join(CARPETA, base + '.glb')):
            res[n] = (base, os.path.join(CARPETA, nombre))
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--saldo', action='store_true')
    ap.add_argument('--solo', default='')
    ap.add_argument('--dificiles', default='')
    ap.add_argument('--vistas', default='')
    a = ap.parse_args()
    saldo = pedir('GET', '/balance')['balance']
    print(f'Saldo de Meshy: {saldo} créditos.')
    if a.saldo:
        return
    solo = {int(x) for x in a.solo.split(',') if x}
    dificiles = {int(x) for x in a.dificiles.split(',') if x}
    tareas = json.load(open(TAREAS)) if os.path.exists(TAREAS) else {}
    lista = pendientes(solo)
    coste = sum(COSTE['dificil' if n in dificiles else 'normal'] for n in lista if str(n) not in tareas)
    print(f'Por hacer: {", ".join(f"Pok{n}" for n in lista) or "ninguna"}. Coste nuevo: unos {coste} créditos.')
    if coste > saldo:
        sys.exit('No hay saldo suficiente.')
    # Crea las tareas que falten (las ya creadas se retoman, sin volver a pagar).
    for n, (base, ruta) in lista.items():
        if str(n) in tareas:
            continue
        ext = os.path.splitext(ruta)[1].lower()
        uri = f'data:{TIPOS[ext]};base64,' + base64.b64encode(open(ruta, 'rb').read()).decode()
        cuerpo = {'image_url': uri, **(DIFICIL if n in dificiles else NORMAL)}
        tareas[str(n)] = {'id': pedir('POST', '/image-to-3d', cuerpo)['result'], 'base': base, 'modo': 'dificil' if n in dificiles else 'normal'}
        json.dump(tareas, open(TAREAS, 'w'), indent=1, ensure_ascii=False)
        print(f'Pok{n}: tarea creada ({tareas[str(n)]["modo"]}).')
    # Espera y descarga.
    for n in lista:
        t = tareas[str(n)]
        while True:
            d = pedir('GET', f'/image-to-3d/{t["id"]}')
            if d['status'] in ('SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED'):
                break
            print(f'Pok{n}: {d["status"]} {d.get("progress", 0)} %', flush=True)
            time.sleep(15)
        if d['status'] != 'SUCCEEDED':
            print(f'Pok{n}: {d["status"]} ({d.get("task_error", {}).get("message", "")}).')
            continue
        bajar(d['model_urls']['glb'], os.path.join(CARPETA, t['base'] + '.glb'))
        if a.vistas and d.get('thumbnail_url'):
            os.makedirs(a.vistas, exist_ok=True)
            bajar(d['thumbnail_url'], os.path.join(a.vistas, f'Pok{n}.png'))
        print(f'Pok{n}: hecho, {t["base"]}.glb')
    print(f'Saldo al terminar: {pedir("GET", "/balance")["balance"]} créditos.')


if __name__ == '__main__':
    main()
