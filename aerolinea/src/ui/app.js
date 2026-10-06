// Arranque, bucle principal y conexión entre el motor y la interfaz.

import { AEROPUERTOS, POR_ID, REGIONES, abiertoEn } from '../data/aeropuertos.js';
import {
  nuevaPartida, avanzar, decidir, comprar, comprarNuevo, inspeccionar, vender, crearRuta, borrarRuta,
  asignar, cambiarFrecuencia, cambiarTarifa, cambiarServicio, cambiarCateringBase, pedirPrestamo,
  devolverPrestamo, apuntar, VERSION, pedirInspeccion, pedirDiagnostico, pedirReparacion, diferir,
  pedirRevision, pedirMotor, pedirRetrofit, pedirDirectiva, cancelarTareas,
} from '../core/sim.js';
import { textoFecha, textoHora } from '../core/tiempo.js';
import { crearGlobo } from './globo.js';
import { htmlTarjeta } from './tarjeta.js';
import { htmlEscena, htmlNoticia, htmlInforme, DURACION_ESCENA } from './escenas.js';
import { panelFlota, panelRutas, panelMercado, panelCuentas, panelDiario, htmlAeropuerto } from './paneles.js';
import { panelMundo, htmlAvance } from './mundo.js';
import { etiquetaGeneral } from '../core/reputacion.js';
import { dinero, esc } from './formato.js';

const CLAVE = 'aerolinea_partida_v1';
// Minutos de juego por segundo real.
const VELOCIDADES = [0, 60, 240, 720];

const $ = (s) => document.querySelector(s);
const ui = {
  barra: $('#barra'), fecha: $('#b-fecha'), caja: $('#b-caja'), rep: $('#b-rep'), nombre: $('#b-nombre'),
  velocidad: $('#velocidad'), hoja: $('#hoja'), hojaCuerpo: $('#hoja-cuerpo'), hojaTitulo: $('#hoja-titulo'),
  pestanas: $('#pestanas'), modal: $('#modal'), modalCaja: $('#modal-caja'), avisos: $('#avisos'),
  aeropuerto: $('#ficha-aeropuerto'), guia: $('#guia'), canvas: $('#globo'),
};

let estado = null;
let globo = null;
let velocidad = 1;
let acumulado = 0;
let panel = null;
let panelSucio = false;
let ultimoRefresco = 0;
let cola = [];
let modalActual = null;

// ---------------------------------------------------------------- guardado

function guardar() {
  if (!estado) return;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento la partida sigue, solo que no se guarda.
  }
}

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const e = JSON.parse(crudo);
    return e.version === VERSION ? e : null;
  } catch {
    return null;
  }
}

window.claude?.hot?.snapshot?.(() => ({ estado: estado ? JSON.stringify(estado) : null, velocidad }));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) guardar();
});

// ---------------------------------------------------------------- barra superior

function pintarBarra() {
  if (!estado) return;
  ui.nombre.textContent = `${estado.codigo} · ${estado.nombre}`;
  ui.fecha.textContent = `${textoFecha(estado.t, { corta: true })} · ${textoHora(estado.t)}`;
  ui.caja.textContent = dinero(estado.caja);
  ui.caja.classList.toggle('negativo', estado.caja < 0);
  const rep = etiquetaGeneral(estado.reputacion);
  ui.rep.textContent = rep.charAt(0).toUpperCase() + rep.slice(1);
  for (const b of ui.velocidad.querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(Number(b.dataset.v) === velocidad));
  }
  pintarGuia();
}

function pintarGuia() {
  let texto = '';
  let ir = null;
  if (!estado.aviones.length && !estado.rutas.length) {
    texto = 'Primer paso: compra un avión en el Mercado.';
    ir = 'mercado';
  } else if (!estado.rutas.length) {
    texto = 'Abre una ruta: toca un aeropuerto en el globo o ve a Rutas.';
    ir = 'rutas';
  } else if (!estado.aviones.length) {
    texto = 'Tienes rutas pero ningún avión. Pasa por el Mercado.';
    ir = 'mercado';
  } else if (!estado.aviones.some((a) => a.ruta)) {
    texto = 'Asigna un avión a una ruta para que empiece a volar.';
    ir = 'rutas';
  }
  ui.guia.hidden = !texto || panel != null;
  ui.guia.querySelector('span').textContent = texto;
  ui.guia.dataset.ir = ir ?? '';
}

ui.velocidad.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  velocidad = Number(b.dataset.v);
  pintarBarra();
});

// ---------------------------------------------------------------- paneles

const PANELES = {
  flota: ['Flota', panelFlota],
  rutas: ['Rutas', panelRutas],
  mercado: ['Aviones', panelMercado],
  mundo: ['Mundo', panelMundo],
  cuentas: ['Cuentas', panelCuentas],
  diario: ['Diario', panelDiario],
};

function abrirPanel(nombre) {
  panel = panel === nombre ? null : nombre;
  for (const b of ui.pestanas.querySelectorAll('button')) b.setAttribute('aria-selected', String(b.dataset.panel === panel));
  ui.hoja.hidden = panel == null;
  if (panel) {
    ui.aeropuerto.hidden = true;
    pintarPanel(true);
  }
  pintarGuia();
}

function pintarPanel(forzar = false) {
  if (!panel || !estado) return;
  // No repintar mientras se usa un desplegable: se cerraría en la mano.
  if (!forzar && document.activeElement?.tagName === 'SELECT' && ui.hoja.contains(document.activeElement)) return;
  const scroll = ui.hojaCuerpo.scrollTop;
  const [titulo, fn] = PANELES[panel];
  ui.hojaTitulo.textContent = titulo;
  ui.hojaCuerpo.innerHTML = fn(estado);
  ui.hojaCuerpo.scrollTop = scroll;
  panelSucio = false;
}

ui.pestanas.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-panel]');
  if (b) abrirPanel(b.dataset.panel);
});
$('#hoja-cerrar').addEventListener('click', () => abrirPanel(panel));
ui.guia.addEventListener('click', () => {
  if (ui.guia.dataset.ir) abrirPanel(ui.guia.dataset.ir);
});

function aviso(texto, grave = false) {
  const el = document.createElement('div');
  el.className = `aviso${grave ? ' grave' : ''}`;
  el.textContent = texto;
  ui.avisos.append(el);
  setTimeout(() => el.classList.add('fuera'), 3200);
  setTimeout(() => el.remove(), 3700);
  while (ui.avisos.children.length > 3) ui.avisos.firstChild.remove();
}

function resultado(error, ok) {
  if (error) aviso(error, true);
  else if (ok) aviso(ok);
  pintarBarra();
  pintarPanel(true);
  if (estado && !ui.aeropuerto.hidden && ui.aeropuerto.dataset.id) mostrarAeropuerto(ui.aeropuerto.dataset.id);
  globo?.marcarSucio();
  guardar();
}

// Acciones de botones y desplegables en paneles y ficha de aeropuerto.
function manejarAccion(el) {
  const d = el.dataset;
  const num = (k) => Number(d[k]);
  switch (d.accion) {
    case 'comprar': return resultado(comprar(estado, num('oferta')), 'Avión comprado. Llega mañana a tu base.');
    case 'comprar-nuevo': return resultado(comprarNuevo(estado, d.tipo), 'Avión nuevo en camino.');
    case 'inspeccionar': return resultado(inspeccionar(estado, num('oferta'), d.nivel), 'Inspección hecha.');
    case 'vender': return confirmar('¿Vender este avión?', 'Recibes el 85 % de su valor de mercado.', 'Vender', () => resultado(vender(estado, num('avion')), 'Avión vendido.'));
    case 'revision': return resultado(pedirRevision(estado, num('avion'), d.nivel), 'Revisión pedida: entra al taller cuando esté en la base.');
    case 'inspeccionar-averia': return resultado(pedirInspeccion(estado, num('avion'), num('averia')), 'Inspección pedida.');
    case 'diagnosticar': return resultado(pedirDiagnostico(estado, num('avion'), num('averia')), 'Diagnóstico pedido.');
    case 'reparar': return resultado(pedirReparacion(estado, num('avion'), num('averia')), 'Reparación pedida.');
    case 'diferir': return resultado(diferir(estado, num('avion'), num('averia')), 'Avería diferida según la MEL.');
    case 'motor': return resultado(pedirMotor(estado, num('avion'), num('pos'), d.alquiler === '1'), 'Motor pedido al taller.');
    case 'retrofit': return resultado(pedirRetrofit(estado, num('avion'), d.tecnologia), 'Instalación pedida.');
    case 'directiva': return resultado(pedirDirectiva(estado, num('avion'), num('directiva')), 'Inspección de la directiva pedida.');
    case 'cancelar-tareas': return resultado(cancelarTareas(estado, num('avion')), 'Pedido anulado. Lo pagado no se devuelve.');
    case 'servicio': return resultado(cambiarServicio(estado, num('ruta'), d.servicio));
    case 'catering-base': return resultado(cambiarCateringBase(estado, num('ruta'), el.checked));
    case 'consulta': estado.ajustes.consulta = el.value; return resultado(null, 'Ajuste guardado.');
    case 'revisiones-auto': estado.ajustes.revisionesAuto = el.checked; return resultado(null, 'Ajuste guardado.');
    case 'asignar': return resultado(asignar(estado, num('avion'), el.value === '' ? null : Number(el.value)));
    case 'asignar-libre': return resultado(asignar(estado, num('avion'), num('ruta')), 'Avión asignado.');
    case 'crear-ruta': {
      const destino = $('#nueva-ruta-destino')?.value;
      return resultado(crearRuta(estado, destino), `Ruta a ${destino} abierta.`);
    }
    case 'crear-ruta-a': return resultado(crearRuta(estado, d.destino), `Ruta a ${d.destino} abierta. Asígnale un avión.`);
    case 'borrar-ruta': return confirmar('¿Cerrar esta ruta?', 'El avión asignado se queda sin ruta y vuelve a la base.', 'Cerrar ruta', () => resultado(borrarRuta(estado, num('ruta'))));
    case 'frecuencia': {
      const ruta = estado.rutas.find((r) => r.id === num('ruta'));
      return resultado(cambiarFrecuencia(estado, ruta.id, ruta.frecuencia + num('delta')));
    }
    case 'tarifa': return resultado(cambiarTarifa(estado, num('ruta'), d.tarifa));
    case 'prestamo': return resultado(pedirPrestamo(estado, num('cantidad')), 'Préstamo concedido.');
    case 'devolver': return resultado(devolverPrestamo(estado, num('cantidad')), 'Préstamo devuelto.');
    case 'nueva-partida': return confirmar('¿Empezar otra partida?', 'Se pierde la actual. No hay vuelta atrás.', 'Empezar de nuevo', () => {
      try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
      estado = null;
      abrirPanel(panel);
      mostrarInicio();
    });
    case 'cerrar-ap': ui.aeropuerto.hidden = true; globo?.seleccionar(null); return undefined;
    default: return undefined;
  }
}

document.addEventListener('click', (e) => {
  const ir = e.target.closest('[data-ir]');
  if (ir && ir !== ui.guia) {
    ui.aeropuerto.hidden = true;
    if (panel !== ir.dataset.ir) abrirPanel(ir.dataset.ir);
    return;
  }
  const el = e.target.closest('button[data-accion]');
  if (el && !el.disabled && estado) manejarAccion(el);
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('select[data-accion], input[type="checkbox"][data-accion]');
  if (el && estado) manejarAccion(el);
});

function mostrarAeropuerto(id) {
  if (!id) {
    ui.aeropuerto.hidden = true;
    return;
  }
  ui.aeropuerto.dataset.id = id;
  ui.aeropuerto.innerHTML = htmlAeropuerto(estado, id);
  ui.aeropuerto.hidden = false;
}

// ---------------------------------------------------------------- modales

function abrirModal(html, clase = '') {
  ui.modalCaja.className = `modal-caja ${clase}`;
  ui.modalCaja.innerHTML = html;
  ui.modal.hidden = false;
  ui.modalCaja.scrollTop = 0;
}

function cerrarModal() {
  ui.modal.hidden = true;
  ui.modalCaja.innerHTML = '';
  modalActual = null;
  siguienteModal();
}

function encolar(item) {
  cola.push(item);
  if (!modalActual) siguienteModal();
}

function siguienteModal() {
  if (modalActual) return;
  // Las decisiones pendientes van después de lo que ya estaba en cola.
  if (!cola.length && estado?.decisiones.length) cola.push({ tipo: 'decision' });
  const item = cola.shift();
  if (!item) return;
  modalActual = item;
  if (item.tipo === 'decision') {
    const dec = estado.decisiones[0];
    if (!dec) {
      modalActual = null;
      return siguienteModal();
    }
    abrirModal(htmlTarjeta(estado, dec), 'modal-hoja');
    const origen = POR_ID[dec.origen];
    globo?.volarA(origen.lon, origen.lat);
  } else if (item.tipo === 'escena') {
    abrirModal(`${htmlEscena(item.accidente)}<button class="saltar" data-cerrar>Saltar</button>`, 'modal-escena');
    item.temporizador = setTimeout(() => {
      if (modalActual === item) {
        ui.modal.hidden = true;
        modalActual = null;
        cola.unshift({ tipo: 'noticia', accidente: item.accidente });
        siguienteModal();
      }
    }, DURACION_ESCENA);
  } else if (item.tipo === 'noticia') {
    abrirModal(`${htmlNoticia(item.accidente, estado)}<button class="btn" data-cerrar>Continuar</button>`, 'modal-tele');
  } else if (item.tipo === 'avance') {
    abrirModal(`${htmlAvance(item.noticia)}<button class="btn" data-cerrar>Continuar</button>`, 'modal-tele');
  } else if (item.tipo === 'informe') {
    abrirModal(`${htmlInforme(item.accidente, estado)}<button class="btn" data-cerrar>Continuar</button>`, 'modal-tele');
  } else if (item.tipo === 'quiebra') {
    abrirModal(`<h2 class="titulo-modal">Quiebra</h2><p>${esc(estado.nombre)} no puede pagar sus deudas y el banco ya no presta más. Los aviones se subastan.</p><button class="btn" data-accion-modal="reiniciar">Empezar otra partida</button>`, 'modal-aviso');
  } else if (item.tipo === 'confirmar') {
    abrirModal(`<h2 class="titulo-modal">${esc(item.titulo)}</h2><p>${esc(item.texto)}</p><div class="fila-botones"><button class="btn btn-sec" data-cerrar>Volver</button><button class="btn peligro" data-accion-modal="confirmar">${esc(item.boton)}</button></div>`, 'modal-aviso');
  }
  return undefined;
}

function confirmar(titulo, texto, boton, alAceptar) {
  encolar({ tipo: 'confirmar', titulo, texto, boton, alAceptar });
}

ui.modal.addEventListener('click', (e) => {
  const dec = e.target.closest('[data-decision]');
  if (dec && modalActual?.tipo === 'decision') {
    const d = estado.decisiones[0];
    decidir(estado, d.id, dec.dataset.decision);
    guardar();
    pintarBarra();
    cerrarModal();
    return;
  }
  if (e.target.closest('[data-cerrar]')) {
    if (modalActual?.tipo === 'escena') {
      clearTimeout(modalActual.temporizador);
      const acc = modalActual.accidente;
      ui.modal.hidden = true;
      modalActual = null;
      cola.unshift({ tipo: 'noticia', accidente: acc });
      siguienteModal();
      return;
    }
    cerrarModal();
    return;
  }
  const accion = e.target.closest('[data-accion-modal]')?.dataset.accionModal;
  if (accion === 'confirmar') {
    const fn = modalActual.alAceptar;
    cerrarModal();
    fn();
  } else if (accion === 'reiniciar') {
    try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
    estado = null;
    cola = [];
    ui.modal.hidden = true;
    modalActual = null;
    mostrarInicio();
  }
});

// ---------------------------------------------------------------- eventos del motor

function procesar(eventos) {
  for (const ev of eventos) {
    if (ev.tipo === 'aviso') aviso(ev.texto, ev.grave);
    else if (ev.tipo === 'indicio') aviso(`Indicio: ${ev.texto}`);
    else if (ev.tipo === 'accidente') {
      velocidad = Math.min(velocidad, 1);
      encolar({ tipo: 'escena', accidente: ev.accidente });
      const lugar = POR_ID[ev.accidente.lugar];
      globo?.volarA(lugar.lon, lugar.lat, 5);
    } else if (ev.tipo === 'investigacion') encolar({ tipo: 'informe', accidente: ev.accidente });
    else if (ev.tipo === 'quiebra') encolar({ tipo: 'quiebra' });
    else if (ev.tipo === 'decision' && !modalActual) siguienteModal();
    else if (ev.tipo === 'noticia') {
      // Las grandes noticias del mundo paran el juego con un avance; el resto, un aviso.
      if (ev.noticia.importante && ev.noticia.escala !== 'local') encolar({ tipo: 'avance', noticia: ev.noticia });
      else aviso(ev.noticia.titular, ev.noticia.importante);
    }
  }
  if (eventos.length) panelSucio = true;
}

// ---------------------------------------------------------------- inicio

function mostrarInicio() {
  const grupos = REGIONES.map((region) => {
    const lista = AEROPUERTOS.filter((a) => a.region === region && abiertoEn(a, 1976));
    return `<fieldset class="grupo-base"><legend>${region}</legend>${lista.map((a) => `
      <label class="opcion-base"><input type="radio" name="base" value="${a.id}" ${a.id === 'LPA' ? 'checked' : ''}>
        <span><strong>${a.id}</strong> ${esc(a.ciudad)}<small>${esc(a.nombre)} · pista ${a.pista} m${a.ils ? '' : ' · sin ILS'}</small></span></label>`).join('')}</fieldset>`;
  }).join('');
  abrirModal(`
    <p class="inicio-eyebrow">Enero de 1976</p>
    <h1 class="inicio-titulo">App viación</h1>
    <p class="inicio-texto">Tienes 3 millones de dólares, un banco dispuesto a prestarte algo más y ningún avión. Cada vuelo que salga lo autorizas tú. Si el tiempo está feo, decides si se arriesga.</p>
    <label class="campo"><span>Nombre de la compañía</span><input id="nombre-compania" type="text" maxlength="28" value="Atlántica" autocomplete="off"></label>
    <label class="campo"><span>Buscar base</span><input id="buscar-base" type="search" placeholder="Ciudad o código" autocomplete="off"></label>
    <div class="lista-bases">${grupos}</div>
    <button class="btn btn-despegar" data-fundar>Fundar la compañía</button>`, 'modal-inicio');
  modalActual = { tipo: 'inicio' };
  const buscar = $('#buscar-base');
  buscar.addEventListener('input', () => {
    const q = buscar.value.trim().toLowerCase();
    for (const el of ui.modalCaja.querySelectorAll('.opcion-base')) {
      el.hidden = q && !el.textContent.toLowerCase().includes(q);
    }
  });
  ui.modalCaja.querySelector('[data-fundar]').addEventListener('click', () => {
    const nombre = $('#nombre-compania').value.trim() || 'Atlántica';
    const base = ui.modalCaja.querySelector('input[name="base"]:checked')?.value ?? 'LPA';
    empezar(nuevaPartida({ nombre, base }));
    apuntar(estado, 'Consejo: los aeropuertos sin ILS y con niebla son los más traicioneros. Mira la hoja de despacho antes de autorizar.', 'info');
    ui.modal.hidden = true;
    modalActual = null;
    const b = POR_ID[base];
    globo?.volarA(b.lon, b.lat, b.grupo === 'canarias' ? 9 : 6);
    guardar();
  });
}

function empezar(e) {
  estado = e;
  cola = [];
  pintarBarra();
  globo?.marcarSucio();
  siguienteModal();
}

// ---------------------------------------------------------------- bucle

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000);
  ultimo = ahora;
  if (estado && !estado.quiebra && ui.modal.hidden && !estado.decisiones.length && velocidad > 0) {
    const enVuelo = estado.aviones.some((a) => a.estado === 'vuelo');
    acumulado += dt * VELOCIDADES[velocidad] * (enVuelo ? 1 : 4);
    const minutos = Math.floor(acumulado / 5) * 5;
    if (minutos >= 5) {
      acumulado -= minutos;
      const diaAntes = Math.floor(estado.t / 1440);
      const eventos = avanzar(estado, minutos);
      procesar(eventos);
      pintarBarra();
      panelSucio = true;
      if (Math.floor(estado.t / 1440) !== diaAntes) guardar();
    }
  }
  if (globo && (estado || globo.necesitaDibujo())) globo.dibujar(estado, ahora);
  if (panelSucio && ahora - ultimoRefresco > 800) {
    ultimoRefresco = ahora;
    pintarPanel();
  }
  requestAnimationFrame(fotograma);
}

async function arrancar(datos = {}) {
  try {
    globo = await crearGlobo(ui.canvas, {
      alTocar: (id) => {
        if (!estado) return;
        if (panel) abrirPanel(panel);
        mostrarAeropuerto(id);
      },
    });
  } catch (err) {
    aviso('No se pudo cargar el mapa del mundo.', true);
    console.error(err);
  }
  let guardado = null;
  if (datos.estado) {
    try { guardado = JSON.parse(datos.estado); } catch { guardado = null; }
    velocidad = datos.velocidad ?? velocidad;
  }
  guardado ??= cargar();
  if (guardado) {
    empezar(guardado);
    const b = POR_ID[guardado.base];
    globo?.centrarEn(b.lon, b.lat, 4);
  } else {
    globo?.centrarEn(-15.4, 28, 1.3);
    mostrarInicio();
  }
  requestAnimationFrame(fotograma);
}

const hot = window.claude?.hot;
if (hot?.ready) hot.ready(arrancar);
else arrancar(hot?.data ?? {});

// Acceso para pruebas desde la consola.
window.appViacion = { estado: () => estado, procesar, encolar };
