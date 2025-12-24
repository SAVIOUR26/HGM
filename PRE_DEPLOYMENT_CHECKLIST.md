# 🚀 PRE-DEPLOYMENT CHECKLIST
## HGM POS System - PWA Edition for DirectAdmin

Complete this checklist before deploying to ensure professional, seamless installation.

---

## ✅ FILES VERIFICATION

### **Database**
- [x] `database.sql` - 5.6KB - MySQL schema with all tables
  - Location: `/home/user/HGM/database.sql`
  - Includes: users, items, transactions, transaction_items, business_settings
  - Default admin: username=`admin`, password=`admin123`
  - Sample data: 10 items (Bar, Restaurant, Lodge)

### **Backend API (PHP)**
- [x] `api/` folder complete with all endpoints
  - `api/index.php` - Main router
  - `api/config/database.php` - MySQL connection
  - `api/config/jwt.php` - Authentication
  - `api/config/config.example.php` - Configuration template
  - `api/auth/login.php` - Login endpoint
  - `api/auth/change-password.php` - Password change endpoint
  - `api/items/index.php` - Item management
  - `api/users/index.php` - User management
  - `api/transactions/index.php` - Sales transactions
  - `api/receipt/index.php` - Receipt data API
  - `api/settings/index.php` - Business settings
  - `api/reports/index.php` - Analytics & reports
  - `api/.htaccess` - URL rewriting

### **Frontend (React)**
- [x] `dist/web/` - Production build ready
  - `index.html` - Entry point
  - `assets/` - Optimized CSS/JS bundles
  - `.vite/manifest.json` - Build manifest

### **PWA Assets**
- [x] `public/manifest.json` - PWA manifest
- [x] `public/sw.js` - Service Worker (offline support)
- [x] `public/icon.png` - App icon (512x512)

### **Documentation**
- [x] `QUICK_START.md` - 5-minute deployment guide
- [x] `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- [x] `README_PWA.md` - Technical overview
- [x] `PRE_DEPLOYMENT_CHECKLIST.md` - This file

---

## ✅ FEATURES VERIFICATION

### **Core POS Features**
- [x] Multi-section support (Bar, Restaurant, Lodge)
- [x] Real-time cart management
- [x] Item search and filtering
- [x] Stock management
- [x] Multiple payment methods (Cash, Card, Mobile Money)
- [x] Auto-calculate totals and change

### **Admin Panel**
- [x] Item Management (Add, Edit, Delete, Stock control)
- [x] User Management (Create/Delete cashiers)
- [x] Business Settings (Receipt customization)
- [x] Role-based access control
- [x] PesaPal configuration panel

### **Reports & Analytics**
- [x] Sales by date range
- [x] Sales by section
- [x] Sales by payment method
- [x] Top selling items
- [x] Low stock alerts
- [x] Daily/weekly/monthly summaries

### **Security**
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Role-based access control (Admin/Cashier)
- [x] SQL injection protection (PDO prepared statements)
- [x] XSS protection headers
- [x] HTTPS enforcement
- [x] Change password functionality

### **Browser Printing** ✅
- [x] 80mm thermal receipt formatting
- [x] Professional receipt layout
- [x] Business info header (configurable)
- [x] Itemized list with quantities
- [x] Total and payment method
- [x] Custom footer message
- [x] Auto-print after sale
- [x] Print preview capability
- [x] Works with any ESC/POS compatible 80mm printer

### **Mobile Optimization** ✅
- [x] Responsive design (tablets & phones)
- [x] Touch-friendly buttons (44px minimum)
- [x] Mobile-optimized layouts
- [x] iOS safe area support
- [x] Landscape orientation handling
- [x] PWA installation capability

### **User Management**
- [x] Login/Logout functionality
- [x] Profile page
- [x] Change password
- [x] Session persistence (localStorage)

---

## 🖨️ BROWSER PRINTING - HOW IT WORKS

### **Technical Implementation:**

1. **Receipt Generation:**
   - Transaction data fetched from `/api/receipt?id={transaction_id}`
   - HTML receipt generated with professional 80mm thermal formatting
   - CSS optimized for thermal printer paper width

2. **Print Process:**
   - Uses browser's native `window.print()` API
   - Opens receipt in new window
   - Automatically triggers print dialog
   - User selects thermal printer (remembers selection)

3. **Format:**
   - Width: 80mm (302px)
   - Font: Courier New (monospace for alignment)
   - Sections: Header, Transaction Info, Items Table, Total, Footer
   - Print-specific CSS (`@media print`)

4. **Printer Compatibility:**
   - Any 80mm ESC/POS thermal printer
   - XPRINTER (all models)
   - Epson TM-T20/T82/T88
   - Star TSP100/TSP143
   - Generic ESC/POS printers

5. **User Experience:**
   - First time: Print dialog appears, user selects printer
   - Subsequent prints: Browser remembers printer selection
   - Receipt auto-formatted for 80mm paper
   - Clean, professional output

### **Files:**
- `src/frontend/utils/thermalPrinter.ts` - Receipt generation & printing
- `api/receipt/index.php` - Receipt data endpoint
- Integrated in: `src/frontend/pages/POSInterface.tsx`

---

## 📋 DEPLOYMENT REQUIREMENTS

### **Server Requirements:**
- [x] PHP 7.4 or higher
- [x] MySQL 5.7 or higher
- [x] Apache with mod_rewrite
- [x] SSL certificate (Let's Encrypt free)
- [x] DirectAdmin control panel

### **Client Requirements:**
- [x] Modern browser (Chrome 90+, Edge 90+, Safari 14+)
- [x] HTTPS connection (required for PWA)
- [x] 80mm thermal printer (optional, for receipts)

---

## 🔧 CONFIGURATION CHECKLIST

### **Before Upload:**
1. [ ] Create MySQL database in DirectAdmin
2. [ ] Note database name, username, password
3. [ ] Have FTP credentials ready
4. [ ] Verify domain has SSL certificate

### **After Upload:**
1. [ ] Rename `api/config/config.example.php` to `config.php`
2. [ ] Edit `config.php` with database credentials
3. [ ] Import `database.sql` via phpMyAdmin
4. [ ] Verify file permissions (folders: 755, files: 644)
5. [ ] Test login with `admin` / `admin123`
6. [ ] Change default admin password immediately
7. [ ] Update business settings in Admin Panel

---

## 📦 FILES TO UPLOAD VIA FTP

```
public_html/
├── api/                         ← Entire folder
│   ├── config/
│   │   ├── config.example.php   (rename to config.php after upload)
│   │   ├── database.php
│   │   └── jwt.php
│   ├── auth/
│   ├── items/
│   ├── users/
│   ├── transactions/
│   ├── receipt/
│   ├── settings/
│   ├── reports/
│   ├── .htaccess
│   └── index.php
│
├── assets/                      ← From dist/web/assets/
│   ├── index-*.css
│   └── index-*.js
│
├── .vite/                       ← From dist/web/.vite/
│   └── manifest.json
│
├── index.html                   ← From dist/web/
├── manifest.json                ← From public/
├── sw.js                        ← From public/
├── icon.png                     ← From public/
└── .htaccess                    ← From dist/web/
```

**Database:**
- Import `database.sql` via DirectAdmin → phpMyAdmin

---

## 🧪 TESTING CHECKLIST

### **After Deployment:**
1. [ ] Visit `https://yourdomain.com`
2. [ ] Verify login page loads
3. [ ] Login with `admin` / `admin123`
4. [ ] Test POS interface (add items to cart)
5. [ ] Complete a test transaction
6. [ ] Test receipt printing
7. [ ] Test admin panel (add item, create user)
8. [ ] Test reports page
9. [ ] Test change password functionality
10. [ ] Test mobile responsive design
11. [ ] Test PWA installation (Add to Home Screen)
12. [ ] Test offline mode

### **Security Tests:**
1. [ ] Verify HTTPS is enforced
2. [ ] Change default admin password
3. [ ] Create test cashier account
4. [ ] Verify cashier can't access admin panel
5. [ ] Test logout functionality
6. [ ] Verify JWT token expiration

### **Printer Tests:**
1. [ ] Install thermal printer driver
2. [ ] Set as default printer in Windows
3. [ ] Complete a sale transaction
4. [ ] Verify print dialog appears
5. [ ] Select thermal printer
6. [ ] Verify receipt prints correctly
7. [ ] Test subsequent prints (should remember printer)

---

## 🎯 POST-DEPLOYMENT SETUP

### **Immediate Actions:**
1. **Change Default Password**
   - Login as admin
   - Go to "My Profile"
   - Change password from `admin123` to strong password

2. **Update Business Settings**
   - Admin Panel → Settings → Receipt Customization
   - Enter business name, phone, email, address
   - Set custom footer message
   - Save settings

3. **Add Your Items**
   - Admin Panel → Items
   - Add products for Bar section
   - Add products for Restaurant section
   - Add products for Lodge section
   - Set prices and stock levels

4. **Create Cashier Accounts**
   - Admin Panel → Users
   - Create accounts for cashiers
   - Use strong passwords
   - Test cashier login

5. **Configure Printer**
   - Install 80mm thermal printer driver
   - Set as default printer
   - Test print from system

---

## 📊 PERFORMANCE CHECKLIST

- [x] Frontend optimized (Vite production build)
- [x] CSS minified and compressed
- [x] JavaScript bundled and tree-shaken
- [x] Images optimized
- [x] GZIP compression enabled (.htaccess)
- [x] Browser caching configured
- [x] Service Worker caching for offline
- [x] Lazy loading where applicable

---

## 🔒 SECURITY CHECKLIST

- [x] JWT secret configured
- [x] Password hashing (bcrypt)
- [x] SQL injection protection (PDO)
- [x] XSS protection headers
- [x] HTTPS enforcement
- [x] CORS properly configured
- [x] Sensitive files protected (.htaccess)
- [x] Config file secured
- [x] Database credentials in separate file

---

## 📱 PWA CHECKLIST

- [x] manifest.json configured
- [x] Service Worker registered
- [x] Offline support enabled
- [x] Icons provided (512x512)
- [x] Theme color set
- [x] Display mode: standalone
- [x] HTTPS required (enforced)
- [x] iOS meta tags included

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Login Not Working:**
- Check database credentials in `api/config/config.php`
- Verify database was imported successfully
- Check browser console for errors (F12)

### **API Errors:**
- Verify `api/.htaccess` was uploaded
- Check file permissions (folders: 755, files: 644)
- Check PHP error logs in DirectAdmin

### **Printing Not Working:**
- Ensure thermal printer is set as default
- Allow browser popups
- Test with Ctrl+P first
- Verify printer driver is installed

### **PWA Won't Install:**
- Verify site is using HTTPS
- Check `manifest.json` is accessible
- Clear browser cache and try again
- Ensure `sw.js` is in root directory

---

## ✅ FINAL VERIFICATION

Before going live:

- [ ] All files uploaded successfully
- [ ] Database imported without errors
- [ ] Configuration file updated with credentials
- [ ] Default admin password changed
- [ ] Business settings configured
- [ ] Sample items added
- [ ] Cashier account created and tested
- [ ] Thermal printer tested and working
- [ ] Mobile responsive design verified
- [ ] PWA installation tested
- [ ] All security checks passed
- [ ] Backup database created

---

## 🎉 READY FOR PRODUCTION

Once all items are checked:

✅ **System is production-ready!**
✅ **Professional and secure**
✅ **Mobile-optimized**
✅ **Browser printing working**
✅ **PWA-enabled**

**Your HGM POS System is ready to serve customers!**

---

## 📞 SUPPORT

**Documentation:**
- QUICK_START.md - Fast deployment
- DEPLOYMENT_GUIDE.md - Detailed instructions
- README_PWA.md - Technical details

**Default Login:**
- Username: `admin`
- Password: `admin123` (CHANGE IMMEDIATELY!)

**Database Location:**
- `database.sql` in project root

**Version:** 2.0.0-PWA
**Build Date:** December 24, 2024
**Platform:** PHP + MySQL + React PWA
