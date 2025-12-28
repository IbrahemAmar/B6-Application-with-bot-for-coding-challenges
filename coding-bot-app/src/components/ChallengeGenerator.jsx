import React, { useState } from 'react';

const ChallengeGenerator = ({ userPreference, userEmail, setUserXP }) => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  // Challenge Data
  const [challenge, setChallenge] = useState(null);
  const [generatedLevel, setGeneratedLevel] = useState(''); // To track what AI gave us
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  // --- 1. GENERATE CHALLENGE ---
  const handleGenerate = async () => {
    setLoading(true);
    setChallenge(null);
    setFeedback(null);
    setGeneratedLevel('');
    
    try {
      // We pass 'email' so backend can check our specific level for this topic
      const res = await fetch('http://localhost:5000/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            topic: userPreference, 
            email: userEmail 
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      setChallenge(data);
      setGeneratedLevel(data.generatedLevel); // Store level (e.g. "Intermediate")
      setUserCode(data.starterCode || '// Write your code here...');
      setStartTime(Date.now()); 

    } catch (err) {
      console.error("Error generating:", err);
      alert("Failed to generate challenge. Check console.");
    }
    setLoading(false);
  };

  // --- 2. GIVE UP (Forfeit) ---
  const handleForfeit = async () => {
    if (!window.confirm("Are you sure? If this is your first assessment, your level will be set to Beginner.")) return;

    try {
        const res = await fetch('http://localhost:5000/api/forfeit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: userEmail,
                topic: userPreference
            }),
        });
        
        const data = await res.json();
        alert(data.message); // "Level set to Beginner"
        setChallenge(null);  // Reset screen
        setFeedback(null);

    } catch (err) {
        console.error(err);
    }
  };

  // --- 3. CHECK SOLUTION ---
  const handleCheck = async () => {
    if (!challenge) return;
    setChecking(true);
    setFeedback(null);

    try {
      const res = await fetch('http://localhost:5000/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode: userCode,
          problemDescription: challenge.description,
          testCases: challenge.testCases
        }),
      });
      const result = await res.json();
      setFeedback(result);

      if (result.passed) {
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        
        // Calculate Score based on the ACTUAL generated level
        const points = generatedLevel === 'Beginner' ? 10 : generatedLevel === 'Intermediate' ? 20 : 30;

        await fetch('http://localhost:5000/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            title: challenge.title, 
            difficulty: generatedLevel, // Send the level we played
            score: points,
            duration: timeTaken 
          }),
        });

        setUserXP(prev => prev + points);
        alert(`🎉 Correct! You gained ${points} XP!`);
      }

    } catch (err) {
      console.error(err);
      alert("Error checking solution");
    }
    setChecking(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          AI Interview Coach
        </h1>
        <p className="text-gray-500 mt-2">
          Current Topic: <strong className="text-blue-600">{userPreference}</strong>
        </p>
      </div>

      {/* --- CONTROL --- */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`px-8 py-3 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}
        >
          {loading ? '🧠 AI is Thinking...' : 'Start Assessment / Next Question'}
        </button>
      </div>

      {/* --- CHALLENGE DISPLAY --- */}
      {challenge && (
        <div className="animate-fade-in">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Difficulty:</span>
                    <span className={`px-2 py-0.5 rounded text-xs text-white font-bold ${
                        generatedLevel === 'Beginner' ? 'bg-green-500' : 
                        generatedLevel === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                        {generatedLevel}
                    </span>
                </div>
             </div>
             
             {/* 🛑 FORFEIT BUTTON */}
             <button 
                onClick={handleForfeit}
                className="mt-4 md:mt-0 text-red-500 hover:text-red-700 text-sm font-bold underline decoration-dotted"
             >
                I don't know (Give Up) 🏳️
             </button>
          </div>

          <p className="text-gray-700 mb-6 text-lg leading-relaxed">{challenge.description}</p>

          {/* Test Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {challenge.testCases.map((test, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded border border-gray-200 text-sm font-mono">
                <div className="text-gray-500 font-bold mb-1 uppercase text-xs">Test Case {i+1}</div>
                <div className="truncate"><span className="text-blue-600">In:</span> {test.input}</div>
                <div className="truncate"><span className="text-green-600">Out:</span> {test.expectedOutput}</div>
              </div>
            ))}
          </div>

          {/* Code Editor */}
          <div className="mb-6 relative">
            <label className="absolute top-0 right-0 bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600 rounded-bl">JAVASCRIPT</label>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 leading-6"
              spellCheck="false"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <details className="group">
              <summary className="cursor-pointer text-indigo-600 font-semibold list-none flex items-center gap-2 hover:underline">
                <span>💡 Need a Hint?</span>
              </summary>
              <ul className="mt-2 pl-4 list-disc text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-200 text-sm">
                {challenge.hints.map((hint, i) => (
                  <li key={i} className="mb-1">{hint}</li>
                ))}
              </ul>
            </details>

            <button
              onClick={handleCheck}
              disabled={checking}
              className={`px-8 py-3 font-bold rounded-lg shadow text-white transition-all ${
                checking ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {checking ? 'Judging Solution...' : 'Submit & Check 🚀'}
            </button>
          </div>

          {/* Result Feedback */}
          {feedback && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 shadow-sm ${
              feedback.passed ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-100 border-red-500 text-red-900'
            }`}>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                {feedback.passed ? <span>✅ Passed! (+XP)</span> : <span>❌ Keep Trying</span>}
              </h3>
              <p>{feedback.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeGenerator;