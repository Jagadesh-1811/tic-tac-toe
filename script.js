// Game variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let singlePlayerMode = false;
let timeLeft = 30;
let timerId = null;
let colorIndex = 0;
const colors = ['red', 'green', 'blue', 'lightblue', 'aqua', 'pink', 'purple', 'orangered', 'magenta', 'crimson'];
const colorSchemes = [
    'color-scheme-1',
    'color-scheme-2',
    'color-scheme-3',
    'color-scheme-4',
    'color-scheme-5',
    'color-scheme-6',
    'color-scheme-7',
    'color-scheme-8',
    'color-scheme-9',
    'color-scheme-10'
];

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const modeScreen = document.getElementById('mode-screen');
const gameScreen = document.getElementById('game-screen');
const gameMessageElement = document.getElementById('game-message');
const timerElement = document.getElementById('timer');
const gameBoardElement = document.getElementById('game-board');
const buttons = document.querySelectorAll('.game-button');

// Winning combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initialize the game board
function initializeBoard() {
    gameBoardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoardElement.appendChild(cell);
    }
}

// Handle cell click
function handleCellClick(e) {
    const index = e.target.dataset.index;
    
    if (gameBoard[index] !== '' || !gameActive) {
        return;
    }
    
    gameBoard[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());
    
    if (checkWin()) {
        endGame(false);
        return;
    }
    
    if (checkDraw()) {
        endGame(true);
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameMessageElement.textContent = `Player ${currentPlayer}'s turn`;
    
    // If in single player mode and it's computer's turn
    if (singlePlayerMode && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
    
    // Change the button colors and background
    updateButtonColors();
    changeBackgroundColorScheme();
}

// Computer move for single player mode
function computerMove() {
    if (!gameActive) return;
    
    // Find empty cells
    const emptyCells = gameBoard.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    
    if (emptyCells.length === 0) return;
    
    // Choose a random empty cell
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gameBoard[randomIndex] = 'O';
    
    // Update the UI
    const cells = document.querySelectorAll('.cell');
    cells[randomIndex].textContent = 'O';
    cells[randomIndex].classList.add('o');
    
    if (checkWin()) {
        endGame(false);
        return;
    }
    
    if (checkDraw()) {
        endGame(true);
        return;
    }
    
    currentPlayer = 'X';
    gameMessageElement.textContent = `Player X's turn`;
}

// Check for win
function checkWin() {
    return winConditions.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

// Check for draw
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

// End the game
function endGame(isDraw) {
    gameActive = false;
    clearInterval(timerId);
    
    if (isDraw) {
        gameMessageElement.textContent = "Game ended in a draw!";
        showAlert("Game Over! It's a draw!");
    } else {
        gameMessageElement.textContent = `Player ${currentPlayer} wins!`;
        gameMessageElement.classList.add('winning-message');
        
        // Apply a gradient background when someone wins
        document.body.className = '';
        document.body.classList.add('color-scheme-' + (Math.floor(Math.random() * 10) + 1));
        showAlert("Game Over! Player " + currentPlayer + " wins!");
        
        // Highlight winning cells
        highlightWinningCells();
    }
}

// Highlight winning cells
function highlightWinningCells() {
    for (const condition of winConditions) {
        if (condition.every(index => gameBoard[index] === currentPlayer)) {
            const cells = document.querySelectorAll('.cell');
            condition.forEach(index => {
                cells[index].style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                cells[index].style.transform = 'scale(1.05)';
                cells[index].style.boxShadow = '0 0 15px rgba(255, 255, 0, 0.5)';
            });
            break;
        }
    }
}

// Start timer
function startTimer() {
    timeLeft = 30;
    timerElement.textContent = timeLeft;
    timerElement.style.color = 'white';
    
    clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerElement.style.color = 'red';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerId);
            gameActive = false;
            showAlert("Time's up!");
            gameMessageElement.textContent = "Time's up! Game over.";
        }
    }, 1000);
}

// Reset the game
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    gameMessageElement.textContent = `Player ${currentPlayer}'s turn`;
    gameMessageElement.classList.remove('winning-message');
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
        cell.style.backgroundColor = '';
        cell.style.transform = '';
        cell.style.boxShadow = '';
    });
    
    startTimer();
    changeBackgroundColorScheme();
}

// Start a new game
function startNewGame(isSinglePlayer) {
    singlePlayerMode = isSinglePlayer;
    
    // Randomly choose starting player in single player mode
    if (isSinglePlayer) {
        currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        if (currentPlayer === 'O') {
            setTimeout(computerMove, 1000);
        }
    } else {
        currentPlayer = 'X';
    }
    
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    modeScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    
    initializeBoard();
    gameMessageElement.textContent = `Player ${currentPlayer}'s turn`;
    startTimer();
}

// Show alert message
function showAlert(message) {
    setTimeout(() => {
        alert(message);
    }, 100);
}

// Change background color scheme
function changeBackgroundColorScheme() {
    // Remove all color scheme classes
    document.body.className = '';
    
    // Add a random color scheme
    const randomScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    document.body.classList.add(randomScheme);
}

// Update button colors
function updateButtonColors() {
    colorIndex = (colorIndex + 1) % colors.length;
    const color = colors[colorIndex];
    
    buttons.forEach(button => {
        button.style.backgroundColor = color;
    });
}

// Event Listeners
document.getElementById('play-btn').addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    modeScreen.style.display = 'flex';
    changeBackgroundColorScheme();
});

document.getElementById('single-player-btn').addEventListener('click', () => {
    startNewGame(true);
    changeBackgroundColorScheme();
});

document.getElementById('multiplayer-btn').addEventListener('click', () => {
    startNewGame(false);
    changeBackgroundColorScheme();
});

document.getElementById('reset-btn').addEventListener('click', resetGame);

document.getElementById('back-btn').addEventListener('click', () => {
    clearInterval(timerId);
    gameScreen.style.display = 'none';
    modeScreen.style.display = 'flex';
    changeBackgroundColorScheme();
});

// Initialize background on load
window.addEventListener('load', () => {
    updateButtonColors();
    document.body.classList.add('gradient-background');
});
