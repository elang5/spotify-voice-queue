import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import { Logout, QueueMusic, PlaylistPlay } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { VoiceRecorder } from '../components/VoiceRecorder';
import apiService from '../services/api';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
}

export const Home: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
    loadCurrentlyPlaying();
    loadQueue();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      loadCurrentlyPlaying();
      loadQueue();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadCurrentlyPlaying = async () => {
    try {
      const data = await apiService.getCurrentlyPlaying();
      if (data?.item) {
        setCurrentTrack(data.item);
      }
    } catch (error) {
      console.error('Failed to load currently playing:', error);
    }
  };

  const loadQueue = async () => {
    try {
      const data = await apiService.getCurrentQueue();
      if (data?.queue) {
        setQueue(data.queue);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  const handleCommandProcessed = () => {
    // Refresh queue after voice command
    setTimeout(loadQueue, 1000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Spotify Voice Queue
          </Typography>

          {userProfile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Avatar src={userProfile.images?.[0]?.url} alt={userProfile.display_name}>
                {userProfile.display_name?.[0]}
              </Avatar>
              <Typography variant="body2">{userProfile.display_name}</Typography>
            </Box>
          )}

          <Button
            startIcon={<PlaylistPlay />}
            onClick={() => navigate('/playlist')}
            sx={{ mr: 2 }}
          >
            Playlists
          </Button>

          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Currently Playing */}
        {currentTrack && (
          <Card sx={{ mb: 4, display: 'flex', p: 2 }}>
            <CardMedia
              component="img"
              sx={{ width: 100, height: 100, borderRadius: 2 }}
              image={currentTrack.album.images[0]?.url}
              alt={currentTrack.name}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, flex: 1 }}>
              <CardContent sx={{ flex: '1 0 auto', p: 0 }}>
                <Typography variant="overline" color="text.secondary">
                  Now Playing
                </Typography>
                <Typography component="div" variant="h5" sx={{ fontWeight: 700 }}>
                  {currentTrack.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {currentTrack.artists.map((a) => a.name).join(', ')}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        )}

        {/* Voice Recorder */}
        <Box sx={{ mb: 4 }}>
          <VoiceRecorder onCommandProcessed={handleCommandProcessed} />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Queue */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <QueueMusic sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Your Queue
            </Typography>
          </Box>

          {queue.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Your queue is empty. Use voice commands to add songs!
              </Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {queue.map((track, index) => (
                <Card key={track.id + index} sx={{ display: 'flex', p: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 60, height: 60, borderRadius: 1 }}
                    image={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.name}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {track.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {track.artists.map((a) => a.name).join(', ')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    #{index + 1}
                  </Typography>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};
