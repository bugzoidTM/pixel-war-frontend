// ============================================================
// GAME-HELPERS.JS - Funções auxiliares do jogo
// ============================================================
// Este arquivo contém funções que NÃO foram modularizadas.
// 
// CONTEÚDO ATUAL:
//   - Generators: generateMines(), generateGrenades(), generateDecorations()
//   - drawBackground() - router principal de cenários
//   - OCEANO ESTILO ZELDA (drawOceanBackground, drawArcticOceanBackground)
//   - SKY FORTRESS BACKGROUND (drawSkyFortressBackground, etc.)
//
// As seguintes funções foram movidas para módulos separados:
//   - js/systems/input.js (input handling)
//   - js/systems/pause.js (pause system)
//   - js/systems/powerups.js (powerup system)
//   - js/systems/helpers.js (screen shake, explosions, indicators)
//   - js/systems/ui-controls.js (sound, volume, UI)
//   - js/phases/phase3-train.js (train phase backgrounds)
//   - js/phases/phase3-backgrounds.js (convoy, aerial, river)
//   - js/phases/phase7-winter.js (winter storm)
//   - js/phases/phase9-shmup.js (vertical shooter)
//   - js/phases/phase10-escape.js (escape chase)
//   - js/phases/phase11-escaperoute.js (jeep racing)
// ============================================================

// ============ GENERATORS & BACKGROUND ============
// Estas funcoes sao unicas deste arquivo e nao foram modularizadas

// Gera minas terrestres aleatorias (apenas para tanque)
function generateMines() {
    mines = [];
    
    // SÃ³ gera minas se o jogador for tanque
    if (selectedClass !== 'tank') return;
    
    const lvl = levels[currentLevelIndex];
    
    // NÃ£o gera minas na fase do boss (muito difÃ­cil)
    if (lvl.type === 'boss') return;
    
    // Quantidade de minas baseada na fase
    const mineCount = 5 + currentLevelIndex * 2; // 5, 7, 9, 11...
    
    // Ãrea segura ao redor do spawn do jogador
    const safeZoneX = canvas.width / 2;
    const safeZoneY = canvas.height - 100;
    const safeRadius = 120;
    
    for (let i = 0; i < mineCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let mx, my;
        
        while (!validPosition && attempts < 50) {
            mx = Math.random() * (canvas.width - 40) + 20;
            my = Math.random() * (canvas.height - 150) + 50; // Evita spawn muito embaixo
            
            // Verificar distÃ¢ncia do spawn do jogador
            const distToSpawn = Math.sqrt((mx - safeZoneX) ** 2 + (my - safeZoneY) ** 2);
            
            if (distToSpawn > safeRadius) {
                // Verificar sobreposiÃ§Ã£o com outras minas
                validPosition = true;
                for (const mine of mines) {
                    const distToMine = Math.sqrt((mx - mine.x) ** 2 + (my - mine.y) ** 2);
                    if (distToMine < 50) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            mines.push(new Mine(mx, my));
        }
    }
    
    console.log('ðŸ’£ Minas geradas para tanque:', mines.length);
}

// Gera granadas no chÃ£o (apenas para soldado)
function generateGrenades() {
    grenades = [];
    
    // SÃ³ gera granadas se o jogador for soldado
    if (selectedClass !== 'soldier') return;
    
    const lvl = levels[currentLevelIndex];
    
    // NÃ£o gera granadas em fases especiais
    if (lvl.type === 'boss' || lvl.type === 'train' || lvl.type === 'escape' || lvl.type === 'shmup' || lvl.type === 'winter' || lvl.type === 'skyfortress') return;
    
    // Quantidade de granadas baseada na fase
    const grenadeCount = 3 + currentLevelIndex; // 3, 4, 5, 6...
    
    // Ãrea segura ao redor do spawn do jogador
    const safeZoneX = canvas.width / 2;
    const safeZoneY = canvas.height - 100;
    const safeRadius = 100;
    
    for (let i = 0; i < grenadeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let gx, gy;
        
        while (!validPosition && attempts < 50) {
            gx = Math.random() * (canvas.width - 60) + 30;
            gy = Math.random() * (canvas.height - 180) + 60;
            
            // Verificar distÃ¢ncia do spawn do jogador
            const distToSpawn = Math.sqrt((gx - safeZoneX) ** 2 + (gy - safeZoneY) ** 2);
            
            if (distToSpawn > safeRadius) {
                // Verificar sobreposiÃ§Ã£o com outras granadas
                validPosition = true;
                for (const grenade of grenades) {
                    const distToGrenade = Math.sqrt((gx - grenade.x) ** 2 + (gy - grenade.y) ** 2);
                    if (distToGrenade < 60) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            grenades.push(new Grenade(gx, gy));
        }
    }
    
    console.log('ðŸ’£ Granadas geradas para soldado:', grenades.length);
}

function generateDecorations() {
    decorations = [];
    const lvl = levels[currentLevelIndex];
    
    // Navio: ambiente oceano sem decorações terrestres
    if (selectedClass === 'ship') {
        // Apenas algumas "ilhas" distantes ou bóias (opcional)
        for (let i = 0; i < 3; i++) {
            decorations.push(new Decoration(Math.random() * canvas.width, Math.random() * canvas.height, 'barrel'));
        }
        return;
    }
    
    // Sky Fortress: sem decorações terrestres (estamos no céu!)
    if (lvl.type === 'skyfortress') {
        return;
    }
    
    // Shmup: sem decorações terrestres (fase aérea vertical)
    if (lvl.type === 'shmup') {
        return;
    }
    
    // Escape: sem decorações terrestres (fuga do mega tank)
    if (lvl.type === 'escape') {
        return;
    }
    
    if (lvl.bg !== '#1a5276' && lvl.bg !== '#1a1a1a') {
        for (let i = 0; i < 8; i++) {
            decorations.push(new Decoration(Math.random() * canvas.width, Math.random() * canvas.height, 'tree'));
        }
    }
    
    if (lvl.type !== 'kill_static') {
        for (let i = 0; i < 12; i++) {
            decorations.push(new Decoration(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() > 0.5 ? 'crate' : 'rock'));
        }
    } else {
        for (let i = 0; i < 8; i++) {
            decorations.push(new Decoration(Math.random() * canvas.width, Math.random() * canvas.height, 'rock'));
        }
    }
    
    for (let i = 0; i < 5; i++) {
        decorations.push(new Decoration(Math.random() * canvas.width, Math.random() * canvas.height, 'crater'));
    }
}

// ============ PARALLAX BACKGROUND SYSTEM (OPTIMIZED) ============
// Sistema de fundo com 3 camadas - otimizado para performance

const PARALLAX_CONFIG = {
    enabled: true,
    skySpeed: 0.05,
    midSpeed: 0.3,
    foregroundSpeed: 1.0,
    baseScrollSpeed: 0.4,
    // Skip de frames para elementos não essenciais
    updateEveryNFrames: 2
};

let parallaxScrollX = 0;
let parallaxFrameSkip = 0;

// Temas simplificados
const PARALLAX_THEMES = {
    default: {
        sky: { color1: '#1a1a2e', color2: '#16213e', hasStars: true },
        mid: { type: 'mountains', color: '#2a2a4a', count: 3 },
        foreground: { type: 'vegetation', color: '#1a3a1a', count: 5 }
    },
    forest: {
        sky: { color1: '#87CEEB', color2: '#4a90a8', hasClouds: true },
        mid: { type: 'mountains', color: '#2d5a2d', count: 4 },
        foreground: { type: 'trees', color: '#1a4a1a', count: 6 }
    },
    urban: {
        sky: { color1: '#2a1a1a', color2: '#1a1a1a', hasSmoke: true },
        mid: { type: 'buildings', color: '#3a3a3a', count: 4 },
        foreground: { type: 'rubble', color: '#2a2a2a', count: 5 }
    },
    desert: {
        sky: { color1: '#d4a574', color2: '#8a6a4a' },
        mid: { type: 'dunes', color: '#9a7a5a', count: 3 },
        foreground: { type: 'rocks', color: '#6a5a4a', count: 4 }
    },
    night: {
        sky: { color1: '#0a0a1a', color2: '#1a1a2a', hasStars: true, hasMoon: true },
        mid: { type: 'mountains', color: '#1a1a2a', count: 3 },
        foreground: { type: 'trees', color: '#0a1a0a', count: 5 }
    },
    war: {
        sky: { color1: '#4a2020', color2: '#2a1515', hasSmoke: true, hasFire: true },
        mid: { type: 'ruins', color: '#3a2525', count: 4 },
        foreground: { type: 'barricades', color: '#4a3525', count: 5 }
    }
};

function updateParallaxScroll() {
    parallaxFrameSkip++;
    if (parallaxFrameSkip % PARALLAX_CONFIG.updateEveryNFrames !== 0) return;
    
    if (typeof player !== 'undefined' && player.isMoving) {
        parallaxScrollX += PARALLAX_CONFIG.baseScrollSpeed * 2;
    } else {
        parallaxScrollX += PARALLAX_CONFIG.baseScrollSpeed * 0.2;
    }
}

function drawParallaxBackground(theme = 'default', groundColor = null) {
    if (!PARALLAX_CONFIG.enabled) return;

    const config = PARALLAX_THEMES[theme] || PARALLAX_THEMES.default;
    updateParallaxScroll();

    // CAMADA 1: Céu (simplificado)
    drawParallaxSky(config.sky);

    // CAMADA 2: Meio (montanhas/prédios) - todo frame para evitar flicker
    drawParallaxMidLayer(config.mid);

    // CAMADA 2.5: Chão - cobre do horizonte até a base da tela
    // (sem isso a área entre o céu e o rodapé fica preta)
    if (groundColor) {
        drawParallaxGround(groundColor);
    }

    // CAMADA 3: Frente (desenhada sobre o chão)
    drawParallaxForeground(config.foreground);
}

function drawParallaxGround(groundColor) {
    const horizonY = Math.floor(canvas.height * 0.55);

    const gradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    gradient.addColorStop(0, adjustColor(groundColor, 22));
    gradient.addColorStop(0.55, groundColor);
    gradient.addColorStop(1, adjustColor(groundColor, -35));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

    // Linha de horizonte sutil (transição céu/chão)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, horizonY, canvas.width, 2);

    // Padrão de checkerboard sutil no chão (dá textura sem poluir)
    if (groundColor !== '#1a1a1a') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
        for (let x = 0; x < canvas.width; x += 50) {
            for (let y = horizonY - (horizonY % 50); y < canvas.height; y += 50) {
                if ((x + y) % 100 === 0) {
                    ctx.fillRect(x, Math.max(y, horizonY), 50, Math.min(50, canvas.height - y));
                }
            }
        }
    }
}

function drawParallaxSky(skyConfig) {
    const scrollOffset = parallaxScrollX * PARALLAX_CONFIG.skySpeed;
    
    // Gradiente base do céu
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    gradient.addColorStop(0, skyConfig.color1);
    gradient.addColorStop(1, skyConfig.color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    // Estrelas simplificadas (rects em vez de cálculos por frame)
    if (skyConfig.hasStars) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 25; i++) {
            const sx = ((i * 73 + 12345) % canvas.width + scrollOffset * 0.02) % canvas.width;
            const sy = ((i * 137) % (canvas.height * 0.35));
            ctx.globalAlpha = 0.5 + (i % 3) * 0.2;
            ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = 1;
    }
    
    // Lua simplificada (rect arredondado simulado)
    if (skyConfig.hasMoon) {
        const moonX = canvas.width * 0.8;
        ctx.fillStyle = '#e8e8d0';
        ctx.fillRect(moonX - 25, 55, 50, 50);
        ctx.fillStyle = '#d0d0c0';
        ctx.fillRect(moonX - 15, 65, 15, 15);
        ctx.fillRect(moonX + 5, 80, 10, 10);
    }
    
    // Fumaça simplificada (rects)
    if (skyConfig.hasSmoke) {
        ctx.fillStyle = 'rgba(40, 30, 30, 0.3)';
        const smokeOffset = (scrollOffset * 0.15) % 300;
        for (let i = 0; i < 3; i++) {
            const sx = ((i * 280 + smokeOffset) % (canvas.width + 100)) - 50;
            ctx.fillRect(sx, 20 + i * 25, 80, 40);
            ctx.fillRect(sx + 50, 30 + i * 25, 60, 30);
        }
    }
    
    // Nuvens para céu diurno
    if (skyConfig.hasClouds) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const cloudOffset = (scrollOffset * 0.08) % 400;
        for (let i = 0; i < 4; i++) {
            const cx = ((i * 250 + cloudOffset) % (canvas.width + 150)) - 75;
            const cy = 30 + (i * 47 % 60);
            // Nuvem composta de rects
            ctx.fillRect(cx, cy, 60, 25);
            ctx.fillRect(cx + 15, cy - 10, 40, 20);
            ctx.fillRect(cx + 40, cy + 5, 35, 20);
        }
    }
    
    // Fogo/explosões no horizonte (zona de guerra)
    if (skyConfig.hasFire) {
        const fireOffset = frameCount * 0.5;
        for (let i = 0; i < 5; i++) {
            const fx = (i * 200 + 50) % canvas.width;
            const fy = canvas.height * 0.35 + Math.sin(fireOffset + i * 2) * 10;
            const flicker = Math.sin(frameCount * 0.3 + i) * 0.3 + 0.7;
            
            // Brilho laranja
            ctx.fillStyle = `rgba(255, 120, 30, ${0.3 * flicker})`;
            ctx.fillRect(fx - 20, fy - 30, 40, 40);
            
            // Chama central
            ctx.fillStyle = `rgba(255, 80, 20, ${0.5 * flicker})`;
            ctx.fillRect(fx - 10, fy - 20, 20, 25);
            
            // Núcleo amarelo
            ctx.fillStyle = `rgba(255, 200, 50, ${0.6 * flicker})`;
            ctx.fillRect(fx - 5, fy - 10, 10, 15);
        }
    }
}

function drawParallaxMidLayer(midConfig) {
    const scrollOffset = parallaxScrollX * PARALLAX_CONFIG.midSpeed;
    const baseY = canvas.height * 0.4;
    
    switch (midConfig.type) {
        case 'mountains':
            drawParallaxMountains(scrollOffset, baseY, midConfig.color, midConfig.count);
            break;
        case 'buildings':
            drawParallaxBuildings(scrollOffset, baseY, midConfig.color, midConfig.count);
            break;
        case 'dunes':
            drawParallaxDunes(scrollOffset, baseY, midConfig.color, midConfig.count);
            break;
        case 'ruins':
            drawParallaxRuins(scrollOffset, baseY, midConfig.color, midConfig.count);
            break;
        default:
            drawParallaxMountains(scrollOffset, baseY, midConfig.color, midConfig.count);
    }
}

function drawParallaxMountains(offset, baseY, color, count) {
    const spacing = canvas.width / count + 100;
    ctx.fillStyle = color;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        const height = 100 + (i % 3) * 40;
        
        ctx.beginPath();
        ctx.moveTo(x, baseY + 100);
        ctx.lineTo(x + spacing * 0.3, baseY + 100 - height);
        ctx.lineTo(x + spacing * 0.5, baseY + 100 - height + 30);
        ctx.lineTo(x + spacing * 0.7, baseY + 100 - height - 20);
        ctx.lineTo(x + spacing, baseY + 100);
        ctx.fill();
    }
    
    // Camada de montanhas mais escuras na frente
    ctx.fillStyle = adjustColor(color, -20);
    for (let i = 0; i < count + 1; i++) {
        const x = ((i * spacing * 1.2 - offset * 1.3) % (spacing * (count + 1))) - spacing;
        const height = 70 + (i % 2) * 30;
        
        ctx.beginPath();
        ctx.moveTo(x, baseY + 120);
        ctx.lineTo(x + spacing * 0.4, baseY + 120 - height);
        ctx.lineTo(x + spacing * 0.8, baseY + 120);
        ctx.fill();
    }
}

function drawParallaxBuildings(offset, baseY, color, count) {
    const spacing = canvas.width / count + 50;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        const height = 80 + (i * 37 % 100);
        const width = 40 + (i * 23 % 30);
        
        // Prédio base
        ctx.fillStyle = color;
        ctx.fillRect(x, baseY + 150 - height, width, height);
        
        // Janelas
        ctx.fillStyle = Math.random() > 0.7 ? '#ffcc44' : '#1a1a2a';
        for (let wy = baseY + 160 - height; wy < baseY + 140; wy += 15) {
            for (let wx = x + 5; wx < x + width - 8; wx += 12) {
                ctx.fillRect(wx, wy, 6, 8);
            }
        }
        
        // Topo
        ctx.fillStyle = adjustColor(color, -15);
        ctx.fillRect(x + width * 0.2, baseY + 150 - height - 15, width * 0.6, 15);
    }
}

function drawParallaxDunes(offset, baseY, color, count) {
    const spacing = canvas.width / count + 150;
    ctx.fillStyle = color;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        
        ctx.beginPath();
        ctx.moveTo(x, baseY + 120);
        ctx.quadraticCurveTo(x + spacing * 0.5, baseY + 30, x + spacing, baseY + 120);
        ctx.fill();
    }
}

function drawParallaxRuins(offset, baseY, color, count) {
    const spacing = canvas.width / count + 80;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        const height = 60 + (i * 47 % 80);
        
        // Ruína irregular
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, baseY + 150);
        ctx.lineTo(x, baseY + 150 - height * 0.7);
        ctx.lineTo(x + 15, baseY + 150 - height);
        ctx.lineTo(x + 25, baseY + 150 - height * 0.6);
        ctx.lineTo(x + 40, baseY + 150 - height * 0.8);
        ctx.lineTo(x + 50, baseY + 150);
        ctx.fill();
        
        // Detalhes de destruição
        ctx.fillStyle = adjustColor(color, -25);
        ctx.fillRect(x + 10, baseY + 140, 8, 10);
        ctx.fillRect(x + 30, baseY + 130, 6, 20);
    }
}

function drawParallaxForeground(fgConfig) {
    const scrollOffset = parallaxScrollX * PARALLAX_CONFIG.foregroundSpeed;
    const baseY = canvas.height - 60;
    
    switch (fgConfig.type) {
        case 'vegetation':
            drawParallaxVegetation(scrollOffset, baseY, fgConfig.color, fgConfig.count);
            break;
        case 'rubble':
            drawParallaxRubble(scrollOffset, baseY, fgConfig.color, fgConfig.count);
            break;
        case 'rocks':
            drawParallaxRocks(scrollOffset, baseY, fgConfig.color, fgConfig.count);
            break;
        case 'trees':
            drawParallaxTrees(scrollOffset, baseY, fgConfig.color, fgConfig.count);
            break;
        case 'barricades':
            drawParallaxBarricades(scrollOffset, baseY, fgConfig.color, fgConfig.count);
            break;
        default:
            drawParallaxVegetation(scrollOffset, baseY, fgConfig.color, fgConfig.count);
    }
}

function drawParallaxVegetation(offset, baseY, color, count) {
    const spacing = canvas.width / count + 30;
    
    for (let i = 0; i < count + 3; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 2))) - spacing;
        
        // Moita/arbusto simplificado (rects ao invés de arcs)
        ctx.fillStyle = color;
        ctx.fillRect(x - 12, baseY - 12, 24, 20);
        ctx.fillRect(x + 4, baseY - 16, 18, 20);
        ctx.fillRect(x + 14, baseY - 8, 14, 16);
        
        // Highlight
        ctx.fillStyle = adjustColor(color, 20);
        ctx.fillRect(x + 2, baseY - 12, 8, 6);
    }
    
    // Grama na borda inferior (a cada 12px ao invés de 8)
    ctx.fillStyle = adjustColor(color, -10);
    for (let gx = 0; gx < canvas.width; gx += 12) {
        const grassHeight = 5 + ((gx + offset) % 4) * 2;
        ctx.fillRect(gx, canvas.height - grassHeight, 4, grassHeight);
    }
}

function drawParallaxRubble(offset, baseY, color, count) {
    const spacing = canvas.width / count + 40;
    
    for (let i = 0; i < count + 3; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 2))) - spacing;
        
        // Pilha de escombros
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, baseY + 10);
        ctx.lineTo(x + 5, baseY - 5);
        ctx.lineTo(x + 15, baseY);
        ctx.lineTo(x + 25, baseY - 10);
        ctx.lineTo(x + 35, baseY + 10);
        ctx.fill();
        
        // Pedras individuais
        ctx.fillStyle = adjustColor(color, 15);
        ctx.fillRect(x + 8, baseY - 2, 6, 6);
        ctx.fillRect(x + 20, baseY + 2, 4, 4);
    }
}

function drawParallaxRocks(offset, baseY, color, count) {
    const spacing = canvas.width / count + 60;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        const size = 15 + (i * 17 % 15);
        
        // Rocha
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, baseY + 5);
        ctx.lineTo(x + size * 0.3, baseY - size);
        ctx.lineTo(x + size * 0.7, baseY - size * 0.8);
        ctx.lineTo(x + size, baseY + 5);
        ctx.fill();
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + size * 0.5, baseY + 8, size * 0.6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawParallaxTrees(offset, baseY, color, count) {
    const spacing = canvas.width / count + 50;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        const height = 40 + (i * 23 % 30);
        
        // Tronco
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(x + 8, baseY - 15, 8, 20);
        
        // Copa (triângulos sobrepostos)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, baseY - 15);
        ctx.lineTo(x + 12, baseY - height);
        ctx.lineTo(x + 24, baseY - 15);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 3, baseY - 30);
        ctx.lineTo(x + 12, baseY - height - 15);
        ctx.lineTo(x + 21, baseY - 30);
        ctx.fill();
    }
}

function drawParallaxBarricades(offset, baseY, color, count) {
    const spacing = canvas.width / count + 45;
    
    for (let i = 0; i < count + 2; i++) {
        const x = ((i * spacing - offset) % (spacing * (count + 1))) - spacing;
        
        // Sacos de areia
        ctx.fillStyle = color;
        ctx.fillRect(x, baseY - 15, 30, 20);
        ctx.fillRect(x + 5, baseY - 30, 20, 15);
        
        // Textura
        ctx.fillStyle = adjustColor(color, -15);
        ctx.fillRect(x + 2, baseY - 12, 26, 2);
        ctx.fillRect(x + 7, baseY - 27, 16, 2);
        
        // Cerca de arame (ocasional)
        if (i % 2 === 0) {
            ctx.strokeStyle = '#4a4a4a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 35, baseY + 5);
            ctx.lineTo(x + 35, baseY - 25);
            ctx.stroke();
            
            // Arame farpado
            ctx.strokeStyle = '#3a3a3a';
            ctx.lineWidth = 1;
            for (let wy = baseY - 5; wy > baseY - 25; wy -= 8) {
                ctx.beginPath();
                ctx.moveTo(x + 30, wy);
                ctx.lineTo(x + 40, wy - 3);
                ctx.stroke();
            }
        }
    }
}

// Função auxiliar para ajustar cor
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Determina o tema de parallax baseado no nível
function getParallaxTheme() {
    if (typeof levels === 'undefined' || typeof currentLevelIndex === 'undefined') return 'default';
    
    const lvl = levels[currentLevelIndex];
    if (!lvl) return 'default';
    
    // Fase 1: Floresta diurna (campo de batalha)
    if (lvl.id === 1) return 'forest';
    
    // Fase 2: Urbano (destruir torres)
    if (lvl.type === 'kill_static') return 'urban';
    
    // Fase 3: Zona de guerra caótica (sobrevivência)
    if (lvl.type === 'survival') return 'war';
    
    // Fase 5: Boss noturno
    if (lvl.bg === '#1a1a1a' || lvl.type === 'boss') return 'night';
    
    // Outros mapeamentos
    if (lvl.bg === '#2d4a2d' || lvl.bg === '#3c5a3c') return 'default';
    if (lvl.bg === '#4a3c2a' || lvl.bg === '#5a4a3a') return 'desert';
    if (lvl.bg === '#3a2a2a' || lvl.bg === '#4a3030') return 'war';
    
    return 'default';
}

function drawBackground() {
    const lvl = levels[currentLevelIndex];
    // Usar background adaptado (oceano para navio)
    const bgColor = typeof getAdaptedBackground === 'function' ? getAdaptedBackground() : lvl.bg;
    
    // Ambiente oceano (navio) - estilo Zelda: Link's Awakening
    if (selectedClass === 'ship') {
        if (lvl.type === 'winter') {
            drawArcticOceanBackground(); // Mar gelado/branco
        } else {
            drawOceanBackground();
        }
    } else if (lvl.type === 'train') {
        // Fase do trem - cenÃ¡rio especial
        drawTrainBackground();
    } else if (lvl.type === 'winter') {
        // Fase Winter Storm - base Ã¡rtica
        drawWinterBackground();
    } else if (lvl.type === 'skyfortress') {
        // Fase Sky Fortress - elevador da morte
        drawSkyFortressBackground();
    } else if (lvl.type === 'shmup') {
        // Fase Vertical Shmup - estilo 1942/River Raid
        drawShmupBackground();
    } else if (lvl.type === 'escape') {
        // Fase A Fuga - Crash Bandicoot style chase
        drawEscapeBackground();
    } else {
        // Background padrão com PARALLAX para profundidade
        const theme = getParallaxTheme();

        // Desenhar camadas de parallax (céu, montanhas, chão e vegetação)
        drawParallaxBackground(theme, bgColor);
    }
}

// ============ OCEANO ESTILO ZELDA ============

// Paleta de cores do oceano (3 tons)
const OCEAN_COLORS = {
    deep: '#0a3a5a',      // Azul profundo
    base: '#1a5a7a',      // Azul mÃ©dio
    light: '#2a7a9a',     // Azul claro
    highlight: '#4a9aba', // Highlight das ondas
    foam: '#8ac4d4',      // Espuma clara
    foamWhite: '#c4e4f4'  // Espuma branca
};

// Paleta do oceano Ã¡rtico (mais branco/gelado)
const ARCTIC_OCEAN_COLORS = {
    deep: '#5a7a8a',      // Azul-cinza profundo
    base: '#8aaaba',      // Azul-gelo claro
    light: '#a0c0d0',     // Azul bem claro
    highlight: '#c0e0f0', // Quase branco
    foam: '#d8f0f8',      // Espuma gelada
    foamWhite: '#f0f8ff', // Branco gelo
    ice: '#e8f4fc'        // Placas de gelo
};

function drawArcticOceanBackground() {
    const colors = ARCTIC_OCEAN_COLORS;
    
    // Base do oceano gelado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.5, colors.base);
    gradient.addColorStop(1, colors.deep);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ondas Ã¡rticas (mais lentas)
    drawArcticWaveTiles();
    
    // Placas de gelo flutuantes
    drawIceFloes();
    
    // Espuma gelada
    drawArcticFoam();
    
    // Neblina Ã¡rtica sutil
    ctx.fillStyle = 'rgba(200, 220, 240, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawArcticWaveTiles() {
    const colors = ARCTIC_OCEAN_COLORS;
    const tileSize = 16 * PIXEL_SCALE;
    const animFrame = Math.floor(frameCount / 12) % 4; // Mais lento que oceano normal
    
    // Offset diagonal mais lento (mar gelado)
    const diagonalOffset = Math.floor(frameCount / 6) % tileSize;
    
    for (let x = -tileSize; x < canvas.width + tileSize; x += tileSize) {
        for (let y = -tileSize; y < canvas.height + tileSize; y += tileSize) {
            const drawX = x + diagonalOffset;
            const drawY = y + diagonalOffset;
            const isAlt = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0);
            
            drawArcticWaveTile(drawX, drawY, tileSize, animFrame, isAlt);
        }
    }
}

function drawArcticWaveTile(x, y, size, frame, isAlt) {
    const colors = ARCTIC_OCEAN_COLORS;
    const halfSize = size / 2;
    const quarterSize = size / 4;
    const wavePhase = (frame + (isAlt ? 2 : 0)) % 4;
    
    // Ondas mais claras/brancas
    ctx.fillStyle = colors.highlight;
    
    switch(wavePhase) {
        case 0:
            ctx.fillRect(x, y, halfSize, quarterSize);
            ctx.fillRect(x, y, quarterSize, halfSize);
            break;
        case 1:
            ctx.fillRect(x + quarterSize, y + quarterSize, halfSize, quarterSize);
            ctx.fillRect(x + halfSize, y, quarterSize, halfSize);
            break;
        case 2:
            ctx.fillRect(x + halfSize, y + halfSize, halfSize, quarterSize);
            ctx.fillRect(x + halfSize + quarterSize, y + quarterSize, quarterSize, halfSize);
            break;
        case 3:
            ctx.fillRect(x + quarterSize, y + halfSize + quarterSize, halfSize, quarterSize);
            ctx.fillRect(x, y + halfSize, quarterSize, halfSize);
            break;
    }
    
    // Brilho mais intenso (gelo)
    ctx.fillStyle = colors.foamWhite;
    const highlightX = x + (wavePhase * quarterSize) % size;
    const highlightY = y + ((wavePhase + (isAlt ? 1 : 0)) * quarterSize) % size;
    ctx.fillRect(highlightX, highlightY, quarterSize / 2, quarterSize / 2);
}

function drawIceFloes() {
    const colors = ARCTIC_OCEAN_COLORS;
    const px = PIXEL_SCALE;
    
    // Placas de gelo estÃ¡ticas (baseadas em posiÃ§Ãµes pseudo-aleatÃ³rias)
    const icePositions = [
        { x: 50, y: 80, w: 60, h: 35 },
        { x: 200, y: 200, w: 45, h: 30 },
        { x: 400, y: 120, w: 70, h: 40 },
        { x: 600, y: 300, w: 55, h: 35 },
        { x: 750, y: 180, w: 50, h: 28 },
        { x: 100, y: 450, w: 65, h: 38 },
        { x: 500, y: 500, w: 48, h: 32 },
        { x: 300, y: 380, w: 58, h: 36 }
    ];
    
    icePositions.forEach(ice => {
        // Movimento sutil
        const offsetX = Math.sin(frameCount * 0.01 + ice.x) * 3;
        const offsetY = Math.cos(frameCount * 0.008 + ice.y) * 2;
        
        // Sombra da placa
        ctx.fillStyle = 'rgba(50, 80, 100, 0.3)';
        ctx.fillRect(ice.x + offsetX + 3, ice.y + offsetY + 3, ice.w, ice.h);
        
        // Placa de gelo
        ctx.fillStyle = colors.ice;
        ctx.fillRect(ice.x + offsetX, ice.y + offsetY, ice.w, ice.h);
        
        // Brilho no topo
        ctx.fillStyle = colors.foamWhite;
        ctx.fillRect(ice.x + offsetX + 2, ice.y + offsetY + 2, ice.w - 6, 4 * px);
        
        // Detalhe de rachadura
        ctx.fillStyle = colors.light;
        ctx.fillRect(ice.x + offsetX + ice.w / 3, ice.y + offsetY + 5, 2, ice.h - 10);
    });
}

function drawArcticFoam() {
    const colors = ARCTIC_OCEAN_COLORS;
    const foamWidth = 10 * PIXEL_SCALE;
    const animOffset = Math.floor(frameCount / 15) % 3;
    
    ctx.fillStyle = colors.foam;
    
    // Espuma nas bordas
    for (let x = 0; x < canvas.width; x += foamWidth) {
        const yOffset = Math.sin(x * 0.05 + frameCount * 0.03) * 3;
        ctx.fillRect(x, yOffset - 2, foamWidth - 2, 4);
        ctx.fillRect(x, canvas.height - 6 + yOffset, foamWidth - 2, 4);
    }
}

function drawOceanBackground() {
    // Base do oceano com gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, OCEAN_COLORS.base);
    gradient.addColorStop(0.5, OCEAN_COLORS.deep);
    gradient.addColorStop(1, '#0a2a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ondas animadas com tiles (estilo Zelda)
    drawWaveTiles();
    
    // Espuma nas bordas da tela
    drawOceanFoam();
}

function drawWaveTiles() {
    const tileSize = 16 * PIXEL_SCALE; // 32px tiles
    const animFrame = Math.floor(frameCount / 8) % 4; // 4 frames de animaÃ§Ã£o
    
    // Offset diagonal para criar ilusÃ£o de movimento
    const diagonalOffset = Math.floor(frameCount / 4) % tileSize;
    
    for (let x = -tileSize; x < canvas.width + tileSize; x += tileSize) {
        for (let y = -tileSize; y < canvas.height + tileSize; y += tileSize) {
            // Calcular posiÃ§Ã£o com offset diagonal (ondas se movem para sudeste)
            const drawX = x + diagonalOffset;
            const drawY = y + diagonalOffset;
            
            // PadrÃ£o de checker para variaÃ§Ã£o
            const isAlt = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0);
            
            // Desenhar tile de onda
            drawWaveTile(drawX, drawY, tileSize, animFrame, isAlt);
        }
    }
}

function drawWaveTile(x, y, size, frame, isAlt) {
    const halfSize = size / 2;
    const quarterSize = size / 4;
    
    // PadrÃ£o de onda baseado no frame e se Ã© alternado
    const wavePhase = (frame + (isAlt ? 2 : 0)) % 4;
    
    // Linha de highlight da onda (diagonal)
    ctx.fillStyle = OCEAN_COLORS.light;
    
    switch(wavePhase) {
        case 0:
            // Onda no topo-esquerdo
            ctx.fillRect(x, y, halfSize, quarterSize);
            ctx.fillRect(x, y, quarterSize, halfSize);
            break;
        case 1:
            // Onda movendo para direita
            ctx.fillRect(x + quarterSize, y + quarterSize, halfSize, quarterSize);
            ctx.fillRect(x + halfSize, y, quarterSize, halfSize);
            break;
        case 2:
            // Onda no centro-direita
            ctx.fillRect(x + halfSize, y + halfSize, halfSize, quarterSize);
            ctx.fillRect(x + halfSize + quarterSize, y + quarterSize, quarterSize, halfSize);
            break;
        case 3:
            // Onda voltando
            ctx.fillRect(x + quarterSize, y + halfSize + quarterSize, halfSize, quarterSize);
            ctx.fillRect(x, y + halfSize, quarterSize, halfSize);
            break;
    }
    
    // Highlight mais brilhante (ponto de luz na crista da onda)
    ctx.fillStyle = OCEAN_COLORS.highlight;
    const highlightX = x + (wavePhase * quarterSize) % size;
    const highlightY = y + ((wavePhase + (isAlt ? 1 : 0)) * quarterSize) % size;
    ctx.fillRect(highlightX, highlightY, quarterSize / 2, quarterSize / 2);
}

function drawOceanFoam() {
    const foamWidth = 8 * PIXEL_SCALE;
    const animOffset = Math.floor(frameCount / 12) % 3;
    
    // Espuma na borda superior
    ctx.fillStyle = OCEAN_COLORS.foam;
    for (let x = 0; x < canvas.width; x += foamWidth * 2) {
        const yOffset = ((x / foamWidth) + animOffset) % 3;
        ctx.fillRect(x, yOffset * 2, foamWidth, foamWidth / 2);
        
        // Pontos brancos de espuma
        ctx.fillStyle = OCEAN_COLORS.foamWhite;
        if ((x / foamWidth + frameCount / 20) % 4 < 2) {
            ctx.fillRect(x + foamWidth / 4, yOffset * 2 + 2, foamWidth / 4, foamWidth / 4);
        }
        ctx.fillStyle = OCEAN_COLORS.foam;
    }
    
    // Espuma na borda inferior
    for (let x = 0; x < canvas.width; x += foamWidth * 2) {
        const yOffset = ((x / foamWidth) + animOffset + 1) % 3;
        ctx.fillRect(x + foamWidth, canvas.height - foamWidth / 2 - yOffset * 2, foamWidth, foamWidth / 2);
    }
    
    // Espuma nas bordas laterais (mais sutil)
    for (let y = 0; y < canvas.height; y += foamWidth * 3) {
        const xOffset = ((y / foamWidth) + animOffset) % 2;
        
        // Borda esquerda
        ctx.fillStyle = OCEAN_COLORS.foam + '80'; // Semi-transparente
        ctx.fillRect(xOffset * 2, y, foamWidth / 2, foamWidth);
        
        // Borda direita
        ctx.fillRect(canvas.width - foamWidth / 2 - xOffset * 2, y + foamWidth, foamWidth / 2, foamWidth);
    }
    
    // Bolhas/espuma aleatÃ³ria no oceano
    drawOceanBubbles();
}

function drawOceanBubbles() {
    // Usar frameCount como seed para posiÃ§Ãµes pseudo-aleatÃ³rias consistentes
    const bubbleCount = 12;
    ctx.fillStyle = OCEAN_COLORS.foamWhite + '60'; // Muito sutil
    
    for (let i = 0; i < bubbleCount; i++) {
        // PosiÃ§Ã£o baseada em Ã­ndice + animaÃ§Ã£o lenta
        const baseX = ((i * 73 + 17) % canvas.width);
        const baseY = ((i * 137 + 41) % canvas.height);
        
        // Movimento sutil de subida
        const floatOffset = Math.sin((frameCount + i * 50) / 30) * 4;
        const driftOffset = Math.cos((frameCount + i * 30) / 50) * 2;
        
        const bubbleX = baseX + driftOffset;
        const bubbleY = baseY + floatOffset;
        
        // Tamanho variado
        const size = (i % 3 + 1) * PIXEL_SCALE;
        
        // Bolha com brilho
        ctx.fillStyle = OCEAN_COLORS.foam + '40';
        ctx.fillRect(bubbleX, bubbleY, size, size);
        
        // Highlight da bolha
        ctx.fillStyle = OCEAN_COLORS.foamWhite + '60';
        ctx.fillRect(bubbleX, bubbleY, size / 2, size / 2);
    }
}

// ============ SKY FORTRESS BACKGROUND ============

const SKY_COLORS = {
    skyTop: '#0a0a2a',        // CÃ©u noturno escuro (topo)
    skyBottom: '#1a1a4a',     // CÃ©u noturno (base)
    cloudLight: '#4a4a6a',    // Nuvem clara
    cloudDark: '#2a2a4a',     // Nuvem escura
    platform: '#5a5a6a',      // Plataforma cinza
    platformLight: '#7a7a8a', // Highlight da plataforma
    platformDark: '#3a3a4a',  // Sombra da plataforma
    metal: '#6a6a7a',         // Metal
    rivet: '#4a4a5a',         // Rebites
    glow: '#8888ff',          // Brilho/energia
    danger: '#ff4444'         // Zona de perigo (vazio)
};

function drawSkyFortressBackground() {
    const cfg = SKYFORTRESS_CONFIG;
    const px = PIXEL_SCALE;
    
    // CÃ©u gradiente (escuro = alta altitude)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#050515');  // Quase preto no topo
    gradient.addColorStop(0.3, '#0a0a2a');
    gradient.addColorStop(0.7, '#1a1a4a');
    gradient.addColorStop(1, '#2a2a5a');  // Azul escuro embaixo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Estrelas animadas (mais profundidade)
    drawSkyStarsAnimated();
    
    // Aeronaves de fundo (aviÃµes, helicÃ³pteros, dirigÃ­veis)
    drawBgAircraft();
    
    // Nuvens passando rÃ¡pido (parallax vertical - sensaÃ§Ã£o de subida)
    drawSkyClouds();
    
    // PartÃ­culas de vento
    drawWindParticles();
    
    // Zona de perigo (vazio ao redor da plataforma) - brilho sutil vermelho
    drawDangerZone();
    
    // Plataforma flutuante
    drawFloatingPlatform();
    
    // Indicador de vento se ativo
    if (skyWindActive) {
        drawSkyWindIndicator();
    }
}

function drawSkyStarsAnimated() {
    // Estrelas animadas com twinkle e parallax
    skyStars.forEach(star => {
        const twinkle = Math.sin(frameCount * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = (0.2 + star.layer * 0.2) + twinkle * 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        
        // Algumas estrelas tÃªm brilho extra
        if (star.size > 2 && twinkle > 0.7) {
            ctx.fillStyle = `rgba(200, 200, 255, ${twinkle * 0.3})`;
            ctx.fillRect(star.x - 1, star.y - 1, star.size + 2, star.size + 2);
        }
    });
}

function drawBgAircraft() {
    skyBgAircraft.forEach(aircraft => {
        ctx.globalAlpha = aircraft.alpha;
        const s = aircraft.scale;
        const x = aircraft.x;
        const y = aircraft.y;
        
        if (aircraft.type === 'plane') {
            // AviÃ£o simples (silhueta)
            ctx.fillStyle = '#334';
            // Fuselagem
            ctx.fillRect(x, y + 5 * s, 40 * s, 8 * s);
            // Asas
            ctx.fillRect(x + 10 * s, y, 20 * s, 20 * s);
            // Cauda
            ctx.fillRect(x - 5 * s, y + 2 * s, 10 * s, 15 * s);
        } else if (aircraft.type === 'helicopter') {
            // HelicÃ³ptero (silhueta)
            ctx.fillStyle = '#343';
            // Corpo
            ctx.beginPath();
            ctx.ellipse(x + 15 * s, y + 10 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cauda
            ctx.fillRect(x + 25 * s, y + 8 * s, 20 * s, 4 * s);
            // Rotor (animado)
            ctx.fillStyle = '#556';
            const rotorAngle = frameCount * 0.3;
            ctx.save();
            ctx.translate(x + 15 * s, y + 5 * s);
            ctx.rotate(rotorAngle);
            ctx.fillRect(-20 * s, -1 * s, 40 * s, 2 * s);
            ctx.restore();
        } else if (aircraft.type === 'blimp') {
            // DirigÃ­vel (silhueta)
            ctx.fillStyle = '#444';
            // Corpo oval
            ctx.beginPath();
            ctx.ellipse(x + 30 * s, y + 12 * s, 30 * s, 12 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabine
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 20 * s, y + 20 * s, 20 * s, 8 * s);
            // Leme traseiro
            ctx.fillRect(x - 5 * s, y + 5 * s, 10 * s, 15 * s);
        }
    });
    ctx.globalAlpha = 1;
}

function drawWindParticles() {
    if (skyWindParticles.length === 0) return;
    
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.15)';
    ctx.lineWidth = 1;
    
    skyWindParticles.forEach(p => {
        const windOffset = skyWindActive ? skyWindDirection * 15 : 0;
        ctx.globalAlpha = p.alpha * (skyWindActive ? 2 : 1);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length - windOffset, p.y - 2);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
}

function drawSkyStars() {
    // FunÃ§Ã£o mantida para compatibilidade mas agora usa versÃ£o animada
    drawSkyStarsAnimated();
}

function drawSkyClouds() {
    const cfg = SKYFORTRESS_CONFIG;
    
    // Atualizar e desenhar nuvens
    skyClouds.forEach(cloud => {
        // Nuvem descendo rÃ¡pido (sensaÃ§Ã£o de subida)
        cloud.y += cfg.cloudSpeed * cloud.speed;
        
        // Resetar se sair da tela
        if (cloud.y > canvas.height + 50) {
            cloud.y = -cloud.h;
            cloud.x = Math.random() * canvas.width;
        }
        
        // Desenhar nuvem
        ctx.globalAlpha = cloud.alpha;
        ctx.fillStyle = cloud.light ? SKY_COLORS.cloudLight : SKY_COLORS.cloudDark;
        
        // Forma de nuvem (vÃ¡rios cÃ­rculos)
        const cx = cloud.x + cloud.w / 2;
        const cy = cloud.y + cloud.h / 2;
        
        ctx.beginPath();
        ctx.ellipse(cx, cy, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - cloud.w * 0.3, cy, cloud.w / 3, cloud.h / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + cloud.w * 0.3, cy, cloud.w / 3, cloud.h / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawDangerZone() {
    const cfg = SKYFORTRESS_CONFIG;
    const pulse = Math.sin(frameCount * 0.03) * 0.1 + 0.1;
    
    // Side-scrolling: zona de perigo Ã© apenas ABAIXO da plataforma
    // Gradiente de perigo embaixo (queda = morte)
    const dangerGrad = ctx.createLinearGradient(0, cfg.platformY + cfg.platformHeight, 0, canvas.height);
    dangerGrad.addColorStop(0, 'rgba(255, 50, 50, 0)');
    dangerGrad.addColorStop(0.3, `rgba(255, 50, 50, ${pulse * 0.5})`);
    dangerGrad.addColorStop(1, `rgba(255, 0, 0, ${pulse})`);
    
    ctx.fillStyle = dangerGrad;
    ctx.fillRect(0, cfg.platformY + cfg.platformHeight + 50, canvas.width, canvas.height - cfg.platformY - cfg.platformHeight - 50);
    
    // Texto de aviso
    if (pulse > 0.15) {
        ctx.fillStyle = `rgba(255, 100, 100, ${pulse * 2})`;
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('âš  QUEDA = MORTE âš ', canvas.width / 2, canvas.height - 30);
    }
}

function drawElevatorPlatform() {
    // Redirecionar para nova funÃ§Ã£o
    drawFloatingPlatform();
}

function drawFloatingPlatform() {
    const cfg = SKYFORTRESS_CONFIG;
    const x = cfg.platformX;
    const y = cfg.platformY;  // Topo da plataforma (onde jogador pisa)
    const w = cfg.platformWidth;
    const h = cfg.platformHeight;  // Espessura da plataforma
    
    // Efeito de flutuaÃ§Ã£o suave
    const floatOffset = Math.sin(frameCount * 0.02) * 2;
    const drawY = y + floatOffset;
    
    // Profundidade 3D
    const depth3D = 20;
    
    // ============ SOMBRA PROJETADA ============
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 15, drawY + h + 15, w, 25);
    
    // ============ FACE INFERIOR 3D ============
    ctx.fillStyle = '#2a2a35';
    ctx.beginPath();
    ctx.moveTo(x, drawY + h);
    ctx.lineTo(x + w, drawY + h);
    ctx.lineTo(x + w + depth3D, drawY + h + depth3D);
    ctx.lineTo(x + depth3D, drawY + h + depth3D);
    ctx.closePath();
    ctx.fill();
    
    // Detalhes na face inferior
    ctx.fillStyle = '#1a1a25';
    for (let i = 0; i < w; i += 40) {
        ctx.fillRect(x + i + depth3D/2, drawY + h + 5, 30, 3);
    }
    
    // ============ FACE LATERAL DIREITA 3D ============
    ctx.fillStyle = '#3a3a45';
    ctx.beginPath();
    ctx.moveTo(x + w, drawY);
    ctx.lineTo(x + w + depth3D, drawY + depth3D);
    ctx.lineTo(x + w + depth3D, drawY + h + depth3D);
    ctx.lineTo(x + w, drawY + h);
    ctx.closePath();
    ctx.fill();
    
    // ============ CORPO PRINCIPAL DA PLATAFORMA (metal) ============
    // Base metÃ¡lica
    const metalGrad = ctx.createLinearGradient(x, drawY, x, drawY + h);
    metalGrad.addColorStop(0, '#5a5a6a');
    metalGrad.addColorStop(0.3, '#4a4a5a');
    metalGrad.addColorStop(0.7, '#3a3a4a');
    metalGrad.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = metalGrad;
    ctx.fillRect(x, drawY, w, h);
    
    // ============ PAINÃ‰IS METÃLICOS ============
    const panelW = 80;
    for (let px = 0; px < w; px += panelW) {
        const panelX = x + px;
        const actualW = Math.min(panelW - 4, w - px - 4);
        
        if (actualW > 0) {
            // Painel
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(panelX + 2, drawY + 4, actualW, h - 8);
            
            // Borda clara (topo/esquerda)
            ctx.fillStyle = '#6a6a7a';
            ctx.fillRect(panelX + 2, drawY + 4, actualW, 2);
            ctx.fillRect(panelX + 2, drawY + 4, 2, h - 8);
            
            // Borda escura (fundo/direita)
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(panelX + 2, drawY + h - 6, actualW, 2);
            ctx.fillRect(panelX + actualW, drawY + 4, 2, h - 8);
        }
    }
    
    // ============ REBITES (otimizado - rects) ============
    ctx.fillStyle = '#7a7a8a';
    const rivetSpacing = 40;
    for (let rx = x + 20; rx < x + w - 10; rx += rivetSpacing) {
        ctx.fillRect(rx - 3, drawY + 7, 6, 6);
        ctx.fillRect(rx - 3, drawY + h - 13, 6, 6);
    }
    
    // Sombra dos rebites
    ctx.fillStyle = '#3a3a4a';
    for (let rx = x + 20; rx < x + w - 10; rx += rivetSpacing) {
        ctx.fillRect(rx - 1, drawY + 9, 4, 4);
        ctx.fillRect(rx - 1, drawY + h - 11, 4, 4);
    }
    
    // ============ SUPERFÃCIE SUPERIOR (onde o jogador pisa) ============
    // Linha de destaque no topo
    ctx.fillStyle = '#7a7a8a';
    ctx.fillRect(x, drawY, w, 4);
    
    // Grip texture (antiderrapante)
    ctx.fillStyle = '#5a5a6a';
    for (let gx = x + 5; gx < x + w - 5; gx += 8) {
        ctx.fillRect(gx, drawY + 1, 4, 2);
    }
    
    // ============ BORDAS LATERAIS ============
    // Borda esquerda (luz)
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(x, drawY, 4, h);
    
    // Borda direita (sombra)
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(x + w - 4, drawY, 4, h);
    
    // ============ LUZES DE SINALIZAÇÃO (otimizado - rects) ============
    const lightPulse = Math.sin(frameCount * 0.1) * 0.3 + 0.7;
    
    // Luz esquerda (verde) - glow + núcleo
    ctx.fillStyle = `rgba(50, 255, 100, ${lightPulse * 0.5})`;
    ctx.fillRect(x + 9, drawY + h/2 - 6, 12, 12);
    ctx.fillStyle = `rgba(100, 255, 150, ${lightPulse})`;
    ctx.fillRect(x + 12, drawY + h/2 - 3, 6, 6);
    
    // Luz direita (verde) - glow + núcleo
    ctx.fillStyle = `rgba(50, 255, 100, ${lightPulse * 0.5})`;
    ctx.fillRect(x + w - 21, drawY + h/2 - 6, 12, 12);
    ctx.fillStyle = `rgba(100, 255, 150, ${lightPulse})`;
    ctx.fillRect(x + w - 18, drawY + h/2 - 3, 6, 6);
    
    // ============ FAIXAS DE PERIGO NAS BORDAS ============
    // Faixa esquerda
    for (let i = 0; i < h; i += 16) {
        ctx.fillStyle = Math.floor(i / 16) % 2 === 0 ? '#ffaa00' : '#222';
        ctx.fillRect(x + 4, drawY + i, 8, 8);
    }
    
    // Faixa direita
    for (let i = 0; i < h; i += 16) {
        ctx.fillStyle = Math.floor(i / 16) % 2 === 0 ? '#ffaa00' : '#222';
        ctx.fillRect(x + w - 12, drawY + i, 8, 8);
    }
    
    // ============ PROPULSORES OTIMIZADOS (sem shadowBlur) ============
    const thrusterGlow = Math.sin(frameCount * 0.15) * 0.3 + 0.7;
    
    // Glow simplificado com rects (sem shadowBlur caro)
    ctx.fillStyle = `rgba(100, 150, 255, ${thrusterGlow * 0.15})`;
    ctx.fillRect(x + 50, drawY + h, 60, 50);  // Glow esquerdo
    ctx.fillRect(x + w/2 - 40, drawY + h, 80, 60);  // Glow central
    ctx.fillRect(x + w - 110, drawY + h, 60, 50);  // Glow direito
    
    // Propulsores simplificados (rects ao invés de paths)
    ctx.fillStyle = `rgba(100, 150, 255, ${thrusterGlow * 0.6})`;
    ctx.fillRect(x + 65, drawY + h, 30, 35);  // Esquerdo
    ctx.fillRect(x + w - 95, drawY + h, 30, 35);  // Direito
    
    ctx.fillStyle = `rgba(100, 150, 255, ${thrusterGlow * 0.8})`;
    ctx.fillRect(x + w/2 - 25, drawY + h, 50, 45);  // Central
    
    // Núcleo brilhante
    ctx.fillStyle = `rgba(200, 230, 255, ${thrusterGlow})`;
    ctx.fillRect(x + 70, drawY + h, 20, 8);
    ctx.fillRect(x + w/2 - 20, drawY + h, 40, 8);
    ctx.fillRect(x + w - 90, drawY + h, 20, 8);
}

function drawSkyWindIndicator() {
    const arrowX = canvas.width / 2;
    const arrowY = 50;
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    // Fundo
    ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
    ctx.fillRect(arrowX - 60, arrowY - 15, 120, 30);
    
    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(skyWindDirection > 0 ? 'ðŸ’¨ RAJADA â†’' : 'â† RAJADA ðŸ’¨', arrowX, arrowY + 4);
    
    ctx.restore();
}
