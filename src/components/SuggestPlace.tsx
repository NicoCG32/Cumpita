import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPinPlus, MessageSquare, TriangleAlert } from "lucide-react";
import { distanceM, type Place, type Category } from "@/lib/places";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(farmacia|farmacias|botilleria|botillerias|licoreria|libreria|bazar|almacen|minimarket|ferreteria|ferreterias|la|el|los|las|de)\b/g,
      "",
    )
    .replace(/[^a-z0-9]/g, "");

/** Locales parecidos ya cargados: mismo nombre a menos de 400 m, o misma categoría a menos de 40 m. */
export function findDuplicates(
  places: Place[],
  name: string,
  cat: Place["category"],
  pos: { lat: number; lng: number },
) {
  const n = norm(name);
  return places
    .map((p) => ({ p, d: distanceM(pos, p) }))
    .filter(({ p, d }) => {
      const m = norm(p.name);
      const similar = n.length >= 3 && m.length >= 3 && (m.includes(n) || n.includes(m));
      return (similar && d <= 400) || (p.category === cat && d <= 40);
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
}

export function SuggestPlace({
  city,
  pos,
  places,
}: {
  city: string;
  pos: { lat: number; lng: number };
  places: Place[];
}) {
  const [open, setOpen] = useState<null | "missing" | "feedback">(null);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<Category>("botilleria");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [dups, setDups] = useState<{ p: Place; d: number }[] | null>(null);

  const send = async () => {
    if (open === "missing" && (!name.trim() || !address.trim())) {
      toast.error("Pon el nombre y la esquina o dirección.");
      return;
    }
    if (open === "feedback" && !note.trim()) {
      toast.error("Cuéntanos tu idea o el error.");
      return;
    }
    if (open === "missing" && !dups) {
      const found = findDuplicates(places, name, cat, pos);
      if (found.length) {
        setDups(found);
        return;
      }
    }
    setBusy(true);
    const { error } = await supabase.from("place_suggestions").insert(
      open === "missing"
        ? {
            kind: "missing",
            name: name.trim().slice(0, 120),
            category: cat,
            city: city.slice(0, 60),
            address: address.trim().slice(0, 200),
            note: note.trim().slice(0, 1000) || null,
            lat: pos.lat,
            lng: pos.lng,
          }
        : { kind: "feedback", city: city.slice(0, 60), note: note.trim().slice(0, 1000) },
    );
    setBusy(false);
    if (error) {
      toast.error("No se pudo enviar. Intenta de nuevo.");
      return;
    }
    toast.success(
      open === "missing" ? "¡Gracias! Lo revisamos y lo agregamos." : "¡Gracias por la idea!",
    );
    setOpen(null);
    setName("");
    setAddress("");
    setNote("");
    setDups(null);
  };

  const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
  return (
    <div className="mx-4 mt-6 rounded-2xl border bg-card p-4">
      {!open ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOpen("missing")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2.5 text-sm font-semibold text-primary"
          >
            <MapPinPlus className="h-4 w-4" />
            ¿Falta un local?
          </button>
          <button
            onClick={() => setOpen("feedback")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-2.5 text-sm font-semibold"
          >
            <MessageSquare className="h-4 w-4" />
            Ideas o errores
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-semibold">
            {open === "missing" ? "¿Falta un local en tu barrio?" : "Cuéntanos tu idea o el error"}
          </p>
          {open === "missing" && (
            <>
              <input
                className={input}
                placeholder="Nombre del local"
                value={name}
                maxLength={120}
                onChange={(e) => {
                  setName(e.target.value);
                  setDups(null);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_KEYS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCat(c);
                      setDups(null);
                    }}
                    className={`rounded-lg border py-2 text-sm font-semibold ${cat === c ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                  </button>
                ))}
              </div>
              <input
                className={input}
                placeholder="Esquina o dirección"
                value={address}
                maxLength={200}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}
          <textarea
            className={input}
            rows={3}
            maxLength={1000}
            placeholder={open === "missing" ? "Horario u otro dato (opcional)" : "Escribe aquí"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {dups && dups.length > 0 && (
            <div className="rounded-lg border border-star/40 bg-star/10 p-3 text-sm">
              <p className="flex items-center gap-1 font-semibold">
                <TriangleAlert className="h-4 w-4" />
                ¿Es alguno de estos? Ya está en la app:
              </p>
              <ul className="mt-1 space-y-0.5">
                {dups.map(({ p, d }) => (
                  <li key={p.id}>
                    • <b>{p.name}</b>
                    {p.street ? ` · ${p.street}` : ""}{" "}
                    <span className="text-muted-foreground">({Math.round(d)} m)</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">
                Si es otro local, toca "Enviar igual".
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Usamos tu ubicación actual como punto del local: envíalo estando cerca.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setOpen(null);
                setDups(null);
              }}
              className="rounded-lg bg-muted py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              disabled={busy}
              onClick={send}
              className="rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {dups?.length ? "Enviar igual" : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
