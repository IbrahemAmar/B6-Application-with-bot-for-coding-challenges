import React, { useState } from 'react';

const ChallengeGenerator = ({ userPreference, userEmail, setUserXP }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  const [challenge, setChallenge] = useState(null);
  const [generatedLevel, setGeneratedLevel] = useState('');
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintsRevealed, setHintsRevealed] = useState(0); 
  
  // ✅ NEW STATES
  const [forfeitData, setForfeitData] = useState(null); // Stores solution when giving up
  const [successData, setSuccessData] = useState(null); // Stores improved code when winning

  // --- 1. GENERATE ---
  const handleGenerate = async () => {
    setLoading(true);
    setChallenge(null);
    setFeedback(null);
    setForfeitData(null); // Reset
    setSuccessData(null); // Reset
    setGeneratedLevel('');
    setHintsRevealed(0); 
    
    try {
      const res = await fetch('http://localhost:5000/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: userPreference, email: userEmail }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }

      setChallenge(data);
      setGeneratedLevel(data.generatedLevel);
      setUserCode(data.starterCode || '// Write your code here...');
      setStartTime(Date.now()); 

    } catch (err) { console.error(err); alert("Failed to generate."); }
    setLoading(false);
  };

  // --- 2. REVEAL HINT ---
  const handleRevealHint = () => {
    if (hintsRevealed < challenge.hints.length) {
        if(window.confirm("Revealing a hint costs 5 XP. Continue?")) {
            setHintsRevealed(prev => prev + 1);
        }
    }
  };

  // --- 3. FORFEIT (+ Get Answer) ---
  const handleForfeit = async () => {
    if (!window.confirm("Are you sure? Failing the assessment starts you at 0 Bonus XP.")) return;
    try {
        const res = await fetch('http://localhost:5000/api/forfeit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: userEmail, 
                topic: userPreference,
                problemDescription: challenge.description // ✅ Send Desc to get answer
            }),
        });
        const data = await res.json();
        
        // Show the answer
        setForfeitData(data.solution);
        alert("Assessment Failed. See solution below.");
        
    } catch (err) { console.error(err); }
  };

  // --- 4. CHECK & SOLVE ---
  const handleCheck = async () => {
    if (!challenge) return;
    setChecking(true);
    setFeedback(null);
    setSuccessData(null);

    try {
      const res = await fetch('http://localhost:5000/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode,
          problemDescription: challenge.description,
          testCases: challenge.testCases
        }),
      });
      const result = await res.json();
      setFeedback(result);

      if (result.passed) {
        // ✅ Save Improvement Tips
        setSuccessData({
            betterSolution: result.betterSolution,
            tips: result.improvementTips
        });

        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        let points = generatedLevel === 'Beginner' ? 10 : generatedLevel === 'Intermediate' ? 20 : 30;
        const penalty = hintsRevealed * 5;
        points = Math.max(0, points - penalty); 

        const solveRes = await fetch('http://localhost:5000/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            title: challenge.title, 
            difficulty: generatedLevel,
            score: points,
            duration: timeTaken,
            topic: userPreference 
          }),
        });
        
        const solveData = await solveRes.json();
        setUserXP(solveData.updatedUser.xp);
      }

    } catch (err) { console.error(err); }
    setChecking(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Assessment</h1>
        <p className="text-gray-500 mt-2">Topic: <strong className="text-blue-600">{userPreference}</strong></p>
      </div>

      <div className="flex justify-center mb-8">
        <button onClick={handleGenerate} disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow hover:bg-blue-700">
          {loading ? 'Thinking...' : 'Start Assessment / Next Question'}
        </button>
      </div>

      {challenge && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-start bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
                <span className={`px-2 py-0.5 rounded text-xs text-white font-bold ${generatedLevel === 'Beginner' ? 'bg-green-500' : generatedLevel === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}>{generatedLevel}</span>
             </div>
             
             {!feedback?.passed && !forfeitData && (
                <button onClick={handleForfeit} className="text-red-500 text-sm font-bold underline">I don't know (Give Up)</button>
             )}
          </div>

          <p className="text-gray-700 mb-6">{challenge.description}</p>

          {/* Code Editor */}
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 text-white rounded-lg mb-4"
            spellCheck="false"
            disabled={feedback?.passed || forfeitData} // Lock if done
          />

          {/* Controls */}
          {!feedback?.passed && !forfeitData && (
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={handleRevealHint} disabled={hintsRevealed >= challenge.hints.length} className="text-sm font-bold px-3 py-1 rounded border bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">
                        💡 Reveal Hint (-5 XP)
                    </button>
                    <span className="text-xs text-gray-500">{hintsRevealed} Used</span>
                </div>
                <button onClick={handleCheck} disabled={checking} className="px-8 py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-700">
                  {checking ? 'Judging...' : 'Submit & Check'}
                </button>
            </div>
          )}

          {/* Hints Display */}
          {hintsRevealed > 0 && (
             <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                <h4 className="font-bold text-yellow-800 text-sm mb-2">Revealed Hints:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                    {challenge.hints.slice(0, hintsRevealed).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
             </div>
          )}

          {/* ✅ 1. SUCCESS FEEDBACK (+ Better Code) */}
          {feedback && feedback.passed && (
            <div className="mt-6 animate-fade-in">
                <div className="p-4 rounded-lg bg-green-100 border-l-4 border-green-500 text-green-900 mb-4">
                    <h3 className="font-bold text-lg">✅ Passed! (+XP)</h3>
                    <p>{feedback.feedback}</p>
                </div>

                {successData && (
                    <div className="bg-gray-800 rounded-lg p-6 text-white border border-gray-700">
                        <h4 className="text-yellow-400 font-bold text-lg mb-2">🤖 AI Code Review:</h4>
                        <p className="text-gray-300 mb-4 text-sm">{successData.tips}</p>
                        <div className="bg-black p-4 rounded text-sm font-mono overflow-x-auto border border-gray-600">
                            <pre>{successData.betterSolution}</pre>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* ❌ 2. FAIL FEEDBACK */}
          {feedback && !feedback.passed && (
            <div className="mt-6 p-4 rounded border-l-4 bg-red-100 border-red-500 text-red-900">
              <strong>❌ Failed</strong>
              <p>{feedback.feedback}</p>
            </div>
          )}

          {/* 🏳️ 3. FORFEIT / GIVE UP SOLUTION */}
          {forfeitData && (
             <div className="mt-8 animate-fade-in">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                    <h3 className="font-bold text-red-800 text-xl mb-2">Better Luck Next Time!</h3>
                    <p className="text-gray-700 mb-4">{forfeitData.explanation}</p>
                    
                    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm relative">
                        <span className="absolute top-2 right-2 text-xs text-gray-500">CORRECT SOLUTION</span>
                        <pre>{forfeitData.solutionCode}</pre>
                    </div>
                </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ChallengeGenerator;