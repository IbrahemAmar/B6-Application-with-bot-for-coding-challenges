import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';

const features = [
  {
    title: 'AI-Generated Challenges',
    description: 'Practice tailored problems across topics with adaptive difficulty.',
  },
  {
    title: 'Real-Time Feedback',
    description: 'Submit solutions and get instant evaluation with helpful tips.',
  },
  {
    title: 'P2P Discussions',
    description: 'Review solutions together through secure WebRTC sessions.',
  },
];

const LandingPage = ({ theme, onToggleTheme }) => {
  return (
    <div>
      <PublicHeader theme={theme} onToggleTheme={onToggleTheme} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              Train with confidence
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Level up your coding skills with guided AI practice.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              CodeBot Arena combines adaptive challenges, fast feedback, and peer discussion
              so you can practice consistently and track real progress.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Get started
              </Link>
              <Link
                to="/signin"
                className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Today’s focus</p>
                <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                  Arrays & Hash Maps
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Solve one focused challenge every day to build momentum.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent achievement</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  5-day streak — keep it going!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white shadow-xl">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Ready to practice smarter?</h2>
              <p className="mt-2 text-sm text-blue-100">
                Join CodeBot Arena to track progress and collaborate with peers.
              </p>
            </div>
            <Link
              to="/signup"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:shadow-lg"
            >
              Start for free
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
