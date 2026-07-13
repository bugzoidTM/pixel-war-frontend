// ============ GAME CONFIGURATION ============

// DEV MODE - Mude para false em produção
const DEV_MODE = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============ RESPONSIVE SYSTEM ============
// Dimensões base do jogo (lógicas)
const BASE_WIDTH = 900;
const BASE_HEIGHT = 650;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

// Função para redimensionar o canvas
function resizeGame() {
    const wrapper = document.getElementById('game-wrapper');
    const container = document.getElementById('game-container');
    
    // Calcular tamanho disponível (sem margem para mobile)
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight;

    // Em telas de celular (mais altas que largas), priorizar altura
    let scale, finalWidth, finalHeight;
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile && isLandscape && window.innerWidth < BASE_WIDTH * 1.1) {
        // Mobile landscape: ocupar toda a tela, aspect ratio flexível
        finalWidth = window.innerWidth;
        finalHeight = window.innerHeight;
        scale = Math.min(finalWidth / BASE_WIDTH, finalHeight / BASE_HEIGHT);
    } else if (window.innerHeight / window.innerWidth > 1.1) {
        // Mobile portrait: prioriza altura
        scale = availableHeight / BASE_HEIGHT;
        if (BASE_WIDTH * scale > availableWidth) {
            scale = availableWidth / BASE_WIDTH;
        }
        finalWidth = Math.floor(BASE_WIDTH * scale);
        finalHeight = Math.floor(BASE_HEIGHT * scale);
    } else {
        // Desktop/tablet: preencher toda a tela
        finalWidth = availableWidth;
        finalHeight = availableHeight;
        scale = Math.min(finalWidth / BASE_WIDTH, finalHeight / BASE_HEIGHT);
    }

    // Limitar escala máxima para não ficar muito grande em monitores 4K
    scale = Math.min(scale, 2);

    // Aplicar ao container (escala visual)
    if (container) {
        container.style.width = finalWidth + 'px';
        container.style.height = finalHeight + 'px';
    }

    // Canvas mantém resolução base (escala via CSS)
    canvas.style.width = finalWidth + 'px';
    canvas.style.height = finalHeight + 'px';

    // Wrapper ajusta automaticamente
    if (wrapper) {
        wrapper.style.width = '100vw';
        wrapper.style.height = '100vh';
    }

    console.log(`📱 Resize: ${finalWidth}x${finalHeight} (scale: ${scale.toFixed(2)})`);
}

// Chamar ao carregar e ao redimensionar
window.addEventListener('resize', resizeGame);
window.addEventListener('load', resizeGame);

// Chamar imediatamente
resizeGame();

// Desabilitar anti-aliasing para pixels definidos
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

// ============ PIXEL ART SYSTEM ============
const PIXEL_SCALE = 2; // Cada pixel lógico = 2x2 pixels na tela (estilo NES)

// Paletas de cores limitadas (3 tons por cor - estilo Mario Bros)
const PALETTES = {
    armyGreen: {
        outline: '#1a2810',
        dark: '#2a3a1c',
        base: '#3d5a2a',
        light: '#5a7a45'
    },
    enemyRed: {
        outline: '#2a0808',
        dark: '#4a1515',
        base: '#8b2020',
        light: '#bb4040'
    },
    skin: {
        outline: '#5a3a20',
        dark: '#a67c52',
        base: '#d4a574',
        light: '#f0d0a0'
    },
    metal: {
        outline: '#0a0a0a',
        dark: '#2a2a2a',
        base: '#4a4a4a',
        light: '#6a6a6a'
    },
    darkMetal: {
        outline: '#000000',
        dark: '#1a1a1a',
        base: '#2a2a2a',
        light: '#3a3a3a'
    },
    water: {
        outline: '#0a2a4a',
        dark: '#1a4a6a',
        base: '#3a6a8a',
        light: '#5a8aaa'
    },
    ship: {
        outline: '#1a2a3a',
        dark: '#3a4a5a',
        base: '#4a5a6a',
        light: '#6a7a8a'
    },
    plane: {
        outline: '#1a2a1a',
        dark: '#3a4a30',
        base: '#4a6b40',
        light: '#6a8b60'
    },
    enemyBrown: {
        outline: '#1a1008',
        dark: '#3a2a1a',
        base: '#5a4a3a',
        light: '#7a6a5a'
    },
    purple: {
        outline: '#1a0a2a',
        dark: '#3a2a4a',
        base: '#5a3a6a',
        light: '#7a5a8a'
    },
    gold: {
        outline: '#4a3a00',
        dark: '#8a7a20',
        base: '#cca020',
        light: '#ffd740'
    }
};

// ============ PIXEL ART HELPERS ============

// Desenha um pixel escalado
function drawPixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.floor(x) * PIXEL_SCALE,
        Math.floor(y) * PIXEL_SCALE,
        PIXEL_SCALE,
        PIXEL_SCALE
    );
}

// Desenha retângulo com contorno preto (estilo Mario Bros)
function drawPixelRect(ctx, x, y, w, h, fillColor, outlineColor = '#000000') {
    const px = Math.floor(x);
    const py = Math.floor(y);
    const pw = Math.floor(w);
    const ph = Math.floor(h);
    
    // Contorno preto
    ctx.fillStyle = outlineColor;
    ctx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, pw * PIXEL_SCALE, ph * PIXEL_SCALE);
    
    // Preenchimento interno (1px de borda)
    if (pw > 2 && ph > 2) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(
            (px + 1) * PIXEL_SCALE,
            (py + 1) * PIXEL_SCALE,
            (pw - 2) * PIXEL_SCALE,
            (ph - 2) * PIXEL_SCALE
        );
    }
}

// Desenha retângulo com sombreamento 3D (luz vindo do topo-esquerdo)
function drawShadedRect(ctx, x, y, w, h, palette) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    const pw = Math.floor(w);
    const ph = Math.floor(h);
    
    // Contorno
    ctx.fillStyle = palette.outline || '#000000';
    ctx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, pw * PIXEL_SCALE, ph * PIXEL_SCALE);
    
    if (pw <= 2 || ph <= 2) return;
    
    // Corpo principal
    ctx.fillStyle = palette.base;
    ctx.fillRect((px + 1) * PIXEL_SCALE, (py + 1) * PIXEL_SCALE, (pw - 2) * PIXEL_SCALE, (ph - 2) * PIXEL_SCALE);
    
    // Highlight topo-esquerdo (1px)
    ctx.fillStyle = palette.light;
    ctx.fillRect((px + 1) * PIXEL_SCALE, (py + 1) * PIXEL_SCALE, (pw - 2) * PIXEL_SCALE, PIXEL_SCALE); // Topo
    ctx.fillRect((px + 1) * PIXEL_SCALE, (py + 1) * PIXEL_SCALE, PIXEL_SCALE, (ph - 2) * PIXEL_SCALE); // Esquerda
    
    // Sombra inferior-direito (1px)
    ctx.fillStyle = palette.dark;
    ctx.fillRect((px + 1) * PIXEL_SCALE, (py + ph - 2) * PIXEL_SCALE, (pw - 2) * PIXEL_SCALE, PIXEL_SCALE); // Inferior
    ctx.fillRect((px + pw - 2) * PIXEL_SCALE, (py + 1) * PIXEL_SCALE, PIXEL_SCALE, (ph - 2) * PIXEL_SCALE); // Direita
}

// Desenha círculo pixelado (padrões pré-calculados)
const PIXEL_CIRCLES = {
    2: [[0,0],[1,0],[0,1],[1,1]],
    3: [[1,0],[0,1],[1,1],[2,1],[1,2]],
    4: [[1,0],[2,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[1,3],[2,3]],
    5: [[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[0,3],[1,3],[2,3],[3,3],[4,3],[1,4],[2,4],[3,4]],
    6: [[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[1,4],[2,4],[3,4],[4,4],[2,5],[3,5]]
};

function drawPixelCircle(ctx, cx, cy, radius, fillColor, outlineColor = '#000000') {
    const r = Math.min(Math.max(2, Math.floor(radius)), 6);
    const pattern = PIXEL_CIRCLES[r];
    const offsetX = Math.floor(cx - r / 2);
    const offsetY = Math.floor(cy - r / 2);
    
    // Desenha contorno (pixels adjacentes)
    ctx.fillStyle = outlineColor;
    pattern.forEach(([px, py]) => {
        // Pixels ao redor para criar contorno
        ctx.fillRect((offsetX + px - 1) * PIXEL_SCALE, (offsetY + py) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
        ctx.fillRect((offsetX + px + 1) * PIXEL_SCALE, (offsetY + py) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
        ctx.fillRect((offsetX + px) * PIXEL_SCALE, (offsetY + py - 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
        ctx.fillRect((offsetX + px) * PIXEL_SCALE, (offsetY + py + 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
    });
    
    // Desenha preenchimento
    ctx.fillStyle = fillColor;
    pattern.forEach(([px, py]) => {
        ctx.fillRect((offsetX + px) * PIXEL_SCALE, (offsetY + py) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
    });
}

// Desenha sombra pixelada no chão
function drawPixelShadow(ctx, cx, cy, w, h) {
    const px = Math.floor(cx - w / 2);
    const py = Math.floor(cy);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, Math.floor(w) * PIXEL_SCALE, Math.floor(h) * PIXEL_SCALE);
}

// Desenha retângulo simples sem contorno (para detalhes internos)
function drawPixelFill(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.floor(x) * PIXEL_SCALE,
        Math.floor(y) * PIXEL_SCALE,
        Math.floor(w) * PIXEL_SCALE,
        Math.floor(h) * PIXEL_SCALE
    );
}

const CONFIG = {
    screenShake: { intensity: 0, decay: 0.9 },
    masterVolume: 0.5,
    difficulty: 'normal',
    showOffscreenIndicators: true,
    pixelScale: PIXEL_SCALE
};

// Sistema de High Score - Server-only (sem localStorage)
const HighScoreManager = {
    sessionStartTime: null, // Track game session start
    sessionKills: 0,
    sessionDeaths: 0,
    highScore: 0, // In-memory cache, loaded from server
    
    // Start tracking a new game session
    startSession() {
        this.sessionStartTime = Date.now();
        this.sessionKills = 0;
        this.sessionDeaths = 0;
        
        // Load high score from server if logged in
        if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
            this.highScore = AuthManager.getHighScore() || 0;
            // Sincronizar bestScore global com servidor
            if (typeof bestScore !== 'undefined') {
                bestScore = Math.max(bestScore || 0, this.highScore || 0);
                console.log('🏆 Best score carregado:', bestScore);
            }
        }
    },
    
    // Track kills
    addKill() {
        this.sessionKills++;
    },
    
    // Track deaths
    addDeath() {
        this.sessionDeaths++;
    },
    
    // Get session duration in seconds
    getSessionDuration() {
        if (!this.sessionStartTime) return 0;
        return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    },
    
    // Submit score to server (async)
    async submitToServer(score, playerClass, levelReached, isVictory) {
        // Only submit if RankingManager is available
        if (typeof RankingManager === 'undefined') {
            console.log('📊 RankingManager não disponível');
            return null;
        }
        
        const duration = this.getSessionDuration();
        if (duration < 5) {
            console.log('📊 Sessão muito curta, não enviando ao servidor');
            return null;
        }
        
        try {
            const result = await RankingManager.submitScore({
                score,
                playerClass,
                levelReached,
                isVictory,
                kills: this.sessionKills,
                deaths: this.sessionDeaths,
                duration
            });
            
            console.log('🏆 Score enviado ao servidor:', result);
            
            // Update local high score cache
            if (score > this.highScore) {
                this.highScore = score;
                if (typeof AuthManager !== 'undefined') {
                    AuthManager.updateHighScoreIfBetter(score);
                }
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao enviar score:', error.message);
            return null;
        }
    },
    
    // Submit score to server (wrapper for game.js)
    async saveAndSubmit(name, score, playerClass, level, isVictory = false) {
        // Update high score cache
        if (score > this.highScore) {
            this.highScore = score;
        }
        
        // Submit to server
        const serverResult = await this.submitToServer(score, playerClass, level, isVictory);
        
        return {
            server: serverResult
        };
    },
    
    getHighScore() {
        // Return max of cached high score and AuthManager's high score
        if (typeof AuthManager !== 'undefined') {
            return Math.max(this.highScore, AuthManager.getHighScore());
        }
        return this.highScore;
    },
    
    isNewHighScore(score) {
        return score > this.getHighScore();
    },
    
    // Get user's server rank (if logged in)
    async getServerRank() {
        if (typeof RankingManager === 'undefined' || typeof AuthManager === 'undefined') {
            return null;
        }
        if (!AuthManager.isLoggedIn()) {
            return null;
        }
        
        try {
            const rankings = await RankingManager.getMyRankings();
            return rankings;
        } catch {
            return null;
        }
    }
};

// Game State Variables
let gameState = 'START';
let isPaused = false;
let pauseMenuVisible = false;
let frameCount = 0;

// ============ SISTEMA DE PONTUAÇÃO ============
// totalScore: pontuação persistente (soma de fases vencidas)
// phaseScore: pontuação temporária da fase atual (descartada em derrota/saída)
// score: variável de exibição (totalScore + phaseScore) - NÃO usar para salvar
let totalScore = 0;      // Persistente - só aumenta ao VENCER uma fase
let phaseScore = 0;      // Temporária - zerada a cada início de fase
let score = 0;           // Visual only: totalScore + phaseScore (para HUD)
let bestScore = 0;       // Recorde do jogador (maior totalScore já atingido)

let selectedClass = 'soldier';
let shakeX = 0, shakeY = 0;

// Game entities
let player;
let enemies = [];
let projectiles = [];
let particles = [];
let decorations = [];
let bonusCrates = [];
let floatingTexts = [];
let mines = []; // Minas terrestres (apenas para tanque)
let grenades = []; // Granadas no chão (apenas para soldado)
let submarines = []; // Submarinos (apenas para navio)
let lastSubmarineSide = 'right'; // Alterna lados de spawn

// Powerup system
let activePowerup = null;
let powerupTimer = 0;
let powerupDuration = 0;
let nextPowerupSpawn = 200;

// Level configuration - Loaded from server via DataLoader
// This is a fallback/placeholder - actual data comes from server
let levels = [];

// Fases offline usadas quando o servidor está inacessível
const FALLBACK_LEVELS = [
    { id: 1, objective: 'Derrote 10 inimigos', type: 'kill', target: 10, spawnRate: 60, bg: '#4a7a3a', enemies: ['soldier'], maxEnemies: 12 },
    { id: 2, objective: 'Destrua 3 torres', type: 'kill_static', target: 3, spawnRate: 70, bg: '#4a3c2a', enemies: ['soldier', 'tower'], maxEnemies: 10 },
    { id: 3, objective: 'Sobreviva 45 segundos', type: 'survival', target: 45, spawnRate: 50, bg: '#3a2a2a', enemies: ['soldier', 'tank'], maxEnemies: 14 },
    { id: 4, objective: 'Derrote 15 inimigos', type: 'kill', target: 15, spawnRate: 50, bg: '#2d4a2d', enemies: ['soldier', 'tank', 'chopper'], maxEnemies: 14 },
    { id: 5, objective: 'Destrua o Boss', type: 'boss', target: 1, spawnRate: 60, bg: '#1a1a1a', enemies: ['soldier', 'tank'], maxEnemies: 15 }
];

// Function to get current level from server data
function getCurrentLevel() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig) {
        return {
            id: levelConfig.id,
            objective: levelConfig.objective,
            type: levelConfig.type,
            target: levelConfig.target,
            spawnRate: levelConfig.spawning?.rate || 60,
            bg: levelConfig.background,
            enemies: levelConfig.spawning?.enemies?.map(e => e.type) || [],
            maxEnemies: levelConfig.spawning?.maxEnemies || 12
        };
    }
    // Fallback for offline mode
    return levels[currentLevelIndex] || { id: 1, type: 'kill', target: 10, spawnRate: 60, bg: '#4a7a3a', enemies: ['soldier'], maxEnemies: 12 };
}

// Initialize levels from server data
function initLevelsFromServer() {
    const serverLevels = DataLoader.getLevelsIndex();
    if (serverLevels && serverLevels.length > 0) {
        levels = serverLevels.map(lvl => ({
            id: lvl.id,
            objective: lvl.preview,
            type: lvl.type,
            target: 0, // Will be loaded per-level
            spawnRate: 60,
            bg: '#4a7a3a',
            enemies: [],
            maxEnemies: 12
        }));
        console.log('📊 Initialized', levels.length, 'levels from server');
    }
}

// Train level configuration (Side-scroller)
// Default values - actual config loaded from server per level
let TRAIN_CONFIG = {
    totalCars: 8,
    carWidth: 900,           // Largura de cada vagão (tamanho da tela)
    scrollSpeed: 2,          // Velocidade do scroll horizontal
    maxScrollSpeed: 4,       // Velocidade máxima (acelera gradualmente)
    enemiesPerCar: [5, 6, 7, 1, 8, 8, 10, 6], // Inimigos por vagão (vagão 4 = mini-boss, 8 = locomotiva)
    miniBossCar: 4,          // Vagão do mini-boss
    safeZoneWidth: 100,      // Largura da zona segura (túneis)
    tunnelChance: 0.003,     // Chance de túnel por frame
    tunnelWarningTime: 120,  // Frames de aviso antes do túnel
    tunnelDuration: 90,      // Frames que o túnel dura
    // Side-scroller physics
    gravity: 0.6,            // Gravidade aplicada ao player
    jumpForce: -12,          // Força do pulo (negativo = para cima)
    groundY: 520,            // Posição Y do chão (topo do trem)
    obstacleSpawnRate: 180,  // Frames entre obstáculos
    obstacleSpeed: 4,        // Velocidade dos obstáculos
};

// Train level state
let trainCurrentCar = 1;
let trainScrollX = 0;
let trainSpeed = TRAIN_CONFIG.scrollSpeed;
let trainEnemiesKilled = 0;
let trainEnemiesNeeded = 0;
let trainTunnelActive = false;
let trainObstacles = [];       // Obstáculos para pular (caixas, barreiras)
let trainNextObstacle = 120;   // Frames até próximo obstáculo
let trainTunnelTimer = 0;
let trainTunnelWarning = false;
let trainSafeZone = { x: 0, y: 0, w: 0, h: 0 };

// ============ WINTER STORM CONFIG (Phase 7) ============
// Default values - actual config loaded from server per level
let WINTER_CONFIG = {
    // Ice physics
    friction: 0.92,              // Atrito no gelo (menor = mais escorregadio)
    maxSlideSpeed: 6,            // Velocidade máxima de deslize
    accelerationRate: 0.5,       // Taxa de aceleração no gelo
    
    // Blizzard effect
    blizzardBaseIntensity: 0.35, // Opacidade base da nevasca (100% geradores)
    blizzardMinIntensity: 0.05,  // Opacidade mínima (0% geradores)
    blizzardPulseSpeed: 0.025,   // Velocidade do pulso de visibilidade
    visibilityRadius: 200,       // Raio de visibilidade ao redor do player
    
    // Wind
    windForce: 0.12,             // Força do vento
    windChangeInterval: 300,     // Frames entre mudanças de direção
    
    // Generators (objectives)
    generatorCount: 4,           // Quantidade de geradores
    generatorHP: 200,            // HP de cada gerador
    
    // Snow particles
    snowParticleCount: 60,       // Partículas de neve simultâneas
    snowSpeed: 2.5,              // Velocidade base da neve
    
    // Fire trails (flameTank)
    fireTrailDuration: 180,      // Duração do rastro de fogo (3 segundos)
    fireTrailDamage: 5,          // Dano por contato com fogo
    fireTrailDamageInterval: 30, // Frames entre danos do fogo
};

// Winter level state
let winterWindDirection = -1;    // -1 = esquerda, 1 = direita
let winterWindForce = WINTER_CONFIG.windForce;
let winterGeneratorsDestroyed = 0;
let winterSnowParticles = [];    // Partículas de neve da nevasca
let winterFireTrails = [];       // Rastros de fogo no chão
let winterGenerators = [];       // Referência aos geradores

// ============ SKY FORTRESS CONFIG (Phase 8) ============
// Default values - actual config loaded from server per level
let SKYFORTRESS_CONFIG = {
    // === MODO SIDE-SCROLLING ===
    isSideScroll: true,
    
    // Plataforma metálica (única, horizontal)
    platformWidth: 500,          // Largura da plataforma
    platformHeight: 60,          // Espessura visual da plataforma
    platformX: (900 - 500) / 2,  // Centralizado (canvas 900px) = 200
    platformY: 520,              // Posição Y do topo da plataforma (onde o jogador pisa)
    
    // Física de plataforma
    gravity: 0.6,                // Gravidade
    jumpForce: -14,              // Força do pulo (negativo = para cima)
    maxFallSpeed: 15,            // Velocidade máxima de queda
    groundFriction: 0.85,        // Fricção no chão
    airFriction: 0.95,           // Fricção no ar
    
    // Limites da área jogável (horizontal)
    minX: 50,                    // Limite esquerdo
    maxX: 850,                   // Limite direito
    deathY: 700,                 // Se Y > isso, morreu (caiu)
    
    // Tempo de sobrevivência
    survivalTime: 90,            // 90 segundos
    
    // Vento/Repulsão (mais frequente!)
    windForce: 0.4,              // Força do vento aumentada para side-scroll
    windGustInterval: 120,       // Frames entre rajadas (2 segundos)
    windGustDuration: 60,        // Duração da rajada (1 segundo)
    
    // Parallax dinâmico
    cloudSpeed: 6,               // Velocidade das nuvens (mais rápido)
    cloudCount: 25,              // Mais nuvens
    starSpeed: 0.3,              // Velocidade das estrelas
    starCount: 50,               // Muitas estrelas
    
    // Aeronaves de fundo (decorativas)
    bgAircraftCount: 5,          // Aviões/helis/dirigíveis passando
    bgAircraftSpeed: 1.5,
    
    // Partículas atmosféricas (vento visível)
    particleCount: 40,           // Partículas de vento
    
    // Inimigos
    maxEnemies: 10,              // Máximo de inimigos simultâneos
    jetpackSpawnRate: 90,        // Frames entre spawns de jetpack soldiers
};

// Sky Fortress level state
let skyWindDirection = 0;        // -1, 0, 1 (esq, nenhum, dir)
let skyWindActive = false;
let skyWindTimer = 0;
let skyClouds = [];              // Partículas de nuvem
let skyStars = [];               // Estrelas animadas
let skyPlayerGrounded = false;   // Jogador está no chão?
let skyPlayerVY = 0;             // Velocidade vertical do jogador
let skyBgAircraft = [];          // Aeronaves de fundo
let skyWindParticles = [];       // Partículas de vento
let skyPlatform = null;          // Referência à plataforma

// ============ VERTICAL SHMUP CONFIG (Phase 9) ============
// Default values - actual config loaded from server per level
let SHMUP_CONFIG = {
    // Scroll vertical
    scrollSpeed: 2.5,            // Velocidade do auto-scroll
    
    // Player constraints
    playerY: 550,                // Y fixo do jogador (perto do fundo)
    playerSpeedBoost: 1.8,       // Multiplicador de velocidade horizontal
    
    // Survival
    survivalTime: 90,            // 90 segundos
    
    // Waves
    waveInterval: 600,           // Frames entre waves (10 segundos)
    enemiesPerWave: 5,           // Inimigos base por wave
    waveIncrement: 2,            // +2 inimigos por wave
    
    // Bullet Hell
    bulletSpawnRate: 30,         // Turrets atiram rápido
    maxBullets: 50,              // Máximo de projéteis inimigos
    
    // Visual
    starLayers: 3,               // Camadas de estrelas parallax
    starsPerLayer: 30,
};

// Shmup level state
let shmupScrollY = 0;
let shmupWaveNumber = 1;
let shmupWaveTimer = 0;
let shmupStars = [];             // Estrelas de fundo
let shmupTerrain = [];           // Terreno scrollando

// ============ ESCAPE CONFIG (Phase 10 - A Fuga) ============
// Default values - actual config loaded from server per level
let ESCAPE_CONFIG = {
    // Mega Tank Boss properties
    bossStartX: -200,            // Começa fora da tela
    bossWidth: 180,              // Largura do boss
    bossHeight: canvas.height,   // Ocupa toda a altura
    bossSpeed: 0.45,             // Velocidade inicial (70% mais lento)
    bossMaxSpeed: 1.2,           // Velocidade máxima (70% mais lento)
    bossAcceleration: 0.0006,    // Aceleração por frame (70% mais lento)
    bossHP: 3000,                // HP do boss
    
    // Soldados inimigos (reduzidos)
    soldierSpawnRate: 300,       // Frames entre spawns de soldados (mais lento)
    maxSoldiers: 3,              // Máximo de soldados simultâneos (reduzido)
    soldierDamageMultiplier: 0.3,// Soldados causam 70% menos dano nesta fase
    
    // Balanceamento do jogador (BUFFADO!)
    playerHPMultiplier: 3.0,     // Jogador tem 200% mais HP nesta fase (3x)
    playerDamageMultiplier: 2.0, // Jogador causa 100% mais dano (2x)
    playerSpeedBoost: 1.8,       // Multiplicador de velocidade aumentado
    
    // Powerups (mais frequentes e variados)
    healPowerupRate: 300,        // Spawn powerup a cada 300 frames (~5s)
    powerupTypes: ['heal', 'shield', 'multiShot', 'doubleDamage', 'speedBoost'],
    
    // Player constraints
    deathZoneBuffer: 30,         // Distância do boss = morte
    
    // Scroll e movimento
    scrollSpeed: 3,              // Velocidade do scroll de fundo
    
    // Obstáculos
    obstacleSpawnRate: 80,       // Frames entre obstáculos
    obstacleTypes: ['crate', 'wall', 'barrel', 'sandbag'],
    
    // Physics (side-scroller)
    gravity: 0.7,
    jumpForce: -14,
    groundY: 550,                // Linha do chão
    
    // Visual
    treesPerLayer: 8,
    buildingsCount: 4
};

// Escape level state
let escapeBossX = ESCAPE_CONFIG.bossStartX;
let escapeBossHP = ESCAPE_CONFIG.bossHP;
let escapeBossMaxHP = ESCAPE_CONFIG.bossHP;
let escapeBossSpeed = ESCAPE_CONFIG.bossSpeed;
let escapeScrollX = 0;
let escapeObstacles = [];
let escapeNextObstacle = 60;
let escapeNextSoldier = 180;     // Timer para spawn de soldados
let escapeNextHealPowerup = 300; // Timer para spawn de powerup de cura
let escapeDebris = [];           // Destroços/partículas
let escapeTrees = [];            // Árvores de fundo
let escapeBuildings = [];        // Prédios sendo destruídos

// Powerup types - loaded from server
let powerupTypes = [
    { name: 'MUNIÇÃO INFINITA', icon: '🎯', color: '#ffd700', duration: 600, effect: 'infiniteAmmo', msg: 'MUNIÇÃO INFINITA!' },
    { name: 'ESCUDO', icon: '🛡️', color: '#00ffff', duration: 480, effect: 'shield', msg: 'ESCUDO ATIVADO!' },
    { name: 'MULTI-TIRO', icon: '🔱', color: '#ff0066', duration: 540, effect: 'multiShot', msg: 'TIRO MÚLTIPLO!' },
    { name: 'VELOCIDADE', icon: '⚡', color: '#00ff00', duration: 480, effect: 'speedBoost', msg: 'VELOCIDADE MÁXIMA!' },
    { name: 'DANO DUPLO', icon: '💥', color: '#aa00ff', duration: 420, effect: 'doubleDamage', msg: 'DANO DUPLO!' },
    { name: 'CURA +50%', icon: '❤️', color: '#ff4444', duration: 0, effect: 'heal', msg: '+50% HP!' },
    { name: 'CONGELAR', icon: '❄️', color: '#88ddff', duration: 540, effect: 'slowEnemies', msg: 'INIMIGOS LENTOS!' }
];

// Initialize powerups from server
function initPowerupsFromServer() {
    const serverPowerups = DataLoader.getPowerups();
    if (serverPowerups && serverPowerups.length > 0) {
        powerupTypes = serverPowerups.map(p => ({
            name: p.name,
            icon: p.icon,
            color: p.color,
            duration: p.duration,
            effect: p.effect,
            msg: p.message
        }));
        console.log('📊 Initialized', powerupTypes.length, 'powerups from server');
    }
}

let currentLevelIndex = 0;
let levelProgress = 0;
let bossSpawned = false;
let survivalFrameCounter = 0;
let survivalStarted = false; // Flag para saber se o timer survival já iniciou

// ============ ESCAPE ROUTE CONFIG (Phase 11) ============
// Default values - actual config loaded from server per level
let ESCAPE_ROUTE_CONFIG = {
    // Duração e progresso
    totalDuration: 90 * 60,      // 90 segundos em frames
    trackLength: 8000,           // Comprimento total da pista
    
    // Jipe (posição fixa na tela, apenas move lateralmente)
    jeepScreenY: 500,            // Posição Y fixa do jipe na tela
    jeepWidth: 60,
    jeepHeight: 90,
    jeepMaxSpeed: 12,
    jeepAcceleration: 0.3,
    jeepBrakeForce: 0.5,
    jeepHP: 100,
    jeepLateralSpeed: 8,         // Velocidade de movimento lateral
    
    // Física de terreno
    terrain: {
        asphalt: { friction: 0.98, speedMult: 1.0 },
        sand: { friction: 0.90, speedMult: 0.5 },
        oil: { friction: 0.995, speedMult: 0.8, driftDuration: 60 }
    },
    
    // Pista - perspectiva de corrida
    roadWidth: 400,              // Largura da pista no fundo
    horizonY: 180,               // Linha do horizonte
    
    // Curvas da pista
    curveFrequency: 0.003,
    curveAmplitude: 200,
    
    // Obstáculos
    mineSpawnRate: 150,
    oilSpawnRate: 250,
    truckSpawnRate: 200,
    barrierSpawnRate: 180,
    
    // Inimigos
    rpgSoldierSpawnRate: 300,
    rpgRocketSpeed: 6,
    rpgDamage: 20,
    
    // Dano
    mineDamage: 35,
    collisionDamage: 15,
    offRoadDamage: 0.5,
    
    // Scroll
    baseScrollSpeed: 4,
    maxScrollSpeed: 7
};

// Escape Route level state
let erProgress = 0;
let erJeepX = 450;
let erJeepSpeed = 0;
let erJeepAngle = 0;
let erJeepHP = 100;
let erScrollOffset = 0;
let erCurrentTerrain = 'asphalt';
let erDrifting = false;
let erDriftTimer = 0;
let erDriftDirection = 0;
let erDriftVelocityX = 0;
let erMines = [];
let erOilPools = [];
let erBarriers = [];
let erTrucks = [];
let erRpgSoldiers = [];
let erRockets = [];
let erRoadSegments = [];
let erExplosions = [];
let erConcreteBarriers = [];
let erWarningTexts = [];
let erEdgeTimer = 0; // Tempo que o jogador está nas extremidades

// ============ SNIPER CONFIG (Phase 12) ============
// Default values - actual config loaded from server per level
let SNIPER_CONFIG = {
    // Arma
    bulletDamage: 100,           // Dano por tiro (one-shot kill na maioria)
    reloadTime: 90,              // Frames para recarregar (1.5s a 60fps)
    maxAmmo: 5,                  // Tiros antes de recarregar
    recoilKick: 15,              // Pixels que a mira "pula" ao atirar
    recoilRecovery: 0.85,        // Velocidade de recuperação do recuo
    
    // Mira
    breathSwayAmount: 12,        // Amplitude do balanço ao respirar
    breathSwaySpeed: 0.04,       // Velocidade do balanço
    holdBreathDuration: 180,     // 3 segundos de mira estável
    holdBreathCooldown: 120,     // 2 segundos de cooldown após segurar
    
    // Spawning de alvos
    baseSpawnRate: 150,          // Frames entre spawns iniciais
    minSpawnRate: 60,            // Spawn rate mínimo (dificuldade máxima)
    maxTargets: 8,               // Máximo de alvos simultâneos
    targetMoveSpeed: 1.2,        // Velocidade base dos alvos
    targetExposureTime: 300,     // Tempo que alvo fica exposto (5s)
    minExposureTime: 120,        // Tempo mínimo de exposição (2s)
    
    // Tipos de alvo
    targetTypes: ['soldier', 'officer', 'runner'],
    civilianChance: 0.15,        // 15% de chance de civil aparecer
    
    // Pontuação
    headshotMultiplier: 2.5,     // Multiplicador de headshot
    missedShotPenalty: -25,      // Penalidade por errar
    civilianPenalty: -200,       // Penalidade por acertar civil
    escapedPenalty: -50,         // Penalidade por alvo escapar
    
    // Bônus de dificuldade
    killStreakBonus: [0, 0, 50, 100, 150, 200, 300], // Bônus por kills seguidos
    
    // Objetivos
    targetKills: 25,             // Eliminações para vencer
    timeLimit: 120,              // Segundos (2 minutos)
    
    // Dificuldade progressiva (milestones de kills)
    difficultyTiers: [
        { kills: 0,  spawnRate: 150, exposure: 300, moveChance: 0.3, speedMult: 1.0 },
        { kills: 10, spawnRate: 120, exposure: 240, moveChance: 0.5, speedMult: 1.3 },
        { kills: 15, spawnRate: 90,  exposure: 180, moveChance: 0.6, speedMult: 1.5 },
        { kills: 20, spawnRate: 70,  exposure: 150, moveChance: 0.7, speedMult: 1.8 }
    ],
    
    // Visual
    crosshairColor: '#ff0000',
    scopeRadius: 280,            // Raio da mira do scope
    tracerDuration: 8,           // Frames que o tracer fica visível
    
    // Spawn positions (zonas onde inimigos aparecem)
    spawnZones: [
        { x: 50, y: 280, w: 120, h: 200 },   // Esquerda baixa
        { x: 200, y: 200, w: 150, h: 180 },  // Centro-esquerda
        { x: 400, y: 220, w: 100, h: 160 },  // Centro
        { x: 550, y: 180, w: 150, h: 200 },  // Centro-direita
        { x: 730, y: 260, w: 120, h: 180 }   // Direita baixa
    ]
};

// Sniper level state
let sniperKills = 0;
let sniperMissedShots = 0;
let sniperCivilianHits = 0;
let sniperAmmo = 5;
let sniperReloading = false;
let sniperReloadTimer = 0;
let sniperBreathHeld = false;
let sniperBreathTimer = 0;
let sniperBreathCooldown = 0;
let sniperTargets = [];
let sniperCrosshairX = 450;
let sniperCrosshairY = 325;
let sniperSway = { x: 0, y: 0 };
let sniperRecoil = { x: 0, y: 0 };
let sniperKillStreak = 0;
let sniperTimeRemaining = 0;
let sniperTracers = [];          // Linhas de tracer dos tiros
let sniperCurrentTier = 0;       // Tier de dificuldade atual

// Countdown and transition variables
let countdownTimer = 0;
let countdownNumber = 3;
let levelTransition = false;
let transitionTimer = 0;
let transitionFadeAlpha = 0;

// Powerup constants - can be overridden by server
let POWERUP_LIFETIME = 600;
let POWERUP_BLINK_START = 180;

// Input handling
const keys = { w: false, W: false, a: false, A: false, s: false, S: false, d: false, D: false, r: false, R: false, ' ': false, Shift: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let mouseX = 0, mouseY = 0;
let mouseDown = false;

// ============ SERVER DATA INTEGRATION ============

// Load level configuration from server and update phase configs
async function loadLevelConfigFromServer(levelId) {
    console.log(`📥 Loading level ${levelId} config from server...`);
    
    try {
        const levelConfig = await DataLoader.loadLevel(levelId, (progress, status) => {
            console.log(`⏳ ${status} (${progress}%)`);
        });
        
        if (!levelConfig) {
            console.warn(`⚠️ No config found for level ${levelId}`);
            return false;
        }
        
        // Update phase-specific configs based on level type
        updatePhaseConfig(levelConfig);
        
        console.log(`✅ Level ${levelId} config loaded:`, levelConfig.name);
        return levelConfig;
        
    } catch (error) {
        console.error(`❌ Failed to load level ${levelId}:`, error);
        return null;
    }
}

// Update phase-specific configuration from server data
function updatePhaseConfig(levelConfig) {
    const type = levelConfig.type;
    const config = levelConfig.config;
    
    switch (type) {
        case 'train':
            if (config) {
                TRAIN_CONFIG = { ...TRAIN_CONFIG, ...config };
                if (levelConfig.physics) {
                    TRAIN_CONFIG.gravity = levelConfig.physics.gravity;
                    TRAIN_CONFIG.jumpForce = levelConfig.physics.jumpForce;
                    TRAIN_CONFIG.groundY = levelConfig.physics.groundY;
                }
            }
            break;
            
        case 'winter':
            if (config) {
                WINTER_CONFIG = { ...WINTER_CONFIG, ...config };
            }
            break;
            
        case 'skyfortress':
            if (config) {
                SKYFORTRESS_CONFIG = { ...SKYFORTRESS_CONFIG, ...config };
            }
            break;
            
        case 'shmup':
            if (config) {
                SHMUP_CONFIG = { ...SHMUP_CONFIG, ...config };
            }
            break;
            
        case 'escape':
            if (config) {
                ESCAPE_CONFIG = { ...ESCAPE_CONFIG, ...config };
            }
            break;
            
        case 'escaperoute':
            if (config) {
                ESCAPE_ROUTE_CONFIG = { ...ESCAPE_ROUTE_CONFIG, ...config };
                if (levelConfig.terrain) {
                    ESCAPE_ROUTE_CONFIG.terrain = levelConfig.terrain;
                }
            }
            break;
            
        case 'sniper':
            if (config) {
                SNIPER_CONFIG = { ...SNIPER_CONFIG, ...config };
            }
            break;
    }
    
    // Update powerup constants if provided
    const powerupConfig = DataLoader.getPowerupConfig();
    if (powerupConfig) {
        POWERUP_LIFETIME = powerupConfig.lifetime;
        POWERUP_BLINK_START = powerupConfig.blinkStart;
    }
}

// Get spawning configuration for current level
function getLevelSpawningConfig() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.spawning) {
        return levelConfig.spawning;
    }
    return null;
}

// Get waves configuration for current level
function getLevelWaves() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.waves) {
        return levelConfig.waves;
    }
    return [];
}

// Get level modifiers (damage multipliers, etc.)
function getLevelModifiers() {
    const levelConfig = DataLoader.getLevelConfig(currentLevelIndex + 1);
    if (levelConfig && levelConfig.modifiers) {
        return levelConfig.modifiers;
    }
    return {
        playerDamageMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemySpeedMultiplier: 1.0
    };
}
