import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { distanceM, type Place } from "./places";
import { mergeMinsal, minsalPlaces } from "./turnos";
import { applyHours, type ApprovedHours } from "./botillerias";
import { liveTurnos, mergeTurnos, turnosAt, citySlugsNear } from "./turnos-live";
import { ZONES } from "./places";
import { asCategory, osmCategory } from "./categories";

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fromOsm(lat: number, lng: number): Promise<Place[]> {
  const a = `(around:4000,${lat},${lng})`;
  const q = `[out:json][timeout:25];(nwr["amenity"="pharmacy"]${a};nwr["shop"~"^(alcohol|beverages|stationery|copyshop|books|convenience|supermarket|general|kiosk|hardware|doityourself)$"]${a};nwr["amenity"="fuel"]["shop"]${a};);out center tags;`;
  // Consulta todas las réplicas en paralelo (12 s máx.) y usa la primera que responda.
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  let json: { elements: any[] } | null = null;
  try {
    json = await Promise.any(MIRRORS.map(async (url) => {
      const res = await fetch(url, {
        method: "POST", signal: ctrl.signal,
        headers: { "User-Agent": "CumpitaApp/1.0", Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q),
      });
      if (!res.ok) throw new Error(String(res.status));
      return (await res.json()) as { elements: any[] };
    }));
  } catch { json = null; } finally { clearTimeout(timer); ctrl.abort(); }
  const { logOps } = await import("./ops.server");
  void logOps("source", "osm", !!json, Date.now() - t0, json ? undefined : "todas las réplicas fallaron");
  if (!json) throw new Error("No pudimos cargar los locales. Intenta de nuevo en un momento.");
  return json.elements
    .map((e): Place | null => {
      const t = e.tags ?? {};
      const plat = e.lat ?? e.center?.lat, plng = e.lon ?? e.center?.lon;
      if (plat == null || plng == null) return null;
      const category = osmCategory(t);
      if (!category) return null;
      const street = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
      const name = t.amenity === "fuel" ? [t.brand || t.name || "Servicentro", t["shop:name"] || (t.shop === "convenience" ? "tienda" : "")].filter(Boolean).join(" · ") : t.name || t.brand || ({ farmacia: "Farmacia", botilleria: "Botillería", libreria: "Librería", minimarket: "Almacén", ferreteria: "Ferretería" } as const)[category];
      return {
        id: `${e.type}/${e.id}`, name,
        category, street: street || null, city: t["addr:city"] || null,
        lat: plat, lng: plng, openingHours: t.opening_hours || null,
        phone: t.phone || t["contact:phone"] || null,
        osmUrl: `https://www.openstreetmap.org/${e.type}/${e.id}`, source: "osm",
      };
    })
    .filter((p): p is Place => p !== null);
}

async function fromGoogle(lat: number, lng: number, key: string): Promise<Place[]> {
  const fields = "places.id,places.displayName,places.shortFormattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.nationalPhoneNumber,places.googleMapsUri";
  const search = async (type: string) => {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": fields },
      body: JSON.stringify({ includedTypes: [type], maxResultCount: 20, rankPreference: "DISTANCE", languageCode: "es", locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 4000 } } }),
    });
    if (!res.ok) throw new Error("google " + res.status);
    return ((await res.json()).places ?? []) as any[];
  };
  const [ph, lq, bk, cv, hw] = await Promise.all([search("pharmacy"), search("liquor_store"), search("book_store").catch(() => []), search("convenience_store").catch(() => []), search("hardware_store").catch(() => [])]);
  const map = (g: any, category: Place["category"]): Place => {
    const wd: string[] = g.currentOpeningHours?.weekdayDescriptions ?? [];
    const today = wd[(new Date().getDay() + 6) % 7];
    return {
      id: `g/${g.id}`, name: g.displayName?.text ?? "Local", category,
      street: g.shortFormattedAddress ?? null, city: null,
      lat: g.location.latitude, lng: g.location.longitude, openingHours: null,
      phone: g.nationalPhoneNumber ?? null, osmUrl: g.googleMapsUri,
      rating: g.rating ?? null, ratingCount: g.userRatingCount ?? null,
      openNow: g.currentOpeningHours?.openNow ?? null, hoursText: today ? `Hoy: ${today.split(": ").slice(1).join(": ")}` : null,
      source: "google",
    };
  };
  return [...ph.map((g) => map(g, "farmacia")), ...lq.map((g) => map(g, "botilleria")), ...bk.map((g) => map(g, "libreria")), ...cv.map((g) => map(g, "minimarket")), ...hw.map((g) => map(g, "ferreteria"))];
}

const FRESH_MS = 6 * 60 * 60 * 1000;
const mem = new Map<string, { at: number; places: Place[] }>();

async function cacheGet(key: string): Promise<{ at: number; places: Place[] } | null> {
  const m = mem.get(key);
  if (m) return m;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("places_cache").select("places, updated_at").eq("key", key).maybeSingle();
    if (!data) return null;
    const v = { at: new Date(data.updated_at).getTime(), places: data.places as unknown as Place[] };
    mem.set(key, v);
    return v;
  } catch { return null; }
}

async function cacheSet(key: string, places: Place[]) {
  mem.set(key, { at: Date.now(), places });
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("places_cache").upsert({ key, places: places as any, updated_at: new Date().toISOString() });
  } catch { /* ignore */ }
}

async function fetchFresh(lat: number, lng: number): Promise<Place[]> {
  const key = process.env['GOOGLE_PLACES_API_KEY'];
  if (key) {
    try { return mergeMinsal(await fromGoogle(lat, lng, key)); } catch { /* fall back */ }
  }
  return mergeMinsal(await fromOsm(lat, lng));
}

const refreshing = new Set<string>();
const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

type Base = { places: Place[]; at: number | null; stale: boolean };
const zoneKey = (lat: number, lng: number) => `v2:${lat.toFixed(2)},${lng.toFixed(2)}`;

async function base(lat: number, lng: number): Promise<Base> {
  const ck = zoneKey(lat, lng);
  const cached = await cacheGet(ck);
  if (cached && Date.now() - cached.at < FRESH_MS) return { places: cached.places, at: cached.at, stale: false };
  if (cached) {
    // Datos guardados al instante; se refrescan en segundo plano.
    if (!refreshing.has(ck)) {
      refreshing.add(ck);
      void fetchFresh(lat, lng).then((f) => f.length ? cacheSet(ck, f) : undefined).catch(() => {}).finally(() => refreshing.delete(ck));
    }
    return { places: cached.places, at: cached.at, stale: true };
  }
  try {
    const fresh = await fetchFresh(lat, lng);
    if (fresh.length) await cacheSet(ck, fresh);
    return { places: fresh, at: Date.now(), stale: false };
  } catch (e) {
    const { logOps } = await import("./ops.server");
    const legacy = await cacheGet(ck.slice(3));
    if (legacy) { void logOps("cache", "places-legacy", true); return { places: legacy.places, at: legacy.at, stale: true }; }
    const official = mergeMinsal([]);
    if (official.length) { void logOps("cache", "minsal-only", true); return { places: official, at: null, stale: true }; }
    throw e;
  }
}

/** Refresca la zona guardada hace más tiempo (lo usa la tarea programada). */
export async function refreshStalestZones(n: number): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const keys = ZONES.map((z) => zoneKey(z.lat, z.lng));
  const { data } = await supabaseAdmin.from("places_cache").select("key, updated_at").in("key", keys);
  const ages = new Map((data ?? []).map((r) => [r.key, new Date(r.updated_at).getTime()]));
  const order = [...new Set(keys)].sort((a, b) => (ages.get(a) ?? 0) - (ages.get(b) ?? 0)).slice(0, n);
  const done: string[] = [];
  for (const k of order) {
    const z = ZONES.find((x) => zoneKey(x.lat, x.lng) === k)!;
    try { const f = await fetchFresh(z.lat, z.lng); if (f.length) { await cacheSet(k, f); done.push(z.name); } } catch { /* registrado en fromOsm */ }
  }
  return done;
}

async function approvedHours(): Promise<ApprovedHours[]> {
  const url = process.env['SUPABASE_URL'], key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/hours_proposals?status=eq.approved&select=place_id,weekday_open,weekday_close,weekend_open,weekend_close,reviewed_at&limit=2000`, { headers: { apikey: key } });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

async function communityPlaces(lat: number, lng: number): Promise<Place[]> {
  const url = process.env['SUPABASE_URL'], key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/place_suggestions?status=eq.approved&kind=eq.missing&select=id,name,category,city,address,lat,lng,reviewed_at&limit=2000`, { headers: { apikey: key } });
    const rows: { id: string; name: string | null; category: string | null; city: string | null; address: string | null; lat: number; lng: number }[] = res.ok ? await res.json() : [];
    return rows.filter((r) => r.name && distanceM({ lat, lng }, r) <= 4000).map((r) => ({
      id: `c/${r.id}`, name: r.name!, category: asCategory(r.category),
      street: r.address, city: r.city, lat: r.lat, lng: r.lng, openingHours: null, phone: null,
      osmUrl: `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`, source: "community" as const,
    }));
  } catch { return []; }
}

async function hiddenIds(): Promise<Set<string>> {
  const url = process.env['SUPABASE_URL'], key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return new Set();
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_hidden_place_ids`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: "{}" });
    const rows: { place_id: string }[] = res.ok ? await res.json() : [];
    return new Set(rows.map((r) => r.place_id));
  } catch { return new Set(); }
}

export type PlacesMeta = { placesAt: number | null; turnosAt: number | null; stale: boolean };

async function allPlaces(lat: number, lng: number) {
  const [raw, community, turnos, approved, hidden] = await Promise.all([
    base(lat, lng),
    withTimeout(communityPlaces(lat, lng), 5000, []),
    withTimeout(liveTurnos(lat, lng), 8000, null as Awaited<ReturnType<typeof liveTurnos>> | null),
    withTimeout(approvedHours(), 5000, []),
    withTimeout(hiddenIds(), 5000, new Set<string>()),
  ]);
  const places = raw.places.filter((p) => !hidden.has(p.id));
  const extra = community.filter((c) => !hidden.has(c.id) && !places.some((p) => distanceM(p, c) < 40));
  const fixed = applyHours([...places, ...extra], approved);
  const ts = citySlugsNear(lat, lng).map(turnosAt).filter((x): x is number => x != null);
  const meta: PlacesMeta = { placesAt: raw.at, stale: raw.stale, turnosAt: ts.length ? Math.min(...ts) : null };
  return turnos ? { places: mergeTurnos(fixed, turnos), live: true, meta } : { places: fixed, live: false, meta };
}

/** Encuentra coordenadas de un local solo con su id (enlaces compartidos sin lat/lng). */
async function locateId(id: string): Promise<{ lat: number; lng: number } | null> {
  const m = minsalPlaces().find((p) => p.id === id);
  if (m) return m;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (id.startsWith("c/")) {
      const { data } = await supabaseAdmin.from("place_suggestions").select("lat,lng").eq("id", id.slice(2)).eq("status", "approved").maybeSingle();
      return data?.lat != null && data?.lng != null ? { lat: data.lat, lng: data.lng } : null;
    }
    const { data } = await supabaseAdmin.from("places_cache").select("places").limit(200);
    for (const row of data ?? []) {
      const hit = (row.places as unknown as Place[]).find((p) => p.id === id);
      if (hit) return { lat: hit.lat, lng: hit.lng };
    }
  } catch { /* sin datos */ }
  return null;
}

export const getNearbyPlaces = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }): Promise<{ places: Place[]; live: boolean; meta: PlacesMeta }> => {
    return allPlaces(data.lat, data.lng);
  });

export const getPlaceById = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().min(1).max(200), lat: z.number().optional(), lng: z.number().optional() }).parse(d))
  .handler(async ({ data }): Promise<{ place: Place | null; cumpa: { status: "open" | "closed"; last: number; count: number } | null }> => {
    let pos = data.lat != null && data.lng != null ? { lat: data.lat, lng: data.lng } : await locateId(data.id);
    let place: Place | null = null;
    if (pos) place = (await allPlaces(pos.lat, pos.lng)).places.find((p) => p.id === data.id) ?? null;
    if (!place && data.lat != null) {
      pos = await locateId(data.id);
      if (pos) place = (await allPlaces(pos.lat, pos.lng)).places.find((p) => p.id === data.id) ?? null;
    }
    let cumpa = null;
    const url = process.env['SUPABASE_URL'], key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (place && url && key) {
      try {
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const res = await fetch(`${url}/rest/v1/place_reports?place_id=eq.${encodeURIComponent(data.id)}&created_at=gte.${since}&select=status,created_at&order=created_at.desc&limit=50`, { headers: { apikey: key } });
        const rows: { status: "open" | "closed"; created_at: string }[] = res.ok ? await res.json() : [];
        if (rows[0]) cumpa = { status: rows[0].status, last: new Date(rows[0].created_at).getTime(), count: rows.filter((r) => r.status === rows[0]!.status).length };
      } catch { /* sin estado */ }
    }
    return { place, cumpa };
  });

/** Señales de la app (carga lenta, reintento, error). Sin ubicación ni identidad. */
export const logClientEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ kind: z.enum(["slow", "retry", "load_error"]), ms: z.number().int().min(0).max(600000).optional() }).parse(d))
  .handler(async ({ data }) => {
    const { logOps } = await import("./ops.server");
    await logOps(data.kind, "app", data.kind !== "load_error", data.ms);
    return { ok: true };
  });
