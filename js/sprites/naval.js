// ============ NAVAL SPRITE SYSTEM ============
// Templates e funções para embarcações (navios e submarinos)

// ============ SHIP TEMPLATES ============
const SHIP_PALETTES = {
    ally: {
        0: null, 1: '#0a0a0a',
        2: '#5a6a6a', 3: '#3a4a4a', 4: '#7a8a8a',
        5: '#4a5a5a', 6: '#2a3a3a', 7: '#6a7a7a',
        8: '#3a3a3a', 9: '#2a2a2a', 10: '#5a5a5a'
    },
    flash: {
        0: null, 1: '#fff', 2: '#fff', 3: '#fff', 4: '#fff',
        5: '#fff', 6: '#fff', 7: '#fff', 8: '#fff', 9: '#fff', 10: '#fff'
    }
};

// Template do corpo do navio (24x18 pixels)
const SHIP_BODY_TEMPLATE = [
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,4,4,4,4,4,4,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,4,2,2,2,2,2,2,4,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,4,2,2,2,2,2,2,2,2,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,2,2,2,2,2,2,2,2,2,2,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,2,2,2,5,5,5,5,5,2,2,2,2,4,1,0,0,0,0],
    [0,0,0,1,4,2,2,2,5,6,6,6,6,6,5,2,2,2,2,4,1,0,0,0],
    [0,0,1,4,2,2,2,2,5,6,6,6,6,6,5,2,2,2,2,2,4,1,0,0],
    [0,1,4,2,2,2,2,2,5,6,6,6,6,6,5,2,2,2,2,2,2,4,1,0],
    [1,4,2,2,2,2,2,2,5,5,5,5,5,5,5,2,2,2,2,2,2,2,4,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,1],
    [0,1,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,1,0],
    [0,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Canhões do navio
const SHIP_CANNON_FRONT = [
    [0,1,1,0],
    [1,8,8,1],
    [1,9,9,1],
    [1,8,8,1],
    [0,1,1,0],
];

const SHIP_CANNON_SIDE = [
    [0,0,1,1,1,0,0],
    [0,1,8,8,8,1,0],
    [1,8,9,9,9,8,1],
    [0,1,8,8,8,1,0],
    [0,0,1,1,1,0,0],
];

// Esteira de água/ondas (frames animados)
const SHIP_WAKE_FRAMES = {
    frame0: [
        [0,0,7,7,7,7,7,0,0],
        [0,7,7,4,4,4,7,7,0],
        [7,7,4,4,4,4,4,7,7],
    ],
    frame1: [
        [0,7,7,7,7,7,7,7,0],
        [7,7,4,4,4,4,4,7,7],
        [0,7,4,4,4,4,4,7,0],
    ]
};

function drawShipFromTemplate(ctx, x, y, w, h, direction, palette) {
    const templateWidth = 24 * PIXEL_SCALE;
    const templateHeight = 18 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    // Sombra na água
    ctx.fillStyle = 'rgba(0, 30, 60, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 5, w/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.save();
    
    // Rotação para diferentes direções
    if (direction === 1 || direction === 3) {
        ctx.translate(x + w/2, y + h/2);
        ctx.rotate(direction === 1 ? Math.PI/2 : -Math.PI/2);
        ctx.translate(-templateWidth/2, -templateHeight/2);
        renderSpriteTemplate(ctx, SHIP_BODY_TEMPLATE, palette, 0, 0, PIXEL_SCALE);
    } else {
        if (direction === 2) {
            ctx.translate(x + w, 0);
            ctx.scale(-1, 1);
            ctx.translate(-x, 0);
        }
        renderSpriteTemplate(ctx, SHIP_BODY_TEMPLATE, palette, drawX, drawY, PIXEL_SCALE);
    }
    
    ctx.restore();
    
    // Canhões
    const cannonX = x + w/2 - 2 * PIXEL_SCALE;
    const cannonY = y + 4 * PIXEL_SCALE;
    renderSpriteTemplate(ctx, SHIP_CANNON_FRONT, palette, cannonX, cannonY, PIXEL_SCALE);
    
    // Esteira de água
    const wakeFrame = Math.floor(frameCount / 8) % 2;
    const wakeTemplate = SHIP_WAKE_FRAMES[`frame${wakeFrame}`];
    const wakePalette = { 4: 'rgba(200, 230, 255, 0.6)', 7: 'rgba(150, 200, 255, 0.4)' };
    
    if (direction === 0 || direction === 2) {
        const wakeY = direction === 0 ? y + h - 2 : y - 3 * PIXEL_SCALE;
        renderSpriteTemplate(ctx, wakeTemplate, wakePalette, x + w/2 - 4.5 * PIXEL_SCALE, wakeY, PIXEL_SCALE);
    }
}

function drawShipSprite(ctx, x, y, w, h, direction, flash = false) {
    const palette = flash ? SHIP_PALETTES.flash : SHIP_PALETTES.ally;
    drawShipFromTemplate(ctx, x, y, w, h, direction, palette);
}

// ============ SUBMARINE TEMPLATES ============
const SUBMARINE_TEMPLATE = [
    [0,0,0,0,0,0,0,0,0,0,0,8,9,8,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,8,9,8,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,8,8,1,2,1,8,8,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,8,1,2,2,3,2,2,1,8,0,0,0,0,0,0,0,0],
    [0,0,0,0,8,8,8,8,1,1,2,2,2,2,2,1,1,8,8,8,8,0,0,0,0],
    [0,0,8,8,1,1,2,2,2,2,2,3,3,3,2,2,2,2,2,1,1,8,8,0,0],
    [0,8,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,8,0],
    [8,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,8],
    [0,8,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,8,0],
    [0,0,8,8,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,8,8,0,0],
];

const SUBMARINE_PALETTES = {
    normal: {
        1: '#2a3a4a', 2: '#4a5a6a', 3: '#6a7a8a',
        8: '#1a1a2a', 9: '#888888'
    },
    submerged: {
        1: '#1a2a3a', 2: '#3a4a5a', 3: '#5a6a7a',
        8: '#0a1a2a', 9: '#666666'
    }
};

function drawSubmarine(ctx, x, y, w, h, fromLeft, submerged, periscopeUp) {
    const templateWidth = 25 * PIXEL_SCALE;
    const templateHeight = 10 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    if (submerged) {
        ctx.globalAlpha = 0.5;
    }
    
    const palette = submerged ? SUBMARINE_PALETTES.submerged : SUBMARINE_PALETTES.normal;
    
    if (!fromLeft) {
        ctx.save();
        ctx.translate(x + w, 0);
        ctx.scale(-1, 1);
        renderSpriteTemplate(ctx, SUBMARINE_TEMPLATE, palette, w - (drawX - x) - templateWidth, drawY, PIXEL_SCALE);
        ctx.restore();
    } else {
        renderSpriteTemplate(ctx, SUBMARINE_TEMPLATE, palette, drawX, drawY, PIXEL_SCALE);
    }
    
    // Esconder periscópio
    if (!periscopeUp || submerged) {
        ctx.fillStyle = 'rgba(30, 60, 90, 0.7)';
        ctx.fillRect(drawX + 10*PIXEL_SCALE, drawY, 5*PIXEL_SCALE, 4*PIXEL_SCALE);
    }
    
    ctx.globalAlpha = 1;
    
    // Ondas quando emerge
    if (!submerged) {
        const foamAlpha = 0.6 + Math.sin(frameCount * 0.2) * 0.2;
        ctx.fillStyle = `rgba(200, 230, 255, ${foamAlpha})`;
        
        const frontX = fromLeft ? x + w + 5 : x - 15;
        ctx.fillRect(frontX, y + h/2 - 3, 10, 6);
        
        for (let i = 0; i < 3; i++) {
            const waveY = y + 5 + i * 8;
            const waveOffset = Math.sin(frameCount * 0.1 + i) * 3;
            ctx.fillStyle = `rgba(150, 200, 255, ${0.4 - i * 0.1})`;
            ctx.fillRect(x - 5 + waveOffset, waveY, w + 10, 2);
        }
    }
    
    // Bolhas
    if (frameCount % (submerged ? 8 : 20) === 0) {
        const bubbleX = fromLeft ? x + w - 5 : x + 5;
        particles.push(new Particle(
            bubbleX + (Math.random() - 0.5) * 10,
            y + h/2,
            'rgba(180, 220, 255, 0.7)',
            3 + Math.random() * 2,
            -1,
            0.8
        ));
    }
    
    // Indicador de perigo
    if (!submerged && periscopeUp) {
        ctx.fillStyle = '#ff0000';
        ctx.font = `bold ${6 * PIXEL_SCALE}px Arial`;
        ctx.textAlign = 'center';
        const warningAlpha = Math.sin(frameCount * 0.3) * 0.5 + 0.5;
        ctx.globalAlpha = warningAlpha;
        ctx.fillText('⚠', x + w/2, y - 10);
        ctx.globalAlpha = 1;
    }
}

// Torpedo
function drawTorpedo(ctx, x, y, vx, vy) {
    const angle = Math.atan2(vy, vx);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(-8, -3, 16, 6);
    
    ctx.fillStyle = '#8a2a2a';
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(12, 0);
    ctx.lineTo(8, 3);
    ctx.fill();
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-10, -4, 3, 8);
    
    ctx.restore();
    
    if (Math.random() > 0.5) {
        particles.push(new Particle(
            x - vx * 2,
            y - vy * 2,
            'rgba(200, 230, 255, 0.5)',
            2,
            -0.3,
            0.5
        ));
    }
}
