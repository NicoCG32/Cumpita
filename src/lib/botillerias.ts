import type { Place } from "./places";

/**
 * Ley de Alcoholes N° 19.925 (art. 21): botillerías pueden atender hasta la 01:00;
 * viernes, sábados y vísperas de feriado, una hora más (02:00).
 * Sin datos de apertura, solo afirmamos "cerrado" en el tramo en que la ley lo exige.
 */
function chileNow(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const h = Number(get("hour")) % 24, m = Number(get("minute"));
  return { day: get("weekday"), min: h * 60 + m };
}

export function legalClosed(d = new Date()): boolean {
  const { day, min } = chileNow(d);
  // La madrugada de sábado y domingo corresponde a la noche de viernes y sábado.
  const limit = day === "Sat" || day === "Sun" ? 120 : 60;
  return min >= limit && min < 9 * 60;
}

export function applyLegalHours(places: Place[], d = new Date()): Place[] {
  const closed = legalClosed(d);
  return places.map((p) =>
    p.category !== "botilleria" || p.openingHours || p.hoursText || p.openNow != null
      ? p
      : { ...p, hoursText: "Horario legal: hasta 01:00 (vie y sáb hasta 02:00)", openNow: closed ? false : null },
  );
}
