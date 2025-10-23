import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';

type VoiceCallback = (results: string[]) => void;
type ErrorCallback = (error: any) => void;

class VoiceService {
  private isListening: boolean = false;
  private onResultsCallback: VoiceCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;

  constructor() {
    this.initializeVoice();
  }

  /**
   * Initialize voice recognition event handlers
   */
  private initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  private onSpeechStart = (e: SpeechStartEvent) => {
    console.log('Speech started:', e);
    this.isListening = true;
  };

  private onSpeechEnd = (e: SpeechEndEvent) => {
    console.log('Speech ended:', e);
    this.isListening = false;
  };

  private onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('Speech results:', e.value);
    if (this.onResultsCallback && e.value) {
      this.onResultsCallback(e.value);
    }
  };

  private onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech error:', e.error);
    this.isListening = false;
    if (this.onErrorCallback) {
      this.onErrorCallback(e.error);
    }
  };

  /**
   * Start listening for voice commands
   */
  async startListening(
    onResults: VoiceCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    try {
      this.onResultsCallback = onResults;
      this.onErrorCallback = onError || null;

      await Voice.start('en-US');
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
      throw error;
    }
  }

  /**
   * Cancel voice recognition
   */
  async cancel(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to cancel voice recognition:', error);
    }
  }

  /**
   * Destroy voice instance
   */
  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListening = false;
      this.onResultsCallback = null;
      this.onErrorCallback = null;
    } catch (error) {
      console.error('Failed to destroy voice instance:', error);
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Parse voice command to extract song information
   * Supports commands like:
   * - "Add [song name] to queue"
   * - "Play [song name]"
   * - "Queue [song name]"
   */
  parseVoiceCommand(command: string): { action: string; query: string } | null {
    const lowerCommand = command.toLowerCase();

    // Patterns for queue commands
    const queuePatterns = [
      /(?:add|queue|play)\s+(.+?)(?:\s+(?:to|in)\s+(?:the\s+)?queue)?$/i,
      /queue\s+(.+)$/i,
      /play\s+(.+)$/i,
    ];

    for (const pattern of queuePatterns) {
      const match = lowerCommand.match(pattern);
      if (match && match[1]) {
        return {
          action: 'queue',
          query: match[1].trim(),
        };
      }
    }

    return null;
  }
}

export default new VoiceService();
