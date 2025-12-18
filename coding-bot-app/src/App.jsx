import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DailyChallenge from './pages/DailyChallenge';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/auth">Auth</Link> | 
          <Link to="/dashboard">Dashboard</Link> | 
          <Link to="/daily-challenge">Daily Challenge</Link> | 
          <Link to="/history">History</Link>
        </nav>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-challenge" element={<DailyChallenge />} />
          <Route path="/history" element={<History />} />
          <Route path="/" element={<Dashboard />} /> {/* Default to Dashboard */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
