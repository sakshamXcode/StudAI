// frontend/src/pages/MentalView.jsx
import React, { useState, useEffect } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { MicrophoneButton } from "../components/MicrophoneButton";

const CardShell = ({ children }) => <div className="p-6 bg-gradient-to-b from-white/3 to-white/2 rounded-2xl border border-white/6 shadow-2xl">{children}</div>;

const MENTAL_TEXT_KEY = 'mental_view_text';
const MENTAL_ANALYSIS_KEY = 'mental_view_analysis';

export default function MentalView() {
  const [text, setText] = useState(() => localStorage.getItem(MENTAL_TEXT_KEY) || "");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem(MENTAL_ANALYSIS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);

  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      // Append new transcript parts to existing text
      setText(prevText => prevText + transcript);
      setTranscript(''); // Clear the hook's transcript so it only appends new parts
    }
  }, [transcript, setTranscript]);

  useEffect(() => {
    localStorage.setItem(MENTAL_TEXT_KEY, text);
  }, [text]);

  useEffect(() => {
    if (analysis) {
      localStorage.setItem(MENTAL_ANALYSIS_KEY, JSON.stringify(analysis));
    } else {
      localStorage.removeItem(MENTAL_ANALYSIS_KEY);
    }
  }, [analysis]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;

    if (isListening) {
      stopListening();
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze-mental-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setText("");
    setAnalysis(null);
    setError(null);
    setTranscript('');
    localStorage.removeItem(MENTAL_TEXT_KEY);
    localStorage.removeItem(MENTAL_ANALYSIS_KEY);
  };

  return (
    <CardShell>
      <h3 className="text-2xl font-bold mb-2">Wellness Companion</h3>
      <p className="text-sm text-white/70 mb-4">A calm reflection on what you share. Your journal is saved automatically.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="relative w-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Type or speak how you're feeling..."
              className="w-full p-4 pr-16 bg-transparent border border-white/6 rounded-xl focus:ring-2 focus:ring-emerald-400 placeholder-white/40 resize-none"
            />
            <div className="absolute top-3 right-3">
                <MicrophoneButton
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    hasSupport={hasRecognitionSupport}
                />
            </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 rounded-full bg-emerald-400 text-black font-semibold" disabled={loading || !text.trim()}>
            {loading ? "Reflecting…" : "Get Reflection"}
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 rounded-full bg-white/6 text-white">
            Reset
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-4">
        {error && <div className="text-red-400">{error}</div>}
        {analysis && analysis.analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/6">
              <h4 className="font-semibold">Summary</h4>
              <p className="mt-2 text-white/70">{analysis.analysis.summary}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/6">
              <h4 className="font-semibold">Suggestions</h4>
              <ul className="list-disc list-inside mt-2 text-white/70">
                {analysis.analysis.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-emerald-100/6 rounded-xl border border-white/6">
              <h4 className="font-semibold">Affirmation</h4>
              <p className="italic mt-2 text-emerald-200">"{analysis.analysis.affirmation}"</p>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}