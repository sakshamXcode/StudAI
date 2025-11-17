import React from "react";


const StarField = () => {
  return (
    <div className="absolute inset-0 -z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#02040a] to-[#000000]" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full animate-float opacity-40">
          {Array.from({ length: 80 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 0.6}px`,
                height: `${Math.random() * 3 + 0.6}px`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.35 + Math.random() * 0.5,
              }}
              className="absolute bg-white rounded-full blur-sm"
            />
          ))}
        </div>
      </div>

      <div className="absolute -left-48 -top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#06B6D4] to-[#FF7AB6] opacity-06 blur-3xl animate-pulse-slow" style={{ opacity: 0.05 }} />
      <div className="absolute right-6 bottom-6 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#FFD166] via-[#FF6B6B] to-[#845EC2] opacity-06 blur-3xl animate-pulse-slower" style={{ opacity: 0.045 }} />
    </div>
  );
};

export default StarField;
