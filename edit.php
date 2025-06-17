<?php
include 'config.php';

if (!isset($_GET['id'])) {
    die("ID tidak ditemukan.");
}

$id = $_GET['id'];
$result = $conn->query("SELECT * FROM hasil_analisis WHERE id = $id");
$data = $result->fetch_assoc();

$nilai_data = json_decode($data['nilai_siswa'], true);
$jumlah_siswa = $data['jumlah_siswa'];
$jumlah_soal = $data['jumlah_soal'];
$r_tabel = $data['r_tabel'];

// Metadata tambahan
$mapel = $data['mapel'] ?? '';
$tahun_ajar = $data['tahun_ajar'] ?? '';
$kelas = $data['kelas'] ?? '';
$nama_siswa = $data['nama_siswa'] ?? '[]';
$nama_array = json_decode($nama_siswa, true);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Edit Data Nilai</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
    <div class="container">
        <h2>Edit Nilai Siswa</h2>
        <form id="editForm">
            <!-- Hidden input -->
            <input type="hidden" id="jumlahSiswa" value="<?= $jumlah_siswa ?>">
            <input type="hidden" id="jumlahSoal" value="<?= $jumlah_soal ?>">
            <input type="hidden" id="rTabel" value="<?= $r_tabel ?>">
            <input type="hidden" id="idEdit" value="<?= $id ?>">
            <input type="hidden" id="mapel" value="<?= htmlspecialchars($mapel) ?>">
            <input type="hidden" id="tahunAjar" value="<?= htmlspecialchars($tahun_ajar) ?>">
            <input type="hidden" id="kelas" value="<?= htmlspecialchars($kelas) ?>">
            <input type="hidden" id="namaSiswa" value='<?= htmlspecialchars($nama_siswa) ?>'>

            <div class="mb-3">
                <strong>Mata Pelajaran:</strong> <?= htmlspecialchars($mapel) ?><br>
                <strong>Tahun Ajaran:</strong> <?= htmlspecialchars($tahun_ajar) ?><br>
                <strong>Kelas:</strong> <?= htmlspecialchars($kelas) ?>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nama Siswa</th>
                            <?php for ($j = 1; $j <= $jumlah_soal; $j++): ?>
                                <th>Soal <?= $j ?></th>
                            <?php endfor; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($nilai_data as $i => $baris): ?>
                            <tr>
                                <td><?= isset($nama_array[$i]) ? htmlspecialchars($nama_array[$i]) : "Siswa " . ($i + 1) ?></td>
                                <?php foreach ($baris as $j => $nilai): ?>
                                    <td>
                                        <input type="number" min="0" max="1" id="s<?= $i + 1 ?>q<?= $j + 1 ?>" value="<?= $nilai ?>" class="form-control form-control-sm" style="min-width: 80px;" required>
                                    </td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <button type="button" id="lanjutEdit" class="btn btn-success">Lanjut Analisis</button>
            <a href="riwayat.php" class="btn btn-secondary">Kembali</a>
        </form>
    </div>

    <script>
    document.getElementById("lanjutEdit").addEventListener("click", () => {
        let jumlahSiswa = parseInt(document.getElementById("jumlahSiswa").value);
        let jumlahSoal = parseInt(document.getElementById("jumlahSoal").value);
        let rTabel = parseFloat(document.getElementById("rTabel").value);
        let idEdit = document.getElementById("idEdit").value;

        const mapel = document.getElementById("mapel").value;
        const tahunAjar = document.getElementById("tahunAjar").value;
        const kelas = document.getElementById("kelas").value;
        const namaSiswaRaw = document.getElementById("namaSiswa").value;

        const nilai = [];
        for (let i = 1; i <= jumlahSiswa; i++) {
            const row = [];
            for (let j = 1; j <= jumlahSoal; j++) {
                let val = parseInt(document.getElementById(`s${i}q${j}`).value) || 0;
                row.push(val);
            }
            nilai.push(row);
        }

        sessionStorage.setItem("jumlahSiswa", jumlahSiswa);
        sessionStorage.setItem("jumlahSoal", jumlahSoal);
        sessionStorage.setItem("rTabel", rTabel);
        sessionStorage.setItem("nilaiSiswa", JSON.stringify(nilai));
        sessionStorage.setItem("idEdit", idEdit);
        sessionStorage.setItem("mapel", mapel);
        sessionStorage.setItem("tahunAjar", tahunAjar);
        sessionStorage.setItem("kelas", kelas);
        sessionStorage.setItem("namaSiswa", namaSiswaRaw);

        window.location.href = "input.html";
    });
    </script>
</body>
</html>
