import React, { useState } from 'react';

const AuthPage = ({ onLogin }) => {
  // 1. State for the dropdown (Beginner/Intermediate/Advanced)
  const [selectedLevel, setSelectedLevel] = useState('Beginner');
  
  // 2. State for all text inputs (Login & Register)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Helper to update state when you type in any field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN LOGIC (Talks to Backend) ---
  const handleLoginSubmit = async () => {
    try {
      // Send email/pass to your server
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Success! Pass the REAL user data (level, xp) to App.jsx
        onLogin(data.user); 
      } else {
        alert("❌ Login Failed: " + data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server Error. Is the backend running?");
    }
  };

  // --- REGISTER LOGIC (Talks to Backend) ---
  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          level: selectedLevel // Send the selected level too!
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration Successful! Logging you in...");
        // Auto-login after register, assuming fresh start
        onLogin({ level: selectedLevel, xp: 0 }); 
      } else {
        alert("❌ Registration Failed: " + data.message);
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("❌ Server Error. Is the backend running?");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10">
      
      {/* --- LOGIN CARD --- */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
        <div className="space-y-4">
          <input 
            name="email" 
            onChange={handleChange} 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" 
          />
          <input 
            name="password" 
            onChange={handleChange} 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" 
          />
          
          <button 
            onClick={handleLoginSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </div>

      {/* --- REGISTER CARD --- */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>
        <div className="space-y-4">
          <input 
            name="username" 
            onChange={handleChange} 
            type="text" 
            placeholder="Full name" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" 
          />
          <input 
            name="email" 
            onChange={handleChange} 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" 
          />
          
          <div className="grid grid-cols-2 gap-4">
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

          <input 
            name="password" 
            onChange={handleChange} 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" 
          />
          
          <button 
            onClick={handleRegister}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;