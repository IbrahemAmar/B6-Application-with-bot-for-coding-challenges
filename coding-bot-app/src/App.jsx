import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import ChallengePage from './pages/ChallengePage';
import SettingsPage from './pages/SettingsPage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('auth');
  
  // --- NEW: User Stats ---
  const [userLevel, setUserLevel] = useState('Beginner');
  const [userXP, setUserXP] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');         
  const [userPreference, setUserPreference] = useState('Algorithms');

  // 2. Update the handleLogin function
const handleLogin = (userData) => {
  setIsLoggedIn(true);
  setCurrentView('challenge');
  
  if (userData) {
    setUserLevel(userData.level);
    setUserXP(userData.xp);
    setUserEmail(userData.email);
    setUserName(userData.username);     
    setUserPreference(userData.preference);
  }
};

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('auth');
    setUserXP(0); // Reset XP on logout
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-800">
      {isLoggedIn && (
        <Navbar 
          currentView={currentView} 
          setView={setCurrentView} 
          onLogout={handleLogout}
          userName={userName} 
        />
      )}

      <main className="container mx-auto px-4 mt-8">
        {!isLoggedIn ? (
          <AuthPage onLogin={handleLogin} />
        ) : (
          <>
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
            {currentView === 'history' && <HistoryPage />}
            {/* NEW SETTINGS PAGE */}
            {currentView === 'settings' && (
              <SettingsPage 
                userEmail={userEmail}
                userPreference={userPreference}
                setUserPreference={setUserPreference}
              />
            )}
            {currentView === 'dashboard' && (
              <div className="text-center py-20 text-gray-400">
                Dashboard Placeholder
              </div>
            )}
            {currentView === 'auth' && <ChallengePage userLevel={userLevel} />} 
          </>
        )}
      </main>
    </div>
  );
}

export default App;