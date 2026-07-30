"""Character ramps used to shade an image into text.

Every ramp is ordered from lightest to heaviest ink coverage, so a normalised
tone in [0, 1] maps straight onto an index.
"""

# The site's art direction limits the artwork to punctuation, which keeps the
# field reading as typography rather than as a dithered photograph.
RAMPS = {
    "bosch": " .,:;_-=+<>()/\\|[]{}*%&#@",
    "sparse": " .,:-=+*#@",
    "fine": " .'`,:;!~_-+=<>()[]{}/\\|*%&#@",
}

DEFAULT_RAMP = "bosch"

# Stroke glyphs for cells that sit on a strong edge, indexed by the orientation
# of the edge itself (not of the gradient): 0deg, 45deg, 90deg, 135deg.
EDGE_GLYPHS = ("-", "/", "|", "\\")


def ramp(name):
    try:
        return RAMPS[name]
    except KeyError:
        raise SystemExit("unknown ramp %r; choose from %s" % (name, ", ".join(sorted(RAMPS))))
