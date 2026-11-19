// Qué hacer al abrir la app, según la sesión guardada en el móvil y el código del enlace.
//   'pedir-codigo'     no hay sesión ni código: pantalla de entrada
//   'entrar'           no hay sesión y llega un código: entrar con él
//   'continuar'        hay sesión y no llega código, o llega el mismo
//   'confirmar-cambio' hay sesión y llega otro código: preguntar antes de cerrar la anterior

export function decidirEntrada(sesionGuardada, codigoEnlace) {
  const actual = sesionGuardada?.codigo ?? null;
  if (!actual) return codigoEnlace ? 'entrar' : 'pedir-codigo';
  if (!codigoEnlace || codigoEnlace === actual) return 'continuar';
  return 'confirmar-cambio';
}

/** Lo que significa para la sesión la respuesta del almacén al comprobar el código. */
export function trasComprobar(estado) {
  if (estado === 'desactivado' || estado === 'no-existe') return 'cerrar-con-aviso';
  return 'seguir'; // 'activo' o 'sin-conexion': sin conexión se sigue con lo guardado
}
