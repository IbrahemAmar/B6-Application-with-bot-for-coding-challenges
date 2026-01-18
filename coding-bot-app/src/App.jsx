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
  userName,
  currentTopicLevel,
  currentTopicXP,
  userEmail,
  userPreference,
  setTopicProgress,
  selectedLanguage,
  setSelectedLanguage,
  setUserPreference,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <>
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onLogout={onLogout}
        userName={userName}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onJoinSession={() => setJoinModalOpen(true)}
        userLevel={currentTopicLevel}
        userXP={currentTopicXP}
      />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        {currentView === 'generator' && (
          <ChallengeGenerator
            userPreference={userPreference}
            userEmail={userEmail}
            setTopicProgress={setTopicProgress}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        )}
        {currentView === 'history' && <HistoryPage userEmail={userEmail} />}
        {currentView === 'settings' && (
          <SettingsPage
            userEmail={userEmail}
            userPreference={userPreference}
            setUserPreference={setUserPreference}
            setTopicProgress={setTopicProgress}
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

  // --- User State ---
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPreference, setUserPreference] = useState('Algorithms');
  const [topicProgress, setTopicProgress] = useState({});
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

  // ✅ 1. RESTORE SESSION (Now uses sessionStorage)
  useEffect(() => {
    // sessionStorage clears when you close the tab!
    const savedUser = sessionStorage.getItem('codingBotUser');
    const savedView = sessionStorage.getItem('codingBotView'); 

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCurrentView(savedView || 'generator'); 
      
      setUserEmail(userData.email);
      setUserName(userData.username);
      setUserPreference(userData.preference);
      setTopicProgress(userData.topicProgress || {});
    }
  }, []);

  // ✅ Theme setup (default to system unless saved)
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

  // ✅ 2. SAVE VIEW (Now uses sessionStorage)
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('codingBotView', currentView);
    }
  }, [currentView, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const storedUser = {
      username: userName,
      email: userEmail,
      preference: userPreference,
      topicProgress,
    };
    sessionStorage.setItem('codingBotUser', JSON.stringify(storedUser));
  }, [isLoggedIn, userName, userEmail, userPreference, topicProgress]);

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
      setUserEmail(userData.email || '');
      setUserName(userData.username || '');
      setUserPreference(userData.preference || 'Algorithms');
      setTopicProgress(userData.topicProgress || {});

      // ✅ SAVE TO SESSION ONLY
      sessionStorage.setItem('codingBotUser', JSON.stringify(userData));
      sessionStorage.setItem('codingBotView', 'generator'); 
    }
    navigate('/app');
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('generator');
    setUserEmail('');
    setUserName('');
    setTopicProgress({});

    // ✅ CLEAR SESSION
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

  const getTopicEntry = (progress, topic) => {
    const entry = progress?.[topic];
    const xp = entry?.xp || {};
    return {
      level: entry?.level || 'Beginner',
      xp: {
        Beginner: Number.isFinite(xp.Beginner) ? xp.Beginner : 0,
        Intermediate: Number.isFinite(xp.Intermediate) ? xp.Intermediate : 0,
        Advanced: Number.isFinite(xp.Advanced) ? xp.Advanced : 0,
      },
    };
  };

  useEffect(() => {
    if (!userPreference) return;
    setTopicProgress((prev) => {
      if (prev?.[userPreference]) return prev;
      const nextEntry = getTopicEntry({}, userPreference);
      return { ...prev, [userPreference]: nextEntry };
    });
  }, [userPreference]);

  const currentTopicEntry = getTopicEntry(topicProgress, userPreference);
  const currentTopicLevel = currentTopicEntry.level;
  const currentTopicXP = currentTopicEntry.xp[currentTopicLevel] || 0;

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
                userName={userName}
                currentTopicLevel={currentTopicLevel}
                currentTopicXP={currentTopicXP}
                userEmail={userEmail}
                userPreference={userPreference}
                setTopicProgress={setTopicProgress}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                setUserPreference={setUserPreference}
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