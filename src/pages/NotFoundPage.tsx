import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 glass-purple-card p-8 rounded-3xl border border-purple-500/25 shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-fuchsia-300 shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Destination Not Found
          </h1>
          <p className="text-sm text-purple-200/80 max-w-sm mx-auto">
            The page you are looking for does not exist or has wandered off into the misty mountains.
          </p>
        </div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-500 hover:to-fuchsia-500 shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to TravelTally Expenses</span>
          </Link>
        </div>
      </div>
    </main>
  );
};
