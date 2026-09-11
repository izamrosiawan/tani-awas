let appData = {};
let currentKec = "Kecamatan Karanganyar (Demak)";
let map = null;
let markers = {};
let currentTileLayer = null;
let trajectoryChart = null;
let lossDonutChart = null;
let currentCommodity = "Padi Sawah";

const TILE_LAYERS = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resp = await fetch("data.json?v=20260911_05");
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
    if (!select) return;
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
        zoomControl: false, // menggunakan custom floating zoom (+ / -) pill
        attributionControl: false
    }).setView([-6.8944, 110.6385], 9);

    currentTileLayer = L.tileLayer(TILE_LAYERS.satellite, {
        attribution: '&copy; Esri & Earthstar Geographics',
        maxZoom: 18
    }).addTo(map);

    Object.entries(appData).forEach(([kec, data]) => {
        const [lat, lng] = data.coords;
        const color = data.risk_score >= 0.70 ? '#d97706' : (data.risk_score >= 0.45 ? '#f59e0b' : '#15803d');
        
        const circle = L.circleMarker([lat, lng], {
            radius: 8 + (data.risk_score * 8),
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1.0,
            fillOpacity: 0.85
        }).addTo(map);

        circle.bindTooltip(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; padding: 4px;">
                <strong style="color: #1c211e;">${kec}</strong><br>
                <span style="color: #727a70;">Komoditas:</span> ${data.commodity}<br>
                <span style="color: #727a70;">Indeks Risiko:</span> <strong style="color: ${color}; font-family: 'JetBrains Mono', monospace;">${data.risk_score.toFixed(3)}</strong>
            </div>
        `, { className: 'custom-leaflet-tooltip' });

        circle.on('click', () => {
            const select = document.getElementById("kecamatanSelect");
            if (select) select.value = kec;
            updateDashboard(kec);
        });

        markers[kec] = circle;
    });

    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 300);
}

function initLossDonutChart() {
    const canvas = document.getElementById('lossDonutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    lossDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Potensi Kerusakan (Defisit)', 'Kapasitas Mitigasi Siaga'],
            datasets: [{
                data: [11, 89],
                backgroundColor: ['rgba(0,0,0,0.08)', '#d97706'],
                borderWidth: 0,
                hoverOffset: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '76%',
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
    const canvas = document.getElementById('trajectoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Create gradient fill for Amber curve
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(217, 119, 6, 0.45)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.03)');

    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4', 'Mgg 5', 'Mgg 6'],
            datasets: [
                {
                    label: 'NDVI Biomassa Sentinel-2',
                    data: [0.65, 0.58, 0.51, 0.44, 0.38, 0.34],
                    borderColor: '#d97706',
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#d97706',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 3.5,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Curah Hujan BMKG (mm)',
                    data: [42, 35, 28, 18, 14, 12],
                    borderColor: '#15803d',
                    backgroundColor: 'rgba(21, 128, 61, 0.05)',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointBackgroundColor: '#15803d',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    pointRadius: 3,
                    fill: false,
                    tension: 0.4,
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1c211e',
                    bodyColor: '#4b524d',
                    borderColor: 'rgba(28, 33, 30, 0.1)',
                    borderWidth: 1,
                    padding: 8,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#798078', font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 } }
                },
                y: {
                    type: 'linear',
                    display: false,
                    min: 0,
                    max: 1.0
                },
                y1: {
                    type: 'linear',
                    display: false,
                    min: 0,
                    max: 80
                }
            }
        }
    });
}

function updateDashboard(kec) {
    currentKec = kec;
    const item = appData[kec];
    if (!item) return;

    // Location Label in Map
    const locLabel = document.getElementById("mapLocationLabel");
    if (locLabel) locLabel.textContent = `${kec} (Sektor 1)`;

    // Sliders
    const landSlider = document.getElementById("landAreaSlider");
    if (landSlider) landSlider.value = item.land_area_ha;
    const landVal = document.getElementById("landAreaVal");
    if (landVal) landVal.textContent = `${item.land_area_ha} Ha`;

    const ndviSlider = document.getElementById("ndviSlider");
    if (ndviSlider) ndviSlider.value = item.ndvi;
    const ndviVal = document.getElementById("ndviVal");
    if (ndviVal) ndviVal.textContent = item.ndvi.toFixed(2);

    const rainSlider = document.getElementById("rainSlider");
    if (rainSlider) rainSlider.value = item.rain_mm;
    const rainVal = document.getElementById("rainVal");
    if (rainVal) rainVal.textContent = `${item.rain_mm.toFixed(1)} mm`;

    const lstSlider = document.getElementById("lstSlider");
    if (lstSlider) lstSlider.value = item.lst_c;
    const lstVal = document.getElementById("lstVal");
    if (lstVal) lstVal.textContent = `${item.lst_c.toFixed(1)} °C`;

    // Map fly
    if (map && item.coords) {
        map.flyTo(item.coords, 10, { duration: 0.8 });
        Object.entries(markers).forEach(([k, marker]) => {
            if (k === kec) {
                marker.setStyle({ weight: 4, color: '#1c211e' });
                marker.openTooltip();
            } else {
                marker.setStyle({ weight: 2, color: '#ffffff' });
            }
        });
    }

    calculateAndRenderMetrics();
    if (item.history) updateChart(item.history);
}

function calculateAndRenderMetrics() {
    const ndviElem = document.getElementById("ndviSlider");
    const rainElem = document.getElementById("rainSlider");
    const lstElem = document.getElementById("lstSlider");
    const landElem = document.getElementById("landAreaSlider");

    if (!ndviElem || !rainElem || !lstElem || !landElem) return;

    const ndvi = parseFloat(ndviElem.value);
    const rain = parseFloat(rainElem.value);
    const lst = parseFloat(lstElem.value);
    const landArea = parseFloat(landElem.value);

    // Exact Bio-physical Risk Score Formula
    const ndviRatio = Math.max(0, 1.0 - (ndvi / 0.85));
    const rainRatio = Math.max(0, 1.0 - (rain / 60.0));
    const lstRatio = Math.max(0, (lst - 28.0) / 7.0);

    const riskScore = Math.max(0.05, Math.min(0.98, (0.50 * ndviRatio + 0.35 * rainRatio + 0.15 * lstRatio)));
    
    let lossPct = riskScore * 58.0;
    if (riskScore < 0.45) {
        lossPct = riskScore * 14.0;
    } else if (riskScore < 0.70) {
        lossPct = riskScore * 35.0;
    }

    const readinessPct = Math.max(10, Math.min(98, 100.0 - lossPct));
    const prodNormalTonHa = currentCommodity === "Padi Sawah" ? 6.0 : 7.5;
    const pricePerKg = currentCommodity === "Padi Sawah" ? 6500 : 5200;
    const totalProdNormalTon = landArea * prodNormalTonHa;
    const lostProdTon = totalProdNormalTon * (lossPct / 100.0);
    const finLossRp = lostProdTon * 1000 * pricePerKg;
    const finLossMiliar = (finLossRp / 1e9).toFixed(2);

    // 1. Update 4 Snapshot Metrics in Right Panel
    const snapRisk = document.getElementById("snapRiskScoreVal");
    if (snapRisk) snapRisk.textContent = riskScore.toFixed(3);

    const snapNdvi = document.getElementById("snapNdviVal");
    if (snapNdvi) snapNdvi.textContent = ndvi.toFixed(2);

    const snapRain = document.getElementById("snapRainVal");
    if (snapRain) snapRain.textContent = `${rain.toFixed(1)} mm`;

    const snapTemp = document.getElementById("snapTempVal");
    if (snapTemp) snapTemp.textContent = `${lst.toFixed(1)} °C`;

    // 2. Update 4 Transaction Metrics
    const txLand = document.getElementById("txLandHa");
    if (txLand) txLand.textContent = `${Math.round(landArea)} Ha`;

    const txLoss = document.getElementById("txLossTon");
    if (txLoss) txLoss.textContent = `${lostProdTon.toFixed(1)} Ton`;

    const txPct = document.getElementById("txLossPct");
    if (txPct) txPct.textContent = `${lossPct.toFixed(1)}% Yield Loss`;

    const txRp = document.getElementById("txLossRp");
    if (txRp) txRp.textContent = `Rp ${finLossMiliar} M`;

    // AUTP
    const isEligibleAUTP = lossPct >= 75.0;
    const autpTotal = isEligibleAUTP ? (landArea * 6000000) : (landArea * 6000000 * 0.5);
    const txAutp = document.getElementById("txAutpPayout");
    if (txAutp) txAutp.textContent = `Rp ${(autpTotal / 1e9).toFixed(2)} M`;

    const txStatus = document.getElementById("txAutpStatus");
    if (txStatus) txStatus.textContent = isEligibleAUTP ? "Eligible Klaim (Puso)" : "Status Siaga Pantau";

    // 3. Update Donut Readiness
    if (lossDonutChart) {
        lossDonutChart.data.datasets[0].data = [100 - readinessPct, readinessPct];
        lossDonutChart.update();
    }
    const donutVal = document.getElementById("donutCenterVal");
    if (donutVal) donutVal.textContent = `${Math.round(readinessPct)}%`;

    // 4. Update Left Column Micro-KPI Tiles (Dynamically scaled)
    const kpiVeg = document.getElementById("kpiVegCover");
    if (kpiVeg) kpiVeg.textContent = `${Math.round(ndvi * 100)}%`;

    const kpiCanopy = document.getElementById("kpiCanopyHealth");
    if (kpiCanopy) kpiCanopy.textContent = `${Math.round(Math.max(20, 100 - (riskScore * 80)))}%`;

    const kpiSoil = document.getElementById("kpiSoilMoisture");
    if (kpiSoil) kpiSoil.textContent = `${Math.round(Math.min(95, rain * 1.8 + 20))}%`;

    const kpiLand = document.getElementById("kpiLandMonitored");
    if (kpiLand) kpiLand.textContent = `${(landArea / 10).toFixed(1)}K`;

    // 5. Update Operational Tools: Pompa AWD & AUTP
    const targetWaterMm = currentCommodity === "Padi Sawah" ? 60.0 : 45.0;
    const waterDeficitMm = Math.max(0.0, targetWaterMm - rain);
    const totalWaterVolM3 = waterDeficitMm * 10.0 * landArea;
    const pumpUnits = Math.max(1, Math.ceil(totalWaterVolM3 / 5040.0));
    const fuelCostJuta = ((pumpUnits * 84 * 6800) / 1e6).toFixed(1);

    const kpiPump = document.getElementById("kpiPumpVolume");
    if (kpiPump) kpiPump.textContent = `${pumpUnits * 28}`;

    const defElem = document.getElementById("waterDeficitVal");
    if (defElem) defElem.textContent = waterDeficitMm.toFixed(1);

    const volElem = document.getElementById("totalWaterVolumeVal");
    if (volElem) volElem.textContent = Math.round(totalWaterVolM3).toLocaleString('id-ID');

    const pumpElem = document.getElementById("pumpUnitsVal");
    if (pumpElem) pumpElem.textContent = pumpUnits;

    const fuelElem = document.getElementById("fuelCostVal");
    if (fuelElem) fuelElem.textContent = `Rp ${fuelCostJuta} Jt`;

    const adviceElem = document.getElementById("irrigationAdviceText");
    if (adviceElem) {
        if (riskScore >= 0.70) {
            adviceElem.textContent = `Mendesak: Pasang ${pumpUnits} unit pompa darurat di titik sumur/embung primer. Terapkan irigasi malam hari berselang (AWD) dan tunda pemupukan kering.`;
        } else if (riskScore >= 0.45) {
            adviceElem.textContent = `Waspada: Rotasi pembukaan pintu air tersier setiap 3 hari. Gunakan mulsa jerami sisa panen untuk menekan laju penguapan tanah.`;
        } else {
            adviceElem.textContent = `Kondisi Stabil: Pasokan air presipitasi mencukupi kebutuhan fase vegetatif. Pertahankan tinggi genangan macak-macak 2-3 cm.`;
        }
    }

    // AUTP Card
    const autpBadge = document.getElementById("autpEligibilityBadge");
    const autpDesc = document.getElementById("autpEligibilityDesc");
    const autpPayout = document.getElementById("autpPayoutVal");

    if (autpBadge && autpDesc && autpPayout) {
        if (isEligibleAUTP) {
            autpBadge.textContent = "MEMENUHI SYARAT KLAIM";
            autpBadge.style.color = "#15803d";
            autpDesc.textContent = `Tingkat kerusakan lahan (${lossPct.toFixed(1)}%) telah melampaui ambang batas syarat AUTP (≥75%). Petani berhak mengajukan santunan.`;
            autpPayout.textContent = (landArea * 6000000).toLocaleString('id-ID');
        } else {
            autpBadge.textContent = "BELUM MEMENUHI AMBANG";
            autpBadge.style.color = "#d97706";
            autpDesc.textContent = `Tingkat kehilangan hasil (${lossPct.toFixed(1)}%) masih di bawah ambang batas legal AUTP (75%). Prioritaskan tindakan pompa darurat.`;
            autpPayout.textContent = `(Potensi: Rp${((landArea * 6000000) / 1e9).toFixed(2)} M)`;
        }
    }
}

function updateChart(history) {
    if (!trajectoryChart || !history) return;
    trajectoryChart.data.labels = history.weeks.map(w => `Mgg ${w}`);
    trajectoryChart.data.datasets[0].data = history.ndvi;
    trajectoryChart.data.datasets[1].data = history.rain;
    trajectoryChart.update();
}

function bindEvents() {
    const sel = document.getElementById("kecamatanSelect");
    if (sel) {
        sel.addEventListener("change", (e) => {
            updateDashboard(e.target.value);
        });
    }

    // Floating Map Zoom (+ / -)
    const btnZoomIn = document.getElementById("btnZoomIn");
    if (btnZoomIn) {
        btnZoomIn.addEventListener("click", () => {
            if (map) map.zoomIn();
        });
    }

    const btnZoomOut = document.getElementById("btnZoomOut");
    if (btnZoomOut) {
        btnZoomOut.addEventListener("click", () => {
            if (map) map.zoomOut();
        });
    }

    // Spatial Map Layer Switcher
    document.querySelectorAll(".spatial-layer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".spatial-layer-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const layerKey = btn.dataset.layer;
            
            if (map && currentTileLayer) {
                map.removeLayer(currentTileLayer);
                currentTileLayer = L.tileLayer(TILE_LAYERS[layerKey], {
                    attribution: layerKey === 'satellite' ? '&copy; Esri & Earthstar Geographics' : '&copy; OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(map);
            }
        });
    });

    // Top Nav Pills
    document.querySelectorAll(".nav-pill-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const view = btn.dataset.view;
            if (view === "overview") {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (view === "map") {
                const mapElem = document.querySelector(".spatial-map-container");
                if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (view === "analytics") {
                const toolsElem = document.getElementById("operationalDrawer");
                if (toolsElem) toolsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Export PDF Report
    const btnExport = document.getElementById("btnExportReport");
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            window.print();
        });
    }

    // Sliders
    const sliders = [
        { id: "landAreaSlider", valId: "landAreaVal", suffix: " Ha", decimals: 0 },
        { id: "ndviSlider", valId: "ndviVal", suffix: "", decimals: 2 },
        { id: "rainSlider", valId: "rainVal", suffix: " mm", decimals: 1 },
        { id: "lstSlider", valId: "lstVal", suffix: " °C", decimals: 1 }
    ];

    sliders.forEach(s => {
        const sliderElem = document.getElementById(s.id);
        if (sliderElem) {
            sliderElem.addEventListener("input", (e) => {
                const val = parseFloat(e.target.value);
                const displayElem = document.getElementById(s.valId);
                if (displayElem) displayElem.textContent = `${val.toFixed(s.decimals)}${s.suffix}`;
                calculateAndRenderMetrics();
            });
        }
    });
}
