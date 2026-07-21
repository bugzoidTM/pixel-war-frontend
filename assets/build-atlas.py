#!/usr/bin/env python3
"""Monta um atlas 16x16 apenas com os tiles Kenney (CC0) usados pelo Pixel War."""
from PIL import Image

SRC = {
    'TB': ('ext/kenney_tiny-battle/Tilemap/tilemap_packed.png', 18),
    'TT': ('ext/kenney_tiny-town/Tilemap/tilemap_packed.png', 12),
    'PS': ('ext/kenney_pixel-shmup/Tilemap/tiles_packed.png', 12),
}

# nome -> (pack, indice no tilesheet original)
TILES = [
    # --- terreno (tileavel, sem contorno) ---
    ('grass_a',      'TB', 0),
    ('grass_b',      'TB', 1),
    ('grass_c',      'TB', 2),
    ('dirt_a',       'TT', 25),
    ('dirt_b',       'TT', 41),
    ('dirt_c',       'TT', 39),
    # --- cenario ---
    ('tree_pine',    'TT', 4),
    ('tree_small',   'TT', 7),
    ('tree_round',   'TT', 28),
    ('bush',         'TB', 94),
    ('trees_double', 'TB', 112),
    ('rock',         'TT', 92),
    ('crate',        'TT', 106),
    ('barrel',       'TT', 104),
    ('fence',        'TT', 45),
    ('flag',         'TB', 16),
    ('barricade_x',  'TB', 23),
    ('wire',         'TB', 25),
    ('truck',        'TB', 96),
    # --- predios (camada media urbana) ---
    ('bld_a',        'TB', 8),
    ('bld_b',        'TB', 9),
    ('bld_c',        'TB', 10),
    ('bld_d',        'TB', 11),
    # --- icones de HUD/powerup ---
    ('heart',        'TB', 195),
    ('medkit',       'PS', 24),
    ('shield',       'PS', 26),
    ('bomb',         'TT', 105),
]

COLS = 8
T = 16

def main():
    imgs = {k: Image.open(v[0]).convert('RGBA') for k, v in SRC.items()}
    rows = (len(TILES) + COLS - 1) // COLS
    atlas = Image.new('RGBA', (COLS * T, rows * T), (0, 0, 0, 0))

    for n, (name, pack, idx) in enumerate(TILES):
        im = imgs[pack]
        cols = SRC[pack][1]
        sx, sy = (idx % cols) * T, (idx // cols) * T
        tile = im.crop((sx, sy, sx + T, sy + T))
        atlas.paste(tile, ((n % COLS) * T, (n // COLS) * T))

    atlas = atlas.quantize(colors=64, method=Image.FASTOCTREE).convert('RGBA')
    atlas.save('kenney-atlas.png', optimize=True)

    print('atlas', atlas.size, 'tiles', len(TILES))
    print('JS index map:')
    print(',\n'.join(f"    {name}: {n}" for n, (name, _, _) in enumerate(TILES)))

if __name__ == '__main__':
    main()
