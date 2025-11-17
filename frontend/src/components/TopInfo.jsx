// frontend/src/components/TopInfo.jsx
import React, { useContext } from "react";
import { FiUser, FiGlobe } from "react-icons/fi";
import { AuthContext } from "../context/AuthProvider";

const TopInfo = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-white/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiUser /> <span>{user?.username ?? "Guest"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiGlobe /> <span>v1.0</span>
        </div>
      </div>
      <div>
        {user ? <button onClick={logout} className="text-sm text-white/70">Logout</button> : <span>Built with ❤️ — cosmic vibes</span>}
      </div>
    </div>
  );
};

export default TopInfo;
