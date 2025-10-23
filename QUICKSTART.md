# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Spotify Premium account
- [ ] Mobile device or emulator

## Setup Steps

### 1. Get Spotify Credentials (2 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in:
   - **App name**: Spotify Voice Queue
   - **App description**: Voice-controlled queue management
   - **Redirect URI**: `http://127.0.0.1:8888/api/callback`
   - Check "Web API" checkbox
5. Click "Save"
6. Click "Settings" to see your **Client ID** and **Client Secret**

### 2. Get Anthropic API Key (1 minute)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)

### 3. Backend Setup (1 minute)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste your credentials:
```env
SPOTIFY_CLIENT_ID=<paste your client id>
SPOTIFY_CLIENT_SECRET=<paste your client secret>
REDIRECT_URI=http://127.0.0.1:8888/api/callback
ANTHROPIC_API_KEY=<paste your anthropic key>
```

### 4. Mobile Setup (1 minute)

```bash
cd ../mobile
npm install --legacy-peer-deps
echo "EXPO_PUBLIC_API_URL=http://127.0.0.1:8888/api" > .env
```

### 5. Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `Server running on http://127.0.0.1:8888`

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

**Then:**
- Press `a` for Android
- Press `i` for iOS
- Or scan QR with Expo Go app

### 6. First Use

1. App opens → Click "Connect with Spotify"
2. Browser opens → Log in to Spotify
3. Grant permissions
4. You're in! 🎉

### 7. Test Voice Control

1. Make sure Spotify is playing on some device
2. In the app, tap the microphone button (bottom right)
3. Say: "Add Bohemian Rhapsody to queue"
4. Watch the magic happen! ✨

## Troubleshooting

### "No active device"
→ Open Spotify and start playing something

### Voice not working
→ Grant microphone permissions when prompted

### Can't connect to backend
→ Make sure backend is running on port 8888

### Dependencies won't install
→ Use `npm install --legacy-peer-deps`

## What's Next?

- Read the full [README.md](README.md) for all features
- Try AI playlist generation
- Explore different voice commands
- Deploy to production

## Need Help?

Check the [README.md](README.md) troubleshooting section or file an issue!
