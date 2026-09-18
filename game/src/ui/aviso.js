/**
 * Avisos flotantes de progreso. Registrar el día cambia la XP en silencio: sin esto, el
 * jugador no se entera de que ha ganado nada ni de que ha subido de nivel.
 *
 * Vive fuera de las vistas porque no pertenece a ninguna: salta desde donde estés.
 */

const DURACION = 3200;
const SUBIDA = 900;

let pendiente = null;
let temporizador = null;

const contenedor = () => document.getElementById('avisos');

/** Un aviso nuevo mientras hay otro en pantalla lo suma en vez de apilarse. */
function mostrarGanancia(xp, monedas) {
  if (pendiente && contenedor().contains(pendiente.nodo)) {
    pendiente.xp += xp;
    pendiente.monedas += monedas;
  } else {
    const nodo = document.createElement('div');
    nodo.className = 'aviso-flotante';
    contenedor().append(nodo);
    pendiente = { nodo, xp, monedas };
  }

  const { nodo, xp: totalXp, monedas: totalMonedas } = pendiente;
  nodo.innerHTML = `<b>+${totalXp} XP</b>${totalMonedas ? `<span>+${totalMonedas} 🪙</span>` : ''}`;

  clearTimeout(temporizador);
  temporizador = setTimeout(() => cerrar(nodo), DURACION);
}

function cerrar(nodo) {
  nodo.classList.add('saliendo');
  setTimeout(() => nodo.remove(), 400);
  if (pendiente?.nodo === nodo) pendiente = null;
}

function mostrarNivel(nivel) {
  const nodo = document.createElement('div');
  nodo.className = 'aviso-flotante nivel';
  nodo.innerHTML = `<b>¡Nivel ${nivel}!</b><span>Algo se ha abierto</span>`;
  contenedor().append(nodo);
  setTimeout(() => cerrar(nodo), DURACION + 1400);
}

/**
 * La barra sube hasta el tope, destella y vuelve a empezar en el nivel nuevo.
 * Hay que devolverla antes al punto donde estaba, porque el repintado ya la ha dejado en
 * el avance del nivel nuevo y si no la subida no se vería.
 */
function celebrarEnLaBarra(avanceAnterior, avanceNuevo) {
  const barra = document.getElementById('barraXp');
  const relleno = barra?.firstElementChild;
  if (!relleno) return;

  relleno.style.transition = 'none';
  relleno.style.width = `${avanceAnterior}%`;
  void relleno.offsetWidth; // fuerza el cálculo para que la transición siguiente se vea

  relleno.style.transition = `width ${SUBIDA}ms cubic-bezier(.3,.9,.4,1)`;
  relleno.style.width = '100%';
  barra.classList.add('destello');

  const flecha = document.createElement('span');
  flecha.className = 'flecha-nivel';
  flecha.textContent = '▲';
  barra.append(flecha);

  setTimeout(() => {
    barra.classList.remove('destello');
    flecha.remove();
    relleno.style.transition = 'none';
    relleno.style.width = '0%';
    void relleno.offsetWidth;
    relleno.style.transition = '';
    relleno.style.width = `${avanceNuevo}%`;
  }, SUBIDA + 500);
}

/**
 * Compara el antes y el después de un cambio y avisa de lo que haya mejorado.
 * Solo anuncia subidas: desmarcar una serie baja la XP y eso no se celebra.
 *
 * @param {{ xp: number, monedas: number, nivel: number, avance: number }} antes
 * @param {{ xp: number, monedas: number, nivel: number, avance: number }} ahora
 */
export function anunciarProgreso(antes, ahora) {
  const xp = ahora.xp - antes.xp;
  const monedas = Math.max(0, ahora.monedas - antes.monedas);
  if (xp > 0) mostrarGanancia(xp, monedas);

  if (ahora.nivel > antes.nivel) {
    mostrarNivel(ahora.nivel);
    celebrarEnLaBarra(antes.avance, ahora.avance);
  }
}
