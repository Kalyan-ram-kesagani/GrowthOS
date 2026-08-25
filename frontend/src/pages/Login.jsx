import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onRegister }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error: authError } = await signIn(
      email,
      password
    );

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h1>Welcome back</h1>
        <p>Sign in to your GrowthOS account.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
          />

          {error && (
            <p className="authError">{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <button
            type="button"
            className="textBtn"
            onClick={onRegister}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;