# HGM POS System - PWA Deployment Guide

## DirectAdmin Shared Hosting Deployment

This guide will walk you through deploying the HGM POS System as a Progressive Web App (PWA) on DirectAdmin shared hosting.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ **DirectAdmin hosting account** with:
   - PHP 7.4 or higher
   - MySQL database support
   - FTP or File Manager access
   - SSL certificate (HTTPS required for PWA)

2. ✅ **Database credentials** ready:
   - Database name
   - Database username
   - Database password

3. ✅ **FTP client** (FileZilla, Cyberduck, or use DirectAdmin File Manager)

---

## 🚀 Deployment Steps

### **Step 1: Create MySQL Database**

1. Login to **DirectAdmin**
2. Navigate to **MySQL Management**
3. Click **Create new database**
4. Fill in the details:
   - **Database name:** `hgm_pos` (or your preferred name)
   - **Database user:** Create a new user
   - **Password:** Generate a strong password
5. **Grant all privileges** to the user
6. **Note down** these credentials - you'll need them!

---

### **Step 2: Import Database Schema**

1. In DirectAdmin, go to **phpMyAdmin**
2. Select your newly created database
3. Click the **Import** tab
4. **Upload** the `database.sql` file from this project
5. Click **Go** to execute the import
6. ✅ Verify all tables are created: `users`, `items`, `transactions`, `transaction_items`, `business_settings`

---

### **Step 3: Configure PHP Backend**

1. Locate the file: `api/config/config.example.php`
2. **Rename** it to `config.php`
3. **Edit** the file with your database credentials:

```php
// Database Configuration
define('DB_HOST', 'localhost');           // Usually 'localhost'
define('DB_NAME', 'your_database_name');  // Your actual database name
define('DB_USER', 'your_database_user');  // Your actual username
define('DB_PASS', 'your_database_pass');  // Your actual password

// JWT Secret Key
define('JWT_SECRET', 'CHANGE_THIS_TO_RANDOM_STRING_' . md5(uniqid()));
```

4. **Save** the file

---

### **Step 4: Upload Files to Server**

You have two options:

#### **Option A: FTP Upload (Recommended)**

1. Open your FTP client (FileZilla, etc.)
2. Connect to your server:
   - **Host:** Your domain or server IP
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21 (or as specified by host)

3. Navigate to `public_html` folder (or your domain folder)

4. **Upload these folders/files:**
   ```
   public_html/
   ├── api/                    (entire folder)
   ├── dist/web/              (rename to root OR create subdomain)
   │   ├── index.html
   │   ├── assets/
   │   └── .vite/
   ├── manifest.json          (from public/)
   ├── sw.js                  (from public/)
   └── icon.png               (from public/)
   ```

#### **Option B: DirectAdmin File Manager**

1. Go to **DirectAdmin → File Manager**
2. Navigate to `public_html`
3. Click **Upload Files**
4. Upload the folders as listed above
5. If you uploaded a ZIP, use **Extract** to unzip

---

### **Step 5: Configure Web Server**

#### **Create .htaccess in public_html**

Create a file named `.htaccess` in your `public_html` folder:

```apache
# HGM POS System - Apache Configuration

RewriteEngine On

# Force HTTPS (required for PWA)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Routes - send to api/index.php
RewriteCond %{REQUEST_URI} ^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Frontend Routes - serve index.html for SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

### **Step 6: File Permissions**

Set correct permissions using FTP or File Manager:

```
api/                     → 755
api/config/config.php    → 644 (make sure it's not publicly accessible!)
index.html               → 644
All other files          → 644
All other folders        → 755
```

---

### **Step 7: Test the Installation**

1. **Open your browser**
2. Navigate to: `https://yourdomain.com`
3. You should see the **HGM POS Login screen**
4. **Test login** with default credentials:
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ **IMPORTANT:** Change this password immediately!

---

### **Step 8: Install as PWA**

1. **On Chrome/Edge:**
   - Click the **⊕ Install** button in address bar
   - OR: Menu → Install HGM POS System

2. **On Mobile (Android/iOS):**
   - Open site in Chrome/Safari
   - Tap **Share** → **Add to Home Screen**

3. **Configure Default Printer:**
   - Go to browser settings
   - Set your **80mm thermal printer as default**
   - Test print from HGM POS

---

## 🔧 Post-Deployment Configuration

### **1. Update Business Settings**

1. Login as admin
2. Go to **Admin Panel → Settings**
3. Scroll to **Receipt Customization**
4. Update:
   - Business Name
   - Phone Number
   - Email Address
   - Physical Address
   - Footer Message
5. Click **Save Receipt Settings**

### **2. Configure Printer**

1. Install your **80mm thermal printer driver** on the POS computer
2. Set it as the **default printer** in Windows/browser
3. Test print from HGM POS
4. Receipts will be formatted for 80mm paper automatically

### **3. Add Items**

1. Go to **Admin Panel → Items tab**
2. Add your products for Bar, Restaurant, and Lodge
3. Set prices, stock levels, and categories

### **4. Create Cashier Accounts**

1. Go to **Admin Panel → Users tab**
2. Click **Add New User**
3. Create cashier accounts
4. Cashiers can only access POS interface (no admin panel)

---

## 🔒 Security Best Practices

### **Immediate Actions:**

1. ✅ **Change default admin password**
   - Login → Admin Panel → Users → Edit admin user

2. ✅ **Update JWT Secret**
   - Edit `api/config/config.php`
   - Change `JWT_SECRET` to a random string

3. ✅ **Secure config.php**
   - Ensure it's not publicly accessible
   - Add to `.htaccess` if needed:
     ```apache
     <Files "config.php">
         Order Allow,Deny
         Deny from all
     </Files>
     ```

4. ✅ **Regular Database Backups**
   - Use DirectAdmin → MySQL Management → Backup
   - Schedule weekly backups

5. ✅ **Enable HTTPS**
   - Install SSL certificate (Let's Encrypt free)
   - Force HTTPS via .htaccess (already included above)

---

## 📱 Using the PWA

### **Daily Operations:**

1. **Launch app** from desktop/home screen icon
2. **Login** with your credentials
3. **Select section** (Bar, Restaurant, or Lodge)
4. **Add items** to cart
5. **Process payment**
6. **Receipt auto-prints** to thermal printer

### **Offline Mode:**

- PWA works offline for basic operations
- Cached data allows viewing items
- Transactions sync when online again

---

## 🐛 Troubleshooting

### **Login not working?**
- Check database credentials in `api/config/config.php`
- Verify database tables exist in phpMyAdmin
- Check browser console for errors (F12)

### **API errors?**
- Ensure `api/.htaccess` is uploaded
- Check PHP error logs in DirectAdmin
- Verify file permissions (755 for folders, 644 for files)

### **Printing not working?**
- Ensure thermal printer is set as default
- Allow popups in browser settings
- Test with browser's native print (Ctrl+P)
- Check printer driver is installed

### **PWA won't install?**
- Verify site is using HTTPS
- Check `manifest.json` is accessible
- Clear browser cache and try again
- Ensure `sw.js` is in root directory

### **Slow performance?**
- Check shared hosting resources
- Optimize database indexes
- Enable browser caching via .htaccess
- Consider upgrading hosting plan

---

## 📞 Support & Maintenance

### **Regular Tasks:**

- **Daily:** Check low stock alerts in Reports
- **Weekly:** Backup database via DirectAdmin
- **Monthly:** Review sales reports and analytics
- **As needed:** Update business settings, add/remove items

### **Database Maintenance:**

```sql
-- Optimize tables monthly
OPTIMIZE TABLE users, items, transactions, transaction_items, business_settings;
```

---

## 🎉 Congratulations!

Your HGM POS System is now deployed and ready to use!

**Features:**
- ✅ Multi-section POS (Bar, Restaurant, Lodge)
- ✅ Role-based access (Admin/Cashier)
- ✅ 80mm thermal receipt printing
- ✅ Real-time inventory management
- ✅ Sales reports & analytics
- ✅ Offline-capable PWA
- ✅ Mobile-friendly interface

**Need help?** Check the logs in DirectAdmin or browser console (F12) for error messages.

---

## 📄 File Structure Reference

```
public_html/
├── api/
│   ├── config/
│   │   ├── config.php           (your credentials - SECURE THIS!)
│   │   ├── database.php
│   │   └── jwt.php
│   ├── auth/
│   │   └── login.php
│   ├── items/
│   │   └── index.php
│   ├── users/
│   │   └── index.php
│   ├── transactions/
│   │   └── index.php
│   ├── receipt/
│   │   └── index.php
│   ├── settings/
│   │   └── index.php
│   ├── reports/
│   │   └── index.php
│   ├── .htaccess
│   └── index.php
├── assets/
│   ├── index-*.css
│   └── index-*.js
├── .htaccess
├── index.html
├── manifest.json
├── sw.js
└── icon.png
```

---

**Version:** 2.0.0-PWA
**Last Updated:** December 24, 2024
**Platform:** PHP + MySQL + React PWA
