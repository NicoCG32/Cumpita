export type Category = "farmacia" | "botilleria";
export type Place = {
  id: string; name: string; category: Category; street: string;
  dLat: number; dLng: number; open: number; close: number; rating: number;
};

// Offsets (degrees) relative to the user's position, so the demo works anywhere.
export const PLACES: Place[] = [
  { id: "f1", name: "Farmacia Cruz Verde", category: "farmacia", street: "Av. Providencia 1820", dLat: 0.002, dLng: 0.001, open: 0, close: 24, rating: 4.3 },
  { id: "f2", name: "Salcobrand", category: "farmacia", street: "Los Leones 455", dLat: -0.004, dLng: 0.003, open: 9, close: 22, rating: 4.1 },
  { id: "f3", name: "Farmacias Ahumada", category: "farmacia", street: "Manuel Montt 210", dLat: 0.006, dLng: -0.004, open: 8, close: 23, rating: 3.9 },
  { id: "f4", name: "Farmacia del Barrio", category: "farmacia", street: "Pedro de Valdivia 980", dLat: -0.008, dLng: -0.006, open: 10, close: 20, rating: 4.7 },
  { id: "f5", name: "Dr. Simi", category: "farmacia", street: "Irarrázaval 2340", dLat: 0.011, dLng: 0.007, open: 9, close: 21, rating: 4.0 },
  { id: "b1", name: "Botillería El Cumpa", category: "botilleria", street: "Condell 1120", dLat: 0.001, dLng: -0.002, open: 11, close: 2, rating: 4.5 },
  { id: "b2", name: "La Licorería 24", category: "botilleria", street: "Av. Italia 870", dLat: -0.003, dLng: -0.001, open: 0, close: 24, rating: 3.8 },
  { id: "b3", name: "Botillería Don Lucho", category: "botilleria", street: "Seminario 345", dLat: 0.005, dLng: 0.005, open: 12, close: 1, rating: 4.2 },
  { id: "b4", name: "Liquidos Express", category: "botilleria", street: "Bilbao 1560", dLat: -0.007, dLng: 0.008, open: 10, close: 23, rating: 4.0 },
  { id: "b5", name: "Botillería La Esquina", category: "botilleria", street: "Antonio Varas 77", dLat: 0.009, dLng: -0.009, open: 13, close: 3, rating: 4.6 },
];

export const ZONES = [
  { name: "Providencia", lat: -33.4263, lng: -70.6157 },
  { name: "Ñuñoa", lat: -33.4569, lng: -70.5976 },
  { name: "Santiago Centro", lat: -33.4372, lng: -70.6506 },
  { name: "Las Condes", lat: -33.4080, lng: -70.5670 },
  { name: "Valparaíso", lat: -33.0472, lng: -71.6127 },
];

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isOfficiallyOpen(p: Place, d = new Date()) {
  if (p.open === 0 && p.close === 24) return true;
  const h = d.getHours() + d.getMinutes() / 60;
  return p.close > p.open ? h >= p.open && h < p.close : h >= p.open || h < p.close;
}

export const hoursLabel = (p: Place) =>
  p.open === 0 && p.close === 24 ? "Abierto 24 horas" : `${String(p.open).padStart(2, "0")}:00 – ${String(p.close % 24).padStart(2, "0")}:00`;

export type Report = { placeId: string; status: "open" | "closed"; ts: number };
export const REPORT_TTL_MS = 60 * 60 * 1000;

export function cumpitaStatus(reports: Report[], placeId: string, now = Date.now()) {
  const live = reports.filter((r) => r.placeId === placeId && now - r.ts < REPORT_TTL_MS).sort((a, b) => b.ts - a.ts);
  if (!live.length) return null;
  const status = live[0]!.status;
  const same = live.filter((r) => r.status === status);
  return { status, count: same.length, last: live[0]!.ts, expiresIn: REPORT_TTL_MS - (now - live[0]!.ts) };
}
