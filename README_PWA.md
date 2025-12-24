# HGM POS System - PWA Edition

## Progressive Web App for DirectAdmin Shared Hosting

This is the **PWA (Progressive Web App) version** of HGM POS System, specifically designed for deployment on **DirectAdmin shared hosting** with **PHP + MySQL**.

---

## 🎯 What's Different from Desktop Version?

### ✅ **Advantages:**

1. **No Installation Required** - Install via browser (Add to Home Screen)
2. **Auto Updates** - Just update files on server, everyone gets updates
3. **Cross-Platform** - Works on Windows, Android tablets, phones
4. **Simpler Deployment** - FTP upload, no build complexity
5. **ASAP Ready** - Deploy in 5 minutes!
6. **Lower System Requirements** - Runs in browser, no Electron overhead

### ⚠️ **Differences:**

1. **Printing:**
   - Uses browser print dialog (select printer each time, then it remembers)
   - Works perfectly with 80mm thermal printers if set as default
   - No "silent printing" (requires user interaction first time)

2. **Cash Drawer:**
   - Removed (was Electron-specific hardware access)
   - Thermal printers with built-in cash drawer can still use kick-drawer codes

3. **Offline Mode:**
   - Basic offline support via Service Worker
   - Transactions must sync when back online

---

## 🏗️ Architecture

**Backend:** Pure PHP 8.0+ with PDO (MySQL)
**Frontend:** React 19 with TypeScript
**Database:** MySQL
**Authentication:** JWT (JSON Web Tokens)
**Deployment:** Apache with .htaccess rewriting
**PWA Features:** Service Worker, Web App Manifest, Offline caching

---

## 📦 What's Included

### Backend (PHP)
```
api/
├── config/
│   ├── config.example.php    (rename to config.php)
│   ├── database.php           (MySQL PDO connection)
│   └── jwt.php                (JWT authentication)
├── auth/
│   └── login.php              (User authentication)
├── items/
│   └── index.php              (Item management)
├── users/
│   └── index.php              (User management)
├── transactions/
│   └── index.php              (Sales transactions)
├── receipt/
│   └── index.php              (Receipt data API)
├── settings/
│   └── index.php              (Business settings)
├── reports/
│   └── index.php              (Analytics & reports)
├── .htaccess                  (API routing)
└── index.php                  (Main router)
```

### Frontend (React)
```
dist/web/
├── index.html
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── .vite/
    └── manifest.json
```

### PWA Assets
```
public/
├── manifest.json    (PWA manifest)
├── sw.js           (Service Worker)
└── icon.png        (App icon 512x512)
```

### Database
```
database.sql        (MySQL schema with sample data)
```

---

## 🚀 Quick Deployment

See **[QUICK_START.md](./QUICK_START.md)** for 5-minute deployment guide.

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

---

## 🎨 Features

### ✅ Complete POS Functionality
- Multi-section POS (Bar, Restaurant, Lodge)
- Real-time cart management
- Multiple payment methods (Cash, Card, Mobile Money)
- Auto-calculate totals and change
- Fast search and filtering

### ✅ Admin Panel
- Item Management (Add, Edit, Delete, Stock control)
- User Management (Create cashiers, manage roles)
- Business Settings (Receipt customization)
- Printer Configuration
- PesaPal Payment Gateway (API 3.0 ready)

### ✅ Reports & Analytics
- Sales by date range
- Sales by section (Bar, Restaurant, Lodge)
- Sales by payment method
- Top selling items
- Low stock alerts
- Daily/weekly/monthly summaries

### ✅ Thermal Printing
- Formatted for 80mm thermal printers
- Professional receipt layout
- Configurable business info
- Custom footer messages
- Auto-print after sale

### ✅ Security
- JWT authentication
- Role-based access control
- Password hashing (bcrypt)
- SQL injection protection (PDO prepared statements)
- XSS protection
- HTTPS enforcement

### ✅ PWA Features
- Install to home screen/desktop
- Offline-capable
- Fast loading with caching
- Mobile responsive
- App-like experience

---

## 🔧 System Requirements

### **Server:**
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite
- SSL certificate (Let's Encrypt free)
- Shared hosting or VPS

### **Client:**
- Modern browser (Chrome 90+, Edge 90+, Safari 14+)
- HTTPS connection (required for PWA)
- 80mm thermal printer (optional, for receipts)

---

## 🖨️ Printer Compatibility

### **Supported Printers:**
- XPRINTER (all models)
- Epson TM-T20/T82/T88
- Star TSP100/TSP143
- Any ESC/POS compatible 80mm thermal printer

### **Setup:**
1. Install printer driver on POS computer
2. Set as default printer in Windows
3. Open HGM POS in browser
4. Receipts auto-formatted for 80mm paper
5. Print dialog appears after each sale (first time)
6. Browser remembers printer selection

### **Print Preview:**
- Professional layout
- Business info header
- Itemized list with quantities
- Total and payment method
- Custom footer message
- Optimized for thermal paper

---

## 👥 User Roles

### **Admin**
- Full access to all features
- Item management
- User management
- Business settings
- Sales reports
- POS operations

### **Cashier**
- POS operations only
- View items
- Process sales
- Print receipts
- No admin panel access

---

## 🔐 Security Notes

1. **Change default password** immediately after deployment
2. **Update JWT secret** in `api/config/config.php`
3. **Secure config.php** - ensure not publicly accessible
4. **Use HTTPS** - SSL required for PWA features
5. **Regular backups** - backup database weekly
6. **Keep updated** - update files when new version available

---

## 📱 Mobile Support

### **Tablets (Recommended)**
- 10" tablets work best for POS interface
- Landscape orientation recommended
- Android tablets with Chrome
- iPad with Safari

### **Phones**
- Works but small screen
- Best for admin tasks, reports
- Not ideal for cashier operations

---

## 🐛 Known Limitations

1. **First Print Requires User Action:**
   - Browser security prevents automatic silent printing
   - First print opens dialog
   - Subsequent prints remember selection

2. **Offline Mode:**
   - Basic caching only
   - Transactions must sync when online
   - Not suitable for extended offline use

3. **Hardware Access:**
   - No direct USB printer access (use Windows print dialog)
   - No cash drawer control (unless printer has built-in)
   - No barcode scanner support (can be added via keyboard wedge)

---

## 🔄 Migrating from Desktop Version

If you have the Electron desktop version and want to switch to PWA:

1. **Export your database** from SQLite
2. **Convert to MySQL** using provided migration script
3. **Import to MySQL** via phpMyAdmin
4. **Deploy PWA** following deployment guide
5. **Test thoroughly** before switching users

Note: Database structure is identical, only format changes (SQLite → MySQL).

---

## 📞 Support & Updates

### **Getting Help:**
- Check **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** first
- Check browser console (F12) for errors
- Check DirectAdmin PHP error logs
- Verify file permissions and .htaccess

### **Updates:**
To update to a new version:
1. Backup your database
2. Backup your `api/config/config.php`
3. Upload new files via FTP
4. Restore your config.php
5. Check for database migrations
6. Test functionality

---

## 📄 License

© 2024 HGM Properties Ltd. All rights reserved.

This software is proprietary and confidential.

---

## 🎉 Credits

**Developed for:** HGM Properties Ltd, Kampala, Uganda
**Version:** 2.0.0-PWA
**Technology Stack:** PHP + MySQL + React + TypeScript
**Build Date:** December 24, 2024

---

## ✨ Coming Soon (Future Features)

- [ ] Barcode scanner support
- [ ] Multi-currency support
- [ ] WhatsApp receipt sending
- [ ] Email receipts
- [ ] Advanced inventory management
- [ ] Supplier management
- [ ] Employee time tracking
- [ ] Table management (for restaurant)
- [ ] Room booking (for lodge)

---

**Happy Selling! 🚀**

For immediate deployment, see: **[QUICK_START.md](./QUICK_START.md)**
