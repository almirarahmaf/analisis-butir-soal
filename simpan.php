<?php
include 'config.php';

$jumlah_siswa = intval($_POST['jumlah_siswa']);
$jumlah_soal = intval($_POST['jumlah_soal']);
$r_tabel = floatval($_POST['r_tabel']);
$hasil = $_POST['hasil'];
$nilai_siswa = $_POST['nilai_siswa'];

$mapel = $_POST['mapel'] ?? '';
$tahun_ajar = $_POST['tahun_ajar'] ?? '';
$kelas = $_POST['kelas'] ?? '';
$nama_siswa = $_POST['nama_siswa'] ?? '[]';

$id_edit = isset($_POST['id_edit']) && $_POST['id_edit'] !== "null" ? intval($_POST['id_edit']) : null;

if ($id_edit) {
    // Proses UPDATE (hasil edit)
    $stmt = $conn->prepare("UPDATE hasil_analisis 
        SET jumlah_siswa=?, jumlah_soal=?, r_tabel=?, hasil=?, nilai_siswa=?, mapel=?, tahun_ajar=?, kelas=?, nama_siswa=?, waktu=NOW() 
        WHERE id=?");
    $stmt->bind_param("iidssssssi", 
        $jumlah_siswa, 
        $jumlah_soal, 
        $r_tabel, 
        $hasil, 
        $nilai_siswa, 
        $mapel, 
        $tahun_ajar, 
        $kelas, 
        $nama_siswa, 
        $id_edit
    );
} else {
    // Proses INSERT (data baru)
    $stmt = $conn->prepare("INSERT INTO hasil_analisis 
        (jumlah_siswa, jumlah_soal, r_tabel, hasil, nilai_siswa, mapel, tahun_ajar, kelas, nama_siswa, waktu) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("iidssssss", 
        $jumlah_siswa, 
        $jumlah_soal, 
        $r_tabel, 
        $hasil, 
        $nilai_siswa, 
        $mapel, 
        $tahun_ajar, 
        $kelas, 
        $nama_siswa
    );
}

if ($stmt->execute()) {
    echo "Data berhasil disimpan.";
} else {
    echo "Gagal menyimpan data: " . $stmt->error;
}
$stmt->close();
$conn->close();
?>
