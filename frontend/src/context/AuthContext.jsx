import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "growthos_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      const me = await fetchMe(storedToken);
      if (mounted) {
        if (me) {
          setToken(storedToken);
          setUser(me);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
        setLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
  }, [fetchMe]);

  const signUp = async (name, email, password, { username }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);

    const me = await fetchMe(data.access_token);
    if (me) setUser(me);
  };

  const signIn = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);

    const me = await fetchMe(data.access_token);
    if (me) setUser(me);
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
