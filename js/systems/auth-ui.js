// ============ AUTH & LEADERBOARD UI HANDLERS ============
// Modal control and leaderboard display functions

// ============ AUTH STATE LISTENERS ============
window.addEventListener('authStateChanged', (e) => {
    updateAuthUI(e.detail.loggedIn, e.detail.user);
});

window.addEventListener('DOMContentLoaded', () => {
    // Update UI based on initial auth state
    setTimeout(() => {
        if (typeof AuthManager !== 'undefined') {
            updateAuthUI(AuthManager.isLoggedIn(), AuthManager.getUser());
        }
    }, 100);
});

function updateAuthUI(loggedIn, user) {
    const loggedOutEl = document.getElementById('auth-logged-out');
    const loggedInEl = document.getElementById('auth-logged-in');
    const displayNameEl = document.getElementById('user-display-name');
    
    if (loggedIn && user) {
        loggedOutEl.classList.add('hidden');
        loggedInEl.classList.remove('hidden');
        displayNameEl.textContent = user.displayName || user.username;
    } else {
        loggedOutEl.classList.remove('hidden');
        loggedInEl.classList.add('hidden');
    }
}

// ============ LOGIN MODAL ============
function showLoginModal() {
    hideRegisterModal();
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-username').focus();
}

function hideLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-form').reset();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const login = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    errorEl.classList.add('hidden');
    
    try {
        await AuthManager.login(login, password);
        hideLoginModal();
        console.log('✅ Login realizado!');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// ============ REGISTER MODAL ============
function showRegisterModal() {
    hideLoginModal();
    document.getElementById('register-modal').classList.remove('hidden');
    document.getElementById('register-error').classList.add('hidden');
    document.getElementById('register-username').focus();
}

function hideRegisterModal() {
    document.getElementById('register-modal').classList.add('hidden');
    document.getElementById('register-form').reset();
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const displayName = document.getElementById('register-displayname').value || null;
    const errorEl = document.getElementById('register-error');
    
    errorEl.classList.add('hidden');
    
    try {
        await AuthManager.register(username, email, password, displayName);
        hideRegisterModal();
        console.log('✅ Conta criada e login realizado!');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// ============ LEADERBOARD MODAL ============
function showLeaderboardModal() {
    document.getElementById('leaderboard-modal').classList.remove('hidden');
    loadLeaderboard('all');
}

function hideLeaderboardModal() {
    document.getElementById('leaderboard-modal').classList.add('hidden');
}

async function loadLeaderboard(category, buttonEl = null) {
    // Update active tab
    if (buttonEl) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        buttonEl.classList.add('active');
    }
    
    const contentEl = document.getElementById('leaderboard-content');
    contentEl.innerHTML = `<div class="leaderboard-loading">${t('leaderboard.loading')}</div>`;
    
    try {
        const data = await RankingManager.getLeaderboard(category, 20);
        
        if (!data.leaderboard || data.leaderboard.length === 0) {
            const emptyText = t('leaderboard.empty');
            const firstText = I18n.currentLang === 'pt' ? 'Seja o primeiro!' : 'Be the first!';
            contentEl.innerHTML = `<div class="leaderboard-empty">${emptyText}<br>${firstText}</div>`;
            return;
        }
        
        const classIcons = {
            soldier: '🎖️',
            tank: '🛡️',
            plane: '✈️',
            ship: '⚓'
        };
        
        let html = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>${t('leaderboard.position')}</th>
                        <th>${t('leaderboard.player')}</th>
                        <th></th>
                        <th>${t('leaderboard.score')}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.leaderboard.forEach((entry, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const icon = classIcons[entry.playerClass] || '❓';
            
            html += `
                <tr>
                    <td class="rank ${rankClass}">${entry.rank}</td>
                    <td>${entry.displayName || entry.username}</td>
                    <td class="player-class">${icon}</td>
                    <td class="score">${entry.score.toLocaleString()}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contentEl.innerHTML = html;
        
        // Show user's rank if logged in
        if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
            loadMyRank();
        }
        
    } catch (error) {
        const errorText = t('leaderboard.error');
        contentEl.innerHTML = `<div class="leaderboard-empty">${errorText}<br>${error.message}</div>`;
    }
}

async function loadMyRank() {
    const myRankEl = document.getElementById('my-rank');
    const positionEl = document.getElementById('my-rank-position');
    const scoreEl = document.getElementById('my-best-score');
    
    try {
        const rankings = await RankingManager.getMyRankings();
        
        if (rankings.globalRank) {
            myRankEl.classList.remove('hidden');
            positionEl.textContent = `#${rankings.globalRank}`;
            scoreEl.textContent = rankings.bestScore?.final_score?.toLocaleString() || '--';
        } else {
            myRankEl.classList.add('hidden');
        }
    } catch {
        myRankEl.classList.add('hidden');
    }
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideLoginModal();
        hideRegisterModal();
        hideLeaderboardModal();
    }
});

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        hideLoginModal();
        hideRegisterModal();
        hideLeaderboardModal();
    }
});

// ============ PROGRESS SAVE/LOAD UI ============

// Check for saved progress on page load and when user logs in
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkSavedProgress, 500);
});

// Listen for progress found event from AuthManager
window.addEventListener('progressFound', (e) => {
    showContinueButton(e.detail);
});

// Listen for auth state changes
window.addEventListener('authStateChanged', (e) => {
    if (e.detail.loggedIn) {
        // User logged in - check for saved progress
        setTimeout(checkSavedProgress, 300);
    } else {
        // User logged out - hide continue button
        const container = document.getElementById('continue-container');
        if (container) container.classList.add('hidden');
    }
});

async function checkSavedProgress() {
    if (typeof AuthManager === 'undefined') return;
    
    // Only check if logged in
    if (!AuthManager.isLoggedIn()) {
        const container = document.getElementById('continue-container');
        if (container) container.classList.add('hidden');
        return;
    }
    
    // Try to load from cache first, then server
    let progress = AuthManager.getCachedProgress();
    if (!progress) {
        progress = await AuthManager.loadProgress();
    }
    
    if (progress) {
        showContinueButton(progress);
    }
}

function showContinueButton(progress) {
    const container = document.getElementById('continue-container');
    const infoEl = document.getElementById('continue-info');
    
    if (progress && container) {
        container.classList.remove('hidden');
        
        const date = progress.timestamp ? new Date(progress.timestamp) : new Date(progress.savedAt);
        const timeAgo = getTimeAgo(date);
        const className = (progress.playerClass || 'soldier').toUpperCase();
        const phaseText = I18n.currentLang === 'pt' ? 'Fase' : 'Phase';
        const savedText = I18n.currentLang === 'pt' ? 'Salvo' : 'Saved';
        infoEl.innerHTML = `${phaseText} ${progress.level} | ${className} | Score: ${(progress.score || 0).toLocaleString()}<br>${savedText} ${timeAgo}`;
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const isPt = I18n.currentLang === 'pt';
    
    if (isNaN(seconds) || seconds < 0) return isPt ? 'recentemente' : 'recently';
    if (seconds < 60) return isPt ? 'agora' : 'now';
    if (seconds < 3600) return isPt ? `há ${Math.floor(seconds / 60)} min` : `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return isPt ? `há ${Math.floor(seconds / 3600)} horas` : `${Math.floor(seconds / 3600)} hours ago`;
    return isPt ? `há ${Math.floor(seconds / 86400)} dias` : `${Math.floor(seconds / 86400)} days ago`;
}

// Save progress and show notification
async function saveProgressAndNotify() {
    // Check if logged in
    if (typeof AuthManager === 'undefined' || !AuthManager.isLoggedIn()) {
        const loginMsg = I18n.currentLang === 'pt' ? '⚠️ Faça login para salvar!' : '⚠️ Login to save!';
        showNotification(loginMsg, 'warning');
        showLoginModal();
        return;
    }
    
    if (typeof saveCurrentProgress === 'function') {
        const saved = await saveCurrentProgress();
        if (saved) {
            showNotification(`💾 ${t('notifications.saveSuccess')}`, 'success');
        } else {
            showNotification(`❌ ${t('notifications.saveFailed')}`, 'error');
        }
    }
}

// Save and quit to menu
async function saveAndQuit() {
    // Check if logged in
    if (typeof AuthManager === 'undefined' || !AuthManager.isLoggedIn()) {
        showNotification('⚠️ Progresso não salvo (não logado)', 'warning');
        setTimeout(() => {
            closePauseModalAndGoToMenu();
        }, 1000);
        return;
    }

    if (typeof saveCurrentProgress === 'function') {
        await saveCurrentProgress();
    }
    showNotification('💾 Progresso salvo!', 'success');
    setTimeout(() => {
        closePauseModalAndGoToMenu();
    }, 500);
}

// Fecha o modal de pausa e volta para tela inicial
function closePauseModalAndGoToMenu() {
    // Esconde o pause
    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) {
        pauseScreen.classList.add('hidden');
    }
    
    // Volta para tela inicial
    if (typeof quitToMenu === 'function') {
        quitToMenu();
    } else {
        console.warn('quitToMenu não está disponível');
        // Fallback: resetar manualmente
        gameState = 'START';
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
    }
}

// Continue saved game
async function continueGame() {
    if (!AuthManager.isLoggedIn()) {
        showNotification('⚠️ Faça login primeiro', 'warning');
        showLoginModal();
        return;
    }
    
    if (typeof loadSavedProgress === 'function') {
        await loadSavedProgress();
    }
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const bgColors = {
        success: 'rgba(50, 150, 50, 0.95)',
        warning: 'rgba(180, 120, 30, 0.95)',
        error: 'rgba(180, 50, 50, 0.95)',
        info: 'rgba(50, 100, 150, 0.95)'
    };
    
    const borderColors = {
        success: '#4a7a35',
        warning: '#8a6a20',
        error: '#8a3535',
        info: '#5a7aaa'
    };
    
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColors[type] || bgColors.info};
        border: 2px solid ${borderColors[type] || borderColors.info};
        color: white;
        padding: 12px 24px;
        font-family: 'Press Start 2P', cursive;
        font-size: 10px;
        z-index: 99999;
        animation: slideDown 0.3s ease;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Add notification animations
const notifStyle = document.createElement('style');
notifStyle.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(notifStyle);
