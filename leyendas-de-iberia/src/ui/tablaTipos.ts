import Phaser from 'phaser';
import { resumenTipo } from '../core/tipos';
import { DATOS } from '../data';
import { Boton, panel } from './componentes';
import { aclarar, ANCHO, COLOR, estiloTexto } from './tema';

// Consulta de la tabla de tipos: una rejilla con los 15 tipos y, debajo, qué hace el elegido al
// atacar y qué le hacen al defenderse. Se usa desde el menú del mapa y desde el combate.

const nombreTipo = (id: string) => DATOS.tipos.tipos.find((t) => t.id === id)?.nombre ?? id;
const ALTO_DETALLE = 440;
const lista = (ids: string[]) => (ids.length ? ids.map(nombreTipo).join(', ') : 'ninguno');

/** Texto de multiplicador: ×4, ×2, ×½, ×¼ o ×0. */
export function textoMultiplicador(m: number): string {
  if (m === 0.5) return '×½';
  if (m === 0.25) return '×¼';
  return `×${m}`;
}

/**
 * Dibuja la tabla en `c`, ocupando desde `y0` hacia abajo. Devuelve la altura usada. Tocar un
 * tipo cambia el detalle sin redibujar la rejilla.
 */
export function construirTablaTipos(scene: Phaser.Scene, c: Phaser.GameObjects.Container, y0: number, tipoInicial = 'comun'): number {
  const tipos = DATOS.tipos.tipos;
  const columnas = 3;
  const anchoBoton = 320;
  const altoBoton = 84;
  const filas = Math.ceil(tipos.length / columnas);
  const botones: Boton[] = [];
  const yDetalle = y0 + filas * (altoBoton + 14) + 20;
  c.add(panel(scene, 30, yDetalle, ANCHO - 60, ALTO_DETALLE));
  const detalle = scene.add.text(70, yDetalle + 30, '', {
    ...estiloTexto(30, COLOR.tinta),
    wordWrap: { width: ANCHO - 140 },
    lineSpacing: 8,
  });
  c.add(detalle);

  const elegir = (id: string) => {
    const r = resumenTipo(DATOS.tipos, id);
    detalle.setText(
      [
        `${nombreTipo(id)} al atacar`,
        `  Muy eficaz (×2) contra: ${lista(r.ataque.eficaz)}`,
        `  Poco eficaz (×½) contra: ${lista(r.ataque.pocoEficaz)}`,
        `  No afecta a: ${lista(r.ataque.sinEfecto)}`,
        '',
        `${nombreTipo(id)} al defenderse`,
        `  Le hacen mucho daño (×2): ${lista(r.defensa.debil)}`,
        `  Resiste (×½): ${lista(r.defensa.resiste)}`,
        `  Inmune a: ${lista(r.defensa.inmune)}`,
      ].join('\n'),
    );
    tipos.forEach((t, i) => botones[i].setScale(t.id === id ? 1.06 : 1).setAlpha(t.id === id ? 1 : 0.8));
  };

  tipos.forEach((t, i) => {
    const x = ANCHO / 2 + ((i % columnas) - 1) * (anchoBoton + 20);
    const y = y0 + Math.floor(i / columnas) * (altoBoton + 14) + altoBoton / 2;
    const b = new Boton(scene, x, y, {
      ancho: anchoBoton,
      alto: altoBoton,
      texto: t.nombre,
      tamano: 34,
      color: aclarar(t.color, 0.15),
      alPulsar: () => elegir(t.id),
    });
    botones.push(b);
    c.add(b);
  });
  elegir(tipoInicial);
  return yDetalle + ALTO_DETALLE - y0;
}
