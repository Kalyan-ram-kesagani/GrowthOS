import React from "react";
import { createRoot } from "react-dom/client";

import AuthGate from "./pages/AuthGate";
import { AuthProvider } from "./context/AuthContext";

import "./style.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </React.StrictMode>
);