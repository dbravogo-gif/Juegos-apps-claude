# Busca candidatas en Wikimedia Commons para cada tipo y guarda sus metadatos.
import json, re, sys, time, urllib.parse, urllib.request, urllib.error, os
DIR = os.path.dirname(os.path.abspath(__file__))
UA = 'AppViacion/1.0 (juego privado; contacto dbravogo en GitHub)'
CONSULTAS = {
  'c212': ['CASA C-212 Aviocar airliner', 'CASA 212 Aviocar airport', 'C-212 Aviocar 1980'],
  'f27': ['Aviaco Fokker F27', 'Fokker F27 Aviaco', 'Fokker F27 Friendship 1970s airport', 'Spantax Fokker F27'],
  'hs748': ['Hawker Siddeley 748 British Airways', 'HS 748 Dan-Air', 'Hawker Siddeley HS-748 airport 1970s'],
  'viscount': ['Vickers Viscount British Airways', 'Vickers Viscount Alitalia', 'Vickers Viscount 800 airport'],
  'caravelle': ['Sud Aviation Caravelle Iberia', 'Caravelle Air France', 'Caravelle Alitalia', 'Caravelle SAS'],
  'f28': ['Fokker F28 Fellowship', 'Fokker F28 1000 airport', 'Fokker F28 Linjeflyg'],
  'bac111': ['BAC One-Eleven British Airways', 'BAC 1-11 British Airways', 'BAC One-Eleven 500 airport'],
  'dc9': ['Iberia McDonnell Douglas DC-9', 'Aviaco DC-9', 'Iberia DC-9-32', 'Alitalia DC-9-32'],
  'b737': ['Lufthansa Boeing 737-200', 'Boeing 737-230 Lufthansa', 'Air France Boeing 737-200'],
  'b727': ['Iberia Boeing 727-200', 'Iberia Boeing 727-256', 'Lufthansa Boeing 727-230'],
  'b707': ['Pan Am Boeing 707-321B', 'Pan American Boeing 707', 'Iberia Boeing 707'],
  'dc8': ['Iberia DC-8-63', 'KLM DC-8-63', 'SAS DC-8-63', 'Douglas DC-8-63 Iberia'],
  'a300': ['Air France Airbus A300B4', 'Lufthansa Airbus A300B4', 'Iberia Airbus A300'],
  'l1011': ['British Airways Lockheed L-1011 TriStar', 'Delta Air Lines L-1011 TriStar', 'Lockheed TriStar British Airways'],
  'dc10': ['Laker Airways DC-10', 'Iberia DC-10-30', 'KLM DC-10-30', 'Lufthansa DC-10-30'],
  'b747': ['Pan Am Boeing 747-200', 'Iberia Boeing 747-200', 'Lufthansa Boeing 747-200'],
  'concorde': ['Air France Concorde', 'British Airways Concorde 1980s', 'Concorde F-BVFA'],
  'md80': ['Aviaco MD-88', 'Iberia MD-87', 'Alitalia MD-82', 'Iberia McDonnell Douglas MD-88'],
  'b767': ['Delta Air Lines Boeing 767-200', 'Britannia Airways Boeing 767-200', 'SAS Boeing 767'],
  'b757': ['Condor Boeing 757-200', 'British Airways Boeing 757-200', 'Air Europa Boeing 757'],
  'b733': ['easyJet Boeing 737-300', 'Lufthansa Boeing 737-300', 'Air Europa Boeing 737-300'],
  'atr42': ['Alitalia ATR 42', 'ATI ATR 42', 'Lufthansa ATR 42', 'Contactair ATR 42', 'ATR 42-300 1990', 'ATR-42-300'],
  'a320': ['Vueling Airbus A320', 'Iberia Airbus A320', 'Air France Airbus A320 1990'],
  'f100': ['KLM Cityhopper Fokker 100', 'Fokker 100 KLM', 'KLM Fokker 100 PH-OF', 'Fokker 100 KLM Schiphol'],
}
# Filtro sobre el título del archivo, para descartar tipos parecidos (ATR 72 por ATR 42).
FILTROS = {'atr42': r'42', 'f100': r'KLM'}
def limpiar(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', str(s or ''))).strip()
def buscar(q):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap',
              'gsrnamespace': '6', 'gsrlimit': '25', 'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '420'}
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                return list((json.load(r).get('query') or {}).get('pages', {}).values())
        except urllib.error.HTTPError as e:
            espera = int(e.headers.get('Retry-After') or 0) or 8 * (2 ** i)
            print('  429/error', q, e.code, 'espero', espera, file=sys.stderr, flush=True)
            time.sleep(min(espera, 120))
        except Exception as e:
            print('  error', q, e, file=sys.stderr, flush=True)
            time.sleep(5)
    return []
solo = sys.argv[1:] or list(CONSULTAS)
ruta = os.path.join(DIR, 'candidatas.json')
salida = json.load(open(ruta)) if os.path.exists(ruta) else {}
for tipo in solo:
    vistos = {}
    for q in CONSULTAS[tipo]:
        for p in buscar(q):
            ii = (p.get('imageinfo') or [None])[0]
            if not ii or ii.get('mime') != 'image/jpeg' or ii.get('width', 0) < 1000:
                continue
            if tipo in FILTROS and not re.search(FILTROS[tipo], p['title']):
                continue
            ratio = ii['width'] / ii['height']
            if ratio < 1.25 or ratio > 2.4:
                continue
            m = ii.get('extmetadata') or {}
            fecha = limpiar((m.get('DateTimeOriginal') or {}).get('value'))[:40]
            a = re.search(r'(19|20)\d\d', fecha)
            anio = int(a.group(0)) if a else None
            if p['title'] not in vistos:
                vistos[p['title']] = {'titulo': p['title'], 'url': ii['url'], 'mini': ii.get('thumburl'), 'ancho': ii['width'], 'alto': ii['height'],
                    'fecha': fecha, 'anio': anio, 'autor': limpiar((m.get('Artist') or {}).get('value'))[:80],
                    'licencia': limpiar((m.get('LicenseShortName') or {}).get('value')), 'pagina': ii.get('descriptionurl'), 'consulta': q}
        time.sleep(3)
    lista = sorted(vistos.values(), key=lambda x: x['anio'] or 2100)[:12]
    salida[tipo] = lista
    print(tipo, len(lista), ' '.join(str(x['anio'] or '?') for x in lista), flush=True)
    json.dump(salida, open(ruta, 'w'), indent=1, ensure_ascii=False)
