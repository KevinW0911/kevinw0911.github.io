class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('找不到遊戲畫布元素');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('無法取得2D繪圖上下文');
        }
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.level = 1;
        this.record = 1;
        this.lastPlatformLevel = 1;
        
        this.player = {
            x: this.width / 2,
            y: 50,
            width: 20,
            height: 20,
            velocityX: 0,
            velocityY: 0,
            speed: 3,
            jumpPower: 12,
            onGround: false,
            color: '#ffff00'
        };
        
        this.platforms = [];
        this.spikes = [];
        this.camera = { y: 0 };
        this.gravity = 0.5;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateLevel();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.keys[e.key] = false;
        });
        
        // 確保遊戲獲得焦點時清除所有按鍵狀態
        window.addEventListener('focus', () => {
            this.keys = {};
        });
        
        window.addEventListener('blur', () => {
            this.keys = {};
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideWinPage();
            this.restartGame();
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.hideWinPage();
            this.backToMenu();
        });
        
        // 手機觸控控制
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        var self = this;
        
        // 左移按鈕
        var leftBtn = document.getElementById('leftBtn');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                self.keys['ArrowLeft'] = true;
            });
            leftBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.keys['ArrowLeft'] = false;
            });
        }
        
        // 右移按鈕
        var rightBtn = document.getElementById('rightBtn');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                self.keys['ArrowRight'] = true;
            });
            rightBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.keys['ArrowRight'] = false;
            });
        }
        
        // 跳躍按鈕
        var jumpBtn = document.getElementById('jumpBtn');
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                self.keys['ArrowUp'] = true;
            });
            jumpBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.keys['ArrowUp'] = false;
            });
        }
        
        // 也支援滑鼠點擊（用於測試）
        if (leftBtn) {
            leftBtn.addEventListener('mousedown', function() {
                self.keys['ArrowLeft'] = true;
            });
            leftBtn.addEventListener('mouseup', function() {
                self.keys['ArrowLeft'] = false;
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('mousedown', function() {
                self.keys['ArrowRight'] = true;
            });
            rightBtn.addEventListener('mouseup', function() {
                self.keys['ArrowRight'] = false;
            });
        }
        
        if (jumpBtn) {
            jumpBtn.addEventListener('mousedown', function() {
                self.keys['ArrowUp'] = true;
            });
            jumpBtn.addEventListener('mouseup', function() {
                self.keys['ArrowUp'] = false;
            });
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('restartBtn').style.display = 'block';
        
        // 檢測是否為手機設備並顯示觸控控制
        if (this.isMobileDevice()) {
            document.getElementById('touchControls').style.display = 'block';
        }
    }
    
    isMobileDevice() {
        // 檢查觸控支援
        var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // 檢查用戶代理
        var mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // 檢查螢幕寬度
        var smallScreen = window.innerWidth <= 768;
        
        return hasTouch || mobileUA || smallScreen;
    }
    
    restartGame() {
        this.level = 1;
        this.lastPlatformLevel = 1;
        this.player.x = this.width / 2;
        this.player.y = 50;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.camera.y = 0;
        this.platforms = [];
        this.spikes = [];
        this.generateLevel();
        this.gameState = 'playing';
        this.updateUI();
    }
    
    generateLevel() {
        this.platforms = [];
        this.spikes = [];
        
        // 生成100關的樓梯平台 (i=0對應第1關，i=99對應第100關)
        for (let i = 0; i < 100; i++) {
            const y = i * 120 + 120; // 增加垂直間距從80到120
            const difficulty = Math.floor(i / 10); // 每10關增加難度
            
            // 調整為更友好的難度曲線
            let platformCount;
            if (i < 20) {
                platformCount = 3; // 前20關固定3個平台
            } else if (i < 40) {
                platformCount = 2 + Math.floor(Math.random() * 2); // 21-40關：2-3個平台
            } else if (i < 60) {
                platformCount = 2; // 41-60關固定2個平台
            } else if (i < 80) {
                platformCount = 1 + Math.floor(Math.random() * 2); // 61-80關：1-2個平台
            } else {
                platformCount = Math.random() < 0.8 ? 2 : 1; // 81-100關：主要2個平台
            }
            
            // 確保第100關一定有平台
            if (i === 99) { // i=99 對應第100關
                platformCount = Math.max(2, platformCount); // 至少2個平台
            }
            
            // 降低尖刺出現機率
            const spikeChance = Math.min(0.4, 0.1 + difficulty * 0.03);
            
            for (let j = 0; j < platformCount; j++) {
                // 更多樣化的平台寬度和位置
                const widthTypes = ['short', 'medium', 'long'];
                const widthType = widthTypes[Math.floor(Math.random() * widthTypes.length)];
                
                let platformWidth;
                switch(widthType) {
                    case 'short':
                        platformWidth = 60 + Math.random() * 30; // 60-90（增加）
                        break;
                    case 'medium':
                        platformWidth = 90 + Math.random() * 40; // 90-130（增加）
                        break;
                    case 'long':
                        platformWidth = 130 + Math.random() * 40; // 130-170（增加）
                        break;
                }
                
                // 後期關卡平台縮小更溫和
                if (difficulty > 6) {
                    platformWidth *= Math.max(0.7, 1 - (difficulty - 6) * 0.05);
                }
                
                platformWidth = Math.max(50, platformWidth); // 最小寬度提高到50
                
                // 更隨機的平台位置
                const availableWidth = this.width - platformWidth - 20;
                const x = 10 + Math.random() * availableWidth;
                
                // 確保平台不會超出畫面邊界
                const finalX = Math.max(5, Math.min(x, this.width - platformWidth - 5));
                
                // 檢查與其他平台的重疊（第100關跳過重疊檢查確保一定有平台）
                let overlapping = false;
                if (i !== 99) { // 不是第100關才檢查重疊
                    for (let existingPlatform of this.platforms) {
                        if (Math.abs(existingPlatform.y - y) < 20) { // 同一層檢查
                            if (finalX < existingPlatform.x + existingPlatform.width + 30 &&
                                finalX + platformWidth > existingPlatform.x - 30) {
                                overlapping = true;
                                break;
                            }
                        }
                    }
                }
                
                if (!overlapping) {
                    const platform = {
                        x: finalX,
                        y: y,
                        width: platformWidth,
                        height: 15,
                        color: '#4a90e2'
                    };
                    this.platforms.push(platform);
                    
                    // 為這個平台添加尖刺（每個平台最多一個）
                    // 第100關不放尖刺，讓玩家安全通關
                    if (Math.random() < spikeChance && i > 4 && i !== 99 && platformWidth > 60) {
                        const spikeX = finalX + 30 + Math.random() * (platformWidth - 60);
                        this.spikes.push({
                            x: spikeX,
                            y: y - 15, // 在平台上方
                            width: 20,
                            height: 15,
                            color: '#ff4444'
                        });
                    }
                }
            }
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateCamera();
        this.checkCollisions();
        this.updateLevel();
    }
    
    handleInput() {
        this.player.velocityX = 0;
        
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.velocityX = -this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.velocityX = this.player.speed;
        }
        if ((this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys[' ']) && this.player.onGround) {
            this.player.velocityY = -this.player.jumpPower;
            this.player.onGround = false;
        }
    }
    
    updatePlayer() {
        // 橫向移動
        this.player.x += this.player.velocityX;
        
        // 邊界檢查
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width;
        }
        
        // 重力
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // 假設沒有在地面上
        this.player.onGround = false;
    }
    
    updateCamera() {
        const targetY = this.player.y - this.height / 3;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }
    
    checkCollisions() {
        // 平台碰撞
        for (let platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // 從上方落下
                if (this.player.velocityY > 0 && 
                    this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    
                    // 計算平台所在的關卡層數
                    const platformLevel = Math.floor((platform.y - 120) / 120) + 1;
                    if (platformLevel > this.lastPlatformLevel) {
                        this.lastPlatformLevel = platformLevel;
                        this.level = this.lastPlatformLevel;
                        if (this.level > this.record) {
                            this.record = this.level;
                        }
                        this.updateUI();
                        
                        // 檢查是否到達第100層
                        if (this.level >= 100) {
                            this.gameWin();
                        }
                    }
                }
            }
        }
        
        // 尖刺碰撞
        for (let spike of this.spikes) {
            if (this.player.x < spike.x + spike.width &&
                this.player.x + this.player.width > spike.x &&
                this.player.y < spike.y + spike.height &&
                this.player.y + this.player.height > spike.y) {
                this.gameOver();
                return;
            }
        }
        
        // 掉出畫面
        if (this.player.y > this.camera.y + this.height + 100) {
            this.gameOver();
        }
    }
    
    updateLevel() {
        // 層數更新現在在碰撞檢測中處理，這裡保留空函數以防其他地方調用
    }
    
    gameWin() {
        this.gameState = 'gameWin';
        this.showWinPage();
    }
    
    showWinPage() {
        document.getElementById('finalRecord').textContent = String(this.record).padStart(3, '0');
        document.getElementById('winPage').style.display = 'flex';
    }
    
    hideWinPage() {
        document.getElementById('winPage').style.display = 'none';
    }
    
    backToMenu() {
        this.gameState = 'waiting';
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('restartBtn').style.display = 'none';
        document.getElementById('touchControls').style.display = 'none';
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        alert(`遊戲結束！您到達了地下 ${this.level} 層，總共100關`);
    }
    
    updateUI() {
        document.getElementById('level').textContent = String(this.level).padStart(3, '0');
        document.getElementById('record').textContent = String(this.record).padStart(3, '0');
    }
    
    render() {
        // 清除畫布
        this.ctx.fillStyle = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 保存畫布狀態
        this.ctx.save();
        
        // 應用攝像機變換
        this.ctx.translate(0, -this.camera.y);
        
        // 繪製平台
        this.ctx.fillStyle = '#4a90e2';
        for (let platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // 平台邊框
            this.ctx.strokeStyle = '#6ab7ff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // 繪製尖刺
        this.ctx.fillStyle = '#ff4444';
        for (let spike of this.spikes) {
            this.ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
            // 繪製三角形尖刺效果
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x, spike.y + spike.height);
            this.ctx.lineTo(spike.x + spike.width/2, spike.y);
            this.ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // 繪製玩家
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 玩家邊框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 恢復畫布狀態
        this.ctx.restore();
        
        // 繪製遊戲狀態
        if (this.gameState === 'waiting') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('小朋友下樓梯', this.width/2, this.height/2 - 20);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('點擊開始遊戲', this.width/2, this.height/2 + 20);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 啟動遊戲 - 添加錯誤處理
window.addEventListener('load', () => {
    try {
        new Game();
    } catch (error) {
        console.error('遊戲啟動失敗:', error);
        alert('遊戲載入失敗，請重新整理頁面');
    }
});

// 備用啟動方法
window.addEventListener('DOMContentLoaded', () => {
    if (!window.gameLoaded) {
        try {
            new Game();
            window.gameLoaded = true;
        } catch (error) {
            console.error('遊戲啟動失敗 (DOMContentLoaded):', error);
        }
    }
});