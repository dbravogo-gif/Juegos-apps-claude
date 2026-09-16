import { NIVELES } from '../constants.js';

/** XP necesaria para pasar de `nivel` al siguiente. */
export function xpParaSubirDe(nivel) {
  return Math.round((NIVELES.base * nivel ** NIVELES.exponente) / 10) * 10;
}

/** Nivel alcanzado con una XP acumulada, y progreso dentro del nivel actual. */
export function nivelDesdeXp(xpTotal) {
  let nivel = 1;
  let restante = xpTotal;
  while (nivel < NIVELES.maximo && restante >= xpParaSubirDe(nivel)) {
    restante -= xpParaSubirDe(nivel);
    nivel += 1;
  }
  const necesaria = nivel < NIVELES.maximo ? xpParaSubirDe(nivel) : 0;
  return { nivel, xpEnNivel: restante, xpParaSiguiente: necesaria };
}
