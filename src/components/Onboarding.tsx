import { useState } from "react";
import { LocateFixed, ArrowRight } from "lucide-react";
import owl from "@/assets/cumpita-owl.png";
import { ZONES } from "@/lib/places";

export const ONBOARD_KEY = "cumpita-onboarded";
type Zone = (typeof ZONES)[number];
const SUFFIX = ["Nocturno", "Minero", "Costero", "Trasnochador", "Salvador", "Bacán"];
const randomNick = () => `Cumpita${SUFFIX[Math.floor(Math.random() * SUFFIX.length)]}_${Math.floor(10 + Math.random() * 90)}`;

export function Onboarding({ onDone }: { onDone: (r: { zone: Zone | null; gps: boolean; nick: string }) => void }) {
  const [step, setStep] = useState(0);
  const [zone, setZone] = useState<Zone | null>(null);
  const [gps, setGps] = useState(false);
  const [nick, setNick] = useState(randomNick);

  const finish = () => {
    localStorage.setItem(ONBOARD_KEY, "1");
    localStorage.setItem("cumpita-nick", nick.trim().slice(0, 20));
    navigator.vibrate?.([15, 40, 15]);
    onDone({ zone, gps, nick: nick.trim().slice(0, 20) });
  };
  const next = () => { navigator.vibrate?.(10); setStep((s) => s + 1); };

  return (
    <div className="bg-night fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background px-6 pb-8 pt-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        <div key={step} className="animate-fade-up flex flex-1 flex-col">
          {step === 0 && <>
            <img src={owl} alt="" width={96} height={96} className="mx-auto mt-8 h-24 w-24 drop-shadow-xl" />
            <h1 className="mt-4 text-center font-display text-4xl font-extrabold tracking-tight">cumpita<span className="text-primary">.</span></h1>
            <p className="mt-2 text-center text-muted-foreground">Lo que está abierto de verdad, a esta hora.</p>
            <p className="mt-8 text-sm font-bold uppercase tracking-wide text-muted-foreground">¿Dónde andas?</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {([["Calama", "⛏️", "Centro, Granaderos, Balmaceda"], ["La Serena", "🌊", "Centro, Mall, 4 Esquinas"]] as const).map(([c, e, d]) => {
                const sel = zone?.city === c && !gps;
                return (
                  <button key={c} onClick={() => { setGps(false); setZone(ZONES.find((z) => z.city === c)!); }}
                    className={`rounded-2xl border-2 bg-card p-4 text-left transition ${sel ? "border-primary shadow-lg" : "border-transparent"}`}>
                    <span className="text-3xl">{e}</span>
                    <p className="mt-2 font-display text-lg font-bold">{c}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setGps(true); setZone(null); }}
              className={`mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 bg-card p-3 text-sm font-semibold ${gps ? "border-primary" : "border-transparent"}`}>
              <LocateFixed className="h-4 w-4 text-primary" />Usar mi ubicación (GPS)
            </button>
          </>}

          {step === 1 && <>
            <p className="mt-10 text-5xl">🤝</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight">El pacto cumpita</h2>
            <p className="mt-3 text-muted-foreground">Los horarios de internet mienten de noche. Los cumpitas no.</p>
            <ul className="mt-6 space-y-3">
              {[["📍", "Llegas a un local", "Te mostramos lo más cerca, ordenado por distancia."],
                ["👆", "Confirmas con un toque", "¿Abierto o cerrado? Solo si estás a menos de 300 m."],
                ["🦉", "Salvas a otro cumpita", "Tu reporte evita que alguien haga el pique en vano."]].map(([e, t, d]) => (
                <li key={t} className="flex gap-3 rounded-2xl bg-card p-3">
                  <span className="text-2xl">{e}</span>
                  <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                </li>
              ))}
            </ul>
          </>}

          {step === 2 && <>
            <p className="mt-10 text-5xl">🏷️</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight">Tu apodo cumpita</h2>
            <p className="mt-3 text-muted-foreground">Así aparecerás en el ranking. Puedes cambiarlo cuando quieras.</p>
            <div className="mt-6 flex gap-2">
              <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} aria-label="Apodo"
                className="min-w-0 flex-1 rounded-2xl border bg-card px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={() => setNick(randomNick())} className="rounded-2xl bg-secondary px-4 text-xl" aria-label="Otro apodo">🎲</button>
            </div>
            <p className="mt-6 rounded-2xl bg-card p-3 text-sm text-muted-foreground">🔔 Si vas en camino a un local y cierra, te avisamos. Solo eso, nada de spam.</p>
          </>}
        </div>

        <button disabled={step === 0 && !zone && !gps} onClick={step < 2 ? next : finish}
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground shadow-lg disabled:opacity-40">
          {step < 2 ? "Siguiente" : "¡Vamos, cumpita!"}<ArrowRight className="h-5 w-5" />
        </button>
        {step === 0 && <button onClick={() => { setZone(ZONES[0]!); finish(); }} className="mt-3 text-sm text-muted-foreground underline">Saltar</button>}
      </div>
    </div>
  );
}
