// frontend/src/components/OrbitNav.jsx
import React, { useMemo, useState } from "react";
import { FiCheckSquare, FiHeart, FiFileText, FiMessageSquare } from "react-icons/fi";

const BUTTON_DIAM = 72;

/**
 * OrbitNav with hover-to-pause behavior and clearer shared path
 *
 * - Hovering a planet pauses *that* planet's orbit (wrapper + counter-rotation).
 * - Uses pausedIndex state to control inline animationPlayState.
 */

const OrbitButton = ({ label, icon, active, onClick, onMouseEnter, onMouseLeave }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: BUTTON_DIAM + 14,
      height: BUTTON_DIAM + 14,
      borderRadius: 999,
      pointerEvents: "auto",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: BUTTON_DIAM + 10,
        height: BUTTON_DIAM + 10,
        borderRadius: 999,
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.02), rgba(0,0,0,0.04) 40%)",
        boxShadow: active ? "0 10px 30px rgba(92, 70, 204, 0.14)" : "0 8px 22px rgba(2,6,23,0.5)",
        zIndex: 59,
        pointerEvents: "none",
      }}
    />
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: BUTTON_DIAM,
        height: BUTTON_DIAM,
        borderRadius: "50%",
        background: active ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        cursor: "pointer",
      }}
    >
      <div style={{ textAlign: "center", transform: "translateY(2px)" }}>
        <div style={{ fontSize: 18 }}>{icon}</div>
        <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </button>
  </div>
);

export default function OrbitNav({ active, setActive }) {
  // ==== CONFIG: single shared path + items that ride it ====
  const sharedRadius = 8// change this to move the single path in/out
  const pathTilt = -6; // degrees, tilt of the ellipse
  const pathEcc = 1; // eccentricity (1 = circle)
  const period = 22; // seconds for a full revolution (same for all items)
  const items = [
    { id: "todo", label: "To-Do", icon: <FiCheckSquare /> },
    { id: "mental", label: "Wellness", icon: <FiHeart /> },
    { id: "resume", label: "Resume", icon: <FiFileText /> },
    { id: "chat", label: "Interview", icon: <FiMessageSquare /> },
  ];
  // =======================================================

  const [pausedIndex, setPausedIndex] = useState(null);

  // compute svg size to comfortably contain the single ring + buttons
  const { svgSize, center } = useMemo(() => {
    const maxR = Math.max(sharedRadius, Math.round(sharedRadius * pathEcc));
    const margin = 160 + BUTTON_DIAM; // slightly reduced margin
    const size = (maxR + margin) * 2;
    const minSize = 520; // lower min so it doesn't force huge height
    const finalSize = Math.max(size, minSize);

    // Reduce the final size visually so the SVG doesn't dominate
    const reduced = Math.round(finalSize * 0.78);
    return { svgSize: reduced, center: reduced / 2 };
  }, [sharedRadius, pathEcc]);

  // compute negative animationDelay so each item starts at its phase
  const phaseDelays = items.map((_, i) => {
    const phaseDeg = i * (360 / items.length);
    return -(phaseDeg / 360) * period;
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: svgSize,
        minHeight: svgSize,
        display: "flex",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      {/* embedded styles: spin + counter-spin */}
      <style>{`
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-counter-spin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

        .orbit-spin {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: 50% 50%;
          pointer-events: none;
        }
        .orbit-inner {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: 50% 50%;
          pointer-events: none;
        }
        .orbit-inner > button { pointer-events: auto; }
        .orbit-inner > button:hover { transform: scale(1.06); transition: transform 160ms ease; }
        .orbit-inner > button:focus { outline: 2px solid rgba(255,255,255,0.12); outline-offset: 4px; border-radius: 999px; }

      `}</style>

      {/* central sun (upright, not rotating) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 160,
          height: 160,
          borderRadius: "50%",
          zIndex: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        {/* outer halo */}
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, rgba(255,200,120,0.08), rgba(124,58,237,0.02) 35%, transparent 55%)",
            filter: "blur(36px)",
            zIndex: 68,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />

        {/* warm core + inner glossy disc */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 24%, #fff7e6 0%, #ffd166 14%, #ff9a66 40%, #ff6b6b 100%)",
            boxShadow: "0 30px 120px rgba(255,107,107,0.12), inset 0 8px 28px rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div style={{ textAlign: "center", color: "#ffffff", fontWeight: 800 }}>
            <div style={{ fontSize: 17 }}>AI</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>Core</div>
          </div>
        </div>

        {/* outer rim */}
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.03)",
            boxShadow: "0 8px 40px rgba(124,58,237,0.04)",
            zIndex: 69,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* SVG: single visible path */}
      <svg
        className="absolute"
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", left: 0, top: 0, zIndex: 10, pointerEvents: "none" }}
      >
        <defs>
          <filter id="glowPath" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="pathGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#55edb5" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#06B6D4" stopOpacity="0.85" />
            <stop offset="1" stopColor="#73bbc6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <g transform={`translate(${center}, ${center})`}>
          <g transform={`rotate(${pathTilt}) scale(${pathEcc}, 1)`}>
            <ellipse
              rx={sharedRadius}
              ry={Math.round(sharedRadius * pathEcc)}
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth="3"
              strokeDasharray="12 8"
              style={{ filter: "url(#glowPath)", opacity: 0.95, mixBlendMode: "screen" }}
            />
            <ellipse
              rx={Math.max(6, sharedRadius - 4)}
              ry={Math.max(6, Math.round(sharedRadius * pathEcc) - 4)}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
              strokeDasharray="8 6"
            />
          </g>
        </g>
      </svg>

      {/* buttons on the same orbit, evenly spaced using phaseDelays */}
      {items.map((it, idx) => {
        const radius = sharedRadius;
        const tilt = pathTilt;
        const ecc = pathEcc;
        const speedSec = `${period}s`;
        const phaseDelay = phaseDelays[idx];

        // wrapper size to contain the rotating group
        const padding = Math.max(120, BUTTON_DIAM * 1.2);
        const groupSize = (radius + padding) * 2;
        const transformInner = `rotate(${tilt}deg) scaleX(${ecc})`;
        const translateX = radius;

        // paused logic: check if this index is paused
        const isPaused = pausedIndex === idx;
        const wrapperAnimationStyle = {
          animationName: "orbit-spin",
          animationDuration: speedSec,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: `${phaseDelay}s`,
          animationPlayState: isPaused ? "paused" : "running",
        };
        const counterAnimationStyle = {
          animationName: "orbit-counter-spin",
          animationDuration: speedSec,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: `${phaseDelay}s`,
          animationPlayState: isPaused ? "paused" : "running",
        };

        return (
          <div
            key={it.id}
            className="orbit-spin"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: groupSize,
              height: groupSize,
              marginLeft: -(groupSize / 2),
              marginTop: -(groupSize / 2),
              transformOrigin: "50% 50%",
              pointerEvents: "none",
              zIndex: 30,
              ...wrapperAnimationStyle,
            }}
            aria-hidden="true"
          >
            <div
              className="orbit-inner"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transformOrigin: "50% 50%",
                transform: transformInner,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translateX(${translateX}px)`,
                }}
              >
                <div
                  style={{
                    transformOrigin: "50% 50%",
                    pointerEvents: "auto",
                    ...counterAnimationStyle,
                  }}
                >
                  <OrbitButton
                    label={it.label}
                    icon={it.icon}
                    active={active === it.id}
                    onClick={() => setActive(it.id)}
                    onMouseEnter={() => setPausedIndex(idx)}
                    onMouseLeave={() => setPausedIndex(null)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
