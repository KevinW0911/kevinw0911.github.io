class FireGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.fireParticles = document.getElementById('fireParticles');
        this.fireBtn = document.getElementById('fireBtn');
        this.bombBtn = document.getElementById('bombBtn');
        this.clickCount = document.getElementById('clickCount');
        
        this.clickCounter = 0;
        this.isBreathing = false;
        this.isThrowing = false;
        this.isTouching = false;
        
        this.init();
    }
    
    init() {
        this.fireBtn.addEventListener('click', () => this.breatheFire());
        this.bombBtn.addEventListener('click', () => this.throwBomb());
        this.gameArea.addEventListener('click', (e) => this.createFireAtPosition(e));
        
        this.gameArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        this.gameArea.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.gameArea.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.gameArea.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.breatheFire();
            }
            if (e.code === 'KeyB') {
                e.preventDefault();
                this.throwBomb();
            }
        });
    }
    
    breatheFire() {
        if (this.isBreathing) return;
        
        this.isBreathing = true;
        this.clickCounter++;
        this.clickCount.textContent = this.clickCounter;
        
        this.createFireBurst();
        
        setTimeout(() => {
            this.isBreathing = false;
        }, 500);
    }
    
    throwBomb() {
        if (this.isThrowing) return;
        
        this.isThrowing = true;
        this.clickCounter++;
        this.clickCount.textContent = this.clickCounter;
        
        const targetX = Math.random() * (this.gameArea.offsetWidth - 40) + 20;
        const targetY = Math.random() * (this.gameArea.offsetHeight - 40) + 20;
        
        this.createBomb(targetX, targetY);
        
        setTimeout(() => {
            this.isThrowing = false;
        }, 300);
    }
    
    createFireBurst() {
        const centerX = this.gameArea.offsetWidth / 2;
        const centerY = this.gameArea.offsetHeight / 2;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 15;
                const distance = 50 + Math.random() * 100;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                this.createFireParticle(x, y);
            }, i * 50);
        }
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = centerX + (Math.random() - 0.5) * 200;
                const y = centerY + (Math.random() - 0.5) * 150;
                this.createFlameEffect(x, y);
            }, i * 30);
        }
    }
    
    createBomb(x, y) {
        this.createExplosion(x, y);
    }
    
    createExplosion(x, y) {
        this.gameArea.classList.add('screen-shake');
        setTimeout(() => {
            this.gameArea.classList.remove('screen-shake');
        }, 500);
        
        this.playExplosionSound();
        
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = (x - 150) + 'px';
        explosion.style.top = (y - 150) + 'px';
        
        const explosionCircle = document.createElement('div');
        explosionCircle.className = 'explosion-circle';
        explosionCircle.style.background = 'radial-gradient(circle, #ffffff, #ffff00, #ff6600, #ff0000, #8b0000, transparent)';
        explosion.appendChild(explosionCircle);
        
        for (let i = 0; i < 24; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            const angle = (Math.PI * 2 * i) / 24;
            const distance = 30 + Math.random() * 50;
            particle.style.left = (150 + Math.cos(angle) * distance) + 'px';
            particle.style.top = (150 + Math.sin(angle) * distance) + 'px';
            
            const colors = ['#ff0000', '#ff4444', '#ff8800', '#ffff00', '#ff6600', '#ffffff'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.color = particle.style.background;
            
            explosion.appendChild(particle);
        }
        
        this.fireParticles.appendChild(explosion);
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const offsetX = x + (Math.random() - 0.5) * 200;
                const offsetY = y + (Math.random() - 0.5) * 200;
                this.createFireParticle(offsetX, offsetY);
                this.createFlameEffect(offsetX, offsetY);
            }, i * 15);
        }
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ringX = x + (Math.random() - 0.5) * 60;
                const ringY = y + (Math.random() - 0.5) * 60;
                this.createExplosionRing(ringX, ringY);
            }, i * 200);
        }
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 1500);
    }
    
    createExplosionRing(x, y) {
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const distance = 80 + Math.random() * 40;
            const ringX = x + Math.cos(angle) * distance;
            const ringY = y + Math.sin(angle) * distance;
            
            setTimeout(() => {
                this.createFireParticle(ringX, ringY);
            }, i * 30);
        }
    }
    
    createFireAtPosition(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.createFireParticle(x, y);
        this.createFlameEffect(x, y);
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const offsetX = x + (Math.random() - 0.5) * 30;
                const offsetY = y + (Math.random() - 0.5) * 30;
                this.createFireParticle(offsetX, offsetY);
            }, i * 100);
        }
    }
    
    createFireParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'fire-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const size = 6 + Math.random() * 8;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        const hue = 10 + Math.random() * 40;
        particle.style.background = `radial-gradient(circle, hsl(${hue}, 100%, 60%), hsl(${hue + 20}, 100%, 40%))`;
        
        this.fireParticles.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
    
    createFlameEffect(x, y) {
        const flame = document.createElement('div');
        flame.className = 'flame-effect';
        flame.style.left = (x - 10) + 'px';
        flame.style.top = (y - 10) + 'px';
        
        const size = 15 + Math.random() * 15;
        flame.style.width = size + 'px';
        flame.style.height = size + 'px';
        
        const hue = Math.random() * 60;
        flame.style.background = `radial-gradient(circle, hsl(${hue}, 100%, 70%), hsl(${hue + 30}, 100%, 50%), transparent)`;
        
        this.fireParticles.appendChild(flame);
        
        setTimeout(() => {
            if (flame.parentNode) {
                flame.parentNode.removeChild(flame);
            }
        }, 1500);
    }
    
    handleMouseMove(e) {
        if (e.buttons === 1) {
            this.createFireAtPosition(e);
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.isTouching = true;
        const touch = e.touches[0];
        const rect = this.gameArea.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.createFireAtPosition({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.isTouching) {
            const touch = e.touches[0];
            this.createFireAtPosition({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.isTouching = false;
    }
    
    clearFire() {
        this.fireParticles.innerHTML = '';
        this.clickCounter = 0;
        this.clickCount.textContent = this.clickCounter;
        
        this.gameArea.style.animation = 'none';
        setTimeout(() => {
            this.gameArea.style.animation = '';
        }, 10);
    }
    
    addRandomFireworks() {
        setInterval(() => {
            if (Math.random() < 0.1) {
                const x = Math.random() * this.gameArea.offsetWidth;
                const y = Math.random() * this.gameArea.offsetHeight;
                this.createFireParticle(x, y);
            }
        }, 1000);
    }
    
    playExplosionSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.type = 'sawtooth';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new FireGame();
    
    setTimeout(() => {
        game.addRandomFireworks();
    }, 3000);
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('resize', () => {
    const gameArea = document.getElementById('gameArea');
    if (window.innerWidth < 600) {
        gameArea.style.width = '90vw';
        gameArea.style.height = '300px';
    } else {
        gameArea.style.width = '500px';
        gameArea.style.height = '400px';
    }
});