// Catálogo de contenido del juego. Datos puros: ninguna regla vive aquí.
// Ambientación: Constantinopla como base estética, con libertad fantástica.

export const ZONAS = [
  {
    id: 'murallas',
    nombre: 'Las Murallas',
    nivel: 1,
    descripcion: 'Piedra vieja y hiedra. Lo que se cuela por las grietas.',
    enemigos: ['rata_murallas', 'bandido_harapiento', 'gargola_agrietada'],
    jefe: 'guardian_puerta',
  },
  {
    id: 'puerto',
    nombre: 'El Puerto',
    nivel: 5,
    descripcion: 'Cuerdas, sal y algo que respira bajo el agua.',
    enemigos: ['cangrejo_coloso', 'marinero_espectral', 'anguila_abisal'],
    jefe: 'bestia_cuerno',
  },
  {
    id: 'bazar',
    nombre: 'El Gran Bazar',
    nivel: 10,
    descripcion: 'Mil puestos, mil tratos, y ninguno del todo honesto.',
    enemigos: ['ladron_bazar', 'automata_especias', 'serpiente_seda'],
    jefe: 'el_coleccionista',
  },
];

/** `patron` decide el comportamiento en combate: ver `src/core/combat/battle.js`. */
export const ENEMIGOS = {
  rata_murallas: { nombre: 'Rata de las murallas', vida: 14, ataque: 4, defensa: 1, patron: 'agresivo' },
  bandido_harapiento: { nombre: 'Bandido harapiento', vida: 17, ataque: 4, defensa: 1, patron: 'cauto' },
  gargola_agrietada: { nombre: 'Gárgola agrietada', vida: 24, ataque: 4, defensa: 2, patron: 'defensivo' },
  guardian_puerta: { nombre: 'Guardián de la Puerta Dorada', vida: 60, ataque: 10, defensa: 4, patron: 'jefe', jefe: true },

  cangrejo_coloso: { nombre: 'Cangrejo coloso', vida: 50, ataque: 11, defensa: 5, patron: 'defensivo' },
  marinero_espectral: { nombre: 'Marinero espectral', vida: 45, ataque: 15, defensa: 3, patron: 'agresivo' },
  anguila_abisal: { nombre: 'Anguila abisal', vida: 48, ataque: 13, defensa: 5, patron: 'cauto' },
  bestia_cuerno: { nombre: 'Bestia del Cuerno de Oro', vida: 95, ataque: 18, defensa: 8, patron: 'jefe', jefe: true },

  ladron_bazar: { nombre: 'Ladrón del bazar', vida: 110, ataque: 32, defensa: 14, patron: 'agresivo' },
  automata_especias: { nombre: 'Autómata de especias', vida: 125, ataque: 26, defensa: 18, patron: 'defensivo' },
  serpiente_seda: { nombre: 'Serpiente de seda', vida: 115, ataque: 34, defensa: 12, patron: 'cauto' },
  el_coleccionista: { nombre: 'El Coleccionista', vida: 200, ataque: 38, defensa: 20, patron: 'jefe', jefe: true },
};

export const HABILIDADES = {
  embestida: { nombre: 'Embestida', nivel: 2, energia: 3, multiplicador: 1.8, descripcion: 'Un golpe fuerte que gasta energía.' },
  guardia_ferrea: { nombre: 'Guardia férrea', nivel: 9, energia: 2, defensaExtra: 12, descripcion: 'Aguanta el siguiente golpe casi entero.' },
  tajo_doble: { nombre: 'Tajo doble', nivel: 15, energia: 5, multiplicador: 1.1, golpes: 2, descripcion: 'Dos cortes seguidos.' },
};

export const EQUIPO = [
  // La progresión sube por tramos, no doblando: si cada pieza valiera el doble que la
  // anterior, comprar sería lo único que importa y subir de nivel dejaría de contar.
  { id: 'arma_baston', nombre: 'Bastón de peregrino', tipo: 'arma', fuerza: 4, precio: 150, nivel: 4 },
  { id: 'arma_espada_corta', nombre: 'Espada corta', tipo: 'arma', fuerza: 8, precio: 420, nivel: 4 },
  { id: 'arma_hacha', nombre: 'Hacha de estibador', tipo: 'arma', fuerza: 14, precio: 900, nivel: 7 },
  { id: 'arma_sable', nombre: 'Sable curvo', tipo: 'arma', fuerza: 22, precio: 1600, nivel: 10 },
  { id: 'arma_lanza', nombre: 'Lanza de la guardia', tipo: 'arma', fuerza: 32, precio: 2600, nivel: 14 },
  { id: 'arma_ceremonial', nombre: 'Filo ceremonial', tipo: 'arma', fuerza: 44, precio: 4200, nivel: 18 },

  { id: 'arm_tunica', nombre: 'Túnica basta', tipo: 'armadura', vida: 20, precio: 140, nivel: 4 },
  { id: 'arm_cuero', nombre: 'Coraza de cuero', tipo: 'armadura', vida: 40, precio: 400, nivel: 6 },
  { id: 'arm_escamas', nombre: 'Cota de escamas', tipo: 'armadura', vida: 70, precio: 1100, nivel: 9 },
  { id: 'arm_placas', nombre: 'Placas de la muralla', tipo: 'armadura', vida: 110, precio: 2200, nivel: 13 },
  { id: 'arm_mosaico', nombre: 'Armadura de mosaico', tipo: 'armadura', vida: 160, precio: 3800, nivel: 17 },

  { id: 'acc_amuleto', nombre: 'Amuleto de cobre', tipo: 'accesorio', fuerza: 2, vida: 15, precio: 300, nivel: 9 },
  { id: 'acc_anillo', nombre: 'Anillo del mercader', tipo: 'accesorio', fuerza: 4, vida: 30, precio: 700, nivel: 9 },
  { id: 'acc_reliquia', nombre: 'Reliquia dorada', tipo: 'accesorio', fuerza: 7, vida: 55, precio: 1800, nivel: 12 },
  { id: 'acc_icono', nombre: 'Icono bendecido', tipo: 'accesorio', fuerza: 11, vida: 85, precio: 3200, nivel: 16 },
];

export const MUEBLES = [
  { id: 'mub_taburete', nombre: 'Taburete de madera', categoria: 'asientos', precio: 80, nivel: 1 },
  { id: 'mub_banco', nombre: 'Banco tallado', categoria: 'asientos', precio: 180, nivel: 1 },
  { id: 'mub_divan', nombre: 'Diván de terciopelo', categoria: 'asientos', precio: 480, nivel: 3 },
  { id: 'mub_trono', nombre: 'Silla del prefecto', categoria: 'asientos', precio: 850, nivel: 8 },

  { id: 'mub_mesa_baja', nombre: 'Mesa baja', categoria: 'mesas', precio: 120, nivel: 1 },
  { id: 'mub_mesa_cobre', nombre: 'Mesa de cobre', categoria: 'mesas', precio: 380, nivel: 3 },
  { id: 'mub_escritorio', nombre: 'Escritorio del escriba', categoria: 'mesas', precio: 640, nivel: 8 },

  { id: 'mub_jergon', nombre: 'Jergón', categoria: 'camas', precio: 150, nivel: 3 },
  { id: 'mub_lecho', nombre: 'Lecho con dosel', categoria: 'camas', precio: 720, nivel: 3 },

  { id: 'mub_arcon', nombre: 'Arcón de viaje', categoria: 'almacenaje', precio: 160, nivel: 1 },
  { id: 'mub_estante', nombre: 'Estantería', categoria: 'almacenaje', precio: 260, nivel: 3 },
  { id: 'mub_vitrina', nombre: 'Vitrina de curiosidades', categoria: 'almacenaje', precio: 700, nivel: 8 },

  { id: 'mub_vela', nombre: 'Candelabro', categoria: 'luz', precio: 90, nivel: 1 },
  { id: 'mub_farol', nombre: 'Farol colgante', categoria: 'luz', precio: 220, nivel: 3 },
  { id: 'mub_lampara', nombre: 'Lámpara de aceite dorada', categoria: 'luz', precio: 540, nivel: 8 },

  { id: 'mub_estera', nombre: 'Estera de junco', categoria: 'suelo', precio: 70, nivel: 1 },
  { id: 'mub_alfombra', nombre: 'Alfombra de lana', categoria: 'suelo', precio: 250, nivel: 3 },
  { id: 'mub_alfombra_seda', nombre: 'Alfombra de seda', categoria: 'suelo', precio: 780, nivel: 8 },

  { id: 'mub_maceta', nombre: 'Maceta de barro', categoria: 'plantas', precio: 60, nivel: 1 },
  { id: 'mub_olivo', nombre: 'Olivo joven', categoria: 'plantas', precio: 200, nivel: 6 },
  { id: 'mub_parra', nombre: 'Parra trepadora', categoria: 'plantas', precio: 340, nivel: 6 },
  { id: 'mub_naranjo', nombre: 'Naranjo en flor', categoria: 'plantas', precio: 560, nivel: 6 },

  { id: 'mub_tapiz', nombre: 'Tapiz bordado', categoria: 'pared', precio: 210, nivel: 3 },
  { id: 'mub_mosaico', nombre: 'Mosaico dorado', categoria: 'pared', precio: 620, nivel: 3 },
  { id: 'mub_icono_pared', nombre: 'Icono enmarcado', categoria: 'pared', precio: 430, nivel: 3 },
  { id: 'mub_mapa', nombre: 'Mapa del estrecho', categoria: 'pared', precio: 290, nivel: 8 },

  { id: 'mub_anfora', nombre: 'Ánfora pintada', categoria: 'temáticos', precio: 240, nivel: 1 },
  { id: 'mub_brasero', nombre: 'Brasero de bronce', categoria: 'temáticos', precio: 460, nivel: 6 },
  { id: 'mub_columna', nombre: 'Columna rota', categoria: 'temáticos', precio: 680, nivel: 8 },
  { id: 'mub_fuente', nombre: 'Fuente de mármol', categoria: 'temáticos', precio: 1400, nivel: 12 },
];

/** Las mascotas se ganan por hito, nunca se compran: son el premio que no se puede acumular. */
export const MASCOTAS = [
  { id: 'gato', nombre: 'Gato del bazar', hito: { tipo: 'racha_entreno', valor: 14 }, pista: 'Dos semanas de racha de entreno' },
  { id: 'paloma', nombre: 'Paloma mensajera', hito: { tipo: 'racha_comida', valor: 14 }, pista: 'Dos semanas de racha de alimentación' },
  { id: 'perro', nombre: 'Perro guardián', hito: { tipo: 'jefes', valor: 1 }, pista: 'Derrota a tu primer jefe' },
  { id: 'cabra', nombre: 'Cabra terca', hito: { tipo: 'racha_entreno', valor: 30 }, pista: 'Un mes de racha de entreno' },
];

export const ESPACIOS = [
  { id: 'patio', nombre: 'El patio', nivel: 1, casillas: 12 },
  { id: 'habitacion', nombre: 'La habitación', nivel: 3, casillas: 12 },
  { id: 'huerto', nombre: 'El huerto', nivel: 6, casillas: 16 },
  { id: 'taller', nombre: 'El taller', nivel: 8, casillas: 16 },
  { id: 'terraza', nombre: 'La terraza', nivel: 12, casillas: 20 },
];

export const TIENDAS = [
  { id: 'mercader', nombre: 'Mercader', nivel: 1, vende: 'muebles' },
  { id: 'herrero', nombre: 'Herrero', nivel: 4, vende: 'equipo' },
];

/** Etapa visual del personaje. Va con el nivel, que sale de la constancia. */
export const ETAPAS_PERSONAJE = [
  { nivel: 1, id: 'etapa1' },
  { nivel: 5, id: 'etapa2' },
  { nivel: 10, id: 'etapa3' },
  { nivel: 15, id: 'etapa4' },
];

export const ACTIVIDADES = [
  { id: 'talar', nombre: 'Cortar leña', nivel: 1, xp: 12, monedas: 8 },
  { id: 'pescar', nombre: 'Pescar en el puerto', nivel: 5, xp: 16, monedas: 11 },
  { id: 'cultivar', nombre: 'Cuidar el huerto', nivel: 6, xp: 18, monedas: 12 },
  { id: 'cocinar', nombre: 'Cocinar', nivel: 8, xp: 20, monedas: 14 },
];
