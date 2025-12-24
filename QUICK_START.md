# 🚀 HGM POS - Quick Start Guide

## For DirectAdmin Shared Hosting

### 📦 What You Need

1. **Files to Upload:**
   - `/api/` folder (entire folder with all subfolders)
   - `/dist/web/` contents (copy to your root)
   - `/public/manifest.json`
   - `/public/sw.js`
   - `/public/icon.png`
   - `/database.sql` (for database import)

2. **Database Setup:**
   - Database name, username, password from DirectAdmin
   - Import `database.sql` via phpMyAdmin

3. **Configuration:**
   - Rename `api/config/config.example.php` to `config.php`
   - Update with your database credentials

---

## ⚡ 5-Minute Deployment

### 1. Create Database (2 mins)
```
DirectAdmin → MySQL Management → Create Database
→ Import database.sql via phpMyAdmin
```

### 2. Upload Files (2 mins)
```
FTP to public_html/:
- Upload /api/ folder
- Upload contents of /dist/web/ to root
- Upload manifest.json, sw.js, icon.png from /public/
```

### 3. Configure (1 min)
```
Edit api/config/config.php:
- Set DB_NAME, DB_USER, DB_PASS
- Save file
```

### 4. Test
```
Visit: https://yourdomain.com
Login: admin / admin123
✅ DONE!
```

---

## 🖨️ Printer Setup

1. Install 80mm thermal printer driver
2. Set as default printer in Windows
3. Test print from HGM POS
4. Done! Auto-prints after each sale

---

## 🔐 Default Login

**Username:** `admin`
**Password:** `admin123`

⚠️ **Change this immediately after first login!**

Go to: Admin Panel → Users → Click admin → Change password

---

## 📱 Install as App

**Desktop (Chrome/Edge):**
- Click ⊕ Install button in address bar

**Mobile:**
- Open in Chrome/Safari
- Tap Share → Add to Home Screen

---

## ✨ First Steps

1. **Login** as admin
2. **Update business info:**
   - Admin Panel → Settings → Receipt Customization
   - Enter your business name, phone, email, address
   - Save

3. **Add your items:**
   - Admin Panel → Items → Add New Item
   - Add products for Bar, Restaurant, Lodge

4. **Create cashier accounts:**
   - Admin Panel → Users → Add New User
   - Role: Cashier

5. **Start selling!**
   - Logout
   - Login as cashier
   - Select section (Bar/Restaurant/Lodge)
   - Add items → Complete Sale → Auto-print receipt

---

## 🐛 Problems?

**Can't login?**
- Check `api/config/config.php` credentials
- Verify database was imported successfully

**Printing not working?**
- Set thermal printer as default in Windows
- Allow browser popups
- Test with Ctrl+P first

**API errors?**
- Check file permissions: folders 755, files 644
- Ensure .htaccess was uploaded
- Check PHP version is 7.4+

---

## 📖 Need More Help?

See full documentation: `DEPLOYMENT_GUIDE.md`

---

**Ready to go? You're all set! 🎉**
