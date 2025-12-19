import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import ChallengePage from './pages/ChallengePage';

function App() {
  const [currentView, setCurrentView] = useState('auth'); // Default view

  return (
    <div className="min-h-screen pb-10">
      <Navbar currentView={currentView} setView={setCurrentView} />

      <main className="container mx-auto px-4">
        {currentView === 'auth' && <AuthPage />}
        {currentView === 'challenge' && <ChallengePage />}
        {currentView === 'history' && <HistoryPage />}
        {currentView === 'dashboard' && (
          <div className="text-center py-20 text-gray-400">
            Dashboard Placeholder
          </div>
        )}
      </main>
    </div>
  );
}

export default App;