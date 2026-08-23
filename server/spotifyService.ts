import { searchSongs, SaavnSong, formatImageUrls } from './saavnService.js';

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artist: string;
  durationMs: number;
  album: string;
  coverUrl?: string;
  matchedSong?: SaavnSong;
}

export interface SpotifyPlaylistResult {
  id: string;
  title: string;
  description: string;
  owner: string;
  coverImage: string;
  totalTracks: number;
  tracks: SpotifyTrackItem[];
  resolvedSongs: SaavnSong[];
}

export async function parseSpotifyUrl(inputUrl: string): Promise<SpotifyPlaylistResult | null> {
  try {
    let playlistId = '';
    let isAlbum = false;
    let isTrack = false;

    if (inputUrl.includes('spotify.com/playlist/')) {
      const match = inputUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      playlistId = match ? match[1] : '';
    } else if (inputUrl.includes('spotify.com/album/')) {
      const match = inputUrl.match(/album\/([a-zA-Z0-9]+)/);
      playlistId = match ? match[1] : '';
      isAlbum = true;
    } else if (inputUrl.includes('spotify.com/track/')) {
      const match = inputUrl.match(/track\/([a-zA-Z0-9]+)/);
      playlistId = match ? match[1] : '';
      isTrack = true;
    } else {
      // Clean string input
      playlistId = inputUrl.trim();
    }

    if (!playlistId) return null;

    const entityType = isAlbum ? 'album' : isTrack ? 'track' : 'playlist';
    const embedUrl = `https://open.spotify.com/embed/${entityType}/${playlistId}`;

    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Spotify embed page: ${res.status}`);
    }

    const html = await res.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

    let title = 'Imported Spotify Playlist';
    let description = 'Imported via Spotify Link';
    let owner = 'Spotify User';
    let coverImage = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80';
    const rawTrackList: Array<{ title: string; subtitle: string; duration: number }> = [];

    if (nextDataMatch) {
      try {
        const parsed = JSON.parse(nextDataMatch[1]);
        const entity = parsed.props?.pageProps?.state?.data?.entity;
        if (entity) {
          title = entity.name || entity.title || title;
          description = entity.subtitle || entity.description || description;
          owner = entity.subtitle || 'Spotify';
          if (entity.coverArt?.sources && entity.coverArt.sources.length > 0) {
            coverImage = entity.coverArt.sources[0].url;
          }
          if (Array.isArray(entity.trackList)) {
            for (const t of entity.trackList) {
              rawTrackList.push({
                title: t.title || t.name || '',
                subtitle: t.subtitle || t.artists || '',
                duration: Number(t.duration || 0),
              });
            }
          }
        }
      } catch (err) {
        console.error('Error parsing Spotify NEXT_DATA:', err);
      }
    }

    // If no tracks extracted from NEXT_DATA, fallback to oEmbed + title extraction
    if (rawTrackList.length === 0) {
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(inputUrl)}`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          title = oembedData.title || title;
          coverImage = oembedData.thumbnail_url || coverImage;
          owner = oembedData.author_name || owner;
        }
      } catch (_) {}
    }

    // Now resolve each track to real high-bitrate playable Saavn songs
    const tracks: SpotifyTrackItem[] = [];
    const resolvedSongs: SaavnSong[] = [];

    // Process first 30 tracks concurrently in small chunks to avoid throttling
    const chunkLimit = Math.min(rawTrackList.length, 40);
    const selectedTracks = rawTrackList.slice(0, chunkLimit);

    const matchPromises = selectedTracks.map(async (raw, idx) => {
      const searchTerms = `${raw.title} ${raw.subtitle}`.trim();
      const results = await searchSongs(searchTerms, 1, 3);
      let matched: SaavnSong | undefined;

      if (results && results.length > 0) {
        matched = results[0];
      } else {
        // Try searching just track title
        const fallbackResults = await searchSongs(raw.title, 1, 2);
        matched = fallbackResults[0];
      }

      const item: SpotifyTrackItem = {
        id: `sp-track-${idx}-${Date.now()}`,
        name: raw.title,
        artist: raw.subtitle,
        durationMs: raw.duration,
        album: title,
        coverUrl: coverImage,
        matchedSong: matched,
      };

      return { item, matched };
    });

    const settled = await Promise.allSettled(matchPromises);
    for (const res of settled) {
      if (res.status === 'fulfilled') {
        tracks.push(res.value.item);
        if (res.value.matched) {
          resolvedSongs.push(res.value.matched);
        }
      }
    }

    return {
      id: `spotify-${playlistId}`,
      title,
      description,
      owner,
      coverImage,
      totalTracks: tracks.length,
      tracks,
      resolvedSongs,
    };
  } catch (err) {
    console.error('Spotify parse error:', err);
    return null;
  }
}
