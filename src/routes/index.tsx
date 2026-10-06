import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Navigation, Phone, Loader2, Pill, Wine, Check, X, Users, LocateFixed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNearbyPlaces } from "@/lib/places.functions";
import { ZONES, distanceM, isOfficiallyOpen, hoursLabel, cumpitaStatus, type Report, type Category } from "@/lib/places";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cumpita — Farmacias y botillerías cerca de ti" },
      { name: "description", content: "Encuentra la farmacia o botillería más cercana y revisa si está abierta según los cumpitas." },
      { property: "og:title", content: "Cumpita — ¿Está abierto ahora?" },
      { property: "og:description", content: "Locales cercanos ordenados por distancia, confirmados por la comunidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Filter = "all" | "open" | "confirmed";
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
const ago = (ms: number) => { const m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.round(m / 60)} h`; };

function Index() {
  const [loc, setLoc] = useState<{ name: string; lat: number; lng: number }>(ZONES[0]!);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [cat, setCat] = useState<Category | "any">("any");
  const [reports, setReports] = useState<Report[]>([]);
  const [now, setNow] = useState(Date.now());
  const [zoneOpen, setZoneOpen] = useState(false);

  useEffect(() => {
    try { setReports(JSON.parse(localStorage.getItem("cumpita-reports") || "[]")); } catch {}
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ name: "Tu ubicación", lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => setLocating(false), { timeout: 8000 });
  };

  const report = (placeId: string, status: "open" | "closed") => {
    const next = [...reports, { placeId, status, ts: Date.now() }];
    setReports(next); setNow(Date.now());
    localStorage.setItem("cumpita-reports", JSON.stringify(next));
  };

  const fetchPlaces = useServerFn(getNearbyPlaces);
  const { data: places = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["places", loc.lat.toFixed(3), loc.lng.toFixed(3)],
    queryFn: () => fetchPlaces({ data: { lat: loc.lat, lng: loc.lng } }),
    staleTime: 10 * 60 * 1000,
  });

  const list = useMemo(() => places.map((p) => {
    const pos = { lat: p.lat, lng: p.lng };
    const cumpa = cumpitaStatus(reports, p.id, now);
    const official = isOfficiallyOpen(p, new Date(now));
    return { ...p, dist: distanceM(loc, pos), pos, cumpa, official, effectiveOpen: cumpa ? cumpa.status === "open" : official === true };
  }).filter((p) => (cat === "any" || p.category === cat)
    && (filter !== "open" || p.effectiveOpen) && (filter !== "confirmed" || p.cumpa))
    .sort((a, b) => a.dist - b.dist).slice(0, 40), [places, loc, reports, now, filter, cat]);

  const chip = (active: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <header className="sticky top-0 z-10 bg-background/90 px-4 pb-3 pt-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">cumpita<span className="text-primary">.</span></h1>
          <button onClick={locate} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold">
            <LocateFixed className="h-4 w-4 text-primary" />{locating ? "Buscando…" : "Usar GPS"}
          </button>
        </div>
        <button onClick={() => setZoneOpen((v) => !v)} className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> Cerca de <span className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4">{loc.name}</span>
        </button>
        {zoneOpen && (
          <div className="mt-2 flex flex-wrap gap-2">
            {ZONES.map((z) => <button key={z.name} onClick={() => { setLoc(z); setZoneOpen(false); }} className={chip(loc.name === z.name)}>{z.name}</button>)}
          </div>
        )}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button className={chip(filter === "all")} onClick={() => setFilter("all")}>Todas</button>
          <button className={chip(filter === "open")} onClick={() => setFilter("open")}>Abiertas ahora</button>
          <button className={chip(filter === "confirmed")} onClick={() => setFilter("confirmed")}>Confirmadas por cumpitas</button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
          {([["any", "Todo"], ["farmacia", "Farmacias"], ["botilleria", "Botillerías"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setCat(k)} className={`rounded-lg py-2 text-xs font-semibold ${cat === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
      </header>

      <main className="space-y-3 px-4 pt-2">
        {isLoading && <p className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Buscando locales reales cerca…</p>}
        {isError && <div className="py-16 text-center text-muted-foreground"><p>No pudimos cargar los locales.</p><button onClick={() => refetch()} className="mt-3 font-semibold text-primary">Reintentar</button></div>}
        {!isLoading && !isError && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nada por aquí con esos filtros.</p>}
        {list.map((p, i) => (
          <article key={p.id} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.category === "farmacia" ? "bg-pharmacy/15 text-pharmacy" : "bg-liquor/15 text-liquor"}`}>
                {p.category === "farmacia" ? <Pill className="h-5 w-5" /> : <Wine className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="truncate font-display text-lg font-bold">{p.name}</h2>
                  <span className="shrink-0 font-display text-lg font-extrabold text-primary">{fmtDist(p.dist)}</span>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.category === "farmacia" ? "Farmacia" : "Botillería"}{i === 0 && " · la más cerca"}</p>
                <p className="mt-1 truncate text-sm">{p.street ?? "Dirección no informada"}{p.city ? `, ${p.city}` : ""}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{hoursLabel(p)}</span>
                  {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />Llamar</a>}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 font-semibold ${p.official === null ? "bg-muted text-muted-foreground" : p.official ? "bg-open/15 text-open" : "bg-closed/15 text-closed"}`}>
                Horario: {p.official === null ? "sin datos" : p.official ? "abierto" : "cerrado"}
              </span>
              <a href={p.osmUrl} target="_blank" rel="noreferrer" className="ml-auto text-muted-foreground underline">Fuente</a>
            </div>

            <div className={`mt-2 rounded-xl p-3 ${p.cumpa ? (p.cumpa.status === "open" ? "bg-open/10" : "bg-closed/10") : "bg-muted"}`}>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Users className="h-4 w-4" />
                {p.cumpa
                  ? <span className={p.cumpa.status === "open" ? "text-open" : "text-closed"}>
                      Confirmado {p.cumpa.status === "open" ? "abierto" : "cerrado"} hace {ago(now - p.cumpa.last)} por {p.cumpa.count} cumpita{p.cumpa.count > 1 ? "s" : ""}
                    </span>
                  : <span className="text-muted-foreground">Sin reportes recientes. ¿Estás cerca?</span>}
              </p>
              {p.cumpa && <p className="mt-0.5 text-xs text-muted-foreground">El estado caduca en {ago(p.cumpa.expiresIn)}</p>}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => report(p.id, "open")} className="flex items-center justify-center gap-1 rounded-lg bg-open py-2.5 text-sm font-bold text-open-foreground active:scale-95"><Check className="h-4 w-4" />Está abierto</button>
                <button onClick={() => report(p.id, "closed")} className="flex items-center justify-center gap-1 rounded-lg bg-closed py-2.5 text-sm font-bold text-closed-foreground active:scale-95"><X className="h-4 w-4" />Está cerrado</button>
              </div>
            </div>

            <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.pos.lat},${p.pos.lng}`}
              className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary">
              <Navigation className="h-4 w-4" /> Cómo llegar
            </a>
          </article>
        ))}
      </main>
      <p className="px-4 pt-6 text-center text-xs text-muted-foreground">Datos de locales © colaboradores de OpenStreetMap</p>
    </div>
  );
}
