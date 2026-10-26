import { COLOR, css, FUENTE } from './tema';

/**
 * Pide el nombre con un campo de texto del navegador, encima del juego: así aparece el teclado
 * del móvil sin tener que dibujar uno.
 */
export function pedirNombre(porDefecto = 'Viajero', pregunta = '¿Cómo te llamas?', textoBoton = 'Empezar'): Promise<string> {
  return new Promise((resolve) => {
    const capa = document.createElement('div');
    capa.style.cssText = `position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:10;padding:16px;`;
    const caja = document.createElement('form');
    caja.style.cssText = `display:flex;flex-direction:column;gap:14px;width:min(420px,100%);padding:24px;border-radius:24px;background:${css(COLOR.panel)};box-shadow:0 10px 30px rgba(0,0,0,0.35);font-family:${FUENTE};color:${css(COLOR.tinta)};`;
    const etiqueta = document.createElement('label');
    etiqueta.textContent = pregunta;
    etiqueta.htmlFor = 'nombre-jugador';
    etiqueta.style.cssText = 'font-size:22px;font-weight:900;';
    const campo = document.createElement('input');
    campo.id = 'nombre-jugador';
    campo.maxLength = 12;
    campo.autocomplete = 'off';
    campo.placeholder = porDefecto;
    campo.style.cssText = `font:700 20px ${FUENTE};padding:12px 14px;border-radius:14px;border:2px solid ${css(COLOR.borde)};background:${css(COLOR.panelSuave)};`;
    // El juego escucha el teclado en toda la ventana y se queda con algunas teclas (W, A, S, D,
    // Mayúsculas) y reacciona a otras (M, Z, X): sin esto, esas letras no se podrían escribir.
    for (const tipo of ['keydown', 'keyup', 'keypress'] as const) campo.addEventListener(tipo, (e) => e.stopPropagation());
    const boton = document.createElement('button');
    boton.type = 'submit';
    boton.textContent = textoBoton;
    boton.style.cssText = `font:900 20px ${FUENTE};padding:14px;border-radius:999px;border:none;background:${css(COLOR.rojo)};color:${css(COLOR.panel)};box-shadow:0 5px 0 #b02436;cursor:pointer;`;
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
