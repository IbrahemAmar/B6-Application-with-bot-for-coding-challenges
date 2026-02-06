import React, { useState } from 'react';

const SettingsPage = ({ userEmail, userPreference, setUserPreference, setTopicProgress }) => {
  // Local state for the dropdown
  const [selectedPref, setSelectedPref] = useState(userPreference || 'Algorithms');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('https://b6-application-with-bot-for-coding.onrender.com/api/user/update', {
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
        if (data.topicProgress) {
          setTopicProgress?.(data.topicProgress);
        }
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
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
      <h2 className="mb-6 border-b border-gray-100 pb-3 text-2xl font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
        User Settings
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Email Address</label>
        <input 
          type="text" 
          value={userEmail} 
          disabled 
          className="w-full rounded-lg border border-gray-200 bg-gray-100 p-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
      </div>

      <div className="mb-8">
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Preferred Topic</label>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          This controls what kind of questions the AI generates for you.
        </p>
        <select 
          value={selectedPref} 
          onChange={(e) => setSelectedPref(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="Algorithms">Algorithms</option>
          <option value="Frontend">Frontend (React, CSS, DOM)</option>
          <option value="Backend">Backend (Node, DBs, API)</option>
        </select>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className={`w-full rounded-full py-3 text-sm font-semibold text-white transition-all ${
          loading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 shadow-md hover:bg-blue-700'
        }`}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-4 p-3 rounded text-center font-medium ${
          message.includes('✅')
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;