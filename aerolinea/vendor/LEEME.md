# Dependencias incluidas

Copiadas de npm para que el juego funcione sin conexión y sin paso de build.

| Fichero | Paquete | Licencia |
| --- | --- | --- |
| `d3-array.min.js` | d3-array 3.2.4 | ISC, Mike Bostock |
| `d3-geo.min.js` | d3-geo 3.1.1 | ISC, Mike Bostock (incluye código de Charles Karney, MIT) |
| `topojson-client.min.js` | topojson-client 3.1.0 | ISC, Mike Bostock |
| `land-110m.json`, `land-50m.json`, `countries-110m.json` | world-atlas 2.0.2 | ISC, Mike Bostock. Datos de Natural Earth, dominio público |

`land-50m` se usa con zoom porque es la única resolución en la que aparecen todas las islas
Canarias. `land-110m` se usa al arrastrar el globo, para que vaya fluido.
