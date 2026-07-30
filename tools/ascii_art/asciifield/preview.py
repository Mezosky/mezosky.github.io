"""Render the generated layers to a PNG so they can be judged without a browser.

Development aid only: the site never loads this output.
"""

from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf",
    "/usr/share/fonts/opentype/fira/FiraMono-Medium.otf",
)

BACKGROUND = (11, 10, 9)
# Back-to-front, matching the opacity ramp the stylesheet uses.
LAYER_COLORS = ((92, 82, 66), (140, 122, 92), (206, 188, 152))


def _font(size):
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def write(path, layers, columns, rows, size=11):
    font = _font(size)
    cell_w = font.getlength("M")
    cell_h = size * 1.06
    image = Image.new("RGB", (int(columns * cell_w) + 2, int(rows * cell_h) + 2), BACKGROUND)
    draw = ImageDraw.Draw(image)

    for index, (_, art_rows) in enumerate(layers):
        color = LAYER_COLORS[min(index, len(LAYER_COLORS) - 1)]
        for r, line in enumerate(art_rows):
            for c, ch in enumerate(line):
                if ch != " ":
                    draw.text((1 + c * cell_w, 1 + r * cell_h), ch, font=font, fill=color)

    image.save(path)
    return path
