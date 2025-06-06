import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ setCurrentTickers, userId, setUserId }) {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (event) => {
    if (event.key === "Enter" && searchInput.trim() !== "") {
      const stockSymbol = searchInput.trim().toUpperCase();

      if (location.pathname.includes("/insights")) {
        setCurrentTickers([stockSymbol]);
      } else {
        navigate(`/search/${stockSymbol}`);
      }

      setSearchInput("");
    }
  };

  const handleLoginLogout = () => {
    if (userId) {
      //Logout logic
      localStorage.removeItem("userId");
      setUserId(null); //Clear userId state
      navigate("/login"); //Redirect to login page
    } else {
      // Login logic
      navigate("/login"); //Redirect to login page
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="relative w-72">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search stocks (Press Enter)"
          className="w-full pl-10 p-2 rounded-md border border-gray-300 outline-none shadow-sm"
        />
      </div>
      <button
        onClick={handleLoginLogout} //Ensure onClick is properly attached
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        {userId ? "Logout" : "Login"}
      </button>
    </header>
  );
}

export default Header;