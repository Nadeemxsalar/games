'use client';
import React, { useState, useEffect, useCallback } from 'react';

// TypeScript Types
type Player = 'X' | 'O' | null;
type Theme = 'cyan' | 'pink' | 'matrix';
type GameMode = 'PvP' | 'PvAI';

export default function AdvancedTicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [mode, setMode] = useState<GameMode>('PvAI');
  const [theme, setTheme] = useState<Theme>('cyan');
  const [history, setHistory] = useState<Player[][]>([]);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Theme Config
  const themes = {
    cyan: { text: 'text-cyan-400', glow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]', border: 'border-cyan-500/50', bg: 'bg-cyan-500' },
    pink: { text: 'text-fuchsia-500', glow: 'drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-500' },
    matrix: { text: 'text-green-500', glow: 'drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]', border: 'border-green-500/50', bg: 'bg-green-500' }
  };

  const vibrate = (ms: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winPlayer: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = useCallback((index: number) => {
    if (board[index] || winner) return;

    vibrate(50); // Haptic tap
    
    // Save history for Undo
    setHistory([...history, [...board]]);

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      handleWin(result.winPlayer, result.line, newBoard);
    } else if (!newBoard.includes(null)) {
      handleDraw(newBoard);
    } else {
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, history]);

  // AI Logic
  useEffect(() => {
    if (mode === 'PvAI' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null);
        if (emptyIndices.length > 0) {
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)] as number;
          handleClick(randomIndex);
        }
      }, 500); // 0.5s AI thinking delay
      return () => clearTimeout(timer);
    }
  }, [isXNext, mode, winner, board, handleClick]);

  const handleWin = (winPlayer: Player, line: number[], currentBoard: Player[]) => {
    setWinner(winPlayer);
    setWinningLine(line);
    setScores(prev => ({ ...prev, [winPlayer as string]: prev[winPlayer as keyof typeof prev] + 1 }));
    setMatchLog(prev => [`${winPlayer} won`, ...prev].slice(0, 5));
    vibrate([100, 50, 100, 50, 200]); // Victory haptic
  };

  const handleDraw = (currentBoard: Player[]) => {
    setScores(prev => ({ ...prev, Draws: prev.Draws + 1 }));
    setMatchLog(prev => ['Draw', ...prev].slice(0, 5));
    vibrate(300); // Draw haptic
  };

  const undoMove = () => {
    if (history.length === 0 || winner) return;
    const previousBoard = history[history.length - 1];
    setBoard(previousBoard);
    setHistory(history.slice(0, -1));
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    setHistory([]);
  };

  const currentTheme = themes[theme];

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col items-center justify-between p-4 font-sans select-none touch-manipulation overflow-hidden">
      
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mt-4">
        <h1 className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.text} to-white drop-shadow-md`}>
          TicTac<span className="text-white">Pro</span>
        </h1>
        <button onClick={() => setShowSettings(!showSettings)} className="text-2xl p-2 bg-white/10 rounded-full backdrop-blur-md">
          ⚙️
        </button>
      </div>

      {/* Score Board */}
      <div className="flex gap-4 my-6 bg-white/5 p-4 rounded-2xl backdrop-blur-xl border border-white/10 w-full max-w-md justify-between shadow-lg">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">Player (X)</p>
          <p className={`text-2xl font-bold ${themes.cyan.text}`}>{scores.X}</p>
        </div>
        <div className="text-center flex-1 border-x border-white/10">
          <p className="text-xs text-gray-400">Draws</p>
          <p className="text-2xl font-bold text-gray-300">{scores.Draws}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">{mode === 'PvAI' ? 'Bot (O)' : 'Player (O)'}</p>
          <p className={`text-2xl font-bold ${themes.pink.text}`}>{scores.O}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative grid grid-cols-3 gap-2 sm:gap-3 bg-white/5 p-4 rounded-3xl backdrop-blur-2xl border border-white/10 shadow-2xl">
        {board.map((cell, index) => {
          const isWinningCell = winningLine.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!winner || !!cell}
              className={`w-24 h-24 sm:w-28 sm:h-28 text-5xl sm:text-6xl font-bold flex items-center justify-center rounded-2xl transition-all duration-300 transform active:scale-95
                ${!cell ? 'bg-white/5 hover:bg-white/10 shadow-inner' : 'bg-black/40'}
                ${cell === 'X' ? themes.cyan.text + ' ' + themes.cyan.glow : ''}
                ${cell === 'O' ? themes.pink.text + ' ' + themes.pink.glow : ''}
                ${isWinningCell ? `ring-4 ring-offset-4 ring-offset-[#0a0a0a] ${currentTheme.border} animate-pulse` : ''}
              `}
            >
              <span className={cell ? 'scale-100 opacity-100 animate-[popIn_0.2s_ease-out]' : 'scale-0 opacity-0'}>
                {cell}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls & Status */}
      <div className="w-full max-w-md flex flex-col items-center mt-8 mb-4 space-y-6">
        
        {/* Status Text */}
        <div className="h-10">
          {winner ? (
            <p className="text-2xl font-bold animate-bounce">
              <span className={winner === 'X' ? themes.cyan.text : themes.pink.text}>{winner}</span> Wins! 🎉
            </p>
          ) : !board.includes(null) ? (
            <p className="text-2xl font-bold text-gray-400">Match Draw! 🤝</p>
          ) : (
            <p className="text-xl text-gray-300">
              Turn: <span className={isXNext ? themes.cyan.text : themes.pink.text}>{isXNext ? 'X' : 'O'}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4">
          <button
            onClick={undoMove}
            disabled={history.length === 0 || !!winner}
            className="flex-1 py-3 bg-white/10 disabled:opacity-30 rounded-xl font-semibold backdrop-blur-md border border-white/5 active:scale-95 transition-transform"
          >
            ↩ Undo
          </button>
          <button
            onClick={resetGame}
            className={`flex-[2] py-3 text-black font-bold rounded-xl ${currentTheme.bg} hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
          >
            Play Again
          </button>
        </div>
      </div>

      {/* Settings Modal (Glassmorphism) */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md bg-gray-900/90 border border-white/10 p-6 rounded-3xl shadow-2xl mb-8 sm:mb-0 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Game Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Game Mode</p>
                <div className="flex gap-2 bg-black/50 p-1 rounded-lg">
                  <button onClick={() => {setMode('PvP'); resetGame();}} className={`flex-1 py-2 rounded-md transition-colors ${mode === 'PvP' ? 'bg-white/20' : 'text-gray-500'}`}>1 vs 1</button>
                  <button onClick={() => {setMode('PvAI'); resetGame();}} className={`flex-1 py-2 rounded-md transition-colors ${mode === 'PvAI' ? 'bg-white/20' : 'text-gray-500'}`}>vs Bot</button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Neon Theme</p>
                <div className="flex gap-4">
                  {(['cyan', 'pink', 'matrix'] as Theme[]).map(t => (
                    <button key={t} onClick={() => setTheme(t)} className={`w-10 h-10 rounded-full border-2 ${theme === t ? 'border-white scale-110' : 'border-transparent opacity-50'} ${themes[t].bg}`}></button>
                  ))}
                </div>
              </div>

              {matchLog.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Recent Matches</p>
                  <div className="bg-black/50 rounded-lg p-2 max-h-24 overflow-y-auto text-sm text-gray-300">
                    {matchLog.map((log, i) => <div key={i} className="py-1 border-b border-white/5 last:border-0">{log}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}