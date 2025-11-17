// frontend/src/components/GalaxyBackground.jsx
import React, { useMemo } from "react";

/**
 * GalaxyBackground (updated)
 * - Uses inline zIndex and inline positioning so it reliably appears behind UI.
 * - Minimalist nebula + twinkling stars.
 */

const STAR_COUNT = 120;

export default function GalaxyBackground({ className = "" }) {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.8 + 0.3,
        opacity: 0.12 + Math.random() * 0.45,
        twinkleDelay: Math.random() * 8,
        twinkleDur: 4 + Math.random() * 6,
      });
    }
    return arr;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0, // ensure it's behind header/main which use zIndex > 0
        pointerEvents: "none",
        overflow: "hidden",
      }}
      className={className}
    >
      {/* base gradient to deepen the noir background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1200px 600px at 10% 20%, rgba(12,12,20,0.6), transparent 8%), radial-gradient(900px 500px at 85% 80%, rgba(2,6,15,0.5), transparent 6%)",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      />

      {/* nebula soft blobs */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 900"
      >
        <defs>
          <radialGradient id="neb1" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.10" />
            <stop offset="40%" stopColor="#7C3AED" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
          </radialGradient>

          <radialGradient id="neb2" cx="85%" cy="75%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.08" />
            <stop offset="30%" stopColor="#06B6D4" stopOpacity="0.035" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
          </radialGradient>

          <radialGradient id="neb3" cx="55%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#FFD166" stopOpacity="0.06" />
            <stop offset="40%" stopColor="#FFD166" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#FFD166" stopOpacity="0.0" />
          </radialGradient>

          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>

        <g style={{ filter: "url(#softBlur)" }}>
          <ellipse cx="300" cy="140" rx="420" ry="180" fill="url(#neb1)" />
          <ellipse cx="1280" cy="700" rx="360" ry="150" fill="url(#neb2)" />
          <ellipse cx="900" cy="320" rx="260" ry="100" fill="url(#neb3)" />
        </g>
      </svg>

      {/* stars as DOM nodes (so twinkle animation performs reliably) */}
      <div style={{ position: "absolute", inset: 0 }}>
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: 99,
              background: "white",
              opacity: s.opacity,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.12))",
              animation: `twinkle ${s.twinkleDur}s ease-in-out ${s.twinkleDelay}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.08; transform: translate(-50%,-50%) scale(0.9); }
          50% { opacity: 0.9; transform: translate(-50%,-50%) scale(1.05); }
          100% { opacity: 0.08; transform: translate(-50%,-50%) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
