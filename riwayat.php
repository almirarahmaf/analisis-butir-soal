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
                <?php while($row = $result->fetch_assoc()): ?>
					<div class="card mb-5">
						<div class="card-header">
							<strong><?= date('d M Y, H:i', strtotime($row['waktu'])) ?></strong><br>
							<small>Jumlah Siswa: <?= $row['jumlah_siswa'] ?> | Jumlah Soal: <?= $row['jumlah_soal'] ?> | r Tabel: <?= $row['r_tabel'] ?></small>
						</div>
						<div class="card-body">
							<?php
							$nilai_data = json_decode($row['nilai_siswa'], true);
							if ($nilai_data && is_array($nilai_data)):
							?>
								<h5>Data Nilai Siswa</h5>
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
												<td>Siswa <?= $i + 1 ?></td>
												<?php foreach ($baris as $nilai): ?>
													<td><?= htmlspecialchars($nilai) ?></td>
												<?php endforeach; ?>
											</tr>
										<?php endforeach; ?>
									</tbody>
								</table>
								<hr>
							<?php endif; ?>

							<?= $row['hasil'] ?> <!-- kesimpulan tetap di dalam card -->
							<a href="edit.php?id=<?= $row['id'] ?>" class="btn btn-warning mt-3">Edit</a>
						</div>
					</div>
				<?php endwhile; ?>

            <?php else: ?>
                <div class="alert alert-info">Belum ada hasil analisis yang disimpan.</div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>