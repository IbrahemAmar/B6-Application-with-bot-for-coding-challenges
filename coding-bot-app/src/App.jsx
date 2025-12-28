import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import ChallengePage from './pages/ChallengePage';
import SettingsPage from './pages/SettingsPage';
import ChallengeGenerator from './components/ChallengeGenerator'; // ✅ Import

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
    // ✅ Reverted to 'challenge' so users land on the main page, not the AI page
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
    <div className="min-h-screen pb-10 font-sans text-gray-100 bg-gray-50">

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
            {/* 1. STATIC CHALLENGES */}
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

            {/* 2. AI GENERATOR (Now using User Profile Data) */}
            {currentView === 'generator' && (
               <ChallengeGenerator 
                 userPreference={userPreference} // e.g. "Backend"
                 userLevel={userLevel}           // e.g. "Intermediate"
                 userEmail={userEmail}           // Needed to save the win
                 setUserXP={setUserXP}           // Needed to update UI score
               />
            )}

            {/* 3. HISTORY */}
            {currentView === 'history' && (
              <HistoryPage userEmail={userEmail} />
            )}

            {/* 4. SETTINGS */}
            {currentView === 'settings' && (
              <SettingsPage
                userEmail={userEmail}
                userPreference={userPreference}
                setUserPreference={setUserPreference}
              />
            )}

            {/* 5. DASHBOARD PLACEHOLDER */}
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