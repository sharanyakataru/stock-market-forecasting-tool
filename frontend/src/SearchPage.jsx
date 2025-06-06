import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function SearchPage() {
  const { query } = useParams();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stockprice/${query}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${query} - Server responded with ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched data for ${query}:`, data);

        if (!data || typeof data.price === "undefined" || isNaN(data.price)) {
          throw new Error(`Invalid data format for ${query}: ${JSON.stringify(data)}`);
        }

        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [query]);

  //Function to save the stock to the portfolio
  const saveToPortfolio = async () => {
    const userId = localStorage.getItem("userId"); //Fetch user ID from local storage

    if (!userId) {
      alert("Error: User ID is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/portfolio/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol: stockData.ticker }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
        return;
      }

      alert(`Stock ${stockData.ticker} saved successfully!`);
    } catch (err) {
      console.error("Network Error:", err);
      alert("Network error while saving stock.");
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Results for: <span className="text-purple-600">"{query}"</span>
      </h2>

      {loading && <p className="text-gray-500">Loading stock data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {stockData && (
        <div className="bg-white shadow-md p-4 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">{stockData.ticker}</h3>
          <p className="text-xl font-bold text-gray-700">${stockData.price}</p>
          <p className={`text-sm ${stockData.change_percent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stockData.change_percent.toFixed(2)}%
          </p>
          
          {/* Add Save to Portfolio Button */}
          <button 
            className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
            onClick={saveToPortfolio}
          >
            Save to Portfolio
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
