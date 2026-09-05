import os
import pandas as pd
import numpy as np

class AgriDroughtEngine:
    def __init__(self, random_state=42):
        self.random_state = random_state

    def load_and_clean_data(self, filepath):
        df = pd.read_csv(filepath)
        return df

    def calculate_kecamatan_summary(self, df):
        summary = df.groupby('kecamatan').agg({
            'drought_risk_score': 'mean',
            'ndvi_sentinel2': 'mean',
            'curah_hujan_bmkg_mm': 'mean',
            'kehilangan_produksi_ton': 'sum',
            'potensi_kerugian_juta_rp': 'sum'
        }).round(2)
        return summary
