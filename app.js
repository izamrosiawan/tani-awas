let appData = {};
let currentKec = "Kecamatan Karanganyar (Demak)";
let map = null;
let markers = {};
let trajectoryChart = null;
let currentCommodity = "Padi Sawah";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resp = await fetch("data.json?v=20260905_03");
        appData = await resp.json();
        
        populateKecamatanSelect();
        initMap();
        initChart();
        bindEvents();
        updateDashboard(currentKec);
    } catch (err) {
        console.error("Failed loading data.json", err);
    }
});

function populateKecamatanSelect() {
    const select = document.getElementById("kecamatanSelect");
    select.innerHTML = "";
    Object.keys(appData).sort().forEach(kec => {
        const opt = document.createElement("option");
        opt.value = kec;
        opt.textContent = kec;
        if (kec === currentKec) opt.selected = true;
        select.appendChild(opt);
    });
}

function initMap() {
    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView([-6.8944, 110.6385], 8);

    // OpenStreetMap clean basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Plot Kecamatan Markers
    Object.entries(appData).forEach(([kec, data]) => {
        const [lat, lng] = data.coords;
        const color = data.risk_score >= 0.70 ? '#f43f5e' : (data.risk_score >= 0.45 ? '#f59e0b' : '#10b981');
        
        const circle = L.circleMarker([lat, lng], {
            radius: 8 + (data.risk_score * 8),
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.75
        }).addTo(map);

        circle.bindTooltip(`
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.4;">
                <strong style="color: #f8fafc;">${kec}</strong><br>
                <span style="color: #94a3b8;">Komoditas:</span> ${data.commodity}<br>
                <span style="color: #94a3b8;">Skor Risiko:</span> <strong style="color: ${color};">${data.risk_score.toFixed(3)}</strong> (${data.status})
            </div>
        `, { className: 'custom-leaflet-tooltip' });

        circle.on('click', () => {
            document.getElementById("kecamatanSelect").value = kec;
            updateDashboard(kec);
        });

        markers[kec] = circle;
    });
}

function initChart() {
    const ctx = document.getElementById('trajectoryChart').getContext('2d');
    
    // Custom Chart with Clean Precision Look
    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'NDVI Sentinel-2 (Indeks Vegetasi)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderWidth: 2.2,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#090d14',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.35,
                    yAxisID: 'y'
                },
                {
                    label: 'Curah Hujan Mingguan (mm)',
                    data: [],
                    type: 'bar',
                    backgroundColor: 'rgba(56, 189, 248, 0.45)',
                    hoverBackgroundColor: 'rgba(56, 189, 248, 0.75)',
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#94a3b8',
                        boxWidth: 12,
                        boxHeight: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 21, 35, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: '#27374f',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    usePointStyle: true,
                    titleFont: { family: "'Inter', sans-serif", size: 12, weight: '600' },
                    bodyFont: { family: "'JetBrains Mono', monospace", size: 11 }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(28, 38, 56, 0.7)' },
                    ticks: {
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif", size: 11 }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 1.0,
                    grid: { color: 'rgba(28, 38, 56, 0.7)' },
                    ticks: {
                        color: '#10b981',
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                        callback: val => val.toFixed(2)
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 80,
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: '#38bdf8',
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                        callback: val => `${val}mm`
                    }
                }
            }
        }
    });
}

function updateDashboard(kec) {
    currentKec = kec;
    const item = appData[kec];
    if (!item) return;

    // Sync Sliders
    document.getElementById("landAreaSlider").value = item.land_area_ha;
    document.getElementById("landAreaVal").textContent = `${item.land_area_ha} Ha`;

    document.getElementById("ndviSlider").value = item.ndvi;
    document.getElementById("ndviVal").textContent = item.ndvi.toFixed(2);

    document.getElementById("rainSlider").value = item.rain_mm;
    document.getElementById("rainVal").textContent = `${item.rain_mm.toFixed(1)} mm`;

    document.getElementById("lstSlider").value = item.lst_c;
    document.getElementById("lstVal").textContent = `${item.lst_c.toFixed(1)} °C`;

    // Sync Commodity Segmented Control
    currentCommodity = item.commodity || "Padi Sawah";
    document.querySelectorAll(".segmented-btn").forEach(btn => {
        if (btn.dataset.val === currentCommodity) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Pan map to location smoothly
    if (map && item.coords) {
        map.flyTo(item.coords, 9, { duration: 1.2 });
    }

    calculateAndRenderMetrics();
    updateChart(item.history);
}

function calculateAndRenderMetrics() {
    const ndvi = parseFloat(document.getElementById("ndviSlider").value);
    const rain = parseFloat(document.getElementById("rainSlider").value);
    const lst = parseFloat(document.getElementById("lstSlider").value);
    const landArea = parseFloat(document.getElementById("landAreaSlider").value);

    // Exact Mathematical Formula
    const riskScore = Math.max(0.05, Math.min(0.98, (0.50 * (1.0 - (ndvi / 0.85)) + 0.35 * (1.0 - (rain / 60.0)) + 0.15 * ((lst - 28.0) / 7.0))));
    
    let statusText = "BAHAYA (TINGGI)";
    let badgeClass = "status-badge-lg danger";
    let riskColorClass = "danger";
    let riskCategory = "Ambang Kritis (D3 Ekstrem)";
    let lossPct = riskScore * 58.0;

    if (riskScore < 0.45) {
        statusText = "AMAN (RENDAH)";
        badgeClass = "status-badge-lg safe";
        riskColorClass = "safe";
        riskCategory = "Batas Normal (D0 Tanpa Anomali)";
        lossPct = riskScore * 14.0;
    } else if (riskScore < 0.70) {
        statusText = "WASPADA (SEDANG)";
        badgeClass = "status-badge-lg warning";
        riskColorClass = "warning";
        riskCategory = "Potensi Kekeringan (D1/D2 Waspada)";
        lossPct = riskScore * 35.0;
    }

    const prodNormalTonHa = currentCommodity === "Padi Sawah" ? 6.0 : 7.5;
    const pricePerKg = currentCommodity === "Padi Sawah" ? 6500 : 5200;
    const totalProdNormalTon = landArea * prodNormalTonHa;
    const lostProdTon = totalProdNormalTon * (lossPct / 100.0);
    const finLossRp = lostProdTon * 1000 * pricePerKg;
    const finLossMiliar = (finLossRp / 1e9).toFixed(2);

    // Update Status Pill
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.className = badgeClass;
    document.getElementById("statusText").textContent = statusText;

    // Update KPI Numbers
    const riskDisplay = document.getElementById("riskScoreDisplay");
    riskDisplay.textContent = riskScore.toFixed(3);
    riskDisplay.className = `kpi-value ${riskColorClass}`;
    document.getElementById("riskCategoryText").textContent = riskCategory;

    const yieldLossDisplay = document.getElementById("yieldLossDisplay");
    yieldLossDisplay.textContent = lossPct.toFixed(1);
    yieldLossDisplay.className = `kpi-value ${riskColorClass}`;
    document.getElementById("yieldLostTonDisplay").textContent = `-${lostProdTon.toFixed(1)} Ton Estimasi Terancam`;

    document.getElementById("finLossDisplay").textContent = finLossMiliar;
    document.getElementById("landAreaSummaryDisplay").textContent = `Basis: ${landArea} Ha (${currentCommodity} Rp${pricePerKg.toLocaleString('id-ID')}/kg)`;

    // Bio-physical readout
    document.getElementById("vegConditionDisplay").textContent = ndvi < 0.35 ? "Stres Air Kritis" : (ndvi < 0.55 ? "Stres Ringan" : "Vegetasi Prima");
    document.getElementById("rainConditionDisplay").textContent = rain < 20 ? "Defisit Hujan Akut (< 20mm)" : "Curah Hujan Memadai";
}

function updateChart(history) {
    if (!trajectoryChart || !history) return;
    trajectoryChart.data.labels = history.weeks.map(w => `Mgg ${w}`);
    trajectoryChart.datasets[0].data = history.ndvi;
    trajectoryChart.datasets[1].data = history.rain;
    trajectoryChart.update();
}

function bindEvents() {
    document.getElementById("kecamatanSelect").addEventListener("change", (e) => {
        updateDashboard(e.target.value);
    });

    // Segmented Commodity Control
    document.querySelectorAll(".segmented-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".segmented-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCommodity = btn.dataset.val;
            calculateAndRenderMetrics();
        });
    });

    // Sliders
    const sliders = [
        { id: "landAreaSlider", valId: "landAreaVal", suffix: " Ha", decimals: 0 },
        { id: "ndviSlider", valId: "ndviVal", suffix: "", decimals: 2 },
        { id: "rainSlider", valId: "rainVal", suffix: " mm", decimals: 1 },
        { id: "lstSlider", valId: "lstVal", suffix: " °C", decimals: 1 }
    ];

    sliders.forEach(s => {
        document.getElementById(s.id).addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById(s.valId).textContent = `${val.toFixed(s.decimals)}${s.suffix}`;
            calculateAndRenderMetrics();
        });
    });
}
