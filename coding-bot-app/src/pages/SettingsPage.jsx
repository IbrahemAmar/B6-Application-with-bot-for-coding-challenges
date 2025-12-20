import React, { useState } from 'react';

const SettingsPage = ({ userEmail, userPreference, setUserPreference }) => {
  const [selectedPref, setSelectedPref] = useState(userPreference);
  const [msg, setMsg] = useState('');

  const handleUpdate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, preference: selectedPref })
      });
      if (response.ok) {
        setUserPreference(selectedPref); // Update App state
        setMsg("✅ Preference Updated Successfully!");
      }
    } catch (err) {
      setMsg("❌ Error updating settings.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">User Settings</h2>
      
      <div className="mb-6">
        <label className="block text-gray-500 text-sm mb-2">Email Address</label>
        <input disabled value={userEmail} className="w-full bg-gray-100 border border-gray-200 rounded p-3 text-gray-500 cursor-not-allowed" />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Learning Path (Preference)</label>
        <select 
          value={selectedPref} 
          onChange={(e) => setSelectedPref(e.target.value)}
          className="w-full border border-gray-200 rounded p-3 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="Algorithms">Algorithms</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
        </select>
      </div>

      <button onClick={handleUpdate} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        Save Changes
      </button>
      
      {msg && <p className="mt-4 font-medium text-green-600">{msg}</p>}
    </div>
  );
};
export default SettingsPage;