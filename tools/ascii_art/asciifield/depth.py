"""Split one shaded field into stacked depth layers.

A painting carries no depth channel, so tone stands in for it: the darkest
readable values sit furthest back, the highlights come forward. Rendering each
band as its own element lets the page parallax them against each other.
"""

from .shading import EMPTY

# (id, lower bound, upper bound) over the weighted tone, back to front.
DEFAULT_BANDS = (
    ("atmosphere", 0.00, 0.34),
    ("architecture", 0.34, 0.62),
    ("figures", 0.62, 1.01),
)


def split(glyphs, ink, bands=DEFAULT_BANDS):
    """Return [(id, text_rows)] with each band masked out of the full field."""
    layers = []
    for name, low, high in bands:
        mask = (ink >= low) & (ink < high) & (glyphs != EMPTY)
        rows = []
        for row_glyphs, row_mask in zip(glyphs, mask):
            rows.append("".join(g if keep else EMPTY for g, keep in zip(row_glyphs, row_mask)).rstrip())
        layers.append((name, rows))
    return layers


def parse_bands(spec):
    """Parse "atmosphere:0:0.34,architecture:0.34:0.62,figures:0.62:1.01"."""
    if not spec:
        return DEFAULT_BANDS
    bands = []
    for chunk in spec.split(","):
        parts = chunk.split(":")
        if len(parts) != 3:
            raise SystemExit("bad --bands entry %r, expected name:low:high" % chunk)
        bands.append((parts[0], float(parts[1]), float(parts[2])))
    return tuple(bands)
