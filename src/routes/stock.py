from fastapi import APIRouter, HTTPException
from src.stockdata import get_stock_price
import numpy as np
import requests
import os

router = APIRouter()

API_KEY = "89a19b20b39a4fa682212244e18e944b"

@router.get("/api/stockdata")
async def fetch_stock_data():
    return {"message": "Stock data endpoint is working!"}

@router.get("/api/stockprice/{ticker}")
async def fetch_stock_price(ticker: str):
    return get_stock_price(ticker)


def fetch_index_change(ticker):
    url = f"https://api.twelvedata.com/time_series?symbol={ticker}&interval=1day&outputsize=2&apikey={API_KEY}"
    print(f"📡 Fetching {ticker}: {url}")
    response = requests.get(url)
    print(f"🔍 Response for {ticker}: {response.text}")
    
    data = response.json()
    values = data.get("values", [])

    if not values:
        return None, None, None

    latest = values[0]
    latest_price = float(latest["close"])

    if len(values) < 2:
        return latest_price, None, None

    previous = values[1]
    open_price = float(previous["close"])
    change = 0.0 if open_price == 0 else ((latest_price - open_price) / open_price) * 100
    positive = change > 0

    return latest_price, change, positive

@router.get("/api/market-overview")
async def fetch_market_overview():
    indexes = {
        "S&P 500": "SPX",
        "NASDAQ": "IXIC",
        "DOW JONES": "DJI",
        "RUSSELL 2000": "RUT",
        "NYSE COMPOSITE": "NYA",
        "FTSE 100": "UKX",
        "DAX": "DAX",
        "NIKKEI 225": "N225"
    }

    market_data = []
    for name, ticker in indexes.items():
        last_price, change, positive = fetch_index_change(ticker)

        market_data.append({
            "name": name,
            "price": f"${last_price:.2f}" if last_price is not None else "N/A",
            "change": f"{change:.2f}%" if change is not None else "N/A",
            "positive": positive
        })

    return market_data