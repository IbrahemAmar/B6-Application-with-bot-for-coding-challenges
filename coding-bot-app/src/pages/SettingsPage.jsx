import React, { useState } from 'react';

const SettingsPage = ({ userEmail, userPreference, setUserPreference }) => {
  // Local state for the dropdown
  const [selectedPref, setSelectedPref] = useState(userPreference || 'Algorithms');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT', // ✅ Method must be PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          preference: selectedPref
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Settings Saved Successfully!');
        // Update the global app state so the AI Generator knows immediately
        setUserPreference(selectedPref);
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }

    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to connect to server.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        User Settings
      </h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">Email Address</label>
        <input 
          type="text" 
          value={userEmail} 
          disabled 
          className="w-full p-3 bg-gray-100 border rounded text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
      </div>

      <div className="mb-8">
        <label className="block text-gray-700 font-bold mb-2">Preferred Topic</label>
        <p className="text-sm text-gray-500 mb-2">
          This controls what kind of questions the AI generates for you.
        </p>
        <select 
          value={selectedPref} 
          onChange={(e) => setSelectedPref(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
        >
          <option value="Algorithms">Algorithms</option>
          <option value="Frontend">Frontend (React, CSS, DOM)</option>
          <option value="Backend">Backend (Node, DBs, API)</option>
        </select>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-3 font-bold text-white rounded-lg transition-all ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-4 p-3 rounded text-center font-medium ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;