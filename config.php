<?php
$host = "localhost";
$user = "root";
$pass = "admin123";
$db = "analisis_soal";

$conn = new mysqli($host, $user, $pass);

// Buat database jika belum ada
$conn->query("CREATE DATABASE IF NOT EXISTS $db");
$conn->select_db($db);

// Buat tabel jika belum ada (versi lengkap)
$conn->query("CREATE TABLE IF NOT EXISTS hasil_analisis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jumlah_siswa INT,
  jumlah_soal INT,
  r_tabel FLOAT,
  nilai_siswa LONGTEXT,
  nama_siswa LONGTEXT,
  mapel VARCHAR(255),
  tahun_ajar VARCHAR(50),
  kelas VARCHAR(50),
  hasil LONGTEXT,
  waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");
?>
