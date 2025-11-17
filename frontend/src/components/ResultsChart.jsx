// frontend/src/components/ResultsChart.jsx
import React, { useEffect, useState, useContext } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AuthContext } from "../context/AuthProvider";
// FIX: Use an absolute path from the /src directory for robustness
import API_BASE_URL from "/src/api.js";

// ... rest of the file is unchanged
export default function ResultsChart() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch results");
      const json = await res.json();
      const mapped = json.results.map((r) => ({
        id: r.id,
        category: r.category,
        score: r.score,
        created_at: new Date(r.created_at).toLocaleDateString(),
      }));
      setData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [token]);

  if (!token) {
    return <div className="p-4 bg-black/40 rounded-xl text-white/70">Login to view your progress.</div>;
  }

  return (
    <div className="p-4 bg-black/40 rounded-xl border border-white/6">
      <h4 className="font-semibold mb-3">Your progress</h4>
      {loading ? (
        <div>Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-white/70">No results yet. Take a mock exam to populate this chart.</div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="created_at" tick={{ fontSize: 11, fill: "#cfe8ff" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#cfe8ff" }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}