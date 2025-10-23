import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888/api';

class ApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            const config = error.config;
            config.headers.Authorization = `Bearer ${this.accessToken}`;
            return axios(config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    this.accessToken = await AsyncStorage.getItem('spotify_access_token');
    return this.accessToken;
  }

  /**
   * Set access token in memory and storage
   */
  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
    await AsyncStorage.setItem('spotify_access_token', token);
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('spotify_refresh_token');
      if (!refreshToken) return false;

      const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
        params: { refresh_token: refreshToken },
      });

      const { access_token } = response.data;
      await this.setAccessToken(access_token);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  /**
   * Authentication - handled via OAuth flow
   */
  async saveAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem('spotify_access_token', accessToken);
    await AsyncStorage.setItem('spotify_refresh_token', refreshToken);
    this.accessToken = accessToken;
  }

  /**
   * Clear authentication tokens
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('spotify_access_token');
    await AsyncStorage.removeItem('spotify_refresh_token');
    this.accessToken = null;
  }

  /**
   * Queue Management
   */
  async addToQueue(query: string): Promise<any> {
    const response = await this.client.post('/queue', { query });
    return response.data;
  }

  async addToQueueByUri(uri: string): Promise<any> {
    const response = await this.client.post('/queue', { uri });
    return response.data;
  }

  async getCurrentQueue(): Promise<any> {
    const response = await this.client.get('/queue');
    return response.data;
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 10): Promise<any> {
    const token = await this.getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: 'track',
        limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.tracks.items;
  }

  /**
   * Playlist Generation
   */
  async generatePlaylist(params: {
    mood?: string;
    genre?: string;
    timeperiod?: string;
    description?: string;
    limit?: number;
  }): Promise<any> {
    const response = await this.client.post('/playlists', params);
    return response.data;
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(): Promise<any> {
    const token = await this.getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.items;
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying(): Promise<any> {
    const token = await this.getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export default new ApiService();
