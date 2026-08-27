import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getCurrentSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        // Check if token is expired
        if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
          await supabase.auth.signOut();
          setSession(null);
        } else if (mounted) {
          setSession(session ?? null);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Session error:", error);

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    getCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // SIGN UP
  const signUp = async (name, email, password, { username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(
        error.message.includes("already been registered")
          ? "Email already registered. Try signing in."
          : "Failed to sign up. Please try again."
      );
    }

    // Force session update after signup
    const { data: sessionData } = await supabase.auth.getSession();
    setSession(sessionData.session);

    return data;
  };

  // EMAIL LOGIN
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(
        error.message.includes("Invalid login credentials")
          ? "Invalid email or password. Please try again."
          : "Failed to sign in. Please try again later."
      );
    }
  };

  // LOGOUT
  const signOut = async (redirectTo = "/") => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Signout error:", error);
        throw new Error("Failed to sign out. Please try again.");
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      window.location.href = redirectTo;

      return true;
    } catch (error) {
      console.error("Signout failed:", error);
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      window.location.href = redirectTo;
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}