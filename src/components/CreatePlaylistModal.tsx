import React, { useState } from 'react';
import { X, ListPlus, FolderPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (id: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated,
}) => {
  const { createPlaylist } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPl = createPlaylist(name.trim(), description.trim());
    setName('');
    setDescription('');
    if (onPlaylistCreated) {
      onPlaylistCreated(newPl.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-[32px] ios-glass-card border border-indigo-500/30 p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg text-white">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Create Playlist</h2>
              <p className="text-xs text-slate-300">Custom lossless collection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Playlist Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Driving Soundtrack"
              className="w-full px-4 py-3 rounded-2xl ios-glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a vibe description..."
              className="w-full px-4 py-3 rounded-2xl ios-glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
