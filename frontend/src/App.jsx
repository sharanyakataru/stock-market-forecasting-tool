import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Home";
import Portfolio from "./Portfolio";
import Insights from "./Insights";
import Community from "./Community";
import SearchPage from "./SearchPage";
import Login from "./Login";
import Header from "./Header";
import Sidebar from "./Sidebar";

function App() {
  const [userId, setUserId] = useState(null);
  const [currentTickers, setCurrentTickers] = useState([]);

  //Check for userId in localStorage on initial render
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1">
          <Header userId={userId} setUserId={setUserId} setCurrentTickers={setCurrentTickers} />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login setUserId={setUserId} />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={userId ? <Home userId={userId} /> : <Navigate to="/login" replace />} 
            />
            <Route
              path="/portfolio"
              element={userId ? <Portfolio userId={userId} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/insights"
              element={userId ? <Insights currentTickers={currentTickers} setCurrentTickers={setCurrentTickers} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/community"
              element={userId ? <Community /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/search/:query"
              element={userId ? <SearchPage /> : <Navigate to="/login" replace />}
            />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to={userId ? "/" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;