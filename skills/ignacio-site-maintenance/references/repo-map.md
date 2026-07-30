# Repo Map

## Main Site Files

- `_config.yml`
  Global metadata, social links, fonts, plugins, theme settings, and behavior.
- `_pages/about.md`
  Homepage content.
- `_layouts/about.liquid`
  Homepage structure and section wrappers.
- `_layouts/default.liquid`
  Global page wrapper and body classes.
- `_pages/publications.md`
  Publications page.
- `_pages/profile.md`
  The About page at /about/, rendered by `_layouts/profile.liquid`.
- `_pages/cv.md`
  CV page.
- `_pages/blog.md`
  Blog index.
- `_pages/news.md`
  News page.

## Content Sources

- `_bibliography/papers.bib`
  Publications source for Jekyll Scholar.
- `_data/cv.yml`
  CV content for the Jekyll CV layout.
- `assets/json/resume.json`
  JSON Resume data used by the resume-style CV sections.
- `_data/repositories.yml`
  GitHub repo list shown on the site.

## Design System

- `assets/css/main.scss`
  Sass entry point. The `atelier-*` partials are imported last.
- `_sass/_atelier-tokens.scss`
  Palette, type and layout tokens; also re-points the inherited `--global-*` and
  `--brand-*` theme variables. Start here for any colour or font change.
- `_sass/_atelier-shell.scss`
  Base typography, page frame, navbar, footer, focus states.
- `_sass/_atelier-hero.scss`
  Hero and the ASCII backdrop, including the responsive crop and fades.
- `_sass/_atelier-sections.scss`
  Index lists, publication list, prose, portrait plate, inner pages.
- `_sass/_custom.scss`
  Blog-note components, reveal-on-scroll, page transitions. Nothing else.
- `assets/js/common.js`
  UI behavior and reveal animations.
- `assets/js/ascii-field.js`
  Pointer and scroll parallax for the backdrop. Enhancement only.
- `assets/img/profile/ignacio-meza-portrait.jpg`
  Canonical portrait, shown in the About section and used as the Open Graph image.

## Homepage Components

- `_layouts/about.liquid`
  Section order only; every block is an include.
- `_includes/atelier/`
  hero, nav, section heading, research index, notes, links, portrait, colophon.
- `_includes/atelier/ascii/field.liquid`
  Renders the backdrop from data. The only place that knows the markup.
- `_data/navigation.yml`, `_data/research.yml`
  Navigation entries and research themes.
- `_data/ascii/bosch_field.yml`
  The generated artwork: plain text on a fixed grid, hand-editable.
- `tools/ascii_art/`
  Offline generator that builds the artwork from a source painting. Excluded from
  the Jekyll build; see its README.

## Repo Docs And Workflow

- `README.md`
  Repo overview and edit/run instructions.
- `.github/workflows/deploy.yml`
  Main GitHub Pages deployment workflow.
- `docker-compose.yml`
  Docker-based local site run path.
- `Gemfile`
  Jekyll and plugin dependencies.
- `package.json`
  Prettier formatting dependencies.

## Standalone Extra Content

- `mysteries-of-the-deep/`
  Separate static mini-site or experiment, outside the main Jekyll theme flow.
