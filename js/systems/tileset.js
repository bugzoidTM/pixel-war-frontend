// ============ TILESET KENNEY (CC0) ============
// Atlas único de 128x64px (25 tiles de 16px) montado a partir dos packs
// Tiny Battle / Tiny Town / Pixel Shmup do Kenney (kenney.nl) — licença CC0.
// Ver assets/CREDITS.md e assets/build-atlas.py.
//
// Regras de performance (o jogo NÃO pode ficar pesado):
// - 1 único PNG de ~2.5KB, carregado de forma assíncrona;
// - o chão é pré-renderizado UMA vez em canvas offscreen -> 1 drawImage por frame
//   (mais barato que o checkerboard por fillRect que existia antes);
// - enquanto o atlas não carrega (ou se falhar), tudo cai no desenho procedural
//   antigo. Nenhum caminho novo é obrigatório para o jogo rodar.

const KenneyTiles = (function () {
    const TILE = 16;
    const COLS = 8;

    // nome -> índice no atlas (ver assets/build-atlas.py)
    const INDEX = {
        grass_a: 0, grass_b: 1, grass_c: 2,
        dirt_a: 3, dirt_b: 4, dirt_c: 5,
        tree_pine: 6, tree_small: 7, tree_round: 8,
        bush: 9, trees_double: 10, rock: 11,
        crate: 12, barrel: 13, fence: 14, flag: 15,
        barricade_x: 16, wire: 17, truck: 18,
        bld_a: 19, bld_b: 20, bld_c: 21, bld_d: 22,
        heart: 23, medkit: 24, shield: 25, bomb: 26
    };

    // Terreno por tema de parallax (os demais temas caem no default)
    // (o tile "liso" domina; os decorados entram como tempero, senão vira estampa)
    const G = 'grass_a', D = 'dirt_a';
    const grass = [G, G, G, G, G, G, G, G, G, G, 'grass_b', G, G, G, G, G, G, G, 'grass_c', G];
    const dirt  = [D, D, D, D, D, D, D, 'dirt_b', D, D, D, D, D, D, 'dirt_b', D];
    const TERRAIN = {
        forest: grass, default: grass, night: grass,
        desert: dirt, urban: dirt, war: dirt
    };

    const img = new Image();
    let ready = false;
    img.onload = () => { ready = true; api.ready = true; };
    img.onerror = () => { console.warn('⚠️ Kenney atlas não carregou — usando cenário procedural'); };
    img.src = 'assets/kenney-atlas.png';

    // Cache do chão pré-renderizado: chave = tema|cor|largura|altura
    let groundCache = null;
    let groundKey = '';

    function drawTile(ctx, name, x, y, scale) {
        if (!ready) return false;
        const idx = INDEX[name];
        if (idx === undefined) return false;
        const s = scale || 2;
        ctx.drawImage(
            img,
            (idx % COLS) * TILE, Math.floor(idx / COLS) * TILE, TILE, TILE,
            Math.round(x), Math.round(y), TILE * s, TILE * s
        );
        return true;
    }

    // Monta (uma vez) a faixa de chão tileada, com um tint da cor do nível por cima
    // para preservar a identidade cromática de cada fase.
    function buildGround(theme, tintColor, width, height) {
        const set = TERRAIN[theme] || TERRAIN.default;
        const s = 2;                 // 16px * 2 = 32px por tile (casa com PIXEL_SCALE)
        const step = TILE * s;
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        const g = c.getContext('2d');
        g.imageSmoothingEnabled = false;

        for (let y = 0, ty = 0; y < height; y += step, ty++) {
            for (let x = 0, tx = 0; x < width; x += step, tx++) {
                // hash determinístico (mesmo layout entre frames, sem Math.random e
                // sem o padrão diagonal que uma soma linear produziria)
                const h = ((tx * 73856093) ^ (ty * 19349663) ^ ((tx * ty) * 83492791)) >>> 0;
                drawTile(g, set[h % set.length], x, y, s);
            }
        }

        // Tint com a cor de fundo do nível (identidade da fase) + escurecimento
        // gradual no topo, para o horizonte não "cortar" a cena.
        if (tintColor) {
            g.globalCompositeOperation = 'multiply';
            g.globalAlpha = 0.55;
            g.fillStyle = tintColor;
            g.fillRect(0, 0, width, height);
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
        }

        const shade = g.createLinearGradient(0, 0, 0, height);
        shade.addColorStop(0, 'rgba(0,0,0,0.35)');
        shade.addColorStop(0.35, 'rgba(0,0,0,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.25)');
        g.fillStyle = shade;
        g.fillRect(0, 0, width, height);

        return c;
    }

    // Desenha o chão tileado. Retorna false se o atlas ainda não carregou
    // (o chamador então usa o gradiente procedural antigo).
    function drawGround(ctx, theme, tintColor, x, y, width, height) {
        if (!ready || width <= 0 || height <= 0) return false;
        const key = `${theme}|${tintColor}|${width}x${height}`;
        if (key !== groundKey) {
            groundCache = buildGround(theme, tintColor, width, height);
            groundKey = key;
        }
        ctx.drawImage(groundCache, Math.round(x), Math.round(y));
        return true;
    }

    const api = {
        ready: false,
        TILE,
        names: INDEX,
        draw: drawTile,
        drawGround,
        has(name) { return ready && INDEX[name] !== undefined; }
    };
    return api;
})();
