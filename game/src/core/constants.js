// Valores de diseño. Se ajustan tras simular; ningún módulo debe repetirlos por su cuenta.

export const PESOS_EJERCICIO = {
  principal: 3,
  secundario: 2,
  opcional: 0,
};

// Factor del peso que aporta cada estado. `justificado` se excluye del denominador.
export const FACTOR_ESTADO = {
  completado: 1,
  sustituido: 1,
  parcial: 0.5,
  omitido: 0,
};

// Tope de peso que puede excluirse por molestia/lesión antes de que el exceso cuente como omitido.
// Sin este tope, marcar todo como justificado daría 100 % de cumplimiento haciendo un solo ejercicio.
export const MAX_PESO_JUSTIFICADO = 0.4;

export const UMBRAL_DIA_CUMPLIDO = {
  entreno: 0.75,
  comida: 0.7,
};

// Un día por debajo del umbral de cumplido rinde la mitad. Esfuerzo justo por encima del
// umbral (el principiante al 80 %) cobra entero; abandonar la sesión a medias no.
export const FACTOR_DIA_FALLADO = 0.5;

// Cumplimiento mínimo del día para desbloquear actividades extra (talar, cocinar, combates opcionales).
export const UMBRAL_EXTRAS = 0.85;

// Vías alternativas a ese 85 %: cumplir el día teniendo la racha viva, o cumplirlo
// mejorando la propia media reciente.
export const VENTANA_MEDIA_RECIENTE = 14;
export const MIN_REGISTROS_PARA_MEDIA = 3;

// La mejora sobre la media debe ser real: sin este margen, una diferencia de milésimas
// (ruido de coma flotante) decidiría si hay extras o no.
export const MARGEN_MEJORA = 0.02;

// Los extras no pueden superar esta fracción de lo ganado ese día con actividad real.
export const TOPE_EXTRAS = 0.3;

export const RECOMPENSA_BASE = {
  entreno: { xp: 100, monedas: 50 },
  comida: { xp: 40, monedas: 20 },
};

export const PUNTUACION_COMIDA = {
  completo: 1,
  excepcion_menor: 0.9,
  incumplido: 0,
};

export const VENTANA_RACHA = 7;

// Días exigidos que se pueden fallar dentro de la ventana sin romper la racha.
// Los descansos planificados no se exigen, así que no consumen este margen.
export const DIAS_FALLO_PERMITIDOS = 1;

// Escalones de bonus por semanas completas de racha. El índice 0 es "menos de 7 días".
export const BONUS_RACHA = {
  entreno: [0, 0.05, 0.1, 0.15, 0.2, 0.25],
  comida: [0, 0.05, 0.1, 0.15, 0.2],
};

export const BONUS_COMBINADO = 0.15;

// Al romper una racha se conserva la mitad de los días acumulados en lugar de reiniciar a cero.
export const RETENCION_AL_ROMPER = 0.5;

export const EXENCIONES = {
  comidaPorSemana: 2,
  entrenoPorAnio: 6,
  diasPorExencionEntreno: 3,
};

// Valor de reventa: se recupera el 25 % del precio de compra.
export const FACTOR_REVENTA = 0.25;

// El primer nivel salía por 180 XP, poco más de un día de registro, y con él llegaba media
// zona de golpe. El suelo encarece los primeros niveles sin tocar los altos: multiplicar la
// curva entera habría dejado las zonas 2 y 3 fuera de alcance en una prueba de dos meses.
export const NIVELES = {
  base: 180,
  suelo: 260,
  exponente: 1.25,
  maximo: 60,
};

// Combates que caben en un día. Pelear es la recompensa de haber entrenado, no un atajo:
// sin este tope se puede vaciar una zona entera en una tarde, que es justo lo que pasaba.
// Una derrota también consume vigor, para que reintentar a ciegas cueste algo.
export const VIGOR = {
  base: 2,
  porDiaCumplido: 2,
  coste: { normal: 1, jefe: 2 },
};
