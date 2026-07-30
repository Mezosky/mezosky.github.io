"""Spatial weights that thin the artwork out where the page needs quiet.

The hero copy sits on the left, so the field is faded there rather than being
covered up later: fewer characters means less markup and a calmer composition.
"""

import numpy as np


def _smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def horizontal(cols, rows, start=0.0, end=0.45, floor=0.0):
    """Ramp from `floor` at column `start` up to 1 at column `end`."""
    x = np.linspace(0.0, 1.0, cols, dtype=np.float32)
    ramp = _smoothstep((x - start) / max(end - start, 1e-6))
    ramp = floor + (1.0 - floor) * ramp
    return np.tile(ramp, (rows, 1))


def vertical(cols, rows, start=0.0, end=0.35, floor=0.0):
    """Ramp from `floor` at the top row up to 1 at row `end`."""
    y = np.linspace(0.0, 1.0, rows, dtype=np.float32)
    ramp = _smoothstep((y - start) / max(end - start, 1e-6))
    ramp = floor + (1.0 - floor) * ramp
    return np.tile(ramp.reshape(-1, 1), (1, cols))


def combine(*weights):
    out = None
    for weight in weights:
        out = weight if out is None else out * weight
    return out
