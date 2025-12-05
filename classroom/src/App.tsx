import React from "react";
import Lessons from "./pages/Lessons";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-slate-100">
      <header className="max-w-6xl mx-auto p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Google Python — Classroom</h1>
        <div className="text-sm opacity-80">Instructor: M3n0koOg</div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <Lessons />
      </main>
      <footer className="max-w-6xl mx-auto p-6 text-sm text-center text-slate-300">
        Built for internal training — use responsibly.
      </footer>
    </div>
  );
}
