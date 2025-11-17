// frontend/src/pages/ResumeView.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthProvider";

const CardShell = ({ children }) => <div className="p-6 bg-gradient-to-b from-white/3 to-white/2 rounded-2xl border border-white/6 shadow-2xl">{children}</div>;

export default function ResumeView() {
  const { user } = useAuth();
  const RESUME_ANALYSIS_KEY = `resume_view_analysis_${user?.id}`;

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(() => {
    if (!user) return null;
    try {
      const saved = localStorage.getItem(RESUME_ANALYSIS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);
  
  // Create a ref for the file input to allow us to programmatically clear it
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
        if (analysis) {
          localStorage.setItem(RESUME_ANALYSIS_KEY, JSON.stringify(analysis));
        } else {
          localStorage.removeItem(RESUME_ANALYSIS_KEY);
        }
    }
  }, [analysis, user, RESUME_ANALYSIS_KEY]);

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      setError("Only PDF or DOCX allowed");
      setFile(null);
      return;
    }
    setFile(f);
    setError(null);
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setAnalysis(null); // Clear previous analysis before fetching new one
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze-resume", { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysis(data.analysis || data);
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // FIX: Added a reset function to clear the state and localStorage
  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    localStorage.removeItem(RESUME_ANALYSIS_KEY);
    // Reset the file input field so the user can re-select the same file if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <CardShell>
      <h3 className="text-2xl font-bold mb-2">Smart Resume Analyzer</h3>
      <p className="text-sm text-white/70 mb-4">Upload your resume for recommendations. Your last analysis is saved automatically.</p>
      
      <div className="flex flex-wrap gap-4 items-center">
        {/* We add the ref to the file input */}
        <input ref={fileInputRef} onChange={onChange} type="file" accept=".pdf,.docx" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
        <div className="flex gap-3">
            <button onClick={submit} disabled={!file || loading} className="px-4 py-2 rounded-full bg-indigo-500 text-white disabled:bg-indigo-500/50 disabled:cursor-not-allowed">
              {loading ? "Analyzing…" : "Analyze"}
            </button>
            {/* FIX: Added the Reset button */}
            <button onClick={reset} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                Reset
            </button>
        </div>
      </div>

      <div className="mt-6">
        {error && <div className="text-red-400 font-medium">{error}</div>}
        {analysis && (
          <div className="grid gap-4 animate-fade-in">
            <div className="p-4 bg-black/40 rounded-xl border border-white/6">
              <h4 className="font-semibold">ATS Score</h4>
              <div className="mt-2 text-3xl font-bold">{analysis.ats_compatibility_score?.score ?? "--"}/100</div>
              <p className="text-white/70 mt-1">{analysis.ats_compatibility_score?.explanation}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/6">
              <h4 className="font-semibold">Summary</h4>
              <p className="text-white/70 mt-2">{analysis.overall_summary}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/6">
              <h4 className="font-semibold">Recommendations</h4>
              <ol className="list-decimal list-inside mt-2 text-white/70 space-y-1">
                {(analysis.recommendations || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* A simple fade-in animation for when the analysis appears */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </CardShell>
  );
}