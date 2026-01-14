/* =========================================
   1. NAVIGASI HALAMAN (AUTO CENTER MAP)
   ========================================= */
function showPage(pageId, btn) {
    const pages = document.querySelectorAll('.content');
    const buttons = document.querySelectorAll('.navbar button');

    pages.forEach(p => p.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        if (btn) btn.classList.add('active');

        // Render ulang peta jika masuk tab peta
        if (pageId === 'peta') {
            setTimeout(() => {
                if (typeof initMap === 'function') initMap();
                if (map) {
                    map.invalidateSize();
                    map.flyTo([-1.5, 117], 5, { animate: true, duration: 1.5 });
                }
            }, 100);
        }
    } else {
        console.error("Halaman ID '" + pageId + "' tidak ditemukan!");
    }
}

/* =========================================
   2. DATA & VARIABEL GLOBAL PETA (LENGKAP)
   ========================================= */
let mapLoaded = false;
let map;
let allMarkers = [];

// DATA LENGKAP 68 TITIK LOKASI
const lokasiRadioaktif = [
    { nama: "Tapanuli Tengah, Sumatra Utara", lat: 1.70, lon: 98.80, mineral: "Granit & Sedimen Tua (Radiasi Rendah)", tipe: "Th dan U", wilayah: "Sumatra Utara" },
    { nama: "Pegunungan Barisan, Sumatra Barat", lat: -0.20, lon: 100.50, mineral: "Granit Tipe-S & Aluvial", tipe: "Th dan U", wilayah: "Sumatra Barat" },
    { nama: "Sarolangun, Jambi", lat: -2.30, lon: 102.30, mineral: "Granit & Urat Pegmatit", tipe: "Th dominan", wilayah: "Jambi" },
    { nama: "Rejang Lebong, Bengkulu", lat: -3.45, lon: 102.55, mineral: "Granit & Batuan Metamorf", tipe: "Th dan U", wilayah: "Bengkulu" },
    { nama: "Way Kambas, Lampung", lat: -4.90, lon: 105.75, mineral: "Sedimen Aluvial (Anomali Uranium)", tipe: "U jejak", wilayah: "Lampung" },
    { nama: "Pegunungan Selatan Jawa Barat", lat: -7.20, lon: 107.30, mineral: "Vulkanik & Sedimen", tipe: "U jejak", wilayah: "Jawa Barat" },
    { nama: "Pegunungan Serayu, Jawa Tengah", lat: -7.40, lon: 109.80, mineral: "Sedimen Tua & Metamorf", tipe: "Th dan U", wilayah: "Jawa Tengah" },
    { nama: "Pacitan–Trenggalek, Jawa Timur", lat: -8.20, lon: 111.50, mineral: "Kompleks Metamorf Selatan Jawa", tipe: "Th dominan", wilayah: "Jawa Timur" },
    { nama: "Karangsambung, Kebumen", lat: -7.60, lon: 109.65, mineral: "Kompleks Melange & Ofiolit", tipe: "Th dan U rendah", wilayah: "Jawa Tengah" },
    { nama: "Buleleng, Bali Utara", lat: -8.15, lon: 114.90, mineral: "Vulkanik & Aluvial", tipe: "U jejak", wilayah: "Bali" },
    { nama: "Karangasem, Bali Timur", lat: -8.35, lon: 115.60, mineral: "Vulkanik Muda (Radiasi Rendah)", tipe: "U jejak", wilayah: "Bali" },
    { nama: "Dompu, Pulau Sumbawa (NTB)", lat: -8.55, lon: 118.50, mineral: "Vulkanik & Sedimen", tipe: "Th dan U", wilayah: "Nusa Tenggara Barat" },
    { nama: "Lombok Timur, NTB", lat: -8.65, lon: 116.45, mineral: "Vulkanik Busur Sunda", tipe: "U jejak", wilayah: "Nusa Tenggara Barat" },
    { nama: "Ende, Flores Tengah (NTT)", lat: -8.85, lon: 121.65, mineral: "Vulkanik & Sedimen", tipe: "Th dan U", wilayah: "Nusa Tenggara Timur" },
    { nama: "Manggarai Barat, Flores", lat: -8.50, lon: 119.95, mineral: "Vulkanik & Aluvial", tipe: "Th dan U rendah", wilayah: "Nusa Tenggara Timur" },
    { nama: "Alor, NTT", lat: -8.25, lon: 124.50, mineral: "Vulkanik Busur Banda", tipe: "U jejak", wilayah: "Nusa Tenggara Timur" },
    { nama: "Seram Tengah, Maluku", lat: -3.00, lon: 129.30, mineral: "Metamorf & Granit", tipe: "Th dan U", wilayah: "Maluku" },
    { nama: "Buru Selatan, Maluku", lat: -3.70, lon: 126.80, mineral: "Metamorf & Aluvial", tipe: "Th dominan", wilayah: "Maluku" },
    { nama: "Kei Kecil, Maluku Tenggara", lat: -5.65, lon: 132.70, mineral: "Sedimen Karbonat & Aluvial", tipe: "Th rendah", wilayah: "Maluku Tenggara" },
    { nama: "Aru Selatan, Maluku Tenggara", lat: -6.50, lon: 134.20, mineral: "Sedimen Pantai & Aluvial", tipe: "Th rendah", wilayah: "Maluku Tenggara" },
    { nama: "Pantai Toboali, Bangka Selatan", lat: -3.05, lon: 106.03, mineral: "Pasir Berat Pantai (Monazit, Ilmenit, Zirkon)", tipe: "Th dominan, U jejak", wilayah: "Bangka Selatan" },
    { nama: "Pantai Sadai, Bangka Selatan", lat: -3.17, lon: 106.22, mineral: "Pasir Berat Pantai (Monazit)", tipe: "Th dominan, U jejak", wilayah: "Bangka Selatan" },
    { nama: "Pantai Ketapang, Bangka Selatan", lat: -2.98, lon: 106.32, mineral: "Plaser Mineral Berat (Monazit)", tipe: "Th dominan, U jejak", wilayah: "Bangka Selatan" },
    { nama: "Pantai Muntok, Bangka Barat", lat: -2.06, lon: 105.16, mineral: "Sedimen Pantai & Tailing Timah", tipe: "Th dominan, U jejak", wilayah: "Bangka Barat" },
    { nama: "Granit Utara Bangka", lat: -1.80, lon: 105.90, mineral: "Granit & Aluvial Kaya Monazit", tipe: "Th dan U", wilayah: "Bangka" },
    { nama: "Zona Tengah Timur Bangka", lat: -2.30, lon: 106.20, mineral: "Granit & Endapan Aluvial", tipe: "Th dan U", wilayah: "Bangka" },
    { nama: "Pulau Belitung", lat: -2.85, lon: 107.80, mineral: "Pasir Timah & Monazit", tipe: "Th dominan, U jejak", wilayah: "Belitung" },
    { nama: "Pulau Singkep (Bekas Tambang)", lat: -0.68, lon: 104.50, mineral: "Pasir Bekas Tambang Timah (Monazit, REE)", tipe: "Th dominan, U jejak", wilayah: "Kepulauan Riau" },
    { nama: "Kalan, Melawi", lat: -0.40, lon: 112.05, mineral: "Uraninit dalam Kuarsit & Granit", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Rirang Tanah Merah (Utara Kalan)", lat: -0.35, lon: 112.05, mineral: "Lensa Bijih Uranium dalam Urat Batuan", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Remaja Hitam (Eko-Remaja)", lat: -0.50, lon: 110.50, mineral: "Urat (Vein) Uranium di Batuan Metamorf", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Menukung Area, Kalimantan Barat", lat: -0.55, lon: 112.40, mineral: "Batubara & Lempung Karbonan", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Karimata Ketapang Rirang", lat: -1.90, lon: 109.90, mineral: "Granit & Pasir Berat", tipe: "Th dan U", wilayah: "Kalimantan Barat" },
    { nama: "Mamuju (Adang Tapalang)", lat: -2.70, lon: 118.90, mineral: "Batuan Kaya U & Th (Radiasi Latar Tinggi)", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Pasangkayu, Sulawesi Barat", lat: -1.45, lon: 119.35, mineral: "Sedimen & Granit", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Bangkir, Donggala", lat: -0.65, lon: 119.70, mineral: "Prospek U dalam Sedimen & Vulkanik", tipe: "U dominan", wilayah: "Sulawesi Tengah" },
    { nama: "Kuwali, Sigi", lat: -1.20, lon: 120.05, mineral: "Zona Radiometrik U–Th", tipe: "Th dan U", wilayah: "Sulawesi Tengah" },
    { nama: "Masamba, Luwu Utara", lat: -2.55, lon: 120.33, mineral: "Granit & Sedimen Mineralisasi", tipe: "Th dan U", wilayah: "Sulawesi Selatan" },
    { nama: "Bamu, Bantimala", lat: -5.15, lon: 119.80, mineral: "Granit/Pegmatit Kaya Thorium", tipe: "Th dominan", wilayah: "Sulawesi Selatan" },
    { nama: "Karimun, Kepulauan Riau", lat: -1.05, lon: 103.38, mineral: "Plaser Monazit Ikutan Timah", tipe: "Th dominan, U jejak", wilayah: "Kepulauan Riau" },
    { nama: "Kundur, Kepulauan Riau", lat: -0.80, lon: 103.43, mineral: "Monazit pada Sedimen Pantai/Tailing", tipe: "Th dominan, U jejak", wilayah: "Kepulauan Riau" },
    { nama: "Bangkinang, Riau", lat: -0.33, lon: 101.02, mineral: "Prospek U–Th Terkait Granit", tipe: "Th dan U", wilayah: "Riau" },
    { nama: "Rasiki, Manokwari, Papua Barat", lat: -0.85, lon: 134.05, mineral: "Prospek Uranium di Sedimen & Vulkanik", tipe: "U dominan", wilayah: "Papua Barat" },
    { nama: "Biak, Papua", lat: -1.05, lon: 136.05, mineral: "Potensi U–Th di Granit & Pantai", tipe: "Th dan U", wilayah: "Papua" },
    { nama: "Pulau Talibu, Kepulauan Sula", lat: -1.90, lon: 126.80, mineral: "Prospek Th/U dalam Granit", tipe: "Th dan U", wilayah: "Maluku Utara" },
    { nama: "Pantai Tanjung Labu, Bangka Selatan", lat: -3.10, lon: 106.18, mineral: "Pasir Berat Pantai (Monazit)", tipe: "Th dominan, U jejak", wilayah: "Bangka Selatan" },
    { nama: "Pantai Rajik, Bangka Selatan", lat: -2.95, lon: 106.15, mineral: "Plaser Monazit & Zirkon", tipe: "Th dominan", wilayah: "Bangka Selatan" },
    { nama: "Tailing Timah Air Gegas", lat: -2.87, lon: 106.00, mineral: "Tailing Timah Kaya Monazit", tipe: "Th dominan, U jejak", wilayah: "Bangka Selatan" },
    { nama: "Tailing Timah Sungailiat", lat: -1.92, lon: 106.12, mineral: "Tailing Granit Timah (Monazit)", tipe: "Th dominan", wilayah: "Bangka" },
    { nama: "Pantai Rebo, Bangka", lat: -2.02, lon: 106.18, mineral: "Pasir Berat Pantai", tipe: "Th dominan", wilayah: "Bangka" },
    { nama: "Pantai Batu Beriga, Bangka Tengah", lat: -2.45, lon: 106.18, mineral: "Plaser Monazit", tipe: "Th dominan", wilayah: "Bangka Tengah" },
    { nama: "Tailing Timah Koba", lat: -2.52, lon: 106.40, mineral: "Tailing Timah (Monazit, Ilmenit)", tipe: "Th dominan, U jejak", wilayah: "Bangka Tengah" },
    { nama: "Pantai Tanjung Pesona, Bangka", lat: -1.82, lon: 106.15, mineral: "Sedimen Pantai Mineral Berat", tipe: "Th dominan", wilayah: "Bangka" },
    { nama: "Pantai Burong Mandi, Belitung", lat: -2.60, lon: 107.75, mineral: "Plaser Monazit & Zirkon", tipe: "Th dominan", wilayah: "Belitung" },
    { nama: "Tailing Timah Manggar", lat: -2.87, lon: 108.28, mineral: "Tailing Timah Kaya Monazit", tipe: "Th dominan, U jejak", wilayah: "Belitung Timur" },
    { nama: "Zona Granit Ranggam, Bangka", lat: -2.15, lon: 106.05, mineral: "Granit Radioaktif Moderat", tipe: "Th dan U", wilayah: "Bangka" },
    { nama: "Zona Granit Pemali, Bangka", lat: -1.75, lon: 105.95, mineral: "Granit & Aluvial Kaya Monazit", tipe: "Th dan U", wilayah: "Bangka" },
    { nama: "Pantai Serdang, Belitung", lat: -3.00, lon: 107.90, mineral: "Plaser Monazit", tipe: "Th dominan", wilayah: "Belitung" },
    { nama: "Pantai Nyelanding, Bangka Selatan", lat: -3.25, lon: 106.00, mineral: "Pasir Berat Pantai", tipe: "Th dominan", wilayah: "Bangka Selatan" },
    { nama: "Pantai Batu Perahu, Bangka Selatan", lat: -3.13, lon: 106.08, mineral: "Plaser Monazit", tipe: "Th dominan", wilayah: "Bangka Selatan" },
    { nama: "Sektor Selatan Kalan (Batubulan)", lat: -0.45, lon: 112.10, mineral: "Lensa Bijih Uranium di Kuarsit", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Sektor Timur Kalan", lat: -0.38, lon: 112.15, mineral: "Anomali Uranium Radiometrik", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Sektor Barat Kalan", lat: -0.42, lon: 111.95, mineral: "Anomali U–Th di Granit", tipe: "Th dan U", wilayah: "Kalimantan Barat" },
    { nama: "Sektor Tanah Merah Barat", lat: -0.32, lon: 111.98, mineral: "Urat Uranium Terputus-putus", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Menukung Bagian Barat", lat: -0.60, lon: 112.30, mineral: "Batulempung Karbonan", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Menukung Bagian Timur", lat: -0.50, lon: 112.50, mineral: "Batubara & Lempung", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Sektor Utara Kalan", lat: -0.45, lon: 110.45, mineral: "Urat Uranium dalam Batuan Metamorf", tipe: "U dominan", wilayah: "Kalimantan Barat" },
    { nama: "Sektor Selatan Kalan", lat: -0.55, lon: 110.55, mineral: "Urat Uranium dengan Thorium Minor", tipe: "Th dan U", wilayah: "Kalimantan Barat" },
    { nama: "Ketapang Pesisir Barat", lat: -1.90, lon: 109.80, mineral: "Plaser Monazit Pantai", tipe: "Th dominan", wilayah: "Kalimantan Barat" },
    { nama: "Ketapang Pesisir Timur", lat: -1.95, lon: 110.05, mineral: "Plaser Monazit & Ilmenit", tipe: "Th dominan", wilayah: "Kalimantan Barat" },
    { nama: "Mamuju – Desa Radiasi Tinggi 1", lat: -2.65, lon: 118.95, mineral: "Tanah & Batuan Radiasi Latar Tinggi", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Mamuju – Desa Radiasi Tinggi 2", lat: -2.75, lon: 118.80, mineral: "Tanah & Batuan Radiasi Latar Tinggi", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Mamuju – Lereng Perbukitan", lat: -2.85, lon: 118.90, mineral: "Batuan Radioaktif", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Pasangkayu – Muara Sungai", lat: -1.35, lon: 119.45, mineral: "Plaser U–Th di Sedimen Sungai", tipe: "Th dan U", wilayah: "Sulawesi Barat" },
    { nama: "Donggala – Pesisir", lat: -0.60, lon: 119.80, mineral: "Sedimen Pantai (Anomali U–Th)", tipe: "Th dan U", wilayah: "Sulawesi Tengah" },
    { nama: "Luwu Utara – Aluvial Sungai", lat: -2.50, lon: 120.20, mineral: "Aluvial Mineral Berat", tipe: "Th dominan", wilayah: "Sulawesi Selatan" },
    { nama: "Bamu – Pinggiran Granit", lat: -5.25, lon: 119.90, mineral: "Granit Thorium Rendah", tipe: "Th dominan", wilayah: "Sulawesi Selatan" },
    { nama: "Karimun – Pantai Selatan", lat: -1.10, lon: 103.30, mineral: "Sedimen Pantai Mineral Berat", tipe: "Th dominan", wilayah: "Kepulauan Riau" },
    { nama: "Kundur – Pantai Timur", lat: -0.75, lon: 103.50, mineral: "Plaser Monazit", tipe: "Th dominan", wilayah: "Kepulauan Riau" },
    { nama: "Bangkinang – Aluvial Sungai", lat: -0.30, lon: 101.05, mineral: "Aluvial U–Th", tipe: "Th dan U", wilayah: "Riau" },
    { nama: "Rasiki – Aluvial Sungai", lat: -0.88, lon: 134.00, mineral: "Aluvial dengan Anomali Uranium", tipe: "U dominan", wilayah: "Papua Barat" },
    { nama: "Biak – Aluvial Pedalaman", lat: -1.00, lon: 135.95, mineral: "Aluvial U–Th Rendah", tipe: "Th dan U", wilayah: "Papua" },
    { nama: "Talibu – Aluvial Pesisir", lat: -1.92, lon: 126.78, mineral: "Aluvial Ber-Thorium", tipe: "Th dominan", wilayah: "Maluku Utara" },
    { nama: "Singkep – Aluvial Pedalaman", lat: -0.70, lon: 104.45, mineral: "Aluvial Monazit (Tailing Timah)", tipe: "Th dominan, U jejak", wilayah: "Kepulauan Riau" }
];

/* =========================================
   3. FUNGSI PENDUKUNG PETA
   ========================================= */
function warnaMarker(tipe) {
    if (tipe.includes("U dominan")) return "#ff2e2e";
    if (tipe.includes("Th dominan")) return "#ffc107";
    return "#9c27b0";
}

function popupKonten(d) {
    return `
        <div style="font-size:14px; line-height:1.5;">
            <strong style="color:var(--primary); font-size:16px;">${d.nama}</strong>
            <hr style="margin:5px 0; border:0; border-top:1px solid #ddd;">
            <b>Wilayah:</b> ${d.wilayah}<br>
            <b>Mineral:</b> ${d.mineral}<br>
            <b>Tipe:</b> <span style="color:${warnaMarker(d.tipe)}; font-weight:bold;">${d.tipe}</span>
        </div>
    `;
}

function buatMarker(d) {
    const warna = warnaMarker(d.tipe);
    const icon = L.divIcon({
        className: "custom-pin",
        html: `<div class="pin" style="background:${warna}"><div class="pin-dot"></div></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -38]
    });
    return L.marker([d.lat, d.lon], { icon });
}

function initMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    if (!map) {
        map = L.map('map', { zoomControl: false }).setView([-1.5, 117], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    } else {
        map.invalidateSize();
        if (allMarkers.length > 0) return;
    }

    const layerU = L.layerGroup().addTo(map);
    const layerTh = L.layerGroup().addTo(map);
    const layerUT = L.layerGroup().addTo(map);
    const wilayahLayer = {};

    allMarkers = [];

    lokasiRadioaktif.forEach((d) => {
        const marker = buatMarker(d).bindPopup(popupKonten(d));
        marker.options.dataSearch = d;
        allMarkers.push(marker);

        if (d.tipe.includes("U dominan")) layerU.addLayer(marker);
        else if (d.tipe.includes("Th dominan")) layerTh.addLayer(marker);
        else layerUT.addLayer(marker);

        if (!wilayahLayer[d.wilayah]) {
            wilayahLayer[d.wilayah] = L.layerGroup().addTo(map);
        }
        wilayahLayer[d.wilayah].addLayer(marker);
    });

    // Buat Checkbox Filter
    const container = document.getElementById('layer-list-container');
    if (container) {
        container.innerHTML = '';

        function addCheckbox(label, layerGroup, isChecked) {
            const div = document.createElement('div');
            div.className = 'layer-option';
            if (!isChecked) map.removeLayer(layerGroup);
            div.innerHTML = `<label style="cursor:pointer; width:100%; display:flex; align-items:center; font-size:14px;"><input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-right:10px; transform:scale(1.2); accent-color:var(--accent);"> ${label}</label>`;
            div.querySelector('input').addEventListener('change', function () {
                if (this.checked) map.addLayer(layerGroup); else map.removeLayer(layerGroup);
            });
            container.appendChild(div);
        }

        function addHeader(text) {
            const strong = document.createElement('strong');
            strong.style.display = 'block';
            strong.style.marginBottom = '5px';
            strong.style.marginTop = '10px';
            strong.style.color = '#333';
            strong.innerText = text;
            container.appendChild(strong);
        }

        function addSeparator() {
            const hr = document.createElement('hr');
            hr.style.margin = '10px 0';
            hr.style.border = '0';
            hr.style.borderTop = '1px solid #eee';
            container.appendChild(hr);
        }

        addHeader("Jenis Mineral");
        addCheckbox("🔴 Uranium Dominan", layerU, true);
        addCheckbox("🟡 Thorium Dominan", layerTh, true);
        addCheckbox("🟣 Campuran", layerUT, true);

        addSeparator();
        addHeader("Wilayah");
        Object.keys(wilayahLayer).sort().forEach(w => {
            addCheckbox("📍 " + w, wilayahLayer[w], true);
        });
    }
}

/* =========================================
   4. LOGIKA UI LAINNYA
   ========================================= */
function togglePanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
}

const searchInput = document.getElementById('search-input');
const resultsBox = document.getElementById('search-results');

if (searchInput) {
    searchInput.addEventListener('keyup', function () {
        const keyword = this.value.toLowerCase();
        resultsBox.innerHTML = '';
        if (keyword.length < 2) { resultsBox.style.display = 'none'; return; }

        const filtered = allMarkers.filter(m => {
            const data = m.options.dataSearch;
            return data.nama.toLowerCase().includes(keyword) || data.mineral.toLowerCase().includes(keyword) || data.wilayah.toLowerCase().includes(keyword);
        });

        if (filtered.length > 0) {
            resultsBox.style.display = 'block';
            filtered.forEach(marker => {
                const item = document.createElement('div');
                item.innerHTML = `
                    <strong>${marker.options.dataSearch.nama}</strong>
                    <small style="display:block; color:#666;">${marker.options.dataSearch.mineral}</small>
                `;
                item.onclick = function () {
                    map.flyTo(marker.getLatLng(), 10, { duration: 1.5 });
                    marker.openPopup();
                    searchInput.value = '';
                    resultsBox.style.display = 'none';
                };
                resultsBox.appendChild(item);
            });
        } else { resultsBox.style.display = 'none'; }
    });

    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
            resultsBox.style.display = 'none';
        }
    });
}

/* =========================================
   5. DATABASE KONTEN LENGKAP (ZAT RADIOAKTIF)
   ========================================= */
const dbMateri = [
    {
        judul: "Pengertian Radioaktivitas",
        gambar: "assets/pengertian-radioaktivitas.png",

        // --- DATA VIDEO DENGAN JUDUL ---
        youtubeData: [
            { id: '8wyWZb55vwQ', label: 'Video Prolog: Struktur Atom & Dasar' },
            { id: 'P9m9ndX7j4s', label: 'Video Inti: Apa Itu Zat Radioaktif?' }
        ],

        isi: `
            <p>Radioaktivitas adalah fenomena fisika inti di mana suatu inti atom yang tidak stabil secara spontan mengalami peluruhan menjadi inti lain yang lebih stabil dengan memancarkan partikel atau radiasi elektromagnetik. Peluruhan ini terjadi tanpa pengaruh kondisi eksternal seperti suhu, tekanan, maupun medan listrik dan medan magnet. Hal ini menunjukkan bahwa radioaktivitas merupakan proses yang berasal dari interaksi internal di dalam inti atom itu sendiri.</p>

            <p>Dalam kajian Fisika Modern, radioaktivitas dipahami sebagai konsekuensi dari ketidakseimbangan gaya-gaya di dalam inti atom, khususnya antara gaya nuklir kuat yang bersifat tarik-menarik dan gaya Coulomb antar proton yang bersifat tolak-menolak. Apabila keseimbangan ini tidak tercapai, inti akan cenderung meluruh untuk mencapai konfigurasi yang lebih stabil.</p>

            <p>Radioaktivitas pertama kali ditemukan oleh Henri Becquerel pada tahun 1896 ketika ia mengamati bahwa garam uranium dapat menghitamkan pelat fotografi meskipun tidak terkena cahaya. Penelitian ini kemudian dikembangkan lebih lanjut oleh Marie dan Pierre Curie, yang memperkenalkan istilah radioaktivitas dan menemukan unsur radioaktif baru seperti polonium dan radium.</p>
        `
    },

    {
        judul: "Struktur Inti Atom",
        gambar: "assets/struktur-inti-atom.jpg",
        youtubeId: 'cITSbDSq64U?si=xxy1Q-z296UQvtPU',
        isi: `
            <p>Inti atom merupakan bagian pusat atom yang mengandung hampir seluruh massa atom. Inti tersusun atas proton yang bermuatan positif dan neutron yang tidak bermuatan, yang secara kolektif disebut sebagai nukleon. Jumlah proton dalam inti menentukan identitas unsur dan dinyatakan dengan nomor atom (Z), sedangkan jumlah total proton dan neutron dinyatakan dengan nomor massa (A).</p>

            <p>Kestabilan inti atom sangat dipengaruhi oleh perbandingan jumlah neutron terhadap proton. Untuk inti ringan, kestabilan dicapai ketika jumlah neutron hampir sama dengan jumlah proton. Namun, untuk inti berat, diperlukan lebih banyak neutron untuk menyeimbangkan gaya tolak-menolak Coulomb antar proton.</p>

            <p>Dalam Fisika Modern dikenal beberapa klasifikasi inti atom, antara lain isotop (inti dengan nomor atom sama tetapi nomor massa berbeda), isobar (inti dengan nomor massa sama tetapi nomor atom berbeda), dan isoton (inti dengan jumlah neutron yang sama). Konsep-konsep ini penting dalam memahami pola kestabilan inti dan jalur peluruhan radioaktif.</p>
        `
    },

    {
        judul: "Jenis-Jenis Radiasi",
        gambar: "assets/jenis-jenis-radiasi.jpeg",
        youtubeId: 'YvqYm-kN72Q?si=GdkTE4g91XSLhxs2',
        isi: `
            <h3>Radiasi Alfa (α):</h3>
            <p> 
            Radiasi alfa berupa partikel bermuatan positif yang terdiri dari dua proton dan dua neutron, sehingga identik dengan inti atom helium. Karena massanya relatif besar dan bermuatan, partikel alfa memiliki daya ionisasi yang tinggi tetapi daya tembus yang rendah. Radiasi alfa dapat dihentikan oleh selembar kertas atau lapisan tipis kulit. Peluruhan alfa umumnya terjadi pada inti berat yang memiliki nomor atom besar, seperti uranium dan radium. Proses ini menyebabkan nomor atom inti berkurang dua satuan dan nomor massa berkurang empat satuan. 
            <a href="https://phet.colorado.edu/sims/html/alpha-decay/latest/alpha-decay_en.html" target="_blank" class="link-orange">Simulasi</a>
            </p>
            
            <h3>Radiasi Beta (β):</h3>
            <p>
            Radiasi beta muncul akibat perubahan partikel di dalam inti atom. Pada peluruhan beta negatif, sebuah neutron berubah menjadi proton dengan memancarkan elektron dan antineutrino. Sebaliknya, pada peluruhan beta positif, sebuah proton berubah menjadi neutron dengan memancarkan positron dan neutrino. Radiasi beta memiliki daya tembus yang lebih besar dibandingkan radiasi alfa, tetapi daya ionisasinya lebih kecil. Radiasi ini dapat dihentikan oleh lempengan aluminium tipis.
            <a href="https://phet.colorado.edu/sims/cheerpj/nuclear-physics/latest/nuclear-physics.html?simulation=nuclear-fission" target="_blank" class="link-orange">Simulasi</a>
            </p>
            
            <h3>Radiasi Gamma (γ):</h3>
            <p>
            Radiasi gamma merupakan radiasi elektromagnetik berenergi tinggi yang dipancarkan oleh inti atom setelah mengalami peluruhan alfa atau beta. Radiasi ini tidak memiliki massa dan muatan, sehingga daya tembusnya sangat besar. Untuk meredam radiasi gamma diperlukan bahan perisai seperti timbal atau beton tebal.
            <a href="https://phet.colorado.edu/sims/cheerpj/nuclear-physics/latest/nuclear-physics.html?simulation=beta-decay" target="_blank" class="link-orange">Simulasi</a>
            </p>
        `
    },

    {
        judul: "Hukum Peluruhan",
        gambar: "assets/hukum-peluruhan.jpeg",
        youtubeId: 'RFgfCDN-fm0?si=bsT18nICfh558ei_',
        isi: `
            <p>Peluruhan radioaktif mengikuti hukum statistik yang menyatakan bahwa peluang suatu inti untuk meluruh dalam selang waktu tertentu adalah konstan. Oleh karena itu, laju peluruhan sebanding dengan jumlah inti yang belum meluruh.</p>

            <p>Secara matematis, hukum peluruhan radioaktif dinyatakan dalam bentuk persamaan eksponensial. Persamaan ini menunjukkan bahwa jumlah inti radioaktif akan berkurang secara kontinu terhadap waktu. Karakteristik penting dari peluruhan radioaktif adalah sifatnya yang acak pada tingkat inti tunggal, tetapi teratur secara statistik untuk kumpulan inti dalam jumlah besar.</p>
        `
    },

    {
        judul: "Waktu Paruh",
        gambar: "assets/waktu-paruh.png",
        youtubeId: '',
        isi: `
            <p>Waktu paruh adalah waktu yang diperlukan agar jumlah inti radioaktif berkurang menjadi setengah dari jumlah awalnya. Setiap zat radioaktif memiliki waktu paruh yang khas dan tidak dipengaruhi oleh kondisi lingkungan.</p>

            <p>Konsep waktu paruh sangat penting dalam berbagai aplikasi radioaktivitas, seperti penentuan umur fosil dengan metode karbon-14, perhitungan dosis radiasi dalam kedokteran nuklir, serta pengelolaan limbah radioaktif.</p>
        `
    },

    {
        judul: "Aktivitas Zat Radioaktif",
        gambar: "assets/aktivitas-zat-radioaktif.png",
        youtubeId: '',
        isi: `
            <p>Reaksi inti adalah proses interaksi antara inti atom dengan partikel lain yang mengakibatkan perubahan struktur inti. Transmutasi inti merujuk pada perubahan suatu unsur menjadi unsur lain sebagai akibat dari reaksi inti atau peluruhan radioaktif.</p>

            <p>Konsep transmutasi inti membuktikan bahwa unsur kimia tidak bersifat mutlak, melainkan dapat berubah melalui proses inti. Prinsip ini menjadi dasar pengembangan teknologi nuklir modern.</p>
        `
    },

    {
        judul: "Energi Ikat Inti",
        gambar: "assets/energi-ikat-inti.webp",
        youtubeId: 'xpSDf0xZR2s?si=QoXiAo8u4oFpfSLV',
        isi: `
            <p>Energi ikat inti adalah energi yang diperlukan untuk memisahkan inti atom menjadi nukleon-nukleon penyusunnya. Energi ini berasal dari defek massa, yaitu selisih antara massa inti dan jumlah massa proton serta neutron bebas.</p>

            <p>Energi ikat per nukleon digunakan sebagai indikator kestabilan inti. Inti dengan energi ikat per nukleon besar cenderung lebih stabil. Konsep ini menjadi dasar pemahaman reaksi fisi dan fusi nuklir.</p>
        `
    },

    {
        judul: "Dampak Radiasi",
        gambar: "assets/dampak-radiasi.jpg",
        youtubeId: 'g4zRddbGhOY?si=tGXeZAEcHuCpnFe8',
        isi: `
            <p>Radiasi pengion dapat berinteraksi dengan jaringan biologis dan menyebabkan kerusakan sel. Efek radiasi dapat bersifat deterministik, seperti kerusakan jaringan pada dosis tinggi, atau stokastik, seperti peningkatan risiko kanker pada dosis rendah.</p>
            
            <p>Besarnya dampak biologis radiasi diukur menggunakan satuan sievert, yang memperhitungkan jenis radiasi dan sensitivitas jaringan tubuh.</p>
        `
    },
    
    {
        judul: "Sejarah Radioaktivitas",
        gambar: "assets/sejarah-radioaktivitas.jpg",
        youtubeId: '_4TC8CWQZRQ?si=qZ95YaD9Xg2IcZqU',
        isi: `
            <p>Pada akhir abad ke-19, dunia fisika masih memandang atom sebagai partikel terkecil yang stabil dan tidak dapat diubah. Pandangan ini mulai runtuh pada tahun 1896 ketika Henri Becquerel secara tidak sengaja menemukan bahwa garam uranium mampu memancarkan radiasi yang dapat menghitamkan pelat fotografi tanpa bantuan cahaya. Penemuan ini mengejutkan komunitas ilmiah karena menunjukkan bahwa atom dapat memancarkan energi secara spontan, menandai awal lahirnya konsep radioaktivitas dan membuka jalan bagi berkembangnya Fisika Modern.</p>

            <p>Penelitian Becquerel kemudian dilanjutkan oleh Marie dan Pierre Curie, yang dengan ketekunan luar biasa berhasil menunjukkan bahwa radioaktivitas merupakan sifat intrinsik atom, bukan hasil reaksi kimia. Mereka menemukan unsur baru, polonium dan radium, serta memperkenalkan istilah radioaktivitas ke dalam dunia sains. Melalui karya mereka, pemahaman tentang atom berubah secara mendasar: atom bukanlah sistem pasif, melainkan struktur dinamis yang menyimpan energi yang sangat besar di dalam intinya.</p>

            <p>Pemahaman tentang radioaktivitas semakin berkembang ketika Ernest Rutherford melalui eksperimen hamburan partikel alfa membuktikan bahwa atom memiliki inti yang sangat kecil, padat, dan bermuatan positif. Penemuan ini memperjelas bahwa sumber radioaktivitas berasal dari inti atom. Rutherford bahkan berhasil melakukan transmutasi buatan pertama, mengubah satu unsur menjadi unsur lain, sesuatu yang sebelumnya hanya menjadi impian para alkemis. Sejak saat itu, inti atom menjadi pusat perhatian utama dalam kajian Fisika Modern.</p>

            <p>Memasuki dekade 1930-an, radioaktivitas membawa para ilmuwan pada pemahaman yang lebih dalam tentang energi inti. Penemuan neutron oleh James Chadwick dan berkembangnya teori energi ikat intinya menunjukkan bahwa sebagian massa kecil dapat berubah menjadi energi yang sangat besar, sebagaimana dinyatakan dalam persamaan terkenal Einstein,E=MC2E = mc^2E=m c2. Puncak dari perkembangan ini terjadi pada tahun 1938 ketika fisi nuklir ditemukan, yaitu peristiwa terbelahnya inti berat menjadi inti-inti yang lebih ringan disertai pelepasan energi luar biasa.</p>

            <p>Di tengah situasi dunia yang dilanda Perang Dunia II, pengetahuan tentang radioaktivitas dan fisi nuklir diarahkan ke tujuan militer. J. Robert Oppenheimer, seorang fisikawan teoritis cerdas, ditunjuk sebagai pembaca ilmiah Proyek Manhattan. Di bawah kepemimpinannya, para ilmuwan terbaik dunia bekerja sama mengembangkan bom atom berdasarkan reaksi fisi. Radioaktivitas, yang sebelumnya dipelajari sebagai fenomena alam, kini menjelma menjadi senjata dengan daya hancur yang belum pernah disaksikan sebelumnya dalam sejarah manusia.</p>

            <p>Setelah uji coba bom atom pertama berhasil dilakukan, Oppenheimer mengungkapkan kegelisahan batinnya dengan mengutip Bhagavad Gita, “Sekarang aku menjadi Kematian, penghancur dunia.” Kutipan ini mencerminkan konflik moral yang mendalam antara pencapaian ilmiah dan konsekuensi kemanusiaan. Peristiwa Hiroshima dan Nagasaki menjadi pengingat bahwa radioaktivitas tidak hanya membawa kemajuan teknologi, tetapi juga tanggung jawab etis yang besar bagi para ilmuwan.</p>

            <p>Pasca perang, radioaktivitas tidak lagi semata-mata dikaitkan dengan kehancuran. Ilmu yang sama kemudian dimanfaatkan untuk tujuan damai, seperti dalam bidang kedokteran untuk terapi kanker, dalam energi melalui pembangkit listrik tenaga nuklir, serta dalam ilmu kebumian untuk menentukan usia fosil dan batuan. Dengan demikian, radioaktivitas menjadi contoh nyata bagaimana sebuah penemuan ilmiah dapat mengubah peradaban manusia, baik sebagai sumber kemajuan maupun sebagai peringatan akan pentingnya kebijaksanaan dalam penggunaan ilmu pengetahuan.</p>
        `
    }
];

const dbPemanfaatan = [
    { 
        judul: "Bidang Kedokteran", 
        gambar: "assets/bidang-kedokteran.jpeg", 
        youtubeId: '4T_tjIozYd0?si=5qc3gYOd80M9Ymbi', 
        isi: `
        <h3>• Diagnosis dan pengobatan:</h3>
        <p>Radioaktif memainkan peran vital dalam dunia media, radioaktif berperan penting dalam mendiagnosis dan mengobati berbagai penyakit terutama kanker. Sinar-X, MRI, dan PET Scan menggunakan radioisotop untuk menghasilkan gambar organ tubuh secara detail yang akan membantu dokter mendeteksi penyakit dengan lebih akurat. Misalnya, Technetium-99m membantu mendeteksi penyumbatan pembuluh darah jantung dengan akurat dan kelainan tiroid (Iodin-131).</p>

        <h3>• Terapi kanker:</h3>
        <p>Saat ini dengan teknologi terbarukan sinar Radiasi digunakan untuk membunuh sel-sel kanker dan mengecilkan tumor, menjadi terapi utama bagi banyak pasien kanker. Misalnya, Kobalt-60 mengobati kanker dengan membunuh sel tumor.</p>

        <h3>• Sterilisasi:</h3>
        <p>Alat-alat medis, makanan, dan obat-obatan disterilkan dengan radiasi untuk memastikan keamanan dan kebersihannya. Hal tersebut akan sangat membantu para pekerja medis agar dapat bekerja lebih efektif.</p>

        <h3>• Pencitraan medis:</h3>
        <p>Teknik seperti PET scan dan SPECT scan banyak menggunakan radioaktif untuk menghasilkan gambar organ tubuh secara detail. Teknik ini banyak digunakan dalam dunia kesehatan untuk membantu pekerja medis dalam menangani pasien.</p>
        ` 
    },

    { 
        judul: "Bidang Industri",
        gambar: "assets/bidang-industri.jpeg", 
        youtubeId: '', 
        isi: `
        <h3>• Pelacakan dan pengukuran:</h3>
        <p>Radioaktif juga dapat digunakan dalam industri. Radioaktif dimanfaatkan untuk melacak aliran bahan, mengukur ketebalan dan kepadatan, serta mendeteksi cacat pada produk. Contohnya, radiografi industri dengan Iridium-192 memastikan keamanan pipa dan las di pembangkit listrik nuklir.</p>

        <h3>• Sterilisasi:</h3>
        <p>Radiasi digunakan untuk mensterilkan produk industri seperti plastik, karet, dan kemasan makanan.</p>

        <h3>• Preservasi makanan:</h3>
        <p>Radiasi digunakan untuk memperpanjang umur simpan makanan dengan membunuh bakteri dan mikroorganisme penyebab kerusakan.</p>

        <h3>• Keamanan:</h3>
        <p>Pendeteksi Asap, beberapa detektor asap menggunakan elemen radioaktif sebagai bagian dari mekanisme pendeteksiannya, biasanya Americium-241, yang menggunakan radiasi pengion dan partikel alfa untuk menyebabkan dan kemudian mengukur perubahan ionisasi udara segera di sekitar detektor. Perubahan akibat asap di udara akan menyebabkan alarm berbunyi.</p>
        ` 
    },

    { 
        judul: "Bidang Penelitian", 
        gambar: "assets/bidang-penelitian.avif", 
        youtubeId: '', 
        isi: `
        <h3>• Penelitian ilmiah:</h3>
        <p>Radioisotop digunakan dalam berbagai penelitian ilmiah untuk mempelajari proses biologis, kimia, dan fisik.</p>

        <h3>• Arkeologi:</h3>
        <p>Selain pada bidang industri kesehatan, radioaktif berperan dalam penelitian terkait artefak zaman dahulu. Hal tersebut dinilai sangat dibutuhkan saat ini. Radioaktif digunakan untuk menentukan usia artefak dan mempelajari peradaban pada masa lampau. Misalnya, penanggalan karbon-14 untuk menentukan usia artefak.</p>

        <h3>• Hidrologi:</h3>
        <p>Radioaktif digunakan untuk melacak aliran air bawah tanah dan mempelajari siklus air. Misalnya, Tritium (Hidrogen-3) membantu melacak pergerakan air tanah dan memahami pencemaran lingkungan.</p>
        ` 
    },

    { 
        judul: "Bidang Pertanian", 
        gambar: "assets/bidang-pertanian.jpeg", 
        youtubeId: 'LXgfeqMSGEw?si=be1Ksv4pUlGsATyi', 
        isi: `
        <h3>• Penelitian dan pengembangan:</h3>
        <p>Radioaktif digunakan dalam penelitian untuk mengembangkan tanaman yang lebih tahan hama, penyakit, dan kekeringan.</p>

        <h3>• Sterilisasi benih:</h3>
        <p>Benih tanaman disterilkan dengan radiasi untuk mencegah penyebaran hama dan penyakit.</p>

        <h3>• Pelacakan nutrisi:</h3>
        <p>Radioaktif digunakan untuk mempelajari bagaimana tanaman menyerap dan menggunakan nutrisi.</p>
        ` 
    },

    { 
        judul: "Bidang Produksi Energi",
        gambar: "assets/bidang-produksi-energi.jpeg",
        youtubeId: 'MrzL0jWoPwc?si=hvqzu7UQ0gt07tTK', 
        isi: `
        <h3>• Pembangkit Tenaga Listrik Nuklir (PLTN):</h3>
        <p>Radioaktif digunakan untuk menghasilkan energi listrik melalui fisi nuklir.</p>

        <p>Radioisotop juga digunakan sebagai bahan bakar utama dalam misi perjalanan keluar angkasa yang dilakukan NASA selama 50 tahun ke belakang. Jenis radioisotop yang digunakan untuk pesawat luar angkasa dan roket adalah plutonium-238. Dilansir dari NASA Radioisotope Power Systems, plutonium-238 digunakan karena stabil pada suhu tinggi, memiliki waktu paruh yang cukup lama yaitu 88 tahun, memiliki kepadatan yang tinggi, dan juga dapat menghasilkan panas dalam jumlah besar.</p>
        ` 
    }
];

const dbK3 = [
    { 
        judul: "K3 Radiasi", 
        gambar: "assets/k3-radiasi.jpg", 
        youtubeId: '', 
        isi: `
        <p>Keselamatan dan Kesehatan Kerja (K3) radiasi tidak hanya ditujukan bagi pekerja di laboratorium atau fasilitas nuklir, tetapi juga sangat penting untuk melindungi masyarakat yang tinggal di sekitar area radiasi. Radiasi tidak dapat dilihat, dicium, maupun dirasakan secara langsung, namun paparan dalam jangka waktu lama atau dosis tinggi dapat membahayakan kesehatan manusia dan lingkungan.</p>
        ` 
    },

    { 
        judul: "Risiko Radiasi bagi Warga Sekitar",
        gambar: "assets/risiko-radiasi-bagi-warga-sekitar.webp", 
        youtubeId: '', 
        isi: `
        <p>Warga yang tinggal di dekat area penggunaan zat radioaktif berisiko terpapar radiasi, terutama jika terjadi kebocoran, kecelakaan, atau pengelolaan limbah yang tidak sesuai standar. Paparan ini dapat berlangsung secara perlahan tanpa disadari, sehingga pengawasan dan pencegahan menjadi hal yang sangat penting.</p>
        ` 
    },

    { 
        judul: "Dampak Radiasi terhadap Kesehatan dan Lingkungan",
        gambar: "assets/dampak-radiasi-terhadap-kesehatan-dan-lingkungan.jpg", 
        youtubeId: '', 
        isi: `
        <p>Radiasi dapat menyebabkan berbagai gangguan kesehatan, mulai dari efek ringan hingga penyakit serius seperti kanker. Selain berdampak pada manusia, radiasi juga mencemari lingkungan.</p>
        ` 
    }
];

const dbAlat = [
    { 
        judul: "Prinsip Deteksi Radiasi", 
        gambar: "assets/prinsip-deteksi-radiasi.jpg", 
        youtubeId: 'GlcUH5gyfwo?si=eDhojAQbEeEEur9z', 
        isi: `
        <p>Radioaktivitas merupakan peristiwa peluruhan inti atom tidak stabil yang disertai dengan pemancaran radiasi berupa partikel alfa (α), beta (β), dan radiasi elektromagnetik gamma (γ). Radiasi ini memiliki energi tinggi sehingga mampu mengionisasi materi yang dilaluinya.</p>

        <p>Karena radiasi tidak dapat dilihat, dicium, atau dirasakan secara langsung, keberadaannya hanya dapat diketahui melalui perubahan fisik atau listrik yang ditimbulkannya pada suatu medium. Prinsip inilah yang digunakan dalam berbagai alat pendeteksi radioaktif.</p>
        ` 
    },

    { 
        judul: "Detektor Geiger Müller", 
        gambar: "assets/detektor-geiger-muller.webp", 
        youtubeId: 'Pumms4I8aqA?si=3yn_uZ56XLeYogo-', 
        isi: `
        <p>Detektor Geiger–Müller bekerja berdasarkan prinsip ionisasi gas di dalam tabung. Ketika radiasi radioaktif memasuki tabung, atom gas akan terionisasi dan menghasilkan elektron bebas. Elektron-elektron ini dipercepat oleh medan listrik sehingga menimbulkan pulsa listrik.</p>

        <p>Pulsa tersebut dihitung sebagai laju cacahan (counts per second). Detektor ini mampu mendeteksi radiasi alfa, beta, dan gamma, sehingga banyak digunakan dalam pemantauan radiasi lingkungan, praktikum fisika modern, serta kegiatan keselamatan radiasi.</p>
        ` 
    },

    { 
        judul: "Dosimeter Radiasi", 
        gambar: "assets/dosimeter-radiasi.jpg", 
        youtubeId: '', 
        isi: `
        <p>Dosimeter digunakan untuk mengukur dosis radiasi yang diterima oleh seseorang dalam jangka waktu tertentu. Alat ini sangat penting bagi pekerja di bidang medis, industri nuklir, dan penelitian.</p>

        <p>Jenis dosimeter yang umum digunakan meliputi dosimeter film, dosimeter thermoluminescent (TLD), dan dosimeter digital. Dosimeter membantu memastikan bahwa paparan radiasi tetap berada dalam batas aman.</p>
        ` 
    },

    { 
        judul: "Detektor Sintilasi", 
        gambar: "assets/detektor-sintilasi.jpg", 
        youtubeId: 'v20Q3DTbUU0?si=woJ-3-PPN3BA51sq', 
        isi: `
        <p>Detektor sintilasi memanfaatkan bahan sintilator yang akan memancarkan cahaya ketika terkena radiasi pengion. Cahaya ini kemudian diubah menjadi sinyal listrik menggunakan photomultiplier.</p>

        <p>Keunggulan detektor ini adalah kemampuannya mengukur energi radiasi, sehingga banyak digunakan dalam spektroskopi nuklir, penelitian fisika inti, serta aplikasi medis seperti pencitraan nuklir.</p>
        ` 
    },

    { 
        judul: "Cloud Chamber (Kamar Kabut)", 
        gambar: "assets/cloud-chamber-(kamar-kabut).jpg", 
        youtubeId: 'xky3f1aSkB8?si=vnxuhkuQ-XcCY7N-', 
        isi: `
        <p>Cloud chamber digunakan untuk memvisualisasikan lintasan partikel radioaktif secara langsung. Alat ini memanfaatkan uap alkohol atau udara lewat jenuh yang akan membentuk jejak kabut ketika dilewati partikel bermuatan.</p>

        <p>Metode ini memberikan gambaran kualitatif tentang jenis dan arah radiasi, sehingga sering digunakan dalam pembelajaran fisika modern untuk menunjukkan fenomena radioaktivitas secara nyata.</p>
        ` 
    }    
];

/* =========================================
   6. SISTEM RENDER LOGIKA (Unified)
   ========================================= */
function renderGrid(containerId, data, category) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.onclick = () => bukaDetail(category, index);

        // Placeholder jika gambar error/kosong
        const imgUrl = item.gambar ? item.gambar : 'https://via.placeholder.com/400x200?text=No+Image';

        card.innerHTML = `
            <div style="cursor:pointer;">
                <img src="${imgUrl}" alt="${item.judul}">
                <h3>${item.judul}</h3>
                <p style="color:var(--accent); font-weight:600; font-size:0.9rem;">Baca Selengkapnya →</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// INI FUNGSI PENTING YANG SUDAH DIUPDATE
function bukaDetail(category, index) {
    let data;
    if(category === 'materi') data = dbMateri;
    else if(category === 'pemanfaatan') data = dbPemanfaatan;
    else if(category === 'k3') data = dbK3;
    else if(category === 'alat') data = dbAlat;

    const item = data[index];
    
    document.getElementById(`judul-${category}`).innerText = item.judul;
    document.getElementById(`img-${category}`).src = item.gambar ? item.gambar : '';
    document.getElementById(`teks-${category}`).innerHTML = item.isi;

    // --- LOGIKA VIDEO PINTAR (DENGAN JUDUL DI ATASNYA) ---
    const vidContainer = document.getElementById(`video-${category}`);
    if(vidContainer) {
        // Reset Container
        vidContainer.innerHTML = ''; 
        vidContainer.classList.remove('video-wrapper'); // Hapus class wrapper bawaan parent
        vidContainer.classList.add('hidden'); 

        // Normalisasi Data Video (Agar semua jadi format Object)
        let videoList = [];

        // Cek Format Baru (youtubeData: [{id, label}])
        if (item.youtubeData && Array.isArray(item.youtubeData)) {
            videoList = item.youtubeData;
        }
        // Cek Format Array String Lama (youtubeIds: ['id1', 'id2']) -> convert ke object
        else if (item.youtubeIds && Array.isArray(item.youtubeIds)) {
            videoList = item.youtubeIds.map(id => ({ id: id, label: '' }));
        }
        // Cek Format Single String Lama (youtubeId: 'id1') -> convert ke object
        else if (item.youtubeId) {
            videoList = [{ id: item.youtubeId, label: '' }];
        }

        // Render Semua Video
        if (videoList.length > 0) {
            vidContainer.classList.remove('hidden'); 
            
            videoList.forEach(video => {
                // Buat Container per Video
                const itemWrapper = document.createElement('div');
                itemWrapper.style.marginBottom = '25px';

                // 1. Buat Label Judul (Jika ada)
                if (video.label) {
                    const label = document.createElement('h4');
                    label.innerText = video.label;
                    label.style.color = 'var(--accent)';
                    label.style.marginBottom = '8px';
                    label.style.borderLeft = '4px solid var(--accent)';
                    label.style.paddingLeft = '10px';
                    itemWrapper.appendChild(label);
                }

                // 2. Buat Iframe Video
                const vidWrapper = document.createElement('div');
                vidWrapper.className = 'video-wrapper'; // Class CSS untuk rasio 16:9
                vidWrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>`;
                
                itemWrapper.appendChild(vidWrapper);
                vidContainer.appendChild(itemWrapper);
            });
        }
    }

    document.getElementById(`list-${category}`).classList.add('hidden');
    document.getElementById(`detail-${category}`).classList.remove('hidden');
    window.scrollTo(0,0);
}

function tutupDetail(category) {
    document.getElementById(`detail-${category}`).classList.add('hidden');
    document.getElementById(`list-${category}`).classList.remove('hidden');

    const iframe = document.getElementById(`iframe-${category}`);
    if (iframe) iframe.src = '';
}

// Render saat load
document.addEventListener('DOMContentLoaded', function () {
    renderGrid('grid-materi', dbMateri, 'materi');
    renderGrid('grid-pemanfaatan', dbPemanfaatan, 'pemanfaatan');
    renderGrid('grid-k3', dbK3, 'k3');
    renderGrid('grid-alat', dbAlat, 'alat');
});

/* =========================================
   6. GAME LOGIC (DUAL GAME SYSTEM)
   ========================================= */

// --- NAVIGASI MENU GAME ---
function openGame(type) {
    document.getElementById('game-menu-main').classList.add('hidden');
    if (type === 'kurir') {
        document.getElementById('game-app-kurir').classList.remove('hidden');
    } else if (type === 'scramble') {
        document.getElementById('game-app-scramble').classList.remove('hidden');
    }
}

function backToMenu() {
    // Sembunyikan semua game
    document.getElementById('game-app-kurir').classList.add('hidden');
    document.getElementById('game-app-scramble').classList.add('hidden');
    
    // Tampilkan menu utama
    document.getElementById('game-menu-main').classList.remove('hidden');
    
    // Reset state jika perlu (Stop timer dll)
    clearInterval(scrTimerInterval); 
}

// ==========================================
// GAME 1: MISI KURIR ISOTOP
// ==========================================
const kurirData = [
    { scenario: "RS butuh terapi kanker.", target: "Kobalt-60", opts: ["Karbon-14", "Kobalt-60", "Uranium-235"], rad: "GAMMA (γ)", shield: "Timbal", sOpts: ["Kertas", "Timbal", "Aluminium"] },
    { scenario: "Arkeolog cek umur fosil.", target: "Karbon-14", opts: ["Karbon-14", "Iodium-131", "Natrium-24"], rad: "BETA (β)", shield: "Aluminium", sOpts: ["Kertas", "Aluminium", "Timbal"] },
    { scenario: "Pabrik sensor asap.", target: "Amerisium-241", opts: ["Kobalt-60", "Amerisium-241", "Teknesium-99"], rad: "ALPHA (α)", shield: "Kertas", sOpts: ["Kertas", "Aluminium", "Timbal"] },
    { scenario: "Cek kebocoran pipa.", target: "Natrium-24", opts: ["Uranium-238", "Natrium-24", "Karbon-14"], rad: "GAMMA (γ)", shield: "Timbal", sOpts: ["Kertas", "Plastik", "Timbal"] },
    { scenario: "Cek tiroid pasien.", target: "Iodium-131", opts: ["Iodium-131", "Amerisium-241", "Uranium-235"], rad: "BETA & GAMMA", shield: "Timbal", sOpts: ["Kertas", "Kain", "Timbal"] }
];

let kLevel = 0, kScore = 0, kLives = 3, kCurrent = null;

function startKurirGame() {
    kLevel = 0; kScore = 0; kLives = 3;
    updateKurirUI();
    document.getElementById('start-screen-kurir').classList.add('hidden');
    document.getElementById('end-screen-kurir').classList.add('hidden');
    document.getElementById('game-screen-kurir').classList.remove('hidden');
    loadKurirLevel();
}

function updateKurirUI() {
    document.getElementById('score-kurir').innerText = `Skor: ${kScore}`;
    document.getElementById('lives-kurir').innerText = `Nyawa: ${kLives} ❤️`;
}

function loadKurirLevel() {
    if (kLevel >= kurirData.length) { finishKurir(true); return; }
    if (kLives <= 0) { finishKurir(false); return; }
    kCurrent = kurirData[kLevel];
    renderKurirPhase1();
}

function renderKurirPhase1() {
    const area = document.getElementById('phase-area-kurir');
    area.innerHTML = `
        <h2>Misi ${kLevel + 1}: Identifikasi Zat</h2>
        <div class="question-box">
            <strong>KLIEN:</strong> "${kCurrent.scenario}"<br>
            <em>Isotop mana yang dikirim?</em>
        </div>
        <div class="options-grid" id="k-opts"></div>
    `;
    kCurrent.opts.sort(() => Math.random() - 0.5).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkKurir1(btn, opt);
        document.getElementById('k-opts').appendChild(btn);
    });
}

function checkKurir1(btn, ans) {
    const all = document.querySelectorAll('.option-btn');
    all.forEach(b => b.disabled = true);
    if (ans === kCurrent.target) {
        btn.classList.add('correct');
        setTimeout(renderKurirPhase2, 800);
    } else {
        btn.classList.add('wrong');
        kLives--;
        updateKurirUI();
        setTimeout(() => { if (kLives > 0) { all.forEach(b => { b.disabled = false; b.classList.remove('wrong'); }); } else { finishKurir(false); } }, 800);
    }
}

function renderKurirPhase2() {
    const area = document.getElementById('phase-area-kurir');
    area.innerHTML = `
        <h2>⚠️ BAHAYA RADIASI ⚠️</h2>
        <div class="question-box" style="border-color:red;">
            Zat: <strong>${kCurrent.target}</strong><br>
            Radiasi: <strong style="color:gold;">${kCurrent.rad}</strong><br>
            <em>Pilih wadah pengaman:</em>
        </div>
        <div class="options-grid" id="k-shields"></div>
    `;
    kCurrent.sOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `🛡️ ${opt}`;
        btn.onclick = () => checkKurir2(btn, opt);
        document.getElementById('k-shields').appendChild(btn);
    });
}

function checkKurir2(btn, ans) {
    if (ans === kCurrent.shield) {
        btn.classList.add('correct');
        kScore += 100;
        kLevel++;
        updateKurirUI();
        setTimeout(loadKurirLevel, 1000);
    } else {
        btn.classList.add('wrong');
        kLives--;
        updateKurirUI();
        if (kLives <= 0) setTimeout(() => finishKurir(false), 800);
        else setTimeout(() => { btn.classList.remove('wrong'); }, 500);
    }
}

function finishKurir(win) {
    document.getElementById('game-screen-kurir').classList.add('hidden');
    document.getElementById('end-screen-kurir').classList.remove('hidden');
    const title = document.getElementById('final-status-kurir');
    title.innerText = win ? "Misi Sukses! 🎉" : "Misi Gagal! ☠️";
    title.style.color = win ? "#00ff41" : "red";
    document.getElementById('final-score-kurir').innerText = `Skor Akhir: ${kScore}`;
}


// ==========================================
// GAME 2: RADIOAKTIF SCRAMBLE
// ==========================================
const scrambleData = [
    { kata: "RADIOAKTIF", hint: "☢ pancarkan energi" },
    { kata: "URANIUM", hint: "⚛ reaktor nuklir" },
    { kata: "PLUTONIUM", hint: "💣 bom atom" },
    { kata: "REAKTOR", hint: "🔥 listrik nuklir" },
    { kata: "GEIGER", hint: "📡 deteksi radiasi" },
    { kata: "ISOTOP", hint: "🧬 varian atom" },
    { kata: "FISI", hint: "💥 pecah inti" },
    { kata: "FUSI", hint: "☀ gabung inti" },
    { kata: "ALFA", hint: "α helium" },
    { kata: "BETA", hint: "β elektron" },
    { kata: "GAMMA", hint: "γ sinar" }
];

let scrScore = 0, scrLives = 3, scrTimer = 20, scrTimerInterval, currentWordObj = null;
let availableScramble = [];

function startScrambleGame() {
    scrScore = 0; scrLives = 3;
    availableScramble = [...scrambleData]; // Copy soal
    updateScrambleUI();
    document.getElementById('start-screen-scramble').classList.add('hidden');
    document.getElementById('end-screen-scramble').classList.add('hidden');
    document.getElementById('game-screen-scramble').classList.remove('hidden');
    nextScramble();
}

function updateScrambleUI() {
    document.getElementById('s-score').innerText = `SKOR: ${scrScore}`;
    document.getElementById('s-lives').innerText = `LIVES: ${scrLives} ❤️`;
}

function nextScramble() {
    if (availableScramble.length === 0) { finishScramble(true); return; }
    
    const idx = Math.floor(Math.random() * availableScramble.length);
    currentWordObj = availableScramble[idx];
    availableScramble.splice(idx, 1); // Hapus biar ga muncul lagi

    // Shuffle
    let shuffled = currentWordObj.kata.split('').sort(() => 0.5 - Math.random()).join('');
    while (shuffled === currentWordObj.kata) {
        shuffled = currentWordObj.kata.split('').sort(() => 0.5 - Math.random()).join('');
    }

    document.getElementById('scramble-word').innerText = shuffled;
    document.getElementById('scramble-hint').innerText = `HINT: ${currentWordObj.hint}`;
    document.getElementById('scramble-word').style.color = "yellow"; // Reset warna

    const input = document.getElementById('scramble-input');
    input.value = '';
    input.focus();
    
    resetScrambleTimer();
}

function resetScrambleTimer() {
    clearInterval(scrTimerInterval);
    scrTimer = 20;
    document.getElementById('s-timer').innerText = `⏱ ${scrTimer}`;
    
    scrTimerInterval = setInterval(() => {
        scrTimer--;
        document.getElementById('s-timer').innerText = `⏱ ${scrTimer}`;
        if (scrTimer <= 0) handleWrongScramble("Waktu Habis!");
    }, 1000);
}

// Listener Enter Key untuk Scramble
const scrInput = document.getElementById('scramble-input');
if(scrInput) {
    scrInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") cekJawabanScramble();
    });
}

function cekJawabanScramble() {
    const val = document.getElementById('scramble-input').value.toUpperCase().trim();
    if (val === currentWordObj.kata) {
        scrScore += 10;
        updateScrambleUI();
        const wordEl = document.getElementById('scramble-word');
        wordEl.style.color = "#39ff14";
        wordEl.innerText = "BENAR! ✅";
        clearInterval(scrTimerInterval);
        setTimeout(nextScramble, 1000);
    } else {
        alert("Salah! Coba lagi.");
        document.getElementById('scramble-input').value = '';
        document.getElementById('scramble-input').focus();
    }
}

function skipSoal() { handleWrongScramble("Skip"); }

function handleWrongScramble() {
    clearInterval(scrTimerInterval);
    scrLives--;
    updateScrambleUI();
    
    const wordEl = document.getElementById('scramble-word');
    wordEl.style.color = "red";
    wordEl.innerText = "SALAH! ❌";

    if (scrLives <= 0) setTimeout(() => finishScramble(false), 1000);
    else setTimeout(nextScramble, 1000);
}

function finishScramble(win) {
    clearInterval(scrTimerInterval);
    document.getElementById('game-screen-scramble').classList.add('hidden');
    document.getElementById('end-screen-scramble').classList.remove('hidden');
    
    const title = document.getElementById('end-title-scramble');
    const icon = document.getElementById('end-icon-scramble');
    
    if (win) {
        title.innerText = "YOU WIN!";
        title.style.color = "#39ff14";
        icon.innerText = "🏆";
    } else {
        title.innerText = "GAME OVER";
        title.style.color = "red";
        icon.innerText = "☠️";
    }
    document.getElementById('final-score-scramble').innerText = `Skor Akhir: ${scrScore}`;
}

// --- INITIAL RENDER ---
document.addEventListener('DOMContentLoaded', function() {
    // Render Peta & Materi (Code sebelumnya)
    if(typeof renderGrid === 'function') {
        renderGrid('grid-materi', dbMateri, 'materi');
        renderGrid('grid-pemanfaatan', dbPemanfaatan, 'pemanfaatan');
        renderGrid('grid-k3', dbK3, 'k3');
        renderGrid('grid-alat', dbAlat, 'alat');
    }
});

/* =========================================
   8. FITUR FULLSCREEN GAMBAR
   ========================================= */
function toggleFullscreen(imgId) {
    const img = document.getElementById(imgId);

    if (!img) return;

    // Cek apakah sedang fullscreen atau tidak
    if (!document.fullscreenElement &&    // Standar
        !document.webkitFullscreenElement) { // Safari/Chrome lama

        // Masuk Fullscreen
        if (img.requestFullscreen) {
            img.requestFullscreen();
        } else if (img.webkitRequestFullscreen) { /* Safari */
            img.webkitRequestFullscreen();
        } else if (img.msRequestFullscreen) { /* IE11 */
            img.msRequestFullscreen();
        }
    } else {
        // Keluar Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}