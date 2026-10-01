# Candidatos 2026-27 (versión 2 — 1-oct-2026, precios reales del juego)

Datos: `data/2026-10-01/` (API de nbafantasy.nba.com + estadísticas 2025-26 de basketball-reference).
Proyecciones: `proyecciones.csv` (ajustes manuales por cambio de rol, lesiones y novatos).

- **Proy** = puntos fantasy por partido esperados en 2026-27 (PTS + REB + 2·AST + 3·ROB + 3·TAP).
- **Proy/M** = Proy / precio. **~3.0 es precio justo**; por encima de 3.3 es chollo.
- El juego fija los precios casi en proporción a la producción del año pasado: las estrellas no son caras ni baratas. El valor está en roles que crecen y en suplentes baratos con minutos.

## Backcourt (BC)

| Pos | Jugador | Eq | Precio | Proy | Proy/M | Motivo / riesgo |
|---|---|---|---|---|---|---|
| PG | Luka Dončić | LAL | 21.0 | 66.0 | 3.14 | Mejor capitán. Sin LeBron, más balón. LAL juega 20 partidos en GW1-6 |
| PG | Cade Cunningham | DET | 18.0 | 55.8 | 3.10 | Alternativa a SGA, 0.5 más barato |
| PG | Trae Young | WAS | 15.5 | 50.9 | 3.28 | 54.7 en 24-25; solo 15 partidos en 25-26. Riesgo de lesión |
| PG | Brandon Williams | GSW | 6.0 | 27.3 | **4.55** | Mejor chollo BC. Base suplente; Butler/Moody/Porziņģis de baja al inicio |
| SG | Shai Gilgeous-Alexander | OKC | 18.5 | 55.2 | 2.98 | El más fiable del juego |
| SG | Donovan Mitchell | CLE | 16.0 | 49.2 | 3.08 | 70 partidos; CLE juega 4 en GW2 y GW3 |
| SG | Jalen Suggs | ORL | 10.5 | 36.2 | 3.45 | Buen precio; historial de lesiones |
| SG | Cam Spencer | MEM | 7.0 | 27.5 | **3.93** | Chollo: más minutos sin Morant |

## Frontcourt (FC)

| Pos | Jugador | Eq | Precio | Proy | Proy/M | Motivo / riesgo |
|---|---|---|---|---|---|---|
| SF | Jalen Johnson | ATL | 17.5 | 53.4 | 3.05 | 22.5/10.3/7.9. Estrella FC más barata |
| SF | Cooper Flagg | DAL | 14.5 | 45.1 | 3.11 | Segundo año. 21% de equipos lo tienen: subirá de precio |
| SF | Trey Murphy III | NOP | 13.0 | 40.5 | 3.12 | 66 partidos, 35.5 min |
| SF | Scottie Barnes | TOR | 15.5 | 46.1 | 2.97 | Muy fiable (80 partidos). Kawhi le quitará algo de balón |
| PF | Paolo Banchero | ORL | 14.5 | 44.9 | 3.10 | 72 partidos |
| PF | Naz Reid | CHA | 10.5 | 33.8 | 3.22 | Titular por primera vez |
| PF | Kyshawn George | WAS | 9.0 | 29.4 | 3.27 | Riesgo: vuelve Trae y llega Dybantsa |
| PF | Giannis Antetokounmpo | MIA | 18.5 | 57.0 | 3.08 | Élite, pero solo 36 partidos en 25-26 (disponibilidad 75%). No de inicio |
| C | Nikola Jokić | DEN | 23.0 | 68.6 | 2.98 | El mejor, pero DEN solo juega 2 partidos en GW1 |
| C | Victor Wembanyama | SAS | 19.5 | 55.0 | 2.82 | En el 41% de los equipos: subirá de precio |
| C | Jusuf Nurkić | UTA | 9.5 | 36.3 | **3.82** | **Mejor chollo FC**. Pívot titular confirmado (10.9/10.4/4.8/1.3 ROB) |
| C | Walker Kessler | LAL | 11.0 | 36.0 | 3.27 | Titular junto a Dončić; recuperado del hombro |

### Descartados respecto a la versión 1 (con precio real)

- **Novatos** (Dybantsa 10.5, Peterson 10.5, Boozer 11.5, Wilson 10.5): cuestan como titulares veteranos y proyectan 26-32 → entre 2.5 y 2.8 por millón. Vigilarlos en pretemporada.
- **Daniels (13.0), Rollins (12.5) y Giddey (16.0)**: entre 2.9 y 3.0 por millón, precio justo sin ventaja.
- **Sabonis (15.0), Haliburton (15.0) y Giannis (18.5)**: precio de jugador sano con riesgo de lesión.
- **Maxey (16.5) y Jaylen Brown (15.0)**: Philadelphia junta a Maxey, Brown, Embiid y LeBron.

## Plantilla recomendada (100.0)

| | Jugador | Eq | Precio | Rol en la plantilla |
|---|---|---|---|---|
| BC | **Luka Dončić** (C) | LAL | 21.0 | Estrella + capitán |
| BC | Shai Gilgeous-Alexander | OKC | 18.5 | Estrella |
| BC | Cam Spencer | MEM | 7.0 | Chollo |
| BC | Brandon Williams | GSW | 6.0 | Chollo |
| BC | Ben Saraf | BKN | 5.5 | Relleno |
| FC | Jalen Johnson | ATL | 17.5 | Estrella |
| FC | Jusuf Nurkić | UTA | 9.5 | Chollo |
| FC | Haywood Highsmith | PHX | 5.0 | Relleno |
| FC | Jericho Sims | MIL | 5.0 | Relleno |
| FC | Chaney Johnson | BKN | 5.0 | Relleno |

Puntos esperados en GW1-6 según el modelo: ~5.800. La mejor combinación que encuentra el optimizador da ~5.880 (+1.5%), una diferencia menor que el error de las proyecciones. Se prefiere esta por apoyarse en 3 estrellas fiables.

**Cómo funciona**: las 3 estrellas juegan todos sus partidos; Nurkić, Spencer y Williams casi todos; los 4 rellenos (5.0-5.5) completan los días con pocos partidos (titulares ~la mitad de los días).

**Alternativas equivalentes**: Wembanyama por Jalen Johnson (+2.0, quitando de un relleno); Cunningham por SGA (−0.5); Kessler o Murphy en lugar de dos rellenos si se prescinde de una estrella.

## Antes del cierre de la GW1 (20-oct, 18:30 UTC = 20:30 en España)

- Pretemporada: confirmar minutos de los rellenos (Saraf, Highsmith, Sims, C. Johnson) y de Spencer. Son las piezas más cambiables.
- La wildcard 1 se puede usar desde el GameDay 2 hasta el evento 39 (~GW6): margen para corregir.
- Volver a ejecutar `fetch.py` y `optimize.py` la víspera con los datos actualizados.
