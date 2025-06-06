import { useEffect, useState } from "react";

const StockPrice = ({ symbol, userId, onSave, onRemove }) => {
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioError, setPortfolioError] = useState(null);

  useEffect(() => {
    fetchStockData();
    if (userId) {
      fetchUserPortfolio();
    }
  }, [symbol, userId]);

  // Fetch stock data
  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stockprice/${symbol}`);
      if (!response.ok) throw new Error(`Failed to fetch ${symbol} - ${response.status}`);
      const data = await response.json();
      setStockData({
        price: parseFloat(data.price).toFixed(2),
        changePercent: parseFloat(data.change_percent).toFixed(2),
      });
    } catch (err) {
      console.error(`Error fetching stock data for ${symbol}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //Fetch user portfolio
  const fetchUserPortfolio = async () => {
    try {
      setPortfolioError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/portfolio/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch portfolio - ${response.status}`);

      const data = await response.json();
      if (!data.success || !Array.isArray(data.portfolio)) {
        throw new Error("Invalid portfolio data");
      }

      setPortfolio(data.portfolio.map(stock => stock.symbol) || []);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setPortfolioError("Error fetching portfolio. Please try again.");
    }
  };

  // Save stock to portfolio
  const saveToPortfolio = async () => {
    if (!userId) {
      alert("Error: User ID is missing. Please log in.");
      return;
    }

    console.log(`Saving stock ${symbol} for user: ${userId}`);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/portfolio/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol }),
      });

      const data = await response.json();
      if (!data.success) {
        alert(`Error: ${data.message}`);
        return;
      }

      setPortfolio((prev) => [...prev, symbol]);
      if (onSave) onSave(); //Notify parent component
    } catch (err) {
      alert("Network error while saving stock.");
    }
  };

  //Remove stock from portfolio
  const removeFromPortfolio = async () => {
    console.log(`🗑 Attempting to remove ${symbol}...`);
  
    if (typeof onRemove === "function") {
      try {
        await fetch("http://127.0.0.1:8000/api/portfolio/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, symbol }),
        });
  
        setPortfolio((prev) => prev.filter((stock) => stock !== symbol));
        onRemove(symbol); //Call onRemove only if it's valid
      } catch (err) {
        console.error(`Error removing ${symbol}:`, err);
      }
    } else {
      console.error("Error: onRemove is not a function");
    }
  };
  

  //Loading and error states
  if (loading) return <p>Loading {symbol}...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (portfolioError) return <p className="text-red-600">{portfolioError}</p>;

  //Check if the stock is already saved in the portfolio
  const isSaved = portfolio.includes(symbol);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
      <div className="flex justify-between">
        <span className="text-lg font-semibold">{symbol}</span>
        <span
          className={`px-2 py-1 rounded-full ${
            stockData.changePercent >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {stockData.changePercent >= 0 ? "↑" : "↓"} {stockData.changePercent}%
        </span>
      </div>
      <p className="text-xl font-bold">${stockData.price}</p>

      <button
        onClick={isSaved ? removeFromPortfolio : saveToPortfolio}
        className={`mt-2 px-4 py-2 rounded-lg ${
          isSaved ? "bg-red-600 text-white hover:bg-red-400" : "bg-purple-600 text-white hover:bg-purple-400"
        }`}
      >
        {isSaved ? "Remove from Portfolio" : "Save to Portfolio"}
      </button>
    </div>
  );
};

export default StockPrice;