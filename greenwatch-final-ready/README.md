# GreenWatch Final

## Isi
- Landing page: `index.html`
- Customer login: `customer-login.html`
- Customer dashboard: `dashboard.html`, `sessions.html`, `activity.html`, `locations.html`, `recovery.html`, `billing.html`, `profile.html`
- Admin: `admin-login.html`, `admin.html`
- Backend: `google-apps-script/Code.gs`

## Setup singkat
1. Buat Google Sheet kosong.
2. Extensions → Apps Script.
3. Paste `google-apps-script/Code.gs`.
4. Jalankan `initDatabase()` sekali dan izinkan akses.
5. Project Settings → Script properties → tambah `ADMIN_KEY` dengan secret panjang.
6. Deploy → New deployment → Web app → Execute as Me → Anyone.
7. Copy URL `/exec`.
8. Tempel URL itu ke `js/config.js`.
9. Upload seluruh isi folder ke repo GitHub.
10. Settings → Pages → Deploy from branch → main → /(root).
11. Buka `admin-login.html`, login memakai ADMIN_KEY.
12. Klik `+ Create Customer`, isi nama/email/phone/access code/plan.
13. Customer login lewat `customer-login.html` menggunakan email + access code.

Access code disimpan sebagai SHA-256 hash. Session customer berlaku 12 jam dan disimpan sebagai hash token di Sheet.

Project ini untuk data non-sensitif/consent-based. Jangan gunakan untuk menyimpan OTP, password, QR/session secret, private chat, atau lokasi tanpa izin.
