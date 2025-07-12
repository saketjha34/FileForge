
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleGetStarted = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          Welcome to <span className="text-blue-600">FileForge</span>
        </h2>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          Your secure cloud storage solution. Store, sync, and share files
          effortlessly across all your devices.
        </p>
        <button
          onClick={handleGetStarted}
          className="mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg py-2.5 sm:py-3 px-6 sm:px-10 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </div>

      {/* Feature highlights */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl px-2 sm:px-4">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-blue-600 mb-3 sm:mb-4 text-2xl sm:text-3xl">🔒</div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Secure Storage</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Military-grade encryption for all your files
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-blue-600 mb-3 sm:mb-4 text-2xl sm:text-3xl">⚡</div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Lightning Fast</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload and access files in seconds
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-blue-600 mb-3 sm:mb-4 text-2xl sm:text-3xl">🌐</div>
          <h3 className="font-bold text-base sm:text-lg mb-1">Anywhere Access</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Available on all your devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

