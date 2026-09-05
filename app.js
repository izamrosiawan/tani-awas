let appData = {};
let currentKec = "Kecamatan Karanganyar (Demak)";
let map = null;
let markers = {};
let trajectoryChart = null;

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resp = await fetch("data.json");
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
    map = L.map('map').setView([-6.8944, 110.6385], 7);

    // Modern Dark CartoDB Tiles (Anti-Rainbow)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    // Plot Markers for each Kecamatan
    Object.entries(appData).forEach(([kec, data]) => {
        const [lat, lng] = data.coords;
        const color = data.risk_score >= 0.70 ? '#ef4444' : (data.risk_score >= 0.45 ? '#eab308' : '#10b981');
        
        const circle = L.circleMarker([lat, lng], {
            radius: 8 + (data.risk_score * 8),
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.75
        }).addTo(map);

        circle.bindTooltip(`<strong>${kec}</strong><br>Risiko: ${data.risk_score.toFixed(2)} (${data.status})`);
        circle.on('click', () => {
            document.getElementById("kecamatanSelect").value = kec;
            updateDashboard(kec);
        });

        markers[kec] = circle;
    });
}

function initChart() {
    const ctx = document.getElementById('trajectoryChart').getContext('2d');
    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'NDVI Sentinel-2 (Indeks Vegetasi)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Curah Hujan BMKG (mm/mgg)',
                    data: [],
                    type: 'bar',
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
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
                    labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                }
            },
            scales: {
                x: {
                    grid: { color: '#212e40' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 1.0,
                    grid: { color: '#212e40' },
                    ticks: { color: '#10b981' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 80,
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#3b82f6' }
                }
            }
        }
    });
}

function updateDashboard(kec) {
    currentKec = kec;
    const item = appData[kec];
    if (!item) return;

    // Header & Title
    document.getElementById("selectedKecTitle").textContent = kec;
    
    // Sliders sync
    document.getElementById("landAreaSlider").value = item.land_area_ha;
    document.getElementById("landAreaVal").textContent = `${item.land_area_ha} Ha`;
    
    document.getElementById("ndviSlider").value = item.ndvi;
    document.getElementById("ndviVal").textContent = item.ndvi.toFixed(2);
    
    document.getElementById("rainSlider").value = item.rain_mm;
    document.getElementById("rainVal").textContent = `${item.rain_mm.toFixed(1)} mm`;
    
    document.getElementById("lstSlider").value = item.lst_c;
    document.getElementById("lstVal").textContent = `${item.lst_c.toFixed(1)} °C`;

    // Radio
    const radios = document.getElementsByName("commodity");
    for (const r of radios) {
        r.checked = (r.value === item.commodity);
    }

    // Pan map to location
    if (map) {
        map.setView(item.coords, 9, { animate: true });
    }

    calculateAndRenderMetrics();
    updateChart(item.history);
}

function calculateAndRenderMetrics() {
    const ndvi = parseFloat(document.getElementById("ndviSlider").value);
    const rain = parseFloat(document.getElementById("rainSlider").value);
    const lst = parseFloat(document.getElementById("lstSlider").value);
    const landArea = parseFloat(document.getElementById("landAreaSlider").value);
    
    let commodity = "Padi Sawah";
    for (const r of document.getElementsByName("commodity")) {
        if (r.checked) commodity = r.value;
    }

    // Mathematical Formula
    const riskScore = Math.max(0.05, Math.min(0.98, (0.50 * (1.0 - (ndvi / 0.85)) + 0.35 * (1.0 - (rain / 60.0)) + 0.15 * ((lst - 28.0) / 7.0))));
    
    let status = "BAHAYA (TINGGI)";
    let badgeClass = "badge-danger";
    let lossPct = riskScore * 58.0;

    if (riskScore < 0.45) {
        status = "AMAN (RENDAH)";
        badgeClass = "badge-safe";
        lossPct = riskScore * 14.0;
    } else if (riskScore < 0.70) {
        status = "WASPADA (SEDANG)";
        badgeClass = "badge-warning";
        lossPct = riskScore * 35.0;
    }

    const prodNormalTonHa = commodity === "Padi Sawah" ? 6.0 : 7.5;
    const pricePerKg = commodity === "Padi Sawah" ? 6500 : 5200;
    const totalProdNormalTon = landArea * prodNormalTonHa;
    const lostProdTon = totalProdNormalTon * (lossPct / 100.0);
    const finLossRp = lostProdTon * 1000 * pricePerKg;
    const finLossMiliar = (finLossRp / 1e9).toFixed(2);

    // Update UI elements
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.className = badgeClass;
    statusBadge.textContent = status;

    const riskDisplay = document.getElementById("riskScoreDisplay");
    riskDisplay.textContent = riskScore.toFixed(3);
    riskDisplay.className = `metric-value ${riskScore >= 0.70 ? 'danger' : ''}`;

    document.getElementById("yieldLossDisplay").textContent = `${lossPct.toFixed(1)}%`;
    document.getElementById("yieldLostTonDisplay").textContent = `-${lostProdTon.toFixed(1)} Ton Terancam`;
    
    document.getElementById("finLossDisplay").textContent = `Rp${finLossMiliar} Miliar`;
    document.getElementById("landAreaSummaryDisplay").textContent = `Basis: ${landArea} Ha (Rp${pricePerKg.toLocaleString('id-ID')}/kg)`;

    document.getElementById("vegConditionDisplay").textContent = ndvi < 0.35 ? "Stres Air Kritis" : (ndvi < 0.55 ? "Stres Ringan" : "Vegetasi Prima");
    document.getElementById("rainConditionDisplay").textContent = rain < 20 ? "Defisit Hujan Akut (< 20mm)" : "Curah Hujan Memadai";
}

function updateChart(history) {
    if (!trajectoryChart) return;
    trajectoryChart.data.labels = history.weeks.map(w => `Mgg ${w}`);
    trajectoryChart.datasets[0].data = history.ndvi;
    trajectoryChart.datasets[1].data = history.rain;
    trajectoryChart.update();
}

function bindEvents() {
    document.getElementById("kecamatanSelect").addEventListener("change", (e) => {
        updateDashboard(e.target.value);
    });

    const sliders = [
        { id: "landAreaSlider", valId: "landAreaVal", suffix: " Ha" },
        { id: "ndviSlider", valId: "ndviVal", suffix: "" },
        { id: "rainSlider", valId: "rainVal", suffix: " mm" },
        { id: "lstSlider", valId: "lstVal", suffix: " °C" }
    ];

    sliders.forEach(s => {
        document.getElementById(s.id).addEventListener("input", (e) => {
            document.getElementById(s.valId).textContent = `${parseFloat(e.target.value).toFixed(s.id === 'ndviSlider' ? 2 : (s.id === 'lstSlider' ? 1 : 0))}${s.suffix}`;
            calculateAndRenderMetrics();
        });
    });

    document.querySelectorAll('input[name="commodity"]').forEach(r => {
        r.addEventListener("change", calculateAndRenderMetrics);
    });

    document.getElementById("btnSimulate").addEventListener("click", () => {
        calculateAndRenderMetrics();
    });
}
