# 🏪 HGM POS System

A complete Point of Sale desktop application for **HGM Properties Ltd** in Kampala, Uganda.

Built with **Electron + React + Node.js + TypeScript + SQLite**

---

## ✨ Features

### 💰 Point of Sale
- ✅ Three sections: **Bar**, **Restaurant**, **Lodge**
- ✅ Touch-optimized interface
- ✅ Real-time cart management
- ✅ Category filtering & search
- ✅ Section-specific color themes

### 💳 Payment Methods
- ✅ **Cash** payments with auto-print receipt
- ✅ **Card** payments via Pesapal
- ✅ **Mobile Money** (MTN/Airtel) via Pesapal
- ✅ Real-time payment status tracking

### 🖨️ Hardware Integration
- ✅ **Thermal printer** support (ESC/POS, USB)
- ✅ **Cash drawer** control (via printer RJ11 port)
- ✅ Auto-print receipts after payment
- ✅ Manual cash drawer button

### 👥 User Management
- ✅ Admin and Cashier roles
- ✅ JWT authentication
- ✅ User access control
- ✅ Session management

### 📊 Reports & Analytics
- ✅ Daily sales summary
- ✅ Sales by section (Bar/Restaurant/Lodge)
- ✅ Payment method breakdown
- ✅ Top selling items
- ✅ Cashier performance
- ✅ Hourly sales patterns

### 📦 Inventory Management
- ✅ Add/edit/delete items
- ✅ Price management
- ✅ Stock tracking
- ✅ Low stock alerts
- ✅ Category management

### 🔒 Other Features
- ✅ **Offline-first** (works without internet except for payments)
- ✅ **SQLite database** (no external database needed)
- ✅ **Auto-starting backend** (no manual setup)
- ✅ **Windows desktop app** (one-click installer)
- ✅ **Pre-loaded sample data** (40+ items)

---

## 🚀 Quick Start

### Run in Browser (Recommended for Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run dev

# 3. Open in browser
# http://localhost:5173
```

**Login:**
- Username: `admin`
- Password: `admin123`

**See:** [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

---

## 📦 Build Windows Installer

### Option 1: GitHub Actions (Recommended)

Installers are **automatically built** on every push.

1. Go to: https://github.com/SAVIOUR26/hgm-pos/actions
2. Find "Build Windows Installer" workflow
3. Download artifacts
4. Run `HGM-POS-Setup-1.0.0.exe` on Windows

### Option 2: Docker Build (Local)

```bash
./build-windows-docker.sh
```

### Option 3: Wine Build (Quick)

```bash
./build-windows-wine.sh
```

**See:** [BUILD_WINDOWS_INSTALLER.md](BUILD_WINDOWS_INSTALLER.md) for detailed instructions.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get started in 2 minutes |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | Complete development guide |
| [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) | All features & implementation details |
| [CLAUDE_CODE_INSTRUCTIONS.md](CLAUDE_CODE_INSTRUCTIONS.md) | Original project requirements |
| [BUILD_WINDOWS_INSTALLER.md](BUILD_WINDOWS_INSTALLER.md) | Windows build instructions |

---

## 🏗️ Project Structure

```
hgm-pos/
├── src/
│   ├── backend/          # Node.js + Express API
│   │   ├── database/     # SQLite database & migrations
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic (Pesapal, Printer)
│   │   └── middleware/   # Authentication
│   ├── frontend/         # React + TypeScript UI
│   │   ├── pages/        # POS, Admin, Reports, Login
│   │   └── App.tsx       # Main app component
│   └── electron/         # Electron main & preload
├── data/                 # SQLite database (auto-created)
├── dist/                 # Build output
├── release/              # Windows installer output
└── public/               # Static assets & icons
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.2 - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Inline CSS** - Styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** 5 - Web framework
- **TypeScript** - Type safety
- **SQLite3** - Embedded database

### Desktop
- **Electron** 38 - Desktop wrapper
- **electron-builder** - Installer creation

### Integrations
- **Pesapal API** - Payment gateway (card & mobile money)
- **ESC/POS** - Thermal printer protocol
- **JWT** - Authentication tokens

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_PATH=./data/hgm-pos.db

# Security
JWT_SECRET=your-super-secret-jwt-key

# Business Information
BUSINESS_NAME=HGM Properties Ltd
BUSINESS_ADDRESS=Kampala, Uganda
BUSINESS_PHONE=+256-XXX-XXXXXX
BUSINESS_EMAIL=info@hgmproperties.com

# Pesapal Payment Gateway
PESAPAL_CONSUMER_KEY=your-consumer-key
PESAPAL_CONSUMER_SECRET=your-consumer-secret
PESAPAL_ENVIRONMENT=sandbox
PESAPAL_IPN_URL=http://localhost:3000/api/payment/callback
```

**See:** `.env.example` for all available options.

---

## 🖥️ System Requirements

### Development
- **Node.js** 18+ (LTS recommended)
- **npm** 8+
- **Git**
- **OS:** Windows, macOS, or Linux

### Production (Windows Desktop)
- **Windows** 10/11 (64-bit)
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 1GB free space
- **Optional:** USB thermal printer (80mm)
- **Optional:** Cash drawer (RJ11 connection)

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start backend + frontend (browser)
npm run dev:backend      # Backend only (port 3000)
npm run dev:frontend     # Frontend only (port 5173)
npm run electron:dev     # Electron app (development mode)

# Building
npm run build            # Build all components
npm run build:backend    # Backend TypeScript compilation
npm run build:frontend   # Frontend production build
npm run build:electron   # Electron TypeScript compilation
npm run electron:build   # Create Windows installer

# Utilities
npm run create-icon      # Generate app icons
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Register new user (admin only)

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Payments (Pesapal)
- `GET /api/payment/config` - Get Pesapal config
- `POST /api/payment/initiate` - Initiate payment
- `GET /api/payment/status/:id` - Check payment status
- `POST /api/payment/callback` - IPN callback
- `POST /api/payment/cancel/:id` - Cancel payment

### Receipts
- `GET /api/receipt/:transactionId` - Get receipt data
- `POST /api/receipt/print` - Print receipt
- `POST /api/receipt/cash-drawer` - Open cash drawer
- `POST /api/receipt/test-print` - Test printer
- `GET /api/receipt/printers` - List printers

### Reports
- `GET /api/reports/daily-summary` - Daily sales
- `GET /api/reports/by-section` - Section breakdown
- `GET /api/reports/by-payment-method` - Payment methods
- `GET /api/reports/top-items` - Best sellers
- `GET /api/reports/by-cashier` - Cashier performance

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get items (with auth token)
curl http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**Cashier Account:**
- Username: `cashier`
- Password: `cashier123`
- Role: `cashier`

### Pesapal Test Cards (Sandbox)

**Card Number:** 5100 0000 0000 0000
**Expiry:** Any future date
**CVV:** Any 3 digits

---

## 🚀 Deployment

### Windows Desktop (Recommended)

1. Build installer using GitHub Actions
2. Download `HGM-POS-Setup-1.0.0.exe`
3. Install on Windows PC
4. Launch from Start Menu or desktop
5. Configure `.env` with production credentials

### Network Server (Multi-Device)

1. Deploy on Linux/Windows server
2. Run `npm run dev`
3. Access from devices via IP: `http://192.168.x.x:5173`
4. Configure firewall rules
5. Set up HTTPS for public access

---

## 🔐 Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ SQL injection protection
- ✅ CORS configuration
- ⚠️ Change default passwords in production
- ⚠️ Update JWT_SECRET in .env
- ⚠️ Use HTTPS for public deployments

---

## 🐛 Troubleshooting

### Common Issues

**"Port 3000 already in use"**
```bash
pkill -f "node.*backend"
# Or change PORT in .env
```

**"Cannot connect to backend"**
```bash
# Check if backend is running
curl http://localhost:3000/api/health
```

**"Database locked"**
```bash
# Close all backend instances
pkill -f "node.*backend"
# Restart
npm run dev:backend
```

**"Printer not found"**
- Check USB connection
- Install printer drivers
- Receipts save to `temp/receipts/` as fallback

**"Cash drawer won't open"**
- Verify connection to printer RJ11 port
- Check drawer power supply
- Try alternative pin in `printerService.ts`

**See:** [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for more troubleshooting.

---

## 📄 License

Proprietary - Built for HGM Properties Ltd

---

## 👨‍💻 Development

Built with ❤️ for HGM Properties Ltd, Kampala, Uganda

**Technologies:**
- Electron + React + Node.js + TypeScript
- SQLite + Express + Vite
- Pesapal API + ESC/POS

**Features:**
- 🏪 Complete POS system
- 💳 Payment gateway integration
- 🖨️ Hardware support (printer, cash drawer)
- 📊 Reports & analytics
- 🔒 Offline-first architecture

---

## 🆘 Support

For issues, questions, or feature requests:

1. Check documentation in the repo
2. Review [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
3. Check [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)
4. Open an issue on GitHub

---

## 🎉 Get Started Now!

```bash
git clone https://github.com/SAVIOUR26/hgm-pos
cd hgm-pos
npm install
npm run dev
```

Open http://localhost:5173 and login with `admin/admin123`

**Enjoy!** 🚀
