// ============ DATA LOADER - Remote Content Loading ============
// Sistema de carregamento de dados do servidor com cache local
// O motor roda no cliente, o combustível (dados) vem do servidor

const DataLoader = {
    // URL base do servidor (detecta ambiente automaticamente)
    serverUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://api.nutef.com/api',
    
    // Cache em memória (rápido)
    cache: {
        enemies: null,
        classes: null,
        powerups: null,
        levelsIndex: null,
        levels: new Map(),
        version: null
    },
    
    // ETags para cache HTTP 304
    etags: {
        enemies: null,
        classes: null,
        powerups: null,
        levelsIndex: null,
        levels: new Map()
    },
    
    // Estado de carregamento
    initialized: false,
    loading: false,
    error: null,
    
    // Callbacks de progresso
    onProgress: null,
    onError: null,
    
    // ============ STORAGE KEYS ============
    STORAGE_PREFIX: 'pixelwar_',
    STORAGE_VERSION: '1.0.0',
    
    // ============ LOCAL STORAGE HELPERS ============
    
    saveToStorage(key, data, etag) {
        try {
            const storageKey = this.STORAGE_PREFIX + key;
            const payload = {
                version: this.STORAGE_VERSION,
                etag: etag,
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));
            console.log(`💾 Saved to localStorage: ${key}`);
        } catch (e) {
            console.warn(`⚠️ Failed to save to localStorage: ${key}`, e);
        }
    },
    
    loadFromStorage(key) {
        try {
            const storageKey = this.STORAGE_PREFIX + key;
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            
            const payload = JSON.parse(raw);
            
            // Check version compatibility
            if (payload.version !== this.STORAGE_VERSION) {
                console.log(`🔄 Storage version mismatch for ${key}, clearing...`);
                localStorage.removeItem(storageKey);
                return null;
            }
            
            console.log(`📂 Loaded from localStorage: ${key}`);
            return payload;
        } catch (e) {
            console.warn(`⚠️ Failed to load from localStorage: ${key}`, e);
            return null;
        }
    },
    
    clearStorage() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ Cleared ${keys.length} cached items`);
    },
    
    // ============ FETCH HELPERS ============
    
    async fetchWithETag(endpoint, cacheKey) {
        const url = `${this.serverUrl}${endpoint}`;
        const headers = {};
        
        // Add ETag if we have one
        const storedEtag = this.etags[cacheKey];
        if (storedEtag) {
            headers['If-None-Match'] = storedEtag;
        }
        
        try {
            const response = await fetch(url, { headers });
            
            // 304 Not Modified - use cache
            if (response.status === 304) {
                console.log(`✅ Cache valid for: ${cacheKey}`);
                return { data: null, fromCache: true };
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Get new ETag
            const newEtag = response.headers.get('ETag');
            if (newEtag) {
                this.etags[cacheKey] = newEtag;
            }
            
            const data = await response.json();
            return { data, fromCache: false, etag: newEtag };
            
        } catch (error) {
            console.error(`❌ Fetch error for ${endpoint}:`, error);
            throw error;
        }
    },
    
    // ============ INITIALIZATION ============
    
    async init(progressCallback = null) {
        if (this.initialized) {
            console.log('⚡ DataLoader already initialized');
            return true;
        }
        
        if (this.loading) {
            console.log('⏳ DataLoader already loading...');
            return false;
        }
        
        this.loading = true;
        this.error = null;
        this.onProgress = progressCallback;
        
        console.log('🚀 DataLoader initializing...');
        
        try {
            // Try to load from localStorage first
            this.loadCachedData();
            
            // Update progress
            if (this.onProgress) this.onProgress(10, 'Connecting to server...');
            
            // Fetch all initial data
            const result = await this.fetchWithETag('/init', 'init');
            
            if (!result.fromCache && result.data) {
                // New data from server
                const { enemies, classes, powerups, levelsIndex } = result.data.data;
                
                this.cache.enemies = enemies;
                this.cache.classes = classes;
                this.cache.powerups = powerups;
                this.cache.levelsIndex = levelsIndex;
                this.cache.version = result.data.version;
                
                // Save to localStorage
                this.saveToStorage('enemies', enemies, result.etag);
                this.saveToStorage('classes', classes, result.etag);
                this.saveToStorage('powerups', powerups, result.etag);
                this.saveToStorage('levelsIndex', levelsIndex, result.etag);
                
                console.log('📥 Loaded fresh data from server');
            }
            
            if (this.onProgress) this.onProgress(100, 'Ready!');
            
            this.initialized = true;
            this.loading = false;
            
            console.log('✅ DataLoader initialized successfully');
            console.log('📊 Enemies:', Object.keys(this.cache.enemies?.enemies || {}).length);
            console.log('📊 Classes:', Object.keys(this.cache.classes?.classes || {}).length);
            console.log('📊 Levels:', this.cache.levelsIndex?.totalLevels || 0);
            
            return true;
            
        } catch (error) {
            this.error = error;
            this.loading = false;
            
            console.error('❌ DataLoader initialization failed:', error);
            
            // Check if we have cached data to fall back to
            if (this.cache.enemies && this.cache.classes && this.cache.levelsIndex) {
                console.log('⚠️ Using cached data as fallback');
                this.initialized = true;
                return true;
            }
            
            if (this.onError) this.onError(error);
            throw error;
        }
    },
    
    loadCachedData() {
        // Try to restore from localStorage
        const enemies = this.loadFromStorage('enemies');
        const classes = this.loadFromStorage('classes');
        const powerups = this.loadFromStorage('powerups');
        const levelsIndex = this.loadFromStorage('levelsIndex');
        
        if (enemies) {
            this.cache.enemies = enemies.data;
            this.etags.enemies = enemies.etag;
        }
        if (classes) {
            this.cache.classes = classes.data;
            this.etags.classes = classes.etag;
        }
        if (powerups) {
            this.cache.powerups = powerups.data;
            this.etags.powerups = powerups.etag;
        }
        if (levelsIndex) {
            this.cache.levelsIndex = levelsIndex.data;
            this.etags.levelsIndex = levelsIndex.etag;
        }
        
        console.log('📂 Restored cache from localStorage');
    },
    
    // ============ LEVEL DATA ============
    
    async loadLevel(levelId, progressCallback = null) {
        // Check memory cache first
        if (this.cache.levels.has(levelId)) {
            console.log(`⚡ Level ${levelId} from memory cache`);
            return this.cache.levels.get(levelId);
        }
        
        // Check localStorage
        const stored = this.loadFromStorage(`level_${levelId}`);
        if (stored) {
            this.cache.levels.set(levelId, stored.data);
            this.etags.levels.set(levelId, stored.etag);
        }
        
        if (progressCallback) progressCallback(30, `Loading level ${levelId}...`);
        
        try {
            const result = await this.fetchWithETag(`/level/${levelId}`, `level_${levelId}`);
            
            if (!result.fromCache && result.data) {
                // New level data
                this.cache.levels.set(levelId, result.data);
                this.etags.levels.set(levelId, result.etag);
                this.saveToStorage(`level_${levelId}`, result.data, result.etag);
                console.log(`📥 Level ${levelId} loaded from server`);
            }
            
            if (progressCallback) progressCallback(100, 'Level loaded!');
            
            return this.cache.levels.get(levelId);
            
        } catch (error) {
            console.error(`❌ Failed to load level ${levelId}:`, error);
            
            // Return cached version if available
            if (this.cache.levels.has(levelId)) {
                console.log(`⚠️ Using cached level ${levelId}`);
                return this.cache.levels.get(levelId);
            }
            
            throw error;
        }
    },
    
    // ============ GETTERS ============
    
    getEnemyStats(type) {
        if (!this.cache.enemies?.enemies) {
            console.warn('⚠️ Enemies not loaded, using defaults');
            return null;
        }
        return this.cache.enemies.enemies[type] || null;
    },
    
    getClassStats(type) {
        if (!this.cache.classes?.classes) {
            console.warn('⚠️ Classes not loaded, using defaults');
            return null;
        }
        return this.cache.classes.classes[type] || null;
    },
    
    getPowerups() {
        return this.cache.powerups?.powerups || [];
    },
    
    getPowerupConfig() {
        return {
            lifetime: this.cache.powerups?.lifetime || 600,
            blinkStart: this.cache.powerups?.blinkStart || 180
        };
    },
    
    getLevelsIndex() {
        return this.cache.levelsIndex?.levels || [];
    },
    
    getTotalLevels() {
        return this.cache.levelsIndex?.totalLevels || 12;
    },
    
    getLevelConfig(levelId) {
        return this.cache.levels.get(levelId) || null;
    },
    
    // ============ HELPERS ============
    
    isReady() {
        return this.initialized && !this.loading;
    },
    
    hasError() {
        return this.error !== null;
    },
    
    getError() {
        return this.error;
    }
};

// ============ LOADING SCREEN UI ============
const LoadingScreen = {
    element: null,
    progressBar: null,
    statusText: null,
    
    show() {
        if (!this.element) {
            this.create();
        }
        this.element.style.display = 'flex';
    },
    
    hide() {
        if (this.element) {
            this.element.style.opacity = '0';
            setTimeout(() => {
                this.element.style.display = 'none';
                this.element.style.opacity = '1';
            }, 300);
        }
    },
    
    create() {
        this.element = document.createElement('div');
        this.element.id = 'loading-screen';
        this.element.innerHTML = `
            <div class="loading-content">
                <div class="loading-title">⚔️ PIXEL WAR ⚔️</div>
                <div class="loading-subtitle">CARREGANDO DADOS...</div>
                <div class="loading-bar-container">
                    <div class="loading-bar-fill" id="loading-bar-fill"></div>
                </div>
                <div class="loading-status" id="loading-status">Conectando ao servidor...</div>
                <div class="loading-tip">Dica: Use WASD para mover e mouse para atirar!</div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                transition: opacity 0.3s ease;
            }
            .loading-content {
                text-align: center;
                font-family: 'Courier New', monospace;
            }
            .loading-title {
                font-size: 48px;
                color: #ffd700;
                text-shadow: 3px 3px 0 #000, 0 0 20px #ffd700;
                margin-bottom: 10px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            .loading-subtitle {
                font-size: 18px;
                color: #88ddff;
                margin-bottom: 30px;
                letter-spacing: 3px;
            }
            .loading-bar-container {
                width: 400px;
                height: 30px;
                background: #0a0a0a;
                border: 3px solid #333;
                border-radius: 5px;
                overflow: hidden;
                margin: 0 auto 20px;
                box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
            }
            .loading-bar-fill {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #00ff00, #88ff00, #ffff00);
                transition: width 0.3s ease;
                box-shadow: 0 0 10px #00ff00;
            }
            .loading-status {
                font-size: 14px;
                color: #aaa;
                margin-bottom: 20px;
            }
            .loading-tip {
                font-size: 12px;
                color: #666;
                font-style: italic;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.element);
        
        this.progressBar = document.getElementById('loading-bar-fill');
        this.statusText = document.getElementById('loading-status');
    },
    
    updateProgress(percent, status) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        if (this.statusText && status) {
            this.statusText.textContent = status;
        }
    },
    
    showError(message) {
        if (this.statusText) {
            this.statusText.style.color = '#ff4444';
            this.statusText.textContent = `❌ ${message}`;
        }
    }
};

// ============ GLOBAL INITIALIZATION ============
async function initializeGameData() {
    LoadingScreen.show();
    
    try {
        await DataLoader.init((progress, status) => {
            LoadingScreen.updateProgress(progress, status);
        });
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        LoadingScreen.hide();
        console.log('🎮 Game data ready!');
        return true;
        
    } catch (error) {
        LoadingScreen.showError('Falha ao conectar ao servidor. Tente novamente.');
        console.error('❌ Game initialization failed:', error);
        return false;
    }
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader, LoadingScreen, initializeGameData };
}
