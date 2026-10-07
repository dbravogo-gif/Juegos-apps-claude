# Cambia el nombre de la aerolínea pintado en el fuselaje de una foto: tapa el rótulo con el
# color de alrededor (interpolando lo que hay encima y debajo) y escribe el nombre del juego.
#   python3 renombrar.py entrada.jpg salida.jpg spec.json
# spec: { "borrar": [[x, y, w, h, modo?, opciones?], ...] (modo: mezcla, suave, arriba, abajo,
#        horizontal o tinta, que borra solo las letras con opciones color, umbral, dilatar, radio),
#        "textos": [{ "texto", "x", "y" (línea base), "alto" (altura
#        de las mayúsculas), "color", "fuente", "ancho"? (encoge en horizontal), "inclinacion"? }] }
import json, sys, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FUENTES = {
    'inter-negra-cursiva': '/usr/share/fonts/opentype/inter/Inter-BlackItalic.otf',
    'inter-extra-cursiva': '/usr/share/fonts/opentype/inter/Inter-ExtraBoldItalic.otf',
    'inter-negrita-cursiva': '/usr/share/fonts/opentype/inter/Inter-BoldItalic.otf',
    'inter-negra': '/usr/share/fonts/opentype/inter/Inter-Black.otf',
    'inter-extra': '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf',
    'inter-negrita': '/usr/share/fonts/opentype/inter/Inter-Bold.otf',
    'liberation-negrita': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'liberation-negrita-cursiva': '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf',
    'serif-negrita': '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
    'serif': '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
    'serif-negrita-cursiva': '/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf',
}

def color(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))

def borrar(img, x, y, w, h, modo='mezcla'):
    # modo: 'mezcla' interpola entre lo que hay encima y debajo; 'arriba' o 'abajo' copian solo
    # ese lado (cuando el rótulo toca una franja de otro color).
    px = img.load()
    W, H = img.size
    random.seed(x * 7 + y)
    for i in range(x, x + w):
        arriba = [px[i, max(0, y - k)] for k in range(1, 4)]
        abajo = [px[i, min(H - 1, y + h - 1 + k)] for k in range(1, 4)]
        a = tuple(sorted(c[j] for c in arriba)[1] for j in range(3))
        b = tuple(sorted(c[j] for c in abajo)[1] for j in range(3))
        if modo == 'horizontal':
            break
        if modo == 'suave':
            b = tuple(round(a[k] * 0.65 + b[k] * 0.35) for k in range(3))
        elif modo == 'arriba':
            b = a
        elif modo == 'abajo':
            a = b
        for j in range(y, y + h):
            t = (j - y + 0.5) / h
            ruido = random.uniform(-2.5, 2.5)
            px[i, j] = tuple(max(0, min(255, round(a[k] * (1 - t) + b[k] * t + ruido))) for k in range(3))

def borrar_horizontal(img, x, y, w, h):
    px = img.load()
    W, H = img.size
    random.seed(x * 13 + y)
    for j in range(y, y + h):
        izq = [px[max(0, x - k), j] for k in range(1, 4)]
        der = [px[min(W - 1, x + w - 1 + k), j] for k in range(1, 4)]
        a = tuple(sorted(c[n] for c in izq)[1] for n in range(3))
        b = tuple(sorted(c[n] for c in der)[1] for n in range(3))
        for i in range(x, x + w):
            t = (i - x + 0.5) / w
            ruido = random.uniform(-2.5, 2.5)
            px[i, j] = tuple(max(0, min(255, round(a[k] * (1 - t) + b[k] * t + ruido))) for k in range(3))

def borrar_tinta(img, x, y, w, h, op=None):
    # Borra solo las letras: marca los píxeles que se apartan del fondo (la mediana del borde de
    # la caja) o que se parecen al color de la tinta, los engorda un poco y los rellena con el
    # algoritmo de Telea, que continúa el fondo de alrededor. Conserva reflejos y textura.
    import numpy as np, cv2
    op = op or {}
    a = np.array(img)
    # `pendiente`: la caja es un paralelogramo que baja (o sube) tantos píxeles por columna,
    # para rótulos en perspectiva.
    pend = op.get('pendiente', 0)
    extra = int(np.ceil(abs(pend) * w))
    y0 = y - (extra if pend < 0 else 0)
    zona = a[y0:y0 + h + extra, x:x + w].astype(int)
    filas = np.arange(zona.shape[0])[:, None]
    arriba = (y - y0) + pend * np.arange(w)[None, :]
    dentro = (filas >= np.floor(arriba)) & (filas < np.floor(arriba) + h)
    borde = dentro & ((filas < np.floor(arriba) + 1) | (filas >= np.floor(arriba) + h - 1))
    borde[:, [0, -1]] |= dentro[:, [0, -1]]
    fondo = np.array(color(op['fondo'])) if op.get('fondo') else np.median(zona[borde], axis=0)
    if op.get('color'):
        m = np.sqrt(((zona - np.array(color(op['color']))) ** 2).sum(axis=2)) < op.get('umbral', 60)
    else:
        m = np.sqrt(((zona - fondo) ** 2).sum(axis=2)) > op.get('umbral', 40)
    m &= dentro
    y, h = y0, h + extra
    m = cv2.dilate(m.astype(np.uint8) * 255, np.ones((3, 3), np.uint8), iterations=op.get('dilatar', 2))
    mascara = np.zeros(a.shape[:2], np.uint8)
    mascara[y:y + h, x:x + w] = m
    # `proteger`: zonas que no deben servir de relleno (una franja de otro color pegada a las
    # letras); se pintan con el fondo solo en la copia que usa el algoritmo.
    fuente = a.copy()
    for px_, py_, pw, ph in op.get('proteger', []):
        fuente[py_:py_ + ph, px_:px_ + pw] = fondo
    res = cv2.cvtColor(cv2.inpaint(cv2.cvtColor(fuente, cv2.COLOR_RGB2BGR), mascara, op.get('radio', 4), cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
    # El relleno sale liso; se le añade el grano de la foto (lo que se aparta del desenfoque).
    g = a.astype(float)
    # Con la mediana de las desviaciones, para que los bordes de las letras no cuenten como grano.
    alta = (g - cv2.GaussianBlur(g, (0, 0), 1.2))[y:y + h, x:x + w][m == 0]
    grano = np.minimum(1.4826 * np.median(np.abs(alta - np.median(alta, axis=0)), axis=0), 4) if len(alta) > 20 else np.full(3, 1.5)
    res = np.clip(res + np.random.default_rng(x * 7 + y).normal(0, 1, a.shape) * grano, 0, 255).astype(np.uint8)
    a[mascara > 0] = res[mascara > 0]
    img.paste(Image.fromarray(a))

def escribir(img, t):
    fuente_ruta = FUENTES.get(t.get('fuente', 'inter-negra-cursiva'), t.get('fuente'))
    # Tamaño de letra para que la altura de las mayúsculas sea `alto`.
    prueba = ImageFont.truetype(fuente_ruta, 100)
    caja = prueba.getbbox('H')
    tam = max(6, round(100 * t['alto'] / (caja[3] - caja[1])))
    fuente = ImageFont.truetype(fuente_ruta, tam * 4)
    capa = Image.new('RGBA', (int(tam * 4 * (len(t['texto']) + 2)), int(tam * 6)), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    trazo = round(t.get('grosor', 0) * 4)  # engorda las letras (en píxeles de la foto)
    if t.get('espaciado'):
        # Letra a letra, con aire entre ellas (en píxeles de la foto).
        x = tam * 2
        for letra in t['texto']:
            d.text((x, tam * 4), letra, font=fuente, fill=color(t['color']) + (255,), anchor='ls', stroke_width=trazo, stroke_fill=color(t['color']) + (255,))
            x += fuente.getlength(letra) + t['espaciado'] * 4
    else:
        d.text((tam * 2, tam * 4), t['texto'], font=fuente, fill=color(t['color']) + (255,), anchor='ls', stroke_width=trazo, stroke_fill=color(t['color']) + (255,))
    caja = capa.getbbox()
    base = (tam * 4 - caja[1]) / 4
    capa = capa.crop(caja)
    capa = capa.resize((max(1, capa.width // 4), max(1, capa.height // 4)), Image.LANCZOS)
    if t.get('ancho') and (capa.width > t['ancho'] or t.get('estirar')):
        capa = capa.resize((t['ancho'], capa.height), Image.LANCZOS)
    if t.get('inclinacion'):
        k = t['inclinacion']
        capa = capa.transform((capa.width + int(abs(k) * capa.height), capa.height), Image.AFFINE, (1, k, -k * capa.height if k > 0 else 0, 0, 1, 0), Image.BICUBIC)
    ax, ay = 0, base
    if t.get('giro'):
        # Gira el rótulo (grados, positivo hacia arriba a la derecha) alrededor de su esquina
        # izquierda de la línea base, que sigue cayendo en (x, y).
        import math
        th = math.radians(t['giro'])
        cx, cy = capa.width / 2, capa.height / 2
        capa = capa.rotate(t['giro'], resample=Image.BICUBIC, expand=True)
        dx, dy = ax - cx, ay - cy
        ax = capa.width / 2 + dx * math.cos(th) + dy * math.sin(th)
        ay = capa.height / 2 - dx * math.sin(th) + dy * math.cos(th)
    capa = capa.filter(ImageFilter.GaussianBlur(t.get('desenfoque', 0.35)))
    x0, y0 = round(t['x'] - ax), round(t['y'] - ay)
    # `sin_pintar`: zonas de la foto que quedan delante del rótulo (una ventanilla, una hélice).
    for rx, ry, rw, rh in t.get('sin_pintar', []):
        capa.paste((0, 0, 0, 0), (rx - x0, ry - y0, rx - x0 + rw, ry - y0 + rh))
    img.paste(capa, (x0, y0), capa)

def aplicar(img, spec):
    for caja in spec.get('borrar', []):
        if caja[4:] == ['horizontal']:
            borrar_horizontal(img, *caja[:4])
        elif caja[4:5] == ['tinta']:
            borrar_tinta(img, *caja[:4], *(caja[5:] or [None]))
        else:
            borrar(img, *caja[:4], *(caja[4:] or ['mezcla']))
    for t in spec.get('textos', []):
        escribir(img, t)

def enderezar(img, b):
    # Recorte cuadrado de lado 2·radio alrededor de `centro`, girado `angulo` grados en sentido
    # horario para que el rótulo quede horizontal.
    cx, cy, r = *b['centro'], b.get('radio', 80)
    return img.crop((cx - r, cy - r, cx + r, cy + r)).rotate(-b['angulo'], resample=Image.BICUBIC)

def girado(img, b):
    # Rótulos girados (en la cola): se endereza la zona, se borra y se escribe con coordenadas del
    # recorte enderezado, y se devuelve a su sitio solo lo que ha cambiado.
    import numpy as np
    recta = enderezar(img, b)
    antes = np.asarray(recta, int)
    aplicar(recta, b)
    cambio = np.abs(np.asarray(recta, int) - antes).sum(axis=2) > 4
    mascara = Image.fromarray(cambio.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))
    cx, cy, r = *b['centro'], b.get('radio', 80)
    vuelta = recta.rotate(b['angulo'], resample=Image.BICUBIC)
    mascara = mascara.rotate(b['angulo'], resample=Image.BILINEAR).filter(ImageFilter.GaussianBlur(0.6))
    img.paste(vuelta, (cx - r, cy - r), mascara)

if __name__ == '__main__':
    if sys.argv[1] == '--enderezar':
        # python3 renombrar.py --enderezar foto.jpg salida.png spec.json índice: guarda el recorte
        # enderezado de un bloque de `girados` para medir sobre él.
        img = Image.open(sys.argv[2]).convert('RGB')
        b = json.load(open(sys.argv[4]))['girados'][int(sys.argv[5])]
        enderezar(img, b).save(sys.argv[3])
        sys.exit()
    entrada, salida, spec = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
    img = Image.open(entrada).convert('RGB')
    aplicar(img, spec)
    for b in spec.get('girados', []):
        girado(img, b)
    img.save(salida, quality=95)
    print('hecho', salida)
