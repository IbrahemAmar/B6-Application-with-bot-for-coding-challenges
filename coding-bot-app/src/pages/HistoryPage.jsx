import React from 'react';

const HistoryPage = () => {
  const historyData = [
    { title: 'Reverse Linked List', difficulty: 'Intermediate', score: 100, time: '25', date: '2025-03-01', color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Palindrome Number', difficulty: 'Beginner', score: 80, time: '15', date: '2025-02-27', color: 'bg-green-100 text-green-700' },
    { title: 'Merge Intervals', difficulty: 'Advanced', score: 95, time: '40', date: '2025-02-20', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Solved Challenges History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Time (min)</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.color}`}>
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.score}</td>
                  <td className="px-6 py-4 text-gray-600">{item.time}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Achievement 1 */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col">
            <span className="text-green-700 font-bold mb-1">First Blood</span>
            <span className="text-green-600 text-sm">Solved your first challenge.</span>
          </div>
          {/* Achievement 2 */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col">
            <span className="text-yellow-700 font-bold mb-1">Streak x5</span>
            <span className="text-yellow-600 text-sm">5 days with at least one solved challenge.</span>
          </div>
          {/* Achievement 3 */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col">
            <span className="text-purple-700 font-bold mb-1">Algo Lover</span>
            <span className="text-purple-600 text-sm">Solved 10+ algorithm problems.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;