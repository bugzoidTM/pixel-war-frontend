// ============ INPUT HANDLING ============
// Sistema de controle de entrada do jogador
// NOTA: A variável 'keys' é declarada em config.js

window.addEventListener('keydown', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
    
    // Sistema de Pausa com ESC
    if (e.key === 'Escape' && gameState === 'PLAYING') {
        togglePause();
    }
});

window.addEventListener('keyup', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Escalar posição do mouse para a resolução interna do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        mouseDown = true;
        
        // Handler especial para fase Sniper
        if (gameState === 'PLAYING' && levels[currentLevelIndex] && levels[currentLevelIndex].type === 'sniper') {
            if (typeof handleSniperClick === 'function') {
                handleSniperClick();
            }
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouseDown = false;
});
