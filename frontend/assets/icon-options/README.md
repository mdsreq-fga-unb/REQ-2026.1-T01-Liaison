# App Icon Options — Liaison

Brand: navy `#1a2744` + gold `#d4813a` (design system).
Ativo atualmente: **L-italic-playfair** — aplicado em TODOS os lugares com logo.

## Onde o "L" está aplicado

| Lugar | Arquivo(s) | Forma |
|-------|-----------|-------|
| Launcher nativo (iOS/Android) | `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png` | L gold sobre navy |
| Header dentro do app (LoginScreen) | `assets/login_logo_icon.svg` | L navy na caixa gold |
| Favicon web | `assets/favicon.png` | L gold sobre navy |
| PWA (web instalado) | `web-pwa/pwa/{icon-192,icon-512,icon-512-maskable,apple-touch-icon-180}.png` | L gold; maskable com safe-zone |

Preview de tudo junto: `_src/all-places-preview.png`.
`login_logo_icon.svg` = glyph real extraído do Playfair Italic via `_src/gen_login_logo_svg.py`.
PWA: rodar build (`expo export -p web` + `scripts/pwa-postbuild.mjs`) pra propagar em `dist/` antes do deploy.

## Opções salvas

| Pasta | Descrição |
|-------|-----------|
| `L-serif-playfair` | "L" reto em Playfair Display Black. Sóbrio/acadêmico. |
| `L-italic-playfair` | "L" itálico Playfair Bold Italic. Elegante + legível no pequeno. **← ativo** |
| `L-script-parisienne` | "L" cursivo (Parisienne). Mais ornado; borra em tamanho pequeno. |

## Trocar de opção

Copiar os 4 PNGs da pasta escolhida para `assets/`:

```bash
cp assets/icon-options/<opcao>/*.png assets/
```

## Regenerar

Scripts + fontes em `_src/`. Rodar da pasta `frontend/`:

```bash
python3 assets/icon-options/_src/gen_L-script-parisienne.py
```

(Ajustar o caminho da fonte no script para `_src/` se rodar fora do scratchpad.)
`_src/script-compare.png` mostra GreatVibes vs Parisienne vs PinyonScript.
