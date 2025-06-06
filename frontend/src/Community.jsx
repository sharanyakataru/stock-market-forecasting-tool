import { useState } from "react";
import { FaHome, FaChartPie, FaChartLine, FaUsers } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

const challenges = [
  { title: "Turn $1K into $10K", description: "90-day challenge: Grow your portfolio through smart investments.", participants: 234, icon: "📈" },
  { title: "Dividend Master", description: "Build a dividend portfolio yielding over 5% annually.", participants: 156, icon: "💰" },
  { title: "Green Investment", description: "Create a sustainable portfolio of renewable energy stocks.", participants: 89, icon: "🌱" },
];

const discussions = [
  { user: "X", time: "2h ago", text: "What's everyone's thought on the tech sector this week? Seeing some interesting movements in AI stocks.", prediction: "NVDA likely to see 15% growth this quarter based on AI demand.", likes: 24, comments: 8 },
  { user: "Y", time: "5h ago", text: "Just completed the $1K challenge! Here's my strategy breakdown...", likes: 156, comments: 32 },
  { user: "Z", time: "8h ago", text: "Market analysis: Energy sector showing strong recovery signals.", prediction: "XLE could break resistance at $89 within next week.", likes: 89, comments: 15 },
];

const investors = [
  { name: "S", returns: "+45.8% YTD", icon: "👩‍💼" },
  { name: "H", returns: "+38.2% YTD", icon: "👨‍💼" },
  { name: "A", returns: "+32.5% YTD", icon: "👨‍💻" },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("Challenges");

  return (
    <div className="flex flex-row bg-gray-50 min-h-screen w-full">

      {/* Main Community Content */}
      <div className="flex-1 p-6">
        
        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`w-48 h-12 rounded-xl font-medium ${activeTab === "Challenges" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setActiveTab("Challenges")}
          >
            Challenges
          </button>
          <button
            className={`w-48 h-12 rounded-xl font-medium ${activeTab === "Discussions" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setActiveTab("Discussions")}
          >
            Discussions
          </button>
        </div>

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === "Challenges" ? (
          <>
            {/* Challenges Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-purple-500 p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex justify-center items-center text-lg">
                        {challenge.icon}
                      </div>
                      <div>
                        <h3 className="text-md font-bold">{challenge.title}</h3>
                        <p className="text-gray-600 text-sm">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">{challenge.participants} participants</span>
                      </div>
                      <button className="w-36 h-10 bg-purple-500 text-white text-sm rounded-xl">
                        Join Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Investors Section (ONLY in Challenges tab) */}
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Top Investors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {investors.map((investor, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-purple-500 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex justify-center items-center text-lg">
                      {investor.icon}
                    </div>
                    <h3 className="text-md font-bold mt-2">{investor.name}</h3>
                    <p className="text-gray-600 text-sm">{investor.returns}</p>
                    <button className="w-28 h-9 bg-gray-100 text-gray-600 text-sm rounded-xl mt-3">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Community Discussions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discussions.map((discussion, index) => (
                <div key={index} className="bg-white rounded-xl border-2 border-purple-500 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <h3 className="text-md font-bold">{discussion.user}</h3>
                      <p className="text-gray-600 text-xs">{discussion.time}</p>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm mt-2">{discussion.text}</p>
                  {discussion.prediction && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-purple-600 text-sm font-medium">📊 Prediction</p>
                      <p className="text-gray-700 text-xs">{discussion.prediction}</p>
                    </div>
                  )}
                  <div className="mt-3 flex justify-between items-center text-gray-600 text-sm">
                    <span>👍 {discussion.likes}</span>
                    <span>💬 {discussion.comments}</span>
                    <FiShare2 className="text-lg cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
