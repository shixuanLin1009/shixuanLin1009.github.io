---
title: "VolleyCC: Volleyball Comprehension Captioning"
summary: A vision-language pipeline that turns hour-long volleyball broadcasts into timestamped, professional match narratives.
category: research
date: 2025-03-01
endDate: 2025-06-30
role: Co-author
org: Miin Wu School of Computing, NCKU
tags: [PyTorch, Qwen-VL, InternVL, RT-DETR, X3D, G-Eval]
links: []
featured: true
order: 2
resume:
  include: true
  order: 2
  title: "VolleyCC: Volleyball Comprehension Captioning system based on Vision Language Model and Spatial-Temporal Integration"
  subtitle: Miin Wu School of Computing, NCKU
  bullets:
    - "Tech Stack: PyTorch, Vision-Language Models (Qwen-VL, InternVL), RT-DETR, X3D, G-Eval, Python"
    - Designed a hierarchical video comprehension framework integrating dedicated computer vision models (RT-DETR, X3D) with Vision-Language Models (VLMs) to generate fine-grained, timestamped match narratives from high-speed sports broadcast videos.
    - "Built an end-to-end multi-stage pipeline: automated rally boundary segmentation via referee gesture detection, second-level player action recognition, and constraint-based prompt engineering to enforce temporal consistency and eliminate VLM hallucinations."
    - Implemented a dual LLM-as-a-Judge evaluation framework (G-Eval & structured extraction) using Gemini, demonstrating a +27.8% increase in action correctness and +14.6% in temporal consistency over baseline VLMs.
---

## Why it matters

Professional sports broadcasts rely on experienced commentators. That limits how widely small and mid-sized matches can be shared. VolleyCC generates commentary-style descriptions automatically, so any recorded match can come with a readable narrative.

## Pipeline

1. **Video segmentation.** A referee-gesture detector splits a 1–2 hour raw match into individual *rallies*.
2. **Clip analysis.** A group-activity recognition model extracts key events and player actions (spike, set, receive) from each rally.
3. **Caption generation.** The structured events become a constrained prompt for a vision-language model, which writes a fluent, timestamped description that stays consistent with what actually happened.

## Evaluation

A dual **LLM-as-a-Judge** framework (G-Eval plus structured extraction with Gemini) shows **+27.8%** action correctness and **+14.6%** temporal consistency compared with baseline VLMs. The work has been submitted to RCVE 2026.
