import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  HardDrive,
  ShieldCheck,
  Zap,
  ExternalLink,
  QrCode,
  Layers,
  Sparkles,
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'qr'>('direct');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&bgcolor=07-09-0e&color=63-66-f1`;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'To install APMUSIC APK on Android:\n\n1. Open this page in Google Chrome on your Android device\n2. Tap the 3 dots (⋮) in the top-right\n3. Tap "Install App" or "Add to Home screen"\n4. Android will package and install the native WebAPK!'
      );
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[32px] ios-glass-card border border-white/25 p-6 sm:p-8 shadow-2xl space-y-5 text-white select-none max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 border border-white/20 shrink-0">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold tracking-tight font-['Outfit']">APMUSIC Android APK</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Lossless Audio APK
              </span>
            </div>
            <p className="text-xs text-slate-400">Install native APK on your Android phone or generate package</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get .APK File</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Tab 1: 1-Click Android WebAPK Install */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl ios-glass border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold">Install as Android WebAPK</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Android automatically creates a standalone <strong>.apk</strong> container directly in your phone’s app drawer with custom app icon, background lockscreen audio, and 320kbps offline downloads.
              </p>
              <button
                onClick={handleInstallPWA}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalled ? 'App Already Installed' : 'Install Directly to Android Phone'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl ios-glass border border-white/10 flex items-center justify-between gap-3">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200">App URL to open on your phone:</p>
                <p className="text-[11px] text-indigo-300 font-mono truncate">{currentUrl}</p>
              </div>
              <button
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Standalone .APK File Generator */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl ios-glass border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-bold">Generate Signed .APK File</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300">
                  Direct Package
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to open PWABuilder with this app preloaded. Click <strong>"Package for Android"</strong> to instantly download your signed <strong>.apk</strong> / <strong>.aab</strong> package ready for installation.
              </p>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950/60 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open APK Builder & Download .APK</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alternative: Build with Capacitor CLI</span>
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 font-mono text-[11px] text-emerald-300 select-all overflow-x-auto">
                npm run build && npx @capacitor/cli add android && npx cap open android
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Scan QR Code on Phone */}
        {activeTab === 'qr' && (
          <div className="p-6 rounded-2xl ios-glass border border-white/15 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-slate-900 rounded-2xl border border-indigo-500/40 shadow-xl shadow-indigo-950/50">
              <img
                src={qrCodeUrl}
                alt="Scan to open APMUSIC on Android"
                className="w-44 h-44 rounded-lg object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Scan with your Phone Camera</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Scan this QR code from your Android device to open APMUSIC and install it in seconds.
              </p>
            </div>
          </div>
        )}

        {/* Footer Features */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            320kbps Lossless Audio
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            Offline IndexedDB Storage
          </span>
        </div>
      </div>
    </div>
  );
};
