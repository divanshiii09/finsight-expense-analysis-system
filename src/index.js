import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ ADD THIS
import App from "./App"; // ✅ USE App (NOT AppRouter)
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>   {/* ✅ WRAP APP */}
    <App />
  </BrowserRouter>
);