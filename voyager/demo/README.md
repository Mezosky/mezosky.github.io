# Voyager evidence explorer

The default experience loads four precomputed, real model traces. It works on GitHub Pages without a running GPU service. Choose a case, select a layer, compare weighted scores or signed margin contributions, and download the full trace.

| Case           | Source                             | Voyager  | Final-layer GL-MCM |
| -------------- | ---------------------------------- | -------- | ------------------ |
| OOD correction | iNaturalist flowers                | OOD-like | ID-like            |
| ID recovery    | ImageNet validation, folding chair | ID-like  | OOD-like           |
| Texture shift  | DTD honeycomb texture              | OOD-like | ID-like            |
| OOD failure    | Places lionfish scene              | ID-like  | ID-like            |

These cases were deliberately selected for contrasting decisions, including a failure. They are not an unbiased sample or a performance estimate. Reference labels indicate benchmark dataset membership; OOD datasets can contain familiar ImageNet concepts.

## Provenance

Traces were recorded on 2026-11-02 using the project's CLIP ViT-B/16 backbone and five trained routers from the WACV context-free, 1,981-expert recipe. Model fingerprint: `vitb16-n5-20a178a9b137`. Screening used the experiment's cached ImageNet validation, DTD, iNaturalist, Places and SUN scores. Candidate images were extracted from the matching dataset ordering; each published 224-pixel crop was rerun through the actual model to verify its decision pair. Full images and training checkpoints are not part of this website.

The ensemble threshold is the fifth percentile of 50,000 cached ImageNet validation scores. The final-layer baseline has its own fifth-percentile threshold. Both thresholds and all router weights stay fixed during example selection and inference. Reported retention applies to the reference set. This interactive reproduction does not replace the paper's benchmark results.

For selected subset `E_r`, layer weight is `w_l = (1/5) sum_r 1[l in E_r]/|E_r|`. Weights sum to one; the routed score is `sum_l w_l S_l`. The signed margin terms `w_l (S_l - threshold)` sum to the decision margin. These are exact arithmetic contributions, not causal attributions or independently calibrated layer decisions. The local map displays patch ID-class matches from attention value tokens, not attention weights or saliency. Layer maps use separate scales.

Images are small benchmark crops used to document the corresponding experiment outputs. Their dataset and original rights remain with their respective owners; the repository's code license does not grant a separate image license.

## Optional live service

`config.json` points to a temporary inference service on AIML-PC. The UI checks availability independently of the recorded examples. If the share URL changes, update `api_base`; if unavailable, all four saved traces remain explorable.

Uploads are optional, limited to JPEG/PNG/WebP, 5 MB and 20 megapixels. The inference application processes them in memory without saving them; its public relay transports the requests. The app allows one inference at a time and at most 20 requests per minute across visitors. Do not put server files, checkpoints or calibration caches in this static directory.

## Validation

- Raw feature and score extraction matched the experiment's original GL-MCM helper.
- Cached routing, fixed calibration and score/margin arithmetic checks passed.
- All four published crops confirmed their stated decision pairs in real inference.
- Browser checks covered case selection, chart modes, layer selection, opacity, JSON export and live rerun.
- Responsive review covered 1440, 768 and 390 pixel widths.
