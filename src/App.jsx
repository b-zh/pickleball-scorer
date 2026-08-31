import React, { useState } from 'react';

const createInitialState = (firstServingTeam) => ({
  usScore: 0,
  opponentScore: 0,
  servingTeam: firstServingTeam,
  serverNumber: 2,
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

  const isUsServing = current.servingTeam === 'us';
  const servingScore = isUsServing ? current.usScore : current.opponentScore;
  const receivingScore = isUsServing ? current.opponentScore : current.usScore;
  const servingTeamLabel = isUsServing ? 'Us' : 'Opp';
  const receivingTeamLabel = isUsServing ? 'Opp' : 'Us';

  // Setup / Start Screen
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

  // Active Game Screen (Horizontal Split View)
  return (
    <div className="h-screen w-screen bg-black text-slate-100 p-1.5 flex flex-col justify-between select-none overflow-hidden touch-manipulation">
      {/* Micro Navigation Row */}
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

      {/* Main Interactive Stage */}
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
          {/* Left Column: Compact Score Callout */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-mono font-black text-2xl text-amber-400 tracking-tight leading-none">
              {servingScore}-{receivingScore}-{current.serverNumber}
            </div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              {servingTeamLabel} v {receivingTeamLabel} (S{current.serverNumber})
            </div>
          </div>

          {/* Right Column: Stacked Action Buttons */}
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