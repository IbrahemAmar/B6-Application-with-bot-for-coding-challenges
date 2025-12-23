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
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // ---------- EDGE CASES ----------
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center text-gray-500">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          No solved challenges yet
        </h2>
        <p className="text-gray-600">
          Solve your first challenge to see progress here.
        </p>
      </div>
    );
  }

  // ---------- MAIN RENDER ----------
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Solved Challenges History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Time (sec)</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {historyData.map((item) => (
                <tr
                  key={`${item.title}-${item.date}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {item.title}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor(item.difficulty)}`}
                    >
                      {item.difficulty}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.score}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.duration ? `${item.duration}s` : '-'}
                  </td>

                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements (Static for now) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <span className="text-green-700 font-bold block mb-1">
              First Blood
            </span>
            <span className="text-green-600 text-sm">
              Solved your first challenge.
            </span>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <span className="text-yellow-700 font-bold block mb-1">
              Streak x5
            </span>
            <span className="text-yellow-600 text-sm">
              5 solved challenges.
            </span>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <span className="text-purple-700 font-bold block mb-1">
              Persistent Solver
            </span>
            <span className="text-purple-600 text-sm">
              Never gave up.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
