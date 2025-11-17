// frontend/src/context/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ai_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ai_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [loading, setLoading] = useState(false);

  // Persist token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("ai_token", token);
    } else {
      localStorage.removeItem("ai_token");
    }
  }, [token]);

  // Persist user data in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("ai_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ai_user");
    }
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    setToken,
    user,
    setUser,
    logout,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication values
 * Usage: const { user, token, setUser } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
