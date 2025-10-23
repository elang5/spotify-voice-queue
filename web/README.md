# Spotify Voice Queue - Web App

Progressive Web App for controlling your Spotify queue with voice commands.

## Features

- 🎤 Voice-controlled queue management using Web Speech API
- 🎵 Real-time queue display
- 🤖 AI-powered playlist generation
- 📱 Responsive design (mobile & desktop)
- 💾 PWA - Install as native app
- 🎨 Spotify-inspired Material-UI design

## Tech Stack

- React 18 + TypeScript
- Vite (fast dev server & build)
- Material-UI (MUI) v6
- react-speech-recognition (Web Speech API wrapper)
- React Router v6
- Axios for API calls

## Development

### Prerequisites

- Node.js 18+
- Spotify Premium account
- Backend API running (see `/backend`)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL

4. Start dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

```bash
npm run build
```

Output will be in `dist/` folder.

## Deployment

### Netlify

1. Connect your repo to Netlify
2. Set build settings:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

## Browser Support

### Speech Recognition

- ✅ Chrome/Edge (Desktop & Mobile) - Full support
- ⚠️ Safari (Desktop & Mobile) - Limited support
- ❌ Firefox - Not supported

For best experience, use Chrome or Edge.

## PWA Installation

### Desktop
1. Click the install icon in the address bar
2. Follow the prompts

### Mobile
1. Open in Chrome/Safari
2. Tap "Add to Home Screen"
3. Enjoy native-like experience!

## Voice Commands

Supported patterns:
- "Play [song name]"
- "Add [song name] to queue"
- "Queue [song name]"

Example: "Play Blinding Lights by The Weeknd"

## Project Structure

```
web/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   └── VoiceRecorder.tsx  # Voice recording component
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication state
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Home.tsx           # Main app
│   │   └── PlaylistGenerator.tsx
│   ├── services/
│   │   ├── api.ts             # API client
│   │   └── voiceService.ts    # Voice parsing
│   ├── App.tsx                # Main app component
│   ├── main.tsx              # Entry point
│   └── theme.ts               # MUI theme
└── package.json
```

## License

MIT
