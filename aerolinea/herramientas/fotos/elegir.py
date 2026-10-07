# Baja a 960 px la foto elegida de cada tipo y apunta su autor, licencia y página.
#   python3 elegir.py tipo:indice [tipo:indice ...]   (índice de candidatas.json, de buscar.py)
#   python3 elegir.py --de-nuevo [tipo ...]           (vuelve a bajar las de elegidas.json)
import json, os, sys, time, urllib.parse, urllib.request, urllib.error
DIR = os.path.dirname(os.path.abspath(__file__))
UA = 'AppViacion/1.0 (juego privado; https://github.com/dbravogo-gif/Juegos-apps-claude)'
ruta = os.path.join(DIR, 'elegidas.json')
elegidas = json.load(open(ruta)) if os.path.exists(ruta) else {}
if sys.argv[1:2] == ['--de-nuevo']:
    cand = {t: [e] for t, e in elegidas.items()}
    sys.argv = sys.argv[:1] + [f'{t}:0' for t in (sys.argv[2:] or elegidas)]
else:
    cand = json.load(open(os.path.join(DIR, 'candidatas.json')))
os.makedirs(os.path.join(DIR, 'originales'), exist_ok=True)
for arg in sys.argv[1:]:
    tipo, i = arg.split(':')
    c = cand[tipo][int(i)]
    original = c['url'].split('?')[0]
    nombre = original.rsplit('/', 1)[1]
    partes = original.split('/commons/', 1)[1]
    ancho = 960 if c['ancho'] > 960 else c['ancho']
    url = original if ancho == c['ancho'] else f'https://upload.wikimedia.org/wikipedia/commons/thumb/{partes}/960px-{nombre}'
    destino = os.path.join(DIR, 'originales', f'{tipo}.jpg')
    for intento in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                datos = r.read()
            if datos[:3] != b'\xff\xd8\xff':
                raise ValueError('no es JPEG')
            open(destino, 'wb').write(datos)
            break
        except Exception as e:
            print('  reintento', tipo, e, file=sys.stderr, flush=True)
            time.sleep(8 * (intento + 1))
    else:
        print('FALLO', tipo); continue
    elegidas[tipo] = {k: c[k] for k in ('titulo', 'autor', 'licencia', 'pagina', 'fecha', 'anio', 'url', 'ancho')}
    json.dump(elegidas, open(ruta, 'w'), indent=1, ensure_ascii=False)
    print(tipo, 'ok', c['titulo'], '|', c['autor'], '|', c['licencia'], flush=True)
    time.sleep(1)
