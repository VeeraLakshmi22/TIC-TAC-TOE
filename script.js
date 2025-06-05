const boardElem = document.getElementById("board");
const statusElem = document.getElementById("status");
const scoreElem = document.getElementById("score");
const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result");
const scoreXElem = document.getElementById("score-x");
const scoreOElem = document.getElementById("score-o");
const startGameButton = document.getElementById("start-game-btn");
const modeButtonsDiv = document.querySelector(".mode-buttons");
const confettiContainer = document.getElementById("confetti-container");

const startSound = document.getElementById("sound-start");
const winSound = document.getElementById("sound-win");
const drawSound = document.getElementById("sound-draw");
const restartSound = document.getElementById("sound-restart");
const selectSound = document.getElementById("sound-select");

const restartBtn = document.getElementById("restart-btn");
const exitBtn = document.getElementById("exit-btn");

document.addEventListener('DOMContentLoaded', function() {
    resultContainer.style.display = 'none';
    scoreElem.style.display = 'none';
    modeButtonsDiv.classList.add('hide');
    boardElem.classList.add('hide');
    statusElem.classList.add('hide');
    confettiContainer.style.display = 'none';
});

let board = Array(9).fill(null);
let currentPlayer = "X";
let mode = null;
let gameOver = false;
let score = { X: 0, O: 0, Draws: 0 };
let timer;
let turnTime = 10;
let timerInterval;

// Confetti colors
const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

startGameButton.addEventListener('click', () => {
    startSound.play();
    startGameButton.style.display = 'none';
    modeButtonsDiv.classList.remove('hide');
});

modeButtonsDiv.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        setMode(e.target.dataset.mode);
    }
});

restartBtn.addEventListener('click', restartGame);
exitBtn.addEventListener('click', exitGame);

function setMode(selectedMode) {
    mode = selectedMode;
    selectSound.play();
    modeButtonsDiv.classList.add('hide');
    scoreElem.style.display = 'flex';
    boardElem.classList.remove('hide');
    statusElem.classList.remove('hide');
    createBoard();

    if (mode === "AI") {
        scoreXElem.textContent = "You: 0";
        scoreOElem.textContent = "AI: 0";
    } else {
        scoreXElem.textContent = "Player X: 0";
        scoreOElem.textContent = "Player O: 0";
    }
}

function createBoard() {
    boardElem.innerHTML = "";
    board = Array(9).fill(null);
    gameOver = false;
    resultContainer.style.display = 'none';
    confettiContainer.style.display = 'none';
    confettiContainer.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleCellClick);
        boardElem.appendChild(cell);
    }

    currentPlayer = "X";
    updateStatus();
    startTurnTimer();
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (board[index] || gameOver) return;

    makeMove(index, currentPlayer);

    const winner = checkWinner(board);
    if (winner) {
        endGame(winner);
    } else if (board.every(cell => cell)) {
        endGame("Draw");
    } else if (mode === "AI" && currentPlayer === "O") {
        setTimeout(() => {
            getBestMove();
        }, 300);
    }
}

function makeMove(index, player) {
    board[index] = player;
    boardElem.children[index].textContent = player;
    selectSound.play();
    currentPlayer = player === "X" ? "O" : "X";
    updateStatus();
    resetTurnTimer();
}

function updateStatus() {
    if (!mode) {
        statusElem.textContent = "Choose a mode to start the game";
    } else if (!gameOver) {
        statusElem.textContent = `Current Turn: ${currentPlayer}`;
        statusElem.classList.remove('hide');
    }
}

function checkWinner(b) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (const [a, b1, c] of winPatterns) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
            highlightWinner([a, b1, c]);
            return b[a];
        }
    }
    return null;
}

function highlightWinner(indices) {
    indices.forEach(i => {
        boardElem.children[i].classList.add("winner");
    });
}

function createConfetti() {
    confettiContainer.style.display = 'block';
    confettiContainer.innerHTML = '';

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        confetti.style.backgroundColor = color;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${left}%`;
        confetti.style.animation = `fall ${duration}s linear ${delay}s infinite`;

        confettiContainer.appendChild(confetti);
    }
}

function endGame(result) {
    gameOver = true;
    boardElem.classList.add('hide');
    resultContainer.style.display = 'flex';

    if (result === "Draw") {
        resultText.textContent = "It's a Draw!";
        drawSound.play();
        score.Draws++;
    } else {
        let winnerText = "";
        if (mode === "AI") {
            if (result === "X") {
                winnerText = "You Win!";
            } else if (result === "O") {
                winnerText = "AI Wins!";
            }
        } else if (mode === "Friend") {
            if (result === "X") {
                winnerText = "Player X Wins!";
            } else if (result === "O") {
                winnerText = "Player O Wins!";
            }
        }
        resultText.textContent = winnerText + "!";
        winSound.play();
        createConfetti();
        score[result]++;
    }
    updateScore();
    statusElem.classList.add('hide');
}

function updateScore() {
    scoreXElem.textContent = mode === "AI" ? "You: " + score.X : "Player X: " + score.X;
    scoreOElem.textContent = mode === "AI" ? "AI: " + score.O : "Player O: " + score.O;
}

function restartGame() {
    restartSound.play();
    resultContainer.style.display = 'none';
    modeButtonsDiv.classList.remove('hide');
    scoreElem.style.display = 'none';
    boardElem.classList.add('hide');
    mode = null;
    board = Array(9).fill(null);
    currentPlayer = "X";
    gameOver = false;
    clearInterval(timerInterval);
    statusElem.classList.add('hide');
    statusElem.textContent = "";
    confettiContainer.style.display = 'none';
    confettiContainer.innerHTML = '';
}

function exitGame() {
    // window.close() usually won't work in most browsers for tabs opened manually,
    // So we can just reload or hide everything as fallback
    location.reload();
}

function getBestMove() {
    const best = minimax(board, "O");
    if (best && typeof best.index !== 'undefined') {
        makeMove(best.index, "O");
    }
}

function minimax(newBoard, player) {
    const availSpots = newBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter(val => val !== null);

    const winner = checkWinner(newBoard);
    if (winner === "X") {
        return { score: -10 };
    }
    if (winner === "O") {
        return { score: 10 };
    }
    if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        const result = minimax(newBoard, player === "O" ? "X" : "O");
        move.score = result.score;

        newBoard[availSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function startTurnTimer() {
    timer = turnTime;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timer > 0 && !gameOver) {
            timer--;
        } else if (timer === 0) {
            switchTurn();
        }
    }, 1000);
}

function resetTurnTimer() {
    clearInterval(timerInterval);
    startTurnTimer();
}

function switchTurn() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
    if (mode === "AI" && currentPlayer === "O" && !gameOver) {
        setTimeout(() => {
            getBestMove();
        }, 300);
    }
}
