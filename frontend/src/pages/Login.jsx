import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login({ onRegister }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      await signIn(email, password);
      window.location.href = "/dashboard";
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setError("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
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

        <div
          className="auth-particle"
          style={{ top: "18%", left: "28%" }}
        />

        <div
          className="auth-particle"
          style={{
            top: "72%",
            right: "20%",
            animationDelay: "2s",
          }}
        />

        <div
          className="auth-particle"
          style={{
            top: "35%",
            right: "12%",
            animationDelay: "4s",
          }}
        />

      </div>


      <div className="growth-auth-card">

        <div className="auth-brand">

          <div className="auth-logo">
            G
          </div>

          <h1>GrowthOS</h1>

          <p>
            Build. Learn. Grow. All in one place.
          </p>

        </div>


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-input-group">

            <Mail
              size={18}
              className="input-icon"
            />

            <input
              type="email"
              placeholder="Username or Email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
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
                setPassword(event.target.value)
              }
              required
              minLength={6}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>


          <div className="auth-options">

           <button
             type="button"
             className="forgot-password"
             onClick={handleForgotPassword}
             disabled={loading}
           >
             Forgot Password?
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
              ? "Signing in..."
              : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}

          </button>


        </form>

        <div className="create-account-section">

          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            className="create-account-btn"
            onClick={onRegister}
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;