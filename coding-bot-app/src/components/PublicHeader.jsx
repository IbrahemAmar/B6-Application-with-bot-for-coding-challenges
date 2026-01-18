import React from 'react';
import { Link } from 'react-router-dom';

const PublicHeader = ({ theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
          CodeBotArena
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <button
            onClick={onToggleTheme}
            className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
