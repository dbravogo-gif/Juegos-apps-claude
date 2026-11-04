# Registro de jornadas 2026-27

Formato por GameWeek: plantilla, fichajes (entra/sale y motivo), capitán, puntos, precio total del equipo.

<!-- Añadir la GW1 cuando esté hecho el equipo inicial -->

## Pretemporada (revisión 14-oct, 46 partidos, boxscores de ESPN)

- Bien: K. George (titular, 23 min, 33 FPPG), Barnes, SGA, Kessler (ya sano), B. Williams (5 partidos, 17 min).
- Flojos: Cam Spencer (0 titularidades, 15 min, 17 FPPG), Ben Saraf (12 min, 12 FPPG), Jericho Sims (17 min, 12 FPPG).
- Baratos que destacan: Jonathan Mogbo (SAC, 5.0, 24 min, 36 FPPG; SAC tiene a sus pívots lesionados), Darius Acuff Jr. (SAC, 8.0, titular 3/3, 26 min, 34 FPPG), Tristan da Silva (ORL, 6.5, 23 min, 32 FPPG), Aday Mara (OKC, 6.0, titular mientras Holmgren estuvo de baja).
- Propuesta neutra en presupuesto: Sims→Mogbo, Spencer→Acuff, Saraf→Ryan Conwell (MIA, 4.5).
- Normativa 2026-27: lotería 3-2-1 anti-tanking (menos parones de veteranos en equipos malos a final de temporada) y énfasis arbitral en flops y uso del brazo libre. Sin cambios de reglas del juego fantasy detectados.

## Plantilla actual (3-nov)

- BC: Austin Reaves (LAL), Ajay Mitchell (OKC), Cam Spencer (MEM), Brandon Williams (GSW), Sidy Cissoko (POR)
- FC: Scottie Barnes (TOR), Walker Kessler (LAL), Kyshawn George (WAS), Jalen Johnson (ATL), Leonard Miller (CHI)
- Lesionados cortos: J. Johnson (tobillo, vuelve 4-nov), B. Williams (cuádriceps, vuelve 5-nov).
- Jalen Williams (OKC) fuera hasta marzo: Ajay Mitchell titular a largo plazo.
- Flojos: Cissoko (minutos a la baja, 9-17 FP) y Miller (9-11 min). Candidatos: Meleek Thomas (CLE, BC 5.0), Kobe Sanders (LAC, BC 5.5), Dean Wade (PHI, FC 5.5), Georges Niang (GSW, FC 5.0).
- Wildcard 1 caduca el 29-nov: plan de usarla hacia el 22-28 nov.

## Análisis 3-nov: wildcard ahora (optimizador GW3-GW6, hasta 29-nov, sin Nurkić)

| Escenario | Puntos esperados |
|---|---|
| Sin cambios | 3355 |
| Mejor con 2 cambios (J. Johnson + Kessler → Wembanyama + Paul Reed) | 3636 |
| Wildcard robusta (mantiene Barnes, Ajay, K. George) | 3911 |
| Wildcard máxima del modelo | 3931 |

Wildcard 1 caduca el 29-nov y la 2 se abre el 1-dic: esperar no ahorra nada.
Propuesta (revisada): BC Ty Jerome, Ayo Dosunmu, Ajay Mitchell, Dillon Brooks, Tyler Kolek · FC Wembanyama, Barnes, K. George, Isaiah Jackson, Tristan da Silva (98.7, 3887 pts). Dosunmu en vez de Anthony Black: Black solo 4 partidos, descansando y pierde rol cuando vuelva Suggs (10-nov).

## Propuesta FINAL wildcard (3-nov, modelo corregido)

Correcciones tras el caso Black: ajuste "adj" por rol inflado (compañeros que vuelven) y disponibilidad limitada por partidos perdidos.
Hasta 29-nov: sin cambios 3355 · mejor con 2 cambios (J. Johnson + Kessler → Wembanyama + Kuminga) 3632 · wildcard libre 3848 · **wildcard con Barnes 3829 (elegida)**.

- BC: Ajay Mitchell (9.0), Dillon Brooks (8.5), Cam Spencer (6.9), Bones Hyland (5.0), Tyler Kolek (4.5)
- FC: Wembanyama (19.5, capitán), Scottie Barnes (15.5), Deni Avdija (14.5), Kyshawn George (9.0), Tristan da Silva (6.5)
- Salen: Reaves, Kessler, Jalen Johnson, Brandon Williams, Cissoko, Miller. Coste 98.9.

### Variante equilibrada (misma puntuación)
Con BC estrella (forzado): Jamal Murray 3752 · Cade 3763 · Curry 3715 → peores que la propuesta (3829).
Sin Avdija (libre): 3828 → BC Dosunmu, Ajay Mitchell, Dillon Brooks, Brandon Williams, Tyler Kolek · FC Wembanyama, Barnes, McDaniels, K. George, da Silva (99.0).

## 4-nov: datos reales del juego (league.py)

Klk: 1. 67 (2305) · 2. 1 over u (2191) · 3. **Nitos (2003)** · 4. Aaroners (1389). Banco 1.0, wildcard sin usar.
Hasta 29-nov (presupuesto 100.0): sin cambios 3355 · 1 cambio (J. Johnson → Giannis) 3501 ·
2 cambios manteniendo a Barnes (Reaves + J. Johnson → Cade + Avdija) 3682 · 2 cambios libres (J. Johnson + Barnes → Wembanyama + Avdija) 3701 · wildcard 3849.
Plan: 2 cambios ahora (Cade + Avdija) y wildcard 1 hacia el 20-28 nov con datos frescos (caduca el 29-nov).
