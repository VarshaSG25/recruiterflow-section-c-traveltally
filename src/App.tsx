import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { AestheticBackground } from './components/AestheticBackground.js';
import { ExpensesPage } from './pages/ExpensesPage.js';
import { AddExpensePage } from './pages/AddExpensePage.js';
import { RecruiterBotPage } from './pages/RecruiterBotPage.js';
import { SqlDetectivePage } from './pages/SqlDetectivePage.js';
import { QaSuitePage } from './pages/QaSuitePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-purple-600 selection:text-white bg-[#0b0514] text-slate-100">
      {/* 3D / 2D Aesthetic Travel & Velvet Violet Geometric Backdrop */}
      <AestheticBackground />

      {/* Main Interactive Application Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Section C: TravelTally Core Expense Routes */}
            <Route path="/" element={<ExpensesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<AddExpensePage />} />

            {/* Section B & Section A Showcase Routes */}
            <Route path="/recruiter-bot" element={<RecruiterBotPage />} />
            <Route path="/sql-detective" element={<SqlDetectivePage />} />
            <Route path="/qa-suite" element={<QaSuitePage />} />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        <footer className="border-t border-purple-500/20 bg-purple-950/60 backdrop-blur-xl py-6 mt-16 text-center text-xs text-purple-300">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-wide">TravelTally</span>
              <span className="text-purple-400 font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30">
                Track.Split.Travel
              </span>
            </div>
            <p className="text-purple-300/80">
              © 2026 Recruiterflow Full Stack Developer Take-Home Submission
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
