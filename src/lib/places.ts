import OpeningHours from "opening_hours";

export type Category = "farmacia" | "botilleria";
export type Place = {
  id: string; name: string; category: Category; street: string | null; city: string | null;
  lat: number; lng: number; openingHours: string | null; phone: string | null; osmUrl: string;
};

export const ZONES = [
  { name: "Providencia", lat: -33.4263, lng: -70.6157 },
  { name: "Ñuñoa", lat: -33.4569, lng: -70.5976 },
  { name: "Santiago Centro", lat: -33.4372, lng: -70.6506 },
  { name: "Las Condes", lat: -33.408, lng: -70.567 },
  { name: "Valparaíso", lat: -33.0472, lng: -71.6127 },
];

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** true/false when hours are known and parseable, null when unknown. */
export function isOfficiallyOpen(p: Place, d = new Date()): boolean | null {
  if (!p.openingHours) return null;
  try { return new OpeningHours(p.openingHours, null).getState(d); } catch { return null; }
}

const DAYS: Record<string, string> = { Mo: "Lu", Tu: "Ma", We: "Mi", Th: "Ju", Fr: "Vi", Sa: "Sá", Su: "Do", PH: "Feriados", off: "cerrado" };
export function hoursLabel(p: Place) {
  if (!p.openingHours) return "Horario no informado";
  if (p.openingHours.trim() === "24/7") return "Abierto 24 horas";
  return p.openingHours.replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|off)\b/g, (m) => DAYS[m] ?? m).replace(/;/g, " ·");
}

export type Report = { placeId: string; status: "open" | "closed"; ts: number };
export const REPORT_TTL_MS = 60 * 60 * 1000;

export function cumpitaStatus(reports: Report[], placeId: string, now = Date.now()) {
  const live = reports.filter((r) => r.placeId === placeId && now - r.ts < REPORT_TTL_MS).sort((a, b) => b.ts - a.ts);
  const first = live[0];
  if (!first) return null;
  const count = live.filter((r) => r.status === first.status).length;
  return { status: first.status, count, last: first.ts, expiresIn: REPORT_TTL_MS - (now - first.ts) };
}
