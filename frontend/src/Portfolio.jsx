import { useState, useEffect } from "react";
import StockPrice from "./StockPrice";
import PortfolioLineChart from "./components/PortfolioLineChart";
import AssetAllocationPie from "./components/AssetAllocationPie";


export default function Portfolio({ userId }) {

  const [realStocks, setRealStocks] = useState([]);
  const [simulatedStocks, setSimulatedStocks] = useState([]);
  const [isReal, setIsReal] = useState(true); //Tracks if in real or simulated mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [simulatedBalance, setSimulatedBalance] = useState(10000); //Starting balance for simulated mode
  const [transactionHistory, setTransactionHistory] = useState([]);

  //For searching and interacting with stocks in the simulated portfolio
  const [searchTerm, setSearchTerm] = useState(""); //For the stock search input
  const [searchResults, setSearchResults] = useState([]); //Store the search results
  const [quantity, setQuantity] = useState(1); //Quantity of stocks to buy/sell

  const [sellQuantities, setSellQuantities] = useState({}); //symbol -> quantity
  const [justReset, setJustReset] = useState(false);

  const [historyData, setHistoryData] = useState([]);
  const [sectorData, setSectorData] = useState([]);

  //Fetch stock price (could be connected to an API like Alpha Vantage or Yahoo Finance)
  const fetchStockPrice = async (symbol) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stockprice/${symbol}`);
      if (!response.ok) throw new Error(`Failed to fetch stock price for ${symbol}`);
      const data = await response.json();
      return data.price || 0;
    } catch (err) {
      console.error(`🚨 Error fetching price for ${symbol}:`, err);
      return 0;
    }
  };

  //Fetch the user's portfolio (real or simulated)
  useEffect(() => {
    if (!userId) return;
    setError(null);
    setLoading(true);
  
    //Only use cached data if not justReset
    if (!isReal && !justReset) {
      const cachedData = localStorage.getItem(`simulatedPortfolio-${userId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setSimulatedStocks(parsedData.portfolio || []);
        setSimulatedBalance(parsedData.balance || 10000);
        setTransactionHistory(parsedData.transactions || []);
        return;
      }
    }
  
    //Always fetch fresh data for real OR if justReset
    fetchUserPortfolio();
  }, [userId, isReal, justReset]);
  
  
  
  useEffect(() => {
    if (!isReal) {
      localStorage.setItem(
        `simulatedPortfolio-${userId}`,
        JSON.stringify({
          portfolio: simulatedStocks,
          balance: simulatedBalance,
          transactions: transactionHistory,
        })
      );
    }
  }, [simulatedStocks, simulatedBalance, transactionHistory]);
  

  const fetchUserPortfolio = async () => {
    try {
      setLoading(true);
      const endpoint = isReal
        ? `http://127.0.0.1:8000/api/portfolio/${userId}`
        : `http://127.0.0.1:8000/api/simulated-portfolio/${userId}`;
  
      const response = await fetch(endpoint);
      const data = await response.json();
  
      if (!data.portfolio || !Array.isArray(data.portfolio)) {
        if (isReal) {
          setRealStocks([]);
        } else {
          setSimulatedStocks([]);
          setTransactionHistory([]);
          setSimulatedBalance(10000);
        }
        return;
      }
  
      const portfolioWithPrices = await Promise.all(
        data.portfolio.map(async (stock) => {
          const price = await fetchStockPrice(stock.symbol);
          return { ...stock, price };
        })
      );
  
      if (isReal) {
        setRealStocks(portfolioWithPrices);
      } else {
        setSimulatedStocks(portfolioWithPrices);
        setJustReset(false);
      }
  
      calculatePortfolioValue(portfolioWithPrices);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  //Remove stock from portfolio
  const removeFromPortfolio = async (symbol, isReal) => {
    if (!userId) {
      alert("Error: User ID is missing. Please log in.");
      return;
    }
  
    try {
      const endpoint = isReal
        ? "http://127.0.0.1:8000/api/portfolio/remove"
        : "http://127.0.0.1:8000/api/simulated-portfolio/remove";
  
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol }),
      });
  
      const data = await response.json();
      console.log("API Response:", data);
  
      if (data.success) {
        console.log("Stock removed successfully!");
  
        //Update state correctly
        if (isReal) {
          setRealStocks((prev) => prev.filter((s) => s.symbol !== symbol));
        } else {
          setSimulatedStocks((prev) => prev.filter((s) => s.symbol !== symbol));
        }        
  
        fetchUserPortfolio(); //Refresh portfolio data
      } else {
        alert("Failed to remove stock. Please try again.");
      }
    } catch (err) {
      console.error("Network error while removing stock:", err);
      alert("Network error while removing stock.");
    }
  };
  
  const calculatePortfolioValue = (stocks) => {
    let totalValue = stocks.reduce((acc, stock) => {
      return acc + (stock.price || 0) * (stock.quantity || 1);
    }, 0);
    setPortfolioValue(totalValue);
  };

  const calculatePortfolioGainLoss = () => {
    let totalSpent = 0;
    let currentValue = 0;
  
    simulatedStocks.forEach((stock) => {
      totalSpent += stock.average_price * stock.quantity;
      currentValue += stock.price * stock.quantity;
    });
  
    const gainAmount = currentValue - totalSpent;
    const gainPercent = totalSpent > 0 ? (gainAmount / totalSpent) * 100 : 0;
  
    return {
      gainAmount,
      gainPercent,
    };
  };
  

  const removeFromSimulatedPortfolio = async (symbol) => {
    if (!symbol) {
      console.error("Stock symbol is undefined.");
      return;
    }
  
    const endpoint = `http://127.0.0.1:8000/api/simulated-portfolio/remove/${symbol}/`;
  
    try {
      const response = await fetch(endpoint, {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log(` Successfully removed ${symbol} from simulated portfolio`);
        fetchSimulatedPortfolio(); //Refresh UI
      } else {
        console.error("API Error:", data.detail || "Unknown error");
        alert("Failed to remove stock from simulated portfolio.");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };  


  //Search for stocks
  const searchStock = async () => {
    if (!searchTerm) return; //Don't search if the input is empty
    const price = await fetchStockPrice(searchTerm);
    if (price) {
      setSearchResults([{ symbol: searchTerm, price }]);
    }
  };

  //Handle Buy stock action
  const buyStockSimulated = async (symbol, price, quantity) => {
    if (!quantity || quantity <= 0) {
      return alert("Please enter a valid quantity.");
    }
    if (simulatedBalance < price * quantity) {
      return alert("Not enough balance to buy this stock!");
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/simulated-portfolio/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol, price, quantity }),
      });
  
      if (!response.ok) throw new Error("Failed to buy stock.");
  
      setSimulatedBalance((prev) => prev - price * quantity); //Deduct balance
      addTransaction("Buy", symbol.toUpperCase(), price * quantity); //Add transaction history
      fetchUserPortfolio(); //Refresh portfolio
      alert(`Successfully bought ${quantity} of ${symbol} for $${(price * quantity).toFixed(2)}`);
    } catch (err) {
      console.error("Error buying stock:", err);
      alert("Failed to buy stock. Please try again.");
    }
  };
  

  //Handle Sell stock action
  const sellStockSimulated = async (symbol, price, quantity) => {
    if (!quantity || quantity <= 0) {
      return alert("Enter a valid quantity to sell.");
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/simulated-portfolio/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, symbol, quantity }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to sell stock.");
      }
  
      setSimulatedBalance((prev) => prev + price * quantity);
      addTransaction("Sell", symbol, price * quantity);
      fetchUserPortfolio(); //Refresh
      alert(`Successfully sold ${quantity} of ${symbol} for $${(price * quantity).toFixed(2)}`);
    } catch (err) {
      console.error("Error selling stock:", err);
      alert(err.message || "Failed to sell stock.");
    }
  };  


  //Add transaction to history
  const addTransaction = (type, symbol, price) => {
    const newTransaction = {
      type,
      symbol,
      price,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory((prev) => [newTransaction, ...prev]);
  };

  //Toggle between Real and Simulated mode
  const toggleRealSimulated = () => {
    setIsReal(!isReal);
  };

  //charts
  useEffect(() => {
    if (!userId || isReal) return;
  
    const cached = localStorage.getItem(`simulatedPortfolio-${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const portfolio = parsed.portfolio || [];
  
      Promise.all(
        portfolio.map((stock) =>
          fetch("http://127.0.0.1:8000/api/simulated-portfolio/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              symbol: stock.symbol,
              price: stock.average_price,
              quantity: stock.quantity,
            }),
          })
        )
      ).then(() => {
        console.log("✅ Rehydrated backend simulated portfolio");
  
        // ✅ Now fetch chart data
        fetch(`http://127.0.0.1:8000/api/portfolio/history/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("📉 History data:", data);
            if (data.success) setHistoryData(data.history);
          });
  
        fetch(`http://127.0.0.1:8000/api/portfolio/sector-allocation/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("📊 Sector data:", data);
            if (data.success) setSectorData(data.sectors);
          });
      });
    }
  }, [userId, isReal]);  
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header and toggle side by side */}
      <div className="flex justify-between items-start mb-2">
        {/* Left: Page title */}
        <h2 className="text-2xl font-semibold text-gray-800">My Portfolio</h2>

        {/* Right: Toggle Buttons */}
        <div className="flex">
          <button
            onClick={toggleRealSimulated}
            className={`px-4 py-2 rounded-l-lg text-sm font-medium ${
              isReal ? "bg-purple-500 text-white shadow-lg" : "bg-gray-200 text-gray-700"
            }`}
          >
            Real
          </button>
          <button
            onClick={toggleRealSimulated}
            className={`px-4 py-2 rounded-r-lg text-sm font-medium ${
              !isReal ? "bg-purple-500 text-white shadow-lg" : "bg-gray-200 text-gray-700"
            }`}
          >
            Simulated
          </button>
        </div>
      </div>

      {/* Second line: Simulated Summary and Transaction History aligned horizontally */}
      {!isReal && (
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
          {/* Simulated Portfolio Summary on the left */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Simulated Portfolio Summary</h3>
            <div className="text-base text-gray-700 mb-1">
              Simulated Balance:{" "}
              <span className="text-green-600 font-bold">${simulatedBalance.toFixed(2)}</span>
            </div>
            {simulatedStocks.length > 0 && (() => {
              const { gainAmount, gainPercent } = calculatePortfolioGainLoss();
              const gainColor = gainAmount >= 0 ? "text-green-600" : "text-red-500";
              const sign = gainAmount >= 0 ? "+" : "";
              return (
                <div className={`text-base font-medium ${gainColor}`}>
                  Gain/Loss: {sign}${gainAmount.toFixed(2)} ({sign}{gainPercent.toFixed(2)}%)
                </div>
              );
            })()}
            <div className="flex justify-end mt-4">
              <button
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to reset your simulated portfolio?")) return;
                  try {
                    await fetch("http://127.0.0.1:8000/api/simulated-portfolio/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ user_id: userId }),
                    });
                    localStorage.removeItem(`simulatedPortfolio-${userId}`);
                    setSimulatedBalance(10000);
                    setSimulatedStocks([]);
                    setTransactionHistory([]);
                    setJustReset(true);
                  } catch (err) {
                    alert("Failed to reset portfolio.");
                  }
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
              >
                Reset Simulated Portfolio
              </button>
            </div>
          </div>

          {/* Transaction History on the right */}
          <div className="w-full max-w-sm bg-white p-6 shadow-md rounded-lg h-[300px] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">🧾 Transaction History</h3>
            <ul className="space-y-3 text-sm">
              {transactionHistory.length === 0 ? (
                <li className="text-gray-500 italic">No recent transactions.</li>
              ) : (
                transactionHistory.map((t) => (
                  <li key={t.timestamp} className="border-b pb-2 text-gray-700">
                    {t.timestamp}: {t.type} {t.symbol.toUpperCase()} for ${t.price.toFixed(2)}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}


      {/* Only show stock search in Simulated mode */}
      {!isReal && (
        <>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 Search for Stocks</h3>
          <div className="flex mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
              placeholder="Search for a stock (e.g., AAPL)"
            />
            <button
              onClick={searchStock}
              className="ml-2 px-4 py-2 bg-purple-500 text-white rounded-md"
            >
              Search
            </button>
          </div>

          {/* Show search results */}
          {searchResults.length > 0 && (
            <div className="p-6 bg-white shadow-lg rounded-lg mb-6 max-w-xs w-full">
              <h3 className="text-lg font-semibold">{searchResults[0].symbol}</h3>
              <p className="text-gray-600">${searchResults[0].price.toFixed(2)}</p>

              {/* Quantity Input */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Quantity"
                />

                {/* Buy & Sell Buttons */}
                <button
                  onClick={() => buyStockSimulated(searchResults[0].symbol, searchResults[0].price, quantity)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Buy
                </button>
                <button
                  onClick={() => sellStockSimulated(searchResults[0].symbol, searchResults[0].price, quantity)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Real Portfolio */}
      {/* Side-by-side: Portfolio on left, History on right */}
      <div className="flex gap-6">
        {/* Main portfolio section */}
        <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Saved Stocks</h3>

          {isReal && (
            <div className="text-xl font-semibold text-gray-800">
              Portfolio Value:{" "}
              <span className="text-lg font-bold text-gray-900">
                ${portfolioValue.toFixed(2)}
              </span>
            </div>
          )}
        </div>

          {isReal ? (
            loading ? (
              <div className="flex items-center text-gray-500 italic">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading your portfolio...
              </div>
            ) : realStocks.length === 0 ? (
              <p className="text-gray-500">No stocks saved in your real portfolio.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {realStocks
                  .filter((stock) => stock.symbol && stock.price)
                  .map((stock) => (
                    <div key={`${stock.symbol}-${stock.price}`} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                      <p className="text-gray-600">${stock.price.toFixed(2)}</p>
                      <button
                        onClick={() => removeFromPortfolio(stock.symbol, isReal)}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove from Portfolio
                      </button>
                    </div>
                  ))}
              </div>
            )
          ) : simulatedStocks.length === 0 ? (
            <p className="text-gray-500">No stocks in your simulated portfolio.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {simulatedStocks
                .filter((stock) => stock.symbol && stock.price)
                .map((stock) => (
                  <div key={`${stock.symbol}-${stock.price}`} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                    <p className="text-gray-600 mb-2">
                      Quantity: {stock.quantity}<br />
                      Avg Buy Price: ${stock.average_price?.toFixed(2) || "N/A"}<br />
                      Current Price: ${stock.price?.toFixed(2)}<br />
                      Total Value: ${(stock.quantity * stock.price).toFixed(2)}<br />
                      Gain/Loss:
                      <span className={stock.price >= stock.average_price ? "text-green-600" : "text-red-500"}>
                        ${((stock.price - stock.average_price) * stock.quantity).toFixed(2)} (
                        {((stock.price - stock.average_price) / stock.average_price * 100).toFixed(2)}%)
                      </span>
                    </p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max={stock.quantity}
                        value={stock.sellQuantity || ""}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || "";
                          setSimulatedStocks((prevStocks) =>
                            prevStocks.map((s) =>
                              s.symbol === stock.symbol ? { ...s, sellQuantity: newQty } : s
                            )
                          );
                        }}
                        className="w-20 p-1 border border-gray-300 rounded-md"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() =>
                          sellStockSimulated(stock.symbol, stock.price, stock.sellQuantity)
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {/* Charts Section - Only in Simulated Mode */}
          {!isReal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-bold mb-2">Portfolio Performance</h2>
                {historyData.length > 0 ? (
                  <PortfolioLineChart data={historyData} />
                ) : (
                  <p className="text-gray-500 italic">No performance data yet.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-bold mb-2">Sector Allocation</h2>
                {sectorData.length > 0 ? (
                  <AssetAllocationPie data={sectorData} />
                ) : (
                  <p className="text-gray-500 italic">No sector data available.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}