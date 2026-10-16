import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, Navigation, Phone, Share2, Star, Users } from "lucide-react";
import { getPlaceById } from "@/lib/places.functions";
import { hoursLabel, isOfficiallyOpen } from "@/lib/places";
import { useFavorites } from "@/lib/favorites";

const SITE = "https://cumpita.lovable.app";

export const Route = createFileRoute("/local/$")({
  validateSearch: z.object({ lat: z.number().optional(), lng: z.number().optional() }),
  loaderDeps: ({ search }) => ({ lat: search.lat, lng: search.lng }),
  loader: async ({ params, deps }) => {
    const id = params._splat ?? "";
    if (deps.lat == null || deps.lng == null) return { id, place: null, cumpa: null };
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

  if (!p) return (
    <div className="mx-auto min-h-screen max-w-md bg-background p-6 text-center">
      <p className="text-lg font-bold">No encontramos este local</p>
      <p className="mt-1 text-sm text-muted-foreground">Puede que el enlace esté incompleto.</p>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">Ver locales cerca</Link>
    </div>
  );
  const official = isOfficiallyOpen(p);
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
        <div className={`mt-3 rounded-xl p-3 text-sm font-semibold ${cumpa ? (cumpa.status === "open" ? "bg-open/10 text-open" : "bg-closed/10 text-closed") : "bg-muted text-muted-foreground"}`}>
          <Users className="mr-1 inline h-4 w-4" />
          {cumpa ? `Confirmado ${cumpa.status === "open" ? "abierto" : "cerrado"}${now ? ` hace ${Math.max(1, Math.round((now - cumpa.last) / 60000))} min` : ""} por ${cumpa.count} cumpita${cumpa.count > 1 ? "s" : ""}` : "Sin reportes en la última hora"}
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
