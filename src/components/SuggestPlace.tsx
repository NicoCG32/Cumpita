import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPinPlus, MessageSquare } from "lucide-react";

export function SuggestPlace({ city, pos }: { city: string; pos: { lat: number; lng: number } | null }) {
  const [open, setOpen] = useState<null | "missing" | "feedback">(null);
  const [name, setName] = useState(""); const [cat, setCat] = useState<"farmacia" | "botilleria">("botilleria");
  const [address, setAddress] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (open === "missing" && (!name.trim() || !address.trim())) { toast.error("Pon el nombre y la esquina o dirección."); return; }
    if (open === "feedback" && !note.trim()) { toast.error("Cuéntanos tu idea o el error."); return; }
    setBusy(true);
    const { error } = await supabase.from("place_suggestions").insert(open === "missing"
      ? { kind: "missing", name: name.trim().slice(0, 120), category: cat, city: city.slice(0, 60), address: address.trim().slice(0, 200), note: note.trim().slice(0, 1000) || null, lat: pos?.lat ?? null, lng: pos?.lng ?? null }
      : { kind: "feedback", city: city.slice(0, 60), note: note.trim().slice(0, 1000) });
    setBusy(false);
    if (error) { toast.error("No se pudo enviar. Intenta de nuevo."); return; }
    toast.success(open === "missing" ? "¡Gracias! Lo revisamos y lo agregamos." : "¡Gracias por la idea!");
    setOpen(null); setName(""); setAddress(""); setNote("");
  };

  const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
  return (
    <div className="mx-4 mt-6 rounded-2xl border bg-card p-4">
      {!open ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setOpen("missing")} className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2.5 text-sm font-semibold text-primary"><MapPinPlus className="h-4 w-4" />¿Falta un local?</button>
          <button onClick={() => setOpen("feedback")} className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2.5 text-sm font-semibold"><MessageSquare className="h-4 w-4" />Ideas o errores</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-semibold">{open === "missing" ? "¿Falta un local en tu barrio?" : "Cuéntanos tu idea o el error"}</p>
          {open === "missing" && <>
            <input className={input} placeholder="Nombre del local" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              {(["botilleria", "farmacia"] as const).map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-lg border py-2 text-sm font-semibold ${cat === c ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}>{c === "farmacia" ? "Farmacia" : "Botillería"}</button>)}
            </div>
            <input className={input} placeholder="Esquina o dirección" value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} />
          </>}
          <textarea className={input} rows={3} maxLength={1000} placeholder={open === "missing" ? "Horario u otro dato (opcional)" : "Escribe aquí"} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setOpen(null)} className="rounded-lg bg-muted py-2 text-sm font-semibold">Cancelar</button>
            <button disabled={busy} onClick={send} className="rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
