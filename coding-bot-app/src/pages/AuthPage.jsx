import React, { useState } from 'react';

const AuthPage = ({ onLogin }) => {
  // Local state to capture the selected level
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10">
      {/* Login Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
          <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
          
          {/* Simple Login - Keeps existing level */}
          <button onClick={() => onLogin(null)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
            Login (fake)
          </button>
        </div>
      </div>

      {/* Register Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Full name" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
          <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
          
          <div className="grid grid-cols-2 gap-4">
            {/* Capture the Level Selection */}
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white">
              <option>Frontend</option>
              <option>Backend</option>
            </select>
          </div>

          <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
          
          {/* Register - Sends the selected level to App */}
          <button 
            onClick={() => onLogin(selectedLevel)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg"
          >
            Create account (fake)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;