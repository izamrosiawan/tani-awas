import os
import pytest
import pandas as pd
from src.drought_engine import AgriDroughtEngine

def test_agridrought_engine():
    engine = AgriDroughtEngine()
    df = engine.load_and_clean_data("data/agridrought_monitoring_data.csv")
    assert not df.empty
    assert 'drought_risk_score' in df.columns
    assert 'potensi_kerugian_juta_rp' in df.columns
    summary = engine.calculate_kecamatan_summary(df)
    assert not summary.empty
    assert 'potensi_kerugian_juta_rp' in summary.columns
