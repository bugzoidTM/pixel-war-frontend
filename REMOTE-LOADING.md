# Pixel War Ultimate - Remote Content Loading

## Arquitetura

Este jogo utiliza a técnica **Remote Content Loading** (Server-Side Data Authority):

- **Motor do Jogo** (Cliente): Física, gráficos, som - tudo roda no navegador
- **Dados do Jogo** (Servidor): Fases, atributos, waves, configurações - ficam no servidor

### Por que isso importa?

Se alguém copiar o código do cliente, terá um "carro sem gasolina":
- O jogo abre ✅
- O boneco anda ✅
- Mas nada acontece porque não sabe quais inimigos criar ❌

## Estrutura

```
pixel-war-ultimate/
├── server/                     # Servidor Node.js
│   ├── server.js               # API Express
│   ├── package.json            # Dependências
│   └── data/                   # JSONs de dados
│       ├── enemies.json        # Stats de todos inimigos
│       ├── classes.json        # Stats das classes do player
│       ├── powerups.json       # Lista de powerups
│       ├── levels-index.json   # Índice de fases
│       └── levels/             # Configuração de cada fase
│           ├── level-1.json
│           ├── level-2.json
│           └── ...
│
├── js/
│   ├── systems/
│   │   ├── data-loader.js      # 🆕 Sistema de carregamento remoto
│   │   └── server-helpers.js   # 🆕 Helpers para dados do servidor
│   └── ...
│
└── pixel-war-final.html        # Jogo principal
```

## Como Rodar

### 1. Instalar dependências
```bash
cd server
npm install
```

### 2. Iniciar servidor
```bash
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

### 3. Acessar o jogo
Abra: http://localhost:3000

## API Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/init` | Todos os dados iniciais (batch) |
| `GET /api/levels` | Índice de fases |
| `GET /api/level/:id` | Configuração de uma fase específica |
| `GET /api/enemies` | Stats de todos inimigos |
| `GET /api/classes` | Stats das classes do player |
| `GET /api/powerups` | Lista de powerups |

## Cache com ETag

O sistema implementa cache eficiente:

1. **Cliente faz requisição** → Servidor retorna dados + ETag
2. **Dados salvos no localStorage** com ETag
3. **Próxima requisição** → Cliente envia `If-None-Match: <ETag>`
4. **Se dados não mudaram** → Servidor retorna `304 Not Modified`
5. **Cliente usa cache local** → Zero transferência de dados!

## Fluxo de Carregamento

```
┌─────────────────┐
│  Clica INICIAR  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Loading Screen  │──────────────────────┐
│ "Conectando..." │                      │
└────────┬────────┘                      │
         │                               │
         ▼                               │
┌─────────────────┐                      │
│ GET /api/init   │◄─────────────────────┤
│ (enemies,       │      Server          │
│  classes,       │                      │
│  powerups,      │                      │
│  levels index)  │                      │
└────────┬────────┘                      │
         │                               │
         ▼                               │
┌─────────────────┐                      │
│ GET /api/level/1│◄─────────────────────┤
│ (config fase 1) │                      │
└────────┬────────┘                      │
         │                               │
         ▼                               │
┌─────────────────┐
│    GAMEPLAY     │  (100% local, sem lag)
│   (sem server)  │
└─────────────────┘
```

## Dados Movidos para o Servidor

### ✅ No Servidor (server/data/)
- Array `levels` (todas as fases)
- Stats de inimigos (hp, dano, velocidade)
- Stats das classes do player
- Configurações especiais (TRAIN_CONFIG, WINTER_CONFIG, etc.)
- Lista de powerups
- Waves de inimigos por fase
- Difficulty tiers (Sniper)
- Track challenges (Escape Route)

### ❌ Permanece no Cliente
- PALETTES (cores visuais)
- Funções de desenho (sprites)
- Lógica de input
- Sistema de áudio
- Sistema de partículas
- Helpers visuais (PIXEL_SCALE)

## Customização

### Adicionar nova fase
1. Crie `server/data/levels/level-13.json`
2. Adicione entrada em `server/data/levels-index.json`
3. Reinicie o servidor

### Modificar stats de inimigo
1. Edite `server/data/enemies.json`
2. Reinicie o servidor (ou aguarde ETag expirar)

### Adicionar novo powerup
1. Edite `server/data/powerups.json`
2. Reinicie o servidor

## Segurança (Futuro)

Para produção, considere:
- Rate limiting nos endpoints
- Autenticação por token
- Validação server-side de scores
- HTTPS em produção
