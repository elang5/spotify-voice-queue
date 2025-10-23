import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Spotify Voice Queue
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Control your music with your voice
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon="🎤"
            title="Voice Control"
            description="Add songs to your queue using voice commands"
          />
          <FeatureItem
            icon="🤖"
            title="AI Playlists"
            description="Generate smart playlists based on your taste"
          />
          <FeatureItem
            icon="🎵"
            title="Smart Queue"
            description="Seamlessly manage your Spotify queue"
          />
        </View>

        <View style={styles.loginSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
              icon="spotify"
            >
              Connect with Spotify
            </Button>
          )}
          <Text variant="bodySmall" style={styles.disclaimer}>
            Requires Spotify Premium
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text variant="titleMedium" style={styles.featureTitle}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    color: '#1DB954',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B3B3B3',
    textAlign: 'center',
  },
  features: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#B3B3B3',
  },
  loginSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 12,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#B3B3B3',
    textAlign: 'center',
  },
});

export default LoginScreen;
