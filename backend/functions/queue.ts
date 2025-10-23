import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Queue management function
 * Handles adding songs to Spotify queue and searching for tracks
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, body } = event;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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

    // POST /api/queue - Add track to queue
    if (httpMethod === 'POST') {
      const { uri, query } = JSON.parse(body || '{}');

      let trackUri = uri;

      // If query is provided instead of URI, search for the track first
      if (!trackUri && query) {
        const searchResult = await searchTrack(query, accessToken);
        if (!searchResult) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'No track found for query' }),
          };
        }
        trackUri = searchResult.uri;
      }

      if (!trackUri) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Either uri or query must be provided' }),
        };
      }

      // Add to queue using Spotify API
      await axios.post(
        `${SPOTIFY_API_BASE}/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Track added to queue',
          uri: trackUri
        }),
      };
    }

    // GET /api/queue - Get current queue
    if (httpMethod === 'GET') {
      const queueResponse = await axios.get(`${SPOTIFY_API_BASE}/me/player/queue`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(queueResponse.data),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Queue error:', error.response?.data || error.message);

    // Handle specific Spotify errors
    if (error.response?.status === 404) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'No active device found. Please start playback on a Spotify device.'
        }),
      };
    }

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
 * Search for a track on Spotify
 * @param query - Search query string
 * @param accessToken - Spotify access token
 * @returns First matching track or null
 */
async function searchTrack(query: string, accessToken: string) {
  try {
    const searchResponse = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      params: {
        q: query,
        type: 'track',
        limit: 1,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tracks = searchResponse.data.tracks.items;
    if (tracks.length === 0) {
      return null;
    }

    return tracks[0];
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}
