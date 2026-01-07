// ============ SPRITES.JS - ARQUIVO PRINCIPAL ============
// Este arquivo complementa os módulos em js/sprites/
// Contém apenas o que NÃO está nos módulos

// NOTA: Os módulos em js/sprites/ devem ser carregados ANTES deste arquivo:
// - core.js (PIXEL_SCALE, renderSpriteTemplate, mirrorTemplate)
// - soldier.js (SOLDIER_PALETTES, SOLDIER_TEMPLATES, getSoldierTemplate, drawHumanSoldier)
// - vehicles.js (tank, jeep, truck templates e funções)
// - aircraft.js (plane, chopper, jetpack, turret)
// - naval.js (ship, submarine, torpedo)
// - enemies.js (tower, boss, snow soldier, generator, fire trail)
// - objects.js (mines, barriers, powerup crates, pixel helpers)

// ============ CONSTANTE GLOBAL PIXEL_SCALE ============
// Definida aqui caso os módulos não sejam carregados
if (typeof PIXEL_SCALE === 'undefined') {
    const PIXEL_SCALE = 2;
}

// ============ FUNÇÕES AUXILIARES (caso não existam) ============
if (typeof renderSpriteTemplate === 'undefined') {
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
}

if (typeof mirrorTemplate === 'undefined') {
    function mirrorTemplate(template) {
        return template.map(row => [...row].reverse());
    }
}

// ============ Este arquivo está vazio pois tudo está nos módulos ============
// Se você ver erros de "não definido", verifique se os módulos estão sendo carregados
// na ordem correta no HTML antes deste arquivo.

console.log('✅ sprites.js carregado (módulos em js/sprites/)');
