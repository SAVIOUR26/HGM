# 📥 How to Download Your Windows Installer from GitHub Actions

## Step-by-Step Visual Guide

---

### Step 1: Open GitHub Actions Page

**Click this link:** https://github.com/SAVIOUR26/hgm-pos/actions

You'll see a page that looks like this:

```
┌─────────────────────────────────────────────────────────────┐
│ SAVIOUR26 / hgm-pos                                         │
├─────────────────────────────────────────────────────────────┤
│ Code  Issues  Pull requests  Actions  Projects  Wiki        │
│                               ^^^^^^^                        │
│                               Click here                     │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 2: Find Your Build

Look for "Build Windows Installer" workflows in the list:

```
┌─────────────────────────────────────────────────────────────┐
│ All workflows                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🟡 Build Windows Installer                                │
│     Add comprehensive documentation and build scripts       │
│     claude/complete-pos-system-01XtA8fwTZyUnHjpRHrq1gjq    │
│     🔧 In progress... (5 minutes ago)                       │
│     └─ Click here to see details                            │
│                                                             │
│  ✅ Build Windows Installer                                │
│     Fix authentication import in payment routes             │
│     claude/complete-pos-system-01XtA8fwTZyUnHjpRHrq1gjq    │
│     ✅ Success (10 minutes ago)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Click on the **LATEST** run (top one) with status:
- 🟡 **Yellow circle** = Running
- ✅ **Green checkmark** = Completed successfully
- ❌ **Red X** = Failed (check logs)

---

### Step 3: Watch Build Progress

Once you click on a workflow run, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│ Build Windows Installer                                     │
│ claude/complete-pos-system-01XtA8fwTZyUnHjpRHrq1gjq         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  build-windows                                              │
│  └─ Setup Node.js           ✅ 0m 15s                       │
│  └─ Install dependencies    🟡 Running...                   │
│  └─ Build backend           ⏸️ Pending                      │
│  └─ Build frontend          ⏸️ Pending                      │
│  └─ Build Electron          ⏸️ Pending                      │
│  └─ Build Windows installer ⏸️ Pending                      │
│  └─ Upload artifacts        ⏸️ Pending                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Wait until all steps show ✅ green checkmarks** (5-10 minutes)

---

### Step 4: Download Artifacts

Once complete, **scroll all the way down** to the bottom of the page.

You'll see a section called **"Artifacts"**:

```
┌─────────────────────────────────────────────────────────────┐
│ Artifacts                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 HGM-POS-Windows-Installer                  Expired in 30 days │
│     Produced 2 minutes ago                      185 MB      │
│     └─ Click here to download                               │
│                                                             │
│  📦 HGM-POS-Windows-Portable                   Expired in 30 days │
│     Produced 2 minutes ago                      520 MB      │
│     └─ Optional portable version                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Click on "HGM-POS-Windows-Installer"** to download.

---

### Step 5: Extract and Install

The download is a **ZIP file**. Extract it:

```
📁 HGM-POS-Windows-Installer.zip
   └─ 📄 HGM-POS-Setup-1.0.0.exe  (150-200 MB)
   └─ 📄 HGM-POS-1.0.0.zip (optional portable)
```

**Run the installer:**
1. Double-click `HGM-POS-Setup-1.0.0.exe`
2. If Windows SmartScreen appears:
   - Click "More info"
   - Click "Run anyway"
3. Follow installation wizard
4. Choose installation directory (default: C:\Program Files\HGM POS System)
5. Complete installation
6. Launch from desktop or Start Menu

---

## 🔄 Manual Trigger (If You Want Fresh Build)

If you need to trigger a new build manually:

1. **Go to workflow file:**
   https://github.com/SAVIOUR26/hgm-pos/actions/workflows/build-windows.yml

2. **Click "Run workflow" button** (top right, green button)

3. **Select your branch:**
   ```
   ┌─────────────────────────────────────┐
   │ Run workflow                        │
   ├─────────────────────────────────────┤
   │ Branch: [claude/complete-pos-system]│
   │                                     │
   │ [Run workflow]                      │
   └─────────────────────────────────────┘
   ```

4. **Click "Run workflow"** to start

---

## 📊 Build Status Icons

| Icon | Meaning |
|------|---------|
| 🟡 | Build is running (wait) |
| ✅ | Build succeeded (download ready) |
| ❌ | Build failed (check logs) |
| ⏸️ | Step pending (not started yet) |
| 🔄 | Build queued (waiting for runner) |

---

## 💡 Common Issues

### Issue: Can't find Artifacts section
**Solution:**
- Make sure build is complete (✅ green checkmark)
- Scroll ALL the way down to the bottom
- You must be logged into GitHub

### Issue: Download button grayed out
**Solution:**
- Wait for build to finish completely
- Refresh the page
- Check you have permission to access the repository

### Issue: ZIP file is empty or corrupted
**Solution:**
- Re-download the artifact
- Check your internet connection
- Try a different browser

### Issue: Installer won't run on Windows
**Solution:**
- Right-click → Run as Administrator
- Click "More info" on SmartScreen warning, then "Run anyway"
- Temporarily disable antivirus
- Check Windows version (requires Windows 10/11 64-bit)

---

## 🎯 Quick Links

| Link | Purpose |
|------|---------|
| [View All Builds](https://github.com/SAVIOUR26/hgm-pos/actions) | See all workflow runs |
| [Build Windows Workflow](https://github.com/SAVIOUR26/hgm-pos/actions/workflows/build-windows.yml) | Specific workflow page |
| [Repository](https://github.com/SAVIOUR26/hgm-pos) | Main repository |

---

## ⏱️ Expected Timeline

```
0:00  → Push code to GitHub
0:01  → GitHub Actions triggered
0:02  → Workflow starts (waiting for runner)
0:03  → Installing dependencies
2:00  → Building backend
2:30  → Building frontend
3:30  → Building Electron
4:00  → Creating Windows installer
7:00  → Uploading artifacts
8:00  → ✅ Build complete!
```

**Total time: ~5-10 minutes**

---

## 📦 What You Get

```
HGM-POS-Setup-1.0.0.exe
├─ Electron Application
├─ Node.js Backend
├─ React Frontend
├─ SQLite Database
├─ Sample Data (40+ items)
├─ All Dependencies
└─ Auto-start Configuration
```

**Size:** ~150-200 MB compressed, ~300-400 MB installed

---

## ✨ Next Steps After Installation

1. **Launch app** from desktop or Start Menu
2. **Login** with admin/admin123
3. **Explore POS features** (Bar/Restaurant/Lodge)
4. **Configure Pesapal** for live payments (optional)
5. **Connect printer** and cash drawer (optional)
6. **Start selling!** 🎉

---

## 🆘 Need Help?

- **Check build logs** if build fails
- **Review documentation** in repository
- **Try manual trigger** if automatic build doesn't start
- **Build locally** with Docker or Wine as alternative

---

**Your installer is building now! 🚀**

Visit: https://github.com/SAVIOUR26/hgm-pos/actions
