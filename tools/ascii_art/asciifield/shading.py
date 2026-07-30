"""Choose a character for every cell of the field.

Two readings are combined. Tone alone gives a dithered photograph; tone plus
edge orientation gives silhouettes you can actually read, which is what makes
the result look drawn rather than sampled.
"""

import numpy as np

from .ramps import EDGE_GLYPHS

EMPTY = " "


def shade(field, ramp, weight=None, floor=0.06, edge_quantile=0.82, edge_bias=0.35):
    """Return a rows x cols array of characters plus the weighted tone used.

    `floor` is the tone below which a cell stays blank, so the dark parts of the
    painting dissolve into the page background instead of being filled in.
    `edge_quantile` selects how much of the field is drawn as strokes; the rest
    is shaded from the ramp.
    """
    tone = field.tone if weight is None else field.tone * weight
    ink = np.where(tone >= floor, tone, 0.0)
    drawn = ink > 0.0

    glyphs = np.full(tone.shape, EMPTY, dtype="<U1")

    # Tonal shading.
    levels = len(ramp) - 1
    index = np.clip(np.rint(ink * levels).astype(int), 0, levels)
    index[drawn] = np.maximum(index[drawn], 1)  # never shade a drawn cell as blank
    shaded = np.take(np.array(list(ramp), dtype="<U1"), index)
    glyphs[drawn] = shaded[drawn]

    # Edge strokes on top, only where the edge is both strong and lit.
    if edge_quantile is not None and drawn.any():
        strength = field.edge * (edge_bias + (1.0 - edge_bias) * np.clip(tone / max(floor, 1e-6), 0.0, 1.0))
        threshold = np.quantile(strength[drawn], edge_quantile)
        stroke = drawn & (strength >= threshold)
        bucket = np.rint((field.angle % np.pi) / (np.pi / 4.0)).astype(int) % 4
        glyphs[stroke] = np.take(np.array(EDGE_GLYPHS, dtype="<U1"), bucket)[stroke]

    return glyphs, ink


def to_text(glyphs):
    return "\n".join("".join(row).rstrip() for row in glyphs)
