"""Descarga precios del juego, calendario y estadísticas de la temporada pasada.

Uso: python3 fantasy-nba/scripts/fetch.py [--season-stats 2026]
Genera fantasy-nba/2026-27/data/<fecha>/players.csv y fixtures.csv.
"last_*" = temporada indicada (por defecto 2025-26); "prev_*" = la anterior.
Solo usa la librería estándar.
"""
import csv
import datetime as dt
import html
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

API = "https://nbafantasy.nba.com/api"
BREF = "https://www.basketball-reference.com/leagues/NBA_{year}_per_game.html"
UA = {"User-Agent": "Mozilla/5.0"}
# Abreviaturas de basketball-reference que difieren de las del juego
BREF_TEAMS = {"BRK": "BKN", "PHO": "PHX", "CHO": "CHA"}
# Nombre en el juego -> nombre en basketball-reference
ALIASES = {"Alexandre Sarr": "Alex Sarr", "Ronald Holland II": "Ron Holland",
           "Carlton Carrington": "Bub Carrington", "David Jones": "David Jones Garcia"}
ROOT = Path(__file__).resolve().parents[1] / "2026-27" / "data"


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read().decode("utf-8")


def norm(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"\b(jr|sr|ii|iii|iv)\b\.?", "", name.lower())
    return re.sub(r"[^a-z]", "", name)


def fantasy_points(pts, reb, ast, stl, blk):
    return pts + reb + 2 * ast + 3 * stl + 3 * blk


def season_stats(year):
    """Per-game stats from basketball-reference; first row per player (season total if traded)."""
    page = get(BREF.format(year=year))
    stats = {}
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        cells = dict(re.findall(r'data-stat="([a-z_0-9]+)"[^>]*>(.*?)</t[dh]>', row, re.S))
        name = html.unescape(re.sub(r"<[^>]+>", "", cells.get("name_display", ""))).strip()
        if not name or name == "Player":
            continue
        team = re.sub(r"<[^>]+>", "", cells.get("team_name_abbr", ""))
        if norm(name) in stats:
            # Filas por equipo tras la fila total de un traspasado: la última es su equipo final
            if not team.endswith("TM"):
                stats[norm(name)]["team"] = BREF_TEAMS.get(team, team)
            continue
        f = lambda k: float(re.sub(r"<[^>]+>", "", cells.get(k, "")) or 0)
        stats[norm(name)] = {
            "team": BREF_TEAMS.get(team, team),
            "g": int(f("games")),
            "gs": int(f("games_started")),
            "mpg": f("mp_per_g"),
            "fppg": round(fantasy_points(f("pts_per_g"), f("trb_per_g"), f("ast_per_g"), f("stl_per_g"), f("blk_per_g")), 1),
        }
    return stats


def main():
    year = int(sys.argv[sys.argv.index("--season-stats") + 1]) if "--season-stats" in sys.argv else 2026
    boot = json.loads(get(f"{API}/bootstrap-static/"))
    fixtures = json.loads(get(f"{API}/fixtures/"))
    stats = season_stats(year)
    prev = season_stats(year - 1)

    teams = {t["id"]: t["short_name"] for t in boot["teams"]}
    events = {e["id"]: e["name"] for e in boot["events"]}
    out = ROOT / dt.date.today().isoformat()
    out.mkdir(parents=True, exist_ok=True)

    with open(out / "fixtures.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["event", "gameweek", "kickoff_utc", "home", "away"])
        for f in fixtures:
            gw = events.get(f["event"], "").split(" - ")[0]
            w.writerow([f["event"], gw, f["kickoff_time"], teams[f["team_h"]], teams[f["team_a"]]])

    missing = []
    with open(out / "players.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "name", "team", "pos", "price", "selected_pct", "status", "news",
                    "last_team", "last_total_fp", "last_g", "last_gs", "last_mpg", "last_fppg", "value_fppg_per_m",
                    "prev_g", "prev_fppg"])
        for e in sorted(boot["elements"], key=lambda e: -e["now_cost"]):
            full = f'{e["first_name"]} {e["second_name"]}'
            key = norm(ALIASES.get(full, full))
            s, p = stats.get(key, {}), prev.get(key, {})
            if not s and e["total_points"]:
                missing.append(full)
            price = e["now_cost"] / 10
            fppg = s.get("fppg", 0)
            w.writerow([e["id"], full, teams[e["team"]], "BC" if e["element_type"] == 1 else "FC", price,
                        e["selected_by_percent"], e["status"], e["news"], s.get("team", ""), e["total_points"] / 10,
                        s.get("g", 0), s.get("gs", 0), s.get("mpg", 0), fppg,
                        round(fppg / price, 2) if price else 0, p.get("g", 0), p.get("fppg", 0)])
    print(f"Guardado en {out} ({len(boot['elements'])} jugadores, {len(fixtures)} partidos)")
    if missing:
        print("Sin estadísticas (revisar nombre):", ", ".join(missing[:30]))


if __name__ == "__main__":
    main()
