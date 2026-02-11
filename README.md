# 🌊 Fluctus Photobooth Queue System

**Fluctus** (Latin: *Gelombang*) adalah sistem manajemen antrian modern bertema laut yang dirancang khusus untuk kebutuhan photobooth pada acara pernikahan, ulang tahun, atau event korporat. Aplikasi ini mengutamakan estetika *glassmorphism* yang elegan dan kemudahan operasional.

## 🚀 Fitur Utama

Aplikasi ini terbagi menjadi 3 bagian utama:

### 1. 📱 Registration View (Halaman Pengunjung)
*   **Self-Registration**: Pengunjung dapat mendaftarkan nama dan nomor WhatsApp mereka secara mandiri.
*   **Virtual Ticket**: Setelah mendaftar, pengunjung mendapatkan nomor antrian dalam tampilan desain "Ticket" yang menarik.
*   **Auto-Save**: Data tersimpan secara lokal sehingga tidak hilang jika halaman ter-refresh.

### 2. 📺 Display View (Layar TV/Monitor)
*   **Live Calling**: Menampilkan nomor yang sedang dipanggil dengan ukuran besar dan efek cahaya (glow).
*   **Audio Notification**: Bunyi *chime* otomatis setiap kali ada panggilan nomor baru.
*   **Next In Line**: Daftar 5 antrian berikutnya untuk memberi estimasi kepada pengunjung yang menunggu.
*   **Smooth Animation**: Animasi gelembung laut dan transisi yang halus untuk estetika visual di lokasi acara.

### 3. ⚙️ Admin View (Dashboard Operator)
*   **Command Center**: Kontrol penuh untuk memanggil antrian berikutnya (*Call Next*) dengan satu klik.
*   **WhatsApp Integration**: Kirim notifikasi otomatis ke pengunjung melalui WhatsApp API untuk memberitahu giliran mereka telah tiba.
*   **Queue Management**: Selesaikan antrian atau hapus data jika diperlukan.
*   **History Log**: Memantau aktivitas antrian yang sudah selesai.

## 🎨 Estetika Desain
*   **Deep Ocean Theme**: Menggunakan palet warna biru laut dalam (`#075985` ke `#0c4a6e`).
*   **Glassmorphism**: Komponen kartu transparan dengan efek blur (*frosted glass*).
*   **Floating Bubbles**: Background interaktif dengan gelembung yang bergerak perlahan.
*   **Responsive**: Dapat diakses melalui tablet (Admin), HP (Pendaftaran), dan TV (Display).

## 🛠️ Teknologi
*   **Framework**: React 19
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **State Management**: React Hooks (useState, useEffect, useCallback)
*   **Storage**: Browser LocalStorage (Data sinkron otomatis antar tab dalam satu browser).

## 📝 Cara Penggunaan
1.  Buka aplikasi di browser.
2.  Gunakan navigasi di bagian bawah untuk berpindah antar mode:
    *   **Register**: Berikan perangkat (HP/Tablet) ke pengunjung.
    *   **TV Display**: Tampilkan di layar monitor besar.
    *   **Control**: Gunakan oleh operator photobooth.
3.  Pastikan fitur suara aktif di browser agar notifikasi panggilan terdengar.

---
*Developed with love for beautiful events. "Keep the flow, capture the glow."* 🌊✨
