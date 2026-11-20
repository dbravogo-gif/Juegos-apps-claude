// Qué tutorial de instalación toca, según el navegador. Puro: recibe el userAgent y los puntos
// táctiles (el iPad moderno se presenta como un Mac, pero con pantalla táctil).
//   'ios-safari'  iPhone o iPad con Safari
//   'ios-otro'    iPhone o iPad con Chrome, Firefox, Edge… (también pueden añadir a inicio)
//   'android'     Android
//   'escritorio'  ordenador: no se ofrece el tutorial
export function plataforma(ua = '', puntosTactiles = 0) {
  const esIpadComoMac = /Macintosh/.test(ua) && puntosTactiles > 1;
  if (/iPhone|iPad|iPod/.test(ua) || esIpadComoMac) {
    return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) ? 'ios-otro' : 'ios-safari';
  }
  if (/Android/.test(ua)) return 'android';
  return 'escritorio';
}
