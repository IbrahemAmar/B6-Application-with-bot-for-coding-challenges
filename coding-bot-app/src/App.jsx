import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ChallengeGenerator from './components/ChallengeGenerator';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('auth');

  // --- User State ---
  const [userLevel, setUserLevel] = useState('Beginner');
  const [userXP, setUserXP] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPreference, setUserPreference] = useState('Algorithms');

  // ✅ 1. RESTORE SESSION (Now uses sessionStorage)
  useEffect(() => {
    // sessionStorage clears when you close the tab!
    const savedUser = sessionStorage.getItem('codingBotUser');
    const savedView = sessionStorage.getItem('codingBotView'); 

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCurrentView(savedView || 'generator'); 
      
      setUserLevel(userData.level);
      setUserXP(userData.xp);
      setUserEmail(userData.email);
      setUserName(userData.username);
      setUserPreference(userData.preference);
    }
  }, []);

  // ✅ 2. SAVE VIEW (Now uses sessionStorage)
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('codingBotView', currentView);
    }
  }, [currentView, isLoggedIn]);

  // --- LOGIN ---
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentView('generator');

    if (userData) {
      setUserLevel(userData.level || 'Beginner');
      setUserXP(userData.xp || 0);
      setUserEmail(userData.email || '');
      setUserName(userData.username || '');
      setUserPreference(userData.preference || 'Algorithms');

      // ✅ SAVE TO SESSION ONLY
      sessionStorage.setItem('codingBotUser', JSON.stringify(userData));
      sessionStorage.setItem('codingBotView', 'generator'); 
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('auth');
    setUserXP(0);
    setUserEmail('');
    setUserName('');

    // ✅ CLEAR SESSION
    sessionStorage.removeItem('codingBotUser');
    sessionStorage.removeItem('codingBotView'); 
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-800 bg-gray-50">

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
            {/* 1. AI GENERATOR */} 
            {currentView === 'generator' && (
               <ChallengeGenerator 
                 userPreference={userPreference} 
                 userLevel={userLevel}
                 userEmail={userEmail} 
                 setUserXP={setUserXP} 
               />
            )}

            {/* 2. HISTORY */}
            {currentView === 'history' && (
              <HistoryPage userEmail={userEmail} />
            )}

            {/* 3. SETTINGS */}
            {currentView === 'settings' && (
              <SettingsPage
                userEmail={userEmail}
                userPreference={userPreference}
                setUserPreference={setUserPreference}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;