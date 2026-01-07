// ============ SPRITE CORE - FUNÇÕES E CONSTANTES BASE ============
// Sistema de Pixel Art estilo Metal Slug
// - Templates de pixel art de alta qualidade
// - Contornos pretos definidos
// - Paleta limitada por entidade
// - Animações por frame (idle, walk, etc)
// - Sem anti-aliasing (pixels definidos)

// PIXEL_SCALE já está definido em config.js

// Renderiza um template com paleta de cores
function renderSpriteTemplate(ctx, template, palette, x, y, scale) {
    if (!template) return;
    const s = scale || PIXEL_SCALE;
    for (let py = 0; py < template.length; py++) {
        const row = template[py];
        for (let px = 0; px < row.length; px++) {
            const colorIndex = row[px];
            if (colorIndex > 0 && palette[colorIndex]) {
                ctx.fillStyle = palette[colorIndex];
                ctx.fillRect(x + px * s, y + py * s, s, s);
            }
        }
    }
}

// Espelha template horizontalmente
function mirrorTemplate(template) {
    return template.map(row => [...row].reverse());
}
