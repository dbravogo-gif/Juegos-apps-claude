import { exportar } from '../data/storage.js';

/**
 * Saca una copia de los datos fuera del navegador. En el móvil se abre el menú de
 * compartir, que deja guardarla en Archivos, iCloud o Drive, o mandársela a uno mismo: una
 * descarga suelta en el iPhone acaba en un sitio que nadie encuentra. Donde no se puede
 * compartir un archivo, se descarga.
 *
 * Solo se apunta la fecha si la copia sale de verdad: cancelar el menú no cuenta.
 */
export async function guardarCopia(ctx) {
  const nombre = `constant-${ctx.hoy}.json`;
  const contenido = exportar(ctx.db);
  const archivo = new File([contenido], nombre, { type: 'application/json' });

  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: 'Copia de Constant' });
    } catch {
      return false;
    }
  } else {
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  ctx.actualizar((db) => {
    db.ultimaCopia = ctx.hoy;
    db.copiaPospuesta = null;
  });
  return true;
}
