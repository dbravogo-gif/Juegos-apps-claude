"""Elige la plantilla de 10 que maximiza los puntos esperados en un horizonte de GameWeeks.

Modela el juego día a día: cada GameDay puntúan como máximo 5 titulares
(3 BC + 2 FC o 2 BC + 3 FC) entre los jugadores cuyo equipo juega ese día, y en cada
GameWeek un capitán puntúa doble un día. Los otros 5 son suplentes: si un titular
no juega, entra automáticamente un suplente con partido ese día (aproximado con el
número esperado de titulares que fallan: suma de 1 - disponibilidad).

Uso:
  pip install pulp
  python3 fantasy-nba/scripts/optimize.py --gw 3 5 [--from-date 2026-11-04] [--budget 100]
      [--current "A" --current "B" ... --max-transfers 2] [--must "X"] [--exclude "X"] [--min-games 40]

--current/--max-transfers: parte de tu plantilla y permite como mucho N cambios.
--from-date: ignora los GameDays anteriores a esa fecha (UTC del primer partido).
--min-games: solo jugadores con >= N partidos en alguna de las dos temporadas anteriores,
  con >= 4 partidos esta temporada o con fila en proyecciones.csv.
Excluye siempre a los jugadores de 2026-27/cogidos.txt (otros equipos de la liga).

Proyección por jugador (puntos por partido esperados):
  prior = FPPG 2025-26 si jugó >= 25 partidos; si no, FPPG 2024-25 (si jugó >= 25).
          Con menos de 40 partidos se encoge hacia 12 (nivel de reserva).
          fppg de proyecciones.csv si existe; si no, prior * mult
          (mult 0.85 por defecto si cambió de equipo o no jugó la temporada pasada).
  proj  = media de prior (peso PRIOR_GAMES partidos) y FPPG de sus últimos 10 partidos de esta
          temporada (boxscores de 2026-27/boxscores/).
          Después se multiplica por "adj" de proyecciones.csv (rol inflado por lesiones de compañeros que vuelven).
  avail = probabilidad de jugar (proyecciones.csv; por defecto según estado en el juego). Si se ha
          perdido partidos de su equipo esta temporada, se limita a 0.4 + 0.6·(jugados/equipo).
  back  = fecha de regreso de la noticia del juego ("expected back AAAA-MM-DD"): antes de esa fecha
          no puede jugar ni ser titular; un lesionado ("i") con fecha de regreso se trata como 0.85 al volver.
"""
import argparse
import csv
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

import pulp

# Máximo de titulares por posición y día: 3-2 o 2-3 ("libre"); "2-3" fuerza 2 BC + 3 FC.
FORMATIONS = {"libre": {"BC": 3, "FC": 3}, "2-3": {"BC": 2, "FC": 3}}

SEASON = Path(__file__).resolve().parents[1] / "2026-27"
SHRINK_GAMES, REPLACEMENT_FPPG = 30, 12.0
NEW_TEAM_MULT = 0.85
PRIOR_GAMES, RECENT_GAMES = 4, 10
DEFAULT_AVAIL = {"a": 0.92, "d": 0.85, "i": 0.0, "s": 0.0, "u": 0.0, "n": 0.0}
BACK_RE = re.compile(r"expected back (\d{4}-\d{2}-\d{2})")


def norm(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"\b(jr|sr|ii|iii|iv)\b\.?", "", name.lower())
    return re.sub(r"[^a-z]", "", name)


def latest_snapshot():
    return sorted(p for p in (SEASON / "data").iterdir() if p.is_dir())[-1]


def season_form():
    """({nombre: (partidos, FPPG últimos RECENT_GAMES)}, {equipo: partidos jugados}) de esta temporada."""
    games, team_dates = defaultdict(list), defaultdict(set)
    for f in sorted((SEASON / "boxscores").glob("*.csv")):
        for r in csv.DictReader(open(f)):
            games[norm(r["name"])].append((r["date"], float(r["FP"])))
            team_dates[r["team"]].add(r["date"])
    form = {}
    for k, g in games.items():
        last = [fp for _, fp in sorted(g)[-RECENT_GAMES:]]
        form[k] = (len(g), sum(last) / len(last))
    return form, {t: len(d) for t, d in team_dates.items()}


def load_players(snap):
    overrides = {r["name"]: r for r in csv.DictReader(open(SEASON / "proyecciones.csv"))}
    form, team_games = season_form()
    # ESPN y el juego usan algunas abreviaturas distintas
    espn = {"GS": "GSW", "NY": "NYK", "NO": "NOP", "SA": "SAS", "UTAH": "UTA", "WSH": "WAS"}
    team_games = {espn.get(t, t): n for t, n in team_games.items()}
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
        prior = float(o["fppg"]) if o.get("fppg") else base * mult
        g26, fppg26 = form.get(norm(r["name"]), (0, 0.0))
        proj = (prior * PRIOR_GAMES + fppg26 * g26) / (PRIOR_GAMES + g26) * float(o.get("adj") or 1)
        m = BACK_RE.search(r["news"])
        back = m.group(1) if m else ""
        if o.get("avail"):
            avail = float(o["avail"])
        elif back and r["status"] in ("i", "s", "u"):
            avail = 0.85  # vuelve de una lesión con fecha: disponible tras esa fecha
        else:
            avail = DEFAULT_AVAIL.get(r["status"], 0)
        tg = team_games.get(r["team"], 0)
        if not o.get("avail") and tg >= 5:
            avail = min(avail, 0.4 + 0.6 * min(g26, tg) / tg)
        players.append({
            "name": r["name"], "team": r["team"], "pos": r["pos"], "price": float(r["price"]),
            "proj": round(proj, 1), "exp": proj * avail, "avail": avail,
            "sel": float(r["selected_pct"]), "back": back, "g26": g26, "fppg26": round(fppg26, 1),
            "games": max(last_g, prev_g), "manual": r["name"] in overrides,
            "note": o.get("note") or (f"Viene de {r['last_team'] or 'no jugar'} (x{NEW_TEAM_MULT})" if moved else ""),
        })
    return players


def load_days(snap, gw_from, gw_to, from_date=""):
    """{event_id: (gameweek_number, set_of_teams_playing)}"""
    dates = load_dates(snap)
    days = defaultdict(lambda: [0, set()])
    for f in csv.DictReader(open(snap / "fixtures.csv")):
        gw, e = int(re.search(r"\d+", f["gameweek"]).group()), int(f["event"])
        if gw_from <= gw <= gw_to and dates[e] >= from_date:
            days[e][0] = gw
            days[e][1].update((f["home"], f["away"]))
    return dict(days)


def load_dates(snap):
    """{event_id: 'AAAA-MM-DD'} fecha (UTC) del primer partido de cada GameDay."""
    dates = {}
    for f in csv.DictReader(open(snap / "fixtures.csv")):
        e, day = int(f["event"]), f["kickoff_utc"][:10]
        dates[e] = min(day, dates.get(e, day))
    return dates


def solve(players, days, budget, must=(), exclude=(), dates=None, min_games=0, formation="libre",
          current=(), max_transfers=None):
    cands = [p for p in players if p["exp"] > 0 and p["name"] not in exclude
             and (p["games"] >= min_games or p["g26"] >= 4 or p["manual"]
                  or p["name"] in must or p["name"] in current)]
    # Reduce el problema: los mejores por posición en esperanza y en esperanza/precio
    keep = set(must) | set(current)
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
    if current and max_transfers is not None:
        prob += pulp.lpSum(x[n] for n in current if n in x) >= len(current) - max_transfers
    for d in days:
        on = [(n, dd) for (n, dd) in y if dd == d]
        prob += pulp.lpSum(y[k] for k in on) <= 5
        for pos in ("BC", "FC"):
            prob += pulp.lpSum(y[k] for k in on if by_name[k[0]]["pos"] == pos) <= FORMATIONS[formation][pos]
        # Suplentes automáticos: cubren, en esperanza, los titulares que no juegan
        prob += pulp.lpSum(sub[k] for k in on) <= pulp.lpSum((1 - by_name[k[0]]["avail"]) * y[k] for k in on)
    for (n, d), v in y.items():
        prob += v + sub[n, d] <= x[n]
        prob += cap[n, d] <= v
    for gw in {gw for gw, _ in days.values()}:
        prob += pulp.lpSum(cap[n, d] for (n, d) in cap if days[d][0] == gw) <= 1

    prob.solve(pulp.PULP_CBC_CMD(msg=False, timeLimit=300))
    squad = [by_name[n] for n, v in x.items() if v.value() > 0.5]
    starts, games, caps, subs = defaultdict(int), defaultdict(int), defaultdict(int), defaultdict(float)
    for (n, d), v in y.items():
        games[n] += 1
        starts[n] += v.value() > 0.5
    for (n, d), v in cap.items():
        caps[n] += v.value() > 0.5
    for (n, d), v in sub.items():
        subs[n] += v.value() or 0
    return squad, starts, games, caps, subs, pulp.value(prob.objective), pulp.LpStatus[prob.status]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gw", nargs=2, type=int, default=[1, 3])
    ap.add_argument("--from-date", default="")
    ap.add_argument("--budget", type=float, default=100.0)
    ap.add_argument("--must", action="append", default=[])
    ap.add_argument("--exclude", action="append", default=[])
    ap.add_argument("--current", action="append", default=[])
    ap.add_argument("--max-transfers", type=int)
    ap.add_argument("--min-games", type=int, default=40)
    ap.add_argument("--formation", choices=FORMATIONS, default="libre")
    a = ap.parse_args()
    taken = SEASON / "cogidos.txt"  # jugadores que ya tiene otro equipo de la liga
    if taken.exists():
        a.exclude += [l.strip() for l in open(taken) if l.strip() and not l.startswith("#")]

    snap = latest_snapshot()
    players = load_players(snap)
    days = load_days(snap, *a.gw, a.from_date)
    squad, starts, games, caps, subs, total, status = solve(
        players, days, a.budget, a.must, a.exclude, load_dates(snap), a.min_games, a.formation,
        a.current, a.max_transfers)

    print(f"Datos: {snap.name} | GW{a.gw[0]}-GW{a.gw[1]} desde {a.from_date or 'inicio'} ({len(days)} días) | estado: {status}")
    print(f"{'Pos':3} {'Jugador':26} {'Eq':4} {'Precio':>6} {'Proy':>5} {'26-27':>5} {'Disp':>4} {'Part':>4} {'Tit':>3} {'Sup':>4} {'Cap':>3}")
    for p in sorted(squad, key=lambda p: (p["pos"], -p["price"])):
        n = p["name"]
        mark = "" if not a.current or n in a.current else "  <- ENTRA"
        print(f"{p['pos']:3} {n:26} {p['team']:4} {p['price']:6.1f} {p['proj']:5.1f} {p['fppg26']:5.1f} {p['avail']:4.2f} "
              f"{games[n]:4} {starts[n]:3} {subs[n]:4.1f} {caps[n]:3}{mark}")
    if a.current:
        out = [n for n in a.current if n not in {p['name'] for p in squad}]
        print("SALEN:", ", ".join(out) or "nadie")
    print(f"Coste: {sum(p['price'] for p in squad):.1f} / {a.budget} | Puntos esperados: {total:.0f}")
    print("Proy = proyección mezclada; 26-27 = media de sus últimos 10 partidos; Tit = días de titular; Sup = entradas como suplente")


if __name__ == "__main__":
    main()
