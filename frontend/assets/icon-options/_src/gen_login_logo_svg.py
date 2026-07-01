from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

FONT = "node_modules/@expo-google-fonts/playfair-display/700Bold_Italic/PlayfairDisplay_700Bold_Italic.ttf"
NAVY = "#1a2744"
VB = 100.0
PAD = 12.0

font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
gname = cmap[ord("L")]

# path in font units (y-up)
spen = SVGPathPen(gs)
gs[gname].draw(spen)
d = spen.getCommands()

# bounds
bpen = BoundsPen(gs)
gs[gname].draw(bpen)
xmin, ymin, xmax, ymax = bpen.bounds
gw, gh = xmax - xmin, ymax - ymin
avail = VB - 2 * PAD
s = avail / max(gw, gh)
tx = (VB - gw * s) / 2 - s * xmin
ty = (VB - gh * s) / 2 + s * ymax  # y-flip

svg = f'''<svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<g transform="matrix({s:.5f},0,0,{-s:.5f},{tx:.4f},{ty:.4f})">
<path d="{d}" fill="{NAVY}"/>
</g>
</svg>
'''

out = "/root/code_projects/REQ-2026.1-T01-Liaison/frontend/assets/login_logo_icon.svg"
with open(out, "w") as f:
    f.write(svg)
print("wrote", out)
print("upm", font["head"].unitsPerEm, "bounds", bpen.bounds, "scale", round(s, 4))
