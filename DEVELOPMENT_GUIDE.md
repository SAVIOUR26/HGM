# HGM POS - Development Guide

This guide explains how to develop and build the HGM POS system in different environments.

---

## 🌐 Option 1: Run in Browser (Recommended for Development)

This is the **easiest way** to develop and test the application without Electron.

### Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run both backend and frontend
npm run dev
```

This will start:
- **Backend API** at http://localhost:3000
- **Frontend UI** at http://localhost:5173

**Open in browser:** http://localhost:5173

**Login:**
- Username: `admin`
- Password: `admin123`

### Individual Commands

```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Or run both in one terminal
npm run dev
```

### What Works in Browser Mode

✅ Full POS functionality (add items, checkout, cart)
✅ User authentication (login/logout)
✅ Admin panel (edit prices, manage inventory)
✅ Reports dashboard
✅ Pesapal payment integration
✅ All API endpoints
✅ Database operations

❌ Thermal printer (requires Electron + hardware)
❌ Cash drawer (requires Electron + hardware)
❌ Desktop app features (system tray, auto-start)

**Note:** Printer and cash drawer features will fallback gracefully:
- Receipts save to `temp/receipts/` folder instead of printing
- Cash drawer API calls return success but don't open physical drawer

---

## 🖥️ Option 2: Run Electron Desktop App (Development Mode)

Test the full desktop experience with Electron.

```bash
# Build all components first
npm run build

# Run Electron in development mode
npm run electron:dev
```

This opens the full desktop app with:
✅ Auto-starting backend
✅ Electron window
✅ Printer support (if hardware connected)
✅ Cash drawer support (if hardware connected)

**Note:** Backend must be running for Electron to work.

---

## 📦 Option 3: Build Windows Installer from Codespaces

There are **two ways** to create a Windows installer from Codespaces (Linux):

### Method A: GitHub Actions (Recommended - Easy)

✅ **Best for:** Production builds, no local setup needed
✅ **Pros:** Builds on actual Windows, guaranteed compatibility
✅ **Cons:** Requires GitHub push, takes 5-10 minutes

The installer is **automatically built** on every push to `main` or `claude/**` branches.

**Steps:**
1. Push your code (already done)
2. Go to: https://github.com/SAVIOUR26/hgm-pos/actions
3. Wait for "Build Windows Installer" to complete
4. Download artifacts

**Manual trigger:**
```bash
# Push to trigger automatic build
git push origin claude/complete-pos-system-01XtA8fwTZyUnHjpRHrq1gjq

# Or trigger manually via GitHub UI:
# Actions tab > Build Windows Installer > Run workflow
```

### Method B: Build in Codespaces with Wine (Advanced)

✅ **Best for:** Quick local testing, offline builds
✅ **Pros:** Fast, no GitHub needed
✅ **Cons:** Requires Wine setup, may have compatibility issues

**Setup Wine (one-time):**
```bash
# Install Wine and dependencies
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install -y wine wine32 wine64

# Verify Wine installation
wine --version
```

**Build the installer:**
```bash
# Install dependencies
npm install

# Build all components
npm run build

# Build Windows installer with Wine
npm run electron:build
```

**Output:** `release/HGM-POS-Setup-1.0.0.exe`

**Note:** Wine builds may have issues. If it fails, use GitHub Actions instead.

---

## 🐳 Option 4: Build with Docker (Most Reliable)

This uses a Docker container with Windows build tools.

**Create build script:**
```bash
# This will be created below as build-windows-docker.sh
chmod +x build-windows-docker.sh
./build-windows-docker.sh
```

**Pros:**
- ✅ Consistent build environment
- ✅ No Wine configuration needed
- ✅ Works on any platform

**Cons:**
- ❌ Requires Docker installed
- ❌ Larger download (~2GB image)

---

## 📋 Development Workflows

### Workflow 1: Frontend Development
```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend with hot reload
npm run dev:frontend

# Open browser: http://localhost:5173
# Edit files in src/frontend/
# Changes auto-reload in browser
```

### Workflow 2: Backend Development
```bash
# Terminal 1: Start backend with auto-restart
npm run dev:backend

# Test API with curl or Postman
curl http://localhost:3000/api/items

# Edit files in src/backend/
# Restart backend to see changes
```

### Workflow 3: Full Stack Testing
```bash
# Run everything together
npm run dev

# Open: http://localhost:5173
# Test complete user flows
```

### Workflow 4: Electron Testing
```bash
# Build once
npm run build

# Run Electron
npm run electron:dev

# Test desktop-specific features
```

### Workflow 5: Production Build
```bash
# Build everything
npm run build

# Test production frontend locally
npx serve dist/frontend

# Or build Windows installer
npm run electron:build
```

---

## 🔧 Useful Commands

### Development
```bash
npm run dev              # Start backend + frontend
npm run dev:backend      # Backend only (port 3000)
npm run dev:frontend     # Frontend only (port 5173)
npm run electron:dev     # Electron app (development)
```

### Building
```bash
npm run build            # Build all (backend + frontend + electron)
npm run build:backend    # Compile backend TypeScript
npm run build:frontend   # Build frontend for production
npm run build:electron   # Compile Electron TypeScript
npm run electron:build   # Create Windows installer
```

### Database
```bash
# Reset database (Linux/Mac)
rm data/hgm-pos.db

# Reset database (Windows)
del data\hgm-pos.db

# Database auto-recreates on next backend start
```

### Testing
```bash
# Backend API health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🌍 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend Dev | 5173 | http://localhost:5173 |
| Production | 3000 | Backend serves frontend |

**Change ports:**
Edit `.env` file:
```env
PORT=3000  # Change backend port
```

For frontend dev port, edit `vite.config.ts`:
```typescript
server: {
  port: 5173  // Change frontend dev port
}
```

---

## 🐛 Troubleshooting

### Issue: "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### Issue: "Database locked"
```bash
# Close all backend instances
pkill -f "node.*backend"

# Restart backend
npm run dev:backend
```

### Issue: "Cannot connect to backend"
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check firewall settings
# Make sure port 3000 is accessible
```

### Issue: "Frontend shows blank page"
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run dev:frontend
```

### Issue: "Electron build fails with Wine"
```bash
# Solution 1: Use GitHub Actions instead
git push

# Solution 2: Reinstall Wine
sudo apt-get remove wine wine32 wine64
sudo apt-get install -y wine wine32 wine64

# Solution 3: Build on actual Windows machine
# Download code, run: npm install && npm run electron:build
```

### Issue: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Access from Other Devices (Mobile/Tablet)

You can access the POS system from other devices on the same network.

### Setup Backend for Network Access

1. **Find your IP address:**
```bash
# Linux/Mac
ifconfig | grep "inet "

# Or
hostname -I
```

2. **Update backend to listen on all interfaces:**

Edit `.env`:
```env
HOST=0.0.0.0  # Listen on all network interfaces
PORT=3000
```

3. **Update frontend API URLs:**

Edit `src/frontend/pages/POSInterface.tsx` and other files:
```typescript
// Replace all instances of:
http://localhost:3000

// With your IP:
http://192.168.1.100:3000  // Use your actual IP
```

4. **Restart services:**
```bash
npm run dev
```

5. **Access from mobile:**
```
http://192.168.1.100:5173
```

**Security Note:** Only do this on trusted networks. Use firewall rules in production.

---

## 🚀 Deployment Options

### Option 1: Windows Desktop (Recommended)
- Build installer with GitHub Actions
- Install on Windows PC
- Runs fully offline
- Best for: Physical POS terminals

### Option 2: Local Server (Network Access)
- Run `npm run dev` on a Linux/Windows server
- Access from multiple devices via IP address
- Best for: Multi-device setup

### Option 3: Cloud Deployment (Advanced)
- Deploy backend to cloud (Heroku, DigitalOcean, AWS)
- Deploy frontend to Vercel/Netlify
- Use cloud database (PostgreSQL instead of SQLite)
- Best for: Multiple locations, remote access

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Change default admin password
- [ ] Update JWT_SECRET in .env
- [ ] Configure Pesapal production credentials
- [ ] Set up HTTPS for public deployments
- [ ] Enable firewall rules
- [ ] Set up database backups
- [ ] Test printer and cash drawer security
- [ ] Review user access levels
- [ ] Set up logging and monitoring

---

## 📚 Additional Resources

- **Full Documentation:** See `CLAUDE_CODE_INSTRUCTIONS.md`
- **Completion Summary:** See `COMPLETION_SUMMARY.md`
- **Windows Build Guide:** See `BUILD_WINDOWS_INSTALLER.md`
- **API Documentation:** Coming soon
- **User Manual:** Coming soon

---

## 💡 Tips & Best Practices

1. **Development:**
   - Use browser mode for UI development (faster iteration)
   - Use Electron mode for hardware testing
   - Keep backend running in separate terminal

2. **Testing:**
   - Test cash payments first (simplest)
   - Test Pesapal in sandbox before production
   - Verify printer works before connecting cash drawer

3. **Building:**
   - Use GitHub Actions for production builds
   - Test installer on clean Windows VM
   - Keep installer artifacts for rollback

4. **Database:**
   - Back up `data/hgm-pos.db` regularly
   - Test restore procedure
   - Consider scheduled backups

5. **Performance:**
   - Monitor database size (SQLite has limits)
   - Archive old transactions if needed
   - Optimize images (keep under 500KB each)

---

## 🆘 Getting Help

If you encounter issues:

1. Check logs:
   - Backend: Console output
   - Frontend: Browser DevTools console
   - Electron: Both main and renderer logs

2. Search for error messages in this guide

3. Check GitHub Issues: https://github.com/SAVIOUR26/hgm-pos/issues

4. Review completed tasks in `COMPLETION_SUMMARY.md`

---

**Happy Coding!** 🎉
