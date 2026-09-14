# ✿ Mel's World ✿

Sebuah web interaktif, estetik, dan penuh kasih untuk Mel! Dilengkapi dengan fitur **Photobooth Stiker**, **Mesin Gacha**, dan mini-game virtual **Manjain Mel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFaridzzz24%2Fmel)

---

## ✨ Fitur Utama

1. **📸 Photobooth Gemas (Polaroid & Stiker)**
   - Menampilkan foto Mel dengan ukuran besar, jernih, dan tidak terpotong.
   - Pilihan stiker lucu (telinga kucing, pita pink, pipi merah, mahkota, boba, dll.) yang bisa ditempel dan digeser (drag & drop) baik di PC maupun layar sentuh HP.
   - Filter estetik (Normal, Soft Blush, Golden Hour, Vintage, Dreamy Glow).
   - **Tombol Jepret & Simpan**: Menghasilkan file foto murni beserta stiker dan filternya langsung tersimpan ke perangkat.
   - **Manajemen Foto Dinamis**: Bisa tambah foto baru dari galeri perangkat (➕ Tambah Foto) dan hapus foto yang tidak diinginkan (🗑️ Hapus Foto).

2. **🎰 Gacha Slot Machine**
   - 3-reel slot machine seru dengan foto-foto Mel.
   - Animasi berputar realistis dengan efek suara jackpot dan taburan confetti saat mendapatkan 3 foto kembar.
   - Pop-up pemenang menampilkan foto Mel terpilih secara jernih dan bercahaya.

3. **💖 Manjain Mel (Interactive Tamagotchi & Love Meter)**
   - Portrait besar Mel di tengah dengan reaksi animasi membal saat disentuh.
   - Aksi interaktif lucu: Kasih Boba 🧋, Kasih Kue 🍰, Puk-puk Kepala 💆‍♀️, Beri Bunga 🌸, dan Gombalan Lucu 💌.
   - *Gemas Meter* yang naik dari 0% ke 100% dengan selebrasi jackpot penuh cinta.
   - Fitur ganti gaya/foto Mel.

---

## 🚀 Cara Deploy ke Vercel

### Cara 1: Menggunakan Tombol Deploy (Paling Cepat)
Klik tombol di bawah ini untuk langsung membuat project di Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFaridzzz24%2Fmel)

### Cara 2: Import Manual di Dashboard Vercel
1. Buka [vercel.com](https://vercel.com) dan login ke akun Vercel Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari dan pilih repository **`Faridzzz24/mel`**.
4. Pada bagian **Framework Preset**, pilih **"Other"** (karena ini adalah static web HTML/CSS/JS murni).
5. Klik tombol **"Deploy"**.
6. Dalam beberapa detik, website Anda sudah online dan dapat diakses publik dengan URL `.vercel.app`! 🎉

---

## 🛠️ Teknologi
- **HTML5** & **CSS3** (Space Grotesk + Plus Jakarta Sans)
- **Vanilla JavaScript** (Web Audio API, HTML5 Canvas Rendering)
- **Local Storage** untuk persistensi galeri foto
- **Vercel Config** (`vercel.json`) untuk caching optimal dan clean URLs