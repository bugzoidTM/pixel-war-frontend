// ============ AUDIO ENGINE (Web Audio API) ============
const AudioEngine = {
    ctx: null,
    masterGain: null,
    soundEnabled: true,
    musicInterval: null,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            console.log('✅ AudioEngine inicializado com sucesso!');
        } catch (e) {
            console.log('❌ Web Audio API não suportada:', e);
        }
    },
    
    pause() {
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().then(() => {
                console.log('⏸️ AudioContext pausado!');
            }).catch(e => {
                console.log('❌ Erro ao pausar áudio:', e);
            });
        }
    },
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                console.log('🔊 AudioContext ativado pelo usuário!');
            }).catch(e => {
                console.log('❌ Erro ao ativar áudio:', e);
            });
        }
    },
    
    toggle() {
        this.soundEnabled = !this.soundEnabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.soundEnabled ? 0.5 : 0;
        }
        return this.soundEnabled;
    },
    
    createOscillator(type, frequency, duration, gainValue = 0.3) {
        if (!this.ctx || !this.soundEnabled || !this.initialized) return;
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.log('Erro no som:', e);
        }
    },
    
    playShoot(type = 'soldier') {
        if (!this.soundEnabled || !this.initialized) return;
        
        const configs = {
            soldier: { freq: 800, type: 'square', duration: 0.1 },
            tank: { freq: 200, type: 'sawtooth', duration: 0.2 },
            plane: { freq: 1200, type: 'square', duration: 0.05 },
            ship: { freq: 400, type: 'sawtooth', duration: 0.15 }
        };
        
        const cfg = configs[type] || configs.soldier;
        
        if (this.ctx) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = cfg.type;
            osc.frequency.setValueAtTime(cfg.freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(cfg.freq * 0.5, this.ctx.currentTime + cfg.duration);
            
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + cfg.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + cfg.duration);
        }
        
        this.createOscillator('sine', cfg.freq * 2, 0.03, 0.1);
    },
    
    playExplosion(size = 1) {
        if (!this.soundEnabled || !this.initialized) return;
        
        const duration = 0.3 * size;
        
        if (this.ctx) {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            
            const noise = this.ctx.createBufferSource();
            const noiseGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            noise.buffer = buffer;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);
            
            noiseGain.gain.setValueAtTime(0.4 * size, this.ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noise.start();
        }
    },
    
    playDamage() {
        if (!this.soundEnabled || !this.initialized) return;
        this.createOscillator('triangle', 150, 0.1, 0.3);
        this.createOscillator('triangle', 100, 0.1, 0.2);
    },
    
    playPowerup() {
        if (!this.soundEnabled || !this.initialized) return;
        
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('sine', freq, 0.15, 0.2);
            }, i * 80);
        });
    },
    
    playMenuSelect() {
        this.createOscillator('sine', 800, 0.1, 0.15);
    },
    
    playUpgrade() {
        if (!this.soundEnabled || !this.initialized) return;
        
        const notes = [392, 494, 587, 784];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('square', freq, 0.2, 0.15);
            }, i * 100);
        });
    },
    
    playGameOver() {
        if (!this.soundEnabled || !this.initialized) return;
        
        const notes = [392, 349, 330, 262];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('triangle', freq, 0.4, 0.25);
            }, i * 200);
        });
    },
    
    playVictory() {
        if (!this.soundEnabled || !this.initialized) return;
        
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('square', freq, 0.3, 0.2);
            }, i * 150);
        });
    },
    
    playWind() {
        if (!this.soundEnabled || !this.initialized || !this.ctx) return;
        
        // Som de rajada de vento usando ruído filtrado
        const duration = 0.8;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Criar ruído branco com envelope de vento
        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            // Envelope: aumenta rápido, mantém, diminui suave
            let envelope;
            if (progress < 0.1) {
                envelope = progress * 10; // Fade in rápido
            } else if (progress < 0.7) {
                envelope = 1; // Sustain
            } else {
                envelope = (1 - progress) / 0.3; // Fade out
            }
            data[i] = (Math.random() * 2 - 1) * envelope;
        }
        
        const noise = this.ctx.createBufferSource();
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const filter2 = this.ctx.createBiquadFilter();
        
        noise.buffer = buffer;
        
        // Filtro passa-banda para som de vento
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        
        filter2.type = 'highpass';
        filter2.frequency.value = 200;
        
        noiseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        
        noise.connect(filter);
        filter.connect(filter2);
        filter2.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start();
    },
    
    playJump() {
        if (!this.soundEnabled || !this.initialized) return;
        this.createOscillator('sine', 400, 0.1, 0.2);
        this.createOscillator('sine', 600, 0.15, 0.15);
    },
    
    playSniperShot() {
        if (!this.soundEnabled || !this.initialized || !this.ctx) return;
        
        // Som pesado de rifle sniper
        // 1. Boom grave inicial (impacto)
        const duration = 0.4;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Ruído filtrado com decaimento rápido
        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            const decay = Math.pow(1 - progress, 3);
            data[i] = (Math.random() * 2 - 1) * decay;
        }
        
        const noise = this.ctx.createBufferSource();
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);
        
        noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start();
        
        // 2. Crack agudo (supersônico)
        setTimeout(() => {
            this.createOscillator('sawtooth', 2000, 0.05, 0.15);
        }, 10);
        
        // 3. Eco distante
        setTimeout(() => {
            this.createOscillator('sine', 100, 0.3, 0.08);
        }, 150);
    },
    
    playPickup() {
        if (!this.soundEnabled || !this.initialized) return;
        this.createOscillator('sine', 880, 0.1, 0.2);
        this.createOscillator('sine', 1100, 0.1, 0.15);
    },
    
    playMusic() {
        if (!this.soundEnabled || !this.initialized) return;
        
        let beat = 0;
        const bassNotes = [65, 65, 98, 65];
        
        this.musicInterval = setInterval(() => {
            if (!this.soundEnabled) return;
            
            this.createOscillator('sine', bassNotes[beat % 4], 0.2, 0.1);
            
            if (beat % 4 === 0) {
                this.createOscillator('square', 100, 0.05, 0.05);
            }
            
            beat++;
        }, 500);
    },
    
    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
};
