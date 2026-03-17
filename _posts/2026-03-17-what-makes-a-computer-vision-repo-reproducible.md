---
layout: post
title: What Makes a Computer Vision Repo Reproducible?
date: 2026-03-17
description: Lessons from a crack-detection workflow on dataset auditing, honest validation, reproducible training, and lightweight deployment.
tags: [computer-vision, reproducibility, yolo, ml-systems]
categories: [computer vision, engineering]
author: Ignacio Meza
toc:
  beginning: true
---

Many computer vision repositories are good at one thing: training a model once. Fewer are designed to support the full workflow around that model, including data preparation, label auditing, validation, reporting, export, and a simple path to inference.

I have been thinking more about that gap while working on a crack-detection project built around a YOLO-based training workflow. The most useful part of the project was not a single model result. It was the effort to turn the repository into something easier to reproduce, inspect, and extend.

## Start with the dataset, not the architecture

The baseline dataset was large enough to be useful, but it was also noisy.

| Dataset      | Images | Positive Images | Negative Images | Boxes | Notes                                           |
| ------------ | -----: | --------------: | --------------: | ----: | ----------------------------------------------- |
| `data`       | 13,470 |           2,995 |          10,475 | 9,350 | Strong negative bias, many tiny boxes           |
| `data_clean` |  9,543 |           2,868 |           6,675 | 8,702 | Cleaner training split, fewer low-value samples |

That summary was already enough to shape the next engineering decisions. Before spending time on architecture changes, it made more sense to inspect the data distribution and the annotation quality.

Several concrete problems showed up:

- The training data was heavily dominated by negative examples.
- A large fraction of boxes were tiny.
- Some positive tiles had very little visual information.
- Border-fragment annotations added noise without much training value.

Cleaning the dataset did not mean making evaluation easier. The goal was to make the training split more useful while keeping validation and test closer to the original distribution for a more honest read on performance.

## Reproducibility comes from workflow shape

One of the best improvements in the project was moving toward a config-driven workflow instead of a collection of ad hoc commands.

The repository ended up with explicit steps for:

- dataset preparation
- dataset auditing
- training
- validation
- inference
- export
- performance plotting

That sounds straightforward, but it changes the character of the project. Once those steps exist as named scripts with stable inputs, it becomes much easier to retrain a baseline, compare runs, or hand the repository to someone else without also handing over a long explanation.

## Auditing labels is part of model development

It is tempting to treat label quality as a separate data problem and model training as the "real" technical work. In practice, they are tightly connected.

In this case, the audit stage helped justify a few useful interventions:

- remove tiny border-fragment boxes
- drop low-information train tiles using grayscale heuristics
- cap the number of negative samples in training
- keep validation and test closer to the source distribution

That kind of audit does not guarantee better metrics by itself, but it does create a cleaner experimental setup. It also makes later decisions easier to explain. If performance changes, there is at least a visible chain of reasoning behind the dataset revision.

## Reporting matters as much as training

The baseline snapshot from one early run looked like this:

| Metric    |  Value |
| --------- | -----: |
| Epoch     |      7 |
| Precision | 0.4467 |
| Recall    | 0.3364 |
| mAP50     | 0.3214 |
| mAP50-95  | 0.1339 |

Those numbers are not the whole story, but they are much more useful when they are attached to a reproducible run directory, generated plots, validation examples, and a clear data configuration.

That is why reporting deserves its own engineering attention. Curves, summary files, and example predictions make it easier to move from "the model trained" to "we understand what happened."

## Deployment does not have to wait until the end

I also like repositories that include a lightweight inference path early, even if the final product is still far away. In this project, that meant a small Gradio interface for image upload and crack localization, plus helpers for exporting artifacts and pushing deliverables to external platforms.

That kind of addition is not just polish. It creates a feedback loop between research and usability:

- it makes the model easier to inspect visually
- it exposes confidence threshold issues earlier
- it reveals out-of-domain behavior more quickly
- it makes demos and collaboration much easier

For research code, that is often enough. A modest demo can surface practical issues long before a more formal deployment pipeline exists.

## Reproducibility is mostly discipline

The biggest lesson for me is that reproducibility rarely comes from one big framework decision. It comes from many smaller habits:

- explicit configurations
- readable entry scripts
- strong dataset checks
- honest validation splits
- traceable experiment logging
- code quality standards that keep the repo maintainable

Those habits make a repository more useful to future collaborators and also to your future self. In computer vision especially, where data quality and training details have a huge impact, that kind of discipline is often what separates a promising experiment from a dependable workflow.
