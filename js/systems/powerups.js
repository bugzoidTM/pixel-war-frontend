// ============ POWERUP SYSTEM ============
// Sistema de power-ups do jogo

function spawnBonusCrate() {
    const lvl = levels[currentLevelIndex];
    const isShmup = lvl && lvl.type === 'shmup';
    
    for (let i = 0; i < 2; i++) {
        const padding = 60;
        let x, y;
        
        if (isShmup) {
            // No shmup, powerups aparecem no topo e descem
            x = padding + Math.random() * (canvas.width - padding * 2);
            y = -30 - Math.random() * 50;
        } else {
            x = padding + Math.random() * (canvas.width - padding * 2);
            y = padding + Math.random() * (canvas.height - padding * 2);
        }
        
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        const crate = {
            x, y, w: 28, h: 28,
            type,
            spawnTime: frameCount,
            pulsePhase: Math.random() * Math.PI * 2,
            lifetime: POWERUP_LIFETIME,
            dead: false,
            // Propriedades de movimento para shmup
            vx: isShmup ? (Math.random() - 0.5) * 3 : 0,
            vy: isShmup ? 2 + Math.random() * 1.5 : 0,
            wobblePhase: Math.random() * Math.PI * 2,
            isShmupCrate: isShmup
        };
        
        bonusCrates.push(crate);
        console.log('💎 Powerup spawnado:', type.name, 'em', Math.round(x), Math.round(y));
    }
}

function collectPowerup(crate) {
    const type = crate.type;
    
    if (type.effect === 'heal') {
        const healAmount = Math.floor(player.maxHp * 0.5);
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        const actualHeal = player.hp - oldHp;
        
        floatingTexts.push(new FloatingText(
            player.x + player.w / 2,
            player.y,
            '+' + actualHeal + ' HP!',
            type.color
        ));
        
        console.log('❤️ Cura coletada: +' + actualHeal + ' HP');
        AudioEngine.playPowerup();
        createExplosion(crate.x + crate.w/2, crate.y + crate.h/2, type.color, 8);
        return;
    }
    
    activePowerup = type;
    powerupDuration = type.duration;
    powerupTimer = type.duration;
    
    const panel = document.getElementById('powerup-panel');
    panel.style.borderColor = type.color;
    document.getElementById('powerup-icon').textContent = type.icon;
    document.getElementById('powerup-name').textContent = type.name;
    document.getElementById('powerup-name').style.color = type.color;
    panel.classList.add('active');
    
    floatingTexts.push(new FloatingText(
        player.x + player.w / 2,
        player.y,
        type.msg,
        type.color
    ));
    
    console.log('✨ Powerup coletado:', type.name);
    AudioEngine.playPowerup();
    createExplosion(crate.x + crate.w/2, crate.y + crate.h/2, type.color, 8);
}

function updatePowerup() {
    if (activePowerup && powerupTimer > 0) {
        powerupTimer--;
        
        const percent = (powerupTimer / powerupDuration) * 100;
        const timerFill = document.getElementById('powerup-timer-fill');
        const panel = document.getElementById('powerup-panel');
        
        timerFill.style.width = percent + '%';
        timerFill.style.background = 
            `linear-gradient(90deg, ${activePowerup.color}, ${activePowerup.color}88)`;
        
        if (powerupTimer <= 180) {
            const blinkSpeed = powerupTimer < 60 ? 0.5 : (powerupTimer < 120 ? 0.3 : 0.2);
            panel.style.opacity = Math.sin(frameCount * blinkSpeed) > 0 ? '1' : '0.4';
        } else {
            panel.style.opacity = '1';
        }
        
        if (powerupTimer <= 0) {
            activePowerup = null;
            panel.classList.remove('active');
            panel.style.opacity = '1';
            console.log('⏰ Powerup expirou');
        }
    }
}

function hasPowerup(effect) {
    return activePowerup && activePowerup.effect === effect;
}
