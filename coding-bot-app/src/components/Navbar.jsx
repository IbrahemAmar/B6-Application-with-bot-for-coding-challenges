import React from 'react';

const Navbar = ({ currentView, setView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' }, 
    { id: 'challenge', label: 'Daily Challenge' },
    { id: 'history', label: 'History & Achievements' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
      <div className="flex items-center gap-2 mb-4 md:mb-0 cursor-pointer">
        <h1 className="text-xl font-bold text-blue-600">CodeBotArena</h1>
        <span className="text-gray-400 text-sm">– AI Bot for Coding Challenges</span>
      </div>
      <div className="flex gap-6 text-sm font-medium text-gray-600 items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`hover:text-blue-600 transition-colors ${
              currentView === item.id ? 'text-blue-600 font-bold' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
        
        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="text-red-500 hover:text-red-700 font-medium ml-4"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;