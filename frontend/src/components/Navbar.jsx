import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Adjust the path if needed

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">FileForge</h1>
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>

        {token ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
