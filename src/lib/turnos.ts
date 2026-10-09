import { MINSAL_PHARMACIES } from "./minsal-data";
import { distanceM, type Place } from "./places";

/** Rotación oficial de turnos de Calama (SEREMI de Salud Antofagasta). Ciclo de 26 días; 1 oct 2026 = índice 0. */
const CALAMA_CYCLE: { name: string; street: string }[] = [
  { name: "Cosmofarma", street: "Cobija 2191" },
  { name: "Ahumada", street: "Ramírez 2092" },
  { name: "Ahumada", street: "Latorre 1979" },
  { name: "Cruz Verde", street: "Sotomayor 1898" },
  { name: "Cruz Verde", street: "Latorre 1997" },
  { name: "Cruz Verde", street: "Latorre 1965" },
  { name: "Cruz Verde", street: "Av. Grau 1060" },
  { name: "Cruz Verde", street: "Ramírez 1977-1979" },
  { name: "Dr. Simi", street: "Latorre 1876" },
  { name: "Indep. El Loa", street: "Vicuña Mackenna 2201" },
  { name: "Lackuntur", street: "Latorre 1497" },
  { name: "Farmacias SYG", street: "Granaderos 2205" },
  { name: "Farmacias SYG", street: "Av. Arturo Prat 1597" },
  { name: "La Botika Sin Igual", street: "Latorre 2064" },
  { name: "Maicao", street: "Ramírez 1920" },
  { name: "Redpopular Local N°1", street: "Latorre 1903" },
  { name: "Salcobrand", street: "Ramírez 2031" },
  { name: "Salcobrand", street: "Vivar 1902-1912" },
  { name: "Salcobrand", street: "Granaderos 1474" },
  { name: "Farmacias SYG", street: "Grecia 2510" },
  { name: "Andes Salud", street: "Granaderos 2924" },
  { name: "Maicao", street: "Latorre 1987" },
  { name: "El Zorro", street: "Lautaro 2407" },
  { name: "Ahumada", street: "Av. Chorrillos 1759" },
  { name: "Gema", street: "Bernardo O'Higgins 763" },
  { name: "Ahumada", street: "Av. Huaytiquina 1425" },
];
const ANCHOR = Date.UTC(2026, 9, 1);

/** Fecha local de Chile (UTC-3/-4 aprox.) como "día de turno": el turno corre 09:00–21:00. */
function chileDay(d: Date) {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const [y, m, dd] = s.split("-").map(Number);
  return Date.UTC(y!, m! - 1, dd!);
}

export function calamaTurnoHoy(d = new Date()) {
  const days = Math.round((chileDay(d) - ANCHOR) / 86400000);
  return CALAMA_CYCLE[((days % 26) + 26) % 26]!;
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const numsOf = (s: string): string[] => s.match(/\d{3,4}/g) ?? [];

export function isTurno(p: Place, d = new Date()) {
  if (p.category !== "farmacia" || distanceM(p, { lat: -22.46, lng: -68.93 }) > 15000) return false;
  const t = calamaTurnoHoy(d);
  const tn = numsOf(t.street);
  const pn = numsOf(p.street ?? "");
  return tn.some((n) => pn.includes(n)) && norm(p.street ?? "").includes(norm(t.street).split(" ").find((w) => w.length > 3) ?? "");
}

function chileMinutes(d: Date) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  const [h, m] = s.split(":").map(Number);
  return h! * 60 + m!;
}

/** Farmacias oficiales MINSAL como Place, con horario registrado. */
export function minsalPlaces(d = new Date()): Place[] {
  const now = chileMinutes(d);
  return MINSAL_PHARMACIES.map((f) => {
    const [oh, om] = f.open.split(":").map(Number), [ch, cm] = f.close.split(":").map(Number);
    const o = oh! * 60 + om!, c = ch! * 60 + cm!;
    const openNow = c > o ? now >= o && now < c : now >= o || now < c;
    return {
      id: f.id, name: f.name, category: "farmacia", street: f.street, city: f.city,
      lat: f.lat, lng: f.lng, openingHours: null, phone: f.phone,
      osmUrl: `https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`,
      openNow, hoursText: `Horario MINSAL: ${f.open} – ${f.close}`, source: "minsal" as const,
    };
  });
}

/** Une MINSAL con otras fuentes: si hay un local a <60 m de una farmacia MINSAL, se reemplaza por la versión oficial. */
export function mergeMinsal(places: Place[], d = new Date()): Place[] {
  const official = minsalPlaces(d);
  const rest = places.filter((p) => p.category !== "farmacia" || !official.some((o) => distanceM(o, p) < 60));
  return [...official, ...rest];
}
