// ============ ENEMY SPRITE SYSTEM ============
// Templates e funções específicas para inimigos

// ============ ENEMY TOWER ============
// Torre de vigia: cabine blindada com janelas iluminadas sobre pernas de
// concreto com contraventamento, antena com luz piscando e canhão que mira o jogador
const TOWER_PALETTES = {
    normal: {
        0: null, 1: '#0a0a0a',
        2: '#8a8a92', 3: '#5e5e66', 4: '#aeaeb6',   // concreto
        5: '#8e2f2f', 6: '#5c1717', 7: '#b24a44',   // blindagem vermelha
        8: '#ffd23c', 9: '#241a20',                 // janela (brilho / fundo)
        10: '#4c4c56'                               // metal
    },
    flash: {
        0: null, 1: '#f44', 2: '#f44', 3: '#f44', 4: '#f44',
        5: '#f44', 6: '#f44', 7: '#f44', 8: '#f44', 9: '#f44', 10: '#f44'
    }
};

// 20x26 pixels lógicos
const TOWER_TEMPLATE = [
    [0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,7,7,5,5,5,5,5,5,5,5,5,5,5,5,1,0,0],
    [0,0,1,7,5,5,5,5,5,5,5,5,5,5,5,5,6,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,7,5,5,5,5,5,5,5,5,7,1,0,0,0,0],
    [0,0,0,0,1,5,9,9,9,5,5,9,9,9,5,1,0,0,0,0],
    [0,0,0,0,1,5,9,8,9,5,5,9,8,9,5,1,0,0,0,0],
    [0,0,0,0,1,5,9,9,9,5,5,9,9,9,5,1,0,0,0,0],
    [0,0,0,0,1,6,5,5,5,5,5,5,5,5,6,1,0,0,0,0],
    [0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0,0,1,2,2,1,0,0,0],
    [0,0,0,1,2,3,1,10,0,0,0,0,10,1,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,0,10,0,0,10,0,1,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,0,0,10,10,0,0,1,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,0,10,0,0,10,0,1,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,10,0,0,0,0,10,1,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,0,0,0,0,0,0,1,3,2,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
];

function drawEnemyTower(ctx, x, y, w, h, flash = false) {
    const palette = flash ? TOWER_PALETTES.flash : TOWER_PALETTES.normal;
    const templateWidth = 20 * PIXEL_SCALE;
    const templateHeight = 26 * PIXEL_SCALE;
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Sombra no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, drawY + templateHeight, templateWidth / 2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    renderSpriteTemplate(ctx, TOWER_TEMPLATE, palette, drawX, drawY, PIXEL_SCALE);

    // Canhão sob a cabine mirando o jogador
    if (!flash && typeof player !== 'undefined' && player) {
        const angle = Math.atan2(player.y + player.h / 2 - cy, player.x + player.w / 2 - cx);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = '#2e2e36';
        ctx.fillRect(0, -2 * PIXEL_SCALE, 9 * PIXEL_SCALE, 4 * PIXEL_SCALE);
        ctx.fillStyle = '#111';
        ctx.fillRect(7 * PIXEL_SCALE, -1 * PIXEL_SCALE, 2 * PIXEL_SCALE, 2 * PIXEL_SCALE);
        ctx.restore();
        ctx.fillStyle = '#4c4c56';
        ctx.beginPath();
        ctx.arc(cx, cy, 3 * PIXEL_SCALE, 0, Math.PI * 2);
        ctx.fill();
    }

    // Luz de alerta piscando no topo da antena
    const lightOn = frameCount % 30 < 15;
    const lightX = cx;
    const lightY = drawY - 2;
    if (lightOn) {
        ctx.fillStyle = 'rgba(255, 40, 40, 0.25)';
        ctx.beginPath();
        ctx.arc(lightX, lightY, 6 * PIXEL_SCALE, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff2828';
        ctx.beginPath();
        ctx.arc(lightX, lightY, 2 * PIXEL_SCALE, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#551111';
        ctx.beginPath();
        ctx.arc(lightX, lightY, 1.5 * PIXEL_SCALE, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============ ENEMY BOSS ============
function drawEnemyBoss(ctx, x, y, w, h, direction, hp, maxHp, flash = false) {
    const px = Math.floor(x / PIXEL_SCALE);
    const py = Math.floor(y / PIXEL_SCALE);
    const pw = Math.floor(w / PIXEL_SCALE);
    const ph = Math.floor(h / PIXEL_SCALE);
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    const damageRatio = 1 - (hp / maxHp);
    
    if (flash) {
        drawPixelFill(ctx, px, py, pw, ph, '#ff4444');
        return;
    }
    
    drawPixelShadow(ctx, cx + 3, py + ph + 2, pw - 4, 5);
    
    // Esteiras
    const trackFrame = Math.floor(frameCount / 4) % 4;
    
    drawShadedRect(ctx, px + 2, py + 3, 7, ph - 6, PALETTES.darkMetal);
    for (let i = 0; i < 6; i++) {
        const toothY = py + 4 + i * 5 + (trackFrame % 2);
        drawPixelFill(ctx, px + 4, toothY, 3, 3, PALETTES.metal.base);
    }
    
    drawShadedRect(ctx, px + pw - 9, py + 3, 7, ph - 6, PALETTES.darkMetal);
    for (let i = 0; i < 6; i++) {
        const toothY = py + 4 + i * 5 + (trackFrame % 2);
        drawPixelFill(ctx, px + pw - 7, toothY, 3, 3, PALETTES.metal.base);
    }
    
    // Corpo blindado
    drawShadedRect(ctx, px + 8, py + 4, pw - 16, ph - 8, PALETTES.enemyRed);
    
    // Detalhes
    drawPixelFill(ctx, px + 10, py + 5, pw - 20, 3, PALETTES.enemyRed.light);
    drawPixelFill(ctx, px + 10, py + ph - 8, pw - 20, 3, PALETTES.enemyRed.dark);
    
    // Rebites
    for (let i = 0; i < 4; i++) {
        drawPixelFill(ctx, px + 12 + i * 8, py + 6, 2, 2, PALETTES.metal.light);
        drawPixelFill(ctx, px + 12 + i * 8, py + ph - 8, 2, 2, PALETTES.metal.light);
    }
    
    // Torre
    drawShadedRect(ctx, cx - 10, cy - 8, 20, 16, PALETTES.enemyRed);
    drawPixelCircle(ctx, cx, cy, 4, PALETTES.enemyRed.dark);
    
    // Canhões
    drawShadedRect(ctx, cx - 2, py - 4, 4, 10, PALETTES.metal);
    drawPixelFill(ctx, cx - 3, py - 5, 6, 2, PALETTES.metal.dark);
    drawShadedRect(ctx, cx - 8, py - 2, 3, 8, PALETTES.metal);
    drawShadedRect(ctx, cx + 5, py - 2, 3, 8, PALETTES.metal);
    
    // Insígnia (caveira)
    drawPixelFill(ctx, cx - 3, cy - 3, 6, 5, '#ffffff');
    drawPixelFill(ctx, cx - 2, cy - 2, 2, 2, '#000000');
    drawPixelFill(ctx, cx + 1, cy - 2, 2, 2, '#000000');
    drawPixelFill(ctx, cx - 1, cy + 1, 2, 2, '#000000');
    
    // Dano visual
    if (damageRatio > 0.3) {
        drawPixelFill(ctx, cx - 8, cy - 5, 1, 6, '#1a1a1a');
        drawPixelFill(ctx, cx - 7, cy - 3, 1, 4, '#1a1a1a');
    }
    if (damageRatio > 0.6) {
        drawPixelFill(ctx, cx + 6, cy - 4, 1, 5, '#1a1a1a');
        drawPixelFill(ctx, cx + 7, cy - 2, 1, 3, '#1a1a1a');
        if (frameCount % 10 < 5) {
            drawPixelFill(ctx, cx + 5, py + 2, 3, 3, '#ff6600');
        }
    }
    
    // Luz de alerta
    if (frameCount % 20 < 10) {
        drawPixelFill(ctx, cx - 2, cy + 10, 4, 3, '#ff0000');
    }
}

// ============ ENEMY SOLDIER ============
function drawEnemySoldier(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? SOLDIER_PALETTES.enemyFlash : SOLDIER_PALETTES.enemy;
    const template = getSoldierTemplate(direction, true);
    
    const templateWidth = 16 * PIXEL_SCALE;
    const templateHeight = 20 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    const shadowY = y + h - 4;
    const shadowW = 12 * PIXEL_SCALE;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + (w - shadowW) / 2, shadowY, shadowW, 4);
    
    renderSpriteTemplate(ctx, template, palette, drawX, drawY, PIXEL_SCALE);
}

// ============ WINTER ENEMIES ============
const SNOW_SOLDIER_PALETTE = {
    0: null, 1: '#3a4450',
    2: '#8a94a2', 3: '#6a7482', 4: '#a8b2c0',
    5: '#dde4ec', 6: '#aab6c4', 7: '#f4f8fc',
    8: '#7a828e', 9: '#565e6a', 10: '#9aa2ae',
    11: '#454d58', 12: '#ff8c1a', 13: '#c8d2dc'
};

const SNOW_SOLDIER_FLASH = {
    0: null, 1: '#f44', 2: '#f44', 3: '#f44', 4: '#f44',
    5: '#f44', 6: '#f44', 7: '#f44', 8: '#f44',
    9: '#f44', 10: '#f44', 11: '#f44', 12: '#f44', 13: '#f44'
};

function drawSnowSoldier(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? SNOW_SOLDIER_FLASH : SNOW_SOLDIER_PALETTE;
    const template = getSoldierTemplate(direction, true);

    const templateWidth = 16 * PIXEL_SCALE;
    const templateHeight = 20 * PIXEL_SCALE;
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;

    const shadowW = 12 * PIXEL_SCALE;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + (w - shadowW) / 2, y + h - 4, shadowW, 4);

    renderSpriteTemplate(ctx, template, palette, drawX, drawY, PIXEL_SCALE);
    
    if (Math.random() > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(
            x + Math.random() * w - 2,
            y + Math.random() * h - 2,
            2 * PIXEL_SCALE,
            2 * PIXEL_SCALE
        );
    }
}

// ============ GENERATOR ============
function drawGenerator(ctx, x, y, w, h, hp, maxHp, flash = false) {
    const px = PIXEL_SCALE;
    const damagePercent = 1 - (hp / maxHp);
    
    const baseColor = flash ? '#ff6666' : (damagePercent > 0.7 ? '#6a4040' : '#5a6a7a');
    const metalColor = flash ? '#ff4444' : '#4a5a6a';
    const lightColor = flash ? '#ff8888' : '#8a9aaa';
    
    // Base
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, y + h - 8 * px, w, 8 * px);
    
    // Corpo
    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 4 * px, y + 10 * px, w - 8 * px, h - 18 * px);
    
    // Painéis laterais
    ctx.fillStyle = metalColor;
    ctx.fillRect(x, y + 12 * px, 6 * px, h - 22 * px);
    ctx.fillRect(x + w - 6 * px, y + 12 * px, 6 * px, h - 22 * px);
    
    // Topo
    ctx.fillStyle = lightColor;
    ctx.fillRect(x + 6 * px, y, w - 12 * px, 12 * px);
    
    // Grades
    ctx.fillStyle = '#2a2a2a';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 10 * px + i * 8 * px, y + 2 * px, 4 * px, 8 * px);
    }
    
    // Luz de status
    const lightOn = damagePercent > 0.5 ? (Math.floor(frameCount / 10) % 2 === 0) : true;
    if (lightOn) {
        ctx.fillStyle = damagePercent > 0.7 ? '#ff0000' : (damagePercent > 0.3 ? '#ffaa00' : '#00ff00');
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, 4 * px, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = damagePercent > 0.7 ? 'rgba(255,0,0,0.3)' : 
                       (damagePercent > 0.3 ? 'rgba(255,170,0,0.3)' : 'rgba(0,255,0,0.3)');
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, 8 * px, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Raios
    if (damagePercent > 0.3 && Math.random() > 0.7) {
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = px;
        ctx.beginPath();
        const sparkX = x + Math.random() * w;
        const sparkY = y + Math.random() * h;
        ctx.moveTo(sparkX, sparkY);
        ctx.lineTo(sparkX + (Math.random() - 0.5) * 20 * px, sparkY + (Math.random() - 0.5) * 20 * px);
        ctx.stroke();
    }
    
    // Fumaça
    if (damagePercent > 0.6) {
        ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        const smokeOffset = Math.sin(frameCount * 0.1) * 5;
        ctx.beginPath();
        ctx.arc(x + w / 2 + smokeOffset, y - 10 * px, 8 * px, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Contorno
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = px;
    ctx.strokeRect(x, y, w, h);
    
    // Barra de HP
    const barWidth = w - 4 * px;
    const barHeight = 4 * px;
    const barX = x + 2 * px;
    const barY = y - 8 * px;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = damagePercent > 0.7 ? '#ff3333' : (damagePercent > 0.3 ? '#ffaa00' : '#33ff33');
    ctx.fillRect(barX, barY, barWidth * (hp / maxHp), barHeight);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

// ============ FIRE TRAIL ============
function drawFireTrail(ctx, trail) {
    const px = PIXEL_SCALE;
    const alpha = Math.min(1, trail.timer / 60);
    
    ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.8})`;
    ctx.fillRect(trail.x, trail.y, trail.w, trail.h);
    
    const flameCount = 3;
    for (let i = 0; i < flameCount; i++) {
        const flameX = trail.x + (trail.w / flameCount) * i + trail.w / flameCount / 2;
        const flameHeight = (8 + Math.sin(frameCount * 0.2 + i) * 4) * px * alpha;
        
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.moveTo(flameX - 4 * px, trail.y);
        ctx.lineTo(flameX, trail.y - flameHeight);
        ctx.lineTo(flameX + 4 * px, trail.y);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 220, 50, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(flameX - 2 * px, trail.y);
        ctx.lineTo(flameX, trail.y - flameHeight * 0.6);
        ctx.lineTo(flameX + 2 * px, trail.y);
        ctx.fill();
    }
    
    if (Math.random() > 0.6 && alpha > 0.3) {
        ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
        ctx.fillRect(
            trail.x + Math.random() * trail.w,
            trail.y - Math.random() * 15 * px,
            2 * px,
            2 * px
        );
    }
}

// ============ SNOW PARTICLE ============
function drawSnowParticle(ctx, particle) {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
}
