// Bus de eventos entre subsistemas. Los nombres y sus datos son los de la tabla de
// ARCHITECTURE.md: un evento nuevo se añade aquí y allí en el mismo commit.

import type { NivelCalidad } from './calidad';

export interface MapaEventos {
  'zona:entrar': { zonaId: string };
  'encuentro:inicio': { salvajes: unknown[]; visible: boolean };
  'combate:evento': unknown;
  /** Una acción del jugador para un hueco (`Accion` de src/core/combate.ts, con su objetivo). */
  'combate:decision': { lado: number; hueco: number; accion: unknown };
  'combate:fin': { resultado: string };
  'captura:lanzar': { calidad: number };
  'captura:resultado': { exito: boolean; sacudidas: number };
  'dialogo:abrir': { guionId: string };
  'dialogo:cerrar': { guionId: string; eleccion?: number };
  'guardado:hecho': Record<string, never>;
  'calidad:cambio': { nivel: NivelCalidad };
  /** Un texto para el jugador (aviso de paso cerrado, frase, objeto); se cierra con confirmar. */
  'aviso:mostrar': { texto: string };
  'aviso:cerrar': Record<string, never>;
  'objeto:recogido': { id: string; objeto: string };
}

export type NombreEvento = keyof MapaEventos;
type Oyente<E extends NombreEvento> = (datos: MapaEventos[E]) => void;

export class Eventos {
  private oyentes = new Map<NombreEvento, Set<Oyente<never>>>();

  /** Se suscribe a un evento. Devuelve la función que anula la suscripción. */
  on<E extends NombreEvento>(evento: E, oyente: Oyente<E>): () => void {
    let conjunto = this.oyentes.get(evento);
    if (!conjunto) {
      conjunto = new Set();
      this.oyentes.set(evento, conjunto);
    }
    conjunto.add(oyente as Oyente<never>);
    return () => conjunto.delete(oyente as Oyente<never>);
  }

  emit<E extends NombreEvento>(evento: E, datos: MapaEventos[E]): void {
    const conjunto = this.oyentes.get(evento);
    if (!conjunto) return;
    for (const oyente of [...conjunto]) (oyente as Oyente<E>)(datos);
  }

  limpiar(): void {
    this.oyentes.clear();
  }
}
