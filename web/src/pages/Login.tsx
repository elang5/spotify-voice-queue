import React from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { Mic, QueueMusic, PlayCircle } from '@mui/icons-material';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
  padding: theme.spacing(2),
}));

const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <GradientBackground>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              mb: 2,
              color: 'white',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            Spotify Voice Queue
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              fontWeight: 400,
            }}
          >
            Control your music with your voice
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={login}
            disabled={isLoading}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.1rem',
              bgcolor: 'white',
              color: 'black',
              '&:hover': {
                bgcolor: '#1DB954',
                color: 'white',
              },
            }}
          >
            {isLoading ? 'Connecting...' : 'Login with Spotify'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 6,
          }}
        >
          <FeatureBox elevation={0}>
            <Mic sx={{ fontSize: 48, color: '#1DB954', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Voice Control
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Simply speak to add songs to your queue
            </Typography>
          </FeatureBox>

          <FeatureBox elevation={0}>
            <QueueMusic sx={{ fontSize: 48, color: '#1DB954', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Smart Queue
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Manage your playback queue effortlessly
            </Typography>
          </FeatureBox>

          <FeatureBox elevation={0}>
            <PlayCircle sx={{ fontSize: 48, color: '#1DB954', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              AI Playlists
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Generate playlists based on your mood
            </Typography>
          </FeatureBox>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 6,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          Requires Spotify Premium for full functionality
        </Typography>
      </Container>
    </GradientBackground>
  );
};
