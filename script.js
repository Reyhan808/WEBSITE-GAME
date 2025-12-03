// Game State Variables
let currentPlayerName = localStorage.getItem('playerName') || 'Player';
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
let highScores = JSON.parse(localStorage.getItem('highScores')) || {
    math: [],
    blast: [],
    memory: []
};

// DOM Elements
const playerNameEl = document.getElementById('player-name');
const changeNameBtn = document.getElementById('change-name');
const nameModal = document.getElementById('name-modal');
const saveNameBtn = document.getElementById('save-name');
const cancelNameBtn = document.getElementById('cancel-name');
const playerNameInput = document.getElementById('player-name-input');
const soundToggleBtn = document.getElementById('sound-toggle');
const highScoresBtn = document.getElementById('high-scores');
const scoresModal = document.getElementById('scores-modal');
const closeScoresBtn = document.getElementById('close-scores');
const scoresList = document.getElementById('scores-list');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelpBtn = document.getElementById('close-help');
const currentYearEl = document.getElementById('current-year');

// Game Navigation
const gameBtns = document.querySelectorAll('.game-btn');
const gameSections = document.querySelectorAll('.game-section');

// Initialize
function init() {
    // Set current year
    currentYearEl.textContent = new Date().getFullYear();
    
    // Set player name
    playerNameEl.textContent = currentPlayerName;
    
    // Set sound toggle
    updateSoundButton();
    
    // Initialize all games
    initMathGame();
    initTicTacToe();
    initBlockBlast();
    initMemoryGame();
    
    // Show first game
    showGame('math');
}

// Navigation Functions
function showGame(gameId) {
    // Update active button
    gameBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-game') === gameId) {
            btn.classList.add('active');
        }
    });
    
    // Show selected game section
    gameSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${gameId}-game`) {
            section.classList.add('active');
        }
    });
}

// Event Listeners for Navigation
gameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const gameId = btn.getAttribute('data-game');
        showGame(gameId);
        
        // Play sound if enabled
        if (soundEnabled) playSound('click');
    });
});

// Player Name Functions
changeNameBtn.addEventListener('click', () => {
    playerNameInput.value = currentPlayerName;
    nameModal.classList.add('active');
    playerNameInput.focus();
});

saveNameBtn.addEventListener('click', () => {
    const newName = playerNameInput.value.trim();
    if (newName && newName.length > 0) {
        currentPlayerName = newName;
        playerNameEl.textContent = currentPlayerName;
        localStorage.setItem('playerName', currentPlayerName);
        nameModal.classList.remove('active');
        
        if (soundEnabled) playSound('success');
    }
});

cancelNameBtn.addEventListener('click', () => {
    nameModal.classList.remove('active');
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveNameBtn.click();
});

// Sound Functions
function updateSoundButton() {
    const icon = soundToggleBtn.querySelector('i');
    const text = soundToggleBtn.querySelector('span') || document.createElement('span');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'Suara: ON';
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'Suara: OFF';
    }
    
    if (!soundToggleBtn.contains(text)) {
        soundToggleBtn.appendChild(text);
    }
}

soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
    
    if (soundEnabled) playSound('click');
});

function playSound(type) {
    if (!soundEnabled) return;
    
    // Create audio context for simple sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(type) {
        case 'click':
            createBeep(audioContext, 800, 0.1);
            break;
        case 'success':
            createBeep(audioContext, 1200, 0.2);
            break;
        case 'error':
            createBeep(audioContext, 400, 0.3);
            break;
    }
}

function createBeep(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// High Scores Functions
function addHighScore(game, score) {
    const scoreEntry = {
        name: currentPlayerName,
        score: score,
        date: new Date().toLocaleDateString('id-ID'),
        timestamp: Date.now()
    };
    
    highScores[game].push(scoreEntry);
    highScores[game].sort((a, b) => b.score - a.score);
    highScores[game] = highScores[game].slice(0, 10); // Keep top 10
    
    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateScoresDisplay();
}

function updateScoresDisplay() {
    scoresList.innerHTML = '';
    
    const games = [
        { id: 'math', name: 'Matematika', icon: 'calculator' },
        { id: 'blast', name: 'Block Blast', icon: 'bomb' },
        { id: 'memory', name: 'Memory Game', icon: 'brain' }
    ];
    
    games.forEach(game => {
        const gameScores = highScores[game.id];
        if (gameScores.length === 0) return;
        
        const gameSection = document.createElement('div');
        gameSection.className = 'help-section';
        gameSection.innerHTML = `
            <h4><i class="fas fa-${game.icon}"></i> ${game.name}</h4>
            <div class="scores-list-mini">
                ${gameScores.map((score, index) => `
                    <div class="score-item">
                        <span>${index + 1}. ${score.name}</span>
                        <span>${score.score} poin</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        scoresList.appendChild(gameSection);
    });
    
    if (scoresList.children.length === 0) {
        scoresList.innerHTML = '<p style="text-align: center; color: #a0aec0;">Belum ada skor tertinggi</p>';
    }
}

highScoresBtn.addEventListener('click', () => {
    updateScoresDisplay();
    scoresModal.classList.add('active');
});

closeScoresBtn.addEventListener('click', () => {
    scoresModal.classList.remove('active');
});

// Help Modal Functions
helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
});

closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.remove('active');
});

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ========== GAME MATEMATIKA ==========
let mathScore = 0;
let mathTime = 60;
let mathLevel = 1;
let mathTimer;
let currentQuestion = {};

const mathQuestionEl = document.getElementById('math-question');
const mathScoreEl = document.getElementById('math-score');
const mathTimeEl = document.getElementById('math-time');
const mathLevelEl = document.getElementById('math-level');
const checkAnswerBtn = document.getElementById('check-answer');
const nextQuestionBtn = document.getElementById('next-question');
const resetMathBtn = document.getElementById('reset-math');
const mathAnswerEl = document.getElementById('math-answer');

function initMathGame() {
    resetMathGame();
    
    // Event listeners
    checkAnswerBtn.addEventListener('click', checkMathAnswer);
    nextQuestionBtn.addEventListener('click', generateMathQuestion);
    resetMathBtn.addEventListener('click', resetMathGame);
    
    mathAnswerEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkMathAnswer();
    });
}

function generateMathQuestion() {
    const operations = ['+', '-', '×', '÷'];
    let a, b, operation, answer;
    
    // Sesuaikan kesulitan dengan level
    const maxNumber = 10 + (mathLevel * 5);
    operation = operations[Math.floor(Math.random() * operations.length)];
    
    if (operation === '+') {
        a = Math.floor(Math.random() * maxNumber) + 1;
        b = Math.floor(Math.random() * maxNumber) + 1;
        answer = a + b;
    } else if (operation === '-') {
        a = Math.floor(Math.random() * maxNumber) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
    } else if (operation === '×') {
        a = Math.floor(Math.random() * (maxNumber/2)) + 1;
        b = Math.floor(Math.random() * (maxNumber/2)) + 1;
        answer = a * b;
    } else { // division
        b = Math.floor(Math.random() * 8) + 2;
        answer = Math.floor(Math.random() * 8) + 2;
        a = b * answer;
    }
    
    currentQuestion = { a, b, operation, answer };
    mathQuestionEl.textContent = `${a} ${operation} ${b} = ?`;
    mathAnswerEl.value = '';
    mathAnswerEl.focus();
}

function checkMathAnswer() {
    const userAnswer = parseInt(mathAnswerEl.value);
    
    if (isNaN(userAnswer)) {
        showNotification('Masukkan jawaban yang valid!', 'error');
        return;
    }
    
    if (userAnswer === currentQuestion.answer) {
        mathScore += 10;
        mathScoreEl.textContent = mathScore;
        
        // Naik level setiap 50 poin
        if (mathScore % 50 === 0 && mathLevel < 10) {
            mathLevel++;
            mathLevelEl.textContent = mathLevel;
            showNotification(`Level up! Sekarang level ${mathLevel}`, 'success');
        }
        
        if (soundEnabled) playSound('success');
        generateMathQuestion();
    } else {
        showNotification(`Salah! Jawaban yang benar adalah ${currentQuestion.answer}`, 'error');
        mathAnswerEl.value = '';
        mathAnswerEl.focus();
        if (soundEnabled) playSound('error');
    }
}

function startMathTimer() {
    clearInterval(mathTimer);
    mathTimer = setInterval(() => {
        mathTime--;
        mathTimeEl.textContent = mathTime;
        
        if (mathTime <= 0) {
            clearInterval(mathTimer);
            showNotification(`Waktu habis! Skor akhir: ${mathScore}`);
            addHighScore('math', mathScore);
            resetMathGame();
        }
    }, 1000);
}

function resetMathGame() {
    clearInterval(mathTimer);
    mathScore = 0;
    mathTime = 60;
    mathLevel = 1;
    
    mathScoreEl.textContent = mathScore;
    mathTimeEl.textContent = mathTime;
    mathLevelEl.textContent = mathLevel;
    
    generateMathQuestion();
    startMathTimer();
}

// ========== GAME TIC TAC TOE ==========
let ticBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'computer';
let ticWins = 0, ticLosses = 0, ticDraws = 0;

const ticBoardEl = document.getElementById('tic-board');
const ticStatusEl = document.getElementById('tic-status');
const ticWinsEl = document.getElementById('tic-wins');
const ticLossesEl = document.getElementById('tic-losses');
const ticDrawsEl = document.getElementById('tic-draws');
const resetTicBtn = document.getElementById('reset-tic');
const changeModeBtn = document.getElementById('change-mode');

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initTicTacToe() {
    createTicBoard();
    
    // Event listeners
    resetTicBtn.addEventListener('click', resetTicTacToe);
    changeModeBtn.addEventListener('click', toggleGameMode);
}

function createTicBoard() {
    ticBoardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'tic-cell';
        cell.setAttribute('data-index', i);
        cell.textContent = ticBoard[i];
        if (ticBoard[i] === 'X') cell.classList.add('x');
        if (ticBoard[i] === 'O') cell.classList.add('o');
        cell.addEventListener('click', () => handleCellClick(i));
        ticBoardEl.appendChild(cell);
    }
}

function handleCellClick(index) {
    if (ticBoard[index] !== '' || !gameActive) return;
    
    ticBoard[index] = currentPlayer;
    createTicBoard();
    
    if (soundEnabled) playSound('click');
    
    if (checkWin()) {
        gameActive = false;
        if (currentPlayer === 'X') {
            ticWins++;
            showNotification('Kamu Menang!', 'success');
        } else {
            ticLosses++;
            showNotification('Komputer Menang!', 'error');
        }
        updateTicStats();
        return;
    }
    
    if (checkDraw()) {
        gameActive = false;
        ticDraws++;
        showNotification('Seri!', 'info');
        updateTicStats();
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTicStatus();
    
    if (gameMode === 'computer' && currentPlayer === 'O' && gameActive) {
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    const emptyCells = [];
    ticBoard.forEach((cell, index) => {
        if (cell === '') emptyCells.push(index);
    });
    
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        handleCellClick(randomIndex);
    }
}

function checkWin() {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (ticBoard[a] && ticBoard[a] === ticBoard[b] && ticBoard[a] === ticBoard[c]) {
            // Highlight winning cells
            condition.forEach(index => {
                const cell = ticBoardEl.children[index];
                cell.style.animation = 'pulse 1s ease infinite';
            });
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return !ticBoard.includes('');
}

function updateTicStats() {
    ticWinsEl.textContent = ticWins;
    ticLossesEl.textContent = ticLosses;
    ticDrawsEl.textContent = ticDraws;
}

function updateTicStatus() {
    const playerText = currentPlayer === 'X' ? '(Kamu)' : gameMode === 'computer' ? '(Komputer)' : '(Pemain 2)';
    ticStatusEl.innerHTML = `Giliran: <span class="player-turn">${currentPlayer}</span> ${playerText}`;
}

function resetTicTacToe() {
    ticBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateTicStatus();
    createTicBoard();
    
    // Remove animations
    document.querySelectorAll('.tic-cell').forEach(cell => {
        cell.style.animation = '';
    });
}

function toggleGameMode() {
    gameMode = gameMode === 'computer' ? 'two-player' : 'computer';
    changeModeBtn.innerHTML = `<i class="fas fa-robot"></i> Mode: ${gameMode === 'computer' ? 'vs Komputer' : '2 Pemain'}`;
    resetTicTacToe();
}

// ========== GAME BLOCK BLAST ==========
let blastScore = 0;
let blastMoves = 30;
let blastCombo = 0;
const blastColors = ['#FF5252', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];

const blastGridEl = document.getElementById('blast-grid');
const blastScoreEl = document.getElementById('blast-score');
const blastMovesEl = document.getElementById('blast-moves');
const blastComboEl = document.getElementById('blast-combo');
const resetBlastBtn = document.getElementById('reset-blast');
const hintBlastBtn = document.getElementById('hint-blast');

function initBlockBlast() {
    createBlastGrid();
    
    // Event listeners
    resetBlastBtn.addEventListener('click', createBlastGrid);
    hintBlastBtn.addEventListener('click', showBlastHint);
}

function createBlastGrid() {
    blastGridEl.innerHTML = '';
    blastScore = 0;
    blastMoves = 30;
    blastCombo = 0;
    
    blastScoreEl.textContent = blastScore;
    blastMovesEl.textContent = blastMoves;
    blastComboEl.textContent = blastCombo;
    
    const size = 8 * 8; // 8x8 grid
    for (let i = 0; i < size; i++) {
        const cell = document.createElement('div');
        const color = blastColors[Math.floor(Math.random() * blastColors.length)];
        cell.className = 'blast-cell';
        cell.style.backgroundColor = color;
        cell.setAttribute('data-color', color);
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleBlastClick(i));
        blastGridEl.appendChild(cell);
    }
}

function handleBlastClick(index) {
    if (blastMoves <= 0) return;
    
    const clickedCell = blastGridEl.children[index];
    const color = clickedCell.getAttribute('data-color');
    
    const connected = findConnectedCells(index, color);
    
    if (connected.length < 2) {
        showNotification('Pilih kelompok dengan minimal 2 balok!', 'error');
        return;
    }
    
    const points = connected.length * 10 * (blastCombo + 1);
    blastScore += points;
    blastMoves--;
    blastCombo++;
    
    blastScoreEl.textContent = blastScore;
    blastMovesEl.textContent = blastMoves;
    blastComboEl.textContent = blastCombo;
    
    if (soundEnabled) playSound('success');
    
    // Animate removal
    connected.forEach(cellIndex => {
        const cell = blastGridEl.children[cellIndex];
        cell.style.transition = 'all 0.3s ease';
        cell.style.transform = 'scale(0)';
        cell.style.opacity = '0';
        
        setTimeout(() => {
            const newColor = blastColors[Math.floor(Math.random() * blastColors.length)];
            cell.style.backgroundColor = newColor;
            cell.setAttribute('data-color', newColor);
            cell.style.transform = 'scale(1)';
            cell.style.opacity = '1';
        }, 300);
    });
    
    if (blastMoves <= 0) {
        setTimeout(() => {
            showNotification(`Game Over! Skor akhir: ${blastScore}`, 'info');
            addHighScore('blast', blastScore);
            createBlastGrid();
        }, 500);
    }
}

function findConnectedCells(startIndex, color, visited = new Set()) {
    const result = [];
    const stack = [startIndex];
    
    while (stack.length > 0) {
        const index = stack.pop();
        if (visited.has(index)) continue;
        
        const cell = blastGridEl.children[index];
        if (!cell || cell.getAttribute('data-color') !== color) continue;
        
        visited.add(index);
        result.push(index);
        
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        if (row > 0) stack.push((row - 1) * 8 + col);
        if (row < 7) stack.push((row + 1) * 8 + col);
        if (col > 0) stack.push(row * 8 + (col - 1));
        if (col < 7) stack.push(row * 8 + (col + 1));
    }
    
    return result;
}

function showBlastHint() {
    for (let i = 0; i < 64; i++) {
        const color = blastGridEl.children[i].getAttribute('data-color');
        const connected = findConnectedCells(i, color);
        
        if (connected.length >= 2) {
            connected.forEach(index => {
                const cell = blastGridEl.children[index];
                cell.style.boxShadow = '0 0 15px 5px yellow';
                setTimeout(() => {
                    cell.style.boxShadow = '';
                }, 1500);
            });
            return;
        }
    }
    showNotification('Tidak ada kelompok yang bisa dihancurkan!', 'error');
}

// ========== GAME MEMORY ==========
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryTime = 0;
let memoryTimer;
let canFlip = true;
let hintsLeft = 3;

const memoryGridEl = document.getElementById('memory-grid');
const memoryMovesEl = document.getElementById('memory-moves');
const memoryPairsEl = document.getElementById('memory-pairs');
const memoryTimeEl = document.getElementById('memory-time');
const resetMemoryBtn = document.getElementById('reset-memory');
const hintMemoryBtn = document.getElementById('hint-memory');
const hintsLeftEl = document.getElementById('hints-left');

const memorySymbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🦄', '🐮'];

function initMemoryGame() {
    resetMemoryGame();
    
    // Event listeners
    resetMemoryBtn.addEventListener('click', resetMemoryGame);
    hintMemoryBtn.addEventListener('click', showMemoryHint);
}

function resetMemoryGame() {
    memoryGridEl.innerHTML = '';
    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    memoryTime = 0;
    hintsLeft = 3;
    canFlip = true;
    
    clearInterval(memoryTimer);
    
    memoryMovesEl.textContent = memoryMoves;
    memoryPairsEl.textContent = `${matchedPairs}/8`;
    memoryTimeEl.textContent = memoryTime;
    hintsLeftEl.textContent = hintsLeft;
    
    // Use 8 pairs for 4x4 grid
    const selectedSymbols = memorySymbols.sort(() => 0.5 - Math.random()).slice(0, 8);
    let cardValues = [...selectedSymbols, ...selectedSymbols];
    cardValues = cardValues.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 16; i++) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.setAttribute('data-index', i);
        card.setAttribute('data-symbol', cardValues[i]);
        
        const front = document.createElement('div');
        front.className = 'front';
        front.textContent = cardValues[i];
        
        const back = document.createElement('div');
        back.className = 'back';
        back.textContent = '?';
        
        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', () => flipCard(i));
        
        memoryGridEl.appendChild(card);
        memoryCards.push({
            element: card,
            symbol: cardValues[i],
            flipped: false,
            matched: false
        });
    }
    
    memoryTimer = setInterval(() => {
        memoryTime++;
        memoryTimeEl.textContent = memoryTime;
    }, 1000);
}

function flipCard(index) {
    const card = memoryCards[index];
    
    if (!canFlip || card.flipped || card.matched) return;
    
    card.flipped = true;
    card.element.classList.add('flipped');
    flippedCards.push(card);
    
    if (soundEnabled) playSound('click');
    
    if (flippedCards.length === 2) {
        canFlip = false;
        memoryMoves++;
        memoryMovesEl.textContent = memoryMoves;
        
        if (flippedCards[0].symbol === flippedCards[1].symbol) {
            // Match found
            flippedCards[0].matched = true;
            flippedCards[1].matched = true;
            matchedPairs++;
            memoryPairsEl.textContent = `${matchedPairs}/8`;
            
            flippedCards.forEach(card => {
                card.element.classList.add('matched');
            });
            
            flippedCards = [];
            canFlip = true;
            
            if (soundEnabled) playSound('success');
            
            if (matchedPairs === 8) {
                clearInterval(memoryTimer);
                setTimeout(() => {
                    const efficiency = Math.round((8 / memoryMoves) * 100);
                    showNotification(
                        `Selamat! Kamu menang!\n` +
                        `Waktu: ${memoryTime} detik\n` +
                        `Gerakan: ${memoryMoves}\n` +
                        `Efisiensi: ${efficiency}%`,
                        'success'
                    );
                    addHighScore('memory', Math.round((1000 / (memoryTime * memoryMoves)) * 100));
                }, 500);
            }
        } else {
            // No match
            setTimeout(() => {
                flippedCards[0].flipped = false;
                flippedCards[1].flipped = false;
                flippedCards[0].element.classList.remove('flipped');
                flippedCards[1].element.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
            
            if (soundEnabled) playSound('error');
        }
    }
}

function showMemoryHint() {
    if (hintsLeft <= 0) {
        showNotification('Petunjuk sudah habis!', 'error');
        return;
    }
    
    hintsLeft--;
    hintsLeftEl.textContent = hintsLeft;
    
    const unmatchedCards = memoryCards.filter(card => !card.matched && !card.flipped);
    
    if (unmatchedCards.length >= 2) {
        const card1 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const card2 = unmatchedCards.find(card => 
            card !== card1 && card.symbol === card1.symbol
        );
        
        if (card1 && card2) {
            card1.element.classList.add('flipped');
            card2.element.classList.add('flipped');
            
            setTimeout(() => {
                if (!card1.matched) card1.element.classList.remove('flipped');
                if (!card2.matched) card2.element.classList.remove('flipped');
            }, 1000);
        }
    }
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 400px;
    `;
    
    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
            style.remove();
        }
    }, 3000);
}

// Initialize everything when DOM is loaded

document.addEventListener('DOMContentLoaded', init);


// ====================================
// GAME MATRIX
// ====================================

let matrixScore = 0;
let matrixCorrect = 0;
let matrixTimeLeft = 120;
let matrixTimer;
let currentMatrixProblem = null;

function initMatrixGame() {
    document.getElementById('matrix-score').textContent = matrixScore;
    document.getElementById('matrix-correct').textContent = matrixCorrect;
    document.getElementById('matrix-time').textContent = matrixTimeLeft;
    
    generateMatrixProblem();
    startMatrixTimer();
}

function startMatrixTimer() {
    if (matrixTimer) clearInterval(matrixTimer);
    
    matrixTimer = setInterval(() => {
        matrixTimeLeft--;
        document.getElementById('matrix-time').textContent = matrixTimeLeft;
        
        if (matrixTimeLeft <= 0) {
            endMatrixGame();
        }
    }, 1000);
}

function generateMatrixProblem() {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const size = Math.floor(Math.random() * 2) + 2; // 2x2 or 3x3
    
    let matrixA = [];
    let matrixB = [];
    
    // Generate random matrices
    for (let i = 0; i < size; i++) {
        matrixA[i] = [];
        matrixB[i] = [];
        for (let j = 0; j < size; j++) {
            matrixA[i][j] = Math.floor(Math.random() * 20) - 10;
            matrixB[i][j] = Math.floor(Math.random() * 20) - 10;
        }
    }
    
    // Calculate answer
    let answer;
    switch(operation) {
        case '+':
            answer = addMatrices(matrixA, matrixB);
            document.getElementById('matrix-type').textContent = 'Penjumlahan Matriks';
            break;
        case '-':
            answer = subtractMatrices(matrixA, matrixB);
            document.getElementById('matrix-type').textContent = 'Pengurangan Matriks';
            break;
        case '×':
            answer = multiplyMatrices(matrixA, matrixB);
            document.getElementById('matrix-type').textContent = 'Perkalian Matriks';
            break;
    }
    
    currentMatrixProblem = { matrixA, matrixB, operation, answer, size };
    
    displayMatrixProblem(matrixA, matrixB, operation, size);
}

function addMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

function subtractMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

function multiplyMatrices(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function displayMatrixProblem(matrixA, matrixB, operation, size) {
    const matrixADisplay = document.getElementById('matrix-a');
    const matrixBDisplay = document.getElementById('matrix-b');
    const matrixInput = document.getElementById('matrix-input');
    const matrixOp = document.getElementById('matrix-op');
    
    // Display operation
    matrixOp.textContent = operation === '×' ? '×' : operation;
    
    // Display matrix A
    matrixADisplay.innerHTML = '<div class="matrix-title">Matrix A</div>';
    matrixA.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        row.forEach(val => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = val;
            rowDiv.appendChild(cell);
        });
        matrixADisplay.appendChild(rowDiv);
    });
    
    // Display matrix B
    matrixBDisplay.innerHTML = '<div class="matrix-title">Matrix B</div>';
    matrixB.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        row.forEach(val => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = val;
            rowDiv.appendChild(cell);
        });
        matrixBDisplay.appendChild(rowDiv);
    });
    
    // Create input matrix
    matrixInput.innerHTML = '<div class="matrix-title">Jawaban</div>';
    for (let i = 0; i < size; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            input.dataset.row = i;
            input.dataset.col = j;
            input.placeholder = '?';
            rowDiv.appendChild(input);
        }
        matrixInput.appendChild(rowDiv);
    }
}

function checkMatrixAnswer() {
    const inputs = document.querySelectorAll('#matrix-input input');
    const answer = currentMatrixProblem.answer;
    let allCorrect = true;
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const userAnswer = parseInt(input.value);
        const correctAnswer = answer[row][col];
        
        if (userAnswer === correctAnswer) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
        } else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        matrixScore += 20;
        matrixCorrect++;
        document.getElementById('matrix-score').textContent = matrixScore;
        document.getElementById('matrix-correct').textContent = matrixCorrect;
        
        // Add time bonus
        matrixTimeLeft += 10;
        document.getElementById('matrix-time').textContent = matrixTimeLeft;
        
        setTimeout(() => generateMatrixProblem(), 1500);
    }
}

function endMatrixGame() {
    clearInterval(matrixTimer);
    alert(`Waktu habis! Skor akhir: ${matrixScore}\nJawaban benar: ${matrixCorrect}/10`);
    saveHighScore('Matrix', matrixScore);
}

function resetMatrixGame() {
    clearInterval(matrixTimer);
    matrixScore = 0;
    matrixCorrect = 0;
    matrixTimeLeft = 120;
    initMatrixGame();
}

// ====================================
// GAME BARISAN DAN DERET
// ====================================

let sequenceScore = 0;
let sequenceLevel = 1;
let sequenceCombo = 0;
let sequenceHints = 3;
let currentSequenceProblem = null;

function initSequenceGame() {
    document.getElementById('sequence-score').textContent = sequenceScore;
    document.getElementById('sequence-level').textContent = sequenceLevel;
    document.getElementById('sequence-combo').textContent = sequenceCombo;
    document.getElementById('sequence-hints-left').textContent = sequenceHints;
    
    generateSequenceProblem();
}

function generateSequenceProblem() {
    const problemTypes = ['aritmatika', 'geometri', 'fibonacci', 'kuadrat'];
    const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let sequence = [];
    let question = '';
    let correctAnswer;
    let options = [];
    
    switch(type) {
        case 'aritmatika':
            const a1 = Math.floor(Math.random() * 10) + 1;
            const diff = Math.floor(Math.random() * 5) + 1;
            sequence = generateArithmeticSequence(a1, diff, 5);
            question = `Suku ke-8 dari barisan aritmatika ini adalah?`;
            correctAnswer = a1 + 7 * diff;
            document.getElementById('sequence-question-type').textContent = 'Barisan Aritmatika';
            break;
            
        case 'geometri':
            const g1 = Math.floor(Math.random() * 10) + 1;
            const ratio = Math.floor(Math.random() * 3) + 2;
            sequence = generateGeometricSequence(g1, ratio, 5);
            question = `Suku ke-7 dari barisan geometri ini adalah?`;
            correctAnswer = g1 * Math.pow(ratio, 6);
            document.getElementById('sequence-question-type').textContent = 'Barisan Geometri';
            break;
            
        case 'fibonacci':
            sequence = [1, 1, 2, 3, 5];
            question = `Suku ke-9 dari barisan Fibonacci ini adalah?`;
            correctAnswer = 34;
            document.getElementById('sequence-question-type').textContent = 'Barisan Fibonacci';
            break;
            
        case 'kuadrat':
            const n = Math.floor(Math.random() * 5) + 1;
            for (let i = 1; i <= 5; i++) {
                sequence.push(i * i + n);
            }
            question = `Berapa jumlah 10 suku pertama?`;
            correctAnswer = calculateQuadraticSum(n);
            document.getElementById('sequence-question-type').textContent = 'Barisan Kuadrat';
            break;
    }
    
    // Generate wrong answers
    options = generateOptions(correctAnswer);
    
    currentSequenceProblem = { type, sequence, question, correctAnswer, options };
    
    displaySequenceProblem(sequence, question, options);
}

function generateArithmeticSequence(first, diff, length) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(first + i * diff);
    }
    return sequence;
}

function generateGeometricSequence(first, ratio, length) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(first * Math.pow(ratio, i));
    }
    return sequence;
}

function calculateQuadraticSum(n) {
    let sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += i * i + n;
    }
    return sum;
}

function generateOptions(correct) {
    const options = [correct];
    while (options.length < 4) {
        const wrong = correct + (Math.floor(Math.random() * 20) - 10);
        if (wrong !== correct && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    return shuffleArray(options);
}

function displaySequenceProblem(sequence, question, options) {
    const display = document.getElementById('sequence-display');
    const problem = document.getElementById('sequence-problem');
    const optionsContainer = document.getElementById('sequence-options');
    
    // Display sequence
    display.innerHTML = '';
    sequence.forEach(num => {
        const numDiv = document.createElement('div');
        numDiv.className = 'sequence-number';
        numDiv.textContent = num;
        display.appendChild(numDiv);
    });
    
    // Display question
    problem.textContent = question;
    
    // Display options
    optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'sequence-option';
        optionBtn.textContent = option;
        optionBtn.onclick = () => checkSequenceAnswer(option);
        optionsContainer.appendChild(optionBtn);
    });
}

function checkSequenceAnswer(selected) {
    const correct = currentSequenceProblem.correctAnswer;
    const options = document.querySelectorAll('.sequence-option');
    
    options.forEach(option => {
        if (parseInt(option.textContent) === correct) {
            option.classList.add('correct');
        }
        if (parseInt(option.textContent) === selected && selected !== correct) {
            option.classList.add('incorrect');
        }
        option.disabled = true;
    });
    
    if (selected === correct) {
        sequenceScore += 15 * sequenceLevel;
        sequenceCombo++;
        if (sequenceCombo % 3 === 0) {
            sequenceLevel++;
        }
        
        if (sequenceCombo >= 10) {
            sequenceScore += 50; // Bonus combo
        }
        
        document.getElementById('sequence-score').textContent = sequenceScore;
        document.getElementById('sequence-level').textContent = sequenceLevel;
        document.getElementById('sequence-combo').textContent = sequenceCombo;
        
        setTimeout(() => generateSequenceProblem(), 1500);
    } else {
        sequenceCombo = 0;
        document.getElementById('sequence-combo').textContent = sequenceCombo;
    }
}

function useSequenceHint() {
    if (sequenceHints > 0) {
        sequenceHints--;
        document.getElementById('sequence-hints-left').textContent = sequenceHints;
        
        // Show one wrong option as disabled
        const options = document.querySelectorAll('.sequence-option');
        const wrongOptions = Array.from(options).filter(opt => 
            parseInt(opt.textContent) !== currentSequenceProblem.correctAnswer
        );
        
        if (wrongOptions.length > 0) {
            const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            randomWrong.style.opacity = '0.5';
            randomWrong.disabled = true;
        }
    }
}

function resetSequenceGame() {
    sequenceScore = 0;
    sequenceLevel = 1;
    sequenceCombo = 0;
    sequenceHints = 3;
    initSequenceGame();
}

// ====================================
// GAME BUNGA MAJEMUK & ANUITAS
// ====================================

let financeScore = 0;
let currentFinanceProblem = null;
let financeMode = 'bunga'; // 'bunga' or 'anuitas'

function initFinanceGame() {
    document.getElementById('finance-score').textContent = financeScore;
    generateFinanceProblem();
}

function generateFinanceProblem() {
    const modes = ['bunga', 'anuitas'];
    financeMode = modes[Math.floor(Math.random() * modes.length)];
    
    let scenario = '';
    let correctAnswer;
    let principal, rate, period;
    
    switch(financeMode) {
        case 'bunga':
            principal = Math.floor(Math.random() * 100) * 1000000; // 1-100 juta
            rate = (Math.floor(Math.random() * 15) + 5) / 100; // 5%-20%
            period = Math.floor(Math.random() * 10) + 5; // 5-15 tahun
            
            scenario = `Anda menabung Rp ${formatRupiah(principal)} dengan suku bunga ${(rate * 100)}% per tahun (bunga majemuk). Berapa jumlah uang Anda setelah ${period} tahun?`;
            correctAnswer = calculateCompoundInterest(principal, rate, period);
            
            document.getElementById('finance-mode').textContent = 'Bunga Majemuk';
            break;
            
        case 'anuitas':
            principal = Math.floor(Math.random() * 50) * 1000000; // 1-50 juta
            rate = (Math.floor(Math.random() * 10) + 5) / 100; // 5%-15%
            period = Math.floor(Math.random() * 5) + 3; // 3-8 tahun
            
            scenario = `Anda meminjam Rp ${formatRupiah(principal)} dengan anuitas tahunan, suku bunga ${(rate * 100)}% per tahun selama ${period} tahun. Berapa besar angsuran tahunan?`;
            correctAnswer = calculateAnnuity(principal, rate, period);
            
            document.getElementById('finance-mode').textContent = 'Anuitas';
            break;
    }
    
    currentFinanceProblem = {
        mode: financeMode,
        scenario,
        correctAnswer,
        principal,
        rate,
        period
    };
    
    // Set difficulty
    const difficulty = period <= 5 ? 'Mudah' : period <= 10 ? 'Sedang' : 'Sulit';
    document.getElementById('finance-difficulty').textContent = difficulty;
    
    // Fill inputs
    document.getElementById('principal').value = principal;
    document.getElementById('interest-rate').value = (rate * 100).toFixed(1);
    document.getElementById('period').value = period;
    document.getElementById('finance-result').value = '';
    
    displayFinanceScenario(scenario);
}

function calculateCompoundInterest(principal, rate, period) {
    return principal * Math.pow(1 + rate, period);
}

function calculateAnnuity(principal, rate, period) {
    const numerator = principal * rate * Math.pow(1 + rate, period);
    const denominator = Math.pow(1 + rate, period) - 1;
    return numerator / denominator;
}

function formatRupiah(amount) {
    return amount.toLocaleString('id-ID');
}

function displayFinanceScenario(scenario) {
    const scenarioDiv = document.getElementById('finance-scenario');
    scenarioDiv.textContent = scenario;
}

function calculateCompound() {
    const principal = parseFloat(document.getElementById('principal').value);
    const rate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const period = parseFloat(document.getElementById('period').value);
    
    if (!principal || !rate || !period) {
        alert('Harap isi semua field!');
        return;
    }
    
    const result = calculateCompoundInterest(principal, rate, period);
    document.getElementById('finance-result').value = `Rp ${formatRupiah(Math.round(result))}`;
}

function calculateAnnuityPayment() {
    const principal = parseFloat(document.getElementById('principal').value);
    const rate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const period = parseFloat(document.getElementById('period').value);
    
    if (!principal || !rate || !period) {
        alert('Harap isi semua field!');
        return;
    }
    
    const result = calculateAnnuity(principal, rate, period);
    document.getElementById('finance-result').value = `Rp ${formatRupiah(Math.round(result))}/tahun`;
}

function checkFinanceAnswer() {
    const userAnswer = parseFloat(document.getElementById('finance-result').value.replace(/[^\d]/g, ''));
    const correctAnswer = Math.round(currentFinanceProblem.correctAnswer);
    
    if (!userAnswer) {
        alert('Harap hitung terlebih dahulu!');
        return;
    }
    
    // Allow 1% tolerance
    const tolerance = correctAnswer * 0.01;
    const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
    
    if (isCorrect) {
        financeScore += 25;
        document.getElementById('finance-score').textContent = financeScore;
        alert('Jawaban benar! +25 poin');
        
        // Generate timeline visualization for compound interest
        if (financeMode === 'bunga') {
            showCompoundTimeline(
                currentFinanceProblem.principal,
                currentFinanceProblem.rate,
                currentFinanceProblem.period
            );
        }
        
        setTimeout(() => generateFinanceProblem(), 2000);
    } else {
        alert(`Jawaban salah. Yang benar: Rp ${formatRupiah(correctAnswer)}`);
    }
}

function showCompoundTimeline(principal, rate, period) {
    let timelineHTML = '<div class="timeline">';
    for (let i = 0; i <= period; i++) {
        const amount = principal * Math.pow(1 + rate, i);
        timelineHTML += `
            <div class="timeline-year ${i === period ? 'current' : ''}">
                <div>Tahun ${i}</div>
                <div>Rp ${formatRupiah(Math.round(amount))}</div>
            </div>
        `;
    }
    timelineHTML += '</div>';
    
    // Append to scenario
    const scenarioDiv = document.getElementById('finance-scenario');
    scenarioDiv.innerHTML += timelineHTML;
}

function resetFinanceGame() {
    financeScore = 0;
    document.getElementById('finance-score').textContent = financeScore;
    generateFinanceProblem();
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ====================================
// EVENT LISTENERS
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize games when their sections are shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    switch(target.id) {
                        case 'matrix-game':
                            initMatrixGame();
                            break;
                        case 'sequence-game':
                            initSequenceGame();
                            break;
                        case 'finance-game':
                            initFinanceGame();
                            break;
                    }
                }
            }
        });
    });
    
    // Observe game sections
    const gameSections = document.querySelectorAll('.game-section');
    gameSections.forEach(section => {
        observer.observe(section, { attributes: true });
    });
    
    // Matrix game event listeners
    document.getElementById('check-matrix')?.addEventListener('click', checkMatrixAnswer);
    document.getElementById('next-matrix')?.addEventListener('click', generateMatrixProblem);
    document.getElementById('reset-matrix')?.addEventListener('click', resetMatrixGame);
    document.getElementById('hint-matrix')?.addEventListener('click', () => {
        // Show answer for one cell
        const inputs = document.querySelectorAll('#matrix-input input');
        if (inputs.length > 0) {
            const randomInput = inputs[Math.floor(Math.random() * inputs.length)];
            const row = parseInt(randomInput.dataset.row);
            const col = parseInt(randomInput.dataset.col);
            randomInput.value = currentMatrixProblem.answer[row][col];
            randomInput.classList.add('correct');
        }
    });
    
    // Sequence game event listeners
    document.getElementById('hint-sequence')?.addEventListener('click', useSequenceHint);
    document.getElementById('reset-sequence')?.addEventListener('click', resetSequenceGame);
    
    // Finance game event listeners
    document.getElementById('calculate-compound')?.addEventListener('click', calculateCompound);
    document.getElementById('calculate-annuity')?.addEventListener('click', calculateAnnuityPayment);
    document.getElementById('check-finance')?.addEventListener('click', checkFinanceAnswer);
    document.getElementById('new-finance-problem')?.addEventListener('click', generateFinanceProblem);
    document.getElementById('reset-finance')?.addEventListener('click', resetFinanceGame);
    
    // Add to high scores system
    window.saveHighScore = function(game, score) {
        const highScores = JSON.parse(localStorage.getItem('gamezoneHighScores') || '{}');
        if (!highScores[game] || score > highScores[game].score) {
            const playerName = document.getElementById('player-name').textContent;
            highScores[game] = { name: playerName, score: score, date: new Date().toLocaleDateString() };
            localStorage.setItem('gamezoneHighScores', JSON.stringify(highScores));
        }
    };
});
