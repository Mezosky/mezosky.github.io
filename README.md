# Ignacio Meza Website

Personal website and academic portfolio for Ignacio Meza.

The site is built with Jekyll on top of the `al-folio` theme, but it has been customized to better reflect Ignacio's work in machine learning, computer vision, research, and teaching.

## What is in this repo

- Public homepage, CV, blog, news, and publications pages
- Art-directed dark visual system with a layered ASCII backdrop on the homepage
- An offline generator that renders the backdrop from a source painting
- Bibliography-driven publications
- CV data in both Jekyll YAML and JSON Resume formats
- GitHub Actions deployment to GitHub Pages

## Stack

- Jekyll
- Liquid templates
- Sass
- Minimal JavaScript for UI behavior and animation
- Prettier for formatting
- GitHub Actions for deployment

## Local development

### Option 1: Docker

This repo includes a Docker setup and is the easiest way to run the site locally:

```bash
docker compose up
```

Then open:

```text
http://localhost:8080
```

### Option 2: Local Ruby environment

If you already have Ruby and Bundler installed:

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open:

```text
http://localhost:4000
```

### Build only

```bash
bundle exec jekyll build
```

## Formatting

Prettier is configured for the repo:

```bash
npx prettier . --check
npx prettier . --write
```

## Important files

### Site configuration

- `_config.yml`: global site settings, metadata, plugins, fonts, social links, and theme behavior

### Main pages

- `_pages/about.md`: homepage content
- `_pages/blog.md`: blog index
- `_pages/publications.md`: publications page
- `_pages/cv.md`: CV page
- `_pages/news.md`: news page

### Research and CV content

- `_bibliography/papers.bib`: publications source
- `_data/cv.yml`: CV content used by the Jekyll CV layout
- `assets/json/resume.json`: JSON Resume data used by the resume-based CV sections

### Design and layout

The visual system lives in four Sass partials, imported last from `assets/css/main.scss`
so they settle the palette and typography over the inherited theme:

- `_sass/_atelier-tokens.scss`: palette, type and layout tokens. Also re-points the
  inherited `--global-*` and `--brand-*` variables, which is how the navbar, footer,
  tables and publication rows follow the palette without being restyled one by one
- `_sass/_atelier-shell.scss`: base typography, page frame, navbar, footer, focus states
- `_sass/_atelier-hero.scss`: hero and the ASCII backdrop
- `_sass/_atelier-sections.scss`: index lists, publication list, prose, inner pages
- `_sass/_custom.scss`: blog-note components, reveal-on-scroll, page transitions

Structure:

- `_layouts/about.liquid`: homepage; decides section order only, each block is an include
- `_layouts/default.liquid`: global page wrapper
- `_includes/atelier/`: hero, nav, section heading, research index, notes, links,
  portrait, colophon
- `_includes/atelier/ascii/field.liquid`: renders the ASCII backdrop from data
- `assets/js/ascii-field.js`: pointer and scroll parallax for the backdrop
- `assets/js/navigate.js`: swaps pages in place so audio survives a page change
- `assets/js/common.js`: small UI interactions and reveal animations

### Navigating between pages

Internal links replace the page contents instead of reloading the document, so the
audio player keeps going when the reader moves around. Only `[data-page-shell]`, the
backdrop and the navigation are swapped; the header, the player and the invitation sit
outside that region and are never touched.

Every link is a real `href`. Without JavaScript, on a failed request, or for anything
that is not a page of this layout — PDFs, `/mysteries-of-the-deep/` — the browser does
an ordinary navigation. Add `data-no-page-transition` to a link to force that.

After each swap `assets/js/navigate.js` dispatches `atelier:navigated`. Anything that
reads the DOM on load has to listen for it and rebind; `ascii-field.js`,
`text-scramble.js` and `zoom.js` already do. Delegate new click handlers from
`document` rather than binding to elements, or they will not survive a swap.

### Resolving text

`data-scramble` on an element makes its text settle out of random characters when
it scrolls into view, and again on each re-entry. See `assets/js/text-scramble.js`.
The copy itself stays plain HTML.

### Audio

Optional. Put tracks in `_data/playlist.yml` and a player appears in the top panel;
leave the file empty and nothing renders. Files live in `assets/audio/` and are
served with `preload="none"`. `_includes/atelier/player.liquid` holds the control,
`_includes/atelier/entry.liquid` the one-time invitation, and
`assets/js/audio-player.js` the behaviour. Playback always waits for a click.

Track titles and order come from `_data/playlist.yml` — that file is the only place to
edit them. Playback survives a page change (see above) and stops only when the reader
presses pause; the track, its position and the paused state are kept in
`sessionStorage`, so it also resumes across a full reload but not in a new tab.

### Homepage content sources

- `_pages/about.md`: front matter carries the hero copy; the body is the About prose
- `_data/navigation.yml`: primary navigation, including the `[0n]` indices
- `_data/research.yml`: research themes shown as an indexed list
- `_data/ascii/bosch_field.yml`: the generated ASCII artwork

### ASCII backdrop

The homepage backdrop is real text, generated offline from a public-domain painting
and committed as a Jekyll data file. Nothing at build or run time depends on the
generator.

```bash
pip install -r tools/ascii_art/requirements.txt
python3 tools/ascii_art/build_field.py --help
```

See `tools/ascii_art/README.md` for the pipeline, the recipe used for the current
artwork, and notes on choosing a source image. `tools/` is excluded from the build.

### Miscellaneous content

- `_data/repositories.yml`: GitHub repositories shown on the site
- `assets/pdf/cv_ignacio.pdf`: downloadable CV
- `mysteries-of-the-deep/`: standalone static mini-site/experiment

## Editing guide

### Update the homepage

Edit:

- `_pages/about.md` for the hero copy and the About prose
- `_data/navigation.yml` and `_data/research.yml` for the nav and research themes
- `_layouts/about.liquid` only to add, remove or reorder whole sections

### Add or update publications

Edit:

- `_bibliography/papers.bib`

If needed, also update:

- `_data/venues.yml`
- `_data/coauthors.yml`

### Update the CV

Edit:

- `_data/cv.yml`
- `assets/json/resume.json`
- `assets/pdf/cv_ignacio.pdf`

### Change colors, typography, and visual polish

Edit:

- `_sass/_atelier-tokens.scss` for palette, fonts and layout tokens
- the other `_sass/_atelier-*.scss` partials for component styling
- `_config.yml` for the web font request and feature switches

The site runs a single committed dark palette; `enable_darkmode` is off because a
light variant would need its own art direction.

### Replace the ASCII artwork

Regenerate `_data/ascii/bosch_field.yml` with `tools/ascii_art/build_field.py`, or
edit the file by hand in a monospaced editor. Neither the layout nor the stylesheet
needs to change: the number of layers, columns and rows is read from the data.

## Deployment

Deployment is handled by:

- `.github/workflows/deploy.yml`

On pushes to `main` or `master`, GitHub Actions builds the site and deploys `_site` to GitHub Pages.

## Notes

- This repo started from an `al-folio` base, but the public content and visual presentation are now tailored to Ignacio Meza.
- Some template-oriented maintenance files were intentionally removed to keep the repo focused on the actual website.
