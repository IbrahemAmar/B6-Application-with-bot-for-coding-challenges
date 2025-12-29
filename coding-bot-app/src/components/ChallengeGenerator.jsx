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

  // --- 1. GENERATE ---
  const handleGenerate = async () => {
    setLoading(true);
    setChallenge(null);
    setFeedback(null);
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

  // --- 3. FORFEIT ---
  const handleForfeit = async () => {
    if (!window.confirm("Are you sure? Failing the assessment starts you at 0 Bonus XP.")) return;
    try {
        await fetch('http://localhost:5000/api/forfeit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, topic: userPreference }),
        });
        alert("Assessment Failed. Starting at Beginner.");
        setChallenge(null);
    } catch (err) { console.error(err); }
  };

  // --- 4. CHECK & SOLVE ---
  const handleCheck = async () => {
    if (!challenge) return;
    setChecking(true);
    setFeedback(null);

    try {
      // Judge
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
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        
        // Calculate Standard Score (Backend might override this if it's the Assessment)
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
            topic: userPreference // ✅ VITAL: Send topic for assessment check
          }),
        });
        
        const solveData = await solveRes.json();

        setUserXP(solveData.updatedUser.xp); // Update UI with REAL backend XP
        alert(`🎉 Correct! You gained ${solveData.gainedXP} XP!`);
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
          <div className="flex justify-between items-start bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs text-white font-bold ${
                        generatedLevel === 'Beginner' ? 'bg-green-500' : 
                        generatedLevel === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                        {generatedLevel}
                    </span>
                    {/* Visual Badge for Assessment */}
                    {generatedLevel === 'Intermediate' && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                           ⭐ PLACEMENT TEST
                        </span>
                    )}
                </div>
             </div>
             <button onClick={handleForfeit} className="text-red-500 text-sm font-bold underline">I don't know (Give Up)</button>
          </div>

          <p className="text-gray-700 mb-6">{challenge.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {challenge.testCases.map((test, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded border text-sm font-mono">
                <div><span className="text-blue-600">In:</span> {test.input}</div>
                <div><span className="text-green-600">Out:</span> {test.expectedOutput}</div>
              </div>
            ))}
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 text-white rounded-lg mb-4"
            spellCheck="false"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleRevealHint}
                    disabled={hintsRevealed >= challenge.hints.length}
                    className="text-sm font-bold px-3 py-1 rounded border bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
                >
                    💡 Reveal Hint (-5 XP)
                </button>
                <span className="text-xs text-gray-500">{hintsRevealed} Used</span>
            </div>

            <button onClick={handleCheck} disabled={checking} className="px-8 py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-700">
              {checking ? 'Judging...' : 'Submit & Check'}
            </button>
          </div>

          {hintsRevealed > 0 && (
             <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                <h4 className="font-bold text-yellow-800 text-sm mb-2">Revealed Hints:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                    {challenge.hints.slice(0, hintsRevealed).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
             </div>
          )}

          {feedback && (
            <div className={`mt-6 p-4 rounded border-l-4 ${feedback.passed ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
              <strong>{feedback.passed ? '✅ Passed!' : '❌ Failed'}</strong>
              <p>{feedback.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeGenerator;