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
        e.preventDefault(); // Evita seleção/drag que "engole" o mouseup
        mouseDown = true;
        shotBuffer = 8; // Cliques rápidos durante o cooldown ainda disparam quando a arma liberar

        // Handler especial para fase Sniper
        if (gameState === 'PLAYING' && levels[currentLevelIndex] && levels[currentLevelIndex].type === 'sniper') {
            if (typeof handleSniperClick === 'function') {
                handleSniperClick();
            }
        }
    }
});

// mouseup no window: soltar o botão fora do canvas também para o tiro
window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouseDown = false;
});

// Janela perdeu o foco (alt-tab, menu de contexto): nunca deixar o tiro travado
window.addEventListener('blur', () => {
    mouseDown = false;
    shotBuffer = 0;
});
