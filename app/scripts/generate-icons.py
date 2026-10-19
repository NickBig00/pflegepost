"""Generates the app icon, adaptive Android icons, splash icon and favicon.

Motif: a warm envelope with a terracotta seal and a small heart on sage.
Run: python3 scripts/generate-icons.py  (needs Pillow)
"""

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images"
S = 4  # supersampling factor for smooth edges
SIZE = 1024

SAGE = (58, 102, 80, 255)
PAPER = (246, 243, 237, 255)
FLAP = (207, 199, 185, 255)
SEAL = (201, 104, 72, 255)
WHITE = (255, 255, 255, 255)


def envelope(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float, mono: bool = False) -> None:
    """Draws the envelope with seal centred at (cx, cy); scale 1.0 = 560 px wide at 1024."""
    w, h, r = 560 * scale, 392 * scale, 60 * scale
    left, top = cx - w / 2, cy - h / 2
    paper = WHITE if mono else PAPER
    draw.rounded_rectangle([left, top, left + w, top + h], radius=r, fill=paper)
    apex = (cx, top + h * 0.56)
    stroke = round(26 * scale)
    # In the monochrome icon the flap is cut out of the silhouette.
    draw.line([(left + r * 0.7, top + r * 0.55), apex, (left + w - r * 0.7, top + r * 0.55)],
              fill=(0, 0, 0, 0) if mono else FLAP, width=stroke, joint="curve")
    # Seal with a heart
    sr = 84 * scale
    sx, sy = apex[0], apex[1] + 6 * scale
    seal = (0, 0, 0, 0) if mono else SEAL
    draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=seal)
    heart = paper
    hr = 22 * scale
    draw.ellipse([sx - 2 * hr, sy - 1.6 * hr, sx, sy + 0.4 * hr], fill=heart)
    draw.ellipse([sx, sy - 1.6 * hr, sx + 2 * hr, sy + 0.4 * hr], fill=heart)
    draw.polygon([(sx - 1.93 * hr, sy - 0.25 * hr), (sx + 1.93 * hr, sy - 0.25 * hr), (sx, sy + 2.0 * hr)], fill=heart)


def canvas(bg=(0, 0, 0, 0)) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (SIZE * S, SIZE * S), bg)
    return img, ImageDraw.Draw(img)


def save(img: Image.Image, name: str, size: int = SIZE) -> None:
    img.resize((size, size), Image.LANCZOS).save(OUT / name)


def main() -> None:
    c = SIZE * S / 2

    # iOS / store icon: full bleed, the system applies the mask.
    img, d = canvas(SAGE)
    envelope(d, c, c, S * 1.22)
    save(img, "icon.png")

    # Android adaptive: foreground within the 66 % safe zone, solid background.
    img, d = canvas()
    envelope(d, c, c, S * 0.88)
    save(img, "android-icon-foreground.png")
    Image.new("RGBA", (SIZE, SIZE), SAGE).save(OUT / "android-icon-background.png")

    # Android themed (monochrome) icon: silhouette with cut-out seal.
    img, d = canvas()
    envelope(d, c, c, S * 0.88, mono=True)
    save(img, "android-icon-monochrome.png")

    # Splash and favicon: rounded tile, readable on the warm canvas.
    img, d = canvas()
    d.rounded_rectangle([0, 0, SIZE * S, SIZE * S], radius=230 * S, fill=SAGE)
    envelope(d, c, c, S * 1.22)
    save(img, "splash-icon.png")
    save(img, "favicon.png", 48)


if __name__ == "__main__":
    main()
