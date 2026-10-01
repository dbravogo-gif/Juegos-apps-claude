# Fantasy NBA — liga con colegas

Juego: **NBA Fantasy: Salary Cap Edition** (nbafantasy.nba.com), temporada 2026-27.
Inicio de temporada NBA: 20-oct-2026.

## Reglas que afectan a la estrategia

| Regla | Valor |
|---|---|
| Presupuesto | 100.0 para 10 jugadores (media 10.0) |
| Plantilla | 5 Backcourt (BC: bases/escoltas) + 5 Frontcourt (FC: aleros/ala-pívots/pívots) |
| Máx. por equipo NBA | 2 |
| Alineación diaria | 5 titulares, formación 3BC+2FC o 2BC+3FC. Solo puntúan los titulares |
| Cierre | 30 min antes del primer partido del día |
| Puntuación | Punto 1 · Rebote 1 · **Asistencia 2** · **Robo 3** · **Tapón 3** |
| Fichajes | 2 gratis por semana; cada extra −100 puntos |
| Capitán | 1 día por semana, puntúa doble (si no juega ese día, se pierde) |
| Wildcard | 3 por temporada (el 1º hasta GW6-día 6): fichajes ilimitados gratis ese día |
| All-Star | 1 por temporada: un día sin límite de presupuesto ni fichajes, luego vuelve la plantilla |
| Precios | Cambian según popularidad (más fichado = más caro) |

Fuente: API del juego (`bootstrap-static`). Extras de la API: 3 wildcards (eventos 2-39, 40-103, 104-159), 1 All-Star, capitán 1 vez por GameWeek.

## Implicaciones

- **Asistencias, robos y tapones pesan mucho**: bases organizadores y "todoterrenos" valen más que anotadores puros.
- **El precio inicial se basa en la temporada pasada**. El valor está en jugadores cuyo rol o salud ha mejorado (vuelven de lesión, cambian de equipo a un rol mayor, novatos con minutos).
- **Puntos por millón**: las estrellas rinden ~3 FPPG por millón; los buenos chollos 3.5-5. Ganar la liga depende sobre todo de acertar con los chollos, no con las estrellas.
- **Calendario**: con 2 fichajes gratis por semana, conviene tener a jugadores con 4 partidos en la semana.
- **Primera wildcard** (hasta GW6): permite corregir errores del equipo inicial. No hace falta acertar al 100% el día 1.

## Datos y scripts

```bash
python3 fantasy-nba/scripts/fetch.py          # precios, calendario y stats -> 2026-27/data/<fecha>/
pip install pulp                               # solo para el optimizador
python3 fantasy-nba/scripts/optimize.py --gw 1 6 [--must "Nombre"] [--exclude "Nombre"]
```

- `fetch.py`: descarga de nbafantasy.nba.com (precios, % de selección, estado/lesiones, calendario) y de basketball-reference (stats por partido de las dos últimas temporadas). Solo librería estándar.
- `optimize.py`: elige los 10 que maximizan los puntos esperados en las GameWeeks indicadas, simulando las alineaciones diarias (5 titulares, máx. 3 por posición) y el capitán semanal.
- `2026-27/proyecciones.csv`: ajustes manuales (multiplicador, disponibilidad o FPPG fijo). Es donde va el criterio humano; revisarlo cada semana.
- Requiere que el entorno permita `*.nba.com` y `*.basketball-reference.com` (Network access → Custom).

## Proceso semanal

1. Antes del cierre de cada GameWeek: revisar minutos, lesiones, calendario (nº de partidos) y precios.
2. Decidir los 2 fichajes gratis (o guardarlos) y el día del capitán.
3. Registrar en `2026-27/jornadas.md` qué se hizo y por qué.

FPPG = fantasy points per game con la puntuación de este juego.
