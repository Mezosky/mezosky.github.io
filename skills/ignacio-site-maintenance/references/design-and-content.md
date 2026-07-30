# Design And Content Rules

## Identity

- The site belongs to Ignacio Meza.
- Keep content personal to Ignacio and remove unrelated template material.
- Highlight work in machine learning, computer vision, data science, research, and teaching.
- Keep the tone professional, thoughtful, and clear.

## Homepage Expectations

- The homepage should feel polished and intentional, not generic.
- The hero is typographic: statement, name, role, scroll cue, and the ASCII backdrop.
  No photograph, no cards, no metrics tiles in the hero.
- Ignacio's portrait stays on the page, in the About section, as a desaturated plate.
  Do not remove it unless the user asks; `portrait: false` in the front matter hides it.
- Keep generous negative space. Do not fill the viewport.
- Treat the homepage as the main professional landing page for collaborators, recruiters, and academic visitors.

## Visual Direction

The site is art-directed: minimalist, editorial, quiet, slightly unsettling, and
academic without looking like a university profile. It is not a corporate template.

- Single committed dark palette. `enable_darkmode` is off on purpose; a light theme
  would need its own art direction. Do not re-enable it casually.
- Palette lives in `_sass/_atelier-tokens.scss`: near-black warm background, soft
  ivory text, muted warm gray secondary text, and one restrained bronze accent.
  Do not introduce a second accent, and do not go back to blue.
- Monospaced type carries everything structural; a serif is used only for editorial
  detail (prose, summaries, abstracts). Mono display type takes slightly open
  tracking, never negative tracking.
- Hairlines, 1-2px radii, no shadows, no gradients as decoration, no glassmorphism,
  no glow, no floating cards.
- The ASCII backdrop is generated from a public-domain painting by
  `tools/ascii_art/build_field.py` and committed to `_data/ascii/`. It must stay
  subtle enough that text contrast is never reduced.
- Behind the characters sits a plate of the source painting at very low opacity,
  exported from the identical crop so the two stay in register. If you regenerate
  one, regenerate both, or the photograph and the text drift apart.
- The homepage is hero, Research and Publications only. Notes and About are pages,
  reached from the navigation, not sections to scroll past.
- `ascii_field_alternatives:` on a page picks one backdrop at random per visit. It
  is wired up but unused: the homepage is Bosch, the About page Gericault.
- Each page picks its own landscape field via `ascii_field:` in the front matter;
  phones get one portrait field site-wide via `ascii_field_compact:` in the config.
  Reading pages run the backdrop quieter than the hero and clear the whole content
  column, because their text runs much wider than the hero copy.
- The pointer parts the rows nearest it (a derivative-of-Gaussian shear). Keep it
  small; it should read as the field breathing, not as an animation.
- Use motion sparingly: reveal transitions, a few pixels of parallax, small hover
  shifts. Everything must be inert under `prefers-reduced-motion`.

## Good Practices To Preserve

These are now part of the site's content and should stay reflected in edits:

- Reproducibility
- Clear documentation
- Code review and maintainable code
- Testing and careful validation
- Clear communication
- Honest reporting of results

## Content Cleanup Rules

- Remove placeholder or theme-maintainer leftovers when they are not useful for Ignacio's site.
- Do not reintroduce generic template text, Einstein references, or unrelated demo content.
- Keep README practical and repo-specific.

## Design Guardrails

- Favor high-quality, smaller changes over flashy redesigns.
- Make mobile and desktop both look deliberate. On narrow screens the backdrop is
  cropped and faded below the copy, and the faintest layer is dropped.
- Preserve accessibility: readable contrast, restrained motion, and reduced-motion-safe behavior.
- The inherited MDB stylesheet zeroes focus outlines via `.btn:focus` and
  `.nav-link:focus`. Any new control needs a focus rule specific enough to win that,
  otherwise it ends up focusable with no visible ring.
- Build from the includes in `_includes/atelier/`. Do not put page-sized markup in a
  layout, and do not duplicate publication data outside `_bibliography/papers.bib`.

## Protected Content

`mysteries-of-the-deep/` is a standalone paper site with its own styling and data. Its
content, assets, links, route and bib entry must not be modified without an explicit
request. The shared visual system around it may change; the page itself may not.
