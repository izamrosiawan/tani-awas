let appData = {};
let wonogiriPoints = [];
let currentKec = "Kecamatan Wonogiri";
let map = null;
let markers = {};
let pointMarkers = [];
let currentTileLayer = null;
let heatLayer = null;
let activeLayerMode = "heat-vuln";
let trajectoryChart = null;

const TILE_LAYERS = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [respData, respPoints] = await Promise.all([
            fetch("data.json?v=20261010_v1"),
            fetch("wonogiri_grid_points.json?v=20261010_v1")
        ]);
        appData = await respData.json();
        wonogiriPoints = await respPoints.json();
        
        populateKecamatanSelect();
        initMap();
        initTrajectoryChart();
        bindEvents();
        updateDashboard(currentKec);
    } catch (err) {
        console.error("Failed loading data", err);
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

function renderHeatmapLayer(mode) {
    if (!map || !L.heatLayer || !wonogiriPoints.length) return;

    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }

    // Determine heat intensity
    const heatData = wonogiriPoints.map(pt => {
        let intensity = 0.5;
        if (mode === "heat-vuln") {
            intensity = pt.kerentanan_intensity;
        } else if (mode === "heat-lst") {
            // Suhu permukaan LST: normalized (26.0 - 27.0 range from NASA POWER)
            intensity = Math.max(0.2, Math.min(1.0, (pt.suhu_permukaan_rata - 26.0) / 0.8));
        } else if (mode === "heat-ndvi") {
            intensity = pt.vegetation_stress;
        }
        return [pt.lat, pt.lon, intensity];
    });

    const gradient = {
        0.2: "#15803d",
        0.45: "#f59e0b",
        0.65: "#ea580c",
        0.85: "#dc2626",
        1.0: "#7f1d1d"
    };

    heatLayer = L.heatLayer(heatData, {
        radius: 24,
        blur: 18,
        maxZoom: 14,
        max: 1.0,
        minOpacity: 0.45,
        gradient
    }).addTo(map);

    const legBar = document.getElementById("heatmapLegendBar");
    const legText = document.getElementById("heatLegendText");
    const legGrad = document.getElementById("heatLegendGrad");
    if (legBar && legText && legGrad) {
        legBar.style.display = "block";
        if (mode === "heat-vuln") {
            legText.textContent = "Indeks Kerentanan Relatif: Rendah (<0.43) → Sedang → Tinggi (>0.55)";
            legGrad.style.background = "linear-gradient(to right, #15803d, #f59e0b, #ea580c, #dc2626, #7f1d1d)";
        } else if (mode === "heat-lst") {
            legText.textContent = "Suhu Permukaan LST: Rata-rata 26.2°C → Anomali Hangat 26.7°C+";
            legGrad.style.background = "linear-gradient(to right, #15803d, #f59e0b, #ea580c, #dc2626, #7f1d1d)";
        } else if (mode === "heat-ndvi") {
            legText.textContent = "Stres Kanopi Vegetasi: Vigor Kuat (NDVI > 0.55) → Defisit Kanopi (NDVI < 0.35)";
            legGrad.style.background = "linear-gradient(to right, #15803d, #f59e0b, #ea580c, #dc2626, #7f1d1d)";
        }
    }
}

function initMap() {
    const wonogiriBounds = L.latLngBounds([
        [-8.25, 110.70],
        [-7.70, 111.35]
    ]);

    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        maxBounds: wonogiriBounds,
        maxBoundsViscosity: 0.95,
        minZoom: 10,
        maxZoom: 16
    }).setView([-7.96, 111.02], 11);

    map.fitBounds(wonogiriBounds, { padding: [20, 20] });

    currentTileLayer = L.tileLayer(TILE_LAYERS.satellite, {
        maxZoom: 18
    }).addTo(map);

    // Initial Heatmap Render: Kerentanan Relatif
    renderHeatmapLayer(activeLayerMode);

    // Render individual point sample circles (300 titik pipeline)
    const WARNA_KELAS = {
        "Rendah": "#15803d",
        "Sedang": "#d97706",
        "Tinggi": "#dc2626"
    };

    wonogiriPoints.forEach(pt => {
        const pCircle = L.circleMarker([pt.lat, pt.lon], {
            radius: 3.5,
            fillColor: WARNA_KELAS[pt.kelas_relatif] || "#f59e0b",
            color: "#ffffff",
            weight: 1,
            opacity: 0.9,
            fillOpacity: 0.8
        }).addTo(map);

        pCircle.bindTooltip(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; line-height: 1.45; padding: 4px;">
                <strong style="color: #0f172a;">Titik #${pt.point_id}</strong><br>
                <span>Kerentanan:</span> <strong style="color: ${WARNA_KELAS[pt.kelas_relatif]};">${pt.kelas_relatif}</strong> (Stabilitas ${Math.round(pt.stabilitas_kelas * 100)}%)<br>
                <span>Indeks:</span> <strong>${pt.index_kerentanan.toFixed(3)}</strong><br>
                <span>Elevasi:</span> ${pt.elevation} m &bull; <span>Lereng:</span> ${pt.slope}&deg;<br>
                <span>NDVI:</span> ${pt.ndvi.toFixed(3)}
            </div>
        `, { className: 'custom-leaflet-tooltip' });

        pointMarkers.push(pCircle);
    });

    // Render 8 sentinel subdistrict nodes
    Object.entries(appData).forEach(([kec, data]) => {
        const [lat, lng] = data.coords;
        const color = data.risk_score >= 0.70 ? '#dc2626' : (data.risk_score >= 0.45 ? '#d97706' : '#15803d');
        
        const circle = L.circleMarker([lat, lng], {
            radius: 9 + (data.risk_score * 8),
            fillColor: color,
            color: '#ffffff',
            weight: 2.5,
            opacity: 1.0,
            fillOpacity: 0.9
        }).addTo(map);

        circle.bindTooltip(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.45; padding: 4px;">
                <strong style="color: #1c211e;">${kec}</strong><br>
                <span style="color: #727a70;">Komoditas:</span> ${data.commodity}<br>
                <span style="color: #727a70;">Kerentanan:</span> <strong>${data.kelas_relatif}</strong> (${data.vuln_index})<br>
                <span style="color: #727a70;">Skor Risiko Gabungan:</span> <strong style="color: ${color}; font-family: 'JetBrains Mono', monospace;">${data.risk_score.toFixed(3)}</strong>
            </div>
        `, { className: 'custom-leaflet-tooltip' });

        circle.on('click', () => {
            const sel = document.getElementById("kecamatanSelect");
            if (sel) sel.value = kec;
            updateDashboard(kec);
        });

        markers[kec] = circle;
    });

    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 300);
}

function initTrajectoryChart() {
    const canvas = document.getElementById('trajectoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(217, 119, 6, 0.40)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'NDVI Vegetasi (Sentinel-2)',
                    data: [],
                    borderColor: '#d97706',
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#d97706',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 3.5,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.35,
                    yAxisID: 'y'
                },
                {
                    label: 'Curah Hujan (NASA POWER & GEE mm)',
                    data: [],
                    borderColor: '#15803d',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointBackgroundColor: '#15803d',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    pointRadius: 3,
                    fill: false,
                    tension: 0.35,
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
                    display: true,
                    position: 'left',
                    min: 0.2,
                    max: 0.85,
                    ticks: { color: '#d97706', font: { size: 9 } }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { display: false },
                    min: 0,
                    max: 500,
                    ticks: { color: '#15803d', font: { size: 9 } }
                }
            }
        }
    });
}

function updateDashboard(kec) {
    currentKec = kec;
    const item = appData[kec];
    if (!item) return;

    // Sector Name
    const secName = document.getElementById("mapSectorName");
    if (secName) secName.textContent = kec;

    // Sync Sliders
    const sLand = document.getElementById("landAreaSlider");
    if (sLand) sLand.value = item.land_area_ha;
    const vLand = document.getElementById("landAreaVal");
    if (vLand) vLand.textContent = `${item.land_area_ha} Ha`;

    const sNdvi = document.getElementById("ndviSlider");
    if (sNdvi) sNdvi.value = item.ndvi;
    const vNdvi = document.getElementById("ndviVal");
    if (vNdvi) vNdvi.textContent = item.ndvi.toFixed(2);

    const sRain = document.getElementById("rainSlider");
    if (sRain) sRain.value = item.rain_mm;
    const vRain = document.getElementById("rainVal");
    if (vRain) vRain.textContent = `${item.rain_mm.toFixed(1)} mm`;

    const sLst = document.getElementById("lstSlider");
    if (sLst) sLst.value = item.lst_c;
    const vLst = document.getElementById("lstVal");
    if (vLst) vLst.textContent = `${item.lst_c.toFixed(1)} °C`;

    // Map fly
    if (map && item.coords) {
        map.flyTo(item.coords, 12, { duration: 0.8 });
        Object.entries(markers).forEach(([k, marker]) => {
            if (k === kec) {
                marker.setStyle({ weight: 4, color: '#1c211e' });
                marker.openTooltip();
            } else {
                marker.setStyle({ weight: 2.5, color: '#ffffff' });
            }
        });
    }

    calculateAndRenderMetrics();

    if (item.history && trajectoryChart) {
        trajectoryChart.data.labels = item.history.weeks;
        trajectoryChart.data.datasets[0].data = item.history.ndvi;
        trajectoryChart.data.datasets[1].data = item.history.rain;
        trajectoryChart.update();
    }
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

    const item = appData[currentKec] || {};
    const vIndex = item.vuln_index || 0.50;

    // Pipeline bio-physical risk formula
    const ndviRatio = Math.max(0, 1.0 - (ndvi / 0.85));
    const rainRatio = Math.max(0, 1.0 - (rain / 120.0));
    const lstRatio = Math.max(0, (lst - 30.0) / 15.0);

    const riskScore = Math.max(0.05, Math.min(0.98, (0.40 * ndviRatio + 0.35 * rainRatio + 0.25 * vIndex)));
    
    let lossPct = riskScore * 48.0;
    if (riskScore < 0.45) {
        lossPct = riskScore * 18.0;
    } else if (riskScore < 0.70) {
        lossPct = riskScore * 32.0;
    }

    const safePct = Math.max(10, Math.min(98, 100.0 - lossPct));
    const prodNormalTonHa = 6.0;
    const pricePerKg = 6500;
    const totalProdNormalTon = landArea * prodNormalTonHa;
    const lostProdTon = totalProdNormalTon * (lossPct / 100.0);
    const finLossRp = lostProdTon * 1000 * pricePerKg;
    const finLossMiliar = (finLossRp / 1e9).toFixed(2);

    // 1. Left micro-KPI tiles (if any)
    const kpiVeg = document.getElementById("kpiVegCover");
    if (kpiVeg) kpiVeg.innerHTML = `${Math.round(ndvi * 100)}<small>%</small>`;

    const kpiCanopy = document.getElementById("kpiCanopyHealth");
    if (kpiCanopy) kpiCanopy.innerHTML = `${Math.round(Math.max(20, 100 - (riskScore * 75)))}<small>%</small>`;

    const kpiSoil = document.getElementById("kpiSoilMoisture");
    if (kpiSoil) kpiSoil.innerHTML = `${Math.round(Math.min(95, rain * 1.5 + 20))}<small>%</small>`;

    const kpiLand = document.getElementById("kpiLandMonitored");
    if (kpiLand) kpiLand.innerHTML = `${(landArea / 10).toFixed(1)}<small>K</small>`;

    const kpiSurplus = document.getElementById("kpiYieldSurplus");
    if (kpiSurplus) kpiSurplus.innerHTML = `${Math.round(safePct)}<small>%</small>`;

    // 2. Card 1: Risk & Loss
    const snapRisk = document.getElementById("snapRiskScoreVal");
    if (snapRisk) snapRisk.textContent = riskScore.toFixed(3);

    const txLand = document.getElementById("txLandHa");
    if (txLand) txLand.textContent = `${Math.round(landArea)} Ha`;

    const txLoss = document.getElementById("txLossTon");
    if (txLoss) txLoss.textContent = `${lostProdTon.toFixed(1)} Ton`;

    const txPct = document.getElementById("txLossPct");
    if (txPct) txPct.textContent = `${lossPct.toFixed(1)}% Loss`;

    const txRp = document.getElementById("txLossRp");
    if (txRp) txRp.textContent = `Rp ${finLossMiliar} M`;

    // 3. Card 2: Pipeline Predictions
    const snapNdvi = document.getElementById("snapNdviVal");
    if (snapNdvi) snapNdvi.textContent = ndvi.toFixed(3);

    const snapRain = document.getElementById("snapRainVal");
    if (snapRain) snapRain.textContent = `${rain.toFixed(1)} mm`;

    const snapTemp = document.getElementById("snapTempVal");
    if (snapTemp) snapTemp.textContent = `${lst.toFixed(1)} °C`;

    // 4. Donut Gauge
    const donutVal = document.getElementById("donutCenterVal");
    if (donutVal) donutVal.textContent = `${Math.round(safePct)}%`;

    // 5. AUTP & AWD Calculations
    const isEligibleAUTP = lossPct >= 75.0;
    const autpTotal = isEligibleAUTP ? (landArea * 6000000) : (landArea * 6000000 * 0.5);
    const txAutp = document.getElementById("txAutpPayout");
    if (txAutp) txAutp.textContent = `Rp ${(autpTotal / 1e9).toFixed(2)} M`;

    const txStatus = document.getElementById("txAutpStatus");
    if (txStatus) txStatus.textContent = isEligibleAUTP ? "Eligible Klaim" : "Status Pantau";

    const targetWaterMm = 60.0;
    const waterDeficitMm = Math.max(0.0, targetWaterMm - (rain / 4.0));
    const totalWaterVolM3 = waterDeficitMm * 10.0 * landArea;
    const pumpUnits = Math.max(1, Math.ceil(totalWaterVolM3 / 5040.0));
    const fuelCostJuta = ((pumpUnits * 84 * 6800) / 1e6).toFixed(1);

    const defElem = document.getElementById("waterDeficitVal");
    if (defElem) defElem.textContent = waterDeficitMm.toFixed(1);

    const volElem = document.getElementById("totalWaterVolumeVal");
    if (volElem) volElem.textContent = Math.round(totalWaterVolM3).toLocaleString('id-ID');

    const pumpElem = document.getElementById("pumpUnitsVal");
    if (pumpElem) pumpElem.textContent = `${pumpUnits} Unit`;

    const fuelElem = document.getElementById("fuelCostVal");
    if (fuelElem) fuelElem.textContent = `Rp ${fuelCostJuta} Jt`;

    const awdPump = document.getElementById("awdPumpCount");
    if (awdPump) awdPump.textContent = pumpUnits;

    const awdFuel = document.getElementById("awdFuelCost");
    if (awdFuel) awdFuel.textContent = `Rp ${fuelCostJuta} Jt`;

    const adviceElem = document.getElementById("irrigationAdviceText");
    if (adviceElem) {
        if (riskScore >= 0.70) {
            adviceElem.textContent = `Mendesak: Pasang ${pumpUnits} unit pompa darurat di titik sumur/embung primer. Terapkan irigasi malam hari berselang (AWD) dan tunda pemupukan kering.`;
        } else if (riskScore >= 0.45) {
            adviceElem.textContent = `Waspada: Rotasi pembukaan pintu air tersier setiap 3 hari. Gunakan mulsa jerami sisa panen untuk menekan laju penguapan tanah.`;
        } else {
            adviceElem.textContent = `Kondisi Terkendali (Risiko Regional Rendah z=0.374): Pertahankan tinggi muka air berselang (AWD) 2-3 cm dan pantau anomali suhu LST.`;
        }
    }

    const autpBadge = document.getElementById("autpEligibilityBadge");
    const autpDesc = document.getElementById("autpEligibilityDesc");
    const autpPayout = document.getElementById("autpPayoutVal");

    if (autpBadge && autpDesc && autpPayout) {
        if (isEligibleAUTP) {
            autpBadge.textContent = "MEMENUHI SYARAT KLAIM";
            autpBadge.style.color = "#15803d";
            autpDesc.textContent = `Tingkat kerusakan lahan (${lossPct.toFixed(1)}%) telah melampaui ambang batas syarat AUTP (≥75%). Petani berhak mengajukan santunan.`;
            autpPayout.textContent = `Rp ${(landArea * 6000000).toLocaleString('id-ID')}`;
        } else {
            autpBadge.textContent = "BELUM MEMENUHI AMBANG";
            autpBadge.style.color = "#d97706";
            autpDesc.textContent = `Tingkat kehilangan hasil (${lossPct.toFixed(1)}%) masih di bawah ambang batas legal AUTP (75%). Prioritaskan tindakan pompa darurat.`;
            autpPayout.textContent = `Rp ${(landArea * 6000000).toLocaleString('id-ID')} (Potensi Maks)`;
        }
    }

    // Sync Risk Level Badge
    const riskBadge = document.getElementById("riskLevelBadge");
    if (riskBadge) {
        if (riskScore >= 0.70) {
            riskBadge.textContent = "Fase Kritis (D3)";
            riskBadge.className = "status-pill warning";
            riskBadge.style.color = "#b45309";
            riskBadge.style.backgroundColor = "#fef3c7";
        } else if (riskScore >= 0.45) {
            riskBadge.textContent = "Fase Waspada (D2)";
            riskBadge.className = "status-pill warning";
            riskBadge.style.color = "#d97706";
            riskBadge.style.backgroundColor = "#fffbeb";
        } else {
            riskBadge.textContent = "Fase Aman (D0-D1)";
            riskBadge.className = "status-pill safe";
            riskBadge.style.color = "#15803d";
            riskBadge.style.backgroundColor = "#dcfce7";
        }
    }
}

function bindEvents() {
    const sel = document.getElementById("kecamatanSelect");
    if (sel) {
        sel.addEventListener("change", (e) => {
            updateDashboard(e.target.value);
        });
    }

    // Zoom buttons for leaflet map
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

    const btnResetView = document.getElementById("btnResetView");
    if (btnResetView) {
        btnResetView.addEventListener("click", () => {
            if (map) {
                const wonogiriBounds = L.latLngBounds([
                    [-8.25, 110.70],
                    [-7.70, 111.35]
                ]);
                map.fitBounds(wonogiriBounds, { padding: [25, 25], animate: true });
            }
        });
    }

    const btnFullscreenMap = document.getElementById("btnFullscreenMap");
    if (btnFullscreenMap) {
        btnFullscreenMap.addEventListener("click", () => {
            const mapSection = document.querySelector(".hero-map-section");
            if (mapSection) {
                mapSection.classList.toggle("fullscreen-map");
                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 150);
            }
        });
    }

    // Layer buttons
    document.querySelectorAll(".layer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".layer-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const layerKey = btn.dataset.layer;
            activeLayerMode = layerKey;

            const legBar = document.getElementById("heatmapLegendBar");

            if (layerKey === "heat-vuln" || layerKey === "heat-lst" || layerKey === "heat-ndvi") {
                if (currentTileLayer) {
                    map.removeLayer(currentTileLayer);
                }
                currentTileLayer = L.tileLayer(TILE_LAYERS.satellite, { maxZoom: 18 }).addTo(map);
                renderHeatmapLayer(layerKey);
            } else {
                if (heatLayer) {
                    map.removeLayer(heatLayer);
                    heatLayer = null;
                }
                if (legBar) legBar.style.display = "none";

                if (currentTileLayer) {
                    map.removeLayer(currentTileLayer);
                }
                const tileUrl = layerKey === "osm" ? TILE_LAYERS.osm : TILE_LAYERS.satellite;
                currentTileLayer = L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);
            }
        });
    });

    // Print
    const btnPrint = document.getElementById("btnExportReport");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
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

    // Detail Tabs Header Switching
    document.querySelectorAll(".detail-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".detail-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const targetId = btn.dataset.tabTarget;
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add("active");
            }
            if (targetId === "tab-trajectory" && trajectoryChart) {
                setTimeout(() => { trajectoryChart.resize(); }, 50);
            }
        });
    });
}
