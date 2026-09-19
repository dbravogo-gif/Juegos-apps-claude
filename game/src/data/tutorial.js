/**
 * Guion del recorrido guiado. Es contenido, no lógica: cada paso dice a qué sección lleva,
 * qué resalta y qué cuenta el héroe.
 *
 * `guia` es el atributo `data-guia` del elemento a señalar. Sin él, el paso se cuenta en
 * medio de la pantalla. Se apunta a `data-guia` y no a selectores de CSS para que cambiar
 * el aspecto de una vista no rompa el tutorial en silencio.
 *
 * Es a propósito corto: enseña dónde está cada cosa y se detiene en lo que nadie adivina
 * —las rachas y el vigor—, no en todo lo que la app sabe hacer.
 */
export const POSES_GUIA = { saluda: 0, senala: 1, aprueba: 2 };

export const PASOS = [
  {
    vista: 'inicio',
    pose: 'saluda',
    titulo: 'Hola',
    texto:
      'Soy tu héroe. Lo que hagas en el gimnasio y en la mesa me hace más fuerte a mí. ' +
      'Deja que te enseñe esto en un minuto.',
  },
  {
    vista: 'inicio',
    guia: 'nivel',
    pose: 'senala',
    titulo: 'Tu nivel',
    texto:
      'Cada día que registras da experiencia. Al subir de nivel se abren zonas nuevas, ' +
      'tiendas y equipo. Aquí lo tienes siempre a la vista.',
  },
  {
    vista: 'entreno',
    guia: 'eleccion',
    pose: 'senala',
    titulo: 'El día de entreno',
    texto:
      'No hay calendario fijo: cada día eliges qué toca. Una de tus rutinas, descanso, o ' +
      'deporte de fuera del gimnasio, que no penaliza.',
  },
  {
    vista: 'entreno',
    guia: 'plan-rutina',
    pose: 'senala',
    titulo: 'Tus rutinas',
    texto:
      'Ahí dentro creas las rutinas que quieras, ejercicio a ejercicio, y dices cuántos ' +
      'días a la semana piensas entrenar.',
  },
  {
    vista: 'dieta',
    guia: 'plan-dieta',
    pose: 'senala',
    titulo: 'La dieta',
    texto:
      'Escribes una vez lo que piensas comer cada día de la semana. Luego, aquí, solo ' +
      'tienes que decir si lo has cumplido.',
  },
  {
    vista: 'inicio',
    guia: 'rachas',
    pose: 'aprueba',
    titulo: 'Las rachas',
    texto:
      'Esto es lo único que conviene entender bien. La racha no te exige entrenar todos ' +
      'los días: te exige cumplir tu compromiso semanal. Fallar un día no la rompe. ' +
      'Dejar de aparecer, sí.',
  },
  {
    vista: 'mundo',
    guia: 'parcela',
    pose: 'senala',
    titulo: 'Tu sitio',
    texto:
      'Lo que ganas se gasta aquí: decoras tu parcela y peleas en las zonas. Pelear tiene ' +
      'un límite al día, y cumplir el día te da más combates.',
  },
  {
    vista: 'inicio',
    pose: 'aprueba',
    titulo: 'Ya está',
    texto: 'Nada más. Registra el día de hoy y empezamos. Puedes volver a ver esto en Ajustes.',
  },
];
