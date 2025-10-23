import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  Card,
  TextInput,
  Chip,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../services/api';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  uri: string;
}

const PlaylistGeneratorScreen: React.FC = () => {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);

  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Focus'];
  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'];

  const generatePlaylist = async () => {
    if (!mood && !genre && !description) {
      Alert.alert('Input Required', 'Please select a mood, genre, or provide a description');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await apiService.generatePlaylist({
        mood: mood || undefined,
        genre: genre || undefined,
        description: description || undefined,
        limit: 20,
      });

      setGeneratedTracks(result.tracks || []);
      Alert.alert('Success', `Generated playlist with ${result.tracks?.length || 0} tracks`);
    } catch (error: any) {
      console.error('Failed to generate playlist:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate playlist');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTrackToQueue = async (track: Track) => {
    try {
      await apiService.addToQueueByUri(track.uri);
      Alert.alert('Success', `Added "${track.name}" to queue`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add track to queue');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          AI Playlist Generator
        </Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Let AI create the perfect playlist for you
        </Text>

        {/* Mood Selection */}
        <Card style={styles.card}>
          <Card.Title title="Select Mood" />
          <Card.Content>
            <View style={styles.chipContainer}>
              {moods.map((m) => (
                <Chip
                  key={m}
                  selected={mood === m}
                  onPress={() => setMood(mood === m ? '' : m)}
                  style={styles.chip}
                >
                  {m}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Genre Selection */}
        <Card style={styles.card}>
          <Card.Title title="Select Genre" />
          <Card.Content>
            <View style={styles.chipContainer}>
              {genres.map((g) => (
                <Chip
                  key={g}
                  selected={genre === g}
                  onPress={() => setGenre(genre === g ? '' : g)}
                  style={styles.chip}
                >
                  {g}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Custom Description */}
        <Card style={styles.card}>
          <Card.Title title="Or Describe What You Want" />
          <Card.Content>
            <TextInput
              label="e.g., 'Songs for a road trip' or 'Workout motivation'"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <Button
          mode="contained"
          onPress={generatePlaylist}
          loading={isGenerating}
          disabled={isGenerating}
          style={styles.generateButton}
          buttonColor="#1DB954"
        >
          {isGenerating ? 'Generating...' : 'Generate Playlist'}
        </Button>

        {/* Generated Playlist */}
        {generatedTracks.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title={`Generated Playlist (${generatedTracks.length} tracks)`} />
            <Card.Content>
              {generatedTracks.map((track) => (
                <List.Item
                  key={track.id}
                  title={track.name}
                  description={`${track.artists[0].name} - ${track.album.name}`}
                  left={(props) => <List.Icon {...props} icon="music-note" />}
                  right={(props) => (
                    <Button onPress={() => addTrackToQueue(track)}>
                      Add
                    </Button>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>
              AI is curating your perfect playlist...
            </Text>
          </View>
        )}
      </ScrollView>
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
  title: {
    color: '#1DB954',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B3B3B3',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#282828',
  },
  generateButton: {
    marginVertical: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#B3B3B3',
    marginTop: 16,
  },
});

export default PlaylistGeneratorScreen;
