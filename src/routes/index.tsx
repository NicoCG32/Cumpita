import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Navigation, Phone, Loader2, Pill, Wine, Check, X, Users, LocateFixed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNearbyPlaces } from "@/lib/places.functions";
import { ZONES, distanceM, isOfficiallyOpen, hoursLabel, cumpitaStatus, REPORT_TTL_MS, type Report, type Category } from "@/lib/places";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { isTurno, calamaTurnoHoy } from "@/lib/turnos";
import { Siren, Sparkles, ShieldCheck, Scale, PencilLine } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { aiSearch } from "@/lib/ai-search.functions";
import { ProposeHours } from "@/components/ProposeHours";

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

type Filter = "all" | "open" | "confirmed" | "turno";
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
    const toReport = (r: { place_id: string; status: string; created_at: string }): Report =>
      ({ placeId: r.place_id, status: r.status as Report["status"], ts: new Date(r.created_at).getTime() });
    supabase.from("place_reports").select("place_id,status,created_at")
      .gte("created_at", new Date(Date.now() - REPORT_TTL_MS).toISOString()).limit(1000)
      .then(({ data }) => { if (data) setReports(data.map(toReport)); });
    const channel = supabase.channel("place_reports")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "place_reports" },
        (payload) => setReports((prev) => [...prev, toReport(payload.new as any)]))
      .subscribe();
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => { clearInterval(t); supabase.removeChannel(channel); };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ name: "Tu ubicación", lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => setLocating(false), { timeout: 8000 });
  };

  const report = async (placeId: string, status: "open" | "closed") => {
    const key = `cumpita-last-${placeId}`;
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < 10 * 60 * 1000) { toast("Ya reportaste este local hace poco. ¡Gracias, cumpita!"); return; }
    const { error } = await supabase.from("place_reports").insert({ place_id: placeId, status });
    if (error) { toast.error("No se pudo enviar tu reporte. Intenta de nuevo."); return; }
    localStorage.setItem(key, String(Date.now()));
    setNow(Date.now());
    toast.success("¡Gracias! Tu reporte ya lo ven todos.");
  };

  const runAi = useServerFn(aiSearch);
  const [q, setQ] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<{ results: { id: string; reason: string }[]; summary: string } | null>(null);
  const [proposing, setProposing] = useState<string | null>(null);
  const fetchPlaces = useServerFn(getNearbyPlaces);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["places", loc.lat.toFixed(3), loc.lng.toFixed(3)],
    queryFn: () => fetchPlaces({ data: { lat: loc.lat, lng: loc.lng } }),
    staleTime: 10 * 60 * 1000,
  });
  const places = data?.places ?? [];
  const live = data?.live ?? false;
  const liveList = places.filter((p) => p.liveTurno);

  const list = useMemo(() => places.map((p) => {
    const pos = { lat: p.lat, lng: p.lng };
    const cumpa = cumpitaStatus(reports, p.id, now);
    const official = isOfficiallyOpen(p, new Date(now));
    const turno = live ? !!p.liveTurno : isTurno(p, new Date(now));
    return { ...p, dist: distanceM(loc, pos), pos, cumpa, official, turno, effectiveOpen: cumpa ? cumpa.status === "open" : official === true };
  }).filter((p) => (cat === "any" || p.category === cat)
    && (filter !== "open" || p.effectiveOpen) && (filter !== "confirmed" || p.cumpa) && (filter !== "turno" || p.turno))
    .sort((a, b) => a.dist - b.dist).slice(0, 40), [places, live, loc, reports, now, filter, cat]);
  const reasons = new Map(ai?.results.map((r) => [r.id, r.reason]) ?? []);
  const shown = ai ? ai.results.map((r) => list.find((p) => p.id === r.id)).filter((p): p is (typeof list)[number] => !!p) : list;
  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2 || aiBusy) return;
    setAiBusy(true);
    try {
      const res = await runAi({ data: { query: q.trim(), candidates: list.map((p) => ({ id: p.id, name: p.name, category: p.category, dist: p.dist, street: p.street, hours: hoursLabel(p), open: p.cumpa ? p.cumpa.status === "open" : p.official, turno: p.turno })) } });
      if (!res.ok) toast.error(res.error); else setAi({ results: res.results, summary: res.summary });
    } catch { toast.error("No pudimos completar la búsqueda."); } finally { setAiBusy(false); }
  };
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
  const cityName = loc.lat > -25 ? "Calama" : "La Serena";

  const chip = (active: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <Toaster position="top-center" />
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
            {["Calama", "La Serena"].map((c) => (
              <div key={c} className="w-full">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{c}</p>
                <div className="flex flex-wrap gap-2">
                  {ZONES.filter((z) => z.city === c).map((z) => <button key={z.name} onClick={() => { setLoc(z); setZoneOpen(false); }} className={chip(loc.name === z.name)}>{z.name.split(" · ")[1]}</button>)}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button className={chip(filter === "all")} onClick={() => setFilter("all")}>Todas</button>
          <button className={chip(filter === "open")} onClick={() => setFilter("open")}>Abiertas ahora</button>
          <button className={chip(filter === "confirmed")} onClick={() => setFilter("confirmed")}>Confirmadas por cumpitas</button>
          <button className={chip(filter === "turno")} onClick={() => setFilter("turno")}>De turno</button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
          {([["any", "Todo"], ["farmacia", "Farmacias"], ["botilleria", "Botillerías"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setCat(k)} className={`rounded-lg py-2 text-xs font-semibold ${cat === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <form onSubmit={askAi} className="mt-2 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="Ej: necesito paracetamol ahora, o algo abierto pasadas las 12"
            className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={aiBusy || isLoading} className="flex items-center gap-1 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Buscar
          </button>
        </form>
      </header>

      <main className="space-y-3 px-4 pt-2">
        {cat !== "botilleria" && live && liveList.map((t) => (
          <a key={t.id} target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lng}`} className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
            <Siren className="h-6 w-6 shrink-0" />
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide opacity-90">De turno hoy en {cityName} · {t.liveTurno!.from === "00:00" && t.liveTurno!.to === "23:59" ? "24 horas" : `${t.liveTurno!.from}–${t.liveTurno!.to}`}</p>
              <p className="truncate font-display text-lg font-bold">{t.name} · {t.street}</p></div>
          </a>))}
        {cat !== "botilleria" && !live && !isLoading && loc.lat > -25 && (() => { const t = calamaTurnoHoy(new Date(now)); return (
          <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Farmacia ${t.name} ${t.street} Calama`)}`} className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
            <Siren className="h-6 w-6 shrink-0" />
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide opacity-90">De turno hoy en Calama · 09:00–21:00 (calendario)</p>
              <p className="truncate font-display text-lg font-bold">{t.name} · {t.street}</p></div>
          </a>); })()}
        {!live && !isLoading && loc.lat < -25 && filter === "turno" && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No pudimos obtener los turnos de La Serena en este momento. Intenta de nuevo en unos minutos.</p>}
        {ai && <div className="rounded-2xl border border-primary/40 bg-primary/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary" />{ai.summary || "Resultados para tu búsqueda"}</p>
          {shown.length === 0 && <p className="mt-1 text-muted-foreground">Ningún local cercano calza con lo que buscas.</p>}
          <button onClick={() => { setAi(null); setQ(""); }} className="mt-1 text-xs font-semibold text-primary underline">Ver todos los locales</button>
        </div>}
        {isLoading && <p className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Buscando locales reales cerca…</p>}
        {isError && <div className="py-16 text-center text-muted-foreground"><p>No pudimos cargar los locales.</p><button onClick={() => refetch()} className="mt-3 font-semibold text-primary">Reintentar</button></div>}
        {!isLoading && !isError && !ai && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nada por aquí con esos filtros.</p>}
        {shown.map((p, i) => (
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.category === "farmacia" ? "Farmacia" : "Botillería"}{i === 0 && !ai && " · la más cerca"}</p>
                {reasons.get(p.id) && <p className="mt-1 flex items-start gap-1 text-xs text-primary"><Sparkles className="mt-0.5 h-3 w-3 shrink-0" />{reasons.get(p.id)}</p>}
                {p.turno && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-closed px-2 py-0.5 text-xs font-bold text-closed-foreground"><Siren className="h-3 w-3" />De turno hoy</span>}
                <p className="mt-1 truncate text-sm">{p.street ?? "Dirección no informada"}{p.city ? `, ${p.city}` : ""}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1 truncate"><Clock className="h-3.5 w-3.5" />{hoursLabel(p)}</span>
                  {p.rating != null && <span className="flex items-center gap-0.5 font-semibold text-foreground"><span className="text-star">★</span>{p.rating.toFixed(1)}{p.ratingCount ? <span className="font-normal text-muted-foreground">({p.ratingCount})</span> : null}</span>}
                  {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />Llamar</a>}
                </div>
              </div>
            </div>

            {p.hoursKind === "confirmed" && <p className="mt-2 flex items-center gap-1 rounded-lg bg-open/10 px-2 py-1 text-xs font-semibold text-open"><ShieldCheck className="h-3.5 w-3.5" />Horario confirmado{p.verifiedAt ? ` · verificado el ${fmtDate(p.verifiedAt)}` : ""}</p>}
            {p.hoursKind === "legal" && <p className="mt-2 flex items-center gap-1 rounded-lg border border-dashed px-2 py-1 text-xs text-muted-foreground"><Scale className="h-3.5 w-3.5" />Solo máximo legal, no es el horario real del local</p>}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 font-semibold ${p.official === null ? "bg-muted text-muted-foreground" : p.official ? "bg-open/15 text-open" : "bg-closed/15 text-closed"}`}>
                Horario: {p.official === null ? "sin datos" : p.official ? "abierto" : "cerrado"}
              </span>
              <a href={p.osmUrl} target="_blank" rel="noreferrer" className="ml-auto text-muted-foreground underline">{p.source === "google" ? "Google" : p.source === "minsal" ? "MINSAL" : "Fuente"}</a>
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
            {p.category === "botilleria" && (proposing === p.id
              ? <ProposeHours placeId={p.id} placeName={p.name} onDone={() => setProposing(null)} />
              : <button onClick={() => setProposing(p.id)} className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground"><PencilLine className="h-3.5 w-3.5" />{p.hoursKind === "confirmed" ? "¿Cambió el horario? Propón una corrección" : "¿Conoces el horario real? Propónlo"}</button>)}
          </article>
        ))}
      </main>
      <p className="px-4 pt-6 text-center text-xs text-muted-foreground">Datos: MINSAL (farmacias y horarios), SEREMI de Salud (turnos de Calama), OpenStreetMap y Google Places · <Link to="/revision" className="underline">Revisión de horarios</Link></p>
    </div>
  );
}
