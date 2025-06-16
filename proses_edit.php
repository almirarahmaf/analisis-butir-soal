<?php
include 'config.php';

$id = $_POST['id'];
$nilai = $_POST['nilai'];
$encoded_nilai = json_encode($nilai);

// Persiapan variabel
$jumlah_siswa = count($nilai);
$jumlah_soal = count($nilai[0]);

// Hitung total skor per siswa
$total_skor = array_map(function($row) {
    return array_sum($row);
}, $nilai);
$skor_mean = array_sum($total_skor) / $jumlah_siswa;
$var_total = array_sum(array_map(function($s) use ($skor_mean) {
    return pow($s - $skor_mean, 2);
}, $total_skor)) / ($jumlah_siswa - 1);

// Fungsi korelasi Pearson
function korelasi($x, $y) {
    $n = count($x);
    $meanX = array_sum($x) / $n;
    $meanY = array_sum($y) / $n;

    $sumXY = 0; $sumX2 = 0; $sumY2 = 0;
    for ($i = 0; $i < $n; $i++) {
        $dx = $x[$i] - $meanX;
        $dy = $y[$i] - $meanY;
        $sumXY += $dx * $dy;
        $sumX2 += $dx * $dx;
        $sumY2 += $dy * $dy;
    }
    return $sumX2 * $sumY2 == 0 ? 0 : $sumXY / sqrt($sumX2 * $sumY2);
}

$r_tabel = 0.361; // Default nilai r tabel (bisa sesuaikan)
$p = []; $q = []; $pq = []; $rHitung = []; $validitas = [];
$output = "<h5>Hasil Analisis (diperbarui)</h5>";

// --- Validitas ---
for ($j = 0; $j < $jumlah_soal; $j++) {
    $skor_soal = array_column($nilai, $j);
    $pj = array_sum($skor_soal) / $jumlah_siswa;
    $qj = 1 - $pj;
    $p[] = $pj;
    $q[] = $qj;
    $pq[] = $pj * $qj;
    $r = korelasi($skor_soal, $total_skor);
    $rHitung[] = $r;
    $validitas[] = $r >= $r_tabel ? 'Valid' : 'Tidak Valid';
}

$output .= "<div><h6>Uji Validitas</h6><table class='table table-bordered'><thead><tr><th>Soal</th><th>r hitung</th><th>r tabel</th><th>Hasil</th></tr></thead><tbody>";
foreach ($rHitung as $i => $r) {
    $output .= "<tr><td>" . ($i + 1) . "</td><td>" . round($r, 4) . "</td><td>$r_tabel</td><td>{$validitas[$i]}</td></tr>";
}
$output .= "</tbody></table></div>";

// --- Reliabilitas (KR-20) ---
$KR20 = ($jumlah_soal / ($jumlah_soal - 1)) * (1 - (array_sum($pq) / $var_total));
$reliabilitas_kat = "NaN";
if (!is_nan($KR20)) {
    if ($KR20 < 0.5) $reliabilitas_kat = "Sangat Rendah";
    else if ($KR20 < 0.7) $reliabilitas_kat = "Rendah";
    else if ($KR20 < 0.9) $reliabilitas_kat = "Cukup";
    else $reliabilitas_kat = "Tinggi";
}
$output .= "<div><h6>Uji Reliabilitas (KR-20)</h6><p>KR-20 = " . round($KR20, 4) . " ($reliabilitas_kat)</p></div>";

// --- Tingkat Kesukaran ---
$output .= "<div><h6>Tingkat Kesukaran</h6><table class='table table-bordered'><thead><tr><th>Soal</th><th>P</th><th>Kategori</th></tr></thead><tbody>";
foreach ($p as $i => $val) {
    $kategori = $val < 0.31 ? 'Sukar' : ($val < 0.71 ? 'Sedang' : 'Mudah');
    $output .= "<tr><td>" . ($i + 1) . "</td><td>" . round($val, 4) . "</td><td>$kategori</td></tr>";
}
$output .= "</tbody></table></div>";

// --- Daya Pembeda ---
$index27 = ceil(0.27 * $jumlah_siswa);
$sorted = [];
foreach ($nilai as $i => $row) {
    $sorted[] = ['index' => $i, 'total' => $total_skor[$i], 'row' => $row];
}
usort($sorted, fn($a, $b) => $b['total'] - $a['total']);
$atas = array_slice($sorted, 0, $index27);
$bawah = array_slice($sorted, -$index27);

$output .= "<div><h6>Daya Pembeda</h6><table class='table table-bordered'><thead><tr><th>Soal</th><th>Benar Atas</th><th>Benar Bawah</th><th>DP</th><th>Kategori</th></tr></thead><tbody>";
for ($j = 0; $j < $jumlah_soal; $j++) {
    $atasBenar = array_sum(array_column($atas, 'row', 'index'))[$j];
    $bawahBenar = array_sum(array_column($bawah, 'row', 'index'))[$j];
    $dp = ($atasBenar - $bawahBenar) / $index27;
    $kategori = $dp >= 0.7 ? 'Sangat Baik' : ($dp >= 0.4 ? 'Baik' : ($dp >= 0.2 ? 'Cukup' : 'Buruk'));
    $output .= "<tr><td>" . ($j + 1) . "</td><td>$atasBenar</td><td>$bawahBenar</td><td>" . round($dp, 4) . "</td><td>$kategori</td></tr>";
}
$output .= "</tbody></table></div>";

// --- Kesimpulan ---
$totalValid = count(array_filter($validitas, fn($v) => $v === 'Valid'));
$kelayakan = $KR20 >= 0.7 && $totalValid >= $jumlah_soal * 0.7 ? 'layak digunakan' : 'perlu perbaikan lebih lanjut';
$output .= "<div><h6>Kesimpulan</h6><p>Dari $jumlah_soal soal, $totalValid valid. Reliabilitas tes adalah " . round($KR20, 4) . " ($reliabilitas_kat). Tes $kelayakan.</p></div>";

// Simpan ke database
$stmt = $conn->prepare("UPDATE hasil_analisis SET nilai_siswa = ?, jumlah_siswa = ?, jumlah_soal = ?, hasil = ?, r_tabel = ?, waktu = NOW() WHERE id = ?");
$stmt->bind_param("sissdi", $encoded_nilai, $jumlah_siswa, $jumlah_soal, $output, $r_tabel, $id);
$stmt->execute();

header("Location: riwayat.php");
exit;
?>
