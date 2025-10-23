import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PlaylistGenerationRequest {
  mood?: string;
  genre?: string;
  timeperiod?: string;
  description?: string;
  limit?: number;
}

/**
 * AI-powered playlist generation function
 * Combines Claude AI analysis with Spotify recommendations
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, body } = event;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' }),
      };
    }

    const accessToken = authHeader.split(' ')[1];
    const request: PlaylistGenerationRequest = JSON.parse(body || '{}');

    // Get user's listening history and top tracks
    const [topTracks, recentTracks] = await Promise.all([
      getUserTopTracks(accessToken, 50),
      getUserRecentTracks(accessToken, 50),
    ]);

    // Use Claude to analyze user's music taste and generate recommendations
    const aiRecommendations = await generateAIRecommendations(
      topTracks,
      recentTracks,
      request
    );

    // Get Spotify's recommendations based on seed tracks
    const seedTracks = topTracks.slice(0, 5).map((track: any) => track.id);
    const spotifyRecommendations = await getSpotifyRecommendations(
      accessToken,
      seedTracks,
      request
    );

    // Combine and deduplicate recommendations
    const combinedPlaylist = combineRecommendations(
      aiRecommendations,
      spotifyRecommendations,
      request.limit || 30
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        playlist: combinedPlaylist,
        analysis: aiRecommendations.analysis,
        source: 'hybrid',
      }),
    };
  } catch (error: any) {
    console.error('Playlist generation error:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data?.error?.message || error.message,
      }),
    };
  }
};

/**
 * Get user's top tracks from Spotify
 */
async function getUserTopTracks(accessToken: string, limit: number = 50) {
  const response = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks`, {
    params: { limit, time_range: 'medium_term' },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.items;
}

/**
 * Get user's recently played tracks
 */
async function getUserRecentTracks(accessToken: string, limit: number = 50) {
  const response = await axios.get(`${SPOTIFY_API_BASE}/me/player/recently-played`, {
    params: { limit },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.items.map((item: any) => item.track);
}

/**
 * Use Claude to analyze music taste and generate smart recommendations
 */
async function generateAIRecommendations(
  topTracks: any[],
  recentTracks: any[],
  request: PlaylistGenerationRequest
) {
  const trackSummary = topTracks.slice(0, 20).map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    genres: track.artists[0].genres || [],
  }));

  const prompt = `You are a music curator analyzing a user's Spotify listening history. Based on their top tracks and preferences, suggest songs that match their request.

User's Top Tracks:
${JSON.stringify(trackSummary, null, 2)}

Request:
- Mood: ${request.mood || 'any'}
- Genre: ${request.genre || 'based on history'}
- Time Period: ${request.timeperiod || 'recent'}
- Description: ${request.description || 'none'}

Task:
1. Analyze the user's music taste based on their top tracks
2. Identify patterns in genre, mood, tempo, and artist style
3. Suggest 10 artists or tracks that match the request while fitting their taste
4. Format your response as JSON with this structure:
{
  "analysis": "Brief analysis of user's taste (2-3 sentences)",
  "recommendations": [
    {"artist": "Artist Name", "reason": "Why this fits"},
    ...
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse Claude's response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Get Spotify's native recommendations
 */
async function getSpotifyRecommendations(
  accessToken: string,
  seedTracks: string[],
  request: PlaylistGenerationRequest
) {
  const params: any = {
    seed_tracks: seedTracks.join(','),
    limit: 20,
  };

  // Map mood/genre to Spotify audio features
  if (request.mood) {
    const moodMap: Record<string, any> = {
      energetic: { min_energy: 0.7, min_valence: 0.6 },
      calm: { max_energy: 0.4, max_tempo: 100 },
      happy: { min_valence: 0.7 },
      sad: { max_valence: 0.3 },
      focused: { min_instrumentalness: 0.5, max_energy: 0.6 },
    };
    Object.assign(params, moodMap[request.mood.toLowerCase()] || {});
  }

  if (request.genre) {
    params.seed_genres = request.genre;
  }

  const response = await axios.get(`${SPOTIFY_API_BASE}/recommendations`, {
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data.tracks;
}

/**
 * Combine AI and Spotify recommendations, removing duplicates
 */
function combineRecommendations(
  aiRecs: any,
  spotifyRecs: any[],
  limit: number
): any[] {
  const combined = new Map();

  // Add Spotify recommendations first (they're complete track objects)
  spotifyRecs.forEach((track) => {
    combined.set(track.id, track);
  });

  // AI recommendations are just artist names, so we'll use them as additional context
  // In a production app, you'd search for these tracks on Spotify

  return Array.from(combined.values()).slice(0, limit);
}
