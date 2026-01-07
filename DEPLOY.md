# 🚀 Pixel War Ultimate - Production Deployment Guide

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (Static Hosting)          │
│  https://nutef.com/pixel-war        │
│  ├── pixel-war-final.html           │
│  ├── styles.css                     │
│  └── js/                            │
└──────────────┬──────────────────────┘
               │ HTTPS API calls
               ▼
┌─────────────────────────────────────┐
│  Backend (VPS/Docker)               │
│  https://api.nutef.com              │
│  └── /home/pixelwar-api/            │
│      ├── server.js                  │
│      ├── package.json               │
│      └── data/                      │
└─────────────────────────────────────┘
```

---

## 📁 Files Distribution

### Frontend (Upload to nutef.com/pixel-war)
```
pixel-war-final.html
styles.css
js/
  ├── audio.js
  ├── config.js
  ├── entities.js
  ├── game-helpers.js
  ├── game.js
  ├── particles.js
  ├── sprites.js
  ├── phases/
  ├── sprites/
  └── systems/
```

### Backend (Upload to /home/pixelwar-api/)
```
server.js
package.json
data/
  ├── classes.json
  ├── enemies.json
  ├── levels-index.json
  ├── powerups.json
  └── levels/
      ├── level-1.json
      ├── level-2.json
      └── ... (até level-12.json)
```

---

## 🐳 Docker Stack (Portainer)

```yaml
version: "3.7"

services:
  api:
    image: node:18-alpine
    working_dir: /app
    command: sh -c "npm install && node server.js"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=pixelwar
      - DB_USER=postgres
      - DB_PASSWORD=1ba40912321ce96dd5706660aefb21ff
      - JWT_SECRET=GERE_UMA_CHAVE_SEGURA_DE_64_CHARS_AQUI
      - ANTICHEAT_SECRET=GERE_OUTRA_CHAVE_SEGURA_AQUI
    volumes:
      - /home/pixelwar-api:/app
    networks:
      - Nutef
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.pixelwar-api.rule=Host(`api.nutef.com`)
        - traefik.http.routers.pixelwar-api.entrypoints=websecure
        - traefik.http.routers.pixelwar-api.tls.certresolver=letsencryptresolver
        - traefik.http.services.pixelwar-api.loadbalancer.server.port=3000

networks:
  Nutef:
    external: true
    name: Nutef
```

---

## 📋 Deployment Checklist

### 1. Upload Backend to VPS
```bash
# Via SSH ou SFTP para /home/pixelwar-api/
scp -r server/* root@147.93.116.186:/home/pixelwar-api/
```

Estrutura final no servidor:
```
/home/pixelwar-api/
├── server.js
├── package.json
└── data/
    ├── classes.json
    ├── enemies.json
    ├── levels-index.json
    ├── powerups.json
    └── levels/
        └── level-*.json
```

### 2. Deploy Stack no Portainer
1. Acesse Portainer
2. Stacks → Add stack
3. Cole o YAML acima
4. Deploy

### 3. Verificar API
```bash
# Testar health check
curl https://api.nutef.com/api/health

# Resposta esperada:
# {"status":"ok","uptime":123.45,"memory":{...},"environment":"production"}
```

### 4. Upload Frontend
Upload os arquivos do frontend para `nutef.com/pixel-war/`:
- Via FTP/SFTP 
- Ou painel de hospedagem

### 5. Testar Game
Acesse `https://nutef.com/pixel-war` e verifique:
- [ ] Tela inicial carrega
- [ ] Classes aparecem corretamente
- [ ] Níveis carregam
- [ ] Inimigos spawnam

---

## ⚙️ Configurações Aplicadas

### CORS
- Produção: apenas `nutef.com` e `www.nutef.com`
- Desenvolvimento: aceita todas origens

### Rate Limiting
- 100 requests por IP a cada 15 minutos
- Protege contra DDoS básico

### Ambiente
- `NODE_ENV=production` ativa modo produção
- `PORT=3000` (configurável)

### API URL (Frontend)
- Detecta automaticamente:
  - `localhost` → `http://localhost:3000/api`
  - Produção → `https://api.nutef.com/api`

---

## 🔧 Troubleshooting

### API não responde
```bash
# Ver logs do container
docker logs pixelwar-api

# Verificar se está rodando
docker ps | grep pixelwar
```

### CORS Error no Browser
- Verifique se `NODE_ENV=production` está setado
- Confirme que está acessando de `nutef.com`

### Dados não carregam
- Verifique se pasta `data/` existe no container
- Teste: `curl https://api.nutef.com/api/init`

### Rate Limit atingido
- Aguarde 15 minutos
- Ou ajuste `max` em `server.js` se necessário

---

## 📊 Endpoints da API

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/health` | Health check (Docker) |
| `GET /api/init` | Todos dados iniciais |
| `GET /api/levels` | Índice de níveis |
| `GET /api/level/:id` | Dados do nível específico |
| `GET /api/enemies` | Stats dos inimigos |
| `GET /api/classes` | Stats das classes |
| `GET /api/powerups` | Lista de powerups |

### 🔐 Auth Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/register` | POST | Criar conta (username, email, password) |
| `/api/auth/login` | POST | Login (login, password) |
| `/api/auth/logout` | POST | Logout (requer token) |
| `/api/auth/me` | GET | Perfil do usuário logado |
| `/api/auth/profile` | PATCH | Atualizar display name |

### 🏆 Ranking Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ranking/submit` | POST | Enviar score (score, playerClass, levelReached, isVictory, kills, deaths, duration, checksum) |
| `/api/ranking/leaderboard/:category` | GET | Ranking (all, weekly, daily, soldier, tank, plane, ship) |
| `/api/ranking/my-rankings` | GET | Rankings do usuário logado |
| `/api/ranking/level/:id` | GET | Ranking por nível |

---

## 🗄️ Database Setup

### Primeira vez - Criar database no PostgreSQL

```bash
# Conectar ao container postgres
docker exec -it <postgres_container_id> psql -U postgres

# Criar database
CREATE DATABASE pixelwar;
\q
```

### Inicializar tabelas

```bash
# No container da API ou localmente
cd /home/pixelwar-api
npm run db:init
```

Ou via docker:
```bash
docker exec -it <api_container_id> npm run db:init
```

---
