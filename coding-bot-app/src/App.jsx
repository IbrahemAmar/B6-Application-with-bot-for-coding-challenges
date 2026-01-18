import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ChallengeGenerator from './components/ChallengeGenerator';
import PeerSessionJoin from './components/PeerSessionJoin';

const AppShell = ({
  currentView,
  setCurrentView,
  user,           // ✅ Receiving full user object
  setUser,        // ✅ Receiving setter
  selectedLanguage,
  setSelectedLanguage,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Helper to calculate level/XP dynamically based on the current preference
  const getTopicStats = () => {
    const topic = user?.preference || 'Algorithms';
    const entry = user?.topicProgress?.[topic];
    // ✅ Logic: If entry doesn't exist yet, default to 'Initial'
    const level = entry?.level || 'Initial'; 
    const xpMap = entry?.xp || {};
    const currentXP = xpMap[level] || 0;
    return { level, xp: currentXP };
  };

  const { level, xp } = getTopicStats();

  // Helper for child components expecting 'setTopicProgress'
  const handleSetTopicProgress = (updateFn) => {
    setUser((prev) => {
        const newProgress = typeof updateFn === 'function' 
            ? updateFn(prev.topicProgress || {}) 
            : updateFn;
        return { ...prev, topicProgress: newProgress };
    });
  };

  // Helper for child components expecting 'setUserPreference'
  const handleSetUserPreference = (newPref) => {
      setUser(prev => ({ ...prev, preference: newPref }));
  };

  return (
    <>
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onLogout={onLogout}
        userName={user?.username || ''}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onJoinSession={() => setJoinModalOpen(true)}
        userLevel={level} // ✅ Dynamic: Updates immediately when preference changes
        userXP={xp}       // ✅ Dynamic
      />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        {currentView === 'generator' && (
          <ChallengeGenerator
            // ✅ Pass full user & setter so 'handleForfeit' works!
            user={user} 
            setUser={setUser}
            // Keep these for compatibility
            userPreference={user?.preference}
            userEmail={user?.email}
            setTopicProgress={handleSetTopicProgress} 
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        )}
        {currentView === 'history' && <HistoryPage userEmail={user?.email} />}
        {currentView === 'settings' && (
          <SettingsPage
            // ✅ FIX: Pass 'setUser' to Settings too. 
            // This allows SettingsPage to update the full user state (preference + level) atomically.
            user={user}
            setUser={setUser}
            userEmail={user?.email}
            userPreference={user?.preference}
            setUserPreference={handleSetUserPreference}
            setTopicProgress={handleSetTopicProgress}
          />
        )}
      </main>

      <PeerSessionJoin isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('generator');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('codingBotLanguage') || 'JavaScript';
  });

  // ✅ 1. UNIFIED USER STATE
  const [user, setUser] = useState({
    username: '',
    email: '',
    preference: 'Algorithms',
    topicProgress: {},
    level: 'Initial', 
    xp: 0
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('codebotTheme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [hasSavedTheme, setHasSavedTheme] = useState(() => {
    const savedTheme = localStorage.getItem('codebotTheme');
    return savedTheme === 'dark' || savedTheme === 'light';
  });

  // ✅ 2. RESTORE SESSION
  useEffect(() => {
    const savedUser = sessionStorage.getItem('codingBotUser');
    const savedView = sessionStorage.getItem('codingBotView'); 

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setCurrentView(savedView || 'generator'); 
        setUser(parsedUser); 
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  // Theme Logic
  useEffect(() => {
    if (hasSavedTheme) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (event) => setTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, [hasSavedTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // ✅ 3. SAVE SESSION
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('codingBotView', currentView);
    }
  }, [currentView, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    sessionStorage.setItem('codingBotUser', JSON.stringify(user));
  }, [isLoggedIn, user]);

  useEffect(() => {
    localStorage.setItem('codingBotLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (['/', '/signin', '/signup'].includes(location.pathname)) {
      navigate('/app', { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // --- LOGIN ---
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentView('generator');

    if (userData) {
      // Ensure we have a valid structure with defaults
      setUser({
          username: userData.username || '',
          email: userData.email || '',
          preference: userData.preference || 'Algorithms',
          topicProgress: userData.topicProgress || {},
          level: userData.level || 'Initial',
          xp: userData.xp || 0
      });

      sessionStorage.setItem('codingBotUser', JSON.stringify(userData));
      sessionStorage.setItem('codingBotView', 'generator'); 
    }
    navigate('/app');
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('generator');
    setUser({ username: '', email: '', preference: 'Algorithms', topicProgress: {} });

    sessionStorage.removeItem('codingBotUser');
    sessionStorage.removeItem('codingBotView'); 
    navigate('/signin');
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('codebotTheme', nextTheme);
    setHasSavedTheme(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 font-sans text-gray-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/app" replace />
            ) : (
              <LandingPage theme={theme} onToggleTheme={handleToggleTheme} />
            )
          }
        />
        <Route
          path="/signin"
          element={
            isLoggedIn ? (
              <Navigate to="/app" replace />
            ) : (
              <AuthPage mode="signin" onLogin={handleLogin} theme={theme} onToggleTheme={handleToggleTheme} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/app" replace />
            ) : (
              <AuthPage mode="signup" onLogin={handleLogin} theme={theme} onToggleTheme={handleToggleTheme} />
            )
          }
        />
        <Route
          path="/app"
          element={
            isLoggedIn ? (
              <AppShell
                currentView={currentView}
                setCurrentView={setCurrentView}
                // ✅ Passing the unified user state
                user={user}
                setUser={setUser}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/app' : '/'} replace />} />
      </Routes>
    </div>
  );
}

export default App;