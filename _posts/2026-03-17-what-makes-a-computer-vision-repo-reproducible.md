---
layout: post
title: Naval Things Project Highlights
date: 2026-03-17
description: Highlights from a reproducible crack-detection workflow built around dataset auditing, validation, export, and Gradio inference.
tags: [computer-vision, reproducibility, yolo, ml-systems]
categories: [computer vision, engineering]
author: Ignacio Meza
slug: naval-things-project-highlights
toc:
  beginning: true
---

## Project Overview

This repository is a reproducible computer vision training project for custom crack detection with Ultralytics YOLO26.

### Core Goal

Build a clean, researcher-friendly workflow for preparing data, auditing labels, training detectors, validating performance, exporting models, and serving inference through a modern Gradio UI.

## What Is Implemented

- Reproducible training pipeline using config-driven Python entry scripts.
- Dataset preparation for the original flat YOLO source dataset.
- Optional alternative DTU annotation import path.
- Dataset audit script with structural checks and noise-focused heuristics.
- Training, validation, inference, export, and performance plotting scripts.
- Gradio app for interactive crack localization on uploaded images.
- Hugging Face upload helpers for both model weights and Space deployment.
- Weights & Biases tracking with per-epoch logging.
- Repo skills for dataset audit, training, evaluation, inference/export, and Python documentation + typing standards.
- Ruff-based formatting/linting plus explicit type hints and concise function docstrings across the Python codebase.

## Current Baseline Snapshot

Latest available `cracker_yolo26m_baseline` training log snapshot from `results.csv`:

| Metric         |  Value |
| -------------- | -----: |
| Epoch          |      7 |
| Precision      | 0.4467 |
| Recall         | 0.3364 |
| mAP50          | 0.3214 |
| mAP50-95       | 0.1339 |
| Train box loss | 2.3498 |
| Train cls loss | 2.4488 |
| Train dfl loss | 0.0103 |

## Key Dataset Finding

The original dataset is usable but noisy. Audit results showed the training data was heavily negative-biased and contained many tiny boxes plus some low-information positive tiles.

| Dataset      | Images | Positive Images | Negative Images | Boxes | Highlights                                                                    |
| ------------ | -----: | --------------: | --------------: | ----: | ----------------------------------------------------------------------------- |
| `data`       | 13,470 |           2,995 |          10,475 | 9,350 | Negative-heavy, 37.4% tiny boxes, 4.4% tiny border boxes                      |
| `data_clean` |  9,543 |           2,868 |           6,675 | 8,702 | Cleaner train split, 0% tiny border boxes, negatives capped more aggressively |

### Cleaning Strategy Added

- Remove tiny border-fragment boxes.
- Drop low-information train tiles using grayscale standard deviation heuristics.
- Cap the train negative ratio to reduce overwhelming background samples.
- Keep validation and test closer to source distribution for honest evaluation.

## Product Highlights

- Interactive Gradio app for image upload and crack localization.
- Performance plotting pipeline for curves, summary JSON/CSV, and validation example grids.
- Hugging Face model upload script.
- Hugging Face Space deployment helper.
- W&B logging for metrics, plots, checkpoints, and artifacts.

## Recommended Next Commands

### Retrain on cleaned dataset

```bash
.venv/bin/python scripts/train.py --train-config configs/train_yolo26m.yaml --data-config configs/data_clean.yaml --name cracker_yolo26m_clean
```

### Validate and save examples

```bash
python scripts/validate.py --model runs/train/cracker_yolo26m_clean/weights/best.pt --data-config configs/data_clean.yaml --name cracker_yolo26m_clean_val --pred-name cracker_yolo26m_clean_examples --max-pred-images 50
```

### Build visual report

```bash
python scripts/plot_performance.py --run-dir runs/train/cracker_yolo26m_clean --pred-dir runs/val/cracker_yolo26m_clean_examples --max-example-images 16
```

### Launch the app

```bash
.venv/bin/python scripts/gradio_app.py --model runs/train/cracker_yolo26m_clean/weights/best.pt --host 127.0.0.1 --port 7860
```

## Practical Notes

- For manual app testing, confidence around `0.25` to `0.40` is a better default than `0.05`.
- The synthetic green render example appears visually out-of-domain relative to the training data, so false positives there are not a reliable measure of dataset quality.
- The repo now expects Python edits to include docstrings, explicit type hints, and Ruff validation.

## Current Project Assets

- Config-driven training and dataset definitions under `configs/`.
- Reusable entry scripts under `scripts/`.
- Shared helpers under `src/utils.py`.
- Reusable local Codex skills under `skills/`.

## Summary

The project has moved from a baseline YOLO training scaffold into a more production-ready research repo with better data hygiene, better experiment reporting, interactive inference, artifact publishing, and stronger Python code quality standards.
