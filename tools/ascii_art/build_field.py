#!/usr/bin/env python3
"""Build the site's ASCII field from a source image.

    python tools/ascii_art/build_field.py --image path/to/painting.jpg \
        --crop 0.766,0.264,0.996,0.537 --cols 190 \
        --out _data/ascii/bosch_field.yml --preview /tmp/field.png

Run with --help for the full set of knobs. See README.md in this directory.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from asciifield import depth, emit, falloff, preview, ramps, shading, source  # noqa: E402

DEFAULT_CAPTION = (
    "Layered ASCII rendering of a public-domain Hieronymus Bosch panel: hybrid\ncreatures, impossible architecture and miniature figures."
)


def parse_crop(value):
    if not value:
        return None
    parts = [float(part) for part in value.split(",")]
    if len(parts) != 4:
        raise SystemExit("--crop expects left,top,right,bottom as fractions of the image")
    return tuple(parts)


def build(args):
    image = source.crop_fraction(source.load(args.image), parse_crop(args.crop))
    image = source.mirror(image, horizontal=args.flip, vertical=args.flip_vertical)
    rows = args.rows or source.derive_rows(image, args.cols, args.cell_aspect)
    field = source.measure(
        image,
        args.cols,
        rows,
        black=args.black,
        white=args.white,
        gamma=args.gamma,
        autocontrast=not args.no_autocontrast,
    )

    weight = falloff.combine(
        falloff.horizontal(args.cols, rows, end=args.left_fade, floor=args.left_floor),
        falloff.vertical(args.cols, rows, end=args.top_fade, floor=args.top_floor),
    )
    glyphs, ink = shading.shade(
        field,
        ramps.ramp(args.ramp),
        weight=weight,
        floor=args.floor,
        edge_quantile=args.edge_quantile,
    )
    layers = depth.split(glyphs, ink, depth.parse_bands(args.bands))

    recipe = "--crop %s --cols %d%s --ramp %s --floor %s --gamma %s --edge-quantile %s --bands %s" % (
        args.crop or "none",
        args.cols,
        " --flip" if args.flip else "",
        args.ramp,
        args.floor,
        args.gamma,
        args.edge_quantile,
        args.bands or "default",
    )
    meta = {
        "columns": args.cols,
        "rows": rows,
        "caption": args.caption,
        "source_title": args.source_title,
        "source_url": args.source_url,
        "source_license": args.source_license,
        "recipe": recipe,
    }

    if args.out:
        emit.write(args.out, layers, meta)
        filled = sum(len(line.replace(" ", "")) for _, art in layers for line in art)
        print("wrote %s -- %d cols x %d rows, %d layers, %d glyphs" % (args.out, args.cols, rows, len(layers), filled))
        for name, art in layers:
            print("  %-14s %6d glyphs" % (name, sum(len(line.replace(" ", "")) for line in art)))
    if args.preview:
        preview.write(args.preview, layers, args.cols, rows, size=args.preview_size)
        print("preview %s" % args.preview)
    return layers


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--image", required=True, help="source image (any format Pillow reads)")
    parser.add_argument("--crop", help="left,top,right,bottom as fractions of the image, e.g. 0.76,0.26,1,0.54")
    parser.add_argument("--cols", type=int, default=190, help="width of the character grid (default: 190)")
    parser.add_argument("--rows", type=int, help="height of the grid (default: derived from the crop)")
    parser.add_argument("--cell-aspect", type=float, default=source.DEFAULT_CELL_ASPECT, help="character height/width")
    parser.add_argument("--flip", action="store_true", help="mirror horizontally, to keep the dense mass on the right")
    parser.add_argument("--flip-vertical", action="store_true", help="mirror vertically")

    parser.add_argument("--ramp", default=ramps.DEFAULT_RAMP, help="character ramp: %s" % ", ".join(sorted(ramps.RAMPS)))
    parser.add_argument("--black", type=float, default=0.0, help="input black point, 0..1")
    parser.add_argument("--white", type=float, default=1.0, help="input white point, 0..1")
    parser.add_argument("--gamma", type=float, default=1.0, help="tone curve; >1 darkens midtones")
    parser.add_argument("--no-autocontrast", action="store_true", help="skip the automatic level stretch")
    parser.add_argument("--floor", type=float, default=0.06, help="tone below which a cell stays blank")
    parser.add_argument("--edge-quantile", type=float, default=0.82, help="fraction of cells shaded rather than stroked")

    parser.add_argument("--left-fade", type=float, default=0.45, help="column fraction where the field reaches full weight")
    parser.add_argument("--left-floor", type=float, default=0.0, help="weight at the left edge")
    parser.add_argument("--top-fade", type=float, default=0.30, help="row fraction where the field reaches full weight")
    parser.add_argument("--top-floor", type=float, default=0.35, help="weight at the top edge")
    parser.add_argument("--bands", help="depth bands as name:low:high,... over tone")

    parser.add_argument("--out", help="data file to write, e.g. _data/ascii/bosch_field.yml")
    parser.add_argument("--preview", help="also render a PNG here for review")
    parser.add_argument("--preview-size", type=int, default=11, help="preview font size in px")

    parser.add_argument("--caption", default=DEFAULT_CAPTION, help="accessible description stored with the artwork")
    parser.add_argument("--source-title", default="", help="painting, artist and date, for the colophon")
    parser.add_argument("--source-url", default="", help="where the scan came from")
    parser.add_argument("--source-license", default="", help="licence of the scan")

    args = parser.parse_args(argv)
    if not args.out and not args.preview:
        parser.error("nothing to do: pass --out and/or --preview")
    build(args)


if __name__ == "__main__":
    main()
