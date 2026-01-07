// ============ HELPER FUNCTIONS ============
// Funções auxiliares gerais do jogo

function addScreenShake(intensity) {
    CONFIG.screenShake.intensity = Math.min(CONFIG.screenShake.intensity + intensity, 15);
    
    // Trigger UI shake for powerful impacts
    if (intensity >= 8 && typeof triggerUIShake === 'function') {
        triggerUIShake(intensity >= 15);
    }
}

function updateScreenShake() {
    CONFIG.screenShake.intensity *= CONFIG.screenShake.decay;
    shakeX = (Math.random() - 0.5) * CONFIG.screenShake.intensity;
    shakeY = (Math.random() - 0.5) * CONFIG.screenShake.intensity;
}

function createExplosion(x, y, color, size = 10, options = {}) {
    // Options: { isVehicle: bool, isSoldier: bool, groundY: number }
    const fireColors = ['#ff6600', '#ffaa00', '#ff4400', '#ffcc00'];
    for (let i = 0; i < size; i++) {
        const fireColor = fireColors[Math.floor(Math.random() * fireColors.length)];
        particles.push(new Particle(x, y, fireColor, null, 1.5, 0.05));
    }
    
    for (let i = 0; i < size / 2; i++) {
        setTimeout(() => {
            particles.push(new SmokeParticle(x + (Math.random() - 0.5) * 20, y));
        }, i * 50);
    }
    
    for (let i = 0; i < size / 2; i++) {
        const spark = new Particle(x, y, '#ffff00', 2 + Math.random() * 2, 2.5, 0.15);
        spark.life = 20 + Math.random() * 15;
        particles.push(spark);
    }
    
    if (size >= 15) {
        particles.push(new EnhancedMuzzleFlash(x, y, 0, size / 10));
    }
    
    // METAL DEBRIS para veículos/tanques (explosões grandes)
    if (size >= 20 || options.isVehicle) {
        const debrisCount = Math.floor(size / 3);
        const groundY = options.groundY || (canvas ? canvas.height - 50 : 550);
        
        // Criar debris metálicos com física de quique
        if (typeof createMetalDebris === 'function') {
            createMetalDebris(x, y, debrisCount, groundY);
        }
        
        // Debris antigos como fallback
        const debrisColors = ['#4a4a4a', '#3a3a3a', '#2a2a2a', '#5a5a5a'];
        for (let i = 0; i < size / 4; i++) {
            const debris = new Particle(
                x, y, 
                debrisColors[Math.floor(Math.random() * debrisColors.length)],
                4 + Math.random() * 4,
                1.2,
                0.2
            );
            debris.life = 50 + Math.random() * 30;
            particles.push(debris);
        }
    }
    
    // GROUND STAINS para inimigos mortos
    if (size >= 10 && typeof createGroundStain === 'function') {
        // Determinar cor da mancha baseado no tipo
        let stainColor, stainType;
        
        if (options.isSoldier) {
            // Soldados: manchas de sangue
            stainColor = '#4a0000';
            stainType = 'blood';
        } else if (options.isVehicle) {
            // Veículos: manchas de óleo/queimadura
            stainColor = '#1a1a1a';
            stainType = 'oil';
        } else if (color && (color.includes('ff') || color.includes('FF'))) {
            // Explosões de fogo: marca de queimadura
            stainColor = '#2a2a2a';
            stainType = 'scorch';
        } else {
            // Default: mancha escura
            stainColor = '#3a2a2a';
            stainType = 'generic';
        }
        
        // Criar mancha no chão
        const stainSize = size * 1.5;
        createGroundStain(x, y, stainSize, stainColor, stainType);
    }
    
    AudioEngine.playExplosion(size / 10);
    addScreenShake(size / 3);
}

// ============ BOSS HP BAR ============
// Desenha barra de HP do Boss na fase 5
function drawBossHPBar(ctx) {
    // Encontrar o boss na lista de inimigos
    const boss = enemies.find(e => e.type === 'boss');
    if (!boss) return;
    
    const barWidth = 350;
    const barHeight = 18;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 45;
    
    // Fundo da barra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
    
    // Fundo da barra de HP (vermelho escuro)
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // HP atual (gradiente vermelho)
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    
    if (hpRatio > 0.5) {
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(0.5, '#cc0000');
        gradient.addColorStop(1, '#880000');
    } else if (hpRatio > 0.25) {
        gradient.addColorStop(0, '#ff6600');
        gradient.addColorStop(0.5, '#cc3300');
        gradient.addColorStop(1, '#882200');
    } else {
        // HP crítico - pisca
        const flash = Math.floor(frameCount / 10) % 2 === 0;
        gradient.addColorStop(0, flash ? '#ff0000' : '#ff4444');
        gradient.addColorStop(0.5, flash ? '#cc0000' : '#aa0000');
        gradient.addColorStop(1, flash ? '#880000' : '#660000');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    
    // Brilho no topo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(barX, barY, barWidth * hpRatio, 3);
    
    // Borda da barra
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Texto de HP compacto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, canvas.width / 2, barY + 13);
    
    ctx.textAlign = 'left';
}

function drawOffscreenIndicators(ctx) {
    if (!CONFIG.showOffscreenIndicators) return;
    
    const margin = 40;
    const indicatorSize = 12;
    const playerCenter = player.getCenter();
    
    enemies.forEach(enemy => {
        if (enemy.dead) return;
        
        const ex = enemy.x + enemy.w / 2;
        const ey = enemy.y + enemy.h / 2;
        
        const offLeft = ex < 0;
        const offRight = ex > canvas.width;
        const offTop = ey < 0;
        const offBottom = ey > canvas.height;
        
        if (!offLeft && !offRight && !offTop && !offBottom) return;
        
        let indicatorX, indicatorY;
        let angle = Math.atan2(ey - playerCenter.y, ex - playerCenter.x);
        
        indicatorX = Math.max(margin, Math.min(canvas.width - margin, ex));
        indicatorY = Math.max(margin, Math.min(canvas.height - margin, ey));
        
        let color = '#ff3333';
        if (enemy.type === 'boss') color = '#ff0000';
        else if (enemy.type === 'tower') color = '#aa00aa';
        else if (enemy.type === 'tank') color = '#ff6600';
        
        const dist = Math.sqrt(Math.pow(ex - playerCenter.x, 2) + Math.pow(ey - playerCenter.y, 2));
        const pulseSize = indicatorSize + Math.sin(frameCount * 0.15) * 3;
        
        ctx.save();
        ctx.translate(indicatorX, indicatorY);
        ctx.rotate(angle);
        
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8 + Math.sin(frameCount * 0.1) * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(pulseSize, 0);
        ctx.lineTo(-pulseSize / 2, -pulseSize / 2);
        ctx.lineTo(-pulseSize / 3, 0);
        ctx.lineTo(-pulseSize / 2, pulseSize / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        if (enemy.type === 'boss') {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️', indicatorX, indicatorY - 15);
            ctx.restore();
        }
    });
}
