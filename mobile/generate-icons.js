const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Create SVG for main app icon (1024x1024)
const createMainIconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="1024" height="1024" rx="224" fill="url(#bgGrad)"/>

  <!-- Decorative circles -->
  <circle cx="512" cy="512" r="380" fill="none" stroke="url(#circleGrad)" stroke-width="40"/>
  <circle cx="512" cy="512" r="280" fill="none" stroke="url(#circleGrad)" stroke-width="30"/>

  <!-- Central breathing circle -->
  <circle cx="512" cy="512" r="180" fill="white" fill-opacity="0.95"/>

  <!-- Wind/breath lines -->
  <g stroke="white" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.9">
    <path d="M320 400 Q400 380 460 420"/>
    <path d="M280 512 Q380 480 460 512"/>
    <path d="M320 624 Q400 644 460 604"/>
  </g>

  <!-- Leaf accent -->
  <path d="M580 380 Q680 340 720 420 Q680 500 580 480 Q560 420 580 380Z" fill="white" fill-opacity="0.9"/>
  <path d="M620 460 Q620 520 660 560" stroke="white" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.7"/>
</svg>
`;

// Create SVG for adaptive icon foreground (no background, just the icon)
const createAdaptiveIconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Central breathing circle -->
  <circle cx="512" cy="512" r="200" fill="#3b82f6"/>

  <!-- Wind/breath lines -->
  <g stroke="#3b82f6" stroke-width="28" stroke-linecap="round" fill="none">
    <path d="M280 380 Q380 350 450 400"/>
    <path d="M240 512 Q360 470 450 512"/>
    <path d="M280 644 Q380 674 450 624"/>
  </g>

  <!-- Leaf accent -->
  <path d="M600 360 Q720 310 770 410 Q720 520 600 490 Q570 410 600 360Z" fill="#60a5fa"/>
  <path d="M650 470 Q650 540 700 590" stroke="#3b82f6" stroke-width="18" stroke-linecap="round" fill="none"/>
</svg>
`;

// Create SVG for splash icon
const createSplashIconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Central breathing circle -->
  <circle cx="256" cy="256" r="120" fill="white"/>

  <!-- Wind/breath lines -->
  <g stroke="white" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.9">
    <path d="M100 200 Q160 180 210 210"/>
    <path d="M80 256 Q150 230 210 256"/>
    <path d="M100 312 Q160 332 210 302"/>
  </g>

  <!-- Leaf accent -->
  <path d="M300 180 Q380 150 410 210 Q380 280 300 260 Q280 210 300 180Z" fill="white" fill-opacity="0.95"/>
  <path d="M330 240 Q330 280 360 310" stroke="white" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.8"/>
</svg>
`;

// Create favicon SVG (simpler for small size)
const createFaviconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#favGrad)"/>
  <circle cx="32" cy="32" r="16" fill="white"/>
  <path d="M20 26 Q26 24 30 28" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M18 32 Q26 30 30 32" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M20 38 Q26 40 30 36" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
`;

async function generateIcons() {
  console.log('Generating Breathe app icons...\n');

  try {
    // Main app icon (1024x1024)
    console.log('Creating icon.png (1024x1024)...');
    await sharp(Buffer.from(createMainIconSvg(1024)))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ icon.png created');

    // Adaptive icon foreground (1024x1024)
    console.log('Creating adaptive-icon.png (1024x1024)...');
    await sharp(Buffer.from(createAdaptiveIconSvg(1024)))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✓ adaptive-icon.png created');

    // Splash icon (512x512, will be placed on colored background)
    console.log('Creating splash-icon.png (512x512)...');
    await sharp(Buffer.from(createSplashIconSvg(512)))
      .resize(512, 512)
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✓ splash-icon.png created');

    // Favicon (48x48)
    console.log('Creating favicon.png (48x48)...');
    await sharp(Buffer.from(createFaviconSvg(48)))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ favicon.png created');

    console.log('\n✅ All icons generated successfully!');
    console.log(`Icons saved to: ${assetsDir}`);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
