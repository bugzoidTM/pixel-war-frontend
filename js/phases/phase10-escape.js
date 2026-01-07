// ============ FASE 10 - A FUGA (Escape) ============
// Side-scroller fugindo do Mega Tank

function initEscapeLevel() {
    const cfg = ESCAPE_CONFIG;
    
    // Resetar estado
    escapeBossX = cfg.bossStartX;
    escapeBossHP = cfg.bossHP;
    escapeBossMaxHP = cfg.bossHP;
    escapeBossSpeed = cfg.bossSpeed;
    escapeScrollX = 0;
    escapeObstacles = [];
    escapeNextObstacle = 120;
    escapeNextSoldier = cfg.soldierSpawnRate;
    escapeNextHealPowerup = cfg.healPowerupRate;
    escapeDebris = [];
    
    // Aplicar bônus de HP para esta fase (balanceamento)
    if (player) {
        const hpBonus = player.maxHp * (cfg.playerHPMultiplier - 1);
        player.maxHp += hpBonus;
        player.hp = player.maxHp;
        
        // Bônus de dano
        player.escapeDamageBonus = cfg.playerDamageMultiplier;
        
        console.log('🛡️ Bônus aplicados! HP:', player.maxHp, 'Dano: x' + cfg.playerDamageMultiplier);
    }
    
    // Criar árvores de fundo
    escapeTrees = [];
    for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < cfg.treesPerLayer; i++) {
            escapeTrees.push({
                x: Math.random() * canvas.width * 2,
                y: cfg.groundY - 30 - Math.random() * 100,
                layer: layer,
                size: 20 + layer * 15 + Math.random() * 20,
                type: Math.random() > 0.3 ? 'tree' : 'bush'
            });
        }
    }
    
    // Criar prédios/estruturas
    escapeBuildings = [];
    for (let i = 0; i < cfg.buildingsCount; i++) {
        escapeBuildings.push({
            x: canvas.width + i * 400 + Math.random() * 200,
            y: cfg.groundY,
            w: 80 + Math.random() * 60,
            h: 100 + Math.random() * 150,
            destroyed: false,
            debrisSpawned: false
        });
    }
    
    // Posicionar jogador
    if (player) {
        player.x = canvas.width * 0.6;
        player.y = cfg.groundY - player.h;
        player.grounded = true;
        player.velocityY = 0;
    }
    
    console.log('🏃 Fase A FUGA iniciada! Corra do Mega Tank!');
}

function updateEscapeLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'escape') return;
    
    const cfg = ESCAPE_CONFIG;
    
    // Boss avança constantemente
    escapeBossSpeed = Math.min(cfg.bossMaxSpeed, escapeBossSpeed + cfg.bossAcceleration);
    escapeBossX += escapeBossSpeed;
    
    // Scroll de fundo
    escapeScrollX += cfg.scrollSpeed;
    
    // Spawn de soldados inimigos do lado esquerdo (mesma direção do boss)
    if (!escapeNextSoldier) escapeNextSoldier = cfg.soldierSpawnRate;
    escapeNextSoldier--;
    if (escapeNextSoldier <= 0) {
        const soldierCount = enemies.filter(e => e.type === 'soldier' && !e.dead).length;
        if (soldierCount < cfg.maxSoldiers) {
            const spawnX = escapeBossX + cfg.bossWidth + 50 + Math.random() * 30;
            const soldierHeight = 28;
            const spawnY = cfg.groundY - soldierHeight;
            enemies.push(new Enemy('soldier', spawnX, spawnY));
            console.log('🎯 Soldado inimigo spawnado na fase de fuga!');
        }
        escapeNextSoldier = cfg.soldierSpawnRate + Math.random() * 60;
    }
    
    // Spawn de powerup de cura periodicamente
    if (!escapeNextHealPowerup) escapeNextHealPowerup = cfg.healPowerupRate;
    escapeNextHealPowerup--;
    if (escapeNextHealPowerup <= 0 && player) {
        const powerupX = player.x + 150 + Math.random() * 100;
        const powerupY = cfg.groundY - 60;
        
        const typeRoll = Math.random();
        let powerupIndex;
        if (typeRoll < 0.35) {
            powerupIndex = 5; // Cura (35%)
        } else if (typeRoll < 0.50) {
            powerupIndex = 1; // Escudo (15%)
        } else if (typeRoll < 0.65) {
            powerupIndex = 2; // Multi-tiro (15%)
        } else if (typeRoll < 0.80) {
            powerupIndex = 4; // Dano duplo (15%)
        } else if (typeRoll < 0.90) {
            powerupIndex = 3; // Velocidade (10%)
        } else {
            powerupIndex = 0; // Munição infinita (10%)
        }
        
        bonusCrates.push({
            x: powerupX,
            y: powerupY,
            w: 30,
            h: 30,
            type: powerupTypes[powerupIndex],
            dead: false
        });
        console.log('🎁 Powerup spawnado:', powerupTypes[powerupIndex].name);
        escapeNextHealPowerup = cfg.healPowerupRate + Math.random() * 60;
    }
    
    // Atualizar árvores (parallax)
    escapeTrees.forEach(tree => {
        const speed = cfg.scrollSpeed * (0.3 + tree.layer * 0.3);
        tree.x -= speed;
        if (tree.x + tree.size < 0) {
            tree.x = canvas.width + Math.random() * 200;
        }
    });
    
    // Atualizar prédios
    escapeBuildings.forEach(building => {
        building.x -= cfg.scrollSpeed;
        
        if (!building.destroyed && escapeBossX + cfg.bossWidth > building.x) {
            building.destroyed = true;
            if (!building.debrisSpawned) {
                building.debrisSpawned = true;
                for (let i = 0; i < 10; i++) {
                    escapeDebris.push({
                        x: building.x + Math.random() * building.w,
                        y: building.y - building.h + Math.random() * building.h,
                        vx: 5 + Math.random() * 8,
                        vy: -5 - Math.random() * 10,
                        size: 5 + Math.random() * 15,
                        rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.3,
                        life: 120
                    });
                }
                addScreenShake(8);
            }
        }
        
        if (building.x + building.w < -100) {
            building.x = canvas.width + 200 + Math.random() * 300;
            building.destroyed = false;
            building.debrisSpawned = false;
            building.w = 80 + Math.random() * 60;
            building.h = 100 + Math.random() * 150;
        }
    });
    
    // Atualizar debris
    escapeDebris = escapeDebris.filter(d => d.life > 0);
    escapeDebris.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.5;
        d.rotation += d.rotSpeed;
        d.life--;
    });
    
    // Spawn de obstáculos
    escapeNextObstacle--;
    if (escapeNextObstacle <= 0) {
        spawnEscapeObstacle();
        escapeNextObstacle = cfg.obstacleSpawnRate + Math.random() * 60;
    }
    
    // Atualizar obstáculos
    escapeObstacles = escapeObstacles.filter(o => !o.dead);
    escapeObstacles.forEach(obstacle => {
        obstacle.x -= cfg.scrollSpeed;
        
        if (obstacle.x < escapeBossX + cfg.bossWidth + 20) {
            obstacle.dead = true;
            for (let i = 0; i < 5; i++) {
                escapeDebris.push({
                    x: obstacle.x,
                    y: obstacle.y,
                    vx: 3 + Math.random() * 5,
                    vy: -3 - Math.random() * 6,
                    size: 3 + Math.random() * 8,
                    rotation: 0,
                    rotSpeed: (Math.random() - 0.5) * 0.2,
                    life: 60
                });
            }
        }
        
        if (obstacle.x + obstacle.w < -50) {
            obstacle.dead = true;
        }
    });
    
    // Checar colisão jogador com obstáculos
    if (player) {
        escapeObstacles.forEach(obstacle => {
            const colliding = !obstacle.dead &&
                player.x < obstacle.x + obstacle.w &&
                player.x + player.w > obstacle.x &&
                player.y < obstacle.y + obstacle.h &&
                player.y + player.h > obstacle.y;
            
            if (colliding) {
                if (player.velocityY > 0 && player.y + player.h < obstacle.y + 20) {
                    player.y = obstacle.y - player.h;
                    player.velocityY = 0;
                    player.grounded = true;
                } else if (!obstacle.isJumpable) {
                    player.hp -= 10;
                    player.x = obstacle.x + obstacle.w + 10;
                    player.flashTime = 10;
                    floatingTexts.push(new FloatingText(player.x, player.y, '-10', '#ff4444'));
                    addScreenShake(3);
                }
            }
        });
    }
    
    // Atualizar UI
    const hpPercent = Math.round((escapeBossHP / escapeBossMaxHP) * 100);
    document.getElementById('objective-text').innerText = `Boss HP: ${hpPercent}% | Destrua o Mega Tank!`;
    
    // Vitória se boss morreu
    if (escapeBossHP <= 0) {
        floatingTexts.push(new FloatingText(canvas.width/2, canvas.height/2, '🎉 BOSS DESTRUÍDO!', '#ffff00'));
        completeLevel();
    }
}

function spawnEscapeObstacle() {
    const cfg = ESCAPE_CONFIG;
    const types = cfg.obstacleTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    
    let w, h, hp, isJumpable;
    switch(type) {
        case 'crate':
            w = 40; h = 40; hp = 30; isJumpable = true;
            break;
        case 'wall':
            w = 30; h = 80; hp = 60; isJumpable = false;
            break;
        case 'barrel':
            w = 30; h = 35; hp = 20; isJumpable = true;
            break;
        case 'sandbag':
            w = 50; h = 30; hp = 40; isJumpable = true;
            break;
        default:
            w = 40; h = 40; hp = 30; isJumpable = true;
    }
    
    const obstacle = {
        x: canvas.width + 50,
        y: cfg.groundY - h,
        w, h,
        type,
        hp,
        maxHp: hp,
        isJumpable,
        dead: false
    };
    
    escapeObstacles.push(obstacle);
}

function drawEscapeBackground() {
    const cfg = ESCAPE_CONFIG;
    const px = PIXEL_SCALE;
    
    // Céu gradiente (pôr do sol dramático)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a0a0a');
    gradient.addColorStop(0.3, '#4a1a1a');
    gradient.addColorStop(0.6, '#8a3a2a');
    gradient.addColorStop(1, '#3a2a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sol/lua no fundo
    ctx.fillStyle = '#ffaa44';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 100, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Árvores de fundo (parallax)
    escapeTrees.forEach(tree => {
        const alpha = 0.3 + tree.layer * 0.2;
        ctx.globalAlpha = alpha;
        
        if (tree.type === 'tree') {
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(tree.x + tree.size/3, tree.y, tree.size/3, tree.size);
            ctx.fillStyle = '#2a4a2a';
            ctx.beginPath();
            ctx.moveTo(tree.x, tree.y);
            ctx.lineTo(tree.x + tree.size/2, tree.y - tree.size);
            ctx.lineTo(tree.x + tree.size, tree.y);
            ctx.fill();
        } else {
            ctx.fillStyle = '#3a5a3a';
            ctx.beginPath();
            ctx.arc(tree.x + tree.size/2, tree.y, tree.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.globalAlpha = 1;
    
    // Prédios sendo destruídos
    escapeBuildings.forEach(building => {
        if (building.destroyed) {
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(building.x, building.y - building.h * 0.3, building.w, building.h * 0.3);
            ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
            const smokeY = building.y - building.h * 0.3 - 20 - Math.sin(frameCount * 0.05) * 10;
            ctx.beginPath();
            ctx.arc(building.x + building.w/2, smokeY, 30, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(building.x, building.y - building.h, building.w, building.h);
            ctx.fillStyle = '#2a2a2a';
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 2; col++) {
                    ctx.fillRect(
                        building.x + 10 + col * (building.w/2 - 5),
                        building.y - building.h + 15 + row * 35,
                        15, 20
                    );
                }
            }
        }
    });
    
    // Debris voando
    escapeDebris.forEach(d => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-d.size/2, -d.size/2, d.size, d.size);
        ctx.restore();
    });
    
    // Chão
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, cfg.groundY, canvas.width, canvas.height - cfg.groundY);
    
    // Linha do chão (estrada)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, cfg.groundY, canvas.width, 4);
    
    // Marcas na estrada (scroll)
    ctx.fillStyle = '#5a4a3a';
    const roadMarkOffset = escapeScrollX % 100;
    for (let x = -roadMarkOffset; x < canvas.width + 100; x += 100) {
        ctx.fillRect(x, cfg.groundY + 20, 40, 6);
    }
    
    // Desenhar obstáculos
    escapeObstacles.forEach(obstacle => {
        drawEscapeObstacle(obstacle);
    });
    
    // Desenhar o MEGA TANK BOSS
    drawMegaTankBoss();
    
    // Boss HP bar no topo
    drawEscapeBossHP();
}

function drawEscapeObstacle(obstacle) {
    const px = PIXEL_SCALE;
    const { x, y, w, h, type, hp, maxHp } = obstacle;
    
    const damageRatio = hp / maxHp;
    
    switch(type) {
        case 'crate':
            ctx.fillStyle = damageRatio > 0.5 ? '#8a6a4a' : '#6a4a2a';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#5a3a1a';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 5);
            ctx.lineTo(x + w - 5, y + h - 5);
            ctx.moveTo(x + w - 5, y + 5);
            ctx.lineTo(x + 5, y + h - 5);
            ctx.stroke();
            break;
            
        case 'wall':
            ctx.fillStyle = damageRatio > 0.5 ? '#6a6a6a' : '#4a4a4a';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#3a3a3a';
            ctx.lineWidth = 1;
            for (let row = 0; row < h / 15; row++) {
                ctx.beginPath();
                ctx.moveTo(x, y + row * 15);
                ctx.lineTo(x + w, y + row * 15);
                ctx.stroke();
            }
            break;
            
        case 'barrel':
            ctx.fillStyle = damageRatio > 0.5 ? '#4a4a5a' : '#3a3a4a';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2a2a3a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = '#5a5a6a';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + h/3);
            ctx.lineTo(x + w - 5, y + h/3);
            ctx.moveTo(x + 5, y + h*2/3);
            ctx.lineTo(x + w - 5, y + h*2/3);
            ctx.stroke();
            break;
            
        case 'sandbag':
            ctx.fillStyle = damageRatio > 0.5 ? '#8a7a5a' : '#6a5a3a';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#5a4a2a';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
    }
    
    if (hp < maxHp) {
        const barW = w;
        const barH = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y - 8, barW, barH);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(x, y - 8, barW * damageRatio, barH);
    }
}

function drawMegaTankBoss() {
    const cfg = ESCAPE_CONFIG;
    const x = escapeBossX;
    const y = 0;
    const w = cfg.bossWidth;
    const h = cfg.groundY;
    const px = PIXEL_SCALE;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 10, y + 10, w, h);
    
    // Corpo principal do tank gigante
    const bodyGradient = ctx.createLinearGradient(x, y, x, h);
    bodyGradient.addColorStop(0, '#3a3a3a');
    bodyGradient.addColorStop(0.5, '#5a5a5a');
    bodyGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(x, y, w, h);
    
    // Esteiras (tracks)
    const trackHeight = 80;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, h - trackHeight, w, trackHeight);
    
    // Rodas das esteiras
    ctx.fillStyle = '#2a2a2a';
    const wheelRadius = 25;
    for (let i = 0; i < 3; i++) {
        const wheelX = x + 30 + i * 60;
        const wheelY = h - trackHeight/2;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a2a2a';
    }
    
    // Painéis
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 3;
    for (let row = 0; row < 5; row++) {
        ctx.beginPath();
        ctx.moveTo(x, y + 50 + row * 90);
        ctx.lineTo(x + w, y + 50 + row * 90);
        ctx.stroke();
    }
    
    // Rebites
    ctx.fillStyle = '#6a6a6a';
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 2; col++) {
            ctx.beginPath();
            ctx.arc(x + 15 + col * (w - 30), y + 30 + row * 85, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Canhões
    const cannonPositions = [
        { y: 80, len: 100 },
        { y: 220, len: 120 },
        { y: 380, len: 90 }
    ];
    
    cannonPositions.forEach((cannon, i) => {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x + w - 20, cannon.y - 20, 40, 40);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + w, cannon.y - 8, cannon.len, 16);
        const glow = Math.sin(frameCount * 0.1 + i) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 50, ${glow})`;
        ctx.beginPath();
        ctx.arc(x + w + cannon.len, cannon.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // "Olhos" do tank
    const eyeGlow = Math.sin(frameCount * 0.15) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(x + w - 40, 150, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w - 40, 200, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Fumaça
    ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
    for (let i = 0; i < 3; i++) {
        const smokeX = x + 30 + i * 50;
        const smokeY = -20 - Math.sin(frameCount * 0.1 + i) * 20;
        const smokeSize = 20 + Math.sin(frameCount * 0.08 + i * 2) * 10;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Lâmina frontal
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(x + w, 0);
    ctx.lineTo(x + w + 40, h/2);
    ctx.lineTo(x + w, h);
    ctx.lineTo(x + w, 0);
    ctx.fill();
    
    // Spikes
    ctx.fillStyle = '#6a6a6a';
    for (let i = 0; i < 8; i++) {
        const spikeY = 50 + i * 65;
        ctx.beginPath();
        ctx.moveTo(x + w + 40, spikeY);
        ctx.lineTo(x + w + 60, spikeY + 25);
        ctx.lineTo(x + w + 40, spikeY + 50);
        ctx.fill();
    }
    
    // Efeito de dano
    if (escapeBossHP < escapeBossMaxHP * 0.5) {
        if (frameCount % 10 < 5) {
            ctx.fillStyle = '#ffaa00';
            for (let i = 0; i < 3; i++) {
                const sparkX = x + Math.random() * w;
                const sparkY = Math.random() * h;
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 3 + Math.random() * 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    if (escapeBossHP < escapeBossMaxHP * 0.25) {
        ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
        for (let i = 0; i < 2; i++) {
            const fireX = x + 20 + i * 80;
            const fireY = 100 + i * 150;
            const fireH = 30 + Math.sin(frameCount * 0.2 + i) * 15;
            ctx.beginPath();
            ctx.moveTo(fireX, fireY);
            ctx.lineTo(fireX - 15, fireY + fireH);
            ctx.lineTo(fireX + 15, fireY + fireH);
            ctx.fill();
        }
    }
}

function drawEscapeBossHP() {
    const barWidth = 300;
    const barHeight = 20;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 25);
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 5, barY - 5, barWidth + 10, barHeight + 25);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ MEGA TANK ⚠️', barX + barWidth/2, barY + 32);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const hpRatio = escapeBossHP / escapeBossMaxHP;
    let hpColor;
    if (hpRatio > 0.5) hpColor = '#ff4444';
    else if (hpRatio > 0.25) hpColor = '#ff8800';
    else hpColor = '#ffff00';
    
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${Math.round(escapeBossHP)} / ${escapeBossMaxHP}`, barX + barWidth/2, barY + 14);
    
    ctx.textAlign = 'left';
}

function checkEscapeBossHit(projectile) {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'escape') return false;
    
    if (projectile.isPlayer && !projectile.dead) {
        const cfg = ESCAPE_CONFIG;
        const bossRight = escapeBossX + cfg.bossWidth + 80;
        const bossLeft = escapeBossX - 20;
        
        if (projectile.x < bossRight &&
            projectile.x > bossLeft &&
            projectile.y > 0 &&
            projectile.y < cfg.groundY) {
            
            const damage = projectile.damage;
            escapeBossHP -= damage;
            projectile.dead = true;
            
            floatingTexts.push(new FloatingText(
                escapeBossX + cfg.bossWidth, projectile.y,
                '-' + damage,
                '#ffff00'
            ));
            
            for (let i = 0; i < 5; i++) {
                particles.push(new SmokeParticle(
                    escapeBossX + cfg.bossWidth + Math.random() * 30,
                    projectile.y + (Math.random() - 0.5) * 20,
                    Math.random() > 0.5 ? '#ffaa00' : '#ff6600'
                ));
            }
            
            const slowAmount = 0.5;
            escapeBossSpeed = Math.max(cfg.bossSpeed * 0.3, escapeBossSpeed - slowAmount);
            
            addScreenShake(2);
            
            console.log('💥 Boss hit! HP:', escapeBossHP, 'Speed:', escapeBossSpeed.toFixed(2));
            
            return true;
        }
    }
    return false;
}

function checkEscapeObstacleHit(projectile) {
    if (projectile.isPlayer && !projectile.dead) {
        for (let obstacle of escapeObstacles) {
            if (!obstacle.dead &&
                projectile.x > obstacle.x &&
                projectile.x < obstacle.x + obstacle.w &&
                projectile.y > obstacle.y &&
                projectile.y < obstacle.y + obstacle.h) {
                
                obstacle.hp -= projectile.damage;
                projectile.dead = true;
                
                floatingTexts.push(new FloatingText(
                    projectile.x, projectile.y,
                    '-' + projectile.damage,
                    '#ffaa00'
                ));
                
                if (obstacle.hp <= 0) {
                    obstacle.dead = true;
                    phaseScore += 25;
                    score = totalScore + phaseScore;
                    for (let i = 0; i < 5; i++) {
                        escapeDebris.push({
                            x: obstacle.x + obstacle.w/2,
                            y: obstacle.y + obstacle.h/2,
                            vx: (Math.random() - 0.5) * 8,
                            vy: -3 - Math.random() * 5,
                            size: 3 + Math.random() * 8,
                            rotation: 0,
                            rotSpeed: (Math.random() - 0.5) * 0.3,
                            life: 60
                        });
                    }
                }
                
                return true;
            }
        }
    }
    return false;
}
