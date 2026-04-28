#include <stdio.h>
#include <string.h>

// Tic-Tac-Toe checking in pure C
char checkWinner(char board[9]) {
    int lines[8][3] = {
        {0,1,2}, {3,4,5}, {6,7,8}, 
        {0,3,6}, {1,4,7}, {2,5,8}, 
        {0,4,8}, {2,4,6}
    };

    for(int i = 0; i < 8; i++) {
        if(board[lines[i][0]] != ' ' && 
           board[lines[i][0]] == board[lines[i][1]] && 
           board[lines[i][0]] == board[lines[i][2]]) {
            return board[lines[i][0]];
        }
    }
    return ' '; // Return empty space if no winner
}

int main() {
    printf("C Language Game Module Loaded.\n");
    return 0;
}