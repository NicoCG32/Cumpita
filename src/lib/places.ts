import OpeningHours from "opening_hours";

export type Category = "farmacia" | "botilleria" | "libreria" | "minimarket";
export type Place = {
  id: string; name: string; category: Category; street: string | null; city: string | null;
  lat: number; lng: number; openingHours: string | null; phone: string | null; osmUrl: string;
  rating?: number | null; ratingCount?: number | null; openNow?: boolean | null; hoursText?: string | null; source?: "osm" | "google" | "minsal" | "turno" | "community";
  /** Turno vigente obtenido en vivo (boletín diario MINSAL). */
  liveTurno?: { from: string; to: string } | null;
  /** legal = solo máximo legal; confirmed = horario aprobado por revisión. */
  hoursKind?: "legal" | "confirmed" | null;
  verifiedAt?: string | null;
};

export const ZONES = [
  { city: "Calama", name: "Calama · Centro", lat: -22.4624, lng: -68.9272 },
  { city: "Calama", name: "Calama · Granaderos", lat: -22.4550, lng: -68.9220 },
  { city: "Calama", name: "Calama · Mall Plaza / Balmaceda", lat: -22.4685, lng: -68.9325 },
  { city: "La Serena", name: "La Serena · Centro Histórico", lat: -29.9027, lng: -71.2520 },
  { city: "La Serena", name: "La Serena · Mall Plaza / Balmaceda", lat: -29.9145, lng: -71.2515 },
  { city: "La Serena", name: "La Serena · Cuatro Esquinas", lat: -29.9320, lng: -71.2480 },
  { city: "Calama", name: "Calama · Kamac Mayu", lat: -22.4440, lng: -68.9050 },
  { city: "Calama", name: "Calama · Villa Ayquina", lat: -22.4730, lng: -68.9150 },
  { city: "Coquimbo", name: "Coquimbo · Centro / Puerto", lat: -29.9533, lng: -71.3436 },
  { city: "Coquimbo", name: "Coquimbo · El Llano", lat: -29.9660, lng: -71.3330 },
  { city: "Coquimbo", name: "Coquimbo · Sindempart", lat: -29.9790, lng: -71.3030 },
  { city: "Coquimbo", name: "Coquimbo · Peñuelas", lat: -29.9440, lng: -71.2830 },
  { city: "Coquimbo", name: "Coquimbo · La Cantera", lat: -29.9890, lng: -71.3230 },
];

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** true/false when hours are known and parseable, null when unknown. */
export function isOfficiallyOpen(p: Place, d = new Date()): boolean | null {
  if (p.openNow != null) return p.openNow;
  if (!p.openingHours) return null;
  try { return new OpeningHours(p.openingHours, null).getState(d); } catch { return null; }
}

const DAYS: Record<string, string> = { Mo: "Lu", Tu: "Ma", We: "Mi", Th: "Ju", Fr: "Vi", Sa: "Sá", Su: "Do", PH: "Feriados", off: "cerrado" };
export function hoursLabel(p: Place) {
  if (p.hoursText) return p.hoursText;
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

/** Abierto 24 horas según el horario publicado. */
export const is24h = (p: Pick<Place, "openingHours">) => p.openingHours?.trim() === "24/7";
/** Tienda de servicentro (Copec Pronto/Punto, Shell Upa!, Petrobras Spacio1, Aramco, Oxxo). */
export const isServicentro = (p: Pick<Place, "name">) => /\b(pronto|punto copec|copec|upa!?|spacio ?1|aramco|petrobras|shell|oxxo)\b/i.test(p.name);
/** Texto normalizado para búsqueda instantánea (sin tildes, minúsculas). */
export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
