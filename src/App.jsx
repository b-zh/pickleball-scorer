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
  serverNumber: 2, // Opening serve of the game is always Server 2
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
        <div className="h-screen w-screen bg-black text-slate-100 p-2 flex flex-col justify-center items-center select-none overflow-hidden touch-manipulation">
          <div className="w-full text-center space-y-1.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Serve</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStartGame('us')}
                className="py-2.5 bg-amber-500 active:scale-95 transition-transform rounded-lg text-xs font-black text-slate-950"
              >
                Us
              </button>
              <button
                onClick={() => handleStartGame('opponent')}
                className="py-2.5 bg-slate-800 active:scale-95 border border-slate-700 transition-transform rounded-lg text-xs font-black text-slate-200"
              >
                Opp
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen w-screen bg-black text-slate-100 p-1.5 flex flex-col justify-between select-none overflow-hidden touch-manipulation">
        <div className="w-full flex justify-between items-center shrink-0 px-1">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="text-[10px] font-bold text-slate-400 active:text-slate-200 disabled:opacity-20"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] font-bold text-rose-400 active:text-rose-300"
          >
            Reset
          </button>
        </div>

        {current.isGameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-emerald-400 text-[10px] font-black uppercase">Game Over</span>
            <div className="text-base font-black text-white">
              {current.usScore > current.opponentScore ? 'We Won!' : 'Opp Won!'}
            </div>
            <div className="text-xs font-mono text-slate-300">
              {current.usScore} - {current.opponentScore}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-2 px-1">
            <div className="flex flex-col items-center justify-center">
              <div className="font-mono font-black text-2xl text-amber-400 tracking-tight leading-none">
                {servingScore}-{receivingScore}-{current.serverNumber}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                {servingTeamLabel} v {receivingTeamLabel} (S{current.serverNumber})
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-24">
              <button
                onClick={handlePointWon}
                className="py-2 bg-emerald-600 active:bg-emerald-500 active:scale-95 transition-all rounded-lg text-xs font-black text-white text-center shadow"
              >
                +1 Point
              </button>
              <button
                onClick={handleFault}
                className="py-2 bg-slate-800 active:bg-slate-700 active:scale-95 border border-slate-700 transition-all rounded-lg text-xs font-black text-slate-200 text-center shadow"
              >
                Fault
              </button>
            </div>
          </div>
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
      <div className="h-dvh w-full bg-slate-900 text-slate-100 p-6 flex flex-col justify-center items-center select-none overflow-hidden max-w-md mx-auto">
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
              We Serve First (Us)
            </button>
            <button
              onClick={() => handleStartGame('opponent')}
              className="w-full py-5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 transition-all rounded-2xl text-xl font-bold text-slate-200 shadow-lg"
            >
              Opponent Serves First
            </button>
          </div>
        </div>
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