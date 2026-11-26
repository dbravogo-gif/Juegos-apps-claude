# Equilibrio de Six-seven islands

Generado el 2026-11-26 con `npm run equilibrio` (`herramientas/simular/`). No se edita a mano.

**Cómo se calcula** (supuestos, para leer los números con cuidado):

- **Experiencia y dinero:** los de cada salvaje y entrenador del recorrido (`herramientas/simular/ruta.ts`), con las fórmulas del núcleo.
- **Salvajes:** las casillas de encuentros del camino más corto por la probabilidad por paso, más las buscadas: 0 en «directo» y 3 por zona con hierba en «normal» y «completo».
- **Perfiles:** «directo» solo lucha lo forzoso; «normal» vence a todos los entrenadores del camino; «completo» hace también las zonas opcionales.
- **Equipo:** la inicial y dos compañeras capturables en Lanzarote. La inicial se lleva la mitad de la experiencia y cada compañera una cuarta parte. Todas, en la forma de su nivel.
- **Combates:** el simulador ataca siempre con lo que más daño hace y usa 3 pociones (superpociones en Gran Canaria) por debajo del 30 % de vida. Nunca cambia de criatura, así que **la probabilidad es algo pesimista**. 100 combates por casilla.

## El primer combate

La inicial sola a nivel 5, que aún desobedece (hasta el anciano), con 2 pociones; 300 combates.

| Inicial | Gana |
| --- | --- |
| agua | 99 % |
| planta | 49 % |
| infernal | 85 % |
| roca | 100 % |
| tierra | 89 % |

## Con qué nivel llegas a cada jefe (perfil «normal»)

Niveles: la inicial / cada compañera; entre paréntesis, si toda la experiencia fuera a una sola criatura. «Con la inicial por delante»: la inicial a ese nivel entre paréntesis y las compañeras igual.

### Inicial de agua

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 99 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 0 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 0 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 5 % | 96 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 0 % | 78 % |

### Inicial de planta

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 49 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 0 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 0 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 100 % | 100 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 0 % | 48 % |

### Inicial de infernal

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 85 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 0 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 0 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 100 % | 100 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 5 % | 11 % |

### Inicial de roca

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 100 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 0 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 53 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 100 % | 100 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 0 % | 4 % |

### Inicial de tierra

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 89 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 14 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 0 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 97 % | 100 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 4 % | 3 % |

## Golpes contra cada jefe (skill `rpg`)

Tu inicial al nivel con que llegas (perfil «normal») contra cada criatura del jefe: cuántos golpes de tu mejor ataque la tumban y cuántos suyos te tumban a ti. Entre paréntesis, la suma de sus estadísticas base (lo fuerte que es la especie). Objetivo orientativo de la skill: el rival cae en 2 a 4 golpes y tú aguantas de 5 a 8; un jefe, algo más.

### Inicial de agua

| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |
| --- | --- | --- |
| Líder de Roca (Lanzarote) | Cronti 10 (314) | Kine 11 (237): 3 · 3; Ishiro 11 (350): 3 · 3; Ishiradon 12 (495): 4 · 2 |
| Líder de Aire (Fuerteventura) | Chicront 16 (405) | Gullit 20 (270): 3 · 4; Aerund 21 (280): 5 · 4; Azurvan 22 (455): 5 · 2 |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | Chicront 18 (405) | Tailsan 24 (480): 3 · 3; Seaglide 25 (440): 14 · 3 |
| Comandante (Roque Nublo) | Chicront 22 (405) | Kurokin 24 (474): 3 · 3; Kurokin 25 (474): 4 · 3; Kurokin 26 (474): 3 · 3 |
| Los dos líderes, 2 contra 2 (Agaete) | Chicront 27 (405) | Koloi 29 (525): 5 · 3; Kurokin 28 (474): 3 · 3; Mineps 29 (390): 3 · 3; Tailsan 29 (480): 3 · 4; Seaglide 30 (440): 12 · 3 |

### Inicial de planta

| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |
| --- | --- | --- |
| Líder de Roca (Lanzarote) | Lisza 10 (314) | Kine 11 (237): 3 · 3; Ishiro 11 (350): 3 · 1; Ishiradon 12 (495): 4 · 1 |
| Líder de Aire (Fuerteventura) | Sporecko 16 (405) | Gullit 20 (270): 4 · 2; Aerund 21 (280): 7 · 3; Azurvan 22 (455): 9 · 1 |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | Sporecko 18 (405) | Tailsan 24 (480): 6 · 1; Seaglide 25 (440): 5 · 1 |
| Comandante (Roque Nublo) | Sporecko 22 (405) | Aculiso 24 (288): 2 · 7; Aculiso 25 (288): 2 · 6; Aculiso 26 (288): 2 · 6 |
| Los dos líderes, 2 contra 2 (Agaete) | Sporecko 27 (405) | Koloi 29 (525): 4 · 2; Kurokin 28 (474): 3 · 3; Mineps 29 (390): 2 · 2; Tailsan 29 (480): 5 · 2; Seaglide 30 (440): 5 · 2 |

### Inicial de infernal

| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |
| --- | --- | --- |
| Líder de Roca (Lanzarote) | Nokoribi 10 (314) | Kine 11 (237): 3 · 2; Ishiro 11 (350): 4 · 2; Ishiradon 12 (495): 8 · 1 |
| Líder de Aire (Fuerteventura) | Hinozö 16 (405) | Gullit 20 (270): 4 · 4; Aerund 21 (280): 6 · 4; Azurvan 22 (455): 7 · 2 |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | Hinozö 18 (405) | Tailsan 24 (480): 7 · 2; Seaglide 25 (440): 14 · 2 |
| Comandante (Roque Nublo) | Hinozö 22 (405) | Dragombo 24 (340): 3 · 9; Dragombo 25 (340): 4 · 8; Dragombo 26 (340): 4 · 8 |
| Los dos líderes, 2 contra 2 (Agaete) | Hinozö 27 (405) | Koloi 29 (525): 6 · 3; Kurokin 28 (474): 7 · 2; Mineps 29 (390): 9 · 2; Tailsan 29 (480): 6 · 3; Seaglide 30 (440): 14 · 2 |

### Inicial de roca

| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |
| --- | --- | --- |
| Líder de Roca (Lanzarote) | Armalito 10 (314) | Kine 11 (237): 5 · 2; Ishiro 11 (350): 3 · 3; Ishiradon 12 (495): 5 · 2 |
| Líder de Aire (Fuerteventura) | Uralito 16 (405) | Gullit 20 (270): 2 · 3; Aerund 21 (280): 2 · 3; Azurvan 22 (455): 3 · 5 |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | Uralito 18 (405) | Tailsan 24 (480): 6 · 1; Seaglide 25 (440): 4 · 2 |
| Comandante (Roque Nublo) | Uralito 22 (405) | Quillfire 24 (351): 2 · 9; Quillfire 25 (351): 2 · 8; Quillfire 26 (351): 2 · 6 |
| Los dos líderes, 2 contra 2 (Agaete) | Uralito 27 (405) | Koloi 29 (525): 6 · 4; Kurokin 28 (474): 8 · 1; Mineps 29 (390): 5 · 4; Tailsan 29 (480): 5 · 2; Seaglide 30 (440): 3 · 2 |

### Inicial de tierra

| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |
| --- | --- | --- |
| Líder de Roca (Lanzarote) | Tsubomi 10 (314) | Kine 11 (237): 4 · 3; Ishiro 11 (350): 2 · 4; Ishiradon 12 (495): 3 · 3 |
| Líder de Aire (Fuerteventura) | Tsuborei 16 (405) | Gullit 20 (270): 9 · 4; Aerund 21 (280): 13 · 6; Azurvan 22 (455): 16 · 2 |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | Tsuborei 18 (405) | Tailsan 24 (480): 17 · 3; Seaglide 25 (440): 23 · 2 |
| Comandante (Roque Nublo) | Tsuborei 22 (405) | Mineps 24 (390): 3 · 5; Mineps 25 (390): 2 · 5; Mineps 26 (390): 3 · 4 |
| Los dos líderes, 2 contra 2 (Agaete) | Tsuborei 27 (405) | Koloi 29 (525): 6 · 74; Kurokin 28 (474): 7 · 3; Mineps 29 (390): 2 · 6; Tailsan 29 (480): 13 · 4; Seaglide 30 (440): 17 · 2 |

## Los tres perfiles (inicial de agua)

Nivel de la inicial al llegar a cada jefe; entre paréntesis, si toda la experiencia fuera a ella.

| Jefe | directo | normal | completo |
| --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 (5) | 5 (6) | 5 (6) |
| Líder de Roca (Lanzarote) | 8 (9) | 10 (12) | 10 (13) |
| Líder de Aire (Fuerteventura) | 12 (16) | 16 (20) | 18 (23) |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 14 (18) | 18 (23) | 20 (25) |
| Comandante (Roque Nublo) | 16 (20) | 22 (28) | 24 (30) |
| Los dos líderes, 2 contra 2 (Agaete) | 19 (25) | 27 (34) | 29 (37) |

## El dinero que hay en cada isla

| Isla | Lo que pagan todos sus entrenadores |
| --- | --- |
| Lanzarote | 3650 |
| Fuerteventura | 9190 |
| Gran Canaria | 19500 |
