import { GoogleGenAI } from '@google/genai';
import { searchPrimarySongs, SpotifySong } from './primaryMusicService.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

export interface AIDJMixResponse {
  vibeTitle: string;
  vibeDescription: string;
  tags: string[];
  djIntro: string;
  songs: SpotifySong[];
}

export async function generateAIDJMix(prompt: string, currentSongName?: string): Promise<AIDJMixResponse> {
  const genAI = getGenAI();

  let trackQueries: string[] = [];
  let vibeTitle = 'AI Liquid Vibe Mix';
  let vibeDescription = 'Curated soundscape matching your unique mood';
  let djIntro = 'Welcome to your personalized Liquid DJ session. Relax, immerse yourself in the sound waves.';
  let tags = ['Chill', 'Flow', 'Dynamic'];

  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an expert music DJ and curator for a high-end liquid glass lossless music player app called APMUSIC.
The user requested this music vibe: "${prompt}" ${currentSongName ? `(currently listening to: "${currentSongName}")` : ''}.

Generate a curated set of 8 distinct song search queries (popular Hindi, Punjabi, Bollywood, or Global Pop/EDM tracks) that perfectly fit this vibe.
Also provide a stylish vibeTitle, a poetic short vibeDescription (1 sentence), a short DJ spoken intro script (1-2 sentences), and 3 short genre tags.

Return ONLY a valid JSON object matching this schema:
{
  "vibeTitle": "string",
  "vibeDescription": "string",
  "djIntro": "string",
  "tags": ["tag1", "tag2", "tag3"],
  "queries": ["Artist Name - Song Name", "Song Name 2", ...]
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      vibeTitle = parsed.vibeTitle || vibeTitle;
      vibeDescription = parsed.vibeDescription || vibeDescription;
      djIntro = parsed.djIntro || djIntro;
      tags = Array.isArray(parsed.tags) ? parsed.tags : tags;
      trackQueries = Array.isArray(parsed.queries) ? parsed.queries : [];
    } catch (err) {
      console.error('Gemini generation error in AIDJ:', err);
    }
  }

  // Fallback queries if Gemini wasn't available or returned empty
  if (trackQueries.length === 0) {
    const lower = prompt.toLowerCase();
    if (lower.includes('workout') || lower.includes('gym') || lower.includes('energy')) {
      vibeTitle = 'High Octane Surge';
      vibeDescription = 'Heavy beats, punchy synths, and relentless momentum.';
      djIntro = 'Lock in. Your heart rate is about to peak with this high-energy selection.';
      tags = ['Gym', 'Phonk', 'Motivation'];
      trackQueries = ['Believer Imagine Dragons', 'Kahani Suno 2.0', 'Amplifier Imran Khan', 'Starboy The Weeknd', 'Mi Amor Sharn', 'Industry Baby Lil Nas X', 'Brown Munde AP Dhillon', 'G.O.A.T Diljit Dosanjh'];
    } else if (lower.includes('night') || lower.includes('drive') || lower.includes('late')) {
      vibeTitle = 'Midnight Neon Drive';
      vibeDescription = 'Moody basslines and atmospheric synthscapes under city streetlights.';
      djIntro = 'Window down, empty highways ahead. Let the liquid audio guide your ride.';
      tags = ['Synthwave', 'Midnight', 'Atmospheric'];
      trackQueries = ['Blinding Lights The Weeknd', 'Apna Bana Le', 'After Dark Mr Kitty', 'Pasoori Ali Sethi', 'Tu Hai Kahan AUR', 'Night Changes One Direction', 'I Wanna Be Yours Arctic Monkeys', 'Softly Karan Aujla'];
    } else if (lower.includes('sad') || lower.includes('heartbreak') || lower.includes('alone')) {
      vibeTitle = 'Deep Melancholy & Rain';
      vibeDescription = 'Acoustic warmth, delicate piano cords, and healing vocals.';
      djIntro = 'Let the music hold your thoughts tonight. Every chord is here for you.';
      tags = ['Acoustic', 'Soulful', 'Healing'];
      trackQueries = ['Channa Mereya Arijit Singh', 'Let Her Go Passenger', 'Kabira Tochi Raina', 'Someone You Loved Lewis Capaldi', 'O Maahi Arijit Singh', 'Glimpse of Us Joji', 'Ae Dil Hai Mushkil', 'Until I Found You Stephen Sanchez'];
    } else if (lower.includes('party') || lower.includes('dance') || lower.includes('club')) {
      vibeTitle = 'Club Glass Velocity';
      vibeDescription = 'Explosive drops, bass rhythms, and unforgettable club anthems.';
      djIntro = 'Turn up the gain. The liquid dancefloor is live and moving.';
      tags = ['Club', 'EDM', 'Party'];
      trackQueries = ['Tauba Tauba Karan Aujla', 'Lean On Major Lazer', 'Kar Gayi Chull Badshah', 'One Kiss Dua Lipa', 'Kala Chashma Badshah', 'Titanium David Guetta', 'Lover Diljit Dosanjh', 'Wake Me Up Avicii'];
    } else {
      vibeTitle = `Vibe: ${prompt.slice(0, 24)}`;
      vibeDescription = 'Intelligent sonic flow curated specifically for your session.';
      djIntro = 'Playing the perfect frequency for your groove right now.';
      tags = ['Curated', 'Liquid', 'Ambient'];
      trackQueries = ['Kesariya Arijit Singh', 'Lover Diljit Dosanjh', 'Husn Anuv Jain', 'Starboy The Weeknd', 'Heeriye Jasleen Royal', 'As It Was Harry Styles', 'Maan Meri Jaan King', 'Winning Speech Karan Aujla'];
    }
  }

  // Resolve song queries to actual playable tracks
  const resolvedSongs: SpotifySong[] = [];
  for (const q of trackQueries.slice(0, 10)) {
    try {
      const results = await searchPrimarySongs(q, 2);
      if (results && results.length > 0) {
        resolvedSongs.push(results[0]);
      }
    } catch (_) {}
  }

  return {
    vibeTitle,
    vibeDescription,
    tags,
    djIntro,
    songs: resolvedSongs,
  };
}

export async function generateAILyrics(
  songName: string,
  artistName?: string,
  durationSeconds?: number
): Promise<{
  lyrics: string;
  syncedLyrics?: Array<{ time: number; text: string }>;
} | null> {
  const genAI = getGenAI();
  if (!genAI || !songName) return null;

  try {
    const dur = durationSeconds && durationSeconds > 0 ? durationSeconds : 180;
    const response = await genAI.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are an accurate song lyrics engine for a music streaming application.
Provide accurate lyrics for the song: "${songName}" by "${artistName || 'Unknown Artist'}".
Duration: approx ${dur} seconds.

Guidelines:
1. Provide the complete lyrics accurately. If the song is in Hindi, Punjabi, or another language, provide the lyrics in Romanized English script (or original script + Romanized English if standard).
2. Generate time-synchronized lyric lines (LRC format timestamps [mm:ss.xx] or seconds) distributed naturally across the song duration (starting around 10-15 seconds).
3. Provide the full lyrics as a clean multiline string in "lyrics", and line-by-line synced objects in "syncedLyrics".

Return strictly JSON matching:
{
  "lyrics": "line 1\\nline 2\\nline 3...",
  "syncedLyrics": [
    { "time": 12.5, "text": "Line 1 text" },
    { "time": 18.0, "text": "Line 2 text" }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (parsed && (parsed.lyrics || (parsed.syncedLyrics && parsed.syncedLyrics.length > 0))) {
      return {
        lyrics: parsed.lyrics || (parsed.syncedLyrics || []).map((s: any) => s.text).join('\n'),
        syncedLyrics: Array.isArray(parsed.syncedLyrics) && parsed.syncedLyrics.length > 0
          ? parsed.syncedLyrics.map((item: any) => ({
              time: Number(item.time) || 0,
              text: String(item.text || '').trim(),
            })).filter((item: any) => item.text.length > 0)
          : undefined,
      };
    }
  } catch (err) {
    console.warn('generateAILyrics error:', err);
  }
  return null;
}
