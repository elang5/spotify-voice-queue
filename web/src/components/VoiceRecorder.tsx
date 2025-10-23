import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Mic, MicOff, Clear } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import voiceService from '../services/voiceService';
import apiService from '../services/api';

const VoiceButton = styled(IconButton)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
  '&.recording': {
    animation: 'pulse 1.5s infinite',
    backgroundColor: theme.palette.error.main,
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(229, 33, 52, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 20px rgba(229, 33, 52, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(229, 33, 52, 0)',
    },
  },
  transition: 'all 0.3s ease',
}));

interface VoiceRecorderProps {
  onCommandProcessed?: (query: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onCommandProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    // Auto-process command when user stops speaking
    if (!listening && transcript && !isProcessing) {
      processVoiceCommand(transcript);
    }
  }, [listening, transcript]);

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);

    try {
      const parsed = voiceService.parseVoiceCommand(command);

      if (!parsed) {
        setSnackbar({
          open: true,
          message: `Couldn't understand: "${command}". Try saying "Play [song name]"`,
          severity: 'error',
        });
        setIsProcessing(false);
        return;
      }

      if (parsed.action === 'queue') {
        setSnackbar({
          open: true,
          message: `Adding "${parsed.query}" to queue...`,
          severity: 'info',
        });

        const result = await apiService.addToQueue(parsed.query);

        setSnackbar({
          open: true,
          message: `Added "${result.track?.name || parsed.query}" to queue!`,
          severity: 'success',
        });

        if (onCommandProcessed) {
          onCommandProcessed(parsed.query);
        }
      }
    } catch (error: any) {
      console.error('Voice command error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add song to queue',
        severity: 'error',
      });
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  const handleStartListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleClear = () => {
    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Speech Recognition Not Supported
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please use Chrome, Edge, or Safari for voice commands.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 4,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <VoiceButton
            onClick={listening ? handleStopListening : handleStartListening}
            disabled={isProcessing}
            className={listening ? 'recording' : ''}
          >
            {isProcessing ? (
              <CircularProgress size={40} sx={{ color: 'white' }} />
            ) : listening ? (
              <MicOff sx={{ fontSize: 40 }} />
            ) : (
              <Mic sx={{ fontSize: 40 }} />
            )}
          </VoiceButton>
        </Box>

        <Typography variant="h6" gutterBottom>
          {listening ? 'Listening...' : 'Tap to speak'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Say "Play [song name]" or "Add [song name] to queue"
        </Typography>

        {transcript && (
          <Box sx={{ mt: 3 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderLeft: 4,
                borderColor: listening ? 'error.main' : 'primary.main',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ flex: 1, textAlign: 'left' }}>
                  {transcript}
                </Typography>
                <IconButton size="small" onClick={handleClear}>
                  <Clear fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
