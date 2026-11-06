---
title: "VolleyCC: Volleyball Comprehension Captioning"
summary: A three-stage pipeline that grounds a vision-language model in detected referee signals and player actions, so it writes timestamped volleyball commentary with far fewer hallucinations.
category: research
date: 2025-03-01
endDate: 2025-06-30
role: Co-first author (equal contribution)
org: Miin Wu School of Computing, NCKU
tags: [PyTorch, RT-DETR, X3D, Vision-Language Models, Prompt Engineering, G-Eval]
cover: /uploads/showcase/volleycc-overview.webp
coverAlt: "VolleyCC overview: referee-gesture detection segments the match into rally clips, a match-analysis model recognizes team actions, and a VLM turns rally status and actions into timestamped captions."
links: []
featured: true
order: 2
resume:
  include: true
  order: 2
  title: "VolleyCC: Volleyball Comprehension Captioning system based on Vision Language Model and Spatial-Temporal Integration"
  subtitle: Miin Wu School of Computing, NCKU
  bullets:
    - "Tech Stack: PyTorch, Vision-Language Models (Qwen3-VL, InternVL3, LLaVA-Video, Gemma), RT-DETR, X3D, G-Eval, Python"
    - Designed a hierarchical video comprehension framework integrating dedicated computer vision models (RT-DETR, X3D) with Vision-Language Models (VLMs) to generate fine-grained, timestamped match narratives from high-speed sports broadcast videos.
    - "Built an end-to-end multi-stage pipeline: automated rally boundary segmentation via referee gesture detection, second-level player action recognition, and constraint-based prompt engineering to enforce temporal consistency and eliminate VLM hallucinations."
    - Implemented a dual LLM-as-a-Judge evaluation framework (G-Eval & structured extraction) using Gemini, improving action correctness by up to 27.6% and temporal consistency by up to 15.3% over baseline VLMs.
---

## Background

Video is the core medium of modern sports, used in broadcasts, social media, film review and highlight reels. Turning raw game footage into something useful still depends on people. Editors and domain experts review every frame to cut clips, and spoken summaries of complex plays are slow to produce and lack precision.

Vision-language models (VLMs) and Video-LLMs can describe video in fluent text, but they struggle with dense, fast-moving sports footage. They **hallucinate events**, give vague descriptions, **misplace events in time**, and lack the spatial understanding needed to read who did what on the court.

## Motivation

Volleyball is a hard test case. Play is fast, several things happen at once, and the outcome of a rally depends on exact positions and the order of actions. Dedicated computer-vision models are precise at detecting *what happened and when*, but they cannot write. VLMs write well but cannot see precisely. VolleyCC combines the two: **vision models supply grounded facts, and the VLM turns those facts into a narrative.**

Evaluation is the other gap. BLEU and ROUGE measure word overlap, so they cannot tell whether a caption names the right team or the right action at the right time.

## Method

VolleyCC is a cascaded, three-stage pipeline (see the overview above).

**1. Video segmentation.** A referee-gesture model built on **RT-DETR with an X3D backbone** reads referee signals from hand and elbow positions. It maps them to game states such as *begin serve* and *point awarded*. These states split the continuous match video into individual **rally clips** with timestamps.

![Stage 1: the referee-gesture detector turns referee signals into rally status, which is used to cut the match into rally clips.](/uploads/showcase/volleycc-stage1.webp)

**2. Clip analysis.** Each rally clip goes through a spatio-temporal action detection and group activity recognition model for volleyball, also a hybrid RT-DETR/X3D design. It recognizes player actions such as serve, pass, set and spike, and writes them into a **structured event log** with second-level timestamps.

**3. Caption generation.** The rally status, the event log and sampled frames from the clip are combined into one prompt for a VLM (Gemma 7B). Two constraints in the prompt do most of the work:

- **Implicit event inference.** The action model only sees contact actions (pass, set, spike). The prompt asks the VLM to infer events it cannot detect, such as blocks, aces and balls out, from the order of actions and the visual trajectory, and to commit to a final outcome.
- **Structured temporal segmentation.** Output must follow a strict `time range: action sequence` format in whole seconds, instead of free-form text.

**Evaluation.** Gemini-2.5-Flash serves as the judge in two ways:

- **G-Eval:** scores each caption from 1 to 5 on action correctness, temporal consistency, rule and scoring correctness, and fluency.
- **Structured extraction:** pulls JSON from both the ground truth and the caption, then checks the serving side, the scoring side and the outcome type (seven categories, such as attack point, block point, serve ace and attack out).

## Experiments and Results

**Dataset: TVL2025.** We built 136 clips, each 6–25 seconds long, from Taiwan's Top Volleyball League, filmed by a fixed high-angle camera at the side of the gym. We annotated every rally by hand, including the serving team, each technical action and the final outcome, with second-level timestamps.

**Results.** We added VolleyCC to three open VLMs and compared each with the same model alone.

G-Eval (1–5, higher is better):

| Model | Action | Temporal | Rule & scoring | Fluency |
| --- | --- | --- | --- | --- |
| Qwen3-VL-8B | 1.34 | 1.53 | 1.92 | 4.41 |
| + VolleyCC | **1.71** | **1.71** | **2.06** | 4.43 |
| LLaVA-Video-8B | 1.21 | 1.33 | 1.34 | 3.96 |
| + VolleyCC | 1.22 | 1.24 | 1.43 | 3.81 |
| InternVL3-8B | 1.47 | 1.63 | 1.79 | **4.73** |
| + VolleyCC | **1.79** | **1.88** | **2.18** | 4.43 |

Structured extraction (accuracy):

| Model | Serving side | Scoring side | Outcome type |
| --- | --- | --- | --- |
| Qwen3-VL-8B | 0.441 | 0.588 | 0.449 |
| + VolleyCC | **0.978** | 0.875 | 0.522 |
| LLaVA-Video-8B | 0.463 | 0.419 | 0.368 |
| + VolleyCC | 0.522 | 0.485 | 0.404 |
| InternVL3-8B | 0.544 | 0.566 | **0.537** |
| + VolleyCC | **0.978** | **0.912** | 0.522 |

On G-Eval, VolleyCC raises **action correctness by 27.6%** for Qwen3-VL-8B and 21.8% for InternVL3-8B, and **temporal consistency by 15.3%** for InternVL3-8B and 11.8% for Qwen3-VL-8B. Rule and scoring correctness also improves (+21.8% for InternVL3-8B, +7.3% for Qwen3-VL-8B). The clearest effect is on facts: with VolleyCC, both models identify the serving side almost perfectly (0.441/0.544 → 0.978) and the scoring side in about 9 of 10 rallies.

**Ablation** (Qwen3-VL-8B, adding one component at a time):

| Configuration | Action | Temporal | Rule & scoring | Fluency |
| --- | --- | --- | --- | --- |
| Base VLM (Qwen3-VL-8B) | 1.34 | 1.53 | 1.92 | 4.41 |
| + Clip analysis | 1.52 | 1.60 | 1.83 | 4.29 |
| + Rally segmentation | 1.61 | 1.65 | 1.95 | 4.35 |
| + Full VolleyCC | **1.71** | **1.71** | **2.06** | **4.43** |

**Observations.**

- **Facts over fluency.** InternVL3's fluency drops (4.73 → 4.43) because VolleyCC forces strict volleyball terms and game logic instead of smooth but generic text. That is the trade-off we want.
- **Not every model listens.** LLaVA-Video barely improves, even with several prompt templates. It appears insensitive to the structured logs.

## What I took from it

VolleyCC taught me to reason over long-horizon video and to distrust aggregate metrics. It also showed me the limit of analyzing recorded footage: it can only describe what has already happened, and it cannot change what the camera captures. That pushed me toward [active camera tracking](../sarc-ptz/), where the system acts on the scene as it unfolds.

*Submitted to RCVE 2026. Co-first author with Hung-Ming Huang (equal contribution); corresponding author Prof. Yi-Yu Hsu.*
