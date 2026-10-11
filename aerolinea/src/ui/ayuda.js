// Ayuda del juego: el instructor explica qué hace cada cosa. Se abre con el botón «?» de la
// barra; la primera hoja de despacho de cada partida trae además un consejo suyo.

import { INSTRUCTOR } from '../data/pilotos.js';
import { esc } from './formato.js';

const cara = () => (INSTRUCTOR.cara
  ? `<img class="instructor-cara" src="${INSTRUCTOR.cara}" alt="${esc(INSTRUCTOR.nombre)}">`
  : '<img class="instructor-cara sin-foto" src="icon.svg" alt="">');

export function htmlInstructor(texto) {
  return `<div class="instructor">${cara()}<div class="instructor-bocadillo"><strong>${esc(INSTRUCTOR.nombre)}</strong><p>${texto}</p></div></div>`;
}

const SECCIONES = [
  ['Cómo se juega', `
    <p>Diriges una aerolínea desde enero de 1976. Empiezas con 3 millones de dólares, una base y ningún avión. Ganas si la compañía crece sin quedarse sin dinero; pierdes si llegas a números rojos y el banco ya no te presta más.</p>
    <ol class="pasos">
      <li><strong>Compra un avión</strong> en Aviones. Uno de segunda mano es barato, pero puede venir con sorpresas: inspecciónalo antes.</li>
      <li><strong>Estudia el destino</strong>: toca su aeropuerto en el globo. Gratis ves una idea del clima y del mercado; si quieres saber más, encarga los estudios.</li>
      <li><strong>Abre una ruta</strong> en Rutas, o desde la ficha del aeropuerto, y <strong>asígnale el avión</strong>.</li>
      <li>Elige cuántas <strong>vueltas al día</strong>, la tarifa y el servicio a bordo.</li>
      <li>Decide qué quieres que te pregunte el despachador: en <strong>Reglas de despacho</strong> de cada ruta o en el ajuste general de Cuentas.</li>
      <li>Dale a <strong>▶</strong>. Cuando un vuelo necesite tu firma, el juego se para y te enseña la hoja de despacho.</li>
      <li>Mira de vez en cuando <strong>Cuentas</strong> (¿gana dinero cada ruta?) y <strong>Flota</strong> (revisiones y averías).</li>
    </ol>`],
  ['La hoja de despacho', `
    <p>Antes de cada vuelo dudoso firmas tú. La hoja enseña lo que sabría un despachador de verdad:</p>
    <ul>
      <li><strong>Tiempo en salida y destino</strong>: visibilidad, viento y tormentas. Cada aeropuerto tiene sus <strong>mínimos</strong>: si la niebla los baja, el avión no puede aterrizar. Con <strong>ILS</strong> los mínimos son mucho más bajos.</li>
      <li><strong>Riesgo de incidencia</strong> (esperas, desvíos, una avería que obliga a volver) y <strong>riesgo grave</strong> (accidente), en palabras. Son estimaciones: el tiempo puede cambiar.</li>
      <li><strong>Averías conocidas</strong> y si el avión está <strong>fuera de norma</strong> (revisión vencida, aplazamiento caducado, tripulación sin descanso). Volar fuera de norma es ilegal: si hay inspección, multa; si hay accidente, culpa tuya.</li>
    </ul>
    <p>Puedes <strong>despegar</strong>, cargar <strong>combustible extra</strong> (cuesta más, pero da margen para esperar o desviarse), <strong>retrasar</strong> dos horas, <strong>cancelar</strong> (devuelves parte del billete y baja la reputación) o mandar el avión al <strong>taller</strong>.</p>`],
  ['Reglas de despacho', `
    <p>Para no firmar lo mismo cien veces, cada ruta tiene sus reglas (Rutas → Reglas de despacho). Por cada situación eliges qué hace el despachador sin preguntarte:</p>
    <ul>
      <li><strong>Previsión bajo mínimos</strong>: preguntarte, retrasar hasta que mejore, cancelar o salir igualmente con combustible extra (fuera de norma: tú asumes el riesgo y la multa).</li>
      <li><strong>Tiempo justo</strong>: salir normal, salir con combustible extra, retrasar o preguntarte.</li>
      <li><strong>Avería nueva o que avanza</strong>: preguntarte o seguir volando mientras esté dentro de norma.</li>
      <li><strong>Avión o tripulación fuera de norma</strong>: preguntarte o cancelar y dejarlo en tierra.</li>
    </ul>
    <p>Lo que dejes en «Como el ajuste general» sigue el ajuste de Cuentas. Si en un vuelo se juntan dos situaciones, gana la regla más prudente.</p>`],
  ['Informes de aeropuerto', `
    <p>De un aeropuerto que no conoces solo tienes una idea general: los fenómenos que más se dan en el año y una horquilla de pasajeros. Para decidir bien, se encargan estudios en su ficha:</p>
    <ul>
      <li><strong>Estudio meteorológico</strong>: por estación, cuánto tiempo pasa <strong>bajo mínimos</strong> (no se puede aterrizar ni con su ILS), cuánto con el tiempo <strong>justo</strong> y la frecuencia de cada fenómeno. El clima no cambia: se paga una vez.</li>
      <li><strong>Estudio de mercado</strong>: demanda, quién vuela allí, a qué precio y cuántos pasajeros te tocarían. El mercado se mueve: vale doce meses.</li>
      <li>Los dos juntos salen más baratos. De tu base y de los destinos que ya vuelas lo sabes todo sin pagar.</li>
    </ul>`],
  ['Rutas, precios y pasajeros', `
    <ul>
      <li><strong>Pasajeros al día</strong>: es la demanda de todo el mercado en cada sentido. La compartes con las otras compañías que vuelan la ruta; toca un aeropuerto en el globo para ver quién opera.</li>
      <li><strong>Tarifa</strong>: la económica cobra un 20 % menos y atrae a más gente; la alta, un 25 % más y llena menos. Hasta la liberalización, muchos precios están regulados.</li>
      <li><strong>Servicio a bordo</strong>: el básico ahorra catering pero espanta a algún pasajero y baja la reputación; el superior cuesta más del doble y gana pasajeros y prestigio.</li>
      <li><strong>Vueltas al día</strong>: más vueltas, más plazas y más horas de avión (y antes llegan las revisiones). Si la ocupación baja, sobran vueltas.</li>
      <li>En rutas turísticas pesa sobre todo el <strong>precio</strong>; en las de negocios, la <strong>puntualidad</strong>.</li>
    </ul>`],
  ['Mantenimiento y averías', `
    <ul>
      <li><strong>Revisión A</strong> cada 150–200 horas de vuelo: es corta y se hace de noche en la base (automática si lo marcas en Cuentas).</li>
      <li><strong>Revisión C</strong> cada 2.500–3.500 horas y <strong>estructural</strong> cada muchas más: el avión pasa días en el hangar. Cada <strong>motor</strong> tiene además su revisión general por horas.</li>
      <li>Se permite pasarse un 10 % del intervalo; después, el avión está <strong>fuera de norma</strong>.</li>
      <li>Las averías avanzan por fases: <strong>indicio</strong> (la tripulación nota algo raro), <strong>anomalía</strong> (una inspección lo confirma) y <strong>diagnóstico</strong>. Cada inspección sirve para unas averías concretas: boroscopia para el interior del motor, análisis de aceite para el desgaste, visual para lo que se ve…</li>
      <li>Algunas averías confirmadas se pueden <strong>aplazar</strong> unos días (lista MEL) para seguir volando hasta poder repararlas.</li>
    </ul>`],
  ['Reputación', `
    <p>Los pasajeros eligen compañía por precio y por reputación, que tiene cuatro caras:</p>
    <ul>
      <li><strong>Puntualidad</strong>: baja con retrasos, desvíos y cancelaciones.</li>
      <li><strong>Seguridad</strong>: cae de golpe con incidentes y accidentes y se recupera despacio volando limpio.</li>
      <li><strong>Servicio</strong>: el servicio a bordo y la edad de los aviones.</li>
      <li><strong>Prestigio</strong>: lento; sube con una red grande, flota moderna y años sin accidentes.</li>
    </ul>`],
  ['Dinero', `
    <ul>
      <li>Cada vuelo cobra billetes y paga combustible, tasas, tripulación y catering. Cada día se pagan la base, la administración, la tripulación fija, el seguro y las noches fuera de la base.</li>
      <li>En Cuentas pides o devuelves <strong>préstamos</strong> (9 % de interés al año). El límite crece con el valor de tu flota.</li>
      <li>Si la caja se queda en negativo, el banco la cubre mientras no pases del límite; si no puede, quiebra.</li>
    </ul>`],
  ['El mundo y la velocidad', `
    <ul>
      <li>Pasan cosas de la historia real (crisis del petróleo, liberalización, aviones nuevos) y otras que pueden o no ocurrir. Las grandes salen en el Diario Nacional; todas, en Mundo.</li>
      <li>Las demás compañías abren y cierran rutas cada mes, y bajan precios donde compites con ellas.</li>
      <li><strong>Velocidad</strong>: con ▶ una hora de vuelo dura unos segundos; ▶▶ pasa un día en medio minuto; ▶▶▶ es para dejar correr meses. Con todos los aviones en tierra, el reloj va más deprisa.</li>
      <li><strong>Nueva partida</strong>: en Mundo → Tu compañía.</li>
    </ul>`],
];

export const htmlComoSeJuega = () => `<details class="bloque como-se-juega"><summary>¿Cómo se juega?</summary>${SECCIONES[0][1]}</details>`;

export function htmlAyuda() {
  return `
  <h2 class="titulo-modal">Ayuda</h2>
  ${htmlInstructor('Te cuento lo básico para que no estrelles la compañía el primer mes. Abre lo que necesites; lo tienes siempre en el botón «?» de arriba.')}
  <div class="ayuda">${SECCIONES.map(([t, html], i) => `<details class="bloque" ${i === 0 ? 'open' : ''}><summary>${t}</summary>${html}</details>`).join('')}</div>
  <button class="btn" data-cerrar>Cerrar</button>`;
}

const CONSEJOS = {
  hoja: 'Tu primera hoja de despacho. Mira el tiempo en destino y sus mínimos, el riesgo y si el avión arrastra alguna avería. Si dudas, el combustible extra da margen. Y si siempre vas a decidir lo mismo en una ruta, déjalo puesto en sus Reglas de despacho.',
};

export function htmlConsejo(id) {
  return `${htmlInstructor(CONSEJOS[id] ?? '')}
  <div class="fila-botones"><button class="btn btn-sec" data-accion-modal="ayuda">Ver la ayuda</button><button class="btn" data-cerrar>Entendido</button></div>`;
}
