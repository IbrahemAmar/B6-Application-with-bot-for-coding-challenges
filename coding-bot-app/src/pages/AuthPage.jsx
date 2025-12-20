import React, { useState } from 'react';

const AuthPage = ({ onLogin }) => {
  // We only need state for Preference now (Level is always Beginner)
  const [selectedPreference, setSelectedPreference] = useState('Algorithms');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN LOGIC ---
  const handleLoginSubmit = async () => {
    try {
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
        onLogin(data.user); 
      } else {
        alert("❌ Login Failed: " + data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server Error. Is the backend running?");
    }
  };

  // --- REGISTER LOGIC ---
  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          level: 'Beginner', // <--- AUTOMATICALLY SET TO BEGINNER
          preference: selectedPreference 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration Successful! Logging you in...");
        // Auto-login with default Beginner stats
        onLogin({ 
            username: formData.username,
            email: formData.email,
            level: 'Beginner', 
            xp: 0, 
            preference: selectedPreference 
        }); 
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
          
          {/* JUST ONE DROPDOWN NOW: PREFERENCE */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Learning Path</label>
            <select 
                value={selectedPreference}
                onChange={(e) => setSelectedPreference(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
            >
                <option value="Algorithms">Algorithms</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
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