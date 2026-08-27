import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import AuthGate from "./pages/AuthGate";
import { AuthProvider } from "./context/AuthContext";

import "./style.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>
);