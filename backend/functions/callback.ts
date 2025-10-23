import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://127.0.0.1:8888/.netlify/functions/callback';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Handles Spotify OAuth callback
 * GET /.netlify/functions/callback
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod } = event;

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
  } catch (error: any) {
    console.error('Callback error:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data || error.message,
      }),
    };
  }
};
