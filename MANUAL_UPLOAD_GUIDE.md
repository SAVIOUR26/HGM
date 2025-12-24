# 📦 MANUAL FTP UPLOAD GUIDE
## HGM POS System - Production Ready Package

This is a **clean, production-ready** version for manual FTP upload to DirectAdmin.

---

## ✅ WHAT'S READY

All files are built and ready to upload. No GitHub Actions, no complications!

**✓ Backend API (PHP)** - Complete and tested
**✓ Frontend (React PWA)** - Built and optimized
**✓ Database Schema** - Ready to import
**✓ PWA Features** - Offline support, mobile optimized
**✓ All Features** - Printing, password change, mobile responsive

---

## 📋 STEP 1: DOWNLOAD THIS BRANCH

**Download the entire repository:**

1. **Option A - Git Clone:**
   ```bash
   git clone https://github.com/SAVIOUR26/HGM.git
   cd HGM
   git checkout production-manual-upload
   ```

2. **Option B - Download ZIP:**
   - Go to: https://github.com/SAVIOUR26/HGM
   - Click branch dropdown → Select `production-manual-upload`
   - Click green "Code" button → Download ZIP
   - Extract ZIP file

---

## 📁 STEP 2: WHAT TO UPLOAD

### **Upload these folders/files to DirectAdmin FTP:**

```
YOUR FTP CLIENT:
Connect to: wh175143.ispot.cc (or your FTP server)
Username: hideout@wh175143.ispot.cc
Password: Hide@25
Navigate to: /home/elibrary/domains/hideout.wh175143.ispot.cc/public_html/
```

### **Upload Structure:**

```
public_html/
│
├── api/                          ← Upload entire folder from project
│   ├── config/
│   │   ├── config.example.php   ⚠️ See Step 3 below
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
├── assets/                       ← From dist/web/assets/
│   ├── index-BvrwU59C.css
│   └── index-C8Gnj3qQ.js
│
├── .vite/                        ← From dist/web/.vite/
│   └── manifest.json
│
├── index.html                    ← From dist/web/
├── manifest.json                 ← From public/
├── sw.js                         ← From public/
├── icon.png                      ← From public/
└── .htaccess                     ← From dist/web/
```

---

## 🔧 STEP 3: CONFIGURE DATABASE

**After uploading, configure database connection:**

### **Via FTP:**

1. **Navigate to:** `public_html/api/config/`
2. **Rename:** `config.example.php` → `config.php`
3. **Edit** `config.php` with text editor or DirectAdmin File Manager
4. **Update these lines:**

```php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'elibrary_hideout');
define('DB_USER', 'elibrary_hideout');
define('DB_PASS', 'Hide@2025');

// JWT Secret Key (keep as is or change to your own random string)
define('JWT_SECRET', 'HGM_POS_2024_aB3dE5fG7hJ9kL2mN4pQ6rS8tU0vW1xY3zA5bC7dE9fG1hJ3kL5');
```

5. **Save the file**

---

## 🗄️ STEP 4: IMPORT DATABASE

**Via DirectAdmin phpMyAdmin:**

1. **Login to DirectAdmin**
2. **Go to:** MySQL Management → phpMyAdmin
3. **Select database:** `elibrary_hideout`
4. **Click:** "Import" tab
5. **Choose file:** `database.sql` (from project root folder)
6. **Click:** "Go" button
7. **Verify:** 5 tables created (users, items, transactions, transaction_items, business_settings)

**⚠️ DO THIS ONLY ONCE!**

---

## 🎯 STEP 5: TEST YOUR SITE

**Visit your site:**
```
https://hideout.wh175143.ispot.cc
```

**Login with default credentials:**
```
Username: admin
Password: admin123
```

**✅ You should see:**
- Beautiful login page
- Dashboard with 3 sections (Bar, Restaurant, Lodge)
- Admin Panel button
- Everything working!

---

## 🔒 STEP 6: IMMEDIATE SECURITY

**DO THIS RIGHT AWAY:**

1. **Change Admin Password:**
   - Click "👤 My Profile"
   - Enter current: `admin123`
   - Enter new password
   - Save

2. **Update Business Settings:**
   - Admin Panel → Settings → Receipt Customization
   - Update business name, phone, email, address
   - Save

3. **Add Your Products:**
   - Admin Panel → Items
   - Add your Bar/Restaurant/Lodge items
   - Set prices and stock

4. **Create Cashier Accounts:**
   - Admin Panel → Users
   - Create cashier accounts
   - Test login

---

## 🖨️ STEP 7: SETUP THERMAL PRINTER

**On POS computer:**

1. **Install printer driver** (80mm thermal printer)
2. **Set as default printer** in Windows
3. **Complete a test sale** in HGM POS
4. **Select printer** in print dialog (first time)
5. **Next time:** Auto-prints! ✅

---

## 📂 DETAILED FILE MAPPING

**Here's exactly what goes where:**

| From Your Project | → | Upload To Public_HTML |
|-------------------|---|----------------------|
| `api/` (entire folder) | → | `public_html/api/` |
| `dist/web/index.html` | → | `public_html/index.html` |
| `dist/web/assets/` (folder) | → | `public_html/assets/` |
| `dist/web/.vite/` (folder) | → | `public_html/.vite/` |
| `dist/web/.htaccess` | → | `public_html/.htaccess` |
| `public/manifest.json` | → | `public_html/manifest.json` |
| `public/sw.js` | → | `public_html/sw.js` |
| `public/icon.png` | → | `public_html/icon.png` |

**Database:**
| File | Action |
|------|--------|
| `database.sql` | Import via phpMyAdmin (one-time) |

---

## 🎨 FTP CLIENT SETTINGS

**Recommended FTP Client:** FileZilla (free)

**Settings:**
```
Host: wh175143.ispot.cc (or your actual FTP server)
Username: hideout@wh175143.ispot.cc
Password: Hide@25
Port: 21 (for FTP) or 22 (for SFTP)
Protocol: FTP or SFTP
Remote Path: /home/elibrary/domains/hideout.wh175143.ispot.cc/public_html/
```

**Transfer Settings:**
- Transfer mode: Binary (important!)
- File permissions: 644 for files, 755 for folders

---

## ✅ VERIFICATION CHECKLIST

After upload:

- [ ] All folders uploaded to public_html
- [ ] config.php created and configured in api/config/
- [ ] database.sql imported via phpMyAdmin
- [ ] Site loads at https://hideout.wh175143.ispot.cc
- [ ] Login works (admin/admin123)
- [ ] Admin password changed
- [ ] Business settings updated
- [ ] Test products added
- [ ] Thermal printer tested

---

## 🐛 TROUBLESHOOTING

**Site shows 404 or blank page:**
- Check .htaccess uploaded to public_html root
- Verify index.html is in public_html root
- Check file permissions (644 for files)

**Login fails:**
- Verify database imported successfully
- Check api/config/config.php has correct credentials
- Test API: https://hideout.wh175143.ispot.cc/api/health

**Database connection error:**
- Double-check DB_NAME, DB_USER, DB_PASS in config.php
- Verify database exists in DirectAdmin
- Check database user has privileges

**Printing not working:**
- Set thermal printer as Windows default
- Allow browser popups
- Test with Ctrl+P first

---

## 🎉 YOU'RE DONE!

Once everything is uploaded and configured:

✅ **Your HGM POS System is LIVE!**
✅ **Professional and secure**
✅ **Mobile optimized**
✅ **Ready for customers**

**Live URL:** https://hideout.wh175143.ispot.cc

---

## 📦 PACKAGE CONTENTS

**This branch includes:**
- ✅ Complete PHP backend API
- ✅ Built React PWA frontend
- ✅ MySQL database schema
- ✅ Browser thermal printing
- ✅ Mobile responsive CSS
- ✅ Change password feature
- ✅ All documentation
- ✅ Production optimized
- ✅ Security hardened

**Version:** 2.0.0-PWA-Manual
**Build Date:** December 24, 2024
**Total Size:** ~275 KB (optimized!)

---

**Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions!**
