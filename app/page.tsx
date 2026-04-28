'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript Types
type Player = 'X' | 'O' | null;
type Theme = 'cyan' | 'pink' | 'matrix';
type GameMode = 'PvP' | 'PvAI';
type Difficulty = 'Easy' | 'Pro';

export default function UltimateTicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [mode, setMode] = useState<GameMode>('PvAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Pro');
  const [theme, setTheme] = useState<Theme>('cyan');
  const [history, setHistory] = useState<Player[][]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Advance Features States
  const [playerNames, setPlayerNames] = useState({ X: 'Nadeem', O: 'God Bot' });
  const [timeLeft, setTimeLeft] = useState(10);
  const [streak, setStreak] = useState({ player: null as Player, count: 0 });
  const [crtEffect, setCrtEffect] = useState(false);
  const [tournamentWinner, setTournamentWinner] = useState<Player>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const themes = {
    cyan: { text: 'text-cyan-400', glow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]', border: 'border-cyan-500/50', bg: 'bg-cyan-500', hex: '#22d3ee' },
    pink: { text: 'text-fuchsia-500', glow: 'drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-500', hex: '#d946ef' },
    matrix: { text: 'text-green-500', glow: 'drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]', border: 'border-green-500/50', bg: 'bg-green-500', hex: '#22c55e' }
  };

  // Safe Audio Logic
  const playSound = (type: 'tap' | 'win' | 'draw') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      const volume = gainNode.gain as any; 

      if (type === 'tap') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
        volume.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'win') {
        osc.type = 'square'; osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        volume.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime);
        volume.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) { console.log("Audio skipped"); }
  };

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  // Turn Timer Logic
  useEffect(() => {
    if (winner || tournamentWinner) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setIsXNext(!isXNext); return 10; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isXNext, winner, tournamentWinner]);

  const checkWinner = (squares: Player[]) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winPlayer: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  // 🔥 ADVANCED MINIMAX ALGORITHM (Unbeatable AI)
  const minimax = (newBoard: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(newBoard);
    if (result?.winPlayer === 'O') return 10 - depth;
    if (result?.winPlayer === 'X') return depth - 10;
    if (!newBoard.includes(null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = 'O';
          let score = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = 'X';
          let score = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getAIMove = (currentBoard: Player[]) => {
    const emptyIndices = currentBoard.map((v, i) => (v === null ? i : null)).filter(v => v !== null) as number[];
    if (difficulty === 'Easy') return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    
    // Pro Mode (Minimax Engine)
    let bestScore = -Infinity;
    let move = emptyIndices[0];
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = useCallback((index: number) => {
    if (board[index] || winner || tournamentWinner) return;

    playSound('tap'); vibrate(50);
    setHistory([...history, [...board]]);
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setTimeLeft(10); 
    
    const result = checkWinner(newBoard);
    if (result) handleWin(result.winPlayer, result.line);
    else if (!newBoard.includes(null)) handleDraw();
    else setIsXNext(!isXNext);
  }, [board, isXNext, winner, history, tournamentWinner]);

  useEffect(() => {
    if (mode === 'PvAI' && !isXNext && !winner && !tournamentWinner) {
      const timer = setTimeout(() => handleClick(getAIMove(board)), 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, mode, winner, board, handleClick, tournamentWinner]);

  const handleWin = (winPlayer: Player, line: number[]) => {
    setWinner(winPlayer); setWinningLine(line); playSound('win'); vibrate([100, 50, 100, 50, 200]);
    if (winPlayer === 'X') {
      setScores(prev => { const nextX = prev.X + 1; if (nextX >= 3) setTournamentWinner('X'); return { ...prev, X: nextX }; });
    } else if (winPlayer === 'O') {
      setScores(prev => { const nextO = prev.O + 1; if (nextO >= 3) setTournamentWinner('O'); return { ...prev, O: nextO }; });
    }
    setStreak(prev => ({ player: winPlayer, count: prev.player === winPlayer ? prev.count + 1 : 1 }));
  };

  const handleDraw = () => {
    setScores(prev => ({ ...prev, Draws: prev.Draws + 1 })); setStreak({ player: null, count: 0 }); playSound('draw'); vibrate(300);
  };

  const resetGame = (fullReset = false) => {
    setBoard(Array(9).fill(null)); setIsXNext(true); setWinner(null); setWinningLine([]); setHistory([]); setTimeLeft(10);
    if (fullReset) { setScores({ X: 0, O: 0, Draws: 0 }); setTournamentWinner(null); setStreak({ player: null, count: 0 }); }
  };

  const currentTheme = themes[theme];

  // 🎯 SVG Line Mapping (Lakeer ke coordinates)
  const getLineCoords = (line: number[]) => {
    const map: Record<string, { x1: string, y1: string, x2: string, y2: string }> = {
      '0,1,2': { x1: '5%', y1: '16.6%', x2: '95%', y2: '16.6%' },
      '3,4,5': { x1: '5%', y1: '50%', x2: '95%', y2: '50%' },
      '6,7,8': { x1: '5%', y1: '83.3%', x2: '95%', y2: '83.3%' },
      '0,3,6': { x1: '16.6%', y1: '5%', x2: '16.6%', y2: '95%' },
      '1,4,7': { x1: '50%', y1: '5%', x2: '50%', y2: '95%' },
      '2,5,8': { x1: '83.3%', y1: '5%', x2: '83.3%', y2: '95%' },
      '0,4,8': { x1: '5%', y1: '5%', x2: '95%', y2: '95%' },
      '2,4,6': { x1: '95%', y1: '5%', x2: '5%', y2: '95%' },
    };
    return map[line.join(',')] || null;
  };

  const lineCoords = winningLine.length > 0 ? getLineCoords(winningLine) : null;

  return (
    <div className={`min-h-[100dvh] w-full bg-[#0a0a0a] text-white flex flex-col items-center p-2 sm:p-4 font-sans select-none touch-manipulation overflow-x-hidden relative ${crtEffect ? 'crt-scanlines' : ''}`}>
      
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      <div className="w-full max-w-md flex justify-between items-center mt-2 z-10 px-2">
        <h1 className={`text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.text} to-white drop-shadow-md`}>
          NEXUS<span className="text-white">TicTac</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={toggleFullscreen} className="p-2 bg-white/10 rounded-full backdrop-blur-md">🔲</button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">⚙️</button>
        </div>
      </div>

      <div className="h-12 flex items-center justify-center w-full z-10">
        {tournamentWinner ? (
          <div className="bg-yellow-500/20 border border-yellow-500/50 px-4 py-1 rounded-xl text-yellow-400 font-bold animate-pulse text-sm sm:text-base text-center">
            🏆 {playerNames[tournamentWinner as keyof typeof playerNames]} Wins The Tournament!
          </div>
        ) : streak.count >= 2 ? (
          <div className="text-orange-400 font-bold animate-bounce text-sm sm:text-base">
            🔥 {playerNames[streak.player as keyof typeof playerNames]} is on a {streak.count} win streak!
          </div>
        ) : null}
      </div>

      <div className="z-10 flex gap-2 sm:gap-4 mb-4 bg-white/5 p-3 sm:p-4 rounded-2xl backdrop-blur-xl border border-white/10 w-full max-w-[95vw] sm:max-w-md justify-between shadow-lg relative overflow-hidden">
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${timeLeft < 4 ? 'bg-red-500' : currentTheme.bg}`} style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
        
        <div className={`text-center flex-1 ${isXNext && !winner ? 'scale-110 drop-shadow-lg' : 'opacity-70'} transition-all overflow-hidden`}>
          <p className="text-[10px] sm:text-xs font-semibold truncate px-1">{playerNames.X} (X)</p>
          <p className={`text-xl sm:text-2xl font-bold ${themes.cyan.text}`}>{scores.X}/3</p>
        </div>
        <div className="text-center flex-1 border-x border-white/10 opacity-70">
          <p className="text-[10px] sm:text-xs">Draws</p>
          <p className="text-xl sm:text-2xl font-bold">{scores.Draws}</p>
        </div>
        <div className={`text-center flex-1 ${!isXNext && !winner ? 'scale-110 drop-shadow-lg' : 'opacity-70'} transition-all overflow-hidden`}>
          <p className="text-[10px] sm:text-xs font-semibold truncate px-1">{playerNames.O} (O)</p>
          <p className={`text-xl sm:text-2xl font-bold ${themes.pink.text}`}>{scores.O}/3</p>
        </div>
      </div>

      {/* 🎯 Tic-Tac-Toe Board Grid with SVG Line Overlay */}
      <div className="z-10 relative bg-white/5 p-3 sm:p-4 rounded-3xl backdrop-blur-2xl border border-white/10 shadow-2xl max-w-[95vw]">
        
        {/* SVG Lakeer (Winning Line) */}
        {winner && lineCoords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ filter: `drop-shadow(0 0 10px ${currentTheme.hex})` }}>
            <line 
              x1={lineCoords.x1} y1={lineCoords.y1} x2={lineCoords.x2} y2={lineCoords.y2} 
              stroke={currentTheme.hex} strokeWidth="8" strokeLinecap="round"
              className="animate-draw-line"
            />
          </svg>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {board.map((cell, index) => {
            const isWinningCell = winningLine.includes(index);
            return (
              <button
                key={index} onClick={() => handleClick(index)} disabled={!!winner || !!cell || !!tournamentWinner}
                className={`w-20 h-20 sm:w-28 sm:h-28 text-4xl sm:text-6xl font-bold flex items-center justify-center rounded-2xl transition-all duration-300 transform active:scale-95
                  ${!cell ? 'bg-white/5 hover:bg-white/10 shadow-inner' : 'bg-black/40'}
                  ${cell === 'X' ? themes.cyan.text + ' ' + themes.cyan.glow : ''}
                  ${cell === 'O' ? themes.pink.text + ' ' + themes.pink.glow : ''}
                  ${isWinningCell ? `ring-2 ring-offset-2 ring-offset-[#0a0a0a] ${currentTheme.border} scale-105 z-10` : ''}
                `}
              >
                <span className={cell ? 'scale-100 opacity-100 animate-[popIn_0.2s_ease-out]' : 'scale-0 opacity-0'}>{cell}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="z-10 w-full max-w-[95vw] sm:max-w-md flex flex-col items-center mt-6 space-y-4">
        <div className="flex w-full gap-3 sm:gap-4">
          <button onClick={() => resetGame(false)} className={`flex-1 py-3 sm:py-4 text-black font-bold rounded-xl ${currentTheme.bg} hover:brightness-110 active:scale-95 transition-all shadow-lg text-sm sm:text-base`}>
            Next Round
          </button>
          <button onClick={() => resetGame(true)} className="flex-1 py-3 sm:py-4 bg-red-500/20 text-red-400 rounded-xl font-semibold border border-red-500/30 active:scale-95 transition-transform text-sm sm:text-base">
            Reset Series
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md bg-gray-900 border border-white/20 p-6 rounded-3xl shadow-2xl mb-4 sm:mb-0 relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 text-2xl">×</button>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white">Game Settings</h2>
            
            <div className="space-y-4 sm:space-y-5">
              <div className="flex gap-2 sm:gap-4">
                <input type="text" placeholder="Player X" value={playerNames.X} onChange={e => setPlayerNames({...playerNames, X: e.target.value})} className="w-full bg-black/50 p-2 rounded-lg border border-white/10 text-cyan-400 focus:outline-none text-sm"/>
                <input type="text" placeholder="Player O" value={playerNames.O} onChange={e => setPlayerNames({...playerNames, O: e.target.value})} className="w-full bg-black/50 p-2 rounded-lg border border-white/10 text-fuchsia-500 focus:outline-none text-sm" disabled={mode === 'PvAI'}/>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <button onClick={() => {setMode('PvP'); resetGame(true); setPlayerNames({...playerNames, O: 'Player O'})}} className={`p-2 rounded-lg border ${mode === 'PvP' ? 'bg-white/20 border-white' : 'border-white/10 text-gray-500'}`}>👤 1 vs 1</button>
                <button onClick={() => {setMode('PvAI'); resetGame(true); setPlayerNames({...playerNames, O: 'God Bot'})}} className={`p-2 rounded-lg border ${mode === 'PvAI' ? 'bg-white/20 border-white' : 'border-white/10 text-gray-500'}`}>🤖 vs AI</button>
                
                {mode === 'PvAI' && (
                  <>
                    <button onClick={() => setDifficulty('Easy')} className={`p-2 rounded-lg border ${difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500' : 'border-white/10 text-gray-500'}`}>Easy Bot</button>
                    <button onClick={() => setDifficulty('Pro')} className={`p-2 rounded-lg border ${difficulty === 'Pro' ? 'bg-red-500/20 text-red-400 border-red-500 font-bold' : 'border-white/10 text-gray-500'}`}>Pro Bot (Unbeatable)</button>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-white/10">
                <p className="text-sm">CRT Effect</p>
                <button onClick={() => setCrtEffect(!crtEffect)} className={`w-12 h-6 rounded-full transition-colors ${crtEffect ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${crtEffect ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>

              <div className="flex gap-4 justify-center pt-2">
                {(['cyan', 'pink', 'matrix'] as Theme[]).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 ${theme === t ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'} ${themes[t].bg}`}></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Animations Styling including SVG Line Draw */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawLine { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
        .animate-draw-line {
          stroke-dasharray: 300;
          animation: drawLine 0.5s ease-out forwards;
        }
        .crt-scanlines::before {
          content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 50; background-size: 100% 2px, 3px 100%; pointer-events: none;
        }
      `}} />
    </div>
  );
}