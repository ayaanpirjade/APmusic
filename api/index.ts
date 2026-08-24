import type { Request, Response } from 'express';
import express from 'express';
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
} from '../server/saavnService.js';
import { parseSpotifyUrl } from '../server/spotifyService.js';
import { generateAIDJMix } from '../server/aiService.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Soundbound Liquid Audio Core (Vercel Serverless)',
    timestamp: new Date().toISOString(),
  });
});

// Home Modules
app.get('/api/modules', async (req, res) => {
  try {
    const languages = (req.query.language as string) || 'hindi,english,punjabi';
    const data = await getHomeModules(languages);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Search Songs
app.get('/api/search/songs', async (req, res) => {
  try {
    const query = (req.query.query as string) || '';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    if (!query.trim()) {
      return res.json({ success: true, data: { results: [], total: 0 } });
    }

    const results = await searchSongs(query, page, limit);
    res.json({
      success: true,
      data: { results, total: results.length, page },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Search All
app.get('/api/search/all', async (req, res) => {
  try {
    const query = (req.query.query as string) || '';
    if (!query.trim()) {
      return res.json({ success: true, data: { songs: [], albums: [], playlists: [], artists: [] } });
    }
    const data = await searchAll(query);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Song Details
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) return res.status(404).json({ success: false, error: 'Song not found' });
    res.json({ success: true, data: song });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Suggestions
app.get('/api/songs/:id/suggestions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 15;
    const suggestions = await getSongSuggestions(req.params.id, limit);
    res.json({ success: true, data: suggestions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Playlist Details
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await getPlaylistDetails(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, error: 'Playlist not found' });
    res.json({ success: true, data: playlist });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Album Details
app.get('/api/albums/:id', async (req, res) => {
  try {
    const album = await getAlbumDetails(req.params.id);
    if (!album) return res.status(404).json({ success: false, error: 'Album not found' });
    res.json({ success: true, data: album });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Artist Details
app.get('/api/artists/:id', async (req, res) => {
  try {
    const artist = await getArtistDetails(req.params.id);
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' });
    res.json({ success: true, data: artist });
  } catch (err: any) {
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Spotify Presets
app.get('/api/spotify/presets', (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
  });
});

// Spotify Import
app.post('/api/spotify/import', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Spotify URL is required' });
    const importedData = await parseSpotifyUrl(url);
    if (!importedData) return res.status(400).json({ success: false, error: 'Could not resolve Spotify URL' });
    res.json({ success: true, data: importedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI DJ
app.post('/api/ai/dj', async (req, res) => {
  try {
    const { prompt, currentSong } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'Vibe prompt is required' });
    const mix = await generateAIDJMix(prompt, currentSong);
    res.json({ success: true, data: mix });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
