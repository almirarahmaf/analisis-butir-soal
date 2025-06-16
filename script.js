let jumlahSiswa, jumlahSoal, rTabel, nilaiSiswa = null, idEdit = null;
let hasilAnalisis = ""; 

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("btnSubmit");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            jumlahSiswa = parseInt(document.getElementById('jumlahSiswa').value);
            jumlahSoal = parseInt(document.getElementById('jumlahSoal').value);
            rTabel = parseFloat(document.getElementById('rTabel').value);

            if (!jumlahSiswa || !jumlahSoal || isNaN(rTabel)) {
                alert('Mohon isi semua field dengan benar.');
                return;
            }

            sessionStorage.setItem("jumlahSiswa", jumlahSiswa);
            sessionStorage.setItem("jumlahSoal", jumlahSoal);
            sessionStorage.setItem("rTabel", rTabel);
            sessionStorage.removeItem("nilaiSiswa");
            sessionStorage.removeItem("idEdit");

            window.location.href = "input.html";
        });
    }

    if (window.location.pathname.endsWith("input.html")) {
        jumlahSiswa = parseInt(sessionStorage.getItem("jumlahSiswa"));
        jumlahSoal = parseInt(sessionStorage.getItem("jumlahSoal"));
        rTabel = parseFloat(sessionStorage.getItem("rTabel"));
        nilaiSiswa = JSON.parse(sessionStorage.getItem("nilaiSiswa")) || null;
        idEdit = sessionStorage.getItem("idEdit") || null;

        generateTable();

        if (nilaiSiswa) {
            for (let i = 1; i <= jumlahSiswa; i++) {
                for (let j = 1; j <= jumlahSoal; j++) {
                    document.getElementById(`s${i}q${j}`).value = nilaiSiswa[i-1][j-1];
                }
            }
        }

        if (!document.getElementById("btnSimpan")) {
            let simpanBtn = document.createElement("button");
            simpanBtn.innerText = "Simpan Hasil";
            simpanBtn.className = "btn btn-primary mt-3";
            simpanBtn.id = "btnSimpan";
            simpanBtn.onclick = simpanHasil;
            document.querySelector(".main-content").appendChild(simpanBtn);
        }
    }
});

function generateTable() {
    let container = document.getElementById('tabelContainer');
    let table = '<table class="table table-bordered"><thead><tr><th>No</th><th>Siswa</th>';
    for (let i = 1; i <= jumlahSoal; i++) {
        table += `<th>Soal ${i}</th>`;
    }
    table += '</tr></thead><tbody>';
    for (let i = 1; i <= jumlahSiswa; i++) {
        table += `<tr><td>${i}</td><td>Siswa ${i}</td>`;
        for (let j = 1; j <= jumlahSoal; j++) {
            table += `<td><input type="number" min="0" max="1" id="s${i}q${j}"/></td>`;
        }
        table += '</tr>';
    }
    table += '</tbody></table>';
    container.innerHTML = table;
}

function analisisSoal() {
    const data = [];
    for (let i = 1; i <= jumlahSiswa; i++) {
        const row = [];
        for (let j = 1; j <= jumlahSoal; j++) {
            const val = parseInt(document.getElementById(`s${i}q${j}`).value) || 0;
            row.push(val);
        }
        data.push(row);
    }

    function korelasiPearson(x, y) {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            sumXY += dx * dy;
            sumX2 += dx * dx;
            sumY2 += dy * dy;
        }
        return sumXY / Math.sqrt(sumX2 * sumY2);
    }

    let output = '<h5>Hasil Analisis</h5>';
    let totalSkor = data.map(row => row.reduce((a,b) => a + b, 0));
    let skorMean = totalSkor.reduce((a, b) => a + b, 0) / jumlahSiswa;
    let totalVar = totalSkor.map(s => Math.pow(s - skorMean, 2)).reduce((a, b) => a + b, 0) / (jumlahSiswa - 1);

    let p = [], q = [], pq = [], rHitung = [], validitas = [];

    for (let j = 0; j < jumlahSoal; j++) {
        let benar = data.reduce((sum, row) => sum + row[j], 0);
        let pj = benar / jumlahSiswa;
        let qj = 1 - pj;
        p.push(pj);
        q.push(qj);
        pq.push(pj * qj);

        let skorSoal = data.map(row => row[j]);
        let r = korelasiPearson(skorSoal, totalSkor);
        rHitung.push(r);
        validitas.push(r >= rTabel ? 'Valid' : 'Tidak Valid');
    }

    let KR20 = (jumlahSoal / (jumlahSoal - 1)) * (1 - (pq.reduce((a,b)=>a+b,0) / totalVar));
    let index27 = Math.ceil(0.27 * jumlahSiswa);
    let sorted = data.map((row, idx) => ({ row, total: totalSkor[idx], no: idx + 1 }))
                    .sort((a, b) => b.total - a.total);
    let atas = sorted.slice(0, index27);
    let bawah = sorted.slice(-index27);

    // Validitas
    output += '<div class="section validitas"><h6>Uji Validitas</h6><table class="table table-bordered"><thead><tr><th>Soal</th><th>r hitung</th><th>r tabel</th><th>Hasil</th></tr></thead><tbody>';
    for (let j = 0; j < jumlahSoal; j++) {
        output += `<tr><td>${j + 1}</td><td>${rHitung[j].toFixed(4)}</td><td>${rTabel}</td><td>${validitas[j]}</td></tr>`;
    }
    output += '</tbody></table></div>';

    // Reliabilitas
    output += '<div class="section reliabilitas"><h6>Uji Reliabilitas (KR-20)</h6><table class="table table-bordered"><thead><tr><th>Soal</th><th>P</th><th>Q</th><th>PQ</th></tr></thead><tbody>';
    for (let j = 0; j < jumlahSoal; j++) {
        output += `<tr><td>${j + 1}</td><td>${p[j].toFixed(4)}</td><td>${q[j].toFixed(4)}</td><td>${pq[j].toFixed(4)}</td></tr>`;
    }
    let kategoriReliabilitas = 'NaN';
    if (!isNaN(KR20)) {
        if (KR20 < 0.5) kategoriReliabilitas = 'Sangat Rendah';
        else if (KR20 < 0.7) kategoriReliabilitas = 'Rendah';
        else if (KR20 < 0.9) kategoriReliabilitas = 'Cukup';
        else kategoriReliabilitas = 'Tinggi';
    }
    output += `</tbody></table><p><strong>Reliabilitas:</strong> ${isNaN(KR20) ? 'NaN' : KR20.toFixed(4)} (${kategoriReliabilitas})</p></div>`;

    // Tingkat Kesukaran
    output += '<div class="section kesukaran"><h6>Tingkat Kesukaran</h6><table class="table table-bordered"><thead><tr><th>Soal</th><th>P</th><th>Kategori</th></tr></thead><tbody>';
    for (let j = 0; j < jumlahSoal; j++) {
        let kategori = p[j] < 0.31 ? 'Sukar' : (p[j] < 0.71 ? 'Sedang' : 'Mudah');
        output += `<tr><td>${j + 1}</td><td>${p[j].toFixed(4)}</td><td>${kategori}</td></tr>`;
    }
    output += '</tbody></table></div>';

    // Daya Pembeda
    output += '<div class="section dayapembeda"><h6>Daya Pembeda</h6><table class="table table-bordered"><thead><tr><th>Soal</th><th>Benar Atas</th><th>Benar Bawah</th><th>Daya Pembeda</th><th>Kategori</th></tr></thead><tbody>';
    for (let j = 0; j < jumlahSoal; j++) {
        let atasBenar = atas.reduce((sum, s) => sum + s.row[j], 0);
        let bawahBenar = bawah.reduce((sum, s) => sum + s.row[j], 0);
        let dp = (atasBenar - bawahBenar) / index27;
        let kategori = dp >= 0.7 ? 'Sangat Baik' : dp >= 0.4 ? 'Baik' : dp >= 0.2 ? 'Cukup' : 'Buruk';
        output += `<tr><td>${j + 1}</td><td>${atasBenar}</td><td>${bawahBenar}</td><td>${dp.toFixed(4)}</td><td>${kategori}</td></tr>`;
    }
    output += '</tbody></table></div>';

    // Distribusi Skor
    output += '<div class="section distribusi"><h6>Distribusi Total Skor Siswa</h6><table class="table table-bordered"><thead><tr><th>Siswa</th><th>Total Skor</th><th>Kategori</th></tr></thead><tbody>';
    sorted.forEach((s, i) => {
        let kategori = i < index27 ? 'Atas' : (i >= jumlahSiswa - index27 ? 'Bawah' : '');
        output += `<tr><td>Siswa ${s.no}</td><td>${s.total}</td><td>${kategori}</td></tr>`;
    });
    output += `</tbody></table><p><strong>Varians Skor Total:</strong> ${totalVar.toFixed(4)}</p></div>`;

    // Hitung dominasi kesukaran
    let kategoriKesukaran = { Sukar: 0, Sedang: 0, Mudah: 0 };
    for (let j = 0; j < jumlahSoal; j++) {
        let kategori = p[j] < 0.31 ? 'Sukar' : (p[j] < 0.71 ? 'Sedang' : 'Mudah');
        kategoriKesukaran[kategori]++;
    }
    let dominanKesukaran = Object.entries(kategoriKesukaran).sort((a,b)=>b[1]-a[1])[0][0];

    // Hitung dominasi daya pembeda
    let kategoriPembeda = { 'Sangat Baik':0, 'Baik':0, 'Cukup':0, 'Buruk':0 };
    for (let j = 0; j < jumlahSoal; j++) {
        let atasBenar = atas.reduce((sum, s) => sum + s.row[j], 0);
        let bawahBenar = bawah.reduce((sum, s) => sum + s.row[j], 0);
        let dp = (atasBenar - bawahBenar) / index27;
        let kategori = dp >= 0.7 ? 'Sangat Baik' : dp >= 0.4 ? 'Baik' : dp >= 0.2 ? 'Cukup' : 'Buruk';
        kategoriPembeda[kategori]++;
    }
    let dominanPembeda = Object.entries(kategoriPembeda).sort((a,b)=>b[1]-a[1])[0][0];

    // Tentukan kelayakan
    let layak = (KR20 >= 0.7 && totalValid >= jumlahSoal * 0.7) 
        ? "layak digunakan" 
        : "perlu perbaikan lebih lanjut";

    // Kesimpulan
    output += '<div class="section kesimpulan">';
    let totalValid = validitas.filter(v => v === 'Valid').length;
    let kesimpulan = `<p><strong>Kesimpulan:</strong> Dari ${jumlahSoal} soal, ${totalValid} soal dinyatakan valid. Reliabilitas tes adalah ${isNaN(KR20) ? 'NaN' : KR20.toFixed(4)} (${KR20 < 0.7 ? 'rendah' : 'tinggi'}). Sebagian besar soal memiliki tingkat kesukaran ${dominanKesukaran.toLowerCase()} dan daya pembeda ${dominanPembeda.toLowerCase()}. Secara keseluruhan, tes ${layak}.</p>`;
    output += kesimpulan + '</div>';

    document.getElementById('hasilAnalisis').innerHTML = output;
    hasilAnalisis = output;
}

function simpanHasil() {
    const data = [];
    for (let i = 1; i <= jumlahSiswa; i++) {
        const row = [];
        for (let j = 1; j <= jumlahSoal; j++) {
            const val = parseInt(document.getElementById(`s${i}q${j}`).value) || 0;
            row.push(val);
        }
        data.push(row);
    }

    if (!hasilAnalisis) {
        alert("Silakan lakukan analisis terlebih dahulu sebelum menyimpan.");
        return;
    }

    const formData = new URLSearchParams({
        jumlah_siswa: jumlahSiswa,
        jumlah_soal: jumlahSoal,
        r_tabel: rTabel,
        hasil: hasilAnalisis,
        nilai_siswa: JSON.stringify(data),
        id_edit: idEdit
    });

    fetch('simpan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        alert("Data berhasil disimpan.");
        sessionStorage.clear();
        window.location.href = "riwayat.php";
    })
    .catch(err => {
        alert("Gagal menyimpan data: " + err);
    });
}
