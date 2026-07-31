import uuid
from typing import List
from .models import InstitutionalZone, ZoneType, ZoneStatus, ZoneAnalysisResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class InstitutionalZoneEngine:
    """
    Engine 4: Institutional Zone Engine
    Detects Supply/Demand, Buy Vaults, Sell Vaults, Premium/Discount zones.
    """
    def process(self, data: MarketDataBatch) -> ZoneAnalysisResult:
        if not data or not data.bars or len(data.bars) < 10:
            return ZoneAnalysisResult(
                current_valuation="EQUILIBRIUM",
                discount_level=50.0,
                equilibrium_price=data.last_close if data else 0.0,
                active_zones=[],
                active_demand_zone=None,
                active_supply_zone=None
            )

        bars = data.bars
        highs = [b.high for b in bars]
        lows = [b.low for b in bars]

        swing_max = max(highs[-50:]) if len(highs) >= 50 else max(highs)
        swing_min = min(lows[-50:]) if len(lows) >= 50 else min(lows)
        equilibrium = (swing_max + swing_min) / 2.0

        current_price = data.last_close
        range_span = swing_max - swing_min if swing_max > swing_min else 0.0001
        pct_from_bottom = ((current_price - swing_min) / range_span) * 100.0

        if pct_from_bottom > 55.0:
            valuation = "PREMIUM"
        elif pct_from_bottom < 45.0:
            valuation = "DISCOUNT"
        else:
            valuation = "EQUILIBRIUM"

        detected_zones: List[InstitutionalZone] = []

        # Find bullish order block / Demand / Buy Vault in Discount area
        for i in range(len(bars) - 4, 3, -1):
            curr = bars[i]
            nxt = bars[i+1]

            # Strong bullish expansion candle after down candle
            if curr.close < curr.open and (nxt.close - nxt.open) > (data.indicators.atr14 * 1.1 if data.indicators else 0.0015):
                z_low = curr.low
                z_high = curr.high
                # Check touch count
                touches = sum(1 for b in bars[i+2:] if b.low <= z_high and b.high >= z_low)
                broken = any(b.close < z_low for b in bars[i+2:])
                status = ZoneStatus.BROKEN if broken else (ZoneStatus.MITIGATED if touches > 0 else ZoneStatus.ACTIVE)

                is_vault = z_high <= equilibrium
                z_type = ZoneType.BUY_VAULT if is_vault else ZoneType.DEMAND

                zone = InstitutionalZone(
                    zone_id=f"OB-DEMAND-{i}",
                    zone_type=z_type,
                    high=round(z_high, 5),
                    low=round(z_low, 5),
                    creation_time=curr.timestamp.strftime("%Y-%m-%d %H:%M"),
                    strength=8.5 if status == ZoneStatus.ACTIVE else 5.0,
                    freshness=(touches == 0),
                    touch_count=touches,
                    status=status
                )
                detected_zones.append(zone)

            # Strong bearish expansion candle after up candle
            elif curr.close > curr.open and (nxt.open - nxt.close) > (data.indicators.atr14 * 1.1 if data.indicators else 0.0015):
                z_low = curr.low
                z_high = curr.high
                touches = sum(1 for b in bars[i+2:] if b.high >= z_low and b.low <= z_high)
                broken = any(b.close > z_high for b in bars[i+2:])
                status = ZoneStatus.BROKEN if broken else (ZoneStatus.MITIGATED if touches > 0 else ZoneStatus.ACTIVE)

                is_vault = z_low >= equilibrium
                z_type = ZoneType.SELL_VAULT if is_vault else ZoneType.SUPPLY

                zone = InstitutionalZone(
                    zone_id=f"OB-SUPPLY-{i}",
                    zone_type=z_type,
                    high=round(z_high, 5),
                    low=round(z_low, 5),
                    creation_time=curr.timestamp.strftime("%Y-%m-%d %H:%M"),
                    strength=8.5 if status == ZoneStatus.ACTIVE else 5.0,
                    freshness=(touches == 0),
                    touch_count=touches,
                    status=status
                )
                detected_zones.append(zone)

        # Fallback synthetic zones if none detected dynamically in small slice
        if not detected_zones:
            d_low = swing_min
            d_high = swing_min + (range_span * 0.15)
            s_low = swing_max - (range_span * 0.15)
            s_high = swing_max

            detected_zones.append(InstitutionalZone(
                zone_id="OB-DEMAND-DISCOUNT-1",
                zone_type=ZoneType.BUY_VAULT,
                high=round(d_high, 5),
                low=round(d_low, 5),
                creation_time=bars[-1].timestamp.strftime("%Y-%m-%d %H:%M"),
                strength=8.0,
                freshness=True,
                touch_count=0,
                status=ZoneStatus.ACTIVE
            ))
            detected_zones.append(InstitutionalZone(
                zone_id="OB-SUPPLY-PREMIUM-1",
                zone_type=ZoneType.SELL_VAULT,
                high=round(s_high, 5),
                low=round(s_low, 5),
                creation_time=bars[-1].timestamp.strftime("%Y-%m-%d %H:%M"),
                strength=8.0,
                freshness=True,
                touch_count=0,
                status=ZoneStatus.ACTIVE
            ))

        active_demand = next((z for z in detected_zones if z.zone_type in (ZoneType.DEMAND, ZoneType.BUY_VAULT) and z.status == ZoneStatus.ACTIVE), None)
        active_supply = next((z for z in detected_zones if z.zone_type in (ZoneType.SUPPLY, ZoneType.SELL_VAULT) and z.status == ZoneStatus.ACTIVE), None)

        return ZoneAnalysisResult(
            current_valuation=valuation,
            discount_level=round(pct_from_bottom, 1),
            equilibrium_price=round(equilibrium, 5),
            active_zones=detected_zones,
            active_demand_zone=active_demand,
            active_supply_zone=active_supply
        )
