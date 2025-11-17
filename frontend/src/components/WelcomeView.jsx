// frontend/src/components/WelcomeView.jsx
import React from 'react';
import { useAuth } from '../context/AuthProvider';

export default function WelcomeView() {
  const { user } = useAuth();

  return (
    // This component renders inside a card-like container
    <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center p-6 bg-gradient-to-b from-white/3 to-white/2 rounded-2xl border border-white/6 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-bold text-white">
        Hello, {user?.username}!
      </h2>
      <p className="mt-3 max-w-md text-lg text-white/60">
        How can I help you today? Select a tool from the orbit above to get started.
      </p>
    </div>
  );
}