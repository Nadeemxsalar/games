'use client'; // React state use karne ke liye ye Next.js App Router me zaroori hai
import React, { useState } from 'react';

// TypeScript Types define kar rahe hain yahan (GitHub stats ke liye mast hai)
type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  // State management with TypeScript types
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player>(null);

  // Winner check logic
  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Box click handle karna
  const handleClick = (index: number) => {
    // Agar box pehle se fill hai ya koi jeet gaya, to kuch mat karo
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(checkWinner(newBoard));
  };

  // Game restart logic
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
        Neon Tic-Tac-Toe
      </h1>

      {/* Game Board (Modern UI) */}
      <div className="grid grid-cols-3 gap-3 bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10 shadow-2xl">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-24 h-24 sm:w-28 sm:h-28 text-6xl font-bold flex items-center justify-center rounded-xl transition-all duration-300
              ${!cell ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-900 shadow-inner'}
              ${cell === 'X' ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' : ''}
              ${cell === 'O' ? 'text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]' : ''}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Status Indicators */}
      <div className="mt-8 text-center h-32 flex flex-col items-center justify-start">
        {winner ? (
          <p className="text-3xl text-white font-bold mb-4 animate-bounce">
            Winner: <span className={winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-500'}>{winner}</span> 🎉
          </p>
        ) : !board.includes(null) ? (
          <p className="text-3xl text-gray-400 font-bold mb-4">It's a Draw! 🤝</p>
        ) : (
          <p className="text-2xl text-gray-300 mb-4">
            Next Turn: <span className={isXNext ? 'text-cyan-400' : 'text-fuchsia-500 font-bold'}>{isXNext ? 'X' : 'O'}</span>
          </p>
        )}

        <button
          onClick={resetGame}
          className="px-8 py-3 mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}