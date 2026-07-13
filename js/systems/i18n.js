// ============ INTERNATIONALIZATION (i18n) SYSTEM ============
// Sistema de tradução Português/Inglês para Pixel War Ultimate

const I18n = {
    currentLang: 'pt',
    
    translations: {
        pt: {
            // ============ MENU PRINCIPAL ============
            menu: {
                title: 'PIXEL WAR',
                subtitle: 'ULTIMATE EDITION',
                play: '🚀 NOVA MISSÃO',
                continue: '📂 CONTINUAR JOGO',
                login: '🔑 Login',
                register: '📝 Criar Conta',
                logout: 'Sair',
                ranking: '🏆 Ranking Global',
                greeting: 'Olá',
                description: 'Selecione sua unidade e complete as missões para vencer a guerra!',
                bonusHint: '💎 CAIXAS DE BÔNUS spawnam a cada 5-8 segundos!',
                audioHint: '🎵 Áudio ativado ao clicar em INICIAR!',
                devMode: '🔧 DEV MODE - Selecionar Fase'
            },
            
            // ============ HUD ============
            hud: {
                status: 'Status',
                hp: 'HP',
                ammo: 'MUNIÇÃO',
                reloading: 'RECARREGANDO...',
                score: 'Score',
                phase: 'FASE',
                objective: 'Objetivo',
                defaultObjective: 'Sobreviva e elimine os inimigos',
                volume: 'Volume',
                offscreenIndicators: 'Indicadores Off-screen'
            },
            
            // ============ CLASSES ============
            classes: {
                soldier: 'SOLDADO',
                tank: 'TANQUE',
                plane: 'AVIÃO',
                ship: 'NAVIO',
                hp: 'HP',
                damage: 'DANO',
                speed: 'VEL',
                shot: 'TIRO',
                high: 'Alto',
                medium: 'Médio',
                low: 'Baixo',
                fast: 'Rápido',
                slow: 'Lento',
                veryFast: 'Muito Rápido',
                simple: 'Simples',
                triple: 'Triplo'
            },
            
            // ============ UPGRADES ============
            upgrades: {
                title: '🎖️ MISSÃO CUMPRIDA!',
                subtitle: 'Escolha um upgrade para continuar:',
                health: 'REPARO COMPLETO',
                healthDesc: 'Cura + Aumenta HP Máximo',
                damage: 'PODER DE FOGO',
                damageDesc: 'Aumenta dano de ataque',
                speed: 'VELOCIDADE',
                speedDesc: 'Reduz tempo entre tiros'
            },
            
            // ============ TELA DE TROCA DE CLASSE ============
            classChange: {
                title: '🔄 PRÓXIMA MISSÃO',
                phaseSelect: 'Fase {0} - Escolha sua unidade:',
                confirm: '✅ CONFIRMAR E INICIAR'
            },
            
            // ============ GAME OVER ============
            gameOver: {
                title: '💀 MISSÃO FALHOU',
                finalScore: 'SCORE FINAL',
                retry: '🔄 TENTAR NOVAMENTE'
            },
            
            // ============ VITÓRIA ============
            victory: {
                title: '🏆 GUERRA VENCIDA!',
                finalScore: 'SCORE FINAL',
                description: 'Você completou todas as operações com excelência!',
                playAgain: '🎮 JOGAR DE NOVO'
            },
            
            // ============ PAUSA ============
            pause: {
                title: '⏸️ PAUSADO',
                hint: 'Pressione ESC para continuar',
                currentScore: 'Score Atual:',
                phase: 'Fase:',
                record: 'Recorde:',
                continue: '▶️ CONTINUAR',
                save: '💾 SALVAR PROGRESSO',
                saveAndQuit: '🚪 SALVAR E SAIR'
            },
            
            // ============ AUTH ============
            auth: {
                loginTitle: '🔑 Login',
                registerTitle: '📝 Criar Conta',
                username: 'Username ou Email',
                usernameOnly: 'Username',
                email: 'Email',
                password: 'Senha',
                displayName: 'Nome de Exibição (opcional)',
                displayNameHint: 'Como quer ser chamado?',
                minChars: 'Mínimo 6 caracteres',
                enter: 'Entrar',
                createAccount: 'Criar Conta',
                noAccount: 'Não tem conta?',
                hasAccount: 'Já tem conta?',
                createLink: 'Criar conta',
                loginLink: 'Fazer login'
            },
            
            // ============ LEADERBOARD ============
            leaderboard: {
                title: '🏆 Ranking Global',
                all: 'Geral',
                weekly: 'Semanal',
                daily: 'Hoje',
                position: '#',
                player: 'Jogador',
                score: 'Score',
                class: 'Classe',
                level: 'Fase',
                date: 'Data',
                loading: 'Carregando...',
                empty: 'Nenhum score registrado ainda.',
                error: 'Erro ao carregar ranking.',
                yourPosition: 'Sua posição:',
                bestScore: 'Melhor score:'
            },
            
            // ============ CONTROLES ============
            controls: {
                move: 'Movimentar',
                shoot: 'Atirar'
            },
            
            // ============ LOADING ============
            loading: {
                initializing: 'Inicializando...',
                configuring: 'Configurando jogo...',
                loadingPhase: 'Carregando fase {0}...',
                ready: 'Pronto!',
                connectionError: 'Falha ao conectar ao servidor. Usando dados offline.'
            },
            
            // ============ POWERUPS ============
            powerups: {
                speed: 'VELOCIDADE',
                damage: 'DANO',
                shield: 'ESCUDO',
                rapidFire: 'TIRO RÁPIDO',
                health: 'VIDA'
            },
            
            // ============ NOTIFICAÇÕES ============
            notifications: {
                loginSuccess: 'Login realizado!',
                registerSuccess: 'Conta criada e login realizado!',
                saveSuccess: 'Progresso salvo!',
                saveFailed: 'Erro ao salvar progresso',
                scoreSubmitted: 'Score enviado!',
                nextPhase: 'PRÓXIMA FASE'
            },
            
            // ============ MENSAGENS DE JOGO ============
            game: {
                phase: 'FASE {0}',
                bossWarning: '⚠️ BOSS APPROACHING!',
                waveComplete: 'WAVE COMPLETE!',
                newWave: 'WAVE {0}',
                bonusTime: 'BONUS TIME!'
            }
        },
        
        en: {
            // ============ MAIN MENU ============
            menu: {
                title: 'PIXEL WAR',
                subtitle: 'ULTIMATE EDITION',
                play: '🚀 NEW MISSION',
                continue: '📂 CONTINUE GAME',
                login: '🔑 Login',
                register: '📝 Create Account',
                logout: 'Logout',
                ranking: '🏆 Global Ranking',
                greeting: 'Hello',
                description: 'Select your unit and complete the missions to win the war!',
                bonusHint: '💎 BONUS CRATES spawn every 5-8 seconds!',
                audioHint: '🎵 Audio enabled when you click START!',
                devMode: '🔧 DEV MODE - Select Phase'
            },
            
            // ============ HUD ============
            hud: {
                status: 'Status',
                hp: 'HP',
                ammo: 'AMMO',
                reloading: 'RELOADING...',
                score: 'Score',
                phase: 'PHASE',
                objective: 'Objective',
                defaultObjective: 'Survive and eliminate enemies',
                volume: 'Volume',
                offscreenIndicators: 'Off-screen Indicators'
            },
            
            // ============ CLASSES ============
            classes: {
                soldier: 'SOLDIER',
                tank: 'TANK',
                plane: 'PLANE',
                ship: 'SHIP',
                hp: 'HP',
                damage: 'DMG',
                speed: 'SPD',
                shot: 'SHOT',
                high: 'High',
                medium: 'Medium',
                low: 'Low',
                fast: 'Fast',
                slow: 'Slow',
                veryFast: 'Very Fast',
                simple: 'Simple',
                triple: 'Triple'
            },
            
            // ============ UPGRADES ============
            upgrades: {
                title: '🎖️ MISSION COMPLETE!',
                subtitle: 'Choose an upgrade to continue:',
                health: 'FULL REPAIR',
                healthDesc: 'Heal + Increase Max HP',
                damage: 'FIREPOWER',
                damageDesc: 'Increase attack damage',
                speed: 'SPEED',
                speedDesc: 'Reduce time between shots'
            },
            
            // ============ CLASS CHANGE SCREEN ============
            classChange: {
                title: '🔄 NEXT MISSION',
                phaseSelect: 'Phase {0} - Choose your unit:',
                confirm: '✅ CONFIRM AND START'
            },
            
            // ============ GAME OVER ============
            gameOver: {
                title: '💀 MISSION FAILED',
                finalScore: 'FINAL SCORE',
                retry: '🔄 TRY AGAIN'
            },
            
            // ============ VICTORY ============
            victory: {
                title: '🏆 WAR WON!',
                finalScore: 'FINAL SCORE',
                description: 'You completed all operations with excellence!',
                playAgain: '🎮 PLAY AGAIN'
            },
            
            // ============ PAUSE ============
            pause: {
                title: '⏸️ PAUSED',
                hint: 'Press ESC to continue',
                currentScore: 'Current Score:',
                phase: 'Phase:',
                record: 'Record:',
                continue: '▶️ CONTINUE',
                save: '💾 SAVE PROGRESS',
                saveAndQuit: '🚪 SAVE AND QUIT'
            },
            
            // ============ AUTH ============
            auth: {
                loginTitle: '🔑 Login',
                registerTitle: '📝 Create Account',
                username: 'Username or Email',
                usernameOnly: 'Username',
                email: 'Email',
                password: 'Password',
                displayName: 'Display Name (optional)',
                displayNameHint: 'How do you want to be called?',
                minChars: 'Minimum 6 characters',
                enter: 'Enter',
                createAccount: 'Create Account',
                noAccount: "Don't have an account?",
                hasAccount: 'Already have an account?',
                createLink: 'Create account',
                loginLink: 'Login'
            },
            
            // ============ LEADERBOARD ============
            leaderboard: {
                title: '🏆 Global Ranking',
                all: 'All Time',
                weekly: 'Weekly',
                daily: 'Today',
                position: '#',
                player: 'Player',
                score: 'Score',
                class: 'Class',
                level: 'Phase',
                date: 'Date',
                loading: 'Loading...',
                empty: 'No scores recorded yet.',
                error: 'Error loading ranking.',
                yourPosition: 'Your position:',
                bestScore: 'Best score:'
            },
            
            // ============ CONTROLS ============
            controls: {
                move: 'Move',
                shoot: 'Shoot'
            },
            
            // ============ LOADING ============
            loading: {
                initializing: 'Initializing...',
                configuring: 'Configuring game...',
                loadingPhase: 'Loading phase {0}...',
                ready: 'Ready!',
                connectionError: 'Failed to connect to server. Using offline data.'
            },
            
            // ============ POWERUPS ============
            powerups: {
                speed: 'SPEED',
                damage: 'DAMAGE',
                shield: 'SHIELD',
                rapidFire: 'RAPID FIRE',
                health: 'HEALTH'
            },
            
            // ============ NOTIFICATIONS ============
            notifications: {
                loginSuccess: 'Login successful!',
                registerSuccess: 'Account created and logged in!',
                saveSuccess: 'Progress saved!',
                saveFailed: 'Error saving progress',
                scoreSubmitted: 'Score submitted!',
                nextPhase: 'NEXT PHASE'
            },
            
            // ============ GAME MESSAGES ============
            game: {
                phase: 'PHASE {0}',
                bossWarning: '⚠️ BOSS APPROACHING!',
                waveComplete: 'WAVE COMPLETE!',
                newWave: 'WAVE {0}',
                bonusTime: 'BONUS TIME!'
            }
        }
    },
    
    // ============ INICIALIZAÇÃO ============
    init() {
        // Carregar idioma salvo ou detectar do navegador
        const savedLang = localStorage.getItem('pixelwar-lang');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        } else {
            // Detectar idioma do navegador
            const browserLang = navigator.language.substring(0, 2).toLowerCase();
            this.currentLang = (browserLang === 'pt') ? 'pt' : 'en';
        }
        
        // Atualizar HTML lang
        document.documentElement.lang = this.currentLang === 'pt' ? 'pt-br' : 'en';
        
        // Aplicar traduções iniciais
        this.updateAllTexts();
        
        console.log(`🌐 i18n initialized: ${this.currentLang}`);
    },
    
    // ============ OBTER TRADUÇÃO ============
    t(key, ...args) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        
        // Fallback para inglês se não encontrar
        if (value === undefined) {
            value = this.translations['en'];
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
        }
        
        // Retornar a key se não encontrar tradução
        if (value === undefined) {
            console.warn(`🌐 Translation missing: ${key}`);
            return key;
        }
        
        // Substituir placeholders {0}, {1}, etc.
        if (args.length > 0 && typeof value === 'string') {
            args.forEach((arg, index) => {
                value = value.replace(`{${index}}`, arg);
            });
        }
        
        return value;
    },
    
    // ============ MUDAR IDIOMA ============
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`🌐 Language not supported: ${lang}`);
            return;
        }
        
        this.currentLang = lang;
        localStorage.setItem('pixelwar-lang', lang);
        document.documentElement.lang = lang === 'pt' ? 'pt-br' : 'en';
        
        this.updateAllTexts();
        
        // Disparar evento para componentes que precisam atualizar
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        
        console.log(`🌐 Language changed to: ${lang}`);
    },
    
    // ============ ALTERNAR IDIOMA ============
    toggleLanguage() {
        const newLang = this.currentLang === 'pt' ? 'en' : 'pt';
        this.setLanguage(newLang);
    },
    
    // ============ ATUALIZAR TODOS OS TEXTOS ============
    updateAllTexts() {
        // Atualizar elementos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const params = el.dataset.i18nParams;
            
            if (params) {
                const args = params.split(',');
                el.textContent = this.t(key, ...args);
            } else {
                el.textContent = this.t(key);
            }
        });
        
        // Atualizar placeholders com data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });
        
        // Atualizar títulos com data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });
        
        // Atualizar indicador de idioma (in-game)
        const langIndicator = document.getElementById('current-lang');
        if (langIndicator) {
            langIndicator.textContent = this.currentLang.toUpperCase();
        }
        
        // Atualizar indicador de idioma (menu)
        const menuLangIndicator = document.getElementById('menu-current-lang');
        if (menuLangIndicator) {
            menuLangIndicator.textContent = this.currentLang.toUpperCase();
        }
    },
    
    // ============ OBTER IDIOMA ATUAL ============
    getCurrentLanguage() {
        return this.currentLang;
    },
    
    // ============ OBTER IDIOMAS DISPONÍVEIS ============
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
};

// Função global de atalho para traduções
function t(key, ...args) {
    return I18n.t(key, ...args);
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
