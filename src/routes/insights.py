from fastapi import APIRouter
from src.stock_utils import get_stock_price  #Import the shared function
from src.models.predictor import predict_stock_price  #Import prediction function

router = APIRouter()

@router.get("/stock/{ticker}")
def stock_price_endpoint(ticker: str):
    return get_stock_price(ticker)

@router.get("/predict")
def predict(tickers: str):
    tickers_list = tickers.split(",")  #Convert comma-separated tickers into a list
    predictions = {ticker: predict_stock_price(ticker) for ticker in tickers_list}
    return predictions
