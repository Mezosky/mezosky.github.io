"""Convert a source painting into the layered ASCII field the site renders.

Pipeline: source -> shading -> depth -> emit. Each stage is a separate module so
a single step (a different ramp, another banding, a new painting) can be swapped
without touching the rest.
"""

from . import depth, emit, falloff, preview, ramps, shading, source

__all__ = ["depth", "emit", "falloff", "preview", "ramps", "shading", "source"]
