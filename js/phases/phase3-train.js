// ============ FASE 3 - TREM BLINDADO ============
// Cenário de side-scroller no topo do trem

const TRAIN_COLORS = {
    sky: '#1a0a0a',           // Céu noturno/fumaça
    mountain: '#2a1a1a',      // Montanhas distantes
    ground: '#3c2010',        // Chão/trilhos
    track: '#4a3020',         // Dormentes
    rail: '#6a6a6a',          // Trilhos de metal
    car: '#5a4030',           // Vagão base
    carDark: '#3a2010',       // Vagão sombra
    carLight: '#7a6050',      // Vagão highlight
    metal: '#4a4a4a',         // Metal/rebites
    window: '#1a3050',        // Janelas escuras
    windowLight: '#3a5070',   // Janelas com luz
    warning: '#aa3030',       // Detalhes vermelhos
};

function drawTrainBackground() {
    // Adaptar cenário baseado na classe do jogador
    if (selectedClass === 'tank') {
        drawConvoyBackground(); // Comboio de veículos
        return;
    } else if (selectedClass === 'plane') {
        drawAerialChaseBackground(); // Perseguição aérea
        return;
    } else if (selectedClass === 'ship') {
        drawRiverRapidsBackground(); // Rio com corredeiras
        return;
    }
    
    // SOLDADO: Side-scroller no topo do trem
    
    // Céu gradiente (atardecer de guerra)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
    skyGradient.addColorStop(0, '#1a0a10');
    skyGradient.addColorStop(0.3, '#3a1520');
    skyGradient.addColorStop(0.6, '#5a3030');
    skyGradient.addColorStop(1, '#4a2a20');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, 400);
    
    // Montanhas distantes (parallax lento)
    const mountainOffset = (trainScrollX * 0.1) % 300;
    ctx.fillStyle = '#2a1515';
    for (let x = -300 - mountainOffset; x < canvas.width + 300; x += 250) {
        ctx.beginPath();
        ctx.moveTo(x, 280);
        ctx.lineTo(x + 80, 180);
        ctx.lineTo(x + 125, 200);
        ctx.lineTo(x + 170, 150);
        ctx.lineTo(x + 250, 280);
        ctx.fill();
    }
    
    // Árvores/vegetação média distância (parallax médio)
    const treeOffset = (trainScrollX * 0.3) % 120;
    ctx.fillStyle = '#1a1a0a';
    for (let x = -120 - treeOffset; x < canvas.width + 120; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 350);
        ctx.lineTo(x + 20, 290);
        ctx.lineTo(x + 40, 350);
        ctx.fill();
    }
    
    // Postes de luz passando (parallax rápido)
    const poleOffset = (trainScrollX * 0.8) % 250;
    ctx.fillStyle = '#3a3a3a';
    for (let x = -250 - poleOffset; x < canvas.width + 100; x += 250) {
        // Poste
        ctx.fillRect(x, 280, 8, 180);
        // Braço
        ctx.fillRect(x - 15, 285, 38, 6);
        // Luz
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(x - 5, 290, 18, 4);
        ctx.fillStyle = '#3a3a3a';
    }
    
    // Nuvens de fumaça do trem (vão para esquerda)
    const smokeOffset = (trainScrollX * 1.5) % 200;
    ctx.fillStyle = 'rgba(80, 60, 50, 0.4)';
    for (let x = canvas.width + 100 - smokeOffset; x > -100; x -= 200) {
        const smokeY = 80 + Math.sin(x * 0.02 + frameCount * 0.03) * 30;
        ctx.beginPath();
        ctx.arc(x, smokeY, 35, 0, Math.PI * 2);
        ctx.arc(x - 40, smokeY - 10, 30, 0, Math.PI * 2);
        ctx.arc(x - 80, smokeY + 5, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // TOPO DO TREM (plataforma do jogador) - VISÃO LATERAL
    const trainTopY = TRAIN_CONFIG.groundY;
    
    // Corpo do vagão (visível na parte inferior)
    ctx.fillStyle = TRAIN_COLORS.carDark;
    ctx.fillRect(0, trainTopY, canvas.width, canvas.height - trainTopY);
    
    // Teto do vagão (onde o jogador anda)
    ctx.fillStyle = TRAIN_COLORS.car;
    ctx.fillRect(0, trainTopY - 15, canvas.width, 15);
    
    // Linha de borda superior (brilho)
    ctx.fillStyle = TRAIN_COLORS.carLight;
    ctx.fillRect(0, trainTopY - 15, canvas.width, 3);
    
    // Rebites no teto (scroll)
    const rivetOffset = (trainScrollX * 2) % 50;
    ctx.fillStyle = TRAIN_COLORS.metal;
    for (let x = -50 - rivetOffset; x < canvas.width + 50; x += 50) {
        ctx.beginPath();
        ctx.arc(x, trainTopY - 7, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Janelas do vagão (na lateral abaixo)
    const windowOffset = (trainScrollX * 2) % 100;
    for (let x = -100 - windowOffset; x < canvas.width + 100; x += 100) {
        // Janela
        ctx.fillStyle = TRAIN_COLORS.window;
        ctx.fillRect(x, trainTopY + 15, 50, 35);
        // Reflexo
        ctx.fillStyle = TRAIN_COLORS.windowLight;
        ctx.fillRect(x + 5, trainTopY + 20, 15, 10);
        // Moldura
        ctx.strokeStyle = TRAIN_COLORS.metal;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, trainTopY + 15, 50, 35);
    }
    
    // Linhas de separação dos vagões (conectores)
    const connectorOffset = (trainScrollX * 2) % 400;
    ctx.fillStyle = '#2a2a2a';
    for (let x = -connectorOffset; x < canvas.width + 100; x += 400) {
        ctx.fillRect(x, trainTopY - 20, 15, canvas.height);
        // Detalhe do conector
        ctx.fillStyle = TRAIN_COLORS.metal;
        ctx.fillRect(x + 3, trainTopY - 10, 9, 25);
        ctx.fillStyle = '#2a2a2a';
    }
    
    // Desenhar obstáculos
    trainObstacles.forEach(obs => {
        drawTrainObstacle(obs);
    });
    
    // Indicador de vagão
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('VAGÃO ' + trainCurrentCar + '/' + TRAIN_CONFIG.totalCars, 15, 30);
    
    // Indicador de pulo (se soldado)
    if (selectedClass === 'soldier') {
        ctx.fillStyle = player.grounded ? '#00ff00' : '#ff6600';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText(player.grounded ? '[SPACE] PULAR' : 'NO AR', 15, 50);
    }
    
    // Efeito de velocidade (linhas horizontais)
    const speedLines = Math.floor(trainSpeed * 2);
    ctx.strokeStyle = 'rgba(255, 200, 150, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < speedLines; i++) {
        const y = 100 + Math.random() * (trainTopY - 120);
        const len = 50 + trainSpeed * 15;
        ctx.beginPath();
        ctx.moveTo(canvas.width + 10, y);
        ctx.lineTo(canvas.width - len, y);
        ctx.stroke();
    }
}

// Desenha um obstáculo no trem
function drawTrainObstacle(obs) {
    const px = PIXEL_SCALE;
    
    if (obs.name === 'caixa' || obs.name === 'caixaGrande') {
        // Caixa de madeira
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        
        // Tábuas horizontais
        ctx.fillStyle = '#5a3a1a';
        for (let y = obs.y + 8; y < obs.y + obs.h; y += 10) {
            ctx.fillRect(obs.x, y, obs.w, 2);
        }
        
        // Borda escura
        ctx.strokeStyle = '#3a2510';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        
        // X de reforço
        ctx.strokeStyle = '#6a4a2a';
        ctx.beginPath();
        ctx.moveTo(obs.x + 3, obs.y + 3);
        ctx.lineTo(obs.x + obs.w - 3, obs.y + obs.h - 3);
        ctx.moveTo(obs.x + obs.w - 3, obs.y + 3);
        ctx.lineTo(obs.x + 3, obs.y + obs.h - 3);
        ctx.stroke();
        
    } else if (obs.name === 'barreira') {
        // Barreira de metal
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        
        // Listras de perigo
        ctx.fillStyle = '#ffcc00';
        for (let i = 0; i < obs.w; i += 10) {
            ctx.fillRect(obs.x + i, obs.y, 5, obs.h);
        }
        
        // Borda
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }
}

function drawTrainCarTop() {
    // O teto do vagão onde o jogador está
    const carY = canvas.height - 100; // Altura do teto do vagão
    
    // Estrutura principal do teto
    ctx.fillStyle = TRAIN_COLORS.car;
    ctx.fillRect(0, carY, canvas.width, 80);
    
    // Borda superior escura
    ctx.fillStyle = TRAIN_COLORS.carDark;
    ctx.fillRect(0, carY, canvas.width, 8);
    
    // Textura de metal no teto (linhas horizontais)
    ctx.fillStyle = TRAIN_COLORS.carDark;
    for (let y = carY + 20; y < carY + 70; y += 15) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
    
    // Rebites decorativos (animados com scroll)
    const rivetOffset = (trainScrollX * 1.5) % 60;
    ctx.fillStyle = TRAIN_COLORS.metal;
    for (let x = -60 + rivetOffset; x < canvas.width + 60; x += 60) {
        // Rebites superiores
        ctx.beginPath();
        ctx.arc(x, carY + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        // Rebites inferiores
        ctx.beginPath();
        ctx.arc(x, carY + 68, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Indicador de vagão atual
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('VAGÃO ' + trainCurrentCar, 20, carY + 45);
    
    // Separadores entre vagões (conexões)
    const connectorX = canvas.width - 50;
    ctx.fillStyle = TRAIN_COLORS.metal;
    ctx.fillRect(connectorX, carY + 20, 30, 40);
    ctx.fillStyle = TRAIN_COLORS.carDark;
    ctx.fillRect(connectorX + 5, carY + 25, 20, 30);
    
    // Seta indicando direção
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(connectorX + 25, carY + 35);
    ctx.lineTo(connectorX + 35, carY + 40);
    ctx.lineTo(connectorX + 25, carY + 45);
    ctx.fill();
}

function drawTunnelWarning() {
    // Desenha aviso de túnel e zona segura
    
    if (trainTunnelWarning) {
        // Flash de aviso
        const flashAlpha = Math.sin(frameCount * 0.3) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texto de aviso
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ TÚNEL! VÁ PARA O CENTRO! ⚠️', canvas.width / 2, 100);
        
        // Countdown visual
        const secondsLeft = Math.ceil(trainTunnelTimer / 60);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.fillText(secondsLeft.toString(), canvas.width / 2, 180);
    }
    
    // Zona segura sempre visível durante aviso/túnel
    ctx.strokeStyle = trainTunnelActive ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(
        trainSafeZone.x, 
        canvas.height - 150, 
        trainSafeZone.w, 
        100
    );
    ctx.setLineDash([]);
    
    // Label da zona segura
    ctx.fillStyle = trainTunnelActive ? '#00ff00' : '#ffff00';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZONA SEGURA', trainSafeZone.x + trainSafeZone.w / 2, canvas.height - 160);
    
    // Efeito de túnel ativo (escurece as bordas)
    if (trainTunnelActive) {
        // Paredes do túnel
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, trainSafeZone.x - 20, canvas.height);
        ctx.fillRect(trainSafeZone.x + trainSafeZone.w + 20, 0, canvas.width, canvas.height);
        
        // Gradiente de transição
        const leftGrad = ctx.createLinearGradient(trainSafeZone.x - 20, 0, trainSafeZone.x, 0);
        leftGrad.addColorStop(0, '#0a0a0a');
        leftGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(trainSafeZone.x - 20, 0, 20, canvas.height);
        
        const rightGrad = ctx.createLinearGradient(trainSafeZone.x + trainSafeZone.w, 0, trainSafeZone.x + trainSafeZone.w + 20, 0);
        rightGrad.addColorStop(0, 'rgba(10, 10, 10, 0)');
        rightGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(trainSafeZone.x + trainSafeZone.w, 0, 20, canvas.height);
        
        // Teto do túnel
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, 50);
        const topGrad = ctx.createLinearGradient(0, 50, 0, 100);
        topGrad.addColorStop(0, '#0a0a0a');
        topGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 50, canvas.width, 50);
    }
}
