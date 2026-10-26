import type { Criatura } from './modelo';
import type { Partida } from './partida';
import { VERSION_PARTIDA } from './partida';
import { enPaginas } from './almacen';

// Cada cambio en la forma de la partida sube VERSION_PARTIDA y añade aquí su migración, para
// que las partidas guardadas sigan abriéndose.
const MIGRACIONES: Record<number, (p: Record<string, unknown>) => Record<string, unknown>> = {
  // v2: repelentes y recipientes registrados.
  1: (p) => ({ ...p, repelente: 0, revisados: [] }),
  // v3: el almacén pasa de una lista a páginas de 30 huecos.
  2: ({ almacen, ...p }) => ({ ...p, paginas: enPaginas((almacen as Criatura[] | undefined) ?? []) }),
};

export function serializar(p: Partida): string {
  return JSON.stringify(p);
}

/** Lee una partida guardada. Devuelve `null` si el texto no es una partida válida. */
export function deserializar(texto: string): Partida | null {
  let datos: Record<string, unknown>;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!datos || typeof datos !== 'object' || typeof datos.version !== 'number') return null;
  let version = datos.version;
  while (version < VERSION_PARTIDA) {
    const migrar = MIGRACIONES[version];
    if (!migrar) return null;
    datos = migrar(datos);
    version += 1;
    datos.version = version;
  }
  if (version > VERSION_PARTIDA) return null;
  const p = datos as unknown as Partida;
  const valida =
    typeof p.nombre === 'string' &&
    Array.isArray(p.equipo) &&
    Array.isArray(p.paginas) &&
    p.posicion !== undefined &&
    typeof p.posicion.zona === 'string' &&
    Array.isArray(p.rng?.s);
  return valida ? p : null;
}
