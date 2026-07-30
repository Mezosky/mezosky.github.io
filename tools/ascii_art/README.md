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
  --crop 0.7656,0.2642,0.9964,0.5820 --cols 190 \
  --floor 0.13 --gamma 1.18 \
  --left-fade 0.40 --top-fade 0.30 --top-floor 0.30 \
  --bands atmosphere:0:0.40,architecture:0.40:0.66,figures:0.66:1.01 \
  --edge-quantile 0.76 \
  --plate assets/img/ascii/bosch_plate.webp --plate-width 1100 --plate-quality 70 \
  --out _data/ascii/bosch_field.yml \
  --preview /tmp/field.png
```

`--preview` is the fast way to iterate: it renders the layers at the site's colours
so you can look at the result before rebuilding Jekyll.

## The fields this site ships

| Data file                      | Shown on           | Source                              |
| ------------------------------ | ------------------ | ----------------------------------- |
| `_data/ascii/bosch_field.yml`  | homepage, wide     | Bosch, right panel (Hell)           |
| `_data/ascii/medusa_field.yml` | homepage, wide     | Gericault, _The Raft of the Medusa_ |
| `_data/ascii/eden_field.yml`   | publications, wide | Bosch, left panel (Eden)            |
| `_data/ascii/garden_field.yml` | notes, wide        | Bosch, central panel                |
| `_data/ascii/goya_field.yml`   | every page, phones | Goya, _Saturn Devouring His Son_    |

Landscape fields are chosen per page with `ascii_field:` in the page's front
matter. A page may instead list `ascii_field_alternatives:`, in which case one is
picked at random per visit by a short inline script; the first in the list is what
a reader without JavaScript sees. The portrait field is chosen once for the whole site with
`ascii_field_compact:` in `_config.yml`, because a portrait painting suits a
portrait viewport; `_sass/_atelier-hero.scss` swaps the two by media query.

## Making the page pan down the artwork

`--hero-rows` says how many rows are visible before any scrolling. Set it lower
than the grid height and the extra rows sit below the fold; the page then travels
down them as the reader scrolls, so later sections meet later parts of the
painting. Leave it unset and the grid simply fills the viewport, with a few pixels
of drift instead.

The homepage field uses it: the crop was extended downwards only, keeping the same
columns, the same left/right edges and the same top edge, so the band the hero
opens on is framed exactly as it was before the extension. When you extend a crop
this way, two things have to be held steady or the opening band shifts:

- pin the tone mapping with `--no-autocontrast --black --white`, because
  autocontrast is measured over the whole crop and a taller crop restretches it;
- scale `--top-fade` so the same _number_ of rows is thinned as before
  (0.30 of 84 rows is 25 rows, so 129 rows wants 25/129 = 0.195).

## Bright paintings need `--invert`

The default mapping inks the light end: on a dark painting the lit subjects
become characters and the dark ground stays empty, which is what the page wants.

A bright painting inverts that relationship, and rendering it unchanged fills the
sky with glyphs while the forms vanish. `--invert` swaps which end becomes ink,
so the sky empties and the shapes read. The Bosch wings use it; the Hell panel
and the Goya do not.

Watch for painted frames at a panel's edge: inverted, they become a solid bar of
`@`. Crop inside them.

## Using a different painting

Any image Pillow can read works. Only three knobs usually matter:

- `--crop left,top,right,bottom` — fractions of the image, so a crop survives
  swapping in a different scan of the same work. `--rows` is derived from the crop.
- `--floor` — the tone below which a cell stays blank. Raise it for more negative
  space, lower it for a denser field. This is the main density control.
- `--gamma` — above 1 pushes the midtones down, which suits dark paintings.

Then check the glyph count printed at the end. The homepage field is around 5,000
glyphs across three layers; much beyond that and the markup starts to weigh on
mobile for no visual gain.

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
