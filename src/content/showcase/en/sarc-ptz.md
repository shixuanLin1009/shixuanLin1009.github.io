---
title: "SARC-PTZ: Active Visual Tracking via Deep Reinforcement Learning"
summary: End-to-end deep RL control of a Pan-Tilt-Zoom camera, with a scale-anchored reward that fixes the classic "zoom-out" failure mode.
category: research
date: 2025-11-01
endDate: 2026-03-31
role: First author
org: ACCV 2026 Submission
tags: [PyTorch, PPO, Unreal Engine 4, EagleSim, Computer Vision]
links: []
featured: true
order: 1
resume:
  include: true
  order: 1
  subtitle: ACCV 2026 Submission (First Author)
  bullets:
    - "Tech Stack: PyTorch, Deep Reinforcement Learning (PPO), Unreal Engine 4 (EagleSim), Computer Vision, Python"
    - Formulated active Pan-Tilt-Zoom (PTZ) camera tracking as an end-to-end Deep Reinforcement Learning (DRL) control problem, directly mapping 4-frame stacked RGB observations to discrete MultiDiscrete camera control actions.
    - Proposed Scale-Anchored Reward with Centering (SARC), combining a Gaussian scale term with target centering to resolve the systematic risk-averse "zoom-out" failure mode inherent in conventional product-style rewards.
    - Introduced graded termination smoothing and a procedural Random Waypoint motion model to enhance training convergence and prevent overfitting to static trajectories across 6 parallel simulator instances.
    - Boosted tracking Success Rate from 32% to 82% and Tracking Rate from 55.8% to 86.5% in EagleSim while maintaining target scale fidelity without an explicit detector at inference.
---

## Motivation

Classic active tracking pipelines chain a detector, a filter and a hand-tuned controller. They work in the lab, but they break under occlusion, lighting changes and fast motion — and every new camera needs re-tuning. SARC-PTZ asks whether a camera can **learn how to look** directly from experience.

## Method

- **Problem formulation.** Active PTZ tracking is cast as an end-to-end deep RL control problem. The policy (PPO) maps a stack of 4 RGB frames directly to `MultiDiscrete` pan / tilt / zoom actions.
- **Scale-Anchored Reward with Centering (SARC).** Product-style rewards make the agent risk-averse: zooming out keeps the target in view but loses detail. SARC combines a Gaussian *scale* term with a *centering* term so that the agent is rewarded for keeping the target both centered and at the right size.
- **Training stability.** Graded termination smoothing and a procedural Random Waypoint motion model prevent overfitting to static trajectories, with 6 parallel Unreal Engine 4 (EagleSim) simulator instances.

## Results

| Metric | Baseline | SARC-PTZ |
| --- | --- | --- |
| Tracking success rate | 32% | **82%** |
| Tracking rate | 55.8% | **86.5%** |

The policy keeps the target at a consistent scale **without any explicit detector at inference time**.
