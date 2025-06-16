// Home.js - Updated with enhanced styling
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Welcome to <span className="text-blue-600">FileForge</span>
        </h2>
        <p className="mt-4 text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your secure cloud storage solution. Store, sync, and share files
          effortlessly across all your devices.
        </p>
        <button
          onClick={handleGetStarted}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-10 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl px-4">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-blue-600 mb-4 text-3xl">🔒</div>
          <h3 className="font-bold text-lg mb-2">Secure Storage</h3>
          <p className="text-gray-600">
            Military-grade encryption for all your files
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-blue-600 mb-4 text-3xl">⚡</div>
          <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
          <p className="text-gray-600">Upload and access files in seconds</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-blue-600 mb-4 text-3xl">🌐</div>
          <h3 className="font-bold text-lg mb-2">Anywhere Access</h3>
          <p className="text-gray-600">Available on all your devices</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
