import React, { useEffect, useRef, useState } from 'react';
import PeerSessionHost from './PeerSessionHost';

const ChallengeGenerator = ({
  user,             // ✅ NEW: Receive full user object
  setUser,          // ✅ NEW: Receive setter to update Navbar
  userPreference,
  userEmail,
  setTopicProgress,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const [challenge, setChallenge] = useState(null);
  const [generatedLevel, setGeneratedLevel] = useState('');
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintsRevealed, setHintsRevealed] = useState(0); 
  
  // ✅ NEW STATES
  const [forfeitData, setForfeitData] = useState(null); 
  const [successData, setSuccessData] = useState(null); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalSolveTime, setFinalSolveTime] = useState(0);
  const [submittedCode, setSubmittedCode] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const timerRef = useRef(null);

  const languageOptions = ['JavaScript', 'Python', 'Java'];

  const getFallbackStarter = (language) => {
    switch (language) {
      case 'Python':
        return '# Write your code here...';
      case 'Java':
        return '// Write your code here...';
      default:
        return '// Write your code here...';
    }
  };

  const buildChallengeId = (challengeData, language) => {
    const payload = JSON.stringify({
      title: challengeData?.title || '',
      description: challengeData?.description || '',
      testCases: challengeData?.testCases || [],
      topic: userPreference,
      language,
    });

    let hash = 5381;
    for (let i = 0; i < payload.length; i += 1) {
      hash = (hash * 33) ^ payload.charCodeAt(i);
    }
    return `ch-${(hash >>> 0).toString(16)}`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!timerActive || !startTime) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, startTime]);

  // --- 1. GENERATE ---
  const handleGenerate = async () => {
    setLoading(true);
    setChallenge(null);
    setFeedback(null);
    setForfeitData(null); // Reset
    setSuccessData(null); // Reset
    setShowSuccessModal(false);
    setShowShareModal(false);
    setFinalSolveTime(0);
    setSubmittedCode('');
    setChallengeId('');
    setGeneratedLevel('');
    setHintsRevealed(0); 
    
    try {
      const res = await fetch('https://b6-application-with-bot-for-coding.onrender.com/api/generate-challenge' , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userPreference,
          email: userEmail,
          language: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }

      setChallenge(data);
      setGeneratedLevel(data.generatedLevel);
      setUserCode(data.starterCode || getFallbackStarter(selectedLanguage));
      setChallengeId(buildChallengeId(data, selectedLanguage));
      setStartTime(Date.now()); 
      setElapsedSeconds(0);
      setTimerActive(true);

    } catch (err) { console.error(err); alert("Failed to generate."); }
    setLoading(false);
  };

  // --- 2. REVEAL HINT ---
  const handleRevealHint = () => {
    // Safety check
    if (!challenge || hintsRevealed >= challenge.hints.length) return;

    // LOGIC: If we have already revealed a hint (hintsRevealed > 0), 
    // skip the confirm. Otherwise (if it's 0), show the confirm.
    if (hintsRevealed > 0 || window.confirm("Revealing a hint costs 5 XP of the XP's for solving this question. Continue?")) {
        setHintsRevealed(prev => prev + 1);
    }
  };

  // --- 3. FORFEIT (+ Get Answer) ---
  const handleForfeit = async () => {
    if (!window.confirm("Are you sure? Failing the assessment starts you at 0 Bonus XP.")) return;
    try {
        const res = await fetch('https://b6-application-with-bot-for-coding.onrender.com/api/forfeit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: userEmail, 
                topic: userPreference,
                problemDescription: challenge.description,
                language: selectedLanguage,
            }),
        });
        const data = await res.json();
        
        // Show the answer
        setForfeitData(data.solution);
        setTimerActive(false);

        // ✅ CRITICAL FIX: Update the UI immediately using the backend response
        // Note: We check if setUser exists before calling it
        if (data.updatedUser && setUser) {
             setUser(prev => ({
                 ...prev,
                 level: data.updatedUser.currentTopicLevel, 
                 xp: data.updatedUser.currentTopicXP,      
                 topicProgress: data.updatedUser.topicProgress 
             }));
        }

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
      const res = await fetch('https://b6-application-with-bot-for-coding.onrender.com/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode,
          problemDescription: challenge.description,
          testCases: challenge.testCases,
          language: selectedLanguage,
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
        setFinalSolveTime(timeTaken);
        setTimerActive(false);
        setShowSuccessModal(true);
        setSubmittedCode(userCode);
        let points = generatedLevel === 'Beginner' ? 10 : generatedLevel === 'Intermediate' ? 20 : 30;
        const penalty = hintsRevealed * 5;
        points = Math.max(0, points - penalty); 

        const solveRes = await fetch('https://b6-application-with-bot-for-coding.onrender.com/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            title: challenge.title, 
            difficulty: generatedLevel,
            score: points,
            duration: timeTaken,
            topic: userPreference,
            language: selectedLanguage,
            challengeId: challengeId || buildChallengeId(challenge, selectedLanguage),
          }),
        });
        
        const solveData = await solveRes.json();
        
        // ✅ UPDATE NAVBAR ON SUCCESS TOO
        if (solveData.updatedUser && setUser) {
             setUser(prev => ({
                 ...prev,
                 level: solveData.updatedUser.currentTopicLevel,
                 xp: solveData.updatedUser.currentTopicXP,
                 topicProgress: solveData.updatedUser.topicProgress
             }));
        }

        // Keep this for backward compatibility if needed
        if (solveData.updatedUser?.topicProgress) {
          setTopicProgress(solveData.updatedUser.topicProgress);
        }
      }

    } catch (err) { console.error(err); }
    setChecking(false);
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Assessment</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Topic: <strong className="text-blue-600 dark:text-blue-400">{userPreference}</strong>
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Language</span>
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            disabled={Boolean(challenge && !feedback?.passed && !forfeitData)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Thinking...' : 'Start Assessment / Next Question'}
        </button>
      </div>

      {challenge && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/80 p-5 dark:border-blue-900/40 dark:bg-blue-900/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{challenge.title}</h2>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    generatedLevel === 'Beginner'
                      ? 'bg-green-500'
                      : generatedLevel === 'Intermediate'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                >
                  {generatedLevel}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!feedback?.passed && !forfeitData && (
                  <button onClick={handleForfeit} className="text-sm font-semibold text-red-500 underline">
                    I don't know (Give Up)
                  </button>
                )}
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Timer: <span className="font-mono">{formatTime(elapsedSeconds)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mb-6 text-gray-700 dark:text-gray-300">{challenge.description}</p>
          <div className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Editor language: <span className="text-gray-700 dark:text-gray-200">{selectedLanguage}</span>
          </div>

          {/* Code Editor */}
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="mb-4 h-80 w-full rounded-2xl bg-gray-900 p-4 font-mono text-sm text-white shadow-inner"
            spellCheck="false"
            disabled={feedback?.passed || forfeitData} // Lock if done
          />

          {/* Controls */}
          {!feedback?.passed && !forfeitData && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRevealHint}
                  disabled={hintsRevealed >= challenge.hints.length}
                  className="rounded-full border border-yellow-300 bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-200 disabled:opacity-60"
                >
                  💡 Reveal Hint (-5 XP)
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">{hintsRevealed} Used</span>
              </div>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="rounded-full bg-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-60"
              >
                {checking ? 'Judging...' : 'Submit & Check'}
              </button>
            </div>
          )}

          {/* Hints Display */}
          {hintsRevealed > 0 && (
             <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700/50 dark:bg-yellow-900/20">
                <h4 className="mb-2 text-sm font-bold text-yellow-800 dark:text-yellow-200">Revealed Hints:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                    {challenge.hints.slice(0, hintsRevealed).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
             </div>
          )}

          {/* ✅ 1. SUCCESS FEEDBACK (+ Better Code) */}
          {feedback && feedback.passed && (
            <div className="mt-6 animate-fade-in">
                <div className="mb-4 rounded-2xl border border-green-200 bg-green-100 p-4 text-green-900 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-200">
                    <h3 className="text-lg font-bold">✅ Passed! (+XP)</h3>
                    <p>{feedback.feedback}</p>
                </div>

                {successData && (
                    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6 text-white shadow-lg">
                        <h4 className="text-yellow-400 font-bold text-lg mb-2">🤖 AI Code Review:</h4>
                        <p className="text-gray-300 mb-4 text-sm">{successData.tips}</p>
                        <div className="rounded-xl border border-gray-600 bg-black p-4 text-sm font-mono">
                            <pre>{successData.betterSolution}</pre>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* ❌ 2. FAIL FEEDBACK */}
          {feedback && !feedback.passed && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-100 p-4 text-red-900 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-200">
              <strong>❌ Failed</strong>
              <p>{feedback.feedback}</p>
            </div>
          )}

          {/* 🏳️ 3. FORFEIT / GIVE UP SOLUTION */}
          {forfeitData && (
             <div className="mt-8 animate-fade-in">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/40 dark:bg-red-900/10">
                    <h3 className="mb-2 text-xl font-bold text-red-800 dark:text-red-200">Better Luck Next Time!</h3>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">{forfeitData.explanation}</p>
                    
                    <div className="relative rounded-xl bg-gray-900 p-4 font-mono text-sm text-white">
                        <span className="absolute top-2 right-2 text-xs text-gray-500">CORRECT SOLUTION</span>
                        <pre>{forfeitData.solutionCode}</pre>
                    </div>
                </div>
             </div>
          )}

        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">✅ Correct! You solved it.</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Time taken: <span className="font-mono">{formatTime(finalSolveTime)}</span>
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowShareModal(true);
                }}
                className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Share with online user
              </button>
            </div>
          </div>
        </div>
      )}

      <PeerSessionHost
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        challenge={challenge}
        solutionCode={submittedCode}
      />
    </div>
  );
};

export default ChallengeGenerator;