import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Footprints, Car, X, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/places";

export type MapPlace = {
  id: string; name: string; category: Category; street: string | null;
  lat: number; lng: number; dist: number; turno: boolean; effectiveOpen: boolean;
  cumpa: { status: "open" | "closed" } | null; official: boolean | null;
};

type Mode = "foot" | "car";
type RouteInfo = { m: number; s: number } | null;

const pinClass = (p: MapPlace) =>
  p.turno ? "bg-primary animate-pulse" :
  p.cumpa?.status === "closed" ? "bg-closed" :
  p.effectiveOpen ? "bg-open" :
  p.official === false ? "bg-closed/60" : "bg-muted-foreground";

const fmt = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

export default function MapView({ places, origin }: { places: MapPlace[]; origin: { lat: number; lng: number } }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.Polyline | null>(null);
  const [sel, setSel] = useState<MapPlace | null>(null);
  const [mode, setMode] = useState<Mode>("foot");
  const [route, setRoute] = useState<RouteInfo>(null);
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false }).setView([origin.lat, origin.lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
    L.control.zoom({ position: "topright" }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    L.marker([origin.lat, origin.lng], {
      icon: L.divIcon({ className: "", html: `<div class="h-4 w-4 rounded-full border-2 border-background bg-pharmacy shadow ring-4 ring-pharmacy/30"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] }),
      zIndexOffset: 1000,
    }).addTo(g);
    for (const p of places) {
      const icon = L.divIcon({
        className: "",
        html: `<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-sm shadow-md ${pinClass(p)}">${p.category === "botilleria" ? "🍷" : CATEGORIES[p.category].emoji}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });
      L.marker([p.lat, p.lng], { icon }).on("click", () => setSel(p)).addTo(g);
    }
  }, [places, origin.lat, origin.lng]);

  useEffect(() => { map.current?.setView([origin.lat, origin.lng]); }, [origin.lat, origin.lng]);

  useEffect(() => {
    routeLayer.current?.remove();
    routeLayer.current = null;
    setRoute(null);
    if (!sel || !map.current) return;
    const ctrl = new AbortController();
    setRouting(true);
    const profile = mode === "foot" ? "routed-foot" : "routed-car";
    fetch(`https://routing.openstreetmap.de/${profile}/route/v1/driving/${origin.lng},${origin.lat};${sel.lng},${sel.lat}?overview=full&geometries=geojson`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] }) => {
        const r = j.routes?.[0];
        if (!r || !map.current) return;
        const line = L.polyline(r.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]), { color: "#e8743b", weight: 5, opacity: 0.85 }).addTo(map.current);
        routeLayer.current = line;
        map.current.fitBounds(line.getBounds(), { padding: [40, 40] });
        setRoute({ m: r.distance, s: r.duration });
      })
      .catch(() => {})
      .finally(() => setRouting(false));
    return () => ctrl.abort();
  }, [sel, mode, origin.lat, origin.lng]);

  const dest = sel ? `${sel.lat},${sel.lng}` : "";
  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-sm">
      <div ref={el} className="h-[65vh] w-full" />
      <div className="pointer-events-none absolute left-2 top-2 z-[400] flex flex-wrap gap-1 text-[10px] font-semibold">
        {[["bg-primary", "De turno"], ["bg-open", "Abierto"], ["bg-closed", "Cerrado"], ["bg-muted-foreground", "Sin datos"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 shadow"><span className={`h-2 w-2 rounded-full ${c}`} />{l}</span>
        ))}
      </div>
      {sel && (
        <div className="absolute inset-x-2 bottom-2 z-[400] rounded-2xl border bg-card p-3 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display font-bold">{sel.name}</p>
              <p className="truncate text-xs text-muted-foreground">{sel.street ?? "Dirección no informada"} · {fmt(sel.dist)} en línea recta</p>
            </div>
            <button onClick={() => setSel(null)} aria-label="Cerrar" className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {(["foot", "car"] as const).map((md) => (
              <button key={md} onClick={() => setMode(md)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${mode === md ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {md === "foot" ? <Footprints className="h-3.5 w-3.5" /> : <Car className="h-3.5 w-3.5" />}{md === "foot" ? "A pie" : "En auto"}
              </button>
            ))}
            <span className="ml-auto text-sm font-bold">
              {routing ? <Loader2 className="h-4 w-4 animate-spin" /> : route ? `${Math.max(1, Math.round(route.s / 60))} min · ${fmt(route.m)}` : "Sin ruta"}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs font-semibold">
            <a href={`https://waze.com/ul?ll=${dest}&navigate=yes`} target="_blank" rel="noreferrer" className="rounded-lg bg-muted py-2 text-center">Waze</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode === "foot" ? "walking" : "driving"}`} target="_blank" rel="noreferrer" className="rounded-lg bg-muted py-2 text-center">Google Maps</a>
            <a href={`https://maps.apple.com/?daddr=${dest}&dirflg=${mode === "foot" ? "w" : "d"}`} target="_blank" rel="noreferrer" className="rounded-lg bg-muted py-2 text-center">Apple Maps</a>
          </div>
        </div>
      )}
    </div>
  );
}
