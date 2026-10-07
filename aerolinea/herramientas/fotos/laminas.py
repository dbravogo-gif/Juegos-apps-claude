# Descarga las miniaturas de las candidatas y monta una lámina por tipo para elegir a la vista.
import json, os, subprocess, sys, time, urllib.request, urllib.error
DIR = os.path.dirname(os.path.abspath(__file__))
UA = 'AppViacion/1.0 (juego privado; contacto dbravogo en GitHub)'
cand = json.load(open(os.path.join(DIR, 'candidatas.json')))
os.makedirs(os.path.join(DIR, 'mini'), exist_ok=True)
os.makedirs(os.path.join(DIR, 'laminas'), exist_ok=True)
def directa(url):
    # thumb.wikimedia.org no está permitido en este entorno; la misma miniatura sale de upload.
    url = url.split('?')[0]
    return url.replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')

def bajar(url, destino):
    url = directa(url)
    if os.path.exists(destino) and os.path.getsize(destino) > 1000:
        return True
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                open(destino, 'wb').write(r.read())
            return True
        except urllib.error.HTTPError as e:
            espera = int(e.headers.get('Retry-After') or 0) or 6 * (2 ** i)
            print('  espera', e.code, espera, file=sys.stderr, flush=True)
            time.sleep(min(espera, 90))
        except Exception as e:
            print('  error', e, file=sys.stderr, flush=True)
            time.sleep(5)
    return False
for tipo in (sys.argv[1:] or list(cand)):
    args = []
    for i, c in enumerate(cand.get(tipo, [])):
        f = os.path.join(DIR, 'mini', f'{tipo}-{i}.jpg')
        if c.get('mini') and bajar(c['mini'], f):
            titulo = c['titulo'].replace('File:', '')[:44]
            args += ['-label', f"{i} · {c['anio'] or '?'} · {titulo}", f]
            time.sleep(0.6)
    if args:
        salida = os.path.join(DIR, 'laminas', f'{tipo}.jpg')
        subprocess.run(['montage', *args, '-tile', '4x', '-geometry', '300x200+6+6', '-pointsize', '11', '-background', '#f2f2f2', salida], check=True)
        print(tipo, 'lámina con', len(args) // 3, flush=True)
