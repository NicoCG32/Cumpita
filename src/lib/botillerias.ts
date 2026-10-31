import type { Place } from "./places";

/**
 * Ley de Alcoholes N° 19.925 (art. 21): botillerías pueden atender hasta la 01:00;
 * viernes, sábados y vísperas de feriado, una hora más (02:00).
 * Sin datos de apertura, solo afirmamos "cerrado" en el tramo en que la ley lo exige.
 */
function chileNow(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const h = Number(get("hour")) % 24,
    m = Number(get("minute"));
  return { day: get("weekday"), min: h * 60 + m };
}

export function legalClosed(d = new Date()): boolean {
  const { day, min } = chileNow(d);
  const limit = day === "Sat" || day === "Sun" ? 120 : 60;
  return min >= limit && min < 9 * 60;
}

export type ApprovedHours = {
  place_id: string;
  weekday_open: string;
  weekday_close: string;
  weekend_open: string;
  weekend_close: string;
  reviewed_at: string | null;
};

const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h! * 60 + m!;
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Abierto según horario confirmado. Fin de semana = noches de viernes y sábado. */
export function confirmedOpen(h: ApprovedHours, d = new Date()): boolean {
  const { day, min } = chileNow(d);
  const idx = DAYS.indexOf(day);
  const slot = (i: number) =>
    (i === 5 || i === 6
      ? [h.weekend_open, h.weekend_close]
      : [h.weekday_open, h.weekday_close]
    ).map(toMin) as [number, number];
  const [o, c] = slot(idx);
  const today = c > o ? min >= o && min < c : min >= o;
  const [po, pc] = slot((idx + 6) % 7);
  const fromYesterday = pc < po && min < pc;
  return today || fromYesterday;
}

export function applyHours(places: Place[], approved: ApprovedHours[], d = new Date()): Place[] {
  const closed = legalClosed(d);
  const latest = new Map<string, ApprovedHours>();
  for (const a of approved) {
    const prev = latest.get(a.place_id);
    if (!prev || (a.reviewed_at ?? "") > (prev.reviewed_at ?? "")) latest.set(a.place_id, a);
  }
  return places.map((p) => {
    const a = latest.get(p.id);
    if (a)
      return {
        ...p,
        openNow: confirmedOpen(a, d),
        hoursKind: "confirmed" as const,
        verifiedAt: a.reviewed_at,
        hoursText: `Lu–Ju y Do ${a.weekday_open}–${a.weekday_close} · Vi–Sá ${a.weekend_open}–${a.weekend_close}`,
      };
    if (p.category !== "botilleria" || p.openingHours || p.hoursText || p.openNow != null) return p;
    return {
      ...p,
      hoursKind: "legal" as const,
      hoursText: "Máximo legal: hasta 01:00 (vie y sáb 02:00)",
      openNow: closed ? false : null,
    };
  });
}
