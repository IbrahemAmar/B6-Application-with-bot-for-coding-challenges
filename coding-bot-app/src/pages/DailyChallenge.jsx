import React from 'react';

const DailyChallenge = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Challenge</h1>
        <p className="text-gray-600 mb-8">Today's coding challenge.</p>
        
        {/* Mock challenge content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Problem Statement</h2>
          <p className="text-gray-700 mb-6">Write a function to reverse a string.</p>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Your Solution:</label>
            <textarea 
              className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Write your code here"
            ></textarea>
          </div>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200">
            Submit Solution
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
