"""Turn a source painting into the numeric grids the shader needs."""

from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageOps

# A monospaced character cell is taller than it is wide. Sampling with the same
# ratio keeps the artwork from looking vertically stretched.
DEFAULT_CELL_ASPECT = 1.75

# Gradients are measured on a grid this many times finer than the character
# grid, then averaged down, so an edge that falls between two cells still reads.
GRADIENT_OVERSAMPLE = 3


@dataclass
class Field:
    """Per-character-cell measurements of the source image."""

    cols: int
    rows: int
    tone: np.ndarray  # rows x cols, 0 = black, 1 = white
    angle: np.ndarray  # rows x cols, edge orientation in radians
    edge: np.ndarray  # rows x cols, edge strength, 0..1


def load(path):
    return Image.open(path).convert("L")


def load_rgb(path):
    """The colour original, used only for the faint plate behind the text."""
    return Image.open(path).convert("RGB")


def crop_fraction(image, box):
    """Crop with fractional coordinates so a crop survives a change of scan."""
    if box is None:
        return image
    left, top, right, bottom = box
    w, h = image.size
    return image.crop((round(left * w), round(top * h), round(right * w), round(bottom * h)))


def mirror(image, horizontal=False, vertical=False):
    """Flip the source. Purely compositional: the page keeps its dense mass on
    the right and its quiet space on the left, whichever way the painting runs."""
    if horizontal:
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    if vertical:
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    return image


def derive_rows(image, cols, cell_aspect=DEFAULT_CELL_ASPECT):
    w, h = image.size
    return max(1, round(cols * h / (w * cell_aspect)))


def _levels(tone, black, white, gamma):
    """Map [black, white] onto [0, 1] and bend the midtones."""
    tone = np.clip((tone - black) / max(white - black, 1e-6), 0.0, 1.0)
    if gamma and gamma != 1.0:
        tone = tone**gamma
    return tone


def measure(image, cols, rows, black=0.0, white=1.0, gamma=1.0, autocontrast=True, invert=False):
    """Sample the image down to one tone and one edge reading per cell.

    `invert` swaps which end of the range becomes ink. A dark painting reads
    correctly as-is: light subjects become characters, the dark ground stays
    empty. A bright painting is the other way round, and without inverting it the
    sky fills with glyphs while the forms disappear.
    """
    if autocontrast:
        image = ImageOps.autocontrast(image, cutoff=1)

    tone = np.asarray(image.resize((cols, rows), Image.LANCZOS), dtype=np.float32) / 255.0
    if invert:
        tone = 1.0 - tone
    tone = _levels(tone, black, white, gamma)

    fine = np.asarray(
        image.resize((cols * GRADIENT_OVERSAMPLE, rows * GRADIENT_OVERSAMPLE), Image.LANCZOS),
        dtype=np.float32,
    )
    gy, gx = np.gradient(fine)
    gx = _block_mean(gx, GRADIENT_OVERSAMPLE)
    gy = _block_mean(gy, GRADIENT_OVERSAMPLE)

    # The visible stroke runs perpendicular to the luminance gradient.
    angle = np.arctan2(gy, gx) + np.pi / 2.0
    magnitude = np.hypot(gx, gy)
    peak = np.percentile(magnitude, 99.5) or 1.0
    edge = np.clip(magnitude / peak, 0.0, 1.0)

    return Field(cols=cols, rows=rows, tone=tone, angle=angle, edge=edge)


def _block_mean(array, factor):
    rows, cols = array.shape
    return array.reshape(rows // factor, factor, cols // factor, factor).mean(axis=(1, 3))
