import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Adjust path as needed

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
    <div className="text-center mt-10">
      <h2 className="text-3xl font-bold text-blue-600">Welcome to FileForge</h2>
      <p className="mt-4 text-gray-600">Your secure cloud storage platform</p>
      <button
        onClick={handleGetStarted}
        className="mt-6 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
