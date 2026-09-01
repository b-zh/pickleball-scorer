import React, { useState, useEffect } from 'react';

// Custom hook to detect Apple Watch (by screen dimensions & user-agent)
function useIsWatch() {
  const [isWatch, setIsWatch] = useState(false);

  useEffect(() => {
    const checkIsWatch = () => {
      const isWatchAgent = /Watch|AppleWatch/i.test(navigator.userAgent);
      const isWatchSize = window.innerWidth <= 300 || window.innerHeight <= 360;
      setIsWatch(isWatchAgent || isWatchSize);
    };

    checkIsWatch();
    window.addEventListener('resize', checkIsWatch);
    return () => window.removeEventListener('resize', checkIsWatch);
  }, []);

  return isWatch;
}

const createInitialState = (firstServingTeam) => ({
  usScore: 0,
  opponentScore: 0,
  servingTeam: firstServingTeam, // 'us' or 'opponent'
  serverNumber: 2, // Opening serve is always Server 2
  isGameOver: false,
});

export default function App() {
  const isWatch = useIsWatch();
  const [gameStarted, setGameStarted] = useState(false);
  const [history, setHistory] = useState([createInitialState('us')]);
  const current = history[history.length - 1];

  const checkWin = (score1, score2) => score1 >= 11 && score1 - score2 >= 2;

  const handleStartGame = (firstServingTeam) => {
    setHistory([createInitialState(firstServingTeam)]);
    setGameStarted(true);
  };

  const handlePointWon = () => {
    if (current.isGameOver) return;

    const isUsServing = current.servingTeam === 'us';
    const nextScoreUs = isUsServing ? current.usScore + 1 : current.usScore;
    const nextScoreOpponent = !isUsServing ? current.opponentScore + 1 : current.opponentScore;
    const won = checkWin(
      isUsServing ? nextScoreUs : nextScoreOpponent,
      isUsServing ? nextScoreOpponent : nextScoreUs
    );

    setHistory((prev) => [
      ...prev,
      {
        ...current,
        usScore: nextScoreUs,
        opponentScore: nextScoreOpponent,
        isGameOver: won,
      },
    ]);
  };

  const handleFault = () => {
    if (current.isGameOver) return;

    if (current.serverNumber === 1) {
      setHistory((prev) => [
        ...prev,
        {
          ...current,
          serverNumber: 2,
        },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          ...current,
          servingTeam: current.servingTeam === 'us' ? 'opponent' : 'us',
          serverNumber: 1,
        },
      ]);
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setGameStarted(false);
    setHistory([createInitialState('us')]);
  };

  const isUsServing = current.servingTeam === 'us';
  const servingScore = isUsServing ? current.usScore : current.opponentScore;
  const receivingScore = isUsServing ? current.opponentScore : current.usScore;

  // -------------------------------------------------------------
  // APPLE WATCH VIEW
  // -------------------------------------------------------------
  if (isWatch) {
    const servingTeamLabel = isUsServing ? 'Us' : 'Opp';
    const receivingTeamLabel = isUsServing ? 'Opp' : 'Us';

    if (!gameStarted) {
      return (
        <div className="h-screen w-screen bg-slate-900 text-slate-100 px-2 py-1 flex flex-col justify-between items-center select-none overflow-hidden touch-manipulation">
          {/* Top Title */}
          <div className="text-[18px] font-black text-slate-400 uppercase tracking-wider shrink-0">
            Start Serve
          </div>

          {/* Extra-Large Serve Selection Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full flex-1 my-1.5 min-h-0">
            <button
              onClick={() => handleStartGame('us')}
              className="h-full min-h-18 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-transform rounded-2xl text-xl font-black text-slate-950 flex items-center justify-center shadow-lg"
            >
              Us
            </button>
            <button
              onClick={() => handleStartGame('opponent')}
              className="h-full min-h-18 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition-transform rounded-2xl text-xl font-black text-slate-200 flex items-center justify-center shadow-lg"
            >
              Opp
            </button>
          </div>

          {/* Micro Attribution */}
          <footer className="text-[9px] font-medium text-slate-500 pb-0.5 shrink-0">
            Made by <span className="text-amber-400/90 font-bold">b-zh</span>
          </footer>
        </div>
      );
    }

    return (
      <div className="h-screen w-screen bg-slate-900 text-slate-100 px-2 pt-0.5 pb-1 flex flex-col justify-between select-none overflow-hidden touch-manipulation">
        {current.isGameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1.5 my-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 w-full">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">Game Over</span>
            <div className="text-2xl font-black text-white">
              {current.usScore > current.opponentScore ? 'We Won!' : 'Opp Won!'}
            </div>
            <div className="text-sm font-mono font-bold text-slate-300">
              Final: {current.usScore} - {current.opponentScore}
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-rose-400 border border-rose-900/60 px-4 py-1.5 rounded-xl hover:bg-rose-950/40 active:scale-95 transition-all mt-1"
            >
              Reset Game
            </button>
          </div>
        ) : (
          <>
            {/* Top: Bigger Score & Indicator */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="font-mono font-black text-5xl text-amber-400 tracking-tight leading-none">
                {servingScore} - {receivingScore} - {current.serverNumber}
              </div>
              <div className="text-[12px] font-black uppercase tracking-wider text-slate-300 mt-0.5">
                {servingTeamLabel} Serving (S{current.serverNumber})
              </div>
            </div>

            {/* Middle: Extra-Tall Action Buttons */}
            <div className="grid grid-cols-2 gap-2 my-1 w-full flex-1 min-h-0">
              <button
                onClick={handlePointWon}
                className="h-full min-h-15 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all rounded-2xl text-base font-black text-white flex items-center justify-center shadow-lg"
              >
                Point Won
              </button>
              <button
                onClick={handleFault}
                className="h-full min-h-15 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition-all rounded-2xl text-base font-black text-slate-200 flex items-center justify-center shadow-lg"
              >
                Fault
              </button>
            </div>

            {/* Bottom: Undo Link */}
            <div className="shrink-0 w-full text-center">
              <button
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="w-full py-0.5 text-xs font-bold text-slate-400 hover:text-slate-200 disabled:opacity-20 transition-colors"
              >
                Undo Last Rally
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHONE / DESKTOP VIEW
  // -------------------------------------------------------------
  const servingTeamLabel = isUsServing ? 'Us' : 'Opponent';
  const receivingTeamLabel = isUsServing ? 'Opponent' : 'Us';

  if (!gameStarted) {
    return (
      <div className="h-dvh w-full bg-slate-900 text-slate-100 px-6 py-6 flex flex-col justify-between items-center select-none overflow-hidden max-w-md mx-auto">
        <div className="h-4 shrink-0" />

        <div className="w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">New Match</h1>
            <p className="text-slate-400 text-base mt-2">Who is serving first?</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleStartGame('us')}
              className="w-full py-5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-2xl text-xl font-bold text-slate-950 shadow-lg"
            >
              We Serve First
            </button>
            <button
              onClick={() => handleStartGame('opponent')}
              className="w-full py-5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 transition-all rounded-2xl text-xl font-bold text-slate-200 shadow-lg"
            >
              Opponent Serves First
            </button>
          </div>
        </div>

        {/* Phone Attribution */}
        <footer className="text-center text-xs text-slate-500 shrink-0 pb-1">
          Made by{' '}
          <a
            href="https://github.com/b-zh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400/90 font-medium hover:text-amber-300 hover:underline transition-colors"
          >
            b-zh
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-slate-900 text-slate-100 px-5 pt-3 pb-6 flex flex-col justify-between select-none overflow-hidden max-w-md mx-auto touch-manipulation">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center shrink-0 pt-1">
        <h1 className="text-xs font-bold tracking-widest uppercase text-slate-500">Pickleball Score</h1>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-rose-400 border border-rose-900/60 px-3.5 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
        >
          Reset Game
        </button>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-auto py-2">
        {current.isGameOver ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 w-full text-center">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">Game Over</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {current.usScore > current.opponentScore ? 'We Won!' : 'Opponents Won!'}
            </div>
            <div className="text-xl font-mono text-slate-300 mt-2">
              Final: {current.usScore} - {current.opponentScore}
            </div>
          </div>
        ) : (
          <div className="w-full text-center">
            {/* 3-Digit Score Display */}
            <div className="flex items-center justify-center gap-1 font-mono font-black text-6xl sm:text-7xl">
              <span className="w-24 text-center text-amber-400">{servingScore}</span>
              <span className="text-slate-600 font-normal text-3xl">-</span>
              <span className="w-24 text-center text-slate-300">{receivingScore}</span>
              <span className="text-slate-600 font-normal text-3xl">-</span>
              <span className="w-24 text-center text-amber-400">{current.serverNumber}</span>
            </div>

            {/* Subtext Labels */}
            <div className="flex items-center justify-center gap-1 mt-2 text-xs font-semibold uppercase tracking-wider">
              <span className="w-24 text-center text-amber-400 font-bold truncate">
                {servingTeamLabel}
              </span>
              <span className="text-transparent text-3xl">-</span>
              <span className="w-24 text-center text-slate-400 truncate">
                {receivingTeamLabel}
              </span>
              <span className="text-transparent text-3xl">-</span>
              <span className="w-24 text-center text-slate-400">Server</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3 shrink-0 pb-1">
        <button
          onClick={handlePointWon}
          disabled={current.isGameOver}
          className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-2xl text-xl font-bold text-white shadow-lg disabled:opacity-40"
        >
          Point Won (+1)
        </button>

        <button
          onClick={handleFault}
          disabled={current.isGameOver}
          className="w-full py-4.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 transition-all rounded-2xl text-xl font-bold text-slate-200 shadow-lg disabled:opacity-40"
        >
          Fault / Side Out
        </button>

        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-20 transition-colors"
        >
          Undo Last Rally
        </button>
      </div>
    </div>
  );
}