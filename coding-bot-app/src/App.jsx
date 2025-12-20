import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import ChallengePage from './pages/ChallengePage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('auth');
  
  // --- NEW: User Stats ---
  // Default level is Beginner, User has 0 XP
  const [userLevel, setUserLevel] = useState('Beginner'); 
  const [userXP, setUserXP] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  // 2. Update the handleLogin function
const handleLogin = (userData) => {
  setIsLoggedIn(true);
  setCurrentView('challenge');
  
  if (userData) {
    setUserLevel(userData.level);
    setUserXP(userData.xp);
    setUserEmail(userData.email); // <--- STORE EMAIL HERE
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
                setUserXP={setUserXP}
                setUserLevel={setUserLevel}
              />
            )}
            {currentView === 'history' && <HistoryPage />}
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