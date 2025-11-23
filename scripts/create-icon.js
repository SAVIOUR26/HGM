const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple PNG icon with HGM branding
async function createIcon() {
  const size = 256;

  // Create SVG with HGM text
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="32" fill="url(#grad1)"/>
      <text x="${size/2}" y="110" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">HGM</text>
      <text x="${size/2}" y="160" font-family="Arial, sans-serif" font-size="36" font-weight="normal" fill="white" text-anchor="middle" opacity="0.9">POS</text>
      <rect x="90" y="175" width="76" height="50" rx="4" fill="white" opacity="0.3"/>
      <rect x="100" y="185" width="56" height="30" rx="2" fill="white" opacity="0.5"/>
      <circle cx="120" r="3" cy="210" fill="white"/>
      <circle cx="135" r="3" cy="210" fill="white"/>
    </svg>
  `;

  const publicDir = path.join(__dirname, '../public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    // Create 256x256 PNG
    await sharp(Buffer.from(svg))
      .resize(256, 256)
      .png()
      .toFile(path.join(publicDir, 'icon.png'));

    console.log('✓ Created icon.png (256x256)');

    // Also create a 512x512 version for better quality
    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✓ Created icon-512.png (512x512)');

    // Create 1024x1024 for high DPI displays
    await sharp(Buffer.from(svg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(publicDir, 'icon-1024.png'));

    console.log('✓ Created icon-1024.png (1024x1024)');

    console.log('\n✓ All icons created successfully!');
    console.log('  Location: public/');
    console.log('\nNote: These are placeholder icons with HGM branding.');
    console.log('Replace with your actual company logo for production.');

  } catch (error) {
    console.error('✗ Error creating icon:', error);
    process.exit(1);
  }
}

createIcon();
