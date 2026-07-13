// ============ SPRITE CORE - FUNÇÕES E CONSTANTES BASE ============
// Sistema de Pixel Art estilo Metal Slug
// - Templates de pixel art de alta qualidade
// - Contornos pretos definidos
// - Paleta limitada por entidade
// - Animações por frame (idle, walk, etc)
// - Sem anti-aliasing (pixels definidos)

// PIXEL_SCALE já está definido em config.js

// Cache de sprites pré-renderizados: template -> palette -> scale -> canvas.
// WeakMaps permitem que paletas temporárias (ex: flash) sejam coletadas pelo GC.
const SPRITE_CACHE = new WeakMap();

function getCachedSprite(template, palette, s) {
    let byPalette = SPRITE_CACHE.get(template);
    if (!byPalette) {
        byPalette = new WeakMap();
        SPRITE_CACHE.set(template, byPalette);
    }
    let byScale = byPalette.get(palette);
    if (!byScale) {
        byScale = new Map();
        byPalette.set(palette, byScale);
    }
    let canvas = byScale.get(s);
    if (!canvas) {
        let maxW = 0;
        for (const row of template) maxW = Math.max(maxW, row.length);
        canvas = document.createElement('canvas');
        canvas.width = Math.max(1, maxW * s);
        canvas.height = Math.max(1, template.length * s);
        const cctx = canvas.getContext('2d');
        for (let py = 0; py < template.length; py++) {
            const row = template[py];
            for (let px = 0; px < row.length; px++) {
                const colorIndex = row[px];
                if (colorIndex > 0 && palette[colorIndex]) {
                    cctx.fillStyle = palette[colorIndex];
                    cctx.fillRect(px * s, py * s, s, s);
                }
            }
        }
        byScale.set(s, canvas);
    }
    return canvas;
}

// Renderiza um template com paleta de cores (via cache offscreen — 1 drawImage por sprite).
// Coordenadas arredondadas: mantém o pixel art nítido e evita filtragem bilinear (lenta).
function renderSpriteTemplate(ctx, template, palette, x, y, scale) {
    if (!template) return;
    const s = scale || PIXEL_SCALE;
    ctx.drawImage(getCachedSprite(template, palette, s), Math.round(x), Math.round(y));
}

// Espelha template horizontalmente
function mirrorTemplate(template) {
    return template.map(row => [...row].reverse());
}
