// frontend/src/components/ActionPills.jsx
import React from "react";
import { FiMessageSquare, FiFileText, FiHeart, FiCheckSquare } from "react-icons/fi";

export default function ActionPills({ setView }) {
  const pills = [
    { id: "chat", label: "Mock Interview", icon: <FiMessageSquare /> },
    { id: "resume", label: "Resume Analyzer", icon: <FiFileText /> },
    { id: "mental", label: "Wellness Check", icon: <FiHeart /> },
    { id: "todo", label: "To-Do Maker", icon: <FiCheckSquare /> },
  ];

  return (
    // FIX: Updated styling for a cleaner look and better spacing
    <div className="flex flex-wrap gap-4">
      {pills.map((p) => (
        <button
          key={p.id}
          onClick={() => setView(p.id)}
          // FIX: Increased padding, text size, and improved hover effect
          className="flex items-center gap-3 px-5 py-4 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/20 transform transition-all shadow-lg"
          aria-label={p.label}
        >
          <span className="bg-black/20 p-2.5 rounded-full text-lg">{p.icon}</span>
          <span className="font-semibold text-base">{p.label}</span>
        </button>
      ))}
    </div>
  );
}