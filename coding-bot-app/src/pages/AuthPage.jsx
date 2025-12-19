import React from 'react';

const AuthPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Login Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
            Login (fake)
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Layout only – real project will use backend / API.
          </p>
        </div>
      </div>

      {/* Register Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option>Frontend</option>
              <option>Backend</option>
              <option>Fullstack</option>
            </select>
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-colors">
            Create account (fake)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;