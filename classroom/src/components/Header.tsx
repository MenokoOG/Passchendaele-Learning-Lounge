// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="w-full border-b dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ background: "linear-gradient(135deg,#ff8c00,#7c3aed)" }}
          >
            ML
          </div>
          <div>
            <Link to="/" className="text-lg font-semibold block">
              M3n0koOg Learning Lounge
            </Link>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Practical, accessible learning for builders
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link to="/" className="px-2 py-1 rounded a11y-focus">
            Home
          </Link>
          <Link to="/courses" className="px-2 py-1 rounded a11y-focus">
            Courses
          </Link>
          <Link to="/dashboard" className="px-2 py-1 rounded a11y-focus">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
