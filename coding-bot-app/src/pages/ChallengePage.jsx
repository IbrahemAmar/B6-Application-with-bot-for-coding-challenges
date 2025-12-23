import React, { useState, useEffect } from 'react';
import { problemDatabase } from '../problems';

const ChallengePage = ({
  userLevel,
  userXP,
  setUserXP,
  setUserLevel,
  userEmail,
  userPreference
}) => {

  // --- GET CURRENT PROBLEM ---
  const problem = problemDatabase[userPreference][userLevel];

  // 🔒 EDGE CASE GUARD
  if (!problem) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-6 bg-white border rounded-lg text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          No challenge available
        </h2>
        <p className="text-gray-600">
          There is currently no challenge for your level or learning path.
        </p>
      </div>
    );
  }

  // --- STATES ---
  const [code, setCode] = useState(problem.starterCode);
  const [testStatus, setTestStatus] = useState('idle');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // ⏱️ TIMER STATES
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // --- RESET WHEN PROBLEM CHANGES ---
  useEffect(() => {
    setCode(problem.starterCode);
    setTestStatus('idle');
    setHintsRevealed(0);
    setFeedbackMsg('');
    setHasStarted(false);
    setStartTime(null);
  }, [userLevel, userPreference]);

  // --- RUN TESTS ---
  const handleRunTests = () => {
    if (!hasStarted) {
      setFeedbackMsg('Please click "Start Solving" first.');
      return;
    }

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

  // --- SUCCESS HANDLER ---
  const handleSuccess = async () => {
    setTestStatus('success');

    const earnedScore = 100 - hintsRevealed * 10;

    // ⏱️ CALCULATE DURATION
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    setFeedbackMsg(
      `Great job! Saving your progress... (+${earnedScore} XP, ${durationSeconds}s)`
    );

    try {
      const response = await fetch('http://localhost:5000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: problem.title,
          difficulty: userLevel,
          score: earnedScore,
          duration: durationSeconds
        }),
      });

      const data = await response.json();


      if (response.ok) {
        setUserXP(data.updatedUser.xp);
        setUserLevel(data.updatedUser.level);
        setHasStarted(false);
        setStartTime(null);
        if (data.gainedXP === 0) {
          setFeedbackMsg("Solved again! Time recorded, but no XP gained.");
        } else {
          setFeedbackMsg(`Great job! +${data.gainedXP} XP`);
        }
        if (data.updatedUser.level !== userLevel) {
          setFeedbackMsg(
            `🎉 LEVEL UP! You are now ${data.updatedUser.level}!`
          );
        } else {
          setFeedbackMsg(`Saved! Total XP: ${data.updatedUser.xp}`);
        }
      }
    } catch (error) {
      console.error("Save Error:", error);
      setFeedbackMsg("Solved, but couldn't save to database.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">

      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{problem.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${userLevel === 'Beginner'
              ? 'bg-green-100 text-green-700'
              : userLevel === 'Intermediate'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              }`}>
              {userLevel}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {userXP} XP
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT COLUMN */}
        <div className="p-6 border-r border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 mb-6">{problem.description}</p>

          <h3 className="font-semibold text-gray-700 mb-2">Example</h3>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-6">
            {problem.example}
          </div>

          {/* AI TUTOR */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <div className="flex justify-between mb-3">
              <h4 className="font-bold text-blue-800">🤖 AI Tutor</h4>
              <span className="text-xs text-blue-600">
                {hintsRevealed} / 3 Hints used
              </span>
            </div>

            {hintsRevealed === 0 && (
              <p className="text-blue-600 text-sm italic">
                "Click 'Ask for hint' if you get stuck."
              </p>
            )}

            {problem.hints.slice(0, hintsRevealed).map((hint, i) => (
              <div key={i} className="bg-white p-2 rounded border mt-2 text-sm">
                💡 <strong>Hint {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="p-6 flex flex-col bg-gray-50/50">

          {/* START BUTTON */}
          <button
            onClick={() => {
              setHasStarted(true);
              setStartTime(Date.now());
            }}
            disabled={hasStarted}
            className={`mb-4 py-2 rounded-lg font-semibold ${hasStarted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {hasStarted ? 'Solving...' : 'Start Solving'}
          </button>

          <textarea
            className="flex-1 w-full bg-white border rounded-lg p-4 font-mono text-sm mb-4 resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setHintsRevealed(prev => Math.min(prev + 1, 3))}
              className="flex-1 border text-indigo-600 py-2 rounded-lg"
            >
              Ask for hint
            </button>

            <button
              onClick={handleRunTests}
              disabled={!hasStarted || testStatus === 'running'}
              className={`flex-1 text-white py-2 rounded-lg ${testStatus === 'running'
                ? 'bg-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
            >
              {testStatus === 'running' ? 'Running...' : 'Run tests'}
            </button>
          </div>

          <div className={`border rounded-lg p-4 ${testStatus === 'success'
            ? 'bg-green-100 border-green-200'
            : testStatus === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200'
            }`}>
            <h4 className="font-bold mb-1">
              {testStatus === 'success'
                ? 'PASSED'
                : testStatus === 'error'
                  ? 'FAILED'
                  : 'Test Results'}
            </h4>
            <p className="text-sm">{feedbackMsg || 'Run your code to see results.'}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
