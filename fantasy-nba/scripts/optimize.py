"""Elige la plantilla de 10 que maximiza los puntos esperados en un horizonte de GameWeeks.

Modela el juego día a día: cada GameDay puntúan como máximo 5 titulares
(máx. 3 BC y 3 FC) entre los jugadores cuyo equipo juega ese día, y en cada
GameWeek un capitán puntúa doble un día. Los otros 5 son suplentes: si un titular
no juega, entra automáticamente un suplente con partido ese día (aproximado con el
número esperado de titulares que fallan: suma de 1 - disponibilidad).

Uso:
  pip install pulp
  python3 fantasy-nba/scripts/optimize.py [--gw 1 3] [--budget 100] [--must "Luka Doncic"] [--exclude "X"] [--min-games 40]

--min-games: solo considera jugadores con >= N partidos en alguna de las dos últimas temporadas
(o con una fila en proyecciones.csv, p. ej. novatos). Evita rellenos con muestras muy cortas.

Proyección por jugador (puntos por partido esperados):
  base  = FPPG 2025-26 si jugó >= 25 partidos; si no, FPPG 2024-25 (si jugó >= 25).
          Con menos de 40 partidos se encoge hacia 12 (nivel de reserva) para no fiarse de muestras cortas.
  proj  = fppg de proyecciones.csv si existe; si no, base * mult
          (mult por defecto 0.85 si cambió de equipo o no jugó la temporada pasada,
           y no está en proyecciones.csv)
  avail = probabilidad de jugar (proyecciones.csv; por defecto según estado en el juego)
  back  = fecha de regreso de la noticia del juego ("expected back AAAA-MM-DD"): antes de esa fecha
          no puede jugar ni ser titular; un lesionado ("i") con fecha de regreso se trata como 0.85 al volver.
"""
import argparse
import csv
import re
from collections import defaultdict
from pathlib import Path

import pulp

SEASON = Path(__file__).resolve().parents[1] / "2026-27"
SHRINK_GAMES, REPLACEMENT_FPPG = 30, 12.0
NEW_TEAM_MULT = 0.85
DEFAULT_AVAIL = {"a": 0.92, "d": 0.85, "i": 0.0, "s": 0.0, "u": 0.0, "n": 0.0}
BACK_RE = re.compile(r"expected back (\d{4}-\d{2}-\d{2})")


def latest_snapshot():
    return sorted(p for p in (SEASON / "data").iterdir() if p.is_dir())[-1]


def load_players(snap):
    overrides = {r["name"]: r for r in csv.DictReader(open(SEASON / "proyecciones.csv"))}
    players = []
    for r in csv.DictReader(open(snap / "players.csv")):
        last_g, prev_g = int(r["last_g"]), int(r["prev_g"])
        base, g = float(r["last_fppg"]), last_g
        if last_g < 25 and prev_g >= 25:
            base, g = float(r["prev_fppg"]), prev_g
        if g < 40:
            base = (base * g + REPLACEMENT_FPPG * SHRINK_GAMES) / (g + SHRINK_GAMES)
        o = overrides.get(r["name"], {})
        moved = r["last_team"] != r["team"]  # incluye "no jugó en 2025-26" (last_team vacío)
        mult = float(o["mult"]) if o.get("mult") else (NEW_TEAM_MULT if moved else 1.0)
        proj = float(o["fppg"]) if o.get("fppg") else base * mult
        m = BACK_RE.search(r["news"])
        back = m.group(1) if m else ""
        if o.get("avail"):
            avail = float(o["avail"])
        elif back and r["status"] in ("i", "s", "u"):
            avail = 0.85  # vuelve de una lesión con fecha: disponible tras esa fecha
        else:
            avail = DEFAULT_AVAIL.get(r["status"], 0)
        players.append({
            "name": r["name"], "team": r["team"], "pos": r["pos"], "price": float(r["price"]),
            "proj": round(proj, 1), "exp": proj * avail, "avail": avail,
            "sel": float(r["selected_pct"]), "back": back,
            "games": max(last_g, prev_g), "manual": r["name"] in overrides,
            "note": o.get("note") or (f"Viene de {r['last_team'] or 'no jugar'} (x{NEW_TEAM_MULT})" if moved else ""),
        })
    return players


def load_days(snap, gw_from, gw_to):
    """{event_id: (gameweek_number, set_of_teams_playing)}"""
    days = defaultdict(lambda: [0, set()])
    for f in csv.DictReader(open(snap / "fixtures.csv")):
        gw = int(re.search(r"\d+", f["gameweek"]).group())
        if gw_from <= gw <= gw_to:
            d = days[int(f["event"])]
            d[0] = gw
            d[1].update((f["home"], f["away"]))
    return dict(days)


def load_dates(snap):
    """{event_id: 'AAAA-MM-DD'} fecha (UTC) del primer partido de cada GameDay."""
    dates = {}
    for f in csv.DictReader(open(snap / "fixtures.csv")):
        e, day = int(f["event"]), f["kickoff_utc"][:10]
        dates[e] = min(day, dates.get(e, day))
    return dates


def solve(players, days, budget, must=(), exclude=(), dates=None, min_games=0):
    cands = [p for p in players if p["exp"] > 0 and p["name"] not in exclude
             and (p["games"] >= min_games or p["manual"] or p["name"] in must)]
    # Reduce el problema: los mejores por posición en esperanza y en esperanza/precio
    keep = set(must)
    for pos in ("BC", "FC"):
        pool = [p for p in cands if p["pos"] == pos]
        keep |= {p["name"] for p in sorted(pool, key=lambda p: -p["exp"])[:60]}
        keep |= {p["name"] for p in sorted(pool, key=lambda p: -p["exp"] / p["price"])[:60]}
    cands = [p for p in cands if p["name"] in keep]

    prob = pulp.LpProblem("squad", pulp.LpMaximize)
    x = {p["name"]: pulp.LpVariable(f"x_{i}", cat="Binary") for i, p in enumerate(cands)}
    y, cap, sub = {}, {}, {}
    for d, (gw, teams) in days.items():
        for i, p in enumerate(cands):
            if p["team"] in teams and not (p["back"] and dates and dates[d] < p["back"]):
                y[p["name"], d] = pulp.LpVariable(f"y_{i}_{d}", cat="Binary")
                cap[p["name"], d] = pulp.LpVariable(f"c_{i}_{d}", cat="Binary")
                sub[p["name"], d] = pulp.LpVariable(f"s_{i}_{d}", lowBound=0, upBound=1)
    by_name = {p["name"]: p for p in cands}

    prob += pulp.lpSum(by_name[n]["exp"] * (y[n, d] + cap[n, d] + sub[n, d]) for (n, d) in y)
    prob += pulp.lpSum(p["price"] * x[p["name"]] for p in cands) <= budget
    for pos in ("BC", "FC"):
        prob += pulp.lpSum(x[p["name"]] for p in cands if p["pos"] == pos) == 5
    for team in {p["team"] for p in cands}:
        prob += pulp.lpSum(x[p["name"]] for p in cands if p["team"] == team) <= 2
    for n in must:
        prob += x[n] == 1
    for d in days:
        on = [(n, dd) for (n, dd) in y if dd == d]
        prob += pulp.lpSum(y[k] for k in on) <= 5
        for pos in ("BC", "FC"):
            prob += pulp.lpSum(y[k] for k in on if by_name[k[0]]["pos"] == pos) <= 3
        # Suplentes automáticos: cubren, en esperanza, los titulares que no juegan
        prob += pulp.lpSum(sub[k] for k in on) <= pulp.lpSum((1 - by_name[k[0]]["avail"]) * y[k] for k in on)
    for (n, d), v in y.items():
        prob += v + sub[n, d] <= x[n]
        prob += cap[n, d] <= v
    for gw in {gw for gw, _ in days.values()}:
        prob += pulp.lpSum(cap[n, d] for (n, d) in cap if days[d][0] == gw) <= 1

    prob.solve(pulp.PULP_CBC_CMD(msg=False, timeLimit=300))
    squad = [by_name[n] for n, v in x.items() if v.value() > 0.5]
    starts = defaultdict(int)
    games = defaultdict(int)
    for (n, d), v in y.items():
        games[n] += 1
        if v.value() > 0.5:
            starts[n] += 1
    caps = defaultdict(int)
    for (n, d), v in cap.items():
        if v.value() > 0.5:
            caps[n] += 1
    subs = defaultdict(float)
    for (n, d), v in sub.items():
        subs[n] += v.value() or 0
    return squad, starts, games, caps, subs, pulp.value(prob.objective), pulp.LpStatus[prob.status]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gw", nargs=2, type=int, default=[1, 3])
    ap.add_argument("--budget", type=float, default=100.0)
    ap.add_argument("--must", action="append", default=[])
    ap.add_argument("--exclude", action="append", default=[])
    ap.add_argument("--min-games", type=int, default=40)
    a = ap.parse_args()

    snap = latest_snapshot()
    players = load_players(snap)
    days = load_days(snap, *a.gw)
    squad, starts, games, caps, subs, total, status = solve(players, days, a.budget, a.must, a.exclude, load_dates(snap), a.min_games)

    print(f"Datos: {snap.name} | GW{a.gw[0]}-GW{a.gw[1]} ({len(days)} días) | estado: {status}")
    print(f"{'Pos':3} {'Jugador':26} {'Eq':4} {'Precio':>6} {'Proy':>5} {'Disp':>4} {'Part':>4} {'Tit':>3} {'Sup':>4} {'Cap':>3}  Nota")
    for p in sorted(squad, key=lambda p: (p["pos"], -p["price"])):
        n = p["name"]
        print(f"{p['pos']:3} {n:26} {p['team']:4} {p['price']:6.1f} {p['proj']:5.1f} {p['avail']:4.2f} "
              f"{games[n]:4} {starts[n]:3} {subs[n]:4.1f} {caps[n]:3}  {p['note']}")
    print(f"Coste: {sum(p['price'] for p in squad):.1f} / {a.budget} | Puntos esperados: {total:.0f}")
    print("Part = partidos de su equipo; Tit = días como titular; Sup = entradas esperadas como suplente automático")


if __name__ == "__main__":
    main()
