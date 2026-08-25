import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register({ onLogin }) {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const {
      data,
      error: authError,
    } = await signUp(email, password);

    if (authError) {
      setError(authError.message);
    } else if (!data.session) {
      setMessage(
        "Account created. Check your email to confirm your account."
      );
    }

    setLoading(false);
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h1>Create your account</h1>
        <p>Start building your professional operating system.</p>

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

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
            minLength={6}
          />

          {error && (
            <p className="authError">{error}</p>
          )}

          {message && (
            <p className="authSuccess">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="textBtn"
            onClick={onLogin}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;