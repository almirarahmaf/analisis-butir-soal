let jumlahSiswa, jumlahSoal, rTabel, nilaiSiswa = null, idEdit = null, hasilAnalisis = "";

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("btnSubmit");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            jumlahSiswa = parseInt(document.getElementById("jumlahSiswa").value);
            jumlahSoal = parseInt(document.getElementById("jumlahSoal").value);
            rTabel = parseFloat(document.getElementById("rTabel").value);

            const mapel = document.getElementById("mapel").value.trim();
            const tahunAjar = document.getElementById("tahunAjar").value.trim();
            const kelas = document.getElementById("kelas").value.trim();
            const daftarNama = document.getElementById("daftarNama").value.trim();

            const namaArray = daftarNama.split("\n").map(n => n.trim()).filter(n => n !== "");

            if (!jumlahSiswa || !jumlahSoal || isNaN(rTabel) || !mapel || !tahunAjar || !kelas || !daftarNama) {
                alert("Mohon isi semua field dengan benar.");
                return;
            }

            if (namaArray.length !== jumlahSiswa) {
                alert(`Jumlah nama siswa (${namaArray.length}) tidak sama dengan jumlah siswa (${jumlahSiswa}).`);
                return;
            }

            sessionStorage.setItem("jumlahSiswa", jumlahSiswa);
            sessionStorage.setItem("jumlahSoal", jumlahSoal);
            sessionStorage.setItem("rTabel", rTabel);
            sessionStorage.setItem("mapel", mapel);
            sessionStorage.setItem("tahunAjar", tahunAjar);
            sessionStorage.setItem("kelas", kelas);
            sessionStorage.setItem("namaSiswa", JSON.stringify(namaArray));
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

        const mapel = sessionStorage.getItem("mapel") || "-";
        const tahunAjar = sessionStorage.getItem("tahunAjar") || "-";
        const kelas = sessionStorage.getItem("kelas") || "-";

        const header = document.createElement("div");
        header.className = "mb-4 p-3 border bg-light rounded";
        header.innerHTML = `<strong>Mata Pelajaran:</strong> ${mapel}<br><strong>Tahun Ajaran:</strong> ${tahunAjar}<br><strong>Kelas:</strong> ${kelas}`;
        header.id = "headerCetak";

        const container = document.querySelector(".main-content .container-fluid") || document.querySelector(".main-content");
        if (container) container.prepend(header);

        generateTable();

        if (nilaiSiswa) {
            for (let i = 1; i <= jumlahSiswa; i++) {
                const nilaiBaris = nilaiSiswa[i - 1].join(' ');
                document.getElementById(`s${i}`).value = nilaiBaris;
            }
        }

        if (!document.getElementById("btnSimpan")) {
            let simpanBtn = document.createElement("button");
            simpanBtn.innerText = "Simpan Hasil";
            simpanBtn.className = "btn btn-success mt-3 px-4 py-2 fw-bold rounded-pill";
            simpanBtn.id = "btnSimpan";
            simpanBtn.onclick = simpanHasil;
            document.querySelector(".main-content").appendChild(simpanBtn);
        }

        const analisisBtn = document.getElementById("btnAnalisis");
        if (analisisBtn) {
            analisisBtn.addEventListener("click", analisisSoal);
        }
    }
});

function generateTable() {
    let container = document.getElementById("tabelContainer");
    let namaSiswa = JSON.parse(sessionStorage.getItem("namaSiswa")) || [];

    let table = '<table class="table table-bordered"><thead><tr><th>No</th><th>Siswa</th><th>Nilai (pisahkan dengan spasi/tab)</th></tr></thead><tbody>';
    for (let i = 1; i <= jumlahSiswa; i++) {
        table += `<tr><td>${i}</td><td>${namaSiswa[i - 1] || 'Siswa ' + i}</td><td><textarea id="s${i}" class="form-control nilai-input" rows="1" placeholder="Contoh: 1 0 1 0 1"></textarea></td></tr>`;
    }
    table += '</tbody></table>';
    container.innerHTML = `<div id="tabelNilai">${table}</div>`;
}

function analisisSoal() {
    const data = [];
    for (let i = 1; i <= jumlahSiswa; i++) {
        const nilaiStr = document.getElementById(`s${i}`).value.trim().split(/\s+/);
        if (nilaiStr.length !== jumlahSoal) {
            alert(`Jumlah nilai siswa ke-${i} tidak sesuai jumlah soal (${jumlahSoal})`);
            return;
        }
        const row = nilaiStr.map(val => parseInt(val));
        data.push(row);
    }

    if (data.length === 0 || data[0].length === 0) {
        alert("Mohon lengkapi data sebelum dianalisis.");
        return;
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

        if (sumX2 === 0 || sumY2 === 0) return 0;
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
        let kategori;
        if (p[j] < 0.31) {
            kategori = 'Sukar';
        } else if (p[j] < 0.71) {
            kategori = 'Sedang';
        } else {
            kategori = 'Mudah';
        }

        output += `<tr><td>${j + 1}</td><td>${p[j].toFixed(4)}</td><td>${kategori}</td></tr>`;
    }
    output += '</tbody></table></div>';

    // Daya Pembeda
    output += '<div class="section dayapembeda"><h6>Daya Pembeda</h6><table class="table table-bordered"><thead><tr><th>Soal</th><th>Benar Atas</th><th>Benar Bawah</th><th>Daya Pembeda</th><th>Kategori</th></tr></thead><tbody>';
    for (let j = 0; j < jumlahSoal; j++) {
        let atasBenar = atas.reduce((sum, s) => sum + s.row[j], 0);
        let bawahBenar = bawah.reduce((sum, s) => sum + s.row[j], 0);
        let dp = (atasBenar - bawahBenar) / index27;
        let kategori;
        if (dp < 0) {
            kategori = 'Sangat Buruk';
        } else if (dp < 0.20) {
            kategori = 'Buruk';
        } else if (dp < 0.30) {
            kategori = 'Cukup';
        } else if (dp < 0.40) {
            kategori = 'Baik';
        } else {
            kategori = 'Sangat Baik';
        }

        output += `<tr><td>${j + 1}</td><td>${atasBenar}</td><td>${bawahBenar}</td><td>${dp.toFixed(4)}</td><td>${kategori}</td></tr>`;
    }
    output += '</tbody></table></div>';

    // Distribusi Skor 
    let namaSiswa = JSON.parse(sessionStorage.getItem("namaSiswa")) || [];
    output += '<div class="section distribusi"><h6>Distribusi Total Skor Siswa</h6><table class="table table-bordered"><thead><tr><th>Siswa</th><th>Total Skor</th><th>Kategori</th></tr></thead><tbody>';
    sorted.forEach((s, i) => {
        let kategori = i < index27 ? 'Atas' : (i >= jumlahSiswa - index27 ? 'Bawah' : '');
        let nama = namaSiswa[s.no - 1] || `Siswa ${s.no}`;
        output += `<tr><td>${nama}</td><td>${s.total}</td><td>${kategori}</td></tr>`;
    });
    output += `</tbody></table><p><strong>Varians Skor Total:</strong> ${totalVar.toFixed(4)}</p></div>`;

    // Dominasi Kesukaran
    let kategoriKesukaran = { Sukar: 0, Sedang: 0, Mudah: 0 };
    for (let j = 0; j < jumlahSoal; j++) {
        let kategori = p[j] < 0.31 ? 'Sukar' : (p[j] < 0.71 ? 'Sedang' : 'Mudah');
        kategoriKesukaran[kategori]++;
    }
    let dominanKesukaran = Object.entries(kategoriKesukaran).sort((a,b)=>b[1]-a[1])[0][0];

    // Dominasi Daya Pembeda
    let kategoriPembeda = { 'Sangat Baik':0, 'Baik':0, 'Cukup':0, 'Buruk':0 };
    for (let j = 0; j < jumlahSoal; j++) {
        let atasBenar = atas.reduce((sum, s) => sum + s.row[j], 0);
        let bawahBenar = bawah.reduce((sum, s) => sum + s.row[j], 0);
        let dp = (atasBenar - bawahBenar) / index27;
        let kategori = dp >= 0.7 ? 'Sangat Baik' : dp >= 0.4 ? 'Baik' : dp >= 0.2 ? 'Cukup' : 'Buruk';
        kategoriPembeda[kategori]++;
    }
    let dominanPembeda = Object.entries(kategoriPembeda).sort((a,b)=>b[1]-a[1])[0][0];

    // Kelayakan
    let totalValid = validitas.filter(v => v === 'Valid').length;
    let layak = (KR20 >= 0.7 && totalValid >= jumlahSoal * 0.7) 
        ? "layak digunakan" 
        : "perlu perbaikan lebih lanjut";

    // Kesimpulan
    output += '<div class="section kesimpulan">';
    let kesimpulan = `<p><strong>Kesimpulan:</strong> Dari ${jumlahSoal} soal, ${totalValid} soal dinyatakan valid. Reliabilitas tes adalah ${isNaN(KR20) ? 'NaN' : KR20.toFixed(4)} (${KR20 < 0.7 ? 'rendah' : 'tinggi'}). Sebagian besar soal memiliki tingkat kesukaran ${dominanKesukaran.toLowerCase()} dan daya pembeda ${dominanPembeda.toLowerCase()}. Secara keseluruhan, tes ${layak}.</p>`;
    output += kesimpulan + '</div>';

    hasilAnalisis = output;
    document.getElementById('hasilAnalisis').innerHTML = output;

    if (!document.getElementById("btnCetakPDF")) {
        const cetakBtn = document.createElement("button");
        cetakBtn.innerText = "Cetak PDF";
        cetakBtn.className = "btn btn-danger mt-3 px-4 py-2 fw-bold rounded-pill";
        cetakBtn.id = "btnCetakPDF";
        cetakBtn.onclick = cetakPDF;
        document.getElementById('hasilAnalisis').appendChild(cetakBtn);
    }
}

function getTabelNilaiStatik() {
    const namaSiswa = JSON.parse(sessionStorage.getItem("namaSiswa")) || [];
    let html = `
        <h5>Daftar Nilai Siswa</h5>
        <table class="table table-bordered" style="width: 100%;">
            <thead>
                <tr>
                    <th style="text-align: center;">No</th>
                    <th style="text-align: center;">Nama Siswa</th>
                    <th style="text-align: center;">Nilai</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= jumlahSiswa; i++) {
        const nama = namaSiswa[i - 1] || `Siswa ${i}`;
        const nilai = document.getElementById(`s${i}`)?.value.trim() || "-";
        html += `
            <tr>
                <td style="text-align: center;">${i}</td>
                <td style="text-align: left;">${nama}</td>
                <td style="text-align: left;">${nilai}</td>
            </tr>
        `;
    }

    html += `</tbody></table>`;

    const div = document.createElement("div");
    div.innerHTML = html;
    return div;
}

function cetakPDF() {
    const header = document.getElementById("headerCetak");
    const analisis = document.getElementById("hasilAnalisis");

    const wrapper = document.createElement("div");
    wrapper.id = "cetakGabungan";
    wrapper.style.padding = "20px";
    wrapper.style.backgroundColor = "#fff";
    wrapper.style.color = "#000";
    wrapper.style.position = "relative";
    wrapper.style.zIndex = "10000";

    if (header) wrapper.appendChild(header.cloneNode(true));

    const tabelStatik = getTabelNilaiStatik();
    wrapper.appendChild(tabelStatik);

    if (analisis) {
        const analisisClone = analisis.cloneNode(true);
        const btn = analisisClone.querySelector("#btnCetakPDF");
        if (btn) btn.remove();
        wrapper.appendChild(analisisClone);
    }

    document.body.appendChild(wrapper);

    requestAnimationFrame(() => {
        const opt = {
            margin: 0.5,
            filename: `analisis_soal_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(wrapper).save().then(() => {
            document.body.removeChild(wrapper);
        });
    });
}

function simpanHasil() {
    const data = [];
    for (let i = 1; i <= jumlahSiswa; i++) {
        const nilaiStr = document.getElementById(`s${i}`).value.trim().split(/\s+/);
        const row = nilaiStr.map(val => parseInt(val));
        data.push(row);
    }

    if (!hasilAnalisis) {
        alert("Silakan lakukan analisis terlebih dahulu sebelum menyimpan.");
        return;
    }

    const mapel = sessionStorage.getItem("mapel") || "";
    const tahunAjar = sessionStorage.getItem("tahunAjar") || "";
    const kelas = sessionStorage.getItem("kelas") || "";
    const namaSiswa = sessionStorage.getItem("namaSiswa") || "[]";

    const formData = new URLSearchParams({
        jumlah_siswa: jumlahSiswa,
        jumlah_soal: jumlahSoal,
        r_tabel: rTabel,
        hasil: hasilAnalisis,
        nilai_siswa: JSON.stringify(data),
        id_edit: idEdit,
        mapel,
        tahun_ajar: tahunAjar,
        kelas,
        nama_siswa: namaSiswa
    });

    fetch('/analisis-soal/php/simpan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        alert("Data berhasil disimpan.");
        sessionStorage.clear();
        window.location.href = "/analisis-soal/php/riwayat.php";
    })
    .catch(err => {
        alert("Gagal menyimpan data: " + err);
    });
}
