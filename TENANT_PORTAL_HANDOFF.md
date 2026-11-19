# TuPARI Portal → LMS Mandiri (handoff)

## Cara portal mengarahkan guru ke LMS
Frontend TuPARI dapat tetap di-host terpusat. Setiap sekolah memiliki backend GAS sendiri.

Portal cukup membuka frontend dengan parameter `gas` berisi URL Web App GAS sekolah:

```js
const frontendUrl = "https://URL-FRONTEND-TUPARI/";
const gasUrl = "https://script.google.com/macros/s/ID-DEPLOYMENT-SEKOLAH/exec";
const teacherLmsUrl = frontendUrl + "?gas=" + encodeURIComponent(gasUrl);
window.location.href = teacherLmsUrl;
```

Saat LoginPage dibuka, frontend:
1. membaca parameter `gas`;
2. memvalidasi bahwa URL HTTPS berasal dari Google Apps Script Web App;
3. menyimpan URL ke browser sebagai `tupari_gas_url`;
4. menggunakan backend itu untuk request API berikutnya.

## Catatan
- Parameter `gas` harus berupa URL deployment Web App sekolah yang benar.
- Guru tetap harus deploy backend GAS sendiri dan memberikan izin Google.
- URL backend tersimpan di browser guru; jangan menaruh token atau password dalam parameter URL.
- Ini adalah handoff MVP. Belum ada provisioning otomatis dari portal dan belum diuji end-to-end pada akun Google baru.
