// ============ PAUSE SYSTEM ============
// Sistema de pausa do jogo

function togglePause() {
    const pauseScreen = document.getElementById('pause-screen');
    
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        if (pauseScreen) {
            pauseScreen.classList.remove('hidden');
            // Atualizar stats na tela de pausa
            const scoreEl = document.getElementById('pause-score');
            const levelEl = document.getElementById('pause-level');
            const highscoreEl = document.getElementById('pause-highscore');
            if (scoreEl) scoreEl.innerText = score.toLocaleString();
            if (levelEl) levelEl.innerText = currentLevelIndex + 1;
            
            // Atualizar recorde - usar bestScore global ou HighScoreManager
            if (highscoreEl) {
                const serverHighScore = (typeof HighScoreManager !== 'undefined' && HighScoreManager.highScore) ? HighScoreManager.highScore : 0;
                const currentHighScore = Math.max(bestScore || 0, serverHighScore, totalScore || 0);
                highscoreEl.innerText = currentHighScore.toLocaleString();
            }
        }
        AudioEngine.pause();
    } else if (gameState === 'PAUSED') {
        resumeGame();
    }
}

function resumeGame() {
    const pauseScreen = document.getElementById('pause-screen');
    gameState = 'PLAYING';
    if (pauseScreen) pauseScreen.classList.add('hidden');
    AudioEngine.resume();
    loop(); // Retomar o game loop
}

function quitToMenu() {
    gameState = 'START';
    
    // Esconder telas de jogo
    const pauseScreen = document.getElementById('pause-screen');
    const gameoverScreen = document.getElementById('gameover-screen');
    const victoryScreen = document.getElementById('victory-screen');
    const upgradeScreen = document.getElementById('upgrade-screen');
    
    if (pauseScreen) pauseScreen.classList.add('hidden');
    if (gameoverScreen) gameoverScreen.classList.add('hidden');
    if (victoryScreen) victoryScreen.classList.add('hidden');
    if (upgradeScreen) upgradeScreen.classList.add('hidden');
    
    // Mostrar menu inicial
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.remove('hidden');
    
    // Parar música
    AudioEngine.stopMusic();
    
    // Limpar entidades do jogo
    enemies = [];
    projectiles = [];
    particles = [];
    
    console.log('🏠 Voltando ao menu principal');
}
