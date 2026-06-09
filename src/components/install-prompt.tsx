"use client";

import * as React from "react";
import { X, Download } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null);
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as { MSStream?: unknown }).MSStream,
    );

    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches,
    );

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (isStandalone) return null;
  if (!showBanner) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const promptEvent = deferredPrompt as unknown as {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom-4 fade-in">
      <div className="rounded-xl border bg-white p-4 shadow-lg dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Download className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install Aplikasi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIOS
                ? "Tekan tombol share ⎋ lalu pilih \"Add to Home Screen\""
                : "Install untuk akses lebih cepat"}
            </p>
            {!isIOS && deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Download className="size-3.5" />
                Install
              </button>
            ) : null}
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Tutup"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
