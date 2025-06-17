<?php
include 'config.php';
$result = $conn->query("SELECT * FROM hasil_analisis ORDER BY waktu DESC");
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Riwayat Analisis Butir Soal</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <link href="style_riwayat.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-sm">
        <div class="container-fluid">
            <a class="navbar-brand">Analisis Butir Soal</a>
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="index.html">Beranda</a>
                </li>
            </ul>
        </div>
    </nav>

    <div class="main-content">
        <div class="container">
            <h2>Riwayat Analisis Butir Soal</h2>

            <?php if ($result->num_rows > 0): ?>
                <?php while($row = $result->fetch_assoc()): 
                    $id = $row['id'];
                    $nilai_data = json_decode($row['nilai_siswa'], true);
                    $nama_siswa = json_decode($row['nama_siswa'], true);
                ?>
                <div class="card mb-5 shadow-sm">
                    <div class="card-header bg-light position-relative">
						<div>
							<strong><?= date('d M Y, H:i', strtotime($row['waktu'])) ?></strong><br>
							<small>
								<strong>Mata Pelajaran:</strong> <?= htmlspecialchars($row['mapel']) ?> |
								<strong>Tahun Ajar:</strong> <?= htmlspecialchars($row['tahun_ajar']) ?> |
								<strong>Kelas:</strong> <?= htmlspecialchars($row['kelas']) ?>
							</small><br>
							<small>Jumlah Siswa: <?= $row['jumlah_siswa'] ?> | Jumlah Soal: <?= $row['jumlah_soal'] ?> | r Tabel: <?= $row['r_tabel'] ?></small>
						</div>

						<button class="btn btn-sm btn-primary toggle-btn position-absolute top-0 end-0 m-3" 
							type="button" 
							data-bs-toggle="collapse" 
							data-bs-target="#collapse<?= $id ?>" 
							aria-expanded="false" 
							aria-controls="collapse<?= $id ?>">
							Tampilkan Hasil Analisis
						</button>
					</div>


                    <div class="collapse" id="collapse<?= $id ?>">
                        <div class="card-body">
                            <?php if ($nilai_data && is_array($nilai_data)): ?>
                                <h5>Data Nilai Siswa</h5>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Siswa</th>
                                                <?php for ($i = 1; $i <= count($nilai_data[0]); $i++): ?>
                                                    <th>Soal <?= $i ?></th>
                                                <?php endfor; ?>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($nilai_data as $i => $baris): ?>
                                                <tr>
                                                    <td><?= isset($nama_siswa[$i]) ? htmlspecialchars($nama_siswa[$i]) : 'Siswa ' . ($i + 1) ?></td>
                                                    <?php foreach ($baris as $nilai): ?>
                                                        <td><?= htmlspecialchars($nilai) ?></td>
                                                    <?php endforeach; ?>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            <?php endif; ?>

                            <hr>
                            <?= $row['hasil'] ?>
                            <a href="edit.php?id=<?= $row['id'] ?>" class="btn btn-warning mt-3">Edit</a>
                        </div>
                    </div>
                </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="alert alert-info">Belum ada hasil analisis yang disimpan.</div>
            <?php endif; ?>
        </div>
    </div>

    <script>
    // Ubah label tombol saat collapse terbuka/tertutup
    document.addEventListener("DOMContentLoaded", () => {
        const toggleButtons = document.querySelectorAll(".toggle-btn");
        toggleButtons.forEach(btn => {
            const targetId = btn.getAttribute("data-bs-target");
            const targetEl = document.querySelector(targetId);

            if (targetEl) {
                targetEl.addEventListener("shown.bs.collapse", () => {
                    btn.textContent = "Sembunyikan Hasil Analisis";
                });
                targetEl.addEventListener("hidden.bs.collapse", () => {
                    btn.textContent = "Tampilkan Hasil Analisis";
                });
            }
        });
    });
    </script>
</body>
</html>
