# 📘 TUPARI LMS - Panduan Deploy Frontend

## 🎯 Error "Unauthorized" - Solusi Cepat

Error ini muncul karena Anda mengakses endpoint yang **memerlukan token login**.

### ✅ Test Endpoint Public Dulu

Sebelum deploy frontend, test dulu endpoint yang **tidak perlu login**:

**Via Browser:**
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=health
```

Harusnya muncul:
```json
{
  "success": true,
  "message": "TUPARI LMS API is running",
  "version": "1.0.0"
}
```

**Jika muncul ini, backend sudah berjalan!** ✅

---

## 🚀 DEPLOY FRONTEND KE VERCEL

### **STEP 1: Buat File .env.local**

Di root project React, buat file `.env.local`:

```bash
# Google Apps Script Backend URL
# Ganti dengan URL deployment GAS Anda
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Optional: AI API Key
VITE_AI_API_KEY=

# Optional: Telegram Bot Token
VITE_TELEGRAM_BOT_TOKEN=
```

**Cara mendapatkan GAS URL:**
1. Buka Apps Script
2. Deploy → Manage deployments
3. Copy URL Web App

---

### **STEP 2: Test Frontend Lokal Dulu**

Sebelum deploy ke Vercel, test di lokal:

```bash
# Install dependencies (jika belum)
npm install

# Run development server
npm run dev
```

Buka: `http://localhost:5173`

**Test login:**
- Email: `admin@tupari.id`
- Password: `admin123`

**Jika login berhasil di lokal, lanjut ke deploy!** ✅

---

### **STEP 3: Push ke GitHub**

1. Buat repository baru di GitHub (misal: `tupari-lms`)

2. Initialize git dan push:
```bash
# Di root project React
git init
git add .
git commit -m "Initial commit: TUPARI LMS frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tupari-lms.git
git push -u origin main
```

**Catatan:** File `backend-gas/` tidak akan di-push karena ada di `.gitignore`

---

### **STEP 4: Deploy ke Vercel**

#### **Method 1: Via Vercel Dashboard (Paling Mudah)**

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"Add New..."** → **"Project"**
4. Import repository `tupari-lms`
5. Vercel akan auto-detect Vite
6. Klik **"Deploy"**
7. Tunggu 2-3 menit
8. **Copy URL**: `https://tupari-lms.vercel.app`

#### **Method 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (pilih account)
# - Link to existing project? N
# - Project name? tupari-lms
# - Directory? ./
# - Override settings? N

# Production deploy
vercel --prod
```

---

### **STEP 5: Setup Environment Variables di Vercel**

1. Buka project di Vercel dashboard
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan:

| Name | Value |
|------|-------|
| `VITE_GAS_URL` | `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec` |

4. Klik **"Save"**
5. **Redeploy**: Deployments → Latest → ⋮ → Redeploy

---

### **STEP 6: Test Frontend di Vercel**

1. Buka URL Vercel: `https://tupari-lms.vercel.app`
2. Login dengan:
   - Email: `admin@tupari.id`
   - Password: `admin123`
3. Test fitur:
   - ✅ Dashboard
   - ✅ Data Master
   - ✅ Materi
   - ✅ Tugas
   - ✅ Presensi
   - ✅ Ujian Online

---

## 🔧 TROUBLESHOOTING

### **Error: "Unauthorized" saat login**

**Penyebab:**
- `VITE_GAS_URL` salah atau kosong
- Backend belum di-deploy
- CORS error

**Solusi:**
1. Cek `VITE_GAS_URL` di Vercel environment variables
2. Pastikan URL benar (copy dari Apps Script)
3. Redeploy setelah update env vars
4. Cek browser console (F12) untuk error detail

### **Error: CORS**

**Penyebab:**
- Apps Script belum set "Anyone" access

**Solusi:**
1. Buka Apps Script
2. Deploy → Manage deployments
3. Edit deployment
4. "Who has access": **Anyone**
5. Deploy ulang

### **Error: "Failed to fetch"**

**Penyebab:**
- Backend URL salah
- Backend belum running

**Solusi:**
1. Test URL backend di browser:
   ```
   https://script.google.com/macros/s/xxx/exec?action=health
   ```
2. Jika error, redeploy Apps Script
3. Update URL di Vercel env vars

---

## 📋 CHECKLIST DEPLOYMENT

### **Backend (Google Apps Script):**
- [ ] Semua file GAS sudah di-copy ke Apps Script
- [ ] `Config.gs` sudah diisi dengan ID yang benar
- [ ] Jalankan `initializeAllSheets` sekali
- [ ] Test dengan `testHealth` → berhasil
- [ ] Test dengan `testLogin` → berhasil
- [ ] Deploy sebagai Web App
- [ ] Set "Who has access: Anyone"
- [ ] Copy URL Web App

### **Frontend (React):**
- [ ] File `.env.local` sudah dibuat dengan `VITE_GAS_URL`
- [ ] Test lokal: `npm run dev` → login berhasil
- [ ] Push ke GitHub
- [ ] Deploy ke Vercel
- [ ] Setup environment variables di Vercel
- [ ] Redeploy setelah update env vars
- [ ] Test login di Vercel → berhasil
- [ ] Test semua fitur

---

## 🎯 ALUR DEPLOYMENT LENGKAP

```
1. SETUP BACKEND (Google Apps Script)
   ├─ Buat spreadsheet
   ├─ Buat folder Drive
   ├─ Copy file GAS ke Apps Script
   ├─ Update Config.gs
   ├─ Run initializeAllSheets
   ├─ Test: testHealth, testLogin
   └─ Deploy Web App → Copy URL

2. SETUP FRONTEND (React)
   ├─ Buat .env.local dengan GAS URL
   ├─ Test lokal: npm run dev
   ├─ Push ke GitHub
   ├─ Deploy ke Vercel
   ├─ Setup env vars di Vercel
   └─ Test login di Vercel

3. TESTING
   ├─ Login berhasil
   ├─ CRUD data berhasil
   ├─ CBT ujian berhasil
   ├─ Telegram notifikasi berhasil
   └─ AI generator berhasil

4. PRODUCTION
   ├─ Custom domain (opsional)
   ├─ Monitoring
   ├─ Backup rutin
   └─ User training
```

---

## 💡 TIPS

1. **Test lokal dulu** sebelum deploy ke Vercel
2. **Gunakan environment variables** untuk URL backend
3. **Redeploy setelah update env vars** di Vercel
4. **Cek browser console** (F12) untuk error detail
5. **Cek Apps Script logs** untuk error backend
6. **Backup spreadsheet** secara berkala

---

## 🆘 BUTUH BANTUAN?

Jika masih error:
1. Screenshot error message
2. Copy log dari Apps Script
3. Copy error dari browser console (F12)
4. Hubungi developer

---

**Happy deploying!** 🚀
