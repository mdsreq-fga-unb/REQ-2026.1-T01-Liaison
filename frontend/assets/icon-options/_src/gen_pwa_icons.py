from PIL import Image, ImageDraw, ImageFont

NAVY = (26, 39, 68)
NAVY_DK = (15, 25, 41)
GOLD = (212, 129, 58)
GOLD_LT = (233, 165, 96)
WHITE = (255, 255, 255)
SP = "/tmp/claude-0/-root-code-projects-REQ-2026-1-T01-Liaison/7d4e1393-7939-4f9e-8056-53cfe6dfb47d/scratchpad/"
ITALIC = "node_modules/@expo-google-fonts/playfair-display/700Bold_Italic/PlayfairDisplay_700Bold_Italic.ttf"
PLAYFAIR = "node_modules/@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf"
DMSANS = "node_modules/@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf"
PWA = "/root/code_projects/REQ-2026.1-T01-Liaison/frontend/web-pwa/pwa/"


def vgrad(size, top, bot):
    img = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        img.putpixel((0, y), tuple(int(top[c] + (bot[c] - top[c]) * t) for c in range(3)))
    return img.resize((size, size))


def gold_L(sz, frac, bg_grad=True):
    """navy(or grad) bg square with gold italic L, RGB"""
    S = 2
    cv = sz * S
    base = (vgrad(cv, NAVY, NAVY_DK) if bg_grad else Image.new("RGB", (cv, cv), NAVY)).convert("RGBA")
    font = ImageFont.truetype(ITALIC, int(sz * frac * S))
    mask = Image.new("L", (cv, cv), 0)
    md = ImageDraw.Draw(mask)
    b = md.textbbox((0, 0), "L", font=font)
    gw, gh = b[2] - b[0], b[3] - b[1]
    md.text(((cv - gw) / 2 - b[0], (cv - gh) / 2 - b[1]), "L", font=font, fill=255)
    grad = vgrad(cv, GOLD_LT, GOLD).convert("RGBA")
    base.paste(grad, (0, 0), mask)
    return base.resize((sz, sz), Image.LANCZOS).convert("RGB")


# ---- regenerate PWA source icons ----
gold_L(192, 0.66).save(PWA + "icon-192.png")
gold_L(512, 0.66).save(PWA + "icon-512.png")
gold_L(180, 0.66).save(PWA + "apple-touch-icon-180.png")
gold_L(512, 0.46).save(PWA + "icon-512-maskable.png")  # safe zone for maskable

# ---- also refresh dist copies so a redeploy w/o rebuild shows new icons ----
import os
DIST = "/root/code_projects/REQ-2026.1-T01-Liaison/frontend/dist/pwa/"
if os.path.isdir(DIST):
    for n in ("icon-192.png", "icon-512.png", "apple-touch-icon-180.png", "icon-512-maskable.png"):
        Image.open(PWA + n).save(DIST + n)

# ---- PREVIEW montage ----
W, H = 1180, 720
cv = Image.new("RGB", (W, H), (244, 243, 240))
d = ImageDraw.Draw(cv)
h1 = ImageFont.truetype(PLAYFAIR, 30)
lab = ImageFont.truetype(DMSANS, 20)

# A) in-app login header mock (matches LoginScreen: navy bar, gold 36 box + navy L, wordmark)
d.text((40, 24), "1. Header dentro do app (LoginScreen)", font=h1, fill=(20, 20, 20))
bar_w, bar_h = 500, 94
bar = vgrad(bar_h, NAVY, NAVY_DK).resize((bar_w, bar_h)).convert("RGB")
bd = ImageDraw.Draw(bar)
# gold rounded box 36 at left:24 top:29
box = 36
bx, by = 24, 29
bd.rounded_rectangle([bx, by, bx + box, by + box], radius=8, fill=GOLD)
# navy italic L inside box
lf = ImageFont.truetype(ITALIC, 30)
lb = bd.textbbox((0, 0), "L", font=lf)
lw, lh = lb[2] - lb[0], lb[3] - lb[1]
bd.text((bx + (box - lw) / 2 - lb[0], by + (box - lh) / 2 - lb[1]), "L", font=lf, fill=NAVY)
# wordmark
wf = ImageFont.truetype(PLAYFAIR, 22)
tf = ImageFont.truetype(DMSANS, 11)
bd.text((72, 24), "Liaison", font=wf, fill=WHITE)
bd.text((72, 52), "PLATAFORMA DE VOLUNTARIADO", font=tf, fill=(150, 158, 175))
cv.paste(bar, (40, 70))

# B) PWA / launcher icons row
d.text((40, 210), "2. Favicon + PWA (web / instalado no celular)", font=h1, fill=(20, 20, 20))
items = [
    ("favicon 48", gold_L(48, 0.66), 48),
    ("192", gold_L(96, 0.66), 96),
    ("512", gold_L(140, 0.66), 140),
    ("512 maskable", gold_L(140, 0.46), 140),
    ("apple-touch 180", gold_L(120, 0.66), 120),
]
x = 40
y = 270
for name, img, sz in items:
    # rounded present
    m = Image.new("L", (sz, sz), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, sz, sz], radius=int(sz * 0.22), fill=255)
    tile = Image.new("RGB", (sz, sz), (244, 243, 240))
    tile.paste(img, (0, 0), m)
    cv.paste(tile, (x, y + (140 - sz)))
    d.text((x, y + 150), name, font=lab, fill=(60, 60, 60))
    x += sz + 40

# C) maskable circle-cropped (Android) demo
d.text((40, 470), "3. Maskable recortado (círculo Android)", font=h1, fill=(20, 20, 20))
msk = gold_L(160, 0.46)
cm = Image.new("L", (160, 160), 0)
ImageDraw.Draw(cm).ellipse([0, 0, 160, 160], fill=255)
tile = Image.new("RGB", (160, 160), (244, 243, 240))
tile.paste(msk, (0, 0), cm)
cv.paste(tile, (40, 520))
# rounded squircle android
sq = gold_L(160, 0.46)
sm = Image.new("L", (160, 160), 0)
ImageDraw.Draw(sm).rounded_rectangle([0, 0, 160, 160], radius=48, fill=255)
tile2 = Image.new("RGB", (160, 160), (244, 243, 240))
tile2.paste(sq, (0, 0), sm)
cv.paste(tile2, (240, 520))
d.text((40, 690), "L dentro da safe-zone -> não corta no recorte", font=lab, fill=(60, 60, 60))

cv.save(SP + "all_places_preview.png")
print("done")
