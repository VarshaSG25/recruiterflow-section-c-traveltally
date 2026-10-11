import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Receipt, 
  PlusCircle, 
  Bot, 
  Database, 
  CheckCircle2, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-md shadow-purple-900/50 border border-purple-400/40 text-neon-glow'
        : 'text-purple-200/80 hover:text-white hover:bg-purple-900/40 border border-transparent'
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-purple-600 text-white shadow-md'
        : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-purple-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/40 group-hover:scale-105 group-hover:shadow-purple-500/60 transition-all border border-purple-300/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                <span>TravelTally</span>
              </div>
              <div className="text-[11px] font-mono tracking-wider font-semibold text-purple-400/90 flex items-center gap-1.5 mt-0.5">
                <span>Track</span>
                <span className="w-1 h-1 rounded-full bg-fuchsia-400" />
                <span>Split</span>
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                <span>Travel</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <NavLink to="/" end className={navLinkClasses}>
              <Receipt className="w-4 h-4 text-purple-300" />
              <span>Expenses</span>
            </NavLink>

            <NavLink to="/expenses/new" className={navLinkClasses}>
              <PlusCircle className="w-4 h-4 text-purple-300" />
              <span>Add expense</span>
            </NavLink>

            <div className="h-5 w-px bg-purple-500/20 mx-2" aria-hidden="true" />

            <NavLink to="/recruiter-bot" className={navLinkClasses} title="Section B: RecruiterBot Matching">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>RecruiterBot</span>
            </NavLink>

            <NavLink to="/sql-detective" className={navLinkClasses} title="Section B: SQL Detective Challenge">
              <Database className="w-4 h-4 text-sky-400" />
              <span>SQL Detective</span>
            </NavLink>

            <NavLink to="/qa-suite" className={navLinkClasses} title="Section A: Playwright QA Tests">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>QA Suite</span>
            </NavLink>
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-purple-950/95 backdrop-blur-2xl px-4 pt-3 pb-4 space-y-1">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
          >
            <Receipt className="w-4 h-4 text-purple-300" />
            <span>Expenses</span>
          </NavLink>

          <NavLink
            to="/expenses/new"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
          >
            <PlusCircle className="w-4 h-4 text-purple-300" />
            <span>Add expense</span>
          </NavLink>

          <div className="h-px bg-purple-500/20 my-2" />

          <NavLink
            to="/recruiter-bot"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>RecruiterBot (Section B)</span>
          </NavLink>

          <NavLink
            to="/sql-detective"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span>SQL Detective (Section B)</span>
          </NavLink>

          <NavLink
            to="/qa-suite"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>QA Suite (Section A)</span>
          </NavLink>
        </div>
      )}
    </header>
  );
};
