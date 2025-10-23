import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, AutoAwesome } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const MOOD_OPTIONS = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Focus'];
const GENRE_OPTIONS = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B'];
const TIME_PERIOD_OPTIONS = ['2020s', '2010s', '2000s', '90s', '80s', '70s'];

export const PlaylistGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!mood && !genre && !description) {
      setError('Please select at least one option or provide a description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const params: any = {
        limit: 20,
      };

      if (mood) params.mood = mood;
      if (genre) params.genre = genre;
      if (timePeriod) params.timeperiod = timePeriod;
      if (description) params.description = description;

      const data = await apiService.generatePlaylist(params);
      setResult(data);
    } catch (err: any) {
      console.error('Playlist generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate playlist');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setMood('');
    setGenre('');
    setTimePeriod('');
    setDescription('');
    setResult(null);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 700 }}>
            AI Playlist Generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AutoAwesome sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Create Your Perfect Playlist
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select your preferences or describe the vibe you're looking for
            </Typography>

            {/* Mood Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Mood
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {MOOD_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => setMood(option === mood ? '' : option)}
                    color={mood === option ? 'primary' : 'default'}
                    variant={mood === option ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.9rem' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Genre Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Genre
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {GENRE_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => setGenre(option === genre ? '' : option)}
                    color={genre === option ? 'primary' : 'default'}
                    variant={genre === option ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.9rem' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Time Period Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Time Period
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TIME_PERIOD_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => setTimePeriod(option === timePeriod ? '' : option)}
                    color={timePeriod === option ? 'primary' : 'default'}
                    variant={timePeriod === option ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.9rem' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Custom Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Or describe what you want
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., 'Upbeat songs for a workout' or 'Relaxing music for studying'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
              />
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
                onClick={handleGenerate}
                disabled={isGenerating}
                fullWidth
              >
                {isGenerating ? 'Generating...' : 'Generate Playlist'}
              </Button>
              <Button variant="outlined" size="large" onClick={handleClear}>
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                {result.playlist?.name || 'Your Generated Playlist'}
              </Typography>

              {result.playlist?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {result.playlist.description}
                </Typography>
              )}

              <Stack spacing={2}>
                {result.tracks?.map((track: any, index: number) => (
                  <Card key={track.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{ mr: 2, color: 'text.secondary', minWidth: 30 }}
                      >
                        {index + 1}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {track.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {track.artists?.map((a: any) => a.name).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>

              {result.playlist?.external_urls?.spotify && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  href={result.playlist.external_urls.spotify}
                  target="_blank"
                >
                  Open in Spotify
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};
