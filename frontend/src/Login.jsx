import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUserId }) {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!input.trim()) {
      alert("Please enter a valid username.");
      return;
    }

    localStorage.setItem("userId", input.trim()); //Save userId to localStorage
    setUserId(input.trim()); //Update userId state in App.jsx
    navigate("/"); //Redirect to home page after login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <input
          type="text"
          placeholder="Enter username"
          className="p-2 border rounded w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}