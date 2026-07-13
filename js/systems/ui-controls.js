// ============ SOUND & UI CONTROLS ============

// ============ DAMAGE FEEDBACK SYSTEM ============
let damageOverlayElement = null;
let lastDamageTime = 0;

function triggerDamagePulse(intensity = 1) {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // Remove class to restart animation
    gameContainer.classList.remove('damage-pulse');
    void gameContainer.offsetWidth; // Force reflow
    gameContainer.classList.add('damage-pulse');
    
    // Damage overlay for stronger hits
    if (intensity >= 0.5) {
        if (!damageOverlayElement) {
            damageOverlayElement = document.getElementById('damage-overlay');
        }
        if (damageOverlayElement) {
            damageOverlayElement.classList.remove('active');
            void damageOverlayElement.offsetWidth;
            damageOverlayElement.classList.add('active');
        }
    }
    
    lastDamageTime = Date.now();
}

// ============ UI SHAKE SYSTEM ============
function triggerUIShake(strong = false) {
    const hudPanel = document.querySelector('.hud-panel');
    if (!hudPanel) return;
    
    const shakeClass = strong ? 'ui-shake-strong' : 'ui-shake';
    
    // Remove existing shake classes
    hudPanel.classList.remove('ui-shake', 'ui-shake-strong');
    void hudPanel.offsetWidth; // Force reflow
    hudPanel.classList.add(shakeClass);
    
    // Remove class after animation ends
    setTimeout(() => {
        hudPanel.classList.remove(shakeClass);
    }, strong ? 250 : 150);
}

// ============ ARCADE LEVEL TRANSITIONS ============
const TRANSITION_TYPES = ['wipe', 'diamond', 'scanline'];
let currentTransitionType = 0;

function createTransitionOverlay() {
    let overlay = document.getElementById('level-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'level-transition-overlay';
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(overlay);
        }
    }
    return overlay;
}

function playArcadeTransition(levelName, callback, transitionType = null) {
    const overlay = createTransitionOverlay();
    if (!overlay) {
        if (callback) callback();
        return;
    }
    
    // Clear previous transition content
    overlay.innerHTML = '';
    overlay.className = '';
    
    // Choose transition type (cycle through or use specified)
    const type = transitionType || TRANSITION_TYPES[currentTransitionType % TRANSITION_TYPES.length];
    currentTransitionType++;
    
    switch(type) {
        case 'wipe':
            playWipeTransition(overlay, levelName, callback);
            break;
        case 'diamond':
            playDiamondTransition(overlay, levelName, callback);
            break;
        case 'scanline':
            playScanlineTransition(overlay, levelName, callback);
            break;
        default:
            playWipeTransition(overlay, levelName, callback);
    }
}

function playWipeTransition(overlay, levelName, callback) {
    // Create wipe bars
    for (let i = 0; i < 4; i++) {
        const bar = document.createElement('div');
        bar.className = 'wipe-bar';
        bar.style.width = '100%';
        overlay.appendChild(bar);
    }
    
    // Add level name
    const nameEl = document.createElement('div');
    nameEl.className = 'transition-level-name';
    nameEl.textContent = levelName || 'PRÓXIMA FASE';
    overlay.appendChild(nameEl);
    
    // Start wipe-in animation
    overlay.classList.add('wipe-in', 'active');
    
    // After wipe-in, hold, then wipe-out
    setTimeout(() => {
        overlay.classList.remove('wipe-in');
        overlay.classList.add('wipe-out');
        
        setTimeout(() => {
            overlay.className = '';
            overlay.innerHTML = '';
            if (callback) callback();
        }, 700);
    }, 1200);
}

function playDiamondTransition(overlay, levelName, callback) {
    // Create diamond cells (8x6 grid)
    const cols = 8;
    const rows = 6;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'diamond-cell';
            cell.style.left = (col * 12.5) + '%';
            cell.style.top = (row * 16.66) + '%';
            // Stagger delay based on distance from center
            const centerDist = Math.abs(col - cols/2) + Math.abs(row - rows/2);
            cell.style.animationDelay = (centerDist * 0.03) + 's';
            overlay.appendChild(cell);
        }
    }
    
    // Add level name
    const nameEl = document.createElement('div');
    nameEl.className = 'transition-level-name';
    nameEl.textContent = levelName || t('notifications.nextPhase');
    overlay.appendChild(nameEl);
    
    // Start diamond-in animation
    overlay.classList.add('diamond-wipe-in', 'active');
    
    setTimeout(() => {
        overlay.classList.remove('diamond-wipe-in');
        overlay.classList.add('diamond-wipe-out');
        
        setTimeout(() => {
            overlay.className = '';
            overlay.innerHTML = '';
            if (callback) callback();
        }, 600);
    }, 1200);
}

function playScanlineTransition(overlay, levelName, callback) {
    // Create scanline
    const scanline = document.createElement('div');
    scanline.className = 'scanline-bar';
    overlay.appendChild(scanline);
    
    // Add level name
    const nameEl = document.createElement('div');
    nameEl.className = 'transition-level-name';
    nameEl.textContent = levelName || t('notifications.nextPhase');
    overlay.appendChild(nameEl);
    
    // Start scanline animation
    overlay.classList.add('scanline-wipe', 'active');
    
    setTimeout(() => {
        // Reverse the animation (clear from top)
        overlay.style.transform = 'scaleY(-1)';
        overlay.classList.remove('scanline-wipe');
        void overlay.offsetWidth;
        overlay.classList.add('scanline-wipe');
        
        setTimeout(() => {
            overlay.className = '';
            overlay.innerHTML = '';
            overlay.style.transform = '';
            if (callback) callback();
        }, 900);
    }, 1200);
}

// ============ DAMAGE OVERLAY INITIALIZATION ============
function initDamageOverlay() {
    if (!document.getElementById('damage-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'damage-overlay';
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(overlay);
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDamageOverlay);
} else {
    initDamageOverlay();
}

function selectClass(cls, event) {
    selectedClass = cls;
    AudioEngine.playMenuSelect();
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function toggleSound() {
    const enabled = AudioEngine.toggle();
    const toggleBtn = document.getElementById('sound-toggle');
    toggleBtn.textContent = enabled ? '🔊' : '🔇';
    toggleBtn.classList.toggle('muted', !enabled);
}

function updateVolume(value) {
    const volume = value / 100;
    CONFIG.masterVolume = volume;
    if (AudioEngine.masterGain) {
        AudioEngine.masterGain.gain.value = volume;
    }
}

function updateUI() {
    document.getElementById('hp-text').innerText = Math.max(0, Math.ceil(player.hp)) + '/' + player.maxHp;
    const ammoText = document.getElementById('ammo-text');
    if (player.reloading) {
        ammoText.innerText = I18n.t('hud.reloading');
        // Pisca para chamar atenção enquanto não dá para atirar
        ammoText.style.opacity = Math.floor(frameCount / 20) % 2 === 0 ? '1' : '0.4';
    } else {
        ammoText.innerText = player.ammo + '/' + player.maxAmmo;
        ammoText.style.opacity = '1';
    }
    document.getElementById('hp-fill').style.width = (Math.max(0, player.hp) / player.maxHp * 100) + '%';
    document.getElementById('ammo-fill').style.width = (player.ammo / player.maxAmmo * 100) + '%';
    document.getElementById('score-display').innerText = score.toLocaleString();
}
