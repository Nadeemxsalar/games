<?php
// Tic-Tac-Toe Win Logic in PHP
function checkWinner($board) {
    $winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    foreach ($winningLines as $line) {
        if ($board[$line[0]] !== null && 
            $board[$line[0]] === $board[$line[1]] && 
            $board[$line[0]] === $board[$line[2]]) {
            return $board[$line[0]]; // Returns 'X' or 'O'
        }
    }
    return "Draw or Ongoing";
}

echo "PHP Logic Module Ready.\n";
?>