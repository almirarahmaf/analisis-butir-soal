<?php
$host = "localhost";
$user = "root";
$pass = "admin123";
$db = "analisis_soal";

$conn = new mysqli($host, $user, $pass);

// Buat database jika belum ada
$conn->query("CREATE DATABASE IF NOT EXISTS $db");
$conn->select_db($db);

// Buat tabel jika belum ada
$conn->query("CREATE TABLE IF NOT EXISTS hasil_analisis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jumlah_siswa INT,
  jumlah_soal INT,
  r_tabel FLOAT,
  hasil LONGTEXT,
  waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");
?>
