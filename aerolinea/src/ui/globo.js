// El globo: proyección ortográfica en Canvas con d3-geo.
//
// Se dibuja con la costa de baja resolución mientras se arrastra o con poco zoom, y con la de
// 1:50 millones en reposo y de cerca, que es la única en la que aparecen todas las Canarias.

import { AEROPUERTOS, POR_ID, abiertoEn } from '../data/aeropuertos.js';
import { TIPOS } from '../data/aviones.js';
import { climaEn, ICONOS } from '../core/clima.js';
import { anio } from '../core/tiempo.js';

const d3 = window.d3;
const topojson = window.topojson;

const ZOOM_MIN = 0.9;
const ZOOM_MAX = 16;

function leerColores() {
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  return {
    oceano: v('--mar'), oceanoBorde: v('--mar-borde'), tierra: v('--tierra'), costa: v('--costa'),
    frontera: v('--frontera'), reticula: v('--reticula'), texto: v('--tinta-globo'),
    acento: v('--ambar'), alerta: v('--rojo'), base: v('--ambar'), apagado: v('--apagado'),
  };
}

export async function crearGlobo(canvas, { alTocar }) {
  const cargar = (u) => fetch(u).then((r) => r.json());
  const [l110, l50, c110] = await Promise.all([
    cargar('vendor/land-110m.json'), cargar('vendor/land-50m.json'), cargar('vendor/countries-110m.json'),
  ]);
  const tierraBaja = topojson.feature(l110, l110.objects.land);
  const tierraAlta = topojson.feature(l50, l50.objects.land);
  const fronteras = topojson.mesh(c110, c110.objects.countries, (a, b) => a !== b);
  const reticula = d3.geoGraticule10();

  const proyeccion = d3.geoOrthographic().clipAngle(90).precision(0.4);
  const ctx = canvas.getContext('2d');
  const camino = d3.geoPath(proyeccion, ctx);
  let colores = leerColores();

  const vista = { rot: [16, -30], zoom: 1.1 };
  let ancho = 0;
  let alto = 0;
  let dpr = 1;
  let interactuando = false;
  let vuelo = null; // animación hacia un punto
  let seleccionado = null;
  let sucio = true;

  function redimensionar() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    ancho = canvas.clientWidth;
    alto = canvas.clientHeight;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    sucio = true;
  }
  new ResizeObserver(redimensionar).observe(canvas);
  redimensionar();

  const radioBase = () => Math.min(ancho, alto) * 0.44;

  function configurar() {
    proyeccion
      .translate([ancho / 2, alto / 2])
      .scale(radioBase() * vista.zoom)
      .rotate([vista.rot[0], vista.rot[1], 0]);
  }

  const centro = () => [-vista.rot[0], -vista.rot[1]];
  const visible = (lon, lat) => d3.geoDistance([lon, lat], centro()) < Math.PI / 2 - 0.03;

  // --- interacción
  const punteros = new Map();
  let inicioToque = null;
  let pinza = null;

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    vuelo = null;
    if (punteros.size === 1) inicioToque = { x: e.clientX, y: e.clientY, t: performance.now(), movido: 0 };
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      pinza = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: vista.zoom };
      inicioToque = null;
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!punteros.has(e.pointerId)) return;
    const prev = punteros.get(e.pointerId);
    const actual = { x: e.clientX, y: e.clientY };
    punteros.set(e.pointerId, actual);
    if (punteros.size === 2 && pinza) {
      const [a, b] = [...punteros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      vista.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinza.zoom * (d / pinza.d)));
      interactuando = true;
      sucio = true;
      return;
    }
    if (punteros.size !== 1) return;
    const dx = actual.x - prev.x;
    const dy = actual.y - prev.y;
    if (inicioToque) inicioToque.movido += Math.abs(dx) + Math.abs(dy);
    if (inicioToque && inicioToque.movido < 6) return;
    const grados = 180 / (Math.PI * radioBase() * vista.zoom);
    vista.rot[0] += dx * grados;
    vista.rot[1] = Math.max(-85, Math.min(85, vista.rot[1] - dy * grados));
    interactuando = true;
    sucio = true;
  });

  const soltar = (e) => {
    if (!punteros.has(e.pointerId)) return;
    punteros.delete(e.pointerId);
    if (punteros.size < 2) pinza = null;
    if (punteros.size === 0) {
      if (inicioToque && inicioToque.movido < 6 && performance.now() - inicioToque.t < 500) {
        const r = canvas.getBoundingClientRect();
        tocar(e.clientX - r.left, e.clientY - r.top);
      }
      inicioToque = null;
      interactuando = false;
      sucio = true;
    }
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    vista.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, vista.zoom * Math.exp(-e.deltaY * 0.0015)));
    sucio = true;
  }, { passive: false });

  let estadoActual = null;
  function tocar(x, y) {
    configurar();
    let mejor = null;
    let dmin = 24;
    const n = estadoActual ? anio(estadoActual.t) : 1976;
    for (const a of AEROPUERTOS) {
      if (!abiertoEn(a, n) || !visible(a.lon, a.lat)) continue;
      const [px, py] = proyeccion([a.lon, a.lat]);
      const d = Math.hypot(px - x, py - y);
      if (d < dmin) {
        dmin = d;
        mejor = a.id;
      }
    }
    seleccionado = mejor;
    sucio = true;
    alTocar(mejor);
  }

  // --- dibujo
  function dibujar(estado, tReal) {
    estadoActual = estado;
    if (vuelo) {
      const k = Math.min(1, (tReal - vuelo.inicio) / vuelo.duracion);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      vista.rot = [vuelo.desde.rot[0] + (vuelo.hasta.rot[0] - vuelo.desde.rot[0]) * e, vuelo.desde.rot[1] + (vuelo.hasta.rot[1] - vuelo.desde.rot[1]) * e];
      vista.zoom = vuelo.desde.zoom + (vuelo.hasta.zoom - vuelo.desde.zoom) * e;
      if (k >= 1) vuelo = null;
    }
    configurar();
    const c = colores;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);

    const r = proyeccion.scale();
    const [cx, cy] = proyeccion.translate();

    // Halo y océano
    const halo = ctx.createRadialGradient(cx, cy, r * 0.98, cx, cy, r * 1.12);
    halo.addColorStop(0, c.oceanoBorde);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
    ctx.fill();
    const mar = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    mar.addColorStop(0, c.oceanoBorde);
    mar.addColorStop(1, c.oceano);
    ctx.fillStyle = mar;
    ctx.beginPath();
    camino({ type: 'Sphere' });
    ctx.fill();

    ctx.beginPath();
    camino(reticula);
    ctx.strokeStyle = c.reticula;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    const detalle = !interactuando && vista.zoom > 2.2;
    ctx.beginPath();
    camino(detalle ? tierraAlta : tierraBaja);
    ctx.fillStyle = c.tierra;
    ctx.fill();
    ctx.strokeStyle = c.costa;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    if (vista.zoom > 1.6) {
      ctx.beginPath();
      camino(fronteras);
      ctx.strokeStyle = c.frontera;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    if (!estado) return;
    const n = anio(estado.t);
    const red = new Set([estado.base, ...estado.rutas.map((x) => x.destino)]);

    // Rutas
    for (const ruta of estado.rutas) {
      const o = POR_ID[ruta.origen];
      const d = POR_ID[ruta.destino];
      ctx.beginPath();
      camino({ type: 'LineString', coordinates: [[o.lon, o.lat], [d.lon, d.lat]] });
      ctx.strokeStyle = ruta.avion ? c.acento : c.apagado;
      ctx.globalAlpha = ruta.avion ? 0.75 : 0.5;
      ctx.lineWidth = 1.6;
      ctx.setLineDash(ruta.avion ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Aeropuertos
    const etiquetas = vista.zoom > 2.6;
    ctx.font = '600 10px "Overpass Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    for (const a of AEROPUERTOS) {
      if (!abiertoEn(a, n) || !visible(a.lon, a.lat)) continue;
      const [x, y] = proyeccion([a.lon, a.lat]);
      const esBase = a.id === estado.base;
      const enRed = red.has(a.id);
      const radio = (esBase ? 4.5 : 1.6 + a.tam * 0.45) * Math.min(1.6, 0.85 + vista.zoom * 0.06);
      ctx.beginPath();
      ctx.arc(x, y, radio, 0, Math.PI * 2);
      ctx.fillStyle = esBase || enRed ? c.acento : c.texto;
      ctx.globalAlpha = esBase || enRed ? 1 : 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (esBase) {
        ctx.beginPath();
        ctx.arc(x, y, radio + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = c.acento;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      if (a.id === seleccionado) {
        ctx.beginPath();
        ctx.arc(x, y, radio + 7, 0, Math.PI * 2);
        ctx.strokeStyle = c.texto;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (etiquetas || esBase || enRed || a.id === seleccionado) {
        ctx.fillStyle = esBase || enRed ? c.acento : c.texto;
        ctx.fillText(a.id, x + radio + 4, y);
        if (enRed && vista.zoom > 1.8) {
          const clima = climaEn(a, estado.t, estado.semilla);
          if (clima.sev >= 2) {
            ctx.font = '12px sans-serif';
            ctx.fillText(ICONOS[clima.tipo], x + radio + 30, y);
            ctx.font = '600 10px "Overpass Mono", ui-monospace, monospace';
          }
        }
      }
    }

    // Aviones
    for (const av of estado.aviones) {
      let lon;
      let lat;
      let rumbo = 0;
      if (av.estado === 'vuelo' && av.vuelo) {
        const o = POR_ID[av.vuelo.origen];
        const d = POR_ID[av.vuelo.destino];
        const k = Math.max(0, Math.min(1, (estado.t - av.vuelo.salida) / (av.vuelo.llegada - av.vuelo.salida)));
        const interp = d3.geoInterpolate([o.lon, o.lat], [d.lon, d.lat]);
        [lon, lat] = interp(k);
        if (!visible(lon, lat)) continue;
        const [x1, y1] = proyeccion(interp(Math.max(0, k - 0.01)));
        const [x2, y2] = proyeccion(interp(Math.min(1, k + 0.01)));
        rumbo = Math.atan2(y2 - y1, x2 - x1);
        const [x, y] = proyeccion([lon, lat]);
        dibujarAvion(ctx, x, y, rumbo, TIPOS[av.tipo], c.texto, c.oceano);
      } else if (av.estado === 'esperando') {
        const a = POR_ID[av.lugar];
        if (!visible(a.lon, a.lat)) continue;
        const [x, y] = proyeccion([a.lon, a.lat]);
        const pulso = 8 + 6 * ((tReal / 600) % 1);
        ctx.beginPath();
        ctx.arc(x, y, pulso, 0, Math.PI * 2);
        ctx.strokeStyle = c.alerta;
        ctx.globalAlpha = 1 - ((tReal / 600) % 1);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    sucio = false;
  }

  function dibujarAvion(g, x, y, rumbo, tipo, color, contorno) {
    const s = tipo.plazas > 200 ? 1.35 : tipo.plazas > 100 ? 1.1 : 0.9;
    g.save();
    g.translate(x, y);
    g.rotate(rumbo);
    g.scale(s, s);
    g.beginPath();
    g.moveTo(7, 0);
    g.lineTo(2, -1.2);
    g.lineTo(-1, -7);
    g.lineTo(-3, -7);
    g.lineTo(-2, -1.4);
    g.lineTo(-6, -1.2);
    g.lineTo(-8, -4);
    g.lineTo(-9, -4);
    g.lineTo(-8, 0);
    g.lineTo(-9, 4);
    g.lineTo(-8, 4);
    g.lineTo(-6, 1.2);
    g.lineTo(-2, 1.4);
    g.lineTo(-3, 7);
    g.lineTo(-1, 7);
    g.lineTo(2, 1.2);
    g.closePath();
    g.fillStyle = color;
    g.strokeStyle = contorno;
    g.lineWidth = 1;
    g.stroke();
    g.fill();
    g.restore();
  }

  return {
    dibujar,
    necesitaDibujo: () => sucio || interactuando || vuelo != null,
    marcarSucio: () => { sucio = true; },
    refrescarColores: () => { colores = leerColores(); sucio = true; },
    volarA(lon, lat, zoom = vista.zoom) {
      // Toma el camino corto en longitud.
      let objetivo = -lon;
      while (objetivo - vista.rot[0] > 180) objetivo -= 360;
      while (objetivo - vista.rot[0] < -180) objetivo += 360;
      vuelo = {
        inicio: performance.now(), duracion: 900,
        desde: { rot: [...vista.rot], zoom: vista.zoom },
        hasta: { rot: [objetivo, -lat], zoom },
      };
    },
    centrarEn(lon, lat, zoom) {
      vista.rot = [-lon, -lat];
      if (zoom) vista.zoom = zoom;
      sucio = true;
    },
    seleccionar(id) {
      seleccionado = id;
      sucio = true;
    },
  };
}
