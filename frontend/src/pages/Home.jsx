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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight">
        Welcome to <span className="text-blue-600">FileForge</span>
      </h2>
      <p className="mt-4 text-lg md:text-xl text-gray-600 text-center max-w-xl">
        Your secure cloud storage solution. Store, sync, and share files
        effortlessly.
      </p>
      <button
        onClick={handleGetStarted}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-8 rounded-full shadow-md transition duration-200"
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
