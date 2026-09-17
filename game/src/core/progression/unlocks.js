import {
  ZONAS,
  ESPACIOS,
  TIENDAS,
  HABILIDADES,
  ETAPAS_PERSONAJE,
  ACTIVIDADES,
  MASCOTAS,
} from '../../data/content.js';

/** Todo lo que el nivel abre, en una sola lista ordenada. */
export function calendarioDesbloqueos() {
  const entradas = [
    ...ZONAS.map((z) => ({ nivel: z.nivel, tipo: 'zona', id: z.id, nombre: z.nombre })),
    ...ESPACIOS.map((e) => ({ nivel: e.nivel, tipo: 'espacio', id: e.id, nombre: e.nombre })),
    ...TIENDAS.map((t) => ({ nivel: t.nivel, tipo: 'tienda', id: t.id, nombre: t.nombre })),
    ...ACTIVIDADES.map((a) => ({ nivel: a.nivel, tipo: 'actividad', id: a.id, nombre: a.nombre })),
    ...Object.entries(HABILIDADES).map(([id, h]) => ({
      nivel: h.nivel,
      tipo: 'habilidad',
      id,
      nombre: h.nombre,
    })),
    ...ETAPAS_PERSONAJE.filter((e) => e.nivel > 1).map((e) => ({
      nivel: e.nivel,
      tipo: 'personaje',
      id: e.id,
      nombre: 'Tu personaje cambia',
    })),
  ];

  return entradas.sort((a, b) => a.nivel - b.nivel);
}

const hastaNivel = (lista, nivel) => lista.filter((x) => x.nivel <= nivel);

export const zonasAbiertas = (nivel) => hastaNivel(ZONAS, nivel);
export const espaciosAbiertos = (nivel) => hastaNivel(ESPACIOS, nivel);
export const tiendasAbiertas = (nivel) => hastaNivel(TIENDAS, nivel);
export const actividadesAbiertas = (nivel) => hastaNivel(ACTIVIDADES, nivel);

export function habilidadesAbiertas(nivel) {
  return Object.entries(HABILIDADES)
    .filter(([, h]) => h.nivel <= nivel)
    .map(([id, h]) => ({ id, ...h }));
}

/** Última etapa alcanzada: la apariencia del personaje sigue al nivel, no al peso levantado. */
export function etapaPersonaje(nivel) {
  return ETAPAS_PERSONAJE.filter((e) => e.nivel <= nivel).pop() ?? ETAPAS_PERSONAJE[0];
}

/** Lo siguiente que llega, para que el jugador sepa hacia dónde va. */
export function proximoDesbloqueo(nivel) {
  return calendarioDesbloqueos().find((d) => d.nivel > nivel) ?? null;
}

/** Los artículos de la tienda también tienen nivel: el nivel abre, las monedas compran. */
export function articulosDisponibles(catalogo, nivel) {
  return catalogo.filter((articulo) => articulo.nivel <= nivel);
}

/**
 * Mascotas ganadas por hito. No se compran, así que acumular monedas no las acerca.
 *
 * @param {{ rachaEntreno: number, rachaComida: number, jefesDerrotados: number }} progreso
 */
export function mascotasGanadas({ rachaEntreno = 0, rachaComida = 0, jefesDerrotados = 0 }) {
  const alcanzado = {
    racha_entreno: rachaEntreno,
    racha_comida: rachaComida,
    jefes: jefesDerrotados,
  };

  return MASCOTAS.filter((m) => alcanzado[m.hito.tipo] >= m.hito.valor);
}
