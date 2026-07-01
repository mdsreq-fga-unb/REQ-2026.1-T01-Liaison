from PIL import Image, ImageDraw, ImageFont

NAVY = (26, 39, 68)
NAVY_DK = (15, 25, 41)
GOLD = (212, 129, 58)
GOLD_LT = (233, 165, 96)
SP = "/tmp/claude-0/-root-code-projects-REQ-2026-1-T01-Liaison/7d4e1393-7939-4f9e-8056-53cfe6dfb47d/scratchpad/"
FONT = SP + "Parisienne-Regular.ttf"
OUT = "/root/code_projects/REQ-2026.1-T01-Liaison/frontend/assets/"


def vgrad(size, top, bot):
    img = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        img.putpixel((0, y), tuple(int(top[c] + (bot[c] - top[c]) * t) for c in range(3)))
    return img.resize((size, size))


def render_L(sz, fontsize):
    S = 2
    cv = sz * S
    font = ImageFont.truetype(FONT, int(fontsize * S))
    mask = Image.new("L", (cv, cv), 0)
    md = ImageDraw.Draw(mask)
    bbox = md.textbbox((0, 0), "L", font=font)
    gw, gh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (cv - gw) / 2 - bbox[0]
    y = (cv - gh) / 2 - bbox[1]
    md.text((x, y), "L", font=font, fill=255)
    grad = vgrad(cv, GOLD_LT, GOLD).convert("RGBA")
    out = Image.new("RGBA", (cv, cv), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out.resize((sz, sz), Image.LANCZOS)


sz = 1024
icon = vgrad(sz, NAVY, NAVY_DK).convert("RGBA")
icon.alpha_composite(render_L(sz, 760))
icon.convert("RGB").save(OUT + "icon.png")

render_L(1024, 560).save(OUT + "adaptive-icon.png")
render_L(1024, 680).save(OUT + "splash-icon.png")
icon.resize((48, 48), Image.LANCZOS).convert("RGB").save(OUT + "favicon.png")
print("done")
