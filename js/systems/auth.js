// ============ PIXEL WAR AUTH MODULE ============
// Client-side authentication and ranking integration
// Works with DataLoader for API communication
// v1.2.0 - Server-only storage (no localStorage for scores/progress)

const AuthManager = {
    // Storage keys - ONLY for auth token
    TOKEN_KEY: 'pixelWarAuthToken',
    
    // Cached user data (in memory only)
    currentUser: null,
    token: null,
    cachedProgress: null, // In-memory cache for progress
    cachedHighScore: 0,   // In-memory cache for high score
    
    // API base URL (uses DataLoader's URL detection)
    get apiUrl() {
        if (typeof DataLoader !== 'undefined' && DataLoader.serverUrl) {
            return DataLoader.serverUrl;
        }
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : 'https://api.nutef.com/api';
    },
    
    // ============ INITIALIZATION ============
    init() {
        // Load saved token only
        this.token = localStorage.getItem(this.TOKEN_KEY);
        
        // Verify token is still valid and get user data from server
        if (this.token) {
            this.verifySession().then(userData => {
                if (userData) {
                    // Load user's high score and check for saved progress
                    this.loadHighScoreFromServer();
                    this.checkProgressFromServer();
                }
            });
        }
        
        console.log('🔐 AuthManager initialized', this.token ? '(has token)' : '(not logged in)');
    },
    
    // ============ AUTH STATE ============
    isLoggedIn() {
        return !!this.token && !!this.currentUser;
    },
    
    getUser() {
        return this.currentUser;
    },
    
    getToken() {
        return this.token;
    },
    
    // ============ API HELPERS ============
    async fetchAPI(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add auth token if available
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Try to parse JSON safely; if not JSON, return full text for debugging
            const text = await response.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                // Not JSON - log for debugging
                console.warn(`fetchAPI: response for ${url} is not JSON. status=${response.status}`);
                console.warn(text.slice(0, 1000));
            }

            // Handle auth errors
            if (response.status === 401) {
                this.handleAuthError();
                throw new Error((data && data.error) || 'Sessão expirada');
            }

            if (!response.ok) {
                const errMsg = (data && (data.error || data.message)) || `HTTP ${response.status}`;
                throw new Error(errMsg);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error('Erro de conexão com o servidor');
            }
            throw error;
        }
    },
    
    handleAuthError() {
        // Clear invalid session
        this.token = null;
        this.currentUser = null;
        this.cachedProgress = null;
        this.cachedHighScore = 0;
        localStorage.removeItem(this.TOKEN_KEY);
        
        // Dispatch event for UI update
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: false } }));
    },
    
    // ============ LOAD HIGH SCORE FROM SERVER ============
    async loadHighScoreFromServer() {
        if (!this.isLoggedIn()) return;
        
        try {
            const rankings = await RankingManager.getMyRankings();
            if (rankings && rankings.bestScore) {
                this.cachedHighScore = rankings.bestScore;
                console.log('🏆 High score carregado do servidor:', this.cachedHighScore);
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar high score do servidor');
        }
    },
    
    // ============ CHECK PROGRESS FROM SERVER ============
    async checkProgressFromServer() {
        if (!this.isLoggedIn()) return null;
        
        // Try multiple endpoints in order for compatibility
        const endpoints = ['/progress/check', '/progress/load'];
        for (const ep of endpoints) {
            try {
                const data = await this.fetchAPI(ep);
                if (!data) continue;

                // Normalize responses that return summary/hasProgress or progress directly
                if (data.hasProgress || data.progress || data.summary) {
                    const summary = data.summary || data.progress || (data.progress ? data.progress : null);
                    // If the endpoint returns full progress, build a summary
                    const progressSummary = data.summary || (data.progress && {
                        level: data.progress.level,
                        score: data.progress.score,
                        playerClass: data.progress.playerClass,
                        savedAt: data.progress.timestamp || data.progress.savedAt
                    }) || data.progress || data;

                    this.cachedProgress = progressSummary;
                    console.log(`📂 Progresso carregado via ${ep}:`, progressSummary);
                    window.dispatchEvent(new CustomEvent('progressFound', { detail: progressSummary }));
                    return { hasProgress: true, progress: progressSummary };
                }

                // If data seems like full progress directly
                if (data.level && data.score) {
                    this.cachedProgress = data;
                    console.log(`📂 Progresso carregado via ${ep}:`, data);
                    window.dispatchEvent(new CustomEvent('progressFound', { detail: data }));
                    return { hasProgress: true, progress: data };
                }

            } catch (err) {
                // Silent fail for 401/404 - user may not have progress yet
                if (err.message && (err.message.includes('401') || err.message.includes('expirada'))) {
                    console.log('ℹ️ Verificação de progresso requer autenticação');
                } else {
                    console.log(`ℹ️ Endpoint ${ep}: ${err.message}`);
                }
                // continue to next endpoint
            }
        }

        console.log('ℹ️ Nenhum progresso salvo encontrado');
        return null;
    },
    
    // ============ REGISTRATION ============
    async register(username, email, password, displayName = null) {
        const data = await this.fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                email,
                password,
                displayName
            })
        });
        
        // Save session (token only in localStorage)
        this.token = data.token;
        this.currentUser = data.user;
        
        localStorage.setItem(this.TOKEN_KEY, this.token);
        
        localStorage.setItem(this.TOKEN_KEY, this.token);
        
        // Load user data from server (with await to ensure token is used)
        await this.loadHighScoreFromServer();
        await this.checkProgressFromServer();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true, user: this.currentUser } }));
        
        return data;
    },
    
    // ============ LOGIN ============
    async login(login, password) {
        const data = await this.fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                login,
                password
            })
        });
        
        // Save session (token only in localStorage)
        this.token = data.token;
        this.currentUser = data.user;
        
        localStorage.setItem(this.TOKEN_KEY, this.token);
        
        // Load user data from server (with await to ensure token is used)
        await this.loadHighScoreFromServer();
        await this.checkProgressFromServer();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true, user: this.currentUser, profile: data.profile } }));
        
        return data;
    },
    
    // ============ LOGOUT ============
    async logout() {
        try {
            if (this.token) {
                await this.fetchAPI('/auth/logout', { method: 'POST' });
            }
        } catch {
            // Ignore errors, clear local session anyway
        }
        
        this.token = null;
        this.currentUser = null;
        this.cachedProgress = null;
        this.cachedHighScore = 0;
        
        localStorage.removeItem(this.TOKEN_KEY);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: false } }));
    },
    
    // ============ VERIFY SESSION ============
    async verifySession() {
        try {
            const data = await this.fetchAPI('/auth/me');
            this.currentUser = {
                id: data.id,
                username: data.username,
                displayName: data.displayName,
                email: data.email
            };
            return data;
        } catch {
            this.handleAuthError();
            return null;
        }
    },
    
    // ============ UPDATE PROFILE ============
    async updateProfile(displayName) {
        const data = await this.fetchAPI('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({ displayName })
        });
        
        if (data.user) {
            this.currentUser = { ...this.currentUser, ...data.user };
        }
        
        return data;
    },
    
    // ============ PROGRESS SAVE/LOAD (SERVER API) ============
    async saveProgress(gameData) {
        if (!this.isLoggedIn()) {
            console.warn('⚠️ Precisa estar logado para salvar progresso');
            return null;
        }
        
        const progress = {
            level: gameData.level,
            score: gameData.score,
            playerClass: gameData.playerClass,
            hp: gameData.hp || 100,
            maxHp: gameData.maxHp || 100,
            damage: gameData.damage || 10,
            fireRate: gameData.fireRate || 1,
            kills: gameData.kills || 0,
            deaths: gameData.deaths || 0
        };
        
        try {
            const result = await this.fetchAPI('/progress/save', {
                method: 'POST',
                body: JSON.stringify(progress)
            });
            
            this.cachedProgress = { ...progress, timestamp: Date.now() };
            console.log('💾 Progresso salvo no servidor:', progress);
            return result;
        } catch (error) {
            console.error('❌ Erro ao salvar progresso:', error.message);
            throw error;
        }
    },
    
    async loadProgress() {
        if (!this.isLoggedIn()) {
            return null;
        }
        
        try {
            const data = await this.fetchAPI('/progress/load');
            if (data.hasProgress) {
                this.cachedProgress = data.progress;
                console.log('📂 Progresso carregado do servidor:', data.progress);
                return data.progress;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar progresso:', error.message);
        }
        return null;
    },
    
    async clearProgress() {
        if (!this.isLoggedIn()) return;
        
        try {
            await this.fetchAPI('/progress/clear', { method: 'DELETE' });
            this.cachedProgress = null;
            console.log('🗑️ Progresso removido do servidor');
        } catch (error) {
            console.error('❌ Erro ao limpar progresso:', error.message);
        }
    },
    
    hasProgress() {
        return this.cachedProgress !== null;
    },
    
    getCachedProgress() {
        return this.cachedProgress;
    },
    
    // ============ HIGH SCORE (from server) ============
    getHighScore() {
        return this.cachedHighScore || 0;
    },
    
    updateHighScoreIfBetter(score) {
        if (score > this.cachedHighScore) {
            this.cachedHighScore = score;
        }
    }
};

// ============ RANKING MANAGER ============
const RankingManager = {
    // Anti-cheat secret (obfuscated, but client-side so not truly secure)
    _secret: '1ba40912321ce96dd5706660aefb21ffcheat',
    
    // Get API URL from AuthManager
    get apiUrl() {
        return AuthManager.apiUrl;
    },
    
    // ============ CHECKSUM GENERATION ============
    async generateChecksum(score, playerClass, levelReached, duration) {
        const payload = `${score}-${playerClass}-${levelReached}-${duration}-${this._secret}`;
        return (await this.sha256(payload)).substring(0, 16);
    },
    
    // SHA256 implementation for checksum
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // ============ SUBMIT SCORE ============
    async submitScore(gameData) {
        const { score, playerClass, levelReached, isVictory, kills, deaths, duration } = gameData;
        
        // Generate checksum
        const checksum = await this.generateChecksum(score, playerClass, levelReached, duration);
        
        const response = await fetch(`${this.apiUrl}/ranking/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(AuthManager.token ? { 'Authorization': `Bearer ${AuthManager.token}` } : {})
            },
            body: JSON.stringify({
                score,
                playerClass,
                levelReached,
                isVictory,
                kills,
                deaths,
                duration,
                checksum
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao enviar score');
        }
        
        return data;
    },
    
    // ============ LEADERBOARDS ============
    async getLeaderboard(category = 'all', limit = 20, offset = 0) {
        const response = await fetch(
            `${this.apiUrl}/ranking/leaderboard/${category}?limit=${limit}&offset=${offset}`
        );
        
        if (!response.ok) {
            let errorMsg = 'Erro ao buscar ranking';
            try {
                const data = await response.json();
                errorMsg = data.error || errorMsg;
            } catch {
                errorMsg = `Servidor retornou: ${response.status}`;
            }
            throw new Error(errorMsg);
        }
        
        return await response.json();
    },
    
    async getLevelLeaderboard(levelId, limit = 10) {
        const response = await fetch(
            `${this.apiUrl}/ranking/level/${levelId}?limit=${limit}`
        );
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao buscar ranking do level');
        }
        
        return data;
    },
    
    async getMyRankings() {
        if (!AuthManager.isLoggedIn()) {
            throw new Error('Faça login para ver seus rankings');
        }
        
        const response = await fetch(`${this.apiUrl}/ranking/my-rankings`, {
            headers: {
                'Authorization': `Bearer ${AuthManager.token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao buscar seus rankings');
        }
        
        return data;
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        AuthManager.init();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, RankingManager };
}
