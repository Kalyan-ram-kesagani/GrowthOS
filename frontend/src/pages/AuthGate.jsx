import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import Login from "./Login";
import Register from "./Register";
import App from "../App";

function AuthGate() {
  const { user, loading } = useAuth();

  const [showRegister, setShowRegister] =
    useState(false);

  if (loading) {
    return (
      <div className="authPage">
        <div className="authCard">
          <h1>GrowthOS</h1>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return <App />;
}

export default AuthGate;