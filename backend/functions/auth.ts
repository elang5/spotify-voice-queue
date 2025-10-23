import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://127.0.0.1:8888/api/callback';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Required scopes for queue management and playlist access
const SCOPES = [
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read',
].join(' ');

/**
 * Initiates Spotify OAuth flow
 * GET /api/auth
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, path } = event;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Login endpoint - redirect to Spotify
    if (path.includes('/auth/login')) {
      const state = generateRandomString(16);
      const authUrl = `${SPOTIFY_AUTH_URL}?${new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID!,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state,
      })}`;

      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: authUrl,
        },
        body: '',
      };
    }

    // Callback endpoint - exchange code for token
    if (path.includes('/auth/callback') || path.includes('/callback')) {
      const code = event.queryStringParameters?.code;
      const state = event.queryStringParameters?.state;

      if (!code) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No authorization code provided' }),
        };
      }

      // Exchange code for access token
      const tokenResponse = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Redirect back to the mobile app with tokens
      const redirectUrl = `spotifyvoicequeue://callback?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;

      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: redirectUrl,
        },
        body: '',
      };
    }

    // Refresh token endpoint
    if (path.includes('/auth/refresh')) {
      const refresh_token = event.queryStringParameters?.refresh_token;

      if (!refresh_token) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No refresh token provided' }),
        };
      }

      const tokenResponse = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );

      const { access_token, expires_in } = tokenResponse.data;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          access_token,
          expires_in,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error: any) {
    console.error('Auth error:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data || error.message,
      }),
    };
  }
};

/**
 * Generates a random string for state parameter
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}
