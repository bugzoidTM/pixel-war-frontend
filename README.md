# 🎮 Pixel War Ultimate

Um jogo de ação estilo arcade com gráficos pixel art, desenvolvido em JavaScript puro usando Canvas HTML5.

![Pixel War Ultimate](https://img.shields.io/badge/Game-Pixel%20War%20Ultimate-green)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)
![HTML5 Canvas](https://img.shields.io/badge/Engine-HTML5%20Canvas-orange)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1)

---

## 📖 Descrição

**Pixel War Ultimate** é um jogo de tiro top-down onde você controla diferentes unidades militares através de **12 fases desafiadoras**. Cada fase possui mecânicas únicas, objetivos diferentes e ambientes variados. O jogo conta com sistema de **ranking global**, **autenticação de usuários**, **multi-idiomas (PT/EN)** e **salvamento de progresso na nuvem**.

---

## ✨ Funcionalidades

- 🎮 **12 fases únicas** com mecânicas variadas
- 🪖 **4 classes jogáveis** (Soldado, Tanque, Avião, Navio)
- 🏆 **Sistema de ranking global** com leaderboards
- 🔐 **Sistema de login/registro** com autenticação JWT
- 💾 **Salvamento de progresso** na nuvem
- 🌐 **Multi-idiomas** (Português/Inglês)
- 🎵 **Sistema de áudio completo** com músicas e efeitos
- 💎 **Sistema de powerups** com 7 tipos diferentes
- 📱 **Interface responsiva** com HUD completo

---

## 🎯 Controles

| Tecla/Ação | Função |
|------------|--------|
| **↑ / W** | Mover para cima |
| **↓ / S** | Mover para baixo |
| **← / A** | Mover para esquerda |
| **→ / D** | Mover para direita |
| **ESPAÇO** | Atirar |
| **ESC** | Pausar jogo |
| **G** | Lançar granada (Soldado) |

---

## 🪖 Classes Jogáveis

### 🎖️ Soldado
| Atributo | Valor |
|----------|-------|
| HP | 80 |
| Velocidade | Rápido |
| Dano | Médio |
| Especial | Granada |

**Descrição:** Unidade equilibrada, ideal para iniciantes. Pode lançar granadas e tem boa mobilidade.

---

### 🛡️ Tanque
| Atributo | Valor |
|----------|-------|
| HP | 200 |
| Velocidade | Lento |
| Dano | Alto |
| Especial | Alta resistência |

**Descrição:** Unidade pesada com alto HP e dano devastador. Movimento lento, mas muito resistente.

---

### ✈️ Avião
| Atributo | Valor |
|----------|-------|
| HP | 60 |
| Velocidade | Muito Rápido |
| Dano | Baixo |
| Especial | Tiro rápido |

**Descrição:** Unidade rápida com alta taxa de disparo. Baixo HP, requer habilidade para evitar dano.

---

### ⚓ Navio
| Atributo | Valor |
|----------|-------|
| HP | 150 |
| Velocidade | Médio |
| Dano | Médio |
| Especial | Tiro triplo |

**Descrição:** Unidade com disparo triplo (spread). Bom equilíbrio entre resistência e poder de fogo.

---

## 🏆 Fases do Jogo

O jogo possui **12 fases** com mecânicas e ambientes únicos:

| Fase | Nome | Tipo | Objetivo | Dificuldade |
|------|------|------|----------|-------------|
| 1 | Campo de Batalha | Eliminação | Derrote 10 Inimigos | ⭐ |
| 2 | Torres de Vigilância | Destruição | Destrua 5 Torres | ⭐⭐ |
| 3 | Sobrevivência | Survival | Sobreviva 60s | ⭐⭐⭐ |
| 4 | Batalha Naval | Eliminação | Destrua 15 Inimigos | ⭐⭐⭐ |
| 5 | Base Final | Boss Fight | Destrua a Base! | ⭐⭐⭐⭐ |
| 6 | Assalto ao Trem | Especial | Complete 8 Vagões | ⭐⭐⭐⭐ |
| 7 | Tempestade de Neve | Especial | Destrua Geradores | ⭐⭐⭐⭐⭐ |
| 8 | Sky Fortress | Plataforma | Sobreviva 90s | ⭐⭐⭐⭐⭐ |
| 9 | Vertical Assault | Shmup | Waves de Inimigos | ⭐⭐⭐⭐⭐ |
| 10 | A Fuga | Chase | Destrua o Boss! | ⭐⭐⭐⭐⭐⭐ |
| 11 | Rota de Fuga | Racing | Complete o Percurso | ⭐⭐⭐⭐⭐⭐ |
| 12 | Sniper Elite | Precisão | 25 Eliminações | ⭐⭐⭐⭐⭐⭐ |

### Detalhes das Fases Especiais

#### 🚂 Fase 6 - Assalto ao Trem
Avance pelos vagões do trem eliminando inimigos. Cuidado com os túneis!

#### ❄️ Fase 7 - Tempestade de Neve
Enfrente uma nevasca enquanto destrói geradores de energia inimigos.

#### 🏰 Fase 8 - Sky Fortress
Fase de plataforma em uma fortaleza voadora. Pule entre plataformas e sobreviva!

#### 🚀 Fase 9 - Vertical Assault
Modo shooter vertical (shmup) com waves de inimigos vindo de cima.

#### 🏃 Fase 10 - A Fuga
Fuja de um boss enquanto elimina seus subordinados.

#### 🚗 Fase 11 - Rota de Fuga
Pilote um jeep em alta velocidade desviando de obstáculos.

#### 🎯 Fase 12 - Sniper Elite
Use precisão para eliminar 25 alvos com sua mira sniper.

---

## 💎 Sistema de Powerups

Powerups aparecem em caixas de bônus a cada 5-8 segundos. Colete-os para ganhar vantagens!

| Powerup | Ícone | Efeito | Duração |
|---------|-------|--------|---------|
| Munição Infinita | 🎯 | Sem recarregar | 10s |
| Escudo | 🛡️ | Imunidade a dano | 8s |
| Multi-Tiro | 🔱 | Dispara 3 projéteis | 9s |
| Velocidade | ⚡ | +80% velocidade | 8s |
| Dano Duplo | 💥 | 2x dano | 7s |
| Cura | ❤️ | +50% HP | Instantâneo |
| Congelar | ❄️ | Inimigos lentos | 9s |

---

## 🏗️ Arquitetura do Projeto

```
pixel-war-ultimate/
├── index.html              # Página principal do jogo
├── styles.css              # Estilos e layout
├── README.md               # Documentação
├── DEPLOY.md               # Guia de deploy
├── REMOTE-LOADING.md       # Doc. de carregamento remoto
│
├── js/                     # Frontend JavaScript
│   ├── audio.js            # Sistema de áudio
│   ├── config.js           # Configurações globais
│   ├── entities.js         # Entidades do jogo
│   ├── game.js             # Loop principal
│   ├── game-helpers.js     # Funções auxiliares
│   ├── particles.js        # Sistema de partículas
│   ├── sprites.js          # Sprites complementares
│   │
│   ├── phases/             # Fases especiais
│   │   ├── phase3-train.js
│   │   ├── phase3-backgrounds.js
│   │   ├── phase7-winter.js
│   │   ├── phase9-shmup.js
│   │   ├── phase10-escape.js
│   │   ├── phase11-escaperoute.js
│   │   └── phase12-sniper.js
│   │
│   ├── sprites/            # Sistema de sprites modular
│   │   ├── core.js
│   │   ├── soldier.js
│   │   ├── vehicles.js
│   │   ├── aircraft.js
│   │   ├── naval.js
│   │   ├── objects.js
│   │   └── enemies.js
│   │
│   └── systems/            # Sistemas do jogo
│       ├── auth.js         # Autenticação
│       ├── auth-ui.js      # UI de autenticação
│       ├── data-loader.js  # Carregamento de dados
│       ├── helpers.js      # Funções auxiliares
│       ├── i18n.js         # Internacionalização (PT/EN)
│       ├── input.js        # Sistema de input
│       ├── pause.js        # Sistema de pausa
│       ├── powerups.js     # Sistema de powerups
│       ├── server-helpers.js
│       └── ui-controls.js  # Controles de UI
│
└── server/                 # Backend Node.js
    ├── server.js           # Servidor Express
    ├── package.json        # Dependências
    │
    ├── data/               # Dados do jogo (JSON)
    │   ├── classes.json
    │   ├── enemies.json
    │   ├── levels-index.json
    │   ├── powerups.json
    │   └── levels/
    │       └── level-1.json ... level-12.json
    │
    ├── db/                 # Database
    │   ├── database.js     # Conexão PostgreSQL
    │   └── init-database.js
    │
    └── routes/             # API Routes
        ├── auth.js         # Autenticação
        ├── progress.js     # Progresso do jogador
        └── scores.js       # Rankings
```

---

## 🌐 Sistema de Multi-Idiomas

O jogo suporta **Português** e **Inglês**. 

- **Detecção automática:** Detecta o idioma do navegador
- **Troca manual:** Clique no botão 🌐 para alternar
- **Persistência:** A preferência é salva automaticamente

---

## 🔐 Sistema de Autenticação

### Funcionalidades
- Registro de conta com username/email
- Login seguro com JWT
- Salvamento de progresso na nuvem
- Sincronização de rankings

### API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/register` | POST | Criar conta |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Perfil do usuário |

---

## 🏆 Sistema de Ranking

### Categorias de Ranking
- **Geral** - Todos os scores
- **Semanal** - Últimos 7 dias
- **Diário** - Últimas 24 horas
- **Por Classe** - Soldado, Tanque, Avião, Navio

### API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ranking/submit` | POST | Enviar score |
| `/api/ranking/leaderboard/:category` | GET | Obter ranking |
| `/api/ranking/my-rankings` | GET | Meus rankings |

---

## 🚀 Como Executar

### Requisitos
- **Node.js** 18+
- **PostgreSQL** (para rankings e auth)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pixel-war-ultimate.git

# 2. Instale as dependências do servidor
cd pixel-war-ultimate/server
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env ou configure:
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=pixelwar
export DB_USER=postgres
export DB_PASSWORD=sua_senha
export JWT_SECRET=sua_chave_secreta

# 4. Inicialize o banco de dados
npm run db:init

# 5. Inicie o servidor
npm start

# 6. Abra o index.html no navegador
# Ou sirva com um servidor estático
```

### Produção

Consulte o arquivo [DEPLOY.md](DEPLOY.md) para instruções detalhadas de deploy.

---

## 📊 API do Servidor

### Endpoints de Dados

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/health` | Health check |
| `GET /api/init` | Todos dados iniciais |
| `GET /api/levels` | Índice de níveis |
| `GET /api/level/:id` | Dados do nível |
| `GET /api/enemies` | Stats dos inimigos |
| `GET /api/classes` | Stats das classes |
| `GET /api/powerups` | Lista de powerups |

---

## 💡 Dicas e Estratégias

1. **Mantenha-se em movimento** - Ficar parado é morte certa
2. **Colete os powerups** - Eles fazem muita diferença
3. **Use granadas sabiamente** (Soldado) - Ideal para grupos
4. **Conheça sua classe** - Cada uma tem pontos fortes
5. **Salve seu progresso** - Faça login para não perder avanço
6. **Aprenda os padrões** - Cada fase tem mecânicas únicas

---

## 🔧 Tecnologias Utilizadas

### Frontend
- HTML5 Canvas
- JavaScript ES6+
- CSS3 com animações
- Web Audio API

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT para autenticação
- bcrypt para senhas

---

## 📝 Licença

Este projeto é de código aberto para fins educacionais.

---

## 🎉 Créditos

Desenvolvido com ❤️ usando JavaScript vanilla, HTML5 Canvas e Node.js.

**Bom jogo, soldado! 🎖️**
