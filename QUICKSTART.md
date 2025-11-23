# 🚀 HGM POS - Quick Start Guide

Get up and running in **under 2 minutes**!

---

## 🌐 Run in Browser (Easiest - No Build Required)

Perfect for development, testing, and demos in Codespaces or any environment.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

This starts:
- ✅ Backend API server at `http://localhost:3000`
- ✅ Frontend UI at `http://localhost:5173`

### Step 3: Open in Browser

**In Codespaces:**
- Click the "Ports" tab at the bottom
- Find port `5173`
- Click the globe icon or "Open in Browser"

**Locally:**
- Open: http://localhost:5173

### Step 4: Login
```
Username: admin
Password: admin123
```

**That's it!** ✅ You're now running the full POS system in your browser.

---

## 🎯 What You Can Do in Browser Mode

✅ **Full POS Functionality**
- Select section (Bar/Restaurant/Lodge)
- Browse products
- Add items to cart
- Complete transactions
- Process cash payments
- Process Pesapal card/mobile money payments

✅ **Admin Features**
- Manage inventory
- Edit item prices
- View reports
- Add/remove items

✅ **Reports & Analytics**
- Daily sales summary
- Section breakdown
- Payment methods
- Top selling items
- Cashier performance

❌ **Hardware Features** (require Electron + physical hardware)
- Thermal printer (receipts save to file instead)
- Cash drawer (API calls work but drawer doesn't open)

---

## 📦 Build Windows Installer

Choose your preferred method:

### Method 1: GitHub Actions (Recommended - Zero Setup)

**Automatic builds on every push:**
```bash
# Just push your code
git push

# Then visit:
# https://github.com/SAVIOUR26/hgm-pos/actions
# Download the installer from artifacts
```

**Manual trigger:**
1. Go to: https://github.com/SAVIOUR26/hgm-pos/actions/workflows/build-windows.yml
2. Click "Run workflow"
3. Wait 5-10 minutes
4. Download installer from artifacts

### Method 2: Docker Build (Reliable)

```bash
./build-windows-docker.sh
```

Requires: Docker installed

### Method 3: Wine Build (Quick)

```bash
./build-windows-wine.sh
```

Auto-installs Wine if needed. May have compatibility issues.

---

## 🖥️ Test Electron Desktop App

Run the full desktop experience in development mode:

```bash
# Build everything first
npm run build

# Then run Electron
npm run electron:dev
```

**Note:** Backend must be running for Electron to work. The `electron:dev` command handles this automatically.

---

## 📱 Access from Mobile/Tablet

Want to test on your phone or tablet?

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Find your IP address:**
   ```bash
   hostname -I
   # Example output: 192.168.1.100
   ```

3. **Update .env file:**
   ```env
   HOST=0.0.0.0
   ```

4. **Open on mobile:**
   ```
   http://192.168.1.100:5173
   ```

**Note:** Works only on the same WiFi network.

---

## 🛠️ Common Commands

```bash
# Development (Browser Mode)
npm run dev              # Start backend + frontend (opens in browser)
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Desktop App
npm run electron:dev     # Run Electron app (development)
npm run electron:build   # Build Windows installer

# Building
npm run build            # Build all components
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only

# Helpers
npm run create-icon      # Generate app icons
```

---

## 🔧 Troubleshooting

### "Port 3000 already in use"
```bash
# Kill the process
pkill -f "node.*backend"

# Or change port in .env
PORT=3001
```

### "Cannot connect to backend"
```bash
# Make sure backend is running
curl http://localhost:3000/api/health
```

### "npm run dev doesn't work"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Build fails in Codespaces"
Use GitHub Actions instead - it's more reliable.

---

## 📚 More Information

- **Full Dev Guide:** See `DEVELOPMENT_GUIDE.md`
- **Project Details:** See `CLAUDE_CODE_INSTRUCTIONS.md`
- **Completion Status:** See `COMPLETION_SUMMARY.md`
- **Windows Build:** See `BUILD_WINDOWS_INSTALLER.md`

---

## 🎉 You're Ready!

The fastest way to get started:
```bash
npm install && npm run dev
```

Then open http://localhost:5173 in your browser!

**Happy coding!** 🚀
