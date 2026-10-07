// Familias de motor.
//
// Cifras de mantenimiento y coste: APROXIMADAS para el juego (dólares de 1976). Los intervalos
// de revisión general son del orden de los publicados para cada época, no los de un operador
// concreto. Fuentes y nivel de confianza en FUENTES.md.
//
//   tecnologia   turbohelice | turborreactor | turbofan-bajo | turbofan-alto
//   intervalo    horas entre revisiones generales (visita a taller), aprox.
//   costeRG      coste de una revisión general, aprox.
//   tasaAverias  multiplica la aparición de averías de motor (1 = normal para su época)
//   alquilerDia  coste diario de alquilar un motor de repuesto mientras el propio está en taller
//   ficticio     motores inventados para los aviones ficticios, inspirados en la práctica real

const M = (id, nombre, tecnologia, intervalo, costeRG, tasaAverias, alquilerDia, extra = {}) => ({
  id, nombre, tecnologia, intervalo, costeRG, tasaAverias, alquilerDia, ficticio: false, nota: '', ...extra,
});

export const MOTORES = Object.fromEntries([
  M('dart', 'Rolls-Royce Dart', 'turbohelice', 5000, 110e3, 0.8, 250, {
    nota: 'Uno de los turbohélices más fiables de su época.',
  }),
  M('tpe331', 'Garrett TPE331', 'turbohelice', 3500, 45e3, 0.9, 120),
  M('avon', 'Rolls-Royce Avon', 'turborreactor', 4000, 220e3, 1.2, 450, {
    nota: 'Turborreactor puro: ruidoso y de consumo alto.',
  }),
  M('spey', 'Rolls-Royce Spey', 'turbofan-bajo', 6000, 280e3, 1, 500),
  M('jt8d', 'Pratt & Whitney JT8D', 'turbofan-bajo', 6000, 320e3, 1, 550, {
    nota: 'El motor de casi todos los birreactores y trirreactores de corto alcance de la época.',
  }),
  M('jt3d', 'Pratt & Whitney JT3D', 'turbofan-bajo', 6000, 380e3, 1.05, 650),
  M('cf6', 'General Electric CF6-50', 'turbofan-alto', 5000, 850e3, 1, 1400),
  M('jt9d', 'Pratt & Whitney JT9D-7', 'turbofan-alto', 4500, 950e3, 1.25, 1500, {
    nota: 'Las primeras versiones tuvieron problemas de juventud.',
  }),
  M('rb211', 'Rolls-Royce RB211-22B', 'turbofan-alto', 4500, 950e3, 1.15, 1500, {
    nota: 'Su desarrollo llevó a Rolls-Royce a la quiebra en 1971.',
  }),

  M('olympus', 'Rolls-Royce/Snecma Olympus 593', 'turborreactor', 3000, 2.5e6, 1.1, 4000, {
    nota: 'Turborreactor con poscombustión del Concorde. Mantenimiento muy especializado.',
  }),

  // Llegan con los años
  M('jt8d200', 'Pratt & Whitney JT8D-200', 'turbofan-bajo', 8000, 450e3, 0.85, 650),
  M('cfm56', 'CFM International CFM56', 'turbofan-alto', 10000, 900e3, 0.6, 1300),
  M('pw100', 'Pratt & Whitney Canada PW100', 'turbohelice', 5000, 150e3, 0.8, 300),
  M('tay', 'Rolls-Royce Tay', 'turbofan-alto', 8000, 500e3, 0.75, 800),
  M('rb211535', 'Rolls-Royce RB211-535', 'turbofan-alto', 9000, 1.1e6, 0.7, 1500),
  M('cf680', 'General Electric CF6-80A', 'turbofan-alto', 8000, 1.2e6, 0.75, 1600),

  // Ficticios
  M('tv24', 'Volkov TV-24', 'turbohelice', 2000, 90e3, 1.3, 220, {
    ficticio: true,
    nota: 'Revisión general cada pocas horas, como en la práctica soviética de los 60. Repuestos lentos.',
  }),
  M('d31', 'Sobolev D-31', 'turbofan-bajo', 3000, 230e3, 1.2, 450, {
    ficticio: true,
    nota: 'Robusto pero sediento. Repuestos lentos.',
  }),
].map((m) => [m.id, m]));
