import requests
from functools import lru_cache
from datetime import datetime
import os

API_KEY = "89a19b20b39a4fa682212244e18e944b"

@lru_cache(maxsize=50)
def get_stock_price(ticker):
    print(f"Fetching real-time price for: {ticker}")

    url = f"https://api.twelvedata.com/time_series?symbol={ticker}&interval=1day&outputsize=2&apikey={API_KEY}"
    response = requests.get(url)
    data = response.json()

    values = data.get("values", [])
    if len(values) == 0:
        return {"error": f"No data returned for {ticker}"}

    latest = values[0]
    latest_price = round(float(latest["close"]), 2)
    
    if len(values) >= 2:
        previous = values[1]
        prev_price = round(float(previous["close"]), 2)
        change_percent = round(((latest_price - prev_price) / prev_price) * 100, 2)
    else:
        prev_price = None
        change_percent = None

    return {
        "ticker": ticker.upper(),
        "price": latest_price,
        "date": latest["datetime"],
        "change_percent": change_percent
    }
    
def get_sector_for_symbol(ticker):
    try:
        stock = Ticker(ticker)
        info = stock.asset_profile

        if not info:
            print(f"[SECTOR] No asset_profile for {ticker}")
            return "Unknown"

        # Try both upper and lower case
        normalized_ticker = ticker.upper()
        possible_keys = [normalized_ticker, normalized_ticker.lower()]
        
        for key in possible_keys:
            if key in info and "sector" in info[key]:
                sector = info[key]["sector"]
                print(f"[SECTOR] {ticker} sector → {sector}")
                return sector

        print(f"[SECTOR] Sector not found for {ticker} in asset_profile keys: {list(info.keys())}")
        return "Unknown"

    except Exception as e:
        print(f"[SECTOR] Error fetching sector for {ticker}: {e}")
        return "Unknown"


