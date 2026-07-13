// ============ ENTITY CLASSES ============

class Entity {
    constructor(x, y, w, h, speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.vx = 0;
        this.vy = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.dead = false;
        this.direction = 0;
        this.flashTime = 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.flashTime > 0) this.flashTime--;
    }
    
    getCenter() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }
    
    takeDamage(amount) {
        // Jogador tem frames de invulnerabilidade após levar dano
        // (evita morte instantânea por dano de contato aplicado a cada frame)
        if (this === player) {
            if (this.invulnTime > 0) return;
            this.invulnTime = 40;
        }

        this.hp -= amount;
        this.flashTime = 5;
        addScreenShake(3);
        if (this !== player) AudioEngine.playDamage();

        // Trigger UI damage pulse for player
        if (this === player && typeof triggerDamagePulse === 'function') {
            const intensity = Math.min(amount / this.maxHp, 1);
            triggerDamagePulse(intensity);
        }
    }
}

class Player extends Entity {
    constructor(type) {
        super(450, 325, 28, 32, 3);
        this.type = type;
        this.cooldown = 0;
        this.maxCooldown = 15;
        this.ammo = 50;
        this.maxAmmo = 50;
        this.reloading = false;
        this.damage = 10;
        this.isMoving = false;
        this.invulnTime = 0; // Frames de invulnerabilidade após levar dano
        
        // Side-scroller physics (para fase train)
        this.grounded = true;
        this.velocityY = 0;
        this.groundY = TRAIN_CONFIG.groundY;
        
        // Try to get stats from server first, fallback to defaults
        let cfg = DataLoader.getClassStats(type);
        
        // Fallback to hardcoded defaults if server data not available
        if (!cfg) {
            const defaultClassConfig = {
                soldier: { width: 24, height: 28, speed: 4, maxHp: 80, maxCooldown: 10, damage: 10 },
                tank: { width: 44, height: 44, speed: 2, maxHp: 200, maxCooldown: 30, damage: 25 },
                plane: { width: 32, height: 32, speed: 6, maxHp: 60, maxCooldown: 5, damage: 8 },
                ship: { width: 52, height: 28, speed: 2.5, maxHp: 150, maxCooldown: 12, damage: 15 }
            };
            cfg = defaultClassConfig[type];
            console.warn('⚠️ Using fallback class stats for:', type);
        }
        
        this.w = cfg.width || cfg.w;
        this.h = cfg.height || cfg.h;
        this.speed = cfg.speed;
        this.maxHp = cfg.maxHp;
        this.maxCooldown = cfg.maxCooldown;
        this.damage = cfg.damage;
        this.hp = this.maxHp;
        this.maxAmmo = cfg.ammo || 50;
        this.ammo = this.maxAmmo;
    }
    
    update() {
        if (this.invulnTime > 0) this.invulnTime--;
        if (shotBuffer > 0) shotBuffer--;

        const isTrainLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'train';
        const isWinterLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'winter';
        const isShmupLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'shmup';
        const isEscapeLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'escape';
        const isSniperLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'sniper';
        
        // SNIPER MODE - Posição estática, controle de mira
        if (isSniperLevel) {
            // Player fica invisível/estático - não se move
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;
            
            // Crosshair segue o mouse
            sniperCrosshairX = mouseX;
            sniperCrosshairY = mouseY;
            
            // Segurar respiração com Shift
            if (keys.Shift && !sniperBreathHeld && sniperBreathCooldown <= 0) {
                sniperHoldBreath();
            }
            
            // Atirar com clique do mouse
            if ((mouseDown || shotBuffer > 0) && this.cooldown <= 0) {
                shotBuffer = 0;
                sniperShoot();
                this.cooldown = 20; // Cooldown mínimo para evitar cliques duplos
            }
            
            // Recarregar manualmente com R
            if (keys.r || keys.R) {
                if (!sniperReloading && sniperAmmo < SNIPER_CONFIG.maxAmmo) {
                    startSniperReload();
                }
            }
            
            if (this.cooldown > 0) this.cooldown--;
            if (this.flashTime > 0) this.flashTime--;
            
            return; // Não executar resto do update
        }
        
        // ESCAPE MODE - Fuga do Mega Tank (side-scroller horizontal)
        if (isEscapeLevel) {
            const cfg = ESCAPE_CONFIG;
            this.vx = 0;
            this.isMoving = false;
            
            // Movimento horizontal
            const escapeSpeed = this.speed * cfg.playerSpeedBoost;
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx = -escapeSpeed; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx = escapeSpeed; this.isMoving = true; }
            
            // Pulo com W, seta cima ou Espaço
            if ((keys.w || keys.W || keys.ArrowUp || keys[' ']) && this.grounded) {
                this.velocityY = cfg.jumpForce;
                this.grounded = false;
                AudioEngine.playJump && AudioEngine.playJump();
            }
            
            // Aplicar gravidade
            if (!this.velocityY) this.velocityY = 0;
            this.velocityY += cfg.gravity;
            this.y += this.velocityY;
            
            // Chão
            if (this.y + this.h >= cfg.groundY) {
                this.y = cfg.groundY - this.h;
                this.velocityY = 0;
                this.grounded = true;
            }
            
            // Aplicar movimento horizontal
            this.x += this.vx;
            
            // Limites da tela - direita
            if (this.x + this.w > canvas.width - 20) this.x = canvas.width - 20 - this.w;
            
            // COLISÃO COM O MEGA TANK = MORTE INSTANTÂNEA!
            const bossRightEdge = escapeBossX + ESCAPE_CONFIG.bossWidth;
            if (this.x < bossRightEdge + cfg.deathZoneBuffer) {
                // Empurrar jogador para longe do boss
                this.x = bossRightEdge + cfg.deathZoneBuffer;
                
                // Se o boss alcançou demais, MORTE!
                if (bossRightEdge > this.x - 10) {
                    this.hp = 0;
                    floatingTexts.push(new FloatingText(this.x, this.y, '💀 ESMAGADO!', '#ff0000'));
                    addScreenShake(20);
                }
            }
            
            // Se o boss passou do meio da tela, game over
            if (escapeBossX + ESCAPE_CONFIG.bossWidth > canvas.width * 0.7) {
                this.hp = 0;
                floatingTexts.push(new FloatingText(canvas.width/2, canvas.height/2, '💀 ALCANÇADO!', '#ff0000'));
            }
            if (this.y < 0) this.y = 0;
            
            // Direção baseada no mouse (pode atirar para trás!)
            const dx = mouseX - (this.x + this.w/2);
            if (Math.abs(dx) > 10) {
                this.direction = dx > 0 ? 1 : 3;
            }
            
            // Decrementar cooldown e flash
            if (this.cooldown > 0) this.cooldown--;
            if (this.flashTime > 0) this.flashTime--;
            
            // Tiro normal (controlado pelo mouse)
            if ((mouseDown || shotBuffer > 0) && this.cooldown <= 0 && this.ammo > 0 && !this.reloading) {
                this.shoot();
            }
            
            // Auto-reload
            if (this.ammo <= 0 && !this.reloading) {
                this.reloading = true;
                setTimeout(() => {
                    this.ammo = this.maxAmmo;
                    this.reloading = false;
                }, 1500);
            }
            
            return;
        }
        
        // SHMUP MODE - Vertical shooter (apenas movimento horizontal)
        if (isShmupLevel) {
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;
            
            // Movimento horizontal rápido apenas
            const shmupSpeed = this.speed * SHMUP_CONFIG.playerSpeedBoost;
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx = -shmupSpeed; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx = shmupSpeed; this.isMoving = true; }
            
            // Pequeno movimento vertical para ajuste fino
            if (keys.w || keys.W || keys.ArrowUp) { this.vy = -shmupSpeed * 0.5; this.isMoving = true; }
            if (keys.s || keys.S || keys.ArrowDown) { this.vy = shmupSpeed * 0.5; this.isMoving = true; }
            
            // Aplicar movimento
            this.x += this.vx;
            this.y += this.vy;
            
            // Limites da tela (não pode sair)
            if (this.x < 0) this.x = 0;
            if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
            
            // Y restrito à área inferior
            const minY = canvas.height - 200;
            const maxY = canvas.height - 50;
            if (this.y < minY) this.y = minY;
            if (this.y + this.h > maxY) this.y = maxY - this.h;
            
            // Sempre olhando para cima
            this.direction = 0;
            
            // IMPORTANTE: Decrementar cooldown e flash (senão trava)
            if (this.cooldown > 0) this.cooldown--;
            if (this.flashTime > 0) this.flashTime--;
            
            // AUTO-FIRE no modo shmup (atira para cima automaticamente)
            if (this.cooldown <= 0 && this.ammo > 0 && !this.reloading) {
                this.shmupShoot();
            }
            
            // Auto-reload quando munição acaba
            if (this.ammo <= 0 && !this.reloading) {
                this.reloading = true;
                setTimeout(() => {
                    this.ammo = this.maxAmmo;
                    this.reloading = false;
                }, 1500);
            }
            
            return; // Não executar o resto do update
        }
        
        // Side-scroller mode (fase train com soldado)
        if (isTrainLevel && this.type === 'soldier') {
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;
            
            // Movimento horizontal apenas (A/D ou setas)
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx = -this.speed; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx = this.speed; this.isMoving = true; }
            
            // Pulo com espaço ou seta cima (sem duplo pulo)
            if ((keys[' '] || keys.ArrowUp) && this.grounded) {
                this.velocityY = TRAIN_CONFIG.jumpForce;
                this.grounded = false;
                AudioEngine.playExplosion(); // Som de pulo
            }
            
            // Aplicar gravidade
            this.velocityY += TRAIN_CONFIG.gravity;
            this.y += this.velocityY;
            
            // Colisão com o chão (topo do trem)
            if (this.y + this.h >= this.groundY) {
                this.y = this.groundY - this.h;
                this.velocityY = 0;
                this.grounded = true;
            }
            
            // Limitar X na tela (pode mover horizontalmente)
            if (this.x < 50) this.x = 50;
            if (this.x + this.w > canvas.width - 50) this.x = canvas.width - this.w - 50;
            
            // Direção sempre para a direita (side-scroller)
            this.direction = 1;
            
        } else if (isWinterLevel) {
            // WINTER MODE - Física de gelo (escorregadio)
            this.isMoving = false;
            
            // Aceleração gradual em vez de velocidade instantânea
            const accel = WINTER_CONFIG.accelerationRate;
            if (keys.w || keys.W || keys.ArrowUp) { this.vy -= accel; this.isMoving = true; }
            if (keys.s || keys.S || keys.ArrowDown) { this.vy += accel; this.isMoving = true; }
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx -= accel; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx += accel; this.isMoving = true; }
            
            // Aplicar fricção do gelo (continua deslizando)
            this.vx *= WINTER_CONFIG.friction;
            this.vy *= WINTER_CONFIG.friction;
            
            // Limitar velocidade máxima
            const maxSpeed = WINTER_CONFIG.maxSlideSpeed;
            this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
            this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));
            
            // Aplicar vento
            this.vx += winterWindDirection * winterWindForce;
            
            // Direção baseada no mouse
            const center = this.getCenter();
            const dx = mouseX - center.x;
            const dy = mouseY - center.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 1 : 3;
            } else {
                this.direction = dy > 0 ? 2 : 0;
            }
            
            // Limites da tela
            if (this.x < 0) { this.x = 0; this.vx = 0; }
            if (this.y < 0) { this.y = 0; this.vy = 0; }
            if (this.x + this.w > canvas.width) { this.x = canvas.width - this.w; this.vx = 0; }
            if (this.y + this.h > canvas.height) { this.y = canvas.height - this.h; this.vy = 0; }
            
        } else if (levels[currentLevelIndex] && levels[currentLevelIndex].type === 'skyfortress') {
            // SKY FORTRESS - Side-scrolling com gravidade e pulo
            const cfg = SKYFORTRESS_CONFIG;
            this.vx = 0;
            this.isMoving = false;
            
            // Movimento horizontal (A/D ou setas)
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx = -this.speed * 1.2; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx = this.speed * 1.2; this.isMoving = true; }
            
            // Pulo com W, seta cima ou Espaço (apenas quando no chão)
            if ((keys.w || keys.W || keys.ArrowUp || keys[' ']) && skyPlayerGrounded) {
                skyPlayerVY = cfg.jumpForce;
                skyPlayerGrounded = false;
                if (AudioEngine.playJump) AudioEngine.playJump();
            }
            
            // Aplicar gravidade
            skyPlayerVY += cfg.gravity;
            if (skyPlayerVY > cfg.maxFallSpeed) skyPlayerVY = cfg.maxFallSpeed;
            
            // Aplicar vento (se ativo)
            if (skyWindActive) {
                this.vx += skyWindDirection * cfg.windForce * 8;
            }
            
            // Aplicar fricção horizontal
            if (skyPlayerGrounded) {
                this.vx *= cfg.groundFriction;
            } else {
                this.vx *= cfg.airFriction;
            }
            
            // Mover
            this.x += this.vx;
            this.y += skyPlayerVY;
            
            // Colisão com a plataforma (pousar em cima)
            const platLeft = cfg.platformX;
            const platRight = cfg.platformX + cfg.platformWidth;
            const platTop = cfg.platformY;
            
            // Verificar se está acima da plataforma e caindo
            if (skyPlayerVY > 0 && 
                this.x + this.w > platLeft && 
                this.x < platRight &&
                this.y + this.h >= platTop && 
                this.y + this.h <= platTop + skyPlayerVY + 10) {
                // Pousar na plataforma
                this.y = platTop - this.h;
                skyPlayerVY = 0;
                skyPlayerGrounded = true;
            } else if (this.y + this.h < platTop || this.x + this.w <= platLeft || this.x >= platRight) {
                // Não está na plataforma
                skyPlayerGrounded = false;
            }
            
            // Limites horizontais da tela
            if (this.x < cfg.minX) this.x = cfg.minX;
            if (this.x + this.w > cfg.maxX) this.x = cfg.maxX - this.w;
            
            // Limite superior
            if (this.y < 50) this.y = 50;
            
            // Direção baseada no mouse
            const dx = mouseX - (this.x + this.w / 2);
            if (Math.abs(dx) > 10) {
                this.direction = dx > 0 ? 1 : 3;
            }
            
            // Cooldown e flash
            if (this.cooldown > 0) this.cooldown--;
            if (this.flashTime > 0) this.flashTime--;
            
            // Tiro controlado pelo mouse
            if ((mouseDown || shotBuffer > 0) && this.cooldown <= 0 && this.ammo > 0 && !this.reloading) {
                this.shoot();
            }
            
            // Auto-reload
            if (this.ammo <= 0 && !this.reloading) {
                this.reloading = true;
                setTimeout(() => {
                    this.ammo = this.maxAmmo;
                    this.reloading = false;
                }, 1500);
            }
            
            return; // Não executar o resto do update
            
        } else {
            // Modo normal (4 direções) - WASD ou setas
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;

            if (keys.w || keys.W || keys.ArrowUp) { this.vy = -this.speed; this.isMoving = true; }
            if (keys.s || keys.S || keys.ArrowDown) { this.vy = this.speed; this.isMoving = true; }
            if (keys.a || keys.A || keys.ArrowLeft) { this.vx = -this.speed; this.isMoving = true; }
            if (keys.d || keys.D || keys.ArrowRight) { this.vx = this.speed; this.isMoving = true; }
            
            const center = this.getCenter();
            const dx = mouseX - center.x;
            const dy = mouseY - center.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 1 : 3;
            } else {
                this.direction = dy > 0 ? 2 : 0;
            }
            
            if (this.x < 0) this.x = 0;
            if (this.y < 0) this.y = 0;
            if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
            if (this.y + this.h > canvas.height) this.y = canvas.height - this.h;
        }
        
        let currentSpeed = hasPowerup('speedBoost') ? this.speed * 1.8 : this.speed;
        
        // Navio mais lento no winter (mar gelado)
        if (isWinterLevel && this.type === 'ship') {
            currentSpeed *= 0.7; // 30% mais lento
        }
        
        this.x += this.vx * (currentSpeed / this.speed);
        if (!isTrainLevel || this.type !== 'soldier') {
            this.y += this.vy * (currentSpeed / this.speed);
        }
        
        if (this.cooldown > 0) this.cooldown--;
        
        if (hasPowerup('infiniteAmmo')) {
            this.ammo = this.maxAmmo;
            this.reloading = false;
        } else if (this.ammo <= 0 && !this.reloading) {
            this.reloading = true;
            setTimeout(() => {
                this.ammo = this.maxAmmo;
                this.reloading = false;
            }, 2000);
        }
        
        if ((mouseDown || shotBuffer > 0) && this.cooldown <= 0 && this.ammo > 0 && !this.reloading) {
            this.shoot();
        }

        if (this.flashTime > 0) this.flashTime--;
    }
    
    shoot() {
        let center = this.getCenter();
        
        const dx = mouseX - center.x;
        const dy = mouseY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 12;
        let vx = (dx / dist) * speed;
        let vy = (dy / dist) * speed;
        
        if (isNaN(vx) || isNaN(vy)) { vx = 0; vy = -12; }
        
        const useMultiShot = hasPowerup('multiShot');
        const ammoCost = useMultiShot ? 3 : 1;
        
        if (this.ammo >= ammoCost || hasPowerup('infiniteAmmo')) {
            let damage = hasPowerup('doubleDamage') ? this.damage * 2 : this.damage;
            
            // Aplicar bônus de dano da fase escape
            if (this.escapeDamageBonus) {
                damage = Math.ceil(damage * this.escapeDamageBonus);
            }
            
            projectiles.push(new Projectile(center.x, center.y, vx, vy, true, damage));
            
            if (useMultiShot || this.type === 'ship') {
                const spreadAngle = 0.3;
                projectiles.push(new Projectile(center.x, center.y, 
                    vx * Math.cos(spreadAngle) - vy * Math.sin(spreadAngle),
                    vx * Math.sin(spreadAngle) + vy * Math.cos(spreadAngle), true, damage));
                projectiles.push(new Projectile(center.x, center.y,
                    vx * Math.cos(-spreadAngle) - vy * Math.sin(-spreadAngle),
                    vx * Math.sin(-spreadAngle) + vy * Math.cos(-spreadAngle), true, damage));
            }
            
            particles.push(new EnhancedMuzzleFlash(
                center.x + (vx > 0 ? 15 : vx < 0 ? -15 : 0),
                center.y + (vy > 0 ? 15 : vy < 0 ? -15 : 0),
                this.direction,
                this.type === 'tank' ? 1.5 : 1
            ));
            
            if (!hasPowerup('infiniteAmmo')) this.ammo -= ammoCost;
            this.cooldown = this.maxCooldown;
            shotBuffer = 0; // Clique bufferizado consumido por este tiro

            AudioEngine.playShoot(this.type);
            addScreenShake(this.type === 'tank' ? 3 : 1);
        }
    }
    
    // Tiro automático para modo SHMUP (sempre para cima)
    shmupShoot() {
        let center = this.getCenter();
        const speed = 14; // Tiros rápidos
        
        const useMultiShot = hasPowerup('multiShot');
        const ammoCost = useMultiShot ? 2 : 1;
        
        if (this.ammo >= ammoCost || hasPowerup('infiniteAmmo')) {
            const damage = hasPowerup('doubleDamage') ? this.damage * 2 : this.damage;
            
            // Tiro principal (para cima)
            projectiles.push(new Projectile(center.x, center.y, 0, -speed, true, damage));
            
            // Multi-shot: tiros laterais
            if (useMultiShot) {
                projectiles.push(new Projectile(center.x - 10, center.y, -2, -speed, true, damage));
                projectiles.push(new Projectile(center.x + 10, center.y, 2, -speed, true, damage));
            }
            
            // Efeito visual
            particles.push(new EnhancedMuzzleFlash(center.x, center.y - 15, 0, 0.8));
            
            if (!hasPowerup('infiniteAmmo')) this.ammo -= ammoCost;
            this.cooldown = 8; // Cooldown rápido para shmup
            
            AudioEngine.playShoot(this.type);
        }
    }
    
    draw(ctx) {
        const flash = this.flashTime > 0;

        // Piscar durante invulnerabilidade (feedback visual de dano)
        if (this.invulnTime > 0 && Math.floor(frameCount / 4) % 2 === 0) {
            return;
        }

        if (this.type === 'soldier') {
            drawHumanSoldier(ctx, this.x, this.y, this.w, this.h, this.direction, this.isMoving, flash);
        } else if (this.type === 'tank') {
            drawTankSprite(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
        } else if (this.type === 'plane') {
            drawPlaneSprite(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
        } else if (this.type === 'ship') {
            drawShipSprite(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
        }
        
        if (hasPowerup('shield')) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(frameCount * 0.2) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, Math.max(this.w, this.h), 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class Enemy extends Entity {
    constructor(type, x, y) {
        super(x, y, 30, 30, 1);
        this.type = type;
        this.timer = 0;
        
        // Try to get stats from server first
        let cfg = DataLoader.getEnemyStats(type);
        
        // Fallback to hardcoded defaults if server data not available
        if (!cfg) {
            const defaultConfigs = {
                soldier: { width: 22, height: 28, speed: 1.8, hp: 30, scoreValue: 50 },
                tank: { width: 40, height: 40, speed: 1, hp: 120, scoreValue: 200 },
                tower: { width: 38, height: 50, speed: 0, hp: 150, scoreValue: 150 },
                chopper: { width: 36, height: 36, speed: 2.8, hp: 60, scoreValue: 300 },
                plane: { width: 32, height: 32, speed: 3.5, hp: 40, scoreValue: 250 },
                boss: { width: 100, height: 80, speed: 0.6, hp: 1500, scoreValue: 5000 },
                snowSoldier: { width: 24, height: 30, speed: 1.5, hp: 45, scoreValue: 70 },
                flameTank: { width: 44, height: 44, speed: 0.9, hp: 180, scoreValue: 280 },
                generator: { width: 50, height: 60, speed: 0, hp: 200, scoreValue: 500 },
                jetpackSoldier: { width: 24, height: 32, speed: 2.2, hp: 35, scoreValue: 80 },
                turret: { width: 30, height: 30, speed: 1, hp: 50, scoreValue: 100 }
            };
            cfg = defaultConfigs[type] || defaultConfigs.soldier;
            console.warn('⚠️ Using fallback enemy stats for:', type);
        }
        
        // Apply level modifiers
        const modifiers = getLevelModifiers ? getLevelModifiers() : { enemySpeedMultiplier: 1.0 };
        
        this.w = cfg.width || cfg.w;
        this.h = cfg.height || cfg.h;
        this.speed = (cfg.speed || 1) * (modifiers.enemySpeedMultiplier || 1);
        this.hp = cfg.hp;
        this.maxHp = cfg.hp;
        this.scoreValue = cfg.scoreValue;
        this.shootRate = cfg.shootRate || 60;
        this.projectileDamage = cfg.projectileDamage || 8;
        this.projectileSpeed = cfg.projectileSpeed || 5;
        
        // Propriedades especiais para flameTank
        this.lastFireTrail = 0;
        
        // Propriedades especiais para jetpackSoldier
        this.hoverOffset = Math.random() * Math.PI * 2; // Fase de flutuação
        this.pushCooldown = 0;
    }
    
    update() {
        // JetpackSoldier tem comportamento especial (flutua e empurra)
        if (this.type === 'jetpackSoldier') {
            this.timer++;
            
            // Movimento flutuante (hover)
            this.hoverOffset += 0.08;
            const hoverY = Math.sin(this.hoverOffset) * 2;
            
            // Perseguir o jogador
            if (player) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 50) {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed + hoverY * 0.3;
                }
                
                // Direção
                this.direction = dx > 0 ? 1 : 3;
                
                // Atirar
                if (this.timer % 70 === 0 && dist < 400) {
                    const c = this.getCenter();
                    const speed = 4;
                    projectiles.push(new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 8));
                }
                
                // Tentativa de empurrar jogador (a cada 2s se próximo)
                if (this.pushCooldown <= 0 && dist < 80) {
                    // Empurrão na direção oposta ao soldado
                    const pushForce = 8;
                    player.vx += (dx / dist) * pushForce;
                    player.vy += (dy / dist) * pushForce;
                    this.pushCooldown = 120;
                    floatingTexts.push(new FloatingText(player.x, player.y - 20, '💨 PUSH!', '#ffaa00'));
                }
                this.pushCooldown--;
            }
            
            // Partículas do jetpack
            if (this.timer % 5 === 0) {
                particles.push(new SmokeParticle(
                    this.x + this.w / 2 + (Math.random() - 0.5) * 8,
                    this.y + this.h,
                    Math.random() > 0.5 ? '#ff6600' : '#ffaa00'
                ));
            }
            
            // Limites da tela
            if (this.x < -50) this.x = -50;
            if (this.x > canvas.width + 20) this.x = canvas.width + 20;
            if (this.y < -50) this.y = -50;
            if (this.y > canvas.height + 20) this.y = canvas.height + 20;
            
            return;
        }
        
        // SHMUP MODE - Inimigos aéreos (plane/chopper) descem automaticamente
        const isShmupLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'shmup';
        if (isShmupLevel && (this.type === 'plane' || this.type === 'chopper')) {
            this.timer++;
            
            // Move para baixo com scroll + velocidade própria
            this.y += SHMUP_CONFIG.scrollSpeed + this.speed * 0.5;
            
            // Movimento horizontal sinusoidal (padrão de ataque)
            this.x += Math.sin(this.timer * 0.05) * 2;
            
            // Morrer se sair da tela por baixo
            if (this.y > canvas.height + 50) {
                this.dead = true;
                return;
            }
            
            // Atira em direção ao jogador
            const shootRate = this.type === 'plane' ? 60 : 80;
            if (this.timer % shootRate === 0 && player) {
                const c = this.getCenter();
                const pc = player.getCenter();
                const dx = pc.x - c.x;
                const dy = pc.y - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 500) {
                    const speed = 5;
                    projectiles.push(new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 8));
                }
            }
            
            // Sempre olhando para baixo
            this.direction = 2;
            
            return;
        }
        
        // TURRET - Bullet Hell (shmup)
        if (this.type === 'turret') {
            this.timer++;
            
            // Move para baixo com o scroll
            this.y += SHMUP_CONFIG.scrollSpeed;
            
            // Morrer se sair da tela por baixo
            if (this.y > canvas.height + 50) {
                this.dead = true;
                return;
            }
            
            // Atira muito rápido em direção ao jogador
            if (this.timer % SHMUP_CONFIG.bulletSpawnRate === 0 && player) {
                const c = this.getCenter();
                const pc = player.getCenter();
                const dx = pc.x - c.x;
                const dy = pc.y - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 500) {
                    const speed = 5;
                    // Tiro principal
                    projectiles.push(new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 8));
                    
                    // Tiros spread (bullet hell)
                    if (this.timer % 60 === 0) {
                        for (let angle = -30; angle <= 30; angle += 15) {
                            const rad = (Math.atan2(dy, dx) + angle * Math.PI / 180);
                            projectiles.push(new Projectile(c.x, c.y, Math.cos(rad) * speed, Math.sin(rad) * speed, false, 6));
                        }
                    }
                }
            }
            
            return;
        }
        
        // Generator é estático mas atira!
        if (this.type === 'generator') {
            this.timer++;
            // Efeito visual de dano quando baixo HP
            if (this.hp < this.maxHp * 0.3 && this.timer % 20 === 0) {
                particles.push(new SmokeParticle(
                    this.x + Math.random() * this.w,
                    this.y + Math.random() * 10,
                    '#ffaa00'
                ));
            }
            
            // Gerador atira raios elétricos a cada 90 frames (~1.5s)
            if (this.timer % 90 === 0 && player) {
                const c = { x: this.x + this.w / 2, y: this.y + this.h / 2 };
                const pc = player.getCenter();
                const dx = pc.x - c.x;
                const dy = pc.y - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 400) { // Alcance de 400px
                    const speed = 4;
                    const proj = new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 12);
                    proj.isElectric = true; // Marcador para visual elétrico
                    projectiles.push(proj);
                    // Efeito visual de disparo
                    particles.push(new SmokeParticle(c.x, c.y - 10, '#00ffff'));
                }
            }
            return;
        }
        
        if (this.type === 'tower') {
            this.direction = 0;
            this.timer++;
            
            let shootRate = 80;
            let pc = player.getCenter();
            let c = this.getCenter();
            let dx = pc.x - c.x;
            let dy = pc.y - c.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (this.timer % shootRate === 0 && dist < 450) {
                let speed = 5;
                projectiles.push(new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 10));
            }
            return;
        }
        
        const speedMultiplier = hasPowerup('slowEnemies') ? 0.5 : 1;
        const currentSpeed = this.speed * speedMultiplier;
        const isWinterLevel = levels[currentLevelIndex] && levels[currentLevelIndex].type === 'winter';
        
        let pc = player.getCenter();
        let c = this.getCenter();
        let dx = pc.x - c.x;
        let dy = pc.y - c.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        // Verificar se é fase train com soldado (side-scroller)
        const isTrainSoldier = levels[currentLevelIndex] && 
                              levels[currentLevelIndex].type === 'train' && 
                              selectedClass === 'soldier';
        
        if (dist > 5) {
            // Na fase train com soldado, inimigos terrestres só movem horizontalmente
            if (isTrainSoldier && this.trainEnemy && this.type === 'soldier') {
                // Não perseguir - movimento controlado por updateTrainLevel
            } else {
                this.x += (dx / dist) * currentSpeed;
                this.y += (dy / dist) * currentSpeed;
                
                // Aplicar vento na fase winter
                if (isWinterLevel) {
                    this.x += winterWindDirection * winterWindForce * 0.5;
                }
            }
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 1 : 3;
            } else {
                this.direction = dy > 0 ? 2 : 0;
            }
        }
        
        super.update();
        
        this.timer++;
        let shootRate = 100;
        if (this.type === 'boss') shootRate = 35;
        if (this.type === 'tower') shootRate = 80;
        if (this.type === 'chopper') shootRate = 70;
        if (this.type === 'snowSoldier') shootRate = 90;
        if (this.type === 'flameTank') shootRate = 60;
        
        if (this.timer % shootRate === 0 && dist < 450) {
            let speed = 5;
            
            // FlameTank dispara projéteis de fogo e deixa rastro
            if (this.type === 'flameTank') {
                speed = 4;
                const fireProj = new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 12);
                fireProj.isFlame = true;
                projectiles.push(fireProj);
            } else {
                projectiles.push(new Projectile(c.x, c.y, (dx / dist) * speed, (dy / dist) * speed, false, 10));
            }
        }
        
        // FlameTank deixa rastro de fogo periodicamente enquanto se move
        if (this.type === 'flameTank' && frameCount - this.lastFireTrail > 45) {
            winterFireTrails.push({
                x: this.x + this.w / 2 - 15,
                y: this.y + this.h - 10,
                w: 30,
                h: 20,
                timer: WINTER_CONFIG.fireTrailDuration,
                lastDamage: 0
            });
            this.lastFireTrail = frameCount;
        }
        
        if (this.type === 'boss' && this.timer % 180 === 0) {
            for (let i = 0; i < 12; i++) {
                let angle = (Math.PI * 2 * i) / 12;
                projectiles.push(new Projectile(c.x, c.y, Math.cos(angle) * 5, Math.sin(angle) * 5, false, 15));
            }
        }
    }
    
    draw(ctx) {
        const flash = this.flashTime > 0;
        
        switch(this.type) {
            case 'soldier':
                drawEnemySoldier(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'tank':
                drawEnemyTank(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'tower':
                drawEnemyTower(ctx, this.x, this.y, this.w, this.h, flash);
                break;
            case 'chopper':
                drawEnemyChopper(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'plane':
                drawEnemyPlane(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'boss':
                drawEnemyBoss(ctx, this.x, this.y, this.w, this.h, this.direction, this.hp, this.maxHp, flash);
                break;
            // Winter enemies
            case 'snowSoldier':
                drawSnowSoldier(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'flameTank':
                drawFlameTank(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            case 'generator':
                drawGenerator(ctx, this.x, this.y, this.w, this.h, this.hp, this.maxHp, flash);
                break;
            // Sky Fortress enemies
            case 'jetpackSoldier':
                drawJetpackSoldier(ctx, this.x, this.y, this.w, this.h, this.direction, flash);
                break;
            // Shmup enemies
            case 'turret':
                drawTurret(ctx, this.x, this.y, this.w, this.h, flash);
                break;
        }
    }
}

class Projectile {
    constructor(x, y, vx, vy, isPlayer, damage) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayer = isPlayer;
        this.damage = damage;
        this.size = isPlayer ? 6 : 7;
        this.dead = false;
        this.trail = [];
        this.maxTrailLength = 8;
    }
    
    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) this.trail.shift();
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < -20 || this.x > canvas.width + 20 || 
            this.y < -20 || this.y > canvas.height + 20) {
            this.dead = true;
        }
    }
    
    draw(ctx) {
        // Sistema pixel art para projéteis (OPTIMIZADO)
        const px = Math.floor(this.x / PIXEL_SCALE);
        const py = Math.floor(this.y / PIXEL_SCALE);
        const ps = Math.floor(this.size / PIXEL_SCALE);
        
        // Projétil elétrico (dos geradores) - simplificado
        if (this.isElectric) {
            // Trail simplificado - apenas últimos 3 pontos
            const trailLen = this.trail.length;
            for (let i = Math.max(0, trailLen - 3); i < trailLen; i++) {
                const pos = this.trail[i];
                const progress = (i - (trailLen - 3)) / 3;
                ctx.globalAlpha = 0.3 + progress * 0.5;
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(Math.floor(pos.x) - 2, Math.floor(pos.y) - 2, 4, 4);
            }
            ctx.globalAlpha = 1;
            
            // Glow simples (rect)
            if (typeof GLOW_CONFIG !== 'undefined' && GLOW_CONFIG.enabled) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
                ctx.globalAlpha = 1;
            }
            
            // Núcleo
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px * PIXEL_SCALE - 3, py * PIXEL_SCALE - 3, 6, 6);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(px * PIXEL_SCALE - 2, py * PIXEL_SCALE - 2, 4, 4);
            return;
        }
        
        const baseColor = this.isPlayer ? PALETTES.gold : PALETTES.enemyRed;
        
        // Glow simples (apenas um rect semi-transparente)
        if (typeof GLOW_CONFIG !== 'undefined' && GLOW_CONFIG.enabled) {
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = this.isPlayer ? '#ffcc00' : '#ff4444';
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            ctx.globalAlpha = 1;
        }
        
        // Trail simplificado - apenas últimos 4 pontos
        const trailLen = this.trail.length;
        for (let i = Math.max(0, trailLen - 4); i < trailLen; i++) {
            const pos = this.trail[i];
            const progress = (i - Math.max(0, trailLen - 4)) / 4;
            ctx.globalAlpha = progress * 0.6;
            const ts = Math.max(1, Math.floor(ps * progress * 0.5));
            ctx.fillStyle = baseColor.base;
            ctx.fillRect(
                Math.floor(pos.x / PIXEL_SCALE) * PIXEL_SCALE - ts,
                Math.floor(pos.y / PIXEL_SCALE) * PIXEL_SCALE - ts,
                ts * 2, ts * 2
            );
        }
        ctx.globalAlpha = 1;
        
        // Brilho externo simplificado
        ctx.fillStyle = baseColor.light + '40';
        ctx.fillRect((px - ps) * PIXEL_SCALE, (py - ps) * PIXEL_SCALE, (ps * 2 + 1) * PIXEL_SCALE, (ps * 2 + 1) * PIXEL_SCALE);
        
        // Projétil principal
        drawPixelRect(ctx, px - Math.floor(ps/2), py - Math.floor(ps/2), ps, ps, baseColor.base, baseColor.dark);
        
        // Centro brilhante
        if (ps >= 2) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect((px - 1) * PIXEL_SCALE, (py - 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
        }
    }
}

class Decoration {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.sway = Math.random() * Math.PI * 2;
        this.frame = Math.floor(Math.random() * 4); // Para animação discreta
    }
    
    draw(ctx) {
        const px = Math.floor(this.x / PIXEL_SCALE);
        const py = Math.floor(this.y / PIXEL_SCALE);
        
        // Animação de balanço em frames discretos (não seno)
        const swayFrame = Math.floor(frameCount / 20 + this.frame) % 4;
        const swayOffset = swayFrame === 1 ? 1 : swayFrame === 3 ? -1 : 0;
        
        switch(this.type) {
            case 'tree':
                // Tronco pixelado
                drawShadedRect(ctx, px + 4, py + 8, 4, 10, PALETTES.enemyBrown);
                
                // Copa da árvore (triângulo pixelado em camadas)
                // Camada inferior
                drawShadedRect(ctx, px - 2 + swayOffset, py + 4, 16, 6, PALETTES.armyGreen);
                // Camada média
                drawShadedRect(ctx, px + swayOffset, py, 12, 5, PALETTES.armyGreen);
                // Camada superior (topo)
                drawShadedRect(ctx, px + 2 + swayOffset, py - 4, 8, 5, PALETTES.armyGreen);
                // Ponta
                drawPixelFill(ctx, px + 4 + swayOffset, py - 6, 4, 3, PALETTES.armyGreen.light);
                break;
                
            case 'rock':
                // Rocha pixelada com sombra
                drawPixelShadow(ctx, px + 6, py + 10, 10, 2);
                drawShadedRect(ctx, px, py + 2, 12, 8, PALETTES.metal);
                // Highlight
                drawPixelFill(ctx, px + 1, py + 3, 3, 2, PALETTES.metal.light);
                break;
                
            case 'bush':
                // Arbusto pixelado
                drawPixelShadow(ctx, px + 5, py + 8, 8, 2);
                drawShadedRect(ctx, px, py + 2, 10, 6, PALETTES.armyGreen);
                // Detalhes de folhas
                drawPixelFill(ctx, px - 1 + swayOffset, py, 4, 3, PALETTES.armyGreen.light);
                drawPixelFill(ctx, px + 6 + swayOffset, py + 1, 4, 3, PALETTES.armyGreen.light);
                break;
                
            case 'crate':
                // Caixa de madeira pixelada
                drawPixelShadow(ctx, px + 6, py + 12, 10, 2);
                drawShadedRect(ctx, px, py, 12, 12, PALETTES.enemyBrown);
                // Tábuas horizontais
                drawPixelFill(ctx, px + 1, py + 3, 10, 1, PALETTES.enemyBrown.dark);
                drawPixelFill(ctx, px + 1, py + 7, 10, 1, PALETTES.enemyBrown.dark);
                // Cruz de reforço
                drawPixelFill(ctx, px + 5, py + 1, 2, 10, PALETTES.enemyBrown.dark);
                break;
                
            case 'barrel':
                // Barril pixelado
                drawPixelShadow(ctx, px + 5, py + 14, 8, 2);
                drawShadedRect(ctx, px + 1, py, 10, 14, PALETTES.metal);
                // Aros metálicos
                drawPixelFill(ctx, px, py + 2, 12, 2, PALETTES.darkMetal.base);
                drawPixelFill(ctx, px, py + 10, 12, 2, PALETTES.darkMetal.base);
                // Símbolo de perigo (opcional)
                drawPixelFill(ctx, px + 4, py + 5, 4, 4, PALETTES.enemyRed.base);
                break;
        }
    }
}

// ============ MINE CLASS ============

class Mine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 16;
        this.damage = 40; // Dano alto para tanques
        this.dead = false;
        this.triggered = false;
        this.triggerTimer = 0;
        this.blinkRate = 8;
        this.armTime = 60; // Frames até armar (1 segundo)
        this.armed = false;
        this.age = 0;
    }
    
    update() {
        this.age++;
        
        // Armar a mina depois de um tempo
        if (!this.armed && this.age >= this.armTime) {
            this.armed = true;
        }
        
        // Se foi acionada, conta timer para explosão
        if (this.triggered) {
            this.triggerTimer++;
            this.blinkRate = Math.max(2, 8 - this.triggerTimer);
            
            // Explode após 15 frames (~0.25 segundo)
            if (this.triggerTimer >= 15) {
                this.explode();
            }
        }
    }
    
    trigger() {
        if (this.armed && !this.triggered) {
            this.triggered = true;
            AudioEngine.playExplosion(0.3); // Som de aviso
        }
    }
    
    explode() {
        this.dead = true;
        
        // Explosão grande
        createExplosion(this.x + this.w/2, this.y + this.h/2, '#ff4400', 20);
        createExplosion(this.x + this.w/2, this.y + this.h/2, '#ffff00', 15);
        
        // Som de explosão
        AudioEngine.playExplosion(1.5);
        
        // Screen shake
        addScreenShake(8);
        
        // Verificar se player ainda está na área de explosão
        const explosionRadius = 50;
        const px = player.x + player.w/2;
        const py = player.y + player.h/2;
        const mx = this.x + this.w/2;
        const my = this.y + this.h/2;
        const dist = Math.sqrt((px-mx)*(px-mx) + (py-my)*(py-my));
        
        if (dist < explosionRadius && !hasPowerup('shield')) {
            player.takeDamage(this.damage);
            floatingTexts.push(new FloatingText(player.x + player.w/2, player.y, '-' + this.damage, '#ff0000'));
        }
        
        // Também pode danificar inimigos próximos
        enemies.forEach(e => {
            if (!e.dead) {
                const ex = e.x + e.w/2;
                const ey = e.y + e.h/2;
                const eDist = Math.sqrt((ex-mx)*(ex-mx) + (ey-my)*(ey-my));
                if (eDist < explosionRadius) {
                    e.takeDamage(this.damage / 2);
                }
            }
        });
    }
    
    draw(ctx) {
        drawMine(ctx, this.x, this.y, this.w, this.h, this.armed, this.triggered, this.triggerTimer, this.blinkRate);
    }
}

// ============ GRENADE CLASS (para soldado) ============

class Grenade {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
        this.damage = 25; // Dano moderado
        this.explosionRadius = 60;
        this.dead = false;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        // Efeito de flutuação suave
        this.bobOffset += 0.08;
    }
    
    collect() {
        if (!this.collected && !this.dead) {
            this.collected = true;
            this.dead = true;
            
            // Som de coleta
            AudioEngine.playPickup && AudioEngine.playPickup();
            
            // Efeito visual de coleta
            floatingTexts.push(new FloatingText(this.x + this.w/2, this.y, '💣 GRANADA!', '#ffaa00'));
            
            // Lançar a granada (explosão após breve delay)
            this.throwGrenade();
        }
    }
    
    throwGrenade() {
        // Criar explosão no ponto mais próximo de inimigos ou aleatório
        let targetX = this.x;
        let targetY = this.y;
        
        // Procurar inimigo mais próximo
        let closestDist = 200;
        enemies.forEach(e => {
            if (!e.dead) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < closestDist) {
                    closestDist = dist;
                    targetX = e.x + e.w/2;
                    targetY = e.y + e.h/2;
                }
            }
        });
        
        // Delay antes da explosão (simula arremesso)
        setTimeout(() => {
            this.explodeAt(targetX, targetY);
        }, 300);
    }
    
    explodeAt(tx, ty) {
        // Explosão grande
        createExplosion(tx, ty, '#ff4400', 25);
        createExplosion(tx, ty, '#ffff00', 18);
        createExplosion(tx, ty, '#ff8800', 12);
        
        // Som de explosão
        AudioEngine.playExplosion(1.2);
        
        // Screen shake
        addScreenShake(10);
        
        // Danificar inimigos na área
        enemies.forEach(e => {
            if (!e.dead) {
                const ex = e.x + e.w/2;
                const ey = e.y + e.h/2;
                const dist = Math.sqrt((ex - tx) ** 2 + (ey - ty) ** 2);
                if (dist < this.explosionRadius) {
                    // Dano diminui com distância
                    const damageMult = 1 - (dist / this.explosionRadius) * 0.5;
                    const finalDamage = Math.ceil(this.damage * damageMult);
                    e.takeDamage(finalDamage);
                    floatingTexts.push(new FloatingText(e.x + e.w/2, e.y, '-' + finalDamage, '#ffaa00'));
                }
            }
        });
    }
    
    draw(ctx) {
        if (this.dead) return;
        
        const bobY = Math.sin(this.bobOffset) * 3;
        const px = PIXEL_SCALE;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.w/2, this.y + this.h + 2, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo da granada (verde militar)
        ctx.fillStyle = '#3a5a2a';
        ctx.fillRect(this.x + 2, this.y + bobY + 4, this.w - 4, this.h - 6);
        
        // Topo da granada
        ctx.fillStyle = '#4a6a3a';
        ctx.fillRect(this.x + 4, this.y + bobY, this.w - 8, 6);
        
        // Pino/alavanca
        ctx.fillStyle = '#888888';
        ctx.fillRect(this.x + this.w/2 - 1, this.y + bobY - 2, 2, 4);
        ctx.fillRect(this.x + this.w/2, this.y + bobY - 2, 5, 2);
        
        // Linhas horizontais no corpo
        ctx.fillStyle = '#2a4a1a';
        ctx.fillRect(this.x + 2, this.y + bobY + 7, this.w - 4, 1);
        ctx.fillRect(this.x + 2, this.y + bobY + 10, this.w - 4, 1);
        
        // Brilho pulsante para destacar
        const glow = Math.sin(this.bobOffset * 2) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 100, ${glow})`;
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + bobY + this.h/2, this.w/2 + 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============ SUBMARINE CLASS ============

class Submarine {
    constructor(fromLeft) {
        this.w = 50;
        this.h = 20;
        this.fromLeft = fromLeft;
        
        // Posição inicial nas laterais
        if (fromLeft) {
            this.x = -this.w - 10;
            this.vx = 1.5; // Velocidade para direita
        } else {
            this.x = canvas.width + 10;
            this.vx = -1.5; // Velocidade para esquerda
        }
        
        // Posição Y aleatória (evita topo e fundo)
        this.y = 100 + Math.random() * (canvas.height - 250);
        
        this.dead = false;
        this.hasFired = false;
        this.surfaceTime = 0;
        this.maxSurfaceTime = 30; // Frames visível na superfície
        this.submerged = true;
        this.bubbleTimer = 0;
        this.periscopeUp = false;
    }
    
    update() {
        // Movimento horizontal
        this.x += this.vx;
        
        // Bolhas enquanto submerso
        this.bubbleTimer++;
        if (this.submerged && this.bubbleTimer % 15 === 0) {
            particles.push(new Particle(
                this.x + this.w/2 + (Math.random() - 0.5) * 20,
                this.y - 5,
                'rgba(150, 200, 255, 0.6)',
                4,
                -0.8,
                1.2
            ));
        }
        
        // Verifica se chegou na zona de disparo (centro da tela)
        const centerZone = canvas.width / 2;
        const inFiringZone = Math.abs(this.x + this.w/2 - centerZone) < 100;
        
        if (inFiringZone && !this.hasFired) {
            // Emerge para disparar
            if (this.submerged) {
                this.submerged = false;
                this.periscopeUp = true;
                this.surfaceTime = 0;
            }
            
            this.surfaceTime++;
            
            // Dispara após emergir um pouco
            if (this.surfaceTime === 15) {
                this.fireTorpedoes();
                this.hasFired = true;
            }
            
            // Submerge novamente após tempo
            if (this.surfaceTime >= this.maxSurfaceTime) {
                this.submerged = true;
                this.periscopeUp = false;
            }
        }
        
        // Remove quando sai da tela
        if ((this.fromLeft && this.x > canvas.width + 50) ||
            (!this.fromLeft && this.x < -this.w - 50)) {
            this.dead = true;
        }
    }
    
    fireTorpedoes() {
        // Dispara 3 torpedos em direção ao jogador
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        
        // Calcula direção base para o jogador
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const baseAngle = Math.atan2(dy, dx);
        
        // 3 torpedos com spread
        const spread = 0.25; // ~15 graus
        const torpedoSpeed = 4;
        
        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + i * spread;
            const vx = Math.cos(angle) * torpedoSpeed;
            const vy = Math.sin(angle) * torpedoSpeed;
            
            // Criar projétil especial (torpedo)
            const torpedo = new Projectile(cx, cy, vx, vy, false, 25);
            torpedo.isTorpedo = true;
            torpedo.size = 10;
            projectiles.push(torpedo);
        }
        
        // Som e efeito
        AudioEngine.playShoot('tank');
        createExplosion(cx, cy, 'rgba(100, 150, 200, 0.5)', 5);
    }
    
    draw(ctx) {
        drawSubmarine(ctx, this.x, this.y, this.w, this.h, this.fromLeft, this.submerged, this.periscopeUp);
    }
}

// ============ FLOATING TEXT CLASS ============

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 90;
        this.maxLife = 90;
        this.vy = -1.5;
    }
    
    update() {
        this.y += this.vy;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const px = Math.floor(this.x / PIXEL_SCALE);
        const py = Math.floor(this.y / PIXEL_SCALE);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Contorno preto para texto
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${7 * PIXEL_SCALE}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        // Desenhar contorno em 4 direções
        ctx.fillText(this.text, px * PIXEL_SCALE - 1, py * PIXEL_SCALE);
        ctx.fillText(this.text, px * PIXEL_SCALE + 1, py * PIXEL_SCALE);
        ctx.fillText(this.text, px * PIXEL_SCALE, py * PIXEL_SCALE - 1);
        ctx.fillText(this.text, px * PIXEL_SCALE, py * PIXEL_SCALE + 1);
        
        // Texto principal
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, px * PIXEL_SCALE, py * PIXEL_SCALE);
        
        ctx.restore();
    }
}
