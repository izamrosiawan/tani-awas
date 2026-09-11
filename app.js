let appData = {};
let currentKec = "Kecamatan Karanganyar (Demak)";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resp = await fetch("data.json?v=20260911_07");
        appData = await resp.json();
        populateKecamatanSelect();
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

function updateDashboard(kec) {
    currentKec = kec;
    const item = appData[kec];
    if (!item) return;

    // 1. Left micro-KPI values
    const kpiVeg = document.getElementById("kpiVegCover");
    if (kpiVeg) kpiVeg.innerHTML = `${Math.round(item.ndvi * 100)}<span class="val-unit">%</span>`;

    const kpiCanopy = document.getElementById("kpiCanopyHealth");
    if (kpiCanopy) kpiCanopy.innerHTML = `${Math.round(Math.max(30, 100 - (item.risk_score * 75)))}<span class="val-unit">%</span>`;

    const kpiSoil = document.getElementById("kpiSoilMoisture");
    if (kpiSoil) kpiSoil.innerHTML = `${Math.round(Math.min(95, item.rain_mm * 1.8 + 25))}<span class="val-unit">%</span>`;

    const kpiLand = document.getElementById("kpiLandMonitored");
    if (kpiLand) kpiLand.textContent = `${(item.land_area_ha / 10).toFixed(1)}K`;

    const kpiPump = document.getElementById("kpiPumpVolume");
    if (kpiPump) kpiPump.textContent = Math.round(item.rain_mm * 14 + 50);

    const kpiSurplus = document.getElementById("kpiYieldSurplus");
    if (kpiSurplus) kpiSurplus.innerHTML = `${Math.round(Math.max(25, 85 - (item.risk_score * 40)))}<span class="val-unit">%</span>`;

    // 2. Right snapshot 4-col values
    const snapRisk = document.getElementById("snapRiskScoreVal");
    if (snapRisk) snapRisk.textContent = `$${(1.2 + item.risk_score).toFixed(2)}M`;

    const snapNdvi = document.getElementById("snapNdviVal");
    if (snapNdvi) snapNdvi.textContent = `${Math.round(item.ndvi * 100)}%`;

    const snapRain = document.getElementById("snapRainVal");
    if (snapRain) snapRain.textContent = Math.round(item.rain_mm * 42 + 500).toLocaleString();

    const snapTemp = document.getElementById("snapTempVal");
    if (snapTemp) snapTemp.textContent = `+${(item.lst_c / 10).toFixed(1)}%`;

    // 3. Right transaction strip
    const txLand = document.getElementById("txLandHa");
    if (txLand) txLand.textContent = `$${Math.round(item.land_area_ha * 75).toLocaleString()}`;

    const txLoss = document.getElementById("txLossTon");
    if (txLoss) txLoss.textContent = `$${Math.round(item.land_area_ha * 64).toLocaleString()}`;

    const txRp = document.getElementById("txLossRp");
    if (txRp) txRp.textContent = `$${Math.round(item.land_area_ha * 42).toLocaleString()}`;

    const txAutp = document.getElementById("txAutpPayout");
    if (txAutp) txAutp.textContent = `$${Math.round(item.land_area_ha * 31).toLocaleString()}`;

    // 4. Donut Confidence
    const donutVal = document.getElementById("donutCenterVal");
    if (donutVal) donutVal.textContent = `${Math.round(Math.max(65, 95 - (item.risk_score * 30)))}%`;
}

function bindEvents() {
    const sel = document.getElementById("kecamatanSelect");
    if (sel) {
        sel.addEventListener("change", (e) => {
            updateDashboard(e.target.value);
        });
    }

    // Nav pills
    document.querySelectorAll(".nav-pill-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-pill-item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Zoom buttons
    const btnZoomIn = document.getElementById("btnZoomIn");
    const fpImg = document.querySelector(".floorplan-cutout-img");
    let currentScale = 1.0;

    if (btnZoomIn && fpImg) {
        btnZoomIn.addEventListener("click", () => {
            currentScale = Math.min(1.4, currentScale + 0.1);
            fpImg.style.transform = `scale(${currentScale})`;
            fpImg.style.transition = "transform 0.3s ease";
        });
    }

    const btnZoomOut = document.getElementById("btnZoomOut");
    if (btnZoomOut && fpImg) {
        btnZoomOut.addEventListener("click", () => {
            currentScale = Math.max(0.8, currentScale - 0.1);
            fpImg.style.transform = `scale(${currentScale})`;
            fpImg.style.transition = "transform 0.3s ease";
        });
    }

    // Print
    const btnPrint = document.getElementById("btnExportReport");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            window.print();
        });
    }
}
