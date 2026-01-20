# Breathe - Evidence-Based Breathing App

A full-stack production-ready breathing techniques app with mobile (iOS/Android), web, and backend components.

## Project Structure

```
breathe-production/
├── mobile/          # React Native (Expo) mobile app
├── web/             # React (Vite) web app
├── backend/         # Node.js/Express API with MongoDB
└── README.md
```

## Features

- **15 Evidence-Based Techniques** - Ranked by health impact, including Cyclic Sighing, Box Breathing, 4-7-8, and more
- **Guided Sessions** - Animated breathing circles with haptic feedback
- **Progress Tracking** - Sessions, streaks, mood improvements
- **Personalization** - Onboarding flow to customize recommendations
- **User Accounts** - Secure authentication with JWT
- **Offline Support** - Works without internet connection
- **Cross-Platform** - iOS, Android, and Web

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for production backend)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) for building

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
npm install
npm run dev
```

The API will run at `http://localhost:3001`

### 2. Web App Setup

```bash
cd web
npm install
npm run dev
```

The web app will run at `http://localhost:3000`

### 3. Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan QR for physical device.

---

## Production Deployment

### Backend (Railway/Render/Heroku)

1. Create a MongoDB Atlas cluster at https://mongodb.com/atlas
2. Deploy to your preferred platform:

**Railway:**
```bash
railway login
railway init
railway up
```

**Render:**
- Connect GitHub repo
- Set build command: `npm install`
- Set start command: `npm start`
- Add environment variables from `.env.example`

### Web App (Vercel/Netlify)

**Vercel:**
```bash
cd web
npm install -g vercel
vercel
```

**Netlify:**
```bash
cd web
npm install -g netlify-cli
netlify deploy --prod
```

### Mobile App (App Store & Google Play)

1. **Configure EAS:**
```bash
cd mobile
eas login
eas build:configure
```

2. **Update `eas.json`** with your Apple/Google credentials

3. **Build for stores:**
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

4. **Submit to stores:**
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## App Store Submission Checklist

### iOS (App Store Connect)
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect app created
- [ ] Bundle ID registered: `com.breathe.app`
- [ ] App icons (1024x1024 required)
- [ ] Screenshots for all device sizes
- [ ] Privacy policy URL
- [ ] Age rating completed
- [ ] App review information filled

### Android (Google Play Console)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App created in Play Console
- [ ] Package name: `com.breathe.app`
- [ ] Signed release APK/AAB
- [ ] Feature graphic (1024x500)
- [ ] Screenshots for phone and tablet
- [ ] Content rating questionnaire
- [ ] Data safety form completed

---

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-web-domain.com
```

### Mobile (app.json extra)
```json
{
  "extra": {
    "apiUrl": "https://your-api-domain.com"
  }
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/onboarding` - Complete onboarding

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/stats` - Get user stats
- `GET /api/sessions/weekly` - Get weekly data

### Users
- `PUT /api/users/profile` - Update profile
- `GET /api/users/favorites` - Get favorites
- `POST /api/users/favorites/:id` - Add favorite
- `DELETE /api/users/favorites/:id` - Remove favorite

### Techniques
- `GET /api/techniques` - Get all techniques
- `GET /api/techniques/:id` - Get technique
- `GET /api/techniques/categories` - Get categories

---

## Breathing Techniques Included

1. **Cyclic Sighing** (#1) - Stanford-proven stress relief
2. **Coherent Breathing** (#2) - HRV optimization
3. **Box Breathing** (#3) - Focus and calm
4. **Diaphragmatic Breathing** (#4) - Foundation technique
5. **Extended Exhale** (#5) - Anxiety relief
6. **4-7-8 Breathing** (#6) - Sleep aid
7. **Wim Hof Method** (#7) - Energy and resilience
8. **Alternate Nostril** (#8) - Balance and clarity
9. **Breath of Fire** (#9) - Energizing
10. **Buteyko Method** (#10) - Respiratory health
11. **Pre-Sleep Protocol** (#11) - Sleep preparation
12. **Recovery Breathing** (#12) - Post-exercise
13. **Holotropic Breathwork** (#13) - Advanced practice
14. **Left Nostril Breathing** (#14) - Calming
15. **Kumbhaka** (#15) - Breath retention

---

## Tech Stack

- **Mobile**: React Native, Expo, Expo Router, AsyncStorage
- **Web**: React, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Deployment**: Vercel/Netlify (web), Railway/Render (backend), EAS (mobile)

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues or questions, please open a GitHub issue or contact support@breathe-app.com
