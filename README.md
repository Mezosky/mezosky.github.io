# Ignacio Meza Website

Personal website and academic portfolio for Ignacio Meza.

The site is built with Jekyll on top of the `al-folio` theme, but it has been customized to better reflect Ignacio's work in machine learning, computer vision, research, and teaching.

## What is in this repo

- Public homepage, CV, blog, news, and publications pages
- Custom homepage design and animations
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

- `_layouts/about.liquid`: homepage layout
- `_layouts/default.liquid`: global page wrapper
- `_sass/_custom.scss`: custom design system and homepage styling
- `assets/css/main.scss`: Sass entry point
- `assets/js/common.js`: small UI interactions and reveal animations

### Miscellaneous content

- `_data/repositories.yml`: GitHub repositories shown on the site
- `assets/pdf/cv_ignacio.pdf`: downloadable CV
- `mysteries-of-the-deep/`: standalone static mini-site/experiment

## Editing guide

### Update the homepage

Edit:

- `_pages/about.md`
- `_layouts/about.liquid`
- `_sass/_custom.scss`

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

- `_sass/_custom.scss`
- `_config.yml`

## Deployment

Deployment is handled by:

- `.github/workflows/deploy.yml`

On pushes to `main` or `master`, GitHub Actions builds the site and deploys `_site` to GitHub Pages.

## Notes

- This repo started from an `al-folio` base, but the public content and visual presentation are now tailored to Ignacio Meza.
- Some template-oriented maintenance files were intentionally removed to keep the repo focused on the actual website.
