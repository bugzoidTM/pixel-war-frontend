// ============ FASE 11 - ROTA DE FUGA (Escape Route) ============
// Estilo: OutRun / Road Rash - perspectiva pseudo-3D de corrida arcade
// VERSÃO APRIMORADA: Curvas desafiadoras, terrenos variados, emboscadas RPG

// Variáveis visuais extras
let erTrees = [];
let erCacti = [];
let erRocks = [];
let erTireTracks = [];
let erDustParticles = [];
let erPosition = 0;

// === DEFINIÇÃO DA PISTA COM DESAFIOS ===
const TRACK_CHALLENGES = {
    // Retas iniciais para o jogador se acostumar
    warmup: { start: 0, end: 300, curve: 0, width: 1.0, terrain: 'normal' },
    
    // DESAFIO 1: Curva da Morte - curva fechada com poça de óleo no vértice
    deathCurve: { start: 400, end: 600, curve: 2.5, width: 0.85, terrain: 'normal', 
                  oilAt: [480, 520], barrierAt: [450], special: 'death_curve' },
    
    // Reta de recuperação
    recovery1: { start: 600, end: 900, curve: 0, width: 1.0, terrain: 'normal' },
    
    // DESAFIO 2: Corredor de Fogo - reta com soldados RPG dos dois lados
    fireCorridor: { start: 1000, end: 1400, curve: 0, width: 0.75, terrain: 'normal',
                    rpgLeft: [1050, 1150, 1250, 1350], rpgRight: [1100, 1200, 1300], 
                    special: 'fire_corridor' },
    
    // Curva suave
    easyCurve1: { start: 1500, end: 1700, curve: -1.5, width: 1.0, terrain: 'normal' },
    
    // DESAFIO 3: Ponte Quebrada - forçado a sair do asfalto
    brokenBridge: { start: 1800, end: 2100, curve: 0, width: 0.5, terrain: 'offroad',
                    minesAt: [1850, 1900, 1950, 2000, 2050], rocks: true, special: 'broken_bridge' },
    
    // Reta rápida
    speedSection: { start: 2200, end: 2600, curve: 0, width: 1.2, terrain: 'normal' },
    
    // DESAFIO 4: Chicane dupla - S rápido
    chicane: { start: 2700, end: 3000, curve: 'chicane', width: 0.9, terrain: 'normal',
               oilAt: [2800, 2900], special: 'chicane' },
    
    // Curva longa com caminhões
    truckAlley: { start: 3100, end: 3500, curve: 1.2, width: 1.0, terrain: 'normal',
                  trucks: true, special: 'truck_alley' },
    
    // DESAFIO 5: Emboscada final - combinação de tudo
    finalAmbush: { start: 3600, end: 4000, curve: -1.8, width: 0.8, terrain: 'normal',
                   rpgLeft: [3650, 3750, 3850], rpgRight: [3700, 3800, 3900],
                   oilAt: [3700, 3850], barrierAt: [3650, 3750], special: 'final_ambush' },
    
    // Sprint final
    finalSprint: { start: 4100, end: 4500, curve: 0, width: 1.1, terrain: 'normal' }
};

function initEscapeRouteLevel() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    
    // Resetar estado do jipe
    erProgress = 0;
    erJeepX = 0;
    erJeepSpeed = 80;
    erJeepAngle = 0;
    erJeepHP = cfg.jeepHP;
    erScrollOffset = 0;
    erPosition = 0;
    erCurrentTerrain = 'asphalt';
    erDrifting = false;
    erDriftTimer = 0;
    erDriftDirection = 0;
    erDriftVelocityX = 0;
    
    // Limpar arrays
    erMines = [];
    erOilPools = [];
    erBarriers = [];
    erTrucks = [];
    erRpgSoldiers = [];
    erRockets = [];
    erExplosions = [];
    erTireTracks = [];
    erDustParticles = [];
    erConcreteBarriers = [];
    erWarningTexts = [];
    erEdgeTimer = 0;  // Reset timer de zona segura
    
    // Gerar segmentos da estrada com curvas desafiadoras
    erRoadSegments = [];
    const trackLen = 5000;
    
    for (let i = 0; i < trackLen; i++) {
        let curve = 0;
        let width = 1.0;
        let terrainType = 'asphalt';
        let special = null;
        
        // Aplicar desafios da pista
        for (const [name, challenge] of Object.entries(TRACK_CHALLENGES)) {
            if (i >= challenge.start && i < challenge.end) {
                if (challenge.curve === 'chicane') {
                    const progress = (i - challenge.start) / (challenge.end - challenge.start);
                    curve = Math.sin(progress * Math.PI * 2) * 2.5;
                } else {
                    curve = challenge.curve || 0;
                }
                width = challenge.width || 1.0;
                if (challenge.terrain === 'offroad') {
                    terrainType = 'forced_offroad';
                }
                special = challenge.special || null;
                break;
            }
        }
        
        erRoadSegments.push({
            index: i,
            curve: curve,
            width: width,
            terrainType: terrainType,
            special: special
        });
    }
    
    // Pré-spawnar desafios especiais
    spawnChallengeElements();
    
    // Limpar cenário lateral
    erTrees = [];
    erCacti = [];
    erRocks = [];
    
    if (player) {
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 150;
    }
    
    console.log('🚗 Fase Rota de Fuga APRIMORADA iniciada!');
}

function spawnChallengeElements() {
    for (const [name, challenge] of Object.entries(TRACK_CHALLENGES)) {
        // Poças de óleo
        if (challenge.oilAt) {
            for (const z of challenge.oilAt) {
                erOilPools.push({
                    x: (Math.random() - 0.5) * 0.4,
                    z: z,
                    w: 0.25 + Math.random() * 0.15,
                    active: true
                });
            }
        }
        
        // Barreiras de concreto
        if (challenge.barrierAt) {
            for (const z of challenge.barrierAt) {
                const side = Math.random() > 0.5 ? 1 : -1;
                erConcreteBarriers.push({
                    x: side * 0.35,
                    z: z,
                    w: 0.2,
                    active: true
                });
            }
        }
        
        // Soldados RPG - esquerda (bem no acostamento/areia)
        if (challenge.rpgLeft) {
            for (const z of challenge.rpgLeft) {
                erRpgSoldiers.push({
                    x: -1.1 - Math.random() * 0.2,  // Claramente fora da pista
                    z: z,
                    side: 'left',
                    cooldown: 0,
                    active: true,
                    hasShot: false,
                    state: 'waiting'
                });
            }
        }
        
        // Soldados RPG - direita (bem no acostamento/areia)
        if (challenge.rpgRight) {
            for (const z of challenge.rpgRight) {
                erRpgSoldiers.push({
                    x: 1.1 + Math.random() * 0.2,   // Claramente fora da pista
                    z: z,
                    side: 'right',
                    cooldown: 0,
                    active: true,
                    hasShot: false,
                    state: 'waiting'
                });
            }
        }
        
        // Minas no off-road
        if (challenge.minesAt) {
            for (const z of challenge.minesAt) {
                for (let i = 0; i < 3; i++) {
                    erMines.push({
                        x: (Math.random() - 0.5) * 1.0,
                        z: z + Math.random() * 25,
                        size: 15,
                        active: true,
                        hidden: true
                    });
                }
            }
        }
    }
}

function updateEscapeRouteLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'escaperoute') return;
    
    const cfg = ESCAPE_ROUTE_CONFIG;
    
    // === VERIFICAR TERRENO ATUAL ===
    const segmentIndex = Math.floor(erPosition) % erRoadSegments.length;
    const segment = erRoadSegments[segmentIndex];
    const roadWidth = segment ? segment.width : 1.0;
    const isOnRoad = Math.abs(erJeepX) < (0.65 * roadWidth);
    const isOnOil = checkOilCollision();
    
    // Determinar terreno
    if (isOnOil) {
        erCurrentTerrain = 'oil';
    } else if (segment && segment.terrainType === 'forced_offroad') {
        erCurrentTerrain = 'offroad';
    } else if (!isOnRoad) {
        erCurrentTerrain = 'sand';
    } else {
        erCurrentTerrain = 'asphalt';
    }
    
    // === FÍSICA DE DRIFT (óleo) ===
    if (erCurrentTerrain === 'oil' && !erDrifting) {
        erDrifting = true;
        erDriftTimer = 90;
        erDriftVelocityX = (erJeepSpeed / 100) * (erJeepX > 0 ? 0.012 : -0.012);
        if (keys['ArrowLeft'] || keys['a']) erDriftVelocityX -= 0.008;
        if (keys['ArrowRight'] || keys['d']) erDriftVelocityX += 0.008;
        addScreenShake(5);
        erWarningTexts.push({ text: '⚠️ ÓLEO! DERRAPANDO!', timer: 60, color: '#ff4444' });
    }
    
    if (erDrifting) {
        erDriftTimer--;
        erJeepX += erDriftVelocityX;
        erDriftVelocityX *= 0.985;
        if (erDriftTimer <= 0) erDrifting = false;
    }
    
    // === CONTROLES ===
    let lateralSpeed = 0.028;
    if (erCurrentTerrain === 'sand' || erCurrentTerrain === 'offroad') lateralSpeed *= 0.7;
    if (erDrifting) lateralSpeed *= 0.15;
    
    if (!erDrifting || erDriftTimer < 30) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            erJeepX -= lateralSpeed * (1 + erJeepSpeed / 150);
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            erJeepX += lateralSpeed * (1 + erJeepSpeed / 150);
        }
    }
    erJeepX = Math.max(-1.2, Math.min(1.2, erJeepX));
    
    // === VELOCIDADE E FÍSICA ===
    let maxSpeed = 180;
    let accel = 0.8;
    let friction = 0.15;
    
    if (erCurrentTerrain === 'sand') {
        maxSpeed = 108;
        accel *= 0.6;
        friction = 0.3;
        if (frameCount % 3 === 0) addScreenShake(2);
    } else if (erCurrentTerrain === 'offroad') {
        maxSpeed = 90;
        accel *= 0.5;
        friction = 0.4;
        if (frameCount % 2 === 0) addScreenShake(3);
    } else if (erCurrentTerrain === 'oil') {
        friction = 0.02;
    }
    
    const brake = 1.5;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        erJeepSpeed = Math.min(maxSpeed, erJeepSpeed + accel);
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        erJeepSpeed = Math.max(20, erJeepSpeed - brake);
    } else {
        if (erJeepSpeed > 60) erJeepSpeed -= friction;
    }
    if (erJeepSpeed > maxSpeed) erJeepSpeed = Math.max(maxSpeed, erJeepSpeed - 0.5);
    
    // === ATUALIZAR POSIÇÃO ===
    erPosition += erJeepSpeed * 0.015;
    erScrollOffset = erPosition;
    
    // === EFEITO DA CURVA ===
    if (segment && segment.curve !== 0 && !erDrifting) {
        const curvePush = segment.curve * 0.0006 * (erJeepSpeed / 100);
        erJeepX += curvePush;
    }
    
    // === PROGRESSO ===
    const totalTrack = 4500;
    erProgress = Math.min(100, (erPosition / totalTrack) * 100);
    levelProgress = Math.floor(erProgress);
    
    let challengeName = '';
    for (const [name, ch] of Object.entries(TRACK_CHALLENGES)) {
        if (erPosition >= ch.start && erPosition < ch.end && ch.special) {
            challengeName = getChallengeName(ch.special);
            break;
        }
    }
    document.getElementById('objective-text').innerText = 
        'Rota de Fuga: ' + Math.floor(erProgress) + '%' + (challengeName ? ' - ' + challengeName : '');
    
    if (erProgress >= 100) {
        levelProgress = 100;
        setTimeout(async () => { currentLevelIndex++; await startLevel(currentLevelIndex); gameState = 'PLAYING'; }, 1500);
        return;
    }
    
    if (erJeepHP <= 0) { player.hp = 0; return; }
    
    // === PARTÍCULAS DE POEIRA ===
    if (erCurrentTerrain === 'sand' || erCurrentTerrain === 'offroad' || erJeepSpeed > 100) {
        if (frameCount % 2 === 0) {
            erDustParticles.push({
                x: canvas.width / 2 + erJeepX * 250 + (Math.random() - 0.5) * 60,
                y: canvas.height - 50,
                vx: (Math.random() - 0.5) * 3,
                vy: -2 - Math.random() * 3,
                size: 8 + Math.random() * 12,
                alpha: 0.7,
                life: 30,
                color: erCurrentTerrain === 'offroad' ? 'rgba(100,80,60,' : 'rgba(180,150,100,'
            });
        }
    }
    
    if (erDrifting && frameCount % 3 === 0) {
        erTireTracks.push({ x: erJeepX, z: erPosition, alpha: 0.6 });
    }
    
    for (let dust of erDustParticles) {
        dust.x += dust.vx; dust.y += dust.vy;
        dust.alpha -= 0.025; dust.size += 0.8; dust.life--;
    }
    erDustParticles = erDustParticles.filter(d => d.life > 0 && d.alpha > 0);
    
    for (let track of erTireTracks) { track.alpha -= 0.01; }
    erTireTracks = erTireTracks.filter(t => t.alpha > 0 && t.z > erPosition - 100);
    
    for (let w of erWarningTexts) { w.timer--; }
    erWarningTexts = erWarningTexts.filter(w => w.timer > 0);
    
    // === UPDATE OBSTÁCULOS ===
    spawnDynamicObstacles();
    updateEscapeRouteObstacles();
    updateRpgSoldiers();
    updateRockets();
    checkEscapeRouteCollisions();
}

function getChallengeName(special) {
    const names = {
        'death_curve': '⚠️ CURVA DA MORTE',
        'fire_corridor': '🔥 CORREDOR DE FOGO',
        'broken_bridge': '🌉 PONTE QUEBRADA',
        'chicane': '↩️ CHICANE',
        'truck_alley': '🚚 CAMINHÕES',
        'final_ambush': '💀 EMBOSCADA FINAL'
    };
    return names[special] || '';
}

function checkOilCollision() {
    const playerZ = erPosition + 8;
    for (let oil of erOilPools) {
        if (oil.active && Math.abs(oil.z - playerZ) < 18) {
            if (Math.abs(oil.x - erJeepX) < oil.w) return true;
        }
    }
    return false;
}

function spawnDynamicObstacles() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    
    // === MINAS CONSTANTES NA AREIA (extremidades) ===
    // Sempre spawnar minas na areia para impedir zona segura permanente
    if (frameCount % 60 === 0) { // A cada segundo, minas nas duas extremidades
        // Mina na areia esquerda
        erMines.push({
            x: -0.65 - Math.random() * 0.35, // Entre -0.65 e -1.0
            z: erPosition + 200 + Math.random() * 100,
            size: 15, active: true, hidden: true
        });
        // Mina na areia direita
        erMines.push({
            x: 0.65 + Math.random() * 0.35, // Entre 0.65 e 1.0
            z: erPosition + 200 + Math.random() * 100,
            size: 15, active: true, hidden: true
        });
    }
    
    // === SISTEMA ANTI-ZONA-SEGURA AGRESSIVO ===
    // Se jogador fica nas extremidades, spawna obstáculos EXTRAS para forçar movimento
    const isAtEdge = Math.abs(erJeepX) > 0.5;
    if (isAtEdge) {
        erEdgeTimer++;
        
        // Spawn imediato de minas no caminho do jogador se ficar na borda
        if (erEdgeTimer > 90 && frameCount % 45 === 0) { // Após 1.5s, minas a cada 0.75s
            const playerSide = erJeepX > 0 ? 1 : -1;
            // Minas em sequência no caminho do jogador
            for (let i = 0; i < 2; i++) {
                erMines.push({
                    x: playerSide * (0.55 + Math.random() * 0.3),
                    z: erPosition + 150 + i * 50 + Math.random() * 30,
                    size: 15, active: true, hidden: false
                });
            }
        }
    } else {
        erEdgeTimer = Math.max(0, erEdgeTimer - 3); // Resetar mais rápido
    }
    
    // Após 3 segundos na extremidade, forçar mudança com barreiras
    if (erEdgeTimer > 180 && frameCount % 90 === 0) {
        const playerSide = erJeepX > 0 ? 1 : -1;
        // Barreira bloqueando o lado do jogador
        erBarriers.push({
            x: playerSide * 0.6,
            z: erPosition + 180 + Math.random() * 30,
            w: 70, h: 25, active: true
        });
        // Aviso visual
        if (erEdgeTimer === 181 || frameCount % 180 === 0) {
            erWarningTexts.push({ text: '⚠️ MUDE DE FAIXA!', y: 200, life: 90, color: '#ff4444', size: 18 });
        }
    }
    
    // Minas normais
    if (frameCount % cfg.mineSpawnRate === 0) {
        const inSand = Math.random() > 0.4;
        const x = inSand ? (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.3) : (Math.random() - 0.5) * 0.8;
        erMines.push({ x: x, z: erPosition + 250 + Math.random() * 50, size: 15, active: true, hidden: inSand });
    }
    
    if (frameCount % cfg.truckSpawnRate === 0) {
        const seg = erRoadSegments[Math.floor(erPosition) % erRoadSegments.length];
        if (!seg || !seg.special || seg.special === 'truck_alley') {
            const lane = Math.floor(Math.random() * 3) - 1;
            erTrucks.push({ x: lane * 0.35, z: erPosition + 280 + Math.random() * 50, w: 50, h: 100, speed: 25 + Math.random() * 25, active: true });
        }
    }
    
    if (frameCount % cfg.barrierSpawnRate === 0) {
        const side = Math.random() > 0.5 ? 1 : -1;
        erBarriers.push({ x: side * 0.4 + (Math.random() - 0.5) * 0.2, z: erPosition + 260 + Math.random() * 40, w: 70, h: 25, active: true });
    }
}

function updateRpgSoldiers() {
    const playerZ = erPosition + 8;
    for (let soldier of erRpgSoldiers) {
        if (!soldier.active) continue;
        const dist = soldier.z - playerZ;
        
        // Estado do soldado baseado na distância
        if (dist > 160) {
            soldier.state = 'waiting';
        } else if (dist > 80 && dist <= 160) {
            soldier.state = 'aiming';
        } else if (dist > 40 && dist <= 80) {
            if (!soldier.hasShot && soldier.cooldown <= 0) {
                soldier.state = 'firing';
                // Dispara foguete com leve homing
                const targetX = erJeepX;
                erRockets.push({
                    x: soldier.x, z: soldier.z, targetX: targetX,
                    vx: (targetX - soldier.x) * 0.015, vz: -3.2,
                    active: true, trail: [], homing: true
                });
                soldier.cooldown = 150;
                soldier.hasShot = true;
                AudioEngine.playShoot();
            }
        } else {
            soldier.state = 'waiting';
        }
        
        soldier.cooldown = Math.max(0, soldier.cooldown - 1);
        if (dist < 0) {
            soldier.hasShot = false;
            soldier.state = 'waiting';
        }
    }
}

function updateRockets() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    for (let rocket of erRockets) {
        if (!rocket.active) continue;
        
        // Homing leve: foguete ajusta direção em direção ao jogador
        if (rocket.homing) {
            const dx = erJeepX - rocket.x;
            rocket.vx += dx * 0.003; // Ajuste suave de 0.3% por frame
            rocket.vx = Math.max(-0.15, Math.min(0.15, rocket.vx)); // Limitar velocidade lateral
        }
        
        rocket.x += rocket.vx;
        rocket.z += rocket.vz;
        
        // Calcular ângulo baseado na velocidade
        rocket.angle = Math.atan2(rocket.vx * 10, -rocket.vz);
        
        if (frameCount % 2 === 0) rocket.trail.push({ x: rocket.x, z: rocket.z, alpha: 1 });
        for (let t of rocket.trail) t.alpha -= 0.06;
        rocket.trail = rocket.trail.filter(t => t.alpha > 0);
        
        const playerZ = erPosition + 8;
        if (Math.abs(rocket.z - playerZ) < 12 && Math.abs(rocket.x - erJeepX) < 0.2) {
            rocket.active = false;
            erJeepHP -= cfg.rpgDamage;
            erJeepSpeed = Math.max(40, erJeepSpeed * 0.7);
            addScreenShake(15);
            AudioEngine.playExplosion();
            erExplosions.push({ x: rocket.x, z: rocket.z, radius: 25, alpha: 1 });
            floatingTexts.push(new FloatingText(canvas.width/2, 400, '-' + cfg.rpgDamage + ' RPG!', '#ff0000'));
        }
        
        if (rocket.z < erPosition - 30) rocket.active = false;
    }
    erRockets = erRockets.filter(r => r.active);
}

function updateEscapeRouteObstacles() {
    erMines = erMines.filter(m => m.z > erPosition - 15 && m.active);
    erTrucks = erTrucks.filter(t => t.z > erPosition - 20 && t.active);
    erBarriers = erBarriers.filter(b => b.z > erPosition - 15 && b.active);
    erOilPools = erOilPools.filter(o => o.z > erPosition - 30);
    erConcreteBarriers = erConcreteBarriers.filter(c => c.z > erPosition - 15);
    
    for (let truck of erTrucks) {
        truck.z += truck.speed * 0.01;
    }
    
    for (let exp of erExplosions) {
        exp.radius += 5;
        exp.alpha -= 0.08;
    }
    erExplosions = erExplosions.filter(e => e.alpha > 0);
}

function checkEscapeRouteCollisions() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    const playerZ = erPosition + 8;
    
    // Minas
    for (let mine of erMines) {
        if (mine.active && Math.abs(mine.z - playerZ) < 12) {
            const dx = Math.abs(mine.x - erJeepX);
            if (dx < 0.18) {
                mine.active = false;
                erJeepHP -= cfg.mineDamage;
                erJeepSpeed = Math.max(40, erJeepSpeed * 0.6);
                addScreenShake(12);
                AudioEngine.playExplosion();
                erExplosions.push({ x: mine.x, z: mine.z, radius: 15, alpha: 1 });
                floatingTexts.push(new FloatingText(canvas.width/2, 450, '-' + cfg.mineDamage, '#ff4444'));
            }
        }
    }
    
    // Caminhões
    for (let truck of erTrucks) {
        if (truck.active && Math.abs(truck.z - playerZ) < 18) {
            const dx = Math.abs(truck.x - erJeepX);
            if (dx < 0.22) {
                truck.active = false;
                erJeepHP -= cfg.collisionDamage * 2;
                erJeepSpeed = Math.max(25, erJeepSpeed * 0.25);
                addScreenShake(18);
                AudioEngine.playExplosion();
                erExplosions.push({ x: truck.x, z: truck.z, radius: 35, alpha: 1 });
                floatingTexts.push(new FloatingText(canvas.width/2, 450, '-' + (cfg.collisionDamage * 2), '#ff0000'));
            }
        }
    }
    
    // Barreiras
    for (let barrier of erBarriers) {
        if (barrier.active && Math.abs(barrier.z - playerZ) < 12) {
            const dx = Math.abs(barrier.x - erJeepX);
            if (dx < 0.2) {
                barrier.active = false;
                erJeepHP -= cfg.collisionDamage;
                erJeepSpeed = Math.max(40, erJeepSpeed * 0.55);
                addScreenShake(8);
                AudioEngine.playDamage();
                floatingTexts.push(new FloatingText(canvas.width/2, 450, '-' + cfg.collisionDamage, '#ffaa00'));
            }
        }
    }
    
    // Barreiras de concreto (indestrutíveis)
    for (let concrete of erConcreteBarriers) {
        if (concrete.active && Math.abs(concrete.z - playerZ) < 15) {
            if (Math.abs(concrete.x - erJeepX) < concrete.w) {
                erJeepHP -= cfg.collisionDamage;
                erJeepSpeed = Math.max(30, erJeepSpeed * 0.4);
                erJeepX += concrete.x > 0 ? -0.1 : 0.1;
                addScreenShake(10);
                AudioEngine.playDamage();
            }
        }
    }
}

function drawEscapeRouteLevel() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    const horizonY = 180;
    
    // ===== CÉU COM GRADIENTE =====
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0a1830');
    skyGrad.addColorStop(0.3, '#1a4060');
    skyGrad.addColorStop(0.6, '#3a6080');
    skyGrad.addColorStop(1, '#c09060');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, horizonY);
    
    // Sol
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath();
    ctx.arc(700, horizonY - 40, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffee88';
    ctx.beginPath();
    ctx.arc(700, horizonY - 40, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Montanhas distantes
    ctx.fillStyle = '#5a4030';
    drawMountainRange(0, horizonY, 120, 60, 7, erPosition * 0.01);
    ctx.fillStyle = '#6a5040';
    drawMountainRange(0, horizonY, 100, 45, 9, erPosition * 0.02);
    
    // ===== PISTA COM PERSPECTIVA PSEUDO-3D =====
    drawPerspectiveRoad(horizonY);
    
    // ===== OBSTÁCULOS EM PERSPECTIVA =====
    drawPerspectiveObstacles(horizonY);
    
    // ===== POEIRA ATRÁS DO JIPE =====
    for (let dust of erDustParticles) {
        ctx.fillStyle = `rgba(180, 150, 100, ${dust.alpha})`;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ===== EXPLOSÕES EM PERSPECTIVA =====
    for (let exp of erExplosions) {
        const screenPos = projectToScreen(exp.x, exp.z, horizonY);
        if (screenPos) {
            ctx.fillStyle = `rgba(255, 100, 0, ${exp.alpha})`;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, exp.radius * screenPos.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 100, ${exp.alpha})`;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, exp.radius * screenPos.scale * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // ===== JIPE (visto de trás) =====
    drawJeepPerspective();
    
    // ===== FLOATING TEXTS =====
    floatingTexts.forEach(t => { t.update(); t.draw(ctx); });
    
    // ===== HUD =====
    drawEscapeRouteHUD();
}

function drawMountainRange(startX, baseY, maxHeight, minHeight, count, offset) {
    for (let i = 0; i < count; i++) {
        const mX = ((i * (canvas.width / count) + offset * 50) % (canvas.width + 200)) - 100;
        const mH = minHeight + Math.abs(Math.sin(i * 1.7 + offset)) * (maxHeight - minHeight);
        ctx.beginPath();
        ctx.moveTo(mX, baseY);
        ctx.lineTo(mX + 80, baseY - mH);
        ctx.lineTo(mX + 160, baseY);
        ctx.closePath();
        ctx.fill();
    }
}

function drawPerspectiveRoad(horizonY) {
    const roadBottom = canvas.height;
    const segments = 80;
    
    const segIdx = Math.floor(erPosition) % erRoadSegments.length;
    const currentCurve = erRoadSegments[segIdx]?.curve || 0;
    
    for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const nextT = (i + 1) / segments;
        
        const y = horizonY + (roadBottom - horizonY) * Math.pow(t, 1.5);
        const nextY = horizonY + (roadBottom - horizonY) * Math.pow(nextT, 1.5);
        
        const width = 40 + (canvas.width - 80) * Math.pow(t, 1.3);
        const nextWidth = 40 + (canvas.width - 80) * Math.pow(nextT, 1.3);
        
        // Curvas muito suaves - multiplicador reduzido de 150 para 40
        const curveOffset = currentCurve * (1 - t) * (1 - t) * 40;
        const nextCurveOffset = currentCurve * (1 - nextT) * (1 - nextT) * 40;
        
        const centerX = canvas.width / 2 + curveOffset;
        const nextCenterX = canvas.width / 2 + nextCurveOffset;
        
        // === TERRENO LATERAL (areia do deserto) ===
        const sandColor = (Math.floor(erPosition * 2 + i) % 2 === 0) ? '#b8a060' : '#a89050';
        ctx.fillStyle = sandColor;
        ctx.fillRect(0, y, canvas.width, nextY - y + 1);
        
        // === FAIXA VERDE (grama/acostamento) - estilo F1 clássico ===
        const grassWidth = width * 0.12;
        const nextGrassWidth = nextWidth * 0.12;
        const grassColor = (Math.floor(erPosition * 2 + i) % 2 === 0) ? '#4a7a30' : '#3a6020';
        ctx.fillStyle = grassColor;
        
        // Grama esquerda
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2 - grassWidth, y);
        ctx.lineTo(centerX - width / 2, y);
        ctx.lineTo(nextCenterX - nextWidth / 2, nextY);
        ctx.lineTo(nextCenterX - nextWidth / 2 - nextGrassWidth, nextY);
        ctx.closePath();
        ctx.fill();
        
        // Grama direita
        ctx.beginPath();
        ctx.moveTo(centerX + width / 2, y);
        ctx.lineTo(centerX + width / 2 + grassWidth, y);
        ctx.lineTo(nextCenterX + nextWidth / 2 + nextGrassWidth, nextY);
        ctx.lineTo(nextCenterX + nextWidth / 2, nextY);
        ctx.closePath();
        ctx.fill();
        
        // === ASFALTO ===
        const asphaltColor = (Math.floor(erPosition * 2 + i) % 2 === 0) ? '#505050' : '#404040';
        ctx.fillStyle = asphaltColor;
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2, y);
        ctx.lineTo(centerX + width / 2, y);
        ctx.lineTo(nextCenterX + nextWidth / 2, nextY);
        ctx.lineTo(nextCenterX - nextWidth / 2, nextY);
        ctx.closePath();
        ctx.fill();
        
        // === RUMBLE STRIPS (zebra vermelho/branco) ===
        const rumbleW = width * 0.05;
        const nextRumbleW = nextWidth * 0.05;
        const rumbleColor = (Math.floor(erPosition * 2 + i) % 4 < 2) ? '#dd0000' : '#ffffff';
        ctx.fillStyle = rumbleColor;
        
        // Esquerda
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2, y);
        ctx.lineTo(centerX - width / 2 + rumbleW, y);
        ctx.lineTo(nextCenterX - nextWidth / 2 + nextRumbleW, nextY);
        ctx.lineTo(nextCenterX - nextWidth / 2, nextY);
        ctx.closePath();
        ctx.fill();
        
        // Direita
        ctx.beginPath();
        ctx.moveTo(centerX + width / 2 - rumbleW, y);
        ctx.lineTo(centerX + width / 2, y);
        ctx.lineTo(nextCenterX + nextWidth / 2, nextY);
        ctx.lineTo(nextCenterX + nextWidth / 2 - nextRumbleW, nextY);
        ctx.closePath();
        ctx.fill();
        
        // === LINHA CENTRAL TRACEJADA ===
        if (Math.floor(erPosition * 2 + i) % 6 < 3) {
            ctx.fillStyle = '#ffffff';
            const lineW = Math.max(2, width * 0.015);
            ctx.beginPath();
            ctx.moveTo(centerX - lineW, y);
            ctx.lineTo(centerX + lineW, y);
            ctx.lineTo(nextCenterX + Math.max(2, nextWidth * 0.015), nextY);
            ctx.lineTo(nextCenterX - Math.max(2, nextWidth * 0.015), nextY);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// Projeta posição da pista (roadX, roadZ) para coordenadas de tela
// roadX: -1.0 (esquerda) a 1.0 (direita), roadZ: distância na pista
function projectToScreen(roadX, roadZ, horizonY) {
    const relZ = roadZ - erPosition;
    if (relZ <= 0 || relZ > 300) return null;
    
    // Normalizar distância (0 = horizonte, 1 = perto do jogador)
    const maxDist = 300;
    const t = 1 - (relZ / maxDist);
    if (t < 0 || t > 1) return null;
    
    // Posição Y na tela - EXATAMENTE a mesma fórmula da pista
    const screenY = horizonY + (canvas.height - horizonY) * Math.pow(t, 1.5);
    
    // Largura da pista nesta posição (mesma fórmula)
    const roadWidth = 40 + (canvas.width - 80) * Math.pow(t, 1.3);
    
    // Escala proporcional à largura da pista (quanto mais perto, maior)
    const scale = roadWidth / 400;
    
    // Curva da pista
    const segIdx = Math.floor(erPosition) % erRoadSegments.length;
    const curve = erRoadSegments[segIdx]?.curve || 0;
    const curveOffset = curve * (1 - t) * (1 - t) * 40;
    
    // Posição X - usar largura da pista para posicionar lateralmente
    const centerX = canvas.width / 2 + curveOffset;
    const screenX = centerX + roadX * (roadWidth / 2) * 0.85;
    
    if (screenY < horizonY + 5 || screenY > canvas.height - 20) return null;
    
    return { x: screenX, y: screenY, scale: scale, roadWidth: roadWidth };
}

function drawPerspectiveObstacles(horizonY) {
    // Combinar todos os obstáculos incluindo os novos tipos
    const allObs = [
        ...erMines.map(m => ({ ...m, type: 'mine' })),
        ...erTrucks.map(t => ({ ...t, type: 'truck' })),
        ...erBarriers.map(b => ({ ...b, type: 'barrier' })),
        ...erConcreteBarriers.map(c => ({ ...c, type: 'concrete' })),
        ...erOilPools.map(o => ({ ...o, type: 'oil' })),
        ...erRpgSoldiers.map(r => ({ ...r, type: 'rpg' })),
        ...erRockets.map(r => ({ ...r, type: 'rocket' }))
    ].sort((a, b) => b.z - a.z); // Desenhar do mais distante para o mais próximo
    
    for (let obs of allObs) {
        if (!obs.active) continue;
        const pos = projectToScreen(obs.x, obs.z, horizonY);
        if (!pos) continue;
        
        // Escala baseada na largura da pista (cresce suavemente)
        const baseScale = pos.scale;
        
        if (obs.type === 'mine') {
            // Mina em PERSPECTIVA - achatada no chão
            const scale = Math.max(1.2, baseScale * 2.5);
            const blink = frameCount % 12 < 6;
            
            // Desenha mina em perspectiva (como disco no chão)
            drawMinePerspective(pos.x, pos.y, scale, blink);
            
        } else if (obs.type === 'truck') {
            // Caminhão: dimensões dinâmicas do template (22x30)
            const scale = Math.max(1.2, baseScale * 3.2);
            const truckW = 22 * scale;
            const truckH = 30 * scale;
            
            // Sombra já é desenhada pela função drawTruckSprite
            // Caminhão com rodas no chão
            const groundOffset = truckH * 0.08;
            drawTruckSprite(ctx, pos.x - truckW/2, pos.y - truckH + groundOffset, scale, false);
            
        } else if (obs.type === 'barrier') {
            // Barreira: dimensões dinâmicas do template (24x11)
            const scale = Math.max(1.5, baseScale * 3.5);
            const barrierW = 24 * scale;
            const barrierH = 11 * scale;
            
            // Sombra já é desenhada pela função drawBarrierSprite
            // Barreira com base no chão
            const groundOffset = barrierH * 0.2;
            drawBarrierSprite(ctx, pos.x - barrierW/2, pos.y - barrierH + groundOffset, scale);
            
        } else if (obs.type === 'concrete') {
            // Barreira de concreto - mais larga e pesada
            drawConcreteBarrier(pos.x, pos.y, baseScale, obs.w || 0.3);
            
        } else if (obs.type === 'oil') {
            // Poça de óleo - mancha escura iridescente
            const oilScale = baseScale * (obs.size || 1);
            if (isFinite(oilScale) && oilScale > 0) {
                drawOilPuddle(pos.x, pos.y, oilScale);
            }
            
        } else if (obs.type === 'rpg') {
            // Soldado com RPG nas laterais
            drawRpgSoldier(pos.x, pos.y, baseScale, obs.side, obs.state);
            
        } else if (obs.type === 'rocket') {
            // Foguete voando em direção ao jogador
            drawRocket(pos.x, pos.y, baseScale, obs.angle);
        }
    }
}

// Desenha poça de óleo com efeito iridescente
function drawOilPuddle(x, y, scale) {
    // Proteção contra valores inválidos
    if (!isFinite(scale) || scale <= 0) scale = 1;
    if (!isFinite(x) || !isFinite(y)) return;
    
    const size = 40 * scale;
    
    // Sombra da poça
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, size * 0.6, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Poça principal - gradiente para efeito iridescente
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(0.3, '#2a2a4a');
    grad.addColorStop(0.5, '#3a2a5a');
    grad.addColorStop(0.7, '#4a3a2a');
    grad.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.55, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflexos do óleo (efeito arco-íris sutil)
    const shimmer = (Math.sin(frameCount * 0.1) + 1) * 0.3;
    ctx.fillStyle = `rgba(100, 50, 150, ${shimmer})`;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.15, y - size * 0.02, size * 0.2, size * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = `rgba(50, 150, 100, ${shimmer * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.1, y + size * 0.02, size * 0.15, size * 0.04, -0.2, 0, Math.PI * 2);
    ctx.fill();
}

// Desenha barreira de concreto (tipo Jersey barrier)
function drawConcreteBarrier(x, y, scale, width) {
    const w = (width || 0.3) * 300 * scale;
    const h = 20 * scale;
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - w/2, y - 2, w, 5);
    
    // Base (mais larga)
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.moveTo(x - w/2, y);
    ctx.lineTo(x + w/2, y);
    ctx.lineTo(x + w/2 - 3*scale, y - h * 0.3);
    ctx.lineTo(x - w/2 + 3*scale, y - h * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Corpo principal (trapezoidal)
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.moveTo(x - w/2 + 3*scale, y - h * 0.3);
    ctx.lineTo(x + w/2 - 3*scale, y - h * 0.3);
    ctx.lineTo(x + w/2 - 8*scale, y - h);
    ctx.lineTo(x - w/2 + 8*scale, y - h);
    ctx.closePath();
    ctx.fill();
    
    // Topo
    ctx.fillStyle = '#b0b0b0';
    ctx.beginPath();
    ctx.moveTo(x - w/2 + 8*scale, y - h);
    ctx.lineTo(x + w/2 - 8*scale, y - h);
    ctx.lineTo(x + w/2 - 10*scale, y - h - 3*scale);
    ctx.lineTo(x - w/2 + 10*scale, y - h - 3*scale);
    ctx.closePath();
    ctx.fill();
    
    // Listras de perigo (opcional)
    if (scale > 1) {
        ctx.fillStyle = '#ffcc00';
        const stripeW = 8 * scale;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x - w/4 + i * stripeW * 2, y - h * 0.9, stripeW, h * 0.4);
        }
    }
}

// Desenha mina em perspectiva (achatada no chão como disco)
function drawMinePerspective(x, y, scale, blink) {
    const s = scale;
    const w = 20 * s;  // largura
    const h = 7 * s;   // altura (achatada em perspectiva)
    
    // Sombra sob a mina
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, w * 0.5, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow vermelho quando piscando
    if (blink) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.7, h * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Borda externa (anel metálico)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corpo da mina (disco)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Placa de pressão (centro)
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.32, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Indicador central
    const lightColor = blink ? '#ff4444' : '#550000';
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.15, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Brilho do indicador quando piscando
    if (blink) {
        ctx.fillStyle = '#ff8888';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.03, y - h * 0.03, w * 0.06, h * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Rebites/detalhes em volta
    ctx.fillStyle = '#555555';
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const rx = x + Math.cos(angle) * w * 0.35;
        const ry = y + Math.sin(angle) * h * 0.35;
        ctx.beginPath();
        ctx.ellipse(rx, ry, s * 1.2, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Desenha soldado com RPG (estilo pixel-art VERMELHO igual fase 1)
function drawRpgSoldier(x, y, scale, side, state) {
    const s = Math.max(1.8, scale * 3);
    const facing = side === 'left' ? 1 : -1;
    
    // Cores do soldado inimigo (igual SOLDIER_PALETTES.enemy da fase 1)
    const COLORS = {
        skin: '#c4957a',
        skinDark: '#946550',
        skinLight: '#e4b59a',
        uniform: '#8b3030',      // Vermelho inimigo!
        uniformDark: '#5b1515',
        uniformLight: '#ab5050',
        boots: '#1a1a15',
        metal: '#4a4a4a',
        metalDark: '#2a2a2a',
        helmet: '#6b2020'        // Capacete vermelho escuro
    };
    
    // Sombra elíptica no chão
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // === PERNAS (botas pretas) ===
    ctx.fillStyle = COLORS.boots;
    ctx.fillRect(x - 4*s, y - 4*s, 3*s, 4*s);
    ctx.fillRect(x + 1*s, y - 4*s, 3*s, 4*s);
    
    // Calças (uniforme vermelho escuro)
    ctx.fillStyle = COLORS.uniformDark;
    ctx.fillRect(x - 4*s, y - 10*s, 3*s, 6*s);
    ctx.fillRect(x + 1*s, y - 10*s, 3*s, 6*s);
    
    // === CORPO (uniforme vermelho) ===
    // Torso principal
    ctx.fillStyle = COLORS.uniform;
    ctx.fillRect(x - 5*s, y - 20*s, 10*s, 10*s);
    
    // Highlight do torso
    ctx.fillStyle = COLORS.uniformLight;
    ctx.fillRect(x - 4*s, y - 19*s, 2*s, 3*s);
    
    // Sombra do torso
    ctx.fillStyle = COLORS.uniformDark;
    ctx.fillRect(x + 2*s, y - 18*s, 2*s, 6*s);
    
    // Cinto
    ctx.fillStyle = COLORS.metalDark;
    ctx.fillRect(x - 5*s, y - 11*s, 10*s, 2*s);
    ctx.fillStyle = '#ffcc00'; // Fivela dourada
    ctx.fillRect(x - 1*s, y - 11*s, 2*s, 2*s);
    
    // === BRAÇOS (uniforme vermelho) ===
    ctx.fillStyle = COLORS.uniform;
    ctx.fillRect(x + 4*s * facing, y - 18*s, 4*s, 4*s);
    ctx.fillRect(x - 8*s * facing, y - 17*s, 4*s, 4*s);
    
    // Mãos
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(x + 7*s * facing, y - 16*s, 2*s, 2*s);
    
    // === CABEÇA COM CAPACETE VERMELHO ===
    // Capacete
    ctx.fillStyle = COLORS.helmet;
    ctx.beginPath();
    ctx.ellipse(x, y - 25*s, 5*s, 4*s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Brilho do capacete
    ctx.fillStyle = COLORS.uniformLight;
    ctx.beginPath();
    ctx.ellipse(x - 2*s, y - 27*s, 2*s, 1.5*s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Aba do capacete
    ctx.fillStyle = COLORS.uniformDark;
    ctx.fillRect(x - 6*s, y - 23*s, 12*s, 2*s);
    
    // Rosto (tom de pele)
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(x - 3*s, y - 23*s, 6*s, 5*s);
    
    // Sombra do rosto
    ctx.fillStyle = COLORS.skinDark;
    ctx.fillRect(x + 1*s, y - 22*s, 2*s, 3*s);
    
    // Olhos (olhar ameaçador)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 2*s, y - 21*s, 1.5*s, 1.5*s);
    ctx.fillRect(x + 0.5*s, y - 21*s, 1.5*s, 1.5*s);
    
    // Sobrancelhas franzidas
    ctx.fillStyle = COLORS.skinDark;
    ctx.fillRect(x - 2.5*s, y - 22.5*s, 2*s, 0.8*s);
    ctx.fillRect(x + 0.5*s, y - 22.5*s, 2*s, 0.8*s);
    
    // === RPG (LANÇADOR DE FOGUETES) ===
    ctx.save();
    ctx.translate(x + 3*s * facing, y - 16*s);
    
    // Ângulo do RPG baseado no estado
    let rpgAngle = 0;
    if (state === 'waiting') rpgAngle = facing * 0.5;      // Apontando para cima
    else if (state === 'aiming') rpgAngle = facing * 0.3;  // Mirando
    else if (state === 'firing') rpgAngle = facing * 0.25; // Disparando
    ctx.rotate(rpgAngle);
    
    // Tubo principal (verde militar escuro)
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(0, -2.5*s, 24*s * facing, 5*s);
    
    // Detalhes do tubo
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(4*s * facing, -3*s, 4*s, 6*s);   // Empunhadura
    ctx.fillRect(14*s * facing, -3*s, 3*s, 6*s);  // Anel
    
    // Bocal (saída do foguete)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(22*s * facing, -3.5*s, 4*s, 7*s);
    
    // Interior do bocal
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(24*s * facing, -2*s, 2*s, 4*s);
    
    // Mira óptica
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(8*s * facing, -5*s, 3*s, 2*s);
    ctx.fillStyle = '#88aaff'; // Lente azul
    ctx.fillRect(9*s * facing, -4.5*s, 1*s, 1*s);
    
    ctx.restore();
    
    // Laser de mira quando apontando
    if (state === 'aiming' && frameCount % 4 < 2) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(x + 28*s * facing, y - 14*s);
        ctx.lineTo(x + 100*s * facing, y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Ponto de mira no final
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(x + 100*s * facing, y, 5*s, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Flash de disparo
    if (state === 'firing' && frameCount % 3 < 2) {
        // Flash traseiro (backblast)
        ctx.fillStyle = 'rgba(255, 150, 50, 0.7)';
        ctx.beginPath();
        ctx.arc(x - 5*s * facing, y - 15*s, 12*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Flash frontal
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x + 28*s * facing, y - 14*s, 10*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 28*s * facing, y - 14*s, 5*s, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Desenha foguete RPG
function drawRocket(x, y, scale, angle) {
    const s = Math.max(1, scale * 2);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    
    // Corpo do foguete
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(-12*s, -2*s, 24*s, 4*s);
    
    // Ponta (ogiva)
    ctx.fillStyle = '#3a4a3a';
    ctx.beginPath();
    ctx.moveTo(12*s, -2*s);
    ctx.lineTo(18*s, 0);
    ctx.lineTo(12*s, 2*s);
    ctx.closePath();
    ctx.fill();
    
    // Aletas traseiras
    ctx.fillStyle = '#2a3a2a';
    ctx.beginPath();
    ctx.moveTo(-12*s, -2*s);
    ctx.lineTo(-16*s, -6*s);
    ctx.lineTo(-10*s, -2*s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12*s, 2*s);
    ctx.lineTo(-16*s, 6*s);
    ctx.lineTo(-10*s, 2*s);
    ctx.closePath();
    ctx.fill();
    
    // Trail de fogo
    const trailLen = 15 + Math.random() * 10;
    const grad = ctx.createLinearGradient(-12*s, 0, -12*s - trailLen*s, 0);
    grad.addColorStop(0, '#ffaa00');
    grad.addColorStop(0.3, '#ff6600');
    grad.addColorStop(0.7, '#ff3300');
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-12*s, -2*s);
    ctx.lineTo(-12*s - trailLen*s, 0);
    ctx.lineTo(-12*s, 2*s);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawJeepPerspective() {
    // Usar sprite template pixel-art
    const scale = 3.5; // Escala do sprite
    
    // Dimensões dinâmicas baseadas no template real (NÃO hardcoded 24x32!)
    const tpl = getJeepWheelFrame(erJeepSpeed);
    const jeepW = tpl[0].length * scale;
    const jeepH = tpl.length * scale;
    
    const jeepY = canvas.height - 140;
    const jeepX = canvas.width / 2 + erJeepX * 280 - jeepW / 2;
    
    const braking = keys['ArrowDown'] || keys['s'] || keys['S'];
    const flash = erJeepHP < 25 && frameCount % 6 < 3;
    
    // Leve bobbing vertical para sensação de movimento
    const bobY = Math.sin(frameCount * 0.15) * (erJeepSpeed / 80);
    
    // Desenhar jipe com template pixel-art (sem rotação!)
    drawJeepSprite(ctx, jeepX, jeepY + bobY, scale, erJeepSpeed, braking, flash);
    
    // Fumaça se danificado - spawn relativo ao tamanho real do sprite
    if (erJeepHP < 50 && frameCount % 3 === 0) {
        particles.push(new SmokeParticle(
            jeepX + jeepW / 2 + (Math.random() - 0.5) * (jeepW * 0.5),
            jeepY - jeepH * 0.1,
            erJeepHP < 25 ? '#222222' : '#555555'
        ));
    }
}

function drawEscapeRouteHUD() {
    const cfg = ESCAPE_ROUTE_CONFIG;
    
    // === PAINEL CENTRAL ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(canvas.width / 2 - 130, 12, 260, 55);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 130, 12, 260, 55);
    
    // HP Bar
    const hpPercent = erJeepHP / cfg.jeepHP;
    const hpColor = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = '#333333';
    ctx.fillRect(canvas.width / 2 - 120, 22, 240, 16);
    ctx.fillStyle = hpColor;
    ctx.fillRect(canvas.width / 2 - 120, 22, 240 * hpPercent, 16);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - 120, 22, 240, 16);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JIPE: ' + Math.ceil(erJeepHP) + '%', canvas.width / 2, 35);
    
    // Barra de progresso
    ctx.fillStyle = '#333333';
    ctx.fillRect(canvas.width / 2 - 120, 45, 240, 12);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(canvas.width / 2 - 120, 45, 240 * (erProgress / 100), 12);
    ctx.strokeStyle = '#666666';
    ctx.strokeRect(canvas.width / 2 - 120, 45, 240, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('ROTA: ' + Math.floor(erProgress) + '%', canvas.width / 2, 54);
    
    // === VELOCÍMETRO ===
    const speedX = 75;
    const speedY = canvas.height - 75;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.arc(speedX, speedY, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(speedX, speedY, 52, 0, Math.PI * 2);
    ctx.stroke();
    
    const maxSpeed = 180;
    const speedPercent = Math.min(erJeepSpeed / maxSpeed, 1);
    const startAngle = Math.PI * 0.75;
    const endAngle = startAngle + Math.PI * 1.5 * speedPercent;
    
    ctx.strokeStyle = speedPercent > 0.85 ? '#ff4444' : speedPercent > 0.6 ? '#ffaa00' : '#44ff44';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(speedX, speedY, 42, startAngle, endAngle);
    ctx.stroke();
    ctx.lineCap = 'butt';
    
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 6; i++) {
        const angle = startAngle + (i / 6) * Math.PI * 1.5;
        const x1 = speedX + Math.cos(angle) * 48;
        const y1 = speedY + Math.sin(angle) * 48;
        const x2 = speedX + Math.cos(angle) * 52;
        const y2 = speedY + Math.sin(angle) * 52;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(erJeepSpeed), speedX, speedY + 6);
    ctx.font = 'bold 10px monospace';
    ctx.fillText('KM/H', speedX, speedY + 22);
    
    // === INDICADOR DE TERRENO ===
    const terrainColors = { 'asphalt': '#44ff44', 'sand': '#ffaa00', 'oil': '#ff4444' };
    const terrainNames = { 'asphalt': 'PISTA', 'sand': 'AREIA', 'oil': 'ÓLEO!' };
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(canvas.width - 95, canvas.height - 45, 85, 35);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 95, canvas.height - 45, 85, 35);
    ctx.fillStyle = terrainColors[erCurrentTerrain] || '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(terrainNames[erCurrentTerrain] || 'PISTA', canvas.width - 52, canvas.height - 22);
    
    // === TEXTOS DE AVISO (nome do desafio atual) ===
    drawWarningTexts();
    
    // === INDICADOR DE DRIFT ===
    if (erDriftTimer > 0) {
        const driftAlpha = Math.min(1, erDriftTimer / 30);
        ctx.fillStyle = `rgba(255, 100, 50, ${driftAlpha})`;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ DERRAPANDO! ⚠', canvas.width / 2, canvas.height - 120);
        
        // Barra de controle reduzido
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(canvas.width / 2 - 60, canvas.height - 105, 120, 8);
        ctx.fillStyle = '#ff6644';
        ctx.fillRect(canvas.width / 2 - 60, canvas.height - 105, 120 * (erDriftTimer / 90), 8);
    }
    
    // === INDICADOR DE DIREÇÃO (NORTE/FRENTE) ===
    drawDirectionIndicator();
    
    // === INSTRUÇÕES ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(canvas.width - 160, 15, 150, 45);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('← → Direção', canvas.width - 20, 30);
    ctx.fillText('↑ Acelerar', canvas.width - 20, 43);
    ctx.fillText('↓ Frear', canvas.width - 20, 56);
    
    ctx.textAlign = 'left';
}

// Indicador visual de direção - mostra claramente que o jipe vai "para frente/norte"
function drawDirectionIndicator() {
    const indX = canvas.width - 50;
    const indY = 130;
    const size = 35;
    
    // Fundo circular
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.arc(indX, indY, size + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(indX, indY, size + 3, 0, Math.PI * 2);
    ctx.stroke();
    
    // Círculo interno (bússola)
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(indX, indY, size - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Seta indicando NORTE (para cima = direção do jipe)
    ctx.save();
    ctx.translate(indX, indY);
    
    // Seta principal (vermelha - norte)
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(0, -size + 8);
    ctx.lineTo(-8, 5);
    ctx.lineTo(0, -2);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    
    // Seta secundária (branca - sul)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, size - 8);
    ctx.lineTo(-6, -3);
    ctx.lineTo(0, 4);
    ctx.lineTo(6, -3);
    ctx.closePath();
    ctx.fill();
    
    // Centro
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Texto "N" no topo
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', indX, indY - size - 8);
    
    // Indicadores cardeais
    ctx.fillStyle = '#888888';
    ctx.font = '9px monospace';
    ctx.fillText('S', indX, indY + size + 14);
    ctx.fillText('O', indX - size - 10, indY + 4);
    ctx.fillText('L', indX + size + 10, indY + 4);
    
    ctx.textAlign = 'left';
}

// Desenha textos de aviso na tela (nome do desafio, avisos de perigo)
function drawWarningTexts() {
    // Atualiza e desenha textos de aviso existentes
    for (let i = erWarningTexts.length - 1; i >= 0; i--) {
        const txt = erWarningTexts[i];
        txt.life--;
        if (txt.life <= 0) {
            erWarningTexts.splice(i, 1);
            continue;
        }
        
        const alpha = Math.min(1, txt.life / 30);
        const scale = 1 + (1 - alpha) * 0.2;
        
        ctx.save();
        ctx.translate(canvas.width / 2, txt.y);
        ctx.scale(scale, scale);
        
        // Sombra do texto
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
        ctx.font = `bold ${txt.size || 24}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, 2, 2);
        
        // Texto principal
        ctx.globalAlpha = alpha;
        ctx.fillStyle = txt.color || '#ffff66';
        ctx.fillText(txt.text, 0, 0);
        ctx.globalAlpha = 1;
        
        ctx.restore();
    }
    
    // Mostra nome do desafio atual
    const challengeName = getChallengeName(erPosition);
    if (challengeName && erProgress < 95) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 75, 180, 28);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 75, 180, 28);
        
        ctx.fillStyle = '#ffcc44';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('📍 ' + challengeName, 18, 94);
    }
}