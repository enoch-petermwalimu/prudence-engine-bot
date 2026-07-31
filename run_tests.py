import sys
import unittest
from datetime import datetime

from prudence_engine.engines.market_data import MarketDataEngine, MarketDataValidator
from prudence_engine.engines.market_bias import MarketBiasEngine
from prudence_engine.engines.market_regime import MarketRegimeEngine
from prudence_engine.engines.institutional_zone import InstitutionalZoneEngine
from prudence_engine.engines.liquidity import LiquidityEngine
from prudence_engine.engines.price_action import PriceActionEngine
from prudence_engine.engines.displacement import DisplacementEngine
from prudence_engine.engines.structure import StructureEngine
from prudence_engine.engines.narrative import NarrativeEngine
from prudence_engine.engines.scoring import ScoringEngine
from prudence_engine.engines.experience import ExperienceEngine
from prudence_engine.engines.risk import RiskEngine, AccountStatus
from prudence_engine.engines.execution import ExecutionEngine
from prudence_engine.engines.orchestrator import PrudenceCognitiveEngine

class TestPrudenceEngineV5(unittest.TestCase):

    def setUp(self):
        self.orchestrator = PrudenceCognitiveEngine()
        self.sample_bars = [
            {"timestamp": f"2026-07-30 10:{i:02d}", "open": 1.0800 + i*0.0002, "high": 1.0805 + i*0.0002, "low": 1.0798 + i*0.0002, "close": 1.0804 + i*0.0002, "volume": 1000 + i*50}
            for i in range(30)
        ]
        # Add a liquidity sweep on final candle
        self.sample_bars[-1] = {
            "timestamp": "2026-07-30 10:30",
            "open": 1.0850,
            "high": 1.0875,
            "low": 1.0830,  # Sweeps previous low
            "close": 1.0872, # Bullish rejection close
            "volume": 2500
        }

    def test_01_market_data_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        self.assertEqual(batch.symbol, "EURUSD")
        self.assertEqual(len(batch.bars), 30)
        self.assertGreater(batch.indicators.ema20, 0)
        print("✓ Market Data Engine Test Passed")

    def test_02_bias_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        bias = self.orchestrator.bias_engine.process(batch)
        self.assertIn(bias.direction.value, ["BUY", "SELL", "NEUTRAL"])
        print("✓ Market Bias Engine Test Passed")

    def test_03_regime_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        regime = self.orchestrator.regime_engine.process(batch)
        self.assertIn(regime.regime.value, ["TREND", "RANGE", "EXPANSION", "CONSOLIDATION"])
        print("✓ Market Regime Engine Test Passed")

    def test_04_zone_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        zone_res = self.orchestrator.zone_engine.process(batch)
        self.assertIn(zone_res.current_valuation, ["PREMIUM", "DISCOUNT", "EQUILIBRIUM"])
        print("✓ Institutional Zone Engine Test Passed")

    def test_05_liquidity_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        liq = self.orchestrator.liquidity_engine.process(batch)
        self.assertTrue(hasattr(liq, "has_sweep"))
        print("✓ Liquidity Engine Test Passed")

    def test_06_price_action_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        pa = self.orchestrator.price_action_engine.process(batch)
        self.assertGreaterEqual(pa.primary_pattern.strength, 0)
        print("✓ Price Action Engine Test Passed")

    def test_07_displacement_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        disp = self.orchestrator.displacement_engine.process(batch)
        self.assertIn(disp.quality.value, ["WEAK", "MEDIUM", "STRONG", "INSTITUTIONAL"])
        print("✓ Displacement Engine Test Passed")

    def test_08_structure_engine(self):
        batch = self.orchestrator.market_data_engine.process("EURUSD", "M15", self.sample_bars)
        disp = self.orchestrator.displacement_engine.process(batch)
        st = self.orchestrator.structure_engine.process(batch, disp.quality)
        self.assertIn(st.event_type.value, ["MSS", "BOS", "CHOCH", "NONE"])
        print("✓ Structure Engine Test Passed")

    def test_09_full_pipeline_orchestration(self):
        res = self.orchestrator.analyze_market("EURUSD", "M15", self.sample_bars)
        self.assertIsNotNone(res.execution.signal)
        self.assertGreaterEqual(res.scoring.total_score, 0.0)
        self.assertLessEqual(res.scoring.total_score, 15.0)
        print("✓ Full Master Orchestrator Pipeline Test Passed!")

if __name__ == "__main__":
    unittest.main()
