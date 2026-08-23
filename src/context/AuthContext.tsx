import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Song, Playlist } from '../types';

export const GOOGLE_CLIENT_ID =
  ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) ||
  '1007133797592-kui5bjenf7undoi5csa2vuhvjrgtv2r9.apps.googleusercontent.com';

interface AuthContextType {
  user: UserProfile;
  likedSongs: Song[];
  customPlaylists: Playlist[];
  recentlyPlayed: Song[];
  offlineDownloadedSongs: Song[];
  downloadedSongs: Song[];
  isGoogleLoaded: boolean;
  loginWithGoogle: () => void;
  loginWithGooglePopup: () => void;
  logout: () => void;
  updateGuestProfile: (name: string, avatar: string) => void;
  toggleLikeSong: (song: Song) => boolean;
  toggleLike: (song: Song) => boolean;
  isSongLiked: (songId: string) => boolean;
  isLiked: (songId: string) => boolean;
  createPlaylist: (name: string, description?: string, coverImage?: string) => Playlist;
  createCustomPlaylist: (name: string, description?: string, coverImage?: string) => Playlist;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  deleteCustomPlaylist: (playlistId: string) => void;
  saveSpotifyImportedPlaylist: (imported: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    resolvedSongs: Song[];
  }) => Playlist;
  recordPlayHistory: (song: Song) => void;
  addOfflineSong: (song: Song) => void;
  removeOfflineSong: (songId: string) => void;
  removeDownloadedSong: (songId: string) => void;
  isSongDownloaded: (songId: string) => boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'guest-1',
  name: 'APMUSIC Listener',
  email: 'listener@apmusic.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  isGoogleAuth: false,
  plan: 'APMUSIC Hi-Res Lossless',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'apmusic_user_profile',
  LIKED: 'apmusic_liked_songs',
  PLAYLISTS: 'apmusic_custom_playlists',
  HISTORY: 'apmusic_play_history',
  OFFLINE: 'apmusic_offline_songs',
};

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [offlineDownloadedSongs, setOfflineDownloadedSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(customPlaylists));
  }, [customPlaylists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE, JSON.stringify(offlineDownloadedSongs));
  }, [offlineDownloadedSongs]);

  // Google GSI Handler
  const handleGoogleCredentialResponse = useCallback((response: any) => {
    if (response?.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        const loggedUser: UserProfile = {
          id: payload.sub || `google-${Date.now()}`,
          name: payload.name || 'Google User',
          email: payload.email || 'user@gmail.com',
          avatar: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          isGoogleAuth: true,
          plan: 'APMUSIC Hi-Res Lossless',
        };
        setUser(loggedUser);
      }
    }
  }, []);

  // Initialize Google One Tap / Identity Services with provided Client ID
  useEffect(() => {
    const checkGSI = () => {
      // @ts-ignore
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        try {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (_) {}
      } else {
        setTimeout(checkGSI, 500);
      }
    };
    checkGSI();
  }, [handleGoogleCredentialResponse]);

  const loginWithGoogle = useCallback(() => {
    // @ts-ignore
    if (window.google?.accounts?.id) {
      try {
        // @ts-ignore
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // When preview environment blocks third-party cookie prompt or popup
            const mockName = prompt('Sign in with Google Account Name:', 'Ayaan Patel');
            const mockEmail = prompt('Google Account Email:', 'ayaanp.2008skp@gmail.com');
            if (mockName) {
              setUser({
                id: `google-user-${Date.now()}`,
                name: mockName,
                email: mockEmail || 'ayaanp.2008skp@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                isGoogleAuth: true,
                plan: 'APMUSIC Hi-Res Lossless',
              });
            }
          }
        });
        return;
      } catch (_) {}
    }

    // Direct Profile Login
    const mockName = prompt('Enter Google Account Name for Lossless Profile:', 'Ayaan Patel');
    if (mockName) {
      setUser({
        id: `google-${Date.now()}`,
        name: mockName,
        email: 'ayaanp.2008skp@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        isGoogleAuth: true,
        plan: 'APMUSIC Hi-Res Lossless',
      });
    }
  }, []);

  const logout = () => {
    setUser(DEFAULT_USER);
  };

  const updateGuestProfile = (name: string, avatar: string) => {
    setUser((prev) => ({
      ...(prev || DEFAULT_USER),
      name: name || prev?.name || 'Listener',
      avatar: avatar || prev?.avatar || DEFAULT_USER.avatar,
    }));
  };

  const toggleLikeSong = (song: Song): boolean => {
    const exists = likedSongs.some((s) => s.id === song.id);
    if (exists) {
      setLikedSongs((prev) => prev.filter((s) => s.id !== song.id));
      return false;
    } else {
      setLikedSongs((prev) => [song, ...prev]);
      return true;
    }
  };

  const isSongLiked = (songId: string): boolean => {
    return likedSongs.some((s) => s.id === songId);
  };

  const createCustomPlaylist = (name: string, description = '', coverImage?: string): Playlist => {
    const newPl: Playlist = {
      id: `custom-pl-${Date.now()}`,
      name,
      description,
      songCount: 0,
      image: [
        {
          quality: '500x500',
          url:
            coverImage ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        },
      ],
      songs: [],
      isCustom: true,
      createdAt: new Date().toISOString(),
      owner: user?.name || 'You',
    };
    setCustomPlaylists((prev) => [newPl, ...prev]);
    return newPl;
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setCustomPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const currentSongs = pl.songs || [];
          if (currentSongs.some((s) => s.id === song.id)) return pl;
          const updated = [...currentSongs, song];
          return {
            ...pl,
            songs: updated,
            songCount: updated.length,
          };
        }
        return pl;
      })
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setCustomPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const updated = (pl.songs || []).filter((s) => s.id !== songId);
          return {
            ...pl,
            songs: updated,
            songCount: updated.length,
          };
        }
        return pl;
      })
    );
  };

  const deleteCustomPlaylist = (playlistId: string) => {
    setCustomPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
  };

  const saveSpotifyImportedPlaylist = (imported: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    resolvedSongs: Song[];
  }): Playlist => {
    const newPl: Playlist = {
      id: imported.id,
      name: imported.title,
      description: imported.description,
      songCount: imported.resolvedSongs.length,
      image: [
        { quality: '500x500', url: imported.coverImage },
        { quality: '150x150', url: imported.coverImage },
      ],
      songs: imported.resolvedSongs,
      isCustom: true,
      isSpotifyImport: true,
      createdAt: new Date().toISOString(),
      owner: 'Imported from Spotify',
    };

    setCustomPlaylists((prev) => {
      const filtered = prev.filter((p) => p.id !== imported.id);
      return [newPl, ...filtered];
    });

    return newPl;
  };

  const recordPlayHistory = (song: Song) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 30);
    });
  };

  const addOfflineSong = (song: Song) => {
    setOfflineDownloadedSongs((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      return [{ ...song, isDownloaded: true }, ...prev];
    });
  };

  const removeOfflineSong = (songId: string) => {
    setOfflineDownloadedSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const isSongDownloaded = (songId: string): boolean => {
    return offlineDownloadedSongs.some((s) => s.id === songId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        likedSongs,
        customPlaylists,
        recentlyPlayed,
        offlineDownloadedSongs,
        downloadedSongs: offlineDownloadedSongs,
        isGoogleLoaded,
        loginWithGoogle,
        loginWithGooglePopup: loginWithGoogle,
        logout,
        updateGuestProfile,
        toggleLikeSong,
        toggleLike: toggleLikeSong,
        isSongLiked,
        isLiked: isSongLiked,
        createPlaylist: createCustomPlaylist,
        createCustomPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist: deleteCustomPlaylist,
        deleteCustomPlaylist,
        saveSpotifyImportedPlaylist,
        recordPlayHistory,
        addOfflineSong,
        removeOfflineSong,
        removeDownloadedSong: removeOfflineSong,
        isSongDownloaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
