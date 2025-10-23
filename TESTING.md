# Testing Guide

How to test all features of Spotify Voice Queue.

## Pre-Test Setup

1. **Ensure Spotify is Active**
   - Open Spotify on any device (phone, computer, web)
   - Start playing a song
   - This creates an "active device" for the API

2. **Backend Running**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `Server running on http://127.0.0.1:8888`

3. **Mobile App Running**
   ```bash
   cd mobile
   npm start
   ```
   Then press `a` (Android) or `i` (iOS)

## Test Plan

### 1. Authentication Flow ✓

**Steps:**
1. App opens to login screen
2. Click "Connect with Spotify"
3. Browser opens with Spotify login
4. Enter your Spotify credentials
5. Grant permissions
6. Browser redirects back to app

**Expected:**
- Smooth transition to home screen
- No errors in console

**Common Issues:**
- Redirect URI mismatch → Check Spotify Dashboard
- "Invalid client" → Check Client ID in .env

---

### 2. Search Functionality ✓

**Steps:**
1. On home screen, tap search bar
2. Type "Bohemian Rhapsody"
3. Press enter or search

**Expected:**
- Loading spinner appears
- Search results show with track info
- "Add" button appears for each result

**Test Cases:**
- [ ] Search by song name: "Wonderwall"
- [ ] Search by artist: "Queen"
- [ ] Search with artist: "Hotel California Eagles"
- [ ] Empty search returns no results
- [ ] Special characters: "Smells Like Teen Spirit"

---

### 3. Manual Queue Addition ✓

**Steps:**
1. Search for a song
2. Click "Add" button
3. Watch for success message

**Expected:**
- Success alert: "Added [song] to queue"
- Search clears
- Song appears in Spotify queue
- Queue list updates in app

**Test Cases:**
- [ ] Add popular song
- [ ] Add obscure song
- [ ] Add same song twice
- [ ] Add when nothing playing (should error gracefully)

---

### 4. Voice Commands ✓

**Setup:**
- Grant microphone permission when prompted
- Ensure quiet environment

**Steps:**
1. Tap microphone FAB (bottom right)
2. Wait for "Listening..." indicator
3. Speak clearly: "Add Stairway to Heaven to queue"
4. Wait for processing

**Expected:**
- Microphone button turns red when active
- Voice command appears as chip/text
- Song added to queue
- Success message shown
- Microphone deactivates

**Test Cases:**
- [ ] "Add Dancing Queen to queue"
- [ ] "Play Billie Jean"
- [ ] "Queue Sweet Child O' Mine"
- [ ] "Add Imagine by John Lennon to queue"
- [ ] Gibberish (should show "Unknown Command")
- [ ] Background noise handling

**Voice Troubleshooting:**
- No permission → Check app settings
- Not recognizing → Speak louder, clearer
- Wrong song → Try with artist name

---

### 5. Now Playing Display ✓

**Steps:**
1. Play something on Spotify
2. Check home screen

**Expected:**
- "Now Playing" card appears at top
- Shows current song name
- Shows artist name
- Updates when song changes

**Test Cases:**
- [ ] Play/pause on Spotify reflects in app
- [ ] Skip track updates display
- [ ] No song playing → card doesn't appear

---

### 6. Queue Display ✓

**Steps:**
1. Add multiple songs to queue
2. Scroll through queue list

**Expected:**
- All queued songs shown
- Numbered list (1, 2, 3...)
- Song name + artist displayed
- Updates in real-time

---

### 7. Error Handling ✓

**Test Cases:**
- [ ] No internet connection
- [ ] No active Spotify device
- [ ] Invalid search query
- [ ] Expired token (wait 1 hour)
- [ ] Voice permission denied
- [ ] Backend offline

**Expected:**
- Graceful error messages
- No app crashes
- Clear user guidance

---

### 8. AI Playlist Generation ✓

**Prerequisites:**
- Anthropic API key added to `.env`
- Have listening history on Spotify

**Steps:**
1. (Future: Add playlist screen)
2. Request playlist generation
3. Select mood/genre/timeperiod
4. Generate playlist

**Expected:**
- Analysis of your taste
- Curated recommendations
- Hybrid results (Claude + Spotify)

**Test Cases:**
- [ ] Mood: "energetic"
- [ ] Genre: "rock"
- [ ] Timeperiod: "90s"
- [ ] Custom description
- [ ] Without Anthropic key (should fallback gracefully)

---

## Backend API Testing

### Direct API Tests (using curl or Postman)

**Test OAuth:**
```bash
# Open in browser:
http://127.0.0.1:8888/api/auth/login
```

**Test Queue (need access token):**
```bash
curl -X POST http://127.0.0.1:8888/api/queue \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Bohemian Rhapsody"}'
```

**Test Playlists:**
```bash
curl -X POST http://127.0.0.1:8888/api/playlists \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mood": "energetic", "limit": 10}'
```

---

## Performance Testing

### Response Times
- [ ] Search: < 1 second
- [ ] Queue add: < 500ms
- [ ] Voice recognition: < 2 seconds
- [ ] Playlist generation: < 5 seconds

### Memory Usage
- [ ] No memory leaks during extended use
- [ ] App remains responsive after 10+ commands
- [ ] Backend handles multiple concurrent requests

---

## Device Testing

### iOS
- [ ] iPhone (physical)
- [ ] iPhone (simulator)
- [ ] iPad
- [ ] Microphone permissions work
- [ ] Dark mode displays correctly

### Android
- [ ] Android phone (physical)
- [ ] Android emulator
- [ ] Microphone permissions work
- [ ] Dark mode displays correctly

---

## User Experience Testing

### First-Time User
- [ ] Clear login instructions
- [ ] Intuitive UI without guidance
- [ ] Obvious voice button
- [ ] Helpful error messages
- [ ] Feature discovery

### Edge Cases
- [ ] App backgrounded during voice command
- [ ] Phone call during voice recognition
- [ ] Spotify app closed mid-operation
- [ ] Network switches (WiFi → cellular)
- [ ] Low memory conditions

---

## Regression Testing Checklist

After making changes:
- [ ] Authentication still works
- [ ] Search still works
- [ ] Voice commands still work
- [ ] Queue display updates
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Backend functions deploy successfully

---

## Bug Reporting Template

If you find a bug, document:

**Issue Title:** Brief description

**Environment:**
- Device: iPhone 13 / Android Emulator
- OS: iOS 17 / Android 13
- App Version: 1.0.0

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots/Logs:**
Attach if available

**Console Output:**
Any error messages

---

## Test Coverage Goals

- [ ] 100% of features manually tested
- [ ] All error paths tested
- [ ] Multiple devices tested
- [ ] Real-world scenarios tested
- [ ] Performance benchmarks met

---

## Next Steps

Once testing is complete:
1. Document any bugs found
2. Fix critical issues
3. Test fixes
4. Prepare for deployment
5. Test in production environment

**Happy Testing!** 🧪
