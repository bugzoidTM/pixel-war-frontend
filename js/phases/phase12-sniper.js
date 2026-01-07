// ============ FASE 12 - STATIC SNIPER ============
// Tiro em Primeira Pessoa Estático (estilo Counter-Strike/sniper gallery)
// O jogador é um atirador de elite em uma torre de vigilância

function initSniperLevel() {
    const cfg = SNIPER_CONFIG;
    
    // Reset state
    sniperKills = 0;
    sniperMissedShots = 0;
    sniperCivilianHits = 0;
    sniperAmmo = cfg.maxAmmo;
    sniperReloading = false;
    sniperReloadTimer = 0;
    sniperBreathHeld = false;
    sniperBreathTimer = 0;
    sniperBreathCooldown = 0;
    sniperTargets = [];
    sniperCrosshairX = canvas.width / 2;
    sniperCrosshairY = canvas.height / 2;
    sniperSway = { x: 0, y: 0 };
    sniperRecoil = { x: 0, y: 0 };
    sniperKillStreak = 0;
    sniperTimeRemaining = cfg.timeLimit * 60;
    sniperTracers = [];
    sniperCurrentTier = 0;
    
    // Spawn inicial de alvos
    for (let i = 0; i < 3; i++) {
        spawnSniperTarget();
    }
    
    console.log('🎯 Fase Sniper iniciada! Elimine', cfg.targetKills, 'alvos em', cfg.timeLimit, 'segundos!');
}

// ============ INPUT HANDLING (chamado todo frame) ============

function updateSniperInput() {
    // Sempre atualizar posição da mira com o mouse
    sniperCrosshairX = mouseX;
    sniperCrosshairY = mouseY;
    
    // Segurar respiração com Shift ou Espaço
    if ((keys.Shift || keys[' ']) && !sniperBreathHeld && sniperBreathCooldown <= 0) {
        sniperHoldBreath();
    }
    
    // Soltar Shift libera respiração mais cedo
    if (sniperBreathHeld && !keys.Shift && !keys[' ']) {
        sniperBreathHeld = false;
        sniperBreathCooldown = Math.floor(SNIPER_CONFIG.holdBreathCooldown * 0.5);
    }
    
    // Recarregar manualmente com R
    if ((keys.r || keys.R) && !sniperReloading && sniperAmmo < SNIPER_CONFIG.maxAmmo) {
        startSniperReload();
        keys.r = false;
        keys.R = false;
    }
}

function handleSniperClick() {
    // Chamado quando clica o mouse
    if (sniperReloading || sniperAmmo <= 0) {
        // Som de arma vazia
        AudioEngine.createOscillator && AudioEngine.createOscillator('square', 100, 0.05, 0.1);
        return;
    }
    
    sniperShoot();
}

// ============ UPDATE LOGIC ============

function updateSniperLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'sniper') return;
    
    const cfg = SNIPER_CONFIG;
    
    // Sempre atualizar input
    updateSniperInput();
    
    // Atualizar timer
    sniperTimeRemaining--;
    if (sniperTimeRemaining <= 0) {
        player.hp = 0;
        floatingTexts.push(new FloatingText(
            canvas.width / 2, canvas.height / 2,
            '⏰ TEMPO ESGOTADO!', '#ff0000'
        ));
        return;
    }
    
    // Atualizar tier de dificuldade
    updateSniperDifficulty();
    
    // Atualizar balanço da mira
    updateSniperSway();
    
    // Atualizar recuperação do recuo
    updateSniperRecoil();
    
    // Atualizar respiração segurada
    updateSniperBreath();
    
    // Atualizar recarregamento
    updateSniperReload();
    
    // Spawnar novos alvos
    const tier = cfg.difficultyTiers[sniperCurrentTier];
    if (frameCount % tier.spawnRate === 0 && sniperTargets.length < cfg.maxTargets) {
        spawnSniperTarget();
    }
    
    // Atualizar alvos
    updateSniperTargets();
    
    // Atualizar tracers
    sniperTracers = sniperTracers.filter(t => {
        t.life--;
        return t.life > 0;
    });
    
    // Atualizar UI
    const seconds = Math.ceil(sniperTimeRemaining / 60);
    document.getElementById('objective-text').innerText = 
        `🎯 ${sniperKills}/${cfg.targetKills} | ⏱️ ${seconds}s | 🔫 ${sniperAmmo}/${cfg.maxAmmo}`;
    
    // Verificar vitória
    if (sniperKills >= cfg.targetKills) {
        completeLevel();
    }
}

function updateSniperDifficulty() {
    const cfg = SNIPER_CONFIG;
    
    for (let i = cfg.difficultyTiers.length - 1; i >= 0; i--) {
        if (sniperKills >= cfg.difficultyTiers[i].kills) {
            if (sniperCurrentTier !== i) {
                sniperCurrentTier = i;
                floatingTexts.push(new FloatingText(
                    canvas.width / 2, 100,
                    '⚠️ DIFICULDADE AUMENTADA!', '#ffaa00'
                ));
                AudioEngine.playDamage();
            }
            break;
        }
    }
}

function updateSniperSway() {
    const cfg = SNIPER_CONFIG;
    
    if (!sniperBreathHeld) {
        // Balanço natural da respiração (mais orgânico)
        const time = frameCount * cfg.breathSwaySpeed;
        const swayX = Math.sin(time) * cfg.breathSwayAmount + 
                      Math.sin(time * 2.3) * cfg.breathSwayAmount * 0.3;
        const swayY = Math.cos(time * 0.8) * cfg.breathSwayAmount * 0.7 + 
                      Math.cos(time * 1.7) * cfg.breathSwayAmount * 0.2;
        
        sniperSway.x += (swayX - sniperSway.x) * 0.08;
        sniperSway.y += (swayY - sniperSway.y) * 0.08;
    } else {
        // Muito estável quando segura respiração
        sniperSway.x *= 0.85;
        sniperSway.y *= 0.85;
    }
}

function updateSniperRecoil() {
    const cfg = SNIPER_CONFIG;
    
    sniperRecoil.x *= cfg.recoilRecovery;
    sniperRecoil.y *= cfg.recoilRecovery;
    
    if (Math.abs(sniperRecoil.x) < 0.3) sniperRecoil.x = 0;
    if (Math.abs(sniperRecoil.y) < 0.3) sniperRecoil.y = 0;
}

function updateSniperBreath() {
    const cfg = SNIPER_CONFIG;
    
    if (sniperBreathCooldown > 0) {
        sniperBreathCooldown--;
    }
    
    if (sniperBreathHeld) {
        sniperBreathTimer--;
        if (sniperBreathTimer <= 0) {
            sniperBreathHeld = false;
            sniperBreathCooldown = cfg.holdBreathCooldown;
            floatingTexts.push(new FloatingText(
                canvas.width / 2, 140,
                '💨 RECUPERANDO...', '#ffaa00'
            ));
        }
    }
}

function updateSniperReload() {
    const cfg = SNIPER_CONFIG;
    
    if (sniperReloading) {
        sniperReloadTimer--;
        if (sniperReloadTimer <= 0) {
            sniperReloading = false;
            sniperAmmo = cfg.maxAmmo;
            AudioEngine.playPickup();
            floatingTexts.push(new FloatingText(
                canvas.width / 2, canvas.height - 100,
                '🔫 PRONTO!', '#00ff00'
            ));
        }
    }
}

function updateSniperTargets() {
    const cfg = SNIPER_CONFIG;
    const tier = cfg.difficultyTiers[sniperCurrentTier];
    
    sniperTargets.forEach(target => {
        if (target.dead) return;
        
        target.exposureTimer--;
        
        if (target.exposureTimer <= 0) {
            target.dead = true;
            target.escaped = true;
            
            if (!target.isCivilian) {
                phaseScore += cfg.escapedPenalty;
                score = totalScore + phaseScore;
                sniperKillStreak = 0;
                floatingTexts.push(new FloatingText(
                    target.x + target.w/2, target.y,
                    '💨 ESCAPOU! ' + cfg.escapedPenalty, '#ff8800'
                ));
            }
            return;
        }
        
        // Movimento lateral
        if (target.moving) {
            target.x += target.vx * tier.speedMult;
            
            if (target.x < target.minX || target.x + target.w > target.maxX) {
                target.vx *= -1;
                target.facingRight = target.vx > 0;
            }
        }
        
        // Animação de caminhada
        if (target.moving) {
            target.walkFrame += 0.15;
        }
    });
    
    sniperTargets = sniperTargets.filter(t => !t.dead);
}

// ============ TARGET SPAWNING ============

function spawnSniperTarget() {
    const cfg = SNIPER_CONFIG;
    const tier = cfg.difficultyTiers[sniperCurrentTier];
    
    // Escolher zona de spawn
    const zone = cfg.spawnZones[Math.floor(Math.random() * cfg.spawnZones.length)];
    
    // Determinar se é civil
    const isCivilian = Math.random() < cfg.civilianChance;
    
    // Tipo de alvo
    let type = 'soldier';
    let scoreValue = 100;
    let hp = 100;
    let size = { w: 20, h: 36 };
    
    if (isCivilian) {
        type = 'civilian';
        scoreValue = 0;
        size = { w: 18, h: 34 };
    } else {
        const types = cfg.targetTypes;
        type = types[Math.floor(Math.random() * types.length)];
        
        switch(type) {
            case 'officer':
                scoreValue = 150;
                hp = 150;
                size = { w: 22, h: 38 };
                break;
            case 'runner':
                scoreValue = 75;
                hp = 80;
                size = { w: 18, h: 32 };
                break;
        }
    }
    
    const x = zone.x + Math.random() * (zone.w - size.w);
    const y = zone.y + Math.random() * (zone.h - size.h);
    
    const isMoving = !isCivilian && Math.random() < tier.moveChance;
    
    const target = {
        x: x,
        y: y,
        w: size.w,
        h: size.h,
        type: type,
        hp: hp,
        maxHp: hp,
        scoreValue: scoreValue,
        isCivilian: isCivilian,
        dead: false,
        escaped: false,
        
        moving: isMoving,
        vx: isMoving ? (Math.random() > 0.5 ? 1 : -1) * cfg.targetMoveSpeed : 0,
        facingRight: Math.random() > 0.5,
        minX: zone.x,
        maxX: zone.x + zone.w,
        
        exposureTimer: tier.exposure,
        maxExposure: tier.exposure,
        
        walkFrame: Math.random() * 10,
        hitFlash: 0
    };
    
    sniperTargets.push(target);
}

// ============ SHOOTING ============

function sniperShoot() {
    const cfg = SNIPER_CONFIG;
    
    sniperAmmo--;
    
    // Posição real da mira
    const aimX = sniperCrosshairX + sniperSway.x + sniperRecoil.x;
    const aimY = sniperCrosshairY + sniperSway.y + sniperRecoil.y;
    
    // Som
    AudioEngine.playSniperShot();
    addScreenShake(10);
    
    // Recuo
    sniperRecoil.y = -cfg.recoilKick;
    sniperRecoil.x = (Math.random() - 0.5) * cfg.recoilKick * 0.4;
    
    // Tracer
    sniperTracers.push({
        startX: canvas.width / 2,
        startY: canvas.height - 50,
        endX: aimX,
        endY: aimY,
        life: cfg.tracerDuration
    });
    
    // Flash de tiro
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(
            canvas.width / 2 + (Math.random() - 0.5) * 30,
            canvas.height - 60,
            '#ffff00',
            4 + Math.random() * 4,
            3,
            0.05
        ));
    }
    
    // Verificar hit
    let hit = false;
    let hitTarget = null;
    let isHeadshot = false;
    
    for (let target of sniperTargets) {
        if (target.dead) continue;
        
        if (aimX >= target.x && aimX <= target.x + target.w &&
            aimY >= target.y && aimY <= target.y + target.h) {
            
            hit = true;
            hitTarget = target;
            isHeadshot = aimY < target.y + target.h * 0.22;
            break;
        }
    }
    
    if (hit && hitTarget) {
        processSniperHit(hitTarget, isHeadshot, aimX, aimY);
    } else {
        // Miss
        sniperMissedShots++;
        sniperKillStreak = 0;
        phaseScore += cfg.missedShotPenalty;
        score = totalScore + phaseScore;
        
        // Impacto no cenário
        for (let i = 0; i < 6; i++) {
            particles.push(new Particle(
                aimX + (Math.random() - 0.5) * 20,
                aimY + (Math.random() - 0.5) * 20,
                '#8B7355',
                2 + Math.random() * 3,
                2,
                0.3
            ));
        }
        
        floatingTexts.push(new FloatingText(aimX, aimY, 'MISS', '#666666'));
    }
    
    // Auto-reload
    if (sniperAmmo <= 0) {
        startSniperReload();
    }
}

function processSniperHit(target, isHeadshot, hitX, hitY) {
    const cfg = SNIPER_CONFIG;
    
    const baseDamage = cfg.bulletDamage;
    const damage = isHeadshot ? baseDamage * cfg.headshotMultiplier : baseDamage;
    
    if (target.isCivilian) {
        // Civil atingido!
        target.dead = true;
        sniperCivilianHits++;
        sniperKillStreak = 0;
        phaseScore += cfg.civilianPenalty;
        score = totalScore + phaseScore;
        
        addScreenShake(15);
        AudioEngine.playDamage();
        
        // Sangue
        for (let i = 0; i < 12; i++) {
            particles.push(new Particle(
                hitX + (Math.random() - 0.5) * 15,
                hitY + (Math.random() - 0.5) * 15,
                '#880000',
                3 + Math.random() * 3,
                2,
                0.4
            ));
        }
        
        floatingTexts.push(new FloatingText(
            target.x + target.w/2, target.y - 20,
            '⚠️ CIVIL! ' + cfg.civilianPenalty,
            '#ff0000'
        ));
        
        return;
    }
    
    target.hp -= damage;
    target.hitFlash = 10;
    
    // Partículas de sangue
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(
            hitX + (Math.random() - 0.5) * 10,
            hitY + (Math.random() - 0.5) * 10,
            '#cc0000',
            2 + Math.random() * 2,
            2,
            0.3
        ));
    }
    
    if (target.hp <= 0) {
        target.dead = true;
        sniperKills++;
        sniperKillStreak++;
        
        let finalScore = target.scoreValue;
        
        if (isHeadshot) {
            finalScore = Math.floor(finalScore * cfg.headshotMultiplier);
        }
        
        const streakIndex = Math.min(sniperKillStreak, cfg.killStreakBonus.length - 1);
        finalScore += cfg.killStreakBonus[streakIndex];
        
        phaseScore += finalScore;
        score = totalScore + phaseScore;
        
        if (isHeadshot) {
            AudioEngine.playExplosion(0.5);
            addScreenShake(5);
            
            // Mais sangue
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    hitX + (Math.random() - 0.5) * 20,
                    hitY + (Math.random() - 0.5) * 20,
                    '#ff0000',
                    3 + Math.random() * 4,
                    3,
                    0.5
                ));
            }
            
            floatingTexts.push(new FloatingText(
                target.x + target.w/2, target.y - 30,
                '💀 HEADSHOT +' + finalScore,
                '#ff0000'
            ));
        } else {
            AudioEngine.playDamage();
            
            floatingTexts.push(new FloatingText(
                target.x + target.w/2, target.y - 10,
                '+' + finalScore,
                '#ffff00'
            ));
        }
        
        if (sniperKillStreak >= 3) {
            floatingTexts.push(new FloatingText(
                canvas.width / 2, 170,
                '🔥 ' + sniperKillStreak + 'x COMBO!',
                '#ff6600'
            ));
        }
    }
}

function startSniperReload() {
    const cfg = SNIPER_CONFIG;
    
    if (sniperReloading) return;
    
    sniperReloading = true;
    sniperReloadTimer = cfg.reloadTime;
    
    AudioEngine.createOscillator && AudioEngine.createOscillator('sine', 200, 0.15, 0.1);
    setTimeout(() => {
        AudioEngine.createOscillator && AudioEngine.createOscillator('sine', 350, 0.1, 0.08);
    }, 200);
    
    floatingTexts.push(new FloatingText(
        canvas.width / 2, canvas.height - 120,
        '⏳ RECARREGANDO...', '#ffaa00'
    ));
}

function sniperHoldBreath() {
    const cfg = SNIPER_CONFIG;
    
    sniperBreathHeld = true;
    sniperBreathTimer = cfg.holdBreathDuration;
    
    AudioEngine.createOscillator && AudioEngine.createOscillator('sine', 80, 0.2, 0.03);
}

// ============ DRAWING ============

function drawSniperLevel() {
    // Sempre atualizar input primeiro
    updateSniperInput();
    
    // Desenhar cenário
    drawSniperBackground();
    
    // Desenhar alvos
    sniperTargets.forEach(target => {
        if (!target.dead) {
            drawSniperTarget(target);
        }
    });
    
    // Desenhar tracers
    drawSniperTracers();
    
    // Crosshair
    drawSniperCrosshair();
    
    // HUD
    drawSniperHUD();
}

function drawSniperBackground() {
    // Céu
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    skyGrad.addColorStop(0, '#6a8a9a');
    skyGrad.addColorStop(1, '#9ab8c8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
    
    // Sol/luz
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(700, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Montanhas distantes
    ctx.fillStyle = '#4a5a5a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.38);
    ctx.lineTo(100, canvas.height * 0.28);
    ctx.lineTo(200, canvas.height * 0.33);
    ctx.lineTo(350, canvas.height * 0.22);
    ctx.lineTo(500, canvas.height * 0.30);
    ctx.lineTo(650, canvas.height * 0.25);
    ctx.lineTo(800, canvas.height * 0.32);
    ctx.lineTo(900, canvas.height * 0.27);
    ctx.lineTo(900, canvas.height * 0.4);
    ctx.lineTo(0, canvas.height * 0.4);
    ctx.fill();
    
    // Terreno
    const terrainGrad = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
    terrainGrad.addColorStop(0, '#5a6a4a');
    terrainGrad.addColorStop(0.4, '#4a5a3a');
    terrainGrad.addColorStop(1, '#3a4a2a');
    ctx.fillStyle = terrainGrad;
    ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.65);
    
    // Estruturas do cenário
    drawBattlefieldStructures();
}

function drawBattlefieldStructures() {
    // Bunker esquerdo
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(20, 320, 90, 60);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(40, 330, 40, 25);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(25, 315, 80, 8);
    
    // Prédio destruído
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(170, 250, 70, 150);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(180, 265, 18, 25);
    ctx.fillRect(210, 265, 18, 25);
    ctx.fillRect(180, 310, 18, 25);
    ctx.fillRect(210, 310, 18, 25);
    // Buraco de explosão
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(205, 370, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Muros/barricadas centro
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(370, 300, 120, 18);
    ctx.fillRect(390, 260, 18, 58);
    ctx.fillRect(470, 270, 18, 48);
    
    // Tanque destruído
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(540, 340, 55, 30);
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(550, 325, 35, 18);
    // Esteiras
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(538, 355, 12, 20);
    ctx.fillRect(588, 355, 12, 20);
    // Canhão destruído
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(585, 330, 25, 6);
    
    // Torre de vigia direita
    ctx.fillStyle = '#5a4a4a';
    ctx.fillRect(740, 220, 50, 130);
    ctx.fillStyle = '#4a3a3a';
    ctx.fillRect(735, 210, 60, 15);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(755, 230, 20, 25);
    
    // Sacos de areia
    ctx.fillStyle = '#7a6a5a';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(630 + i * 22, 365, 18, 12);
        if (i < 3) ctx.fillRect(641 + i * 22, 353, 18, 12);
    }
    
    // Crateras
    ctx.fillStyle = '#3a4a2a';
    ctx.beginPath();
    ctx.ellipse(300, 400, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(600, 420, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawSniperTarget(target) {
    const x = Math.floor(target.x);
    const y = Math.floor(target.y);
    const w = target.w;
    const h = target.h;
    
    // Flash quando atingido
    if (target.hitFlash > 0) {
        target.hitFlash--;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    }
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 2, w/2 + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cores baseadas no tipo
    let skinColor = '#d4a574';
    let uniformColor, uniformDark, helmetColor;
    
    if (target.isCivilian) {
        uniformColor = '#6688aa';
        uniformDark = '#446688';
        helmetColor = '#4a3a2a'; // cabelo
    } else if (target.type === 'officer') {
        uniformColor = '#5a4040';
        uniformDark = '#4a3030';
        helmetColor = '#2a1a1a';
    } else if (target.type === 'runner') {
        uniformColor = '#6a6a5a';
        uniformDark = '#5a5a4a';
        helmetColor = '#4a5a4a';
    } else {
        uniformColor = '#5a6a4a';
        uniformDark = '#4a5a3a';
        helmetColor = '#3a4a3a';
    }
    
    // Animação de caminhada
    const walkOffset = target.moving ? Math.sin(target.walkFrame) * 2 : 0;
    const legOffset = target.moving ? Math.sin(target.walkFrame * 2) * 3 : 0;
    
    // Pernas
    ctx.fillStyle = uniformDark;
    ctx.fillRect(x + 3, y + h * 0.65, 5, h * 0.35 + legOffset);
    ctx.fillRect(x + w - 8, y + h * 0.65, 5, h * 0.35 - legOffset);
    
    // Corpo/Torso
    ctx.fillStyle = uniformColor;
    ctx.fillRect(x + 2, y + h * 0.25, w - 4, h * 0.45);
    
    // Braços
    ctx.fillStyle = uniformColor;
    const armY = y + h * 0.3 + walkOffset;
    ctx.fillRect(x - 1, armY, 4, h * 0.25);
    ctx.fillRect(x + w - 3, armY, 4, h * 0.25);
    
    // Cabeça
    ctx.fillStyle = skinColor;
    const headH = h * 0.2;
    ctx.fillRect(x + w/2 - 4, y + 3, 8, headH);
    
    // Capacete/Cabelo
    ctx.fillStyle = helmetColor;
    ctx.fillRect(x + w/2 - 5, y, 10, 6);
    
    // Arma (só inimigos)
    if (!target.isCivilian) {
        ctx.fillStyle = '#2a2a2a';
        if (target.facingRight) {
            ctx.fillRect(x + w, y + h * 0.35, 10, 3);
        } else {
            ctx.fillRect(x - 10, y + h * 0.35, 10, 3);
        }
    }
    
    // Indicador de civil
    if (target.isCivilian) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', x + w/2, y - 5);
    }
    
    // Estrela de oficial
    if (target.type === 'officer') {
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', x + w/2, y - 3);
    }
    
    // Barra de tempo (quando baixo)
    const timePercent = target.exposureTimer / target.maxExposure;
    if (timePercent < 0.5) {
        const barW = w + 10;
        const barX = x - 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, y + h + 8, barW, 4);
        ctx.fillStyle = timePercent < 0.25 ? '#ff0000' : '#ffaa00';
        ctx.fillRect(barX, y + h + 8, barW * timePercent, 4);
    }
}

function drawSniperTracers() {
    sniperTracers.forEach(tracer => {
        const alpha = tracer.life / SNIPER_CONFIG.tracerDuration;
        
        // Glow
        ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.4})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(tracer.startX, tracer.startY);
        ctx.lineTo(tracer.endX, tracer.endY);
        ctx.stroke();
        
        // Linha principal
        ctx.strokeStyle = `rgba(255, 255, 220, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tracer.startX, tracer.startY);
        ctx.lineTo(tracer.endX, tracer.endY);
        ctx.stroke();
    });
}

function drawSniperCrosshair() {
    const cfg = SNIPER_CONFIG;
    
    // Posição final
    const cx = sniperCrosshairX + sniperSway.x + sniperRecoil.x;
    const cy = sniperCrosshairY + sniperSway.y + sniperRecoil.y;
    
    // Cor muda quando estável
    const isStable = sniperBreathHeld;
    const color = isStable ? '#00ff00' : cfg.crosshairColor;
    const alpha = isStable ? 1 : 0.9;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Linhas principais
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const lineLen = 35;
    const gap = 12;
    
    ctx.beginPath();
    // Horizontal
    ctx.moveTo(cx - lineLen - gap, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + lineLen + gap, cy);
    // Vertical
    ctx.moveTo(cx, cy - lineLen - gap);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + lineLen + gap);
    ctx.stroke();
    
    // Marcadores nas linhas
    ctx.lineWidth = 1;
    [-20, 20].forEach(offset => {
        ctx.beginPath();
        ctx.moveTo(cx + offset, cy - 5);
        ctx.lineTo(cx + offset, cy + 5);
        ctx.moveTo(cx - 5, cy + offset);
        ctx.lineTo(cx + 5, cy + offset);
        ctx.stroke();
    });
    
    // Ponto central
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, isStable ? 2 : 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mil-dots (marcadores de distância)
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    
    for (let i = 1; i <= 3; i++) {
        const dotY = cy + i * 30;
        ctx.beginPath();
        ctx.moveTo(cx - 10, dotY);
        ctx.lineTo(cx + 10, dotY);
        ctx.stroke();
        ctx.fillText((i * 100) + 'm', cx - 14, dotY + 3);
    }
    
    ctx.restore();
    
    // Indicador visual de sway (quando não estável)
    if (!isStable && (Math.abs(sniperSway.x) > 3 || Math.abs(sniperSway.y) > 3)) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sniperCrosshairX, sniperCrosshairY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawSniperHUD() {
    const cfg = SNIPER_CONFIG;
    
    // ===== PAINEL INFERIOR ESQUERDO - MUNIÇÃO =====
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(10, canvas.height - 100, 150, 85);
    ctx.strokeStyle = '#4a6a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 100, 150, 85);
    
    // Ícone de rifle
    ctx.fillStyle = '#888';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎯', 20, canvas.height - 65);
    
    // Munição ou reload
    if (sniperReloading) {
        const progress = 1 - (sniperReloadTimer / cfg.reloadTime);
        
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('RELOAD', 55, canvas.height - 70);
        
        // Barra
        ctx.fillStyle = '#333';
        ctx.fillRect(55, canvas.height - 60, 95, 12);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(55, canvas.height - 60, 95 * progress, 12);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(55, canvas.height - 60, 95, 12);
    } else {
        ctx.fillStyle = sniperAmmo > 1 ? '#00ff00' : '#ff0000';
        ctx.font = 'bold 28px monospace';
        ctx.fillText(sniperAmmo + '/' + cfg.maxAmmo, 55, canvas.height - 58);
    }
    
    // Stats
    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('KILLS: ' + sniperKills + '/' + cfg.targetKills, 20, canvas.height - 30);
    ctx.fillStyle = '#888';
    ctx.fillText('MISS: ' + sniperMissedShots, 110, canvas.height - 30);
    
    // ===== TIMER SUPERIOR =====
    const seconds = Math.ceil(sniperTimeRemaining / 60);
    const timerColor = seconds <= 15 ? '#ff0000' : seconds <= 30 ? '#ffaa00' : '#ffffff';
    const timerPulse = seconds <= 15 ? 1 + Math.sin(frameCount * 0.2) * 0.1 : 1;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - 70, 8, 140, 40);
    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 70, 8, 140, 40);
    
    ctx.fillStyle = timerColor;
    ctx.font = `bold ${24 * timerPulse}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('⏱ ' + seconds + 's', canvas.width / 2, 38);
    
    // ===== BARRA DE RESPIRAÇÃO =====
    const barWidth = 120;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = 58;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 5, barY - 3, barWidth + 10, 22);
    
    if (sniperBreathHeld) {
        const breathPercent = sniperBreathTimer / cfg.holdBreathDuration;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, 10);
        ctx.fillStyle = breathPercent > 0.3 ? '#00cc00' : '#ccaa00';
        ctx.fillRect(barX, barY, barWidth * breathPercent, 10);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🫁 ESTÁVEL', canvas.width / 2, barY + 20);
    } else if (sniperBreathCooldown > 0) {
        const cdPercent = 1 - (sniperBreathCooldown / cfg.holdBreathCooldown);
        
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, 10);
        ctx.fillStyle = '#666';
        ctx.fillRect(barX, barY, barWidth * cdPercent, 10);
        
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💨 RECUPERANDO', canvas.width / 2, barY + 20);
    } else {
        ctx.fillStyle = '#555';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[SHIFT] Segurar Fôlego', canvas.width / 2, barY + 10);
    }
    
    // ===== KILL STREAK =====
    if (sniperKillStreak >= 3) {
        const streakPulse = 1 + Math.sin(frameCount * 0.15) * 0.1;
        ctx.fillStyle = '#ff6600';
        ctx.font = `bold ${18 * streakPulse}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText('🔥 ' + sniperKillStreak + 'x', canvas.width - 20, 35);
    }
    
    // ===== CIVIS =====
    if (sniperCivilianHits > 0) {
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('⚠️ CIVIS: -' + sniperCivilianHits, canvas.width - 20, 55);
    }
    
    // ===== TIER =====
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TIER ' + (sniperCurrentTier + 1), 20, 25);
    
    // ===== INSTRUÇÕES INICIAIS =====
    if (sniperTimeRemaining > cfg.timeLimit * 60 - 240) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🖱️ Mire | CLICK Atirar | SHIFT Estabilizar | R Recarregar', 
            canvas.width / 2, canvas.height - 15);
    }
}
