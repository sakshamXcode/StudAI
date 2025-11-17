// frontend/src/App.jsx
import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import OrbitNav from "./components/OrbitNav";
import GalaxyBackground from "./components/GalaxyBackground";
import TodoView from "./pages/TodoView";
import MentalView from "./pages/MentalView";
import ResumeView from "./pages/ResumeView";
import ChatView from "./pages/ChatView";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import "./styles/index.css";
// NOTE: WelcomeView is no longer imported because it's not needed.

const MainApp = () => {
  // FIX: Default state is now 'chat' to show the Interview view on load.
  const [view, setView] = useState('chat');
  const { user, logout } = useAuth();

  return (
    <>
      <header className="relative z-20 pt-8 pb-8">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          {/* --- Top Header Bar --- */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6fa66f] to-[#03d5fa] flex items-center justify-center text-black font-extrabold shadow-2xl">
             <img className="rounded-full" src='logo.png' />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">StudAI</h1>
                <p className="text-sm text-white/60 mt-1">Your personal career and wellness co-pilot.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <FiUser />
              <span className="font-semibold text-white">{user.username}</span>
              <button onClick={logout} className="px-4 py-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors" aria-label="Logout">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* --- FIX: New Centered "Hello" Greeting Section --- */}
        <div className="max-w-7xl mx-auto px-6 text-center pt-16 pb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Hello, {user?.username}!</h2>
            <p className="mt-3 text-lg text-white/60">
                Select a tool from the orbit below to switch tasks.
            </p>
        </div>

        {/* --- OrbitNav (Solar System View) --- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-b from-black/50 to-transparent rounded-3xl p-6 lg:p-8">
            <OrbitNav active={view} setActive={setView} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 -mt-12 relative z-30 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-10 items-start">
          <div className="order-1">
            {view === "todo" && <TodoView />}
            {view === "mental" && <MentalView />}
            {view === "resume" && <ResumeView />}
            {view === "chat" && <ChatView />}
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 left-0 w-full z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-white/50 text-center">© {new Date().getFullYear()} Students AI Assistant — made with ✨ by Friends</div>
      </footer>
    </>
  );
};

// --- These components are unchanged ---
const LoginPage = () => (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#6fa66f] to-[#03d5fa] flex items-center justify-center text-black font-extrabold shadow-2xl text-3xl">
            <img className="rounded-full" src='logo.png' />
            </div> 
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome to StudAI</h1>
            <p className="text-lg text-white/60 mt-2">Sign in or create an account to continue.</p>
        </div>
        <Login />
    </div>
);

function AppInner() {
  const { user, token } = useAuth();
  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      <GalaxyBackground />
      {token && user ? <MainApp /> : <LoginPage />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}