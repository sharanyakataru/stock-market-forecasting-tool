import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash } from "react-icons/fa";

export default function Insights({ currentTickers }) {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("predictions");
  const [learningMode, setLearningMode] = useState("flashcards");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const trendingStocks = ["AAPL", "TSLA", "NVDA"];

  const flashcards = [
    { question: "What is a stock?", answer: "A stock represents ownership in a company." },
    { question: "What is diversification?", answer: "An investment strategy that spreads risk." },
    { question: "What is dollar-cost averaging?", answer: "Investing a fixed amount regularly, regardless of market conditions." },
    { question: "What is an index fund?", answer: "A type of mutual fund that tracks a specific market index, like the S&P 500." },
    { question: "What is risk management?", answer: "The process of identifying, analyzing, and mitigating investment risks." }
  ];

  const quizzes = [
    { question: "What is the primary benefit of diversification?", options: ["Higher returns", "Lower risk", "Guaranteed profits"], answer: "Lower risk" },
    { question: "What does P/E ratio stand for?", options: ["Profit/Earnings", "Price/Earnings", "Performance/Equity"], answer: "Price/Earnings" },
    { question: "How does dollar-cost averaging help investors?", options: ["Eliminates all risk", "Reduces the impact of volatility", "Guarantees high returns"], answer: "Reduces the impact of volatility" },
    { question: "What is a key advantage of index funds?", options: ["They always outperform the market", "They have low fees and broad diversification", "They require active management"], answer: "They have low fees and broad diversification" },
    { question: "Which of these is a risk management strategy?", options: ["Investing all money in one stock", "Ignoring market trends", "Setting stop-loss orders"], answer: "Setting stop-loss orders" }
  ];

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    setIsCorrect(option === quizzes[quizIndex].answer);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizIndex((prev) => (prev + 1) % quizzes.length);
  };

  const fetchPredictions = (tickers) => {
    if (tickers.length === 0) return;
    setIsLoading(true);
    const tickersParam = tickers.join(",");

    fetch(`http://127.0.0.1:8000/predict?tickers=${tickersParam}`)
      .then((res) => res.json())
      .then((data) => {
        const validPredictions = tickers
          .map((ticker) => ({
            ticker,
            predictions: data[ticker]?.predictions || [],
          }))
          .filter((stock) => stock.predictions.length > 0);
        setPredictions(validPredictions);
      })
      .catch((err) => console.error("Error fetching predictions:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPredictions(trendingStocks);
    if (currentTickers.length > 0) {
      fetchPredictions(currentTickers);
    }
  }, [currentTickers]);

  const addToWatchlist = async () => {
    if (searchInput && !watchlist.some((stock) => stock.ticker === searchInput.toUpperCase())) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/predict?tickers=${searchInput.toUpperCase()}`);
        const data = await response.json();
        const newStock = {
          ticker: searchInput.toUpperCase(),
          predictions: data[searchInput.toUpperCase()]?.predictions || [],
        };
        setWatchlist([...watchlist, newStock]);
        setSearchInput("");
      } catch (err) {
        console.error("Error fetching predictions:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeFromWatchlist = (ticker) => {
    setWatchlist(watchlist.filter((stock) => stock.ticker !== ticker));
  };

  return (
    <div className="flex flex-row bg-gray-50 min-h-screen w-full p-6">
      <div className="flex-1">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-6 py-2 rounded-full font-semibold ${activeTab === "predictions" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("predictions")}
          >
            Predictions
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold ${activeTab === "learn" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("learn")}
          >
            Learn
          </button>
        </div>

        {activeTab === "predictions" ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Next 7-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading ? (
                <p className="text-gray-600">Loading predictions...</p>
              ) : predictions.length > 0 ? (
                predictions.map((stock, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="font-bold text-lg">{stock.ticker}</h3>
                    {stock.predictions.map((pred, index) => (
                      <div key={index} className="mt-2 flex justify-between items-center">
                        <span className="text-gray-600 text-sm">{pred.date}</span>
                        <span className={`p-1 rounded-full ${pred.predicted_price >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {pred.predicted_price >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        </span>
                        <span className="text-gray-800 font-medium">${pred.predicted_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Search for a stock to see its 7-day forecast</p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Watchlist</h2>
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter stock symbol..."
                  className="p-2 border rounded mr-2 flex-grow"
                />
                <button 
                  onClick={addToWatchlist} 
                  className="px-4 py-1 bg-purple-500 text-white rounded flex items-center justify-center"
                >
                  <FaPlus className="mr-1" /> Add
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {watchlist.map((stock, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">{stock.ticker}</h3>
                      <button onClick={() => removeFromWatchlist(stock.ticker)} className="text-red-500">
                        <FaTrash />
                      </button>
                    </div>
                    {stock.predictions.map((pred, index) => (
                      <div key={index} className="mt-2 flex justify-between items-center">
                        <span className="text-gray-600 text-sm">{pred.date}</span>
                        <span className={`p-1 rounded-full ${pred.predicted_price >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {pred.predicted_price >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        </span>
                        <span className="text-gray-800 font-medium">${pred.predicted_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Featured Lessons</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer ${learningMode === "flashcards" ? "border-purple-500" : "border-gray-300"}`} 
                onClick={() => setLearningMode("flashcards")}
              > 
                <p className="text-purple-500 font-semibold">Flashcards</p>
                <h3 className="font-bold">Learn with Flashcards</h3>
                <p className="text-sm">Start Learning</p>
              </div>
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer ${learningMode === "quiz" ? "border-purple-500" : "border-gray-300"}`} 
                onClick={() => setLearningMode("quiz")}
              > 
                <p className="text-purple-500 font-semibold">Quiz</p>
                <h3 className="font-bold">Test Your Knowledge</h3>
                <p className="text-sm">Start Learning</p>
              </div>
            </div>
            {learningMode === "flashcards" ? (
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="font-bold mb-2">{flashcards[flashcardIndex].question}</h3>
                <p>{flashcards[flashcardIndex].answer}</p>
                <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded" onClick={() => setFlashcardIndex((prev) => (prev + 1) % flashcards.length)}>Next</button>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="font-bold mb-2">{quizzes[quizIndex].question}</h3>
                <ul>
                  {quizzes[quizIndex].options.map((option, index) => (
                    <li
                      key={index}
                      className={`py-2 px-4 cursor-pointer rounded ${
                        selectedAnswer
                          ? option === quizzes[quizIndex].answer
                            ? "bg-green-200"
                            : option === selectedAnswer
                            ? "bg-red-200"
                            : "bg-gray-100"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => !selectedAnswer && handleAnswerClick(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                {selectedAnswer && (
                  <div className="mt-2">
                    <p className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {isCorrect ? "Correct! ✅" : "Incorrect ❌"}
                    </p>
                    <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded" onClick={handleNextQuestion}>
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}