// frontend/src/pages/TodoView.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { MicrophoneButton } from "../components/MicrophoneButton";

const CardShell = ({ children }) => <div className="p-6 bg-gradient-to-b from-white/3 to-white/2 rounded-2xl border border-white/6 shadow-2xl">{children}</div>;

const TODO_TEXT_KEY = 'todo_view_text';
const TODO_RESULT_KEY = 'todo_view_result';

export default function TodoView() {
  const [text, setText] = useState(() => localStorage.getItem(TODO_TEXT_KEY) || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => {
    try {
      const savedResult = localStorage.getItem(TODO_RESULT_KEY);
      return savedResult ? JSON.parse(savedResult) : null;
    } catch (e) {
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
    localStorage.setItem(TODO_TEXT_KEY, text);
  }, [text]);

  useEffect(() => {
    if (result) {
      localStorage.setItem(TODO_RESULT_KEY, JSON.stringify(result));
    } else {
      localStorage.removeItem(TODO_RESULT_KEY);
    }
  }, [result]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    
    if (isListening) {
        stopListening();
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/generate-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const reset = () => {
    setText("");
    setResult(null);
    setError(null);
    setTranscript('');
    localStorage.removeItem(TODO_TEXT_KEY);
    localStorage.removeItem(TODO_RESULT_KEY);
  };

  return (
    <CardShell>
      <h3 className="text-2xl font-bold mb-2">Smart To-Do Maker</h3>
      <p className="text-sm text-white/70 mb-4">Paste a brief and get a structured to-do plan. Your text is saved automatically.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="relative w-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Type or speak your goal..."
              className="w-full p-4 pr-16 bg-transparent border border-white/6 rounded-xl focus:ring-2 focus:ring-[#7C3AED] placeholder-white/40 resize-none"
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
        <div className="flex gap-3 items-center">
          <button type="submit" disabled={loading || !text.trim()} className="px-6 py-2 rounded-full bg-gradient-to-tr from-[#6fa66f] to-[#03d5fa] text-black font-semibold shadow-lg disabled:opacity-50">
            {loading ? "Generating…" : "Generate To-Dos"}
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 rounded-full bg-white/6 text-white">
            Reset
          </button>
        </div>
      </form>
      <div className="mt-6">
        {error && <div className="text-red-400">{error}</div>}
        {result && result.todos && (
          <div className="grid gap-4">
            {result.todos.map((todo) => (
              <motion.div key={todo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-black/40 border border-white/6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="text-indigo-300 text-2xl">•</div>
                  <div>
                    <div className="text-lg font-semibold">{todo.task}</div>
                    {todo.steps && (
                      <ul className="list-disc list-inside text-white/70 mt-2 space-y-1">
                        {todo.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  );
}