import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const field = "w-full rounded-lg border bg-card px-2 py-1.5 text-sm";

export function ProposeHours({ placeId, placeName, onDone }: { placeId: string; placeName: string; onDone: () => void }) {
  const [f, setF] = useState({ weekday_open: "10:00", weekday_close: "01:00", weekend_open: "10:00", weekend_close: "02:00", evidence_url: "", evidence_note: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = f.evidence_url.trim();
    if (url && !/^https?:\/\//.test(url)) { toast.error("El enlace debe empezar con http:// o https://"); return; }
    if (f.evidence_note.trim().length < 5) { toast.error("Cuéntanos cómo sabes este horario."); return; }
    setBusy(true);
    const { error } = await supabase.from("hours_proposals").insert({ place_id: placeId, place_name: placeName, ...f, evidence_url: url || null, evidence_note: f.evidence_note.trim() });
    setBusy(false);
    if (error) { toast.error("No se pudo enviar. Revisa los datos e intenta de nuevo."); return; }
    toast.success("¡Gracias! Un revisor verificará el horario.");
    onDone();
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl bg-muted p-3 text-xs">
      <p className="font-semibold">Proponer horario real</p>
      <div className="grid grid-cols-2 gap-2">
        <label>Lu–Ju y Do abre<input type="time" required value={f.weekday_open} onChange={set("weekday_open")} className={field} /></label>
        <label>cierra<input type="time" required value={f.weekday_close} onChange={set("weekday_close")} className={field} /></label>
        <label>Vi–Sá abre<input type="time" required value={f.weekend_open} onChange={set("weekend_open")} className={field} /></label>
        <label>cierra<input type="time" required value={f.weekend_close} onChange={set("weekend_close")} className={field} /></label>
      </div>
      <label className="block">Evidencia: ¿cómo lo sabes?<textarea required maxLength={1000} value={f.evidence_note} onChange={set("evidence_note")} placeholder="Ej: letrero en la puerta, foto del 9 de octubre" className={field} /></label>
      <label className="block">Enlace a foto o publicación (opcional)<input type="url" maxLength={500} value={f.evidence_url} onChange={set("evidence_url")} placeholder="https://…" className={field} /></label>
      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="flex-1 rounded-lg bg-secondary py-2 font-semibold">Cancelar</button>
        <button disabled={busy} className="flex-1 rounded-lg bg-primary py-2 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Enviando…" : "Enviar"}</button>
      </div>
    </form>
  );
}
