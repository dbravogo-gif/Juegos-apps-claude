# Isla 1: especificación de nivel

2026-11-08. Sale de la idea del autor. Lo marcado **Decidido** es suyo; lo marcado
**Propuesta** espera su sí antes de construirse. Mapa: `isla-1-mapa.svg`.

## Inspiración: La Palma

Se toman ideas del paisaje, no lugares copiados. Los nombres serán inventados (pendiente del
autor).

- **El centro:** una gran caldera y las cumbres, que no se cruzan. En su borde norte, las
  cúpulas blancas de un observatorio, que se ven desde casi toda la isla y sirven de referencia.
- **El sur:** volcánico, con tierra negra (picón), conos de volcán, viñas bajas y un drago.
- **El oeste:** un valle con plataneras y una plaza con laureles.
- **El norte:** bosque de laurisilva, con niebla, musgo, helechos y una cascada.
- **El este:** la capital, con casas de colores y balcones de madera, y el puerto.
- **Cuidado:** la erupción de 2021 destruyó casas de verdad. El volcán es paisaje; ni bromas ni
  drama con eso.

## El recorrido: la vuelta a la isla

Del sur al este rodeando las cumbres: 1 → 2 → 3 → 4 → 5.

### 1. Zona inicial (sur)

- **Decidido:**
  - Dos casas iguales, un árbol y un museo.
  - **Museo:** pequeño, con una persona en un ordenador y el doctor que da la inicial.
    - Tres estatuas de las iniciales en su tercera forma. Cada una cuenta la historia de su
      leyenda y contra quiénes luchaba.
    - Se elige una. Hasta elegir, no se puede pasar a la zona siguiente.
- **Propuesta:**
  - El árbol es un drago.
  - Una de las casas es la del jugador.
  - Una persona en la salida corta el paso hasta elegir.

### 2. Zona de combates (oeste)

- **Decidido:** pequeña, con 2 entrenadores y unas 3 zonas de hierba.
  - Alguna hierba obligatoria y algún combate obligatorio, como en Leyendas de Iberia.
- **Propuesta:** un malpaís volcánico con arbustos bajos, y el segundo entrenador opcional.

### 3. Pueblo (valle del oeste)

- **Decidido:** pequeño, con refugio, dos casas, tienda y el anciano.
- **Propuesta:**
  - Plaza con laureles y plataneras alrededor.
  - El paso al bosque se cierra hasta hablar con el anciano: «tu criatura aún no te escucha;
    en el bosque os perderíais».

### 4. Bosque (norte)

- **Decidido:** la típica zona de bosque del inicio del género, con criaturas flojas. No
  existen los tipos bicho ni veneno: se adapta a un tipo que encaje.
- **Propuesta:**
  - Laurisilva con niebla, de tipo **Planta y Aire**: plantas y aves pequeñas entre la niebla.
  - Un entrenador obligatorio a la salida.

### 5. Capital (costa este)

- **Decidido:**
  - Un poco de historia de los rivales: alguien te habla, sin combate.
  - Refugio, gimnasio (que se vea claramente que lo es), varias casas y el puerto.
  - El puerto lleva a la isla 2 cuando se vence al gimnasio.
- **Propuesta:**
  - El gimnasio, el edificio más grande y con el emblema de su tipo en la fachada.
  - Un faro en el puerto, que es la referencia de la capital en el plan aprobado.

## Reglas para todas las zonas

**Decidido** (como Leyendas de Iberia). Valen también para las cuevas y las zonas futuras. Las
vigilan pruebas automáticas que recorren el mapa:

- **Una zona con hierba obligatoria no se cruza sin pisar hierba alta.**
- **Un entrenador obligatorio no se puede esquivar:** su casilla y lo que ve cortan todos los
  caminos.
- **Cada paso cerrado** se abre solo con su condición: elegir la inicial, el anciano o el
  gimnasio.

## La inicial rebelde

- **Decidido:** al principio no hace mucho caso en los ataques. Deja de ser rebelde cuando un
  anciano del pueblo te cuenta más de su historia y te ayuda a conectar con ella.
- **Propuesta (números ajustables):**
  - Hasta hablar con el anciano, en cada turno hay un 25 % de que no obedezca.
  - Cuando no obedece, la mitad de las veces usa otro de sus movimientos y la otra mitad se
    distrae y pierde el turno.
  - Sale un aviso: «No te hace caso…».
  - Lo decide el generador del combate, así que es reproducible y vale para el online.

## Captura

**Decidido:**

- Una barra con una flecha que va y viene, y tres zonas: gris, blanca y una verde pequeña.
- Se pulsa Espacio para pararla.
- Ninguna zona asegura la captura: solo la hacen más o menos fácil.

**Propuesta:** la zona multiplica la probabilidad base. Gris ×1, blanca ×1,5 y verde ×2,5.

## Decisiones técnicas (las toma Claude)

- **La isla es un único mapa por casillas, dividido en zonas.** Cada zona tiene su nombre, su
  tabla de aparición y su música. La cámara sigue al jugador sin cortes entre zonas.
- **Los interiores** (museo, casas, refugio, tienda, gimnasio) son dioramas pequeños aparte. Se
  entra por la puerta con un fundido.
- **Los mapas se escriben como texto**, una letra por casilla, como en Leyendas. Así se leen y
  se prueban fácilmente.

## Tamaños orientativos

| Zona | Casillas (ancho × fondo) |
| --- | --- |
| 1. Zona inicial | 24 × 18 |
| 2. Zona de combates | 20 × 34 |
| 3. Pueblo | 28 × 22 |
| 4. Bosque | 40 × 24 |
| 5. Capital | 34 × 28 |

## Qué del plan aprobado no está en esta idea

**Pendiente del autor.** El plan anterior de la isla 1 incluía:

- la base del equipo enemigo,
- un combate 2 contra 2 contra una pareja de entrenadores,
- una ruta costera,
- y recados.

**Propuesta:**

- La base del equipo enemigo pasa a la isla 2. En la isla 1 los rivales solo hablan, como pide
  el autor.
- El 2 contra 2, una pareja de entrenadores en el bosque, sin zona nueva.
- Un recado pequeño en el pueblo.
- La ruta costera se queda fuera.

## Plan de construcción

Cada paso deja algo jugable y con pruebas.

1. **El mapa de la isla en texto**, con las pruebas de las reglas: hierba obligatoria,
   entrenadores ineludibles, pasos cerrados y que todo se conecta.
2. **Maqueta jugable con formas simples (F05):** recorrer la isla entera con el teclado, con
   colisiones, la cámara de diorama, el cambio de zona y los pasos cerrados.
3. **Interiores y diálogos (F15):** museo, estatuas, elección de la inicial (F14) y anciano.
4. **Encuentros, combate y captura (F06–F08)**, con criaturas provisionales, y la rebeldía.
5. **Entrenadores (F16), refugio (F09), tienda (F17) y guardado (F10).**
6. **Arte del mundo (F11 y F22):**
   - kits CC0 repintados con la paleta;
   - piezas protagonistas de Meshy: el museo, el gimnasio, el refugio y el faro.
