// ============ FASE 9 - SHMUP (1942/River Raid Style) ============
// Vertical shooter com waves de inimigos

function initShmupLevel() {
    const cfg = SHMUP_CONFIG;
    
    // Resetar estado do shmup
    shmupScrollY = 0;
    shmupWaveNumber = 1;
    shmupWaveTimer = 0;
    
    // Criar estrelas para parallax
    shmupStars = [];
    for (let layer = 0; layer < cfg.starLayers; layer++) {
        for (let i = 0; i < cfg.starsPerLayer; i++) {
            shmupStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                layer: layer,
                size: 1 + layer * 0.5,
                brightness: 0.3 + layer * 0.25
            });
        }
    }
    
    // Criar terreno (ilhas/bases inimigas) que scrollam
    shmupTerrain = [];
    for (let i = 0; i < 5; i++) {
        shmupTerrain.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: -200 - i * 400,
            w: 60 + Math.random() * 80,
            h: 40 + Math.random() * 60,
            type: Math.random() > 0.5 ? 'island' : 'base'
        });
    }
    
    // Posicionar jogador na parte inferior
    if (player) {
        player.x = canvas.width / 2 - player.w / 2;
        player.y = cfg.playerY;
    }
}

function updateShmupLevel() {
    const cfg = SHMUP_CONFIG;
    
    // Atualizar scroll
    shmupScrollY += cfg.scrollSpeed;
    
    // Atualizar estrelas (parallax)
    shmupStars.forEach(star => {
        star.y += cfg.scrollSpeed * (0.3 + star.layer * 0.4);
        if (star.y > canvas.height) {
            star.y = -5;
            star.x = Math.random() * canvas.width;
        }
    });
    
    // Atualizar terreno
    shmupTerrain.forEach(terrain => {
        terrain.y += cfg.scrollSpeed;
        if (terrain.y > canvas.height + 100) {
            terrain.y = -200;
            terrain.x = Math.random() * (canvas.width - 100) + 50;
            terrain.w = 60 + Math.random() * 80;
            terrain.h = 40 + Math.random() * 60;
            terrain.type = Math.random() > 0.5 ? 'island' : 'base';
        }
    });
    
    // Sistema de waves
    shmupWaveTimer++;
    if (shmupWaveTimer >= cfg.waveInterval) {
        shmupWaveTimer = 0;
        spawnShmupWave();
        shmupWaveNumber++;
    }
}

function spawnShmupWave() {
    const cfg = SHMUP_CONFIG;
    const lvl = levels[currentLevelIndex];
    const numEnemies = cfg.enemiesPerWave + (shmupWaveNumber - 1) * cfg.waveIncrement;
    
    console.log('🚀 Spawning Shmup Wave', shmupWaveNumber, 'com', numEnemies, 'inimigos');
    
    for (let i = 0; i < numEnemies; i++) {
        // Escolher tipo de inimigo
        const enemyTypes = ['plane', 'chopper', 'turret'];
        const typeIndex = Math.floor(Math.random() * enemyTypes.length);
        let type = enemyTypes[typeIndex];
        
        // Turrets mais frequentes em waves maiores
        if (shmupWaveNumber > 2 && Math.random() < 0.4) {
            type = 'turret';
        }
        
        // Spawn no topo, distribuído horizontalmente
        const margin = 50;
        const spacing = (canvas.width - margin * 2) / numEnemies;
        const x = margin + i * spacing + Math.random() * 30 - 15;
        const y = -50 - Math.random() * 100;
        
        const enemy = new Enemy(type, x, y);
        enemy.direction = 2; // Sempre para baixo
        enemies.push(enemy);
    }
    
    // Mostrar texto da wave
    floatingTexts.push(new FloatingText(
        canvas.width / 2, 150,
        '⚔️ WAVE ' + shmupWaveNumber + ' ⚔️',
        '#ffff00'
    ));
}

function drawShmupBackground() {
    const cfg = SHMUP_CONFIG;
    const px = PIXEL_SCALE;
    
    // Fundo espacial gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000015');
    gradient.addColorStop(0.5, '#000025');
    gradient.addColorStop(1, '#000035');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar estrelas (parallax)
    if (shmupStars) {
        shmupStars.forEach(star => {
            const twinkle = Math.sin(frameCount * 0.1 + star.x) * 0.2 + 0.8;
            ctx.globalAlpha = star.brightness * twinkle;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    // Desenhar terreno (ilhas/bases)
    if (shmupTerrain) {
        shmupTerrain.forEach(terrain => {
            if (terrain.type === 'island') {
                drawShmupIsland(terrain);
            } else {
                drawShmupBase(terrain);
            }
        });
    }
    
    // Grade de scanner (efeito visual)
    ctx.strokeStyle = 'rgba(0, 100, 200, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const offsetY = shmupScrollY % gridSize;
    for (let y = -gridSize + offsetY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Indicador de wave
    drawShmupWaveIndicator();
}

function drawShmupIsland(terrain) {
    const px = PIXEL_SCALE;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(terrain.x + terrain.w/2 + 5, terrain.y + terrain.h/2 + 5, terrain.w/2, terrain.h/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Água ao redor (reflexo)
    ctx.fillStyle = '#003366';
    ctx.beginPath();
    ctx.ellipse(terrain.x + terrain.w/2, terrain.y + terrain.h/2 + 3, terrain.w/2 + 5, terrain.h/2 + 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ilha principal
    ctx.fillStyle = '#2d5a1d';
    ctx.beginPath();
    ctx.ellipse(terrain.x + terrain.w/2, terrain.y + terrain.h/2, terrain.w/2, terrain.h/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#4a8a3a';
    ctx.beginPath();
    ctx.ellipse(terrain.x + terrain.w/2 - 5, terrain.y + terrain.h/2 - 5, terrain.w/3, terrain.h/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Árvores/vegetação pequena
    ctx.fillStyle = '#1a3a0a';
    for (let i = 0; i < 3; i++) {
        const tx = terrain.x + terrain.w/4 + i * terrain.w/4;
        const ty = terrain.y + terrain.h/2;
        ctx.beginPath();
        ctx.arc(tx, ty, 4 * px, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawShmupBase(terrain) {
    const px = PIXEL_SCALE;
    
    // Plataforma metálica
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(terrain.x, terrain.y, terrain.w, terrain.h);
    
    // Bordas
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(terrain.x, terrain.y + terrain.h - 4*px, terrain.w, 4*px);
    ctx.fillRect(terrain.x + terrain.w - 4*px, terrain.y, 4*px, terrain.h);
    
    // Highlight
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(terrain.x, terrain.y, terrain.w, 4*px);
    ctx.fillRect(terrain.x, terrain.y, 4*px, terrain.h);
    
    // Detalhes (antenas, etc)
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(terrain.x + terrain.w/2 - 2*px, terrain.y - 8*px, 4*px, 8*px);
    
    // Luzes de aviso
    const blink = Math.floor(frameCount / 20) % 2 === 0;
    ctx.fillStyle = blink ? '#ff3333' : '#660000';
    ctx.beginPath();
    ctx.arc(terrain.x + terrain.w/4, terrain.y + terrain.h/2, 3*px, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(terrain.x + terrain.w*3/4, terrain.y + terrain.h/2, 3*px, 0, Math.PI * 2);
    ctx.fill();
}

function drawShmupWaveIndicator() {
    const cfg = SHMUP_CONFIG;
    
    // Barra de progresso da wave
    const barWidth = 150;
    const barHeight = 8;
    const barX = canvas.width - barWidth - 20;
    const barY = 60;
    
    // Fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Progresso
    const progress = shmupWaveTimer / cfg.waveInterval;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`WAVE ${shmupWaveNumber}`, barX + barWidth, barY - 5);
    ctx.textAlign = 'left';
}
