import React from 'react';

const Navbar = ({
  currentView,
  setView,
  onLogout,
  userName,
  userLevel,
  userXP,
  theme,
  onToggleTheme,
  onJoinSession,
}) => {
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('generator')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              CB
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">CodeBotArena</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Practice smarter</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleTheme}
              className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={onLogout}
              className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <button
              onClick={() => setView('generator')}
              className={`rounded-full px-4 py-2 transition ${
                currentView === 'generator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setView('history')}
              className={`rounded-full px-4 py-2 transition ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setView('settings')}
              className={`rounded-full px-4 py-2 transition ${
                currentView === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Settings
            </button>
            <button
              onClick={onJoinSession}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Join Session
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
              Level: <span className="text-gray-900 dark:text-gray-100">{userLevel}</span> · XP:{' '}
              <span className="text-gray-900 dark:text-gray-100">{userXP}</span>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Hi, {userName}</span>
              <button
                onClick={onToggleTheme}
                className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={onLogout}
                className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;