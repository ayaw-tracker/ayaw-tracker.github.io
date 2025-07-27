# 🚀 AYAW Firebase Setup Guide

## Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Firebase Emulators
```bash
npm run dev:firebase
```
This will start:
- Firebase UI: http://localhost:4000
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Hosting Emulator: http://localhost:3000

### 3. Start Development Server (in another terminal)
```bash
npm run dev
```
This will start the Vite dev server on: http://localhost:3001

### 4. Access the Application
- **Main App**: http://localhost:3001 (Vite dev server)
- **Firebase UI**: http://localhost:4000 (Emulator dashboard)

## Environment Setup

### Create Environment File
Create a `.env.local` file in the root directory:
```bash
# Firebase Configuration for Development
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-ayaw.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-ayaw
VITE_FIREBASE_STORAGE_BUCKET=demo-ayaw.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop

# Development mode flag
VITE_USE_FIREBASE_EMULATORS=true
```

## Development Workflow

### Running Both Services
```bash
# Option 1: Run both together
npm run dev:all

# Option 2: Run separately (recommended for debugging)
# Terminal 1:
npm run dev:firebase

# Terminal 2:
npm run dev
```

### Firebase Emulator Dashboard
Visit http://localhost:4000 to:
- View Firestore data
- Manage authentication users
- Monitor function calls
- See hosting status

## Production Setup (Later)

When you're ready for production:

1. **Create Firebase Project**
   ```bash
   npx firebase login
   npx firebase projects:create your-project-id
   npx firebase use your-project-id
   ```

2. **Update Environment Variables**
   Replace the demo values in `.env.local` with your actual Firebase config

3. **Deploy**
   ```bash
   npm run firebase:deploy
   ```

## Troubleshooting

### Port Conflicts
If you get port conflicts:
- Check what's running on ports 3000, 4000, 8080, 9099
- Kill processes or update `firebase.json` ports

### Java Not Found
```bash
# On macOS with Homebrew:
brew install temurin@17

# Verify Java installation:
java -version
```

### Firebase CLI Issues
```bash
# Install globally if needed:
npm install -g firebase-tools

# Or use npx:
npx firebase --version
```

## Architecture

### Current Setup
- **Frontend**: React + Vite (http://localhost:3001)
- **Backend**: Firebase Emulators (http://localhost:4000)
- **Database**: Firestore Emulator (http://localhost:8080)
- **Auth**: Firebase Auth Emulator (http://localhost:9099)

### Data Flow
```
React App (3001) → Firebase SDK → Emulators (4000)
                                     ↓
                              Firestore (8080)
                              Auth (9099)
```

### Privacy-First Design
- User data isolated by UID in Firestore
- No cross-user data access
- Local development with emulators
- Complete offline capability