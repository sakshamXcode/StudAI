// frontend/src/components/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function Login() {
  const { loading, setToken, setUser, setLoading } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === 'register') {
        const regUrl = "http://127.0.0.1:8000/api/auth/register";
        
        // This logic correctly handles the optional email field
        const regPayload = { username, password };
        if (email) {
          regPayload.email = email;
        }

        const regRes = await fetch(regUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(regPayload),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.detail || "Registration failed");
        }
      }

      // Login logic
      const loginUrl = "http://127.0.0.1:8000/api/auth/login";
      const loginPayload = { username, password };
      const loginRes = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(loginData.detail || "Login failed. Please check credentials.");
      }

      setToken(loginData.access_token);

      const meRes = await fetch("http://127.0.0.1:8000/api/users/me", {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });
      const me = await meRes.json();
      if (!meRes.ok) {
        throw new Error("Failed to fetch user details after login.");
      }
      setUser(me);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-xl bg-black/40 border border-white/6 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">{mode === "login" ? "Sign In" : "Create Account"}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 rounded-md bg-transparent border border-white/6"
          required
          disabled={loading}
        />
        {mode === "register" && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full p-3 rounded-md bg-transparent border border-white/6"
            disabled={loading}
          />
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 rounded-md bg-transparent border border-white/6"
          required
          disabled={loading}
        />
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-4 py-2 rounded-full bg-indigo-600" disabled={loading}>
            {loading ? "..." : (mode === "login" ? "Sign In" : "Register")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="px-4 py-2 rounded-full bg-white/6"
            disabled={loading}
          >
            {mode === "login" ? "Create an account" : "Back to login"}
          </button>
        </div>
      </form>
    </div>
  );
}