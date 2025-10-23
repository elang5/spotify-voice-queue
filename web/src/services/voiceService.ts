/**
 * Voice Service for Web using react-speech-recognition
 * This wraps the Web Speech API with better state management
 */

class VoiceService {
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

  /**
   * Check if browser supports speech recognition
   */
  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Get browser compatibility message
   */
  getBrowserSupportMessage(): string {
    if (this.isSupported()) {
      return 'Speech recognition is supported';
    }
    return 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
  }
}

export default new VoiceService();
