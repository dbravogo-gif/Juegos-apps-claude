// Colas de las aerolíneas: los colores de la compañía real en la que se inspira cada una y un
// logo parecido, con el guiño del nombre (un tulipán para Tulipair, una huella para Depie Air).
// Se dibujan en una caja de 40 × 40 recortada con la forma de la deriva.

const DERIVA = 'M3,39 L21,3 L35,3 L30,39 Z';

// Cada cola: fondo y, encima, el dibujo del logo. Todo queda recortado por la deriva.
const COLAS = {
  castilla: { fondo: '#d4202c', logo: `<path d="M0,30 L40,22 L40,28 L0,36 Z" fill="#f6c400"/>
    <path d="M16,18 l2,-6 l3,4 l3,-6 l3,6 l3,-4 l2,6 Z" fill="#f6c400"/><rect x="16" y="18" width="16" height="2.5" fill="#f6c400"/>` },
  aviacutre: { fondo: '#16336e', logo: `<path d="M17,30 L25,8 L28,8 L36,30 L32,30 L26.5,13 L21,30 Z" fill="#fff"/><path d="M0,34 L40,30 L40,33 L0,37 Z" fill="#e1251b"/>` },
  espantax: { fondo: '#ffffff', logo: `<path d="M0,26 L40,14 L40,20 L0,32 Z" fill="#1b3f8f"/><path d="M0,33 L40,21 L40,24 L0,36 Z" fill="#d8262e"/>` },
  lager: { fondo: '#ffffff', logo: `<path d="M0,24 L40,4 L40,12 L0,32 Z" fill="#d22630"/><path d="M0,33 L40,13 L40,17 L0,37 Z" fill="#1a1a1a"/>` },
  britanica: { fondo: '#1b2f6b', logo: `<path d="M14,6 L40,40 M40,6 L14,40" stroke="#fff" stroke-width="5"/><path d="M14,6 L40,40 M40,6 L14,40" stroke="#c8102e" stroke-width="2"/>
    <path d="M27,0 V40 M10,22 H40" stroke="#fff" stroke-width="7"/><path d="M27,0 V40 M10,22 H40" stroke="#c8102e" stroke-width="4"/>` },
  toallair: { fondo: '#ffc72c', logo: `<path d="M15,22 Q21,14 26,19 Q30,12 36,13 Q31,17 30,22 Q26,20 23,24 Q19,20 15,22 Z" fill="#1d1d1b"/>` },
  naftansa: { fondo: '#0b1e4d', logo: `<circle cx="23" cy="19" r="7.5" fill="#f9b000"/><path d="M17.5,21 Q21,14 24.5,18.5 Q26.5,14 29,15 Q25.5,17.5 25.5,21 Q23,19.5 21.5,23 Z" fill="#0b1e4d"/>` },
  croissair: { fondo: '#ffffff', logo: `<path d="M24,0 L40,0 L40,40 L14,40 Z" fill="#002395"/><path d="M28,0 L40,0 L40,40 L22,40 Z" fill="#ffffff"/><path d="M32,0 L40,0 L40,40 L29,40 Z" fill="#ed2939"/>` },
  sos: { fondo: '#ffffff', logo: `<text x="27" y="26" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="#0b2a7a" text-anchor="middle">S</text>
    <rect x="0" y="31" width="40" height="2.5" fill="#c8102e"/><rect x="0" y="33.5" width="40" height="2.5" fill="#f2b705"/><rect x="0" y="36" width="40" height="2.5" fill="#0b2a7a"/>` },
  pastalia: { fondo: '#00843d', logo: `<path d="M14,38 L22,6 L26,6 L34,38 L28,38 L24,20 L20,38 Z" fill="#fff"/><path d="M22.5,14 L25.5,14 L29,38 L27,38 Z" fill="#ce2b37"/>` },
  tulipair: { fondo: '#00a1de', logo: `<path d="M24,31 L24,22" stroke="#fff" stroke-width="1.6"/><path d="M24,25 Q18,25 18,16 L21,19 L24,13 L27,19 L30,16 Q30,25 24,25 Z" fill="#fff"/>
    <path d="M24,30 Q20,27 18,28 Q21,31 24,31 Z" fill="#fff"/>` },
  breadam: { fondo: '#ffffff', logo: `<circle cx="24" cy="19" r="7.5" fill="#1f5fae"/><path d="M16.5,19 H31.5 M24,11.5 Q18.5,19 24,26.5 M24,11.5 Q29.5,19 24,26.5 M17.5,15 H30.5 M17.5,23 H30.5" stroke="#fff" stroke-width="1.1" fill="none"/>` },
  delfin: { fondo: '#123a7d', logo: `<path d="M23,9 L32,27 L14,27 Z" fill="#e01933"/><path d="M23,9 L32,27 L23,22 Z" fill="#ffffff" opacity=".9"/>` },
  depie: { fondo: '#073590', logo: `<ellipse cx="27" cy="22" rx="4.5" ry="7" fill="#f1c933"/><circle cx="23.5" cy="12.5" r="1.6" fill="#f1c933"/><circle cx="26.5" cy="11.2" r="1.5" fill="#f1c933"/>
    <circle cx="29.5" cy="11.6" r="1.3" fill="#f1c933"/><circle cx="31.8" cy="13" r="1.1" fill="#f1c933"/>` },
  burkirates: { fondo: '#ffffff', logo: `<rect x="0" y="0" width="22" height="40" fill="#e0001b"/><rect x="22" y="8" width="18" height="8" fill="#00843d"/><rect x="22" y="24" width="18" height="8" fill="#1d1d1b"/>` },
  uropa: { fondo: '#13306b', logo: `<path d="M0,30 Q20,16 40,12 L40,18 Q22,22 0,36 Z" fill="#2fb7c7"/>` },
  guaguair: { fondo: '#ffffff', logo: `<path d="M0,22 Q20,8 40,6 L40,40 L0,40 Z" fill="#00a184"/><path d="M0,30 Q22,18 40,16 L40,22 Q24,24 0,36 Z" fill="#7cc242"/>` },
  lazyjet: { fondo: '#ff6600', logo: `<path d="M8,32 Q24,26 40,10 L40,16 Q26,30 10,36 Z" fill="#fff"/>` },
  berlina: { fondo: '#d50f25', logo: `<path d="M16,21 Q23.5,31 31,21" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
  flyando: { fondo: '#5b5b5b', logo: `<path d="M19,9 L23.5,9 L26,21 L30,9 L34,9 L28,30 L24,30 Z" fill="#ffcc00"/>` },
  catarro: { fondo: '#5c0632', logo: `<path d="M24,30 Q22,22 26,18 L22,8 L27,16 L31,7 L29,17 Q33,22 30,30 Z" fill="#fff"/>` },
  italia: { fondo: '#0b2a6f', logo: `<rect x="0" y="30" width="40" height="3" fill="#009246"/><rect x="0" y="33" width="40" height="3" fill="#fff"/><rect x="0" y="36" width="40" height="3" fill="#ce2b37"/>
    <text x="27" y="24" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">ita</text>` },
};

const OTRAS = { fondo: '#5d6b78', logo: '' };

// Cada dibujo lleva su propio recorte: un id repetido fallaría si el primero queda oculto.
let siguiente = 0;

function svgCola(fondo, contenido, clase) {
  const recorte = `deriva-${siguiente++}`;
  return `<svg class="cola ${clase}" viewBox="0 0 40 40" aria-hidden="true"><defs><clipPath id="${recorte}"><path d="${DERIVA}"/></clipPath></defs>
    <g clip-path="url(#${recorte})"><rect width="40" height="40" fill="${fondo}"/>${contenido}</g><path d="${DERIVA}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>`;
}

// La cola de una compañía rival, la del jugador (con su marca) o la de «otras compañías».
export function htmlCola(id, clase = '', marca = null) {
  if (id === 'jugador' && marca) return htmlMarca(marca, clase);
  const c = COLAS[id] ?? OTRAS;
  return svgCola(c.fondo, c.logo, clase);
}

// --- La marca del jugador

// Los dibujos van en la mitad de arriba de la cola; las letras, abajo, donde es más ancha.
export const DIBUJOS = {
  liso: { nombre: 'Lisa', svg: () => '' },
  franja: { nombre: 'Franja', svg: (c) => `<path d="M0,22 L40,11 L40,17 L0,28 Z" fill="${c}"/>` },
  bandas: { nombre: 'Bandas', svg: (c) => `<path d="M0,18 L40,7 L40,10 L0,21 Z" fill="${c}"/><path d="M0,24 L40,13 L40,16 L0,27 Z" fill="${c}"/>` },
  circulo: { nombre: 'Círculo', svg: (c) => `<circle cx="24" cy="14" r="6.5" fill="${c}"/>` },
  estrella: { nombre: 'Estrella', svg: (c) => `<path d="M25,6.5 L27,12.2 L33,12.3 L28.2,15.9 L29.9,21.6 L25,18.2 L20.1,21.6 L21.8,15.9 L17,12.3 L23,12.2 Z" fill="${c}"/>` },
  ola: { nombre: 'Ola', svg: (c) => `<path d="M0,24 Q14,14 40,9 L40,15 Q17,18 0,30 Z" fill="${c}"/>` },
};

export const COLORES_MARCA = ['#f0a63a', '#d4202c', '#0b1e4d', '#00a1de', '#00843d', '#ffffff', '#1d1d1b', '#5c0632'];

const escAttr = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function htmlMarca(marca, clase = '') {
  const imagen = marca.imagen ? `<image href="${escAttr(marca.imagen)}" x="0" y="0" width="40" height="40" preserveAspectRatio="xMidYMid slice"/>` : '';
  const dibujo = (DIBUJOS[marca.dibujo] ?? DIBUJOS.liso).svg(marca.segundo);
  const letras = marca.letras
    ? `<text x="18.5" y="35" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="${marca.letras.length > 2 ? 9.5 : 11}" fill="${marca.segundo}" ${marca.imagen ? 'stroke="#000" stroke-width=".4"' : ''}>${escAttr(marca.letras)}</text>`
    : '';
  return svgCola(marca.fondo, imagen + dibujo + letras, clase);
}

// El editor: vista previa, dos colores, el dibujo, las letras y una imagen propia.
export function htmlEditorMarca(marca) {
  const paleta = (campo) => `<div class="paleta">${COLORES_MARCA.map((c) => `<button type="button" class="muestra${marca[campo] === c ? ' activa' : ''}" style="background:${c}" data-marca-color="${campo}" data-color="${c}" aria-label="Color ${c}"></button>`).join('')}
    <input type="color" value="${marca[campo]}" data-marca="${campo}" aria-label="Otro color"></div>`;
  return `<div class="marca-editor">
    <div class="marca-vista">${htmlMarca(marca, 'marca-grande')}</div>
    <div class="marca-controles">
      <div class="campo"><span>Color de la cola</span>${paleta('fondo')}</div>
      <div class="campo"><span>Color del dibujo y las letras</span>${paleta('segundo')}</div>
      <div class="campo"><span>Dibujo</span><div class="dibujos">${Object.entries(DIBUJOS).map(([id, d]) => `<button type="button" class="dibujo${marca.dibujo === id ? ' activo' : ''}" data-marca-dibujo="${id}" title="${d.nombre}">${htmlMarca({ ...marca, dibujo: id, letras: '' }, 'mini')}</button>`).join('')}</div></div>
      <label class="campo"><span>Letras en la cola</span><input type="text" maxlength="3" value="${escAttr(marca.letras)}" data-marca="letras" autocomplete="off"></label>
      <div class="campo"><span>Imagen propia</span><div class="fila-botones">
        <label class="btn-mini">Subir imagen<input type="file" accept="image/*" data-marca-imagen hidden></label>
        ${marca.imagen ? '<button type="button" class="btn-mini" data-marca-quitar>Quitar imagen</button>' : ''}</div></div>
    </div>
  </div>`;
}

// Reduce una imagen subida a un cuadrado pequeño para guardarla con la partida.
function leerImagen(archivo) {
  return new Promise((ok, mal) => {
    const lector = new FileReader();
    lector.onerror = () => mal(lector.error);
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => mal(new Error('No es una imagen'));
      img.onload = () => {
        const lado = 192;
        const lienzo = document.createElement('canvas');
        lienzo.width = lado;
        lienzo.height = lado;
        const escala = Math.max(lado / img.width, lado / img.height);
        const w = img.width * escala;
        const h = img.height * escala;
        lienzo.getContext('2d').drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
        ok(lienzo.toDataURL('image/jpeg', 0.85));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

// Conecta un editor ya pintado en `caja`: cada cambio modifica `marca` y repinta el editor.
export function conectarEditorMarca(caja, marca, alCambiar = () => {}) {
  const repintar = () => {
    caja.innerHTML = htmlEditorMarca(marca);
    alCambiar(marca);
  };
  caja.addEventListener('click', (e) => {
    const color = e.target.closest('[data-marca-color]');
    if (color) { marca[color.dataset.marcaColor] = color.dataset.color; repintar(); return; }
    const dibujo = e.target.closest('[data-marca-dibujo]');
    if (dibujo) { marca.dibujo = dibujo.dataset.marcaDibujo; repintar(); return; }
    if (e.target.closest('[data-marca-quitar]')) { marca.imagen = null; repintar(); }
  });
  caja.addEventListener('input', (e) => {
    const campo = e.target.dataset.marca;
    if (!campo) return;
    marca[campo] = campo === 'letras' ? e.target.value.toUpperCase().slice(0, 3) : e.target.value;
    // Las letras se escriben sin repintar el editor, para no perder el cursor.
    const vista = caja.querySelector('.marca-vista');
    if (vista) vista.innerHTML = htmlMarca(marca, 'marca-grande');
    alCambiar(marca);
  });
  caja.addEventListener('change', async (e) => {
    if (e.target.dataset.marca === 'fondo' || e.target.dataset.marca === 'segundo') { repintar(); return; }
    if (!('marcaImagen' in e.target.dataset) || !e.target.files?.[0]) return;
    try {
      marca.imagen = await leerImagen(e.target.files[0]);
      repintar();
    } catch {
      // Si no se puede leer, la marca se queda como estaba.
    }
  });
}
