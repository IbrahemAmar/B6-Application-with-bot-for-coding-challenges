import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';

const AuthPage = ({ mode = 'signin', onLogin, theme, onToggleTheme }) => {
  const isSignup = mode === 'signup';
  const [selectedPreference, setSelectedPreference] = useState('Algorithms');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  // --- LOGIN LOGIC ---
  const handleLoginSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        onLogin(data.user); 
      } else {
        alert("❌ Login Failed: " + data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server Error. Is the backend running?");
    }
  };

  // --- REGISTER LOGIC ---
  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          level: 'Beginner', // <--- AUTOMATICALLY SET TO BEGINNER
          preference: selectedPreference 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration Successful! Logging you in...");
        // Auto-login with default Beginner stats
        onLogin({ 
            username: formData.username,
            email: formData.email,
            preference: selectedPreference,
            topicProgress: {
              [selectedPreference]: {
                level: 'Beginner',
                xp: { Beginner: 0, Intermediate: 0, Advanced: 0 },
              },
            },
        }); 
      } else {
        alert("❌ Registration Failed: " + data.message);
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("❌ Server Error. Is the backend running?");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSignup) {
      handleRegister();
    } else {
      handleLoginSubmit();
    }
  };

  return (
    <div>
      <PublicHeader theme={theme} onToggleTheme={onToggleTheme} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
              {isSignup ? 'Start learning today' : 'Welcome back'}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {isSignup ? 'Create your CodeBot Arena account.' : 'Sign in to continue your practice.'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isSignup
                ? 'Track progress, unlock tailored challenges, and collaborate with peers.'
                : 'Pick up where you left off and keep your streak alive.'}
            </p>
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Why CodeBot Arena?</p>
              <ul className="mt-3 space-y-2">
                <li>• Adaptive challenges across topics.</li>
                <li>• Instant feedback and clear progress tracking.</li>
                <li>• P2P discussions to refine solutions.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isSignup ? 'Sign up' : 'Sign in'}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isSignup ? 'Create your account to get started.' : 'Enter your credentials to continue.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isSignup && (
                <input
                  name="username"
                  onChange={handleChange}
                  type="text"
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              )}
              <input
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <input
                name="password"
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              {isSignup && (
                <div>
                  <label className="ml-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Learning Path
                  </label>
                  <select
                    value={selectedPreference}
                    onChange={(event) => setSelectedPreference(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="Algorithms">Algorithms</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                  </select>
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                {isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              {isSignup ? 'Already have an account?' : 'New to CodeBot Arena?'}{' '}
              <Link
                to={isSignup ? '/signin' : '/signup'}
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;