// ============ CENÁRIOS ALTERNATIVOS POR CLASSE ============
// Backgrounds específicos para Tank, Plane e Ship na Fase 3

// ============ TANQUE - COMBOIO ============
function drawConvoyBackground() {
    // Céu de deserto
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#d4a574');  // Céu alaranjado
    gradient.addColorStop(0.4, '#b8956a');
    gradient.addColorStop(1, '#8a6a4a');  // Areia escura
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dunas distantes (parallax lento)
    const duneOffset = (trainScrollX * 0.15) % 250;
    ctx.fillStyle = '#9a7a5a';
    for (let x = -250 + duneOffset; x < canvas.width + 250; x += 250) {
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.quadraticCurveTo(x + 125, 100, x + 250, 180);
        ctx.fill();
    }
    
    // Poeira levantando (parallax médio)
    const dustOffset = (trainScrollX * 0.8) % 200;
    for (let x = -200 + dustOffset; x < canvas.width + 200; x += 200) {
        ctx.fillStyle = `rgba(180, 150, 100, ${0.3 + Math.random() * 0.2})`;
        const dustY = canvas.height - 80 + Math.sin(x * 0.02 + frameCount * 0.05) * 10;
        ctx.beginPath();
        ctx.arc(x, dustY, 30 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Estrada de terra (parallax rápido)
    const roadOffset = (trainScrollX * 2) % 80;
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Marcas de pneu na estrada
    ctx.fillStyle = '#5a4030';
    for (let x = -80 + roadOffset; x < canvas.width + 80; x += 80) {
        ctx.fillRect(x, canvas.height - 45, 50, 8);
        ctx.fillRect(x, canvas.height - 25, 50, 8);
    }
    
    // Plataforma do caminhão
    ctx.fillStyle = '#4a5a3a';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 60);
    ctx.fillStyle = '#3a4a2a';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 8);
    
    // Rebites do caminhão
    const rivetOffset = (trainScrollX * 1.5) % 50;
    ctx.fillStyle = '#2a3a2a';
    for (let x = -50 + rivetOffset; x < canvas.width + 50; x += 50) {
        ctx.beginPath();
        ctx.arc(x, canvas.height - 96, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Indicador de seção
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CAMINHÃO ' + trainCurrentCar, 20, canvas.height - 60);
    
    // Linhas de velocidade
    const speedLines = Math.floor(trainSpeed * 3);
    ctx.strokeStyle = 'rgba(200, 170, 120, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < speedLines; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(canvas.width, y);
        ctx.lineTo(canvas.width - 20 - trainSpeed * 8, y);
        ctx.stroke();
    }
    
    // Zona segura/aviso
    if (trainTunnelWarning || trainTunnelActive) {
        drawConvoyObstacleWarning();
    }
}

function drawConvoyObstacleWarning() {
    // Aviso de ponte baixa / obstáculo
    if (trainTunnelWarning) {
        const flashAlpha = Math.sin(frameCount * 0.3) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(255, 150, 50, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ EMBOSCADA! CENTRO! ⚠️', canvas.width / 2, 100);
    }
    
    // Zona segura
    ctx.strokeStyle = trainTunnelActive ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(trainSafeZone.x, canvas.height - 150, trainSafeZone.w, 100);
    ctx.setLineDash([]);
    
    if (trainTunnelActive) {
        // Tiros vindo das laterais
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.fillRect(0, 0, trainSafeZone.x - 20, canvas.height);
        ctx.fillRect(trainSafeZone.x + trainSafeZone.w + 20, 0, canvas.width, canvas.height);
    }
}

// ============ AVIÃO - PERSEGUIÇÃO AÉREA ============
function drawAerialChaseBackground() {
    // Céu azul com nuvens
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a3a6a');  // Azul escuro
    gradient.addColorStop(0.5, '#3a6a9a');
    gradient.addColorStop(1, '#5a9aca');  // Azul claro
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nuvens distantes (parallax lento)
    const cloudOffset = (trainScrollX * 0.3) % 400;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let x = -400 + cloudOffset; x < canvas.width + 400; x += 400) {
        const cloudY = 100 + Math.sin(x * 0.01) * 30;
        ctx.beginPath();
        ctx.arc(x, cloudY, 50, 0, Math.PI * 2);
        ctx.arc(x + 40, cloudY + 10, 40, 0, Math.PI * 2);
        ctx.arc(x + 80, cloudY, 45, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Nuvens médias (parallax médio)
    const cloudMedOffset = (trainScrollX * 0.7) % 300;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let x = -300 + cloudMedOffset; x < canvas.width + 300; x += 300) {
        const cloudY = 250 + Math.sin(x * 0.02 + frameCount * 0.01) * 20;
        ctx.beginPath();
        ctx.arc(x, cloudY, 35, 0, Math.PI * 2);
        ctx.arc(x + 30, cloudY + 5, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Chão distante (montanhas/cidade)
    ctx.fillStyle = '#2a4a3a';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    const groundOffset = (trainScrollX * 1.5) % 150;
    ctx.fillStyle = '#3a5a4a';
    for (let x = -150 + groundOffset; x < canvas.width + 150; x += 150) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 60);
        ctx.lineTo(x + 50, canvas.height - 100);
        ctx.lineTo(x + 100, canvas.height - 70);
        ctx.lineTo(x + 150, canvas.height - 60);
        ctx.fill();
    }
    
    // Avião inimigo sendo perseguido (parallax rápido)
    const planeX = canvas.width - 100 + Math.sin(frameCount * 0.05) * 20;
    const planeY = 150 + Math.sin(frameCount * 0.03) * 30;
    ctx.fillStyle = '#8a3030';
    ctx.beginPath();
    ctx.moveTo(planeX + 40, planeY);
    ctx.lineTo(planeX, planeY + 10);
    ctx.lineTo(planeX + 40, planeY + 20);
    ctx.lineTo(planeX + 30, planeY + 10);
    ctx.fill();
    // Asas
    ctx.fillRect(planeX + 10, planeY - 10, 15, 40);
    
    // Indicador de seção
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SETOR AÉREO ' + trainCurrentCar, 20, 40);
    
    // Linhas de velocidade
    const speedLines = Math.floor(trainSpeed * 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < speedLines; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(canvas.width, y);
        ctx.lineTo(canvas.width - 40 - trainSpeed * 15, y);
        ctx.stroke();
    }
    
    // Zona segura/aviso (mísseis)
    if (trainTunnelWarning || trainTunnelActive) {
        drawAerialMissileWarning();
    }
}

function drawAerialMissileWarning() {
    if (trainTunnelWarning) {
        const flashAlpha = Math.sin(frameCount * 0.3) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 MÍSSEIS! ESQUIVE! 🚀', canvas.width / 2, 100);
    }
    
    ctx.strokeStyle = trainTunnelActive ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(trainSafeZone.x, 100, trainSafeZone.w, canvas.height - 200);
    ctx.setLineDash([]);
    
    if (trainTunnelActive) {
        // Mísseis nas laterais
        ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
        ctx.fillRect(0, 0, trainSafeZone.x - 20, canvas.height);
        ctx.fillRect(trainSafeZone.x + trainSafeZone.w + 20, 0, canvas.width, canvas.height);
        
        // Desenhar mísseis
        for (let i = 0; i < 3; i++) {
            const missileY = 100 + i * 150 + Math.sin(frameCount * 0.1 + i) * 20;
            ctx.fillStyle = '#aa3030';
            ctx.fillRect(30 + Math.sin(frameCount * 0.2) * 10, missileY, 30, 10);
            ctx.fillRect(canvas.width - 60 + Math.sin(frameCount * 0.2 + 1) * 10, missileY + 50, 30, 10);
        }
    }
}

// ============ NAVIO - RIO COM CORREDEIRAS ============
function drawRiverRapidsBackground() {
    // Água do rio
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a4a3a');  // Verde escuro
    gradient.addColorStop(0.5, '#2a6a5a');
    gradient.addColorStop(1, '#1a3a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ondas do rio (parallax)
    const waveOffset = (trainScrollX * 1.2) % 100;
    for (let y = 0; y < canvas.height; y += 40) {
        const waveY = y + Math.sin((y + waveOffset) * 0.05 + frameCount * 0.1) * 5;
        ctx.strokeStyle = 'rgba(100, 180, 150, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.lineTo(x + 15, waveY + 5);
            ctx.lineTo(x + 30, waveY);
        }
        ctx.stroke();
    }
    
    // Margens do rio (parallax lento)
    const bankOffset = (trainScrollX * 0.5) % 200;
    ctx.fillStyle = '#2a3a20';
    
    // Margem esquerda
    for (let y = -200 + bankOffset; y < canvas.height + 200; y += 200) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(80, y + 100, 0, y + 200);
        ctx.fill();
    }
    
    // Margem direita
    for (let y = -200 + bankOffset; y < canvas.height + 200; y += 200) {
        ctx.beginPath();
        ctx.moveTo(canvas.width, y);
        ctx.quadraticCurveTo(canvas.width - 80, y + 100, canvas.width, y + 200);
        ctx.fill();
    }
    
    // Pedras no rio (parallax médio)
    const rockOffset = (trainScrollX * 0.8) % 300;
    ctx.fillStyle = '#3a4a3a';
    for (let y = -300 + rockOffset; y < canvas.height + 300; y += 300) {
        // Pedras aleatórias
        ctx.beginPath();
        ctx.arc(150, y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width - 200, y + 150, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Espuma/corredeiras (parallax rápido)
    const foamOffset = (trainScrollX * 1.5) % 150;
    ctx.fillStyle = 'rgba(200, 230, 220, 0.6)';
    for (let y = -150 + foamOffset; y < canvas.height + 150; y += 150) {
        for (let i = 0; i < 5; i++) {
            const foamX = 100 + Math.random() * (canvas.width - 200);
            ctx.beginPath();
            ctx.arc(foamX, y + Math.random() * 50, 8 + Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Indicador de seção
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TRECHO ' + trainCurrentCar, 20, 40);
    
    // Zona segura/aviso (cachoeira)
    if (trainTunnelWarning || trainTunnelActive) {
        drawRiverRapidsWarning();
    }
}

function drawRiverRapidsWarning() {
    if (trainTunnelWarning) {
        const flashAlpha = Math.sin(frameCount * 0.3) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(50, 150, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🌊 CORREDEIRA! CENTRO! 🌊', canvas.width / 2, 100);
    }
    
    ctx.strokeStyle = trainTunnelActive ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(trainSafeZone.x, 100, trainSafeZone.w, canvas.height - 200);
    ctx.setLineDash([]);
    
    if (trainTunnelActive) {
        // Corredeiras perigosas nas laterais
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.fillRect(0, 0, trainSafeZone.x - 20, canvas.height);
        ctx.fillRect(trainSafeZone.x + trainSafeZone.w + 20, 0, canvas.width, canvas.height);
        
        // Espuma intensa
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 20; i++) {
            const foamX = Math.random() * (trainSafeZone.x - 30);
            const foamY = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.arc(foamX, foamY, 5 + Math.random() * 8, 0, Math.PI * 2);
            ctx.fill();
            
            const foamX2 = trainSafeZone.x + trainSafeZone.w + 30 + Math.random() * (canvas.width - trainSafeZone.x - trainSafeZone.w - 30);
            ctx.beginPath();
            ctx.arc(foamX2, foamY, 5 + Math.random() * 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
