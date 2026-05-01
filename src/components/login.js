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

      // ✅ SAFE PARSE
      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ NOT JSON RESPONSE:", text);
        setMessage("Invalid server response ❌");
        return;
      }

      console.log("✅ SERVER RESPONSE:", data);

      if (data.success) {

        const userData = {
          email,
          name: data.name || email.split("@")[0]
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // ✅ MAIN FIX HERE
        if (isRegister) {
          // 👉 NEW USER → START ONBOARDING
          onLogin(userData, true);
        } else {
          // 👉 EXISTING USER → DASHBOARD
          onLogin(userData, false);
        }

      } else {
        setMessage(data.message || "Login failed");
      }

    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setMessage("Server not reachable ❌");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

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

        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? " Login" : " Register"}
          </span>
        </p>

        {message && <p className="message">{message}</p>}

      </div>
    </div>
  );
}

export default Login;