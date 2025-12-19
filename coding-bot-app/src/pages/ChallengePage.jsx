import React from 'react';

const ChallengePage = () => {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Valid Parentheses</h2>
          <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">
            Intermediate
          </span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-gray-400 text-sm">Difficulty (fake)</span>
           <select className="border border-gray-200 rounded px-2 py-1 text-sm bg-white">
             <option>Intermediate</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Problem Desc */}
        <div className="p-6 border-r border-gray-100 bg-gray-50/30">
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
          </p>

          <h3 className="font-semibold text-gray-700 mb-2">Input / Output Example</h3>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm text-gray-700 mb-6">
            {/* FIXED: Wrapped in brackets and quotes to treat as a string */}
            <p>{'Input: s = "()[]{}" -> true'}</p>
            <p>{'Input: s = "(]" -> false'}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 h-32 flex items-center justify-center text-gray-400">
            Bot hints
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Your solution</h3>
          </div>
          <textarea
            className="flex-1 w-full bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
            rows="10"
            defaultValue="// Write your solution here..."
          ></textarea>

          <div className="flex gap-4 mb-6">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
              Ask for hint
            </button>
            <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors">
              Run tests
            </button>
          </div>

           <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
             <h4 className="font-semibold text-gray-700 mb-1">Test results</h4>
             <p className="text-gray-500 text-sm">No tests run yet.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;