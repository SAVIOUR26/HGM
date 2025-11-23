# HGM POS System - Claude Code Instructions

## Project Overview
A full-stack Point of Sale desktop application for HGM Properties Ltd in Kampala, Uganda. The business operates three sections: Bar, Restaurant, and Lodge. This is a Windows desktop app that needs to work offline with touchscreen support, thermal receipt printing, card/mobile money payments, and cash drawer integration.

## Current Status: ~70% Complete

### ✅ FULLY COMPLETED & WORKING
1. **Backend API (100%)**
   - Node.js + Express + TypeScript + SQLite
   - Authentication with JWT (login/logout)
   - User management (Admin/Cashier roles)
   - Items CRUD API with image support
   - Transactions API (create, retrieve, filter)
   - Reports API (daily summary, sales by section, cashier performance, payment methods, top items, hourly patterns)
   - Cash drawer tracking API (opening/closing balance)
   - Receipt formatting service (ESC/POS thermal format + HTML format)
   - All routes tested and working
   - Database seeded with 40+ HGM items (drinks, food, lodge services)

2. **Frontend UI (100%)**
   - React + TypeScript + Vite
   - Modern, beautiful gradient UI with animations
   - Login page (working authentication)
   - Dashboard (section selection: Bar/Restaurant/Lodge)
   - POS Interface with:
     - Grid-based product tiles with icons
     - Touch-optimized design
     - Cart management (add/remove/quantity)
     - Category filtering
     - Search functionality
     - Real-time cart total
     - Section-specific color themes (Blue=Bar, Green=Restaurant, Orange=Lodge)
   - Admin Panel (edit item prices, manage inventory)
   - Reports Dashboard (daily sales, sections breakdown, payment methods, top sellers)
   - All pages responsive and tested

3. **Database Schema (100%)**
   - users (admin/cashier)
   - items (with image_path, color, description, stock tracking)
   - transactions (with section, payment_method, cashier tracking)
   - transaction_items (line items)
   - lodge_bookings (room reservations)
   - cash_movements (drawer tracking)
   - stock_movements (inventory changes)
   - receipt_settings (per-section customization)

4. **Configuration (100%)**
   - TypeScript configs (separate for backend, frontend, electron)
   - Vite config
   - Package.json with all dependencies
   - Environment variables template (.env)
   - Git ignore configured

### 🚧 PARTIALLY COMPLETED
1. **Electron Wrapper (50%)**
   - Files created: `src/electron/main.ts`, `src/electron/preload.ts`
   - Main window configuration done
   - Backend startup logic exists but needs testing
   - NOT YET TESTED OR BUILT

2. **Receipt Service (70%)**
   - Receipt formatting completed (ESC/POS + HTML)
   - Receipt data generation working
   - Printer integration NOT completed
   - Cash drawer commands prepared but not connected

### ❌ NOT STARTED - YOUR CRITICAL TASKS

## TASK 1: Complete Electron Desktop App (PRIORITY 1)
**Goal:** Working Windows .exe that bundles everything

### What You Need to Do:

1. **Fix/Complete `src/electron/main.ts`:**
   - Ensure backend starts correctly with the app
   - Fix the backend startup command for both dev and production
   - Handle backend process lifecycle (start/stop/restart)
   - Load frontend correctly (dev: localhost:5173, prod: built files)
   - Add proper error handling for backend startup failures
   - Add system tray icon (optional but nice)
   - Add "About" dialog with app version

2. **Complete `src/electron/preload.ts`:**
   - Add printer API exposure to renderer
   - Add file system access for receipt printing
   - Add cash drawer control API

3. **Create Build Configuration:**
   - Verify `package.json` build section is correct
   - Create app icon (`public/icon.ico` - 256x256px minimum)
   - Configure electron-builder for Windows
   - Test build process: `npm run electron:build`
   - Verify installer works on clean Windows machine

4. **Test Electron App:**
   - Test in dev mode: `npm run electron:dev`
   - Test built app: install .exe and run
   - Verify backend starts automatically
   - Verify all POS functions work in Electron
   - Verify app can restart without issues

**Acceptance Criteria:**
- ✅ `npm run electron:dev` launches working app
- ✅ `npm run electron:build` creates installer in `release/`
- ✅ Double-clicking HGM-POS-Setup.exe installs app
- ✅ Installed app launches and works fully offline
- ✅ Backend starts automatically with app
- ✅ All POS functions work (login, checkout, reports, admin)

---

## TASK 2: Pesapal Payment Integration (PRIORITY 2)
**Goal:** Real card and mobile money payments

### What You Need to Do:

1. **Create Pesapal Service (`src/backend/services/pesapalService.ts`):**
   ```typescript
   // Implement these methods:
   - getAccessToken() // OAuth2 authentication
   - registerIPN() // Register callback URL
   - submitOrder() // Initiate payment
   - getTransactionStatus() // Check payment status
   - handleCallback() // Process IPN notifications
   ```

2. **Create Payment Routes (`src/backend/routes/payment.ts`):**
   - POST `/api/payment/initiate` - Start payment
   - POST `/api/payment/callback` - Handle Pesapal IPN
   - GET `/api/payment/status/:orderId` - Check payment status

3. **Update Frontend POS Interface:**
   - Modify `src/frontend/pages/POSInterface.tsx`
   - Replace mock payment buttons with real Pesapal flow:
     - Show payment modal with QR code for mobile money
     - Show redirect button for card payments
     - Poll transaction status
     - Show success/failure messages
     - Update transaction record with payment details

4. **Environment Variables Needed:**
   ```
   PESAPAL_CONSUMER_KEY=your-key-here
   PESAPAL_CONSUMER_SECRET=your-secret-here
   PESAPAL_ENVIRONMENT=sandbox
   PESAPAL_IPN_URL=http://localhost:3000/api/payment/callback
   ```

5. **Payment Flow:**
   - User clicks "Pay Card" or "Pay Mobile Money"
   - Backend calls Pesapal API with transaction details
   - For cards: Redirect to Pesapal payment page
   - For mobile money: Show QR code + phone prompt
   - Customer completes payment
   - Pesapal sends IPN callback
   - Update transaction status
   - Print receipt on success

**Pesapal API Docs:** https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference

**Test Cards (Sandbox):**
- Card: 5100 0000 0000 0000
- Expiry: Any future date
- CVV: Any 3 digits

**Acceptance Criteria:**
- ✅ Can complete transaction with real Pesapal card payment
- ✅ Can complete transaction with Pesapal mobile money
- ✅ Transaction status updates after payment
- ✅ Failed payments handled gracefully
- ✅ Receipt prints only on successful payment

---

## TASK 3: Receipt Printing (PRIORITY 3)
**Goal:** Print receipts on thermal printer + regular printer fallback

### What You Need to Do:

1. **Complete Printer Service:**
   - Update `src/backend/services/printerService.ts`
   - Add actual printer communication (not just file writing)
   - Use `node-thermal-printer` or `escpos` library
   - Support both USB and network printers
   - Implement auto-discovery of printers

2. **Add Printer Integration to Electron:**
   - Create `src/electron/printer.ts`
   - Use Electron's printing API as fallback
   - Expose printer methods via IPC to renderer
   - Allow selecting default printer in settings

3. **Printing Triggers:**
   - Auto-print after successful payment
   - Manual reprint from transaction history
   - Print button in admin for test receipts

4. **Receipt Formats:**
   - Use existing `ReceiptService.formatThermalReceipt()` (already done)
   - Customize header per section (Bar/Restaurant/Lodge)
   - Include: business info, items, totals, payment method, cashier name, timestamp

5. **Printer Settings UI:**
   - Add settings page to select printer
   - Test print button
   - Configure paper width (80mm default)

**Libraries to Install:**
```bash
npm install node-thermal-printer escpos escpos-usb
```

**Acceptance Criteria:**
- ✅ Detects thermal printers automatically
- ✅ Prints receipt after successful transaction
- ✅ Receipt shows all required info (items, total, cashier, time)
- ✅ Different header for Bar/Restaurant/Lodge
- ✅ Fallback to regular printer if thermal not found
- ✅ Manual reprint works from history

---

## TASK 4: Cash Drawer Integration (PRIORITY 4)
**Goal:** Open cash drawer automatically on cash payments

### What You Need to Do:

1. **Complete Cash Drawer Function:**
   - Update `src/backend/services/printerService.ts`
   - Implement `openCashDrawer()` method
   - Send ESC/POS command: `\x1B\x70\x00\x19\xFA`
   - Cash drawer typically connects to printer's RJ11 port

2. **Trigger Points:**
   - Auto-open on cash payment completion
   - Manual "Open Drawer" button (admin only)
   - "No Sale" drawer open (admin feature)

3. **Frontend UI:**
   - Add "Open Cash Drawer" button in POS header (admin only)
   - Show confirmation when drawer opens
   - Log all drawer openings

**Acceptance Criteria:**
- ✅ Drawer opens automatically on cash payment
- ✅ Admin can manually open drawer
- ✅ All drawer openings logged to database
- ✅ Works even if printer is off (graceful error)

---

## TASK 5: Mobile Reports Dashboard (OPTIONAL - NICE TO HAVE)

### What You Need to Do:

1. **Create Mobile Route:**
   - Create `src/frontend/pages/MobileReports.tsx`
   - Super mobile-optimized layout
   - Auto-refresh every 30 seconds
   - Show: today's sales, transactions count, section breakdown, payment methods

2. **Setup Access:**
   - Backend already serves reports API
   - Access via local network: `http://192.168.X.X:3000/reports`
   - Add QR code in admin panel for easy phone scanning
   - Optional: Add ngrok tunnel for remote access

3. **Security:**
   - Require login
   - Read-only mode (no actions)
   - Session timeout after 1 hour

**Acceptance Criteria:**
- ✅ Admin can scan QR code on phone
- ✅ Reports show on phone browser
- ✅ Auto-refreshes data
- ✅ Works on same WiFi network

---

## TASK 6: Polish & Final Testing

1. **Error Handling:**
   - Add try-catch to all API calls
   - Show user-friendly error messages
   - Log errors to file for debugging

2. **Loading States:**
   - Add spinners during API calls
   - Disable buttons during processing
   - Show progress for long operations

3. **Validation:**
   - Validate all form inputs
   - Prevent negative quantities
   - Prevent empty transactions
   - Check stock before sale (if tracked)

4. **Performance:**
   - Optimize item loading (lazy load if >100 items)
   - Cache frequent queries
   - Debounce search input

5. **User Experience:**
   - Add keyboard shortcuts (F1=help, ESC=cancel, Enter=confirm)
   - Add sound effects on checkout (optional)
   - Add "Are you sure?" for destructive actions
   - Remember last selected section

6. **Documentation:**
   - Create USER_MANUAL.md
   - Create INSTALLATION.md
   - Add inline comments for complex logic
   - Document API endpoints

---

## FINAL DELIVERABLES CHECKLIST

### Must Have:
- [ ] Working Windows installer (.exe) in `release/` folder
- [ ] Installer tested on clean Windows PC
- [ ] All POS functions work (login, sell, checkout, reports, admin)
- [ ] Pesapal payments integrated (card + mobile money)
- [ ] Receipt printing works (thermal + fallback)
- [ ] Cash drawer opens on cash payments
- [ ] Admin can edit prices and manage items
- [ ] Reports show accurate data
- [ ] App runs fully offline (except payments)
- [ ] App auto-starts backend on launch
- [ ] No console errors in production build

### Nice to Have:
- [ ] Mobile reports accessible on phone
- [ ] Product image upload system
- [ ] Low stock alerts
- [ ] End-of-day report automation
- [ ] Database backup/restore feature
- [ ] Multiple cashier stations support

---

## TECHNICAL CONSTRAINTS & NOTES

### Important Limitations:
- **NO browser storage (localStorage/sessionStorage)** - Already handled with in-memory in backend
- SQLite database lives in `data/hgm-pos.db` (auto-created on first run)
- Backend must start automatically with Electron app
- Must work 100% offline except during Pesapal payments
- Touchscreen optimized (minimum 44px touch targets)
- Print receipts in 3 seconds or less

### File Locations:
- Backend: `src/backend/`
- Frontend: `src/frontend/`
- Electron: `src/electron/`
- Database: `data/hgm-pos.db` (not in git)
- Build output: `dist/` (not in git)
- Installer: `release/` (not in git)

### Current Scripts:
```bash
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run dev                # Start both (concurrently)
npm run electron:dev       # Start Electron in dev mode
npm run build:backend      # Compile backend TypeScript
npm run build:frontend     # Build frontend production
npm run build:electron     # Compile Electron TypeScript
npm run build              # Build everything
npm run electron:build     # Create Windows installer
```

### Environment Variables Required:
See `.env.example` or create `.env` with:
- PORT=3000
- DATABASE_PATH=./data/hgm-pos.db
- JWT_SECRET=random-secret-key
- BUSINESS_NAME=HGM Properties Ltd
- BUSINESS_ADDRESS=Kampala, Uganda
- BUSINESS_PHONE=+256-XXX-XXXXXX
- PESAPAL_CONSUMER_KEY=get-from-client
- PESAPAL_CONSUMER_SECRET=get-from-client
- PESAPAL_ENVIRONMENT=sandbox (or production)

### Testing Credentials:
- Username: `admin`
- Password: `admin123`

To reset database: `del data\hgm-pos.db` and restart backend

---

## SUCCESS CRITERIA

**The project is COMPLETE when:**
1. ✅ You can run `npm run electron:build` successfully
2. ✅ Installer (HGM-POS-Setup.exe) is created in `release/` folder
3. ✅ Installing the .exe on Windows works
4. ✅ Launching the app works without manual backend start
5. ✅ Can login, select section, add items to cart
6. ✅ Can checkout with CASH and it completes
7. ✅ Can checkout with CARD via Pesapal and it completes
8. ✅ Can checkout with MOBILE MONEY via Pesapal and it completes
9. ✅ Receipt prints automatically after successful payment
10. ✅ Cash drawer opens on cash payments
11. ✅ Admin can edit item prices
12. ✅ Reports show today's sales accurately
13. ✅ App works fully offline (except payment processing)
14. ✅ No errors in console or logs
15. ✅ All transactions save to database correctly

---

## DEVELOPMENT APPROACH

**Recommended Order:**
1. **First:** Complete Electron wrapper and get .exe building
2. **Second:** Add Pesapal integration (most critical feature)
3. **Third:** Add receipt printing (hardware integration)
4. **Fourth:** Add cash drawer control
5. **Fifth:** Polish and test everything
6. **Optional:** Mobile reports if time allows

**Testing Strategy:**
- Test each feature in dev mode first (`npm run electron:dev`)
- Then test in built app after `npm run electron:build`
- Test on clean Windows VM or machine if possible
- Test with actual hardware (printer, cash drawer) if available

**Communication:**
- Ask clarifying questions if anything is unclear
- Propose solutions before implementing major changes
- Document any breaking changes or new dependencies
- Note any features you couldn't complete and why

---

## CLIENT CONTEXT

**Business:** HGM Properties Ltd, Kampala, Uganda
**Sections:** Bar (drinks/beverages), Restaurant (food), Lodge (rooms/services)
**Users:** 1 admin, 3-5 cashiers
**Hardware:** Windows PC with touchscreen, thermal printer (80mm), cash drawer
**Payment Methods:** Cash (primary), Card via Pesapal, Mobile Money (MTN/Airtel) via Pesapal
**Expected Load:** 50-200 transactions per day
**Timeline:** ASAP - this is production-ready code
**Budget:** Fixed scope, get it working

---

## START HERE

1. Review all files in `src/` to understand current implementation
2. Test current state: `npm install`, `npm run dev:backend`, `npm run dev:frontend`
3. Verify frontend works at http://localhost:5173
4. Start with TASK 1 (Electron) to get installable app working
5. Then proceed to TASK 2 (Pesapal payments)
6. Ask questions if you need clarification on anything

**Good luck! The foundation is solid, now finish the critical features and deliver a working desktop POS application.**