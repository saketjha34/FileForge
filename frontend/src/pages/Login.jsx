import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../config";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; // import context hook

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
    const { login, token } = useAuth();

    useEffect(() => {
      if (token) {
        navigate("/dashboard");
      }
    }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful");
        login(data.access_token); // save token in context
        setUsername("");
        setPassword("");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast.error(data.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Login to FileForge
      </h2>
      <form className="space-y-4" onSubmit={handleLogin}>
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
