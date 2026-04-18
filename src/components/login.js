import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = isRegister
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        if (isRegister) {
          setMessage("Registered successfully! Now login.");
          setIsRegister(false);
        } else {
          onLogin();
        }
      } else {
        setMessage(data.message || "Something went wrong");
      }

    } catch (err) {
      console.error("ERROR:", err);
      setMessage("Server connection failed");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BRAND */}
        <div className="login-header">
          <h1>FinSight</h1>
          <p>Personal Expense Intelligence</p>
        </div>

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {isRegister ? "Register" : "Continue"}
          </button>
        </form>

        {/* TOGGLE */}
        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>

        {/* MESSAGE */}
        {message && (
          <p
            className="message"
            style={{
              color: message.toLowerCase().includes("success")
                ? "#22c55e"
                : "#ef4444"
            }}
          >
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;