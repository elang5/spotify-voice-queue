import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  Card,
  FAB,
  Searchbar,
  List,
  ActivityIndicator,
  Chip,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import voiceService from '../services/voiceService';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  uri: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [currentQueue, setCurrentQueue] = useState<Track[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  useEffect(() => {
    loadCurrentQueue();
    loadNowPlaying();

    // Poll for now playing updates every 5 seconds
    const interval = setInterval(() => {
      loadNowPlaying();
      loadCurrentQueue();
    }, 5000);

    // Set header buttons
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="playlist-music"
            iconColor="#1DB954"
            onPress={() => navigation.navigate('PlaylistGenerator')}
          />
          <IconButton
            icon="logout"
            iconColor="#1DB954"
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', onPress: logout, style: 'destructive' },
                ]
              );
            }}
          />
        </View>
      ),
    });

    return () => {
      clearInterval(interval);
      voiceService.destroy();
    };
  }, [navigation]);

  const loadCurrentQueue = async () => {
    try {
      const queue = await apiService.getCurrentQueue();
      setCurrentQueue(queue.queue || []);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  const loadNowPlaying = async () => {
    try {
      const playing = await apiService.getCurrentlyPlaying();
      if (playing?.item) {
        setNowPlaying(playing.item);
      }
    } catch (error) {
      console.error('Failed to load now playing:', error);
    }
  };

  // Real-time search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await apiService.searchTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search for tracks');
    } finally {
      setIsLoading(false);
    }
  };

  const addToQueue = async (track: Track) => {
    try {
      await apiService.addToQueueByUri(track.uri);
      Alert.alert('Success', `Added "${track.name}" to queue`);
      await loadCurrentQueue();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      console.error('Failed to add to queue:', error);
      Alert.alert(
        'Queue Error',
        error.response?.data?.error || 'Failed to add track to queue'
      );
    }
  };

  const handleVoiceCommand = async () => {
    if (isVoiceActive) {
      await voiceService.stopListening();
      setIsVoiceActive(false);
      setVoiceCommand('');
      return;
    }

    try {
      setIsVoiceActive(true);
      setVoiceCommand('Listening...');

      await voiceService.startListening(
        async (results) => {
          const command = results[0];
          setVoiceCommand(command);

          // Parse and execute command
          const parsed = voiceService.parseVoiceCommand(command);
          if (parsed && parsed.action === 'queue') {
            try {
              setIsLoading(true);
              await apiService.addToQueue(parsed.query);
              Alert.alert('Success', `Added "${parsed.query}" to queue`);
              await loadCurrentQueue();
            } catch (error) {
              Alert.alert('Error', 'Failed to add song to queue');
            } finally {
              setIsLoading(false);
            }
          } else {
            Alert.alert('Unknown Command', 'Try saying "Add [song name] to queue"');
          }

          setIsVoiceActive(false);
          setVoiceCommand('');
        },
        (error) => {
          console.error('Voice error:', error);
          Alert.alert('Voice Error', 'Failed to recognize speech');
          setIsVoiceActive(false);
          setVoiceCommand('');
        }
      );
    } catch (error) {
      console.error('Voice command failed:', error);
      Alert.alert('Voice Error', 'Failed to start voice recognition');
      setIsVoiceActive(false);
      setVoiceCommand('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Spotify Voice Queue
          </Text>
        </View>

        {/* Voice Status */}
        {voiceCommand && (
          <Chip
            icon={isVoiceActive ? 'microphone' : 'check'}
            style={styles.voiceChip}
          >
            {voiceCommand}
          </Chip>
        )}

        {/* Now Playing */}
        {nowPlaying && (
          <Card style={styles.nowPlayingCard}>
            <Card.Title
              title="Now Playing"
              subtitle={`${nowPlaying.name} - ${nowPlaying.artists[0].name}`}
              left={(props) => <List.Icon {...props} icon="music" />}
            />
          </Card>
        )}

        {/* Search */}
        <Searchbar
          placeholder="Search for a song..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Search Results */}
        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : searchResults.length > 0 ? (
          <Card style={styles.resultsCard}>
            <Card.Title title="Search Results" />
            <Card.Content>
              {searchResults.map((track) => (
                <List.Item
                  key={track.id}
                  title={track.name}
                  description={`${track.artists[0].name} - ${track.album.name}`}
                  left={(props) => <List.Icon {...props} icon="music-note" />}
                  right={(props) => (
                    <Button onPress={() => addToQueue(track)}>Add</Button>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        ) : null}

        {/* Current Queue */}
        {currentQueue.length > 0 && (
          <Card style={styles.queueCard}>
            <Card.Title title="Current Queue" />
            <Card.Content>
              {currentQueue.map((track, index) => (
                <List.Item
                  key={`${track.id}-${index}`}
                  title={track.name}
                  description={track.artists[0].name}
                  left={(props) => (
                    <Text style={styles.queueNumber}>{index + 1}</Text>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Voice FAB */}
      <FAB
        icon={isVoiceActive ? 'stop' : 'microphone'}
        style={[styles.fab, isVoiceActive && styles.fabActive]}
        onPress={handleVoiceCommand}
        label={isVoiceActive ? 'Stop' : 'Voice'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  voiceChip: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  nowPlayingCard: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  loader: {
    marginVertical: 20,
  },
  resultsCard: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  queueCard: {
    marginBottom: 80,
    backgroundColor: '#1e1e1e',
  },
  queueNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginLeft: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1DB954',
  },
  fabActive: {
    backgroundColor: '#ff4444',
  },
});

export default HomeScreen;
