class FireGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.fireParticles = document.getElementById('fireParticles');
        this.fireBtn = document.getElementById('fireBtn');
        this.bombBtn = document.getElementById('bombBtn');
        this.waterBtn = document.getElementById('waterBtn');
        
        this.clickCounter = 0;
        this.isBreathing = false;
        this.isThrowing = false;
        this.isWatering = false;
        this.isTouching = false;
        
        this.init();
    }
    
    init() {
        this.fireBtn.addEventListener('click', () => this.breatheFire());
        this.bombBtn.addEventListener('click', () => this.throwBomb());
        this.waterBtn.addEventListener('click', () => this.addWater());
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
            if (e.code === 'KeyW') {
                e.preventDefault();
                this.addWater();
            }
        });
    }
    
    breatheFire() {
        if (this.isBreathing) return;
        
        this.isBreathing = true;
        this.clickCounter++;
        
        this.createFireBurst();
        
        setTimeout(() => {
            this.isBreathing = false;
        }, 500);
    }
    
    throwBomb() {
        if (this.isThrowing) return;
        
        this.isThrowing = true;
        this.clickCounter++;
        
        const targetX = Math.random() * (this.gameArea.offsetWidth - 40) + 20;
        const targetY = Math.random() * (this.gameArea.offsetHeight - 40) + 20;
        
        this.createBomb(targetX, targetY);
        
        setTimeout(() => {
            this.isThrowing = false;
        }, 300);
    }
    
    addWater() {
        if (this.isWatering) return;
        
        this.isWatering = true;
        this.clickCounter++;
        
        this.playWaterSound();
        this.createOceanRise();
        
        setTimeout(() => {
            this.isWatering = false;
        }, 5000);
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
    
    createOceanRise() {
        const waterLevel = document.createElement('div');
        waterLevel.className = 'water-level';
        this.gameArea.appendChild(waterLevel);
        
        const waterSurface = document.createElement('div');
        waterSurface.className = 'water-surface';
        waterLevel.appendChild(waterSurface);
        
        setTimeout(() => {
            this.createJellyfish();
            this.createBubbles();
        }, 2000);
        
        setTimeout(() => {
            if (waterLevel.parentNode) {
                waterLevel.parentNode.removeChild(waterLevel);
            }
        }, 5000);
    }
    
    createJellyfish() {
        const jellyfishCount = 4 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < jellyfishCount; i++) {
            setTimeout(() => {
                const jellyfish = document.createElement('div');
                jellyfish.className = 'jellyfish';
                
                const jellyfishBody = document.createElement('div');
                jellyfishBody.className = 'jellyfish-body';
                
                for (let j = 1; j <= 4; j++) {
                    const tentacle = document.createElement('div');
                    tentacle.className = 'jellyfish-tentacle';
                    jellyfishBody.appendChild(tentacle);
                }
                
                jellyfish.appendChild(jellyfishBody);
                
                const x = 20 + Math.random() * (this.gameArea.offsetWidth - 80);
                jellyfish.style.left = x + 'px';
                
                this.gameArea.appendChild(jellyfish);
                
                setTimeout(() => {
                    if (jellyfish.parentNode) {
                        jellyfish.parentNode.removeChild(jellyfish);
                    }
                }, 5000);
                
            }, i * 300);
        }
    }
    
    createBubbles() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'water-bubble';
                
                const x = Math.random() * this.gameArea.offsetWidth;
                bubble.style.left = x + 'px';
                bubble.style.bottom = '0px';
                
                const size = 4 + Math.random() * 8;
                bubble.style.width = size + 'px';
                bubble.style.height = size + 'px';
                
                this.gameArea.appendChild(bubble);
                
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 3000);
                
            }, i * 200);
        }
    }
    
    createWaterSplash(x, y) {
        const splash = document.createElement('div');
        splash.className = 'water-splash';
        splash.style.left = (x - 40) + 'px';
        splash.style.top = (y - 40) + 'px';
        
        const splashCircle = document.createElement('div');
        splashCircle.className = 'water-splash-circle';
        splash.appendChild(splashCircle);
        
        for (let i = 0; i < 8; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'water-ripple';
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 10 + Math.random() * 20;
            ripple.style.left = (40 + Math.cos(angle) * distance) + 'px';
            ripple.style.top = (40 + Math.sin(angle) * distance) + 'px';
            
            const colors = ['#4dd0e1', '#00b4d8', '#0077b6', '#87ceeb'];
            ripple.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, #0077b6)`;
            
            splash.appendChild(ripple);
        }
        
        this.fireParticles.appendChild(splash);
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const offsetX = x + (Math.random() - 0.5) * 100;
                const offsetY = y + (Math.random() - 0.5) * 100;
                this.createWaterParticle(offsetX, offsetY);
            }, i * 25);
        }
        
        setTimeout(() => {
            if (splash.parentNode) {
                splash.parentNode.removeChild(splash);
            }
        }, 1000);
    }
    
    createWaterAtPosition(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.createWaterParticle(x, y);
        this.createWaterDrop(x, y);
        
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const offsetX = x + (Math.random() - 0.5) * 20;
                const offsetY = y + (Math.random() - 0.5) * 20;
                this.createWaterParticle(offsetX, offsetY);
            }, i * 150);
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
    
    createWaterParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'water-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const size = 6 + Math.random() * 6;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        const blues = ['#4dd0e1', '#00b4d8', '#0077b6', '#87ceeb', '#1e90ff'];
        const color1 = blues[Math.floor(Math.random() * blues.length)];
        const color2 = blues[Math.floor(Math.random() * blues.length)];
        particle.style.background = `radial-gradient(circle, ${color1}, ${color2})`;
        
        this.fireParticles.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2500);
    }
    
    createWaterDrop(x, y) {
        const drop = document.createElement('div');
        drop.className = 'water-drop';
        drop.style.left = (x - 6) + 'px';
        drop.style.top = (y - 8) + 'px';
        
        const size = 0.8 + Math.random() * 0.4;
        drop.style.transform = `scale(${size})`;
        
        this.fireParticles.appendChild(drop);
        
        setTimeout(() => {
            if (drop.parentNode) {
                drop.parentNode.removeChild(drop);
            }
        }, 2000);
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
    
    playWaterSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 1);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 2);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
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