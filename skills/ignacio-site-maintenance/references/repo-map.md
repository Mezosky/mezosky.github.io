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
  Sass entry point.
- `_sass/_custom.scss`
  Current custom design system, homepage styling, and professional polish.
- `assets/js/common.js`
  UI behavior and reveal animations.
- `assets/img/profile/ignacio-meza-portrait.jpg`
  Canonical homepage portrait stored in the dedicated profile image folder.

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
