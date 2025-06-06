from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database import get_db
from models import Portfolio
from datetime import datetime, timedelta
from src.stock_utils import get_sector_for_symbol
from yahooquery import Ticker
import logging
import pandas as pd
from collections import defaultdict

router = APIRouter()
logger = logging.getLogger(__name__)

router = APIRouter()

#Simulated portfolio storage (in-memory for now)
simulated_portfolios = {}

#Pydantic model to parse request body
class StockRequest(BaseModel):
    user_id: str
    symbol: str

@router.post("/api/portfolio/add")
async def add_stock(request: StockRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    symbol = request.symbol

    logger.info(f"Adding stock {symbol} for user {user_id}")

    #Check if the stock already exists in the portfolio
    existing_stock = db.query(Portfolio).filter(Portfolio.user_id == user_id, Portfolio.symbol == symbol).first()
    if existing_stock:
        return {"success": False, "message": f"{symbol} already exists in portfolio."}

    #Add the stock to the portfolio
    new_stock = Portfolio(user_id=user_id, symbol=symbol, is_simulated=False)
    db.add(new_stock)
    db.commit()
    return {"success": True, "message": f"{symbol} added to portfolio."}

class RemoveStockRequest(BaseModel):
    user_id: str
    symbol: str

@router.delete("/api/portfolio/remove")
async def remove_stock(request: RemoveStockRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    symbol = request.symbol

    stock = db.query(Portfolio).filter(Portfolio.user_id == user_id, Portfolio.symbol == symbol).first()
    if not stock:
        return {"success": False, "message": "Stock not found in portfolio."}

    db.delete(stock)
    db.commit()
    return {"success": True, "message": f"{symbol} removed from portfolio."}

@router.get("/api/portfolio/{user_id}")
async def get_portfolio(user_id: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching portfolio for user {user_id}")

    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id, Portfolio.is_simulated == False).all()
    
    #Always return a portfolio key to prevent frontend errors
    portfolio_symbols = [{"symbol": stock.symbol} for stock in portfolio]
    return {"success": True, "portfolio": portfolio_symbols}


@router.get("/api/simulated-portfolio/{user_id}")
async def get_simulated_portfolio(user_id: str):
    if user_id not in simulated_portfolios:
        simulated_portfolios[user_id] = []  #user has an empty portfolio instead of returning an error
    return {"success": True, "portfolio": simulated_portfolios[user_id]}

class SimulatedBuyRequest(BaseModel):
    user_id: str
    symbol: str
    price: float
    quantity: int = Field(gt=0)

@router.post("/api/simulated-portfolio/buy")
async def buy_simulated_stock(request: SimulatedBuyRequest):
    user_id = request.user_id
    symbol = request.symbol.strip().upper()
    price = request.price
    quantity = request.quantity

    print("BUY STOCK request:", request)

    # Create portfolio list if this user doesn't exist yet
    if user_id not in simulated_portfolios:
        simulated_portfolios[user_id] = []

    # Now safely access it
    portfolio = simulated_portfolios[user_id]

    # Check if stock already exists
    for stock in portfolio:
        if stock["symbol"] == symbol:
            total_cost = (stock["average_price"] * stock["quantity"]) + (price * quantity)
            stock["quantity"] += quantity
            stock["average_price"] = total_cost / stock["quantity"]
            break
    else:
        portfolio.append({
            "symbol": symbol,
            "quantity": quantity,
            "average_price": price
        })

    print("Portfolio after buy:", simulated_portfolios[user_id])

    return {"success": True, "message": f"Bought {symbol} in simulated portfolio."}


class SimulatedSellRequest(BaseModel):
    user_id: str
    symbol: str
    quantity: int = Field(gt=0)

@router.post("/api/simulated-portfolio/sell")
async def sell_simulated_stock(request: SimulatedSellRequest):
    user_id = request.user_id
    symbol = request.symbol.strip().upper()
    quantity = request.quantity

    if user_id not in simulated_portfolios:
        return {"success": False, "message": f"No portfolio found for user {user_id}"}

    user_portfolio = simulated_portfolios[user_id]

    for stock in user_portfolio:
        if stock["symbol"] == symbol:
            if stock["quantity"] < quantity:
                return {"success": False, "message": f"Not enough shares of {symbol} to sell."}

            stock["quantity"] -= quantity

            if stock["quantity"] == 0:
                user_portfolio.remove(stock)

            return {"success": True, "message": f"Sold {quantity} shares of {symbol}."}

    return {"success": False, "message": f"{symbol} not found in portfolio."}


@router.post("/api/simulated-portfolio/reset")
async def reset_simulated_portfolio(request: Request):
    data = await request.json()
    user_id = data.get("user_id")

    if not user_id:
        return {"success": False, "message": "Missing user_id"}

    #Clear the user's in-memory simulated portfolio
    simulated_portfolios[user_id] = []

    return {"success": True, "message": "Simulated portfolio reset."}

@router.get("/api/portfolio/history/{user_id}")
async def get_portfolio_history(user_id: str):
    print("[HISTORY] Getting portfolio history for:", user_id)
    print("Current portfolios:", simulated_portfolios)
    if user_id not in simulated_portfolios or not simulated_portfolios[user_id]:
        print("No portfolio data found for user.")
        return {"success": True, "history": []}

    holdings = simulated_portfolios[user_id]
    symbols = [stock["symbol"] for stock in holdings]

    tickers = Ticker(symbols)
    history_data = tickers.history(period="7d", interval="1d")

    print("Yahoo data:", history_data)
    #Create a mapping from (symbol, date) → close price
    price_lookup = defaultdict(dict)

    for (sym, ts), row in history_data.iterrows():
        date_str = ts.isoformat()
        price_lookup[sym][date_str] = row["close"]

    #Loop through past 7 days and calculate value
    history = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=6 - i)).date().isoformat()

        #Skip weekends
        if datetime.strptime(date, "%Y-%m-%d").weekday() >= 5:
            print(f"⛔ Skipping weekend: {date}")
            continue

        daily_value = 0

        for stock in holdings:
            symbol = stock["symbol"]
            qty = stock["quantity"]

            price = price_lookup.get(symbol, {}).get(date)
            if price:
                daily_value += price * qty
            else:
                print(f"No price for {symbol} on {date}")

        history.append({"date": date, "value": round(daily_value, 2)})


    return {"success": True, "history": history}

@router.get("/api/portfolio/sector-allocation/{user_id}")
async def get_sector_allocation(user_id: str):
    if user_id not in simulated_portfolios:
        return {"success": True, "sectors": []}

    sector_totals = {}
    for stock in simulated_portfolios[user_id]:
        symbol = stock["symbol"]
        quantity = stock["quantity"]
        sector = get_sector_for_symbol(symbol)
        print("Testing sector:", get_sector_for_symbol("DFS"))

        print(f"🔍 Looking up sector for {symbol} → {sector}")

        if not sector:
            sector = "Unknown"

        if sector not in sector_totals:
            sector_totals[sector] = 0

        sector_totals[sector] += quantity

    result = [{"sector": k, "value": v} for k, v in sector_totals.items()]
    return {"success": True, "sectors": result}