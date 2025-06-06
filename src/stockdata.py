from src.stock_utils import get_stock_price
import time
import threading

# Function to clear cache every 30 seconds
def clear_cache():
    while True:
        time.sleep(30)
        get_stock_price.cache_clear()
        print("Cache cleared!")

threading.Thread(target=clear_cache, daemon=True).start()
