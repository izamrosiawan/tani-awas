import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

interface RegionRecord {
  coords: [number, number];
  commodity: string;
  land_area_ha: number;
  ndvi: number;
  rain_mm: number;
  lst_c: number;
  risk_score: number;
  status: string;
  loss_pct: number;
  loss_ton: number;
  loss_million_rp: number;
  history: {
    weeks: number[];
    ndvi: number[];
    rain: number[];
    risk: number[];
  };
}

const REGION_REGISTRY: Record<string, RegionRecord> = {
  "Kecamatan Karanganyar (Demak)": {
    coords: [-6.8944, 110.6385],
    commodity: "Padi Sawah (IR-64)",
    land_area_ha: 250.0,
    ndvi: 0.341,
    rain_mm: 12.1,
    lst_c: 34.2,
    risk_score: 0.712,
    status: "TINGGI (MERAH)",
    loss_pct: 41.3,
    loss_ton: 619.5,
    loss_million_rp: 4026.75,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.614, 0.600, 0.539, 0.550, 0.530, 0.463, 0.450, 0.404, 0.395, 0.371, 0.348, 0.341],
      rain: [58.0, 41.1, 48.3, 30.5, 29.4, 26.7, 22.3, 18.1, 21.8, 14.5, 3.5, 12.1],
      risk: [0.176, 0.281, 0.294, 0.409, 0.418, 0.490, 0.537, 0.592, 0.580, 0.644, 0.732, 0.712],
    },
  },
  "Kecamatan Gajah (Demak)": {
    coords: [-6.8521, 110.7021],
    commodity: "Padi & Jagung",
    land_area_ha: 310.0,
    ndvi: 0.343,
    rain_mm: 9.0,
    lst_c: 33.6,
    risk_score: 0.716,
    status: "TINGGI (MERAH)",
    loss_pct: 41.5,
    loss_ton: 778.12,
    loss_million_rp: 4046.22,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.610, 0.590, 0.538, 0.548, 0.513, 0.499, 0.460, 0.408, 0.391, 0.361, 0.320, 0.343],
      rain: [55.0, 39.0, 45.0, 28.0, 26.0, 24.0, 20.0, 16.0, 19.0, 12.0, 4.0, 9.0],
      risk: [0.182, 0.288, 0.302, 0.420, 0.435, 0.505, 0.551, 0.608, 0.615, 0.665, 0.741, 0.716],
    },
  },
  "Kecamatan Kebumen (Kebumen)": {
    coords: [-7.6713, 109.6542],
    commodity: "Padi Organik",
    land_area_ha: 180.0,
    ndvi: 0.299,
    rain_mm: 3.2,
    lst_c: 36.2,
    risk_score: 0.785,
    status: "TINGGI (MERAH)",
    loss_pct: 45.5,
    loss_ton: 491.4,
    loss_million_rp: 3194.1,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.650, 0.620, 0.570, 0.520, 0.480, 0.430, 0.390, 0.350, 0.330, 0.315, 0.305, 0.299],
      rain: [62.0, 48.0, 40.0, 28.0, 22.0, 17.0, 13.0, 9.0, 7.0, 5.0, 2.0, 3.2],
      risk: [0.140, 0.220, 0.310, 0.430, 0.510, 0.580, 0.640, 0.710, 0.740, 0.760, 0.810, 0.785],
    },
  },
  "Kecamatan Prembun (Kebumen)": {
    coords: [-7.7011, 109.8012],
    commodity: "Padi Sawah",
    land_area_ha: 220.0,
    ndvi: 0.412,
    rain_mm: 22.5,
    lst_c: 31.8,
    risk_score: 0.488,
    status: "SEDANG (KUNING)",
    loss_pct: 17.1,
    loss_ton: 225.72,
    loss_million_rp: 1467.18,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.640, 0.620, 0.600, 0.570, 0.550, 0.520, 0.490, 0.470, 0.450, 0.435, 0.420, 0.412],
      rain: [60.0, 52.0, 48.0, 42.0, 38.0, 34.0, 30.0, 28.0, 26.0, 24.0, 23.0, 22.5],
      risk: [0.150, 0.180, 0.220, 0.260, 0.300, 0.340, 0.380, 0.410, 0.440, 0.460, 0.480, 0.488],
    },
  },
  "Kecamatan Jatibarang (Indramayu)": {
    coords: [-6.4719, 108.3128],
    commodity: "Padi Sawah (Ciherang)",
    land_area_ha: 420.0,
    ndvi: 0.288,
    rain_mm: 4.8,
    lst_c: 36.5,
    risk_score: 0.812,
    status: "TINGGI (MERAH)",
    loss_pct: 47.1,
    loss_ton: 1186.92,
    loss_million_rp: 7714.98,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.680, 0.630, 0.570, 0.500, 0.450, 0.400, 0.360, 0.330, 0.310, 0.295, 0.290, 0.288],
      rain: [65.0, 45.0, 32.0, 20.0, 15.0, 12.0, 9.0, 7.0, 6.0, 4.0, 1.5, 4.8],
      risk: [0.120, 0.230, 0.350, 0.480, 0.560, 0.640, 0.700, 0.750, 0.780, 0.810, 0.830, 0.812],
    },
  },
  "Kecamatan Mojosari (Mojokerto)": {
    coords: [-7.5312, 112.5512],
    commodity: "Padi & Jagung",
    land_area_ha: 280.0,
    ndvi: 0.465,
    rain_mm: 31.0,
    lst_c: 30.5,
    risk_score: 0.365,
    status: "RENDAH (HIJAU)",
    loss_pct: 5.1,
    loss_ton: 85.68,
    loss_million_rp: 556.92,
    history: {
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ndvi: [0.670, 0.650, 0.630, 0.610, 0.580, 0.560, 0.530, 0.510, 0.490, 0.480, 0.470, 0.465],
      rain: [68.0, 58.0, 52.0, 46.0, 42.0, 39.0, 36.0, 34.0, 33.0, 32.0, 31.5, 31.0],
      risk: [0.110, 0.140, 0.170, 0.210, 0.240, 0.280, 0.310, 0.330, 0.345, 0.355, 0.360, 0.365],
    },
  },
};

function Index() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const tileLayerRef = useRef<any>(null);
  const radarLayerRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<"satellite" | "radar">("satellite");

  const [selectedKec, setSelectedKec] = useState<string>("Kecamatan Karanganyar (Demak)");
  const [activeTab, setActiveTab] = useState<"overview" | "mitigasi" | "autp">("overview");
  const drawerRef = useRef<HTMLElement>(null);

  // Calibrator slider values
  const [landArea, setLandArea] = useState<number>(250);
  const [ndvi, setNdvi] = useState<number>(0.34);
  const [rain, setRain] = useState<number>(12.1);
  const [lst, setLst] = useState<number>(34.2);

  // Sync sliders when dropdown changes
  const handleSelectKec = (kecName: string) => {
    setSelectedKec(kecName);
    const item = REGION_REGISTRY[kecName];
    if (item) {
      setLandArea(item.land_area_ha);
      setNdvi(item.ndvi);
      setRain(item.rain_mm);
      setLst(item.lst_c);
    }
  };

  // Empirical Bio-Physical Mathematical Model (Reproducible, deterministic)
  const calc = useMemo(() => {
    const ndviRatio = Math.max(0, 1.0 - ndvi / 0.85);
    const rainRatio = Math.max(0, 1.0 - rain / 60.0);
    const lstRatio = Math.max(0, (lst - 28.0) / 7.0);

    const riskScore = Math.max(
      0.05,
      Math.min(0.98, 0.50 * ndviRatio + 0.35 * rainRatio + 0.15 * lstRatio)
    );

    let lossPct = riskScore * 58.0;
    if (riskScore < 0.45) {
      lossPct = riskScore * 14.0;
    } else if (riskScore < 0.70) {
      lossPct = riskScore * 35.0;
    }

    const safeYieldPct = Math.max(10, Math.min(98, 100.0 - lossPct));
    const prodNormalTonHa = 6.0;
    const pricePerKg = 6500;
    const totalNormalTon = landArea * prodNormalTonHa;
    const lostTon = totalNormalTon * (lossPct / 100.0);
    const lossRpMiliar = ((lostTon * 1000 * pricePerKg) / 1e9).toFixed(2);

    // AWD Hydrologic Model:
    // Evapotranspiration demand = 55 mm/week. Water deficit = max(0, 55 - rain).
    const waterDeficitMm = Math.max(5.0, 55.0 - rain);
    const totalWaterM3 = Math.round(landArea * waterDeficitMm * 10);
    const pumpUnits = Math.max(1, Math.ceil(totalWaterM3 / 2250)); // 45 m3/h * 50 h
    const fuelLiters = pumpUnits * 50 * 3.2; // 3.2 L/h
    const fuelCostJuta = ((fuelLiters * 6800) / 1e6).toFixed(1);

    // AUTP Claim Threshold (Kementan & Jasindo: >= 75% puso damage)
    const autpDamagePct = Math.min(100, Math.round(lossPct * 1.85));
    const autpEligible = autpDamagePct >= 75;
    const autpPayoutMiliar = autpEligible
      ? ((landArea * 6_000_000) / 1e9).toFixed(2)
      : "0.00";

    return {
      riskScore,
      lossPct,
      safeYieldPct,
      lostTon,
      lossRpMiliar,
      waterDeficitMm,
      totalWaterM3,
      pumpUnits,
      fuelCostJuta,
      autpDamagePct,
      autpEligible,
      autpPayoutMiliar,
    };
  }, [ndvi, rain, lst, landArea]);

    const activeRegion = REGION_REGISTRY[selectedKec] || REGION_REGISTRY["Kecamatan Karanganyar (Demak)"];

  // Initialize and mount interactive Leaflet Map
  useEffect(() => {
    let isMounted = true;
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const loadLeaflet = async () => {
      // Load Leaflet dynamically on client-side to prevent SSR window reference errors
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;
      const L = (window as any).L;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          center: activeRegion.coords,
          zoom: 13,
        });

        // High-Resolution Esri World Imagery (Satellite)
        const satelliteTiles = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18, attribution: "Esri World Imagery" }
        ).addTo(map);

        tileLayerRef.current = satelliteTiles;
        mapInstanceRef.current = map;

        // Render Agricultural Region Markers with interactive tooltips
        Object.entries(REGION_REGISTRY).forEach(([name, reg]) => {
          const color = reg.risk_score >= 0.70 ? "#d97706" : reg.risk_score >= 0.45 ? "#f59e0b" : "#15803d";
          const marker = L.circleMarker(reg.coords, {
            radius: name === selectedKec ? 12 : 9,
            fillColor: color,
            color: name === selectedKec ? "#1c211e" : "#ffffff",
            weight: name === selectedKec ? 3 : 2,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(map);

          marker.bindTooltip(
            `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
              <strong style="color: #1c211e; font-size: 13px;">${name}</strong><br/>
              <span style="color: #727a70;">Komoditas:</span> ${reg.commodity}<br/>
              <span style="color: #727a70;">Luas:</span> ${reg.land_area_ha} Ha<br/>
              <span style="color: #727a70;">Skor Risiko:</span> <strong style="color: ${color}; font-family: 'JetBrains Mono', monospace;">${reg.risk_score.toFixed(3)}</strong>
            </div>`,
            { className: "custom-leaflet-tooltip", permanent: false, direction: "top" }
          );

          marker.on("click", () => {
            setSelectedKec(name);
          });

          markersRef.current[name] = marker;
        });
        // Ensure tiles are correctly measured and rendered without grey borders
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 250);
      }
    };

    loadLeaflet();

    return () => {
      // Keep map alive across standard re-renders
    };
  }, []);

  // Sync map center and zoom when selectedKec changes
  useEffect(() => {
    if (mapInstanceRef.current && activeRegion?.coords) {
      mapInstanceRef.current.flyTo(activeRegion.coords, 13, { duration: 1.0 });
      Object.entries(markersRef.current).forEach(([name, marker]) => {
        if (name === selectedKec) {
          marker.setStyle({ weight: 3, color: "#1c211e", radius: 12 });
          marker.openTooltip();
        } else {
          marker.setStyle({ weight: 2, color: "#ffffff", radius: 9 });
          marker.closeTooltip();
        }
      });
    }
  }, [selectedKec, activeRegion]);

  // Handle Layer Switch (Citra Satelit vs Radar Presipitasi)
  const handleLayerSwitch = (layer: "satellite" | "radar") => {
    setActiveLayer(layer);
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;

    if (layer === "satellite") {
      if (radarLayerRef.current) {
        mapInstanceRef.current.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      if (!tileLayerRef.current) {
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18 }
        ).addTo(mapInstanceRef.current);
      }
    } else {
      // RainViewer Real-Time Weather Radar Tile
      if (!radarLayerRef.current) {
        radarLayerRef.current = L.tileLayer(
          "https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png",
          { opacity: 0.75, maxZoom: 18 }
        ).addTo(mapInstanceRef.current);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };


  return (
    <div className="canvas-viewport">
      {/* 1. TOP FLOATING NAVIGATION CAPSULE */}
      <header className="top-floating-nav">
        <div className="nav-left-group">
          <div className="brand-badge">
            <div className="brand-sunburst-svg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm8-4a1 1 0 0 1 1 1v.01a1 1 0 0 1-2 0V12a1 1 0 0 1 1-1zM4 12a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1zm14.07-5.07a1 1 0 0 1 1.41 0l.01.01a1 1 0 0 1-1.42 1.41l-.01-.01a1 1 0 0 1 0-1.41zM5.93 16.66a1 1 0 0 1 1.41 0l.01.01a1 1 0 0 1-1.42 1.41l-.01-.01a1 1 0 0 1 0-1.41zm12.73 2.83a1 1 0 0 1 0-1.41l.01-.01a1 1 0 0 1 1.41 1.42l-.01.01a1 1 0 0 1-1.41-.01zM7.34 7.34a1 1 0 0 1 0-1.41l.01-.01a1 1 0 0 1 1.41 1.42l-.01.01a1 1 0 0 1-1.41-.01zM12 19a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <span className="brand-title">TANI-AWAS</span>
          </div>

          <nav className="nav-segment-pills">
            <button
              type="button"
              className={`segment-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("overview");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Overview</span>
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "mitigasi" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("mitigasi");
                drawerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Kalkulator AWD</span>
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "autp" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("autp");
                drawerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Klaim AUTP</span>
            </button>
          </nav>
        </div>

        <div className="nav-right-group">
          <div className="select-pill-box">
            <select
              value={selectedKec}
              onChange={(e) => handleSelectKec(e.target.value)}
              className="kec-select-input"
            >
              {Object.keys(REGION_REGISTRY).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="viewers-pill">
            <div className="avatar-stack">
              <span className="avatar-circle" style={{ background: "#fde68a" }}>DK</span>
              <span className="avatar-circle" style={{ background: "#fed7aa" }}>BM</span>
              <span className="avatar-circle" style={{ background: "#bbf7d0" }}>PO</span>
            </div>
            <span className="viewers-count-text">+2 Sentra Pantau</span>
          </div>

          <button type="button" className="nav-action-circle" title="Ekspor Laporan">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <button type="button" className="nav-action-circle user-pill" title="Petugas Pengamat">
            <span>IZ</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN ASYMMETRIC GRID */}
      <main className="main-dashboard-grid">
        {/* LEFT COLUMN: 2x3 Micro-KPI Matrix + Atmospheric Spatial Viewport */}
        <section className="left-hero-stack">
          {/* 2x3 Micro-KPI Matrix with Hairline Dividers */}
          <div className="micro-kpi-matrix">
            {/* 1. Vegetative Canopy */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">
                  {Math.round(ndvi * 100)}
                  <small>%</small>
                </span>
                <span className="kpi-badge warning">-4%</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polygon
                    points="0,40 8,34 16,30 24,24 32,28 40,20 48,26 56,18 64,22 72,14 80,18 88,30 96,38 100,40"
                    fill="rgba(217, 119, 6, 0.45)"
                  />
                  <polyline
                    points="0,40 8,34 16,30 24,24 32,28 40,20 48,26 56,18 64,22 72,14 80,18 88,30 96,38 100,40"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="kpi-desc">Kerapatan Kanopi (NDVI)</span>
            </div>

            {/* 2. Biomass Vigor */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">
                  {Math.round(Math.max(20, 100 - calc.riskScore * 75))}
                  <small>%</small>
                </span>
                <span className="kpi-badge danger">-8%</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <circle cx="8" cy="32" r="2" fill="#d97706" />
                  <circle cx="16" cy="28" r="2.5" fill="#f59e0b" />
                  <circle cx="26" cy="26" r="2" fill="#d97706" />
                  <circle cx="36" cy="22" r="2.8" fill="#f59e0b" />
                  <circle cx="46" cy="20" r="2.2" fill="#d97706" />
                  <circle cx="56" cy="18" r="2.6" fill="#f59e0b" />
                  <circle cx="66" cy="16" r="2.2" fill="#d97706" />
                  <circle cx="76" cy="14" r="3.0" fill="#f59e0b" />
                  <circle cx="86" cy="12" r="2.2" fill="#d97706" />
                  <circle cx="94" cy="8" r="2.5" fill="#f59e0b" />
                  <circle cx="22" cy="34" r="1.5" fill="rgba(217, 119, 6, 0.5)" />
                  <circle cx="48" cy="28" r="1.8" fill="rgba(217, 119, 6, 0.5)" />
                </svg>
              </div>
              <span className="kpi-desc">Vigor Kesehatan Tanaman</span>
            </div>

            {/* 3. Soil Moisture */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">
                  {Math.round(Math.min(95, rain * 1.8 + 20))}
                  <small>%</small>
                </span>
                <span className="kpi-badge warning">-5%</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <rect x="4" y="22" width="2" height="18" rx="1" fill="#f59e0b" />
                  <rect x="12" y="14" width="2" height="26" rx="1" fill="#d97706" />
                  <rect x="20" y="18" width="2" height="22" rx="1" fill="#f59e0b" />
                  <rect x="28" y="10" width="2" height="30" rx="1" fill="#d97706" />
                  <rect x="36" y="16" width="2" height="24" rx="1" fill="#f59e0b" />
                  <rect x="44" y="8" width="2" height="32" rx="1" fill="#d97706" />
                  <rect x="52" y="14" width="2" height="26" rx="1" fill="#f59e0b" />
                  <rect x="60" y="20" width="2" height="20" rx="1" fill="#d97706" />
                  <rect x="68" y="12" width="2" height="28" rx="1" fill="#f59e0b" />
                  <rect x="76" y="18" width="2" height="22" rx="1" fill="#d97706" />
                  <rect x="84" y="24" width="2" height="16" rx="1" fill="#f59e0b" />
                  <rect x="92" y="16" width="2" height="24" rx="1" fill="#d97706" />
                </svg>
              </div>
              <span className="kpi-desc">Saturasi Lengas Tanah</span>
            </div>

            {/* 4. Land Monitored */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">
                  {(landArea / 10).toFixed(1)}
                  <small>K</small>
                </span>
                <span className="kpi-badge neutral">Ha</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polygon points="6,28 94,10 94,36" fill="rgba(245, 158, 11, 0.45)" />
                  <path d="M94,10 A 30,30 0 0,1 94,36" stroke="#d97706" strokeWidth="2" fill="none" />
                  <circle cx="6" cy="28" r="3.5" fill="#d97706" />
                </svg>
              </div>
              <span className="kpi-desc">Hamparan Dipantau</span>
            </div>

            {/* 5. Discharge Volume */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">{calc.pumpUnits * 28}</span>
                <span className="kpi-badge safe">m³</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <rect x="10" y="16" width="3" height="14" rx="1.5" fill="#ffffff" opacity="0.9" />
                  <rect x="22" y="12" width="3" height="18" rx="1.5" fill="#f59e0b" />
                  <rect x="34" y="8" width="3" height="22" rx="1.5" fill="#ffffff" opacity="0.9" />
                  <rect x="46" y="4" width="3.5" height="28" rx="1.7" fill="#d97706" />
                  <rect x="58" y="8" width="3" height="22" rx="1.5" fill="#f59e0b" />
                  <rect x="70" y="12" width="3" height="18" rx="1.5" fill="#ffffff" opacity="0.9" />
                  <rect x="82" y="18" width="3" height="12" rx="1.5" fill="#d97706" />
                </svg>
              </div>
              <span className="kpi-desc">Debit Pompa Suplesi</span>
            </div>

            {/* 6. Crop Margin */}
            <div className="kpi-cell">
              <div className="kpi-cell-top">
                <span className="kpi-val">
                  {Math.round(calc.safeYieldPct)}
                  <small>%</small>
                </span>
                <span className="kpi-badge warning">Panen</span>
              </div>
              <div className="kpi-svg-canvas">
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polyline
                    points="6,10 34,10 34,22 66,22 66,32 94,32"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="68" y1="32" x2="68" y2="40" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" />
                  <line x1="74" y1="32" x2="74" y2="40" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" />
                  <line x1="80" y1="32" x2="80" y2="40" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" />
                  <line x1="86" y1="32" x2="86" y2="40" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" />
                  <line x1="92" y1="32" x2="92" y2="40" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="kpi-desc">Tingkat Panen Aman</span>
            </div>
          </div>

          {/* Interactive Geographic Spatial Viewport (Real Leaflet + Esri Satellite Tiles) */}
          <div className="map-spatial-viewport">
            <div className="map-head-overlay">
              <div className="sector-tag">
                <span className="sector-dot" />
                <span>{selectedKec}</span>
              </div>
              <div className="layer-pill-switch">
                <button
                  type="button"
                  className={`layer-btn ${activeLayer === "satellite" ? "active" : ""}`}
                  onClick={() => handleLayerSwitch("satellite")}
                >
                  Citra Satelit
                </button>
                <button
                  type="button"
                  className={`layer-btn ${activeLayer === "radar" ? "active" : ""}`}
                  onClick={() => handleLayerSwitch("radar")}
                >
                  Radar BMKG
                </button>
              </div>
            </div>

            {/* Real Interactive Leaflet Tile Map Canvas */}
            <div
              ref={mapContainerRef}
              className="map-actual-canvas"
              style={{
                position: "relative",
                zIndex: 1,
                minHeight: "360px",
                width: "100%",
                borderRadius: "16px",
              }}
            >
              {/* Floating Commodity & Area Badge on Map */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  zIndex: 999,
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: "9999px",
                  padding: "6px 14px",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1c211e",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#d97706",
                  }}
                />
                <span>
                  {activeRegion.commodity} • {landArea} Ha (GPS: {activeRegion.coords[0].toFixed(4)}, {activeRegion.coords[1].toFixed(4)})
                </span>
              </div>
            </div>

            {/* Working Interactive Zoom Pill (+ / -) */}
            <div className="map-zoom-capsule">
              <button
                type="button"
                className="zoom-action-btn"
                title="Perbesar"
                onClick={handleZoomIn}
              >
                +
              </button>
              <button
                type="button"
                className="zoom-action-btn"
                title="Perkecil"
                onClick={handleZoomOut}
              >
                −
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: FROSTED GLASS EDITORIAL INTELLIGENCE SHEET */}
        <section className="right-editorial-sheet">
          {/* 1. Agro-Climatic Snapshot */}
          <div className="sheet-title-group">
            <h2 className="sheet-h2">Agro-Climatic Snapshot</h2>
            <p className="sheet-subtext">
              Ringkasan pergerakan defisit kelembapan, kerapatan kanopi satelit, dan estimasi risiko panen pada hamparan sawah produktif.
            </p>
          </div>

          <div className="quad-snapshot-row">
            {/* 1. Risk Index Speedometer Arc */}
            <div className="quad-col">
              <div className="quad-visual-wrap">
                <svg width="68" height="38" viewBox="0 0 68 38">
                  <path d="M6,34 A28,28 0 0,1 62,34" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" strokeLinecap="round" />
                  <path
                    d="M6,34 A28,28 0 0,1 48,12"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <circle cx="34" cy="34" r="3.5" fill="#1c211e" />
                  <line x1="34" y1="34" x2="48" y2="16" stroke="#1c211e" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="quad-main-val">{calc.riskScore.toFixed(3)}</span>
              <span className="quad-foot-label">Risk Index</span>
            </div>

            {/* 2. Biomass NDVI Spider Radar */}
            <div className="quad-col">
              <div className="quad-visual-wrap">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <circle cx="24" cy="24" r="12" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="24" y1="4" x2="24" y2="44" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <line x1="4" y1="24" x2="44" y2="24" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  <polygon
                    points="24,8 38,16 34,40 14,36 10,18"
                    fill="rgba(245, 158, 11, 0.35)"
                    stroke="#d97706"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <span className="quad-main-val">{ndvi.toFixed(2)}</span>
              <span className="quad-foot-label">NDVI Kanopi</span>
            </div>

            {/* 3. Rainfall Deficit Bars */}
            <div className="quad-col">
              <div className="quad-visual-wrap">
                <svg width="60" height="38" viewBox="0 0 60 38">
                  <rect x="4" y="16" width="3.5" height="20" rx="1.5" fill="#f59e0b" />
                  <rect x="12" y="10" width="3.5" height="26" rx="1.5" fill="#d97706" />
                  <rect x="20" y="18" width="3.5" height="18" rx="1.5" fill="#f59e0b" />
                  <rect x="28" y="6" width="3.5" height="30" rx="1.5" fill="#d97706" />
                  <rect x="36" y="14" width="3.5" height="22" rx="1.5" fill="#f59e0b" />
                  <rect x="44" y="10" width="3.5" height="26" rx="1.5" fill="#d97706" />
                  <rect x="52" y="18" width="3.5" height="18" rx="1.5" fill="#f59e0b" />
                </svg>
              </div>
              <span className="quad-main-val">{rain.toFixed(1)} mm</span>
              <span className="quad-foot-label">Curah Hujan</span>
            </div>

            {/* 4. Thermal LST Map Silhouette */}
            <div className="quad-col">
              <div className="quad-visual-wrap">
                <svg width="60" height="38" viewBox="0 0 60 38" fill="#d97706">
                  <circle cx="16" cy="18" r="7" opacity="0.6" />
                  <circle cx="32" cy="16" r="9" opacity="0.85" />
                  <circle cx="48" cy="22" r="6" opacity="0.5" />
                  <circle cx="32" cy="16" r="2.5" fill="#dc2626" />
                </svg>
              </div>
              <span className="quad-main-val">{lst.toFixed(1)} °C</span>
              <span className="quad-foot-label">Suhu Permukaan</span>
            </div>
          </div>

          {/* 2. Multitemporal Deficit Trajectory */}
          <div className="sheet-title-group">
            <h2 className="sheet-h2">Multitemporal Deficit Trajectory</h2>
            <p className="sheet-subtext">
              Dinamika penurunan vegetasi dan anomali defisit hujan dalam 12 minggu pengamatan berturut-turut.
            </p>
          </div>

          <div className="trajectory-chart-container">
            <svg width="100%" height="100%" viewBox="0 0 400 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Spline Area */}
              <polygon
                points={activeRegion.history.ndvi
                  .map((v, i) => `${(i / 11) * 390 + 5},${120 - v * 150}`)
                  .join(" ") + " 395,125 5,125"}
                fill="url(#chartGrad)"
              />
              <polyline
                points={activeRegion.history.ndvi
                  .map((v, i) => `${(i / 11) * 390 + 5},${120 - v * 150}`)
                  .join(" ")}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
              />
              {/* BMKG rain dashed curve */}
              <polyline
                points={activeRegion.history.rain
                  .map((r, i) => `${(i / 11) * 390 + 5},${120 - (r / 65) * 95}`)
                  .join(" ")}
                fill="none"
                stroke="#15803d"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* 4 Transaction Metrics Strip */}
          <div className="transaction-quad-row">
            <div className="tx-metric-card">
              <span className="tx-card-label">🌾 Hamparan Lahan</span>
              <span className="tx-card-number">{Math.round(landArea)} Ha</span>
              <span className="tx-card-footnote">12 Petak Poktan</span>
            </div>

            <div className="tx-metric-card">
              <span className="tx-card-label">📉 Potensi Hilang</span>
              <span className="tx-card-number">{calc.lostTon.toFixed(1)} Ton</span>
              <span className="tx-card-footnote">{calc.lossPct.toFixed(1)}% Yield Loss</span>
            </div>

            <div className="tx-metric-card">
              <span className="tx-card-label">💰 Kerugian Petani</span>
              <span className="tx-card-number">Rp {calc.lossRpMiliar} M</span>
              <span className="tx-card-footnote">Acuan BPS GKP</span>
            </div>

            <div className="tx-metric-card">
              <span className="tx-card-label">🛡️ Klaim AUTP</span>
              <span className="tx-card-number">Rp {calc.autpPayoutMiliar} M</span>
              <span className="tx-card-footnote">
                {calc.autpEligible ? "Syarat Puso Terpenuhi" : "Status Pantau"}
              </span>
            </div>
          </div>

          {/* 3. Field Mitigation Readiness: Donut + Teeth Bars */}
          <div className="sheet-title-group">
            <h2 className="sheet-h2">Field Mitigation Readiness</h2>
            <p className="sheet-subtext">
              Kesiapan pengerahan pompa darurat AWD dan mitigasi lokal terhadap tingkat kekeringan lapangan.
            </p>
          </div>

          <div className="readiness-metrics-row">
            {/* Donut Gauge */}
            <div className="donut-visual-box">
              <div className="donut-svg-holder">
                <svg width="74" height="74" viewBox="0 0 74 74">
                  <circle cx="37" cy="37" r="30" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="7" />
                  <circle
                    cx="37"
                    cy="37"
                    r="30"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="7"
                    strokeDasharray="188"
                    strokeDashoffset="48"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="donut-center-metric">
                  <strong>74%</strong>
                  <span>Aman</span>
                </div>
              </div>
            </div>

            {/* 4 Teeth Frequency Bars */}
            <div className="teeth-metric-col">
              <span className="teeth-label">Pump AWD Capacity</span>
              <div className="teeth-bar-track">
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth" />
                <span className="tooth" />
              </div>
              <strong className="teeth-val-num">87%</strong>
            </div>

            <div className="teeth-metric-col">
              <span className="teeth-label">Embung Primary Head</span>
              <div className="teeth-bar-track">
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth" />
                <span className="tooth" />
                <span className="tooth" />
              </div>
              <strong className="teeth-val-num">83%</strong>
            </div>

            <div className="teeth-metric-col">
              <span className="teeth-label">AUTP Verification Fit</span>
              <div className="teeth-bar-track">
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth" />
              </div>
              <strong className="teeth-val-num">91%</strong>
            </div>

            <div className="teeth-metric-col">
              <span className="teeth-label">Subsidy Fuel Stock</span>
              <div className="teeth-bar-track">
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth on" />
                <span className="tooth" />
                <span className="tooth" />
                <span className="tooth" />
              </div>
              <strong className="teeth-val-num">85%</strong>
            </div>
          </div>
        </section>
      </main>

      {/* 3. OPERATIONAL DECISION TOOLS DRAWER */}
      <section ref={drawerRef} className="operational-tools-drawer">
        {/* Tool 1: Kalkulator Pompa AWD */}
        <div className="tool-sub-card">
          <div className="tool-card-head">
            <h3 className="tool-head-title">Kalkulator Pompa Air Darurat (AWD Engine)</h3>
            <span className="tool-head-badge">Real-Time</span>
          </div>
          <div className="tool-metrics-quad">
            <div className="tool-unit-box">
              <span className="unit-tag">Defisit Presipitasi</span>
              <strong className="unit-num">{calc.waterDeficitMm.toFixed(1)}</strong>
              <span className="unit-sub">mm / minggu</span>
            </div>
            <div className="tool-unit-box">
              <span className="unit-tag">Volume Kebutuhan</span>
              <strong className="unit-num">{calc.totalWaterM3.toLocaleString("id-ID")}</strong>
              <span className="unit-sub">m³ Lahan</span>
            </div>
            <div className="tool-unit-box">
              <span className="unit-tag">Kebutuhan Pompa (4")</span>
              <strong className="unit-num" style={{ color: "#d97706" }}>
                {calc.pumpUnits}
              </strong>
              <span className="unit-sub">Unit Aktif (50 Jam)</span>
            </div>
            <div className="tool-unit-box">
              <span className="unit-tag">Biaya Solar Subsidi</span>
              <strong className="unit-num">Rp {calc.fuelCostJuta} Jt</strong>
              <span className="unit-sub">Rp6.800 / liter</span>
            </div>
          </div>
          <div className="tool-banner-note">
            Alirkan air pada malam hari dengan metode macak-macak (AWD). Tunda pemupukan urea kering sampai kelembapan tanah kembali pulih.
          </div>
        </div>

        {/* Tool 2: Simulator Syarat AUTP */}
        <div className="tool-sub-card">
          <div className="tool-card-head">
            <h3 className="tool-head-title">Simulator Asuransi Usaha Tani Padi (AUTP)</h3>
            <span className="tool-head-badge">Kementan &amp; Jasindo</span>
          </div>
          <div className="tool-metrics-quad">
            <div className="tool-unit-box">
              <span className="unit-tag">Status Kelayakan</span>
              <strong
                className="unit-num"
                style={{
                  fontSize: "0.95rem",
                  color: calc.autpEligible ? "#15803d" : "#d97706",
                }}
              >
                {calc.autpEligible ? "MEMENUHI KLAIM" : "BELUM MEMENUHI"}
              </strong>
              <span className="unit-sub">Ambang Batas &ge; 75% Puso</span>
            </div>
            <div className="tool-unit-box">
              <span className="unit-tag">Plafon Santunan Legal</span>
              <strong className="unit-num">Rp 6.000.000</strong>
              <span className="unit-sub">Per Hektare Terdaftar</span>
            </div>
            <div className="tool-unit-box" style={{ gridColumn: "span 2" }}>
              <span className="unit-tag">Estimasi Nilai Santunan Kelompok Tani</span>
              <strong className="unit-num" style={{ color: "#15803d" }}>
                Rp {(parseFloat(calc.autpPayoutMiliar) * 1e9).toLocaleString("id-ID")}
              </strong>
              <span className="unit-sub">Hak Kompensasi Poktan Penerima</span>
            </div>
          </div>
          <div className="tool-banner-note">
            {calc.autpEligible
              ? "Tingkat kerusakan lahan telah melampaui ambang legal AUTP (75%). Segera ajukan formulir klaim melalui PPL dan dinas pertanian terkait."
              : "Tingkat kerusakan lahan masih di bawah ambang legal AUTP (75%). Segera kerahkan pompa darurat AWD untuk mencegah gagal panen total."}
          </div>
        </div>
      </section>

      {/* 4. SENSITIVITY CALIBRATOR SLIDER BAR */}
      <section className="calibrator-bar-section">
        <div className="calibrator-head">
          <strong>Simulasi Kalibrasi Lapangan:</strong>
          <span>Ubah parameter biofisik untuk menguji respons dinamika risiko &amp; kalkulator secara instan</span>
        </div>
        <div className="sliders-quad-grid">
          <div className="slider-item">
            <div className="slider-lbl-row">
              <span>Luas Lahan Terancam:</span>
              <strong>{landArea} Ha</strong>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={landArea}
              onChange={(e) => setLandArea(Number(e.target.value))}
            />
          </div>
          <div className="slider-item">
            <div className="slider-lbl-row">
              <span>Indeks Kanopi (NDVI):</span>
              <strong>{ndvi.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.01"
              value={ndvi}
              onChange={(e) => setNdvi(Number(e.target.value))}
            />
          </div>
          <div className="slider-item">
            <div className="slider-lbl-row">
              <span>Curah Hujan Mingguan:</span>
              <strong>{rain.toFixed(1)} mm</strong>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={rain}
              onChange={(e) => setRain(Number(e.target.value))}
            />
          </div>
          <div className="slider-item">
            <div className="slider-lbl-row">
              <span>Suhu Permukaan (LST):</span>
              <strong>{lst.toFixed(1)} °C</strong>
            </div>
            <input
              type="range"
              min="25.0"
              max="40.0"
              step="0.5"
              value={lst}
              onChange={(e) => setLst(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* 5. CLEAN SYSTEM FOOTER */}
      <footer className="app-bottom-footer">
        <span>
          <strong>Tani-Awas Platform</strong> • Sentinel-2 MSI Multi-Spectral &amp; BMKG Precipitation Integration
        </span>
        <span>Telkom University Surabaya • PIMTUS 2026</span>
      </footer>
    </div>
  );
}
