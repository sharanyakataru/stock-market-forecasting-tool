from yahooquery import Ticker
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta


def fetch_historical_data(ticker):
    try:
        print(f"Fetching historical data for {ticker}")

        stock = Ticker(ticker)
        data = stock.history(period="6mo")

        if data is None or data.empty:
            print(f"No historical data found for {ticker}")
            return None

        print(data.tail())

        #MultiIndex is reset
        if isinstance(data.index, pd.MultiIndex):
            data = data.reset_index()

        #Remove Timezone from Index
        if isinstance(data.index, pd.DatetimeIndex) and data.index.tz is not None:
            data.index = data.index.tz_localize(None)

        #'date' column exists
        if 'date' not in data.columns:
            print(f" 'date' column missing. Extracting from index...")
            data.rename(columns={"index": "date"}, inplace=True)

        #Convert 'date' column to Naive Datetime
        data['date'] = pd.to_datetime(data['date'], utc=True).dt.tz_localize(None)

        #Rebuild DataFrame to Avoid Any Mixed Types
        data = data[['date', 'close']].copy()  # Keep only necessary columns

        #Convert to UNIX timestamp
        data['timestamp'] = data['date'].astype(int) // 10**9

        return data[['timestamp', 'close']]

    except Exception as e:
        print(f"ERROR fetching data for {ticker}: {e}")
        return None

    
def predict_stock_price(ticker, days=7):
    data = fetch_historical_data(ticker)

    if len(data) < 2:
        return {"error": f"Not enough data available for {ticker}"}

    
    if data is None or data.empty:
        return {"error": f"No historical data available for {ticker}"}
    
    try:
        X = data[['timestamp']].values.reshape(-1, 1)
        y = data['close'].values.reshape(-1, 1)

        model = LinearRegression()
        model.fit(X, y)

        future_dates = [(datetime.now() + timedelta(days=i)).timestamp() for i in range(1, days+1)]
        future_prices = model.predict(np.array(future_dates).reshape(-1, 1))

        predictions = [
            {"date": (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d"), "predicted_price": round(price[0], 2)}
            for i, price in enumerate(future_prices)
        ]

        print(f"Predictions for {ticker}: {predictions}") 
        return {"ticker": ticker, "predictions": predictions}

    except Exception as e:
        print(f"ERROR in prediction for {ticker}: {e}")
        return {"error": f"Prediction failed for {ticker}: {str(e)}"}
