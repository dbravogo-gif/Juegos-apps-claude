"""Lee del juego la liga, las plantillas de todos sus equipos y tu dinero.

Uso: python3 fantasy-nba/scripts/league.py [--entry 8005] [--league 578] [--event N]
- Imprime clasificación, chips usados y plantillas (con precio y estado).
- Reescribe 2026-27/cogidos.txt con los jugadores de los OTROS equipos de la liga
  y 2026-27/mi_plantilla.txt con la tuya (último GameDay con alineación publicada).
Solo librería estándar. Puntos y precios de la API vienen x10.
"""
import argparse
import json
import time
import urllib.request
from pathlib import Path

API = "https://nbafantasy.nba.com/api"
SEASON = Path(__file__).resolve().parents[1] / "2026-27"


def get(path):
    for i in range(5):
        try:
            req = urllib.request.Request(f"{API}/{path}", headers={"User-Agent": "Mozilla/5.0"})
            return json.loads(urllib.request.urlopen(req, timeout=30).read())
        except Exception:
            time.sleep(2 * (i + 1))
    raise RuntimeError(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--entry", type=int, default=8005)
    ap.add_argument("--league", type=int, default=578)
    ap.add_argument("--event", type=int)
    a = ap.parse_args()

    boot = get("bootstrap-static/")
    els = {e["id"]: e for e in boot["elements"]}
    teams = {t["id"]: t["short_name"] for t in boot["teams"]}
    event = a.event or get(f"entry/{a.entry}/")["current_event"]

    standings = get(f"leagues-classic/{a.league}/standings/")
    print(f"Liga: {standings['league']['name']} | GameDay {event}")
    rows = standings["standings"]["results"]
    others = []
    for r in rows:
        eid = r["entry"]
        picks = get(f"entry/{eid}/event/{event}/picks/")
        hist = get(f"entry/{eid}/history/")
        eh = picks.get("entry_history", {})
        chips = ", ".join(f"{c['name']}@{c['event']}" for c in hist.get("chips", [])) or "ninguno"
        print(f"\n{r['rank']}. {r['entry_name']} ({r['player_name']}) — {r['total'] / 10:.0f} pts | "
              f"banco {eh.get('bank', 0) / 10:.1f} | valor {eh.get('value', 0) / 10:.1f} | chips: {chips}")
        names = []
        for p in picks["picks"]:
            e = els[p["element"]]
            name = f"{e['first_name']} {e['second_name']}"
            names.append(name)
            role = "TIT" if p["position"] <= 5 else "sup"
            print(f"   {role} {'C' if p.get('is_captain') else ' '} {name:26} {teams[e['team']]:4} "
                  f"{'BC' if e['element_type'] == 1 else 'FC'} {e['now_cost'] / 10:5.1f} [{e['status']}] {e['news'][:40]}")
        if eid == a.entry:
            (SEASON / "mi_plantilla.txt").write_text(
                f"# Plantilla de {r['entry_name']} en el GameDay {event} (banco {eh.get('bank', 0) / 10:.1f})\n" + "\n".join(names) + "\n")
        else:
            others.append((r["entry_name"], names))
    with open(SEASON / "cogidos.txt", "w") as fh:
        fh.write(f"# Jugadores de los otros equipos de la liga (GameDay {event}). Generado por league.py.\n")
        for team, names in others:
            fh.write(f"# {team}\n" + "\n".join(names) + "\n")
    print(f"\nActualizados {SEASON / 'cogidos.txt'} y mi_plantilla.txt")


if __name__ == "__main__":
    main()
