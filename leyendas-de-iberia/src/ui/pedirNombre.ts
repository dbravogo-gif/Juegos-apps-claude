import { COLOR, css, FUENTE } from './tema';

/**
 * Pide el nombre con un campo de texto del navegador, encima del juego: así aparece el teclado
 * del móvil sin tener que dibujar uno.
 */
export function pedirNombre(porDefecto = 'Viajero'): Promise<string> {
  return new Promise((resolve) => {
    const capa = document.createElement('div');
    capa.style.cssText = `position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:10;padding:16px;`;
    const caja = document.createElement('form');
    caja.style.cssText = `display:flex;flex-direction:column;gap:14px;width:min(420px,100%);padding:24px;border-radius:16px;background:${css(COLOR.pergamino)};border:4px solid ${css(COLOR.tinta)};font-family:${FUENTE};color:${css(COLOR.tinta)};`;
    const etiqueta = document.createElement('label');
    etiqueta.textContent = '¿Cómo te llamas?';
    etiqueta.htmlFor = 'nombre-jugador';
    etiqueta.style.cssText = 'font-size:22px;font-weight:bold;';
    const campo = document.createElement('input');
    campo.id = 'nombre-jugador';
    campo.maxLength = 12;
    campo.autocomplete = 'off';
    campo.placeholder = porDefecto;
    campo.style.cssText = `font:20px ${FUENTE};padding:10px 12px;border-radius:10px;border:2px solid ${css(COLOR.tintaSuave)};`;
    const boton = document.createElement('button');
    boton.type = 'submit';
    boton.textContent = 'Empezar';
    boton.style.cssText = `font:bold 20px ${FUENTE};padding:12px;border-radius:10px;border:none;background:${css(COLOR.rojo)};color:${css(COLOR.pergamino)};cursor:pointer;`;
    caja.append(etiqueta, campo, boton);
    capa.append(caja);
    document.body.append(capa);
    campo.focus();
    caja.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = campo.value.trim().slice(0, 12) || porDefecto;
      capa.remove();
      resolve(nombre);
    });
  });
}
