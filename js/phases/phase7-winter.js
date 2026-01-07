// ============ FASE 7 - WINTER STORM ============
// Cenário de tempestade de neve

const WINTER_COLORS = {
    skyDark: '#4a5a6a',
    skyLight: '#8090a0',
    mountain: '#6a7a8a',
    mountainDark: '#4a5a6a',
    snow: '#e8f0f8',
    snowDark: '#c0d0e0',
    ice: '#a0d0e8',
    iceDark: '#70a0c0',
    building: '#5a6a7a',
    buildingDark: '#3a4a5a',
};

function drawWinterBackground() {
    // Calcular intensidade da nevasca (diminui com geradores destruídos)
    const generatorsRemaining = WINTER_CONFIG.generatorCount - winterGeneratorsDestroyed;
    const stormIntensity = generatorsRemaining / WINTER_CONFIG.generatorCount;
    
    // Céu tempestuoso (mais claro conforme geradores são destruídos)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, WINTER_COLORS.skyDark);
    skyGradient.addColorStop(0.4, WINTER_COLORS.skyLight);
    skyGradient.addColorStop(1, WINTER_COLORS.snow);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Montanhas distantes (parallax lento com vento)
    const mountainOffset = (frameCount * 0.3 * winterWindDirection) % 400;
    ctx.fillStyle = WINTER_COLORS.mountainDark;
    for (let x = -400 + mountainOffset; x < canvas.width + 400; x += 200) {
        ctx.beginPath();
        ctx.moveTo(x, 200);
        ctx.lineTo(x + 60, 80);
        ctx.lineTo(x + 100, 120);
        ctx.lineTo(x + 140, 60);
        ctx.lineTo(x + 200, 200);
        ctx.fill();
    }
    
    // Picos com neve
    ctx.fillStyle = '#ffffff';
    for (let x = -400 + mountainOffset; x < canvas.width + 400; x += 200) {
        ctx.beginPath();
        ctx.moveTo(x + 50, 95);
        ctx.lineTo(x + 60, 80);
        ctx.lineTo(x + 70, 95);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 130, 75);
        ctx.lineTo(x + 140, 60);
        ctx.lineTo(x + 150, 75);
        ctx.fill();
    }
    
    // Chão de neve/gelo
    ctx.fillStyle = WINTER_COLORS.snow;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Textura de gelo no chão
    ctx.fillStyle = WINTER_COLORS.ice + '60';
    for (let x = 0; x < canvas.width; x += 80) {
        ctx.fillRect(x + (frameCount % 80), canvas.height - 100, 40, 100);
    }
    
    // Marcas de derrapagem no gelo (onde o player está)
    if (player && Math.abs(player.vx) > 1 || Math.abs(player.vy) > 1) {
        ctx.fillStyle = WINTER_COLORS.iceDark + '40';
        ctx.fillRect(player.x - 5, player.y + player.h - 5, player.w + 10, 10);
    }
    
    // Estruturas árticas (bases militares)
    drawWinterStructures();
    
    // Rastros de fogo (antes das partículas de neve)
    winterFireTrails.forEach(trail => {
        drawFireTrail(ctx, trail);
    });
    
    // Partículas de neve
    winterSnowParticles.forEach(p => {
        drawSnowParticle(ctx, p);
    });
    
    // Overlay de nevasca (intensidade baseada nos geradores)
    drawBlizzardOverlay(stormIntensity);
    
    // Indicador de vento
    drawWindIndicator();
}

function drawWinterStructures() {
    // Estruturas fixas no fundo
    const structures = [
        { x: 50, y: 150, w: 80, h: 60 },
        { x: 300, y: 180, w: 60, h: 40 },
        { x: 600, y: 140, w: 100, h: 70 },
        { x: 800, y: 170, w: 70, h: 50 },
    ];
    
    structures.forEach(s => {
        // Corpo do prédio
        ctx.fillStyle = WINTER_COLORS.building;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        
        // Telhado
        ctx.fillStyle = WINTER_COLORS.buildingDark;
        ctx.beginPath();
        ctx.moveTo(s.x - 5, s.y);
        ctx.lineTo(s.x + s.w / 2, s.y - 20);
        ctx.lineTo(s.x + s.w + 5, s.y);
        ctx.fill();
        
        // Neve no telhado
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(s.x - 3, s.y);
        ctx.lineTo(s.x + s.w / 2, s.y - 18);
        ctx.lineTo(s.x + s.w + 3, s.y);
        ctx.lineTo(s.x + s.w / 2, s.y - 12);
        ctx.fill();
        
        // Janelas
        ctx.fillStyle = '#ffff88';
        for (let wx = s.x + 10; wx < s.x + s.w - 15; wx += 25) {
            ctx.fillRect(wx, s.y + 15, 12, 15);
        }
    });
}

function drawBlizzardOverlay(intensity) {
    // Pulso de visibilidade
    const pulse = Math.sin(frameCount * WINTER_CONFIG.blizzardPulseSpeed) * 0.1;
    const baseIntensity = WINTER_CONFIG.blizzardMinIntensity + 
        (WINTER_CONFIG.blizzardBaseIntensity - WINTER_CONFIG.blizzardMinIntensity) * intensity;
    const alpha = Math.max(0, Math.min(1, baseIntensity + pulse));
    
    // Overlay branco (nevasca)
    ctx.fillStyle = `rgba(220, 230, 240, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Área de visibilidade ao redor do player (mais clara)
    if (player && intensity > 0.2) {
        const visRadius = WINTER_CONFIG.visibilityRadius * (1 + (1 - intensity) * 0.5);
        const pc = player.getCenter();
        
        const gradient = ctx.createRadialGradient(
            pc.x, pc.y, 0,
            pc.x, pc.y, visRadius
        );
        gradient.addColorStop(0, `rgba(220, 230, 240, 0)`);
        gradient.addColorStop(0.7, `rgba(220, 230, 240, 0)`);
        gradient.addColorStop(1, `rgba(220, 230, 240, ${alpha * 0.5})`);
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(pc.x, pc.y, visRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}

// Indicador visual de direção do vento
function drawWindIndicator() {
    const indX = canvas.width - 55;
    const indY = 85;
    const size = 25;
    
    // Fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(indX, indY, size + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Círculo interno
    ctx.fillStyle = '#1a2a3a';
    ctx.beginPath();
    ctx.arc(indX, indY, size - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Seta indicando direção do vento (horizontal: -1 esquerda, 1 direita)
    ctx.save();
    ctx.translate(indX, indY);
    // Converter direção (-1 ou 1) para ângulo (apontando para onde o vento sopra)
    const angle = winterWindDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
    ctx.rotate(angle);
    
    // Seta do vento (azul claro)
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.moveTo(0, -size + 6);
    ctx.lineTo(-6, 4);
    ctx.lineTo(0, 0);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Label
    ctx.fillStyle = '#88ccff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VENTO', indX, indY + size + 14);
}