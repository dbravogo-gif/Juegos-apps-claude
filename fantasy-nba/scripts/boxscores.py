"""Descarga boxscores de temporada regular de ESPN y los guarda por día.

Uso: python3 fantasy-nba/scripts/boxscores.py 20261020 20261102
Genera fantasy-nba/2026-27/boxscores/AAAAMMDD.csv (salta días ya descargados).
FP = PTS + REB + 2·AST + 3·STL + 3·BLK (puntuación del juego). Solo librería estándar.
"""
import csv
import datetime as dt
import json
import sys
import time
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "2026-27" / "boxscores"
BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba"
FIELDS = ["date", "game_id", "team", "opp", "name", "starter", "MIN", "PTS", "REB", "AST", "STL", "BLK", "FG", "FP"]


def get(url):
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            return json.loads(urllib.request.urlopen(req, timeout=30).read())
        except Exception:
            time.sleep(2 * (i + 1))
    raise RuntimeError(url)


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def day(d):
    rows = []
    for e in get(f"{BASE}/scoreboard?dates={d}&seasontype=2").get("events", []):
        if not e["status"]["type"]["completed"]:
            continue
        box = get(f"{BASE}/summary?event={e['id']}").get("boxscore", {}).get("players", [])
        teams = [t["team"]["abbreviation"] for t in box]
        for t in box:
            abbr = t["team"]["abbreviation"]
            opp = next((x for x in teams if x != abbr), "")
            for st in t["statistics"]:
                for a in st["athletes"]:
                    v = dict(zip(st["names"], a.get("stats") or []))
                    if not v or v.get("MIN") in (None, "", "0", "--"):
                        continue
                    fp = num(v["PTS"]) + num(v["REB"]) + 2 * num(v["AST"]) + 3 * num(v["STL"]) + 3 * num(v["BLK"])
                    rows.append({"date": d, "game_id": e["id"], "team": abbr, "opp": opp,
                                 "name": a["athlete"]["displayName"], "starter": int(bool(a.get("starter"))),
                                 **{k: v.get(k, "") for k in ("MIN", "PTS", "REB", "AST", "STL", "BLK", "FG")},
                                 "FP": round(fp, 1)})
    return rows


def main():
    start, end = (dt.datetime.strptime(x, "%Y%m%d").date() for x in sys.argv[1:3])
    OUT.mkdir(parents=True, exist_ok=True)
    d = start
    while d <= end:
        f = OUT / f"{d:%Y%m%d}.csv"
        if not f.exists():
            rows = day(f"{d:%Y%m%d}")
            with open(f, "w", newline="") as fh:
                w = csv.DictWriter(fh, fieldnames=FIELDS)
                w.writeheader()
                w.writerows(rows)
            print(f"{d}: {len(rows)} filas")
        d += dt.timedelta(days=1)


if __name__ == "__main__":
    main()
