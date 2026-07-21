# Créditos de assets

O arquivo `kenney-atlas.png` (128×64px, ~2.7KB) é um atlas montado por nós contendo
apenas os 27 tiles de 16×16 efetivamente usados pelo jogo, recortados dos packs
gratuitos do **Kenney** (<https://kenney.nl/assets>):

| Pack | Site | Uso no jogo |
|------|------|-------------|
| Tiny Battle | <https://kenney.nl/assets/tiny-battle> | grama, árvores/arbustos, ouriço antitanque, cerca de arame, caminhão, prédios, coração de HUD |
| Tiny Town | <https://kenney.nl/assets/tiny-town> | terra/solo batido, pinheiros, engradado, barril, cerca, bomba |
| Pixel Shmup | <https://kenney.nl/assets/pixel-shmup> | ícones de kit médico e escudo |

**Licença:** todos os packs do Kenney acima são **CC0 1.0 (domínio público)** — uso
comercial liberado, atribuição não obrigatória (mas mantida aqui por cortesia).

## Como regerar o atlas

`build-atlas.py` documenta exatamente quais tiles vieram de onde. Para regerar
(ex.: adicionar um tile novo), baixe os três `.zip` do Kenney, extraia em `ext/` e:

```bash
python3 build-atlas.py   # requer Pillow
```

O script imprime o mapa `nome -> índice`, que precisa bater com o `INDEX` de
`js/systems/tileset.js`.

## Por que um atlas próprio em vez dos packs inteiros

Os tilesheets originais somam ~23KB e trazem ~450 tiles, sendo que usamos 27.
O atlas recortado mantém o download em ~2.7KB e uma única requisição HTTP.
