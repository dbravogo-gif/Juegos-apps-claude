// El reloj del juego cuenta minutos desde el 1 de enero de 1976 a las 00:00. No hay husos
// horarios: todo va en la hora de la compañía.

export const MIN_HORA = 60;
export const MIN_DIA = 1440;
const ORIGEN = Date.UTC(1976, 0, 1);

export const fecha = (t) => new Date(ORIGEN + t * 60000);
export const dia = (t) => Math.floor(t / MIN_DIA);
export const hora = (t) => Math.floor((t % MIN_DIA) / MIN_HORA);
export const anio = (t) => fecha(t).getUTCFullYear();
export const mes = (t) => fecha(t).getUTCMonth();

// Año con decimales, para lo que cambia poco a poco con la época.
export function anioDecimal(t) {
  const f = fecha(t);
  const y = f.getUTCFullYear();
  const ini = Date.UTC(y, 0, 1);
  return y + (f.getTime() - ini) / (Date.UTC(y + 1, 0, 1) - ini);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const nombreMes = (m) => MESES[m];

export function textoFecha(t, { corta = false } = {}) {
  const f = fecha(t);
  const m = corta ? MESES_CORTOS[f.getUTCMonth()] : `de ${MESES[f.getUTCMonth()]} de`;
  return corta
    ? `${f.getUTCDate()} ${m} ${f.getUTCFullYear()}`
    : `${f.getUTCDate()} ${m} ${f.getUTCFullYear()}`;
}

export function textoHora(t) {
  const h = hora(t);
  const m = Math.floor(t % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
