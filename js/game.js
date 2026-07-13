// ============ GAME CONTROL ============

// Main game start function - now async to wait for server data
async function startGame() {
    console.log('🚀 Iniciando jogo...');
    
    // Start tracking session for rankings
    HighScoreManager.startSession();
    
    // Show loading screen and load data from server
    LoadingScreen.show();
    LoadingScreen.updateProgress(0, 'Inicializando...');
    
    try {
        // Initialize data from server
        const dataLoaded = await DataLoader.init((progress, status) => {
            LoadingScreen.updateProgress(progress * 0.8, status);
        });
        
        if (!dataLoaded) {
            throw new Error('Failed to load game data');
        }
        
        // Initialize game data from server
        LoadingScreen.updateProgress(85, 'Configurando jogo...');
        initLevelsFromServer();
        initPowerupsFromServer();
        
        // Pre-load first level config
        LoadingScreen.updateProgress(90, 'Carregando fase 1...');
        await loadLevelConfigFromServer(1);
        
        LoadingScreen.updateProgress(100, 'Pronto!');
        await new Promise(resolve => setTimeout(resolve, 300));
        LoadingScreen.hide();
        
    } catch (error) {
        console.error('❌ Failed to initialize game data:', error);
        LoadingScreen.showError('Falha ao conectar ao servidor. Usando dados offline.');
        await new Promise(resolve => setTimeout(resolve, 2000));
        LoadingScreen.hide();
        
        // Sem fases do servidor, usar fallback local (senão iria direto à tela de vitória)
        if (levels.length === 0 && typeof FALLBACK_LEVELS !== 'undefined') {
            levels = FALLBACK_LEVELS.map(l => ({ ...l }));
            console.warn('⚠️ Usando', levels.length, 'fases offline');
        }
    }
    
    AudioEngine.init();
    AudioEngine.resume();
    AudioEngine.playMenuSelect();
    
    document.getElementById('start-screen').classList.add('hidden');
    player = new Player(selectedClass);
    currentLevelIndex = 0;
    
    // Iniciar nova campanha - zerar todas as pontuações
    totalScore = 0;
    phaseScore = 0;
    score = 0;
    
    // Resetar fase bônus para a nova campanha
    if (typeof bonusStagePlayed !== 'undefined') {
        bonusStagePlayed = false;
        lastBonusResult = null;
    }
    
    // Carregar bestScore do servidor se logado
    if (typeof HighScoreManager !== 'undefined') {
        bestScore = HighScoreManager.getHighScore() || 0;
        console.log('🏆 Best score inicial:', bestScore);
    }
    
    bonusCrates = [];
    floatingTexts = [];
    activePowerup = null;
    powerupTimer = 0;
    nextPowerupSpawn = 200;
    
    generateIcons();
    AudioEngine.playMusic();
    
    // Arcade transition for first level
    const phaseWord = I18n.currentLang === 'pt' ? 'FASE' : 'PHASE';
    const levelName = `${phaseWord} 1: ${getLevelName(0).toUpperCase()}`;
    
    if (typeof playArcadeTransition === 'function') {
        gameState = 'TRANSITION';
        playArcadeTransition(levelName, async () => {
            await startLevel(0);
            gameState = 'COUNTDOWN';
            console.log('✅ Jogo iniciado! Áudio:', AudioEngine.soundEnabled ? 'LIGADO' : 'DESLIGADO');
            loop();
        });
    } else {
        startLevel(0).then(() => {
            console.log('✅ Jogo iniciado! Áudio:', AudioEngine.soundEnabled ? 'LIGADO' : 'DESLIGADO');
            loop();
        });
    }
}

async function retryLevel() {
    console.log('🔄 Reiniciando fase', currentLevelIndex + 1);
    
    // ROLLBACK: Descartar pontuação da fase (derrota)
    phaseScore = 0;
    score = totalScore; // Volta ao score salvo
    console.log('💰 Score restaurado para:', totalScore, '(phaseScore descartado)');
    
    document.getElementById('gameover-screen').classList.add('hidden');
    player = new Player(selectedClass);
    await startLevel(currentLevelIndex);
    AudioEngine.playMusic();
    gameState = 'PLAYING';
    loop();
}

function generateIcons() {
    const classes = ['soldier', 'tank', 'plane', 'ship'];
    const symbols = { soldier: '🎖️', tank: '🛡️', plane: '✈️', ship: '⚓' };
    const colors = { soldier: '#4a7a35', tank: '#5a6a4a', plane: '#6a8a60', ship: '#4a6a8a' };
    
    classes.forEach(cls => {
        const iconCanvas = document.getElementById('icon-' + cls);
        if (iconCanvas) {
            const iconCtx = iconCanvas.getContext('2d');
            iconCtx.clearRect(0, 0, 70, 70);
            
            // Fundo com cor da classe
            iconCtx.fillStyle = colors[cls];
            iconCtx.fillRect(5, 5, 60, 60);
            
            // Borda
            iconCtx.strokeStyle = '#2a4a1c';
            iconCtx.lineWidth = 3;
            iconCtx.strokeRect(5, 5, 60, 60);
            
            // Emoji/símbolo
            iconCtx.fillStyle = '#ffffff';
            iconCtx.font = '28px Arial';
            iconCtx.textAlign = 'center';
            iconCtx.textBaseline = 'middle';
            iconCtx.fillText(symbols[cls], 35, 35);
        }
    });
}

async function startLevel(idx) {
    const lvl0 = levels[idx];
    if (idx >= levels.length) {
        gameState = 'VICTORY';
        AudioEngine.stopMusic();
        AudioEngine.playVictory();
        const victoryScoreEl = document.getElementById('victory-score-value');
        if (victoryScoreEl) victoryScoreEl.innerText = score.toLocaleString();
        document.getElementById('victory-screen').classList.remove('hidden');
        return;
    }
    
    // Load level config from server BEFORE initializing level
    const levelId = idx + 1;
    try {
        const levelConfig = await loadLevelConfigFromServer(levelId);
        if (levelConfig) {
            // Update levels array with server data
            levels[idx] = {
                ...levels[idx],
                id: levelConfig.id,
                objective: levelConfig.objective,
                type: levelConfig.type,
                target: levelConfig.target,
                spawnRate: levelConfig.spawning?.rate || 60,
                bg: levelConfig.background,
                enemies: levelConfig.spawning?.enemies?.map(e => e.type) || [],
                maxEnemies: levelConfig.spawning?.maxEnemies || 12
            };
            console.log('📥 Level config loaded:', levelConfig.name, 'target:', levelConfig.target);
        }
    } catch (err) {
        console.warn('⚠️ Using cached level data:', err);
    }
    
    // Iniciar fase: zerar pontuação temporária da fase
    phaseScore = 0;
    score = totalScore; // Score visual começa com o acumulado
    console.log('🎮 Fase', idx + 1, 'iniciada. Score acumulado:', totalScore);
    
    enemies = [];
    projectiles = [];
    particles = [];
    bonusCrates = [];
    floatingTexts = [];
    mines = [];
    submarines = [];
    
    // Limpar sistemas visuais extras
    if (typeof groundStains !== 'undefined') groundStains = [];
    if (typeof metalDebris !== 'undefined') metalDebris = [];
    if (typeof parallaxScrollX !== 'undefined') parallaxScrollX = 0;
    
    bossSpawned = false;
    levelProgress = 0;
    activePowerup = null;
    powerupTimer = 0;
    nextPowerupSpawn = frameCount + 200;
    
    // Resetar flag de survival
    survivalStarted = false;
    
    // Resetar combo de kills
    if (typeof resetCombo === 'function') resetCombo();
    
    // Cursor: mira desenhada substitui o cursor (exceto na fase de corrida)
    canvas.style.cursor = (lvl0 && lvl0.type === 'escaperoute') ? 'default' : 'none';
    
    // IMPORTANTE: Usar lvl APÓS carregar config do servidor
    const lvl = levels[idx];
    if (lvl.type === 'survival') {
        levelProgress = lvl.target || 60; // Fallback de 60 segundos
        survivalFrameCounter = 0;
        survivalStarted = true; // Marcar como iniciado
        console.log('⏱️ Survival mode: target =', levelProgress, 'seconds');
    }
    
    // Shmup também é survival-based
    if (lvl.type === 'shmup') {
        levelProgress = SHMUP_CONFIG.survivalTime;
        survivalFrameCounter = 0;
    }
    
    // Inicialização especial para fase do trem
    if (lvl.type === 'train') {
        trainCurrentCar = 1;
        trainScrollX = 0;
        trainSpeed = TRAIN_CONFIG.scrollSpeed;
        trainEnemiesKilled = 0;
        trainEnemiesNeeded = TRAIN_CONFIG.enemiesPerCar[0];
        trainTunnelActive = false;
        trainTunnelTimer = 0;
        trainTunnelWarning = false;
        trainObstacles = [];
        trainNextObstacle = 120;
        // Zona segura no centro do vagão
        trainSafeZone = {
            x: canvas.width / 2 - TRAIN_CONFIG.safeZoneWidth / 2,
            y: 0,
            w: TRAIN_CONFIG.safeZoneWidth,
            h: canvas.height
        };
        // Spawnar inimigos do primeiro vagão
        spawnTrainEnemies();
        console.log('🚂 Fase do trem iniciada! Vagão 1/' + TRAIN_CONFIG.totalCars);
    }
    
    // Inicialização especial para fase Winter Storm
    if (lvl.type === 'winter') {
        initWinterLevel();
    }
    
    // Inicialização especial para fase Sky Fortress
    if (lvl.type === 'skyfortress') {
        initSkyFortressLevel();
    }
    
    // Inicialização especial para fase Shmup
    if (lvl.type === 'shmup') {
        initShmupLevel();
    }
    
    // Inicialização especial para fase Escape (A Fuga)
    if (lvl.type === 'escape') {
        initEscapeLevel();
    }
    
    // Inicialização especial para fase Escape Route (Rota de Fuga)
    if (lvl.type === 'escaperoute') {
        initEscapeRouteLevel();
    }
    
    // Inicialização especial para fase Sniper
    if (lvl.type === 'sniper') {
        initSniperLevel();
    }
    
    document.getElementById('level-display').innerText = t('hud.phase') + ' ' + lvl.id;
    document.getElementById('level-display').classList.remove('hidden');
    // Esconder o indicador de fase após 5 segundos
    setTimeout(() => {
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) levelDisplay.classList.add('hidden');
    }, 5000);
    document.getElementById('objective-text').innerText = lvl.objective;
    document.getElementById('powerup-panel').classList.remove('active');
    
    generateDecorations();
    generateMines(); // Gerar minas se for tanque
    generateGrenades(); // Gerar granadas se for soldado
    
    player.x = canvas.width / 2 - player.w / 2;
    
    // Posição Y especial para fase do trem (soldado fica no topo do trem)
    if (lvl.type === 'train' && selectedClass === 'soldier') {
        player.y = TRAIN_CONFIG.groundY - player.h;
        player.grounded = true;
        player.velocityY = 0;
    } else if (lvl.type === 'skyfortress') {
        // Side-scrolling: jogador começa EM CIMA da plataforma
        const cfg = SKYFORTRESS_CONFIG;
        player.x = cfg.platformX + cfg.platformWidth / 2 - player.w / 2;
        player.y = cfg.platformY - player.h; // Em cima da plataforma
        skyPlayerGrounded = true;
        skyPlayerVY = 0;
    } else {
        player.y = canvas.height - 100;
    }
    
    gameState = 'COUNTDOWN';
    countdownNumber = 3;
    countdownTimer = 0;
}

function spawnEnemy() {
    const lvl = levels[currentLevelIndex];
    
    if (lvl.type === 'boss') {
        if (!bossSpawned) {
            enemies.push(new Enemy('boss', canvas.width / 2 - 50, 50));
            bossSpawned = true;
        }
        // Spawn de reforços com alta frequência
        if (Math.random() < 0.25) {
            let type = lvl.enemies[Math.floor(Math.random() * lvl.enemies.length)];
            type = adaptEnemyTypeForPlayer(type); // Adaptar inimigo baseado na classe
            // Spawn pelas laterais para pressionar o jogador
            const side = Math.random() > 0.5 ? -40 : canvas.width + 40;
            let ey = Math.random() * (canvas.height - 100) + 50;
            enemies.push(new Enemy(type, side, ey));
            
            // Chance de spawnar soldado adicional em formação
            if (Math.random() < 0.4 && enemies.length < 12) {
                const offsetY = (Math.random() - 0.5) * 80;
                enemies.push(new Enemy('soldier', side, Math.max(50, Math.min(canvas.height - 50, ey + offsetY))));
            }
            console.log('🎯 Reforços inimigos spawnados!');
        }
        return;
    }
    
    let type = lvl.enemies[Math.floor(Math.random() * lvl.enemies.length)];
    let ex, ey;
    
    if (lvl.type === 'kill_static') {
        const towerCount = enemies.filter(e => e.type === 'tower').length;
        if (towerCount < 3) {
            type = 'tower';
        } else if (Math.random() < 0.6) {
            type = 'tower';
        }
    }
    
    // Adaptar tipo de inimigo baseado na classe do jogador
    type = adaptEnemyTypeForPlayer(type);
    
    // FASE 1 ESPECIAL: Mais soldados surgindo das laterais
    // Isso evita que o jogador fique circulando pelas bordas
    if (lvl.id === 1) {
        // 75% de chance de spawnar das laterais (esquerda ou direita)
        const spawnPattern = Math.random();
        if (spawnPattern < 0.35) {
            // Spawn lateral esquerdo
            ex = -40;
            ey = Math.random() * (canvas.height - 100) + 50;
        } else if (spawnPattern < 0.70) {
            // Spawn lateral direito
            ex = canvas.width + 40;
            ey = Math.random() * (canvas.height - 100) + 50;
        } else if (spawnPattern < 0.85) {
            // Spawn de cima
            ex = Math.random() * canvas.width;
            ey = -40;
        } else {
            // Spawn de baixo
            ex = Math.random() * canvas.width;
            ey = canvas.height + 40;
        }
        
        // Spawn múltiplo: chance de spawnar 2-3 soldados de uma vez das laterais
        if (Math.random() < 0.4 && enemies.length < 15) {
            const side = Math.random() > 0.5 ? -40 : canvas.width + 40;
            const baseY = Math.random() * (canvas.height - 200) + 100;
            // Spawnar 2-3 soldados em formação
            const extraSoldiers = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < extraSoldiers; i++) {
                const offsetY = (i - 1) * 60; // Espalhados verticalmente
                enemies.push(new Enemy('soldier', side, baseY + offsetY));
            }
            console.log('🎯 Grupo de', extraSoldiers, 'soldados spawnado pela lateral!');
        }
    } else {
        // Comportamento padrão para outras fases
        if (Math.random() > 0.5) {
            ex = Math.random() * canvas.width;
            ey = Math.random() > 0.5 ? -40 : canvas.height + 40;
        } else {
            ex = Math.random() > 0.5 ? -40 : canvas.width + 40;
            ey = Math.random() * canvas.height;
        }
    }
    
    if (type === 'tower') {
        ex = Math.random() * (canvas.width - 150) + 75;
        ey = Math.random() * (canvas.height - 200) + 100;
    }
    
    enemies.push(new Enemy(type, ex, ey));
    console.log('🎯 Inimigo spawnado:', type, 'em', Math.round(ex), Math.round(ey));
}

// Adapta o tipo de inimigo baseado na classe do jogador
function adaptEnemyTypeForPlayer(enemyType) {
    if (selectedClass === 'plane') {
        // Avião: soldados viram aviões inimigos
        if (enemyType === 'soldier') return 'plane';
    } else if (selectedClass === 'ship') {
        // Navio: soldados viram aviões, tanques viram helicópteros
        if (enemyType === 'soldier') return 'plane';
        if (enemyType === 'tank') return 'chopper';
    }
    return enemyType;
}

// Retorna o nome da seção baseado na classe (para fase 6)
function getTrainSectionName() {
    if (selectedClass === 'tank') return 'CAMINHÃO';
    if (selectedClass === 'plane') return 'SETOR';
    if (selectedClass === 'ship') return 'TRECHO';
    return 'VAGÃO'; // Soldado
}

// Retorna o texto do objetivo baseado na classe (para fase 6)
function getTrainObjectiveText() {
    const section = getTrainSectionName();
    const total = TRAIN_CONFIG.totalCars;
    
    if (selectedClass === 'tank') {
        return 'Comboio: ' + section + ' ' + trainCurrentCar + '/' + total + 
               ' - Inimigos: ' + trainEnemiesKilled + '/' + trainEnemiesNeeded;
    } else if (selectedClass === 'plane') {
        return 'Perseguição: ' + section + ' ' + trainCurrentCar + '/' + total + 
               ' - Inimigos: ' + trainEnemiesKilled + '/' + trainEnemiesNeeded;
    } else if (selectedClass === 'ship') {
        return 'Rio: ' + section + ' ' + trainCurrentCar + '/' + total + 
               ' - Inimigos: ' + trainEnemiesKilled + '/' + trainEnemiesNeeded;
    }
    return 'Trem: ' + section + ' ' + trainCurrentCar + '/' + total + 
           ' - Inimigos: ' + trainEnemiesKilled + '/' + trainEnemiesNeeded;
}

// Retorna a cor de fundo adaptada para a classe do jogador
function getAdaptedBackground() {
    const lvl = levels[currentLevelIndex];
    if (selectedClass === 'ship') {
        return '#1a5276'; // Sempre oceano para navio
    }
    return lvl.bg;
}

// Spawna inimigos específicos do vagão atual do trem
function spawnTrainEnemies() {
    const carIndex = trainCurrentCar - 1;
    const enemyCount = TRAIN_CONFIG.enemiesPerCar[carIndex];
    trainEnemiesNeeded = enemyCount;
    trainEnemiesKilled = 0;
    
    // Limpar inimigos anteriores
    enemies = [];
    trainObstacles = [];
    
    // Adaptar inimigos baseado na classe do jogador
    const getEnemyType = (baseType) => {
        if (selectedClass === 'tank') {
            if (baseType === 'soldier') return Math.random() > 0.5 ? 'soldier' : 'tank';
            return 'tower';
        } else if (selectedClass === 'plane') {
            if (baseType === 'soldier') return 'plane';
            if (baseType === 'tower') return 'chopper';
            return 'plane';
        } else if (selectedClass === 'ship') {
            if (baseType === 'soldier') return 'plane';
            if (baseType === 'tower') return 'chopper';
            return 'chopper';
        }
        return baseType; // Soldado mantém padrão
    };
    
    // Mini-boss no vagão 4
    if (trainCurrentCar === TRAIN_CONFIG.miniBossCar) {
        let miniBossType = 'tower';
        let miniBossHP = 300;
        
        if (selectedClass === 'soldier') {
            // Soldado enfrenta soldado elite (não torre voadora)
            miniBossType = 'soldier';
            miniBossHP = 250;
        } else if (selectedClass === 'tank') {
            miniBossType = 'tank';
            miniBossHP = 350;
        } else if (selectedClass === 'plane' || selectedClass === 'ship') {
            miniBossType = 'chopper';
            miniBossHP = 250;
        }
        
        // Side-scroller: boss vem da direita (no chão para soldado)
        const bossY = selectedClass === 'soldier' ? TRAIN_CONFIG.groundY - 40 : 150;
        const miniBoss = new Enemy(miniBossType, canvas.width + 50, bossY);
        miniBoss.hp = miniBossHP;
        miniBoss.maxHp = miniBossHP;
        miniBoss.scoreValue = 500;
        miniBoss.isMiniBoss = true;
        miniBoss.trainEnemy = true; // Marca como inimigo do trem
        enemies.push(miniBoss);
        console.log('🔥 MINI-BOSS SPAWNOU!', miniBossType, 'com', miniBossHP, 'HP');
        return;
    }
    
    // Locomotiva (vagão 8) - boss final + soldados de elite
    if (trainCurrentCar === TRAIN_CONFIG.totalCars) {
        // Spawnar soldados de elite primeiro (mais fortes)
        const eliteCount = enemyCount - 1; // Reservar 1 slot para o boss
        for (let i = 0; i < eliteCount; i++) {
            let eliteType = 'soldier';
            let eliteHP = 80; // Soldados de elite com mais HP (normal é 50)
            
            if (selectedClass === 'tank') {
                eliteType = Math.random() > 0.5 ? 'soldier' : 'tank';
                eliteHP = eliteType === 'tank' ? 150 : 80;
            } else if (selectedClass === 'plane' || selectedClass === 'ship') {
                eliteType = Math.random() > 0.5 ? 'plane' : 'chopper';
                eliteHP = 70;
            }
            
            const spawnX = canvas.width + 50 + (i * 80);
            const spawnY = selectedClass === 'soldier' ? TRAIN_CONFIG.groundY - 32 : Math.random() * (canvas.height - 150) + 80;
            const elite = new Enemy(eliteType, spawnX, spawnY);
            elite.hp = eliteHP;
            elite.maxHp = eliteHP;
            elite.scoreValue = 150; // Mais pontos
            elite.trainEnemy = true;
            elite.isElite = true; // Marca como elite
            enemies.push(elite);
        }
        
        // Boss final da locomotiva
        let finalBossType = 'tower';
        let finalBossHP = 400;
        
        if (selectedClass === 'soldier') {
            // Soldado enfrenta soldado comandante (não torre)
            finalBossType = 'soldier';
            finalBossHP = 350;
        } else if (selectedClass === 'tank') {
            finalBossType = 'tower';
            finalBossHP = 500;
        } else if (selectedClass === 'plane' || selectedClass === 'ship') {
            finalBossType = 'chopper';
            finalBossHP = 350;
        }
        
        const bossY = selectedClass === 'soldier' ? TRAIN_CONFIG.groundY - 40 : 120;
        const finalBoss = new Enemy(finalBossType, canvas.width + 80, bossY);
        finalBoss.hp = finalBossHP;
        finalBoss.maxHp = finalBossHP;
        finalBoss.scoreValue = 1000;
        finalBoss.isMiniBoss = true;
        finalBoss.trainEnemy = true;
        enemies.push(finalBoss);
        console.log('🚂 FINAL! Destrua o', finalBossType, '!');
        return;
    }
    
    // Vagões normais - spawnamos gradualmente
    // Define o contador para spawnar inimigos progressivamente
    trainNextObstacle = 60; // Reset spawn timer
    console.log('🚃 Vagão', trainCurrentCar, '-', enemyCount, 'inimigos a spawnar');
}

// Avança para o próximo vagão do trem
function advanceTrainCar() {
    trainCurrentCar++;
    
    if (trainCurrentCar > TRAIN_CONFIG.totalCars) {
        // Completou todos os vagões!
        completeLevel();
        return;
    }
    
    // Aumenta velocidade gradualmente
    trainSpeed = Math.min(TRAIN_CONFIG.maxScrollSpeed, trainSpeed + 0.3);
    
    // Atualiza objetivo baseado na classe
    document.getElementById('objective-text').innerText = getTrainObjectiveText();
    
    // Efeito de transição
    const sectionName = getTrainSectionName();
    floatingTexts.push(new FloatingText(
        canvas.width / 2, 
        canvas.height / 2, 
        sectionName + ' ' + trainCurrentCar, 
        '#ffff00'
    ));
    
    // Screen shake para transição
    addScreenShake(5);
    
    // Spawnar inimigos do novo vagão
    spawnTrainEnemies();
    
    console.log('➡️ Avançou para vagão', trainCurrentCar);
}

// Atualiza a lógica específica do trem (SIDE-SCROLLER)
function updateTrainLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'train') return;
    
    // Scroll automático do cenário
    trainScrollX += trainSpeed;
    
    // Spawnar inimigos gradualmente da direita
    const aliveEnemies = enemies.filter(e => !e.dead).length;
    const totalSpawned = trainEnemiesKilled + aliveEnemies;
    
    if (totalSpawned < trainEnemiesNeeded && frameCount % 90 === 0) {
        spawnTrainEnemy();
    }
    
    // Spawnar obstáculos (apenas para soldado)
    if (selectedClass === 'soldier') {
        trainNextObstacle--;
        if (trainNextObstacle <= 0) {
            spawnTrainObstacle();
            trainNextObstacle = TRAIN_CONFIG.obstacleSpawnRate + Math.random() * 60;
        }
        
        // Atualizar e verificar colisão com obstáculos
        trainObstacles.forEach(obs => {
            obs.x -= TRAIN_CONFIG.obstacleSpeed;
            
            // Colisão com player (se não está pulando sobre)
            if (!obs.hit && player.y + player.h > obs.y &&
                player.x < obs.x + obs.w && player.x + player.w > obs.x) {
                // Player colidiu - toma dano
                player.takeDamage(10);
                obs.hit = true;
                floatingTexts.push(new FloatingText(player.x, player.y, 'OUCH!', '#ff0000'));
                addScreenShake(3);
            }
        });
        
        // Remover obstáculos fora da tela
        trainObstacles = trainObstacles.filter(obs => obs.x + obs.w > -50);
    }
    
    // Mover inimigos automaticamente para a esquerda (side-scroller)
    enemies.forEach(e => {
        if (!e.dead && e.trainEnemy) {
            // Mover para esquerda
            e.x -= trainSpeed * 0.5;
            
            // Se for voador (plane/chopper), movimento ondulado
            if (e.type === 'plane' || e.type === 'chopper') {
                e.y += Math.sin(frameCount * 0.05 + e.x * 0.01) * 0.5;
            }
            
            // Boss fica parado após entrar na tela
            if (e.isMiniBoss && e.x < canvas.width - 150) {
                e.x = canvas.width - 150;
            }
        }
        
        // Remover inimigos que saíram pela esquerda
        if (e.x + e.w < -50 && !e.isMiniBoss) {
            e.dead = true;
        }
    });
    
    // Atualizar objetivo na UI
    document.getElementById('objective-text').innerText = getTrainObjectiveText();
    
    // Verificar se todos os inimigos foram derrotados
    const remainingEnemies = enemies.filter(e => !e.dead).length;
    if (remainingEnemies === 0 && trainEnemiesKilled >= trainEnemiesNeeded) {
        advanceTrainCar();
    }
}

// Spawna um inimigo do trem vindo da direita
function spawnTrainEnemy() {
    let type = 'soldier';
    let yPos = TRAIN_CONFIG.groundY - 32;
    
    if (selectedClass === 'soldier') {
        // Soldados enfrentam soldados no chão
        type = 'soldier';
        yPos = TRAIN_CONFIG.groundY - 32;
    } else if (selectedClass === 'tank') {
        type = Math.random() > 0.5 ? 'tank' : 'soldier';
        yPos = 200 + Math.random() * 300;
    } else if (selectedClass === 'plane') {
        type = Math.random() > 0.5 ? 'plane' : 'chopper';
        yPos = 100 + Math.random() * 200;
    } else if (selectedClass === 'ship') {
        type = Math.random() > 0.4 ? 'chopper' : 'plane';
        yPos = 150 + Math.random() * 200;
    }
    
    const enemy = new Enemy(type, canvas.width + 50, yPos);
    enemy.trainEnemy = true;
    
    // Elite nos vagões avançados
    if (trainCurrentCar >= 5) {
        enemy.hp = Math.floor(enemy.hp * 1.5);
        enemy.maxHp = enemy.hp;
    }
    
    enemies.push(enemy);
}

// Spawna um obstáculo para pular
function spawnTrainObstacle() {
    const obstacleTypes = [
        { w: 30, h: 25, color: '#8B4513', name: 'caixa' },      // Caixa pequena
        { w: 45, h: 35, color: '#654321', name: 'caixaGrande' }, // Caixa grande
        { w: 25, h: 20, color: '#4a4a4a', name: 'barreira' }     // Barreira de metal
    ];
    
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    trainObstacles.push({
        x: canvas.width + 20,
        y: TRAIN_CONFIG.groundY - type.h,
        w: type.w,
        h: type.h,
        color: type.color,
        name: type.name,
        hit: false
    });
}

// ============ WINTER STORM LEVEL (Phase 7) ============

function initWinterLevel() {
    // Reset state
    winterWindDirection = Math.random() > 0.5 ? 1 : -1;
    winterWindForce = WINTER_CONFIG.windForce;
    winterGeneratorsDestroyed = 0;
    winterSnowParticles = [];
    winterFireTrails = [];
    winterGenerators = [];
    
    // Spawnar geradores em posições fixas
    const generatorPositions = [
        { x: 100, y: 250 },
        { x: 350, y: 180 },
        { x: 550, y: 300 },
        { x: 750, y: 220 }
    ];
    
    generatorPositions.forEach(pos => {
        const gen = new Enemy('generator', pos.x, pos.y);
        gen.hp = WINTER_CONFIG.generatorHP;
        gen.maxHp = WINTER_CONFIG.generatorHP;
        gen.isGenerator = true;
        enemies.push(gen);
        winterGenerators.push(gen);
    });
    
    // Inicializar partículas de neve
    for (let i = 0; i < WINTER_CONFIG.snowParticleCount; i++) {
        winterSnowParticles.push(createSnowParticle());
    }
    
    console.log('❄️ Winter Storm iniciado! Destrua', WINTER_CONFIG.generatorCount, 'geradores!');
}

function createSnowParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: WINTER_CONFIG.snowSpeed * (0.5 + Math.random() * 0.5),
        life: 300 + Math.random() * 300,
        maxLife: 300 + Math.random() * 300
    };
}

function updateWinterLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'winter') return;
    
    // Atualizar direção do vento periodicamente
    if (frameCount % WINTER_CONFIG.windChangeInterval === 0) {
        winterWindDirection = Math.random() > 0.5 ? 1 : -1;
        floatingTexts.push(new FloatingText(
            canvas.width / 2, 100,
            winterWindDirection > 0 ? '💨 VENTO →' : '← VENTO 💨',
            '#88ccff'
        ));
    }
    
    // Atualizar partículas de neve
    winterSnowParticles.forEach(p => {
        p.x += winterWindDirection * p.speed * 2;
        p.y += p.speed;
        p.life--;
        
        // Resetar partícula se sair da tela ou morrer
        if (p.y > canvas.height || p.x < -10 || p.x > canvas.width + 10 || p.life <= 0) {
            p.x = Math.random() * canvas.width;
            p.y = -10;
            p.life = p.maxLife;
        }
    });
    
    // Atualizar rastros de fogo
    winterFireTrails = winterFireTrails.filter(trail => {
        trail.timer--;
        
        // Dano ao player se estiver no fogo
        if (player && trail.timer > 0 && 
            frameCount - trail.lastDamage >= WINTER_CONFIG.fireTrailDamageInterval) {
            const pc = player.getCenter();
            if (pc.x > trail.x && pc.x < trail.x + trail.w &&
                pc.y > trail.y - 10 && pc.y < trail.y + trail.h + 10) {
                player.takeDamage(WINTER_CONFIG.fireTrailDamage);
                trail.lastDamage = frameCount;
                floatingTexts.push(new FloatingText(player.x, player.y - 10, '🔥', '#ff6600'));
            }
        }
        
        return trail.timer > 0;
    });
    
    // Contar geradores destruídos
    const destroyedCount = winterGenerators.filter(g => g.dead).length;
    if (destroyedCount !== winterGeneratorsDestroyed) {
        winterGeneratorsDestroyed = destroyedCount;
        
        // Feedback visual de progresso
        floatingTexts.push(new FloatingText(
            canvas.width / 2, canvas.height / 2,
            '⚡ GERADOR DESTRUÍDO! ' + winterGeneratorsDestroyed + '/' + WINTER_CONFIG.generatorCount,
            '#ffff00'
        ));
        addScreenShake(8);
        
        // Verificar vitória
        if (winterGeneratorsDestroyed >= WINTER_CONFIG.generatorCount) {
            completeLevel();
        }
    }
    
    // Atualizar objetivo na UI
    document.getElementById('objective-text').innerText = 
        'Destrua os Geradores: ' + winterGeneratorsDestroyed + '/' + WINTER_CONFIG.generatorCount;
}

// Spawna inimigo de inverno
function spawnWinterEnemy() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'winter') return;
    
    // Tipos de inimigo baseados na intensidade da tempestade
    const stormActive = winterGeneratorsDestroyed < WINTER_CONFIG.generatorCount;
    
    let type = Math.random() > 0.6 ? 'flameTank' : 'snowSoldier';
    
    // Posição de spawn nas bordas
    let ex, ey;
    if (Math.random() > 0.5) {
        ex = Math.random() * canvas.width;
        ey = Math.random() > 0.5 ? -40 : canvas.height + 40;
    } else {
        ex = Math.random() > 0.5 ? -40 : canvas.width + 40;
        ey = Math.random() * canvas.height;
    }
    
    const enemy = new Enemy(type, ex, ey);
    enemies.push(enemy);
}

// ============ SKY FORTRESS LEVEL (Phase 8) ============

function initSkyFortressLevel() {
    const cfg = SKYFORTRESS_CONFIG;
    
    // Reset state
    skyWindDirection = 0;
    skyWindActive = false;
    skyWindTimer = 0;
    skyClouds = [];
    skyStars = [];
    skyBgAircraft = [];
    skyWindParticles = [];
    
    // Inicializar nuvens
    for (let i = 0; i < cfg.cloudCount; i++) {
        skyClouds.push(createSkyCloud());
    }
    
    // Inicializar estrelas
    for (let i = 0; i < cfg.starCount; i++) {
        skyStars.push(createSkyStar());
    }
    
    // Inicializar aeronaves de fundo
    for (let i = 0; i < cfg.bgAircraftCount; i++) {
        skyBgAircraft.push(createBgAircraft());
    }
    
    // Inicializar partículas de vento
    for (let i = 0; i < cfg.particleCount; i++) {
        skyWindParticles.push(createWindParticle());
    }
    
    // Definir plataforma
    skyPlatform = {
        x: cfg.platformX,
        y: cfg.platformY,
        w: cfg.platformWidth,
        h: cfg.platformHeight
    };
    
    // Timer de sobrevivência (usa o mesmo sistema do tipo 'survival')
    levelProgress = cfg.survivalTime;
    survivalFrameCounter = 0;
    
    console.log('🏰 Sky Fortress iniciado! Sobreviva', cfg.survivalTime, 'segundos!');
}

function createSkyCloud() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height, // Começa acima da tela
        w: 60 + Math.random() * 80,
        h: 30 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
        alpha: 0.3 + Math.random() * 0.4,
        light: Math.random() > 0.5
    };
}

function createSkyStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3) // 0, 1, 2 - profundidade
    };
}

function createBgAircraft() {
    const types = ['plane', 'helicopter', 'blimp'];
    const type = types[Math.floor(Math.random() * types.length)];
    const fromLeft = Math.random() > 0.5;
    
    return {
        x: fromLeft ? -100 : canvas.width + 100,
        y: 50 + Math.random() * 200, // Parte superior do céu
        type: type,
        speed: (0.5 + Math.random() * 1) * (fromLeft ? 1 : -1),
        scale: 0.3 + Math.random() * 0.4, // Pequeno (distante)
        alpha: 0.3 + Math.random() * 0.3
    };
}

function createWindParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 10 + Math.random() * 20,
        speed: 2 + Math.random() * 3,
        alpha: 0.1 + Math.random() * 0.2
    };
}

function updateSkyFortressLevel() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'skyfortress') return;
    
    const cfg = SKYFORTRESS_CONFIG;
    
    // Timer de sobrevivência
    survivalFrameCounter++;
    if (survivalFrameCounter >= 60) {
        survivalFrameCounter = 0;
        levelProgress--;
        
        // A cada 10 segundos, aumentar dificuldade
        if (levelProgress % 10 === 0 && levelProgress > 0) {
            floatingTexts.push(new FloatingText(
                canvas.width / 2, 100,
                '⚠️ ' + levelProgress + 's RESTANTES!',
                '#ffff00'
            ));
        }
    }
    
    // Atualizar UI
    const surviveText = I18n.currentLang === 'pt' ? 'Sobreviva:' : 'Survive:';
    document.getElementById('objective-text').innerText = `${surviveText} ${levelProgress}s`;
    
    // Vitória!
    if (levelProgress <= 0) {
        completeLevel();
        return;
    }
    
    // Sistema de rajadas de vento (mais frequente!)
    skyWindTimer++;
    if (!skyWindActive && skyWindTimer >= cfg.windGustInterval) {
        // Iniciar rajada
        skyWindActive = true;
        skyWindTimer = 0;
        skyWindDirection = Math.random() > 0.5 ? 1 : -1;
        floatingTexts.push(new FloatingText(
            canvas.width / 2, 80,
            skyWindDirection > 0 ? '💨 RAJADA →' : '← RAJADA 💨',
            '#ff8800'
        ));
        // Som de vento!
        AudioEngine.playWind && AudioEngine.playWind();
    } else if (skyWindActive && skyWindTimer >= cfg.windGustDuration) {
        // Terminar rajada
        skyWindActive = false;
        skyWindTimer = 0;
        skyWindDirection = 0;
    }
    
    // Atualizar aeronaves de fundo
    skyBgAircraft.forEach(aircraft => {
        aircraft.x += aircraft.speed * cfg.bgAircraftSpeed;
        // Resetar se saiu da tela
        if ((aircraft.speed > 0 && aircraft.x > canvas.width + 150) ||
            (aircraft.speed < 0 && aircraft.x < -150)) {
            aircraft.x = aircraft.speed > 0 ? -100 : canvas.width + 100;
            aircraft.y = 50 + Math.random() * 200;
        }
    });
    
    // Atualizar partículas de vento
    skyWindParticles.forEach(p => {
        // Mover na direção do vento se ativo, senão movimento suave
        const windMult = skyWindActive ? skyWindDirection * 3 : 0;
        p.x += p.speed + windMult;
        p.y += 0.5; // Descendo levemente
        
        // Resetar se saiu da tela
        if (p.x > canvas.width + 50) p.x = -30;
        if (p.x < -50) p.x = canvas.width + 30;
        if (p.y > canvas.height + 20) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
    
    // Atualizar estrelas (twinkle)
    skyStars.forEach(star => {
        star.y += cfg.starSpeed * (star.layer + 1) * 0.5;
        if (star.y > canvas.height) {
            star.y = -5;
            star.x = Math.random() * canvas.width;
        }
    });
    
    // Aplicar vento ao jogador (agora é feito no Player.update para side-scroll)
    // Mantido aqui apenas para compatibilidade com vento visual
    
    // VERIFICAÇÃO DE QUEDA - INSTANT KILL (side-scrolling)
    if (player) {
        // Morte se cair abaixo da plataforma
        if (player.y > cfg.deathY) {
            player.hp = 0;
            floatingTexts.push(new FloatingText(
                player.x, cfg.platformY,
                '💀 QUEDA!',
                '#ff0000'
            ));
            addScreenShake(15);
        }
    }
}

function updateShmupLevelWrapper() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'shmup') return;
    
    // Chamar update principal do shmup (definido em game-helpers.js)
    updateShmupLevel();
    
    // Timer de sobrevivência
    survivalFrameCounter++;
    if (survivalFrameCounter >= 60) {
        survivalFrameCounter = 0;
        levelProgress--;
        
        // Alertas de tempo
        if (levelProgress === 30) {
            floatingTexts.push(new FloatingText(
                canvas.width / 2, 100,
                '⏰ 30 SEGUNDOS!',
                '#ffff00'
            ));
        } else if (levelProgress === 10) {
            floatingTexts.push(new FloatingText(
                canvas.width / 2, 100,
                '⚠️ 10 SEGUNDOS!',
                '#ff8800'
            ));
        }
    }
    
    // Atualizar UI
    const surviveText = I18n.currentLang === 'pt' ? 'Sobreviva:' : 'Survive:';
    document.getElementById('objective-text').innerText = `${surviveText} ${levelProgress}s | Wave ${shmupWaveNumber}`;
    
    // Vitória!
    if (levelProgress <= 0) {
        completeLevel();
        return;
    }
}

function spawnSkyFortressEnemy() {
    const lvl = levels[currentLevelIndex];
    if (lvl.type !== 'skyfortress') return;
    
    const cfg = SKYFORTRESS_CONFIG;
    
    // Escolher tipo de inimigo
    const types = lvl.enemies;
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Side-scrolling: spawn principalmente dos lados e de cima
    let ex, ey;
    const side = Math.floor(Math.random() * 3); // 0=topo, 1=direita, 2=esquerda
    
    switch(side) {
        case 0: // Topo - inimigos voadores descendo
            ex = cfg.platformX + Math.random() * cfg.platformWidth;
            ey = -50;
            break;
        case 1: // Direita
            ex = canvas.width + 50;
            ey = 100 + Math.random() * (cfg.platformY - 150);
            break;
        case 2: // Esquerda
            ex = -50;
            ey = 100 + Math.random() * (cfg.platformY - 150);
            break;
    }
    
    const enemy = new Enemy(type, ex, ey);
    enemies.push(enemy);
}

function checkCollisions() {
    projectiles.forEach(p => {
        if (p.isPlayer) {
            enemies.forEach(e => {
                if (!p.dead && !e.dead && 
                    p.x < e.x + e.w && p.x + p.size > e.x &&
                    p.y < e.y + e.h && p.y + p.size > e.y) {
                    
                    e.takeDamage(p.damage);
                    p.dead = true;
                    createExplosion(p.x, p.y, '#ffff00', 5);
                    
                    if (e.hp <= 0) {
                        e.dead = true;
                        registerKillScore(e); // Pontos com multiplicador de combo
                        HighScoreManager.addKill(); // Track kills for rankings
                        
                        // Determinar tipo de inimigo para efeitos visuais
                        const isVehicle = ['tank', 'flameTank', 'chopper', 'plane'].includes(e.type);
                        const isSoldier = ['soldier', 'snowSoldier', 'jetpackSoldier'].includes(e.type);
                        const explosionSize = e.type === 'boss' ? 30 : (isVehicle ? 20 : 15);
                        
                        createExplosion(
                            e.x + e.w / 2, 
                            e.y + e.h / 2, 
                            e.type === 'boss' ? '#ff0000' : e.color || '#ff6600', 
                            explosionSize,
                            { isVehicle, isSoldier, groundY: e.y + e.h }
                        );
                        updateObjective('kill', e.type);
                    }
                }
            });
            
            bonusCrates.forEach(crate => {
                if (!crate.dead && !p.dead &&
                    p.x < crate.x + crate.w && p.x + p.size > crate.x &&
                    p.y < crate.y + crate.h && p.y + p.size > crate.y) {
                    
                    p.dead = true;
                    crate.dead = true;
                    console.log('📦 Powerup atingido por tiro - NÃO conta como torre!');
                    collectPowerup(crate);
                }
            });
        } else {
            const playerCenterX = player.x + player.w / 2;
            const playerCenterY = player.y + player.h / 2;
            const shieldRadius = Math.max(player.w, player.h);
            
            if (hasPowerup('shield')) {
                const dx = p.x - playerCenterX;
                const dy = p.y - playerCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (!p.dead && distance < shieldRadius + p.size) {
                    p.dead = true;
                    createExplosion(p.x, p.y, '#00ffff', 5);
                    return;
                }
            }
            
            if (!p.dead && 
                p.x < player.x + player.w && p.x + p.size > player.x &&
                p.y < player.y + player.h && p.y + p.size > player.y) {
                
                if (hasPowerup('shield')) {
                    p.dead = true;
                    createExplosion(p.x, p.y, '#00ffff', 5);
                    return;
                }
                
                // Reduzir dano na fase escape (balanceamento)
                let damage = p.damage;
                const lvl = levels[currentLevelIndex];
                if (lvl && lvl.type === 'escape') {
                    damage = Math.ceil(damage * ESCAPE_CONFIG.soldierDamageMultiplier);
                }
                
                player.takeDamage(damage);
                p.dead = true;
                createExplosion(player.x + player.w / 2, player.y + player.h / 2, '#ff0000', 8);
            }
        }
    });
    
    enemies.forEach(e => {
        if (!e.dead && 
            player.x < e.x + e.w && player.x + player.w > e.x &&
            player.y < e.y + e.h && player.y + player.h > e.y) {
            if (!hasPowerup('shield')) {
                // Dano por contato (limitado pelos frames de invulnerabilidade)
                const wasVulnerable = player.invulnTime <= 0;
                player.takeDamage(8);
                
                // Knockback: empurra o jogador para longe (evita ficar preso no inimigo)
                const lvl = levels[currentLevelIndex];
                const freeMove = lvl && ['kill', 'kill_static', 'survival', 'boss', 'winter'].includes(lvl.type);
                if (wasVulnerable && freeMove) {
                    const pc = player.getCenter();
                    const ec = e.getCenter();
                    let dx = pc.x - ec.x, dy = pc.y - ec.y;
                    const d = Math.hypot(dx, dy) || 1;
                    player.x += (dx / d) * 24;
                    player.y += (dy / d) * 24;
                    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
                    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
                }
            }
        }
    });
    
    // Colisão com minas (apenas para tanque)
    if (selectedClass === 'tank') {
        mines.forEach(mine => {
            if (!mine.dead && mine.armed && !mine.triggered) {
                // Verificar colisão com jogador
                if (player.x < mine.x + mine.w && player.x + player.w > mine.x &&
                    player.y < mine.y + mine.h && player.y + player.h > mine.y) {
                    mine.trigger();
                }
            }
        });
    }
}

function updateObjective(event, enemyType) {
    const lvl = levels[currentLevelIndex];
    
    console.log('🎯 updateObjective chamado:', event, enemyType, 'Tipo de fase:', lvl.type);
    
    if (lvl.type === 'kill') {
        levelProgress++;
        console.log('✅ Kill contado! Progresso:', levelProgress, '/', lvl.target);
        if (levelProgress >= lvl.target) completeLevel();
    } else if (lvl.type === 'kill_static') {
        if (enemyType === 'tower') {
            levelProgress++;
            console.log('🏰 Torre destruída! Progresso:', levelProgress, '/', lvl.target);
            if (levelProgress >= lvl.target) completeLevel();
        } else {
            console.log('❌ Inimigo não é torre, não conta:', enemyType);
        }
    } else if (lvl.type === 'boss' && enemyType === 'boss') {
        completeLevel();
    } else if (lvl.type === 'train') {
        // Conta kills no trem para avançar de vagão
        trainEnemiesKilled++;
        console.log('🚃 Kill no trem! Progresso:', trainEnemiesKilled, '/', trainEnemiesNeeded);
    }
}

function completeLevel() {
    gameState = 'LEVEL_COMPLETE';
    levelTransition = true;
    transitionTimer = 0;
    transitionFadeAlpha = 0;
    AudioEngine.playVictory();
    console.log('🎉 Fase completada! Iniciando transição...');
    
    // NOTA: Auto-save será feito em applyUpgrade() após commit da pontuação
}

// Armazena o upgrade escolhido para aplicar após seleção de classe
let pendingUpgrade = null;

function applyUpgrade(type) {
    AudioEngine.playMenuSelect();
    pendingUpgrade = type; // Guarda o upgrade para aplicar depois
    
    // COMMIT: Ao vencer a fase, consolidar pontuação
    totalScore += phaseScore;
    phaseScore = 0;
    score = totalScore;
    console.log('✅ Fase vencida! Score consolidado:', totalScore);
    
    // Atualizar bestScore se superou recorde
    const beatRecord = totalScore > bestScore;
    if (beatRecord) {
        bestScore = totalScore;
        console.log('🏆 Novo recorde pessoal:', bestScore);
        // Enviar ao ranking apenas quando superar recorde
        if (typeof HighScoreManager !== 'undefined') {
            HighScoreManager.submitToServer(totalScore, selectedClass, currentLevelIndex + 1, false);
        }
    }
    
    // Auto-save progress após commit (pontuação consolidada)
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
        saveCurrentProgress().then(saved => {
            if (saved) console.log('💾 Auto-save: Progresso salvo com score', totalScore);
        }).catch(err => console.warn('⚠️ Auto-save falhou:', err));
    }
    
    document.getElementById('upgrade-screen').classList.add('hidden');
    currentLevelIndex++;
    
    // Pre-load next level config from server
    const nextLevelId = currentLevelIndex + 1;
    if (nextLevelId <= DataLoader.getTotalLevels()) {
        loadLevelConfigFromServer(nextLevelId).catch(err => {
            console.warn('⚠️ Could not pre-load next level:', err);
        });
    }
    
    // Verificar se completou todas as fases
    if (currentLevelIndex >= levels.length) {
        gameState = 'VICTORY';
        AudioEngine.stopMusic();
        AudioEngine.playVictory();
        
        // Usar totalScore (já consolidado no commit acima)
        const victoryScoreEl = document.getElementById('victory-score-value');
        if (victoryScoreEl) victoryScoreEl.innerText = totalScore.toLocaleString();
        document.getElementById('victory-screen').classList.remove('hidden');
        
        // beatRecord foi calculado antes do commit do bestScore
        const isHighScore = beatRecord;
        HighScoreManager.saveAndSubmit('JOGADOR', totalScore, selectedClass, 12, true).then(result => {
            if (result.server && result.server.rank) {
                const rankText = document.createElement('div');
                rankText.textContent = `🌍 ${t('leaderboard.yourPosition')} #${result.server.rank}`;
                document.getElementById('victory-score').parentNode.appendChild(rankText);
            }
        });
        if (isHighScore && totalScore > 0) {
            const recordText = document.createElement('div');
            recordText.textContent = `🏆 ${I18n.currentLang === 'pt' ? 'NOVO RECORDE!' : 'NEW RECORD!'}`;
            document.getElementById('victory-score').parentNode.appendChild(recordText);
        }
        return;
    }
    
    // FASE BÔNUS: pontuação expert desbloqueia fase extra
    if (typeof shouldEnterBonusStage === 'function' && shouldEnterBonusStage()) {
        startBonusStage();
        return;
    }
    
    // Mostrar tela de seleção de classe para próxima fase
    showClassChangeScreen();
}

function showClassChangeScreen() {
    const nextLevel = levels[currentLevelIndex];
    const levelName = getLevelName(currentLevelIndex);
    
    // Verificar restrições de classe para fase específica
    const restrictedClasses = getRestrictedClasses(nextLevel.type);
    
    // Traduzir texto da tela de seleção
    const phaseWord = I18n.currentLang === 'pt' ? 'Fase' : 'Phase';
    const chooseUnit = I18n.currentLang === 'pt' ? 'Escolha sua unidade:' : 'Choose your unit:';
    let infoText = `${phaseWord} ${currentLevelIndex + 1}: ${levelName} - ${chooseUnit}`;
    if (restrictedClasses.length > 0) {
        const onlyText = I18n.currentLang === 'pt' ? 'Apenas' : 'Only';
        const orText = I18n.currentLang === 'pt' ? 'ou' : 'or';
        const availableText = I18n.currentLang === 'pt' ? 'disponível!' : 'available!';
        infoText += `\n⚠️ ${onlyText} ${restrictedClasses.join(` ${orText} `).toUpperCase()} ${availableText}`;
    }
    
    // Feedback da fase bônus (conquistada ou perdida)
    if (typeof BONUS_STAGE !== 'undefined' && currentLevelIndex === BONUS_STAGE.afterLevelIndex) {
        if (lastBonusResult !== null) {
            infoText += I18n.currentLang === 'pt'
                ? `\n⭐ FASE BÔNUS: +${lastBonusResult.toLocaleString()} pontos!`
                : `\n⭐ BONUS STAGE: +${lastBonusResult.toLocaleString()} points!`;
        } else if (totalScore < BONUS_STAGE.expertScore) {
            infoText += I18n.currentLang === 'pt'
                ? `\n⭐ Fase Bônus exigia ${BONUS_STAGE.expertScore.toLocaleString()} pts (você fez ${totalScore.toLocaleString()})`
                : `\n⭐ Bonus Stage needed ${BONUS_STAGE.expertScore.toLocaleString()} pts (you got ${totalScore.toLocaleString()})`;
        }
    }
    document.getElementById('next-mission-info').innerText = infoText;
    
    // Marcar a classe atual como selecionada e desabilitar classes restritas
    const cards = document.querySelectorAll('#class-select-change .class-card');
    cards.forEach(card => {
        const cls = card.dataset.class;
        card.classList.remove('selected', 'disabled');
        
        // Verificar se classe está disponível
        if (restrictedClasses.length > 0 && !restrictedClasses.includes(cls)) {
            card.classList.add('disabled');
            card.style.opacity = '0.4';
            card.style.pointerEvents = 'none';
        } else {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            
            if (card.dataset.class === selectedClass) {
                card.classList.add('selected');
            }
        }
    });
    
    // Se classe atual está restrita, mudar para primeira disponível
    if (restrictedClasses.length > 0 && !restrictedClasses.includes(selectedClass)) {
        selectedClass = restrictedClasses[0];
        cards.forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.class === selectedClass) {
                card.classList.add('selected');
            }
        });
    }
    
    // Desenhar os ícones das classes
    drawClassChangeIcons();
    
    document.getElementById('class-change-screen').classList.remove('hidden');
    gameState = 'CLASS_SELECT';
}

function getRestrictedClasses(levelType) {
    // Retorna array de classes permitidas, ou array vazio se todas permitidas
    switch(levelType) {
        case 'skyfortress':
            return ['soldier', 'tank']; // Apenas soldado e tanque
        case 'train':
            return ['soldier']; // Apenas soldado na fase do trem
        case 'shmup':
            return ['plane']; // Apenas avião no shmup vertical
        case 'escape':
            return ['soldier']; // Apenas soldado na fuga
        default:
            return []; // Todas permitidas
    }
}

function drawClassChangeIcons() {
    const symbols = { soldier: '🎖️', tank: '🛡️', plane: '✈️', ship: '⚓' };
    const colors = { soldier: '#4a7a35', tank: '#5a6a4a', plane: '#6a8a60', ship: '#4a6a8a' };
    const classes = ['soldier', 'tank', 'plane', 'ship'];
    
    classes.forEach(cls => {
        const canvas = document.getElementById(`icon-${cls}-change`);
        if (canvas) {
            const iconCtx = canvas.getContext('2d');
            iconCtx.clearRect(0, 0, 70, 70);
            
            // Fundo com cor da classe
            iconCtx.fillStyle = colors[cls];
            iconCtx.fillRect(5, 5, 60, 60);
            
            // Borda
            iconCtx.strokeStyle = '#2a4a1c';
            iconCtx.lineWidth = 3;
            iconCtx.strokeRect(5, 5, 60, 60);
            
            // Emoji/símbolo
            iconCtx.fillStyle = '#ffffff';
            iconCtx.font = '28px Arial';
            iconCtx.textAlign = 'center';
            iconCtx.textBaseline = 'middle';
            iconCtx.fillText(symbols[cls], 35, 35);
        }
    });
}

function selectClassForNextLevel(cls, event) {
    // Verificar se classe está permitida
    const nextLevel = levels[currentLevelIndex];
    const restricted = getRestrictedClasses(nextLevel.type);
    if (restricted.length > 0 && !restricted.includes(cls)) {
        return; // Classe não permitida
    }
    
    AudioEngine.playMenuSelect();
    selectedClass = cls;
    
    // Atualizar visual de seleção apenas na tela de mudança de classe
    const cards = document.querySelectorAll('#class-select-change .class-card');
    cards.forEach(card => card.classList.remove('selected'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
}

function confirmClassAndStart() {
    AudioEngine.playMenuSelect();
    
    // Aplicar o upgrade pendente ao novo player
    document.getElementById('class-change-screen').classList.add('hidden');
    
    // Criar novo player com a classe selecionada
    player = new Player(selectedClass);
    
    // Aplicar o upgrade escolhido
    if (pendingUpgrade === 'health') {
        player.maxHp += 30;
        player.hp = player.maxHp;
    } else if (pendingUpgrade === 'damage') {
        player.damage += 8;
    } else if (pendingUpgrade === 'speed') {
        player.maxCooldown = Math.max(3, player.maxCooldown - 2);
    }
    pendingUpgrade = null;
    
    // Arcade transition before starting level
    const levelName = `FASE ${currentLevelIndex + 1}: ${getLevelName(currentLevelIndex).toUpperCase()}`;
    
    if (typeof playArcadeTransition === 'function') {
        gameState = 'TRANSITION';
        playArcadeTransition(levelName, async () => {
            await startLevel(currentLevelIndex);
            gameState = 'PLAYING';
        });
    } else {
        startLevel(currentLevelIndex).then(() => {
            gameState = 'PLAYING';
        });
    }
}

function getLevelName(index) {
    const names = [
        'Operação Aurora',
        'Cerco Noturno', 
        'Resistência',
        'Fortaleza',
        'Emboscada Aérea',
        'Assalto ao Trem',
        'Winter Storm',
        'Sky Fortress',
        'Vertical Shmup',
        'A Fuga',
        'Rota de Fuga',
        'Sniper Elite'
    ];
    return names[index] || `Operação ${index + 1}`;
}

// ============ MAIN GAME LOOP ============

function loop() {
    // Handle transition state (arcade transitions)
    if (gameState === 'TRANSITION') {
        // Just wait - the transition callback will change the state
        requestAnimationFrame(loop);
        return;
    }
    
    // Handle countdown state
    if (gameState === 'COUNTDOWN') {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const lvl = levels[currentLevelIndex];
        
        // Desenho especial para fase Sniper durante countdown (mostra a mira)
        if (lvl && lvl.type === 'sniper') {
            drawSniperLevel();
        }
        // Desenho especial para fase Rota de Fuga durante countdown
        else if (lvl && lvl.type === 'escaperoute') {
            drawEscapeRouteLevel();
        } else {
            drawBackground();
            decorations.forEach(d => d.draw(ctx));
            player.draw(ctx);
        }
        
        countdownTimer++;
        
        const scale = 1 + Math.sin(countdownTimer * 0.1) * 0.1;
        ctx.font = `bold ${80 * scale}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra simples (offset em vez de shadowBlur)
        ctx.fillStyle = '#000000';
        const countText = countdownNumber > 0 ? countdownNumber.toString() : 'GO!';
        ctx.fillText(countText, canvas.width / 2 + 3, canvas.height / 2 + 3);
        
        // Texto principal
        ctx.fillStyle = countdownNumber > 0 ? '#ffffff' : '#00ff00';
        ctx.fillText(countText, canvas.width / 2, canvas.height / 2);

        drawCrosshair(ctx);

        ctx.restore();
        
        if (countdownTimer >= 60) {
            countdownTimer = 0;
            countdownNumber--;
            if (countdownNumber >= 0) {
                AudioEngine.playMenuSelect();
            }
            if (countdownNumber < -1) {
                gameState = 'PLAYING';
            }
        }
        
        requestAnimationFrame(loop);
        return;
    }
    
    // Handle level complete transition
    if (gameState === 'LEVEL_COMPLETE') {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        decorations.forEach(d => d.draw(ctx));
        
        bonusCrates.forEach(c => drawBonusCrate(ctx, c));
        player.draw(ctx);
        enemies.forEach(e => e.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        particles.forEach(p => { p.update(); p.draw(ctx); });
        
        transitionTimer++;
        
        const pulse = Math.sin(transitionTimer * 0.1) * 0.2 + 1;
        ctx.font = `bold ${40 * pulse}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra simples (offset em vez de shadowBlur)
        ctx.fillStyle = '#000000';
        ctx.fillText('FASE COMPLETA!', canvas.width / 2 + 3, canvas.height / 2 - 27);
        ctx.fillText('SCORE: ' + score.toLocaleString(), canvas.width / 2 + 2, canvas.height / 2 + 32);
        
        // Textos principais
        ctx.fillStyle = '#ffd700';
        ctx.fillText('FASE COMPLETA!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + score.toLocaleString(), canvas.width / 2, canvas.height / 2 + 30);
        
        if (transitionTimer % 10 === 0) {
            const colors = ['#ffd700', '#ff6600', '#00ff00', '#ff00ff', '#00ffff'];
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    colors[Math.floor(Math.random() * colors.length)],
                    null, 2
                ));
            }
        }
        
        if (transitionTimer > 300) {
            transitionFadeAlpha = Math.min(1, (transitionTimer - 300) / 120);
            ctx.fillStyle = `rgba(0, 0, 0, ${transitionFadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.restore();
        
        if (transitionTimer >= 420) {
            levelTransition = false;
            gameState = 'UPGRADE';
            AudioEngine.playUpgrade();
            document.getElementById('upgrade-screen').classList.remove('hidden');
        }
        
        requestAnimationFrame(loop);
        return;
    }
    
    // Fase bônus (pontuação expert)
    if (gameState === 'BONUS') {
        ctx.save();
        updateScreenShake();
        ctx.translate(shakeX, shakeY);
        ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
        frameCount++;
        
        updateBonusStage();
        drawBonusStage();
        updateUI();
        
        ctx.restore();
        requestAnimationFrame(loop);
        return;
    }
    
    if (gameState !== 'PLAYING') {
        if (gameState !== 'GAMEOVER' && gameState !== 'VICTORY') requestAnimationFrame(loop);
        return;
    }
    
    // Verificar pausa
    if (isPaused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        requestAnimationFrame(loop);
        return;
    }
    
    ctx.save();
    updateScreenShake();
    ctx.translate(shakeX, shakeY);
    
    ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
    frameCount++;
    
    const lvl = levels[currentLevelIndex];
    
    // Desenho especial para fase Sniper (substitui todo o rendering normal)
    if (lvl.type === 'sniper') {
        updateSniperLevel();
        drawSniperLevel();
        
        // Floating texts
        floatingTexts = floatingTexts.filter(t => t.life > 0);
        floatingTexts.forEach(t => { t.update(); t.draw(ctx); });
        
        // Particles
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        
        updateUI();
        
        // Verificar game over (mesmo rollback do caminho principal)
        if (player.hp <= 0) {
            gameState = 'GAMEOVER';
            AudioEngine.stopMusic();
            AudioEngine.playGameOver();
            HighScoreManager.addDeath();
            
            // ROLLBACK: Descartar pontuação da fase (derrota)
            phaseScore = 0;
            score = totalScore;
            
            document.getElementById('final-score').innerText = 'SCORE SALVO: ' + totalScore.toLocaleString();
            if (totalScore > 0 && totalScore >= bestScore) {
                document.getElementById('final-score').innerText += '\n🏆 SEU MELHOR: ' + bestScore.toLocaleString();
            }
            document.getElementById('gameover-screen').classList.remove('hidden');
        }
        
        ctx.restore();
        requestAnimationFrame(loop);
        return;
    }
    
    // Desenho especial para fase Rota de Fuga (substitui todo o rendering normal)
    if (lvl.type === 'escaperoute') {
        updateEscapeRouteLevel(); // UPDATE PRIMEIRO!
        drawEscapeRouteLevel();
        updateUI();
        
        // Verificar game over (mesmo rollback do caminho principal)
        if (player.hp <= 0) {
            gameState = 'GAMEOVER';
            AudioEngine.stopMusic();
            AudioEngine.playGameOver();
            HighScoreManager.addDeath();
            
            // ROLLBACK: Descartar pontuação da fase (derrota)
            phaseScore = 0;
            score = totalScore;
            
            document.getElementById('final-score').innerText = 'SCORE SALVO: ' + totalScore.toLocaleString();
            if (totalScore > 0 && totalScore >= bestScore) {
                document.getElementById('final-score').innerText += '\n🏆 SEU MELHOR: ' + bestScore.toLocaleString();
            }
            document.getElementById('gameover-screen').classList.remove('hidden');
        }
        
        ctx.restore();
        requestAnimationFrame(loop);
        return;
    }
    
    drawBackground();
    decorations.forEach(d => d.draw(ctx));
    
    // GROUND STAINS - Desenhar antes das entidades (ficam no chão)
    if (typeof groundStains !== 'undefined') {
        groundStains = groundStains.filter(s => s.life > 0);
        groundStains.forEach(s => { s.update(); s.draw(ctx); });
    }
    
    // Winter level: Desenhar fire trails (no chão, antes das entidades)
    if (lvl.type === 'winter') {
        winterFireTrails.forEach(t => drawFireTrail(ctx, t));
    }
    
    // Desenhar e atualizar minas (antes das entidades para ficarem no chão)
    if (selectedClass === 'tank') {
        mines = mines.filter(m => !m.dead);
        mines.forEach(m => { m.update(); m.draw(ctx); });
    }
    
    // Desenhar e atualizar granadas (antes das entidades para ficarem no chão)
    if (selectedClass === 'soldier') {
        grenades = grenades.filter(g => !g.dead);
        grenades.forEach(g => { 
            g.update(); 
            g.draw(ctx);
            
            // Verificar colisão com jogador para coletar
            if (!g.dead && !g.collected &&
                player.x < g.x + g.w && player.x + player.w > g.x &&
                player.y < g.y + g.h && player.y + player.h > g.y) {
                g.collect();
            }
        });
    }
    
    // Desenhar e atualizar submarinos (antes do navio, pois estão submersos)
    if (selectedClass === 'ship') {
        // Spawn de submarinos a cada ~4 segundos
        if (frameCount % 240 === 0 && submarines.length < 3) {
            // Alterna lados
            const fromLeft = lastSubmarineSide === 'right';
            lastSubmarineSide = fromLeft ? 'left' : 'right';
            submarines.push(new Submarine(fromLeft));
            console.log('🚤 Submarino spawnado pelo lado:', fromLeft ? 'esquerdo' : 'direito');
        }
        
        submarines = submarines.filter(s => !s.dead);
        submarines.forEach(s => { s.update(); s.draw(ctx); });
    }
    
    // Enemy spawning (não usar para fase train/winter/skyfortress/shmup/escape/escaperoute/sniper - têm sistema próprio)
    if (frameCount % lvl.spawnRate === 0 && lvl.type !== 'boss' && lvl.type !== 'train' && lvl.type !== 'winter' && lvl.type !== 'skyfortress' && lvl.type !== 'shmup' && lvl.type !== 'escape' && lvl.type !== 'escaperoute' && lvl.type !== 'sniper') {
        const maxEnemies = lvl.maxEnemies || 20;
        if (enemies.length < maxEnemies) spawnEnemy();
    }
    if (lvl.type === 'boss' && frameCount % 30 === 0) {
        if (enemies.length < 15) spawnEnemy();
    }
    // Winter enemy spawning
    if (lvl.type === 'winter' && frameCount % 180 === 0) {
        const nonGeneratorEnemies = enemies.filter(e => e.type !== 'generator').length;
        if (nonGeneratorEnemies < 8) spawnWinterEnemy();
    }
    // Sky Fortress enemy spawning
    if (lvl.type === 'skyfortress' && frameCount % SKYFORTRESS_CONFIG.jetpackSpawnRate === 0) {
        if (enemies.length < SKYFORTRESS_CONFIG.maxEnemies) spawnSkyFortressEnemy();
    }
    // Shmup - spawns são controlados por waves no updateShmupLevel
    // Spawn inicial se ainda não tiver inimigos
    if (lvl.type === 'shmup' && enemies.length === 0 && shmupWaveNumber === 1 && shmupWaveTimer < 60) {
        spawnShmupWave();
    }
    
    // Powerup spawning
    if (frameCount >= nextPowerupSpawn) {
        spawnBonusCrate();
        nextPowerupSpawn = frameCount + 300 + Math.random() * 180;
    }
    
    // Survival timer
    if (lvl.type === 'survival') {
        // Proteção: se levelProgress não foi inicializado E survival ainda não começou
        if (levelProgress <= 0 && lvl.target > 0 && !survivalStarted) {
            levelProgress = lvl.target;
            survivalFrameCounter = 0;
            survivalStarted = true;
            console.log('⚠️ Survival timer initialized:', levelProgress);
        }
        
        // Marcar como iniciado quando timer começa a rodar
        if (levelProgress > 0 && !survivalStarted) {
            survivalStarted = true;
        }
        
        survivalFrameCounter++;
        if (survivalFrameCounter >= 60) {
            survivalFrameCounter = 0;
            levelProgress--;
        }
        const surviveText = I18n.currentLang === 'pt' ? 'Sobreviva:' : 'Survive:';
        document.getElementById('objective-text').innerText = `${surviveText} ${levelProgress}s`;
        
        // Completar fase quando timer chega a 0 (só se já tinha iniciado)
        if (levelProgress <= 0 && survivalStarted) {
            completeLevel();
        }
    } else if (lvl.type === 'kill' || lvl.type === 'kill_static') {
        document.getElementById('objective-text').innerText = lvl.objective + ' (' + levelProgress + '/' + lvl.target + ')';
    } else if (lvl.type === 'winter') {
        const generatorsRemaining = WINTER_CONFIG.generatorCount - winterGeneratorsDestroyed;
        const destroyText = I18n.currentLang === 'pt' ? 'Destrua os Geradores:' : 'Destroy Generators:';
        document.getElementById('objective-text').innerText = `${destroyText} ${winterGeneratorsDestroyed}/${WINTER_CONFIG.generatorCount}`;
        if (generatorsRemaining <= 0) completeLevel();
    }
    
    // Bonus crates
    bonusCrates = bonusCrates.filter(c => !c.dead);
    bonusCrates.forEach(c => {
        // Ímã: caixas derivam até o jogador quando próximo; contato coleta
        if (!c.dead && player) {
            const pc = player.getCenter();
            const dx = pc.x - (c.x + c.w / 2);
            const dy = pc.y - (c.y + c.h / 2);
            const d = Math.hypot(dx, dy);
            if (d < 120 && d > 4) {
                c.x += (dx / d) * 2.2;
                c.y += (dy / d) * 2.2;
            }
            if (player.x < c.x + c.w && player.x + player.w > c.x &&
                player.y < c.y + c.h && player.y + player.h > c.y) {
                c.dead = true;
                collectPowerup(c);
                return;
            }
        }

        // Movimento especial para shmup
        if (c.isShmupCrate) {
            // Movimento vertical (descendo)
            c.y += c.vy;
            
            // Movimento horizontal sinusoidal (wobble)
            c.wobblePhase += 0.08;
            c.x += c.vx + Math.sin(c.wobblePhase) * 1.5;
            
            // Limites horizontais (rebater nas bordas)
            if (c.x < 20) { c.x = 20; c.vx = Math.abs(c.vx); }
            if (c.x + c.w > canvas.width - 20) { c.x = canvas.width - 20 - c.w; c.vx = -Math.abs(c.vx); }
            
            // Morrer se sair por baixo
            if (c.y > canvas.height + 50) {
                c.dead = true;
            }
        }
        drawBonusCrate(ctx, c);
    });
    
    // Floating texts
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    floatingTexts.forEach(t => { t.update(); t.draw(ctx); });
    
    // Update entities
    player.update();
    player.draw(ctx);
    
    enemies = enemies.filter(e => !e.dead);
    enemies.forEach(e => { e.update(); e.draw(ctx); drawEnemyHPBar(ctx, e); });
    
    // Desenhar barra de HP do Boss (fase 5)
    if (lvl.type === 'boss') {
        drawBossHPBar(ctx);
    }
    
    // Desenhar indicadores de inimigos fora da tela
    drawOffscreenIndicators(ctx);
    
    projectiles = projectiles.filter(p => !p.dead);
    projectiles.forEach(p => {
        p.update();
        
        // Checar hit no boss da fase Escape
        if (lvl.type === 'escape') {
            checkEscapeBossHit(p);
            checkEscapeObstacleHit(p);
        }
        
        // Desenho especial para torpedos
        if (p.isTorpedo) {
            drawTorpedo(ctx, p.x, p.y, p.vx, p.vy);
        } else {
            p.draw(ctx);
        }
    });
    
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    
    // METAL DEBRIS - Atualizar e desenhar debris metálicos com física
    if (typeof metalDebris !== 'undefined') {
        metalDebris = metalDebris.filter(d => d.life > 0);
        metalDebris.forEach(d => { d.update(); d.draw(ctx); });
    }
    
    // Winter level: Snow particles e blizzard overlay (sobre tudo, antes do UI)
    if (lvl.type === 'winter') {
        winterSnowParticles.forEach(p => drawSnowParticle(ctx, p));
        const stormIntensity = (WINTER_CONFIG.generatorCount - winterGeneratorsDestroyed) / WINTER_CONFIG.generatorCount;
        drawBlizzardOverlay(stormIntensity);
        drawWindIndicator();
    }
    
    updatePowerup();
    updateTrainLevel(); // Lógica especial da fase do trem
    updateWinterLevel(); // Lógica especial da fase Winter Storm
    updateSkyFortressLevel(); // Lógica especial da fase Sky Fortress
    updateShmupLevelWrapper(); // Lógica especial da fase Shmup
    updateEscapeLevel(); // Lógica especial da fase A Fuga
    updateEscapeRouteLevel(); // Lógica especial da fase Rota de Fuga
    checkCollisions();
    drawCrosshair(ctx);
    updateUI();
    
    if (player.hp <= 0) {
        gameState = 'GAMEOVER';
        AudioEngine.stopMusic();
        AudioEngine.playGameOver();
        HighScoreManager.addDeath();
        
        // ROLLBACK: Descartar pontuação da fase (derrota)
        // NÃO enviar ao ranking - só enviamos quando supera bestScore ao vencer
        phaseScore = 0;
        score = totalScore;
        console.log('❌ Derrota! PhaseScore descartado. Score mantido:', totalScore);
        
        // Mostrar score salvo (totalScore), não o que estava em andamento
        document.getElementById('final-score').innerText = 'SCORE SALVO: ' + totalScore.toLocaleString();
        
        // Verificar se o totalScore atual é recorde (pode ser de fases anteriores vencidas)
        if (totalScore > 0 && totalScore >= bestScore) {
            document.getElementById('final-score').innerText += '\n🏆 SEU MELHOR: ' + bestScore.toLocaleString();
        }
        document.getElementById('gameover-screen').classList.remove('hidden');
    }
    
    ctx.restore();
    requestAnimationFrame(loop);
}

// ============ INITIALIZATION ============

window.onload = function() {
    generateIcons();
    
    // DEV MODE - Inicializar seletor de fases
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        initDevLevelSelector();
    }
    
    const highScore = HighScoreManager.getHighScore();
    if (highScore > 0) {
        const menuDesc = document.querySelector('.menu-description');
        if (menuDesc) {
            menuDesc.innerHTML += `<br>🏆 <strong style="color:#ffd700">RECORDE: ${highScore.toLocaleString()}</strong>`;
        }
    }
    
    console.log('🎮 Pixel War Ultimate carregado!');
    console.log('💡 Dica: Clique em INICIAR MISSÃO para ativar o áudio!');
    console.log('🏆 High Score:', highScore);
    if (DEV_MODE) console.log('🔧 DEV MODE ATIVO - Seletor de fases disponível!');
};

// ============ DEV MODE - LEVEL SELECTOR ============

function initDevLevelSelector() {
    const devPanel = document.getElementById('dev-level-selector');
    const buttonsContainer = document.getElementById('dev-level-buttons');
    
    if (!devPanel || !buttonsContainer) return;
    
    // Mostrar o painel
    devPanel.classList.remove('hidden');
    
    // Gerar botões para cada fase
    levels.forEach((level, index) => {
        const btn = document.createElement('button');
        btn.className = 'dev-level-btn';
        btn.innerHTML = `
            <span class="level-num">F${level.id}</span>
            <span class="level-type">${getLevelTypeName(level.type)}</span>
        `;
        btn.onclick = () => devStartLevel(index);
        buttonsContainer.appendChild(btn);
    });
}

function getLevelTypeName(type) {
    const names = {
        'kill': 'MATAR',
        'kill_static': 'TORRES',
        'survival': 'SOBREVIV',
        'boss': 'BOSS',
        'train': 'TREM',
        'winter': 'NEVE',
        'skyfortress': 'FORTAL',
        'shmup': 'SHMUP',
        'escape': 'FUGA',
        'escaperoute': 'ROTA',
        'sniper': 'SNIPER'
    };
    return names[type] || type.toUpperCase();
}

async function devStartLevel(levelIndex) {
    console.log('🔧 DEV: Iniciando fase', levelIndex + 1);
    
    AudioEngine.init();
    AudioEngine.resume();
    AudioEngine.playMenuSelect();
    
    document.getElementById('start-screen').classList.add('hidden');
    player = new Player(selectedClass);
    currentLevelIndex = levelIndex;
    score = 0;
    bonusCrates = [];
    floatingTexts = [];
    activePowerup = null;
    powerupTimer = 0;
    nextPowerupSpawn = 200;
    
    await startLevel(levelIndex);
    generateIcons();
    AudioEngine.playMusic();
    gameState = 'PLAYING';
    
    console.log('✅ DEV: Fase', levelIndex + 1, 'iniciada!');
    
    loop();
}

// ============ PROGRESS SAVE/LOAD ============

// Save current game progress (async - server API)
async function saveCurrentProgress() {
    if (typeof AuthManager === 'undefined') {
        console.warn('AuthManager not available');
        return false;
    }
    
    if (!AuthManager.isLoggedIn()) {
        console.warn('User not logged in - cannot save progress');
        return false;
    }
    
    const progressData = {
        level: currentLevelIndex + 1,
        score: totalScore, // Salvar apenas pontuação consolidada (sem phaseScore)
        playerClass: selectedClass,
        hp: player ? player.hp : 100,
        maxHp: player ? player.maxHp : 100,
        damage: player ? player.damage : 10,
        fireRate: player ? player.fireRate : 1,
        kills: HighScoreManager.sessionKills || 0,
        deaths: HighScoreManager.sessionDeaths || 0
    };
    
    try {
        await AuthManager.saveProgress(progressData);
        console.log('💾 Progresso salvo no servidor:', progressData);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error);
        return false;
    }
}

// Load saved progress and start game
async function loadSavedProgress() {
    if (typeof AuthManager === 'undefined') {
        console.warn('AuthManager not available');
        return false;
    }
    
    if (!AuthManager.isLoggedIn()) {
        console.warn('User not logged in - cannot load progress');
        return false;
    }
    
    // Load from server
    const progress = await AuthManager.loadProgress();
    if (!progress) {
        console.warn('No saved progress found on server');
        return false;
    }
    
    console.log('📂 Carregando progresso do servidor:', progress);
    
    // Set game state from saved progress
    selectedClass = progress.playerClass || 'soldier';
    
    // Restaurar pontuação salva como totalScore
    totalScore = progress.score || 0;
    phaseScore = 0; // Fase vai começar do zero
    score = totalScore; // Score visual = totalScore
    
    // Carregar bestScore do servidor
    if (typeof HighScoreManager !== 'undefined') {
        bestScore = Math.max(HighScoreManager.getHighScore() || 0, totalScore);
        console.log('🏆 Best score carregado:', bestScore);
    }
    
    const levelIndex = (progress.level || 1) - 1;
    
    // Initialize game with saved state
    AudioEngine.init();
    AudioEngine.resume();
    HighScoreManager.startSession();
    
    // Show loading screen
    LoadingScreen.show();
    LoadingScreen.updateProgress(0, 'Carregando progresso...');
    
    try {
        const dataLoaded = await DataLoader.init((prog, status) => {
            LoadingScreen.updateProgress(prog * 0.8, status);
        });
        
        if (!dataLoaded) throw new Error('Failed to load game data');
        
        LoadingScreen.updateProgress(85, 'Configurando jogo...');
        initLevelsFromServer();
        initPowerupsFromServer();
        
        LoadingScreen.updateProgress(90, `Carregando fase ${progress.level}...`);
        await loadLevelConfigFromServer(progress.level);
        
        LoadingScreen.updateProgress(100, 'Pronto!');
        await new Promise(r => setTimeout(r, 300));
        LoadingScreen.hide();
        
    } catch (error) {
        console.error('Failed to load game data:', error);
        LoadingScreen.showError('Falha ao conectar ao servidor.');
        await new Promise(r => setTimeout(r, 2000));
        LoadingScreen.hide();
        return false;
    }
    
    document.getElementById('start-screen').classList.add('hidden');
    player = new Player(selectedClass);
    
    // Restore player state from saved progress
    if (progress.hp) player.hp = progress.hp;
    if (progress.maxHp) player.maxHp = progress.maxHp;
    if (progress.damage) player.damage = progress.damage;
    if (progress.fireRate) player.fireRate = progress.fireRate;
    
    currentLevelIndex = levelIndex;
    bonusCrates = [];
    floatingTexts = [];
    activePowerup = null;
    powerupTimer = 0;
    nextPowerupSpawn = 200;
    
    // Fase bônus só antes da fase 4; se o save está além, marcar como jogada
    if (typeof bonusStagePlayed !== 'undefined') {
        bonusStagePlayed = levelIndex >= BONUS_STAGE.afterLevelIndex;
        lastBonusResult = null;
    }
    
    generateIcons();
    
    // Start the saved level with transition
    const levelName = `FASE ${progress.level}: ${getLevelName(levelIndex).toUpperCase()}`;
    
    if (typeof playArcadeTransition === 'function') {
        gameState = 'TRANSITION';
        playArcadeTransition(levelName, async () => {
            await startLevel(levelIndex);
            AudioEngine.playMusic();
            gameState = 'COUNTDOWN';
            console.log('✅ Progresso carregado! Fase:', progress.level);
            loop();
        });
    } else {
        await startLevel(levelIndex);
        AudioEngine.playMusic();
        gameState = 'PLAYING';
        console.log('✅ Progresso carregado! Fase:', progress.level);
        loop();
    }
    
    // Clear saved progress after loading
    AuthManager.clearProgress();
    
    // Hide continue button
    const continueContainer = document.getElementById('continue-container');
    if (continueContainer) continueContainer.classList.add('hidden');
    
    return true;
}

// Quit to main menu
function quitToMenu() {
    gameState = 'MENU';
    AudioEngine.stopMusic();
    canvas.style.cursor = 'default';
    
    // DESCARTE: Ao sair no meio da fase, descartar pontuação em andamento
    phaseScore = 0;
    score = totalScore;
    console.log('🚪 Saída! PhaseScore descartado. Score mantido:', totalScore);
    
    // Reset game state
    enemies = [];
    projectiles = [];
    particles = [];
    bonusCrates = [];
    floatingTexts = [];
    
    // Hide all game screens
    const gameoverScreen = document.getElementById('gameover-screen');
    const victoryScreen = document.getElementById('victory-screen');
    const upgradeScreen = document.getElementById('upgrade-screen');
    const pauseScreen = document.getElementById('pause-screen');
    
    if (gameoverScreen) gameoverScreen.classList.add('hidden');
    if (victoryScreen) victoryScreen.classList.add('hidden');
    if (upgradeScreen) upgradeScreen.classList.add('hidden');
    if (pauseScreen) pauseScreen.classList.add('hidden');
    
    // Show start screen
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Check for saved progress
    if (typeof checkSavedProgress === 'function') {
        checkSavedProgress();
    }
    
    console.log('🏠 Voltou ao menu principal');
}
