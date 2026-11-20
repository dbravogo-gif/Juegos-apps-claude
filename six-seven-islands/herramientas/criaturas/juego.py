# Mete en el juego las criaturas que el autor ya ha subido (conceptos/criaturas/meshy, «PokN.
# Nombre»): aligera cada modelo a public/modelos/criaturas/<id interno>.glb, reduce su imagen y
# escribe src/data/criaturas.ts con sus especies (nombre, tipos, estadísticas de su referencia,
# altura, evolución y ataques). Las iniciales no: siguen en src/data/combate-prueba.ts.
#
# Uso: python3 herramientas/criaturas/juego.py [--solo-datos]
# Con --solo-datos, solo reescribe src/data/criaturas.ts, sin volver a aligerar los modelos.
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
import plan  # noqa: E402
from estadisticas import BASE  # noqa: E402

RAIZ = plan.RAIZ
SALIDA_MODELOS = os.path.join(RAIZ, 'public', 'modelos', 'criaturas')
SALIDA_INICIALES = os.path.join(RAIZ, 'public', 'modelos', 'iniciales')
SALIDA_DATOS = os.path.join(RAIZ, 'src', 'data', 'criaturas.ts')
ALIGERAR = os.path.join(RAIZ, 'herramientas', 'aligerar-glb.py')

ID_TIPO = {'Común': 'comun', 'Agua': 'agua', 'Tierra': 'tierra', 'Planta': 'planta', 'Aire': 'aire',
           'Eléctrico': 'electrico', 'Hielo': 'hielo', 'Infernal': 'infernal', 'Lucha': 'lucha',
           'Mental': 'mental', 'Oscuridad': 'oscuridad', 'Espectral': 'espectral', 'Acero': 'acero',
           'Roca': 'roca', 'Ancestral': 'ancestral', 'Bicho': 'bicho', 'Veneno': 'veneno'}

# Experiencia que da y facilidad de captura, por quintil de fuerza (como las de relleno: 50 y 200).
POR_QUINTIL = {'Q1': (55, 200), 'Q2': (75, 150), 'Q3': (140, 90), 'Q4': (170, 60), 'Q5': (250, 3)}

# Nivel al que evoluciona cada forma a la siguiente, por línea (número de la lista de referencia).
EVOLUCION = {31: [20], 32: [22], 37: [30], 7: [14, 32], 62: [30], 13: [18, 36], 43: [20], 12: [16, 34], 34: [24]}

# Ataques por forma: (nivel, ataque), con los que ya existen en combate-prueba.ts. La 1.ª forma
# empieza solo con ataques comunes y aprende los de su tipo a los pocos niveles; cuatro como mucho,
# porque aún no hay pantalla para olvidar uno (autor, 2026-11-19; tests/ataques.test.ts).
# Las evolucionadas los tienen todos al nivel 1: son los que llevan los entrenadores.
ATAQUES = {
    31: [[(1, 'topetazo'), (1, 'mirada-fija'), (9, 'barrito')],
         [(1, 'topetazo'), (1, 'mirada-fija'), (1, 'barrito')]],
    32: [[(1, 'topetazo'), (1, 'mirada-fija'), (6, 'picado')],
         [(1, 'topetazo'), (1, 'picado'), (1, 'rafaga'), (1, 'mirada-fija')]],
    37: [[(1, 'topetazo'), (1, 'mirada-fija'), (5, 'remojon'), (9, 'arenazo')],
         [(1, 'remojon'), (1, 'ola-de-cresta'), (1, 'arenazo'), (1, 'pisoton')]],
    7: [[(1, 'topetazo'), (1, 'caparazon'), (6, 'latigazo-de-musgo'), (11, 'esporas-de-hoja')],
        [(1, 'caparazon'), (1, 'esporas-de-hoja'), (1, 'latigazo-de-musgo'), (1, 'topetazo')],
        [(1, 'caparazon'), (1, 'esporas-de-hoja'), (1, 'latigazo-de-musgo'), (1, 'mirada-fija')]],
    62: [[(1, 'topetazo'), (1, 'mirada-fija'), (7, 'rodada-de-piedra')],
         [(1, 'rodada-de-piedra'), (1, 'pisoton'), (1, 'barrito'), (1, 'topetazo')]],
    13: [[(1, 'topetazo'), (1, 'mirada-fija'), (5, 'soplo-de-brasas'), (10, 'orejazo-ardiente')],
         [(1, 'soplo-de-brasas'), (1, 'orejazo-ardiente'), (1, 'topetazo'), (1, 'mirada-fija')],
         [(1, 'orejazo-ardiente'), (1, 'soplo-de-brasas'), (1, 'pisoton'), (1, 'barrito')]],
    43: [[(1, 'topetazo'), (1, 'mirada-fija'), (5, 'agarron')],
         [(1, 'agarron'), (1, 'topetazo'), (1, 'mirada-fija'), (1, 'barrito')]],
    12: [[(1, 'topetazo'), (1, 'caparazon'), (5, 'rodada-de-piedra')],
         [(1, 'rodada-de-piedra'), (1, 'caparazon'), (1, 'polvo-de-picon'), (1, 'topetazo')],
         [(1, 'rodada-de-piedra'), (1, 'caparazon'), (1, 'polvo-de-picon'), (1, 'pisoton')]],
    34: [[(1, 'topetazo'), (1, 'mirada-fija'), (5, 'arenazo'), (9, 'pisoton')],
         [(1, 'pisoton'), (1, 'arenazo'), (1, 'topetazo'), (1, 'barrito')]],
}

# Nombres provisionales de las formas que aún no tienen el suyo (el autor los pone).
PROVISIONAL: dict[str, str] = {}


def id_juego(archivo):
    return f'c{archivo}'


def importar_modelo(fila, origen, carpeta=SALIDA_MODELOS):
    os.makedirs(carpeta, exist_ok=True)
    destino = os.path.join(carpeta, f"{fila['archivo']}.glb")
    subprocess.run([sys.executable, '-I', ALIGERAR, origen, destino], check=True)
    # La imagen puede ser .webp, .png o .jpg (autor, 2026-11-19): se guarda en .webp y reducida.
    imagenes = [origen[:-4] + ext for ext in ('.webp', '.png', '.jpg', '.jpeg', '.WEBP', '.PNG', '.JPG', '.JPEG')]
    imagen = next((i for i in imagenes if os.path.exists(i)), None)
    if imagen:
        from PIL import Image
        im = Image.open(imagen)
        im.thumbnail((512, 512))
        im.save(os.path.join(carpeta, f"{fila['archivo']}.webp"), 'WEBP', quality=85)


def especie_ts(f, siguiente):
    n = f['n']
    i = ['1.ª', '2.ª', '3.ª'].index(f['forma']) if f['forma'] != 'única' else 0
    vida, fuerza, escudo, magia, res, cel = BASE[f['ref']]
    exp, captura = POR_QUINTIL[f['quintil']]
    tipos = ', '.join(f"'{ID_TIPO[t]}'" for t in f['tipos'].split('/'))
    nombre = PROVISIONAL.get(f['archivo'], f['especie'].strip('«»'))
    ataques = ', '.join(f"{{ nivel: {nv}, movimiento: '{m}' }}" for nv, m in ATAQUES[n][i])
    evo = ''
    if siguiente:
        evo = f", evoluciona: [{{ a: '{id_juego(siguiente)}', nivel: {EVOLUCION[n][i]} }}]"
    return (f"  // Pok{f['orden']}: {f['ref']} ({f['quintil']}, {f['papel']}).\n"
            f"  {{ id: '{id_juego(f['archivo'])}', nombre: '{nombre}', tipos: [{tipos}], "
            f"base: base({vida}, {fuerza}, {escudo}, {magia}, {res}, {cel}), expBase: {exp}, ratioCaptura: {captura}, "
            f"aprende: [{ataques}]{evo}, altura: {f['altura']}, descripcion: '' }},")


def main():
    filas = plan.criaturas()
    plan.comprobar(filas)
    listas = [f for f in filas if f['tiene_modelo'] and not f['inicial']]
    por_archivo = {f['archivo']: f for f in filas}
    origenes = {}
    for nombre in os.listdir(plan.CARPETA_AUTOR):
        if nombre.lower().endswith('.glb') and nombre.startswith('Pok'):
            origenes[int(nombre[3:].split('.')[0])] = os.path.join(plan.CARPETA_AUTOR, nombre)
    # Las formas de las iniciales: solo el modelo, en public/modelos/iniciales (sus estadísticas son
    # propias y las pasará el autor). Las que ya están no se tocan.
    solo_datos = '--solo-datos' in sys.argv
    for f in filas:
        if solo_datos:
            break
        if f['inicial'] and f['tiene_modelo'] and not os.path.exists(os.path.join(SALIDA_INICIALES, f"{f['archivo']}.glb")):
            importar_modelo(f, origenes[f['orden']], SALIDA_INICIALES)
    entradas, modelos = [], []
    for f in sorted(listas, key=lambda x: x['orden']):
        if not solo_datos:
            importar_modelo(f, origenes[f['orden']])
        base_id, _, forma = f['archivo'].partition('-')
        sig = f'{base_id}-{int(forma) + 1}' if forma and f'{base_id}-{int(forma) + 1}' in por_archivo else None
        if sig and not por_archivo[sig]['tiene_modelo']:
            sig = None  # la siguiente forma aún no está: de momento no evoluciona
        entradas.append(especie_ts(f, sig))
        modelos.append(f"  '{id_juego(f['archivo'])}': 'criaturas/{f['archivo']}.glb',")
    ts = ("// GENERADO por herramientas/criaturas/juego.py desde PLAN-CRIATURAS.md: no se edita a mano.\n"
          "// Las criaturas del autor que ya tienen modelo. Estadísticas exactas de su referencia\n"
          "// (herramientas/criaturas/estadisticas.py), altura en metros (ARTE.md, «Escala de las criaturas»).\n\n"
          "import type { Especie, Estadisticas } from '../core/modelo';\n\n"
          "const base = (vida: number, fuerza: number, escudo: number, magia: number, resMagica: number, celeridad: number): Estadisticas => ({\n"
          "  vida,\n  fuerza,\n  escudo,\n  magia,\n  resMagica,\n  celeridad,\n});\n\n"
          "export const ESPECIES_CRIATURAS: readonly Especie[] = [\n" + '\n'.join(entradas) + "\n];\n\n"
          "/** El modelo de cada una, en public/modelos/. */\n"
          "export const MODELO_CRIATURA: Readonly<Record<string, string>> = {\n" + '\n'.join(modelos) + "\n};\n")
    with open(SALIDA_DATOS, 'w', encoding='utf-8') as fh:
        fh.write(ts)
    print(f'{len(listas)} criaturas en el juego: ' + ', '.join(PROVISIONAL.get(f["archivo"], f["especie"]) for f in listas))


if __name__ == '__main__':
    main()
