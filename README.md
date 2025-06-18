# 📊 Analisis Butir Soal

Program ini dapat digunakan untuk menganalisis butir soal pilihan ganda berdasarkan hasil jawaban siswa melalui perhitungan:
- Uji Validitas
- Uji Reliabilitas
- Tingkat Kesukaran
- Daya Pembeda
- Distribusi Skor Siswa

## 🚀 Fitur Utama
- Input mata pelajaran, tahun ajar, kelas, jumlah siswa, nama siswa, jumlah soal, dan r tabel secara dinamis
- Input nilai benar/salah siswa untuk tiap soal
- Perhitungan otomatis:
    - ✅ **Uji Validitas** (Korelasi Pearson antara skor tiap soal dan total skor)
    - ✅ **Uji Reliabilitas** (KR-20)
    - ✅ **Tingkat Kesukaran**
    - ✅ **Daya Pembeda**
    - ✅ **Distribusi Skor Siswa**
- Menyimpan hasil analisis ke database
- Melihat, mengedit, dan menghapus riwayat analisis

## 🛠️ Cara Menggunakan
> **Note:** Pastikan sudah menginstal `XAMPP` atau software lainnya yang menyediakan layanan Apache dan MySQL untuk menjalankan aplikasi ini

1. Clone repositori
```
git clone https://github.com/almirarahmaf/analisis-butir-soal
```
```
cd analisis-soal
```

2. Setup database
- Buat database MySQL
```
Contoh: analisis_soal
```
> **Note:** Tabel akan terbuat secara otomatis
- Sesuaikan file `config.php` dengan database lokal
- Jalankan servel lokal `contoh: XAMPP`, lalu buka `index.html` di browser

## 📸 Tampilan Website
- Halaman awal
![informasi-awal](Docs/informasi-awal.png)
- Halaman input dan analisis soal
![analisis-soal](Docs/analisis-soal.png)
- Halaman riwayat
![riwayat](Docs/riwayat.png)
- Halaman edit
![edit](Docs/edit.png)