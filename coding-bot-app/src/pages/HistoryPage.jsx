import React, { useEffect, useState } from 'react';

const HistoryPage = ({ userEmail }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch history from backend
  useEffect(() => {
    if (!userEmail) return;

    setLoading(true);
    setError('');

    fetch(`http://localhost:5000/api/history/${userEmail}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        return res.json();
      })
      .then(data => {
        setHistoryData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load history');
        setLoading(false);
      });
  }, [userEmail]);

  // Difficulty badge color
  const difficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // ---------- EDGE CASES ----------
  if (loading) {
    return (
      <div className="mx-auto mt-20 max-w-4xl text-center text-gray-500 dark:text-gray-400">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-4xl text-center text-red-600 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">
          No solved challenges yet
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Solve your first challenge to see progress here.
        </p>
      </div>
    );
  }

  // ---------- MAIN RENDER ----------
  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* History Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white/90 shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Solved Challenges History
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review solved tasks, scores, and timing.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Time (sec)</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {historyData.map((item) => (
                <tr
                  key={`${item.title}-${item.date}`}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-100">
                    {item.title}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyColor(item.difficulty)}`}
                    >
                      {item.difficulty}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {item.score}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {item.duration ? `${item.duration}s` : '-'}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements (Static for now) */}
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
          Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/20">
            <span className="mb-1 block font-bold text-green-700 dark:text-green-200">
              First Blood
            </span>
            <span className="text-sm text-green-600 dark:text-green-300">
              Solved your first challenge.
            </span>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-900/40 dark:bg-yellow-900/20">
            <span className="mb-1 block font-bold text-yellow-700 dark:text-yellow-200">
              Streak x5
            </span>
            <span className="text-sm text-yellow-600 dark:text-yellow-300">
              5 solved challenges.
            </span>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/40 dark:bg-purple-900/20">
            <span className="mb-1 block font-bold text-purple-700 dark:text-purple-200">
              Persistent Solver
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-300">
              Never gave up.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
