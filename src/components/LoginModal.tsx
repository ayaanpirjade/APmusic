import React, { useState } from 'react';
import { X, LogIn, LogOut, CheckCircle2, Sparkles, Shield, Music2, Heart, ListMusic, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGooglePopup, logout, likedSongs, customPlaylists, updateGuestProfile } = useAuth();
  const [customName, setCustomName] = useState(user?.name || '');
  const [customEmail, setCustomEmail] = useState(user?.email || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!isOpen) return null;

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      updateGuestProfile(customName.trim(), user.avatar);
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-[32px] ios-glass-card border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full ios-glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">APMUSIC Account</h3>
            <p className="text-xs text-slate-400">Lossless Master Audio & Cloud Sync</p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white truncate">{user.name}</span>
              {user.isGoogleAuth && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{user.plan}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{likedSongs.length}</div>
              <div className="text-[11px] text-slate-400">Liked Songs</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{customPlaylists.length}</div>
              <div className="text-[11px] text-slate-400">Playlists</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!user.isGoogleAuth ? (
            <button
              onClick={() => {
                loginWithGooglePopup();
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-bold text-sm shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Google</span>
            </button>
          )}

          {/* Edit Profile Toggle */}
          <button
            onClick={() => setIsEditingProfile((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Listener Name'}</span>
          </button>

          {isEditingProfile && (
            <form onSubmit={handleSaveCustomProfile} className="space-y-3 pt-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name / Alias"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Save Name
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
