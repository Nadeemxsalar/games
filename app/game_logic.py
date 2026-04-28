# Tic-Tac-Toe Logic implemented in Python
def check_winner(board):
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    
    for line in lines:
        a, b, c = line
        if board[a] is not None and board[a] == board[b] == board[c]:
            return board[a]
            
    if None not in board:
        return "Draw"
    return "Ongoing"

if __name__ == "__main__":
    print("Python AI Bot Logic Ready.")