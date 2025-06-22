// Select all board cells
const cells = document.querySelectorAll('.cell');
// Status display element
const statusText = document.querySelector('.status');
// Buttons
const resetButton = document.querySelector('.reset');
const backToMenuButton = document.querySelector('.back-to-menu');
const twoPlayerButton = document.querySelector('.two-player');
const playerVsAiButton = document.querySelector('.player-vs-ai');
// Containers
const gameContainer = document.querySelector('.game-container');
const gameModeContainer = document.querySelector('.game-mode');
// Sounds
const winSound = new Audio('../assets/sons/win.mp3');
const drawSound = new Audio('../assets/sons/lost.mp3');

// Current player (X starts)
let currentPlayer = 'X';
// Current game state (9 positions)
let gameState = ['', '', '', '', '', '', '', '', ''];
// Game active flag
let isGameActive = true;
// Two-player mode flag
let isTwoPlayerGame = false;
// AI turn flag
let isAiTurn = false;

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
    [0, 4, 8], [2, 4, 6]                // diagonals
];

// Check winner or draw
function checkWinner() {
    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            statusText.textContent = `Jogador ${currentPlayer} venceu!`;
            isGameActive = false;
            winSound.play();
            return;
        }
    }
    if (!gameState.includes('')) {
        statusText.textContent = 'Empate!';
        isGameActive = false;
        drawSound.play();
    }
}

// Handle cell click
function handleCellClick(event) {
    if (
        !isGameActive || 
        gameState[event.target.getAttribute('data-index')] !== '' || 
        (isAiTurn && !isTwoPlayerGame)
    ) {
        return;
    }

    const cell = event.target;
    const index = cell.getAttribute('data-index');
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');

    checkWinner();

    if (isGameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Vez do jogador ${currentPlayer}`;

        if (isTwoPlayerGame) {
            return;
        }

        if (currentPlayer === 'O') {
            isAiTurn = true;
            setTimeout(aiMove, 500);
        }
    }
}

// Reset game
function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    isAiTurn = false;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
    });
}

// Select game mode
function selectGameMode(mode) {
    isTwoPlayerGame = mode === 'twoPlayer';
    gameModeContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    gameState = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    isAiTurn = false;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
    });
}

// Back to menu
function backToMenu() {
    gameModeContainer.style.display = 'block';
    gameContainer.style.display = 'none';
}

// AI move using Minimax
function aiMove() {
    const bestMove = minimax(gameState, 0, true);
    const bestMoveIndex = bestMove.index;

    gameState[bestMoveIndex] = 'O';
    cells[bestMoveIndex].textContent = 'O';
    cells[bestMoveIndex].classList.add('taken');

    checkWinner();

    if (isGameActive) {
        currentPlayer = 'X';
        statusText.textContent = `Vez do jogador ${currentPlayer}`;
    }

    isAiTurn = false;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const scores = {
        'X': -10,
        'O': 10,
        'tie': 0
    };

    const winner = checkGameState(board);
    if (winner !== null) {
        return { score: scores[winner] };
    }

    const availableMoves = getAvailableMoves(board);

    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            board[move] = 'O';
            const result = minimax(board, depth + 1, false);
            board[move] = '';
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = { index: move, score: bestScore };
            }
        }
        return bestMove;
    } else {
        let bestScore = Infinity;
        let bestMove = null;

        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            board[move] = 'X';
            const result = minimax(board, depth + 1, true);
            board[move] = '';
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = { index: move, score: bestScore };
            }
        }
        return bestMove;
    }
}

// Check current game state: winner, tie, or ongoing
function checkGameState(board) {
    const winningConditions = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (const condition of winningConditions) {
        const [a,b,c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.includes('')) {
        return null;
    }

    return 'tie';
}

// Get available moves
function getAvailableMoves(board) {
    return board.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
backToMenuButton.addEventListener('click', backToMenu);
twoPlayerButton.addEventListener('click', () => selectGameMode('twoPlayer'));
playerVsAiButton.addEventListener('click', () => selectGameMode('ai'));
