// Texto original de la información de protección de datos (RGPD, art. 13). El entrenador puede
// cambiarlo desde el panel (pestaña Club): entonces manda el que haya guardado.
// Texto orientativo redactado sin asesoría jurídica: el club debe revisarlo antes de usarlo.

import { RESPONSABLE } from '../config.js';
import { VERSION_PRIVACIDAD } from '../nucleo/privacidad.js';

export function politicaPorDefecto() {
  return {
    version: VERSION_PRIVACIDAD,
    publicada: null,
    responsable: { nombre: RESPONSABLE?.nombre ?? '', email: RESPONSABLE?.email ?? '' },
    resumen: [
      'Tu entrenador ve tu plan y lo que valoras: esfuerzo, ejercicios hechos y duros, tiempos, comentarios y el enlace de Strava si lo añades.',
      'Lo usa solo para preparar y ajustar tus entrenamientos. Ni publicidad ni se vende a nadie.',
      'No pedimos email, teléfono ni ubicación. Se guarda en servidores de la Unión Europea.',
      'Puedes pedir verlo, corregirlo o borrarlo cuando quieras, y retirar tu permiso.',
    ],
    secciones: [
      { titulo: 'Qué datos se guardan', texto: 'El nombre con el que te da de alta tu entrenador y tu plan de entrenamiento.\n\nTus valoraciones: el esfuerzo de cada sesión, los ejercicios que has hecho y los que te han resultado demasiado duros, la distancia, el tiempo y el ritmo si los apuntas, tus comentarios y el enlace de Strava si lo añades.\n\nDatos técnicos: un identificador anónimo de tu móvil y la fecha en la que aceptaste esta información.\n\nNo se guarda tu email, tu teléfono ni tu ubicación.' },
      { titulo: 'Datos de salud', texto: 'El esfuerzo, las molestias o lo que cuentes sobre lesiones pueden ser datos de salud. Solo se tratan con tu consentimiento explícito, que das al aceptar (artículo 9.2.a del RGPD).' },
      { titulo: 'Para qué y con qué base', texto: 'Para preparar y ajustar tu plan y para que tu entrenador sepa cómo te van las sesiones. Es necesario para el servicio de entrenamiento que has contratado (artículo 6.1.b del RGPD) y, para los datos de salud, se basa en tu consentimiento.\n\nNo se usan para publicidad, no se venden y no se toman decisiones automáticas sobre ti.' },
      { titulo: 'Dónde se guardan', texto: 'En Google Firebase (Google Ireland Ltd.), que trata los datos por cuenta del responsable. La base de datos está en servidores de la Unión Europea. Algunos servicios técnicos de Google pueden tratar datos fuera de la UE con las garantías que exige el RGPD.' },
      { titulo: 'Cuánto tiempo', texto: 'Mientras sigas en el plan. Cuando te des de baja, tu entrenador borrará tus datos, y puedes pedir que lo haga antes.' },
      { titulo: 'Tus derechos', texto: 'Puedes acceder a tus datos, corregirlos, borrarlos, oponerte o limitar su uso, y pedir una copia en un archivo, escribiendo al email de contacto. Puedes retirar tu consentimiento en cualquier momento; lo anterior seguirá siendo válido.\n\nSi crees que no se respetan tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).' },
      { titulo: 'Menores', texto: 'Si tienes menos de 14 años, necesitas el permiso de tu madre, tu padre o tu tutor.' },
    ],
  };
}
