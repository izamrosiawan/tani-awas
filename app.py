import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(
    page_title="Tani-Awas: Early Warning System Kekeringan Pertanian",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Clean, Professional Dark/Monochrome with Emerald Accent)
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #10b981;
        margin-bottom: 0px;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #94a3b8;
        margin-bottom: 25px;
    }
    .metric-card {
        background-color: #1e293b;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #334155;
        margin-bottom: 12px;
    }
    .status-badge-red {
        background-color: #ef4444;
        color: white;
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: bold;
        font-size: 0.9rem;
    }
    .status-badge-yellow {
        background-color: #eab308;
        color: black;
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: bold;
        font-size: 0.9rem;
    }
    .status-badge-green {
        background-color: #10b981;
        color: white;
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: bold;
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)

# Load dataset
@st.cache_data
def load_data():
    return pd.read_csv("data/agridrought_monitoring_data.csv")

df = load_data()

# Header
st.markdown('<div class="main-title">🌾 Tani-Awas: AgriDrought Early Warning System</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Sistem Prediksi Dini Risiko Kekeringan Lahan Pertanian Berbasis Citra Satelit (Sentinel-2 NDVI) & Data Iklim BMKG</div>', unsafe_allow_html=True)

# Sidebar: Input Parameter
st.sidebar.header("🕹️ Parameter Masukan Wilayah")

kecamatan_options = sorted(df['kecamatan'].unique())
selected_kecamatan = st.sidebar.selectbox("Pilih Wilayah Kecamatan:", kecamatan_options, index=0)

commodity = st.sidebar.radio("Komoditas Utama:", ["Padi Sawah", "Jagung"])
land_area = st.sidebar.slider("Luas Lahan Terancam (Hektar):", min_value=10, max_value=1000, value=250, step=10)

st.sidebar.subheader("🛰️ Sensor Satelit & Cuaca")
ndvi_input = st.sidebar.slider("Indeks Vegetasi NDVI (Sentinel-2):", min_value=0.10, max_value=0.90, value=0.32, step=0.01,
                              help="0.10 = Kering Ekstrem / Bera; 0.35 = Stres Air; 0.70+ = Vegetasi Sangat Sehat")
rainfall_input = st.sidebar.slider("Akumulasi Curah Hujan BMKG (mm/minggu):", min_value=0.0, max_value=80.0, value=18.0, step=1.0)
lst_input = st.sidebar.slider("Suhu Permukaan Lahan / LST (°C):", min_value=25.0, max_value=40.0, value=33.5, step=0.5)

price_per_kg = st.sidebar.number_input("Harga Komoditas Acuan (Rp/kg):", value=6500 if commodity == "Padi Sawah" else 5200, step=100)

# Formula Perhitungan Risiko
risk_score = round(0.50 * (1.0 - (ndvi_input / 0.85)) + 0.35 * (1.0 - (rainfall_input / 60.0)) + 0.15 * ((lst_input - 28.0) / 7.0), 3)
risk_score = max(0.05, min(0.98, risk_score))

if risk_score >= 0.70:
    status_label = "BAHAYA (TINGGI)"
    status_class = "status-badge-red"
    yield_loss_pct = round(risk_score * 58.0, 1)
elif risk_score >= 0.45:
    status_label = "WASPADA (SEDANG)"
    status_class = "status-badge-yellow"
    yield_loss_pct = round(risk_score * 35.0, 1)
else:
    status_label = "AMAN (RENDAH)"
    status_class = "status-badge-green"
    yield_loss_pct = round(risk_score * 12.0, 1)

prod_normal_ton_ha = 6.0 if commodity == "Padi Sawah" else 7.5
total_prod_normal_ton = land_area * prod_normal_ton_ha
lost_prod_ton = round(total_prod_normal_ton * (yield_loss_pct / 100.0), 1)
est_financial_loss_rp = round(lost_prod_ton * 1000 * price_per_kg)
est_financial_loss_million = round(est_financial_loss_rp / 1e6, 2)

# Metric Row
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(label="Skor Risiko Kekeringan", value=f"{risk_score:.3f} / 1.00", delta=f"{status_label}")
with col2:
    st.metric(label="Potensi Kehilangan Panen", value=f"{yield_loss_pct}%", delta=f"-{lost_prod_ton} Ton", delta_color="inverse")
with col3:
    st.metric(label="Estimasi Kerugian Finansial", value=f"Rp{est_financial_loss_million:,.1f} Juta", delta="Potensi Defisit", delta_color="inverse")
with col4:
    st.metric(label="Horizon Prediksi", value="2 - 4 Minggu", delta="Lead Time Taktis")

st.divider()

# Tab Layout
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Ringkasan Eksekutif & Gauge",
    "🗺️ Analisis Spasial & Tren Wilayah",
    "💰 Kalkulator Dampak Finansial",
    "🤖 Rekomendasi Protokol Mitigasi AI"
])

with tab1:
    st.subheader(f"Status Pemantauan: {selected_kecamatan}")
    c1, c2 = st.columns([1, 2])
    with c1:
        st.write(f"### Status Tingkat Bahaya:")
        st.markdown(f'<span class="{status_class}">{status_label}</span>', unsafe_allow_html=True)
        st.write("")
        st.write(f"**Indeks NDVI Terkini:** `{ndvi_input}` (Status: {'Stres Air Parah' if ndvi_input < 0.35 else 'Normal'})")
        st.write(f"**Curah Hujan BMKG:** `{rainfall_input} mm/minggu` (Status: {'Defisit Kritis' if rainfall_input < 20 else 'Mencukupi'})")
        st.write(f"**Suhu Permukaan Lahan:** `{lst_input} °C`")
    with c2:
        fig, ax = plt.subplots(figsize=(7, 2.8))
        categories = ['Rendah (Aman)', 'Sedang (Waspada)', 'Tinggi (Bahaya)']
        ax.barh(['Tingkat Risiko'], [0.45], color='#10b981', label='Aman (< 0.45)')
        ax.barh(['Tingkat Risiko'], [0.25], left=[0.45], color='#eab308', label='Waspada (0.45-0.70)')
        ax.barh(['Tingkat Risiko'], [0.30], left=[0.70], color='#ef4444', label='Bahaya (>= 0.70)')
        ax.scatter([risk_score], [0], color='black', s=180, zorder=5, label=f'Skor Anda: {risk_score:.2f}')
        ax.set_xlim(0, 1.0)
        ax.set_title("Gauge Skala Risiko Kekeringan Pertanian", fontsize=11, fontweight='bold')
        ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.65), ncol=4, frameon=False, fontsize=8)
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

with tab2:
    st.subheader("Tren Historis Pemantauan 12 Minggu Terakhir")
    kec_data = df[df['kecamatan'] == selected_kecamatan].sort_values('week')
    
    fig, ax1 = plt.subplots(figsize=(10, 4))
    ax2 = ax1.twinx()
    
    ax1.plot(kec_data['week'], kec_data['ndvi_sentinel2'], color='#10b981', marker='o', linewidth=2, label='NDVI Sentinel-2')
    ax2.bar(kec_data['week'], kec_data['curah_hujan_bmkg_mm'], color='#3b82f6', alpha=0.35, width=0.5, label='Curah Hujan BMKG (mm)')
    
    ax1.set_xlabel('Minggu Pemantauan')
    ax1.set_ylabel('Nilai NDVI', color='#10b981')
    ax2.set_ylabel('Curah Hujan (mm)', color='#3b82f6')
    ax1.set_title(f'Trajektori Indeks Vegetasi vs Curah Hujan di {selected_kecamatan}', fontweight='bold')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

with tab3:
    st.subheader("Rincian Estimasi Dampak Kehilangan Hasil Panen & Finansial")
    st.markdown(f"""
    * **Formula Kerugian Finansial:**  
      $$\\text{{Total Kerugian (Rp)}} = \\text{{Luas Lahan ({land_area} Ha)}} \\times \\text{{Produksi ({prod_normal_ton_ha} Ton/Ha)}} \\times \\text{{Penurunan ({yield_loss_pct}\\%)}} \\times \\text{{Harga (Rp{price_per_kg:,}/kg)}}$$
    """)
    
    calc_df = pd.DataFrame([{
        "Parameter": "Produksi Normal (100%)",
        "Volume (Ton)": f"{total_prod_normal_ton:,.1f} Ton",
        "Nilai Valuasi (Rupiah)": f"Rp{(total_prod_normal_ton * 1000 * price_per_kg):,.0f}"
    }, {
        "Parameter": "Proyeksi Kehilangan Panen",
        "Volume (Ton)": f"-{lost_prod_ton:,.1f} Ton",
        "Nilai Valuasi (Rupiah)": f"-Rp{est_financial_loss_rp:,.0f}"
    }, {
        "Parameter": "Proyeksi Sisa Hasil Panen Selamat",
        "Volume (Ton)": f"{(total_prod_normal_ton - lost_prod_ton):,.1f} Ton",
        "Nilai Valuasi (Rupiah)": f"Rp{((total_prod_normal_ton - lost_prod_ton) * 1000 * price_per_kg):,.0f}"
    }])
    st.dataframe(calc_df, use_container_width=True, hide_index=True)

with tab4:
    st.subheader("📋 Rekomendasi Aksi Taktis Per Minggu (Petani & Dinas Pertanian)")
    
    if risk_score >= 0.70:
        st.error(f"⚠️ WILAYAH BERSTATUS BAHAYA TINGGI (Skor Risiko: {risk_score:.2f})")
    elif risk_score >= 0.45:
        st.warning(f"⚡ WILAYAH BERSTATUS WASPADA SEDANG (Skor Risiko: {risk_score:.2f})")
    else:
        st.success(f"✅ WILAYAH BERSTATUS AMAN (Skor Risiko: {risk_score:.2f})")
        
    col_a, col_b = st.columns(2)
    with col_a:
        st.write("#### 👨‍🌾 Panduan Taktis Petani:")
        st.markdown("""
        * **Minggu 1 (Manajemen Air Segera):** Beralih dari penggenangan kontinu ke sistem irigasi berselang (*intermittent irrigation*). Pastikan air hanya membasahi parit saat malam hari.
        * **Minggu 2 (Perlindungan Evaporasi):** Tutup permukaan bedengan dengan jerami padi (*organic mulching*) untuk mengurangi laju penguapan air tanah.
        * **Minggu 3 (Nutrisi Anti-Stres):** Berikan semprotan pupuk daun berkandungan kalium tinggi untuk membantu penutupan stomata dan menahan dehidrasi sel tanaman.
        * **Minggu 4 (Opsi Panen Dini):** Jika tanaman sudah fase matang fisiologis (>80%), lakukan panen lebih awal untuk menghindari gabah hampa total.
        """)
    with col_b:
        st.write("#### 🏛️ Rekomendasi Dinas Pertanian:")
        st.markdown("""
        * **Minggu 1:** Mobilisasi pompa air bergerak (*mobile water pump*) dari dinas ke titik-titik sumur dangkal / embung terdekat.
        * **Minggu 2:** Rekayasa pembagian debit pintu air sekunder secara proporsional dengan mengutamakan petak sawah yang sedang bunting/berbunga.
        * **Minggu 3:** Tingkatkan intensitas pemantauan hama wereng batang coklat yang rentan meledak populasinya saat suhu mikroklimat tanah naik.
        * **Minggu 4:** Lakukan verifikasi lapangan bersama petugas PPL untuk aktivasi klaim proteksi **Asuransi Usaha Tani Padi (AUTP)** bagi lahan terdampak puso.
        """)

st.caption("Tani-Awas: Spatial-Data Science & Remote Sensing Agricultural Early Warning System.")
