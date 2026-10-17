import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Clock, Navigation, Phone, Loader2, Pill, Wine, Check, X, Users, LocateFixed, Bell, BellRing, Trophy, WifiOff, Share2, Moon, LogIn, LogOut } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNearbyPlaces } from "@/lib/places.functions";
import { ZONES, distanceM, isOfficiallyOpen, hoursLabel, cumpitaStatus, REPORT_TTL_MS, is24h, isServicentro, norm, type Report, type Category, type Place } from "@/lib/places";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { isTurno, calamaTurnoHoy } from "@/lib/turnos";
import { Siren, Sparkles, ShieldCheck, Scale, PencilLine } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { aiSearch } from "@/lib/ai-search.functions";
import { startEnRoute, stopEnRoute, notifyClosed, subscribeTurnos, unsubscribeTurnos } from "@/lib/push.functions";
import { enablePush, savedPushToken, pushMessage } from "@/lib/push-client";
import { ProposeHours } from "@/components/ProposeHours";
import { SuggestPlace } from "@/components/SuggestPlace";
import { InstallBanner } from "@/components/InstallBanner";
import { Onboarding, ONBOARD_KEY } from "@/components/Onboarding";
import owl from "@/assets/cumpita-owl.png";
import { useFavorites } from "@/lib/favorites";
import { Star } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { List, Map as MapIcon, SlidersHorizontal, Sun, ChevronDown, MoreHorizontal, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLACE_TAGS } from "@/lib/tags";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cumpita — Farmacias y botillerías cerca de ti" },
      { name: "description", content: "Encuentra la farmacia o botillería más cercana y revisa si está abierta según los cumpitas." },
      { property: "og:title", content: "cumpita. · ¿Qué está abierto ahora?" },
      { property: "og:description", content: "Farmacias de turno 24H y botillerías confirmadas en Calama y La Serena." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cumpita.lovable.app/" },
      { property: "og:image", content: "https://cumpita.lovable.app/og.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "cumpita. · ¿Qué está abierto ahora?" },
      { name: "twitter:description", content: "Farmacias de turno 24H y botillerías confirmadas en Calama y La Serena." },
      { name: "twitter:image", content: "https://cumpita.lovable.app/og.jpg" },
    ],
  }),
  component: Index,
});

type Filter = "all" | "open" | "confirmed" | "turno" | "night" | "fav";
const TAGS = PLACE_TAGS;
type TagKey = keyof typeof TAGS;
type TagRow = { place_id: string; tag: string; created_at: string };
const TAG_TTL_MS = 3 * 60 * 60 * 1000;
type Alert = { id: string; place_name: string; status: string; created_at: string; read_at: string | null };
type TopCumpita = { nickname: string | null; points: number; reports_count: number; is_me: boolean | null };
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
const ago = (ms: number) => { const m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.round(m / 60)} h`; };
const REPORT_RADIUS_M = 300;
const WALK_RADIUS_M = 800;
const CACHE_KEY = "cumpita-places-cache";

const badgeFor = (points: number) =>
  points >= 50 ? "🏆 Cumpita de Oro" : points >= 20 ? "🥈 Cumpita Confiable" : points >= 5 ? "🥉 Cumpita Activo" : "🌱 Cumpita Novato";

function Index() {
  const [loc, setLoc] = useState<{ name: string; lat: number; lng: number }>(ZONES[0]!);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const { favs, toggle: toggleFav } = useFavorites();
  const [cat, setCat] = useState<Category | "any">("any");
  const [reports, setReports] = useState<Report[]>([]);
  const [now, setNow] = useState(Date.now());
  const [zoneOpen, setZoneOpen] = useState(false);
  const [gpsOn, setGpsOn] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [top, setTop] = useState<TopCumpita[]>([]);
  const [offline, setOffline] = useState(false);
  const [cached, setCached] = useState<Place[] | null>(null);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [nick, setNick] = useState("");
  const [editNick, setEditNick] = useState(false);
  const [view, setView] = useState<"feed" | "map" | "rank">("feed");
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [guestNick, setGuestNick] = useState("Cumpita");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [more, setMore] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean | null>(null);
  const [onboard, setOnboard] = useState(false);
  useEffect(() => { setGuestNick(localStorage.getItem("cumpita-nick") || "Cumpita"); }, [onboard]);
  useEffect(() => { if (!localStorage.getItem(ONBOARD_KEY)) setOnboard(true); }, []);
  useEffect(() => {
    const saved = localStorage.getItem("cumpita-theme");
    const h = new Date().getHours();
    setDark(saved ? saved === "dark" : h >= 20 || h < 7 || window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => { if (dark !== null) document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const toggleDark = () => setDark((d) => { const n = !d; localStorage.setItem("cumpita-theme", n ? "dark" : "light"); navigator.vibrate?.(10); return n; });
  const [mode, setMode] = useState<"walk" | "car">("car");
  const [tagFilter, setTagFilter] = useState<Set<TagKey>>(new Set());
  const [enRoute, setEnRoute] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNow, setHiddenNow] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);
  const arrived = useRef<Set<string>>(new Set());
  const startRoute = useServerFn(startEnRoute);
  const stopRoute = useServerFn(stopEnRoute);
  const sendClosed = useServerFn(notifyClosed);
  const enRouteRef = useRef(enRoute); enRouteRef.current = enRoute;

  // Micro-reportes (pago, reja, fila) en vivo
  useEffect(() => {
    supabase.from("place_tags").select("place_id,tag,created_at")
      .gte("created_at", new Date(Date.now() - TAG_TTL_MS).toISOString()).limit(2000)
      .then(({ data }) => { if (data) setTags(data); });
    const ch = supabase.channel("place_tags")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "place_tags" },
        (payload) => setTags((prev) => [...prev, payload.new as TagRow]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);


  // Sesión + suscripciones + alertas + ranking
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.rpc("get_leaderboard")
      .then(({ data }) => { if (data) setTop(data as TopCumpita[]); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setSubs(new Set()); setAlerts([]); return; }
    supabase.from("place_subscriptions").select("place_id").eq("user_id", user.id)
      .then(({ data }) => { if (data) setSubs(new Set(data.map((r) => r.place_id))); });
    supabase.from("place_alerts").select("id,place_name,status,created_at,read_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setAlerts(data as Alert[]); });
  }, [user]);

  // Reportes en vivo + alertas de apertura para locales suscritos
  useEffect(() => {
    const toReport = (r: { place_id: string; status: string; created_at: string }): Report =>
      ({ placeId: r.place_id, status: r.status as Report["status"], ts: new Date(r.created_at).getTime() });
    supabase.from("place_reports").select("place_id,status,created_at")
      .gte("created_at", new Date(Date.now() - REPORT_TTL_MS).toISOString()).limit(1000)
      .then(({ data }) => { if (data) setReports(data.map(toReport)); });
    const channel = supabase.channel("place_reports")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "place_reports" },
        (payload) => {
          const r = payload.new as { place_id: string; status: string; created_at: string };
          setReports((prev) => [...prev, toReport(r)]);
          if (r.status === "closed" && enRouteRef.current === r.place_id) {
            const name = listRef.current.find((p) => p.id === r.place_id)?.name ?? "El local";
            navigator.vibrate?.([300, 150, 300]);
            toast.error(`¡Ojo! Acaban de reportar que ${name} cerró mientras ibas en camino.`, { duration: 15000 });
            setEnRoute(null);
          }
          if (r.status === "open" && user && subsRef.current.has(r.place_id)) {
            const name = listRef.current.find((p) => p.id === r.place_id)?.name ?? "Un local";
            toast.success(`🔔 ${name} acaba de ser reportado abierto`);
            void supabase.from("place_alerts").insert({ user_id: user.id, place_id: r.place_id, place_name: name, status: "open" })
              .then(() => supabase.from("place_alerts").select("id,place_name,status,created_at,read_at")
                .eq("user_id", user.id).order("created_at", { ascending: false }).limit(30)
                .then(({ data }) => { if (data) setAlerts(data as Alert[]); }));
          }
        })
      .subscribe();
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => { clearInterval(t); supabase.removeChannel(channel); };
  }, [user]);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const me = { lat: p.coords.latitude, lng: p.coords.longitude };
        setLoc({ name: "Tu ubicación", ...me }); setUserPos(me); setLocating(false); setGpsOn(true);
      },
      () => setLocating(false), { timeout: 8000 });
  };

  const awardPoint = async (u: User) => {
    const { data } = await supabase.from("cumpita_points").select("id").eq("user_id", u.id).maybeSingle();
    if (!data) await supabase.from("cumpita_points").insert({ user_id: u.id, nickname: localStorage.getItem("cumpita-nick") || u.email?.split("@")[0]?.slice(0, 20) || "Cumpita" });
    await supabase.rpc("award_point");
    const { data: t } = await supabase.rpc("get_leaderboard");
    if (t) setTop(t as TopCumpita[]);
  };

  const report = async (placeId: string, status: "open" | "closed") => {
    const key = `cumpita-last-${placeId}`;
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < 10 * 60 * 1000) { toast("Ya reportaste este local hace poco. ¡Gracias, cumpita!"); return; }
    const { error } = await supabase.from("place_reports").insert({ place_id: placeId, status, user_id: user?.id ?? null });
    if (error) { toast.error("No se pudo enviar tu reporte. Intenta de nuevo."); return; }
    localStorage.setItem(key, String(Date.now()));
    setNow(Date.now());
    if (user) void awardPoint(user);
    navigator.vibrate?.([20, 50, 20]); toast.success(user ? "¡Te las mandaste! 🏅 +1 punto. Le ahorraste el pique en vano a otro cumpita." : "¡Te las mandaste! 🦉 Le ahorraste el pique en vano a otro cumpita.");
    if (status === "closed") void sendClosed({ data: { placeId, senderToken: savedPushToken() ?? undefined } }).catch(() => {});
  };

  const cancelRoute = () => {
    setEnRoute(null);
    const t = savedPushToken(), sc = localStorage.getItem("cumpita-route-secret"); if (t && sc) void stopRoute({ data: { token: t, secret: sc } }).catch(() => {});
  };

  const goTo = (placeId: string, placeName: string) => {
    setEnRoute(placeId);
    if (!gpsOn) locate();
    toast(`Vas en camino a ${placeName}. Te avisamos si alguien reporta que cerró.`);
    void enablePush().then(async (r) => {
      if (r.status === "registered") {
        const res = await startRoute({ data: { token: r.token, placeId, placeName, secret: localStorage.getItem("cumpita-route-secret") ?? undefined } });
        if (res.secret) localStorage.setItem("cumpita-route-secret", res.secret);
      }
      else toast(pushMessage[r.status]);
    }).catch(() => {});
  };

  const subTurnos = useServerFn(subscribeTurnos), unsubTurnos = useServerFn(unsubscribeTurnos);
  const [turnoSub, setTurnoSub] = useState<string | null>(null);
  useEffect(() => { setTurnoSub(localStorage.getItem("cumpita-turno-city")); }, []);
  const citySlug = () => {
    const z = [...ZONES].sort((a, b) => distanceM(a, loc) - distanceM(b, loc))[0]!;
    return z.city === "Calama" ? "calama" : z.city === "Coquimbo" ? "coquimbo" : "la-serena";
  };
  const toggleTurnoSub = async () => {
    const t = savedPushToken(), sc = localStorage.getItem("cumpita-turno-secret");
    if (turnoSub) {
      if (t && sc) await unsubTurnos({ data: { token: t, secret: sc } }).catch(() => {});
      localStorage.removeItem("cumpita-turno-city"); setTurnoSub(null); toast("Listo, ya no te avisaremos los turnos."); return;
    }
    const r = await enablePush().catch(() => null);
    if (!r) return;
    if (r.status !== "registered") { toast(pushMessage[r.status]); return; }
    const city = citySlug() as "calama" | "la-serena" | "coquimbo";
    const res = await subTurnos({ data: { token: r.token, city, secret: sc ?? undefined } }).catch(() => null);
    if (!res?.secret) { toast.error("No pudimos activar el aviso. Intenta de nuevo."); return; }
    localStorage.setItem("cumpita-turno-secret", res.secret); localStorage.setItem("cumpita-turno-city", city); setTurnoSub(city);
    toast.success("Cada día a las 20:00 te avisamos qué farmacias están de turno. 💊");
  };

  const toggleSub = async (placeId: string, placeName: string) => {
    if (!user) {
      toast("Para recibir avisos necesitas una cuenta.", { action: { label: "Entrar", onClick: () => { void signIn(); } } });
      return;
    }
    if (subs.has(placeId)) {
      const { error } = await supabase.from("place_subscriptions").delete().eq("user_id", user.id).eq("place_id", placeId);
      if (!error) { setSubs((s) => { const n = new Set(s); n.delete(placeId); return n; }); toast(`Ya no te avisaremos de ${placeName}.`); }
    } else {
      const { error } = await supabase.from("place_subscriptions").insert({ user_id: user.id, place_id: placeId });
      if (!error) { setSubs((s) => new Set(s).add(placeId)); toast.success(`Te avisaremos cuando reporten ${placeName} abierto.`); }
    }
  };

  const signIn = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r && "error" in r && r.error) toast.error("No pudimos iniciar sesión con Google.");
  };

  const saveNick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const n = nick.trim().slice(0, 20);
    if (n.length < 2) { toast.error("El apodo debe tener al menos 2 letras."); return; }
    const { data: ex } = await supabase.from("cumpita_points").select("id").eq("user_id", user.id).maybeSingle();
    const { error } = ex
      ? await supabase.from("cumpita_points").update({ nickname: n }).eq("user_id", user.id)
      : await supabase.from("cumpita_points").insert({ user_id: user.id, nickname: n });
    if (error) { toast.error("No se pudo guardar tu apodo."); return; }
    setEditNick(false); toast.success(`Listo, ahora eres ${n}.`);
    const { data: t } = await supabase.rpc("get_leaderboard");
    if (t) setTop(t as TopCumpita[]);
  };

  const addTag = async (placeId: string, tag: TagKey) => {
    const key = `cumpita-tag-${placeId}-${tag}`;
    if (Date.now() - Number(localStorage.getItem(key) || 0) < 30 * 60 * 1000) { toast("Ya marcaste eso hace poco."); return; }
    const { error } = await supabase.from("place_tags").insert({ place_id: placeId, tag, user_id: user?.id ?? null });
    if (error) { toast.error("No se pudo guardar."); return; }
    localStorage.setItem(key, String(Date.now()));
    toast.success("¡Gracias! Ya lo ven todos.");
  };

  const tagsFor = (placeId: string): [TagKey, number][] => {
    const m = new Map<TagKey, number>();
    for (const t of tags) if (t.place_id === placeId && now - new Date(t.created_at).getTime() < TAG_TTL_MS && t.tag in TAGS) m.set(t.tag as TagKey, (m.get(t.tag as TagKey) ?? 0) + 1);
    return [...m.entries()];
  };

  const shareText = (p: { id: string; name: string; street?: string | null; lat: number; lng: number; category: string; cumpa: ReturnType<typeof cumpitaStatus>; turno: boolean }) => {
    const where = p.street ? ` (${p.street})` : "";
    const tg = tagsFor(p.id).map(([k]) => TAGS[k]).join(" · ");
    const link = `${typeof window !== "undefined" ? window.location.origin : "https://cumpita.lovable.app"}/local/${p.id}`;
    let head: string;
    if (p.cumpa?.status === "open") head = `Cabros, ${p.name}${where} está ABIERTO 🟢 (confirmado hace ${ago(now - p.cumpa.last)} por ${p.cumpa.count} cumpita${p.cumpa.count > 1 ? "s" : ""})`;
    else if (p.cumpa?.status === "closed") head = `Ojo: ${p.name}${where} está CERRADO 🔴 por si iban a ir (confirmado hace ${ago(now - p.cumpa.last)})`;
    else if (p.turno) head = `Ojo cumpitas: ${p.name}${where} está de TURNO hoy 💊`;
    else head = `${p.name}${where} queda cerca, ¿alguien sabe si está abierto?`;
    return `${head}${tg ? `\n${tg}` : ""}\n👉 Revisa en vivo: ${link}\n🚗 Waze: https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
  };

  const hidePlace = async (id: string, name: string) => {
    if (!user || !confirm(`¿Dar de baja "${name}"? Dejará de aparecer para todos.`)) return;
    const { error } = await supabase.from("hidden_places").insert({ place_id: id, place_name: name, hidden_by: user.id });
    if (error) { toast.error("No se pudo dar de baja."); return; }
    setHiddenNow((s) => new Set(s).add(id)); setMore(null);
    toast.success("Local dado de baja. Puedes reactivarlo en /revision.");
  };

  const openBell = async () => {
    setBellOpen((v) => !v);
    if (!bellOpen && user && alerts.some((a) => !a.read_at)) {
      await supabase.from("place_alerts").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
      setAlerts((prev) => prev.map((a) => ({ ...a, read_at: a.read_at ?? new Date().toISOString() })));
    }
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

  // Caché offline: guarda la última lista cargada y la usa si no hay conexión
  useEffect(() => {
    if (data?.places?.length) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ loc, places: data.places, ts: Date.now() })); } catch { /* sin espacio */ }
      setOffline(false);
    }
  }, [data]);
  useEffect(() => {
    if (!isError) return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) { const c = JSON.parse(raw) as { places: Place[] }; setCached(c.places); setOffline(true); }
    } catch { /* caché inválido */ }
  }, [isError]);

  const places = data?.places ?? cached ?? [];
  const live = data?.live ?? false;
  const liveList = places.filter((p) => p.liveTurno);

  const pulse = useMemo(() => {
    const byId = new Map(places.map((p) => [p.id, p.name]));
    return [...reports].filter((r) => byId.has(r.placeId)).sort((a, b) => b.ts - a.ts).slice(0, 3)
      .map((r) => ({ ...r, name: byId.get(r.placeId)! }));
  }, [places, reports]);

  const list = useMemo(() => places.filter((p) => !hiddenNow.has(p.id)).map((p) => {
    const pos = { lat: p.lat, lng: p.lng };
    const cumpa = cumpitaStatus(reports, p.id, now);
    const official = isOfficiallyOpen(p, new Date(now));
    const turno = live ? !!p.liveTurno : isTurno(p, new Date(now));
    return { ...p, dist: distanceM(loc, pos), pos, cumpa, official, turno, effectiveOpen: cumpa ? cumpa.status === "open" : official === true };
  }).filter((p) => (cat === "any" || p.category === cat)
    && (mode === "car" || p.dist <= WALK_RADIUS_M)
    && [...tagFilter].every((k) => tagsFor(p.id).some(([t]) => t === k))
    && (filter !== "open" || p.effectiveOpen) && (filter !== "confirmed" || p.cumpa) && (filter !== "turno" || p.turno) && (filter !== "fav" || favs.has(p.id))
    && (filter !== "night" || (p.category === "farmacia" ? p.turno || (p.liveTurno?.from === "00:00" && p.liveTurno?.to === "23:59") : p.cumpa ? p.cumpa.status === "open" : is24h(p))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    .sort((a, b) => a.dist - b.dist).slice(0, 40), [places, live, loc, reports, now, filter, cat, mode, tagFilter, tags, favs]);
  const enRouteName = enRoute ? places.find((p) => p.id === enRoute)?.name ?? null : null;
  const reasons = new Map(ai?.results.map((r) => [r.id, r.reason]) ?? []);
  const needle = searchOpen ? norm(q.trim()) : "";
  const shown = ai ? ai.results.map((r) => list.find((p) => p.id === r.id)).filter((p): p is (typeof list)[number] => !!p)
    : needle ? list.filter((p) => norm(`${p.name} ${p.street ?? ""} ${p.city ?? ""} ${CATEGORIES[p.category].label}`).includes(needle)) : list;
  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2 || aiBusy) return;
    setAiBusy(true);
    try {
      const res = await runAi({ data: { query: q.trim(), candidates: list.map((p) => ({ id: p.id, name: p.name, category: p.category, dist: p.dist, street: p.street, hours: hoursLabel(p), open: p.cumpa ? p.cumpa.status === "open" : p.official, turno: p.turno })) } });
      if (!res.ok) toast.error(res.error); else setAi({ results: res.results, summary: res.summary });
    } catch { toast.error("No pudimos completar la búsqueda."); } finally { setAiBusy(false); }
  };
  // Detección por permanencia: 5+ min a menos de 40 m de un local con estado desconocido = abierto.
  const listRef = useRef(list); listRef.current = list;
  const subsRef = useRef(subs); subsRef.current = subs;
  const dwell = useRef<{ id: string; since: number; done: boolean } | null>(null);
  useEffect(() => {
    if (!gpsOn || !navigator.geolocation) return;
    const w = navigator.geolocation.watchPosition((pos) => {
      if (pos.coords.accuracy > 60) return;
      const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(me);
      const near = listRef.current.map((p) => ({ p, d: distanceM(me, p) })).filter((x) => x.d < 40).sort((a, b) => a.d - b.d)[0]?.p;
      // Aviso de llegada: pregunta una vez por local si sigue abierto
      if (near && !arrived.current.has(near.id)) {
        arrived.current.add(near.id);
        const recent = Date.now() - Number(localStorage.getItem(`cumpita-last-${near.id}`) || 0) < 10 * 60 * 1000;
        if (enRouteRef.current === near.id) { setEnRoute(null); const t = savedPushToken(), sc = localStorage.getItem("cumpita-route-secret"); if (t && sc) void stopRoute({ data: { token: t, secret: sc } }); }
        if (!recent) {
          navigator.vibrate?.(200);
          toast(`📍 Llegaste a ${near.name}. ¿Sigue abierto?`, { duration: 20000,
            action: { label: "Sí, abierto", onClick: () => { void report(near.id, "open"); } },
            cancel: { label: "Cerró", onClick: () => { void report(near.id, "closed"); } } });
        }
      }
      if (!near || near.cumpa || near.official !== null) { dwell.current = null; return; }
      if (dwell.current?.id !== near.id) { dwell.current = { id: near.id, since: Date.now(), done: false }; return; }
      if (!dwell.current.done && Date.now() - dwell.current.since >= 5 * 60 * 1000) {
        dwell.current.done = true;
        const key = `cumpita-last-${near.id}`;
        if (Date.now() - Number(localStorage.getItem(key) || 0) < 10 * 60 * 1000) return;
        supabase.from("place_reports").insert({ place_id: near.id, status: "open", user_id: user?.id ?? null }).then(({ error }) => {
          if (error) return;
          localStorage.setItem(key, String(Date.now())); setNow(Date.now());
          if (user) void awardPoint(user);
          toast.success(`Llevas 5 min en ${near.name}: lo marcamos como abierto. ¡Gracias, cumpita!`, { action: { label: "Está cerrado", onClick: () => { localStorage.removeItem(key); report(near.id, "closed"); } } });
        });
      }
    }, () => {}, { enableHighAccuracy: true, maximumAge: 30000 });
    return () => navigator.geolocation.clearWatch(w);
  }, [gpsOn, user]);
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
  const cityName = loc.lat > -25 ? "Calama" : "La Serena";
  const unread = alerts.filter((a) => !a.read_at).length;
  const myPoints = user ? top.find((t) => t.is_me) : null;

  // Anti-trolling: solo se puede reportar estando a menos de 300 m del local (con GPS activo)
  const canReport = (p: (typeof list)[number]) => userPos != null && distanceM(userPos, p) <= REPORT_RADIUS_M;
  const reportHint = (p: (typeof list)[number]) =>
    !userPos ? "Activa el GPS para reportar" : `Acércate al local para reportar (estás a ${fmtDist(distanceM(userPos, p))})`;

  const chip = (active: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <Toaster position="top-center" />
      {onboard && <Onboarding onDone={({ zone, gps }) => { setOnboard(false); if (gps) locate(); else setLoc(zone ?? ZONES[0]!); }} />}
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold"><img src={owl} alt="" width={32} height={32} className="h-8 w-8" />cumpita<span className="text-primary">.</span></h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={openBell} aria-label="Avisos" title="Avisos" className="relative">
              {unread > 0 ? <BellRing className="text-primary" /> : <Bell />}
              {unread > 0 && <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setAccountOpen(true)} aria-label="Mi cumpita" title="Mi cumpita"><Settings2 /></Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setZoneOpen(true)} className="mt-1 h-7 max-w-full justify-start px-0 text-muted-foreground" aria-label="Cambiar ubicación">
          {gpsOn ? <LocateFixed className="text-open" /> : <MapPin />}<span className="truncate">{loc.name}</span><ChevronDown />
        </Button>
      </header>
      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto pb-8">
          <SheetTitle>Mi cumpita</SheetTitle>
          <SheetDescription>{myPoints?.nickname || guestNick}</SheetDescription>
          <div className="mt-5 space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={toggleDark}>{dark ? <Sun /> : <Moon />}{dark ? "Usar tema claro" : "Usar tema oscuro"}</Button>
            <Button variant={turnoSub ? "secondary" : "outline"} className="w-full justify-start" onClick={() => void toggleTurnoSub()}>{turnoSub ? <BellRing /> : <Bell />}{turnoSub ? "Aviso diario de turnos activo (20:00)" : "Avisarme el turno de farmacias cada día"}</Button>
            {user ? <Button variant="ghost" className="w-full justify-start" onClick={() => { void supabase.auth.signOut(); setAccountOpen(false); }}><LogOut />Cerrar sesión</Button>
              : <Button variant="outline" className="w-full justify-start" onClick={signIn}><LogIn />Vincular con Google</Button>}
            {isAdmin && <Button variant="outline" className="w-full justify-start" asChild><Link to="/revision"><ShieldCheck />Revisión de locales</Link></Button>}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={zoneOpen} onOpenChange={setZoneOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto pb-8">
          <SheetTitle>Tu ubicación</SheetTitle>
          <SheetDescription>{loc.name}</SheetDescription>
          <Button variant="outline" className="mt-4 w-full" disabled={locating} onClick={() => { locate(); setZoneOpen(false); }}><LocateFixed />{gpsOn ? "Actualizar mi ubicación" : "Usar mi ubicación"}</Button>
          {["Calama", "La Serena", "Coquimbo"].map((c) => <section key={c} className="mt-5"><h3 className="mb-2 font-semibold">{c}</h3><div className="flex flex-wrap gap-2">
            {ZONES.filter((z) => z.city === c).map((z) => <Button key={z.name} variant={loc.name === z.name ? "default" : "secondary"} size="sm" onClick={() => { setLoc(z); setZoneOpen(false); }}>{z.name.split(" · ")[1]}</Button>)}
          </div></section>)}
        </SheetContent>
      </Sheet>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto pb-8">
          <SheetTitle>Filtrar locales</SheetTitle>
          <SheetDescription className="sr-only">Estado, distancia y servicios</SheetDescription>
          <h3 className="mb-2 mt-5 text-sm font-semibold">Estado</h3>
          <div className="flex flex-wrap gap-2">{([["all", "Todos"], ["open", "Abiertas ahora"], ["confirmed", "Confirmadas"], ["turno", "De turno"], ["night", "Modo madrugada"]] as const).map(([k, label]) => <Button key={k} size="sm" variant={filter === k ? "default" : "secondary"} onClick={() => setFilter(k)}>{label}</Button>)}</div>
          <h3 className="mb-2 mt-5 text-sm font-semibold">Distancia</h3>
          <div className="flex gap-2"><Button variant={mode === "walk" ? "default" : "secondary"} onClick={() => setMode("walk")}>A pie (&lt;800 m)</Button><Button variant={mode === "car" ? "default" : "secondary"} onClick={() => setMode("car")}>En auto</Button></div>
          <h3 className="mb-2 mt-5 text-sm font-semibold">Lo que necesitas</h3>
          <div className="flex flex-wrap gap-2">{(["card_ok", "cash_only", "reja", "sin_fila", "hielo", "cigarros", "promo", "cartulinas", "fotocopias", "pan", "carbon"] as TagKey[]).map((k) => <Button key={k} size="sm" variant={tagFilter.has(k) ? "default" : "secondary"} onClick={() => setTagFilter((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })}>{TAGS[k]}</Button>)}</div>
          <div className="mt-6 flex gap-2"><Button variant="ghost" onClick={() => { setFilter("all"); setTagFilter(new Set()); setMode("car"); }}>Limpiar</Button><Button className="flex-1" onClick={() => setFiltersOpen(false)}>Ver locales</Button></div>
        </SheetContent>
      </Sheet>
      <div className="px-4 pt-3">
        {bellOpen && <section className="mb-3 border-b pb-3 text-sm" aria-label="Tus avisos"><p className="font-semibold">Tus avisos</p>{!user && <Button variant="link" size="sm" onClick={signIn}>Vincular con Google para recibir avisos</Button>}{user && alerts.length === 0 && <p className="mt-1 text-xs text-muted-foreground">Sin avisos todavía.</p>}{alerts.slice(0, 10).map((a) => <p key={a.id} className="mt-1.5 text-xs">{a.place_name}: {a.status === "open" ? "abierto" : "cerrado"} hace {ago(now - new Date(a.created_at).getTime())}</p>)}</section>}
        {view !== "rank" && <>
          <div className="flex items-center gap-1">
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">{([["any", "Todo"], ...CATEGORY_KEYS.map((k) => [k, `${CATEGORIES[k].emoji} ${CATEGORIES[k].short}`])] as [typeof cat, string][]).map(([k, label]) => <Button key={k} variant={cat === k ? "secondary" : "ghost"} size="sm" className="shrink-0 px-2.5" onClick={() => setCat(k)}>{label}</Button>)}</div>
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Buscar locales" aria-expanded={searchOpen} title="Buscar locales"><Search /></Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setFiltersOpen(true)} aria-label="Filtrar locales" title="Filtrar locales"><SlidersHorizontal />{(filter !== "all" || tagFilter.size > 0 || mode === "walk") && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}</Button>
          </div>
          {filter !== "all" && filter !== "fav" && <Button variant="ghost" size="sm" className="mt-2 h-7 text-primary" onClick={() => setFilter("all")}>{filter === "open" ? "Abiertas ahora" : filter === "turno" ? "De turno" : filter === "confirmed" ? "Confirmadas" : "Modo madrugada"}<X /></Button>}
          {searchOpen && <form onSubmit={askAi} className="mt-3 flex gap-2"><input autoFocus aria-label="Buscar locales por nombre o calle" value={q} onChange={(e) => { setQ(e.target.value); if (ai) setAi(null); }} maxLength={300} placeholder="Nombre o calle… (Enter: pregúntale a la IA)" className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /><Button type="submit" size="icon" disabled={aiBusy || isLoading} aria-label="Buscar">{aiBusy ? <Loader2 className="animate-spin" /> : <Search />}</Button></form>}
        </>}
        {enRouteName && <p className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><span className="truncate">En camino a {enRouteName}</span><Button variant="ghost" size="sm" onClick={cancelRoute}>Cancelar</Button></p>}
      </div>
      <InstallBanner />

      <main className="space-y-3 px-4 pt-2">
        {offline && <p className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-xs font-semibold text-muted-foreground"><WifiOff className="h-4 w-4" />Sin conexión: mostrando los últimos datos que cargamos.</p>}
        {view === "feed" && pulse.length > 0 && (
          <section aria-label="Pulso cumpita" className="rounded-2xl border bg-card px-3 py-2 text-xs">
            <p className="mb-1 flex items-center gap-1.5 font-bold uppercase tracking-wide text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-open" />Pulso cumpita</p>
            {pulse.map((r, i) => (
              <p key={i} className="truncate">Hace {ago(now - r.ts)} un cumpita confirmó <b className={r.status === "open" ? "text-open" : "text-closed"}>{r.status === "open" ? "abierto" : "cerrado"}</b> en {r.name}</p>
            ))}
          </section>)}
        {(cat === "any" || cat === "farmacia") && live && liveList.map((t) => (
          <a key={t.id} target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lng}`} className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
            <Siren className="h-6 w-6 shrink-0" />
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide opacity-90">De turno hoy en {cityName} · {t.liveTurno!.from === "00:00" && t.liveTurno!.to === "23:59" ? "24 horas" : `${t.liveTurno!.from}–${t.liveTurno!.to}`}</p>
              <p className="truncate font-display text-lg font-bold">{t.name} · {t.street}</p></div>
          </a>))}
        {(cat === "any" || cat === "farmacia") && !live && !isLoading && loc.lat > -25 && (() => { const t = calamaTurnoHoy(new Date(now)); return (
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
        {isLoading && [0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-4" aria-hidden>
            <div className="flex gap-3"><div className="shimmer h-11 w-11 rounded-xl" /><div className="flex-1 space-y-2"><div className="shimmer h-4 w-2/3 rounded" /><div className="shimmer h-3 w-1/3 rounded" /><div className="shimmer h-3 w-1/2 rounded" /></div></div>
            <div className="shimmer mt-3 h-16 rounded-xl" />
          </div>))}
        {isError && !offline && <div className="py-16 text-center text-muted-foreground"><p>No pudimos cargar los locales.</p><button onClick={() => refetch()} className="mt-3 font-semibold text-primary">Reintentar</button></div>}
        {!isLoading && !isError && !ai && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nada por aquí con esos filtros.</p>}
        {view === "map" && !isLoading && (<div className="animate-fade-up">
          <ClientOnly fallback={<div className="h-[65vh] rounded-2xl bg-muted" />}>
            <Suspense fallback={<div className="flex h-[65vh] items-center justify-center rounded-2xl bg-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
              <MapView places={shown} origin={userPos ?? loc} />
            </Suspense>
          </ClientOnly></div>
        )}
        {view === "feed" && !isLoading && shown.map((p, i) => (
          <article key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }} className={`animate-fade-up rounded-2xl border border-l-4 bg-card p-4 shadow-sm ${p.turno ? "border-l-closed" : p.cumpa ? (p.cumpa.status === "open" ? "border-l-open" : "border-l-closed opacity-80") : p.official ? "border-l-open/50" : "border-l-border"}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.category === "farmacia" ? "bg-pharmacy/15 text-pharmacy" : p.category === "botilleria" ? "bg-liquor/15 text-liquor" : "bg-primary/15 text-primary"}`}>
                {p.category === "farmacia" ? <Pill className="h-5 w-5" /> : p.category === "botilleria" ? <Wine className="h-5 w-5" /> : <span className="text-xl" aria-hidden>{CATEGORIES[p.category].emoji}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="flex min-w-0 items-center gap-1 font-display text-lg font-bold"><Link to="/local/$" params={{ _splat: p.id }} search={{ lat: loc.lat, lng: loc.lng }} className="truncate">{p.name}</Link><button aria-label={favs.has(p.id) ? "Quitar de favoritos" : "Guardar en favoritos"} onClick={() => toggleFav(p.id)} className={`shrink-0 ${favs.has(p.id) ? "text-star" : "text-muted-foreground"}`}><Star className="h-4 w-4" fill={favs.has(p.id) ? "currentColor" : "none"} /></button></h2>
                  <span className="shrink-0 font-display text-lg font-extrabold text-primary">{fmtDist(p.dist)}</span>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{CATEGORIES[p.category].label}{i === 0 && !ai && " · la más cerca"}</p>
                {reasons.get(p.id) && <p className="mt-1 flex items-start gap-1 text-xs text-primary"><Sparkles className="mt-0.5 h-3 w-3 shrink-0" />{reasons.get(p.id)}</p>}
                {p.turno && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-closed px-2 py-0.5 text-xs font-bold text-closed-foreground"><Siren className="h-3 w-3" />De turno hoy</span>}
                {(is24h(p) || isServicentro(p)) && <span className="ml-1 mt-1 inline-flex items-center gap-1 rounded-full bg-open/15 px-2 py-0.5 text-xs font-bold text-open">{isServicentro(p) ? "⛽ Servicentro" : "🌙"}{is24h(p) ? " · 24H" : ""}</span>}
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
              <button onClick={() => toggleSub(p.id, p.name)} className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${subs.has(p.id) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {subs.has(p.id) ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}{subs.has(p.id) ? "Avisándote" : "Avisarme"}
              </button>
              <a href={p.osmUrl} target="_blank" rel="noreferrer" className="ml-auto text-muted-foreground underline">{p.source === "google" ? "Google" : p.source === "minsal" ? "MINSAL" : p.source === "community" ? "Cumpitas" : "Fuente"}</a>
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
              {canReport(p) ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={() => report(p.id, "open")} className="flex items-center justify-center gap-1 rounded-lg bg-open py-2.5 text-sm font-bold text-open-foreground active:scale-95"><Check className="h-4 w-4" />Está abierto</button>
                  <button onClick={() => report(p.id, "closed")} className="flex items-center justify-center gap-1 rounded-lg bg-closed py-2.5 text-sm font-bold text-closed-foreground active:scale-95"><X className="h-4 w-4" />Está cerrado</button>
                </div>
              ) : (
                <p className="mt-2 rounded-lg border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">{reportHint(p)}</p>
              )}
            </div>

            <div className="mt-2">
              {tagsFor(p.id).length > 0 && <div className="flex flex-wrap gap-1">{tagsFor(p.id).map(([k, n]) => <span key={k} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{TAGS[k]}{n > 1 ? ` ×${n}` : ""}</span>)}</div>}
              {canReport(p) && more === p.id && <div className="-mx-1 mt-1.5 flex gap-1 overflow-x-auto px-1">{(Object.keys(TAGS) as TagKey[]).map((k) => <button key={k} onClick={() => addTag(p.id, k)} className="shrink-0 rounded-full border px-2 py-1 text-xs text-muted-foreground active:scale-95">{TAGS[k]}</button>)}</div>}
            </div>

            <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
              <a target="_blank" rel="noreferrer" onClick={() => goTo(p.id, p.name)} href={`https://www.google.com/maps/dir/?api=1&destination=${p.pos.lat},${p.pos.lng}`}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2 text-sm font-semibold text-primary">
                <Navigation className="h-4 w-4" /> Cómo llegar
              </a>
              <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(shareText(p))}`}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-open/15 py-2 text-sm font-semibold text-open">
                <Share2 className="h-4 w-4" /> WhatsApp
              </a>
              <button aria-label="Más opciones" onClick={() => setMore((m) => m === p.id ? null : p.id)} className={`flex items-center justify-center rounded-lg px-3 ${more === p.id ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            {more === p.id && p.category === "botilleria" && (proposing === p.id
              ? <ProposeHours placeId={p.id} placeName={p.name} onDone={() => setProposing(null)} />
              : <button onClick={() => setProposing(p.id)} className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground"><PencilLine className="h-3.5 w-3.5" />{p.hoursKind === "confirmed" ? "¿Cambió el horario? Propón una corrección" : "¿Conoces el horario real? Propónlo"}</button>)}
            {more === p.id && isAdmin && (
              <button onClick={() => hidePlace(p.id, p.name)} className="mt-2 w-full rounded-lg border border-closed/40 py-2 text-xs font-bold text-closed">🛠 Admin: marcar como cerrado definitivamente</button>)}
          </article>
        ))}

        {view === "rank" && top.length === 0 && <p className="py-16 text-center text-muted-foreground">Aún no hay ranking. ¡Reporta un local y sé el primero!</p>}
        {view === "rank" && top.length > 0 && (
          <section className="rounded-2xl border bg-card p-4">
            <p className="flex items-center gap-2 font-display text-lg font-bold"><Trophy className="h-5 w-5 text-primary" />Top cumpitas</p>
            {myPoints && <p className="mt-1 text-xs text-muted-foreground">Tú: {badgeFor(myPoints.points)} · {myPoints.points} puntos</p>}
            {user && (editNick
              ? <form onSubmit={saveNick} className="mt-2 flex gap-2"><input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} placeholder="Tu apodo, ej: CumpitaCalameño" className="min-w-0 flex-1 rounded-lg border bg-background px-2 py-1 text-sm" /><button className="rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground">Guardar</button></form>
              : <button onClick={() => { setNick(myPoints?.nickname ?? ""); setEditNick(true); }} className="mt-1 text-xs font-semibold text-primary underline">Cambiar mi apodo</button>)}
            <ol className="mt-2 space-y-1.5">
              {top.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-center font-bold text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{t.nickname ?? "Cumpita"}{t.is_me ? " (tú)" : ""}</span>
                  <span className="text-xs text-muted-foreground">{badgeFor(t.points)}</span>
                  <span className="font-display font-extrabold text-primary">{t.points}</span>
                </li>
              ))}
            </ol>
            {!user && <button onClick={signIn} className="mt-2 text-xs font-semibold text-primary underline">Entra con Google para sumar puntos con cada reporte</button>}
          </section>
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-[500] border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {([["feed", "Locales", List], ["map", "Mapa", MapIcon], ["fav", "Favoritos", Star], ["rank", "Ranking", Trophy]] as const).map(([k, l, Icon]) => {
            const active = k === "fav" ? view === "feed" && filter === "fav" : k === "feed" ? view === "feed" && filter !== "fav" : view === k;
            return (
              <button key={k} onClick={() => { navigator.vibrate?.(8); if (k === "fav") { setView("feed"); setFilter("fav"); } else { if (k === "feed" && filter === "fav") setFilter("all"); setView(k); } window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />{l}
              </button>);
          })}
        </div>
      </nav>
      <SuggestPlace city={loc.name} pos={userPos ?? { lat: loc.lat, lng: loc.lng }} places={places} />
      <div className="h-16" />
      <p className="px-4 pt-6 text-center text-xs text-muted-foreground">Datos: MINSAL (farmacias y horarios), SEREMI de Salud (turnos de Calama), OpenStreetMap y Google Places · <Link to="/revision" className="underline">Revisión de horarios</Link></p>
    </div>
  );
}
