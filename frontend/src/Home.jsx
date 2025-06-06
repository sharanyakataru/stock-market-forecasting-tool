import { useEffect, useState } from "react";
import StockPrice from "./StockPrice";

export default function Home({ userId }) {
  const [marketIndexes, setMarketIndexes] = useState([]);
  const [loadingIndexes, setLoadingIndexes] = useState(true);
  const [errorIndexes, setErrorIndexes] = useState(null);
  const [portfolio, setPortfolio] = useState([]); //Track saved stocks

  //List of stock symbols to display
  const trendingStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"];

  // Fetch market overview data
  async function fetchMarketData() {
    setLoadingIndexes(true);
    setErrorIndexes(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/market-overview");

      if (!response.ok) {
        throw new Error(`Failed to fetch market overview - Server responded with ${response.status}`);
      }

      const data = await response.json();
      setMarketIndexes(data);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setErrorIndexes(err.message);
    } finally {
      setLoadingIndexes(false);
    }
  }

  //Remove stock from portfolio
  const removeFromPortfolio = async (symbol) => {
    if (!userId) {
      alert("Error: User ID is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/portfolio/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        setPortfolio((prev) => prev.filter((s) => s !== symbol));
      } else {
        alert("Failed to remove stock. Please try again.");
      }
    } catch (err) {
      alert("Network error while removing stock.");
    }
  };

  // Load market overview on page load
  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div className="flex-1 p-6">
      {/* Trending Stocks Section */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Trending Stocks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trendingStocks.map((symbol) => (
            <StockPrice 
              key={symbol} 
              symbol={symbol} 
              userId={userId} 
              onRemove={removeFromPortfolio}  // Pass remove function
              onSave={() => console.log(`${symbol} saved to portfolio`)}
            />
          ))}
        </div>
      </section>

      {/* Market Overview */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Market Overview</h2>
        {loadingIndexes ? (
          <div className="flex items-center text-gray-500 italic mb-4">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading market data...
        </div>
        ) : errorIndexes ? (
          <p className="text-red-600">Error fetching market data: {errorIndexes}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketIndexes.length > 0 ? (
              marketIndexes.map((index, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg shadow-md border-l-4 
                  border-purple-500 flex justify-between items-center"
                >
                  <span className="text-lg font-medium">{index.name}</span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      index.positive === true
                        ? 'bg-green-100 text-green-600'
                        : index.positive === false
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index.change}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No market overview data available.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}