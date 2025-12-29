import React from 'react';

const Navbar = ({ currentView, setView, onLogout, userName }) => {
  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 mb-4 md:mb-0 cursor-pointer" onClick={() => setView('generator')}>
        <h1 className="text-xl font-bold text-blue-600">CodeBotArena</h1>
      </div>
      
      {/* Navigation Links */}
      <div className="flex gap-6 text-sm font-medium text-gray-600 items-center">
        
        {/* ✅ CHANGED: Primary button is now AI Practice */}
        <button 
          onClick={() => setView('generator')} 
          className={currentView === 'generator' ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}
        >
          Practice
        </button>

        <button 
          onClick={() => setView('history')} 
          className={currentView === 'history' ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}
        >
          History
        </button>

        <button 
          onClick={() => setView('settings')} 
          className={currentView === 'settings' ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}
        >
          Settings
        </button>

        {/* User Profile Section */}
        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
          <span className="text-gray-900 font-semibold">Hi, {userName}</span>
          <button onClick={onLogout} className="text-red-500 hover:text-red-700">Logout</button>
        </div>

      </div>
    </nav>
  );
};
export default Navbar;