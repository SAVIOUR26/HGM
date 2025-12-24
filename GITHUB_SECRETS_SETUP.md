# 🔐 GitHub Secrets Setup Guide
## For Automatic Deployment to DirectAdmin

Follow these steps to configure GitHub Secrets for automatic deployment.

---

## 📋 Required GitHub Secrets

You need to add **7 secrets** to your GitHub repository:

### **1. FTP Credentials (3 secrets)**

| Secret Name | Value |
|------------|-------|
| `FTP_HOST` | `wh175143.ispot.cc` |
| `FTP_USERNAME` | `hideout@wh175143.ispot.cc` |
| `FTP_PASSWORD` | `Hide@25` |

### **2. Database Credentials (4 secrets)**

| Secret Name | Value |
|------------|-------|
| `DB_HOST` | `localhost` |
| `DB_NAME` | `elibrary_hideout` |
| `DB_USER` | `elibrary_hideout` |
| `DB_PASS` | `Hide@2025` |

### **3. Security (1 secret)**

| Secret Name | Value | Notes |
|------------|-------|-------|
| `JWT_SECRET` | Generate a random string | Use a password generator for a strong 64-character random string |

**Example JWT_SECRET:**
```
HGM_POS_2024_aB3dE5fG7hJ9kL2mN4pQ6rS8tU0vW1xY3zA5bC7dE9fG1hJ3kL5
```
(Use your own random string!)

---

## 🛠️ How to Add Secrets to GitHub

### **Step-by-Step:**

1. **Go to your GitHub repository:**
   ```
   https://github.com/SAVIOUR26/HGM
   ```

2. **Click on "Settings"** (top menu)

3. **In the left sidebar:**
   - Click **"Secrets and variables"**
   - Click **"Actions"**

4. **Click "New repository secret"**

5. **Add each secret one by one:**

   **Secret 1:**
   - Name: `FTP_HOST`
   - Value: `wh175143.ispot.cc`
   - Click "Add secret"

   **Secret 2:**
   - Name: `FTP_USERNAME`
   - Value: `hideout@wh175143.ispot.cc`
   - Click "Add secret"

   **Secret 3:**
   - Name: `FTP_PASSWORD`
   - Value: `Hide@25`
   - Click "Add secret"

   **Secret 4:**
   - Name: `DB_HOST`
   - Value: `localhost`
   - Click "Add secret"

   **Secret 5:**
   - Name: `DB_NAME`
   - Value: `elibrary_hideout`
   - Click "Add secret"

   **Secret 6:**
   - Name: `DB_USER`
   - Value: `elibrary_hideout`
   - Click "Add secret"

   **Secret 7:**
   - Name: `DB_PASS`
   - Value: `Hide@2025`
   - Click "Add secret"

   **Secret 8:**
   - Name: `JWT_SECRET`
   - Value: `HGM_POS_2024_aB3dE5fG7hJ9kL2mN4pQ6rS8tU0vW1xY3zA5bC7dE9fG1hJ3kL5` (or your own random string)
   - Click "Add secret"

---

## ✅ Verification Checklist

After adding all secrets, verify you have these 8 secrets:

- [ ] FTP_HOST
- [ ] FTP_USERNAME
- [ ] FTP_PASSWORD
- [ ] DB_HOST
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASS
- [ ] JWT_SECRET

**Screenshot should look like this:**
```
Repository secrets

FTP_HOST              Updated 1 minute ago
FTP_USERNAME          Updated 1 minute ago
FTP_PASSWORD          Updated 1 minute ago
DB_HOST               Updated 1 minute ago
DB_NAME               Updated 1 minute ago
DB_USER               Updated 1 minute ago
DB_PASS               Updated 1 minute ago
JWT_SECRET            Updated 1 minute ago
```

---

## 🚀 How Automatic Deployment Works

### **Trigger:**
Every time you push to branch `claude/pwa-php-019jxEz7iqNJ1mRbBtdqqP4F`, GitHub Actions will:

1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Build frontend (React + Vite)
4. ✅ Create `config.php` with your database credentials
5. ✅ Prepare deployment files
6. ✅ Upload to DirectAdmin via FTP
7. ✅ Show deployment summary

### **Deployment Path:**
Files will be uploaded to:
```
/home/elibrary/domains/hideout.wh175143.ispot.cc/public_html/
```

### **Site URL:**
After deployment, your site will be live at:
```
https://hideout.wh175143.ispot.cc
```

---

## 📊 Monitoring Deployments

### **To view deployment status:**

1. Go to your repository
2. Click **"Actions"** tab
3. You'll see deployment runs
4. Click on a run to see detailed logs
5. Green checkmark = Success ✅
6. Red X = Failed ❌ (check logs for errors)

---

## 🔄 Manual Deployment Trigger

You can also trigger deployment manually without pushing code:

1. Go to **Actions** tab
2. Click **"Deploy PWA to DirectAdmin"** workflow
3. Click **"Run workflow"** button
4. Select branch: `claude/pwa-php-019jxEz7iqNJ1mRbBtdqqP4F`
5. Click **"Run workflow"**

---

## ⚠️ Important Notes

### **One-Time Setup:**

After first deployment, you need to:

1. **Import Database:**
   - Go to DirectAdmin → phpMyAdmin
   - Select database `elibrary_hideout`
   - Click "Import"
   - Upload `database.sql`
   - Click "Go"
   - ✅ Done! (Only once, don't re-import on future deployments)

2. **First Login:**
   - Visit: `https://hideout.wh175143.ispot.cc`
   - Login: `admin` / `admin123`
   - **Immediately change password!**

3. **Configure Business Settings:**
   - Admin Panel → Settings → Receipt Customization
   - Update business name, phone, email, address
   - Save settings

### **Security:**

- ✅ Secrets are encrypted by GitHub
- ✅ Never visible in logs
- ✅ Only accessible to GitHub Actions
- ✅ Cannot be read once saved
- ✅ `config.php` is auto-generated (never committed to repo)

### **Excluded Files:**

These files are **NOT** uploaded during deployment (intentionally):
- `.git/` - Git files
- `node_modules/` - Dependencies
- `.env` - Environment file
- `database.sql` - Database file (manual import only)

---

## 🐛 Troubleshooting

### **Deployment fails?**

1. Check GitHub Actions logs for errors
2. Verify all 8 secrets are correctly set
3. Check FTP credentials are correct
4. Verify database credentials match DirectAdmin

### **Site not loading?**

1. Check FTP uploaded files correctly
2. Verify `api/config/config.php` exists
3. Check file permissions (755 for folders, 644 for files)
4. Import `database.sql` via phpMyAdmin

### **Database connection errors?**

1. Verify database exists in DirectAdmin
2. Check database name matches secret `DB_NAME`
3. Check username/password match DirectAdmin
4. Import `database.sql` if not done

---

## 📞 Support

**Workflow File:** `.github/workflows/deploy-pwa.yml`

**Deployment Logs:** GitHub → Actions → Latest run

**Site URL:** https://hideout.wh175143.ispot.cc

**API Health Check:** https://hideout.wh175143.ispot.cc/api/health

---

## 🎉 You're Ready!

Once you add all 8 secrets, just push code to trigger deployment:

```bash
git add .
git commit -m "Your commit message"
git push origin claude/pwa-php-019jxEz7iqNJ1mRbBtdqqP4F
```

**GitHub Actions will automatically deploy to your DirectAdmin server!** 🚀

---

**Version:** 2.0.0-PWA
**Last Updated:** December 24, 2024
