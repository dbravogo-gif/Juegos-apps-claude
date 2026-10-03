export const esc = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const plural = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

/** Fecha local, no UTC: pasada la medianoche en UTC+2 el día ISO aún sería el anterior. */
export function hoyISO() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
