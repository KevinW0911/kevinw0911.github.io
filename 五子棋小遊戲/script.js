class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1 for black, 2 for white
        this.gameOver = false;
        this.winningLine = [];
        this.gameMode = 'pvc'; // 'pvp' or 'pvc'
        this.difficulty = 'medium';
        this.isAiThinking = false;
        
        this.initializeBoard();
        this.bindEvents();
    }
    
    initializeBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.makeMove(row, col));
                
                // Add touch event handling for better mobile experience
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent double-tap zoom
                    cell.style.transform = 'scale(0.95)';
                });
                
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    cell.style.transform = '';
                    this.makeMove(row, col);
                });
                
                cell.addEventListener('touchcancel', () => {
                    cell.style.transform = '';
                });
                gameBoard.appendChild(cell);
            }
        }
        
        this.updatePlayerDisplay();
        this.updateGameStatus('遊戲進行中');
    }
    
    bindEvents() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        const gameModeSelect = document.getElementById('gameModeSelect');
        const difficultySection = document.getElementById('difficultySection');
        
        gameModeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            if (this.gameMode === 'pvc') {
                difficultySection.style.display = 'flex';
            } else {
                difficultySection.style.display = 'none';
            }
            this.resetGame();
        });
        
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }
    
    makeMove(row, col) {
        if (this.gameOver || this.board[row][col] !== 0 || this.isAiThinking) {
            return;
        }
        
        // 玩家下棋
        if (this.gameMode === 'pvp' || this.currentPlayer === 1) {
            this.placePiece(row, col);
            
            if (!this.gameOver && this.gameMode === 'pvc' && this.currentPlayer === 2) {
                this.makeAiMove();
            }
        }
    }
    
    placePiece(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.updateCellDisplay(row, col);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.highlightWinningLine();
            const winner = this.currentPlayer === 1 ? '黑子' : '白子';
            this.updateGameStatus(`${winner} 獲勝！`, true);
            
            // 在挑戰AI模式中，如果玩家(黑子)獲勝，播放慶祝動畫
            if (this.gameMode === 'pvc' && this.currentPlayer === 1) {
                this.playCelebrationAnimation();
            }
        } else if (this.checkDraw()) {
            this.gameOver = true;
            this.updateGameStatus('平局！', true);
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updatePlayerDisplay();
        }
    }
    
    updateCellDisplay(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.className = `cell ${this.currentPlayer === 1 ? 'black' : 'white'}`;
    }
    
    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('playerDisplay');
        playerDisplay.textContent = this.currentPlayer === 1 ? '黑子' : '白子';
        playerDisplay.style.color = this.currentPlayer === 1 ? '#2d3748' : '#718096';
    }
    
    updateGameStatus(message, isWinner = false) {
        const gameStatus = document.getElementById('gameStatus');
        gameStatus.textContent = message;
        
        if (isWinner) {
            gameStatus.classList.add('winner');
        } else {
            gameStatus.classList.remove('winner');
        }
    }
    
    checkWin(row, col) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal \
            [1, -1]   // diagonal /
        ];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            let line = [[row, col]];
            
            // Check positive direction
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol] === this.currentPlayer) {
                    count++;
                    line.push([newRow, newCol]);
                } else {
                    break;
                }
            }
            
            // Check negative direction
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol] === this.currentPlayer) {
                    count++;
                    line.unshift([newRow, newCol]);
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                this.winningLine = line;
                return true;
            }
        }
        
        return false;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    highlightWinningLine() {
        this.winningLine.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning-line');
        });
    }
    
    makeAiMove() {
        if (this.gameOver || this.isAiThinking) return;
        
        this.isAiThinking = true;
        this.updateGameStatus('電腦思考中...');
        
        setTimeout(() => {
            const move = this.getBestMove();
            if (move) {
                this.placePiece(move.row, move.col);
            }
            this.isAiThinking = false;
            if (!this.gameOver) {
                this.updateGameStatus('遊戲進行中');
            }
        }, 800);
    }
    
    getBestMove() {
        const moves = this.getValidMoves();
        if (moves.length === 0) return null;
        
        // 如果是第一步，下在中央
        if (moves.length === this.boardSize * this.boardSize) {
            return { row: Math.floor(this.boardSize / 2), col: Math.floor(this.boardSize / 2) };
        }
        
        // 根據難度調整AI行為
        if (this.difficulty === 'easy') {
            return this.getEasyMove(moves);
        } else if (this.difficulty === 'medium') {
            return this.getMediumMove(moves);
        } else {
            return this.getHardMove(moves);
        }
    }
    
    getEasyMove(moves) {
        // 簡單模式：30% 機率選擇最佳解，70% 機率隨機選擇
        if (Math.random() < 0.3) {
            return this.getBestMoveFromList(moves);
        } else {
            // 隨機選擇一個位置
            return moves[Math.floor(Math.random() * moves.length)];
        }
    }
    
    getMediumMove(moves) {
        // 中等模式：70% 機率選擇最佳解，30% 機率選擇次佳解
        if (Math.random() < 0.7) {
            return this.getBestMoveFromList(moves);
        } else {
            // 選擇次佳的幾個位置之一
            const scoredMoves = moves.map(move => ({
                move,
                score: this.evaluateMove(move.row, move.col, 2)
            })).sort((a, b) => b.score - a.score);
            
            const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
            return topMoves[Math.floor(Math.random() * topMoves.length)].move;
        }
    }
    
    getHardMove(moves) {
        // 困難模式：總是選擇最佳解
        return this.getBestMoveFromList(moves);
    }
    
    getBestMoveFromList(moves) {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const score = this.evaluateMove(move.row, move.col, 2);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getValidMoves() {
        const moves = [];
        const radius = 2; // 只考慮已下棋子周圍的位置
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && this.hasNeighbor(row, col, radius)) {
                    moves.push({ row, col });
                }
            }
        }
        
        return moves;
    }
    
    hasNeighbor(row, col, radius) {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    evaluateMove(row, col, player) {
        let score = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            // 檢查攻擊分數
            score += this.evaluateLine(row, col, dx, dy, player);
            // 檢查防守分數
            score += this.evaluateLine(row, col, dx, dy, 3 - player) * 0.8;
        }
        
        return score;
    }
    
    evaluateLine(row, col, dx, dy, player) {
        let count = 1;
        let blocked = 0;
        
        // 正向檢查
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (!this.isValidPosition(newRow, newCol)) {
                blocked++;
                break;
            }
            if (this.board[newRow][newCol] === player) {
                count++;
            } else if (this.board[newRow][newCol] !== 0) {
                blocked++;
                break;
            } else {
                break;
            }
        }
        
        // 反向檢查
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (!this.isValidPosition(newRow, newCol)) {
                blocked++;
                break;
            }
            if (this.board[newRow][newCol] === player) {
                count++;
            } else if (this.board[newRow][newCol] !== 0) {
                blocked++;
                break;
            } else {
                break;
            }
        }
        
        if (blocked === 2) return 0;
        
        switch (count) {
            case 5: return 100000;
            case 4: return blocked === 0 ? 10000 : 1000;
            case 3: return blocked === 0 ? 1000 : 100;
            case 2: return blocked === 0 ? 100 : 10;
            default: return 1;
        }
    }
    
    resetGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winningLine = [];
        this.isAiThinking = false;
        
        // Clear all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell';
        });
        
        this.updatePlayerDisplay();
        this.updateGameStatus('遊戲進行中');
    }
    
    playCelebrationAnimation() {
        // 創建慶祝元素
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">😸</div>
                <div class="celebration-text">喵～恭喜小貓咪擊敗了AI！</div>
                <div class="celebration-sub-text">🐾 你真是太厲害了！ 🐾</div>
                <div class="celebration-fireworks">
                    <div class="firework">🐱</div>
                    <div class="firework">🐾</div>
                    <div class="firework">😺</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // 4秒後移除慶祝動畫
        setTimeout(() => {
            celebration.remove();
        }, 4000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});