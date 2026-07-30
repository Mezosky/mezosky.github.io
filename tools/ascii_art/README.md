# ASCII field generator

Turns a real painting into the layered ASCII artwork behind the homepage hero.

This is an **authoring tool**, not part of the site build. Jekyll never runs it and
`tools/` is excluded from the build. It writes a Jekyll data file; that file is the
artwork's source of truth and can be hand edited afterwards in a monospaced editor.

```
image ──► source ──► shading ──► depth ──► emit ──► _data/ascii/<name>.yml
             │          │                    │
           plate     falloff              preview (PNG, for review)
             │
             └──► assets/img/ascii/<name>.webp   (faint plate behind the text)
```

| Module       | Responsibility                                                         |
| ------------ | ---------------------------------------------------------------------- |
| `source.py`  | load, fractional crop, optional mirror, sample tone + edge per cell    |
| `ramps.py`   | named character ramps ordered by ink coverage, plus stroke glyphs      |
| `falloff.py` | spatial weights that thin the field where the hero copy sits           |
| `shading.py` | pick a character per cell: tonal ramp, overridden by edge strokes      |
| `depth.py`   | split the field into stacked layers by tone band                       |
| `emit.py`    | write `_data/ascii/<name>.yml` with provenance and the exact recipe    |
| `plate.py`   | export the same crop as an image, for the faint plate behind the text  |
| `preview.py` | render the layers to a PNG so a change can be judged without a browser |

## Install

```bash
pip install -r tools/ascii_art/requirements.txt
```

## Regenerate the current artwork

The homepage field is built from a public-domain scan of the right panel of
Hieronymus Bosch's _The Garden of Earthly Delights_. The scan is **not** committed:
download it, then run the recipe recorded in `_data/ascii/bosch_field.yml`.

```bash
curl -L -o /tmp/bosch.jpg \
  "https://commons.wikimedia.org/wiki/Special:FilePath/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution_2.jpg?width=6000"

python3 tools/ascii_art/build_field.py \
  --image /tmp/bosch.jpg \
  --crop 0.7656,0.1400,0.9964,0.8600 --cols 190 \
  --floor 0.13 --gamma 1.18 \
  --left-fade 0.40 --top-fade 0.10 --top-floor 0.55 \
  --bands atmosphere:0:0.40,architecture:0.40:0.66,figures:0.66:1.01 \
  --edge-quantile 0.76 \
  --plate assets/img/ascii/bosch_plate.webp --plate-width 1100 --plate-quality 70 \
  --out _data/ascii/bosch_field.yml \
  --preview /tmp/field.png
```

The crop covers the whole height of the panel, not just one band. The grid is far
taller than any viewport, and the page pans down it as the reader scrolls, so
each section sits against a different part of the painting. `--ascii-start-row`
in `_sass/_atelier-hero.scss` chooses where the hero opens.

`--preview` is the fast way to iterate: it renders the layers at the site's colours
so you can look at the result before rebuilding Jekyll.

## Using a different painting

Any image Pillow can read works. Only three knobs usually matter:

- `--crop left,top,right,bottom` — fractions of the image, so a crop survives
  swapping in a different scan of the same work. `--rows` is derived from the crop.
- `--floor` — the tone below which a cell stays blank. Raise it for more negative
  space, lower it for a denser field. This is the main density control.
- `--gamma` — above 1 pushes the midtones down, which suits dark paintings.

Then check the glyph count printed at the end. The homepage field is around
15,000 glyphs across three layers, which is roughly the ceiling before the markup
starts to weigh on mobile for no visual gain.

`--plate` writes the same crop as an image. The page shows it under the
characters at very low opacity so the reader can see what is being described.
Because it comes from the identical crop, photograph and text stay in register —
regenerate both together or they will drift apart.

`--flip` mirrors the source horizontally. It exists because the page wants its
dense mass on the right and its quiet space on the left, and not every painting
runs that way. The current artwork does not use it.

## Choosing a source responsibly

Bosch died in 1516, so his paintings are in the public domain, and faithful
photographs of public-domain two-dimensional art carry no separate copyright in
the US (_Bridgeman v. Corel_). Prefer a museum open-access or Wikimedia Commons
file, where the licence is stated, over a wallpaper aggregator, where the
provenance usually is not.

Record whatever you use via `--source-title`, `--source-url` and
`--source-license`; those land in the generated data file and are surfaced in the
site's colophon. Do not point this at work still in copyright.
