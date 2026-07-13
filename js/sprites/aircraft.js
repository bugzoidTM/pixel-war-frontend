// ============ AIRCRAFT SPRITE SYSTEM ============
// Templates e funções para aeronaves (aviões e helicópteros)

// ============ PLANE TEMPLATES ============
const PLANE_PALETTES = {
    ally: {
        0: null, 1: '#0a0a0a',
        2: '#5c7a40', 3: '#374f24', 4: '#82a060',
        5: '#3a6a9a', 6: '#3a3a3a', 7: '#7a7a7a',
        8: '#aa6020', 9: '#8a4010', 10: '#ca8040'
    },
    enemy: {
        0: null, 1: '#0a0a0a',
        2: '#70707e', 3: '#494956', 4: '#9e9eae',
        5: '#c03030', 6: '#2a2a2a', 7: '#6a6a6a',
        8: '#aa2020', 9: '#8a1010', 10: '#ca4040'
    },
    flash: {
        0: null, 1: '#fff', 2: '#fff', 3: '#fff', 4: '#fff',
        5: '#fff', 6: '#fff', 7: '#fff', 8: '#fff', 9: '#fff', 10: '#fff'
    },
    enemyFlash: {
        0: null, 1: '#f44', 2: '#f44', 3: '#f44', 4: '#f44',
        5: '#f44', 6: '#f44', 7: '#f44', 8: '#f44', 9: '#f44', 10: '#f44'
    }
};

// Template do corpo do avião (16x18 pixels)
const PLANE_BODY_TEMPLATE = [
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,4,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,2,2,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,4,2,2,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,2,2,2,2,4,1,0,0,0,0],
    [1,1,1,1,1,4,2,2,2,2,4,1,1,1,1,1],
    [1,4,4,4,4,4,2,2,2,2,4,4,4,4,4,1],
    [1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1],
    [1,3,2,2,2,2,2,5,5,2,2,2,2,2,3,1],
    [0,1,3,3,2,2,2,5,5,2,2,2,3,3,1,0],
    [0,0,1,1,3,2,2,2,2,2,2,3,1,1,0,0],
    [0,0,0,0,1,3,2,2,2,2,3,1,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,2,2,2,2,3,1,0,0,0,0],
    [0,0,0,1,3,2,2,2,2,2,2,3,1,0,0,0],
    [0,0,1,3,1,0,1,1,1,1,0,1,3,1,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
];

// Hélice do avião (frames animados)
const PLANE_PROPELLER = {
    frame0: [
        [0,0,1,1,1,1,0,0],
        [0,0,0,5,5,0,0,0],
        [0,0,0,5,5,0,0,0],
        [0,0,1,1,1,1,0,0],
    ],
    frame1: [
        [0,0,0,1,1,0,0,0],
        [0,0,1,5,5,1,0,0],
        [0,0,1,5,5,1,0,0],
        [0,0,0,1,1,0,0,0],
    ],
    frame2: [
        [0,0,0,0,0,0,0,0],
        [1,1,1,5,5,1,1,1],
        [1,1,1,5,5,1,1,1],
        [0,0,0,0,0,0,0,0],
    ]
};

function drawPlaneFromTemplate(ctx, x, y, w, h, direction, palette) {
    const templateWidth = 16 * PIXEL_SCALE;
    const templateHeight = 18 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w/2 + 20, y + h + 30, w/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotação baseada na direção
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    
    const rotations = [0, Math.PI/2, Math.PI, -Math.PI/2];
    ctx.rotate(rotations[direction] || 0);
    
    ctx.translate(-templateWidth/2, -templateHeight/2);
    
    // Corpo do avião
    renderSpriteTemplate(ctx, PLANE_BODY_TEMPLATE, palette, 0, 0, PIXEL_SCALE);
    
    // Hélice animada
    const propFrame = Math.floor(frameCount / 2) % 3;
    const propTemplate = PLANE_PROPELLER[`frame${propFrame}`];
    renderSpriteTemplate(ctx, propTemplate, palette, 4 * PIXEL_SCALE, -4 * PIXEL_SCALE, PIXEL_SCALE);
    
    ctx.restore();
}

function drawPlaneSprite(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? PLANE_PALETTES.flash : PLANE_PALETTES.ally;
    drawPlaneFromTemplate(ctx, x, y, w, h, direction, palette);
}

function drawEnemyPlane(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? PLANE_PALETTES.enemyFlash : PLANE_PALETTES.enemy;
    drawPlaneFromTemplate(ctx, x, y, w, h, direction, palette);
}

// ============ CHOPPER TEMPLATES ============
const CHOPPER_PALETTES = {
    ally: {
        0: null, 1: '#0a0a0a',
        2: '#5c7a40', 3: '#374f24', 4: '#82a060',
        5: '#4e5a48', 6: '#2f3a2c', 7: '#78886c',
        8: '#7ac6e8', 9: '#3a7a9c'
    },
    enemy: {
        0: null, 1: '#0a0a0a',
        2: '#7e3830', 3: '#521f1a', 4: '#a4564a',
        5: '#4c4c56', 6: '#2e2e36', 7: '#767684',
        8: '#7ac6e8', 9: '#3a7a9c'
    },
    flash: {
        0: null, 1: '#fff', 2: '#fff', 3: '#fff', 4: '#fff',
        5: '#fff', 6: '#fff', 7: '#fff', 8: '#fff', 9: '#fff'
    },
    enemyFlash: {
        0: null, 1: '#f44', 2: '#f44', 3: '#f44', 4: '#f44',
        5: '#f44', 6: '#f44', 7: '#f44', 8: '#f44', 9: '#f44'
    }
};

// Template do corpo do helicóptero (24x14) — nariz à ESQUERDA:
// cockpit de vidro (8/9), turbina no dorso, boom de cauda com deriva,
// pod de metralhadora sob o nariz e esquis de pouso
const CHOPPER_BODY_TEMPLATE = [
    [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,5,5,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,4,4,6,6,1,0,0,0,0,1,7,1,0],
    [0,0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1,7,1,0],
    [0,1,8,8,8,9,2,2,2,5,5,5,2,2,2,2,2,1,1,1,1,1,1,0],
    [1,4,8,8,9,9,2,2,2,2,2,2,2,2,2,2,1,5,5,5,5,5,1,0],
    [1,2,2,3,3,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,6,6,6,1,5,5,5,5,6,1,0,0,1,5,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,1,5,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,5,1,0,0,0,0,0,1,5,1,0,0,0,0,0,0,0,0],
    [0,0,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,0,0,0,0,0,0],
];

// Rotor principal (frames animados)
const CHOPPER_MAIN_ROTOR = {
    frame0: [
        [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
    ],
    frame1: [
        [0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0],
        [0,0,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,0,0],
        [0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0],
    ],
    frame2: [
        [0,0,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0],
        [0,0,0,1,1,1,1,1,5,5,5,5,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,5,5,5,5,1,1,1,1,1,0,0,0],
        [0,0,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0],
    ]
};

// Rotor de cauda
const CHOPPER_TAIL_ROTOR = {
    frame0: [[1,5,5,1], [5,6,6,5], [5,6,6,5], [1,5,5,1]],
    frame1: [[5,1,1,5], [1,6,6,1], [1,6,6,1], [5,1,1,5]],
};

function drawChopperFromTemplate(ctx, x, y, w, h, direction, palette) {
    const templateWidth = 24 * PIXEL_SCALE;
    const templateHeight = 14 * PIXEL_SCALE;

    const bob = Math.sin(frameCount * 0.12) * 1.5;
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2 + bob;

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w/2 + 15, y + h + 25, w/2 - 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Template base aponta o nariz para a esquerda; espelha ao voar para a direita
    ctx.save();
    if (direction === 1) {
        ctx.translate(x + w, 0);
        ctx.scale(-1, 1);
        ctx.translate(-x, 0);
    }
    
    // Corpo do helicóptero
    renderSpriteTemplate(ctx, CHOPPER_BODY_TEMPLATE, palette, drawX, drawY, PIXEL_SCALE);
    
    // Rotor principal
    const rotorFrame = Math.floor(frameCount / 2) % 3;
    const rotorTemplate = CHOPPER_MAIN_ROTOR[`frame${rotorFrame}`];
    renderSpriteTemplate(ctx, rotorTemplate, palette, drawX, drawY - 5 * PIXEL_SCALE, PIXEL_SCALE);
    
    // Rotor de cauda — sobre a deriva (o espelhamento do ctx cuida da direção)
    const tailFrame = Math.floor(frameCount / 2) % 2;
    const tailTemplate = CHOPPER_TAIL_ROTOR[`frame${tailFrame}`];
    renderSpriteTemplate(ctx, tailTemplate, palette, drawX + templateWidth - 4 * PIXEL_SCALE, drawY + 2 * PIXEL_SCALE, PIXEL_SCALE);
    
    ctx.restore();
}

function drawEnemyChopper(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? CHOPPER_PALETTES.enemyFlash : CHOPPER_PALETTES.enemy;
    drawChopperFromTemplate(ctx, x, y, w, h, direction, palette);
}

// ============ JETPACK SOLDIER ============
const JETPACK_SOLDIER_PALETTE = {
    helmet: '#4a4a5a',
    visor: '#00ffff',
    body: '#5a5a6a',
    bodyDark: '#3a3a4a',
    jetpack: '#6a6a7a',
    jetpackDark: '#4a4a5a',
    flame: '#ff6600',
    flameInner: '#ffff00',
    boots: '#3a3a4a'
};

function drawJetpackSoldier(ctx, x, y, w, h, direction, flash = false) {
    const px = PIXEL_SCALE;
    const palette = JETPACK_SOLDIER_PALETTE;
    
    const hoverY = Math.sin(frameCount * 0.15) * 3;
    const drawY = y + hoverY;
    
    // Se flash, desenhar tudo em branco/vermelho
    const drawColor = (color) => flash ? '#ff6666' : color;
    
    // Jetpack
    const jetpackX = direction === 1 ? x - 6 * px : x + w - 2 * px;
    ctx.fillStyle = drawColor(palette.jetpack);
    ctx.fillRect(jetpackX, drawY + 4 * px, 8 * px, 14 * px);
    ctx.fillStyle = drawColor(palette.jetpackDark);
    ctx.fillRect(jetpackX + 2 * px, drawY + 6 * px, 4 * px, 10 * px);
    
    // Chamas do jetpack (sempre coloridas)
    const flameHeight = 6 + Math.sin(frameCount * 0.3) * 3;
    
    // Glow simplificado com rect alpha
    if (typeof GLOW_CONFIG !== 'undefined' && GLOW_CONFIG.enabled) {
        ctx.fillStyle = `rgba(255, 120, 50, 0.2)`;
        ctx.fillRect(jetpackX - 2 * px, drawY + 16 * px, 12 * px, (flameHeight + 4) * px);
    }
    
    // Chama externa
    ctx.fillStyle = palette.flame;
    ctx.fillRect(jetpackX + 2 * px, drawY + 18 * px, 4 * px, flameHeight * px);
    
    // Chama interna (núcleo)
    ctx.fillStyle = palette.flameInner;
    ctx.fillRect(jetpackX + 3 * px, drawY + 18 * px, 2 * px, flameHeight * 0.6 * px);
    
    // Corpo
    ctx.fillStyle = drawColor(palette.body);
    ctx.fillRect(x + 3 * px, drawY + 8 * px, w - 6 * px, 10 * px);
    ctx.fillStyle = drawColor(palette.bodyDark);
    ctx.fillRect(x + 4 * px, drawY + 10 * px, w - 8 * px, 6 * px);
    
    // Capacete
    ctx.fillStyle = drawColor(palette.helmet);
    ctx.fillRect(x + 2 * px, drawY, w - 4 * px, 8 * px);
    
    // Visor
    const visorGlow = Math.sin(frameCount * 0.1) * 0.2 + 0.8;
    ctx.fillStyle = flash ? '#ffffff' : `rgba(0, 255, 255, ${visorGlow})`;
    if (direction === 1) {
        ctx.fillRect(x + w - 6 * px, drawY + 2 * px, 4 * px, 3 * px);
    } else {
        ctx.fillRect(x + 2 * px, drawY + 2 * px, 4 * px, 3 * px);
    }
    
    // Pernas
    ctx.fillStyle = drawColor(palette.boots);
    ctx.fillRect(x + 3 * px, drawY + 18 * px, 4 * px, 6 * px);
    ctx.fillRect(x + w - 7 * px, drawY + 18 * px, 4 * px, 6 * px);
    
    // Braços
    ctx.fillStyle = drawColor(palette.body);
    if (direction === 1) {
        ctx.fillRect(x + w - 2 * px, drawY + 8 * px, 4 * px, 8 * px);
    } else {
        ctx.fillRect(x - 2 * px, drawY + 8 * px, 4 * px, 8 * px);
    }
}

// ============ TURRET ============
function drawTurret(ctx, x, y, w, h, flash = false) {
    const px = PIXEL_SCALE;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    
    if (flash) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, w/2 + 2*px, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Base hexagonal
    ctx.fillStyle = '#4a4a5e';
    ctx.beginPath();
    ctx.moveTo(centerX - w/2, centerY + h/4);
    ctx.lineTo(centerX - w/3, centerY + h/2);
    ctx.lineTo(centerX + w/3, centerY + h/2);
    ctx.lineTo(centerX + w/2, centerY + h/4);
    ctx.lineTo(centerX + w/2, centerY - h/4);
    ctx.lineTo(centerX, centerY - h/2);
    ctx.lineTo(centerX - w/2, centerY - h/4);
    ctx.closePath();
    ctx.fill();
    
    // Sombra
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.moveTo(centerX - w/3, centerY + h/2);
    ctx.lineTo(centerX + w/3, centerY + h/2);
    ctx.lineTo(centerX + w/2, centerY + h/4);
    ctx.lineTo(centerX - w/2, centerY + h/4);
    ctx.closePath();
    ctx.fill();
    
    // Rotação do canhão
    const rotation = frameCount * 0.02;
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Domo
    ctx.fillStyle = '#6a6a8e';
    ctx.beginPath();
    ctx.arc(0, 0, w/3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8a8aae';
    ctx.beginPath();
    ctx.arc(-2*px, -2*px, w/5, 0, Math.PI * 2);
    ctx.fill();
    
    // Canhão
    ctx.rotate(rotation);
    ctx.fillStyle = '#3d3d4d';
    ctx.fillRect(-2*px, -h/2, 4*px, h/3);
    
    // Brilho na ponta
    const glowIntensity = Math.abs(Math.sin(frameCount * 0.15));
    ctx.fillStyle = `rgba(255, 100, 50, ${glowIntensity * 0.8})`;
    ctx.beginPath();
    ctx.arc(0, -h/2 + 2*px, 3*px, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Luzes de aviso
    const blink = Math.floor(frameCount / 15) % 2 === 0;
    if (blink) {
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(centerX - w/3, centerY, 2*px, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + w/3, centerY, 2*px, 0, Math.PI * 2);
        ctx.fill();
    }
}
