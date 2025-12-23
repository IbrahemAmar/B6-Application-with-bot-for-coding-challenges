import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import ChallengePage from './pages/ChallengePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('auth');

  // --- User State ---
  const [userLevel, setUserLevel] = useState('Beginner');
  const [userXP, setUserXP] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPreference, setUserPreference] = useState('Algorithms');

  // --- LOGIN ---
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentView('challenge');

    if (userData) {
      setUserLevel(userData.level || 'Beginner');
      setUserXP(userData.xp || 0);
      setUserEmail(userData.email || '');
      setUserName(userData.username || '');
      setUserPreference(userData.preference || 'Algorithms');
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('auth');
    setUserXP(0);
    setUserEmail('');
    setUserName('');
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-800">

      {/* Navbar */}
      {isLoggedIn && (
        <Navbar
          currentView={currentView}
          setView={setCurrentView}
          onLogout={handleLogout}
          userName={userName}
        />
      )}

      <main className="container mx-auto px-4 mt-8">
        {/* NOT LOGGED IN */}
        {!isLoggedIn ? (
          <AuthPage onLogin={handleLogin} />
        ) : (
          <>
            {/* CHALLENGE */}
            {currentView === 'challenge' && (
              <ChallengePage
                userLevel={userLevel}
                userXP={userXP}
                userEmail={userEmail}
                userPreference={userPreference}
                setUserXP={setUserXP}
                setUserLevel={setUserLevel}
              />
            )}

            {/* HISTORY */}
            {currentView === 'history' && (
              <HistoryPage userEmail={userEmail} />
            )}

            {/* SETTINGS */}
            {currentView === 'settings' && (
              <SettingsPage
                userEmail={userEmail}
                userPreference={userPreference}
                setUserPreference={setUserPreference}
              />
            )}

            {/* DASHBOARD (OPTIONAL PLACEHOLDER) */}
            {currentView === 'dashboard' && (
              <div className="text-center py-20 text-gray-400">
                Dashboard Placeholder
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
