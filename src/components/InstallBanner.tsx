import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "cumpita-install-dismissed";

export function InstallBanner() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone;
    if (standalone || Date.now() - Number(localStorage.getItem(KEY) || 0) < 7 * 864e5) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setIos(true);
      setShow(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!show) return null;
  const close = () => {
    localStorage.setItem(KEY, String(Date.now()));
    setShow(false);
  };
  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setShow(false);
  };

  return (
    <div className="animate-fade-up mx-4 mb-2 flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 text-xs">
        <b>Instala cumpita.</b> en tu celular
        {ios ? (
          <>
            {" "}
            — toca <b>Compartir</b> y luego <b>«Agregar a inicio»</b>.
          </>
        ) : (
          " para abrirla con un toque."
        )}
      </p>
      {!ios && evt && (
        <button
          onClick={install}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          Instalar
        </button>
      )}
      <button onClick={close} aria-label="Cerrar" className="shrink-0 text-muted-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
