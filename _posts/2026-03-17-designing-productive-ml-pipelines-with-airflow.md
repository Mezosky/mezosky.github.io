---
layout: post
title: Designing Productive ML Pipelines With Airflow
date: 2026-03-17
description: A practical view of why ML systems need pipelines, how DAGs help, and which workflow habits matter once experiments need to run reliably.
tags: [mlops, airflow, teaching, machine-learning]
categories: [machine learning, engineering]
author: Ignacio Meza
toc:
  beginning: true
---

In many machine learning projects, the model is only half of the story. The harder question often comes after the first experiment works: how do we make data collection, preprocessing, retraining, validation, and delivery happen in a way that is repeatable and observable?

That is where pipelines become useful. A good pipeline is not just automation for its own sake. It is a way to make a workflow easier to reason about, easier to debug, and easier to trust.

## Why pipelines matter

Early ML work is often driven by scripts, notebooks, and manual execution. That is usually fine at the beginning. The problem appears when the same process needs to run again next week, with new data, under tighter time pressure, or with more people involved.

At that point, several questions start to matter:

- Which tasks depend on which previous outputs?
- What can run in parallel?
- What should happen if one step fails?
- How do we know which part of the workflow produced the current model artifact?

Pipelines give a clear answer to those questions by turning the workflow into an explicit sequence of tasks instead of a loose collection of commands.

## DAGs are a useful mental model

A simple and effective way to represent a pipeline is as a directed acyclic graph, or DAG. Each node is a task, and each edge encodes a dependency.

That representation is valuable for two reasons:

1. It forces us to express dependencies clearly.
2. It makes parallelism visible.

If two tasks depend only on the same upstream preprocessing step, they can often run at the same time. In an ML setting, that might mean training two candidate models in parallel, or validating multiple artifacts once a shared dataset is ready.

The "acyclic" part matters too. A production workflow should not silently create loops that can never finish. That design constraint is one of the reasons DAG-based orchestration feels natural for data and ML systems.

## What Airflow adds

Apache Airflow is useful because it lets us define workflows as code while also giving us scheduling, retries, and a visual view of the pipeline state.

What I like about that approach is that it keeps the workflow close to the implementation. A pipeline is not hidden inside a diagram that drifts away from the codebase. The orchestration logic becomes versioned, reviewable, and easier to maintain over time.

In practice, that means Airflow can help with things like:

- Running workflows on a schedule instead of by hand.
- Tracking which tasks succeeded, failed, or were skipped.
- Re-running only the parts that need recovery.
- Visualizing branches and dependencies without reconstructing the system mentally from several scripts.

For teaching, this is especially helpful. Students can see both the code and the execution graph, which makes the connection between abstraction and implementation much clearer.

## A small branching example

One of the most useful ideas in orchestration is conditional execution. Imagine a pipeline that always downloads one dataset, but chooses a second source depending on the execution date.

```python
def choose_data_branch(ds: str) -> list[str]:
    if ds < "2024-06-28":
        return ["download_dataset_1", "download_dataset_2"]
    return ["download_dataset_1", "download_dataset_3"]
```

The logic is simple, but the effect is important: the workflow can adapt to changing data conditions while still preserving a clean structure. Once the correct branch is selected, downstream tasks can continue from the right inputs without turning the whole pipeline into a fragile script full of manual `if` statements.

This is also where passing metadata between steps becomes useful. If an upstream task records which datasets were selected, later tasks can consume that information to clean, join, or train on the correct data automatically.

## Two workflow habits that matter more than the scheduler

Good orchestration tools help, but a reliable pipeline still depends on how tasks are designed.

### 1. Atomic tasks

A task should ideally do one coherent thing and do it completely. Download data. Clean data. Train one model. Export one artifact.

When tasks become too large, failures are harder to diagnose and retries become more expensive. Smaller, clearer tasks make the graph easier to inspect and the behavior easier to trust.

### 2. Idempotence

An idempotent task can run multiple times on the same inputs without producing inconsistent side effects. This matters a lot in real systems, because retries are normal. If a task fails once and succeeds on the next attempt, the pipeline should not leave behind duplicated outputs or corrupted state.

In ML systems, idempotence is one of the quiet disciplines that makes experimentation safer. It reduces the gap between "the workflow ran" and "the workflow can be rerun with confidence."

## Pipelines are part of model quality

It is easy to think of orchestration as an infrastructure concern that sits outside the actual ML work. I think the opposite is often true. Pipeline design affects the quality of the research and the product.

Clear dependencies reduce accidental leakage. Better visibility makes failures easier to interpret. Well-structured tasks make validation more honest. And once experiments become traceable, it becomes much easier to compare runs without relying on memory or scattered notes.

That is why I see pipelines not just as automation, but as part of disciplined machine learning practice. They help turn one successful experiment into a workflow that other people can understand, rerun, and build on.
