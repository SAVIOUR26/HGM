# App Icon

## Current Status
A placeholder SVG icon has been provided (`icon-placeholder.svg`) with HGM branding.

## For Production Use
You should replace this placeholder with your actual HGM Properties Ltd logo.

### Requirements:
- **Format**: .ico file for Windows (electron-builder will also accept .png)
- **Size**: 256x256 pixels minimum (512x512 recommended)
- **Name**: `icon.ico` or `icon.png`
- **Location**: Place in this `/public` directory

### How to Create ICO from PNG/SVG:
1. Using online converter: https://convertio.co/png-ico/
2. Using ImageMagick: `convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
3. Using GIMP: Export as .ico with multiple sizes

### Temporary Solution:
The current SVG placeholder will work for development, but electron-builder needs either:
- `public/icon.ico` (Windows)
- `public/icon.png` (will be converted automatically)

If neither exists, the build will use Electron's default icon.
