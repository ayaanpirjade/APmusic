import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  searchSongs,
  searchAll,
  getSongById,
  getSongSuggestions,
  getHomeModules,
  getPlaylistDetails,
  getAlbumDetails,
  getArtistDetails,
  getLyrics,
} from './server/spotifyOnlyService.js';
import { generateAIDJMix } from './server/aiService.js';
import {
  searchPrimarySongs,
  getPrimaryCharts,
  importPrimaryPlaylist,
  getPrimaryTrackDetails,
  formatPrimaryTrackToSong,
  resolveTrackAudioStream,
} from './server/primaryMusicService.js';

dotenv.config();

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, x-api-key');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'APMUSIC Liquid Audio Core & Primary Music API',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasMusicApiKey: true,
    });
  });

  // Home modules from the Spotify Primary API only.
  app.get('/api/modules', async (req, res) => {
    try {
      const languages = (req.query.language as string) || 'hindi,english,punjabi';
      const data = await getHomeModules(languages);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('/api/modules error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Top Charts & Trending Songs from Primary API (global, trending, hindi, punjabi, pop, lofi)
  app.get('/api/charts', async (req, res) => {
    try {
      const category = (req.query.category as string) || 'trending';
      const chartData = await getPrimaryCharts(category);
      res.json({
        success: true,
        category: chartData.category,
        total: chartData.total,
        tracks: chartData.songs,
      });
    } catch (err: any) {
      console.error('/api/charts error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Search songs from the Spotify Primary API only.
  app.get('/api/search/songs', async (req, res) => {
    try {
      const query = (req.query.query as string) || '';
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      if (!query.trim()) {
        return res.json({ success: true, data: { results: [], total: 0, page, source: 'spotify-primary' } });
      }
      const results = await searchPrimarySongs(query, limit);
      res.setHeader('Cache-Control', 'no-store');
      res.json({
        success: true,
        data: { results, total: results.length, page, source: 'spotify-primary', fallbackUsed: false },
      });
    } catch (err: any) {
      console.error('/api/search/songs error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Search All Categories (Songs, Albums, Playlists, Artists) - Primary API First
  app.get('/api/search/all', async (req, res) => {
    try {
      const query = (req.query.query as string) || '';
      if (!query.trim()) {
        return res.json({
          success: true,
          data: { songs: [], albums: [], playlists: [], artists: [] },
        });
      }

      const spotifyData = await searchAll(query);
      res.json({ success: true, data: spotifyData });
    } catch (err: any) {
      console.error('/api/search/all error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Track Details & Playback Info (Primary API /track/:youtubeId)
  app.get('/api/track/:youtubeId', async (req, res) => {
    try {
      const track = await getPrimaryTrackDetails(req.params.youtubeId);
      if (!track) {
        return res.status(404).json({ success: false, error: 'Track details not found' });
      }
      res.json({ success: true, track });
    } catch (err: any) {
      console.error('/api/track/:youtubeId error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Resolve direct audio stream on-demand
  app.get('/api/stream/resolve', async (req, res) => {
    try {
      const id = (req.query.id as string) || '';
      const title = (req.query.title as string) || '';
      const artist = (req.query.artist as string) || '';

            const audio = await resolveTrackAudioStream(title, artist, id);
      if (!audio || (!audio.playUrl && !audio.embedUrl)) {
        return res.status(404).json({ success: false, error: 'Spotify track playback info not found' });
      }
      res.json({ success: true, data: audio });
    } catch (err: any) {
      console.error('/api/stream/resolve error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Song Details with automatic audio hydration
  app.get('/api/songs/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const queryTitle = (req.query.title as string) || '';
      const queryArtist = (req.query.artist as string) || '';

      // If it is a YouTube track from Primary API
      if (id.startsWith('yt_') || id.startsWith('yt-')) {
        const ytId = id.replace(/^yt_|^yt-/, '');
        const track = await getPrimaryTrackDetails(ytId);
        const resolvedAudio = await resolveTrackAudioStream(queryTitle || track?.id || ytId, queryArtist, ytId);

        const song = formatPrimaryTrackToSong({
          id: `yt_${ytId}`,
          title: queryTitle || ytId,
          artist: queryArtist || 'YouTube Music',
          youtubeId: ytId,
          coverUrl: track?.coverUrl,
          streamUrl: track?.streamUrl,
          embedUrl: track?.embedUrl,
        }, resolvedAudio);

        return res.json({ success: true, data: song });
      }

            const song = await getSongById(id);


      if (!song) {
        return res.status(404).json({ success: false, error: 'Song not found' });
      }
      res.json({ success: true, data: song });
    } catch (err: any) {
      console.error('/api/songs/:id error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Song Suggestions / Radio
  app.get('/api/songs/:id/suggestions', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 15;
      const suggestions = await getSongSuggestions(req.params.id, limit);
      res.json({ success: true, data: suggestions });
    } catch (err: any) {
      console.error('/api/songs/:id/suggestions error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Playlist Details
  app.get('/api/playlists/:id', async (req, res) => {
    try {
      const playlist = await getPlaylistDetails(req.params.id);
      if (!playlist) {
        return res.status(404).json({ success: false, error: 'Playlist not found' });
      }
      res.json({ success: true, data: playlist });
    } catch (err: any) {
      console.error('/api/playlists/:id error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Album Details
  app.get('/api/albums/:id', async (req, res) => {
    try {
      const album = await getAlbumDetails(req.params.id);
      if (!album) {
        return res.status(404).json({ success: false, error: 'Album not found' });
      }
      res.json({ success: true, data: album });
    } catch (err: any) {
      console.error('/api/albums/:id error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Artist Details
  app.get('/api/artists/:id', async (req, res) => {
    try {
      const artist = await getArtistDetails(req.params.id);
      if (!artist) {
        return res.status(404).json({ success: false, error: 'Artist not found' });
      }
      res.json({ success: true, data: artist });
    } catch (err: any) {
      console.error('/api/artists/:id error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Lyrics
  app.get('/api/lyrics/:id', async (req, res) => {
    try {
      const songName = (req.query.songName as string) || '';
      const artistName = (req.query.artistName as string) || '';
      const duration = parseInt(req.query.duration as string, 10) || 0;
      const lyricsData = await getLyrics(req.params.id, songName, artistName, duration);
      res.json({ success: true, data: lyricsData });
    } catch (err: any) {
      console.error('/api/lyrics/:id error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Spotify Presets
  app.get('/api/spotify/presets', (req, res) => {
    const presets = [
      {
        id: 'today-top-hits',
        name: "Today's Top Hits",
        description: 'The hottest tracks right now across pop, EDM, and hip-hop.',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'bollywood-butter',
        name: 'Bollywood Butter',
        description: 'The finest Bollywood blockbusters, romantic hits and trending melodies.',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmZeMW',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'punjabi-101',
        name: 'Punjabi 101',
        description: 'Bhangra, high-octane hip-hop beats, and Punjabi chartbusters.',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DX5cZuAhlNjGz',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'lofi-beats',
        name: 'Lo-Fi Beats',
        description: 'Chill, smooth beats to study, work, or relax under liquid glass vibes.',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
        coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'night-drive',
        name: 'Night Drive Neon',
        description: 'Moody synthwave, deep house, and midnight chill for open road vibes.',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DXdOEFt9ZX0dh',
        coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'global-viral-50',
        name: 'Global Viral 50',
        description: 'The most viral songs taking over the world right now.',
        url: 'https://open.spotify.com/playlist/37i9dQZEVXbLiRSasKsNU9',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
      },
    ];
    res.json({ success: true, data: presets });
  });

  // Playlist Importer (Spotify & YouTube playlists)
  app.post(['/api/spotify/import', '/api/playlist/import'], async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'Playlist or track URL is required' });
      }

      const primaryImported = await importPrimaryPlaylist(url);
      if (!primaryImported) {
        return res.status(502).json({
          success: false,
          error: 'Spotify Primary API could not resolve this playlist. No alternate music provider is enabled.',
        });
      }
      res.json({ success: true, data: primaryImported });
    } catch (err: any) {
      console.error('/api/playlist/import error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI DJ & Smart Vibe Mix
  app.post('/api/ai/dj', async (req, res) => {
    try {
      const { prompt, currentSong } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Vibe prompt is required' });
      }

      const mix = await generateAIDJMix(prompt, currentSong);
      res.json({ success: true, data: mix });
    } catch (err: any) {
      console.error('/api/ai/dj error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Audio Stream Proxy. Playback uses this same-origin endpoint so the
  // browser can attach the stream to Web Audio without third-party CORS issues.
  app.get('/api/stream-proxy', async (req, res) => {
    try {
      const audioUrl = typeof req.query.url === 'string' ? req.query.url : '';
      if (!audioUrl) return res.status(400).send('Missing audio url');

      const parsedUrl = new URL(audioUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).send('Unsupported audio url');
      }

      const upstreamHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0',
      };
      if (req.headers.range) upstreamHeaders.Range = req.headers.range;

      const response = await fetch(parsedUrl, { headers: upstreamHeaders });
      res.status(response.status);

      response.headers.forEach((value, key) => {
        if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });
      if (!res.getHeader('accept-ranges')) res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      if (!response.body) return res.end();

      // Node 18+ exposes fetch response bodies as async iterables.
      for await (const chunk of response.body as any) {
        if (!res.write(chunk)) {
          await new Promise<void>((resolve) => res.once('drain', resolve));
        }
      }
      res.end();
    } catch (err: any) {
      if (!res.headersSent) res.status(502).send(`Audio proxy error: ${err.message}`);
      else res.end();
    }
  });

  return app;
}

export const app = createApp();

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);

  // Vite middleware in dev or static files in production.
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Soundbound Liquid audio server running on port ${PORT}`);
  });
}

// Vercel imports the exported Express app as a serverless function. Local
// development and the bundled Node server still use the long-running listener.
if (process.env.VERCEL !== '1') {
  void startServer();
}
