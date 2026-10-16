import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock, MapPin, Navigation, Phone, Share2, Star, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PLACE_TAGS, TAG_TTL, type PlaceTagKey } from "@/lib/tags";
import { distanceM } from "@/lib/places";
import { getPlaceById } from "@/lib/places.functions";
import { hoursLabel, isOfficiallyOpen } from "@/lib/places";
import { useFavorites } from "@/lib/favorites";

const SITE = "https://cumpita.lovable.app";

export const Route = createFileRoute("/local/$")({
  validateSearch: z.object({ lat: z.number().optional(), lng: z.number().optional() }),
  loaderDeps: ({ search }) => ({ lat: search.lat, lng: search.lng }),
  loader: async ({ params, deps }) => {
    const id = params._splat ?? "";
    try { return { id, ...(await getPlaceById({ data: { id, lat: deps.lat, lng: deps.lng } })) }; }
    catch { return { id, place: null, cumpa: null }; }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.place;
    const c = loaderData?.cumpa;
    const st = c ? (c.status === "open" ? "🟢 Abierto confirmado por cumpitas" : "🔴 Cerrado según cumpitas")
      : p?.liveTurno ? "🚨 De turno hoy" : "Revisa si está abierto ahora";
    const title = p ? `${p.name} · ${st} — cumpita.` : "Local — cumpita.";
    const desc = p ? `${p.category === "farmacia" ? "Farmacia" : "Botillería"}${p.street ? ` en ${p.street}` : ""}${p.city ? `, ${p.city}` : ""}. ${st}.` : "Farmacias y botillerías abiertas en Calama y La Serena.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE}/og.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${SITE}/og.jpg` },
        ...(p ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: LocalPage,
});

function LocalPage() {
  const { place: p, cumpa } = Route.useLoaderData();
  const { favs, toggle } = useFavorites();
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [tags, setTags] = useState<Map<PlaceTagKey, number>>(new Map());
  const [status, setStatus] = useState(cumpa);
  useEffect(() => {
    if (!p) return;
    supabase.from("place_tags").select("tag,created_at").eq("place_id", p.id)
      .gte("created_at", new Date(Date.now() - TAG_TTL).toISOString()).limit(200)
      .then(({ data }) => {
        const m = new Map<PlaceTagKey, number>();
        for (const t of data ?? []) if (t.tag in PLACE_TAGS) m.set(t.tag as PlaceTagKey, (m.get(t.tag as PlaceTagKey) ?? 0) + 1);
        setTags(m);
      });
    const w = navigator.geolocation?.watchPosition((g) => setPos({ lat: g.coords.latitude, lng: g.coords.longitude }), () => {}, { enableHighAccuracy: true });
    return () => { if (w != null) navigator.geolocation.clearWatch(w); };
  }, [p?.id]);

  if (!p) return (
    <div className="mx-auto min-h-screen max-w-md bg-background p-6 text-center">
      <p className="text-lg font-bold">No encontramos este local</p>
      <p className="mt-1 text-sm text-muted-foreground">Puede que el enlace esté incompleto.</p>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">Ver locales cerca</Link>
    </div>
  );
  const official = isOfficiallyOpen(p);
  const dist = pos ? distanceM(pos, p) : null;
  const near = dist != null && dist <= 300;
  const hint = dist == null ? "Activa el GPS para reportar" : `Acércate para reportar (estás a ${dist < 1000 ? Math.round(dist) + " m" : (dist / 1000).toFixed(1) + " km"})`;
  const report = async (st: "open" | "closed") => {
    const key = `cumpita-last-${p.id}`;
    if (Date.now() - Number(localStorage.getItem(key) || 0) < 10 * 60 * 1000) { toast("Ya reportaste este local hace poco. ¡Gracias, cumpita!"); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("place_reports").insert({ place_id: p.id, status: st, user_id: u.user?.id ?? null });
    if (error) { toast.error("No se pudo enviar tu reporte."); return; }
    localStorage.setItem(key, String(Date.now())); setNow(Date.now());
    setStatus({ status: st, last: Date.now(), count: status?.status === st ? status.count + 1 : 1 });
    toast.success("¡Gracias! Tu reporte ya lo ven todos.");
  };
  const addTag = async (tag: PlaceTagKey) => {
    const key = `cumpita-tag-${p.id}-${tag}`;
    if (Date.now() - Number(localStorage.getItem(key) || 0) < 30 * 60 * 1000) { toast("Ya marcaste eso hace poco."); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("place_tags").insert({ place_id: p.id, tag, user_id: u.user?.id ?? null });
    if (error) { toast.error("No se pudo guardar."); return; }
    localStorage.setItem(key, String(Date.now()));
    setTags((m) => new Map(m).set(tag, (m.get(tag) ?? 0) + 1));
    toast.success("¡Gracias! Ya lo ven todos.");
  };
  const fav = favs.has(p.id);
  const url = typeof window !== "undefined" ? window.location.href : SITE;
  const share = `Wena, mira ${p.name}${p.street ? ` (${p.street})` : ""} en cumpita.\n${url}`;
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background px-4 pb-10 pt-5">
      <Link to="/" className="flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />Todos los locales</Link>
      <div className="mt-4 rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">{p.category === "farmacia" ? "Farmacia" : "Botillería"}</p>
            <h1 className="font-display text-2xl font-bold">{p.name}</h1>
          </div>
          <button aria-label="Favorito" onClick={() => toggle(p.id)} className={fav ? "text-star" : "text-muted-foreground"}><Star className="h-6 w-6" fill={fav ? "currentColor" : "none"} /></button>
        </div>
        {p.liveTurno && <p className="mt-2 inline-block rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">🚨 De turno hoy</p>}
        {p.street && <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.street}{p.city ? `, ${p.city}` : ""}</p>}
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{hoursLabel(p)}</p>
        <p className="mt-2 text-sm">Horario: <b>{official === null ? "sin datos" : official ? "abierto" : "cerrado"}</b></p>
        <div className={`mt-3 rounded-xl p-3 text-sm font-semibold ${status ? (status.status === "open" ? "bg-open/10 text-open" : "bg-closed/10 text-closed") : "bg-muted text-muted-foreground"}`}>
          <Users className="mr-1 inline h-4 w-4" />
          {status ? `Confirmado ${status.status === "open" ? "abierto" : "cerrado"}${now ? ` hace ${Math.max(1, Math.round((now - status.last) / 60000))} min` : ""} por ${status.count} cumpita${status.count > 1 ? "s" : ""}` : "Sin reportes en la última hora"}
        </div>
        {tags.size > 0 && <div className="mt-3 flex flex-wrap gap-1">{[...tags].map(([k, n]) => <span key={k} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{PLACE_TAGS[k]}{n > 1 ? ` ×${n}` : ""}</span>)}</div>}
        <div className="mt-4 rounded-xl border p-3">
          <p className="text-sm font-bold">¿Está abierto ahora?</p>
          {near ? (<>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => report("open")} className="flex items-center justify-center gap-1 rounded-lg bg-open py-2.5 text-sm font-bold text-primary-foreground active:scale-95"><Check className="h-4 w-4" />Abierto</button>
              <button onClick={() => report("closed")} className="flex items-center justify-center gap-1 rounded-lg bg-closed py-2.5 text-sm font-bold text-primary-foreground active:scale-95"><X className="h-4 w-4" />Cerrado</button>
            </div>
            <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto px-1">{(Object.keys(PLACE_TAGS) as PlaceTagKey[]).map((k) => <button key={k} onClick={() => addTag(k)} className="shrink-0 rounded-full border px-2 py-1 text-xs text-muted-foreground active:scale-95">{PLACE_TAGS[k]}</button>)}</div>
          </>) : <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground"><Navigation className="h-4 w-4" />Voy en camino</a>
          <a target="_blank" rel="noreferrer" href={`https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`} className="flex items-center justify-center rounded-lg bg-secondary py-2.5 text-sm font-semibold text-primary">Waze</a>
          {p.phone && <a href={`tel:${p.phone}`} className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2.5 text-sm font-semibold"><Phone className="h-4 w-4" />Llamar</a>}
          <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(share)}`} className="flex items-center justify-center gap-1.5 rounded-lg bg-open/15 py-2.5 text-sm font-semibold text-open"><Share2 className="h-4 w-4" />WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
