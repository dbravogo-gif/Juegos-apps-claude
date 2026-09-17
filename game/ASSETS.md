# Imágenes

Lista generada desde `src/data/content.js` con `node tools/assets.js`. Cada pieza se
muestra como un marcador de color hasta que el archivo existe; en cuanto se añade con el
nombre exacto, aparece sola sin tocar código.

## Cómo deben ser

- **PNG con fondo transparente**, salvo los fondos de zona.
- **Perspectiva frontal con algo de altura**, nunca a ras de suelo. La misma en todo.
- Iconos (muebles, equipo, mascotas): **512 × 512**, el objeto centrado y con aire alrededor.
- Personajes y enemigos: **hoja con tres poses en fila** (en guardia, atacando, recibiendo
  daño) sobre fondo plano. Salen de una sola generación para que sean el mismo personaje;
  las recorto yo.
- Fondos de zona: **1536 × 1024**, sin personajes.

Empieza por el personaje de la etapa 1: fija el estilo del resto.

## Personaje

| Archivo | Qué es | Cuándo aparece |
| --- | --- | --- |
| `assets/personaje/etapa1.png` | Etapa 1 | Nivel 1 |
| `assets/personaje/etapa2.png` | Etapa 2 | Nivel 5 |
| `assets/personaje/etapa3.png` | Etapa 3 | Nivel 10 |
| `assets/personaje/etapa4.png` | Etapa 4 | Nivel 15 |

## Enemigos

| Archivo | Qué es | Zona |
| --- | --- | --- |
| `assets/enemigos/rata_murallas.png` | Rata de las murallas | Las Murallas |
| `assets/enemigos/bandido_harapiento.png` | Bandido harapiento | Las Murallas |
| `assets/enemigos/gargola_agrietada.png` | Gárgola agrietada | Las Murallas |
| `assets/enemigos/guardian_puerta.png` | Guardián de la Puerta Dorada (jefe) | Las Murallas |
| `assets/enemigos/cangrejo_coloso.png` | Cangrejo coloso | El Puerto |
| `assets/enemigos/marinero_espectral.png` | Marinero espectral | El Puerto |
| `assets/enemigos/anguila_abisal.png` | Anguila abisal | El Puerto |
| `assets/enemigos/bestia_cuerno.png` | Bestia del Cuerno de Oro (jefe) | El Puerto |
| `assets/enemigos/ladron_bazar.png` | Ladrón del bazar | El Gran Bazar |
| `assets/enemigos/automata_especias.png` | Autómata de especias | El Gran Bazar |
| `assets/enemigos/serpiente_seda.png` | Serpiente de seda | El Gran Bazar |
| `assets/enemigos/el_coleccionista.png` | El Coleccionista (jefe) | El Gran Bazar |

## Fondos de zona

| Archivo | Qué es | Descripción |
| --- | --- | --- |
| `assets/zonas/murallas.png` | Las Murallas | Piedra vieja y hiedra. Lo que se cuela por las grietas. |
| `assets/zonas/puerto.png` | El Puerto | Cuerdas, sal y algo que respira bajo el agua. |
| `assets/zonas/bazar.png` | El Gran Bazar | Mil puestos, mil tratos, y ninguno del todo honesto. |

## Muebles y decoración

| Archivo | Qué es | Categoría |
| --- | --- | --- |
| `assets/muebles/mub_taburete.png` | Taburete de madera | asientos |
| `assets/muebles/mub_banco.png` | Banco tallado | asientos |
| `assets/muebles/mub_divan.png` | Diván de terciopelo | asientos |
| `assets/muebles/mub_trono.png` | Silla del prefecto | asientos |
| `assets/muebles/mub_mesa_baja.png` | Mesa baja | mesas |
| `assets/muebles/mub_mesa_cobre.png` | Mesa de cobre | mesas |
| `assets/muebles/mub_escritorio.png` | Escritorio del escriba | mesas |
| `assets/muebles/mub_jergon.png` | Jergón | camas |
| `assets/muebles/mub_lecho.png` | Lecho con dosel | camas |
| `assets/muebles/mub_arcon.png` | Arcón de viaje | almacenaje |
| `assets/muebles/mub_estante.png` | Estantería | almacenaje |
| `assets/muebles/mub_vitrina.png` | Vitrina de curiosidades | almacenaje |
| `assets/muebles/mub_vela.png` | Candelabro | luz |
| `assets/muebles/mub_farol.png` | Farol colgante | luz |
| `assets/muebles/mub_lampara.png` | Lámpara de aceite dorada | luz |
| `assets/muebles/mub_estera.png` | Estera de junco | suelo |
| `assets/muebles/mub_alfombra.png` | Alfombra de lana | suelo |
| `assets/muebles/mub_alfombra_seda.png` | Alfombra de seda | suelo |
| `assets/muebles/mub_maceta.png` | Maceta de barro | plantas |
| `assets/muebles/mub_olivo.png` | Olivo joven | plantas |
| `assets/muebles/mub_parra.png` | Parra trepadora | plantas |
| `assets/muebles/mub_naranjo.png` | Naranjo en flor | plantas |
| `assets/muebles/mub_tapiz.png` | Tapiz bordado | pared |
| `assets/muebles/mub_mosaico.png` | Mosaico dorado | pared |
| `assets/muebles/mub_icono_pared.png` | Icono enmarcado | pared |
| `assets/muebles/mub_mapa.png` | Mapa del estrecho | pared |
| `assets/muebles/mub_anfora.png` | Ánfora pintada | temáticos |
| `assets/muebles/mub_brasero.png` | Brasero de bronce | temáticos |
| `assets/muebles/mub_columna.png` | Columna rota | temáticos |
| `assets/muebles/mub_fuente.png` | Fuente de mármol | temáticos |

## Equipo

| Archivo | Qué es | Tipo |
| --- | --- | --- |
| `assets/equipo/arma_baston.png` | Bastón de peregrino | arma |
| `assets/equipo/arma_espada_corta.png` | Espada corta | arma |
| `assets/equipo/arma_hacha.png` | Hacha de estibador | arma |
| `assets/equipo/arma_sable.png` | Sable curvo | arma |
| `assets/equipo/arma_lanza.png` | Lanza de la guardia | arma |
| `assets/equipo/arma_ceremonial.png` | Filo ceremonial | arma |
| `assets/equipo/arm_tunica.png` | Túnica basta | armadura |
| `assets/equipo/arm_cuero.png` | Coraza de cuero | armadura |
| `assets/equipo/arm_escamas.png` | Cota de escamas | armadura |
| `assets/equipo/arm_placas.png` | Placas de la muralla | armadura |
| `assets/equipo/arm_mosaico.png` | Armadura de mosaico | armadura |
| `assets/equipo/acc_amuleto.png` | Amuleto de cobre | accesorio |
| `assets/equipo/acc_anillo.png` | Anillo del mercader | accesorio |
| `assets/equipo/acc_reliquia.png` | Reliquia dorada | accesorio |
| `assets/equipo/acc_icono.png` | Icono bendecido | accesorio |

## Mascotas

| Archivo | Qué es | Cómo se gana |
| --- | --- | --- |
| `assets/mascotas/gato.png` | Gato del bazar | Dos semanas de racha de entreno |
| `assets/mascotas/paloma.png` | Paloma mensajera | Dos semanas de racha de alimentación |
| `assets/mascotas/perro.png` | Perro guardián | Derrota a tu primer jefe |
| `assets/mascotas/cabra.png` | Cabra terca | Un mes de racha de entreno |

## Resumen

| Categoría | Imágenes |
| --- | --- |
| Personaje (hojas de 3 poses) | 4 |
| Enemigos (hojas de 3 poses) | 12 |
| Fondos de zona | 3 |
| Muebles | 30 |
| Equipo | 15 |
| Mascotas | 4 |

