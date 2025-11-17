// frontend/src/components/MicrophoneButton.jsx
import React from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';

export const MicrophoneButton = ({ isListening, startListening, stopListening, hasSupport }) => {
  if (!hasSupport) {
    return (
      <button
        type="button"
        className="p-3 rounded-full bg-gray-600/50 text-white/50 cursor-not-allowed"
        title="Speech recognition not supported in this browser"
      >
        <FiMicOff />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`p-3 rounded-full transition-colors ${
        isListening
          ? 'bg-red-500/80 text-white animate-pulse'
          // A slightly different color for the default state to distinguish it
          : 'bg-indigo-500/50 hover:bg-indigo-500/80 text-white'
      }`}
      title={isListening ? 'Stop listening' : 'Start listening'}
    >
      <FiMic />
    </button>
  );
};