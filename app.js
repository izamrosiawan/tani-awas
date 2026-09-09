let appData = {};
let currentKec = "Kecamatan Karanganyar (Demak)";
let map = null;
let markers = {};
let trajectoryChart = null;
let lossDonutChart = null;
let currentCommodity = "Padi Sawah";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resp = await fetch("data.json?v=20260909_04");
        appData = await resp.json();
        
        populateKecamatanSelect();
        initMap();
        initTrajectoryChart();
        initLossDonutChart();
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    Object.entries(appData).forEach(([kec, data]) => {
        const [lat, lng] = data.coords;
        const color = data.risk_score >= 0.70 ? '#ef4444' : (data.risk_score >= 0.45 ? '#f59e0b' : '#10b981');
        
        const circle = L.circleMarker([lat, lng], {
            radius: 8 + (data.risk_score * 8),
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1.0,
            fillOpacity: 0.85
        }).addTo(map);

        circle.bindTooltip(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
                <strong style="color: #1e293b;">${kec}</strong><br>
                <span style="color: #64748b;">Komoditas:</span> ${data.commodity}<br>
                <span style="color: #64748b;">Skor:</span> <strong style="color: ${color}; font-family: 'JetBrains Mono', monospace;">${data.risk_score.toFixed(3)}</strong>
            </div>
        `, { className: 'custom-leaflet-tooltip' });

        circle.on('click', () => {
            document.getElementById("kecamatanSelect").value = kec;
            updateDashboard(kec);
        });

        markers[kec] = circle;
    });

    // Invalidate map size to ensure full rendering
    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 300);
}

function initLossDonutChart() {
    const ctx = document.getElementById('lossDonutChart').getContext('2d');
    lossDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Potensi Kehilangan (Puso)', 'Panen Aman Terselamatkan'],
            datasets: [{
                data: [41.1, 58.9],
                backgroundColor: ['#ef4444', '#10b981'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item) => ` ${item.label}: ${item.raw.toFixed(1)}%`
                    }
                }
            }
        }
    });
}

function initTrajectoryChart() {
    const ctx = document.getElementById('trajectoryChart').getContext('2d');
    
    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'NDVI Sentinel-2 (Kondisi Kanopi)',
                    data: [],
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.05)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#0d9488',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.45,
                    yAxisID: 'y'
                },
                {
                    label: 'Curah Hujan BMKG (mm)',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.45,
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
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#1e293b',
                    bodyColor: '#475569',
                    borderColor: '#eaedf1',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { color: '#f8fafc' },
                    ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 1.0,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#0d9488',
                        font: { family: "'JetBrains Mono', monospace", size: 10, weight: '600' },
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
                        color: '#ef4444',
                        font: { family: "'JetBrains Mono', monospace", size: 10, weight: '600' },
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
    document.getElementById("ndviRowVal").textContent = item.ndvi.toFixed(2);

    document.getElementById("rainSlider").value = item.rain_mm;
    document.getElementById("rainVal").textContent = `${item.rain_mm.toFixed(1)} mm`;
    document.getElementById("rainRowVal").textContent = `${item.rain_mm.toFixed(1)} mm`;

    document.getElementById("lstSlider").value = item.lst_c;
    document.getElementById("lstVal").textContent = `${item.lst_c.toFixed(1)} °C`;
    document.getElementById("lstRowVal").textContent = `${item.lst_c.toFixed(1)} °C`;

    // Sync Mini KPI Above Chart
    document.getElementById("currentNdviKpi").textContent = item.ndvi.toFixed(2);
    document.getElementById("currentRainKpi").textContent = `${item.rain_mm.toFixed(1)} mm`;

    // Sync Commodity Buttons
    currentCommodity = item.commodity || "Padi Sawah";
    document.querySelectorAll(".com-pill").forEach(btn => {
        if (btn.dataset.val === currentCommodity) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Smooth Pan to Map marker
    if (map && item.coords) {
        map.flyTo(item.coords, 9, { duration: 0.8 });
        // Highlight active circle
        Object.entries(markers).forEach(([k, marker]) => {
            if (k === kec) {
                marker.setStyle({ weight: 4, color: '#1e293b' });
                marker.openTooltip();
            } else {
                marker.setStyle({ weight: 2, color: '#ffffff' });
            }
        });
    }

    calculateAndRenderMetrics();
    updateChart(item.history);
}

function calculateAndRenderMetrics() {
    const ndvi = parseFloat(document.getElementById("ndviSlider").value);
    const rain = parseFloat(document.getElementById("rainSlider").value);
    const lst = parseFloat(document.getElementById("lstSlider").value);
    const landArea = parseFloat(document.getElementById("landAreaSlider").value);

    // Exact Bio-physical Risk Score Formula
    // 50% NDVI deficit + 35% Precipitation deficit + 15% Thermal LST anomaly
    const ndviRatio = Math.max(0, 1.0 - (ndvi / 0.85));
    const rainRatio = Math.max(0, 1.0 - (rain / 60.0));
    const lstRatio = Math.max(0, (lst - 28.0) / 7.0);

    const riskScore = Math.max(0.05, Math.min(0.98, (0.50 * ndviRatio + 0.35 * rainRatio + 0.15 * lstRatio)));
    
    let statusText = "Bahaya";
    let badgeClass = "status-chip danger";
    let riskColorClass = "danger";
    let riskCategory = "Ambang Kritis (D3 Ekstrem)";
    let lossPct = riskScore * 58.0;

    if (riskScore < 0.45) {
        statusText = "Aman";
        badgeClass = "status-chip safe";
        riskColorClass = "safe";
        riskCategory = "Batas Normal (D0 Tanpa Anomali)";
        lossPct = riskScore * 14.0;
    } else if (riskScore < 0.70) {
        statusText = "Waspada";
        badgeClass = "status-chip warning";
        riskColorClass = "warning";
        riskCategory = "Potensi Kekeringan (D1/D2 Waspada)";
        lossPct = riskScore * 35.0;
    }

    const safePct = Math.max(0, 100.0 - lossPct);
    const prodNormalTonHa = currentCommodity === "Padi Sawah" ? 6.0 : 7.5;
    const pricePerKg = currentCommodity === "Padi Sawah" ? 6500 : 5200;
    const totalProdNormalTon = landArea * prodNormalTonHa;
    const lostProdTon = totalProdNormalTon * (lossPct / 100.0);
    const safeProdTon = totalProdNormalTon - lostProdTon;
    const finLossRp = lostProdTon * 1000 * pricePerKg;
    const finLossMiliar = (finLossRp / 1e9).toFixed(2);

    // Dynamic Top Badge
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.className = badgeClass;
    document.getElementById("statusText").textContent = statusText;

    // Dynamic Hero Score
    const riskDisplay = document.getElementById("riskScoreDisplay");
    riskDisplay.textContent = riskScore.toFixed(3);
    riskDisplay.className = `hero-score-number ${riskColorClass}`;
    document.getElementById("riskCategoryText").textContent = riskCategory;

    // Dynamic Donut Chart Update
    if (lossDonutChart) {
        lossDonutChart.data.datasets[0].data = [lossPct, safePct];
        lossDonutChart.update();
    }
    document.getElementById("donutLossPct").textContent = `${lossPct.toFixed(1)}%`;
    document.getElementById("lossPctBadge").textContent = `${lossPct.toFixed(1)}%`;
    document.getElementById("safePctBadge").textContent = `${safePct.toFixed(1)}%`;
    document.getElementById("yieldLostTonDisplay").textContent = `${lostProdTon.toFixed(1)} Ton`;
    document.getElementById("yieldSafeTonDisplay").textContent = `${safeProdTon.toFixed(1)} Ton`;

    // Dynamic Financial Loss
    document.getElementById("finLossDisplay").textContent = finLossMiliar;
    document.getElementById("landAreaSummaryDisplay").textContent = `Basis ${landArea} Ha (${currentCommodity})`;

    // Factor Status Readout
    document.getElementById("vegConditionDisplay").textContent = ndvi < 0.35 ? "Stres Air Kritis" : (ndvi < 0.55 ? "Stres Ringan" : "Prima");
    document.getElementById("rainConditionDisplay").textContent = rain < 20 ? "Defisit Akut (<20mm)" : "Curah Memadai";
}

function updateChart(history) {
    if (!trajectoryChart || !history) return;
    trajectoryChart.data.labels = history.weeks.map(w => `Mgg ${w}`);
    trajectoryChart.datasets[0].data = history.ndvi;
    trajectoryChart.datasets[1].data = history.rain;
    trajectoryChart.update();
}

function bindEvents() {
    // 1. Dropdown Kecamatan
    document.getElementById("kecamatanSelect").addEventListener("change", (e) => {
        updateDashboard(e.target.value);
    });

    // 2. Tombol Komoditas (Padi vs Jagung)
    document.querySelectorAll(".com-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".com-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCommodity = btn.dataset.val;
            calculateAndRenderMetrics();
        });
    });

    // 3. Sub-Tabs Header (Monitoring Wilayah vs Analisis Sensitivitas)
    document.querySelectorAll(".sub-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".sub-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const tabTarget = tab.dataset.tab;
            const scrollContainer = document.querySelector(".dashboard-scrollable");
            if (tabTarget === "analytics") {
                const simSection = document.getElementById("simulation");
                if (simSection) {
                    simSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // 4. Sidebar Nav Smooth Jump & Active State
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const targetHref = item.getAttribute("href");
            const scrollContainer = document.querySelector(".dashboard-scrollable");
            
            if (targetHref === "#overview") {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElem = document.querySelector(targetHref);
                if (targetElem) {
                    targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // 5. Sliders Interaktif
    const sliders = [
        { id: "landAreaSlider", valId: "landAreaVal", suffix: " Ha", decimals: 0 },
        { id: "ndviSlider", valId: "ndviVal", suffix: "", decimals: 2, rowId: "ndviRowVal" },
        { id: "rainSlider", valId: "rainVal", suffix: " mm", decimals: 1, rowId: "rainRowVal" },
        { id: "lstSlider", valId: "lstVal", suffix: " °C", decimals: 1, rowId: "lstRowVal" }
    ];

    sliders.forEach(s => {
        document.getElementById(s.id).addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById(s.valId).textContent = `${val.toFixed(s.decimals)}${s.suffix}`;
            if (s.rowId) document.getElementById(s.rowId).textContent = `${val.toFixed(s.decimals)}${s.suffix}`;
            calculateAndRenderMetrics();
        });
    });
}
