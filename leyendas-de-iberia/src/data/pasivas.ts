import type { Pasiva } from '../core/modelo';

// Pasivas: una por especie (`pasiva` en especies.ts), y varias especies pueden compartirla. Los
// efectos son los de las habilidades de los juegos del género, con nombres propios. Las que no
// lleva todavía ninguna criatura quedan listas para los capítulos siguientes.

/** Lo que puede encontrar una criatura con Rebuscar, con su peso. */
const OBJETOS_REBUSCAR: { objeto: string; peso: number }[] = [
  { objeto: 'unguento', peso: 30 },
  { objeto: 'tesera', peso: 25 },
  { objeto: 'ruda', peso: 15 },
  { objeto: 'sales', peso: 10 },
  { objeto: 'aloe', peso: 10 },
  { objeto: 'emplasto', peso: 7 },
  { objeto: 'turron', peso: 3 },
];

const lista: Pasiva[] = [
  // En apuros: con un tercio de la Vida o menos, sus ataques de un tipo pegan más.
  { id: 'brasa_viva', nombre: 'Brasa viva', descripcion: 'Con poca Vida, sus ataques de tipo Infernal pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'infernal' } },
  { id: 'marea_viva', nombre: 'Marea viva', descripcion: 'Con poca Vida, sus ataques de tipo Agua pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'agua' } },
  { id: 'savia_viva', nombre: 'Savia viva', descripcion: 'Con poca Vida, sus ataques de tipo Planta pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'planta' } },
  { id: 'ventarron', nombre: 'Ventarrón', descripcion: 'Con poca Vida, sus ataques de tipo Aire pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'aire' } },
  { id: 'tierra_brava', nombre: 'Tierra brava', descripcion: 'Con poca Vida, sus ataques de tipo Tierra pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'tierra' } },
  { id: 'hora_bruja', nombre: 'Hora bruja', descripcion: 'Con poca Vida, sus ataques de tipo Oscuridad pegan un 50 % más.', efecto: { tipo: 'apuro', tipoMov: 'oscuridad' } },

  // Absorben un tipo: no les hace nada y además les sirve.
  { id: 'esponja', nombre: 'Esponja', descripcion: 'Los ataques de tipo Agua no le hacen daño: le curan una cuarta parte de la Vida.', efecto: { tipo: 'absorber', tipoMov: 'agua', ganancia: 'curar' } },
  { id: 'imantado', nombre: 'Imantado', descripcion: 'Los ataques de tipo Eléctrico no le hacen daño: le curan una cuarta parte de la Vida.', efecto: { tipo: 'absorber', tipoMov: 'electrico', ganancia: 'curar' } },
  { id: 'brasero', nombre: 'Brasero', descripcion: 'Los ataques de tipo Infernal no le hacen daño: avivan los suyos, que pegan un 50 % más.', efecto: { tipo: 'absorber', tipoMov: 'infernal', ganancia: 'avivar' } },
  { id: 'rumiante', nombre: 'Rumiante', descripcion: 'Los ataques de tipo Planta no le hacen daño: se los come y le sube la Fuerza.', efecto: { tipo: 'absorber', tipoMov: 'planta', ganancia: 'fuerza' } },
  { id: 'ingravido', nombre: 'Ingrávido', descripcion: 'Flota: los ataques de tipo Tierra no le hacen nada.', efecto: { tipo: 'inmuneTipo', tipoMov: 'tierra' } },

  // Inmunes a un estado.
  { id: 'duermevela', nombre: 'Duermevela', descripcion: 'Nunca se duerme.', efecto: { tipo: 'inmuneEstado', estados: ['dormido'] } },
  { id: 'contraveneno', nombre: 'Contraveneno', descripcion: 'Nunca se envenena.', efecto: { tipo: 'inmuneEstado', estados: ['envenenado', 'intoxicado'] } },
  { id: 'flexible', nombre: 'Flexible', descripcion: 'Nunca se paraliza.', efecto: { tipo: 'inmuneEstado', estados: ['paralizado'] } },
  { id: 'piel_humeda', nombre: 'Piel húmeda', descripcion: 'Nunca se quema.', efecto: { tipo: 'inmuneEstado', estados: ['quemado'] } },
  { id: 'cabeza_fria', nombre: 'Cabeza fría', descripcion: 'Nunca monta en cólera.', efecto: { tipo: 'inmuneEstado', estados: ['colera'] } },
  { id: 'ojos_de_lince', nombre: 'Ojos de lince', descripcion: 'Nunca queda cegado.', efecto: { tipo: 'inmuneEstado', estados: ['cegado'] } },
  { id: 'temple', nombre: 'Temple', descripcion: 'Nunca retrocede.', efecto: { tipo: 'inmuneEstado', estados: ['retroceso'] } },

  // Al recibir un ataque físico (de contacto).
  { id: 'chispas', nombre: 'Chispas', descripcion: 'Quien le golpea con un ataque físico puede quedar paralizado (30 %).', efecto: { tipo: 'contacto', estados: ['paralizado'], prob: 30 } },
  { id: 'puas_venenosas', nombre: 'Púas venenosas', descripcion: 'Quien le golpea con un ataque físico puede envenenarse (30 %).', efecto: { tipo: 'contacto', estados: ['envenenado'], prob: 30 } },
  { id: 'rescoldos', nombre: 'Rescoldos', descripcion: 'Quien le golpea con un ataque físico puede quemarse (30 %).', efecto: { tipo: 'contacto', estados: ['quemado'], prob: 30 } },
  { id: 'polen_narcotico', nombre: 'Polen narcótico', descripcion: 'Quien le golpea con un ataque físico puede dormirse, paralizarse o envenenarse (30 %).', efecto: { tipo: 'contacto', estados: ['dormido', 'paralizado', 'envenenado'], prob: 30 } },
  // Cegadoras: solo para criaturas de tipo Luz u Oscuridad (decisión del autor).
  { id: 'deslumbrante', nombre: 'Deslumbrante', descripcion: 'Brilla tanto que quien le golpea con un ataque físico puede quedar cegado (30 %).', efecto: { tipo: 'contacto', estados: ['cegado'], prob: 30 } },
  { id: 'tinieblas', nombre: 'Tinieblas', descripcion: 'Sus ataques pueden dejar cegado al rival (10 %).', efecto: { tipo: 'ataqueCegador', prob: 10 } },
  { id: 'piel_aspera', nombre: 'Piel áspera', descripcion: 'Quien le golpea con un ataque físico pierde 1/8 de su Vida.', efecto: { tipo: 'pielAspera' } },

  // Más daño.
  { id: 'coraje', nombre: 'Coraje', descripcion: 'Con un estado alterado, su Fuerza sube un 50 % (y la quemadura no se la baja).', efecto: { tipo: 'coraje' } },
  { id: 'tecnica', nombre: 'Técnica', descripcion: 'Sus ataques de poder 60 o menos pegan un 50 % más.', efecto: { tipo: 'tecnica' } },
  { id: 'afinidad', nombre: 'Afinidad', descripcion: 'Los ataques de su propio tipo pegan el doble en vez de un 50 % más.', efecto: { tipo: 'afinidad' } },
  { id: 'celos', nombre: 'Celos', descripcion: 'Pega un 25 % más a los de su mismo sexo y un 25 % menos a los del contrario.', efecto: { tipo: 'celos' } },
  { id: 'punteria', nombre: 'Puntería', descripcion: 'Sus golpes críticos hacen todavía más daño.', efecto: { tipo: 'punteria' } },
  { id: 'buena_estrella', nombre: 'Buena estrella', descripcion: 'Da golpes críticos el doble de a menudo.', efecto: { tipo: 'buenaEstrella' } },
  { id: 'ojo_avizor', nombre: 'Ojo avizor', descripcion: 'Sus ataques aciertan más (un 30 %).', efecto: { tipo: 'ojoAvizor' } },
  { id: 'bendicion', nombre: 'Bendición', descripcion: 'Los efectos añadidos de sus ataques salen el doble de a menudo.', efecto: { tipo: 'bendicion' } },
  { id: 'corpulencia', nombre: 'Corpulencia', descripcion: 'Su Fuerza es un 30 % mayor.', efecto: { tipo: 'corpulencia' } },
  { id: 'hedor', nombre: 'Hedor', descripcion: 'Sus ataques pueden hacer retroceder al rival (10 %).', efecto: { tipo: 'hedor' } },

  // Menos daño.
  { id: 'sebo', nombre: 'Sebo', descripcion: 'Los ataques de tipo Infernal y Hielo le hacen la mitad.', efecto: { tipo: 'resistir', tipos: ['infernal', 'hielo'] } },
  { id: 'ignifugo', nombre: 'Ignífugo', descripcion: 'Los ataques de tipo Infernal le hacen la mitad.', efecto: { tipo: 'resistir', tipos: ['infernal'] } },
  { id: 'coraza', nombre: 'Coraza', descripcion: 'Los ataques supereficaces le hacen un 25 % menos.', efecto: { tipo: 'coraza' } },
  { id: 'escamas', nombre: 'Escamas', descripcion: 'Con la Vida llena, recibe la mitad de daño.', efecto: { tipo: 'escamas' } },
  { id: 'firme', nombre: 'Firme', descripcion: 'Con la Vida llena, aguanta con 1 cualquier golpe que lo debilitaría.', efecto: { tipo: 'firme' } },
  { id: 'caparazon', nombre: 'Caparazón', descripcion: 'No recibe golpes críticos.', efecto: { tipo: 'caparazon' } },

  // Estadísticas.
  { id: 'mirada_torva', nombre: 'Mirada torva', descripcion: 'Al salir al combate, baja la Fuerza del rival.', efecto: { tipo: 'intimidar' } },
  { id: 'petreo', nombre: 'Pétreo', descripcion: 'Los rivales no pueden bajarle las estadísticas.', efecto: { tipo: 'petreo' } },
  { id: 'garras_duras', nombre: 'Garras duras', descripcion: 'Los rivales no pueden bajarle la Fuerza.', efecto: { tipo: 'garrasDuras' } },
  { id: 'carrerilla', nombre: 'Carrerilla', descripcion: 'Al final de cada turno, su Celeridad sube.', efecto: { tipo: 'carrerilla' } },
  { id: 'pies_ligeros', nombre: 'Pies ligeros', descripcion: 'Con un estado alterado, su Celeridad sube un 50 % (y la parálisis no se la baja).', efecto: { tipo: 'piesLigeros' } },

  // Al final del turno o al retirarse.
  { id: 'muda', nombre: 'Muda', descripcion: 'Al final de cada turno, puede curarse de su estado alterado (un tercio de las veces).', efecto: { tipo: 'muda' } },
  { id: 'reposo', nombre: 'Reposo', descripcion: 'Al retirarse del combate, se cura de su estado alterado.', efecto: { tipo: 'reposo' } },
  { id: 'brote', nombre: 'Brote', descripcion: 'Al retirarse del combate, recupera un tercio de su Vida.', efecto: { tipo: 'brote' } },
  { id: 'espejo', nombre: 'Espejo', descripcion: 'Si le queman, le paralizan o le envenenan, el rival sufre lo mismo.', efecto: { tipo: 'espejo' } },
  { id: 'imponente', nombre: 'Imponente', descripcion: 'Los rivales gastan el doble de PP al atacarle.', efecto: { tipo: 'imponente' } },

  // Fuera del combate.
  { id: 'escurridizo', nombre: 'Escurridizo', descripcion: 'Siempre consigue huir de las criaturas salvajes.', efecto: { tipo: 'escurridizo' } },
  { id: 'rebuscar', nombre: 'Rebuscar', descripcion: 'Al acabar un combate, a veces encuentra un objeto (10 %).', efecto: { tipo: 'rebuscar', prob: 10, objetos: OBJETOS_REBUSCAR } },
];

export const PASIVAS: Record<string, Pasiva> = Object.fromEntries(lista.map((p) => [p.id, p]));
