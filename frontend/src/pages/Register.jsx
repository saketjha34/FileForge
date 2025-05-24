import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../config";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; // import your auth hook

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login...");
        setUsername("");
        setPassword("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.detail || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Create your FileForge Account
      </h2>
      <form className="space-y-4" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          className="w-full border px-4 py-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
