// ============ VEHICLE SPRITE SYSTEM ============
// Templates e funções para veículos terrestres (tanques, jipes, caminhões)

// ============ TANK TEMPLATES ============
const TANK_PALETTES = {
    ally: {
        0: null, 1: '#0a0a0a',
        2: '#4a6a35', 3: '#2a4a1c', 4: '#6a8a55',
        5: '#3a3a3a', 6: '#2a2a2a', 7: '#5a5a5a',
        8: '#2a2a20', 9: '#1a1a15', 10: '#3a3a30'
    },
    enemy: {
        0: null, 1: '#0a0a0a',
        2: '#6a3535', 3: '#4a1c1c', 4: '#8a5555',
        5: '#3a3a3a', 6: '#2a2a2a', 7: '#5a5a5a',
        8: '#2a2020', 9: '#1a1515', 10: '#3a3030'
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

// Template do corpo do tanque (16x20 pixels)
const TANK_BODY_TEMPLATES = {
    track0: [
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
        [0,0,1,4,2,2,2,2,2,2,2,2,4,1,0,0],
        [0,1,4,2,2,2,2,2,2,2,2,2,2,4,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
        [0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,10,8,10,10,10,10,10,10,10,10,8,10,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,10,8,10,10,10,10,10,10,10,10,8,10,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    track1: [
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
        [0,0,1,4,2,2,2,2,2,2,2,2,4,1,0,0],
        [0,1,4,2,2,2,2,2,2,2,2,2,2,4,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
        [0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,10,8,10,10,10,10,10,10,10,10,10,10,8,10,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,10,8,10,10,10,10,10,10,10,10,10,10,8,10,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    track2: [
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
        [0,0,1,4,2,2,2,2,2,2,2,2,4,1,0,0],
        [0,1,4,2,2,2,2,2,2,2,2,2,2,4,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
        [0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,10,8,10,10,10,10,10,10,10,10,8,10,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,10,8,10,10,10,10,10,10,10,10,8,10,8,1],
        [1,9,8,9,8,8,8,8,8,8,8,8,9,8,9,1],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    track3: [
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
        [0,0,1,4,2,2,2,2,2,2,2,2,4,1,0,0],
        [0,1,4,2,2,2,2,2,2,2,2,2,2,4,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
        [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
        [0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,10,8,10,10,10,10,10,10,10,10,10,10,8,10,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,10,8,10,10,10,10,10,10,10,10,10,10,8,10,1],
        [1,8,9,8,8,8,8,8,8,8,8,8,8,9,8,1],
        [1,8,8,8,1,1,1,1,1,1,1,1,8,8,8,1],
        [0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]
};

// Torre do tanque (10x10 pixels)
const TANK_TURRET = {
    base: [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,7,7,7,7,1,0,0],
        [0,1,7,5,5,5,5,7,1,0],
        [1,7,5,5,5,5,5,5,7,1],
        [1,7,5,5,6,6,5,5,7,1],
        [1,7,5,5,6,6,5,5,7,1],
        [1,7,5,5,5,5,5,5,7,1],
        [0,1,7,5,5,5,5,7,1,0],
        [0,0,1,7,7,7,7,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
    ]
};

// Canhão do tanque (diferentes direções)
const TANK_CANNON = {
    up: [
        [0,1,1,0],
        [0,1,1,0],
        [0,1,1,0],
        [1,6,6,1],
        [1,5,5,1],
        [1,5,5,1],
        [1,5,5,1],
        [1,7,7,1],
    ],
    down: [
        [1,7,7,1],
        [1,5,5,1],
        [1,5,5,1],
        [1,5,5,1],
        [1,6,6,1],
        [0,1,1,0],
        [0,1,1,0],
        [0,1,1,0],
    ],
    right: [
        [0,1,1,1,1,0,0,0],
        [1,7,5,5,6,1,1,1],
        [1,7,5,5,6,1,1,1],
        [0,1,1,1,1,0,0,0],
    ],
    left: [
        [0,0,0,1,1,1,1,0],
        [1,1,1,6,5,5,7,1],
        [1,1,1,6,5,5,7,1],
        [0,0,0,1,1,1,1,0],
    ]
};

// Obtém frame da esteira baseado na animação
function getTankTrackFrame() {
    const trackFrame = Math.floor(frameCount / 4) % 4;
    return TANK_BODY_TEMPLATES[`track${trackFrame}`];
}

// Desenha tanque usando sistema de templates
function drawTankFromTemplate(ctx, x, y, w, h, direction, palette, isMoving) {
    const templateWidth = 16 * PIXEL_SCALE;
    const templateHeight = 20 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    // Sombra oval
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h - 2, w/2 - 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fumaça do motor
    if (isMoving && Math.random() > 0.6) {
        const smokeX = direction === 1 ? x : direction === 3 ? x + w : x + w/2;
        const smokeY = direction === 0 ? y + h : direction === 2 ? y : y + h/2;
        particles.push(new Particle(smokeX, smokeY, '#555555', 4, 0.3, 1.5));
    }
    
    // Corpo do tanque
    const bodyTemplate = isMoving ? getTankTrackFrame() : TANK_BODY_TEMPLATES.track0;
    renderSpriteTemplate(ctx, bodyTemplate, palette, drawX, drawY, PIXEL_SCALE);
    
    // Canhão e torre
    const cx = x + w/2;
    const cy = y + h/2;
    const cannonOffset = 5 * PIXEL_SCALE;
    
    if (direction === 0) {
        const cannonTemplate = TANK_CANNON.up;
        renderSpriteTemplate(ctx, cannonTemplate, palette, 
            cx - 2*PIXEL_SCALE, cy - cannonOffset - 8*PIXEL_SCALE, PIXEL_SCALE);
    }
    
    // Torre
    const turretSize = 10 * PIXEL_SCALE;
    const turretX = cx - turretSize/2;
    const turretY = cy - turretSize/2;
    renderSpriteTemplate(ctx, TANK_TURRET.base, palette, turretX, turretY, PIXEL_SCALE);
    
    // Canhão (outras direções)
    if (direction === 2) {
        renderSpriteTemplate(ctx, TANK_CANNON.down, palette, 
            cx - 2*PIXEL_SCALE, cy + cannonOffset, PIXEL_SCALE);
    } else if (direction === 1) {
        renderSpriteTemplate(ctx, TANK_CANNON.right, palette, 
            cx + cannonOffset - 2*PIXEL_SCALE, cy - 2*PIXEL_SCALE, PIXEL_SCALE);
    } else if (direction === 3) {
        renderSpriteTemplate(ctx, TANK_CANNON.left, palette, 
            cx - cannonOffset - 6*PIXEL_SCALE, cy - 2*PIXEL_SCALE, PIXEL_SCALE);
    }
}

// Funções de sprite para tanque
function drawTankSprite(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? TANK_PALETTES.flash : TANK_PALETTES.ally;
    drawTankFromTemplate(ctx, x, y, w, h, direction, palette, true);
}

function drawEnemyTank(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? TANK_PALETTES.enemyFlash : TANK_PALETTES.enemy;
    drawTankFromTemplate(ctx, x, y, w, h, direction, palette, true);
}

// ============ JEEP TEMPLATES (PHASE 11) ============
// JEEP PALETTE INDEX LEGEND:
// 0  = transparent
// 1  = outline (dark black)
// 2  = body base (olive green)
// 3  = body shadow (dark green)
// 4  = body highlight (light green)
// 5  = metal frame (dark gray)
// 6  = window base (dark blue)
// 7  = window reflection (light blue)
// 8  = wheel hub (dark gray)
// 9  = tire rubber (black)
// 10 = wheel spoke/detail (gray)
// 11 = brake light OFF (dark red)
// 12 = brake light ON (bright red)
// 13 = chrome/bumper (silver)
// 14 = chassis/undercarriage (dark)
// 15 = exhaust/details (medium gray)
const JEEP_PALETTES = {
    ally: {
        0: null,
        1: '#0a0a0a',       // outline
        2: '#4a6a35',       // body base
        3: '#2a4a1c',       // body shadow
        4: '#6a8a55',       // body highlight
        5: '#3a3a3a',       // metal frame
        6: '#1a3a50',       // window base
        7: '#5a9aba',       // window reflection (brighter)
        8: '#2a2a2a',       // wheel hub
        9: '#1a1a1a',       // tire rubber
        10: '#5a5a5a',      // wheel spoke
        11: '#440000',      // brake light OFF
        12: '#ff0000',      // brake light ON
        13: '#aaaaaa',      // chrome/bumper
        14: '#2a2a2a',      // chassis
        15: '#4a4a4a'       // exhaust/details
    },
    flash: {
        0: null,
        1: '#ffffff', 2: '#ffffff', 3: '#ffffff', 4: '#ffffff',
        5: '#ffffff', 6: '#ffffff', 7: '#ffffff', 8: '#ffffff',
        9: '#ffffff', 10: '#ffffff', 11: '#ffffff', 12: '#ffffff',
        13: '#ffffff', 14: '#ffffff', 15: '#ffffff'
    }
};

// Template do jipe - Visão traseira aprimorada
// Dimensões dinâmicas - NÃO usar 24x32 hardcoded!
const JEEP_TEMPLATE_REAR = {
    wheel0: [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
        [0,0,0,0,1,4,4,4,2,2,2,2,2,2,2,2,4,4,4,1,0,0,0,0],
        [0,0,0,0,1,4,4,2,2,2,2,2,2,2,2,2,2,4,4,1,0,0,0,0],
        [0,0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0,0],
        [0,0,0,0,1,3,3,2,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,5,5,1,6,6,6,6,6,6,6,6,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,6,7,7,7,7,7,7,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,7,7,7,6,6,7,7,7,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,6,6,6,6,6,6,6,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0],
        [0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,2,2,2,2,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,12,11,2,13,13,13,13,2,11,12,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,13,1,1,13,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,3,3,3,3,3,13,13,13,13,3,3,3,3,3,3,3,1,0,0,0],
        [0,0,1,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,15,15,15,15,1,1,1,1,1,1,1,0,0,0,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [1,8,9,9,10,9,8,1,0,0,0,0,0,0,0,1,8,9,10,9,9,8,1,0],
        [1,8,9,10,10,9,8,1,0,0,0,0,0,0,0,1,8,9,10,10,9,8,1,0],
        [1,8,9,10,10,9,8,1,0,0,0,0,0,0,0,1,8,9,10,10,9,8,1,0],
        [1,8,9,9,10,9,8,1,0,0,0,0,0,0,0,1,8,9,10,9,9,8,1,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    ],
    wheel1: [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
        [0,0,0,0,1,4,4,4,2,2,2,2,2,2,2,2,4,4,4,1,0,0,0,0],
        [0,0,0,0,1,4,4,2,2,2,2,2,2,2,2,2,2,4,4,1,0,0,0,0],
        [0,0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0,0],
        [0,0,0,0,1,3,3,2,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,5,5,1,6,6,6,6,6,6,6,6,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,6,7,7,7,7,7,7,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,7,7,7,6,6,7,7,7,6,1,5,5,1,0,0,0],
        [0,0,0,1,5,5,1,6,6,6,6,6,6,6,6,6,6,1,5,5,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0],
        [0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,2,2,2,2,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,12,11,2,13,13,13,13,2,11,12,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,13,1,1,13,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,3,3,3,3,3,13,13,13,13,3,3,3,3,3,3,3,1,0,0,0],
        [0,0,1,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,15,15,15,15,1,1,1,1,1,1,1,0,0,0,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [1,8,9,10,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,10,9,8,1,0],
        [1,8,10,10,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,10,10,8,1,0],
        [1,8,10,10,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,10,10,8,1,0],
        [1,8,9,10,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,10,9,8,1,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    ]
};

function getJeepWheelFrame(speed) {
    if (speed < 30) return JEEP_TEMPLATE_REAR.wheel0;
    // Faster toggle at higher speeds: min 1 frame at 200+ km/h
    const frameRate = Math.max(1, Math.floor(8 - speed / 30));
    const frame = Math.floor(frameCount / frameRate) % 2;
    return frame === 0 ? JEEP_TEMPLATE_REAR.wheel0 : JEEP_TEMPLATE_REAR.wheel1;
}

function drawJeepSprite(ctx, x, y, scale, speed, braking, flash) {
    const template = getJeepWheelFrame(speed);
    const palette = flash ? { ...JEEP_PALETTES.flash } : { ...JEEP_PALETTES.ally };
    
    // When braking, light up brake lights (index 11 becomes bright red)
    if (braking && !flash) {
        palette[11] = '#ff0000';  // All brake light areas turn bright red
        palette[12] = '#ff4444';  // Center highlight even brighter
    }
    
    const s = scale || 3;
    // Dynamic width/height from template - NO hardcoded 24x32!
    const w = template[0].length * s;
    const h = template.length * s;
    
    // Shadow ellipse proportional to actual sprite size
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 4*s, w/2 * 0.9, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Brake light glow effect when braking
    if (braking && !flash) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ff0000';
        // Left brake light glow
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + h * 0.52, s * 4, s * 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right brake light glow
        ctx.beginPath();
        ctx.ellipse(x + w * 0.75, y + h * 0.52, s * 4, s * 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    renderSpriteTemplate(ctx, template, palette, x, y, s);
}

// ============ TRUCK TEMPLATES (PHASE 11) ============
// TRUCK PALETTE INDEX LEGEND:
// 0  = transparent
// 1  = outline (dark black)
// 2  = cargo canvas base (tan)
// 3  = cargo canvas shadow (dark brown)
// 4  = cargo canvas highlight (light tan)
// 5  = metal frame (dark gray)
// 6  = cabin dark (dark gray)
// 7  = cabin highlight (medium gray)
// 8  = wheel hub (dark gray)
// 9  = tire rubber (black)
// 10 = wheel spoke (gray)
// 11 = brake light OFF (dark red)
// 12 = brake light ON (bright red)
// 13 = canvas straps/detail (olive)
// 14 = bumper chrome (silver)
// 15 = exhaust/pipe (dark)
const TRUCK_PALETTES = {
    enemy: {
        0: null,
        1: '#0a0a0a',       // outline
        2: '#6a5a40',       // cargo canvas base
        3: '#3a3020',       // cargo shadow
        4: '#8a7a60',       // cargo highlight
        5: '#3a3a3a',       // metal frame
        6: '#2a2a2a',       // cabin dark
        7: '#5a5a5a',       // cabin light
        8: '#2a2a2a',       // wheel hub
        9: '#1a1a1a',       // tire
        10: '#4a4a4a',      // spoke
        11: '#550000',      // brake light off
        12: '#ff0000',      // brake light on
        13: '#5a5a4a',      // straps
        14: '#8a8a8a',      // chrome
        15: '#2a2a2a'       // exhaust
    },
    flash: {
        0: null,
        1: '#ff4444', 2: '#ff4444', 3: '#ff4444', 4: '#ff4444',
        5: '#ff4444', 6: '#ff4444', 7: '#ff4444', 8: '#ff4444',
        9: '#ff4444', 10: '#ff4444', 11: '#ff4444', 12: '#ff4444',
        13: '#ff4444', 14: '#ff4444', 15: '#ff4444'
    }
};

// Template de caminhão militar - visão traseira aprimorada
const TRUCK_TEMPLATE_REAR = {
    wheel0: [
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0],
        [0,0,0,1,4,4,4,13,13,4,4,13,13,4,4,4,4,1,0,0,0,0],
        [0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0],
        [0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0],
        [0,0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0,0],
        [0,0,0,1,3,3,2,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,5,5,5,1,6,6,6,6,6,6,6,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,6,7,7,7,7,6,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,7,7,6,6,7,7,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,6,6,6,6,6,6,6,1,5,5,5,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
        [0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0],
        [0,0,1,3,2,11,11,11,2,2,2,2,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,12,11,2,14,14,14,2,11,12,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,14,1,14,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,3,3,3,3,3,14,14,14,3,3,3,3,3,3,3,1,0,0],
        [0,0,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,0,0],
        [0,0,0,1,1,1,1,1,1,15,15,15,1,1,1,1,1,1,1,0,0,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [1,8,9,9,10,9,8,1,0,0,0,0,0,1,8,9,10,9,9,8,1,0],
        [1,8,9,10,10,9,8,1,0,0,0,0,0,1,8,9,10,10,9,8,1,0],
        [1,8,9,10,10,9,8,1,0,0,0,0,0,1,8,9,10,10,9,8,1,0],
        [1,8,9,9,10,9,8,1,0,0,0,0,0,1,8,9,10,9,9,8,1,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    ],
    wheel1: [
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0],
        [0,0,0,1,4,4,4,13,13,4,4,13,13,4,4,4,4,1,0,0,0,0],
        [0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0],
        [0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0],
        [0,0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0,0],
        [0,0,0,1,3,3,2,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,5,5,5,1,6,6,6,6,6,6,6,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,6,7,7,7,7,6,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,7,7,6,6,7,7,6,1,5,5,5,1,0,0],
        [0,0,1,5,5,5,1,6,6,6,6,6,6,6,6,1,5,5,5,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
        [0,0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0],
        [0,0,1,3,2,11,11,11,2,2,2,2,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,12,11,2,14,14,14,2,11,12,11,2,3,1,0,0,0],
        [0,0,1,3,2,11,11,11,2,14,1,14,2,11,11,11,2,3,1,0,0,0],
        [0,0,1,3,3,3,3,3,3,14,14,14,3,3,3,3,3,3,3,1,0,0],
        [0,0,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,0,0],
        [0,0,0,1,1,1,1,1,1,15,15,15,1,1,1,1,1,1,1,0,0,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [1,8,9,10,9,9,8,1,0,0,0,0,0,1,8,9,9,10,9,8,1,0],
        [1,8,10,10,9,9,8,1,0,0,0,0,0,1,8,9,9,10,10,8,1,0],
        [1,8,10,10,9,9,8,1,0,0,0,0,0,1,8,9,9,10,10,8,1,0],
        [1,8,9,10,9,9,8,1,0,0,0,0,0,1,8,9,9,10,9,8,1,0],
        [1,8,9,9,9,9,8,1,0,0,0,0,0,1,8,9,9,9,9,8,1,0],
        [0,1,8,8,8,8,1,0,0,0,0,0,0,0,1,8,8,8,8,1,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    ]
};

// Contador interno para animação de rodas do caminhão
let truckWheelCounter = 0;

function getTruckWheelFrame() {
    // Alterna a cada 4 frames
    const frame = Math.floor(frameCount / 4) % 2;
    return frame === 0 ? TRUCK_TEMPLATE_REAR.wheel0 : TRUCK_TEMPLATE_REAR.wheel1;
}

function drawTruckSprite(ctx, x, y, scale, flash) {
    const template = getTruckWheelFrame();
    const palette = flash ? { ...TRUCK_PALETTES.flash } : { ...TRUCK_PALETTES.enemy };
    const s = scale || 2;
    
    // Dimensões dinâmicas do template
    const w = template[0].length * s;
    const h = template.length * s;
    
    // Sombra proporcional
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 3*s, w/2 * 0.85, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    renderSpriteTemplate(ctx, template, palette, x, y, s);
}

// ============ FLAME TANK ============
function drawFlameTank(ctx, x, y, w, h, direction, flash = false) {
    const px = PIXEL_SCALE;
    
    const bodyColor = flash ? '#ff6666' : '#5a6570';
    const darkColor = flash ? '#ff4444' : '#3a4550';
    const lightColor = flash ? '#ff8888' : '#7a8590';
    const trackColor = flash ? '#ff3333' : '#2a2a2a';
    const flameColor = '#ff6600';
    
    // Esteiras
    ctx.fillStyle = trackColor;
    ctx.fillRect(x, y + h - 10 * px, w, 10 * px);
    
    // Rodas
    ctx.fillStyle = darkColor;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + 6 * px + i * 10 * px, y + h - 5 * px, 4 * px, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Corpo
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 4 * px, y + 8 * px, w - 8 * px, h - 18 * px);
    
    ctx.fillStyle = lightColor;
    ctx.fillRect(x + 6 * px, y + 4 * px, w - 12 * px, 6 * px);
    
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + 4 * px, y + h - 14 * px, w - 8 * px, 4 * px);
    
    // Canhão lança-chamas
    const turretX = x + w / 2;
    const turretY = y + 6 * px;
    
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(turretX - 8 * px, turretY, 16 * px, 10 * px);
    
    ctx.fillStyle = '#2a2a2a';
    let cannonEndX = turretX;
    let cannonEndY = turretY;
    
    if (direction === 0) {
        ctx.fillRect(turretX - 4 * px, turretY - 14 * px, 8 * px, 14 * px);
        cannonEndY = turretY - 14 * px;
    } else if (direction === 1) {
        ctx.fillRect(turretX + 8 * px, turretY + 2 * px, 14 * px, 6 * px);
        cannonEndX = turretX + 22 * px;
        cannonEndY = turretY + 5 * px;
    } else if (direction === 2) {
        ctx.fillRect(turretX - 4 * px, turretY + 10 * px, 8 * px, 14 * px);
        cannonEndY = turretY + 24 * px;
    } else {
        ctx.fillRect(turretX - 22 * px, turretY + 2 * px, 14 * px, 6 * px);
        cannonEndX = turretX - 22 * px;
        cannonEndY = turretY + 5 * px;
    }
    
    // Chama
    const flameSize = 4 + Math.sin(frameCount * 0.3) * 2;
    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.arc(cannonEndX, cannonEndY, flameSize * px, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(cannonEndX, cannonEndY, flameSize * px * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Tanque de combustível
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(x + w - 10 * px, y + 10 * px, 6 * px, 14 * px);
    ctx.fillStyle = '#cc6600';
    ctx.fillRect(x + w - 10 * px, y + 10 * px, 6 * px, 4 * px);
    
    // Contorno
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = px;
    ctx.strokeRect(x + 4 * px, y + 4 * px, w - 8 * px, h - 14 * px);
}
