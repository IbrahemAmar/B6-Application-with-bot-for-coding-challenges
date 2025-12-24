import React, { useEffect, useState } from 'react';

const ChallengePage = ({
  userLevel,
  userXP,
  setUserXP,
  setUserLevel,
  userEmail,
  userPreference
}) => {

  // --------------------
  // STATES
  // --------------------
  const [challengeList, setChallengeList] = useState([]);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [testStatus, setTestStatus] = useState('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [startTime, setStartTime] = useState(null);

  // HINT STATES
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  // --------------------
  // FETCH CHALLENGES
  // --------------------
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/challenges?type=${userPreference}&level=${userLevel}&email=${userEmail}`
        );
        const data = await res.json();
        setChallengeList(data);
      } catch {
        setChallengeList([]);
      }
    };

    fetchChallenges();
    resetState();
  }, [userPreference, userLevel, userEmail]);

  const resetState = () => {
    setProblem(null);
    setCode('');
    setHasStarted(false);
    setTestStatus('idle');
    setFeedbackMsg('');
    setStartTime(null);
    setHint('');
    setHintLoading(false);
  };

  // --------------------
  // SELECT CHALLENGE
  // --------------------
  const handleSelectChallenge = (challenge) => {
    if (hasStarted || challenge.solved) return;
    resetState();
    setProblem(challenge);
  };

  // --------------------
  // START SOLVING
  // --------------------
  const handleStartSolving = () => {
    if (!problem || problem.solved) return;

    setHasStarted(true);
    setStartTime(Date.now());
    setCode(problem.starterCode || '');
    setFeedbackMsg('');
    setHint('');
  };

  // --------------------
  // RUN TESTS
  // --------------------
  const handleRunTests = async () => {
    if (!hasStarted || !problem) return;

    setTestStatus('running');
    setFeedbackMsg('AI Bot is testing your code...');

    try {
      const res = await fetch('http://localhost:5000/api/challenge/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          challengeId: problem.id
        })
      });

      const data = await res.json();

      if (data.passed) {
        handleSuccess();
      } else {
        setTestStatus('error');
        setFeedbackMsg(data.message || 'Incorrect solution');
      }
    } catch {
      setTestStatus('error');
      setFeedbackMsg('Judge server error');
    }
  };

  // --------------------
  // ASK HINT
  // --------------------
  const handleAskHint = async () => {
    if (!hasStarted || !problem) return;

    setHintLoading(true);
    setHint('');

    try {
      const res = await fetch('http://localhost:5000/api/challenge/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: problem.id,
          code,
          level: userLevel
        })
      });

      const data = await res.json();
      setHint(data.hint || 'No hint available.');
    } catch {
      setHint('AI hint service is not available.');
    } finally {
      setHintLoading(false);
    }
  };

  // --------------------
  // SUCCESS
  // --------------------
  const handleSuccess = async () => {
    setTestStatus('success');

    const duration = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch('http://localhost:5000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: problem.title,
          difficulty: userLevel,
          score: 100,
          duration
        })
      });

      const data = await res.json();

      if (res.ok) {
        setUserXP(data.updatedUser.xp);
        setUserLevel(data.updatedUser.level);
        setFeedbackMsg(`✅ Solved! Total XP: ${data.updatedUser.xp}`);

        const refreshed = await fetch(
          `http://localhost:5000/api/challenges?type=${userPreference}&level=${userLevel}&email=${userEmail}`
        );
        const updated = await refreshed.json();
        setChallengeList(updated);
      }
    } catch {
      setFeedbackMsg('Solved, but could not save.');
    }

    setTimeout(resetState, 1200);
  };

  // --------------------
  // UI
  // --------------------
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl border min-h-[600px]">

      {/* HEADER */}
      <div className="p-6 border-b bg-gray-50 flex justify-between">
        <h2 className="text-2xl font-bold">Daily Challenges</h2>
        <span className="font-medium">{userXP} XP</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">

        {/* LEFT */}
        <div className="p-6 border-r">
          <h3 className="font-semibold mb-3">Challenges</h3>
          <ul className="space-y-2">
            {challengeList.map(c => (
              <li
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`p-2 rounded border flex justify-between
                  ${c.solved || hasStarted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-gray-100'
                  }`}
              >
                <span>{c.title}</span>
                {c.solved && <span className="text-green-600">✔</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* MIDDLE */}
        <div className="p-6 border-r">
          {!problem ? (
            <div className="text-gray-500 italic text-center mt-10">
              Select a challenge.
            </div>
          ) : !hasStarted ? (
            <div className="text-gray-500 italic text-center mt-10">
              Click <strong>Start Solving</strong> to view the challenge.
            </div>
          ) : (
            <>
              <h3 className="font-semibold mb-2">{problem.title}</h3>
              <p className="text-gray-700">{problem.description}</p>

              {problem.example && (
                <pre className="bg-gray-100 p-4 rounded text-sm mt-4">
                  Input:
                  {problem.example.input}

                  Output:
                  {problem.example.output}
                </pre>
              )}
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="p-6">
          <button
            onClick={handleStartSolving}
            disabled={!problem || hasStarted || problem?.solved}
            className={`mb-4 px-4 py-2 rounded text-white
              ${!problem || hasStarted || problem?.solved
                ? 'bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {hasStarted ? 'Solving...' : 'Start Solving'}
          </button>

          <textarea
            className="w-full h-56 border p-3 font-mono"
            disabled={!hasStarted}
            value={code}
            onChange={e => setCode(e.target.value)}
          />

          <button
            onClick={handleRunTests}
            disabled={!hasStarted || testStatus === 'running'}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Run tests
          </button>

          <button
            onClick={handleAskHint}
            disabled={!hasStarted || hintLoading}
            className={`mt-2 px-4 py-2 rounded text-white
              ${!hasStarted || hintLoading
                ? 'bg-gray-400'
                : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            {hintLoading ? 'Thinking...' : 'Ask Hint'}
          </button>

          {hint && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm">
              🤖 <strong>Hint:</strong>
              <p className="mt-1">{hint}</p>
            </div>
          )}

          <div className="mt-4 text-sm">{feedbackMsg}</div>
        </div>

      </div>
    </div>
  );
};

export default ChallengePage;
