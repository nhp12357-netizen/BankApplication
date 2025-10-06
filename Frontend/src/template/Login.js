import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${data.message}`);
        navigate("/dashboard");
      } else {
        setMessage(`${data.error}`);
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f2f5", height: "100vh" }}>
      <h1 style={{ color: "#2c3e50" }}>Welcome to NHP Bank</h1>

      {message && <div style={{ color: "red", marginBottom: "15px", fontWeight: "bold" }}>{message}</div>}

      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "white",
          display: "inline-block",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        <label htmlFor="username">Username:</label>
        <br />
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
          style={{
            width: "250px",
            padding: "10px",
            margin: "10px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
        <br />

        <label htmlFor="password">Password:</label>
        <br />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          style={{
            width: "250px",
            padding: "10px",
            margin: "10px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
        <br />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <a href="/pfmanage" style={{ margin: "10px", color: "#3498db", textDecoration: "none" }}>
          forgetpassword?
        </a>
        <a href="/reg" style={{ margin: "10px", color: "#3498db", textDecoration: "none" }}>
          Create New Account
        </a>
      </div>
    </div>
  );
}

export default Login;
