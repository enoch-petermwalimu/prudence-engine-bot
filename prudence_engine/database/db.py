import sqlite3
import json
import os
from typing import List, Dict, Any

class ExperienceDatabase:
    """
    SQLite Database Manager for Experience Engine.
    Easily configurable for migration to PostgreSQL.
    """
    def __init__(self, db_path: str = "prudence_experience.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trade_history (
                trade_id TEXT PRIMARY KEY,
                timestamp TEXT,
                session TEXT,
                symbol TEXT,
                market_bias TEXT,
                zone_type TEXT,
                liquidity_sweep TEXT,
                pattern TEXT,
                displacement TEXT,
                structure TEXT,
                score REAL,
                entry_price REAL,
                exit_price REAL,
                result TEXT,
                risk_reward REAL,
                pnl REAL
            )
        """)
        conn.commit()
        conn.close()

    def record_trade(self, trade_data: Dict[str, Any]):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO trade_history (
                trade_id, timestamp, session, symbol, market_bias, zone_type,
                liquidity_sweep, pattern, displacement, structure, score,
                entry_price, exit_price, result, risk_reward, pnl
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trade_data["trade_id"],
            trade_data.get("timestamp"),
            trade_data.get("session", "NEW_YORK"),
            trade_data.get("symbol", "EURUSD"),
            trade_data.get("market_bias", "BUY"),
            trade_data.get("zone_type", "DEMAND"),
            trade_data.get("liquidity_sweep", "PREVIOUS_LOW"),
            trade_data.get("pattern", "BULLISH_ENGULFING"),
            trade_data.get("displacement", "INSTITUTIONAL"),
            trade_data.get("structure", "MSS"),
            trade_data.get("score", 13.0),
            trade_data.get("entry_price", 1.0),
            trade_data.get("exit_price", 1.0),
            trade_data.get("result", "WIN"),
            trade_data.get("risk_reward", 2.5),
            trade_data.get("pnl", 250.0)
        ))
        conn.commit()
        conn.close()

    def get_all_trades(self) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trade_history ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
