# Spotify Voice Queue 🎤🎵

A modern mobile app that lets you control your Spotify Premium account with voice commands and AI-powered playlist generation.

## Features

- 🎤 **Voice Control**: Add songs to your queue using voice commands
- 🤖 **AI Playlist Generation**: Create smart playlists using Claude AI + Spotify recommendations
- 📱 **Mobile-First**: Beautiful, responsive React Native app
- 🎵 **Queue Management**: Seamlessly manage your Spotify queue
- 🔄 **Real-time Sync**: Live updates from your Spotify account

## Tech Stack

### Mobile App
- **React Native** (Expo)
- **TypeScript**
- **React Native Paper** (Material Design)
- **React Navigation** for routing
- **@react-native-voice/voice** for voice recognition
- **Axios** for API calls

### Backend
- **Node.js** + **Express**
- **Netlify Functions** (serverless)
- **TypeScript**
- **Spotify Web API**
- **Anthropic Claude API** for AI features

## Prerequisites

- Node.js 18+ and npm
- Spotify Premium account
- Spotify Developer account
- Anthropic API key (for AI features)
- iOS/Android device or emulator for testing

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd spotify-voice-queue
```

### 2. Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add the following Redirect URIs in app settings:
   - `http://localhost:8888/api/callback` (for development)
   - `spotifyvoicequeue://callback` (for mobile)
   - `https://your-netlify-app.netlify.app/api/callback` (for production)

### 3. Anthropic API Setup

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Save it for the next step

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your credentials to `.env`:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://localhost:8888/api/callback
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. Mobile App Setup

```bash
cd ../mobile

# Install dependencies
npm install --legacy-peer-deps

# Create .env file for Expo
echo "EXPO_PUBLIC_API_URL=http://localhost:8888/api" > .env
```

### 6. Running the App

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:8888`

#### Start Mobile App (Terminal 2)
```bash
cd mobile
npm start
```

This will open Expo DevTools. You can then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app on your physical device

## Usage

### Voice Commands

The app supports natural language voice commands:

- "Add [song name] to queue"
- "Play [song name]"
- "Queue [song name] by [artist]"

Examples:
- "Add Bohemian Rhapsody to queue"
- "Play Dancing Queen"
- "Queue Stairway to Heaven by Led Zeppelin"

### AI Playlist Generation

Generate smart playlists based on:
- **Mood**: energetic, calm, happy, sad, focused
- **Genre**: Any Spotify genre
- **Time Period**: Analyze your listening history from specific timeframes
- **Natural Description**: Describe the vibe you want

The app combines:
1. Claude AI analysis of your music taste
2. Spotify's recommendation algorithm
3. Your listening history

## Deployment

### Deploy Backend to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
cd backend
netlify init
netlify deploy --prod
```

4. Add environment variables in Netlify dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `REDIRECT_URI` (your production URL)
   - `ANTHROPIC_API_KEY`

5. Update your Spotify app's redirect URIs with the Netlify URL

### CI/CD with GitHub Actions

The project includes a GitHub Actions workflow that automatically deploys to Netlify on push to `main`.

**Setup:**
1. Add secrets to your GitHub repository:
   - `NETLIFY_AUTH_TOKEN` (from Netlify)
   - `NETLIFY_SITE_ID` (from Netlify)
2. Push to `main` branch to trigger deployment

## Project Structure

```
spotify-voice-queue/
├── mobile/                          # React Native app
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── screens/                # Screen components
│   │   │   ├── LoginScreen.tsx    # Spotify OAuth login
│   │   │   └── HomeScreen.tsx     # Main queue management
│   │   ├── services/
│   │   │   ├── api.ts             # API client with auth
│   │   │   └── voiceService.ts    # Voice recognition
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state management
│   │   └── utils/                  # Helper functions
│   ├── App.tsx                     # Root component
│   └── package.json
│
├── backend/                         # Node.js API
│   ├── functions/
│   │   ├── auth.ts                 # Spotify OAuth endpoints
│   │   ├── queue.ts                # Queue management
│   │   └── playlists.ts            # AI playlist generation
│   ├── netlify.toml                # Netlify configuration
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline
│
└── README.md
```

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Spotify OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/refresh` - Refresh access token

### Queue Management
- `POST /api/queue` - Add track to queue (by URI or search query)
- `GET /api/queue` - Get current queue

### Playlists
- `POST /api/playlists` - Generate AI-powered playlist

## Architecture Decisions

### Functional Programming
- Pure functions for business logic
- Immutable state management
- Declarative UI patterns

### Code Reusability
- Service layer abstraction
- Shared TypeScript types
- Reusable React components
- Context providers for state

### Boy Scout Rule
- Clean, self-documenting code
- Comprehensive error handling
- TypeScript for type safety
- ESLint for code quality

### Modern Infrastructure
- Serverless functions (Netlify)
- Mobile-first design
- OAuth 2.0 security
- Environment-based configuration

## Troubleshooting

### Voice Recognition Not Working
- **iOS**: Enable microphone permissions in Settings
- **Android**: Grant microphone permission when prompted
- Ensure device is not muted

### "No Active Device" Error
- Open Spotify on any device (phone, computer, etc.)
- Start playing something
- Try the queue command again

### Authentication Issues
- Ensure redirect URIs match exactly in Spotify Dashboard
- Check that tokens haven't expired
- Verify Spotify Premium account is active

### Build Errors
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Use `--legacy-peer-deps` flag if needed

## Future Enhancements

- [ ] PWA version for web browsers
- [ ] Playlist export to Apple Music/YouTube Music
- [ ] Collaborative queue with friends
- [ ] Spotify Connect device selection
- [ ] Offline queue caching
- [ ] Voice training for better accuracy
- [ ] Multi-language support
- [ ] Custom wake word ("Hey Spotify")

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Follow the existing code style
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Anthropic Claude API](https://www.anthropic.com/api)
- [React Native Voice](https://github.com/react-native-voice/voice)
- [Expo](https://expo.dev)

---

Built with ❤️ using modern software engineering practices
