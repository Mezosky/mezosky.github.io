# Voyager project page

Standalone, buildless project page for the existing `Mezosky/mezosky.github.io` Jekyll site. The intended published route is `/voyager/`. Jekyll copies this directory without a layout or front matter; the page does not load or modify the main site's theme. No npm dependencies, CDN scripts, analytics, or backend are required.

## Preview and publication

From the website repository root, run `python3 -m http.server 8765`, then open `http://localhost:8765/voyager/`. The page also uses relative asset URLs so it can be opened directly from `index.html`.

The published page is https://mezosky.github.io/voyager/. The original checkout is `/mnt/bkp2/Ignacio_projects/mezosky.github.io` on AIML-PC. Merge updates into `master` to invoke the existing deployment workflow. Changes in a feature branch are not published until merged and deployed.

## Content and sources

- Method name: **Voyager**. **DynAMO** is the implementation repository. GitHub confirms it is currently private; the page labels the release as pending and avoids sending public visitors to a private 404 page. Repository visibility was not changed.
- Full title and author affiliations match the camera-ready manuscript prepared on 2 November 2026.
- `assets/manuscript.pdf` is that completed camera-ready PDF, not the anonymous Round 2 PDF.
- The FPR@95 tables are transcribed from `tables/main_results.tex` in Round 2 v2; all 80 values across both shot settings were checked against the source. Numbers and figures were preserved by the camera-ready revision.
- All headline results are explicitly ImageNet-1K / CLIP ViT-B/16 / four ID shots per class **plus WebContEX**. Local-Prompt's four-shot average is 27.66; Voyager's is 18.86. The 8.8-point difference is rounded. One-shot Local-Prompt is the authors' rerun.
- `method.webp` is extracted from Figure 4 in the completed camera-ready PDF, including the corrected context label.
- `routes.webp` comes from `images/voyager_layer_distribution.pdf`.
- `evidence.webp` comes from `images/imagenet_voyager_route_evidence.pdf`.
- `sparsity.webp` comes from `images/fig_sparsity_analysis.pdf`. It is explicitly labeled a **random-selection diagnostic**, not Voyager's result.
- `example-*.webp` are four photographic excerpts from the recorded routing figure: DTD, iNaturalist, Places, and SUN. They are reproduced as manuscript research examples, not newly sourced stock photos or new model predictions. The page credits the authors' manuscript; underlying benchmark-image rights remain with their respective rights holders. No separate photography licence is asserted.
- Albert Sans is self-hosted, by Rodrigo Fuenzalida; its SIL Open Font License is included in `assets/AlbertSans-OFL.txt`. The implementation repository has an MIT licence.
- `social.png` is a screenshot of this page. No stock footage or generated photography is used.

## Interactions and access

The layer lesson compares final-layer scoring, fixed fusion and one Voyager router using penguin/puffin teaching examples. It draws the actual structural difference: score selection, fixed averaging, and feature-conditioned expert selection. Routes are explicitly illustrative. Every subset includes the final layer. Native input radios, method buttons on small screens and an optional path trace control provide access. Without JavaScript, all three default structural diagrams remain readable.

The results default to four shots and the average column. On phones an OOD-shift select shows one metric column at a time while keeping every method visible. The accompanying prose retains the SUN and DTD baseline wins. The full four-shot table, method description, first research figure, and citation are present without JavaScript; extra figures have a no-script fallback. Copying BibTeX falls back to selecting the text if clipboard access fails.

Citation metadata is provisional camera-ready metadata, with no fabricated DOI or page numbers. Replace it with the final proceedings record when available. If a later manuscript changes results, update both the static default table in `index.html` and the one-/four-shot arrays in `script.js`.

## Validation

- JavaScript syntax and design source lint.
- Browser inspection at 1440, 768, and 390 CSS pixels.
- Routing modes, input changes, shot changes, shift selection, research figure changes, details panels, and clipboard copying checked in the browser.
- All local asset references checked; PDF title and author block verified.
- No full Jekyll build was run on AIML-PC: its Ruby environment has Bundler but no Jekyll executable. This addition consists only of static files; the existing GitHub pull-request build remains the integration check.

Design direction: **One motif**, seed **1931247166**. The sparse, final-layer-anchored expert supplies the recurring layer-stack shape. The proof layout was redrawn to a table because the content is quantitative evidence, not partner logos; the palette was mapped to the manuscript's scientific figures and the navy/teal consultation direction. The folder-stack hero geometry is expressed as actual CLIP layers, and a manually selected figure replaces automatic cycling so readers control scientific comparisons. The live element is the binary routing explainer. Motion is limited to layer entrances, section entrances, and control feedback; no unrelated footage was added.

## Interactive architecture

`#architecture` reproduces the three-panel method figure as an inline SVG, retaining the manuscript bird photographs through clipped SVG viewports. All other component shapes, labels, arrows, icons and distributions are vector elements. Each animated signal and its static wire reference the same `<defs><path>` through `<use>`, so motion cannot drift away from its arrow at another screen size.

Nine clickable components explain input images, both frozen encoders, layer scores, anchored experts, the feature-conditioned router, detector output, training data and objective. Flames and snowflakes are separately clickable and keyboard accessible. The deployed objective is shown explicitly as soft top-32 target cross-entropy plus `0.01 Lbal`; fixed equal expert weights and the five-router inference ensemble are distinguished from router learning.

Moving distribution curves are conceptual illustrations, not measured densities or training dynamics. Snowflake motion is decorative; the weights stay frozen. Signals, curves and icons animate automatically while visible, with no motion-pause control. Reduced-motion preferences disable them. Walkthrough playback is opt-in, pauses while offscreen or hidden, and stops when a visitor chooses a part. On small screens the native part selector pans the same SVG to its component; the page itself does not scroll horizontally. The original paper figure remains linked.

The architecture interaction was checked at 1440, 768 and 390 pixels, including all nine explanations, icon clicks, keyboard activation, next/previous controls, walkthrough playback and shared-path geometry.

The router inset is an enlarged view of the narrow Voyager block, joined by a static dashed magnification guide. The inset has a dashed boundary and its own solid feature-input arrow; it is not an additional downstream module. Curved dashed routing choices stay separate from this structural guide.

## WebContEX walkthrough

The training-context section follows manuscript Section 5 and Algorithm C.1, with five interactive stages: ID vocabulary, WordNet filtering, Wikimedia retrieval/cleaning, frozen caching, and router fitting. It presents WebContEX only; ID-only crop and feature-synthesis baselines are not part of this walkthrough.

`context-floor.png`, `context-bell.png`, `context-shore.png` and `context-hut.png` are unmodified image objects extracted from Figure C.1 in the camera-ready manuscript. They illustrate the retrieved training context, not new retrievals or target-OOD inputs. Their original image rights remain with their respective owners. The construction settings and 5,078-entry pool count match the manuscript. Semantic and within-shard duplicate checks are not described as a cross-dataset image-disjointness guarantee.

## Space identity

The author-requested rocket emoji is Voyager’s brand symbol in the project page, demo header, router inset and favicon. A midnight-blue hero and footer use a small local SVG star field. The orbital hero uses the same illustrative layer subset (3, 5, 6, 9, 12); orbit positions have no model-space meaning. A local SVG craft follows that exact route continuously, with a trail driven by the same path distance and a smooth turn at both endpoints. OS reduced-motion preferences and no-JavaScript views show the final-layer anchor. Scientific method panels retain their light surfaces and the original frozen/trainable icon meanings.

## Bird send-off

The closing scene illustrates the manuscript penguin/ID and puffin/OOD pairing with original SVG characters. A flying puffin carries an OOD tag to the right outpost; a waddling penguin carries an ID tag left. Both travellers sample the exact SVG paths used by their visible trails. The scene loops automatically, using an out-and-back journey with the birds facing their travel direction. There are no playback buttons; labels stay upright. The loop runs for the lifetime of the open page; browser-native background-tab throttling handles hidden tabs. Reduced-motion and no-JavaScript modes show the completed destinations without movement. This is a teaching illustration, not model inference.

The bird silhouettes and six-colour plumage palette were refined with Claude Desktop design critique at the author’s request. The penguin now has a continuous emperor-style back/neck, narrow bill, amber neck patch, rigid flippers and a short shuffle. The puffin has a compact body, framed face patch, eye ring, deep slate/amber/coral bill, a separate horizontal flight drawing with trailing feet, and a settled pose. Wing beats, pose blending, tag lag and landing compression share the continuous requestAnimationFrame timeline; reduced-motion still shows the final perched state. Fine bill/face grooves are hidden and the characters enlarged on phones.

The continuous loop is explicitly requested by the author. The scene and characters stay visible through each turn, with no fade-out or reset jump. Reduced-motion and no-JavaScript views retain the completed illustration. The fixed ID/OOD caption is not an announcing live region.

## November visual polish

Claude Desktop reviewed screenshots of the opening, method and results. The page now shares a midnight navy / cool-white / mint palette. Scientific panels keep dark ink on light surfaces; the Voyager results row uses navy and mint, preserving ID/OOD colours inside the method figure. The redundant local-detail analogy was removed while the structural comparison and its illustrative disclosure remain. The hero keeps the author-requested emoji in the brand and uses a precise SVG craft for its continuous shared-path animation. Native controls, original figure geometry, scientific data and the continuously looping birds are preserved.

## Fixed evidence explorer

The public demo serves only four precomputed model traces. Upload controls, live API requests, availability checks and endpoint configuration were removed. The WebContEX walkthrough retains the retrieval pipeline, construction details and paper examples; its toy semantic-filter widget was removed.
