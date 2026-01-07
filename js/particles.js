// ============ PARTICLE SYSTEM ============
// Partículas com estilo pixel art para explosões
// Fumaça e efeitos suaves mantêm visual original
// Sistema de glow neon para estética arcade

// ============ GLOW SYSTEM (OPTIMIZED) ============
const GLOW_CONFIG = {
    enabled: true,
    intensity: 0.7,
    // Usar glow simples (rect colorido) em vez de shadowBlur caro
    useSimpleGlow: true,
    // Só aplicar glow a cada N frames para performance
    glowSkipFrames: 2
};

// Contador para skip de frames de glow
let glowFrameCounter = 0;

// Helper OTIMIZADO - usa rect colorido em vez de shadowBlur
function drawWithGlow(ctx, x, y, w, h, glowColor, intensity = 1) {
    if (!GLOW_CONFIG.enabled) return;
    
    // Skip frames para performance
    if (glowFrameCounter % GLOW_CONFIG.glowSkipFrames !== 0) return;
    
    const glowSize = 4 * intensity * GLOW_CONFIG.intensity;
    ctx.globalAlpha = 0.3 * intensity;
    ctx.fillStyle = glowColor;
    ctx.fillRect(x - glowSize, y - glowSize, w + glowSize * 2, h + glowSize * 2);
    ctx.globalAlpha = 1;
}

// Incrementar contador de frames (chamar uma vez por frame no game loop)
function updateGlowFrame() {
    glowFrameCounter++;
}

// ============ GROUND STAINS SYSTEM (OPTIMIZED) ============
const MAX_GROUND_STAINS = 30; // Reduzido para performance
let groundStains = [];

class GroundStain {
    constructor(x, y, size, color, type = 'blood') {
        this.x = x;
        this.y = y;
        this.size = size + Math.random() * 8;
        this.color = color;
        this.life = 2000 + Math.random() * 1000; // Reduzido
        this.maxLife = this.life;
        // Pré-calcular dimensões para evitar cálculos no draw
        this.w = this.size * 2;
        this.h = this.size * 1.2;
        // Splatter simplificado - apenas 2-3 rects
        this.splatterCount = 2 + Math.floor(Math.random() * 2);
        this.splatterOffsets = [];
        for (let i = 0; i < this.splatterCount; i++) {
            this.splatterOffsets.push({
                x: (Math.random() - 0.5) * this.size * 1.5,
                y: (Math.random() - 0.5) * this.size,
                s: 3 + Math.random() * 4
            });
        }
    }
    
    update() {
        this.life -= 2; // Decremento mais rápido
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        // Skip se muito transparente
        const alpha = Math.min(1, this.life / (this.maxLife * 0.15));
        if (alpha < 0.05) return;
        
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = this.color;
        
        // Mancha principal - RECT simples em vez de ellipse
        ctx.fillRect(this.x - this.size, this.y - this.size * 0.6, this.w, this.h);
        
        // Splatter - rects simples
        ctx.globalAlpha = alpha * 0.4;
        for (let i = 0; i < this.splatterCount; i++) {
            const s = this.splatterOffsets[i];
            ctx.fillRect(this.x + s.x, this.y + s.y, s.s, s.s);
        }
        
        ctx.globalAlpha = 1;
    }
}

function createGroundStain(x, y, size, color, type) {
    // Limitar quantidade de manchas
    if (groundStains.length >= MAX_GROUND_STAINS) {
        groundStains.shift(); // Remove a mais antiga
    }
    groundStains.push(new GroundStain(x, y, size, color, type));
}

// ============ METAL DEBRIS SYSTEM (OPTIMIZED) ============
const MAX_METAL_DEBRIS = 20; // Reduzido para performance
let metalDebris = [];

// Cores pré-definidas para evitar criação de strings
const METAL_COLORS = ['#4a4a4a', '#5a5a5a', '#3a3a3a', '#5a4a3a'];

class MetalDebris {
    constructor(x, y, groundY) {
        this.x = x;
        this.y = y;
        this.groundY = groundY || 550;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = -6 - Math.random() * 6;
        this.gravity = 0.5;
        this.bounce = 0.35;
        this.size = 4 + Math.random() * 6;
        this.color = METAL_COLORS[Math.floor(Math.random() * METAL_COLORS.length)];
        this.life = 150 + Math.random() * 50; // Reduzido
        this.maxLife = this.life;
        this.grounded = false;
    }
    
    update() {
        if (this.life <= 0) return;
        this.life--;
        
        if (!this.grounded) {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                if (Math.abs(this.vy) > 2) {
                    this.vy *= -this.bounce;
                    this.vx *= 0.8;
                } else {
                    this.grounded = true;
                    this.vy = 0;
                }
            }
        } else {
            this.vx *= 0.9;
            this.x += this.vx;
        }
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        const alpha = Math.min(1, this.life / (this.maxLife * 0.25));
        if (alpha < 0.1) return;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        // Rect simples - sem rotação, sem stroke
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

function createMetalDebris(x, y, count = 8, groundY = null) {
    // Limitar quantidade total
    while (metalDebris.length + count > MAX_METAL_DEBRIS) {
        metalDebris.shift();
    }
    
    for (let i = 0; i < count; i++) {
        metalDebris.push(new MetalDebris(x, y, groundY));
    }
}

class Particle {
    constructor(x, y, color, size = null, speedMult = 1, gravity = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size || (Math.random() * 6 + 3);
        this.vx = (Math.random() - 0.5) * 8 * speedMult;
        this.vy = (Math.random() - 0.5) * 8 * speedMult - 2;
        this.life = 40 + Math.random() * 20;
        this.maxLife = this.life;
        this.gravity = gravity;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.isPixelArt = true; // Flag para estilo pixel art
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.life -= 1;
        this.rotation += this.rotationSpeed;
        this.size = Math.max(0.1, this.size * 0.97);
    }
    
    draw(ctx) {
        if (this.size <= 0 || this.life <= 0) return;
        
        const alpha = Math.max(0, this.life / this.maxLife);
        if (alpha < 0.1) return; // Skip muito transparente
        
        ctx.globalAlpha = alpha;
        
        if (this.isPixelArt) {
            const px = Math.floor(this.x / PIXEL_SCALE);
            const py = Math.floor(this.y / PIXEL_SCALE);
            const ps = Math.max(1, Math.floor(this.size / PIXEL_SCALE));
            const drawX = (px - Math.floor(ps/2)) * PIXEL_SCALE;
            const drawY = (py - Math.floor(ps/2)) * PIXEL_SCALE;
            const drawSize = ps * PIXEL_SCALE;
            
            // Glow simples (apenas para partículas grandes e brilhantes)
            if (GLOW_CONFIG.enabled && ps >= 2 && this.life > this.maxLife * 0.5) {
                drawWithGlow(ctx, drawX, drawY, drawSize, drawSize, this.color, alpha);
            }
            
            // Contorno + preenchimento combinados
            ctx.fillStyle = '#000000';
            ctx.fillRect(drawX - PIXEL_SCALE, drawY - PIXEL_SCALE, drawSize + PIXEL_SCALE * 2, drawSize + PIXEL_SCALE * 2);
            ctx.fillStyle = this.color;
            ctx.fillRect(drawX, drawY, drawSize, drawSize);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
        
        ctx.globalAlpha = 1;
    }
}

class MuzzleFlash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 4;
        this.maxLife = 4;
        this.size = 8 + Math.random() * 4;
    }
    
    update() { this.life--; }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        const px = Math.floor(this.x / PIXEL_SCALE);
        const py = Math.floor(this.y / PIXEL_SCALE);
        const ps = Math.max(2, Math.floor(this.size / PIXEL_SCALE));
        
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        
        // Glow simples (rect extra)
        if (GLOW_CONFIG.enabled) {
            const gx = (px - ps - 1) * PIXEL_SCALE;
            const gy = (py - ps - 1) * PIXEL_SCALE;
            drawWithGlow(ctx, gx, gy, (ps * 2 + 2) * PIXEL_SCALE, (ps * 2 + 2) * PIXEL_SCALE, '#ffff00', alpha);
        }
        
        // Flash amarelo pixelado
        drawPixelFill(ctx, px - ps, py - Math.floor(ps/2), ps * 2, ps, '#ffff00');
        drawPixelFill(ctx, px - Math.floor(ps/2), py - ps, ps, ps * 2, '#ffff00');
        
        // Centro branco
        drawPixelFill(ctx, px - 1, py - 1, 2, 2, '#ffffff');
        
        ctx.globalAlpha = 1;
    }
}

class SmokeParticle {
    constructor(x, y, color) {
        this.x = x + (Math.random() - 0.5) * 10;
        this.y = y + (Math.random() - 0.5) * 10;
        this.size = 5 + Math.random() * 10;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -1 - Math.random();
        this.life = 60 + Math.random() * 30;
        this.maxLife = this.life;
        this.color = color || '#666666'; // Default gray, or custom color for damage
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += 0.3;
        this.life--;
    }
    
    draw(ctx) {
        if (this.size <= 0 || this.life <= 0) return;
        // Fumaça mantém estilo suave (não pixel art)
        const alpha = Math.max(0, (this.life / this.maxLife) * 0.4);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Enhanced Muzzle Flash with pixel art style (OPTIMIZED)
class EnhancedMuzzleFlash {
    constructor(x, y, direction, intensity = 1) {
        this.x = x;
        this.y = y;
        this.life = 4; // Reduzido
        this.maxLife = 4;
        this.intensity = Math.min(intensity, 1.5);
        this.size = 10 + Math.random() * 6 * intensity;
    }
    
    update() { this.life--; }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        const px = Math.floor(this.x / PIXEL_SCALE);
        const py = Math.floor(this.y / PIXEL_SCALE);
        const alpha = Math.max(0, (this.life / this.maxLife) * this.intensity);
        const ps = Math.max(2, Math.floor(this.size / PIXEL_SCALE * (this.life / this.maxLife)));
        
        ctx.globalAlpha = alpha;
        
        // Glow simples (rect)
        if (GLOW_CONFIG.enabled) {
            const gx = (px - ps) * PIXEL_SCALE;
            const gy = (py - ps) * PIXEL_SCALE;
            const gs = ps * 2 * PIXEL_SCALE;
            drawWithGlow(ctx, gx, gy, gs, gs, '#ff6600', alpha);
        }
        
        // Cruz de flash simplificada
        drawPixelFill(ctx, px - ps, py - 1, ps * 2, 2, '#ffff00');
        drawPixelFill(ctx, px - 1, py - ps, 2, ps * 2, '#ffff00');
        
        // Centro branco
        drawPixelFill(ctx, px - 1, py - 1, 2, 2, '#ffffff');
        
        ctx.globalAlpha = 1;
    }
}

// Object Pool for better performance
class ParticlePool {
    constructor(maxSize = 200) {
        this.pool = [];
        this.maxSize = maxSize;
    }
    
    get(x, y, color, size, speedMult, gravity) {
        let particle;
        
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].life <= 0) {
                particle = this.pool[i];
                particle.reset(x, y, color, size, speedMult, gravity);
                return particle;
            }
        }
        
        if (this.pool.length < this.maxSize) {
            particle = new PooledParticle(x, y, color, size, speedMult, gravity);
            this.pool.push(particle);
            return particle;
        }
        
        return null;
    }
    
    update() {
        this.pool.forEach(p => {
            if (p.life > 0) p.update();
        });
    }
    
    draw(ctx) {
        this.pool.forEach(p => {
            if (p.life > 0) p.draw(ctx);
        });
    }
    
    getActiveCount() {
        return this.pool.filter(p => p.life > 0).length;
    }
}

class PooledParticle {
    constructor(x, y, color, size, speedMult, gravity) {
        this.reset(x, y, color, size, speedMult, gravity);
    }
    
    reset(x, y, color, size, speedMult = 1, gravity = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size || (Math.random() * 6 + 3);
        this.vx = (Math.random() - 0.5) * 8 * speedMult;
        this.vy = (Math.random() - 0.5) * 8 * speedMult - 2;
        this.life = 40 + Math.random() * 20;
        this.maxLife = this.life;
        this.gravity = gravity;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.life -= 1;
        this.rotation += this.rotationSpeed;
        this.size = Math.max(0.1, this.size * 0.97);
    }
    
    draw(ctx) {
        if (this.size <= 0 || this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// Global particle pool instance
const particlePool = new ParticlePool(300);
