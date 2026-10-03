// Generado por tools/importar-bulkup.mjs a partir de Bulk Up. No editar a mano: se pisa.

/** Cómo se ejecuta cada tipo de movimiento. */
export const TIPOS_MOVIMIENTO = {
  "FUE": {
    "nombre": "Fuerza",
    "color": "#B23B3B",
    "como": "Concéntrica fuerte y relativamente rápida, sin perder técnica. Excéntrica controlada (2-3 s). Las últimas repeticiones deben costar, manteniendo buena ejecución."
  },
  "HIP": {
    "nombre": "Hipertrofia",
    "color": "#C97A2B",
    "como": "Concéntrica controlada/normal, con intención de mover el peso con fuerza. Excéntrica ~2-3 s. Recorrido amplio y controlado, sin convertir cada repetición en una tortura de 5 segundos."
  },
  "POT": {
    "nombre": "Potencia",
    "color": "#6B3FA0",
    "como": "Concéntrica EXPLOSIVA, máxima intención de velocidad. Vuelta/recuperación controlada. Descanso suficiente entre series; si empiezas a perder velocidad, para. Prioriza pocas repeticiones buenas sobre muchas agotado."
  },
  "MOV": {
    "nombre": "Movilidad",
    "color": "#2E8B57",
    "como": "Lento y controlado, buscando progresivamente el rango disponible, sin rebotes violentos. Respiración tranquila. No debería doler."
  },
  "UNI": {
    "nombre": "Unilateral",
    "color": "#C9A227",
    "como": "No tiene una velocidad propia: se ejecuta según su objetivo principal (fuerza, potencia o estabilidad), trabajando cada lado de forma independiente."
  },
  "EST": {
    "nombre": "Estabilidad / Equilibrio",
    "color": "#B58B00",
    "como": "Lento y preciso. Prioridad absoluta a la técnica, sin buscar fatiga. Si empiezas a tambalearte demasiado, la serie ha terminado."
  },
  "COR": {
    "nombre": "Core",
    "color": "#2F5D9F",
    "como": "El tronco resiste un movimiento indeseado (rotación, inclinación lateral, extensión lumbar...). Generalmente lento y muy controlado."
  },
  "CAR": {
    "nombre": "Carry",
    "color": "#2F5D9F",
    "como": "Transportar carga manteniendo una postura sólida: caminar de forma natural, tronco estable, sin balancearse, respiración controlada."
  },
  "COND": {
    "nombre": "Condicionamiento",
    "color": "#7A5230",
    "como": "Ritmo alto y cierto grado de fatiga buscado, con recuperación suficiente entre esfuerzos. No es hipertrofia ni potencia pura."
  },
  "COOR": {
    "nombre": "Coordinación / Locomoción",
    "color": "#2F5D9F",
    "como": "Controlado al inicio; después puede aumentar la velocidad manteniendo la coordinación. Prioridad: calidad del patrón, no agotamiento."
  },
  "ADU": {
    "nombre": "Aductores",
    "color": "#8A4B6E",
    "como": "Trabajo específico de aductores, generalmente isométrico o de baja carga. Progresión muy gradual: debe sentirse como trabajo muscular, nunca como dolor en la zona."
  }
};

export const FICHAS = [
  {
    "id": "e2_90_90_rotacion",
    "nombre": "90/90 + rotación",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Movilidad de cadera + control",
    "ejecucion": [
      "Desde 90/90, realiza la rotación de cadera de forma controlada.",
      "Añade la rotación del tronco según la variante.",
      "Prioriza amplitud controlada."
    ],
    "errores": [],
    "consejos": [],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 6,
      "repMax": 6,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_90_90_hip_switches",
    "nombre": "90/90 hip switches",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Rotación interna/externa de cadera",
    "ejecucion": [
      "Siéntate con ambas piernas flexionadas aproximadamente a 90°.",
      "Mantén el tronco relativamente erguido.",
      "Gira ambas rodillas de un lado al otro de forma controlada.",
      "Intenta que el movimiento proceda principalmente de las caderas.",
      "Llega al límite cómodo del rango y vuelve."
    ],
    "errores": [
      "Dejarse caer de un lado a otro.",
      "Utilizar impulso.",
      "Compensar excesivamente con el tronco.",
      "Forzar la rodilla.",
      "Buscar profundidad sacrificando control."
    ],
    "consejos": [
      "Prioriza control sobre amplitud.",
      "Puedes apoyar las manos detrás al principio.",
      "Con el tiempo intenta realizarlo con menos apoyo."
    ],
    "progresion": [
      "Mayor amplitud manteniendo control.",
      "Menos apoyo de manos.",
      "Añadir pausas al final del rango."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "aperturas",
    "nombre": "Aperturas",
    "grupo": [
      "Pectoral mayor",
      "Deltoides anterior"
    ],
    "tipos": [],
    "objetivo": "Aislar el pectoral trabajando su función de aducción horizontal.",
    "ejecucion": [
      "Con ligera flexión de codo fija, abre los brazos en arco controlado hasta sentir estiramiento del pecho y vuelve juntando las mancuernas arriba sin chocarlas con fuerza."
    ],
    "errores": [
      "Flexionar y extender el codo como si fuera un press.",
      "Bajar demasiado y forzar el hombro."
    ],
    "consejos": [
      "Piensa en 'abrazar un tronco de árbol' para mantener el arco correcto."
    ],
    "progresion": [
      "Cuando completes 12 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 10 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_bear_crawl_d4",
    "nombre": "Bear crawl",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "COR",
      "COOR"
    ],
    "objetivo": "Core + coordinación + locomoción",
    "ejecucion": [
      "Posición de cuadrupedia con rodillas ligeramente separadas del suelo.",
      "Espalda neutra.",
      "Avanza moviendo mano y pierna contraria.",
      "Mantén las caderas relativamente bajas y estables.",
      "Realiza pasos cortos y controlados."
    ],
    "errores": [
      "Elevar demasiado la cadera.",
      "Balancear excesivamente el tronco.",
      "Mover mano y pierna del mismo lado.",
      "Dar pasos demasiado grandes.",
      "Aguantar la respiración."
    ],
    "consejos": [
      "Empieza despacio.",
      "La calidad de coordinación importa más que recorrer mucha distancia.",
      "Mantén abdomen activo."
    ],
    "progresion": [
      "Aumentar distancia/tiempo.",
      "Aumentar ligeramente velocidad.",
      "Variantes hacia atrás o laterales."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 20,
      "repMax": 30,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_bird_dog",
    "nombre": "Bird dog",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "COR"
    ],
    "objetivo": "Estabilidad lumbo-pélvica",
    "ejecucion": [
      "Colócate en cuadrupedia.",
      "Manos debajo de hombros y rodillas debajo de caderas.",
      "Activa ligeramente el abdomen.",
      "Extiende simultáneamente brazo y pierna contrarios.",
      "Mantén pelvis y columna estables.",
      "Haz una breve pausa.",
      "Regresa lentamente."
    ],
    "errores": [
      "Girar la pelvis.",
      "Arquear la zona lumbar.",
      "Elevar demasiado la pierna.",
      "Hacerlo deprisa.",
      "Mover el tronco al extender las extremidades."
    ],
    "consejos": [
      "Imagina que tienes un vaso de agua sobre la zona lumbar.",
      "No necesitas levantar mucho brazo/pierna.",
      "La estabilidad es más importante que la amplitud."
    ],
    "progresion": [
      "Pausa más larga.",
      "Mayor control.",
      "Añadir resistencia ligera.",
      "Variantes más difíciles."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_bosu_squat_reach",
    "nombre": "BOSU squat + reach",
    "grupo": [],
    "tipos": [
      "EST",
      "UNI"
    ],
    "objetivo": "Control corporal + equilibrio dinámico",
    "ejecucion": [
      "Colócate sobre el BOSU con ambos pies.",
      "Realiza una sentadilla controlada.",
      "Al subir, realiza el alcance con los brazos indicado.",
      "Mantén rodillas alineadas con los pies.",
      "Mantén el tronco estable."
    ],
    "errores": [
      "Buscar profundidad a costa de perder estabilidad.",
      "Rodillas hacia dentro.",
      "Utilizar rebote.",
      "Mover excesivamente el tronco.",
      "Hacer el ejercicio rápido para \"sobrevivir\"."
    ],
    "consejos": [
      "La calidad es más importante que la profundidad.",
      "Si el BOSU dificulta demasiado una buena sentadilla, reduce el rango."
    ],
    "progresion": [
      "Mayor rango.",
      "Mayor control.",
      "Alcances más amplios.",
      "Posteriormente ligera carga."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "d_box_jump",
    "nombre": "Box Jump",
    "grupo": [
      "Pierna"
    ],
    "tipos": [],
    "objetivo": "",
    "ejecucion": [
      "Priorizar velocidad y explosividad sobre la altura del cajón."
    ],
    "errores": [],
    "consejos": [],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 6,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_sled_push",
    "nombre": "Caminata en cinta con alta inclinación",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "COND"
    ],
    "objetivo": "Acondicionamiento de piernas, glúteos y capacidad anaeróbica, con bastante menor impacto que correr",
    "ejecucion": [
      "Configura una inclinación alta.",
      "Camina a una velocidad exigente pero que puedas mantener durante los 30-45 s.",
      "Mantén el tronco relativamente erguido y da pasos firmes.",
      "Empuja el suelo con cada paso, intentando utilizar activamente glúteos y piernas.",
      "Evita apoyarte excesivamente en las barras de la cinta.",
      "Descansa 60-90 s entre series."
    ],
    "errores": [
      "Sujetarse con fuerza a las barras.",
      "Inclinar demasiado el cuerpo hacia delante.",
      "Convertirlo en una caminata demasiado cómoda.",
      "Empezar demasiado rápido y no poder mantener la intensidad en las últimas series."
    ],
    "consejos": [
      "Busca terminar cada intervalo con esfuerzo alto pero controlado, aproximadamente 7-8/10.",
      "Como ya haces bastante actividad deportiva, esta parte es modulable: si esa semana ha habido bastante squash/fútbol/pádel, puedes reducirla o eliminarla."
    ],
    "progresion": [
      "Primero aumenta el tiempo o la inclinación manteniendo la técnica.",
      "Después aumenta ligeramente la velocidad."
    ],
    "observaciones": [
      "Sustituye al Sled push (no disponible en tu gimnasio)."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 30,
      "repMax": 45,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 75
    }
  },
  {
    "id": "e2_copenhagen_plank_corto",
    "nombre": "Copenhagen plank corto",
    "grupo": [
      "Core",
      "Aductores"
    ],
    "tipos": [
      "COR",
      "ADU"
    ],
    "objetivo": "Core + aductores",
    "ejecucion": [
      "Apoya la rodilla de la pierna superior sobre un banco.",
      "Apoya el antebrazo debajo del hombro.",
      "Eleva la pelvis.",
      "Mantén cuerpo alineado.",
      "La pierna inferior permanece relajada o ligeramente separada.",
      "Mantén la posición sin dejar caer la pelvis."
    ],
    "errores": [
      "Dejar caer la pelvis.",
      "Rotar el tronco.",
      "Colocar mal el hombro.",
      "Utilizar una variante demasiado difícil.",
      "Continuar pese a dolor agudo en el aductor."
    ],
    "consejos": [
      "Especialmente interesante como complemento del trabajo específico de aductores.",
      "Debe sentirse como trabajo muscular, no como dolor en la zona.",
      "Empieza conservador."
    ],
    "progresion": [
      "Aumentar tiempo.",
      "Aumentar altura/longitud de apoyo.",
      "Pasar de rodilla a tobillo cuando tengas buena tolerancia."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 20,
      "repMax": 30,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "LA06",
    "nombre": "Crunch en polea",
    "grupo": [
      "Recto abdominal"
    ],
    "tipos": [],
    "objetivo": "Trabajo principal del abdomen mediante flexión de columna.",
    "ejecucion": [
      "Mantener la pelvis estable.",
      "Flexionar el tronco.",
      "Subir lentamente."
    ],
    "errores": [
      "Tirar con los brazos.",
      "Mover la cadera.",
      "Recorrido corto."
    ],
    "consejos": [
      "Piensa en acercar costillas y pelvis.",
      "Exhala al bajar."
    ],
    "progresion": [
      "Llegar a 15 repeticiones.",
      "Aumentar ligeramente el peso."
    ],
    "observaciones": [
      "Priorizar la contracción abdominal."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 60
    }
  },
  {
    "id": "UB06",
    "nombre": "Curl Bayesian en polea",
    "grupo": [
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Curl realizado con el brazo retrasado para enfatizar el estiramiento del bíceps.",
    "ejecucion": [
      "Mantener el brazo ligeramente detrás del cuerpo.",
      "Codo fijo.",
      "Bajar completamente."
    ],
    "errores": [
      "Balancearse.",
      "Adelantar el hombro.",
      "Acortar recorrido."
    ],
    "consejos": [
      "Mantén tensión constante.",
      "Movimiento suave."
    ],
    "progresion": [
      "Llegar a 12 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Buscar máxima amplitud."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "curl_biceps",
    "nombre": "Curl de bíceps",
    "grupo": [
      "Bíceps braquial",
      "Braquial anterior"
    ],
    "tipos": [],
    "objetivo": "Aislar el bíceps braquial.",
    "ejecucion": [
      "Codos pegados al cuerpo y fijos.",
      "Flexiona sin balancear el torso ni usar los hombros como impulso."
    ],
    "errores": [
      "Balanceo de cadera/tronco.",
      "Bajar la barra a medias."
    ],
    "consejos": [
      "Controla la fase excéntrica 2-3 segundos."
    ],
    "progresion": [
      "Cuando completes 12 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 10 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 4500
    }
  },
  {
    "id": "LA04",
    "nombre": "Curl femoral sentado",
    "grupo": [
      "Isquiotibiales"
    ],
    "tipos": [],
    "objetivo": "Trabajo específico de isquiotibiales.",
    "ejecucion": [
      "Ajustar correctamente el respaldo.",
      "Flexionar completamente.",
      "Descender lentamente."
    ],
    "errores": [
      "Impulsarse.",
      "Recorrido corto.",
      "Soltar el peso en la bajada."
    ],
    "consejos": [
      "Aprieta un segundo abajo.",
      "Controla toda la fase excéntrica."
    ],
    "progresion": [
      "Completar 12 repeticiones.",
      "Subir peso."
    ],
    "observaciones": [
      "Buscar sensación de trabajo, no mover mucho peso."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 90
    }
  },
  {
    "id": "LB04",
    "nombre": "Curl femoral tumbado",
    "grupo": [
      "Isquiotibiales"
    ],
    "tipos": [],
    "objetivo": "Trabajo específico del femoral con especial atención al control.",
    "ejecucion": [
      "Cadera pegada al banco.",
      "Flexionar completamente.",
      "Descender lentamente."
    ],
    "errores": [
      "Separar la pelvis.",
      "Balancearse.",
      "Soltar el peso."
    ],
    "consejos": [
      "Aprieta un segundo arriba.",
      "Mantén tensión continua."
    ],
    "progresion": [
      "Alcanzar 12 repeticiones.",
      "Incrementar peso."
    ],
    "observaciones": [
      "Buscar sensación muscular, no mover más peso."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "UA06",
    "nombre": "Curl inclinado con mancuernas",
    "grupo": [
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Excelente para trabajar el bíceps en posición estirada.",
    "ejecucion": [
      "Hombros atrás.",
      "Codos quietos.",
      "Subir sin balanceo.",
      "Bajar completamente."
    ],
    "errores": [
      "Balancearse.",
      "Adelantar hombros.",
      "Recorrido parcial."
    ],
    "consejos": [
      "Mantén tensión continua.",
      "No uses impulso."
    ],
    "progresion": [
      "Llegar a 12 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Buscar máxima amplitud."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "LB07",
    "nombre": "Dead Bug",
    "grupo": [
      "Core profundo",
      "Transverso abdominal"
    ],
    "tipos": [],
    "objetivo": "Ejercicio de control lumbo-pélvico para mejorar la estabilidad del core.",
    "ejecucion": [
      "Zona lumbar pegada al suelo.",
      "Extender brazo y pierna opuestos.",
      "Regresar lentamente.",
      "Alternar lados."
    ],
    "errores": [
      "Separar la zona lumbar.",
      "Hacer el movimiento demasiado rápido.",
      "Perder coordinación."
    ],
    "consejos": [
      "Exhala al extender.",
      "Prioriza el control sobre la velocidad."
    ],
    "progresion": [
      "Llegar a 12 repeticiones por lado.",
      "Añadir una pausa de 2 segundos con las extremidades extendidas antes de aumentar la dificultad."
    ],
    "observaciones": [
      "Si la espalda se despega del suelo, reducir el rango de movimiento."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 45
    }
  },
  {
    "id": "dominadas",
    "nombre": "Dominadas",
    "grupo": [
      "Dorsal ancho",
      "Bíceps",
      "Romboides"
    ],
    "tipos": [],
    "objetivo": "Desarrollar la espalda en anchura, con fuerte implicación de bíceps.",
    "ejecucion": [
      "Cuelga con escápulas activas, tira llevando el pecho hacia la barra, controla la bajada completa hasta extensión total del brazo."
    ],
    "errores": [
      "No completar el rango de bajada.",
      "Balancear el cuerpo para generar impulso."
    ],
    "consejos": [
      "Si no llegas a las repeticiones objetivo, usa banda elástica de asistencia antes que hacer trampa."
    ],
    "progresion": [
      "Cuando completes 10 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 6 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 4,
      "repMin": 6,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 150
    }
  },
  {
    "id": "e2_dominadas_asistidas",
    "nombre": "Dominadas asistidas",
    "grupo": [
      "Espalda",
      "Bíceps"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Espalda + bíceps",
    "ejecucion": [
      "Agarra la barra con una anchura cómoda.",
      "Comienza con los brazos extendidos sin perder el control de los hombros.",
      "Lleva los codos hacia abajo y atrás mientras subes.",
      "Busca llevar el pecho hacia la barra.",
      "Baja controladamente hasta casi extender completamente los brazos."
    ],
    "errores": [
      "Balancear las piernas.",
      "Tirar únicamente con los bíceps.",
      "Acortar demasiado el recorrido.",
      "Subir los hombros hacia las orejas."
    ],
    "consejos": [
      "Piensa en \"llevar los codos hacia los bolsillos\" en lugar de intentar tirar de la barra con las manos."
    ],
    "progresion": [
      "Cuando hagas 3×10 con buena técnica y RIR 1-2, reduce ligeramente la asistencia."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 90
    }
  },
  {
    "id": "UA02",
    "nombre": "Dominadas asistidas / Jalón al pecho",
    "grupo": [
      "Dorsal ancho",
      "Romboides",
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Movimiento principal de tracción vertical.",
    "ejecucion": [
      "Sacar pecho.",
      "Iniciar bajando las escápulas.",
      "Llevar los codos hacia las costillas.",
      "No tirar con los brazos únicamente.",
      "Subida completamente controlada."
    ],
    "errores": [
      "Balancearse.",
      "Tirar detrás de la nuca.",
      "Encoger hombros.",
      "Recorrido incompleto."
    ],
    "consejos": [
      "Piensa en llevar los codos al bolsillo.",
      "Mantén tensión constante.",
      "Controla toda la subida."
    ],
    "progresion": [
      "Completar 10 repeticiones en todas las series.",
      "Reducir asistencia o aumentar peso."
    ],
    "observaciones": [
      "Buscar sentir el dorsal más que el bíceps."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_gemelo_unilateral_pie",
    "nombre": "Elevación de gemelo unilateral de pie",
    "grupo": [
      "Gemelo"
    ],
    "tipos": [
      "HIP",
      "EST"
    ],
    "objetivo": "Gemelo + estabilidad de tobillo",
    "ejecucion": [
      "Apoya la parte delantera del pie en un escalón si está disponible.",
      "Mantén la rodilla ligeramente flexionada.",
      "Baja el talón de forma controlada.",
      "Sube hasta la máxima elevación cómoda.",
      "Haz una breve pausa arriba.",
      "Mantén el tobillo alineado y evita que se vaya hacia dentro o fuera."
    ],
    "errores": [
      "Hacer rebotes.",
      "Recorrido corto.",
      "Bajar demasiado rápido.",
      "Dejar que el tobillo se desplace lateralmente.",
      "Utilizar demasiado impulso."
    ],
    "consejos": [
      "El recorrido completo importa mucho.",
      "Puedes sujetarte con una mano para concentrarte en el gemelo y no en el equilibrio.",
      "Si el equilibrio limita el ejercicio, apóyate más."
    ],
    "progresion": [
      "Primero llegar cómodamente a 15 repeticiones con 2-3 RIR.",
      "Después añadir peso.",
      "También puedes aumentar progresivamente el rango."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "elev_laterales",
    "nombre": "Elevaciones laterales",
    "grupo": [
      "Deltoides lateral",
      "Trapecio"
    ],
    "tipos": [],
    "objetivo": "Desarrollar el deltoides lateral (anchura de hombro).",
    "ejecucion": [
      "Eleva los brazos hacia los lados hasta la altura del hombro, codos ligeramente flexionados, liderando el movimiento con el codo, no con la mano."
    ],
    "errores": [
      "Usar impulso con la espalda.",
      "Subir por encima de la línea del hombro.",
      "Rotar la muñeca en exceso."
    ],
    "consejos": [
      "Controla mucho más la bajada que la subida; ahí está gran parte del estímulo."
    ],
    "progresion": [
      "Cuando completes 15 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 12 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 4500
    }
  },
  {
    "id": "UA05",
    "nombre": "Elevaciones laterales en polea",
    "grupo": [
      "Deltoides lateral"
    ],
    "tipos": [],
    "objetivo": "Ejercicio para desarrollar anchura de hombros.",
    "ejecucion": [
      "Brazo ligeramente flexionado.",
      "Elevar hasta la altura del hombro.",
      "Descender lentamente."
    ],
    "errores": [
      "Balancearse.",
      "Encoger trapecios.",
      "Subir demasiado."
    ],
    "consejos": [
      "Lidera el movimiento con el codo.",
      "Movimiento limpio.",
      "Peso moderado."
    ],
    "progresion": [
      "Alcanzar 15 repeticiones.",
      "Subir ligeramente el peso."
    ],
    "observaciones": [
      "Debe sentirse el deltoides, nunca el cuello."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "e2_equilibrio_unipodal_bosu",
    "nombre": "Equilibrio unipodal sobre BOSU",
    "grupo": [],
    "tipos": [
      "EST"
    ],
    "objetivo": "Propiocepción + estabilidad de tobillo/cadera",
    "ejecucion": [
      "Colócate sobre una pierna en el centro del BOSU.",
      "Mantén una ligera flexión de rodilla.",
      "Mantén pelvis y tronco estables.",
      "Mira a un punto fijo.",
      "Intenta mantener el pie activo y estable.",
      "Utiliza la otra pierna únicamente si pierdes el equilibrio."
    ],
    "errores": [
      "Bloquear completamente la rodilla.",
      "Inclinar excesivamente el tronco.",
      "Dejar que la rodilla colapse hacia dentro.",
      "Mirar continuamente al suelo.",
      "Convertirlo en un ejercicio de \"sobrevivir\" al BOSU."
    ],
    "consejos": [
      "El objetivo no es tambalearse lo máximo posible, sino controlar el cuerpo.",
      "Empieza cerca de un apoyo.",
      "Mantén el pie activo."
    ],
    "progresion": [
      "Más tiempo.",
      "Menos apoyo externo.",
      "Movimientos de brazos.",
      "Mayor inestabilidad.",
      "Ojos cerrados únicamente cuando la variante anterior sea completamente segura."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 30,
      "repMax": 40,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_estiramiento_flexor_cadera",
    "nombre": "Estiramiento activo de flexor de cadera",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Movilidad de cadera",
    "ejecucion": [
      "Colócate en posición de zancada con una rodilla en el suelo.",
      "Realiza una ligera retroversión pélvica.",
      "Aprieta el glúteo de la pierna atrasada.",
      "Avanza ligeramente la pelvis sin arquear la zona lumbar.",
      "Mantén la posición.",
      "Vuelve y repite."
    ],
    "errores": [
      "Arquear la zona lumbar.",
      "Avanzar demasiado la pelvis.",
      "No activar el glúteo.",
      "Convertirlo en un estiramiento lumbar."
    ],
    "consejos": [
      "Piensa en \"meter el culo hacia dentro\" antes de avanzar.",
      "Debes notar principalmente tensión delante de la cadera/muslo.",
      "No debe provocar dolor."
    ],
    "progresion": [
      "Mayor control y rango.",
      "Añadir elevación del brazo del lado que se estira.",
      "No hace falta añadir carga."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 30,
      "repMax": 30,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "LB03",
    "nombre": "Extensión de cuádriceps",
    "grupo": [
      "Cuádriceps"
    ],
    "tipos": [],
    "objetivo": "Trabajo específico de cuádriceps buscando máxima contracción.",
    "ejecucion": [
      "Ajustar correctamente el respaldo.",
      "Extender completamente.",
      "Bajar lentamente."
    ],
    "errores": [
      "Impulsarse.",
      "Soltar el peso.",
      "Medio recorrido."
    ],
    "consejos": [
      "Pausa un segundo arriba.",
      "Movimiento completamente controlado."
    ],
    "progresion": [
      "Llegar a 15 repeticiones.",
      "Subir peso."
    ],
    "observaciones": [
      "No bloquear violentamente la rodilla."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "UA07",
    "nombre": "Extensión de tríceps en cuerda",
    "grupo": [
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Aislamiento final para tríceps.",
    "ejecucion": [
      "Codos pegados al cuerpo.",
      "Separar ligeramente la cuerda al final.",
      "Controlar toda la subida."
    ],
    "errores": [
      "Abrir los codos.",
      "Balancear el cuerpo.",
      "Usar demasiado peso."
    ],
    "consejos": [
      "Aprieta un segundo abajo.",
      "Mantén tensión constante."
    ],
    "progresion": [
      "Alcanzar 12 repeticiones.",
      "Aumentar carga."
    ],
    "observaciones": [
      "No convertirlo en un press."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "UB07",
    "nombre": "Extensión de tríceps por encima de la cabeza en polea",
    "grupo": [
      "Tríceps (cabeza larga)"
    ],
    "tipos": [],
    "objetivo": "Trabajo específico de la cabeza larga del tríceps.",
    "ejecucion": [
      "Brazos fijos.",
      "Extender completamente.",
      "Regresar lentamente."
    ],
    "errores": [
      "Abrir los codos.",
      "Mover los hombros.",
      "Balancear el cuerpo."
    ],
    "consejos": [
      "Mantén los codos apuntando al frente.",
      "Aprieta un instante al extender."
    ],
    "progresion": [
      "Completar 12 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Mantener tensión durante todo el recorrido."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 75
    }
  },
  {
    "id": "e2_face_pull",
    "nombre": "Face pull",
    "grupo": [
      "Deltoides posterior",
      "Espalda alta"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Deltoides posterior + espalda alta",
    "ejecucion": [
      "Coloca el cable aproximadamente a la altura de la cara.",
      "Tira de la cuerda hacia la cara/separándola hacia ambos lados.",
      "Los codos se mantienen elevados pero cómodos.",
      "Termina con las manos aproximadamente a ambos lados de la cabeza.",
      "Regresa lentamente."
    ],
    "errores": [
      "Utilizar demasiado peso.",
      "Convertirlo en un remo.",
      "Arquear la espalda.",
      "Encoger los hombros.",
      "Hacer el movimiento con impulso."
    ],
    "consejos": [
      "Es un ejercicio de calidad, no para levantar grandes cargas.",
      "Si tienes que balancearte, reduce peso."
    ],
    "progresion": [
      "Aumentar repeticiones hasta 15 manteniendo técnica. Después subir ligeramente la carga."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_farmer_carry",
    "nombre": "Farmer carry",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "CAR"
    ],
    "objetivo": "Core + agarre + estabilidad",
    "ejecucion": [
      "Sujeta una carga pesada en cada mano.",
      "Mantén el tronco erguido.",
      "Hombros abajo y ligeramente atrás.",
      "Abdomen activo.",
      "Camina con pasos controlados.",
      "Evita balancearte lateralmente."
    ],
    "errores": [
      "Inclinarse hacia delante o atrás.",
      "Balancearse lateralmente.",
      "Encoger los hombros.",
      "Dar pasos excesivamente largos.",
      "Utilizar una carga que rompe la postura."
    ],
    "consejos": [
      "Piensa en \"caminar alto\".",
      "No necesitas caminar lentamente; necesitas caminar estable.",
      "La carga debe ser exigente sin deformar la técnica."
    ],
    "progresion": [
      "Aumentar distancia hasta ~40-50 m.",
      "Después aumentar ligeramente la carga.",
      "También puedes utilizar más peso manteniendo la misma distancia."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 30,
      "repMax": 40,
      "unidad": "m",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_flexiones_inclinadas",
    "nombre": "Flexiones inclinadas",
    "grupo": [
      "Pectoral",
      "Tríceps"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Pectoral + tríceps",
    "ejecucion": [
      "Manos sobre una superficie elevada, ligeramente más anchas que los hombros.",
      "Cuerpo formando una línea recta desde cabeza hasta pies.",
      "Desciende llevando el pecho hacia el apoyo.",
      "Codos aproximadamente a 30-45° respecto al tronco.",
      "Empuja hasta extender los brazos sin perder la posición corporal."
    ],
    "errores": [
      "Hundir la cadera.",
      "Sacar demasiado el culo.",
      "Abrir excesivamente los codos.",
      "Hacer medias repeticiones.",
      "Adelantar la cabeza para llegar antes al apoyo."
    ],
    "consejos": [
      "Cuanto más bajo esté el apoyo, más difícil.",
      "Mantén abdomen y glúteos activos."
    ],
    "progresion": [
      "Aumentar repeticiones hasta 15.",
      "Bajar progresivamente la altura del apoyo.",
      "Pasar a flexiones normales.",
      "Posteriormente añadir carga si fuera necesario."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "LB05",
    "nombre": "Gemelo de pie",
    "grupo": [
      "Gastrocnemio"
    ],
    "tipos": [],
    "objetivo": "Desarrollo del gemelo mediante recorrido completo.",
    "ejecucion": [
      "Descender completamente.",
      "Subir al máximo.",
      "Pausa breve arriba."
    ],
    "errores": [
      "Rebotar.",
      "Medio recorrido.",
      "Exceso de velocidad."
    ],
    "consejos": [
      "Movimiento lento.",
      "Mantén tensión continua.",
      "Estira completamente abajo."
    ],
    "progresion": [
      "Alcanzar 15 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "No sacrificar recorrido por carga."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 60
    }
  },
  {
    "id": "LA05",
    "nombre": "Gemelo sentado",
    "grupo": [
      "Sóleo"
    ],
    "tipos": [],
    "objetivo": "Desarrollo del sóleo mediante recorrido completo.",
    "ejecucion": [
      "Bajar completamente el talón.",
      "Subir al máximo.",
      "Pausa breve arriba."
    ],
    "errores": [
      "Hacer rebotes.",
      "Medio recorrido.",
      "Exceso de velocidad."
    ],
    "consejos": [
      "Movimiento lento.",
      "Sentir el estiramiento abajo.",
      "Mantener tensión constante."
    ],
    "progresion": [
      "Llegar a 15 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "No sacrificar recorrido."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 12,
      "repMax": 15,
      "unidad": "reps",
      "rirMin": 0,
      "rirMax": 1,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_goblet_squat",
    "nombre": "Goblet squat",
    "grupo": [
      "Piernas",
      "Core"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Piernas + core",
    "ejecucion": [
      "Sujeta la mancuerna delante del pecho.",
      "Pies aproximadamente al ancho de hombros.",
      "Desciende flexionando cadera y rodillas, manteniendo el pecho estable.",
      "Rodillas siguiendo la dirección de los pies.",
      "Baja hasta el rango que puedas controlar sin perder postura.",
      "Sube empujando el suelo con los pies."
    ],
    "errores": [
      "Rodillas colapsando hacia dentro.",
      "Levantar los talones.",
      "Inclinar excesivamente el tronco.",
      "Perder tensión abdominal.",
      "Utilizar una carga que obliga a acortar demasiado el recorrido."
    ],
    "consejos": [
      "Mantén la mancuerna pegada al pecho.",
      "Prioriza profundidad y técnica antes que peso.",
      "No necesitas hacer la subida deliberadamente lenta."
    ],
    "progresion": [
      "Cuando completes 3×12 con buena técnica y 2-3 RIR, aumenta ligeramente el peso y vuelve hacia 8-10 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_hip_thrust",
    "nombre": "Hip thrust",
    "grupo": [
      "Glúteos"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Glúteos + cadena posterior",
    "ejecucion": [
      "Apoya la parte superior de la espalda en un banco.",
      "Pies aproximadamente al ancho de caderas.",
      "Coloca la carga sobre la pelvis con protección.",
      "Baja la pelvis de forma controlada.",
      "Empuja el suelo y eleva la pelvis.",
      "Arriba, termina con la cadera extendida y glúteos contraídos.",
      "Evita hiperextender la zona lumbar."
    ],
    "errores": [
      "Hiperextender la espalda al final.",
      "Colocar los pies demasiado lejos/cerca.",
      "Hacer rebotes.",
      "No alcanzar extensión completa de cadera.",
      "Utilizar más peso del que permite controlar la pelvis."
    ],
    "consejos": [
      "La posición final debería ser una extensión de cadera, no una extensión lumbar.",
      "Mantén ligeramente la barbilla hacia el pecho.",
      "La pausa arriba puede ayudarte a sentir y controlar el glúteo."
    ],
    "progresion": [
      "Cuando completes 3×12 con 2 RIR y técnica sólida, aumenta la carga. Vuelve a 8-10 repeticiones y vuelve a progresar."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "UB02",
    "nombre": "Jalón unilateral en polea",
    "grupo": [
      "Dorsal ancho",
      "Redondo mayor",
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Trabajo unilateral para mejorar la activación del dorsal.",
    "ejecucion": [
      "Iniciar con depresión escapular.",
      "Llevar el codo hacia la cadera.",
      "Subir lentamente."
    ],
    "errores": [
      "Girar el tronco.",
      "Tirar con el bíceps.",
      "Encoger el hombro."
    ],
    "consejos": [
      "Piensa en mover el codo.",
      "Mantén el pecho alto."
    ],
    "progresion": [
      "Completar 10 repeticiones.",
      "Incrementar peso."
    ],
    "observaciones": [
      "Buscar máxima contracción del dorsal."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_landmine_push_press_rot",
    "nombre": "Landmine Push Press rotacional",
    "grupo": [
      "Tren superior",
      "Core",
      "Piernas"
    ],
    "tipos": [
      "POT"
    ],
    "objetivo": "Potencia explosiva frontal y vertical, transfiriendo fuerza desde las piernas y la cadera hacia el tren superior",
    "ejecucion": [
      "Colócate frente al extremo de la barra en una postura atlética (pies al ancho de los hombros).",
      "Sujeta la barra con una mano bajándola hacia la cadera del lado opuesto.",
      "Realiza una rápida y ligera flexión de rodillas y cadera.",
      "Extiende las piernas y empuja la cadera de forma explosiva para darle inercia a la barra hacia arriba.",
      "Justo a la altura del pecho, realiza el cambio rápido soltando la barra con la primera mano y recogiéndola con la contraria.",
      "Remata el movimiento con un press potente hacia arriba y adelante, pivotando ligeramente el pie del mismo lado que empuja.",
      "Baja la barra de forma controlada y repite."
    ],
    "errores": [
      "Levantar el peso únicamente a base de fuerza de brazo y hombro, sin usar las piernas.",
      "Utilizar demasiada carga, lo que convierte el ejercicio en un press lento y elimina el componente de potencia.",
      "Hacer una pausa o frenar la barra a la altura del pecho, perdiendo toda la inercia generada desde el suelo.",
      "Mantener los pies completamente rígidos y pegados al suelo en lugar de acompañar el empuje pivotando el pie trasero."
    ],
    "consejos": [
      "En el cambio de mano a la altura del pecho, la barra debe sentirse momentáneamente \"sin gravedad\" gracias al impulso de tus piernas.",
      "El movimiento debe fluir como un solo bloque: las piernas arrancan, el core estabiliza, se hace el cambio y el brazo finaliza como un látigo.",
      "Respeta los 2 minutos de descanso entre series: al ser potencia, el sistema nervioso necesita recuperarse para no perder velocidad."
    ],
    "progresion": [
      "Aumenta la carga solo si mantienes la misma velocidad y calidad de movimiento.",
      "En potencia, más peso no significa mejor estímulo."
    ],
    "observaciones": [
      "Sustituye al lanzamiento de balón medicinal (sin espacio para lanzar)."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 6,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_lanzamiento_rotacional_balon",
    "nombre": "Landmine rotation",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "POT",
      "COOR"
    ],
    "objetivo": "Potencia rotacional, core y coordinación entre piernas, cadera y tronco",
    "ejecucion": [
      "Coloca el extremo de la barra en el landmine y sujeta el otro extremo con ambas manos.",
      "Pies aproximadamente al ancho de hombros y rodillas ligeramente flexionadas.",
      "Empieza con la barra hacia un lado del cuerpo.",
      "Rota explosivamente desde pies → cadera → tronco → brazos, llevando la barra hacia el lado contrario.",
      "Deja que los pies y la cadera acompañen la rotación; no intentes girar únicamente la espalda.",
      "Vuelve de forma controlada y repite hacia el otro lado."
    ],
    "errores": [
      "Girar únicamente con la zona lumbar.",
      "Mover principalmente los brazos.",
      "Hacerlo demasiado lento: aquí buscamos potencia.",
      "Mantener los pies completamente clavados al suelo.",
      "Perder el control del tronco al finalizar la rotación."
    ],
    "consejos": [
      "Piensa en \"lanzar la barra con la cadera\", aunque obviamente la barra permanece sujeta."
    ],
    "progresion": [
      "Aumenta el peso únicamente si puedes mantener la misma velocidad y calidad de movimiento. En potencia, más peso no siempre significa mejor estímulo."
    ],
    "observaciones": [
      "Sustituye al lanzamiento de balón medicinal (sin espacio para lanzar)."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_lanzamiento_balon_frente",
    "nombre": "Lanzamiento de balón medicinal al frente",
    "grupo": [
      "Tren superior",
      "Core"
    ],
    "tipos": [
      "POT"
    ],
    "objetivo": "Potencia de tren superior + core",
    "ejecucion": [
      "Colócate con la pelota medicinal delante del pecho.",
      "Adopta una posición atlética, con rodillas ligeramente flexionadas.",
      "Lleva la pelota ligeramente hacia atrás.",
      "Genera fuerza desde piernas y cadera y lanza hacia delante explosivamente.",
      "Deja que brazos y tronco transmitan la fuerza.",
      "Recupera la pelota y repite."
    ],
    "errores": [
      "Hacer el lanzamiento únicamente con los brazos.",
      "Realizarlo demasiado lento.",
      "Perder estabilidad del tronco.",
      "Utilizar una pelota demasiado pesada."
    ],
    "consejos": [
      "Utiliza un peso que permita lanzar la pelota rápido. Si el lanzamiento empieza a parecer un press pesado, es demasiado peso."
    ],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 6,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_movilidad_hombro",
    "nombre": "Movilidad de hombro",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Rango de movimiento del hombro",
    "ejecucion": [
      "Realiza círculos controlados de hombro o la variante específica seleccionada.",
      "Mantén el cuello relajado.",
      "Utiliza un rango amplio pero cómodo.",
      "Controla todo el recorrido."
    ],
    "errores": [
      "Hacer círculos rápidos.",
      "Elevar excesivamente los hombros hacia las orejas.",
      "Forzar posiciones dolorosas.",
      "Compensar arqueando demasiado la espalda."
    ],
    "consejos": [
      "El movimiento debe ser fluido.",
      "No necesitas buscar el máximo rango desde la primera repetición."
    ],
    "progresion": [
      "Mayor rango y control.",
      "Posteriormente se pueden utilizar variantes más exigentes."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 10,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_movilidad_tobillo",
    "nombre": "Movilidad de tobillo",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Rango de dorsiflexión",
    "ejecucion": [
      "Pie completamente apoyado.",
      "Lleva lentamente la rodilla hacia delante, en dirección a los dedos del pie.",
      "Mantén el talón pegado al suelo.",
      "La rodilla puede avanzar por encima de los dedos si no aparece dolor.",
      "Vuelve lentamente a la posición inicial.",
      "Mantén el arco del pie activo; evita que el tobillo colapse hacia dentro."
    ],
    "errores": [
      "Levantar el talón.",
      "Dejar que el pie se colapse hacia dentro.",
      "Mover la cadera en lugar del tobillo.",
      "Forzar el rango con dolor.",
      "Hacer rebotes."
    ],
    "consejos": [
      "Busca progresivamente más recorrido, no más velocidad.",
      "La sensación debe ser de movilidad/tensión, no de dolor.",
      "Mantén el pie en contacto completo con el suelo."
    ],
    "progresion": [
      "Aumentar progresivamente el rango.",
      "Después se puede añadir una ligera carga si la variante lo permite.",
      "No progresar buscando dolor ni rebotes."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 10,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "LB06",
    "nombre": "Pallof Press",
    "grupo": [
      "Core",
      "Oblicuos"
    ],
    "tipos": [],
    "objetivo": "Ejercicio anti-rotacional para desarrollar estabilidad del core.",
    "ejecucion": [
      "Sujetar la polea frente al pecho.",
      "Extender los brazos lentamente.",
      "Evitar cualquier giro del tronco.",
      "Volver controladamente."
    ],
    "errores": [
      "Girar el torso.",
      "Perder la postura.",
      "Doblar los brazos durante la extensión."
    ],
    "consejos": [
      "Mantén abdomen y glúteos contraídos.",
      "Respira con normalidad."
    ],
    "progresion": [
      "Completar 12 repeticiones.",
      "Aumentar ligeramente el peso."
    ],
    "observaciones": [
      "El movimiento debe ser completamente estable."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_pallof_press_zancada",
    "nombre": "Pallof press en zancada",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "COR",
      "EST"
    ],
    "objetivo": "Anti-rotación + estabilidad",
    "ejecucion": [
      "Colócate en posición de zancada frente al cable/banda.",
      "La resistencia debe intentar girarte hacia un lado.",
      "Sujeta el cable delante del pecho.",
      "Extiende los brazos lentamente.",
      "Evita que el tronco rote.",
      "Vuelve al pecho manteniendo control."
    ],
    "errores": [
      "Girar el torso hacia el cable.",
      "Mover las caderas.",
      "Utilizar demasiada resistencia.",
      "Hacer las repeticiones rápidamente."
    ],
    "consejos": [
      "El objetivo no es mover mucho peso.",
      "Piensa en mantener pecho y pelvis apuntando al frente."
    ],
    "progresion": [
      "Aumentar ligeramente la resistencia.",
      "Aumentar el tiempo de extensión.",
      "Utilizar una posición de zancada más exigente."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "LA02",
    "nombre": "Peso muerto rumano",
    "grupo": [
      "Isquiotibiales",
      "Glúteos",
      "Erectores espinales"
    ],
    "tipos": [],
    "objetivo": "Movimiento dominante de cadera. Debe sentirse el estiramiento de los isquiotibiales.",
    "ejecucion": [
      "Rodillas ligeramente flexionadas.",
      "Espalda neutra.",
      "Cadera hacia atrás.",
      "Barra pegada al cuerpo.",
      "Subir empujando la cadera hacia delante."
    ],
    "errores": [
      "Redondear la espalda.",
      "Convertirlo en una sentadilla.",
      "Alejar la barra.",
      "Flexionar demasiado las rodillas."
    ],
    "consejos": [
      "Mantén el pecho abierto.",
      "Piensa en cerrar una puerta con los glúteos.",
      "Baja solo hasta mantener la espalda neutra."
    ],
    "progresion": [
      "Completar 10 repeticiones.",
      "Subir peso."
    ],
    "observaciones": [
      "Nunca sacrificar técnica por carga."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 150
    }
  },
  {
    "id": "e2_rdl_unilateral",
    "nombre": "Peso muerto rumano unilateral",
    "grupo": [
      "Isquiotibiales",
      "Glúteo"
    ],
    "tipos": [
      "FUE",
      "UNI"
    ],
    "objetivo": "Cadena posterior + equilibrio",
    "ejecucion": [
      "Apóyate sobre una pierna con ligera flexión de rodilla.",
      "Lleva la cadera hacia atrás mientras el torso se inclina.",
      "La pierna libre se extiende hacia atrás como contrapeso.",
      "Mantén espalda neutra.",
      "Baja hasta sentir tensión en isquios sin perder la posición.",
      "Empuja el suelo y lleva la cadera hacia delante para volver."
    ],
    "errores": [
      "Girar la pelvis.",
      "Redondear la espalda.",
      "Doblar demasiado la rodilla y convertirlo en una sentadilla.",
      "Buscar tocar el suelo a cualquier precio.",
      "Perder el equilibrio por utilizar demasiado peso."
    ],
    "consejos": [
      "La prioridad es el movimiento de la cadera, no llegar bajo.",
      "Puedes utilizar una mano para apoyarte ligeramente si el equilibrio limita el trabajo muscular."
    ],
    "progresion": [
      "Primero domina el movimiento sin carga.",
      "Después aumenta gradualmente la carga.",
      "Cuando completes 3×10/lado con 2 RIR y control, aumenta peso."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 120
    }
  },
  {
    "id": "LA07",
    "nombre": "Plancha frontal",
    "grupo": [
      "Core"
    ],
    "tipos": [],
    "objetivo": "Trabajo de estabilidad del core.",
    "ejecucion": [
      "Cuerpo completamente alineado.",
      "Abdomen contraído.",
      "Glúteos activos."
    ],
    "errores": [
      "Hundir la espalda.",
      "Elevar demasiado la cadera.",
      "Aguantar sin tensión abdominal."
    ],
    "consejos": [
      "Respira con normalidad.",
      "Aprieta abdomen y glúteos durante toda la serie."
    ],
    "progresion": [
      "Alcanzar 60 segundos.",
      "Añadir peso sobre la espalda si resulta fácil."
    ],
    "observaciones": [
      "La calidad es más importante que el tiempo."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 45,
      "repMax": 60,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_plank_shoulder_taps",
    "nombre": "Plank + shoulder taps",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "COR"
    ],
    "objetivo": "Anti-rotación + estabilidad",
    "ejecucion": [
      "Posición de plancha alta.",
      "Pies algo separados para facilitar estabilidad.",
      "Toca el hombro contrario con una mano.",
      "Alterna lados.",
      "Mantén la pelvis lo más quieta posible."
    ],
    "errores": [
      "Balancear la pelvis.",
      "Abrir demasiado los pies para compensar.",
      "Elevar o hundir la cadera.",
      "Hacer los toques rápidamente."
    ],
    "consejos": [
      "El objetivo no es tocar muchas veces, sino evitar que el tronco rote.",
      "Si es demasiado difícil, aumenta la separación de los pies."
    ],
    "progresion": [
      "Menor separación de pies.",
      "Más repeticiones manteniendo control.",
      "Variantes más exigentes posteriormente."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_prensa_piernas",
    "nombre": "Prensa de piernas",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "FUE"
    ],
    "objetivo": "Fuerza de piernas",
    "ejecucion": [
      "Coloca los pies aproximadamente al ancho de hombros.",
      "Baja la plataforma de forma controlada hasta conseguir una profundidad cómoda manteniendo la pelvis estable.",
      "Las rodillas deben seguir la dirección de los pies.",
      "Empuja con fuerza la plataforma hasta casi extender completamente las rodillas, sin bloquearlas agresivamente."
    ],
    "errores": [
      "Levantar la pelvis del respaldo.",
      "Dejar que las rodillas colapsen hacia dentro.",
      "Bajar tanto que pierdas la posición de la pelvis.",
      "Hacer rebote en la parte inferior.",
      "Bloquear las rodillas violentamente."
    ],
    "consejos": [
      "No necesitas buscar el máximo peso posible: queremos fuerza con recorrido y control."
    ],
    "progresion": [
      "Cuando completes 3×10 con RIR ≈2 y buena técnica, aumenta ligeramente el peso."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 120
    }
  },
  {
    "id": "LA03",
    "nombre": "Prensa inclinada",
    "grupo": [
      "Cuádriceps",
      "Glúteos"
    ],
    "tipos": [],
    "objetivo": "Ejercicio para aumentar volumen de trabajo tras la Hack.",
    "ejecucion": [
      "Espalda completamente apoyada.",
      "Recorrido amplio.",
      "Rodillas alineadas con los pies.",
      "No bloquear completamente."
    ],
    "errores": [
      "Acortar recorrido.",
      "Levantar la cadera.",
      "Juntar rodillas.",
      "Rebotar abajo."
    ],
    "consejos": [
      "Controla especialmente la bajada.",
      "Empuja con todo el pie."
    ],
    "progresion": [
      "Llegar a 12 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "No despegar la espalda del respaldo."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "press_banca",
    "nombre": "Press banca",
    "grupo": [
      "Pectoral mayor",
      "Tríceps",
      "Deltoides anterior"
    ],
    "tipos": [],
    "objetivo": "Desarrollar fuerza y masa en el pectoral, con ayuda de tríceps y deltoides anterior.",
    "ejecucion": [
      "Escápulas retraídas y fijas contra el banco.",
      "Baja la barra de forma controlada hasta rozar el pecho, a la altura de la línea del pezón.",
      "Empuja en línea recta hacia arriba sin bloquear violentamente el codo."
    ],
    "errores": [
      "Rebotar la barra en el pecho.",
      "Despegar los glúteos del banco.",
      "Codos totalmente abiertos a 90°."
    ],
    "consejos": [
      "Empuja el suelo con los pies para generar estabilidad.",
      "Aprieta la barra con fuerza aunque no muevas más peso."
    ],
    "progresion": [
      "Cuando completes 10 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 8 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 150
    }
  },
  {
    "id": "UA01",
    "nombre": "Press de banca con barra",
    "grupo": [
      "Pectoral mayor",
      "Tríceps",
      "Deltoides anterior"
    ],
    "tipos": [],
    "objetivo": "Principal ejercicio de fuerza del día. Debe hacerse fresco.",
    "ejecucion": [
      "Escápulas retraídas y deprimidas.",
      "Pies completamente apoyados.",
      "Glúteos siempre en el banco.",
      "Barra baja al esternón.",
      "Antebrazos verticales.",
      "Empujar ligeramente hacia atrás formando una \"J\"."
    ],
    "errores": [
      "Rebotar la barra.",
      "Separar glúteos del banco.",
      "Abrir demasiado los codos.",
      "Perder tensión escapular.",
      "Acortar recorrido."
    ],
    "consejos": [
      "Aprieta el banco con la espalda.",
      "Mantén el pecho alto.",
      "Baja controlando 2-3 segundos.",
      "Empuja con intención explosiva."
    ],
    "progresion": [
      "Mantener peso hasta lograr 8-8-8-8.",
      "Entonces aumentar peso.",
      "Volver a 6 repeticiones."
    ],
    "observaciones": [
      "Prioridad absoluta del entrenamiento."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 180
    }
  },
  {
    "id": "e2_press_pecho_maquina",
    "nombre": "Press de pecho en máquina",
    "grupo": [
      "Pectoral",
      "Tríceps"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Pectoral + tríceps",
    "ejecucion": [
      "Ajusta el asiento para que las asas queden aproximadamente a la altura del pecho.",
      "Escápulas apoyadas y pecho estable.",
      "Empuja hacia delante sin despegar la espalda.",
      "Regresa lentamente hasta conseguir un buen estiramiento del pectoral, sin perder la posición."
    ],
    "errores": [
      "Despegar los hombros del respaldo.",
      "Acortar demasiado el recorrido.",
      "Bloquear los codos agresivamente.",
      "Utilizar impulso del torso."
    ],
    "consejos": [],
    "progresion": [
      "Cuando completes 3×10 con RIR 1-2, aumenta un nivel de peso."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 90
    }
  },
  {
    "id": "UB03",
    "nombre": "Press en máquina convergente",
    "grupo": [
      "Pectoral",
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Press estable para trabajar el pectoral con menor demanda de estabilización.",
    "ejecucion": [
      "Escápulas apoyadas.",
      "Recorrido completo.",
      "Controlar la bajada."
    ],
    "errores": [
      "Bloquear violentamente los codos.",
      "Medio recorrido.",
      "Separar la espalda del respaldo."
    ],
    "consejos": [
      "Mantén tensión continua.",
      "Baja lentamente."
    ],
    "progresion": [
      "Llegar a 10 repeticiones.",
      "Subir peso."
    ],
    "observaciones": [
      "Buscar congestión del pectoral."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "press_inclinado",
    "nombre": "Press inclinado",
    "grupo": [
      "Pectoral superior",
      "Deltoides anterior",
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Enfatizar la porción clavicular (superior) del pectoral.",
    "ejecucion": [
      "Banco a 30-45°.",
      "Baja la barra o mancuernas hasta la parte alta del pecho, controlando la trayectoria, y empuja hacia arriba y ligeramente atrás."
    ],
    "errores": [
      "Inclinar el banco demasiado (se convierte en press de hombro).",
      "Arquear excesivamente la zona lumbar."
    ],
    "consejos": [
      "Si usas mancuernas, gira ligeramente las muñecas al final del recorrido para mayor contracción."
    ],
    "progresion": [
      "Cuando completes 10 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 8 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "UA03",
    "nombre": "Press inclinado con mancuernas",
    "grupo": [
      "Pectoral superior",
      "Deltoides anterior",
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Complemento del press plano para desarrollar el pectoral superior.",
    "ejecucion": [
      "Banco a unos 30°.",
      "Escápulas retraídas.",
      "Mancuernas bajan ligeramente por fuera del pecho.",
      "Subir sin chocar mancuernas."
    ],
    "errores": [
      "Banco demasiado vertical.",
      "Perder estabilidad.",
      "Recorrido corto.",
      "Rebotar."
    ],
    "consejos": [
      "Mantén tensión constante.",
      "Baja despacio.",
      "No bloquees violentamente los codos."
    ],
    "progresion": [
      "Alcanzar 10 repeticiones en todas las series.",
      "Subir peso."
    ],
    "observaciones": [
      "Priorizar recorrido completo."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "press_militar",
    "nombre": "Press militar",
    "grupo": [
      "Deltoides anterior",
      "Tríceps",
      "Trapecio"
    ],
    "tipos": [],
    "objetivo": "Desarrollar fuerza y volumen en el deltoides anterior y medio.",
    "ejecucion": [
      "De pie o sentado, empuja la barra desde los hombros en línea recta hacia arriba, sin arquear excesivamente la lumbar."
    ],
    "errores": [
      "Arquear la espalda para compensar falta de movilidad de hombro.",
      "Empujar hacia delante en vez de arriba."
    ],
    "consejos": [
      "Aprieta glúteos y abdomen para estabilizar el tronco."
    ],
    "progresion": [
      "Cuando completes 8 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 6 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 150
    }
  },
  {
    "id": "UB01",
    "nombre": "Press militar sentado con mancuernas",
    "grupo": [
      "Deltoides anterior",
      "Deltoides lateral",
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Principal ejercicio de hombro de la semana. Debe ejecutarse con recorrido completo y sin impulso.",
    "ejecucion": [
      "Espalda apoyada.",
      "Abdomen contraído.",
      "Mancuernas a la altura de las orejas.",
      "Empujar verticalmente.",
      "Descender controladamente."
    ],
    "errores": [
      "Arquear la espalda.",
      "Impulsarse con el cuerpo.",
      "Recorrido incompleto.",
      "Chocar las mancuernas arriba."
    ],
    "consejos": [
      "Mantén tensión en el abdomen.",
      "Baja lentamente.",
      "Movimiento vertical."
    ],
    "progresion": [
      "Alcanzar 8 repeticiones en todas las series.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Principal ejercicio del día."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 150
    }
  },
  {
    "id": "d_press_pecho_maquina",
    "nombre": "Press pecho máquina",
    "grupo": [
      "Pectoral"
    ],
    "tipos": [],
    "objetivo": "",
    "ejecucion": [
      "Subida explosiva.",
      "Bajada controlada."
    ],
    "errores": [],
    "consejos": [],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_press_unilateral_mancuerna",
    "nombre": "Press unilateral con mancuerna/cable",
    "grupo": [
      "Hombro"
    ],
    "tipos": [
      "HIP",
      "UNI"
    ],
    "objetivo": "Empuje + estabilidad",
    "ejecucion": [
      "Utiliza una mancuerna o cable.",
      "Trabaja un brazo cada vez.",
      "Mantén abdomen y pelvis estables.",
      "Empuja la carga sin girar el torso.",
      "Regresa de forma controlada."
    ],
    "errores": [
      "Girar el tronco hacia el lado que empuja.",
      "Arquear la espalda.",
      "Utilizar demasiado peso.",
      "Perder posición del hombro."
    ],
    "consejos": [
      "El objetivo secundario es que el core impida que el cuerpo rote.",
      "Si utilizas cable, una posición de split stance puede facilitar la estabilidad."
    ],
    "progresion": [
      "Completar 3×10 con 2 RIR.",
      "Aumentar ligeramente la carga.",
      "Volver a 8 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "remo_barra",
    "nombre": "Remo con barra",
    "grupo": [
      "Dorsal ancho",
      "Romboides",
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Desarrollar grosor de espalda media.",
    "ejecucion": [
      "Torso inclinado unos 45°, espalda neutra.",
      "Tira de la barra hacia el abdomen bajo, llevando codos atrás, sin usar impulso lumbar."
    ],
    "errores": [
      "Redondear la espalda baja.",
      "Usar el 'tirón' de cadera como impulso principal."
    ],
    "consejos": [
      "Piensa en llevar los codos hacia los bolsillos traseros."
    ],
    "progresion": [
      "Cuando completes 10 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 8 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_remo_maquina",
    "nombre": "Remo en máquina",
    "grupo": [
      "Espalda",
      "Bíceps"
    ],
    "tipos": [
      "HIP"
    ],
    "objetivo": "Espalda + bíceps",
    "ejecucion": [
      "Pecho estable contra el apoyo si la máquina lo tiene.",
      "Comienza con los brazos extendidos.",
      "Lleva los codos hacia atrás manteniendo los hombros bajos.",
      "Junta las escápulas de forma natural al final.",
      "Regresa lentamente hasta extender los brazos."
    ],
    "errores": [
      "Tirar con el cuerpo hacia atrás.",
      "Encoger los hombros.",
      "Utilizar impulso.",
      "No completar el recorrido."
    ],
    "consejos": [],
    "progresion": [
      "3×10 con RIR 1-2 y técnica limpia → aumenta ligeramente el peso."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_remo_trx",
    "nombre": "Remo invertido en barra",
    "grupo": [
      "Espalda"
    ],
    "tipos": [
      "HIP",
      "EST"
    ],
    "objetivo": "Espalda + estabilidad",
    "ejecucion": [
      "Colócate debajo de una barra fija y agárrala.",
      "Cuerpo alineado desde hombros hasta pies.",
      "Mantén abdomen y glúteos activos.",
      "Tira del pecho hacia la barra llevando los codos hacia atrás.",
      "Acerca el pecho a la barra sin perder la alineación corporal.",
      "Baja lentamente hasta extender los brazos."
    ],
    "errores": [
      "Hundir la cadera.",
      "Sacar la cabeza hacia la barra.",
      "Tirar principalmente con los brazos.",
      "Utilizar impulso.",
      "No completar el recorrido."
    ],
    "consejos": [
      "Cuanto más horizontal esté tu cuerpo, más difícil.",
      "Para hacerlo más fácil, flexiona las rodillas.",
      "Piensa en llevar el pecho hacia la barra, no simplemente los brazos hacia atrás."
    ],
    "progresion": [
      "Primero aumenta hasta 12 repeticiones manteniendo 2 RIR.",
      "Después aumenta la horizontalidad.",
      "Posteriormente puedes añadir carga si la instalación lo permite."
    ],
    "observaciones": [
      "Sustituye al remo TRX (no disponible en tu gimnasio)."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "UA04",
    "nombre": "Remo pecho apoyado",
    "grupo": [
      "Dorsal",
      "Romboides",
      "Trapecio medio",
      "Bíceps"
    ],
    "tipos": [],
    "objetivo": "Remo estable para minimizar el impulso.",
    "ejecucion": [
      "Pecho siempre apoyado.",
      "Iniciar con escápulas.",
      "Llevar codos atrás.",
      "Bajar lentamente."
    ],
    "errores": [
      "Tirones.",
      "Encoger hombros.",
      "Acortar recorrido."
    ],
    "consejos": [
      "Mantén el pecho pegado al banco.",
      "Aprieta la espalda un segundo arriba."
    ],
    "progresion": [
      "Llegar a 10 repeticiones.",
      "Aumentar carga."
    ],
    "observaciones": [
      "Evitar impulso."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "UB04",
    "nombre": "Remo unilateral en polea",
    "grupo": [
      "Dorsal",
      "Romboides",
      "Trapecio medio"
    ],
    "tipos": [],
    "objetivo": "Remo unilateral para mejorar equilibrio entre ambos lados.",
    "ejecucion": [
      "Tronco estable.",
      "Llevar el codo hacia atrás.",
      "Controlar toda la bajada."
    ],
    "errores": [
      "Girar el cuerpo.",
      "Tirar con el bíceps.",
      "Encoger el hombro."
    ],
    "consejos": [
      "Mantén el pecho abierto.",
      "Aprieta la espalda un segundo."
    ],
    "progresion": [
      "Completar 12 repeticiones.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Priorizar técnica sobre carga."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_rotacion_toracica",
    "nombre": "Rotación torácica",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Movilidad de columna torácica",
    "ejecucion": [
      "Colócate en cuadrupedia.",
      "Apoya una mano detrás de la cabeza.",
      "Mantén estable la pelvis.",
      "Gira el codo hacia el techo.",
      "Sigue el movimiento con el torso.",
      "Vuelve lentamente."
    ],
    "errores": [
      "Rotar principalmente desde la zona lumbar.",
      "Mover la pelvis.",
      "Hacer el movimiento rápidamente.",
      "Intentar alcanzar un rango excesivo."
    ],
    "consejos": [
      "Piensa en \"abrir el pecho\", no simplemente levantar el codo.",
      "Mantén la respiración tranquila.",
      "Busca sensación de movimiento en la zona torácica."
    ],
    "progresion": [
      "Mayor rango manteniendo pelvis estable.",
      "Añadir una pausa de 1-2 s en la posición abierta."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_salto_al_cajon",
    "nombre": "Salto al cajón",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "POT"
    ],
    "objetivo": "Potencia de piernas",
    "ejecucion": [
      "Colócate frente al cajón con los pies aproximadamente al ancho de hombros.",
      "Haz una pequeña flexión de cadera y rodillas.",
      "Salta lo más explosivamente posible.",
      "Aterriza encima del cajón con ambos pies y rodillas ligeramente flexionadas.",
      "Estabiliza la posición antes de bajar.",
      "Baja caminando, no saltando hacia atrás."
    ],
    "errores": [
      "Elegir un cajón demasiado alto.",
      "Buscar altura sacrificando la técnica.",
      "Aterrizar con las rodillas hacia dentro.",
      "Saltar del cajón para ahorrar tiempo."
    ],
    "consejos": [
      "Si la altura o potencia disminuye claramente, termina la serie: la calidad es más importante que completar repeticiones."
    ],
    "progresion": [
      "Primero mejora la altura/calidad del salto, no añadas peso. El cajón debe permitir aterrizar con control."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 4,
      "repMax": 5,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_salto_horizontal",
    "nombre": "Salto horizontal",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "POT"
    ],
    "objetivo": "Potencia horizontal",
    "ejecucion": [
      "Pies aproximadamente al ancho de caderas.",
      "Realiza una pequeña flexión de cadera y rodillas.",
      "Balancea los brazos.",
      "Salta hacia delante explosivamente.",
      "Aterriza con ambos pies.",
      "Flexiona cadera y rodillas para absorber el impacto.",
      "Mantén el equilibrio antes de repetir."
    ],
    "errores": [
      "Buscar distancia sacrificando el aterrizaje.",
      "Aterrizar con las piernas rígidas.",
      "Rodillas hacia dentro.",
      "Encadenar saltos sin recuperar.",
      "Hacerlo fatigado."
    ],
    "consejos": [
      "Cada salto debe ser de alta calidad.",
      "Descansa aproximadamente 60-90 s si lo necesitas para mantener potencia."
    ],
    "progresion": [
      "Aumentar progresivamente distancia.",
      "Después mejorar la calidad/velocidad.",
      "No necesitas añadir peso."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 4,
      "repMax": 4,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "sentadilla",
    "nombre": "Sentadilla",
    "grupo": [
      "Cuádriceps",
      "Glúteo",
      "Isquiotibiales"
    ],
    "tipos": [],
    "objetivo": "Ejercicio base de pierna: cuádriceps, glúteo e isquios como estabilizadores.",
    "ejecucion": [
      "Pies a la anchura de hombros, baja controlando la cadera hacia atrás y abajo hasta rango completo, mantén el pecho arriba y rodillas en línea con los pies."
    ],
    "errores": [
      "Rodillas colapsando hacia dentro (valgo).",
      "Perder la curvatura lumbar neutra.",
      "Talones que se despegan del suelo."
    ],
    "consejos": [
      "Empuja el suelo 'separándolo' con los pies para activar el glúteo."
    ],
    "progresion": [
      "Cuando completes 8 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 6 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 4,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 2,
      "descansoSeg": 180
    }
  },
  {
    "id": "LB01",
    "nombre": "Sentadilla búlgara con mancuernas",
    "grupo": [
      "Cuádriceps",
      "Glúteos",
      "Aductores",
      "Core"
    ],
    "tipos": [],
    "objetivo": "Ejercicio unilateral para desarrollar fuerza, estabilidad y corregir desequilibrios entre piernas.",
    "ejecucion": [
      "Pie trasero apoyado sobre banco.",
      "Tronco ligeramente inclinado.",
      "Rodilla delantera siguiendo la punta del pie.",
      "Descender hasta notar un buen estiramiento.",
      "Empujar con el pie delantero."
    ],
    "errores": [
      "Impulsarse con la pierna trasera.",
      "Perder el equilibrio por falta de tensión.",
      "Rodilla colapsando hacia dentro.",
      "Medio recorrido."
    ],
    "consejos": [
      "Mira siempre un punto fijo.",
      "Mantén el abdomen contraído.",
      "Controla especialmente la bajada."
    ],
    "progresion": [
      "Completar las tres series de 10.",
      "Aumentar peso."
    ],
    "observaciones": [
      "La estabilidad es más importante que el peso."
    ],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 10,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 120
    }
  },
  {
    "id": "LA01",
    "nombre": "Sentadilla Hack",
    "grupo": [
      "Cuádriceps",
      "Glúteos"
    ],
    "tipos": [],
    "objetivo": "Principal ejercicio de fuerza del entrenamiento de pierna. La prioridad es un recorrido completo y controlado.",
    "ejecucion": [
      "Espalda completamente apoyada.",
      "Pies ligeramente adelantados.",
      "Rodillas siguiendo la dirección de los pies.",
      "Bajar hasta donde permita la movilidad sin perder la postura.",
      "Empujar con todo el pie."
    ],
    "errores": [
      "Levantar los talones.",
      "Acortar el recorrido.",
      "Rebotar abajo.",
      "Juntar las rodillas.",
      "Despegar la espalda."
    ],
    "consejos": [
      "Mantén el abdomen firme.",
      "Baja despacio.",
      "Empuja pensando en el suelo.",
      "No bloquees las rodillas arriba."
    ],
    "progresion": [
      "Completar 8 repeticiones en las cuatro series.",
      "Aumentar peso."
    ],
    "observaciones": [
      "Ejercicio prioritario del día."
    ],
    "sugerencia": {
      "series": 4,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 2,
      "descansoSeg": 180
    }
  },
  {
    "id": "e2_side_plank",
    "nombre": "Side plank",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "COR"
    ],
    "objetivo": "Estabilidad lateral",
    "ejecucion": [
      "Apoya antebrazo directamente debajo del hombro.",
      "Mantén cuerpo alineado.",
      "Eleva la pelvis.",
      "Contrae abdomen y glúteos.",
      "Mantén la posición sin rotar hacia delante o atrás."
    ],
    "errores": [
      "Hundir la cadera.",
      "Rotar el tronco.",
      "Adelantar el hombro.",
      "Aguantar demasiado tiempo perdiendo técnica."
    ],
    "consejos": [
      "Es preferible 25 s perfectos que 60 s deformado.",
      "Mantén respiración normal."
    ],
    "progresion": [
      "Más tiempo.",
      "Piernas más juntas/posición más exigente.",
      "Elevación de pierna.",
      "Carga adicional."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 25,
      "repMax": 40,
      "unidad": "segundos",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_single_leg_reach",
    "nombre": "Single-leg reach",
    "grupo": [],
    "tipos": [
      "EST",
      "UNI"
    ],
    "objetivo": "Equilibrio dinámico + control de cadera",
    "ejecucion": [
      "Apóyate sobre una pierna.",
      "Flexiona ligeramente rodilla y cadera.",
      "Inclina el tronco mientras llevas la pierna libre hacia atrás.",
      "Alcanza con la mano hacia delante o hacia un punto determinado.",
      "Vuelve a la posición inicial manteniendo el equilibrio.",
      "La rodilla debe seguir aproximadamente la línea del segundo/tercer dedo del pie."
    ],
    "errores": [
      "Colapsar la rodilla hacia dentro.",
      "Girar la pelvis.",
      "Abrir la cadera para compensar.",
      "Hacerlo demasiado rápido.",
      "Perder la postura del pie."
    ],
    "consejos": [
      "Prioriza estabilidad sobre profundidad.",
      "Si pierdes el equilibrio constantemente, reduce el rango.",
      "Mantén el abdomen ligeramente activo."
    ],
    "progresion": [
      "Mayor alcance.",
      "Mayor control.",
      "Añadir una ligera carga.",
      "Realizarlo sobre una superficie algo menos estable."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 6,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_skater_jumps",
    "nombre": "Skater jumps",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "POT"
    ],
    "objetivo": "Potencia lateral + estabilidad",
    "ejecucion": [
      "Apóyate sobre una pierna.",
      "Salta lateralmente hacia la pierna contraria.",
      "Aterriza con control sobre una sola pierna.",
      "Flexiona ligeramente cadera y rodilla para absorber el impacto.",
      "Estabiliza 1-2 s antes del siguiente salto.",
      "Mantén la rodilla alineada con el pie."
    ],
    "errores": [
      "Saltar demasiado lejos y no poder controlar el aterrizaje.",
      "La rodilla se mete hacia dentro.",
      "Aterrizar rígidamente.",
      "Encadenar saltos sin estabilizar.",
      "Priorizar distancia sobre calidad."
    ],
    "consejos": [
      "La fase de aterrizaje es tan importante como el salto.",
      "Empieza con saltos relativamente cortos.",
      "Si pierdes estabilidad, reduce distancia."
    ],
    "progresion": [
      "Primero aumentar distancia manteniendo control.",
      "Después aumentar explosividad.",
      "No añadir carga salvo que exista una razón concreta."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 5,
      "repMax": 6,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_split_squat",
    "nombre": "Split squat",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "FUE",
      "UNI"
    ],
    "objetivo": "Fuerza unilateral",
    "ejecucion": [
      "Coloca un pie delante y otro detrás.",
      "Mantén la mayor parte del peso en la pierna delantera.",
      "Desciende verticalmente.",
      "La rodilla delantera sigue la línea del pie.",
      "Baja hasta un rango cómodo y controlado.",
      "Empuja el suelo para subir."
    ],
    "errores": [
      "Separación de pies demasiado corta.",
      "Rodilla colapsando hacia dentro.",
      "Impulsarse excesivamente con la pierna trasera.",
      "Perder estabilidad.",
      "Utilizar demasiado peso."
    ],
    "consejos": [
      "Puedes sujetarte ligeramente a un apoyo si mejora la ejecución.",
      "No necesitas hacer la variante elevada para que sea efectiva.",
      "Prioriza estabilidad y recorrido."
    ],
    "progresion": [
      "Primero dominar el peso corporal.",
      "Después añadir mancuernas.",
      "Cuando hagas 3×10 con 2 RIR y buena técnica, aumenta ligeramente la carga."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_step_up_cajon",
    "nombre": "Step-up al cajón",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "FUE",
      "UNI"
    ],
    "objetivo": "Fuerza unilateral de pierna",
    "ejecucion": [
      "Coloca un pie completamente sobre el cajón.",
      "Inclina ligeramente el tronco hacia delante.",
      "Empuja principalmente con la pierna que está sobre el cajón.",
      "Sube hasta quedar completamente erguido.",
      "Baja de forma controlada.",
      "Completa todas las repeticiones de un lado antes de cambiar."
    ],
    "errores": [
      "Impulsarse excesivamente con la pierna que está abajo.",
      "Utilizar un cajón demasiado alto.",
      "Rodilla colapsando hacia dentro.",
      "Caer al bajar.",
      "Perder el equilibrio por exceso de carga."
    ],
    "consejos": [
      "El cajón no tiene que ser altísimo.",
      "Si tienes que saltar para llegar arriba, es demasiado alto.",
      "Prioriza controlar especialmente la bajada."
    ],
    "progresion": [
      "Aumentar primero repeticiones.",
      "Después añadir mancuernas.",
      "También puedes aumentar ligeramente la altura si mantienes buena técnica."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 120
    }
  },
  {
    "id": "e2_suitcase_carry",
    "nombre": "Suitcase carry",
    "grupo": [
      "Core"
    ],
    "tipos": [
      "CAR",
      "COR"
    ],
    "objetivo": "Core anti-inclinación + estabilidad",
    "ejecucion": [
      "Sujeta una carga pesada en una sola mano.",
      "Mantén el torso completamente vertical.",
      "Camina sin inclinarte hacia el lado de la carga.",
      "Mantén hombro y pelvis estables.",
      "Cambia de lado."
    ],
    "errores": [
      "Inclinarse hacia la carga.",
      "Inclinarse hacia el lado contrario.",
      "Encoger el hombro.",
      "Caminar demasiado rápido.",
      "Utilizar una carga que rompe la postura."
    ],
    "consejos": [
      "Imagina que llevas un vaso lleno de agua sobre la cabeza.",
      "Aquí menos carga con buena postura es mejor que más carga deformándote."
    ],
    "progresion": [
      "Aumentar distancia hasta ~50 m.",
      "Después aumentar ligeramente la carga.",
      "También puedes aumentar el tiempo bajo tensión."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 30,
      "repMax": 40,
      "unidad": "m",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_thread_the_needle",
    "nombre": "Thread the needle",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Movilidad torácica + hombro",
    "ejecucion": [
      "A cuatro apoyos, pasa un brazo por debajo del cuerpo.",
      "Después realiza la rotación hacia el techo.",
      "Movimiento lento y controlado, buscando amplitud sin forzar."
    ],
    "errores": [],
    "consejos": [],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "triceps_cuerda",
    "nombre": "Tríceps cuerda",
    "grupo": [
      "Tríceps"
    ],
    "tipos": [],
    "objetivo": "Aislar el tríceps en su función de extensión de codo.",
    "ejecucion": [
      "Codos pegados al torso y fijos.",
      "Extiende separando ligeramente la cuerda al final del recorrido para mayor contracción."
    ],
    "errores": [
      "Mover los codos hacia delante o los hombros hacia arriba para ayudarse."
    ],
    "consejos": [
      "Aguanta una fracción de segundo en la extensión completa."
    ],
    "progresion": [
      "Cuando completes 12 repeticiones en todas las series con buena técnica, sube peso la siguiente sesión y vuelve a 10 repeticiones."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 10,
      "repMax": 12,
      "unidad": "reps",
      "rirMin": 1,
      "rirMax": 1,
      "descansoSeg": 4500
    }
  },
  {
    "id": "e2_worlds_greatest_stretch",
    "nombre": "World's Greatest Stretch",
    "grupo": [],
    "tipos": [
      "MOV"
    ],
    "objetivo": "Cadera + isquios + columna torácica",
    "ejecucion": [
      "Realiza la secuencia lentamente, buscando amplitud y control.",
      "No rebotes ni fuerces posiciones dolorosas."
    ],
    "errores": [],
    "consejos": [],
    "progresion": [],
    "observaciones": [],
    "sugerencia": {
      "series": 2,
      "repMin": 5,
      "repMax": 5,
      "unidad": "reps",
      "rirMin": null,
      "rirMax": null,
      "descansoSeg": 60
    }
  },
  {
    "id": "e2_zancada_atras_elevacion_rodilla",
    "nombre": "Zancada atrás + elevación de rodilla",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "FUE",
      "UNI"
    ],
    "objetivo": "Fuerza unilateral + equilibrio",
    "ejecucion": [
      "Desde posición erguida, lleva una pierna hacia atrás.",
      "Desciende manteniendo el peso principalmente sobre la pierna delantera.",
      "Empuja el suelo para volver arriba.",
      "Al subir, lleva la rodilla trasera hacia delante hasta una posición estable.",
      "Mantén el tronco controlado durante todo el movimiento."
    ],
    "errores": [
      "Perder el equilibrio al subir.",
      "Dejar que la rodilla delantera colapse hacia dentro.",
      "Dar un paso demasiado corto.",
      "Utilizar demasiado impulso con la pierna trasera."
    ],
    "consejos": [
      "Si el knee drive hace que pierdas mucha estabilidad, primero domina el reverse lunge y después añade velocidad al subir."
    ],
    "progresion": [
      "Cuando completes 3×8/lado con estabilidad y RIR 2-3, aumenta ligeramente la carga."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 90
    }
  },
  {
    "id": "e2_zancada_lateral",
    "nombre": "Zancada lateral",
    "grupo": [
      "Piernas"
    ],
    "tipos": [
      "FUE",
      "UNI"
    ],
    "objetivo": "Fuerza lateral + movilidad",
    "ejecucion": [
      "Da un paso amplio hacia un lado.",
      "Flexiona la pierna que recibe el peso llevando la cadera hacia atrás.",
      "La otra pierna permanece extendida.",
      "Mantén el pie completamente apoyado.",
      "Empuja el suelo para volver al centro."
    ],
    "errores": [
      "La rodilla colapsa hacia dentro.",
      "El pie se despega del suelo.",
      "Flexionar ambas piernas como una sentadilla normal.",
      "Dar un paso demasiado corto.",
      "Caer lateralmente sin controlar."
    ],
    "consejos": [
      "Piensa en llevar la cadera hacia atrás, no simplemente bajar.",
      "Empieza sin peso si la movilidad lateral es limitada."
    ],
    "progresion": [
      "Primero aumentar profundidad y control.",
      "Después añadir mancuerna/kettlebell.",
      "Progresar carga manteniendo el mismo rango."
    ],
    "observaciones": [],
    "sugerencia": {
      "series": 3,
      "repMin": 8,
      "repMax": 8,
      "unidad": "reps",
      "rirMin": 2,
      "rirMax": 3,
      "descansoSeg": 120
    }
  }
];
