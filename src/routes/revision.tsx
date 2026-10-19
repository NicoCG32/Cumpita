import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { catLabel } from "@/lib/categories";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Revisión de horarios — Cumpita" },
      { name: "description", content: "Panel para revisar y aprobar horarios de botillerías propuestos por la comunidad." },
      { property: "og:title", content: "Revisión de horarios — Cumpita" },
      { property: "og:description", content: "Aprueba horarios reales enviados por los cumpitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Revision,
});

type Proposal = Tables<"hours_proposals">;

function Revision() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<Proposal[]>([]);
  const [sugs, setSugs] = useState<Tables<"place_suggestions">[]>([]);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [userId]);

  const load = () => supabase.from("hours_proposals").select("*").eq("status", "pending").order("created_at").then(({ data }) => setItems(data ?? []));
  useEffect(() => {
    if (!isAdmin) return;
    load();
    supabase.from("place_suggestions").select("*").eq("status", "pending").order("created_at").then(({ data }) => setSugs(data ?? []));
    supabase.from("hidden_places").select("*").order("created_at", { ascending: false }).then(({ data }) => setHidden(data ?? []));
  }, [isAdmin]);
  const [hidden, setHidden] = useState<Tables<"hidden_places">[]>([]);
  const [ops, setOps] = useState<Tables<"ops_events">[]>([]);
  useEffect(() => {
    if (!isAdmin) return;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    supabase.from("ops_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(1000).then(({ data }) => setOps(data ?? []));
  }, [isAdmin]);
  const health = Object.values(ops.reduce<Record<string, { key: string; total: number; fails: number; ms: number[]; last: string; lastOk: string | null }>>((acc, e) => {
    const key = e.kind === "source" ? e.source : e.kind === "refresh" ? "tarea automática" : e.kind === "slow" ? "cargas lentas (app)" : e.kind === "retry" ? "reintentos (app)" : e.kind === "load_error" ? "errores de carga (app)" : `caché: ${e.source}`;
    const a = (acc[key] ??= { key, total: 0, fails: 0, ms: [], last: e.created_at, lastOk: null });
    a.total++; if (!e.ok) a.fails++; if (e.ms != null) a.ms.push(e.ms); if (e.ok && !a.lastOk) a.lastOk = e.created_at;
    return acc;
  }, {}));
  const restore = async (id: string) => {
    const { error } = await supabase.from("hidden_places").delete().eq("place_id", id);
    if (error) { toast.error("No se pudo reactivar."); return; }
    toast.success("Local reactivado"); setHidden((x) => x.filter((h) => h.place_id !== id));
  };
  const reviewSug = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("place_suggestions").update({ status, reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", id);
    if (error) { toast.error("No se pudo guardar."); return; }
    toast.success(status === "approved" ? "Aprobado: ya aparece en la app" : "Descartado");
    setSugs((x) => x.filter((p) => p.id !== id));
  };

  const auth = async (mode: "in" | "up") => {
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/revision` } });
    if (error) toast.error(error.message); else if (mode === "up") toast.success("Revisa tu correo para confirmar la cuenta.");
  };

  const review = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("hours_proposals").update({ status, reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", id);
    if (error) { toast.error("No se pudo guardar."); return; }
    toast.success(status === "approved" ? "Horario aprobado" : "Propuesta rechazada");
    setItems((x) => x.filter((p) => p.id !== id));
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background px-4 pb-10 pt-5">
      <Toaster position="top-center" />
      <Link to="/" className="text-sm text-muted-foreground">← Volver</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold">Revisión de horarios</h1>
      {!userId && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Ingresa con tu cuenta de revisor.</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo" className="w-full rounded-lg border bg-card px-3 py-2" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="contraseña" className="w-full rounded-lg border bg-card px-3 py-2" />
          <div className="flex gap-2">
            <button onClick={() => auth("in")} className="flex-1 rounded-lg bg-primary py-2 font-bold text-primary-foreground">Entrar</button>
            <button onClick={() => auth("up")} className="flex-1 rounded-lg bg-secondary py-2 font-semibold">Crear cuenta</button>
          </div>
        </div>
      )}
      {userId && isAdmin === false && <p className="mt-4 rounded-xl bg-muted p-4 text-sm">Tu cuenta aún no tiene permiso de revisor. <button className="underline" onClick={() => supabase.auth.signOut()}>Salir</button></p>}
      {userId && isAdmin && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm"><span>{items.length} pendientes</span><button className="underline" onClick={() => supabase.auth.signOut()}>Salir</button></div>
          {items.map((p) => (
            <article key={p.id} className="rounded-2xl border bg-card p-4 text-sm shadow-sm">
              <h2 className="font-display text-lg font-bold">{p.place_name}</h2>
              <p className="text-xs text-muted-foreground">Enviado {new Date(p.created_at).toLocaleString("es-CL")}</p>
              <p className="mt-2">Lu–Ju y Do: <b>{p.weekday_open}–{p.weekday_close}</b></p>
              <p>Vi–Sá: <b>{p.weekend_open}–{p.weekend_close}</b></p>
              <p className="mt-2 rounded-lg bg-muted p-2">{p.evidence_note}</p>
              {p.evidence_url && <a href={p.evidence_url} target="_blank" rel="noreferrer noopener" className="mt-1 block truncate text-primary underline">{p.evidence_url}</a>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => review(p.id, "approved")} className="rounded-lg bg-open py-2 font-bold text-open-foreground">Aprobar</button>
                <button onClick={() => review(p.id, "rejected")} className="rounded-lg bg-closed py-2 font-bold text-closed-foreground">Rechazar</button>
              </div>
            </article>
          ))}
          <h2 className="pt-4 font-display text-xl font-extrabold">Locales que faltan e ideas ({sugs.length})</h2>
          {sugs.map((g) => (
            <article key={g.id} className="rounded-2xl border bg-card p-4 text-sm shadow-sm">
              <p className="text-xs font-bold uppercase text-muted-foreground">{g.kind === "missing" ? `Local que falta · ${catLabel(g.category ?? "")}` : "Idea o error"} · {g.city}</p>
              {g.name && <h3 className="font-display text-lg font-bold">{g.name}</h3>}
              {g.address && <p>{g.address}</p>}
              {g.note && <p className="mt-2 rounded-lg bg-muted p-2">{g.note}</p>}
              {g.lat != null && g.lng != null && <a href={`https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lng}`} target="_blank" rel="noreferrer" className="mt-1 block text-primary underline">Ver ubicación en el mapa (aquí aparecerá)</a>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => reviewSug(g.id, "approved")} className="rounded-lg bg-open py-2 font-bold text-open-foreground">{g.kind === "missing" ? "Aprobar y publicar" : "Revisado"}</button>
                <button onClick={() => reviewSug(g.id, "rejected")} className="rounded-lg bg-closed py-2 font-bold text-closed-foreground">Descartar</button>
              </div>
            </article>
          ))}
          <h2 className="pt-4 font-display text-xl font-extrabold">Salud de datos · últimas 24 h</h2>
          {health.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay registros.</p>}
          {health.map((h) => (
            <article key={h.key} className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-3 text-sm">
              <div className="min-w-0"><p className="truncate font-bold">{h.key}</p>
                <p className="text-xs text-muted-foreground">{h.total} eventos{h.ms.length ? ` · prom. ${Math.round(h.ms.reduce((x, y) => x + y, 0) / h.ms.length / 100) / 10} s` : ""}{h.lastOk ? ` · último OK ${new Date(h.lastOk).toLocaleTimeString("es-CL")}` : ""}</p></div>
              <span className={`rounded-lg px-2 py-1 text-xs font-bold ${h.fails ? "bg-closed text-closed-foreground" : "bg-open text-open-foreground"}`}>{h.fails ? `${h.fails} fallos` : "OK"}</span>
            </article>
          ))}
          <h2 className="pt-4 font-display text-xl font-extrabold">Locales dados de baja ({hidden.length})</h2>
          {hidden.map((h) => (
            <article key={h.place_id} className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-3 text-sm">
              <div className="min-w-0"><p className="truncate font-bold">{h.place_name}</p><p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("es-CL")}</p></div>
              <button onClick={() => restore(h.place_id)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold">Reactivar</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
