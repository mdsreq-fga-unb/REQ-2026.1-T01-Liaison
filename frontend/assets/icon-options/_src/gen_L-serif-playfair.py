from PIL import Image, ImageDraw, ImageFont

NAVY = (26, 39, 68)       # #1a2744
NAVY_DK = (15, 25, 41)    # header gradientTo #0f1929
GOLD = (212, 129, 58)     # #d4813a
GOLD_LT = (233, 165, 96)
CREAM = (250, 248, 244)

FONT = "node_modules/@expo-google-fonts/playfair-display/900Black/PlayfairDisplay_900Black.ttf"
OUT = "/root/code_projects/REQ-2026.1-T01-Liaison/frontend/assets/"


def vgrad(size, top, bot):
    img = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        img.putpixel((0, y), tuple(int(top[c] + (bot[c] - top[c]) * t) for c in range(3)))
    return img.resize((size, size))


def grad_fill(size, top, bot):
    """gold vertical gradient as RGB image"""
    return vgrad(size, top, bot)


def render_L(sz, fontsize, fill_grad):
    """Return RGBA sz x sz, gold gradient 'L' centered on transparent bg."""
    S = 2
    cv = sz * S
    font = ImageFont.truetype(FONT, int(fontsize * S))
    # glyph mask
    mask = Image.new("L", (cv, cv), 0)
    md = ImageDraw.Draw(mask)
    bbox = md.textbbox((0, 0), "L", font=font)
    gw, gh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (cv - gw) / 2 - bbox[0]
    y = (cv - gh) / 2 - bbox[1]
    md.text((x, y), "L", font=font, fill=255)
    # fill with gradient
    grad = grad_fill(cv, fill_grad[0], fill_grad[1]).convert("RGBA")
    out = Image.new("RGBA", (cv, cv), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out.resize((sz, sz), Image.LANCZOS)


# 1. App icon: navy gradient bg + gold L
sz = 1024
icon = vgrad(sz, NAVY, NAVY_DK).convert("RGBA")
icon.alpha_composite(render_L(sz, 900, (GOLD_LT, GOLD)))
icon.convert("RGB").save(OUT + "icon.png")

# 2. Adaptive foreground (safe zone padding)
render_L(1024, 620, (GOLD_LT, GOLD)).save(OUT + "adaptive-icon.png")

# 3. Splash mark (gold L, transparent -> navy bg via app.json)
render_L(1024, 720, (GOLD_LT, GOLD)).save(OUT + "splash-icon.png")

# 4. Favicon
icon.resize((48, 48), Image.LANCZOS).convert("RGB").save(OUT + "favicon.png")
print("done")
