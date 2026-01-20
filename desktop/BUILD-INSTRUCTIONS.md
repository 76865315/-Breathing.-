# Build Breathe Desktop App for Mac

Follow these steps on your Mac to create a clickable desktop app.

## Quick Build (5 minutes)

### Step 1: Open Terminal
Press `Cmd + Space`, type "Terminal", press Enter.

### Step 2: Navigate to the desktop folder
```bash
cd ~/Desktop
```

### Step 3: Copy the app folder to your Desktop
Copy the `breathe-production/desktop` folder from this project to your Desktop.

### Step 4: Install dependencies and build
```bash
cd desktop
npm install
npm run build
```

### Step 5: Install the app
After the build completes, you'll find the app in:
- `desktop/dist/Breathe-1.0.0.dmg` (installer)
- Or `desktop/dist/mac/Breathe.app` (direct app)

**To install:**
1. Double-click the `.dmg` file
2. Drag "Breathe" to your Applications folder
3. Double-click Breathe in Applications to launch

The app icon will appear in your dock and you can add it to Launchpad.

---

## What You Get

✅ Native Mac app with custom icon
✅ Appears in Applications folder
✅ Click to launch from Dock/Launchpad
✅ No terminal or browser needed
✅ Works offline
✅ Saves your progress locally

---

## Troubleshooting

**"App can't be opened because it is from an unidentified developer"**
- Go to System Preferences > Security & Privacy
- Click "Open Anyway" next to the Breathe message

**Build fails**
- Make sure you have Node.js installed: https://nodejs.org
- Make sure you have Xcode Command Line Tools: `xcode-select --install`

---

## For Windows Users

```bash
npm run build:win
```

The installer will be at `dist/Breathe Setup 1.0.0.exe`
