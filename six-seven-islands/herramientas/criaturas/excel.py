# Crea la plantilla de seguimiento de criaturas (CRIATURAS.md) en Excel.
# Uso, desde six-seven-islands/: python3 herramientas/criaturas/excel.py criaturas-plantilla.xlsx
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.comments import Comment
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
import lista  # B1..B4 y forma()

ARIAL = 'Arial'
# Lucha entra el 2026-11-12 con 9, quitadas a Planta (1), Tierra (2), Roca (1), Aire (2) y Bicho (3).
TIPOS = [('Común', 16, 0xa8a29e), ('Agua', 21, 0x3b82f6), ('Tierra', 11, 0xa16207), ('Planta', 17, 0x16a34a),
         ('Aire', 11, 0x7dd3fc), ('Eléctrico', 11, 0xeab308), ('Hielo', 8, 0x67e8f9), ('Infernal', 16, 0xdc2626),
         ('Lucha', 9, 0x9f1239), ('Mental', 8, 0xec4899), ('Oscuridad', 8, 0x57534e), ('Espectral', 7, 0x7c3aed), ('Acero', 6, 0x94a3b8),
         ('Roca', 10, 0x9a7e64), ('Ancestral', 4, 0xb45309), ('Bicho', 13, 0x84cc16), ('Veneno', 12, 0xa21caf)]
INICIALES = {'Agua': 3, 'Planta': 3, 'Infernal': 3, 'Roca': 3, 'Tierra': 3}
LINEAS_INICIALES = {'Torchic', 'Turtwig', 'Piplup', 'Aron'}

def hexc(n): return '%06X' % n
def tinte(n, t=0.55):
    r, g, b = (n >> 16) & 255, (n >> 8) & 255, n & 255
    return '%02X%02X%02X' % tuple(round(c + (255 - c) * t) for c in (r, g, b))
def claro(n):
    r, g, b = (n >> 16) & 255, (n >> 8) & 255, n & 255
    return 0.299 * r + 0.587 * g + 0.114 * b > 150

# Especies en el orden del PDF, agrupadas por el quintil de su primera forma.
especies = [[lista.forma(t) for t in l.split(', ')] for l in lista.B1.splitlines()]
especies += [[lista.forma(t) for t in l.split(', ')] for l in lista.B2.splitlines()]
especies += [[lista.forma(t)] for t in lista.B3.split('|')]
legendarias = [[lista.forma(t)] for t in lista.B4.split('|')]
quintiles = {q: [] for q in range(1, 6)}
for e in especies:
    if e[0][0] not in LINEAS_INICIALES: quintiles[e[0][1]].append(e)
quintiles[5] += legendarias
assert sum(len(f) for q in quintiles.values() for f in q) == 188
INI = [('Inicial Agua (caimán)', 'Agua'), ('Inicial Planta (lagarto chamán)', 'Planta'), ('Inicial Infernal (elefante)', 'Infernal'), ('Inicial Roca (armadillo)', 'Roca')]

wb = Workbook()
ws = wb.active
ws.title = 'Criaturas'
fino = Side(style='thin', color='D9CFC0')
grueso = Side(style='medium', color='8C7B6B')
f_cab = PatternFill('solid', fgColor='3A2E2A')
f_sec = PatternFill('solid', fgColor='E8DCC8')
f_banda = PatternFill('solid', fgColor='FBF6EE')
f_ini = PatternFill('solid', fgColor='FDE7D3')
f_editar = PatternFill('solid', fgColor='FFF9DB')

ws['A1'] = 'Six-seven islands · Las 200 criaturas por quintil'
ws['A1'].font = Font(name=ARIAL, size=16, bold=True, color='3A2E2A')
ws['A2'] = ('Rellena las columnas B a E. Tipo principal y secundario se eligen en el desplegable. '
            'Foto: pega la imagen en la celda de la columna C (Excel 365: Insertar › Imágenes › Colocar en celda). '
            'Las líneas evolutivas van juntas en el quintil de su primera forma. Las 4 iniciales van al principio, con estadísticas propias.')
ws['A2'].font = Font(name=ARIAL, size=10, color='5A4A44')
ws['A2'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells('A2:E2')
ws.row_dimensions[2].height = 42
ws['A3'] = 'Ejemplo de cómo rellenar una fila: Pidove · Gorrión del jable · «Pájaro pequeño y redondo, plumas ocres, cresta corta» · Aire · Común'
ws['A3'].font = Font(name=ARIAL, size=10, italic=True, color='8C7B6B')
ws.merge_cells('A3:E3')

CAB = ['Nombre del pokemon real', 'Nombre del pokemon inventado', 'Descripción de la apariencia (o foto)', 'Tipo principal', 'Tipo secundario']
for i, t in enumerate(CAB, 1):
    c = ws.cell(4, i, t)
    c.font = Font(name=ARIAL, bold=True, color='FFFFFF')
    c.fill = f_cab
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
ws.row_dimensions[4].height = 40
for col, w in zip('ABCDE', (22, 26, 52, 16, 16)): ws.column_dimensions[col].width = w

fila = 5
primera_dato, ultima_dato = None, None
c = ws.cell(fila, 1, 'Iniciales · 4 especies · 12 criaturas (estadísticas propias, del autor)')
c.font = Font(name=ARIAL, bold=True, size=12, color='3A2E2A')
for i in range(1, 6):
    ws.cell(fila, i).fill = f_sec
    ws.cell(fila, i).border = Border(top=grueso, bottom=grueso)
ws.row_dimensions[fila].height = 22
fila += 1
for k, (nombre, tipo) in enumerate(INI):
    for j, forma in enumerate(('1.ª forma', '2.ª forma', '3.ª forma')):
        primera_dato = primera_dato or fila
        ws.cell(fila, 1, f'{nombre} · {forma}')
        ws.cell(fila, 4, tipo)
        for i in range(1, 6):
            c = ws.cell(fila, i)
            c.font = Font(name=ARIAL, size=10)
            c.alignment = Alignment(vertical='center', wrap_text=(i in (1, 3)))
            c.border = Border(left=fino, right=fino, bottom=fino, top=grueso if j == 0 else fino)
            c.fill = f_ini
        ws.row_dimensions[fila].height = 40
        fila += 1
for q in range(1, 6):
    lineas = quintiles[q]
    n = sum(len(e) for e in lineas)
    texto = f'Quintil {q} · {len(lineas)} especies · {n} criaturas'
    if q == 5: texto += ' (las 12 legendarias)'
    c = ws.cell(fila, 1, texto)
    c.font = Font(name=ARIAL, bold=True, size=12, color='3A2E2A')
    for i in range(1, 6):
        ws.cell(fila, i).fill = f_sec
        ws.cell(fila, i).border = Border(top=grueso, bottom=grueso)
    ws.row_dimensions[fila].height = 22
    fila += 1
    for k, e in enumerate(lineas):
        relleno = f_banda if k % 2 else None
        for j, (nombre, _, _) in enumerate(e):
            primera_dato = primera_dato or fila
            ultima_dato = fila
            ws.cell(fila, 1, nombre)
            for i in range(1, 6):
                c = ws.cell(fila, i)
                c.font = Font(name=ARIAL, size=10)
                c.alignment = Alignment(vertical='center', wrap_text=(i == 3))
                c.border = Border(left=fino, right=fino, bottom=fino, top=grueso if j == 0 and len(e) > 1 else fino)
                if relleno: c.fill = relleno
            ws.row_dimensions[fila].height = 40
            fila += 1

# Desplegables con la lista de tipos del panel.
G0 = 5  # primera fila del panel
rango_tipos = f'$G${G0}:$G${G0 + len(TIPOS) - 1}'
for col, titulo in (('D', 'Tipo principal'), ('E', 'Tipo secundario')):
    dv = DataValidation(type='list', formula1=f'={rango_tipos}', allow_blank=True, showErrorMessage=True,
                        errorTitle=titulo, error='Elige un tipo de la lista.')
    dv.add(f'{col}{primera_dato}:{col}{ultima_dato}')
    ws.add_data_validation(dv)
# Cada tipo elegido se pinta con su color.
for nombre, _, color in TIPOS:
    regla = CellIsRule(operator='equal', formula=[f'"{nombre}"'], fill=PatternFill('solid', fgColor=tinte(color)))
    ws.conditional_formatting.add(f'D{primera_dato}:E{ultima_dato}', regla)

# Panel de la derecha.
ws.column_dimensions['F'].width = 3
PANEL = ['Tipo', 'Objetivo (foto, sin iniciales)', 'Iniciales', 'Objetivo total', 'Hay como principal', 'Diferencia', 'Hay como secundario']
for i, t in enumerate(PANEL):
    c = ws.cell(4, 7 + i, t)
    c.font = Font(name=ARIAL, bold=True, color='FFFFFF')
    c.fill = f_cab
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
for col, w in zip('GHIJKLM', (14, 16, 10, 11, 12, 11, 13)): ws.column_dimensions[col].width = w
D, E = f'$D${primera_dato}:$D${ultima_dato}', f'$E${primera_dato}:$E${ultima_dato}'
for k, (nombre, objetivo, color) in enumerate(TIPOS):
    r = G0 + k
    c = ws.cell(r, 7, nombre)
    c.fill = PatternFill('solid', fgColor=hexc(color))
    c.font = Font(name=ARIAL, bold=True, color='222222' if claro(color) else 'FFFFFF')
    c.alignment = Alignment(vertical='center', indent=1)
    ws.cell(r, 8, objetivo).font = Font(name=ARIAL, color='0000FF')
    ws.cell(r, 9, INICIALES.get(nombre, 0)).font = Font(name=ARIAL, color='0000FF')
    ws.cell(r, 9).fill = f_editar
    ws.cell(r, 10, f'=H{r}+I{r}')
    ws.cell(r, 11, f'=COUNTIF({D},G{r})')
    ws.cell(r, 12, f'=K{r}-J{r}')
    ws.cell(r, 13, f'=COUNTIF({E},G{r})')
    for i in range(8, 14):
        c = ws.cell(r, i)
        if i not in (8, 9): c.font = Font(name=ARIAL)
        c.alignment = Alignment(horizontal='center', vertical='center')
        c.border = Border(left=fino, right=fino, top=fino, bottom=fino)
    ws.cell(r, 12).number_format = '+0;-0;0'
rt = G0 + len(TIPOS)
ws.cell(rt, 7, 'Total').font = Font(name=ARIAL, bold=True)
for i, col in zip(range(8, 14), 'HIJKLM'):
    c = ws.cell(rt, i, f'=SUM({col}{G0}:{col}{rt - 1})')
    c.font = Font(name=ARIAL, bold=True)
    c.alignment = Alignment(horizontal='center')
    c.border = Border(top=grueso)
ws.cell(rt, 12).number_format = '+0;-0;0'
fila_dif = f'L{G0}:L{rt - 1}'
ws.conditional_formatting.add(fila_dif, FormulaRule(formula=[f'AND(K{G0}>0,L{G0}=0)'], fill=PatternFill('solid', fgColor='C8E6C9')))
ws.conditional_formatting.add(fila_dif, CellIsRule(operator='greaterThan', formula=['0'], fill=PatternFill('solid', fgColor='F8C9C4')))

ws.cell(rt + 1, 7, 'Criaturas en la lista').font = Font(name=ARIAL)
ws.cell(rt + 1, 11, f'=COUNTA($A${primera_dato}:$A${ultima_dato})-COUNTIF($A${primera_dato}:$A${ultima_dato},"Quintil*")')
ws.cell(rt + 2, 7, 'Sin tipo principal todavía').font = Font(name=ARIAL)
ws.cell(rt + 2, 11, f'=K{rt + 1}-K{rt}')
for r in (rt + 1, rt + 2):
    ws.cell(r, 11).font = Font(name=ARIAL, bold=True)
    ws.cell(r, 11).alignment = Alignment(horizontal='center')

notas = [
    'Notas',
    '· Objetivo (foto del autor): cuántas criaturas de cada tipo principal debe haber, sin contar las 4 líneas de iniciales. Suma 188. Es aproximado.',
    '· Iniciales: sus 12 criaturas, por tipo principal (Agua, Planta, Infernal y Roca, 3 cada una). Con ellas, el total es 200.',
    '· Diferencia = hay − objetivo total. Verde: justo. Rojo: sobran. Negativo: faltan.',
    '· Las cifras en azul son datos del autor; el resto se calcula solo.',
]
for k, t in enumerate(notas):
    c = ws.cell(rt + 4 + k, 7, t)
    c.font = Font(name=ARIAL, size=10, bold=(k == 0), color='3A2E2A' if k == 0 else '5A4A44')
    c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.merge_cells(start_row=rt + 4 + k, start_column=7, end_row=rt + 4 + k, end_column=13)

ws.freeze_panes = 'A5'
ws.page_setup.orientation = 'landscape'
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.print_title_rows = '4:4'
ws.sheet_view.zoomScale = 100
for row in ws.iter_rows(min_row=1, max_row=3):
    for c in row:
        if c.value and c.font.name != ARIAL: c.font = Font(name=ARIAL)
wb.save(sys.argv[1] if len(sys.argv) > 1 else 'criaturas-plantilla.xlsx')
print('filas de datos', primera_dato, ultima_dato, 'panel', G0, rt)
for q in range(1, 6): print(q, len(quintiles[q]), sum(len(e) for e in quintiles[q]))
