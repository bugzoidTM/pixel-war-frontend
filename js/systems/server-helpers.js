// ============ SERVER DATA HELPERS ============
// Helper functions to integrate phase-specific code with server data

// ============ TRAIN PHASE HELPERS ============

function getTrainCarConfig(carIndex) {
    const levelConfig = DataLoader.getLevelConfig(6); // Train is level 6
    if (levelConfig && levelConfig.cars && levelConfig.cars[carIndex]) {
        return levelConfig.cars[carIndex];
    }
    // Fallback to default
    return {
        enemies: TRAIN_CONFIG.enemiesPerCar[carIndex] || 5,
        types: ['soldier'],
        obstacles: true
    };
}

function getTrainEnemiesForCar(carIndex) {
    const carConfig = getTrainCarConfig(carIndex);
    return carConfig.enemies || TRAIN_CONFIG.enemiesPerCar[carIndex] || 5;
}

function isTrainMiniBossCar(carIndex) {
    const carConfig = getTrainCarConfig(carIndex);
    return carConfig.isBoss || (carIndex + 1) === TRAIN_CONFIG.miniBossCar;
}

function isTrainFinalCar(carIndex) {
    const carConfig = getTrainCarConfig(carIndex);
    return carConfig.isFinal || (carIndex + 1) === TRAIN_CONFIG.totalCars;
}

// ============ WINTER PHASE HELPERS ============

function getWinterGenerators() {
    const levelConfig = DataLoader.getLevelConfig(7); // Winter is level 7
    if (levelConfig && levelConfig.generators) {
        return levelConfig.generators;
    }
    // Fallback to default positions
    return [
        { x: 100, y: 200, hp: WINTER_CONFIG.generatorHP },
        { x: 800, y: 200, hp: WINTER_CONFIG.generatorHP },
        { x: 100, y: 500, hp: WINTER_CONFIG.generatorHP },
        { x: 800, y: 500, hp: WINTER_CONFIG.generatorHP }
    ];
}

// ============ SHMUP PHASE HELPERS ============

function getShmupWaves() {
    const levelConfig = DataLoader.getLevelConfig(9); // Shmup is level 9
    if (levelConfig && levelConfig.waves) {
        return levelConfig.waves;
    }
    // Fallback to default wave generation
    return null;
}

function getShmupWaveConfig(waveNumber) {
    const waves = getShmupWaves();
    if (waves && waves[waveNumber - 1]) {
        return waves[waveNumber - 1];
    }
    // Default wave config
    return {
        enemies: SHMUP_CONFIG.enemiesPerWave + (waveNumber - 1) * SHMUP_CONFIG.waveIncrement,
        types: ['plane', 'chopper', 'turret'],
        pattern: 'random'
    };
}

// ============ ESCAPE PHASE HELPERS ============

function getEscapeBossConfig() {
    const levelConfig = DataLoader.getLevelConfig(10); // Escape is level 10
    if (levelConfig && levelConfig.boss) {
        return levelConfig.boss;
    }
    // Fallback
    return {
        hp: ESCAPE_CONFIG.bossHP,
        speed: ESCAPE_CONFIG.bossSpeed,
        maxSpeed: ESCAPE_CONFIG.bossMaxSpeed
    };
}

function getEscapePowerupTypes() {
    const levelConfig = DataLoader.getLevelConfig(10);
    if (levelConfig && levelConfig.powerupTypes) {
        return levelConfig.powerupTypes;
    }
    return ESCAPE_CONFIG.powerupTypes || ['heal', 'shield', 'multiShot'];
}

// ============ ESCAPE ROUTE PHASE HELPERS ============

function getEscapeRouteTrackChallenges() {
    const levelConfig = DataLoader.getLevelConfig(11); // Escape Route is level 11
    if (levelConfig && levelConfig.trackChallenges) {
        return levelConfig.trackChallenges;
    }
    // Fallback to default TRACK_CHALLENGES
    return typeof TRACK_CHALLENGES !== 'undefined' ? TRACK_CHALLENGES : [];
}

function getEscapeRouteTerrain() {
    const levelConfig = DataLoader.getLevelConfig(11);
    if (levelConfig && levelConfig.terrain) {
        return levelConfig.terrain;
    }
    return ESCAPE_ROUTE_CONFIG.terrain;
}

// ============ SNIPER PHASE HELPERS ============

function getSniperDifficultyTiers() {
    const levelConfig = DataLoader.getLevelConfig(12); // Sniper is level 12
    if (levelConfig && levelConfig.difficultyTiers) {
        return levelConfig.difficultyTiers;
    }
    return SNIPER_CONFIG.difficultyTiers;
}

function getSniperSpawnZones() {
    const levelConfig = DataLoader.getLevelConfig(12);
    if (levelConfig && levelConfig.spawnZones) {
        return levelConfig.spawnZones;
    }
    return SNIPER_CONFIG.spawnZones;
}

function getSniperTargetTypes() {
    const levelConfig = DataLoader.getLevelConfig(12);
    if (levelConfig && levelConfig.targetTypes) {
        return levelConfig.targetTypes;
    }
    return [
        { type: 'soldier', weight: 0.5, hp: 100, score: 100 },
        { type: 'officer', weight: 0.3, hp: 100, score: 200 },
        { type: 'runner', weight: 0.2, hp: 100, score: 300, speed: 2.5 }
    ];
}

function getSniperKillStreakBonus() {
    const levelConfig = DataLoader.getLevelConfig(12);
    if (levelConfig && levelConfig.killStreakBonus) {
        return levelConfig.killStreakBonus;
    }
    return SNIPER_CONFIG.killStreakBonus || [0, 0, 50, 100, 150, 200, 300];
}

// ============ GENERIC HELPERS ============

// Get enemy spawn weights for current level
function getEnemySpawnWeights() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.spawning && levelConfig.spawning.enemies) {
        const weights = {};
        levelConfig.spawning.enemies.forEach(e => {
            weights[e.type] = e.weight;
        });
        return weights;
    }
    return null;
}

// Get spawn patterns for current level
function getSpawnPatterns() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.spawning && levelConfig.spawning.patterns) {
        return levelConfig.spawning.patterns;
    }
    return { lateral: 0.7, top: 0.15, bottom: 0.15 };
}

// Check if level has static enemies defined
function getStaticEnemies() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.staticEnemies) {
        return levelConfig.staticEnemies;
    }
    return null;
}

// Get boss configuration for boss-type levels
function getBossConfig() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.boss) {
        return levelConfig.boss;
    }
    return null;
}

// Get waves triggered by specific events
function getWavesForTrigger(triggerType, triggerValue) {
    const waves = getLevelWaves();
    if (!waves || waves.length === 0) return [];
    
    return waves.filter(wave => {
        if (wave.trigger === triggerType) {
            if (triggerValue !== undefined) {
                return wave.value === triggerValue;
            }
            return true;
        }
        return false;
    });
}

// Spawn enemies from a wave configuration
function spawnWaveEnemies(waveConfig) {
    if (!waveConfig || !waveConfig.enemies) return;
    
    waveConfig.enemies.forEach(enemyGroup => {
        for (let i = 0; i < enemyGroup.count; i++) {
            // Random position based on spawn patterns
            const patterns = getSpawnPatterns();
            const roll = Math.random();
            let x, y;
            
            if (roll < patterns.lateral) {
                // Lateral spawn
                x = Math.random() > 0.5 ? -30 : canvas.width + 30;
                y = 100 + Math.random() * (canvas.height - 200);
            } else if (roll < patterns.lateral + patterns.top) {
                // Top spawn
                x = 50 + Math.random() * (canvas.width - 100);
                y = -30;
            } else {
                // Bottom spawn
                x = 50 + Math.random() * (canvas.width - 100);
                y = canvas.height + 30;
            }
            
            enemies.push(new Enemy(enemyGroup.type, x, y));
        }
    });
    
    console.log('🌊 Wave spawned:', waveConfig);
}

// Apply damage with level modifiers
function applyDamageWithModifiers(target, baseDamage, isPlayerDamage = true) {
    const modifiers = getLevelModifiers();
    let finalDamage = baseDamage;
    
    if (isPlayerDamage) {
        finalDamage *= modifiers.playerDamageMultiplier || 1;
    } else {
        finalDamage *= modifiers.enemyDamageMultiplier || 1;
    }
    
    target.takeDamage(Math.round(finalDamage));
}

console.log('📦 Server data helpers loaded');
