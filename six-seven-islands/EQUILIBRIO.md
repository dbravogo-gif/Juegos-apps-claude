# Equilibrio de Six-seven islands

Generado el 2026-11-25 con `npm run equilibrio` (`herramientas/simular/`). No se edita a mano.

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
| agua | 0 % |
| planta | 47 % |
| infernal | 85 % |
| roca | 100 % |
| tierra | 89 % |

## Con qué nivel llegas a cada jefe (perfil «normal»)

Niveles: la inicial / cada compañera; entre paréntesis, si toda la experiencia fuera a una sola criatura. «Con la inicial por delante»: la inicial a ese nivel entre paréntesis y las compañeras igual.

### Inicial de agua

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 0 % | — |
| Líder de Roca (Lanzarote) | 11/11/12 | 10 / 8 (12) | 11 | 10 | 2130 | 0 % | 0 % |
| Líder de Aire (Fuerteventura) | 20/21/22 | 16 / 13 (20) | 31 | 26 | 8930 | 0 % | 0 % |
| 3.er aprendiz Eléctrico (llegada a Gran Canaria) | 24/25 | 18 / 14 (23) | 31 | 31 | 12190 | 0 % | 0 % |
| Comandante (Roque Nublo) | 24/25/26 | 22 / 18 (28) | 44 | 39 | 17250 | 5 % | 96 % |
| Los dos líderes, 2 contra 2 (Agaete) | 29/28/29/29/30 | 27 / 21 (34) | 53 | 49 | 25470 | 0 % | 78 % |

### Inicial de planta

| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primer entrenador (El Golfo) | 5 | 5, sola | 0 | 0 | 0 | 47 % | — |
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
