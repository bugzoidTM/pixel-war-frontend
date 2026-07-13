// ============ FASE BÔNUS (PONTUAÇÃO EXPERT) ============
// Fase extra entre a fase 3 e a 4, desbloqueada ao atingir a pontuação
// expert. 30 segundos sem dano: derrube balões e drones, colete os
// suprimentos de paraquedas. Todos os pontos vão direto para o total.

const BONUS_STAGE = {
    afterLevelIndex: 3,      // Entra quando currentLevelIndex chega a 3 (entre fase 3 e 4)
    expertScore: 3000,       // Pontuação total necessária para desbloquear
    duration: 30 * 60,       // 30 segundos a 60fps

    balloonSpawnRate: 50,    // Frames entre balões
    droneSpawnRate: 150,     // Frames entre drones dourados
    chuteSpawnRate: 130,     // Frames entre paraquedas de suprimento

    balloonPoints: 100,
    dronePoints: 300,
    chutePoints: 150,
    chuteHeal: 10            // HP recuperado ao coletar suprimento
};

let bonusStagePlayed = false;
let lastBonusResult = null;  // Pontos ganhos na última fase bônus (para a tela de classes)
let bonusTimeLeft = 0;
let bonusScore = 0;
let bonusTargets = [];       // Balões e drones
let bonusChutes = [];        // Caixas de paraquedas
let bonusEndTimer = 0;

function shouldEnterBonusStage() {
    return !bonusStagePlayed &&
        currentLevelIndex === BONUS_STAGE.afterLevelIndex &&
        currentLevelIndex < levels.length &&
        totalScore >= BONUS_STAGE.expertScore;
}

function startBonusStage() {
    bonusStagePlayed = true;
    const name = I18n.currentLang === 'pt' ? 'FASE BÔNUS!' : 'BONUS STAGE!';

    if (typeof playArcadeTransition === 'function') {
        gameState = 'TRANSITION';
        playArcadeTransition(name, () => {
            initBonusStage();
            gameState = 'BONUS';
        });
    } else {
        initBonusStage();
        gameState = 'BONUS';
    }
}

function initBonusStage() {
    bonusTimeLeft = BONUS_STAGE.duration;
    bonusScore = 0;
    bonusTargets = [];
    bonusChutes = [];
    bonusEndTimer = 0;

    enemies = [];
    projectiles = [];
    particles = [];
    bonusCrates = [];
    floatingTexts = [];

    // Limpar powerup ativo da fase anterior
    activePowerup = null;
    powerupTimer = 0;
    const powerupPanel = document.getElementById('powerup-panel');
    if (powerupPanel) powerupPanel.classList.remove('active');

    player.x = canvas.width / 2 - player.w / 2;
    player.y = canvas.height - 120;
    canvas.style.cursor = 'none';

    const msg = I18n.currentLang === 'pt'
        ? '⭐ PONTUAÇÃO EXPERT! Pontue o máximo!'
        : '⭐ EXPERT SCORE! Rack up points!';
    floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height / 2 - 60, msg, '#ffd700'));

    AudioEngine.playMusic();
    console.log('⭐ Fase bônus iniciada! Expert:', totalScore, '>=', BONUS_STAGE.expertScore);
}

// ---------- Spawns ----------

function spawnBonusBalloon() {
    bonusTargets.push({
        kind: 'balloon',
        x: 40 + Math.random() * (canvas.width - 80),
        y: canvas.height + 30,
        w: 26, h: 36,
        vy: -(1.0 + Math.random() * 1.2),
        wobblePhase: Math.random() * Math.PI * 2,
        color: ['#e74c3c', '#3498db', '#9b59b6', '#e67e22'][Math.floor(Math.random() * 4)],
        points: BONUS_STAGE.balloonPoints,
        dead: false
    });
}

function spawnBonusDrone() {
    const fromLeft = Math.random() > 0.5;
    bonusTargets.push({
        kind: 'drone',
        x: fromLeft ? -40 : canvas.width + 40,
        y: 70 + Math.random() * 220,
        w: 32, h: 16,
        vx: (3 + Math.random() * 1.5) * (fromLeft ? 1 : -1),
        wobblePhase: Math.random() * Math.PI * 2,
        points: BONUS_STAGE.dronePoints,
        dead: false
    });
}

function spawnBonusChute() {
    bonusChutes.push({
        x: 50 + Math.random() * (canvas.width - 100),
        y: -50,
        w: 26, h: 24,
        vy: 1.1 + Math.random() * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        dead: false
    });
}

// ---------- Update ----------

function updateBonusStage() {
    // Resumo final por ~2.5s antes de voltar ao fluxo normal
    if (bonusTimeLeft <= 0) {
        bonusEndTimer++;
        if (bonusEndTimer === 1) AudioEngine.playVictory();
        if (bonusEndTimer >= 150) finishBonusStage();
        return;
    }

    bonusTimeLeft--;

    // Score visual durante o bônus
    score = totalScore + bonusScore;

    // Movimento livre do jogador (WASD/setas) — sem dano nesta fase
    player.vx = 0;
    player.vy = 0;
    player.isMoving = false;
    if (keys.w || keys.W || keys.ArrowUp) { player.vy = -player.speed; player.isMoving = true; }
    if (keys.s || keys.S || keys.ArrowDown) { player.vy = player.speed; player.isMoving = true; }
    if (keys.a || keys.A || keys.ArrowLeft) { player.vx = -player.speed; player.isMoving = true; }
    if (keys.d || keys.D || keys.ArrowRight) { player.vx = player.speed; player.isMoving = true; }
    player.x += player.vx;
    player.y += player.vy;
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

    // Direção baseada no mouse
    const pc = player.getCenter();
    const mdx = mouseX - pc.x;
    const mdy = mouseY - pc.y;
    if (Math.abs(mdx) > Math.abs(mdy)) {
        player.direction = mdx > 0 ? 1 : 3;
    } else {
        player.direction = mdy > 0 ? 2 : 0;
    }

    // Tiro com munição infinita
    player.ammo = player.maxAmmo;
    player.reloading = false;
    if (player.cooldown > 0) player.cooldown--;
    if (player.invulnTime > 0) player.invulnTime--;
    if (player.flashTime > 0) player.flashTime--;
    if (mouseDown && player.cooldown <= 0) player.shoot();

    // Spawns
    if (bonusTimeLeft % BONUS_STAGE.balloonSpawnRate === 0) spawnBonusBalloon();
    if (bonusTimeLeft % BONUS_STAGE.droneSpawnRate === 0) spawnBonusDrone();
    if (bonusTimeLeft % BONUS_STAGE.chuteSpawnRate === 0) spawnBonusChute();

    // Atualizar alvos
    bonusTargets.forEach(t => {
        t.wobblePhase += 0.06;
        if (t.kind === 'balloon') {
            t.y += t.vy;
            t.x += Math.sin(t.wobblePhase) * 0.8;
            if (t.y + t.h < -20) t.dead = true; // Escapou por cima
        } else {
            t.x += t.vx;
            t.y += Math.sin(t.wobblePhase) * 0.7;
            if (t.x < -60 || t.x > canvas.width + 60) t.dead = true;
        }
    });

    // Atualizar paraquedas + coleta por contato
    bonusChutes.forEach(c => {
        c.swayPhase += 0.04;
        c.y += c.vy;
        c.x += Math.sin(c.swayPhase) * 0.9;
        if (c.y > canvas.height + 30) c.dead = true;

        if (!c.dead &&
            player.x < c.x + c.w && player.x + player.w > c.x &&
            player.y < c.y + c.h && player.y + player.h > c.y) {
            c.dead = true;
            bonusScore += BONUS_STAGE.chutePoints;
            player.hp = Math.min(player.maxHp, player.hp + BONUS_STAGE.chuteHeal);
            floatingTexts.push(new FloatingText(c.x, c.y, '+' + BONUS_STAGE.chutePoints + ' 📦', '#00ff88'));
            AudioEngine.playPowerup && AudioEngine.playPowerup();
        }
    });

    // Projéteis do jogador vs alvos e paraquedas
    projectiles.forEach(p => {
        if (!p.isPlayer || p.dead) return;

        bonusTargets.forEach(t => {
            if (!t.dead &&
                p.x < t.x + t.w && p.x + p.size > t.x &&
                p.y < t.y + t.h && p.y + p.size > t.y) {
                t.dead = true;
                p.dead = true;
                bonusScore += t.points;
                const color = t.kind === 'drone' ? '#ffd700' : t.color;
                createExplosion(t.x + t.w / 2, t.y + t.h / 2, color, t.kind === 'drone' ? 15 : 10);
                floatingTexts.push(new FloatingText(t.x, t.y, '+' + t.points, t.kind === 'drone' ? '#ffd700' : '#ffffff'));
                AudioEngine.playExplosion && AudioEngine.playExplosion();
            }
        });

        bonusChutes.forEach(c => {
            if (!c.dead && !p.dead &&
                p.x < c.x + c.w && p.x + p.size > c.x &&
                p.y < c.y + c.h && p.y + p.size > c.y) {
                c.dead = true;
                p.dead = true;
                bonusScore += BONUS_STAGE.chutePoints;
                createExplosion(c.x + c.w / 2, c.y + c.h / 2, '#8B4513', 8);
                floatingTexts.push(new FloatingText(c.x, c.y, '+' + BONUS_STAGE.chutePoints, '#00ff88'));
            }
        });
    });

    bonusTargets = bonusTargets.filter(t => !t.dead);
    bonusChutes = bonusChutes.filter(c => !c.dead);
    projectiles = projectiles.filter(p => !p.dead);

    // HUD
    const secs = Math.ceil(bonusTimeLeft / 60);
    const label = I18n.currentLang === 'pt' ? '⭐ BÔNUS' : '⭐ BONUS';
    document.getElementById('objective-text').innerText = label + ': ' + secs + 's | +' + bonusScore.toLocaleString();
}

function finishBonusStage() {
    // Pontos do bônus vão direto para o total (sem risco de rollback)
    totalScore += bonusScore;
    phaseScore = 0;
    score = totalScore;
    lastBonusResult = bonusScore;
    console.log('⭐ Bônus finalizado! +' + bonusScore + ' | Total:', totalScore);

    if (totalScore > bestScore) {
        bestScore = totalScore;
        if (typeof HighScoreManager !== 'undefined') {
            HighScoreManager.submitToServer(totalScore, selectedClass, currentLevelIndex + 1, false);
        }
    }

    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn() &&
        typeof saveCurrentProgress === 'function') {
        saveCurrentProgress().catch(() => {});
    }

    canvas.style.cursor = 'default';
    showClassChangeScreen();
}

// ---------- Draw ----------

function drawBonusStage() {
    // Céu "golden hour" — visual distinto das fases normais
    const horizonY = Math.floor(canvas.height * 0.55);
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, '#ffd98a');
    sky.addColorStop(0.6, '#ffb26a');
    sky.addColorStop(1, '#ff8a5a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, horizonY);

    // Sol
    ctx.fillStyle = '#fff2c0';
    ctx.fillRect(canvas.width * 0.75 - 30, 60, 60, 60);
    ctx.fillStyle = 'rgba(255, 242, 192, 0.35)';
    ctx.fillRect(canvas.width * 0.75 - 40, 50, 80, 80);

    // Silhueta de montanhas ao pôr do sol
    if (typeof drawParallaxMountains === 'function') {
        drawParallaxMountains(parallaxScrollX * 0.3, canvas.height * 0.4, '#8a5a3a', 4);
    }

    // Chão (reusa o sistema de chão do parallax)
    if (typeof drawParallaxGround === 'function') {
        drawParallaxGround('#5a7a3a');
    }

    // Paraquedas de suprimento
    bonusChutes.forEach(c => drawBonusChute(ctx, c));

    // Alvos
    bonusTargets.forEach(t => {
        if (t.kind === 'balloon') drawBonusBalloon(ctx, t);
        else drawBonusDrone(ctx, t);
    });

    // Jogador e projéteis
    player.draw(ctx);
    projectiles.forEach(p => { p.update(); p.draw(ctx); });

    // Partículas e textos
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    floatingTexts.forEach(t => { t.update(); t.draw(ctx); });

    // Timer grande no topo
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (bonusTimeLeft > 0) {
        const secs = Math.ceil(bonusTimeLeft / 60);
        const urgent = secs <= 5;
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText(secs + 's', canvas.width / 2 + 2, 22);
        ctx.fillStyle = urgent ? '#ff4444' : '#ffffff';
        ctx.fillText(secs + 's', canvas.width / 2, 20);
    } else {
        // Resumo final
        const doneText = I18n.currentLang === 'pt' ? 'BÔNUS COMPLETO!' : 'BONUS COMPLETE!';
        ctx.font = 'bold 28px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText(doneText, canvas.width / 2 + 3, canvas.height / 2 - 37);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(doneText, canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText('+' + bonusScore.toLocaleString(), canvas.width / 2 + 2, canvas.height / 2 + 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('+' + bonusScore.toLocaleString(), canvas.width / 2, canvas.height / 2 + 10);
    }
    ctx.restore();

    // Mira
    if (typeof drawCrosshair === 'function' && bonusTimeLeft > 0) {
        drawCrosshair(ctx, true);
    }
}

function drawBonusBalloon(ctx, t) {
    ctx.save();
    // Balão
    ctx.fillStyle = '#000000';
    ctx.fillRect(t.x - 1, t.y - 1, t.w + 2, t.h - 9);
    ctx.fillStyle = t.color;
    ctx.fillRect(t.x, t.y, t.w, t.h - 11);
    // Brilho
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(t.x + 4, t.y + 3, 6, 8);
    // Cordas
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(t.x + 4, t.y + t.h - 11);
    ctx.lineTo(t.x + t.w / 2, t.y + t.h - 2);
    ctx.moveTo(t.x + t.w - 4, t.y + t.h - 11);
    ctx.lineTo(t.x + t.w / 2, t.y + t.h - 2);
    ctx.stroke();
    // Cesta
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(t.x + t.w / 2 - 4, t.y + t.h - 4, 8, 6);
    ctx.restore();
}

function drawBonusDrone(ctx, t) {
    ctx.save();
    // Corpo dourado
    ctx.fillStyle = '#000000';
    ctx.fillRect(t.x - 1, t.y - 1, t.w + 2, t.h + 2);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.fillStyle = '#cca020';
    ctx.fillRect(t.x, t.y + t.h - 5, t.w, 5);
    // Hélices (giram)
    const spin = Math.sin(frameCount * 0.8) > 0 ? 10 : 4;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(t.x + 3 - spin / 2, t.y - 4, spin, 2);
    ctx.fillRect(t.x + t.w - 3 - spin / 2, t.y - 4, spin, 2);
    // Luz piscando
    if (Math.floor(frameCount / 10) % 2 === 0) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(t.x + t.w / 2 - 2, t.y + 4, 4, 4);
    }
    ctx.restore();
}

function drawBonusChute(ctx, c) {
    ctx.save();
    // Paraquedas (semicírculo)
    ctx.fillStyle = '#f0f0e0';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y, c.w * 0.8, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#c0c0b0';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Cordas
    ctx.strokeStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.moveTo(c.x + c.w / 2 - c.w * 0.7, c.y);
    ctx.lineTo(c.x + 4, c.y + 10);
    ctx.moveTo(c.x + c.w / 2 + c.w * 0.7, c.y);
    ctx.lineTo(c.x + c.w - 4, c.y + 10);
    ctx.stroke();
    // Caixa
    ctx.fillStyle = '#000000';
    ctx.fillRect(c.x - 1, c.y + 9, c.w + 2, c.h - 8);
    ctx.fillStyle = '#a0703a';
    ctx.fillRect(c.x, c.y + 10, c.w, c.h - 10);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(c.x + c.w / 2 - 2, c.y + 10, 4, c.h - 10);
    ctx.fillRect(c.x, c.y + 10 + (c.h - 10) / 2 - 2, c.w, 4);
    ctx.restore();
}
