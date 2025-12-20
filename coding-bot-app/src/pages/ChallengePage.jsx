import React, { useState, useEffect } from 'react';
import { problemDatabase } from '../problems'; 

const ChallengePage = ({ userLevel, userXP, setUserXP, setUserLevel, userEmail, userPreference}) => {
  // 1. Get the current problem based on the User's Level
  const problem = problemDatabase[userPreference][userLevel];

  const [code, setCode] = useState(problem.starterCode);
  const [testStatus, setTestStatus] = useState('idle'); 
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    setCode(problem.starterCode);
    setTestStatus('idle');
    setHintsRevealed(0);
    setFeedbackMsg('');
  }, [userLevel]);

  const handleRunTests = () => {
    setTestStatus('running');
    setFeedbackMsg('AI Bot is analyzing your code...');

    setTimeout(() => {
      const isCorrect = problem.testCase(code);
      if (isCorrect) {
        handleSuccess();
      } else {
        setTestStatus('error');
        setFeedbackMsg('Bot: Incorrect solution. Try using the hints!');
      }
    }, 1500);
  };

  // --- NEW: SAVE PROGRESS TO DATABASE ---
  const handleSuccess = async () => {
    setTestStatus('success');
    
    // 1. Calculate Score (Base 100 - hints used)
    const earnedScore = 100 - (hintsRevealed * 10);

    setFeedbackMsg(`Great job! Saving your progress... (+${earnedScore} XP)`);

    try {
      // 2. Send data to Backend
      const response = await fetch('http://localhost:5000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: problem.title,
          difficulty: userLevel,
          score: earnedScore
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Update App State with real data from Database
        setUserXP(data.updatedUser.xp);
        setUserLevel(data.updatedUser.level);

        // Check if level changed (Server will tell us)
        if (data.updatedUser.level !== userLevel) {
          setFeedbackMsg(`🎉 LEVEL UP! You are now ${data.updatedUser.level}! Loading next challenge...`);
        } else {
          setFeedbackMsg(`Saved! Total XP: ${data.updatedUser.xp}`);
        }
      } 
    } catch (error) {
      console.error("Save Error:", error);
      setFeedbackMsg("Solved, but couldn't save to database (Check connection).");
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{problem.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              userLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
              userLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {userLevel}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {userXP} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Next Level</span>
            <span>{userXP % 100} / 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(userXP % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column */}
        <div className="p-6 border-r border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{problem.description}</p>

          <h3 className="font-semibold text-gray-700 mb-2">Example</h3>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm text-gray-700 mb-6 whitespace-pre-wrap">
            {problem.example}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-blue-800">🤖 AI Tutor</h4>
              <span className="text-xs text-blue-600 font-medium">{hintsRevealed} / 3 Hints used</span>
            </div>
            <div className="space-y-3 min-h-[80px]">
              {hintsRevealed === 0 && <p className="text-blue-600 text-sm italic">"I'm here to help! Click 'Ask for hint' if you get stuck."</p>}
              {problem.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div key={i} className="bg-white p-2 rounded border border-blue-100 text-sm text-gray-700 shadow-sm animate-fade-in">
                  💡 <strong>Hint {i + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-6 flex flex-col bg-gray-50/50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Your solution</h3>
          </div>
          
          <textarea
            className="flex-1 w-full bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none shadow-sm"
            rows="12"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          ></textarea>

          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setHintsRevealed(prev => Math.min(prev + 1, 3))}
              className="flex-1 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg font-medium"
            >
              Ask for hint
            </button>
            
            <button 
              onClick={handleRunTests}
              disabled={testStatus === 'running'}
              className={`flex-1 text-white py-2 rounded-lg font-medium flex justify-center items-center shadow-sm ${
                testStatus === 'running' ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {testStatus === 'running' ? 'Running...' : 'Run tests'}
            </button>
          </div>

           <div className={`border rounded-lg p-4 transition-all duration-500 ${
             testStatus === 'success' ? 'bg-green-100 border-green-200' :
             testStatus === 'error' ? 'bg-red-50 border-red-200' :
             'bg-white border-gray-200'
           }`}>
             <h4 className={`font-bold mb-1 ${
               testStatus === 'success' ? 'text-green-800' :
               testStatus === 'error' ? 'text-red-700' : 'text-gray-700'
             }`}>
               {testStatus === 'success' ? 'PASSED' : testStatus === 'error' ? 'FAILED' : 'Test Results'}
             </h4>
             <p className="text-sm text-gray-600">{feedbackMsg || "Run your code to see results."}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;