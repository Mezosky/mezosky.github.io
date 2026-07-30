"""Export the cropped source image that sits behind the ASCII.

The page shows this at very low opacity so the reader can make out what the
characters are describing. It has to come from exactly the same crop as the
grid, otherwise the photograph and the text drift out of register.
"""

import os

from PIL import Image

DEFAULT_WIDTH = 1200
DEFAULT_QUALITY = 72


def write(image, path, width=DEFAULT_WIDTH, quality=DEFAULT_QUALITY):
    """Resize the already-cropped source and save it next to the site assets."""
    w, h = image.size
    if width and width < w:
        image = image.resize((width, round(width * h / w)), Image.LANCZOS)

    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)

    params = {}
    if path.lower().endswith(".webp"):
        params = {"quality": quality, "method": 6}
    elif path.lower().endswith((".jpg", ".jpeg")):
        params = {"quality": quality, "optimize": True, "progressive": True}

    image.convert("RGB").save(path, **params)
    return image.size
