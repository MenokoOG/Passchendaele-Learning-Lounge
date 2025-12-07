// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LessonPage from "./pages/Lesson";
import Videos from "./pages/Videos";
import "./index.css";

const container = document.getElementById("root") as HTMLElement | null;
if (!container) throw new Error("No #root element found in index.html");

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
