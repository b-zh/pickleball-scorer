import React, { useState } from 'react';

const createInitialState = (firstServingTeam) => ({
  usScore: 0,
  opponentScore: 0,
  servingTeam: firstServingTeam, // 'us' or 'opponent'
  serverNumber: 2, // First serve of the game is always Server 2
  isGameOver: false,
});

export default function App() {
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

  // Dynamic positions: Left side is always serving team, middle is receiving team
  const isUsServing = current.servingTeam === 'us';
  const servingScore = isUsServing ? current.usScore : current.opponentScore;
  const receivingScore = isUsServing ? current.opponentScore : current.usScore;
  const servingTeamLabel = isUsServing ? 'Us' : 'Opponent';
  const receivingTeamLabel = isUsServing ? 'Opponent' : 'Us';

  // Setup / Start Screen
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6 max-w-md mx-auto select-none">
        <div className="w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">New Match</h1>
            <p className="text-slate-400 text-sm mt-1">Who is serving first?</p>
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

  // Active Game Screen
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-slate-900 text-slate-100 p-6 max-w-md mx-auto select-none">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center pt-2">
        <h1 className="text-xs font-bold tracking-widest uppercase text-slate-500">Pickleball Score</h1>
        <button
          onClick={handleReset}
          className="text-sm font-semibold text-rose-400 border border-rose-900/60 px-4 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
        >
          Reset Game
        </button>
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col items-center justify-center my-auto w-full">
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
            <div className="flex items-center justify-center gap-2 font-mono font-black text-6xl sm:text-7xl">
              <span className="w-24 text-center text-amber-400">
                {servingScore}
              </span>
              <span className="text-slate-600 font-normal text-4xl">-</span>
              <span className="w-24 text-center text-slate-300">
                {receivingScore}
              </span>
              <span className="text-slate-600 font-normal text-4xl">-</span>
              <span className="w-24 text-center text-amber-400">
                {current.serverNumber}
              </span>
            </div>

            {/* Subtext Labels */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs font-semibold uppercase tracking-wider">
              <span className="w-24 text-center text-amber-400 font-bold truncate">
                {servingTeamLabel}
              </span>
              <span className="text-transparent text-4xl">-</span>
              <span className="w-24 text-center text-slate-400 truncate">
                {receivingTeamLabel}
              </span>
              <span className="text-transparent text-4xl">-</span>
              <span className="w-24 text-center text-slate-400">
                Server
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3 pb-4">
        <button
          onClick={handlePointWon}
          disabled={current.isGameOver}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-2xl text-xl font-bold text-white shadow-lg disabled:opacity-40"
        >
          Point Won (+1)
        </button>

        <button
          onClick={handleFault}
          disabled={current.isGameOver}
          className="w-full py-5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 transition-all rounded-2xl text-xl font-bold text-slate-200 shadow-lg disabled:opacity-40"
        >
          Fault / Side Out
        </button>

        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
        >
          Undo Last Rally
        </button>
      </div>
    </div>
  );
}