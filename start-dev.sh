#!/bin/bash

# Spotify Voice Queue - Development Startup Script
# This script starts both backend and mobile app in separate terminal windows

echo "🎵 Starting Spotify Voice Queue Development Environment..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "mobile" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if mobile dependencies are installed
if [ ! -d "mobile/node_modules" ]; then
    echo "📦 Installing mobile dependencies..."
    cd mobile && npm install --legacy-peer-deps && cd ..
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "Please edit backend/.env with your credentials before starting the backend."
fi

if [ ! -f "mobile/.env" ]; then
    echo "⚠️  Warning: mobile/.env not found. Creating..."
    echo "EXPO_PUBLIC_API_URL=http://127.0.0.1:8888/api" > mobile/.env
fi

echo ""
echo "✅ Environment ready!"
echo ""
echo "Starting services..."
echo ""

# Function to start backend in a new terminal
start_backend() {
    echo "🚀 Starting backend on http://127.0.0.1:8888"

    # Try different terminal emulators
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend && npm run dev; bash" &
    elif command -v konsole &> /dev/null; then
        konsole -e "cd backend && npm run dev; bash" &
    else
        echo "⚠️  Could not find a terminal emulator. Please start backend manually:"
        echo "   cd backend && npm run dev"
    fi
}

# Function to start mobile in a new terminal
start_mobile() {
    echo "📱 Starting mobile app with Expo"
    sleep 2  # Give backend time to start

    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd mobile && npm start; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd mobile && npm start; bash" &
    elif command -v konsole &> /dev/null; then
        konsole -e "cd mobile && npm start; bash" &
    else
        echo "⚠️  Could not find a terminal emulator. Please start mobile manually:"
        echo "   cd mobile && npm start"
    fi
}

# Start services
start_backend
start_mobile

echo ""
echo "✨ Development environment started!"
echo ""
echo "📝 Next steps:"
echo "   1. Wait for backend to show 'Server running on http://127.0.0.1:8888'"
echo "   2. In the Expo terminal, press 'a' for Android or 'i' for iOS"
echo "   3. Make sure Spotify is playing on some device"
echo "   4. In the app, click 'Connect with Spotify'"
echo ""
echo "📚 Documentation:"
echo "   - Quick start: QUICKSTART.md"
echo "   - Full guide: README.md"
echo "   - Testing: TESTING.md"
echo ""
echo "🐛 Troubleshooting:"
echo "   - No active device: Start playing on Spotify first"
echo "   - Auth errors: Check .env file has correct credentials"
echo "   - Voice not working: Grant microphone permissions"
echo ""
echo "Press Ctrl+C to stop this script (services will keep running)"
echo ""

# Keep script running
wait
