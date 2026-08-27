import { useState } from "react";

import {
  User,
  Mail,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";


function Register({ onLogin }) {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await signUp(
        fullName,
        email,
        password,
        { username }
      );

      if (authError) {
        setError(authError.message);
      } else {
        window.location.href = "/dashboard"; // Redirect after successful signup
      }

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="growth-auth-page">

      <div className="auth-background">

        <div className="auth-shape shape-1" />
        <div className="auth-shape shape-2" />
        <div className="auth-shape shape-3" />
        <div className="auth-shape shape-4" />
        <div className="auth-shape shape-5" />

      </div>


      <div className="growth-auth-card register-card">

        <div className="auth-brand">

          <div className="auth-logo">
            G
          </div>

          <h1>Create Account</h1>

          <p>
            Start building your future with GrowthOS.
          </p>

        </div>


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-input-group">

            <User
              size={18}
              className="input-icon"
            />

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              required
            />

          </div>


          <div className="auth-input-group">

            <Mail
              size={18}
              className="input-icon"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />

          </div>


          <div className="auth-input-group">

            <AtSign
              size={18}
              className="input-icon"
            />

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              required
            />

          </div>


          <div className="auth-input-group">

            <Lock
              size={18}
              className="input-icon"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              minLength={6}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >

              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}

            </button>

          </div>


          <div className="auth-input-group">

            <Lock
              size={18}
              className="input-icon"
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
              minLength={6}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >

              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}

            </button>

          </div>


          {error && (

            <p className="auth-error">
              {error}
            </p>

          )}


          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}

          </button>

        </form>

        <button
          type="button"
          className="back-to-login"
          onClick={onLogin}
        >
          ← Back to Sign In
        </button>

      </div>

    </div>
  );
}


export default Register;