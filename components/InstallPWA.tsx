'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA — hide banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShow(false);
    }
    setPrompt(null);
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-80 animate-slide-up">
      <div className="relative rounded-2xl border border-brand-500/30 bg-surface-card shadow-brand overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 to-accent-green" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
              <img src="/favicon.png" alt="LifeOS" className="w-7 h-7 rounded-lg object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Install LifeOS</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                Add to home screen for the full app experience
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShow(false)}
              className="flex-1 py-2 text-xs text-white/40 hover:text-white/70 transition-colors rounded-xl border border-surface-border hover:border-white/15"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              id="pwa-install-btn"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all hover:shadow-brand"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
