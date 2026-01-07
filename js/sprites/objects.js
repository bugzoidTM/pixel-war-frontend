// ============ OBJECTS SPRITE SYSTEM ============
// Templates e funções para objetos de cenário (minas, caixas, barreiras, etc)

// ============ MINE TEMPLATES ============
const MINE_TEMPLATE = [
    [0, 0, 0, 8, 9, 9, 8, 0, 0, 0],
    [0, 0, 8, 9, 10, 10, 9, 8, 0, 0],
    [0, 8, 2, 2, 2, 2, 2, 2, 8, 0],
    [8, 2, 2, 3, 2, 2, 3, 2, 2, 8],
    [8, 1, 2, 2, 2, 2, 2, 2, 1, 8],
    [8, 1, 1, 2, 2, 2, 2, 1, 1, 8],
    [0, 8, 1, 1, 1, 1, 1, 1, 8, 0],
    [0, 0, 8, 8, 8, 8, 8, 8, 0, 0],
];

const MINE_PALETTES = {
    normal: {
        1: '#2a3a1a', 2: '#4a5a3a', 3: '#6a7a5a',
        8: '#1a1a1a', 9: '#555555', 10: '#888888',
    },
    armed: {
        1: '#3a2a1a', 2: '#5a4a3a', 3: '#7a6a5a',
        8: '#1a1a1a', 9: '#555555', 10: '#ff0000',
    },
    triggered: {
        1: '#5a1a1a', 2: '#8a3a3a', 3: '#aa5a5a',
        8: '#1a1a1a', 9: '#ff0000', 10: '#ffff00',
    }
};

function drawMine(ctx, x, y, w, h, armed, triggered, triggerTimer, blinkRate) {
    const templateWidth = 10 * PIXEL_SCALE;
    const templateHeight = 8 * PIXEL_SCALE;
    
    const drawX = x + (w - templateWidth) / 2;
    const drawY = y + (h - templateHeight) / 2;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h - 2, w/3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    let palette;
    if (triggered) {
        palette = MINE_PALETTES.triggered;
        if (Math.floor(frameCount / blinkRate) % 2 === 0) {
            palette = { ...palette, 10: '#ffffff', 2: '#ff6666' };
        }
    } else if (armed) {
        palette = MINE_PALETTES.armed;
        if (Math.floor(frameCount / 20) % 2 === 0) {
            palette = { ...palette, 10: '#ff0000' };
        } else {
            palette = { ...palette, 10: '#550000' };
        }
    } else {
        palette = MINE_PALETTES.normal;
    }
    
    renderSpriteTemplate(ctx, MINE_TEMPLATE, palette, drawX, drawY, PIXEL_SCALE);
    
    if (triggered) {
        const warningRadius = 10 + triggerTimer * 2;
        const alpha = 0.3 + Math.sin(frameCount * 0.5) * 0.2;
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, warningRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    if (!armed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${5 * PIXEL_SCALE}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('⏱', x + w/2, y - 4);
    }
}

// ============ ROAD MINE (PHASE 11) ============
// ROAD MINE PALETTE INDEX LEGEND:
// 0 = transparent
// 1 = outline (black)
// 2 = casing dark (dark gray)
// 3 = casing base (medium gray)
// 4 = casing highlight (light gray)
// 5 = metal ring (dark)
// 6 = pressure plate (gray)
// 7 = indicator light OFF (dark red)
// 8 = indicator light ON (bright red)
// 9 = screws/detail (silver)
const ROAD_MINE_TEMPLATE = [
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,5,5,5,5,5,5,5,5,1,0,0,0],
    [0,0,1,5,3,3,3,3,3,3,3,3,5,1,0,0],
    [0,1,5,3,3,4,4,4,4,4,4,3,3,5,1,0],
    [1,5,3,3,4,6,6,6,6,6,6,4,3,3,5,1],
    [1,5,3,4,6,6,7,7,7,7,6,6,4,3,5,1],
    [1,5,3,4,6,7,7,8,8,7,7,6,4,3,5,1],
    [1,5,3,4,6,7,8,9,9,8,7,6,4,3,5,1],
    [1,5,3,4,6,7,8,9,9,8,7,6,4,3,5,1],
    [1,5,3,4,6,7,7,8,8,7,7,6,4,3,5,1],
    [1,5,3,4,6,6,7,7,7,7,6,6,4,3,5,1],
    [1,5,3,3,4,6,6,6,6,6,6,4,3,3,5,1],
    [0,1,5,3,3,4,4,4,4,4,4,3,3,5,1,0],
    [0,0,1,5,3,3,3,3,3,3,3,3,5,1,0,0],
    [0,0,0,1,5,5,5,5,5,5,5,5,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
];

const ROAD_MINE_PALETTE = {
    normal: {
        0: null,
        1: '#0a0a0a',       // outline
        2: '#1a1a1a',       // casing dark
        3: '#2a2a2a',       // casing base
        4: '#3a3a3a',       // casing highlight
        5: '#1a1a1a',       // metal ring
        6: '#4a4a4a',       // pressure plate
        7: '#550000',       // indicator dim
        8: '#880000',       // indicator glow
        9: '#333333'        // center detail
    },
    blink: {
        0: null,
        1: '#0a0a0a',
        2: '#1a1a1a',
        3: '#2a2a2a',
        4: '#3a3a3a',
        5: '#1a1a1a',
        6: '#4a4a4a',
        7: '#ff0000',       // indicator bright!
        8: '#ff4444',       // indicator glow bright!
        9: '#ff6666'        // center pulsing
    }
};

function drawRoadMineSprite(ctx, x, y, scale, blink) {
    const palette = blink ? ROAD_MINE_PALETTE.blink : ROAD_MINE_PALETTE.normal;
    const s = scale || 2;
    const template = ROAD_MINE_TEMPLATE;
    
    // Dimensões dinâmicas
    const w = template[0].length * s;
    const h = template.length * s;
    
    // Glow vermelho quando piscando
    if (blink) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2 + s*2, h/2 + s*2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    renderSpriteTemplate(ctx, template, palette, x, y, s);
}

// ============ BARRIER (PHASE 11) ============
// BARRIER PALETTE INDEX LEGEND:
// 0  = transparent
// 1  = outline (black)
// 2  = metal frame dark
// 3  = metal frame base
// 4  = metal frame highlight
// 5  = support leg
// 6  = reflector dark
// 7  = reflector bright
// 8  = warning orange dark
// 9  = warning orange base
// 10 = warning orange bright
// 11 = warning white
// 12 = bolt/detail
const BARRIER_TEMPLATE = [
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [1,3,9,9,9,1,11,11,11,1,9,9,9,1,11,11,11,1,9,9,9,3,1,0],
    [1,3,9,10,9,1,11,11,11,1,9,10,9,1,11,11,11,1,9,10,9,3,1,0],
    [1,3,8,9,9,1,11,11,11,1,8,9,9,1,11,11,11,1,8,9,9,3,1,0],
    [1,3,8,8,9,1,11,11,11,1,8,8,9,1,11,11,11,1,8,8,9,3,1,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,3,12,3,1,0,0,0,0,0,0,0,0,0,0,1,3,12,3,1,0,0,0],
    [0,1,5,5,5,1,0,0,0,0,0,0,0,0,0,0,1,5,5,5,1,0,0,0],
    [0,1,5,5,5,1,0,0,0,0,0,0,0,0,0,0,1,5,5,5,1,0,0,0],
    [0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0],
];

const BARRIER_PALETTE = {
    0: null,
    1: '#0a0a0a',       // outline
    2: '#2a2a2a',       // frame dark
    3: '#4a4a4a',       // frame base
    4: '#6a6a6a',       // frame highlight
    5: '#3a3a3a',       // support leg
    6: '#553300',       // reflector dark
    7: '#ffaa00',       // reflector bright
    8: '#cc4400',       // orange dark
    9: '#ff6600',       // orange base
    10: '#ff8833',      // orange bright
    11: '#ffffff',      // white stripe
    12: '#666666'       // bolt
};

function drawBarrierSprite(ctx, x, y, scale) {
    const s = scale || 3;
    const template = BARRIER_TEMPLATE;
    
    // Dimensões dinâmicas
    const w = template[0].length * s;
    const h = template.length * s;
    
    // Pequena sombra sob a barreira
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h, w/2 * 0.7, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    renderSpriteTemplate(ctx, template, BARRIER_PALETTE, x, y, s);
}

// ============ POWERUP CRATE ============
function drawBonusCrate(ctx, crate) {
    crate.lifetime--;
    
    if (crate.lifetime <= 0) {
        crate.dead = true;
        return;
    }
    
    const px = Math.floor(crate.x / PIXEL_SCALE);
    const py = Math.floor(crate.y / PIXEL_SCALE);
    const pw = Math.floor(crate.w / PIXEL_SCALE);
    const ph = Math.floor(crate.h / PIXEL_SCALE);
    
    const pulseFrame = Math.floor(frameCount / 10) % 4;
    const pulseOffset = pulseFrame === 1 || pulseFrame === 3 ? 1 : 0;
    
    let visible = true;
    if (crate.lifetime <= POWERUP_BLINK_START) {
        const blinkSpeed = crate.lifetime < 60 ? 4 : (crate.lifetime < 120 ? 8 : 12);
        visible = Math.floor(frameCount / blinkSpeed) % 2 === 0;
    }
    
    if (!visible) return;
    
    // Aura
    const glowColor = crate.type.color;
    ctx.fillStyle = glowColor + '40';
    ctx.fillRect(
        (px - 2 - pulseOffset) * PIXEL_SCALE,
        (py - 2 - pulseOffset) * PIXEL_SCALE,
        (pw + 4 + pulseOffset * 2) * PIXEL_SCALE,
        (ph + 4 + pulseOffset * 2) * PIXEL_SCALE
    );
    
    // Caixa
    drawPixelRect(ctx, px, py, pw, ph, crate.type.color, '#000000');
    drawPixelFill(ctx, px + 2, py + 2, pw - 4, ph - 4, '#ffffff');
    drawPixelFill(ctx, px + 3, py + 3, pw - 6, ph - 6, crate.type.color);
    
    // Ícone
    ctx.fillStyle = '#ffffff';
    ctx.font = `${7 * PIXEL_SCALE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(crate.type.icon, (px + pw / 2) * PIXEL_SCALE, (py + ph / 2) * PIXEL_SCALE);
    
    // Highlight
    drawPixelFill(ctx, px + 2, py + 2, 2, 1, '#ffffff');
    drawPixelFill(ctx, px + 2, py + 2, 1, 2, '#ffffff');
}

// ============ PIXEL HELPER FUNCTIONS ============
// Estas funções auxiliares de desenho pixel são compartilhadas
// PALETTES já está definido em config.js

function drawPixelFill(ctx, px, py, pw, ph, color) {
    ctx.fillStyle = color;
    ctx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, pw * PIXEL_SCALE, ph * PIXEL_SCALE);
}

function drawPixelRect(ctx, px, py, pw, ph, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, pw * PIXEL_SCALE, ph * PIXEL_SCALE);
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = PIXEL_SCALE;
        ctx.strokeRect(px * PIXEL_SCALE, py * PIXEL_SCALE, pw * PIXEL_SCALE, ph * PIXEL_SCALE);
    }
}

function drawPixelCircle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx * PIXEL_SCALE, cy * PIXEL_SCALE, r * PIXEL_SCALE, 0, Math.PI * 2);
    ctx.fill();
}

function drawPixelShadow(ctx, cx, cy, w, h) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx * PIXEL_SCALE, cy * PIXEL_SCALE, w * PIXEL_SCALE / 2, h * PIXEL_SCALE / 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawShadedRect(ctx, px, py, pw, ph, palette) {
    const p = PIXEL_SCALE;
    // Base
    ctx.fillStyle = palette.base;
    ctx.fillRect(px * p, py * p, pw * p, ph * p);
    // Highlight (topo e esquerda)
    ctx.fillStyle = palette.light;
    ctx.fillRect(px * p, py * p, pw * p, p);
    ctx.fillRect(px * p, py * p, p, ph * p);
    // Shadow (fundo e direita)
    ctx.fillStyle = palette.dark;
    ctx.fillRect(px * p, (py + ph - 1) * p, pw * p, p);
    ctx.fillRect((px + pw - 1) * p, py * p, p, ph * p);
}
