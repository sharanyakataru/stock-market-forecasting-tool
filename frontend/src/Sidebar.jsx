import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaChartPie, FaChartLine, FaUsers } from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); //Get current path

  const navItems = [
    { name: "Home", icon: <FaHome className="text-lg" />, path: "/" },
    { name: "Portfolio", icon: <FaChartPie className="text-lg" />, path: "/portfolio" },
    { name: "Insights", icon: <FaChartLine className="text-lg" />, path: "/insights" },
    { name: "Community", icon: <FaUsers className="text-lg" />, path: "/community" },
  ];

  return (
    <aside className="w-60 bg-white shadow-md p-6 h-screen flex flex-col">
      <h1
        className="text-xl font-bold text-purple-600 mb-6 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Stock Market Forecaster
      </h1>

      <nav className="flex flex-col gap-4">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 transition-colors ${
                isActive ? "text-purple-600 font-semibold" : "text-gray-700 hover:text-purple-600"
              }`}
            >
              {item.icon}
              <span className="text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}