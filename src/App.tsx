import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import { LiquidMeshBackground } from './components/LiquidMeshBackground';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayerModal } from './components/FullPlayerModal';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { SettingsView } from './components/SettingsView';
import { SoundboardView } from './components/SoundboardView';
import { AIDJModal } from './components/AIDJModal';
import { SpotifyImportModal } from './components/SpotifyImportModal';
import { EqualizerModal } from './components/EqualizerModal';
import { PlaylistModal } from './components/PlaylistModal';
import { ArtistModal } from './components/ArtistModal';
import { AlbumModal } from './components/AlbumModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { LoginModal } from './components/LoginModal';
import { OfflineModeModal } from './components/OfflineModeModal';
import { InstallModal } from './components/InstallModal';
import { NavigationTab, Playlist, Artist, Album } from './types';

function MainLayout() {
  const { resolvedTheme } = useAppTheme();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [fullPlayerTab, setFullPlayerTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [isAIDJOpen, setIsAIDJOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isEQModalOpen, setIsEQModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Active Modals for viewing specific collections
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const handleOpenFullPlayer = (tab: 'cover' | 'lyrics' | 'queue' = 'cover') => {
    setFullPlayerTab(tab);
    setIsFullPlayerOpen(true);
  };

  return (
    <div
      className={`relative min-h-screen font-['Plus_Jakarta_Sans'] antialiased selection:bg-indigo-500 selection:text-white flex flex-col overflow-x-hidden transition-colors duration-500 ${
        resolvedTheme === 'light' ? 'bg-[#f2f5fa] text-slate-900' : 'bg-[#07090e] text-slate-100'
      }`}
    >
      {/* Dynamic Ambient Liquid Mesh Background */}
      <LiquidMeshBackground />

      {/* Persistent Glass Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAIDJ={() => setIsAIDJOpen(true)}
        onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
        onOpenEQModal={() => setIsEQModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Layout with Desktop Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
          onOpenAIDJ={() => setIsAIDJOpen(true)}
          onOpenEQ={() => setIsEQModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {/* Dynamic Main Viewport */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {currentTab === 'home' && (
            <HomeView
              onOpenAIDJ={() => setIsAIDJOpen(true)}
              onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
              onOpenPlaylist={(pl) => setSelectedPlaylist(pl)}
              onOpenArtist={(art) => setSelectedArtist(art)}
              onOpenAlbum={(alb) => setSelectedAlbum(alb)}
              onOpenSearch={() => setCurrentTab('search')}
              onOpenProfile={() => setCurrentTab('settings')}
              onOpenSoundboard={() => setCurrentTab('soundboard')}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              onOpenPlaylist={(pl) => setSelectedPlaylist(pl)}
              onOpenArtist={(art) => setSelectedArtist(art)}
              onOpenAlbum={(alb) => setSelectedAlbum(alb)}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              onCreatePlaylistModal={() => setIsCreatePlaylistOpen(true)}
              onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
              onOpenPlaylist={(pl) => setSelectedPlaylist(pl)}
              onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
            />
          )}

          {currentTab === 'soundboard' && <SoundboardView />}

          {(currentTab === 'settings' || currentTab === 'profile') && (
            <SettingsView
              onOpenEQ={() => setIsEQModalOpen(true)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
              onOpenInstall={() => setIsInstallModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* iOS Style Floating Mini-Player Dock */}
      <MiniPlayer
        onOpenFullPlayer={() => handleOpenFullPlayer('cover')}
        onExpand={() => handleOpenFullPlayer('cover')}
        onOpenLyrics={() => handleOpenFullPlayer('lyrics')}
        onOpenEQ={() => setIsEQModalOpen(true)}
      />

      {/* iOS Floating Glass Bottom Navigation (Mobile Viewports) */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
        onOpenEQModal={() => setIsEQModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Full Screen Immersive iOS Player Modal with Synced Lyrics & Audio Visualizer */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        onOpenEQ={() => setIsEQModalOpen(true)}
        initialTab={fullPlayerTab}
      />

      {/* Login & User Profile Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Gemini AI DJ Modal */}
      <AIDJModal isOpen={isAIDJOpen} onClose={() => setIsAIDJOpen(false)} />

      {/* Spotify Lossless Importer Modal */}
      <SpotifyImportModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
      />

      {/* 5-Band Hardware Equalizer Modal */}
      <EqualizerModal isOpen={isEQModalOpen} onClose={() => setIsEQModalOpen(false)} />

      {/* Playlist Inspector Modal */}
      <PlaylistModal
        playlist={selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
      />

      {/* Artist Profile Modal */}
      <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />

      {/* Album Modal */}
      <AlbumModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />

      {/* Create Custom Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      {/* IndexedDB Offline Mode Manager Modal */}
      <OfflineModeModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Standalone Android App / APK Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <MainLayout />
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
