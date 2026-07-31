// Price and number formatting utilities for Prudence Engine

export function formatPrice(price: number | undefined | null, symbol: string = ""): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "0.00";
  }

  const sym = symbol.toUpperCase();

  // BTC, Synthetic Indices with large values (e.g. Volatility 75, Boom 1000, Step 8000)
  if (
    sym.includes("BTC") ||
    sym.includes("75") ||
    sym.includes("100") ||
    sym.includes("BOOM") ||
    sym.includes("CRASH") ||
    sym.includes("STEP") ||
    sym.includes("JUMP") ||
    sym.includes("JD") ||
    price > 500
  ) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Medium scale prices (e.g. Volatility 50, Volatility 25)
  if (price > 10) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  }

  // Standard Forex / Commodities (EURUSD = 1.08502, Gold = 2420.50)
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 5,
  });
}

export function formatTime(timestampStr: string): string {
  if (!timestampStr) return "";
  const parts = timestampStr.split(" ");
  if (parts.length > 1) {
    return parts[1]; // HH:mm
  }
  return timestampStr;
}
